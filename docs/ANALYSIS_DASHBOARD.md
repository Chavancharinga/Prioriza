# Análise de Implementação: Interface de Sessão de Estudo

## 1. Desconstrução da Interface (UI)

A imagem apresenta um *dashboard* educacional moderno, com um forte **Tema Escuro** (Dark Mode) focado na redução da fadiga visual. A interface é dividida em três colunas principais (layout `grid` ou `flex`), otimizando o espaço em ecrãs de computador e maximizando o foco na aprendizagem.

### Coluna Esquerda: Piano de Estudos (Navegação)
- **Componente:** Um menu lateral do tipo **Acordeão (Accordion)**.
- **Estado Visual:** Módulos concluídos (ícone verde com *check*), módulo atual aberto (borda azul com destaque do conteúdo de estudo atual), módulos futuros fechados.
- **Conteúdo:** Lista hierárquica dividindo grandes temas ("Modules") em subtópicos específicos.

### Coluna Central: O Foco (Bloco de Notas e Teoria)
- **Cabeçalho Principal:** Título em destaque ("Quantum Physics Study Session") com um caminho de navegação por tópicos (*breadcrumbs*) indicando o módulo atual (Ex: Physics 401 > Week 3 > Wave Mechanics).
- **Editor Rico Textual (Rich Text Editor):** Um grande bloco editável, em formato de notas.
- **Barra de Ferramentas:** Ferramentas essenciais de formatação de texto (Negrito, Itálico, Sublinhado, H1, H2, Listas) e um botão azul de "Save Notes" alinhado à direita.
- **Tipografia:** Uso denso mas legível de texto, utilizando uma combinação visual do conteúdo teórico juntamente com uma área final com o convite *Start typing more notes here...*, indicando que é interativo.
- **Código/Equações:** Destaque para um bloco formatado em fundo mais escuro mostrando a Equação de Schrödinger `iħ ∂Ψ/∂t = ĤΨ`, indicando suporte para formatação *inline code* matemático.

### Coluna Direita: Recursos AI e Material de Apoio
- **Cabeçalho:** Indicação de "AI Suggested Resources" (Recursos Sugeridos por IA), com ícones decorativos de "brilho".
- **Vídeos Relacionados:** Cartões verticais contendo miniaturas (thumbnails) escurecidas e opacas de vídeos, um botão de *Play* translúcido ao centro, e uma etiqueta do tempo do vídeo.
- **Artigos de Referência:** Lista de pequenos cartões (`Cards`) com links externos para documentos teóricos, contendo ícones (livro, somatório matemático), um título em negrito e uma breve descrição truncada.

---

## 2. Paleta de Cores e Estética (Tailwind CSS)
A interface não é totalmente preta, mas sim baseada em tons de azul da meia-noite vibrantes.

- **Background Base:** Um azul-escuro profundo (apróx. `bg-slate-900` ou hex `#0B1324`).
- **Superfícies (Cartões, Inputs):** Uma variação subtilmente mais clara do base (apróx. `bg-slate-800/60`).
- **Texto Principal (Heading):** Branco puro (`text-white`) para forte contraste.
- **Texto Secundário (Descrições):** Cinza azulado (apróx. `text-slate-400`).
- **Acentos (Ativos e Botões):** Azul tecnológico primário (apróx. `text-blue-500` / bordas `border-blue-500/50`).
- **Estados:** Verde suave para estados concluídos (`text-emerald-400`).

---

## 3. Resumo de Como Implementar no "Prioriza"

Como a nossa aplicação já utiliza o ecossistema perfeito para replicar este *dashboard* (React, Tailwind v4, Lucide Icons, Dark Mode configurável), a implementação poderia ser enquadrada dentro de um novo módulo (ex: uma funcionalidade de "Hub de Projeto" ao clicarmos numa Tarefa grande).

1. **Estrutura de Grelha (Layout):**
   Criar um componente (`StudyDashboard.jsx`) usando `grid-cols-12`:
   - Coluna Esquerda: `col-span-3` (Componente de Acordeão com *Framer Motion* para animar as aberturas).
   - Coluna Principal (Centro): `col-span-6` (Cabeçalho + `RichTextEditor` customizado ou integrado como Quill/TipTap).
   - Coluna Direita: `col-span-3` (Componente assíncrono que carrega dados de recursos e cartões UI com imagens externas).

2. **Componente de Acordeão (Sidebar Direita):**
   - Utilizamos o nosso estado React `activeModule` para definir a borda azul e mostrar a lista interna se o componente for *clickado*.
   - Ícones `CheckCircle2` (verde) e `Circle` (vazio) nativos da biblitoeca **Lucide** que já temos.

3. **Editor de Texto Central:**
   - Em vez de reescrever do zero, como o Prioriza já foca em tarefas, poderíamos usar um componente como o **TipTap** (Headless Editor para React) estilizado via Tailwind para replicar fielmente a área onde diz "Notes: The Schrödinger Equation".
   - A barra com controlos de Negrito e H1 seria um div flex no topo do editor ligada às funções `editor.chain().focus().toggleBold().run()`.

4. **Painel de Recursos Laterais (AI):**
   - Esta secção encaixa na perfeição com o futuro **Backlog de Inteligência Artificial** (Gemini) do nosso projeto!
   - Podemos fazer um pedido real à API (como planeado no WIKI) passando o título do *Focus Mode* (ex: "Equações Físicas") e o Gemini devolver-nos formatado (em JSON) URLs educacionais verídicos e *titles*. Nós apenas renderizamos esses dados devolvidos pela IA num componente `<ResourceCard />`.

> Esta interface reflete na íntegra a visão premium e focada do Prioriza. Ao juntarmos o Tailwind que dominamos com os módulos AI do futuro, conseguiríamos iterar uma view semelhante facilmente em menos de 2 dias de desenvolvimento.
