# Apresentação PAP - Prioriza (Versão Final 360º)

> Estrutura otimizada: sem índice, sem repetições, código real do projeto.
> Total: **14 slides** com fio condutor lógico.

---

## Slide 1: Capa

- **Título:** Prioriza — Gestão Inteligente de Tarefas com IA
- **Subtítulo:** Prova de Aptidão Profissional
- **Curso:** Técnico de Gestão e Programação de Sistemas Informáticos
- **Aluno:** Daniel Silva
- **Ano Letivo:** 2025/2026
- **Escola:** Escola Técnico-Profissional de Cantanhede

> *(Logótipo do Prioriza + Escola. Design limpo.)*

---

## Slide 2: O Problema

**Título do Slide:** "Todos temos tarefas. Poucos sabem por onde começar."

- Estudantes, trabalhadores e freelancers acumulam tarefas sem saber **qual fazer primeiro**.
- As apps existentes apenas registam — não ajudam a **decidir e agir**.
- A ideia do Prioriza nasceu desta frustração pessoal: queria algo que me dissesse "faz isto primeiro" e me motivasse a continuar.

> *(O que falar: "Quem nunca ficou a olhar para uma lista de tarefas sem saber por onde começar? Eu ficava. E decidi resolver isso com este projeto.")*

---

## Slide 3: A Solução — O que é o Prioriza

**Título do Slide:** "Não é mais uma lista de tarefas."

- Uma aplicação web completa que **organiza, prioriza e motiva**.
- **Sistema de 5 Prioridades visuais** — cada nível tem uma cor (Vermelho urgente → Verde tranquilo).
- **Workspace por tarefa** — Notas, checklist, links, subtarefas e cronómetro Pomodoro integrados.
- **Gamificação** — XP, níveis e streaks para manter a motivação diária.
- **Assistente PRIO (IA)** — Um copiloto que analisa tarefas, sugere subtarefas, gera relatórios e cria tarefas por chat.
- **Múltiplas vistas** — Lista, Kanban, Calendário e Árvore de Subtarefas.

> *(O que falar: "O Prioriza tem 4 pilares: prioridades visuais, um workspace completo por tarefa, gamificação para motivar, e inteligência artificial que de facto age sobre os dados.")*

---

## Slide 4: Planeamento e Metodologia

**Título do Slide:** "Como organizei o desenvolvimento"

- **Modelo Cascata com Retorno** — estruturado mas flexível para corrigir problemas.
- **Fases reais do meu desenvolvimento:**

| Fase | O que fiz | Porquê nesta ordem |
|------|-----------|-------------------|
| 1ª | Base de dados + Autenticação | Sem dados seguros, nada funciona |
| 2ª | CRUD de Tarefas + Dashboard | A funcionalidade base do projeto |
| 3ª | Workspace (notas, checklist, timer) | Enriquecer cada tarefa |
| 4ª | Gamificação (XP, níveis, streaks) | Motivação para usar a app |
| 5ª | IA — Assistente PRIO | A feature mais complexa, por último |
| 6ª | Responsividade e afinações | Polir para mobile e corrigir bugs |

> *(O que falar: "Comecei pelo alicerce: a base de dados e o login seguro. Só depois fui adicionando camadas de complexidade. A IA ficou para o fim porque dependia de todo o resto estar sólido.")*

---

## Slide 5: Stack Tecnológica e Arquitetura

**Título do Slide:** "Que ferramentas usei e porquê"

| Camada | Tecnologia | Porquê esta escolha |
|--------|-----------|---------------------|
| Frontend | React + Vite + TailwindCSS | Componentes reutilizáveis, build ultra-rápido |
| Base de Dados | Supabase (PostgreSQL) | BD relacional com Auth nativo e Row Level Security |
| Backend IA | FastAPI (Python) | Leve, assíncrono, ideal para processar pedidos de IA |
| Modelo de IA | OpenRouter → DeepSeek | API compatível com OpenAI SDK, custo acessível |
| Design/Gestão | Git, GitHub, Figma, VS Code | Versionamento, prototipagem e desenvolvimento |

