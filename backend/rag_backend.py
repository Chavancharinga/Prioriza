import json
import os
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Literal
from zoneinfo import ZoneInfo

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
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
LISBON_TZ = ZoneInfo("Europe/Lisbon")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Missing Supabase credentials in environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)")
    SUPABASE_URL = "http://localhost:8000"
    SUPABASE_KEY = "mock-key"

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
    capabilities: list[str] = Field(default_factory=list)
    history: list[dict[str, str]] = Field(default_factory=list)
    last_created_task: dict[str, Any] | None = None


def fetch_task_context(task_id: str, client: Client):
    task_res = client.table("tasks").select("*").eq("id", task_id).single().execute()
    task = task_res.data
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    notes_res = client.table("task_notes").select("content, created_at").eq("task_id", task_id).execute()
    checklist_res = client.table("checklist_items").select("content, is_completed").eq("task_id", task_id).execute()
    resources_res = client.table("resources").select("title, url").eq("task_id", task_id).execute()

    notes = notes_res.data or []
    checklists = checklist_res.data or []
    resources = resources_res.data or []

    context_parts = [
        f"Tema/Nome da tarefa: {task.get('title')}",
        f"Descri??o: {task.get('description', '')}",
        f"Prioridade: {task.get('priority', 3)}",
        f"Status: {task.get('status', 'A Fazer')}",
        f"Prazo: {task.get('due_date') or 'Sem prazo'}",
        f"Tempo estimado: {task.get('estimated_minutes') or 0} minutos",
        f"Tempo executado: {task.get('time_spent') or 0} segundos",
        f"Conclu?da em: {task.get('completed_at') or 'Ainda n?o conclu?da'}",
    ]

    if notes:
        context_parts.append("\nNotas do di?rio de bordo / bloco de notas:")
        for note in notes:
            created_at = note.get("created_at") or "sem data"
            context_parts.append(f"- [{created_at}] {note.get('content', '')}")

    if checklists:
        context_parts.append("\nItens do checklist:")
        for item in checklists:
            status = "Conclu?do" if item.get("is_completed") else "Pendente"
            context_parts.append(f"- {item.get('content', '')} ({status})")

    if resources:
        context_parts.append("\nLinks e recursos associados:")
        for resource in resources:
            context_parts.append(f"- {resource.get('title') or resource.get('url')}: {resource.get('url')}")

    return task, notes, checklists, "\n".join(context_parts)

def get_user_client(request: Request) -> Client:
    auth_header = request.headers.get("Authorization")
    if auth_header:
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
        client.postgrest.auth(auth_header.replace("Bearer ", ""))
        return client
    return supabase

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


