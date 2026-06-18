# Prioriza â€” DocumentaÃ§Ã£o TÃ©cnica Completa

> **Projeto:** Prova de AptidÃ£o Profissional (PAP)
> **Curso:** TÃ©cnico de GestÃ£o e ProgramaÃ§Ã£o de Sistemas InformÃ¡ticos
> **Escola:** Escola TÃ©cnico Profissional de Cantanhede
> **Autor:** Daniel Silva â€” 12Âº TGPSI, NÂº 01
> **Ano Letivo:** 2025/2026
> **Orientadores:** Michael Teixeira, Elisabete Cavaleiro, Teresa Fernandes

---

## Ãndice

1. [VisÃ£o Geral](#1-visÃ£o-geral)
2. [Objetivos](#2-objetivos)
3. [Metodologia de Desenvolvimento](#3-metodologia-de-desenvolvimento)
4. [Recursos Utilizados](#4-recursos-utilizados)
5. [Stack TecnolÃ³gico](#5-stack-tecnolÃ³gico)
6. [Arquitetura do Sistema](#6-arquitetura-do-sistema)
7. [Base de Dados â€” Schema Completo](#7-base-de-dados--schema-completo)
8. [Design System](#8-design-system)
9. [Estrutura de Ficheiros](#9-estrutura-de-ficheiros)
10. [Fluxo de AutenticaÃ§Ã£o](#10-fluxo-de-autenticaÃ§Ã£o)
11. [NavegaÃ§Ã£o e Layout](#11-navegaÃ§Ã£o-e-layout)
12. [Funcionalidades â€” Do InÃ­cio AtÃ© Agora](#12-funcionalidades--do-inÃ­cio-atÃ©-agora)
    - [12.1 GestÃ£o de Tarefas (CRUD)](#121-gestÃ£o-de-tarefas-crud)
    - [12.2 Workspace de Tarefa](#122-workspace-de-tarefa-taskdetailsmodal)
    - [12.3 Bloco de Notas Rich Text](#123-bloco-de-notas-rich-text)
    - [12.4 Checklist](#124-checklist)
    - [12.5 DiÃ¡rio de Bordo](#125-diÃ¡rio-de-bordo)
    - [12.6 Recursos / Links](#126-recursos--links)
    - [12.7 Pomodoro Timer](#127-pomodoro-timer)
    - [12.8 LigaÃ§Ãµes Bidirecionais](#128-ligaÃ§Ãµes-bidirecionais-backlinks)
    - [12.9 Copiloto IA](#129-copiloto-ia)
    - [12.10 VisualizaÃ§Ãµes de Tarefas](#1210-visualizaÃ§Ãµes-de-tarefas)
    - [12.11 Dashboard (Home)](#1211-dashboard-home)
    - [12.12 Cronograma (Planning)](#1212-cronograma-planning)
    - [12.13 AnÃ¡lise (Analytics)](#1213-anÃ¡lise-analytics)
    - [12.14 Perfil / ConfiguraÃ§Ãµes](#1214-perfil--configuraÃ§Ãµes)
13. [Sistema de GamificaÃ§Ã£o](#13-sistema-de-gamificaÃ§Ã£o)
14. [Sistema de Prioridades](#14-sistema-de-prioridades)
15. [SeguranÃ§a e RLS](#15-seguranÃ§a-e-rls)
16. [ServiÃ§os (Services)](#16-serviÃ§os-services)
17. [O Que Falta Implementar](#17-o-que-falta-implementar)

---

## 1. VisÃ£o Geral

O **Prioriza** Ã© uma aplicaÃ§Ã£o web de gestÃ£o de tarefas pessoal com inteligÃªncia artificial integrada, gamificaÃ§Ã£o e ferramentas de produtividade avanÃ§adas. O projeto foi desenvolvido individualmente como Prova de AptidÃ£o Profissional (PAP) do curso de TÃ©cnico de GestÃ£o e ProgramaÃ§Ã£o de Sistemas InformÃ¡ticos.

O Prioriza diferencia-se das aplicaÃ§Ãµes de gestÃ£o de tarefas tradicionais por trÃªs pilares:

1. **Workspace por Tarefa:** Cada tarefa tem o seu prÃ³prio espaÃ§o de trabalho completo â€” editor de texto rico, checklist, diÃ¡rio de bordo, timer Pomodoro e recursos.
2. **Sistema de GamificaÃ§Ã£o:** XP, nÃ­veis, streak diÃ¡rio e penalizaÃ§Ãµes automÃ¡ticas para criar motivaÃ§Ã£o intrÃ­nseca.
3. **4 VisualizaÃ§Ãµes Inteligentes:** Lista, Kanban, Ãrvore (hierarquia de subtarefas) e Matriz de Eisenhower â€” cada uma para uma perspetiva diferente das tarefas.

A aplicaÃ§Ã£o estÃ¡ disponÃ­vel em portuguÃªs, com um tema cinza-claro/ardÃ³sia profissional nativo e design responsivo (desktop + mobile).

---

## 2. Objetivos

### Objetivos Gerais
- Terminar o curso com boa mÃ©dia, demonstrando as competÃªncias tÃ©cnicas adquiridas
- Desenvolver um produto funcional, real e utilizÃ¡vel

### Objetivos EspecÃ­ficos

| Objetivo | DescriÃ§Ã£o |
|----------|-----------|
| ProgramaÃ§Ã£o Web | Aplicar React, Vite e JavaScript moderno num projeto completo |
| Base de Dados | Estruturar e gerir uma BD PostgreSQL no Supabase com RLS |
| UX/UI | Criar uma interface intuitiva, acessÃ­vel e visualmente premium |
| Produto | Colocar a aplicaÃ§Ã£o online para utilizadores reais |
| IA | Integrar sugestÃµes contextuais de inteligÃªncia artificial |
| GamificaÃ§Ã£o | Motivar a conclusÃ£o de tarefas com mecÃ¢nicas de jogo |

---

## 3. Metodologia de Desenvolvimento

Foi utilizada a **metodologia em cascata com retorno** â€” uma variante do modelo clÃ¡ssico que permite recuar a fases anteriores quando surgem correÃ§Ãµes ou novos requisitos.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  FASE 1 â€” DEFINIÃ‡ÃƒO            â”‚
â”‚  â–  Pesquisa bibliogrÃ¡fica      â”‚
â”‚  â–  AnÃ¡lise de requisitos       â”‚
â”‚  â–  Planeamento do projeto      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚  (retorno possÃ­vel)
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  FASE 2 â€” DESENVOLVIMENTO      â”‚
â”‚  â–  Design (wireframes, BD)     â”‚
â”‚  â–  CodificaÃ§Ã£o incremental     â”‚
â”‚  â–  Testes contÃ­nuos            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚  (retorno possÃ­vel)
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  FASE 3 â€” MANUTENÃ‡ÃƒO           â”‚
â”‚  â–  CorreÃ§Ã£o de bugs            â”‚
â”‚  â–  Melhorias de interface      â”‚
â”‚  â–  Novas funcionalidades       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**JustificaÃ§Ã£o:** A metodologia em cascata com retorno foi escolhida por ser adequada para desenvolvimento individual, permitindo progressÃ£o estruturada sem perder flexibilidade para iterar.

---

## 4. Recursos Utilizados

### Hardware

**Acer Nitro V16** â€” portÃ¡til principal de desenvolvimento

| Componente | EspecificaÃ§Ã£o |
|-----------|---------------|
| Processador | Intel Core i7 (14Âª GeraÃ§Ã£o) |
| RAM | 16 GB |
| Armazenamento | SSD 1 TB |
| GPU | NVIDIA GeForce RTX 4060 |
| Sistema Operativo | Windows 11 64 bits |

### Software

| Software | FunÃ§Ã£o |
|---------|--------|
| **Antigravity (IDE + IA)** | IDE principal com assistente de IA integrado |
| **Node.js 20 LTS** | Runtime JavaScript |
| **Git / GitHub** | Controlo de versÃµes e repositÃ³rio remoto |
| **Supabase** | Backend-as-a-Service (BD + Auth + Storage) |
| **Adobe Photoshop CS4** | EdiÃ§Ã£o de imagens e logÃ³tipo |
| **Figma** | Wireframes e protÃ³tipo visual |

---

## 5. Stack TecnolÃ³gico

### Frontend

| Tecnologia | VersÃ£o | Papel |
|-----------|--------|-------|
| **React** | 19 | Framework de UI (componentes, estado, hooks) |
| **Vite** | 7 | Bundler e servidor de desenvolvimento |
| **Tailwind CSS** | 4 | Framework CSS utility-first |
| **Framer Motion** | 11 | AnimaÃ§Ãµes e transiÃ§Ãµes com fÃ­sica (pÃ¡ginas, reordenaÃ§Ã£o e celebraÃ§Ãµes) |
| **Tiptap** | 2 | Editor de texto rico (Rich Text / WYSIWYG) |
| **Lucide React** | latest | Biblioteca de Ã­cones SVG (substitutos premium de emojis unicode) |
| **React Router DOM** | 7 | Roteamento client-side (SPA) |

### Backend / Base de Dados

| Tecnologia | Papel |
|-----------|-------|
| **Supabase** | Backend-as-a-Service: Auth, Database, Storage, REST API |
| **PostgreSQL 17** | Base de dados relacional |
| **Supabase Auth** | AutenticaÃ§Ã£o por email/senha com JWT |
| **Row Level Security** | Isolamento total de dados por utilizador |
| **PostgREST** | API REST automÃ¡tica sobre o PostgreSQL |

---

## 6. Arquitetura do Sistema

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        BROWSER (SPA React)                        â”‚
â”‚                                                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚   Pages    â”‚  â”‚ Components â”‚  â”‚   Services   â”‚  â”‚ Context  â”‚  â”‚
â”‚  â”‚            â”‚  â”‚            â”‚  â”‚              â”‚  â”‚          â”‚  â”‚
â”‚  â”‚ Home       â”‚  â”‚ Sidebar    â”‚  â”‚ TaskService  â”‚  â”‚ Session  â”‚  â”‚
â”‚  â”‚ Tasks      â”‚  â”‚ DashHeader â”‚  â”‚ ProfileSvc   â”‚  â”‚ (JWT)    â”‚  â”‚
â”‚  â”‚ Planning   â”‚  â”‚ TaskModal  â”‚  â”‚ GamifSvc     â”‚  â”‚          â”‚  â”‚
â”‚  â”‚ Analytics  â”‚  â”‚ TaskDetail â”‚  â”‚ ResourceSvc  â”‚  â”‚          â”‚  â”‚
â”‚  â”‚ Auth       â”‚  â”‚ KanbanBoardâ”‚  â”‚              â”‚  â”‚          â”‚  â”‚
â”‚  â”‚ Profile    â”‚  â”‚ TreeView   â”‚  â”‚              â”‚  â”‚          â”‚  â”‚
â”‚  â”‚            â”‚  â”‚ Eisenhower â”‚  â”‚              â”‚  â”‚          â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                â”‚ HTTPS / PostgREST / JWT
                                â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         SUPABASE (Cloud)                          â”‚
â”‚                                                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚   Auth   â”‚  â”‚  PostgREST   â”‚  â”‚        PostgreSQL DB        â”‚  â”‚
â”‚  â”‚ (JWT +   â”‚  â”‚  (REST API   â”‚  â”‚  â–  profiles                â”‚  â”‚
â”‚  â”‚  Session)â”‚  â”‚  automÃ¡tica) â”‚  â”‚  â–  tasks                   â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â–  checklist_items         â”‚  â”‚
â”‚                                  â”‚  â–  task_notes               â”‚  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚  â–  notes                   â”‚  â”‚
â”‚  â”‚   Row Level Security     â”‚    â”‚  â–  resources                â”‚  â”‚
â”‚  â”‚   (cada user vÃª sÃ³ os    â”‚    â”‚  â–  user_preferences         â”‚  â”‚
â”‚  â”‚    seus dados)           â”‚    â”‚  â–  item_relations           â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 7. Base de Dados â€” Schema Completo

### Diagrama de RelaÃ§Ãµes

```
auth.users (Supabase Auth)
    â”‚ 1:1 (trigger on_auth_user_created)
    â–¼
profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ user_preferences
    â”‚
    â”‚ 1:N
    â–¼
tasks â—„â”€â”€â”€ tasks (auto-referÃªncia: parent_id â†’ subtarefas)
    â”‚
    â”œâ”€â”€ 1:N â”€â”€â–º checklist_items   (itens do checklist)
    â”œâ”€â”€ 1:N â”€â”€â–º task_notes        (diÃ¡rio de bordo)
    â”œâ”€â”€ 1:N â”€â”€â–º notes             (notas alternativas)
    â”œâ”€â”€ 1:N â”€â”€â–º resources         (links e recursos)
    â””â”€â”€ N:M â”€â”€â–º item_relations    (ligaÃ§Ãµes bidirecionais)
```

---

### Tabela: `profiles`

Perfil pÃºblico do utilizador, criado automaticamente quando se regista.

| Coluna | Tipo | ObrigatÃ³rio | Default | DescriÃ§Ã£o |
|--------|------|:-----------:|---------|-----------|
| `id` | `uuid` | âœ… | â€” | PK, igual ao `auth.users.id` |
| `username` | `text` | âŒ | â€” | Nome de utilizador Ãºnico |
| `full_name` | `text` | âŒ | â€” | Nome completo |
| `avatar_url` | `text` | âŒ | â€” | URL da foto de perfil |
| `preferÃªncias` | `jsonb` | âŒ | `{}` | ConfiguraÃ§Ãµes e preferÃªncias (JSON) |
| `xp` | `integer` | âŒ | `0` | Pontos de experiÃªncia acumulados |
| `level` | `integer` | âŒ | `1` | NÃ­vel atual (1-10) |
| `streak` | `integer` | âŒ | `0` | Dias consecutivos com atividade |
| `last_activity_date` | `date` | âŒ | â€” | Ãšltima data de atividade (streak) |
| `updated_at` | `timestamptz` | âŒ | â€” | Ãšltima atualizaÃ§Ã£o |

---

### Tabela: `tasks`

Tabela central. Suporta tarefas e subtarefas na mesma estrutura via `parent_id`.

| Coluna | Tipo | ObrigatÃ³rio | Default | DescriÃ§Ã£o |
|--------|------|:-----------:|---------|-----------|
| `id` | `uuid` | âœ… | `gen_random_uuid()` | Identificador Ãºnico |
| `user_id` | `uuid` | âœ… | â€” | FK â†’ `profiles.id` |
| `title` | `text` | âœ… | â€” | TÃ­tulo da tarefa |
| `description` | `text` | âŒ | â€” | DescriÃ§Ã£o em **HTML** (rich text) |
| `priority` | `integer` | âŒ | â€” | 1=CrÃ­tica, 2=Alta, 3=MÃ©dia, 4=Baixa, 5=MÃ­nima |
| `status` | `text` | âŒ | `'A Fazer'` | `'A Fazer'` / `'Em Progresso'` / `'Feito'` |
| `due_date` | `timestamptz` | âŒ | â€” | Prazo de entrega |
| `reminder` | `timestamptz` | âŒ | â€” | Data/hora de lembrete |
| `progress` | `integer` | âŒ | `0` | Progresso em % (0-100) |
| `parent_id` | `uuid` | âŒ | â€” | FK â†’ `tasks.id` (auto-referÃªncia para subtarefas) |
| `is_ai_generated` | `boolean` | âŒ | `false` | Criada pela IA |
| `estimated_minutes` | `integer` | âŒ | â€” | Tempo estimado em minutos |
| `time_spent` | `integer` | âŒ | `0` | Tempo gasto em **segundos** |
| `timer_started_at` | `timestamptz` | âŒ | â€” | Timestamp de inÃ­cio do timer ativo |
| `completed_at` | `timestamptz` | âŒ | â€” | Data/hora de conclusÃ£o |
| `overdue_penalized` | `boolean` | âŒ | `false` | PenalizaÃ§Ã£o de atraso jÃ¡ aplicada? |
| `created_at` | `timestamptz` | âŒ | `NOW()` | Data de criaÃ§Ã£o |

---

### Tabela: `checklist_items`

Itens do checklist de cada tarefa. A barra de progresso da tarefa Ã© calculada com base nestes itens.

| Coluna | Tipo | ObrigatÃ³rio | Default | DescriÃ§Ã£o |
|--------|------|:-----------:|---------|-----------|
| `id` | `uuid` | âœ… | `gen_random_uuid()` | Identificador Ãºnico |
| `task_id` | `uuid` | âœ… | â€” | FK â†’ `tasks.id` |
| `user_id` | `uuid` | âœ… | `auth.uid()` | FK â†’ `profiles.id` |
| `content` | `text` | âœ… | â€” | Texto do item |
| `is_completed` | `boolean` | âŒ | `false` | Item concluÃ­do? |
| `position` | `integer` | âŒ | `0` | Ordem de exibiÃ§Ã£o |
| `created_at` | `timestamptz` | âœ… | `NOW()` | Data de criaÃ§Ã£o |

---

### Tabela: `task_notes`

DiÃ¡rio de bordo por tarefa â€” notas cronolÃ³gicas com suporte a ligaÃ§Ãµes bidirecionais `[[TÃ­tulo]]`.

| Coluna | Tipo | ObrigatÃ³rio | Default | DescriÃ§Ã£o |
|--------|------|:-----------:|---------|-----------|
| `id` | `uuid` | âœ… | `gen_random_uuid()` | Identificador Ãºnico |
| `task_id` | `uuid` | âœ… | â€” | FK â†’ `tasks.id` |
| `user_id` | `uuid` | âœ… | `auth.uid()` | FK â†’ `profiles.id` |
| `content` | `text` | âœ… | â€” | ConteÃºdo da nota (texto livre) |
| `created_at` | `timestamptz` | âœ… | `NOW()` | Data/hora de criaÃ§Ã£o |

---

### Tabela: `notes`

Sistema alternativo de notas (histÃ³rico cronolÃ³gico simples).

| Coluna | Tipo | ObrigatÃ³rio | DescriÃ§Ã£o |
|--------|------|:-----------:|-----------|
| `id` | `uuid` | âœ… | Identificador Ãºnico |
| `task_id` | `uuid` | âœ… | FK â†’ `tasks.id` |
| `content` | `text` | âœ… | Texto da nota |
| `created_at` | `timestamptz` | âŒ | Data de criaÃ§Ã£o |

---

### Tabela: `resources`

Links e materiais de referÃªncia associados a cada tarefa.

| Coluna | Tipo | ObrigatÃ³rio | DescriÃ§Ã£o |
|--------|------|:-----------:|-----------|
| `id` | `uuid` | âœ… | Identificador Ãºnico |
| `task_id` | `uuid` | âœ… | FK â†’ `tasks.id` |
| `url` | `text` | âœ… | URL do recurso |
| `title` | `text` | âŒ | TÃ­tulo descritivo |
| `created_at` | `timestamptz` | âŒ | Data de criaÃ§Ã£o |

---

### Tabela: `item_relations`

RelaÃ§Ãµes bidirecionais entre tarefas (sistema de backlinks, criado via sintaxe `[[TÃ­tulo]]`).

| Coluna | Tipo | DescriÃ§Ã£o |
|--------|------|-----------|
| `origin_id` | `uuid` | Tarefa de origem |
| `target_id` | `uuid` | Tarefa de destino |
| `relation_type` | `text` | Tipo de relaÃ§Ã£o (ex: `'link'`) |

---

### Tabela: `pomodoro_sessions`

Registo de cada sessÃ£o Pomodoro concluÃ­da pelo utilizador.

| Coluna | Tipo | ObrigatÃ³rio | Default | DescriÃ§Ã£o |
|--------|------|:-----------:|---------|-----------|
| `id` | `uuid` | âœ… | `gen_random_uuid()` | Identificador Ãºnico (PK) |
| `user_id` | `uuid` | âœ… | â€” | FK â†’ `profiles.id` |
| `task_id` | `uuid` | âœ… | â€” | FK â†’ `tasks.id` |
| `duration_seconds` | `integer` | âœ… | â€” | DuraÃ§Ã£o da sessÃ£o em segundos |
| `completed_at` | `timestamptz` | âœ… | `NOW()` | Data/hora de conclusÃ£o da sessÃ£o |

---

### Tabela: `user_preferences`

ConfiguraÃ§Ãµes detalhadas de notificaÃ§Ãµes e comportamento por utilizador.

| Coluna | Tipo | Default | DescriÃ§Ã£o |
|--------|------|---------|-----------|
| `id` | `uuid` | `gen_random_uuid()` | Identificador Ãºnico |
| `email_notifications` | `boolean` | `true` | NotificaÃ§Ãµes por email ativas |
| `app_notifications` | `boolean` | `true` | NotificaÃ§Ãµes na app ativas |
| `quiet_hours_start` | `time` | `22:00` | InÃ­cio de horas silenciosas |
| `quiet_hours_end` | `time` | `07:00` | Fim de horas silenciosas |
| `offline_mode` | `boolean` | `false` | Modo offline |
| `minimal_animations` | `boolean` | `true` | AnimaÃ§Ãµes reduzidas |
| `created_at` | `timestamptz` | `NOW()` | Data de criaÃ§Ã£o |

---

### Trigger: CriaÃ§Ã£o AutomÃ¡tica de Perfil

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 8. Design System

O Prioriza tem um design system prÃ³prio definido em `src/index.css`, implementado com CSS Custom Properties e Tailwind CSS 4.

### Paleta de Cores

#### Cores da Marca

| Nome | Valor Hex | Uso |
|------|-----------|-----|
| `--color-prioriza-navy` | `#0A1128` | Azul marinho escuro principal (texto da logo) |
| `--color-prioriza-blue` | `#2563EB` | Azul primÃ¡rio (botÃµes, links, foco - checkmark da logo) |
| `--color-prioriza-coral` | `#F43F5E` | Destaque vermelho-coral (ponto da logo) |
| `--color-prioriza-orange` | `#F97316` | Destaque laranja (ponto da logo) |
| `--color-prioriza-cyan` | `#06B6D4` | Destaque ciano (ponto da logo) |

#### SuperfÃ­cies do Tema Ãšnico (Cinza-ArdÃ³sia Profissional)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-surface` | `#E2E8F0` | Fundo geral da pÃ¡gina (cinza-mÃ©dio/claro profissional) |
| `--color-surface-card` | `#FFFFFF` | Fundo de cards e modais (branco para contraste ideal) |
| `--color-surface-elevated` | `#F8FAFC` | Fundo de elementos e tabelas secundÃ¡rias |
| `--color-border` | `#CBD5E1` | Bordas gerais nÃ­tidas |
| `--color-border-light` | `#E2E8F0` | Linhas divisÃ³rias e bordas subtis |

#### Texto

| Token | Valor Hex | Uso |
|-------|-----------|-----|
| `--color-text-primary` | `#0A1128` | Texto principal (navy escuro legÃ­vel) |
| `--color-text-secondary` | `#334155` | Texto secundÃ¡rio (ardÃ³sia escuro) |
| `--color-text-muted` | `#64748B` | Texto desvanecido ou legenda |

### Tipografia

| Propriedade | Valor |
|------------|-------|
| **FamÃ­lia** | `Inter`, -apple-system, Segoe UI, sans-serif |
| **Tamanho base** | `16px` |
| **Peso base** | `400` (Regular) |
| **Line-height** | `1.5` |
| **SuavizaÃ§Ã£o** | `-webkit-font-smoothing: antialiased` |

### Componentes UI

| Componente | Ficheiro | DescriÃ§Ã£o |
|-----------|---------|-----------|
| `Button` | `ui/Button.jsx` | BotÃ£o com variantes `primary`, `secondary`, `danger`, `ghost` |
| `Card` | `ui/Card.jsx` | ContÃªiner com sombra e bordas arredondadas |
| `Modal` | `ui/ConfirmationModal.jsx` | Modal de confirmaÃ§Ã£o com tipos `info`, `success`, `danger` |
| `EmptyState` | `ui/EmptyState.jsx` | Estado vazio com Ã­cone e mensagem |
| `ErrorState` | `ui/ErrorState.jsx` | Estado de erro com mensagem e aÃ§Ã£o de retry |
| `Toast` | `ui/Toast.jsx` | NotificaÃ§Ãµes temporÃ¡rias |
| `RichTextEditor` | `ui/RichTextEditor.jsx` | Editor Tiptap completo com toolbar |

### AnimaÃ§Ãµes e TransiÃ§Ãµes

Todas as animaÃ§Ãµes dinÃ¢micas sÃ£o implementadas com **Framer Motion** e CSS customizado para garantir uma experiÃªncia interativa sem lags:

| AnimaÃ§Ã£o / TransiÃ§Ã£o | ImplementaÃ§Ã£o | Uso |
|----------------------|----------------|-----|
| **Slide & Fade** | Framer Motion `<AnimatePresence>` | TransiÃ§Ãµes horizontais suaves ao navegar entre as pÃ¡ginas principais |
| **Spring Reorder** | Framer Motion `<motion.div layout>` | ReordenaÃ§Ã£o elÃ¡stica e fluida de itens de listas |
| **Celebration Overlays** | Framer Motion (Confetti & Sunburst) | Modal com halo de brilho, sunburst SVG giratÃ³rio, trofÃ©u elÃ¡stico e 20 partÃ­culas dinÃ¢micas |
| **Hover Scale & Feedback** | Framer Motion | InteraÃ§Ã£o elÃ¡stica ao passar o cursor sobre botÃµes, cards do Kanban e menus |
| **Custom Keyframe Rotation** | CSS `@keyframes prioriza-rotation` | Carregamento contÃ­nuo do spinner sem travar, ignorando restriÃ§Ãµes de Reduced Motion |
| **Flashes & Pulsos** | Framer Motion / CSS Pulse | Indicador animado do streak diÃ¡rio e badges |
| **Skeleton Shimmer** | Gradiente linear CSS + `@keyframes skeleton-shimmer` | Efeito de brilho e pulsaÃ§Ã£o cinza translÃºcido ao carregar a sessÃ£o ou transitar entre abas |

> **Nota de Design (ExclusÃ£o de Emojis):** Para manter a estÃ©tica premium e profissional da aplicaÃ§Ã£o, a utilizaÃ§Ã£o de emojis unicode no design da UI foi descontinuada, sendo totalmente substituÃ­dos por grÃ¡ficos vetoriais nativos e Ã­cones da biblioteca **Lucide React**.

### Tema Unificado Cinza-ArdÃ³sia

O Prioriza adota um tema Ãºnico cinza-ardÃ³sia profissional de mÃ©dio-contraste, removendo a alternÃ¢ncia de modos claro/escuro. A interface utiliza superfÃ­cies de cartÃ£o branco (`#FFFFFF`) sobre o fundo cinza-ardÃ³sia (`#E2E8F0`), o que proporciona um contraste excelente e confortÃ¡vel sem cansar a vista.

O editor Tiptap (rich text) utiliza as variÃ¡veis de cores globais diretamente a partir de `index.css` para garantir consistÃªncia de visualizaÃ§Ã£o em toda a aplicaÃ§Ã£o.

---

## 9. Estrutura de Ficheiros

```
Prioriza/
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ PRIORIZA_DOCUMENTACAO_COMPLETA.md    â† Este ficheiro
â”‚   â”œâ”€â”€ ANALISE_COMPLETA.md
â”‚   â”œâ”€â”€ FUNCIONALIDADES_PENDENTES.md
â”‚   â”œâ”€â”€ PONTOS_CEGOS.md
â”‚   â””â”€â”€ pap.pdf
â”œâ”€â”€ img/
â”‚   â””â”€â”€ (logÃ³tipos)
â””â”€â”€ Code/
    â””â”€â”€ Prioriza_pasta/
        â”œâ”€â”€ public/
        â”‚   â””â”€â”€ logo.png
        â”œâ”€â”€ src/
        â”‚   â”œâ”€â”€ App.jsx                    â† Roteamento, sessÃ£o, layout principal
        â”‚   â”œâ”€â”€ main.jsx                   â† Entry point React
        â”‚   â”œâ”€â”€ index.css                  â† Design system + CSS variables
        â”‚   â”‚
        â”‚   â”œâ”€â”€ lib/
        â”‚   â”‚   â””â”€â”€ supabase.js            â† Cliente Supabase inicializado
        â”‚   â”‚
        â”‚   â”œâ”€â”€ services/
        â”‚   â”‚   â”œâ”€â”€ TaskService.js         â† CRUD de tarefas e todos os sub-recursos
        â”‚   â”‚   â”œâ”€â”€ GamificationService.js â† XP, nÃ­vel, streak, penalizaÃ§Ãµes
        â”‚   â”‚   â”œâ”€â”€ ProfileService.js      â† Perfil e avatar
        â”‚   â”‚   â””â”€â”€ ResourceService.js     â† Links/recursos de tarefas
        â”‚   â”‚
        â”‚   â”œâ”€â”€ components/
        â”‚   â”‚   â”œâ”€â”€ layout/
        â”‚   â”‚   â”‚   â”œâ”€â”€ Sidebar.jsx        â† NavegaÃ§Ã£o lateral (Ã­cones + tooltips)
        â”‚   â”‚   â”‚   â”œâ”€â”€ DashboardHeader.jsxâ† Header: saudaÃ§Ã£o, gamificaÃ§Ã£o, avatar
        â”‚   â”‚   â”‚   â”œâ”€â”€ TopBar.jsx         â† Barra superior alternativa (mobile)
        â”‚   â”‚   â”‚   â”œâ”€â”€ BottomNav.jsx      â† NavegaÃ§Ã£o inferior (mobile)
        â”‚   â”‚   â”‚   â””â”€â”€ Fab.jsx            â† Floating Action Button
        â”‚   â”‚   â”‚
        â”‚   â”‚   â”œâ”€â”€ tasks/
        â”‚   â”‚   â”‚   â”œâ”€â”€ TaskModal.jsx      â† Modal criar/editar tarefa
        â”‚   â”‚   â”‚   â”œâ”€â”€ TaskDetailsModal.jsxâ† WORKSPACE completo (1219 linhas)
        â”‚   â”‚   â”‚   â”œâ”€â”€ TaskList.jsx       â† Vista em lista com barra colorida
        â”‚   â”‚   â”‚   â”œâ”€â”€ KanbanBoard.jsx    â† Vista Kanban 3 colunas
        â”‚   â”‚   â”‚   â”œâ”€â”€ TreeView.jsx       â† Vista em Ã¡rvore hierÃ¡rquica
        â”‚   â”‚   â”‚   â”œâ”€â”€ EisenhowerMatrix.jsxâ† Matriz Urgente/Importante
        â”‚   â”‚   â”‚   â””â”€â”€ ResourceCards.jsx  â† Cards de links/recursos
        â”‚   â”‚   â”‚
        â”‚   â”‚   â”œâ”€â”€ ui/
        â”‚   â”‚   â”‚   â”œâ”€â”€ Button.jsx
        â”‚   â”‚   â”‚   â”œâ”€â”€ Card.jsx
        â”‚   â”‚   â”‚   â”œâ”€â”€ ConfirmationModal.jsx
        â”‚   â”‚   â”‚   â”œâ”€â”€ EmptyState.jsx
        â”‚   â”‚   â”‚   â”œâ”€â”€ ErrorState.jsx
        â”‚   â”‚   â”‚   â”œâ”€â”€ RichTextEditor.jsx â† Tiptap editor com toolbar
        â”‚   â”‚   â”‚   â””â”€â”€ Toast.jsx
        â”‚   â”‚   â”‚
        â”‚   â”‚   â”œâ”€â”€ dashboard/
        â”‚   â”‚   â”‚   â””â”€â”€ Profile.jsx        â† PÃ¡gina de perfil e configuraÃ§Ãµes
        â”‚   â”‚   â”‚
        â”‚   â”‚   â””â”€â”€ common/
        â”‚   â”‚       â””â”€â”€ (componentes partilhados)
        â”‚   â”‚
        â”‚   â””â”€â”€ pages/
        â”‚       â”œâ”€â”€ Auth.jsx               â† Login + Registo
        â”‚       â”œâ”€â”€ Home.jsx               â† Dashboard principal
        â”‚       â”œâ”€â”€ Tasks.jsx              â† GestÃ£o de tarefas (4 views)
        â”‚       â”œâ”€â”€ Planning.jsx           â† CalendÃ¡rio (mÃªs/semana/dia)
        â”‚       â””â”€â”€ Analytics.jsx          â† AnÃ¡lise e estatÃ­sticas
        â”‚
        â”œâ”€â”€ index.html
        â”œâ”€â”€ vite.config.js
        â”œâ”€â”€ tailwind.config.js
        â””â”€â”€ package.json
```

---

## 10. Fluxo de AutenticaÃ§Ã£o

```
1. Utilizador acede a qualquer URL da app
        â”‚
        â–¼
2. App.jsx verifica sessÃ£o Supabase
   supabase.auth.getSession()
        â”‚
   â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”
   â”‚         â”‚
   â–¼         â–¼
SessÃ£o    Sem sessÃ£o
vÃ¡lida         â”‚
   â”‚           â–¼
   â”‚      Renderiza <Auth />
   â”‚      (Login / Registo)
   â”‚
   â–¼
3. Carrega perfil: ProfileService.getProfile()
   Verifica penalizaÃ§Ãµes: GamificationService.checkOverdueTasksAndPenalize()
        â”‚
        â–¼
4. Renderiza layout completo
   (Sidebar + DashboardHeader + PÃ¡gina ativa)
        â”‚
        â–¼
5. Listeners ativos:
   - 'xp-updated' â†’ recarrega perfil
   - 'tasks-overdue-penalty' â†’ alerta + recarrega perfil
   - onAuthStateChange â†’ atualiza sessÃ£o em tempo real
```

**JWT e SeguranÃ§a:**
- Tokens JWT geridos automaticamente pelo Supabase
- RenovaÃ§Ã£o automÃ¡tica de tokens
- Logout invalida a sessÃ£o no servidor

---

## 11. NavegaÃ§Ã£o e Layout

### Sidebar (`Sidebar.jsx`)

Barra lateral fixa com 80px de largura em desktop. Em mobile, aparece como drawer com overlay escuro.

| Item | ID | Ãcone |
|------|----|----|
| InÃ­cio | `dashboard` | LayoutDashboard |
| Tarefas | `tasks` | ListTodo |
| Planeamento | `planning` | Calendar |
| AnÃ¡lise | `analytics` | BarChart3 |
| Perfil | `profile` | User |

- Tooltip com o nome do item ao hover (desktop)
- Indicador ativo: linha azul Ã  esquerda + Ã­cone azul
- Fundo `--color-surface-card` em harmonia com o tema Ãºnico cinza-ardÃ³sia

### Dashboard Header (`DashboardHeader.jsx`)

Header superior com:
- **Mobile:** Logo da app
- **Desktop (direita):** SaudaÃ§Ã£o contextual (Bom dia/Boa tarde/Boa noite) + nome do utilizador
- **Widget de GamificaÃ§Ã£o:** Streak (chama animada), NÃ­vel, Barra de XP (0â€“1000), Badge "ðŸ–ï¸ Folga" (nÃ­vel 10)
- **Avatar:** Foto de perfil ou inicial do nome; clique navega para perfil
- **Breadcrumb:** Hierarquia de pÃ¡ginas abaixo do tÃ­tulo
- **TÃ­tulo da pÃ¡gina:** H1 grande e em negrito

---

## 12. Funcionalidades â€” Do InÃ­cio AtÃ© Agora

### 12.1 GestÃ£o de Tarefas (CRUD)

**Modal de criaÃ§Ã£o/ediÃ§Ã£o (`TaskModal.jsx`):**

| Campo | Tipo | DescriÃ§Ã£o |
|-------|------|-----------|
| TÃ­tulo | `text` | ObrigatÃ³rio |
| DescriÃ§Ã£o | `text` | Opcional |
| Prioridade | `select 1-5` | Com cores e labels |
| Estado | `select` | A Fazer / Em Progresso / Feito |
| Prazo | `datetime-local` | Opcional |
| Lembrete | `datetime-local` | Opcional |
| Tempo estimado | `number` (minutos) | Opcional |

**AÃ§Ãµes disponÃ­veis:**

| AÃ§Ã£o | DescriÃ§Ã£o |
|------|-----------|
| Criar | Via modal em qualquer pÃ¡gina |
| Editar | Reabre o modal com dados preenchidos |
| Eliminar | Com modal de confirmaÃ§Ã£o (tipo `danger`) |
| Concluir | Marca como `Feito` + dispara XP |
| Reativar | Volta ao estado `A Fazer` |
| Mudar estado | Kanban drag conceptual via click |

---

### 12.2 Workspace de Tarefa (`TaskDetailsModal.jsx`)

O workspace Ã© o coraÃ§Ã£o da aplicaÃ§Ã£o. Ã‰ um modal full-screen otimizado que se abre ao clicar em qualquer tarefa, maximizando a Ã¡rea de trabalho para evitar espaÃ§os vazios e subaproveitados.

**OtimizaÃ§Ã£o do EspaÃ§o de Trabalho:**
- **Largura MÃ¡xima Expandida:** Limite estendido para `max-w-[1600px]` para aproveitar ecrÃ£s grandes de forma harmoniosa.
- **DistribuiÃ§Ã£o de Colunas Rebalanceada (`grid-cols-12`):**
  - **Coluna de Metadados (`lg:col-span-3`):** Painel lateral focado em status, datas de entrega, estimativas e tempos decorridos.
  - **Coluna Central (`lg:col-span-5`):** Foco no Bloco de Notas de texto rico (Tiptap) e painel do Copiloto IA.
  - **Coluna Direita (`lg:col-span-4`):** Painel de widgets complementares contendo Pomodoro Timer, Checklist, DiÃ¡rio de Bordo e Recursos/Links.

**Estrutura Visual:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  â† VOLTAR           [TÃ­tulo da Tarefa]               [SALVAR] [CONCLUIR]â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  METADADOS    â”‚      COLUNA CENTRAL           â”‚     COLUNA DIREITA     â”‚
â”‚               â”‚                               â”‚                        â”‚
â”‚  [Prioridade] â”‚   â–  Bloco de Notas Rich Text  â”‚   â–  Pomodoro Timer     â”‚
â”‚  [Status]     â”‚     (Altura Fixa h-[400px])   â”‚   â–  Checklist          â”‚
â”‚  [Prazo]      â”‚                               â”‚     (Altura h-[380px]) â”‚
â”‚  [Estimado]   â”‚   â–  Copiloto IA               â”‚   â–  DiÃ¡rio de Bordo    â”‚
â”‚  [Tempo Gasto]â”‚                               â”‚   â–  Recursos / Links   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**AÃ§Ãµes e InteraÃ§Ãµes:**
- **Salvar:** Salva todas as ediÃ§Ãµes no banco de dados de forma assÃ­ncrona e imediata, exibindo uma notificaÃ§Ã£o visual tipo **Toast ("Progresso Salvo")** flutuante no canto inferior direito, com animaÃ§Ã£o elÃ¡stica de entrada.
- **Concluir / Ativar:** Alterna o estado da tarefa. ContÃ©m uma validaÃ§Ã£o estrita baseada nos itens do checklist.

---

### 12.3 Bloco de Notas Rich Text

Powered by **Tiptap v2** com extensÃµes customizadas.

**Estrutura FÃ­sica e UX:**
- **Altura Fixa (`h-[400px]`):** Organizado em layout `flex-col` para garantir integridade estÃ©tica da pÃ¡gina.
- **Rolagem Interna (`overflow-y-auto`):** Textos muito longos nÃ£o quebram a interface, mantendo a Ã¡rea de ediÃ§Ã£o limpa e rolada apenas internamente.

**Barra de ferramentas:**

| Ferramenta | Atalho | DescriÃ§Ã£o |
|-----------|--------|-----------|
| **B** (Negrito) | `Ctrl+B` | Texto em negrito |
| *I* (ItÃ¡lico) | `Ctrl+I` | Texto em itÃ¡lico |
| ~~S~~ (Rasurado) | â€” | Texto rasurado |
| H1 | â€” | TÃ­tulo grande (inline, custom Mark) |
| H2 | â€” | TÃ­tulo mÃ©dio (inline, custom Mark) |
| Lista â€¢ | â€” | Lista com marcadores |
| Lista 1. | â€” | Lista numerada |
| CitaÃ§Ã£o | â€” | Bloco de citaÃ§Ã£o |
| ðŸ– Marca-texto | â€” | 5 cores disponÃ­veis: amarelo, verde, azul, rosa, cinzento |
| â†© Desfazer | `Ctrl+Z` | Desfazer Ãºltima aÃ§Ã£o |
| â†ª Refazer | `Ctrl+Y` | Refazer aÃ§Ã£o desfeita |

**Barra de estado (rodapÃ©):**
- Contagem de palavras e caracteres em tempo real
- Estimativa de tempo de leitura (`~X min leitura`, sÃ³ aparece a partir de 10 palavras)

**Design e Legibilidade:** Estilos especÃ­ficos em CSS para o editor `ProseMirror` â€” negrito, itÃ¡lico, tÃ­tulos e placeholders com cores corretas e integradas com o tema Ãºnico.

---

### 12.4 Checklist

Lista de subtarefas com progresso visual e validaÃ§Ã£o de consistÃªncia.

**Layout e Usabilidade:**
- **Altura Fixa Limitada (`h-[380px]`):** Container estruturado com flexbox para manter alinhamento estrito no ecrÃ£.
- **CabeÃ§alho Fixo (Sticky Header):** Exibe a barra de progresso calculada `(itens_concluÃ­dos / total) Ã— 100` e o contador de itens concluÃ­dos.
- **Lista RolÃ¡vel (`overflow-y-auto`):** Centraliza os itens do checklist em scroll interno.
- **FormulÃ¡rio de Entrada Fixo (Sticky Bottom):** O campo de inserÃ§Ã£o de itens permanece estÃ¡tico na base do widget para fÃ¡cil alcance.

| Funcionalidade | DescriÃ§Ã£o |
|---------------|-----------|
| Adicionar item | Campo de texto fixo na base + botÃ£o "+" |
| Marcar/desmarcar | Checkbox com animaÃ§Ã£o elÃ¡stica e somatÃ³rio em tempo real |
| Eliminar item | BotÃ£o "Ã—" de remoÃ§Ã£o rÃ¡pida ao pairar |
| Barra de progresso | Percentagem calculada dinamicamente |
| Contador | Indicador descritivo "X de Y concluÃ­dos" |

**Regra de ConclusÃ£o de Tarefa (ValidaÃ§Ã£o Estrita):**
NÃ£o Ã© permitida a conclusÃ£o de tarefas com itens pendentes no checklist. Se o utilizador tentar concluir uma tarefa contendo itens inacabados:
- O XP atribuÃ­do serÃ¡ reduzido a **0 XP** (removendo o incentivo gamificado por conclusÃ£o fraudulenta).
- Ã‰ exibido um aviso em banner vermelho no topo da barra de metadados do Workspace ou nos diÃ¡logos do Kanban avisando que existem tarefas inacabadas pendentes.

**Base de dados:** `checklist_items` (com `user_id`, `task_id`, `content`, `is_completed`, `position`)

---

### 12.5 DiÃ¡rio de Bordo

Notas cronolÃ³gicas associadas Ã  tarefa. Cada entrada tem timestamp de criaÃ§Ã£o.

| Funcionalidade | DescriÃ§Ã£o |
|---------------|-----------|
| Adicionar nota | Textarea + botÃ£o "Enviar" |
| Listagem | Ordem cronolÃ³gica reversa (mais recente primeiro) |
| Timestamp | Data e hora de cada entrada |
| Eliminar nota | Via `TaskService.deleteNote()` |

**Suporte a LigaÃ§Ãµes Bidirecionais:** O sistema deteta padrÃµes `[[TÃ­tulo da Tarefa]]` nas notas e cria automaticamente relaÃ§Ãµes na tabela `item_relations`.

---

### 12.6 Recursos / Links

Links e materiais de estudo associados Ã  tarefa.

| Funcionalidade | DescriÃ§Ã£o |
|---------------|-----------|
| Adicionar recurso | URL + tÃ­tulo opcional |
| Listar recursos | Cards com tÃ­tulo e URL |
| Eliminar recurso | BotÃ£o de remoÃ§Ã£o |
| Abrir link | Abre em nova aba |

**Componente:** `ResourceCards.jsx`

---

### 12.7 Pomodoro Timer

Timer de foco integrado no workspace, seguindo a tÃ©cnica Pomodoro.

| ConfiguraÃ§Ã£o | Valor |
|-------------|-------|
| SessÃ£o de foco | **25 minutos** (1500 segundos) |
| Pausa curta | **5 minutos** (300 segundos) |
| XP por sessÃ£o de foco | **+50 XP** |
| Registo | `tasks.time_spent` (segundos acumulados) |
| Log de sessÃµes | Tabela `pomodoro_sessions` |

**Fluxo:**
1. Utilizador clica "â–¶ Iniciar" â†’ timer de 25 min comeÃ§a
2. Ao completar: modal de confirmaÃ§Ã£o "Ã“timo trabalho! Hora de intervalo."
3. +50 XP atribuÃ­dos; `tasks.time_spent` atualizado
4. Se level up: modal de celebraÃ§Ã£o "âœ¨ SUBIU DE NÃVEL! âœ¨"
5. Timer de pausa de 5 min
6. Ao completar pausa: convite a novo ciclo de foco
7. Ciclos completados sÃ£o contados na sessÃ£o

**Stopwatch paralelo:** Enquanto o Pomodoro estÃ¡ ativo em modo foco, um cronÃ³metro interno conta `sessionTimeSpent` em segundos. Este valor Ã© guardado ao fechar o workspace ou ao clicar Salvar.

---

### 12.8 LigaÃ§Ãµes Bidirecionais (Backlinks)

Sistema inspirado em ferramentas como Obsidian ou Roam Research.

**Como funciona:**
1. Nas notas do DiÃ¡rio de Bordo, usa-se `[[TÃ­tulo da Tarefa]]`
2. O `TaskService.createNote()` deteta padrÃµes `[[...]]` com regex
3. Procura a tarefa com esse tÃ­tulo na base de dados do utilizador
4. Cria uma entrada em `item_relations` com `origin_id` e `target_id`

**No workspace:**
- **LigaÃ§Ãµes de Entrada (Backlinks):** "Outras tarefas que referenciam esta"
- **LigaÃ§Ãµes de SaÃ­da:** "Tarefas que esta referencia"
- Clicar num backlink navega para essa tarefa (carrega novo `taskId` no mesmo modal)

**SugestÃµes automÃ¡ticas:** Ao escrever `[[` na nota, surge uma lista de sugestÃµes de tarefas.

---

### 12.9 Copiloto IA

Painel de sugestÃµes contextuais integrado no workspace.

| Funcionalidade | DescriÃ§Ã£o |
|---------------|-----------|
| AnÃ¡lise do contexto | Considera tÃ­tulo, prioridade, prazo, progresso e checklist |
| SugestÃµes geradas | Items para o checklist, abordagens, prÃ³ximos passos |
| IntegraÃ§Ã£o com checklist | SugestÃµes podem ser adicionadas diretamente ao checklist |

**Estados:**
- `aiLoading`: spinner enquanto gera sugestÃµes
- `aiResponse`: resposta formatada exibida no painel

---

### 12.10 VisualizaÃ§Ãµes de Tarefas

PÃ¡gina `Tasks.jsx` com 4 modos de visualizaÃ§Ã£o, selecionÃ¡veis por tabs.

#### Vista Lista (`TaskList.jsx`)

- Cada tarefa: card com barra colorida Ã  esquerda (cor = prioridade)
- InformaÃ§Ã£o exibida: tÃ­tulo, estado, prazo, tempo estimado
- AÃ§Ãµes rÃ¡pidas: editar, eliminar
- Click abre o workspace completo

| Prioridade | Cor da Barra |
|-----------|-------------|
| CrÃ­tica (1) | rose-50 (border-l-critical) |
| Alta (2) | red-50 (border-l-high) |
| MÃ©dia (3) | orange-50 (border-l-medium) |
| Baixa (4) | yellow-50 (border-l-low) |
| MÃ­nima (5) | blue-50 (border-l-minimal) |

#### Vista Kanban (`KanbanBoard.jsx`)

3 colunas: **A Fazer** | **Em Progresso** | **Feito**

- Cada cartÃ£o: tÃ­tulo, badge de prioridade colorido, prazo, barra de progresso
- Badge de atraso quando `due_date < now`
- Click abre workspace
- Contador de tarefas por coluna

#### Vista Ãrvore (`TreeView.jsx`)

- Hierarquia pai â†’ filhos expandÃ­vel
- Ãcone de seta para expandir/colapsar
- Badge `P1`â€“`P5` com cor de prioridade
- IndentaÃ§Ã£o visual por nÃ­vel
- Click abre workspace

#### Matriz de Eisenhower (`EisenhowerMatrix.jsx`)

Classifica automaticamente as tarefas em 4 quadrantes com base em prioridade e prazo:

| Quadrante | CritÃ©rio | Cor |
|----------|---------|-----|
| **FAZER JÃ** | Urgente + Importante (P1-P2, prazo â‰¤48h) | Vermelho |
| **AGENDAR** | Importante, sem pressa (P1-P2, prazo >48h) | Ã‚mbar |
| **DELEGAR** | Urgente, pouca importÃ¢ncia (P3-P5, prazo â‰¤48h) | Azul |
| **ELIMINAR** | Nem urgente nem importante | Cinzento |

**Regras de classificaÃ§Ã£o:**
- "Urgente" = prazo dentro de 48h OU tarefa "Em Progresso"
- "Importante" = prioridade 1 ou 2
- Tarefas concluÃ­das nÃ£o aparecem
- OrdenaÃ§Ã£o dentro de cada quadrante: prioridade â†’ prazo

---

### 12.11 Dashboard (Home)

PÃ¡gina inicial com visÃ£o geral rÃ¡pida.

| Widget | DescriÃ§Ã£o |
|--------|-----------|
| **PrÃ³ximas Entregas** | Barra de progresso por tarefa, ordenada por prazo (mÃ¡x. 5) |
| **Mini Kanban** | Preview das 3 colunas com atÃ© 3 tarefas cada |
| **VisÃ£o Geral** | Total de tarefas + ConcluÃ­das |
| **Desempenho (Ãšltimas 5)** | ComparaÃ§Ã£o Estimado vs. Real + label "RÃ¡pido/No Prazo/Atrasado" |
| **BotÃ£o Nova Tarefa RÃ¡pida** | Abre o modal de criaÃ§Ã£o |

**Mini Kanban no Home:** Clicar num card abre o workspace completo via `TaskDetailsModal`.

---

### 12.12 Cronograma (Planning)

PÃ¡gina de calendÃ¡rio com 3 vistas.

| Vista | DescriÃ§Ã£o |
|-------|-----------|
| **MÃªs** | CalendÃ¡rio mensal completo com pontos de prioridade nos dias que tÃªm tarefas |
| **Semana** | Vista de 7 dias com as tarefas de cada dia |
| **Dia** | Vista de um dia com horÃ¡rios sugeridos e detalhe das tarefas |

**Funcionalidades:**
- NavegaÃ§Ã£o entre perÃ­odos (anterior/seguinte)
- BotÃ£o "Hoje" para voltar ao perÃ­odo atual
- ExportaÃ§Ã£o `.ICS` para integraÃ§Ã£o com Google Calendar, Outlook, etc.
- Pontos coloridos por prioridade nos dias do calendÃ¡rio
- Click numa tarefa abre o workspace
- **Rollover automÃ¡tico de tarefas:** Tarefas incompletas com prazo no passado rolam automaticamente para o dia atual no calendÃ¡rio e cronograma, identificadas com um alerta visual e o prazo original.
- **CategorizaÃ§Ã£o da agenda:** Suporte a ordenaÃ§Ã£o de tarefas no painel lateral por HorÃ¡rio Planejado, Prazo (limite), Prioridade ou Tempo de ExecuÃ§Ã£o.
- **Prazo limite visual:** ExibiÃ§Ã£o da hora limite do prazo na listagem do dia.

---

### 12.13 AnÃ¡lise (Analytics)

PÃ¡gina de mÃ©tricas de produtividade.

| GrÃ¡fico / MÃ©trica | DescriÃ§Ã£o |
|------------------|-----------|
| **Por prioridade** | DistribuiÃ§Ã£o de tarefas por nÃ­vel (barras coloridas) |
| **Tempo mÃ©dio** | Tempo mÃ©dio por tarefa por prioridade |
| **Taxa de conclusÃ£o** | ConcluÃ­das vs. Total |
| **Pontuais vs. Atrasadas** | ComparaÃ§Ã£o |

---

### 12.14 Perfil / ConfiguraÃ§Ãµes

PÃ¡gina `Profile.jsx` acessÃ­vel via sidebar.

| SecÃ§Ã£o | Funcionalidades |
|--------|----------------|
| **Dados pessoais** | Editar nome completo, username, email |
| **Avatar** | Upload de foto de perfil (Supabase Storage) |
| **EstatÃ­sticas** | Total de tarefas criadas, concluÃ­das |
| **Gerador de dados** | BotÃ£o "Gerar tarefas de teste" (`generateMockTasks`) |
| **Tema** | Toggle dark/light mode |

---

## 13. Sistema de GamificaÃ§Ã£o

O sistema de gamificaÃ§Ã£o Ã© o principal impulsionador comportamental da aplicaÃ§Ã£o. Em vez de operar como uma simples contagem passiva de pontos, as mecÃ¢nicas foram desenhadas para alinhar gatilhos psicolÃ³gicos de motivaÃ§Ã£o com hÃ¡bitos reais de trabalho, incentivando o utilizador a definir metas consistentes, proteger os seus prazos e combater a procrastinaÃ§Ã£o.

O sistema Ã© gerido inteiramente pelo [GamificationService.js](file:///c:/Users/danie/Videos/Prioriza/Code/Prioriza_pasta/src/services/GamificationService.js) e persiste o estado do utilizador na tabela `profiles`.

### 13.1 Estrutura do Perfil de Jogo

```
profiles
â”œâ”€â”€ xp                 â†’ XP atual no nÃ­vel (0 a 1000)
â”œâ”€â”€ level              â†’ NÃ­vel atual do utilizador (1 a 10)
â”œâ”€â”€ streak             â†’ Dias consecutivos com tarefas concluÃ­das
â””â”€â”€ last_activity_date â†’ Data da Ãºltima atividade (para validaÃ§Ã£o do streak)
```

---

### 13.2 A Psicologia do Incentivo: Por que o XP sozinho nÃ£o basta?

Ganhos numÃ©ricos de XP isolados nÃ£o sustentam a motivaÃ§Ã£o de longo prazo. Por isso, a arquitetura de gamificaÃ§Ã£o do Prioriza baseia-se em pilares de psicologia comportamental (inspirados no modelo de gamificaÃ§Ã£o Octalysis) para criar um incentivo real para bater metas e cumprir prazos:

1. **AversÃ£o Ã  Perda (Loss Aversion - O motor de cumprimento de prazos):**
   A psicologia humana Ã© muito mais motivada pelo medo de perder do que pelo desejo de ganhar. No Prioriza, atrasar tarefas nÃ£o Ã© inÃ³cuo. O sistema deduz `-50 XP` na inicializaÃ§Ã£o do aplicativo para cada tarefa vencida e `-100 XP` caso conclua com atraso. Se o XP do nÃ­vel atual cair abaixo de zero, o utilizador **perde nÃ­vel (Level Down) e a sua patente de produtividade Ã© despromovida**. A dor de perder um tÃ­tulo duramente conquistado (ex: cair de *Executor Consistente* para *Organizador Ãgil*) Ã© a principal forÃ§a que atua contra o desleixo e a procrastinaÃ§Ã£o dos prazos.

2. **Progresso de Status e Identidade (Ranks e Patentes):**
   Subir de nÃ­vel nÃ£o serve apenas para preencher uma barra. A evoluÃ§Ã£o numÃ©rica estÃ¡ acoplada a patentes (Ranks) visÃ­veis na interface. Isso transforma a atividade de fazer tarefas de uma obrigaÃ§Ã£o administrativa numa jornada de mestria pessoal (Identity-based habits), onde o utilizador vÃª o seu perfil evoluir de um *Recruta da ProcrastinaÃ§Ã£o* (Lvl 1) a um *Deus da EficiÃªncia* (Lvl 10).

3. **Custo de Oportunidade e HÃ¡bitos (O Multiplicador de Streak):**
   Ao manter a consistÃªncia diÃ¡ria, o utilizador ativa multiplicadores de XP (atÃ© **2.0x** com a Chama Azul). O streak gera uma urgÃªncia diÃ¡ria: quebrar a sequÃªncia significa reiniciar o multiplicador, tornando a subida de patente subsequente duas vezes mais lenta. O utilizador protege a sua sequÃªncia para nÃ£o perder a vantagem acumulada, consolidando hÃ¡bitos diÃ¡rios de planeamento.

4. **Filtro de Integridade (Anti-Cheat - Recompensa Significativa):**
   A recompensa perde o significado se o cÃ©rebro perceber que pode trapacear. Marcar tarefas complexas como concluÃ­das apenas para obter XP rÃ¡pido, enquanto itens na checklist ainda estÃ£o pendentes, resulta em **0 XP** atribuÃ­dos. Isso bloqueia a dopamina vazia de cliques fraudulentos e forÃ§a o utilizador a encarar a checklist como a representaÃ§Ã£o real do seu compromisso.

5. **Recompensa de PrestÃ­gio MÃ¡xima (LicenÃ§a de Descanso):**
   Ao alcanÃ§ar o nÃ­vel 10 (*Deus da EficiÃªncia*), a barra de XP bloqueia e o cabeÃ§alho ativa o badge flutuante **"ðŸ–ï¸ Folga"**. Ele funciona como um "trofÃ©u de prestÃ­gio" permanente. Na mente do utilizador, esta medalha atua como uma autorizaÃ§Ã£o psicolÃ³gica de que atingiu a excelÃªncia produtiva e que pode descansar com a satisfaÃ§Ã£o do dever inteiramente cumprido.

6. **Feedback FÃ­sico DopaminÃ©rgico:**
   Para fechar o loop do hÃ¡bito, a conclusÃ£o da tarefa aciona uma fÃ­sica interativa e elÃ¡stica de mola, com partÃ­culas de XP que voam de forma fluida atÃ© o trofÃ©u. Este efeito visual gratificante serve como uma micro-recompensa instantÃ¢nea que estimula o cÃ©rebro a querer repetir a aÃ§Ã£o de concluir tarefas.

---

### 13.3 Mecanismos PsicolÃ³gicos de Incentivo e Recompensa

O Prioriza vai alÃ©m do acÃºmulo genÃ©rico de XP, estruturando as recompensas e puniÃ§Ãµes em torno de dinÃ¢micas comportamentais validadas:

#### A. Ranks e Patentes de Produtividade (ProgressÃ£o e Estatuto)
Para dar significado real ao nÃ­vel numÃ©rico (1 a 10), o sistema associa cada nÃ­vel a uma **Patente de Produtividade** visÃ­vel. Ã€ medida que o utilizador ganha XP, o seu tÃ­tulo e estatuto na plataforma evoluem, promovendo um sentimento de mestria e competÃªncia pessoal:

| NÃ­vel | Patente de Produtividade | DescriÃ§Ã£o Comportamental |
| :---: | :--- | :--- |
| **1** | ðŸ£ *Recruta da ProcrastinaÃ§Ã£o* | Fase inicial de inÃ©rcia e desorganizaÃ§Ã£o. |
| **2** | ðŸŒ± *Iniciante Consciente* | Primeiros passos na triagem bÃ¡sica de prioridades. |
| **3** | â±ï¸ *Praticante de Foco* | Utilizador habitual do temporizador Pomodoro. |
| **4** | ðŸ—‚ï¸ *Organizador Ãgil* | DomÃ­nio de listas de tarefas e estruturaÃ§Ã£o de subtarefas. |
| **5** | ðŸš€ *Executor Consistente* | Elevado volume de tarefas concluÃ­das semanalmente. |
| **6** | ðŸ¦¾ *Focado de AÃ§o* | ConsistÃªncia comprovada em mÃºltiplos dias seguidos de foco. |
| **7** | ðŸ§­ *Estrategista de Matriz* | ClassificaÃ§Ã£o rigorosa de prioridades via Matriz de Eisenhower. |
| **8** | ðŸŽ“ *Mestre da Produtividade* | Rotina e agenda otimizadas, com raras falhas de prazos. |
| **9** | ðŸŒŸ *Lenda do Foco* | ConcentraÃ§Ã£o mÃ¡xima, executando projetos complexos em tempo recorde. |
| **10**| ðŸ‘‘ *Deus da EficiÃªncia* | Mestria absoluta de tempo e gestÃ£o de energia pessoal. |

#### B. SequÃªncia DiÃ¡ria com Multiplicador de Fogo (Streaks e HÃ¡bitos)
O indicador de **Streak** (dias consecutivos de atividade) incentiva a consistÃªncia atravÃ©s de reforÃ§o visual e aceleraÃ§Ã£o de ganhos. Para manter a "chama acesa", o utilizador deve concluir pelo menos uma tarefa por dia. O Ã­cone de chama no cabeÃ§alho muda de comportamento e cor conforme a sequÃªncia avanÃ§a, ativando multiplicadores de XP:

* **1 a 2 dias:** ðŸ”¥ *Flame Brasa* (Ember Orange - 1.0x XP) - Foco inicial.
* **3 a 6 dias:** â˜„ï¸ *Flame Fogo Ativo* (Blazing Red - 1.5x XP) - Ritmo acelerado.
* **7+ dias:** âš¡ *Flame Fogo Azul/Supercarregado* (Supercharged Blue - 2.0x XP) - Estado de fluxo extremo. Multiplica todo o XP ganho por 2.

#### C. AversÃ£o Ã  Perda (Loss Aversion) e DespromoÃ§Ã£o de Rank
O medo de perder o progresso jÃ¡ conquistado Ã© um motivador mais forte do que o desejo de ganhar recompensas. O Prioriza aproveita este gatilho atravÃ©s de **Level Downs (DespromoÃ§Ã£o)**:
* Se o utilizador acumular tarefas em atraso, perde XP de forma contÃ­nua.
* Se a perda de XP levar o contador abaixo de zero no nÃ­vel atual, o utilizador **desce de nÃ­vel** e perde o seu **Rank de Produtividade** (ex: descendo de *Executor Consistente* para *Organizador Ãgil*).
* A despromoÃ§Ã£o Ã© acompanhada por um alerta visual tenso no cabeÃ§alho e na interface, forÃ§ando o utilizador a recuperar a disciplina para recuperar a sua patente.

#### D. Filtro de Integridade e Combate ao "Cheat" (Anti-Cheat Rule)
Para garantir que o utilizador nÃ£o manipula o sistema simplesmente marcando tarefas complexas como concluÃ­das sem realizar o trabalho, o sistema de gamificaÃ§Ã£o executa uma validaÃ§Ã£o estrita:
* **Checklist Pendente = 0 XP:** Se a tarefa possuir uma checklist associada e for marcada como concluÃ­da com itens ainda pendentes, a atribuiÃ§Ã£o de XP para essa tarefa Ã© imediatamente **zerada (0 XP)** e um aviso de erro Ã© exibido.
* Esta regra ensina o cÃ©rebro que recompensas sÃ³ sÃ£o obtidas mediante a conclusÃ£o real e detalhada do trabalho estruturado.

#### E. Feedback DopaminÃ©rgico RÃ¡pido (XP Flight Animation)
Para dar satisfaÃ§Ã£o fÃ­sica imediata (loop de dopamina rÃ¡pida no cÃ©rebro), a conclusÃ£o de qualquer tarefa despoleta uma animaÃ§Ã£o interativa que liga o local do clique do utilizador ao cabeÃ§alho global:
1. **EmissÃ£o de PartÃ­culas:** PartÃ­culas verdes de XP surgem precisamente do ponto do ecrÃ£ onde o utilizador clicou para fechar a tarefa.
2. **Curva de Voo FÃ­sica:** As partÃ­culas sobem de forma fluida a 60fps em direÃ§Ã£o ao trofÃ©u de NÃ­vel no DashboardHeader.jsx.
3. **ColisÃ£o e Sparkle Burst:** Ao colidir com o trofÃ©u, este executa um pulso elÃ¡stico de escala e lanÃ§a 12 faÃ­scas verdes/douradas brilhantes, enquanto a barra de XP sobe de forma proporcional.
4. **CelebraÃ§Ã£o de Level Up:** Ao atingir 1000 XP, o ecrÃ£ foca-se num modal premium com sunburst giratÃ³rio e explosÃ£o de confettis vetorizados.

#### F. O NÃ­vel MÃ¡ximo (Prestige State e Badge "Folga")
Ao atingir o NÃ­vel 10 (*Deus da EficiÃªncia*), a barra de XP bloqueia no limite mÃ¡ximo e o cabeÃ§alho ativa o badge flutuante **"ðŸ–ï¸ Folga"** (representado por uma palmeira animada). Este badge serve como uma recompensa de prestÃ­gio visÃ­vel, simbolizando que o utilizador alcanÃ§ou o controlo total do seu tempo e pode "relaxar" com a consciÃªncia do dever cumprido.

#### G. DiferenciaÃ§Ã£o de XP: ConclusÃ£o RÃ¡pida vs. ConclusÃ£o no Workspace
Para incentivar o foco real e combater a conclusÃ£o superficial, o sistema penaliza indiretamente o fecho rÃ¡pido de tarefas a partir de vistas gerais:
* **ConclusÃ£o no Workspace (Foco Detalhado):** Confere o XP base total (multiplicado por 50, ex: **250 XP** para P1), ativa o bÃ³nus de pontualidade de **+150 XP** e os multiplicadores de streak.
* **ConclusÃ£o RÃ¡pida (Kanban ou Lista geral):** Confere apenas **40%** do XP base (multiplicado por 20, ex: **100 XP** para P1) e nÃ£o atribui o bÃ³nus de pontualidade ou penalizaÃ§Ã£o ativa na janela de confirmaÃ§Ã£o.

---

### 13.4 Matriz de ConfiguraÃ§Ã£o e Valores de XP

A atribuiÃ§Ã£o de pontos Ã© estritamente proporcional ao esforÃ§o e impacto tÃ¡tico de cada aÃ§Ã£o:

| AÃ§Ã£o Realizada | XP Base | Multiplicadores DisponÃ­veis |
| :--- | :---: | :--- |
| **Concluir Tarefa CrÃ­tica (P1)** | `+250 XP` | Streak Multiplier (atÃ© `+500 XP` com Chama Azul) |
| **Concluir Tarefa Alta (P2)** | `+200 XP` | Streak Multiplier (atÃ© `+400 XP` com Chama Azul) |
| **Concluir Tarefa MÃ©dia (P3)** | `+150 XP` | Streak Multiplier (atÃ© `+300 XP` com Chama Azul) |
| **Concluir Tarefa Baixa (P4)** | `+100 XP` | Streak Multiplier (atÃ© `+200 XP` com Chama Azul) |
| **Concluir Tarefa MÃ­nima (P5)** | `+50 XP` | Streak Multiplier (atÃ© `+100 XP` com Chama Azul) |
| **Completar Ciclo Pomodoro (25m)** | `+50 XP` | Fixo (atribuÃ­do ao concluir o foco) |
| **Entregas Antecipadas (BÃ³nus)** | `+150 XP` | AtribuÃ­do se concluÃ­da antes do prazo (due_date) |

---

### 13.5 Sistema de PenalizaÃ§Ãµes por Desleixo

Para incentivar a pontualidade e o respeito pelos compromissos assumidos, o sistema penaliza ativamente a negligÃªncia com prazos:

| OcorrÃªncia | Penalidade de XP | Impacto no Perfil |
| :--- | :---: | :--- |
| **Passar do prazo (Overdue)** | `âˆ’50 XP` por tarefa | Aplicado automaticamente na inicializaÃ§Ã£o da app por tarefa vencida nÃ£o concluÃ­da. |
| **ConclusÃ£o atrasada** | `âˆ’100 XP` na conclusÃ£o | Deduzido no momento em que uma tarefa vencida Ã© marcada como Feito. |

**Fluxo de PenalizaÃ§Ã£o AutomÃ¡tica:**
```
[User inicia a aplicaÃ§Ã£o]
         â”‚
         â–¼
GamificationService.checkOverdueTasksAndPenalize()
         â”‚
         â”œâ”€â”€ Busca tarefas onde: status â‰  'Feito' AND due_date < NOW AND overdue_penalized = false
         â”‚
         â–¼
[Existem tarefas em atraso?]
   â”œâ”€â”€ SIM:
   â”‚    1. Marca 'overdue_penalized = true' em lote na BD.
   â”‚    2. Calcula deduÃ§Ã£o: total_atrasadas Ã— (-50 XP).
   â”‚    3. Deduz XP no perfil (aplica Level Down se XP < 0).
   â”‚    4. Dispara evento 'tasks-overdue-penalty'.
   â”‚    5. Exibe banner/alerta visual no ecrÃ£ com a lista das tarefas vencidas.
   â”‚
   â””â”€â”€ NÃƒO: Sem aÃ§Ãµes necessÃ¡rias.
```

---

### 13.6 CÃ¡lculo de SequÃªncia DiÃ¡ria (Streak Loop)

A verificaÃ§Ã£o do streak diÃ¡rio ocorre dinamicamente:
* **Ao atribuir XP:** O sistema compara a data atual com `last_activity_date`:
  * Se a diferenÃ§a for exatamente de **1 dia**, o streak Ã© incrementado em `+1` (dia consecutivo).
  * Se a diferenÃ§a for **maior que 1 dia**, o streak Ã© reiniciado para `1` (nova sequÃªncia iniciada).
  * Se a diferenÃ§a for **0 dias**, a atividade jÃ¡ foi contada para hoje e o streak permanece inalterado.
* **Ao carregar a aplicaÃ§Ã£o:** O sistema analisa a data da Ãºltima atividade. Se o utilizador passou mais de 24 horas sem concluir nenhuma tarefa (diferenÃ§a de dias > 1), o streak Ã© resetado para `0`, apagando a chama e removendo o multiplicador de XP.

---

### 13.7 Algoritmo de Subida e Descida de NÃ­vel (Level System)

O controle de nÃ­vel Ã© resiliente e dinÃ¢mico, operando atravÃ©s do seguinte loop matemÃ¡tico:

```javascript
// Processo de Level Up (XP Positivo)
while (novoXp >= 1000 && novoLevel < 10) {
    novoXp -= 1000;
    novoLevel += 1;
    levelUp = true;
}
if (novoLevel === 10) {
    novoXp = 1000; // Bloqueia a barra de XP no limite mÃ¡ximo
}

// Processo de Level Down (XP Negativo por PenalizaÃ§Ãµes)
while (novoXp < 0 && novoLevel > 1) {
    novoLevel -= 1;
    novoXp += 1000; // Restaura o XP com base no nÃ­vel anterior
    levelDown = true;
}
if (novoXp < 0 && novoLevel === 1) {
    novoXp = 0; // Limite mÃ­nimo do jogo
}

// Nota de Limite MÃ­nimo Absoluto: O valor de XP e NÃ­vel mais baixo possÃ­vel Ã© 0 XP no NÃ­vel 1.
// O saldo de XP do utilizador nunca fica abaixo de zero.
```

---

### 13.8 Widget e Interface de Controle (DashboardHeader)

O widget de gamificaÃ§Ã£o Ã© renderizado no topo da aplicaÃ§Ã£o, integrando de forma limpa os elementos de jogo na barra de navegaÃ§Ã£o:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [Chama Azul] 7d (2.0x) â”‚ [TrofÃ©u] Mestre (NÃ­vel 8)  [====--]â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```
* **Chama DinÃ¢mica**: Renderiza uma chama SVG de cor variante (Laranja, Vermelha ou Azul) que pulsa suavemente, acompanhada pelo nÃºmero de dias e o multiplicador ativo.
* **Badges e TÃ­tulo**: Exibe a patente atual de produtividade.
* **Barra de Progresso Fluida**: Um contÃªiner com cantos arredondados e gradiente Ã¢mbar (`from-amber-400 to-amber-500`) com largura percentual proporcional ao XP atual `(xp / 1000) * 100%`.
* **SincronizaÃ§Ã£o reativa**: O widget ouve o evento global `xp-updated` e atualiza a barra e a patente instantaneamente via React State, mantendo a responsividade do cabeÃ§alho sem necessidade de recarregar a pÃ¡gina.

---

## 14. Sistema de Prioridades

As prioridades sÃ£o armazenadas como inteiros (1-5) na coluna `tasks.priority`, facilitando a ordenaÃ§Ã£o (`ORDER BY priority ASC`).

| NÃ­vel | Nome | Cor CSS | Tailwind | Uso |
|-------|------|---------|---------|-----|
| **1** | CrÃ­tica | ðŸŒ¹ Vermelho profundo | `rose-600` (#e11d48) | MÃ¡xima urgÃªncia |
| **2** | Alta | ðŸ”´ Vermelho | `red-500` (#ef4444) | Alta urgÃªncia |
| **3** | MÃ©dia | ðŸŸ  Laranja | `orange-500` (#f97316) | UrgÃªncia moderada |
| **4** | Baixa | ðŸŸ¡ Amarelo | `yellow-500` (#eab308) | Pouca urgÃªncia |
| **5** | MÃ­nima | ðŸ”µ Azul | `blue-500` (#3b82f6) | Sem urgÃªncia |

**AplicaÃ§Ã£o consistente em todos os componentes:**

| Componente | Uso das cores |
|-----------|--------------|
| `TaskModal.jsx` | Dropdown de seleÃ§Ã£o com dot colorido |
| `TaskDetailsModal.jsx` | Dot + label no painel de metadados |
| `KanbanBoard.jsx` | Badge `Pn` + borda do card |
| `TaskList.jsx` | Barra lateral do card (`border-l-*`) |
| `TreeView.jsx` | Borda lateral + badge `Pn` |
| `EisenhowerMatrix.jsx` | Dot colorido no item |
| `Analytics.jsx` | Barras do grÃ¡fico |
| `Planning.jsx` | Ponto no calendÃ¡rio |
| `Home.jsx` | Barra de progresso das entregas + badge |

---

## 15. SeguranÃ§a e RLS

### Row Level Security (RLS)

Todas as tabelas tÃªm RLS ativado. Cada utilizador sÃ³ acede, edita e elimina os **seus prÃ³prios dados**.

```sql
-- Exemplo: tabela tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE USING (auth.uid() = user_id);
```

### RLS Adicional (Novas Tabelas e Storage)

```sql
-- Tabela: pomodoro_sessions
CREATE POLICY "Users can view own pomodoro sessions" ON pomodoro_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pomodoro sessions" ON pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pomodoro sessions" ON pomodoro_sessions FOR DELETE USING (auth.uid() = user_id);

-- Tabela: item_relations
CREATE POLICY "Users can view own item relations" ON item_relations FOR SELECT USING (EXISTS (SELECT 1 FROM tasks t WHERE t.id = item_relations.origin_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can insert own item relations" ON item_relations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM tasks t WHERE t.id = item_relations.origin_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can update own item relations" ON item_relations FOR UPDATE USING (EXISTS (SELECT 1 FROM tasks t WHERE t.id = item_relations.origin_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can delete own item relations" ON item_relations FOR DELETE USING (EXISTS (SELECT 1 FROM tasks t WHERE t.id = item_relations.origin_id AND t.user_id = auth.uid()));

-- Bucket de Storage: avatars
CREATE POLICY "Avatars are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
```

### ProteÃ§Ãµes Implementadas

| Vulnerabilidade | ProteÃ§Ã£o |
|----------------|----------|
| **SQL Injection** | âœ… Supabase ORM (queries parametrizadas, nunca SQL raw) |
| **XSS** | âœ… React sanitiza o DOM; Tiptap sanitiza o HTML |
| **CSRF** | âœ… JWT no header `Authorization` (nÃ£o em cookie) |
| **Acesso nÃ£o autorizado** | âœ… RLS garante isolamento total por utilizador |
| **ExposiÃ§Ã£o de chaves** | âœ… SÃ³ a `anon key` pÃºblica estÃ¡ no frontend |
| **ForÃ§a bruta** | âœ… Supabase Auth tem rate limiting nativo |

---

## 16. ServiÃ§os (Services)

### `TaskService.js` â€” 442 linhas

| MÃ©todo | DescriÃ§Ã£o |
|--------|-----------|
| `getTasks()` | Lista todas as tarefas + subtarefas do utilizador |
| `getTaskDetails(id)` | Detalhes completos: tarefa + checklist + notas |
| `getTasksByDateRange(start, end)` | Tarefas num intervalo de datas (Planning) |
| `createTask(data)` | Criar nova tarefa |
| `updateTask(id, updates)` | Atualizar campos de uma tarefa |
| `deleteTask(id)` | Eliminar tarefa |
| `updateStatus(id, status)` | Mudar estado (A Fazer/Em Progresso/Feito) |
| `createChecklistItem(taskId, content)` | Adicionar item ao checklist |
| `updateChecklistItem(id, updates)` | Atualizar item (ex: marcar concluÃ­do) |
| `deleteChecklistItem(id)` | Eliminar item |
| `createNote(taskId, content)` | Adicionar nota ao diÃ¡rio (+ parse de backlinks `[[...]]`) |
| `deleteNote(id)` | Eliminar nota |
| `getBacklinks(taskId)` | Tarefas que referenciam esta |
| `getOutgoingLinks(taskId)` | Tarefas que esta referencia |
| `startTimer(taskId)` | Iniciar timer (muda status para Em Progresso) |
| `stopTimer(taskId, spent, startedAt)` | Parar timer e guardar tempo |
| `completeTask(taskId, spent, startedAt)` | Concluir + guardar tempo final |
| `logPomodoroSession(taskId, duration)` | Registar sessÃ£o Pomodoro na tabela |
| `getTelemetryStats()` | EstatÃ­sticas por prioridade (Analytics) |
| `generateMockTasks()` | Gerar tarefas de teste com checklists e notas |

---

### `GamificationService.js` â€” 196 linhas

| MÃ©todo | DescriÃ§Ã£o |
|--------|-----------|
| `awardXp(amount)` | Adicionar ou remover XP com level up/down automÃ¡tico + streak |
| `getUserStats()` | Obter XP, nÃ­vel, streak e verificar reset de streak |
| `checkOverdueTasksAndPenalize()` | Verificar tarefas em atraso e aplicar -50 XP/tarefa |

---

### `ProfileService.js` â€” 70 linhas

| MÃ©todo | DescriÃ§Ã£o |
|--------|-----------|
| `getProfile()` | Obter perfil do utilizador autenticado |
| `updateProfile(updates)` | Atualizar dados do perfil |
| `uploadAvatar(file)` | Upload de avatar para Supabase Storage |

---

### `ResourceService.js` â€” 40 linhas

| MÃ©todo | DescriÃ§Ã£o |
|--------|-----------|
| `getResources(taskId)` | Listar recursos de uma tarefa |
| `createResource(taskId, url, title)` | Criar novo recurso |
| `deleteResource(id)` | Eliminar recurso |

---

## 17. O Que Falta Implementar

### ðŸ”´ CrÃ­tico â€” Afeta experiÃªncia do utilizador

*Nenhum (Tudo implementado! ðŸŽ‰)*

### ðŸŸ  Importante â€” Falta para produto completo

| Funcionalidade | DescriÃ§Ã£o |
|---------------|-----------|
| **NotificaÃ§Ãµes push/email** | Lembretes de prazo e notificaÃ§Ãµes de tarefas via Maileroo |
| **Tarefas recorrentes** | RepetiÃ§Ã£o diÃ¡ria/semanal/mensal |
| **Filtros avanÃ§ados** | Filtrar por estado, prioridade, prazo em simultÃ¢neo |
| **Pesquisa global** | Procurar tarefas por tÃ­tulo em qualquer pÃ¡gina |
| **ExportaÃ§Ã£o de dados** | Download JSON do perfil e todas as tarefas |
| **Drag and Drop** | Reordenar tarefas no Kanban por drag and drop real |

### ðŸŸ¡ Melhorias â€” Qualidade de vida

| Funcionalidade | DescriÃ§Ã£o |
|---------------|-----------|
| **Tags/Categorias** | Agrupar tarefas por tags personalizadas |
| **PWA** | Tornar a app instalÃ¡vel (service worker + manifest) |
| **Modo offline** | Cache local de tarefas (localStorage/IndexedDB) |
| **Subtarefas visuais no workspace** | Lista de subtarefas diretamente no workspace |
| **NotificaÃ§Ãµes sonoras no Pomodoro** | Som ao completar ciclo |
| **Console.log de produÃ§Ã£o** | Remover todos os `console.log` de debug |
| **Rate limiting no frontend** | Throttle nas chamadas repetidas Ã  API |
| **Memory cleanup** | Verificar `useEffect` cleanups para memory leaks |

### ðŸ”µ Futuro â€” Funcionalidades avanÃ§adas

| Funcionalidade | DescriÃ§Ã£o |
|---------------|-----------|
| **IA real** | Substituir mock da IA por chamada a API (Gemini/OpenAI) |
| **ColaboraÃ§Ã£o** | Partilha de tarefas entre utilizadores |
| **RelatÃ³rios PDF** | GeraÃ§Ã£o automÃ¡tica de relatÃ³rio de produtividade |
| **IntegraÃ§Ãµes** | Google Calendar, Notion, Trello |
| **AnÃ¡lise de sentimento** | IA analisar humor nas notas e sugerir pausas |

---

## Resumo de Progresso

| Ãrea | Estado |
|------|--------|
| AutenticaÃ§Ã£o (login/registo/logout) | âœ… Completo |
| GestÃ£o de Tarefas (CRUD) | âœ… Completo |
| Workspace de Tarefa (Otimizado 3 colunas, `max-w-[1600px]`) | âœ… Completo |
| Rich Text Editor (Altura fixa `h-[400px]` + scroll interno) | âœ… Completo |
| Checklist (Altura fixa `h-[380px]` + validaÃ§Ã£o de XP) | âœ… Completo |
| DiÃ¡rio de Bordo | âœ… Completo |
| Recursos/Links | âœ… Completo |
| Pomodoro Timer | âœ… Completo |
| Backlinks bidirecionais | âœ… Completo |
| Vista Lista | âœ… Completo |
| Vista Kanban | âœ… Completo |
| Vista Ãrvore | âœ… Completo |
| Matriz de Eisenhower | âœ… Completo |
| Dashboard / Home | âœ… Completo |
| Cronograma (Planning) | âœ… Completo |
| Analytics | âœ… Completo |
| Perfil / ConfiguraÃ§Ãµes | âœ… Completo |
| Tema Unificado Cinza-ArdÃ³sia | âœ… Completo |
| Design System & AnimaÃ§Ãµes Framer Motion | âœ… Completo |
| **GamificaÃ§Ã£o (XP + NÃ­vel + Streak + Confetti SVG)** | âœ… **Completo** |
| **Sistema de Prioridades (5 cores)** | âœ… **Completo** |
| Rollover automÃ¡tico no calendÃ¡rio | âœ… Completo |
| Carregamento (Skeleton Shimmer de brilho suave) | âœ… Completo |
| NotificaÃ§Ãµes push/email | âŒ Por implementar |
| Tabela pomodoro_sessions | âœ… Criada e configurada no Supabase |
| Tabela item_relations | âœ… Criada e configurada no Supabase |
| Bucket avatars (Storage) | âœ… Criado e configurado no Supabase |

---

*DocumentaÃ§Ã£o gerada com base no cÃ³digo-fonte real da aplicaÃ§Ã£o.*
*VersÃ£o: 1.0.0 â€” Junho 2026*
*AplicaÃ§Ã£o: Prioriza â€” GestÃ£o Inteligente de Tarefas*