**Arquitetura modular:**
- O React nunca fala diretamente com a BD — usa ficheiros de **Service** (`TaskService`, `AIService`, `GamificationService`, `ProfileService`).
- A IA está num servidor Python **separado** — o frontend chama o `AIService.js` que faz `fetch` ao FastAPI.

> *(O que falar: "Escolhi Supabase em vez do Firebase porque precisava de uma BD relacional com chaves estrangeiras e segurança por linha (RLS). E separei a IA num backend Python porque o processamento de linguagem natural é muito diferente da lógica de interface.")*

---

## Slide 6: Base de Dados e Segurança

**Título do Slide:** "Como os dados estão organizados e protegidos"

**Tabelas principais e relações:**

```
profiles (1) ──→ (N) tasks ──→ (N) checklist_items
                       │──→ (N) task_notes
                       │──→ (N) resources
                       │──→ (N) subtasks (auto-relação: tasks.parent_id → tasks.id)
```

- Cada tarefa pertence a **um** utilizador (`user_id` → `profiles.id`).
- Subtarefas são tarefas com `parent_id` preenchido — é uma **auto-relação** na mesma tabela.
- **RLS (Row Level Security):** Política ativa na BD que impede qualquer utilizador de ler dados de outro, mesmo que tente manipular a query.

> *(O que falar: "A segurança não está só no código — está na própria base de dados. Mesmo que alguém tentasse alterar a query do lado do browser, o RLS do PostgreSQL bloqueava o acesso. Isto é uma prática profissional que aprendi durante o projeto.")*

---

## Slide 7: Código — Criação Manual de Tarefa (a base de tudo)

**Título do Slide:** "O CRUD fundamental — como uma tarefa nasce"

*(Mostra este código no slide com fundo escuro tipo editor)*

```javascript
// TaskService.js — A função que cria uma tarefa no Supabase
async createTask(taskData) {
    // 1. Verificar se o utilizador está autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    // 2. Garantir que o perfil do utilizador existe no Supabase (previne erros de chave estrangeira)
    await ensureProfileExists(user)

    // 3. Enviar os dados para a tabela 'tasks' no PostgreSQL
    const { data, error } = await supabase
        .from('tasks')
        .insert([{
            ...taskData,                        // título, descrição, prioridade, prazo...
            estimated_minutes: Number(taskData.estimated_minutes) > 0
                ? Number(taskData.estimated_minutes)
                : 30,                           // Se não tiver estimativa, assume 30 min
            user_id: user.id,                   // Liga a tarefa ao utilizador autenticado
            created_at: new Date().toISOString() // Regista a data de criação
        }])
        .select()   // Devolve o registo criado com o ID gerado
        .single()   // Espera exatamente 1 resultado

    if (error) throw error
    return data     // Devolve a tarefa criada ao componente React
}
```

**O que acontece aqui passo a passo:**
1. `supabase.auth.getUser()` → Vai buscar o utilizador da sessão ativa.
2. `ensureProfileExists(user)` → Cria o perfil se ele ainda não existir, prevenindo falhas de FK.
3. `.insert()` → Envia um INSERT ao PostgreSQL com os dados do formulário.
4. `user_id: user.id` → Associa obrigatoriamente a tarefa a quem a criou (segurança).
5. `.select().single()` → Pede ao Supabase para devolver o registo criado (com o UUID gerado automaticamente pela BD).
6. O componente React recebe este `data` e atualiza a lista de tarefas na interface.

> *(O que falar: "Esta é a função mais fundamental de todo o projeto. Tudo o resto depende dela. Quando o utilizador preenche o formulário de nova tarefa, é esta função que valida a autenticação, garante que o perfil do utilizador existe para evitar erros de chaves estrangeiras, e envia os dados para o PostgreSQL. A linha `user_id: user.id` é crítica — sem ela, as tarefas ficavam 'órfãs' e o RLS bloqueava o acesso.")*

---

## Slide 8: Código — A Integração com a IA (Visão Geral)

**Título do Slide:** "O Assistente PRIO — como o React fala com a IA"

*(Mostra o fluxo e o código do AIService.js)*