def build_task_messages(task, full_context: str, mode: str, question: str | None = None, checklists: list | None = None):
    system_message = """
\u00c9s o copiloto de produtividade do Prioriza.
O teu \u00e2mbito \u00e9 exclusivamente: produtividade, tarefas, prioridades, cronograma, estudo/trabalho, notas, checklist, recursos, tempo e pr\u00f3ximos passos.
Se o pedido fugir deste \u00e2mbito, recusa de forma curta e redireciona para a tarefa atual.
Responde em portugu\u00eas de Portugal, com clareza e objetividade.
""".strip()

    if mode == "subtasks":
        existing_items = "\n".join(
            f"- {item.get('content', '')}" for item in (checklists if isinstance(checklists, list) else [])
        ) or "Nenhum item existente."
        user_message = f"""
Analisa o contexto da tarefa e gera sugestões relacionadas diretamente com o tema/nome da tarefa: {task.get('title')}.

Retorna APENAS um JSON válido com esta estrutura:
{{"title":"Sugestões para {task.get('title')}","items":["item 1","item 2","item 3"]}}

Regras:
- Gera de 3 a 5 itens práticos, específicos e acionáveis.
- As sugestões devem ser relacionadas com a tarefa, notas, checklist, links e estado atual.
- NUNCA repitas nenhum dos itens já existentes listados abaixo. Cada sugestão deve ser DIFERENTE.
- Se faltar informação para definir prioridade, inclui uma sugestão de clarificação.
- Não uses markdown, numeração ou texto extra.

ITENS JÁ EXISTENTES NA CHECKLIST (NÃO REPETIR):
{existing_items}

CONTEXTO COMPLETO DA TAREFA:
{full_context}
""".strip()
        return [{"role": "system", "content": system_message}, {"role": "user", "content": user_message}]

    if mode == "summary":
        user_message = f"""
Gera um relat\u00f3rio completo de trabalho sobre a tarefa: {task.get('title')}.

Retorna APENAS um JSON v\u00e1lido com esta estrutura:
{{"title":"Relat\u00f3rio da tarefa: {task.get('title')}","text":"relat\u00f3rio completo"}}

O relat\u00f3rio deve analisar:
- tema/nome da tarefa;
- estado atual e prioridade;
- notas escritas pelo utilizador;
- checklist conclu\u00edda e pendente;
- links/recursos associados;
- tempo estimado, tempo executado e diferen\u00e7a entre ambos;
- progresso real;
- riscos, bloqueios e pr\u00f3ximos passos;
- recomenda\u00e7\u00f5es objetivas para continuar.

Regras:
- N\u00e3o inventes dados que n\u00e3o existam no contexto.
- Se algo estiver vazio, diz que n\u00e3o foi registado.
- Usa portugu\u00eas de Portugal.
- Pode usar frases curtas separadas por pontos, mas n\u00e3o markdown.

CONTEXTO COMPLETO DA TAREFA:
{full_context}
""".strip()
        return [{"role": "system", "content": system_message}, {"role": "user", "content": user_message}]

    user_message = f"""
Responde apenas dentro do \u00e2mbito de produtividade e da tarefa atual.

CONTEXTO DA TAREFA:
{full_context}

PERGUNTA DO UTILIZADOR:
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
    parsed = json.loads(candidate)
    if isinstance(parsed, str):
        parsed = json.loads(parsed.strip())
    if not isinstance(parsed, dict):
        raise ValueError("A resposta da IA não contém um objeto JSON.")
    return parsed


def call_openrouter(task, full_context: str, mode: str, question: str | None = None, checklists: list | None = None):
    if not openrouter_client:
        raise HTTPException(
            status_code=503,
            detail="OPENROUTER_API_KEY não configurada. Adicione a chave no .env.local para ativar a IA.",
        )

    messages = build_task_messages(task, full_context, mode, question, checklists=checklists)
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


def extract_requested_time(message: str):
    normalized = message.lower()
    if re.search(r"\bmeio[ -]?dia\b", normalized):
        return 12, 0

    hour_match = re.search(
        r"\b(?:às?|as|ao|pelas?|por volta das?)?\s*(\d{1,2})(?::(\d{2}))?\s*(?:h|horas?)\b",
        normalized,
    )
    if not hour_match:
        hour_match = re.search(r"\b(?:às?|as|ao|pelas?)?\s*(\d{1,2}):(\d{2})\b", normalized)
    if not hour_match:
        return None

    hour = max(0, min(23, int(hour_match.group(1))))
    minute = max(0, min(59, int(hour_match.group(2) or 0)))
    return hour, minute


def normalize_prio_action_due_date(message: str, action: dict | None, now: datetime | None = None):
    if not action or action.get("type") not in {"create_task", "update_last_task", "update_task"}:
        return action

    task = action.get("task") or {}
    due_date = task.get("due_date")
    requested_time = extract_requested_time(message)
    normalized_message = message.lower()
    has_deadline = bool(
        requested_time
        or re.search(
            r"\b(hoje|amanh|prazo|até|ate|segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)\b",
            normalized_message,
        )
        or re.search(r"\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b", normalized_message)
    )
    if not has_deadline:
        if not due_date:
            return action
        return {**action, "task": {**task, "due_date": None}}
    if not due_date or not requested_time:
        return action

    local_now = now or datetime.now(LISBON_TZ)
    if local_now.tzinfo is None:
        local_now = local_now.replace(tzinfo=LISBON_TZ)
    else:
        local_now = local_now.astimezone(LISBON_TZ)

    if "amanh" in normalized_message:
        target_date = (local_now + timedelta(days=1)).date()
    elif "hoje" in normalized_message:
        target_date = local_now.date()
    else:
        try:
            parsed_due_date = datetime.fromisoformat(str(due_date).replace("Z", "+00:00"))
            if parsed_due_date.tzinfo is None:
                parsed_due_date = parsed_due_date.replace(tzinfo=LISBON_TZ)
            target_date = parsed_due_date.astimezone(LISBON_TZ).date()
        except (TypeError, ValueError):
            return action

    hour, minute = requested_time
    local_due_date = datetime(
        target_date.year,
        target_date.month,
        target_date.day,
        hour,
        minute,
        tzinfo=LISBON_TZ,
    )
    return {
        **action,
        "task": {
            **task,
            "due_date": local_due_date.isoformat(),
        },
    }


def infer_due_date_from_message(message: str):
    normalized = message.lower()
    due_date = None
    if "amanh" in normalized:
        date = datetime.now(LISBON_TZ) + timedelta(days=1)
        requested_time = extract_requested_time(message)
        hour, minute = requested_time or (18, 0)
        date = date.replace(hour=min(hour, 23), minute=min(minute, 59), second=0, microsecond=0)
        due_date = date.isoformat()
    elif "hoje" in normalized:
        date = datetime.now(LISBON_TZ)
        requested_time = extract_requested_time(message)
        hour, minute = requested_time or (18, 0)
        date = date.replace(hour=min(hour, 23), minute=min(minute, 59), second=0, microsecond=0)
        due_date = date.isoformat()
    return due_date


def normalize_hour(hour: str, minute: str | None = None):
    hour_value = max(0, min(23, int(hour or 0)))
    minute_value = max(0, min(59, int(minute or 0)))
    return f"{hour_value:02d}:{minute_value:02d}"


def infer_work_days(message: str):
    normalized = message.lower()
    if re.search(r"segunda\s+a\s+sexta|seg\s+a\s+sex|dias?\s+uteis|dias?\s+úteis|semana", normalized):
        return ["Seg", "Ter", "Qua", "Qui", "Sex"]

    checks = [
        (r"segunda|seg\b", "Seg"),
        (r"terca|terça|ter\b", "Ter"),
        (r"quarta|qua\b", "Qua"),
        (r"quinta|qui\b", "Qui"),
        (r"sexta|sex\b", "Sex"),
        (r"sabado|sábado|sab\b|sáb\b", "Sáb"),
        (r"domingo|dom\b", "Dom"),
    ]
    days = [day for pattern, day in checks if re.search(pattern, normalized)]
    return days or ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]


def build_fallback_work_hours_action(message: str):
    if not re.search(r"\b(hor[aá]rio|horarios|disponibilidade|trabalho|agenda|calend[aá]rio)\b", message, flags=re.IGNORECASE):
        return None

    range_match = re.search(
        r"(?:das|de)\s*(\d{1,2})(?::?(\d{2}))?\s*(?:h)?\s*(?:às|as|até|ate|-|a)\s*(\d{1,2})(?::?(\d{2}))?\s*(?:h)?",
        message,
        flags=re.IGNORECASE,
    )
    if not range_match:
        return None

    start = normalize_hour(range_match.group(1), range_match.group(2))
    end = normalize_hour(range_match.group(3), range_match.group(4))
    if start >= end:
        return None

    return {
        "type": "update_work_hours",
        "work_hours": {day: [{"start": start, "end": end}] for day in infer_work_days(message)},
    }


def wants_create_task(message: str) -> bool:
    return bool(re.search(r"\b(cria|crie|criar|adiciona|adicione|nova tarefa)\b", message, flags=re.IGNORECASE))


def clean_task_title(raw_title: str) -> str:
    title = re.sub(r"^PRIO,?\s*", "", raw_title or "", flags=re.IGNORECASE)
    title = re.sub(
        r"\b(quero|preciso|podes?|pode|por favor|cria|crie|criar|adiciona|adicione|uma|um|nova|novo|tarefa|task|para)\b",
        " ",
        title,
        flags=re.IGNORECASE,
    )
    return re.sub(r"\s+", " ", title).strip()


def is_generic_task_title(title: str) -> bool:
    normalized = clean_task_title(title).lower()
    return not normalized or len(normalized) < 4 or normalized in {
        "quero",
        "criar",
        "tarefa",
        "nova tarefa",
        "nova tarefa criada pelo prio",
    }


def task_details_response():
    return {
        "reply": (
            "Claro, vamos criar essa tarefa juntos. Diz-me apenas: 1) o que queres fazer, "
            "2) se existe prazo ou urgência e 3) quanto tempo pensas precisar, ou se preferes que eu estime."
        ),
        "action": None,
        "provider": "local-fallback",
        "model": None,
    }


def build_fallback_task_action(message: str):
    work_hours_action = build_fallback_work_hours_action(message)
    if work_hours_action:
        return work_hours_action

    if not wants_create_task(message):
        return None

    title_match = re.search(
        r"(?:para|tarefa)\s+(.+?)(?:\s+amanh[ãa]|\s+hoje|\s+até|\s+prazo|$)",
        message,
        flags=re.IGNORECASE,
    )
    title = clean_task_title(title_match.group(1)) if title_match else clean_task_title(re.sub(
        r"\b(prio|cria|crie|criar|adiciona|adicione|uma|nova|tarefa|para)\b",
        "",
        message,
        flags=re.IGNORECASE,
    ))
    if is_generic_task_title(title):
        return None

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



def build_priority_questions_response(message: str):
    normalized = message.lower()
    if not re.search(r"\b(prioridade|priorizar|priorizar|mais importante|ordem|foco)\b", normalized):
        return None

    return {
        "reply": (
            "Para definir a prioridade com rigor, responde a estas 3 perguntas: "
            "1) Qual ? o prazo real e o que acontece se n?o for feito? "
            "2) Que impacto tem esta tarefa no teu objetivo principal de hoje/semana? "
            "3) Quanto esfor?o/tempo precisa e existe algum bloqueio? "
            "Com essas respostas eu classifico em P1-P5, proponho checklist, tempo estimado e ordem de execu??o."
        ),
        "action": None,
        "provider": "local-fallback",
        "model": None,
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
    priority_response = build_priority_questions_response(req.message)
    if priority_response and not re.search(r"\b(cria|crie|criar|adiciona|adicione|nova tarefa|hor[a?]rio|disponibilidade)\b", req.message, flags=re.IGNORECASE):
        return priority_response

    action = build_fallback_task_action(req.message)
    if wants_create_task(req.message) and not action:
        return task_details_response()

    if action and action.get("type") == "update_work_hours":
        reply = (
            "Vou atualizar a tua disponibilidade de trabalho no perfil. "
            "O cronograma automático passa a usar estes horários, mas podes editar tudo manualmente."
        )
    elif action:
        reply = (
            "Boa, já preparei a tarefa com prioridade, checklist, nota importante e uma estimativa realista. "
            "Podes ajustar tudo manualmente no Prioriza. Vamos avançar um passo de cada vez."
        )
    else:
        reply = (
            f"Aqui vai o teu ponto de situação: concluíste {done}/{total} tarefas ({completion}%). "
            f"Tens {progress} em progresso e {overdue} atrasada(s). "
            "Começa pelas P1/P2 com prazo mais próximo e deixa o cronograma organizar o restante. Tu consegues."
        )

    return {
        "reply": reply,
        "action": action,
        "provider": "local-fallback",
        "model": None,
    }


def build_prio_messages(req: PrioChatRequest):
    now_text = datetime.now(LISBON_TZ).isoformat(timespec="minutes")
    task_context = json.dumps(req.tasks[:15], ensure_ascii=False, indent=2)
    profile_context = json.dumps(req.profile or {}, ensure_ascii=False, indent=2)
    capabilities_context = json.dumps(req.capabilities or [], ensure_ascii=False, indent=2)
    history_context = json.dumps(req.history[-8:], ensure_ascii=False, indent=2)
    last_created = json.dumps(req.last_created_task or {}, ensure_ascii=False, indent=2)

    system_message = """
