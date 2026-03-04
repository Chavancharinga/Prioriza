# 📖 WIKI do Prioriza

Bem-vindo à Wiki oficial do **Prioriza**, uma aplicação moderna de gestão de tarefas baseada na Matriz de Eisenhower com suporte para visualizações ricas de produtividade.

---

## 🏗️ Arquitetura e Stack Tecnológico

O projeto foi construído utilizando tecnologias modernas focadas em performance e Developer Experience:
- **Frontend Core:** React 18, Vite (para build ultrarrápido)
- **Estilização:** Tailwind CSS v4 (com variáveis CSS CSS-first para o Dark Mode)
- **Animações e Interatividade:** Framer Motion (transições suaves fluidas) e bibliotecas de drag-and-drop (dnd-kit)
- **Ícones:** Lucide React
- **BaaS (Backend as a Service):** Supabase (Autenticação via Email/Password, Gestão de Base de Dados Postgres com Row-Level Security)
- **CI/CD:** GitHub Actions (Automated Deployment para o GitHub Pages)

---

## ✅ Funcionalidades Atuais Implementadas

A versão atual da aplicação cobre todos os pilares essenciais delineados nos documentos do projeto (PAP):

1. **Autenticação Segura:**
   - Registo e Login integrados diretamente com o Supabase Auth.
   - Proteção de rotas da aplicação contra utilizadores não autenticados.

2. **Dashboard (Visão Geral):**
   - KPI Cards com estatísticas essenciais (Total, Pendentes, Concluídas).
   - Timeline de próximas entregas.
   - Preview visual Kanban.

3. **Gestão Multiview de Tarefas:**
   - **Vista de Lista:** Clássica, fácil de varrer visualmente.
   - **Vista Kanban:** Arrasto e largada (Drag & Drop) intuitivo pelas colunas "Fazer", "Em Progresso" e "Feito".
   - **Vista em Árvore (Hierarquia):** Tarefas aninhadas com cores dinâmicas baseadas na prioridade numérica (1 a 5).

4. **Planeamento e Análise:**
   - **Planeamento:** Um calendário mensal interativo com indicadores de tarefas agendadas por dia.
   - **Análise (Analytics):** Dashboard detalhado de KPIs, gráficos de anéis com a taxa de conclusão, tempo médio gasto, e distribuição das tarefas por níveis de prioridade.

5. **Interface de Utilizador e UX:**
   - Modo Claro e Escuro (Dark Mode) adaptativo e manual via `ThemeToggle` usando `localStorage` e a preferência do SO do utilizador.
   - Sidebar retrátil nos desktops e escondida nas vistas mobile (hamburger menu adaptativo).
   - Saudações dinâmicas no Header de acordo com a hora local ("Bom dia", "Boa tarde", "Boa noite").

---

## 🛠️ Desafios Técnicos Superados

Durante a implementação, enfrentamos e ultrapassámos alguns problemas técnicos, especialmente ligados à partilha de estado e deploy:

### 1. Injeção Temporária de Variáveis Vazias pelo GitHub Actions
Durante o setup inicial de CI/CD, o pipeline `deploy.yml` tentou injetar chaves (Secrets) do Supabase vazias durante o build do Vite porque o repositório ainda não tinha as respetivas chaves configuradas. 
- **O Problema:** O Vite substituiu as variáveis válidas no código por strings vazias, causando um `fatal error` ao instanciar o módulo local do `supabase-js`, o que resultou num ecrã totalmente branco em produção.
- **A Solução:** Removemos o override explícito das variáveis de ambiente durante a fase de build no `deploy.yml` e configuramos com segurança no separador *Secrets* no painel do GitHub, instruindo a plataforma a passar estes segredos de forma protegida para a app compilada.

### 2. Base Path Resolution no GitHub Pages
Como o GitHub Pages não faz deploy na raiz do domínio (e.g., `github.io/Prioriza/` vez de `github.io/`), as imagens configuradas estaticamente com `/logo.png` começaram a retornar Erro 404 (Não Encontrado).
- **A Solução:** Todos os assets do UI foram atualizados para envolver o url dinamicamente através do `import.meta.env.BASE_URL` nativo do Vite (e.g., ``src={`${import.meta.env.BASE_URL}logo.png`}``), resolvendo imediatamente os 404.

### 3. Tailwind v4 e Classes Dinâmicas
No início, algumas cores condicionalizadas de cartões usavam classes dinâmicas como ``bg-${color}-500``. 
- **O Problema:** O compilador JIT do Tailwind não consegue rastrear estas misturas dinâmicas em runtime.
- **A Solução:** Utilizámos um mapa (`dictionary`) lógico pré-processado para cada número de prioridade com o caminho completo das classes de cor, tornando o UI fiável e escalável (ex: `priorityColors[priority].bg`).

### 4. Gestão do Ficheiro Secundário de Configuração (`.env.production`)
No commit inicial, o ficheiro passível de compilar em produção estava a ser tracked pelo Git, o que resultava no *leak* indesejado do URL e Chave Pública Supabase.
- **A Solução:** Adicionamos extensões `*.env` estritamente ao `.gitignore` e purgámos a cache indexada (`git rm --cached .env.production`).

---

## 🚀 Roadmap: O Que Falta Implementar

Baseado no **Plano Original dos PDFs** submetidos ao início, as seguintes etapas marcam o futuro próximo da aplicação:

1. **Inteligência Artificial (IA com Gemini):**
   - **Estimador Inteligente:** Sugerir automaticamente o tempo de conclusão e a prioridade de uma tarefa baseada na descrição (NLP).
   - **Assistente Pessoal:** Sugerir tarefas esquecidas no Kanban baseado no histórico de conclusões passadas do utilizador.

2. **Sistema de Notificações em Tempo Real / Reminders:**
   - Refinar o `NotificationService` stub que corre de fundo.
   - Ativar avisos de sistema de browser baseados no parâmetro `reminder` existente no pop-up das Tarefas.

3. **Gamification (Conquistas e Recompensas):**
   - Implementação do painel de "Badges" e troféus virtuais por metas de produtividade superadas consecutivamente ou horas mantidas no módulo "Timer de Foco".

---

> _Esta documentação é iterativa. Volte frequentemente para ver as novas capacidades adicionadas à medida que transpomos este projeto para a próxima fronteira de IA e Produtividade._
