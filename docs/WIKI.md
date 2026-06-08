# WIKI do Prioriza

Bem-vindo à Wiki oficial do Prioriza, uma aplicação de gestão de tarefas de alta performance baseada na Matriz de Eisenhower, com foco em produtividade cromática, escrita associativa e dinâmicas de ludificação (gamification).

---

## 🎯 Filosofia de Produtividade: Como Decidir o que é Prioridade?

O Prioriza baseia-se na **Matriz de Eisenhower** para filtrar a sobrecarga diária. O princípio divide qualquer atividade com base em dois eixos lógicos: **Importância** (impacto a longo prazo) e **Urgência** (sensibilidade ao tempo).

```
                      URGENTE                    NÃO URGENTE
            ┌───────────────────────────┬───────────────────────────┐
            │       QUADRANTE I         │       QUADRANTE II        │
 IMPORTANTE │         FAZER JÁ          │          AGENDAR          │
            │  Urgente + Importante     │  Importante + Não Urgente │
            ├───────────────────────────┼───────────────────────────┤
    NÃO     │       QUADRANTE III       │       QUADRANTE IV        │
 IMPORTANTE │         DELEGAR           │         ELIMINAR          │
            │  Urgente + Não Importante │ Nem Urgente, Nem Import.  │
            └───────────────────────────┴───────────────────────────┘
```

### Triagem Automática de Tarefas
Para evitar a fadiga de decisão, o sistema auxilia o utilizador classificando as tarefas nos quatro quadrantes:
1. **Fazer Já (Q1):** Tarefas com prioridade máxima (P1 ou P2) cujo prazo de conclusão expira em menos de 48 horas, ou que estejam com o estado de execução marcado como "Em Progresso".
2. **Agendar (Q2):** Tarefas importantes (P1 ou P2) com prazos longos ou sem data limite definida. Devem ser calendarizadas para evitar que se tornem urgências críticas.
3. **Delegar (Q3):** Tarefas de baixa relevância (P3, P4 ou P5) com prazos curtos (menos de 48 horas). Devem ser automatizadas, simplificadas ou passadas a terceiros.
4. **Eliminar (Q4):** Tarefas de baixa relevância e sem prazo estrito. Devem ser arquivadas ou limpas para desanuviar a mente.

---

## 🎨 O Sistema de Cores e Produtividade Cromática

A cor não é apenas estética; é um atalho cognitivo. O cérebro humano processa cores muito mais rápido do que texto, permitindo uma triagem subconsciente instantânea. O Prioriza adota uma paleta adaptativa de tons de destaque de alta precisão sobre um fundo cinza-claro/ardósia médio-claro profissional (com acentos de cor azul alinhados com a logo oficial, livre de alternâncias de tema claro/escuro e de brilhos neon de IA) para guiar a atenção do utilizador:

| Nível | Cor de Destaque | Significado Lógico | Impacto na Produtividade |
| :--- | :--- | :--- | :--- |
| **P1** | 🔴 `Rose-600` | **Crítico / Emergência** | Atração visual imediata. O utilizador deve focar-se nestas tarefas antes de qualquer outra. |
| **P2** | 🟠 `Red-500` | **Alta Relevância** | Requer atenção no mesmo dia. Indica entregas principais. |
| **P3** | 🟡 `Orange-500` | **Média Relevância** | Tarefas rotineiras ou operacionais de suporte. |
| **P4** | 🟢 `Yellow-500` | **Baixa Relevância** | Tarefas opcionais ou de menor impacto. |
| **P5** | 🔵 `Blue-500` | **Exploratório / Ideias** | Leituras, pesquisas ou tarefas sem pressa. |

### Integração Cromática na Interface
* **TaskModal**: O seletor de prioridade foi substituído por pontos de cor interativos, permitindo ao utilizador escolher a prioridade de forma visual direta.
* **Kanban**: Cada cartão possui um indicador cromático vertical no lado esquerdo correspondente ao nível de prioridade, permitindo organizar a execução ordenando visualmente as tarefas da cor mais quente para a mais fria.
* **TreeView**: A prioridade é renderizada de forma elegante com marcadores de bolha cromática de alto contraste.
* **Matriz de Eisenhower**: Segmentação por quadrantes de cor (Vermelho para Q1, Laranja para Q2, Azul para Q3, Cinzento para Q4) para foco compartimentado.

---

## 💻 Visualizações de Trabalho (Multiview)