**O fluxo completo:**
```
Utilizador escreve no chat
        ↓
React (AIAssistantPanel) chama AIService.js
        ↓
AIService.js faz fetch HTTP ao backend Python (FastAPI)
        ↓
FastAPI recebe o pedido, monta o contexto, envia ao DeepSeek
        ↓
DeepSeek responde em JSON → FastAPI valida e limpa → React recebe
        ↓
Se action = "create_task" → React chama TaskService.createTask()
Se action = "generate_subtasks" → React mostra as sugestões
```

```javascript
// AIService.js — O Service que liga o React ao backend Python
async function prioChat(payload) {
    const response = await fetch(`${AI_API_BASE_URL}/ai/prio-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) // Envia: mensagem, tarefas, perfil, histórico
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.detail || 'Falha ao conversar com o PRIO.')
    return data // Devolve: { reply, action, task_data }
}
```

> *(O que falar: "O React nunca fala diretamente com o DeepSeek. Passa pelo meu backend Python. O AIService.js envia a mensagem do utilizador juntamente com as tarefas atuais, o perfil (nível, XP) e o histórico do chat. O backend processa tudo, e devolve uma resposta com uma possível ação — como criar uma tarefa.")*

---

## Slide 9: Código — IA — Guardrails e Controlo (Backend Python)

**Título do Slide:** "Como controlo o que a IA pode e não pode fazer"

*(Mostra o system prompt e o parsing)*

```python
# rag_backend.py — Guardrails do PRIO (excerto do system prompt)
"""
És o PRIO, assistente pessoal de produtividade do Prioriza.

Guardrails obrigatórios:
- Mantém-te apenas no domínio de produtividade e tarefas.
- Se o utilizador pedir temas fora deste domínio, responde:
  "Só consigo ajudar com produtividade e tarefas no Prioriza."
- Não inventes dados. Usa apenas o contexto fornecido.
- Não executes ações destrutivas (apagar tarefas, conta, dados).

Retorna APENAS JSON válido com esta estrutura:
{
  "reply": "mensagem ao utilizador",
  "action": { "type": "none|create_task|update_task", "task": {...} }
}
"""
```

```python
# Limpeza obrigatória do output da IA (proteção contra respostas mal formatadas)
def parse_json_content(raw_content: str):
    content = (raw_content or "").strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?\s*", "", content, flags=re.IGNORECASE)
        content = re.sub(r"\s*```$", "", content)
    match = re.search(r"\{.*\}", content, flags=re.DOTALL)
    return json.loads(match.group(0) if match else content)
```

> *(O que falar: "A IA não é uma caixa negra. Eu defini regras estritas: ela só pode falar de produtividade, não pode inventar dados, e é obrigada a responder em JSON. A função `parse_json_content` usa Expressões Regulares para limpar a resposta — porque a IA às vezes responde com blocos de Markdown que partiriam o frontend se não fossem tratados.")*

---

## Slide 10: Código — IA — Criação de Tarefas por Chat

**Título do Slide:** "O utilizador diz 'cria uma tarefa' e a IA executa"

*(Mostra como o backend monta os dados e o fallback local)*

```python
# rag_backend.py — Quando o utilizador pede ao PRIO para criar uma tarefa,
# a IA devolve um JSON com os dados completos:
{
    "reply": "Criei a tarefa 'Estudar para o teste de Matemática'...",
    "action": {
        "type": "create_task",
        "task": {
            "title": "Estudar para o teste de Matemática",
            "description": "Preparação para o teste da próxima semana.",
            "priority": 2,
            "estimated_minutes": 90,
            "due_date": "2026-07-14T18:00:00",
            "checklist": ["Rever a matéria do capítulo 5", "Fazer exercícios", "Simular teste"],
            "note": "Sugerido pelo PRIO com base no prazo."
        }
    }
}
```

```python
# Se a IA estiver indisponível, existe um fallback LOCAL com Regex:
def build_fallback_task_action(message: str):
    # Deteta palavras-chave como "cria", "nova tarefa", "adiciona"
    if not re.search(r"\b(cria|crie|criar|adiciona|nova tarefa)\b", message, re.IGNORECASE):
        return None
    # Extrai o título da mensagem por Regex
    title_match = re.search(r"(?:para|tarefa)\s+(.+?)(?:\s+amanh|$)", message, re.IGNORECASE)
    title = title_match.group(1).strip() if title_match else "Nova tarefa"
    # Infere a prioridade por palavras-chave
    priority = 1 if "urgente" in message.lower() else 3
    return {"type": "create_task", "task": {"title": title, "priority": priority, ...}}
