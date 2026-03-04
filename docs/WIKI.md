# WIKI do Prioriza

Bem-vindo à Wiki oficial do Prioriza, uma aplicação moderna de gestão de tarefas baseada na Matriz de Eisenhower, com suporte para visualizações avançadas de produtividade.

---

## Arquitetura e Stack Tecnológico

O projeto foi construído com recurso a tecnologias modernas, focadas em otimização de desempenho e facilidade de manutenção (Developer Experience):
- **Core do Frontend:** React 18, Vite (para compilação de alta performance)
- **Estilização:** Tailwind CSS v4 (com variáveis CSS *CSS-first* para o Tema Escuro)
- **Animações e Interatividade:** Framer Motion (para transições fluidas) e bibliotecas de drag-and-drop (dnd-kit)
- **Ícones:** Lucide React
- **BaaS (Backend as a Service):** Supabase (Autenticação via Email/Palavra-passe, Gestão de Base de Dados Postgres com Row-Level Security)
- **CI/CD:** GitHub Actions (Implementação automatizada para o GitHub Pages)

---

## Funcionalidades Atuais Implementadas

A versão atual da aplicação abrange todos os pilares essenciais delineados nos documentos iniciais do projeto (PAP):

1. **Autenticação Segura:**
   - Registo e entrada no sistema integrados diretamente com o Supabase Auth.
   - Proteção estrita de rotas da aplicação contra utilizadores não autenticados.

2. **Dashboard principal (Visão Geral):**
   - Cartões de Indicadores-Chave de Desempenho (KPI) com estatísticas essenciais (Total, Pendentes, Concluídas).
   - Linha do tempo (Timeline) para as próximas entregas ou prazos.
   - Pré-visualização do quadro Kanban.

3. **Gestão Multiview de Tarefas:**
   - **Vista de Lista:** Visualização clássica, otimizada para leitura rápida.
   - **Vista Kanban:** Interface baseada em arrastar e largar (Drag & Drop), organizada por estados operacionais ("A Fazer", "Em Progresso" e "Feito").
   - **Vista em Árvore (Hierárquica):** Tarefas agrupadas com indicadores visuais baseados num sistema de prioridade numérica (escala de 1 a 5).

4. **Planeamento e Análise:**
   - **Planeamento:** Calendário mensal interativo, com sinalização de tarefas agendadas por dia.
   - **Análise (Analytics):** Painel detalhado de KPIs, incluindo gráficos de anéis com a taxa de conclusão, tempo médio de execução e distribuição das tarefas por níveis de prioridade.

5. **Interface de Utilizador e Experiência (UI/UX):**
   - Alternância entre Tema Claro e Tema Escuro (Dark Mode) de forma adaptativa ou manual via componente dedicado, com persistência no armazenamento local (`localStorage`) e respeito pela preferência do sistema operativo do utilizador.
   - Menu lateral (Sidebar) retrátil em ecrãs de mesa e oculto de forma adaptativa em dispositivos móveis.
   - Saudações contextuais dinâmicas no cabeçalho, ajustadas de acordo com o fuso horário local.

---

## Desafios Técnicos Superados

Durante a fase de desenvolvimento e implementação arquitetural, foram mitigados diversos constrangimentos técnicos, com especial foco na gestão de estado e segurança de implementação:

### 1. Injeção de Variáveis Vazias pelo GitHub Actions
Durante a configuração inicial do pipeline de CI/CD (`deploy.yml`), o processo tentou injetar chaves de ambiente (Secrets) do Supabase que ainda não existiam no repositório. 
- **O Problema:** O processo de compilação (Vite) substituiu as variáveis de produção válidas por valores nulos, causando um erro fatal aquando da instanciação do cliente `supabase-js`, o que resultou na falha de carregamento da aplicação em ambiente de produção (ecrã em branco).
- **A Solução:** Removeu-se a predefinição explícita de variáveis de ambiente do ficheiro de fluxo (workflow) e instruiu-se a configuração segura através do painel de *Secrets* do GitHub, garantindo uma compilação estável e segura.

### 2. Resolução do Caminho de Base (Base Path) no GitHub Pages
Devido à natureza do alojamento do GitHub Pages (que aloca o projeto num subdiretório em vez da raiz do domínio), as hiperligações de imagem com caminhos absolutos (ex: `/logo.png`) resultaram em erros HTTP 404.
- **A Solução:** Todos os recursos visuais foram reestruturados para invocar dinamicamente a variável de ambiente `import.meta.env.BASE_URL` providenciada pelo Vite. Este método garante que os ficheiros estáticos sejam servidos corretamente, independentemente do ambiente de alojamento.

### 3. Tailwind v4 e Classes Dinâmicas
Na iteração inicial de desenvolvimento, certas cores condicionais de cartões dependiam de sintaxe de classes dinâmicas. 
- **O Problema:** O compilador *Just-In-Time* (JIT) do framework Tailwind não consegue inferir classes geradas em tempo de execução de forma determinística.
- **A Solução:** Adotou-se um mapeamento estático (dicionário lógico pré-compilado) para associar cada grau de prioridade à sua respetiva classe tipográfica e de cor de fundo, assegurando a robustez da interface.

### 4. Gestão e Exposição de Ficheiros Físicos de Ambiente
No primeiro commit, um ficheiro contendo varíaveis de ambiente propensas a ser compiladas (`.env.production`) encontrava-se rastreado pelo sistema de controlo de versões, arriscando a exposição da Chave Pública da API e do URL do projeto Supabase.
- **A Solução:** Aplicaram-se diretivas restritas ao ficheiro `.gitignore` para a omissão de extensões e prefixos `.env`, seguidas da purga do respetivo ficheiro através da anulação de rastreio da cache do Git.

---

## Roadmap: Fases Futuras de Implementação

Com base no planeamento original descrito nos documentos submetidos, as seguintes etapas constituem os objetivos a longo prazo da plataforma Prioriza:

1. **Inteligência Artificial (Integração Gemini LLM):**
   - **Estimador Inteligente:** Sistema focado no Processamento de Linguagem Natural capaz de inferir e sugerir automaticamente o esforço de tempo previsto e a prioridade de uma tarefa baseando-se no seu corpo descritivo.
   - **Assistente Analítico:** Um módulo projetado para analisar o histórico de ação do utilizador e propor o fecho e reagendamento de tarefas latentes no Kanban.

2. **Sistema em Tempo Real e Lembretes (Reminders):**
   - Estabilização do `NotificationService` operando atualmente sob rotinas em segundo plano.
   - Lançamento progressivo de notificações *in-browser* com base em gatilhos e metadados de alarme configuráveis pelo utilizador dentro das definições da Tarefa.

3. **Ludificação de Sistema (Gamification):**
   - Estruturação de um painel de Conquistas focado na atribuição de distinções meritocráticas mediante a consistência das rotinas de produtividade prolongada e a utilização continuada de ferramentas de Gestão de Foco.

---

> _A presente documentação é mantida de forma iterativa, servindo como documento técnico central enquanto o projeto transita pelas próximas fases do planeamento estratégico._
