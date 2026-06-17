import json
import os
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Literal

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field
from supabase import Client, create_client

BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent

load_dotenv(ROOT_DIR / ".env.local")
load_dotenv(ROOT_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env.local")

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "mock-key-if-no-env")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "deepseek/deepseek-v4-flash")
OPENROUTER_HTTP_REFERER = os.getenv("OPENROUTER_HTTP_REFERER", "http://127.0.0.1:5173")
OPENROUTER_APP_TITLE = os.getenv("OPENROUTER_APP_TITLE", "Prioriza")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY and OPENAI_API_KEY != "mock-key-if-no-env" else None
openrouter_client = (
    OpenAI(
        base_url=OPENROUTER_BASE_URL,
        api_key=OPENROUTER_API_KEY,
        default_headers={
            "HTTP-Referer": OPENROUTER_HTTP_REFERER,
            "X-OpenRouter-Title": OPENROUTER_APP_TITLE,
        },
    )
    if OPENROUTER_API_KEY
    else None
)

app = FastAPI(title="Prioriza RAG Service", description="AI/RAG Context engine for Prioriza Tasks")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmbedRequest(BaseModel):
    node_id: str
    node_type: str
    content: str


class QueryRequest(BaseModel):
    task_id: str
    question: str


class TaskInsightRequest(BaseModel):
    task_id: str
    mode: Literal["subtasks", "summary"]


class PrioChatRequest(BaseModel):
    message: str
    tasks: list[dict[str, Any]] = Field(default_factory=list)
    profile: dict[str, Any] | None = None
    history: list[dict[str, str]] = Field(default_factory=list)
    last_created_task: dict[str, Any] | None = None


def fetch_task_context(task_id: str):
    task_res = supabase.table("tasks").select("*").eq("id", task_id).single().execute()
    task = task_res.data
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    notes_res = supabase.table("task_notes").select("content").eq("task_id", task_id).execute()
    checklist_res = supabase.table("checklist_items").select("content, is_completed").eq("task_id", task_id).execute()

    notes = notes_res.data or []
    checklists = checklist_res.data or []

    context_parts = [
        f"Tarefa Principal: {task.get('title')}",
        f"Descrição: {task.get('description', '')}",
        f"Prioridade: {task.get('priority', 3)}",
        f"Status: {task.get('status', 'A Fazer')}",
    ]

    if notes:
        context_parts.append("\nNotas do Diário de Bordo:")
        for note in notes:
            context_parts.append(f"- {note['content']}")

    if checklists:
        context_parts.append("\nItens do Checklist:")
        for item in checklists:
            status = "Concluído" if item["is_completed"] else "Pendente"
            context_parts.append(f"- {item['content']} ({status})")

    return task, notes, checklists, "\n".join(context_parts)


