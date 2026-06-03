import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv(dotenv_path="../.env.local")

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "mock-key-if-no-env")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)")

# Initialize Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize OpenAI
openai.api_key = OPENAI_API_KEY

app = FastAPI(title="Prioriza RAG Service", description="AI/RAG Context engine for Prioriza Tasks")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class EmbedRequest(BaseModel):
    node_id: str
    node_type: str  # 'task', 'note', 'checklist'
    content: str

class QueryRequest(BaseModel):
    task_id: str
    question: str

# Helper to generate embeddings
def get_embedding(text: str):
    try:
        # Fallback to mock embedding if API key is mock to allow running server offline/without keys
        if OPENAI_API_KEY == "mock-key-if-no-env":
            import random
            return [random.uniform(-0.1, 0.1) for _ in range(1536)]
            
        response = openai.Embedding.create(
            input=[text.replace("\n", " ")],
            model="text-embedding-ada-002"
        )
        return response['data'][0]['embedding']
    except Exception as e:
        print(f"Error generating embedding: {e}. Falling back to mock vector.")
        import random
        return [random.uniform(-0.1, 0.1) for _ in range(1536)]

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Prioriza RAG Engine"}

@app.post("/embed")
async def generate_and_save_embedding(req: EmbedRequest):
    """
    Generate embedding vector for a task/note/checklist item and save to pgvector.
    """
    try:
        vector = get_embedding(req.content)
        
        # Save to Supabase node_embeddings
        res = supabase.table("node_embeddings").upsert({
            "node_id": req.node_id,
            "node_type": req.node_type,
            "content": req.content,
            "embedding": vector
        }).execute()
        
        return {"status": "success", "message": "Embedding saved successfully", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_task_context(req: QueryRequest):
    """
    Perform local RAG: retrieve task details + notes, query vector search, 
    and synthesize response with context.
    """
    try:
        # 1. Fetch task details, notes, and checklist items
        task_res = supabase.table("tasks").select("*").eq("id", req.task_id).single().execute()
        task = task_res.data
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        notes_res = supabase.table("task_notes").select("content").eq("task_id", req.task_id).execute()
        checklists_res = supabase.table("checklist_items").select("content, is_completed").eq("task_id", req.task_id).execute()

        # 2. Build local text context
        context_parts = [
            f"Tarefa Principal: {task.get('title')}",
            f"Descrição: {task.get('description', '')}",
            f"Prioridade: {task.get('priority', 3)}",
            f"Status: {task.get('status', 'A Fazer')}"
        ]

        if notes_res.data:
            context_parts.append("\nNotas do Diário de Bordo:")
            for note in notes_res.data:
                context_parts.append(f"- {note['content']}")

        if checklists_res.data:
            context_parts.append("\nItens do Checklist:")
            for item in checklists_res.data:
                status = "Concluído" if item['is_completed'] else "Pendente"
                context_parts.append(f"- {item['content']} ({status})")

        full_context = "\n".join(context_parts)

        # 3. Simulate RAG LLM query
        # In a real environment, we would append semantic search results from pgvector
        # and pass this context to GPT/Claude or local Ollama model.
        prompt = f"""
        Você é um assistente de IA integrado na tarefa "{task.get('title')}" do aplicativo Prioriza.
        Use o contexto da tarefa fornecido abaixo para responder a pergunta do usuário.
        Seja prático, objetivo e atenha-se estritamente às informações fornecidas.

        CONTEÚDO DA TAREFA:
        {full_context}

        PERGUNTA DO USUÁRIO:
        {req.question}
        """

        if OPENAI_API_KEY == "mock-key-if-no-env":
            # Mock LLM completion
            answer = f"[MOCK RAG ANSWER] Com base nas notas da tarefa '{task.get('title')}', você tem {len(checklists_res.data)} itens de checklist registrados. Como o servidor está rodando em modo simulação, esta resposta simula o processamento do RAG local."
        else:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um assistente RAG focado no contexto do projeto."},
                    {"role": "user", "content": prompt}
                ]
            )
            answer = response.choices[0].message.content

        return {
            "task_id": req.task_id,
            "question": req.question,
            "answer": answer,
            "context_length_chars": len(full_context)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("rag_backend:app", host="127.0.0.1", port=8000, reload=True)