A aplicação permite ao utilizador alternar entre quatro perspectivas complementares de acordo com o seu momento de foco:

### 1. Vista de Lista
* **Foco:** Produtividade tática e edição rápida.
* **Estrutura:** Tabela minimalista com pesquisa rápida, ordenação por prioridade e filtros de estado. Ideal para rever pendências no início do dia.

### 2. Quadro Kanban (Arrastar e Soltar)
* **Foco:** Fluxo de trabalho em progresso (WIP).
* **Estrutura:** Colunas operacionais ("A Fazer", "Em Progresso" e "Feito") com suporte a gestos móveis. Permite arrastar os cartões para atualizar o estado de execução instantaneamente.

### 3. Vista em Árvore
* **Foco:** Gestão de dependências e estrutura de projeto.
* **Estrutura:** Relação hierárquica entre tarefas-mãe e subtarefas, com indicadores visuais de progresso dinâmicos que mostram a percentagem de conclusão de cada ramo do projeto.

### 4. Matriz de Eisenhower
* **Foco:** Planeamento estratégico e triagem de urgência.
* **Estrutura:** Divisão em grelha 2x2 baseada na urgência e importância. Ideal para limpar e filtrar a lista de tarefas semanalmente.

---

## ⏱️ Ferramentas de Foco & Escrita Associativa

### Temporizador Pomodoro
Dentro do espaço de trabalho (Workspace) de cada tarefa, o utilizador pode ativar um temporizador integrado de foco e pausa (ex: 25 minutos de foco por 5 minutos de descanso). O temporizador opera em segundo plano, registando o progresso da tarefa e atualizando os cartões visuais.

### Notas com Links Bidirecionais
A aplicação suporta um sistema de escrita de notas baseado no conceito de *Zettelkasten* (rede de conhecimento associativa):
* **Escrita de Notas:** Editor de texto rico (*Rich Text Editor*) incorporado no Workspace da tarefa.
* **Criação de Links:** Ao digitar `[[` no editor, abre-se um menu de sugestões dinâmico listando as outras tarefas do utilizador.
* **Mapeamento de Ligações:** Criar um link como `[[Revisão de Código]]` estabelece uma ligação bidirecional direta. A tarefa referenciada exibirá automaticamente uma secção de *Backlinks* (Tarefas que ligam a esta), criando um grafo lógico entre tarefas interrelacionadas.

---

## 🎮 Gamificação, XP e Animação de Feedback

O Prioriza incentiva a consistência no cumprimento de tarefas através de um ciclo de recompensa gamificado que alia gatilhos de motivação comportamental com hábitos reais de produtividade. 

### 🧠 A Psicologia do Incentivo: Por que o XP sozinho não basta?

Ganhos numéricos de XP isolados não sustentam a motivação de longo prazo. Por isso, a arquitetura de gamificação do Prioriza baseia-se em pilares de psicologia comportamental (inspirados no modelo de gamificação Octalysis) para criar um incentivo real para bater metas e cumprir prazos:

1. **Aversão à Perda (Loss Aversion - O motor de cumprimento de prazos):** 
   A psicologia humana é muito mais motivada pelo medo de perder do que pelo desejo de ganhar. No Prioriza, atrasar tarefas não é inócuo. O sistema deduz `-50 XP` na inicialização do aplicativo para cada tarefa vencida e `-100 XP` caso conclua com atraso. Se o XP do nível atual cair abaixo de zero, o utilizador **perde nível (Level Down) e a sua patente de produtividade é despromovida**. A dor de perder um título duramente conquistado (ex: cair de *Executor Consistente* para *Organizador Ágil*) é a principal força que atua contra o desleixo e a procrastinação dos prazos.

2. **Progresso de Status e Identidade (Ranks e Patentes):**
   Subir de nível não serve apenas para preencher uma barra. A evolução numérica está acoplada a patentes (Ranks) visíveis na interface. Isso transforma a atividade de fazer tarefas de uma obrigação administrativa numa jornada de mestria pessoal (Identity-based habits), onde o utilizador vê o seu perfil evoluir de um *Recruta da Procrastinação* (Lvl 1) a um *Deus da Eficiência* (Lvl 10).

3. **Custo de Oportunidade e Hábitos (O Multiplicador de Streak):**
   Ao manter a consistência diária, o utilizador ativa multiplicadores de XP (até **2.0x** com a Chama Azul). O streak gera uma urgência diária: quebrar a sequência significa reiniciar o multiplicador, tornando a subida de patente subsequente duas vezes mais lenta. O utilizador protege a sua sequência para não perder a vantagem acumulada, consolidando hábitos diários de planeamento.