```

> *(O que falar: "O utilizador escreve em linguagem natural, por exemplo, 'cria uma tarefa para estudar amanhã'. O DeepSeek interpreta, extrai o título, o prazo e a prioridade, e devolve um JSON estruturado. O React recebe esse JSON e chama a mesma `createTask()` que vos mostrei antes. Se o DeepSeek estiver offline, tenho um sistema de fallback local que usa Regex para extrair os dados da mensagem — a app nunca fica bloqueada.")*

---

## Slide 11: Código — IA — Subtarefas e Relatórios Automáticos

**Título do Slide:** "A IA analisa o contexto real da tarefa"

*(Mostra como o backend vai buscar o contexto à BD antes de enviar à IA)*

```python
# rag_backend.py — O backend junta o contexto REAL antes de pedir à IA
def fetch_task_context(task_id):
    task = supabase.table("tasks").select("*").eq("id", task_id).single().execute()
    notes = supabase.table("task_notes").select("content").eq("task_id", task_id).execute()
    checklist = supabase.table("checklist_items").select("content, is_completed").eq("task_id", task_id).execute()
    resources = supabase.table("resources").select("title, url").eq("task_id", task_id).execute()

    # Monta texto com: título, prioridade, estado, prazo, tempo gasto,
    # notas do utilizador, checklist (✅/⬜) e links
    return task.data, contexto_formatado