\u00c9s o PRIO, assistente pessoal de produtividade do app Prioriza.
O teu papel \u00e9 ajudar o utilizador a decidir prioridades, organizar tarefas, criar cronogramas, analisar produtividade, sugerir checklist e transformar pedidos em a\u00e7\u00f5es seguras no Prioriza.

Guardrails obrigatórios:
- Não utilizes NENHUM emoji ou emoticon nas tuas respostas.
- Mantém-te apenas no domínio de produtividade, tarefas, estudo, trabalho, prioridades, horários, foco, XP e cronograma.
- Se o utilizador pedir temas fora deste domínio, responde curto: "Só consigo ajudar com produtividade e tarefas no Prioriza." e redireciona para uma ação útil.
- Não inventes dados. Usa apenas PERFIL, TAREFAS, HISTÓRICO_RECENTE e ÚLTIMA_TAREFA_CRIADA.
- Não executes ações destrutivas. Nunca apagar tarefas, notas, conta, email, senha ou dados sem confirmação explícita no UI.
- Sê carismático, alegre, caloroso e motivador, mantendo respostas naturais, curtas e úteis.
- Evita um tom robótico, excessivamente formal ou frio. Reconhece a emoção do utilizador e termina com um próximo passo encorajador.
- Se o utilizador quiser criar uma tarefa, CRIA a tarefa imediatamente com a ação 'create_task'. Não faças perguntas rígidas. Usa o teu bom senso para deduzir prioridade, checklist e estimativa de tempo com base no que ele escreveu.
- Exceção obrigatória: se a mensagem for apenas "quero criar uma tarefa" ou não tiver objetivo/título concreto, NÃO cries tarefa. Pergunta 1) o que deve ser feito, 2) prazo ou urgência, 3) tempo aproximado ou se quer que estimes.
- Depois de criar a tarefa, confirma na resposta que a tarefa foi criada e dá dicas úteis.
- Classifica prioridades de P1 a P5 automaticamente com base na urgência e impacto.

