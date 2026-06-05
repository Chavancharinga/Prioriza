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

A cor não é apenas estética; é um atalho cognitivo. O cérebro humano processa cores muito mais rápido do que texto, permitindo uma triagem subconsciente instantânea. O Prioriza adota uma paleta adaptativa de tons de destaque (*neon accents*) sobre um fundo escuro premium para guiar a atenção do utilizador:

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

O Prioriza incentiva a consistência no cumprimento de tarefas através de um ciclo de recompensa gamificado que torna o progresso diário tangível:

### Nível e XP (Pontos de Experiência)
* **Conclusão de Tarefas:** Cada tarefa concluída concede XP baseado no seu nível de prioridade (tarefas mais importantes, como P1, concedem mais XP do que tarefas P5).
* **Conclusão de Checklists:** Completar subtarefas dentro de uma tarefa também atribui XP bónus.
* **Temporizador de Foco:** Concluir ciclos de Pomodoro com sucesso recompensa o utilizador com XP de foco.

### Feedback Visual Premium (XP Flight Animation)
Ao concluir uma tarefa, um efeito de feedback dinâmico é despoletado para criar satisfação visual imediata:
1. **Emissão de Partículas:** Partículas verdes representando pontos de XP surgem a partir das coordenadas exatas onde o utilizador clicou.
2. **Física de Voo:** As partículas sobem em arco com velocidade progressiva em direção ao indicador de nível e troféu localizado no cabeçalho (*DashboardHeader*).
3. **Feedback de Colisão:** Quando as partículas colidem com o troféu, este executa um pulso físico de mola (*spring scale pulse*) acompanhado por um brilho e explosão de 12 faíscas brilhantes (*sparkle burst*).
4. **Atualização de Nível:** A barra de XP sobe de forma fluida a 60fps acompanhando a colisão, desencadeando um efeito de subida de nível (*Level Up*) caso o limite do nível atual seja ultrapassado.

### Disciplina: Penalidades por Atraso (Overdue Penalties)
A gamificação também pune a inércia. Se uma tarefa com data de vencimento ultrapassar o prazo sem ser marcada como "Feito", a rotina de análise deduz automaticamente uma penalidade de XP do utilizador, alertando-o para acelerar as suas entregas.

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