```

**Subtarefas & Relatórios:** O copiloto de IA recebe este contexto detalhado e consolidado:
*   **Bloco de Notas (Notepad):** Descrição textual rica em HTML (campo `description` da tabela `tasks`).
*   **Diário de Bordo:** Notas associadas da tabela `task_notes`, estruturadas com data/hora: `"- [{created_at}] {conteúdo}"`.
*   **Checklist:** Itens individuais e o seu estado atual de conclusão: `"- [Item] (Concluído)"` ou `"- [Item] (Pendente)"`.
*   **Detalhes adicionais:** Título da tarefa, prioridade (1 a 5), status ('A Fazer' | 'Em Progresso' | 'Feito'), prazo final (due_date), estimativa de tempo e tempo decorrido.
*   **Links e Recursos:** Lista de URLs guardadas.

> *(O que falar: "A IA não inventa do nada. Antes de sugerir subtarefas ou resumir a tarefa, o backend em Python (rag_backend.py, linhas 86-128) executa um motor de RAG (Retrieval-Augmented Generation). Ele faz queries ao Supabase para recolher e juntar tudo: a descrição rica do Bloco de Notas, todas as entradas temporais do Diário de Bordo, os itens concluídos e pendentes do Checklist, links e estimativas de tempo. Isto garante que as respostas da IA sejam específicas e 100% corretas para aquela tarefa.")*

---

## Slide 12: Código — Gamificação (XP e Níveis)

**Título do Slide:** "A matemática que motiva o utilizador"

```javascript
// GamificationService.js — Motor de XP e Level Up
async awardXp(xpAmount) {
    const { data: profile } = await supabase
        .from('profiles').select('xp, level').eq('id', user.id).single()

    let newXp = (profile.xp || 0) + xpAmount
    let newLevel = profile.level || 1
    const XP_PER_LEVEL = 1000

    // Level Up — suporta múltiplos níveis de uma vez
    while (newXp >= XP_PER_LEVEL && newLevel < 10) {
        newXp -= XP_PER_LEVEL
        newLevel += 1
    }
    // Cap no nível máximo
    if (newLevel >= 10 && newXp > XP_PER_LEVEL) newXp = XP_PER_LEVEL

    await supabase.from('profiles')
        .update({ xp: newXp, level: newLevel }).eq('id', user.id)
}
```

```javascript
// Cálculo do XP por tarefa — não é fixo, depende de como trabalhaste:
calculateXpForTask(task) {
    const baseXp = 50
    const priorityMult = { urgent: 2.0, high: 1.5, medium: 1.0, low: 0.8, minimal: 0.5 }
    const checklistBonus = completedItems * 10   // Bónus por cada item da checklist
    const subtaskBonus = completedSubtasks * 25  // Bónus por cada subtarefa concluída
    const timeBonus = Math.min(Math.floor(minutesTrabalhados / 5) * 5, 100) // Bónus por tempo
    return Math.round((baseXp * priorityMult[prioridade]) + checklistBonus + subtaskBonus + timeBonus)
}
```

> *(O que falar: "O XP não é fixo. Uma tarefa urgente com checklist completa e 30 minutos de trabalho vale muito mais do que uma tarefa mínima sem esforço. O multiplicador de prioridade, os bónus de checklist e o bónus de tempo criam um sistema justo que recompensa o trabalho real, não apenas clicar 'concluído'.")*

---

## Slide 13: Dificuldades e Soluções

**Título do Slide:** "Os problemas reais que enfrentei"

| Dificuldade | Solução que implementei |
|-------------|------------------------|
| Aprender React "do zero" (componentes, hooks, estados) | Modularizei tudo em Services e componentes pequenos. Estudei a documentação oficial. |
| A IA devolvia respostas mal formatadas que partiam o frontend | Criei `parse_json_content()` com Regex + sistema de double-try (tenta com JSON mode, se falhar tenta sem) |
| A IA podia inventar dados ou sair do tema | Implementei Guardrails rigorosos no system prompt |
| Se o servidor de IA estiver offline, a app bloqueava | Criei fallback local com Regex que extrai dados da mensagem sem IA |
| O sistema de XP permitia "cheats" (marcar feito sem trabalhar) | O cálculo de XP valida checklist, subtarefas e tempo antes de premiar |

> *(O que falar: "A maior dificuldade foi a integração da IA. Não basta chamar uma API — é preciso controlar o output, tratar erros, e ter um plano B. O sistema de double-try que criei tenta primeiro forçar JSON, e se o modelo falhar, retenta sem essa restrição. Isto garante que a app nunca fica sem resposta.")*

---

## Slide 14: Demonstração Prática + Conclusão

**Título do Slide:** "Vamos ver o Prioriza a funcionar"

> *(Sai do PowerPoint. Abre a app e demonstra:)*
> 1. **Cria uma tarefa manualmente** — mostra as 5 cores de prioridade, o formulário.
> 2. **Abre o Workspace** da tarefa — mostra notas, checklist, links e o timer Pomodoro.
> 3. **Pede à IA** para criar uma tarefa por chat — mostra como ela aparece na lista.
> 4. **Pede subtarefas à IA** — mostra as sugestões geradas com base no contexto real.
> 5. **Conclui a tarefa** — mostra o XP a subir e o nível a avançar.

**Conclusão (depois da demo):**
- Os objetivos propostos foram integralmente cumpridos.
- Evolui tecnicamente em React, Python (FastAPI), PostgreSQL, integração de IA e arquitetura de software.
- O Prioriza resolve o problema real: transforma a paralisia de decisão em ação organizada.

> *(O que falar: "Para finalizar, este projeto fez-me crescer como programador de uma forma que não seria possível apenas em sala de aula. Passei de não saber React a construir uma aplicação com autenticação, base de dados relacional, gamificação e inteligência artificial integrada. Dou por terminada a minha apresentação. Obrigado pela atenção. Estou disponível para responder às vossas questões.")*

---

## Melhorias Futuras *(Slide extra só se perguntarem)*

- Notificações Push via Service Workers
- Tarefas recorrentes automáticas
- Transformação em PWA (acesso offline)
- Colaboração entre utilizadores via WebSockets

> *(Não precisas de um slide separado para isto. Se o júri perguntar "o que farias a seguir?", respondes com estes pontos.)*