4. **Filtro de Integridade (Anti-Cheat - Recompensa Significativa):**
   A recompensa perde o significado se o cérebro perceber que pode trapacear. Marcar tarefas complexas como concluídas apenas para obter XP rápido, enquanto itens na checklist ainda estão pendentes, resulta em **0 XP** atribuídos. Isso bloqueia a dopamina vazia de cliques fraudulentos e força o utilizador a encarar a checklist como a representação real do seu compromisso.

5. **Recompensa de Prestígio Máxima (Licença de Descanso):**
   Ao alcançar o nível 10 (*Deus da Eficiência*), a barra de XP bloqueia e o cabeçalho ativa o badge flutuante **"🏖️ Folga"**. Ele funciona como um "troféu de prestígio" permanente. Na mente do utilizador, esta medalha atua como uma autorização psicológica de que atingiu a excelência produtiva e que pode descansar com a satisfação do dever inteiramente cumprido.

6. **Feedback Físico Dopaminérgico:**
   Para fechar o loop do hábito, a conclusão da tarefa aciona uma física interativa e elástica de mola, com partículas de XP que voam de forma fluida até o troféu. Este efeito visual gratificante serve como uma micro-recompensa instantânea que estimula o cérebro a querer repetir a ação de concluir tarefas.

---

### A. Ranks e Patentes de Produtividade
A subida de nível atribui ao utilizador um título visível de **Patente de Produtividade**, que serve como representação de progresso e estatuto pessoal:
* **Nível 1:** 🐣 *Recruta da Procrastinação* (fase inicial de inércia).
* **Nível 2:** 🌱 *Iniciante Consciente* (primeiras tarefas organizadas).
* **Nível 3:** ⏱️ *Praticante de Foco* (utilização do Pomodoro).
* **Nível 4:** 🗂️ *Organizador Ágil* (divisão de checklists e datas).
* **Nível 5:** 🚀 *Executor Consistente* (alto volume de conclusão).
* **Nível 6:** 🦾 *Focado de Aço* (consistência diária sólida).
* **Nível 7:** 🧭 *Estrategista de Matriz* (uso frequente da Matriz de Eisenhower).
* **Nível 8:** 🎓 *Mestre da Produtividade* (agenda sob controle estrito).
* **Nível 9:** 🌟 *Lenda do Foco* (gestão avançada em tarefas complexas).
* **Nível 10:** 👑 *Deus da Eficiência* (estado de prestígio máximo, desbloqueia a badge flutuante **"🏖️ Folga"** no cabeçalho).

### B. Sequência Diária com Multiplicador de Fogo (Streaks)
Para estimular o hábito diário de planeamento e execução, concluir tarefas em dias consecutivos ativa multiplicadores de XP representados por uma chama animada:
* 🔥 **1 a 2 dias (Chama Brasa):** Multiplicador de 1.0x.
* ☄️ **3 a 6 dias (Chama Fogo Ativo):** Multiplicador de 1.5x.
* ⚡ **7+ dias (Chama Fogo Azul):** Multiplicador de 2.0x (todo o XP atribuído por conclusão é duplicado).

### C. Aversão à Perda (Loss Aversion) e Despromocão
Deixar que as tarefas ativas ultrapassem a data de vencimento (due_date) sem serem concluídas resulta em penalizações que incentivam o respeito pelos prazos:
* **Penalização automática:** O utilizador perde `−50 XP` por cada tarefa vencida (verificação feita ao abrir a aplicação).
* **Conclusão atrasada:** Marcar uma tarefa vencida como "Feito" deduz `−100 XP`.
* **Despromoção (Level Down):** Se o saldo de XP do nível atual cair abaixo de zero devido a penalizações de atraso, o utilizador **perde nível** e é despromovido de Patente, ativando alertas visuais de aviso.
* **Limite Mínimo Absoluto:** O valor de XP e Nível mais baixo possível na aplicação é **0 XP no Nível 1**. O saldo de XP do utilizador **nunca assume valores negativos**.

### D. Filtro de Integridade (Anti-Cheat)
Para incentivar o cumprimento real do planeamento, marcar uma tarefa como concluída enquanto ela tem itens pendentes na sua checklist anula todo o ganho de XP correspondente, resultando em **0 XP** obtidos.