Podes:
- fazer mini relatórios de produtividade;
- responder sobre prazos, prioridades, atrasos, XP e foco;
- sugerir cronograma automático mantendo tudo editável manualmente;
- criar tarefas quando o utilizador pedir;
- configurar horários de trabalho/disponibilidade quando o utilizador pedir;
- complementar a última tarefa criada quando o utilizador der prazo ou detalhes depois;
- adicionar links/recursos (URLs) a uma tarefa quando o utilizador pedir;

Retorna APENAS JSON v\u00e1lido com esta estrutura:
{
  "reply": "mensagem curta ao utilizador",
  "action": {
    "type": "none|create_task|update_last_task|update_task|update_work_hours|add_resources",
    "task": {
      "id": "uuid da tarefa a editar (obrigatório se type for update_task ou add_resources)",
      "title": "string",
      "description": "string",
      "priority": 1,
      "estimated_minutes": 60,
      "due_date": "ISO-8601 ou null",
      "status": "A Fazer|Em Progresso|Feito ou null",
      "checklist": ["item 1", "item 2"],
      "note": "string",
      "resources": [{"url": "https://...", "title": "titulo do recurso"}]
    },
    "work_hours": {
      "Seg": [{"start": "09:00", "end": "17:00"}]
    }
  }
}

