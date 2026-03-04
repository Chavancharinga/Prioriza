<h1 align="center">
  🚀 Prioriza
</h1>

<p align="center">
  <strong>Gere as tuas tarefas com a máxima eficiência baseada na Matriz de Eisenhower e foco interativo.</strong>
</p>

<p align="center">
  <a href="#-sobre">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#%EF%B8%8F-tecnologias">Tecnologias</a> •
  <a href="#-como-come%C3%A7ar">Como Começar</a> •
  <a href="#-documenta%C3%A7%C3%A3o-e-wiki">Wiki Oficial</a>
</p>

---

## 🎯 Sobre

O **Prioriza** é uma SPA (Single Page Application) concebida para redefinir a produtividade diária. Utilizando uma arquitetura modular moderna e uma interface minimalista incrível com suporte para _Dark Mode_, o Prioriza afasta-se das simples listas de tarefas para te oferecer um ecossistema focado na priorização inteligente.

Este projeto já dispõe de suporte em tempo real à base de dados, gestão de calendário de planeamento, visualização analítica KPI avançada e autenticação completa.

👉 **[Ver a App em Funcionamento (GitHub Pages)](https://chavancharinga.github.io/Prioriza/)**

---

## ✨ Funcionalidades

- **Autenticação Segura:** Autenticação imediata via Supabase (Email/Senha).
- **Três Vistas de Gestão:**
  - 📋 **Lista:** Visualização limpa e clássica.
  - 🧱 **Kanban:** Interface Drag & Drop fluida por status (A Fazer, Progresso, Concluído).
  - 🌳 **Árvore Hierárquica:** Visão parental das tuas prioridades aninhadas e indicadores em tempo real.
- **Painel Analítico:** Acompanha verdadeiras estatísticas com gráficos SVG polidos (Taxa de Conclusão, Distribuição, Velocidade Típica).
- **Foco e Recursos:** Modo timer nas subtarefas, integração com links de documentação em anexo, painel integrado para notas markdown curtas.
- **Dark Mode Robusto:** Preferência local baseada em Tokens CSS dinâmicos e `@custom-variant` via **Tailwind v4**.
- **Gestor de Planeamento Mensal:** Visualização de calendário global.

---

## 🛠️ Tecnologias

- **Frontend:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **BaaS (Base de Dados e Autenticação):** [Supabase](https://supabase.com/)
- **Animações (UX):** [Framer Motion](https://www.framer.com/motion/)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **CI/CD:** GitHub Actions -> GitHub Pages Deployment

---

## 🚀 Como Começar (Ambiente Local)

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20 ou superior)
- Um projeto limpo no [Supabase](https://supabase.com/).

### Instalação

1. Clona este repositório:
   ```bash
   git clone https://github.com/Chavancharinga/Prioriza.git
   cd Prioriza/Code/Prioriza_pasta
   ```

2. Instala as dependências:
   ```bash
   npm install
   ```

3. Configura as variáveis de ambiente:
   - Cria um ficheiro `.env.local` na raiz de `/Prioriza_pasta` e adiciona as tuas credenciais (conferir o ficheiro modelo ou adicionar o standard do Supabase):
   ```env
   VITE_SUPABASE_URL=teu_url_supabase
   VITE_SUPABASE_ANON_KEY=tua_chave_supabase
   ```

4. Executa o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---

## 📚 Documentação e WIKI

O nosso processo criativo foi arduamente documentado para assegurar máxima transparência arquitetural e facilidade para a submissão de código futuro (roadmap).

Para os mergulhos técnicos profundos — incluindo os desafios de *builds CI/CD* que tivemos, o porquê de escolhas arquiteturais específicas, e as funcionalidades de **Inteligência Artificial** (Gemini AI) planeadas para as próximas grandes versões — por favor, consulta o WIKI Oficial focado em Developer Experience:

📄 **[Aceder ao Resumo na Wiki do Projeto (docs/WIKI.md)](docs/WIKI.md)**

---

<p align="center">
  Feito com ☕ e foco.
</p>