### E. Feedback Visual Premiado (XP Flight Animation)
Ao marcar uma tarefa como concluída, o utilizador recebe satisfação sensorial e visual instantânea:
1. Partículas de XP verdes são geradas a partir das coordenadas exatas de clique do cursor.
2. As partículas voam a 60fps em arco em direção ao troféu de Nível no cabeçalho.
3. Ao colidir, o troféu executa um pulso elástico com física de mola e explode em 12 faíscas verdes/douradas, enquanto a barra de progresso da XP sobe de forma fluida.

### F. Diferenciação de XP: Conclusão Rápida vs. Conclusão no Workspace
Para incentivar o foco real e desencorajar o uso superficial da aplicação, a conclusão de tarefas atribui pontuações diferenciadas consoante o fluxo de trabalho utilizado:
* **Conclusão no Workspace (Foco Detalhado):** Confere o XP base total (ex: **250 XP** para prioridade Crítica P1), habilita o bónus de pontualidade de **+150 XP** (caso seja concluída antes da data limite) e calcula a penalidade em caso de atraso.
* **Conclusão Rápida (Colunas do Kanban / General List):** Confere apenas **40%** do valor de XP base (ex: **100 XP** para P1), não aplicando bónus de pontualidade ou penalização ativa. Isto estimula o utilizador a abrir o espaço de trabalho individualizado para trabalhar e concluir de forma contextualizada.

---

## 🛠️ Desafios Técnicos Superados

### 1. Injeção de Variáveis Vazias pelo GitHub Actions
* **O Problema:** O processo de compilação (Vite) em CI/CD tentou ler variáveis de ambiente do repositório que ainda não estavam expostas no pipeline, substituindo as chaves válidas de produção por strings vazias, o que causou falhas fatais no cliente Supabase.
* **A Solução:** Ajustou-se a configuração de leitura das variáveis para ler de forma segura das *Secrets* configuradas no painel do GitHub, prevenindo a injeção de valores nulos.

### 2. Resolução do Base Path no GitHub Pages
* **O Problema:** Como o GitHub Pages aloja projetos sob caminhos relativos (ex: `/Prioriza/`), as referências estáticas e imagens absolutas (como `/logo.png`) quebravam com erro HTTP 404.
* **A Solução:** Adotou-se o uso de caminhos dinâmicos prependendo `import.meta.env.BASE_URL` a todos os ficheiros de recursos de imagem e links de rotas.

### 3. Tailwind v4 e Classes Dinâmicas
* **O Problema:** A compilação Just-In-Time do Tailwind CSS v4 não consegue mapear classes geradas por concatenação de strings dinâmicas em tempo de execução (ex: `bg-${priorityColor}-500`).
* **A Solução:** Criaram-se dicionários estáticos explícitos que associam cada número de prioridade (1 a 5) às classes Tailwind literais completas (ex: `1: 'bg-rose-600'`), garantindo que o compilador preserve os estilos.

### 4. Gestão e Exposição de Ficheiros de Ambiente
* **O Problema:** Ficheiros `.env` locais foram acidentalmente adicionados ao controlo de versões inicial, arriscando a partilha pública de chaves de base de dados.
* **A Solução:** Adicionaram-se exclusões estritas ao ficheiro `.gitignore` para omitir extensões `.env.*` e purgou-se a cache de rastreio do repositório remoto.

### 5. Incompatibilidade de Lockfile em Ambiente CI (EPERM & npm ci)
* **O Problema:** A execução de instalações locais no ambiente Windows gerou bloqueios de escrita e alertas de permissão (EPERM) em pacotes nativos e compilados (como o `lightningcss`). Isto resultou num ficheiro `package-lock.json` incompleto, fazendo com que o comando de integração contínua (`npm ci`) falhasse no GitHub Actions devido à ausência de subdependências.
* **A Solução:** Gerou-se uma árvore de dependências limpa através de `npm install --package-lock-only` (evitando tocar no `node_modules` local travado) e atualizou-se o ficheiro de fluxo `.github/workflows/deploy.yml` para correr sobre **Node 22** e executar `npm install` para obter uma resolução adaptável de dependências nativas no ambiente da nuvem.

---

> _Esta documentação é mantida em sincronia com as atualizações arquiteturais do projeto Prioriza para apoiar tanto os utilizadores finais na sua produtividade como os programadores na manutenção do código._