Regras:
- Se não houver ação, usa {"type":"none","task":null}.
- Para nova tarefa, cria checklist com 3 a 6 itens, nota importante e estimativa se o utilizador não informar.
- Para update_work_hours, usa dias Seg/Ter/Qua/Qui/Sex/Sáb/Dom e intervalos HH:MM.
- Nunca inventes um prazo. Se o utilizador não mencionar data, dia, urgência temporal ou hora, due_date deve ser null.
- Se o utilizador indicar uma data sem hora, mantém a data e deixa a escolha do horário editável pelo utilizador.
- Interpreta todas as horas indicadas pelo utilizador no fuso Europe/Lisbon.
- Preserva exatamente a hora pedida, incluindo "meio-dia", "12h" e "12:40". Esses exemplos devem aparecer como 12:00, 12:00 e 12:40 em Lisboa, nunca com uma hora acrescentada por conversão incorreta de UTC.
- Em due_date devolve ISO-8601 com o offset local correto de Lisboa para a data indicada.
- Sê assertivo, mas mantém tudo editável manualmente.
- Para update_task e update_last_task, envia apenas os campos que o utilizador pediu alterar. Para mudar estado, usa obrigatoriamente task.status com um destes valores: "A Fazer", "Em Progresso" ou "Feito".
- Para add_resources, o campo 'task.id' é obrigatório (uuid da tarefa onde adicionar os links) e task.resources tem de ter pelo menos um URL https válido. Gera URLs reais e verificáveis (YouTube, artigos conhecidos, documentação oficial). Se não tiveres certeza de URLs exatas, gera URLs de pesquisa Google/YouTube com os termos relevantes (ex: https://www.youtube.com/results?search_query=apresentacao+profissional).
- Quando o utilizador pedir 'links', 'recursos', 'vídeos', 'materiais' ou links no "Diário de Bordo", usa SEMPRE a ação add_resources. Os links serão guardados como recursos e registados no Diário de Bordo da tarefa. NUNCA confirmes que adicionaste links se action.resources estiver vazio ou task.id não existir.
""".strip()

    user_message = f"""
DATA_ATUAL: {now_text}

PERFIL:
{profile_context}

CAPACIDADES_EXECUTAVEIS:
{capabilities_context}

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
async def query_task_context(req: QueryRequest, request: Request):
    try:
        client = get_user_client(request)
        task, notes, checklists, full_context = fetch_task_context(req.task_id, client)

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
async def generate_task_insight(req: TaskInsightRequest, request: Request):
    try:
        client = get_user_client(request)
        task, notes, checklists, full_context = fetch_task_context(req.task_id, client)

        if req.mode == "subtasks":
            raw_content = call_openrouter(task, full_context, "subtasks", checklists=checklists)
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
                    f"Planear os passos concretos para: {task.get('title', 'esta tarefa')}",
                    f"Executar a ação principal de: {task.get('title', 'esta tarefa')}",
                    f"Rever e validar o resultado de: {task.get('title', 'esta tarefa')}",
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
        try:
            parsed = parse_json_content(raw_content)
            action = parsed.get("action") or {"type": "none", "task": None}
        except Exception:
            parsed = {"reply": raw_content.strip()}
            action = {"type": "none", "task": None}

        if action and action.get("type") == "none":
            action = None
        action = normalize_prio_action_due_date(req.message, action)
        if wants_create_task(req.message) and (
            not action or (
                action.get("type") == "create_task"
                and is_generic_task_title((action.get("task") or {}).get("title", ""))
            )
        ):
            return task_details_response()

        return {
            "reply": str(parsed.get("reply") or "").strip() or "Já analisei as tuas tarefas. Vamos escolher o próximo passo juntos?",
            "action": action,
            "provider": "openrouter",
            "model": OPENROUTER_MODEL,
        }
    except Exception as exc:
        print(f"PRIO OpenRouter error: {exc}")
        return fallback_prio_response(req)


if __name__ == "__main__":
    uvicorn.run("rag_backend:app", host="0.0.0.0", port=8000, reload=True)