def get_embedding(text: str):
    try:
        if not openai_client:
            import random

            return [random.uniform(-0.1, 0.1) for _ in range(1536)]

        response = openai_client.embeddings.create(
            input=[text.replace("\n", " ")],
            model="text-embedding-ada-002",
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error generating embedding: {e}. Falling back to mock vector.")
        import random

        return [random.uniform(-0.1, 0.1) for _ in range(1536)]


def build_task_messages(task, full_context: str, mode: str, question: str | None = None):
    system_message = "Você é um assistente de IA do Prioriza, focado em produtividade e clareza."

    if mode == "subtasks":
        user_message = f"""
Você é o copiloto de produtividade do Prioriza.
Analise o contexto da tarefa e responda em português do Brasil.

Retorne APENAS um JSON válido com esta estrutura:
{{"title":"Sub-tarefas Sugeridas","items":["item 1","item 2","item 3"]}}

Regras:
- Gere de 3 a 5 itens
- Cada item deve ser prático, específico e acionável
- Evite repetir itens já existentes na checklist
- Não use markdown, numeração ou texto extra

CONTEXTO DA TAREFA:
{full_context}
""".strip()
        return [{"role": "system", "content": system_message}, {"role": "user", "content": user_message}]

    if mode == "summary":
        user_message = f"""
Você é o copiloto de produtividade do Prioriza.
Analise o contexto da tarefa e responda em português do Brasil.

Retorne APENAS um JSON válido com esta estrutura:
{{"title":"Resumo do Contexto","text":"resumo objetivo em 2 a 5 frases"}}

Regras:
- Seja direto e útil
- Destaque o estado atual, riscos e próximos passos
- Não use markdown, listas ou texto extra

CONTEXTO DA TAREFA:
{full_context}
""".strip()
        return [{"role": "system", "content": system_message}, {"role": "user", "content": user_message}]

    user_message = f"""
Você é o copiloto de produtividade do Prioriza.
Responda em português do Brasil, de forma prática e curta.

CONTEXTO DA TAREFA:
{full_context}

PERGUNTA DO USUÁRIO:
{question or ""}
""".strip()
    return [{"role": "system", "content": system_message}, {"role": "user", "content": user_message}]


def parse_json_content(raw_content: str):
    content = (raw_content or "").strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?\s*", "", content, flags=re.IGNORECASE)
        content = re.sub(r"\s*```$", "", content)

    match = re.search(r"\{.*\}", content, flags=re.DOTALL)
    candidate = match.group(0) if match else content
    return json.loads(candidate)


def call_openrouter(task, full_context: str, mode: str, question: str | None = None):
    if not openrouter_client:
        raise HTTPException(
            status_code=503,
            detail="OPENROUTER_API_KEY não configurada. Adicione a chave no .env.local para ativar a IA.",
        )

    messages = build_task_messages(task, full_context, mode, question)
    request_kwargs = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "temperature": 0.3 if mode == "subtasks" else 0.2,
        "max_tokens": 450 if mode == "subtasks" else 350,
    }

    if mode in {"subtasks", "summary"}:
        request_kwargs["response_format"] = {"type": "json_object"}

    try:
        response = openrouter_client.chat.completions.create(**request_kwargs)
        return response.choices[0].message.content or ""
    except Exception:
        request_kwargs.pop("response_format", None)
        response = openrouter_client.chat.completions.create(**request_kwargs)
        return response.choices[0].message.content or ""


def infer_due_date_from_message(message: str):
    normalized = message.lower()
    due_date = None
    if "amanh" in normalized:
        date = datetime.now() + timedelta(days=1)
        hour_match = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(?:h|horas?)?", normalized)
        hour = int(hour_match.group(1)) if hour_match else 18
        minute = int(hour_match.group(2)) if hour_match and hour_match.group(2) else 0
        date = date.replace(hour=min(hour, 23), minute=min(minute, 59), second=0, microsecond=0)
        due_date = date.isoformat()
    elif "hoje" in normalized:
        date = datetime.now()
        hour_match = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(?:h|horas?)?", normalized)
        hour = int(hour_match.group(1)) if hour_match else 18
        minute = int(hour_match.group(2)) if hour_match and hour_match.group(2) else 0
        date = date.replace(hour=min(hour, 23), minute=min(minute, 59), second=0, microsecond=0)
        due_date = date.isoformat()
    return due_date


def build_fallback_task_action(message: str):
    if not re.search(r"\b(cria|crie|criar|adiciona|adicione|nova tarefa)\b", message, flags=re.IGNORECASE):
        return None

    title_match = re.search(
        r"(?:para|tarefa)\s+(.+?)(?:\s+amanh[ãa]|\s+hoje|\s+até|\s+prazo|$)",
        message,
        flags=re.IGNORECASE,
    )
    title = title_match.group(1).strip() if title_match else re.sub(
        r"\b(prio|cria|crie|criar|adiciona|adicione|uma|nova|tarefa|para)\b",
        "",
        message,
        flags=re.IGNORECASE,
    ).strip()
    if not title:
        title = "Nova tarefa criada pelo PRIO"

    lowered = message.lower()
    priority = 1 if any(word in lowered for word in ["urgente", "crítico", "critico", "defeito", "bug"]) else 3
    estimated_minutes = 45 if any(word in lowered for word in ["bug", "defeito", "corrigir", "função", "funcao"]) else 60

    return {
        "type": "create_task",
        "task": {
            "title": title[:1].upper() + title[1:],
            "description": "Tarefa criada por conversa com o PRIO. Revise os detalhes antes de iniciar.",
            "priority": priority,
            "estimated_minutes": estimated_minutes,
            "due_date": infer_due_date_from_message(message),
            "checklist": [
                "Confirmar o problema e o resultado esperado",
                "Dividir a correção em passos pequenos",
                "Executar, testar e registrar a conclusão",
            ],
            "note": "Nota do PRIO: checklist, prioridade e tempo foram sugeridos automaticamente e podem ser editados manualmente.",
        },
    }


