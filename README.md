<h1 align="center">
  Prioriza
</h1>

<p align="center">
  <strong>Gira as suas tarefas diárias com a máxima eficiência baseando-se na Matriz de Eisenhower e foco interativo.</strong>
</p>

<p align="center">
  <a href="#sobre">Sobre</a> •
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#como-comecar">Como Começar</a> •
  <a href="#documentacao-e-wiki">Wiki Oficial</a>
</p>

---

## Sobre

O Prioriza é uma Aplicação de Página Única (SPA) projetada com o fito de redefinir a produtividade e a gestão pessoal de tarefas. Desenvolvida sob uma arquitetura modular moderna e uma interface de utilizador iminentemente minimalista, a plataforma prioriza uma abordagem inteligente centrada na categorização e estruturação do trabalho diário.

Este projeto dispõe atualmente de integração perene com bases de dados em tempo real, capacidade de visualização através de painéis analíticos, suporte para modo noturno e fluxos automatizados de autenticação.

[Aceder à Aplicação Pelo GitHub Pages](https://chavancharinga.github.io/Prioriza/)

---

## Funcionalidades Principais

- **Autenticação Segura:** Registo e identificação na plataforma, assegurados pela infraestrutura integrada do Supabase.
- **Métodos de Visualização:**
  - **Lista Modular:** Perspetiva em tabela minimalista para uma rápida revisão tática das pendências diárias.
  - **Quadro Kanban:** Interface segmentada por estado, facilitando a transição de tarefas arrastando as opções com o cursor.
  - **Árvore Hierárquica:** Visão que agrupa elementos parentais das prioridades aninhadas mediante indicadores de tempo real.
- **Painel Analítico Avançado:** Fornecimento analítico por indicadores fulcrais e representações gráficas relativas à distribuição de tarefas e tempo de conclusão transversal a prioridades.
- **Ferramentas de Foco Intrínsecas:** Temporizador localizado nas subtarefas e integração simplificada com sistemas de texto estendido baseados em Markdown.
- **Estilização Dinâmica:** Incorporação robusta de um Tema Escuro através do manuseamento de Variáveis CSS nativas no padrão mais recente do Tailwind v4.
- **Gestão de Planeamento Mensal:** Módulo expansivo do calendário global para projeção temporal pormenorizada.

---

## Tecnologias Integradas

- **Desenvolvimento da Interface (Frontend):** React 18 acoplado à solução de compilação Vite
- **Definição Estilística:** Tailwind CSS v4
- **Backend as a Service (BaaS):** Supabase (PostgreSQL e Processamento Multi-Fator)
- **Engenharia de Interação:** Framer Motion (UX e transições de Estado Interativo)
- **Gestão de Transição Operacional (Routing):** React Router v6
- **Procedimentos de Implementação Progressiva (CI/CD):** Componente de entrega em Pipelines do GitHub Actions e GitHub Pages

---

## Como Começar (Ambiente Local)

### Requisitos Técnicos
- Engine de JavaScript Node.js (versão atestada: 20 ou superior)
- Um projeto limpo instanciado na plataforma do Supabase.

### Instruções de Instalação

1. Duplique o diretório localmente:
   ```bash
   git clone https://github.com/Chavancharinga/Prioriza.git
   cd Prioriza/Code/Prioriza_pasta
   ```

2. Efetue o download das dependências subjacentes:
   ```bash
   npm install
   ```

3. Exponha as varíaveis locais fundamentais para a infraestrutura operar:
   - Crie um ficheiro intitulado `.env.local` na raiz `/Prioriza_pasta`, fornecendo de seguida os acessos alocados pelo seu painel de API no Supabase:
   ```env
   VITE_SUPABASE_URL=url_de_api_reservado_no_supabase
   VITE_SUPABASE_ANON_KEY=chave_anon_atestada_no_supabase
   ```

4. Dispare o servidor de desenvolvimento para depuração iterativa local:
   ```bash
   npm run dev
   ```

---

## Documentação Técnica e WIKI

O plano tático transposto originou também a idealização e registo progressivo do desenvolvimento. De forma a dotar futuras metodologias de análise facilitada para integração técnica, optou-se pela criação de uma robusta Wiki dentro do próprio ambiente do projeto.

Para explorações a um nível informático granular — listando também incidentes técnicos suplantados que serviram como fonte resoluta dos problemas de CI/CD recentes, razões logísticas prementes na escolha técnica da fundação, a par do catálogo para futuras injeções algoritmicas e semânticas com recurso a GenAI e LLMs — deverá consultar a listagem de leitura orientada e oficial para promotores (Developer Experience).

[Aceder à Documentação Central Técnica (WIKI)](docs/WIKI.md)