def fallback_prio_response(req: PrioChatRequest):
    def is_overdue(task):
        try:
            if task.get("status") == "Feito" or not task.get("due_date"):
                return False
            return datetime.fromisoformat(str(task["due_date"]).replace("Z", "+00:00")).replace(tzinfo=None) < datetime.now()
        except Exception:
            return False

    tasks = req.tasks or []
    total = len(tasks)
    done = len([task for task in tasks if task.get("status") == "Feito"])
    progress = len([task for task in tasks if task.get("status") == "Em Progresso"])
    overdue = len([task for task in tasks if is_overdue(task)])
    completion = round((done / total) * 100) if total else 0
    action = build_fallback_task_action(req.message)

    if action:
        reply = (
            "Perfeito. Vou criar a tarefa com prioridade, checklist, nota importante e estimativa automática. "
            "Depois você pode editar tudo manualmente no Prioriza."
        )
    else:
        reply = (
            f"Mini relatório: você concluiu {done}/{total} tarefas ({completion}%). "
            f"Há {progress} em progresso e {overdue} atrasada(s). "
            "Minha sugestão: ataque primeiro as P1/P2 com prazo próximo e deixe o cronograma ajustar o resto."
        )

    return {
        "reply": reply,
        "action": action,
        "provider": "local-fallback",
        "model": None,
    }


def build_prio_messages(req: PrioChatRequest):
    now_text = datetime.now().isoformat(timespec="minutes")
    task_context = json.dumps(req.tasks[:80], ensure_ascii=False, indent=2)
    profile_context = json.dumps(req.profile or {}, ensure_ascii=False, indent=2)
    history_context = json.dumps(req.history[-8:], ensure_ascii=False, indent=2)
    last_created = json.dumps(req.last_created_task or {}, ensure_ascii=False, indent=2)

    system_message = """
Você é o PRIO, assistente pessoal de produtividade do app Prioriza.
Responda em português, com tom direto, motivador e prático.
Você conhece as tarefas enviadas no contexto e pode:
- fazer mini relatórios de produtividade;
- responder sobre prazos, prioridades, atrasos, XP e foco;
- sugerir cronograma automático mantendo tudo editável manualmente;
- criar tarefas quando o usuário pedir;
- complementar a última tarefa criada quando o usuário der prazo ou detalhes depois.

Retorne APENAS JSON válido com esta estrutura:
{
  "reply": "mensagem curta ao usuário",
  "action": {
    "type": "none|create_task|update_last_task",
    "task": {
      "title": "string",
      "description": "string",
      "priority": 1,
      "estimated_minutes": 60,
      "due_date": "ISO-8601 ou null",
      "checklist": ["item 1", "item 2"],
      "note": "string"
    }
  }
}

Regras:
- Se não houver ação, use {"type":"none","task":null}.
- Para nova tarefa, crie checklist com 3 a 6 itens, nota importante e estimativa se o usuário não informar.
- Se o usuário disser "amanhã" sem hora, use amanhã às 18:00.
- Se o objetivo da tarefa estiver claro, não faça perguntas desnecessárias.
- Só pergunte detalhes se faltar o título/objetivo principal.
""".strip()

    user_message = f"""
DATA_ATUAL: {now_text}

PERFIL:
{profile_context}

TAREFAS:
{task_context}

HISTÓRICO_RECENTE:
{history_context}

ÚLTIMA_TAREFA_CRIADA:
{last_created}

MENSAGEM_DO_USUÁRIO:
{req.message}
""".strip()

    return [{"role": "system", "content": system_message}, {"role": "user", "content": user_message}]


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Prioriza RAG Engine"}


@app.post("/embed")
async def generate_and_save_embedding(req: EmbedRequest):
    try:
        vector = get_embedding(req.content)

        res = supabase.table("node_embeddings").upsert(
            {
                "node_id": req.node_id,
                "node_type": req.node_type,
                "content": req.content,
                "embedding": vector,
            }
        ).execute()

        return {"status": "success", "message": "Embedding saved successfully", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query")
async def query_task_context(req: QueryRequest):
    try:
        task, notes, checklists, full_context = fetch_task_context(req.task_id)

        prompt = f"""
Você é um assistente de IA integrado na tarefa "{task.get('title')}" do aplicativo Prioriza.
Use o contexto da tarefa fornecido abaixo para responder a pergunta do usuário.
Seja prático, objetivo e atenha-se estritamente às informações fornecidas.

CONTEÚDO DA TAREFA:
{full_context}

PERGUNTA DO USUÁRIO:
{req.question}
""".strip()

        if openrouter_client:
            response = openrouter_client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=[
                    {"role": "system", "content": "Você é um assistente RAG focado no contexto do projeto."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=500,
            )
            answer = response.choices[0].message.content or ""
        else:
            answer = (
                f"[IA não configurada] A tarefa '{task.get('title')}' tem {len(checklists)} itens de checklist e {len(notes)} notas registradas. "
                "Configure OPENROUTER_API_KEY no .env.local para usar a resposta real via DeepSeek."
            )

        return {
            "task_id": req.task_id,
            "question": req.question,
            "answer": answer,
            "context_length_chars": len(full_context),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/task-insight")
async def generate_task_insight(req: TaskInsightRequest):
    try:
        task, notes, checklists, full_context = fetch_task_context(req.task_id)

        if req.mode == "subtasks":
            raw_content = call_openrouter(task, full_context, "subtasks")
            try:
                parsed = parse_json_content(raw_content)
                items = parsed.get("items", [])
                title = parsed.get("title", "Sub-tarefas Sugeridas")
            except Exception:
                parsed = {}
                items = [
                    line.strip(" -•\t")
                    for line in raw_content.splitlines()
                    if line.strip() and not line.strip().startswith("{") and not line.strip().startswith("}")
                ]
                title = "Sub-tarefas Sugeridas"
            if isinstance(items, str):
                items = [items]
            cleaned_items = [str(item).strip() for item in items if str(item).strip()]
            if not cleaned_items:
                cleaned_items = [
                    "Definir o escopo e os próximos passos",
                    "Executar a parte principal da tarefa",
                    "Validar e ajustar o resultado final",
                ]
            return {
                "type": "subtasks",
                "title": title,
                "items": cleaned_items[:5],
                "model": OPENROUTER_MODEL,
                "provider": "openrouter",
            }

        raw_content = call_openrouter(task, full_context, "summary")
        try:
            parsed = parse_json_content(raw_content)
            summary_text = str(parsed.get("text", "")).strip()
            title = parsed.get("title", "Resumo do Contexto")
        except Exception:
            summary_text = raw_content.strip()
            title = "Resumo do Contexto"
        if not summary_text:
            summary_text = (
                f"A tarefa '{task.get('title')}' tem {len(checklists)} itens no checklist e {len(notes)} notas registradas. "
                "Use esse contexto para decidir os próximos passos."
            )
        return {
            "type": "summary",
            "title": title,
            "text": summary_text,
            "model": OPENROUTER_MODEL,
            "provider": "openrouter",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/prio-chat")
async def prio_chat(req: PrioChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Mensagem vazia.")

    if not openrouter_client:
        return fallback_prio_response(req)

    request_kwargs = {
        "model": OPENROUTER_MODEL,
        "messages": build_prio_messages(req),
        "temperature": 0.25,
        "max_tokens": 900,
        "response_format": {"type": "json_object"},
    }

    try:
        try:
            response = openrouter_client.chat.completions.create(**request_kwargs)
        except Exception:
            request_kwargs.pop("response_format", None)
            response = openrouter_client.chat.completions.create(**request_kwargs)

        raw_content = response.choices[0].message.content or ""
        parsed = parse_json_content(raw_content)
        action = parsed.get("action") or {"type": "none", "task": None}

        if action.get("type") == "none":
            action = None

        return {
            "reply": str(parsed.get("reply") or "").strip() or "Analisei suas tarefas. O que quer fazer agora?",
            "action": action,
            "provider": "openrouter",
            "model": OPENROUTER_MODEL,
        }
    except Exception as exc:
        print(f"PRIO OpenRouter error: {exc}")
        return fallback_prio_response(req)


if __name__ == "__main__":
    uvicorn.run("rag_backend:app", host="127.0.0.1", port=8000, reload=True)
