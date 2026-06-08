# Prioriza — Documentação Técnica Completa

> **Projeto:** Prova de Aptidão Profissional (PAP)  
> **Curso:** Técnico de Gestão e Programação de Sistemas Informáticos  
> **Escola:** Escola Técnico Profissional de Cantanhede  
> **Autor:** Daniel Silva — 12º TGPSI, Nº 01  
> **Ano Letivo:** 2025/2026  
> **Orientadores:** Michael Teixeira, Elisabete Cavaleiro, Teresa Fernandes  

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Objetivos](#2-objetivos)
3. [Metodologia de Desenvolvimento](#3-metodologia-de-desenvolvimento)
4. [Recursos Utilizados](#4-recursos-utilizados)
5. [Stack Tecnológico](#5-stack-tecnológico)
6. [Arquitetura do Sistema](#6-arquitetura-do-sistema)
7. [Base de Dados — Schema Completo](#7-base-de-dados--schema-completo)
8. [Design System](#8-design-system)
9. [Estrutura de Ficheiros](#9-estrutura-de-ficheiros)
10. [Fluxo de Autenticação](#10-fluxo-de-autenticação)
11. [Navegação e Layout](#11-navegação-e-layout)
12. [Funcionalidades — Do Início Até Agora](#12-funcionalidades--do-início-até-agora)
    - [12.1 Gestão de Tarefas (CRUD)](#121-gestão-de-tarefas-crud)
    - [12.2 Workspace de Tarefa](#122-workspace-de-tarefa-taskdetailsmodal)
    - [12.3 Bloco de Notas Rich Text](#123-bloco-de-notas-rich-text)
    - [12.4 Checklist](#124-checklist)
    - [12.5 Diário de Bordo](#125-diário-de-bordo)
    - [12.6 Recursos / Links](#126-recursos--links)
    - [12.7 Pomodoro Timer](#127-pomodoro-timer)
    - [12.8 Ligações Bidirecionais](#128-ligações-bidirecionais-backlinks)
    - [12.9 Copiloto IA](#129-copiloto-ia)
    - [12.10 Visualizações de Tarefas](#1210-visualizações-de-tarefas)
    - [12.11 Dashboard (Home)](#1211-dashboard-home)
    - [12.12 Cronograma (Planning)](#1212-cronograma-planning)
    - [12.13 Análise (Analytics)](#1213-análise-analytics)
    - [12.14 Perfil / Configurações](#1214-perfil--configurações)
13. [Sistema de Gamificação](#13-sistema-de-gamificação)
14. [Sistema de Prioridades](#14-sistema-de-prioridades)
15. [Segurança e RLS](#15-segurança-e-rls)
16. [Serviços (Services)](#16-serviços-services)
17. [O Que Falta Implementar](#17-o-que-falta-implementar)

---

## 1. Visão Geral

O **Prioriza** é uma aplicação web de gestão de tarefas pessoal com inteligência artificial integrada, gamificação e ferramentas de produtividade avançadas. O projeto foi desenvolvido individualmente como Prova de Aptidão Profissional (PAP) do curso de Técnico de Gestão e Programação de Sistemas Informáticos.

O Prioriza diferencia-se das aplicações de gestão de tarefas tradicionais por três pilares:

1. **Workspace por Tarefa:** Cada tarefa tem o seu próprio espaço de trabalho completo — editor de texto rico, checklist, diário de bordo, timer Pomodoro e recursos.
2. **Sistema de Gamificação:** XP, níveis, streak diário e penalizações automáticas para criar motivação intrínseca.
3. **4 Visualizações Inteligentes:** Lista, Kanban, Árvore (hierarquia de subtarefas) e Matriz de Eisenhower — cada uma para uma perspetiva diferente das tarefas.

A aplicação está disponível em português, com um tema cinza-claro/ardósia profissional nativo e design responsivo (desktop + mobile).

---

## 2. Objetivos

### Objetivos Gerais
- Terminar o curso com boa média, demonstrando as competências técnicas adquiridas
- Desenvolver um produto funcional, real e utilizável

### Objetivos Específicos

| Objetivo | Descrição |
|----------|-----------|
| Programação Web | Aplicar React, Vite e JavaScript moderno num projeto completo |
| Base de Dados | Estruturar e gerir uma BD PostgreSQL no Supabase com RLS |
| UX/UI | Criar uma interface intuitiva, acessível e visualmente premium |
| Produto | Colocar a aplicação online para utilizadores reais |
| IA | Integrar sugestões contextuais de inteligência artificial |
| Gamificação | Motivar a conclusão de tarefas com mecânicas de jogo |

---

## 3. Metodologia de Desenvolvimento

Foi utilizada a **metodologia em cascata com retorno** — uma variante do modelo clássico que permite recuar a fases anteriores quando surgem correções ou novos requisitos.

```
┌────────────────────────────────┐
│  FASE 1 — DEFINIÇÃO            │
│  ■ Pesquisa bibliográfica      │
│  ■ Análise de requisitos       │
│  ■ Planeamento do projeto      │
└──────────────┬─────────────────┘
               │  (retorno possível)
               ▼
┌────────────────────────────────┐
│  FASE 2 — DESENVOLVIMENTO      │
│  ■ Design (wireframes, BD)     │
│  ■ Codificação incremental     │
│  ■ Testes contínuos            │
└──────────────┬─────────────────┘
               │  (retorno possível)
               ▼
┌────────────────────────────────┐
│  FASE 3 — MANUTENÇÃO           │
│  ■ Correção de bugs            │
│  ■ Melhorias de interface      │
│  ■ Novas funcionalidades       │
└────────────────────────────────┘
```

**Justificação:** A metodologia em cascata com retorno foi escolhida por ser adequada para desenvolvimento individual, permitindo progressão estruturada sem perder flexibilidade para iterar.

---

## 4. Recursos Utilizados

### Hardware

**Acer Nitro V16** — portátil principal de desenvolvimento

| Componente | Especificação |
|-----------|---------------|
| Processador | Intel Core i7 (14ª Geração) |
| RAM | 16 GB |
| Armazenamento | SSD 1 TB |
| GPU | NVIDIA GeForce RTX 4060 |
| Sistema Operativo | Windows 11 64 bits |

### Software

| Software | Função |
|---------|--------|
| **Antigravity (IDE + IA)** | IDE principal com assistente de IA integrado |
| **Node.js 20 LTS** | Runtime JavaScript |
| **Git / GitHub** | Controlo de versões e repositório remoto |
| **Supabase** | Backend-as-a-Service (BD + Auth + Storage) |
| **Adobe Photoshop CS4** | Edição de imagens e logótipo |
| **Figma** | Wireframes e protótipo visual |

---

## 5. Stack Tecnológico

### Frontend

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| **React** | 19 | Framework de UI (componentes, estado, hooks) |
| **Vite** | 7 | Bundler e servidor de desenvolvimento |
| **Tailwind CSS** | 4 | Framework CSS utility-first |
| **Framer Motion** | 11 | Animações e transições com física (páginas, reordenação e celebrações) |
| **Tiptap** | 2 | Editor de texto rico (Rich Text / WYSIWYG) |
| **Lucide React** | latest | Biblioteca de ícones SVG (substitutos premium de emojis unicode) |
| **React Router DOM** | 7 | Roteamento client-side (SPA) |

### Backend / Base de Dados

| Tecnologia | Papel |
|-----------|-------|
| **Supabase** | Backend-as-a-Service: Auth, Database, Storage, REST API |
| **PostgreSQL 17** | Base de dados relacional |
| **Supabase Auth** | Autenticação por email/senha com JWT |
| **Row Level Security** | Isolamento total de dados por utilizador |
| **PostgREST** | API REST automática sobre o PostgreSQL |

---

## 6. Arquitetura do Sistema

```
┌───────────────────────────────────────────────────────────────────┐
│                        BROWSER (SPA React)                        │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   Pages    │  │ Components │  │   Services   │  │ Context  │  │
│  │            │  │            │  │              │  │          │  │
│  │ Home       │  │ Sidebar    │  │ TaskService  │  │ Session  │  │
│  │ Tasks      │  │ DashHeader │  │ ProfileSvc   │  │ (JWT)    │  │
│  │ Planning   │  │ TaskModal  │  │ GamifSvc     │  │          │  │
│  │ Analytics  │  │ TaskDetail │  │ ResourceSvc  │  │          │  │
│  │ Auth       │  │ KanbanBoard│  │              │  │          │  │
│  │ Profile    │  │ TreeView   │  │              │  │          │  │
│  │            │  │ Eisenhower │  │              │  │          │  │
│  └────────────┘  └────────────┘  └──────────────┘  └──────────┘  │
└───────────────────────────────┬───────────────────────────────────┘
                                │ HTTPS / PostgREST / JWT
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                         SUPABASE (Cloud)                          │
│                                                                   │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │   Auth   │  │  PostgREST   │  │        PostgreSQL DB        │  │
│  │ (JWT +   │  │  (REST API   │  │  ■ profiles                │  │
│  │  Session)│  │  automática) │  │  ■ tasks                   │  │
│  └──────────┘  └──────────────┘  │  ■ checklist_items         │  │
│                                  │  ■ task_notes               │  │
│  ┌──────────────────────────┐    │  ■ notes                   │  │
│  │   Row Level Security     │    │  ■ resources                │  │
│  │   (cada user vê só os    │    │  ■ user_preferences         │  │
│  │    seus dados)           │    │  ■ item_relations           │  │
│  └──────────────────────────┘    └────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

---

## 7. Base de Dados — Schema Completo

### Diagrama de Relações

```
auth.users (Supabase Auth)
    │ 1:1 (trigger on_auth_user_created)
    ▼
profiles ─────────────────── user_preferences
    │
    │ 1:N
    ▼
tasks ◄─── tasks (auto-referência: parent_id → subtarefas)
    │
    ├── 1:N ──► checklist_items   (itens do checklist)
    ├── 1:N ──► task_notes        (diário de bordo)
    ├── 1:N ──► notes             (notas alternativas)
    ├── 1:N ──► resources         (links e recursos)
    └── N:M ──► item_relations    (ligações bidirecionais)
```

---

### Tabela: `profiles`

Perfil público do utilizador, criado automaticamente quando se regista.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|:-----------:|---------|-----------|
| `id` | `uuid` | ✅ | — | PK, igual ao `auth.users.id` |
| `username` | `text` | ❌ | — | Nome de utilizador único |
| `full_name` | `text` | ❌ | — | Nome completo |
| `avatar_url` | `text` | ❌ | — | URL da foto de perfil |
| `preferências` | `jsonb` | ❌ | `{}` | Configurações e preferências (JSON) |
| `xp` | `integer` | ❌ | `0` | Pontos de experiência acumulados |
| `level` | `integer` | ❌ | `1` | Nível atual (1-10) |
| `streak` | `integer` | ❌ | `0` | Dias consecutivos com atividade |
| `last_activity_date` | `date` | ❌ | — | Última data de atividade (streak) |
| `updated_at` | `timestamptz` | ❌ | — | Última atualização |

---

### Tabela: `tasks`

Tabela central. Suporta tarefas e subtarefas na mesma estrutura via `parent_id`.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|:-----------:|---------|-----------|
| `id` | `uuid` | ✅ | `gen_random_uuid()` | Identificador único |
| `user_id` | `uuid` | ✅ | — | FK → `profiles.id` |
| `title` | `text` | ✅ | — | Título da tarefa |
| `description` | `text` | ❌ | — | Descrição em **HTML** (rich text) |
| `priority` | `integer` | ❌ | — | 1=Crítica, 2=Alta, 3=Média, 4=Baixa, 5=Mínima |
| `status` | `text` | ❌ | `'A Fazer'` | `'A Fazer'` / `'Em Progresso'` / `'Feito'` |
| `due_date` | `timestamptz` | ❌ | — | Prazo de entrega |
| `reminder` | `timestamptz` | ❌ | — | Data/hora de lembrete |
| `progress` | `integer` | ❌ | `0` | Progresso em % (0-100) |
| `parent_id` | `uuid` | ❌ | — | FK → `tasks.id` (auto-referência para subtarefas) |
| `is_ai_generated` | `boolean` | ❌ | `false` | Criada pela IA |
| `estimated_minutes` | `integer` | ❌ | — | Tempo estimado em minutos |
| `time_spent` | `integer` | ❌ | `0` | Tempo gasto em **segundos** |
| `timer_started_at` | `timestamptz` | ❌ | — | Timestamp de início do timer ativo |
| `completed_at` | `timestamptz` | ❌ | — | Data/hora de conclusão |
| `overdue_penalized` | `boolean` | ❌ | `false` | Penalização de atraso já aplicada? |
| `created_at` | `timestamptz` | ❌ | `NOW()` | Data de criação |

---

### Tabela: `checklist_items`

Itens do checklist de cada tarefa. A barra de progresso da tarefa é calculada com base nestes itens.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|:-----------:|---------|-----------|
| `id` | `uuid` | ✅ | `gen_random_uuid()` | Identificador único |
| `task_id` | `uuid` | ✅ | — | FK → `tasks.id` |
| `user_id` | `uuid` | ✅ | `auth.uid()` | FK → `profiles.id` |
| `content` | `text` | ✅ | — | Texto do item |
| `is_completed` | `boolean` | ❌ | `false` | Item concluído? |
| `position` | `integer` | ❌ | `0` | Ordem de exibição |
| `created_at` | `timestamptz` | ✅ | `NOW()` | Data de criação |

---

### Tabela: `task_notes`

Diário de bordo por tarefa — notas cronológicas com suporte a ligações bidirecionais `[[Título]]`.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|:-----------:|---------|-----------|
| `id` | `uuid` | ✅ | `gen_random_uuid()` | Identificador único |
| `task_id` | `uuid` | ✅ | — | FK → `tasks.id` |
| `user_id` | `uuid` | ✅ | `auth.uid()` | FK → `profiles.id` |
| `content` | `text` | ✅ | — | Conteúdo da nota (texto livre) |
| `created_at` | `timestamptz` | ✅ | `NOW()` | Data/hora de criação |

---

### Tabela: `notes`

Sistema alternativo de notas (histórico cronológico simples).

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|:-----------:|-----------|
| `id` | `uuid` | ✅ | Identificador único |
| `task_id` | `uuid` | ✅ | FK → `tasks.id` |
| `content` | `text` | ✅ | Texto da nota |
| `created_at` | `timestamptz` | ❌ | Data de criação |

---

### Tabela: `resources`

Links e materiais de referência associados a cada tarefa.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|:-----------:|-----------|
| `id` | `uuid` | ✅ | Identificador único |
| `task_id` | `uuid` | ✅ | FK → `tasks.id` |
| `url` | `text` | ✅ | URL do recurso |
| `title` | `text` | ❌ | Título descritivo |
| `created_at` | `timestamptz` | ❌ | Data de criação |

---

### Tabela: `item_relations`

Relações bidirecionais entre tarefas (sistema de backlinks, criado via sintaxe `[[Título]]`).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `origin_id` | `uuid` | Tarefa de origem |
| `target_id` | `uuid` | Tarefa de destino |
| `relation_type` | `text` | Tipo de relação (ex: `'link'`) |

---

### Tabela: `pomodoro_sessions`

Registo de cada sessão Pomodoro concluída pelo utilizador.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|:-----------:|---------|-----------|
| `id` | `uuid` | ✅ | `gen_random_uuid()` | Identificador único (PK) |
| `user_id` | `uuid` | ✅ | — | FK → `profiles.id` |
| `task_id` | `uuid` | ✅ | — | FK → `tasks.id` |
| `duration_seconds` | `integer` | ✅ | — | Duração da sessão em segundos |
| `completed_at` | `timestamptz` | ✅ | `NOW()` | Data/hora de conclusão da sessão |

---

### Tabela: `user_preferences`

Configurações detalhadas de notificações e comportamento por utilizador.

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `id` | `uuid` | `gen_random_uuid()` | Identificador único |
| `email_notifications` | `boolean` | `true` | Notificações por email ativas |
| `app_notifications` | `boolean` | `true` | Notificações na app ativas |
| `quiet_hours_start` | `time` | `22:00` | Início de horas silenciosas |
| `quiet_hours_end` | `time` | `07:00` | Fim de horas silenciosas |
| `offline_mode` | `boolean` | `false` | Modo offline |
| `minimal_animations` | `boolean` | `true` | Animações reduzidas |
| `created_at` | `timestamptz` | `NOW()` | Data de criação |

---

### Trigger: Criação Automática de Perfil

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

O Prioriza tem um design system próprio definido em `src/index.css`, implementado com CSS Custom Properties e Tailwind CSS 4.

### Paleta de Cores

#### Cores da Marca

| Nome | Valor Hex | Uso |
|------|-----------|-----|
| `--color-prioriza-navy` | `#0A1128` | Azul marinho escuro principal (texto da logo) |
| `--color-prioriza-blue` | `#2563EB` | Azul primário (botões, links, foco - checkmark da logo) |
| `--color-prioriza-coral` | `#F43F5E` | Destaque vermelho-coral (ponto da logo) |
| `--color-prioriza-orange` | `#F97316` | Destaque laranja (ponto da logo) |
| `--color-prioriza-cyan` | `#06B6D4` | Destaque ciano (ponto da logo) |

#### Superfícies do Tema Único (Cinza-Ardósia Profissional)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-surface` | `#E2E8F0` | Fundo geral da página (cinza-médio/claro profissional) |
| `--color-surface-card` | `#FFFFFF` | Fundo de cards e modais (branco para contraste ideal) |
| `--color-surface-elevated` | `#F8FAFC` | Fundo de elementos e tabelas secundárias |
| `--color-border` | `#CBD5E1` | Bordas gerais nítidas |
| `--color-border-light` | `#E2E8F0` | Linhas divisórias e bordas subtis |

#### Texto

| Token | Valor Hex | Uso |
|-------|-----------|-----|
| `--color-text-primary` | `#0A1128` | Texto principal (navy escuro legível) |
| `--color-text-secondary` | `#334155` | Texto secundário (ardósia escuro) |
| `--color-text-muted` | `#64748B` | Texto desvanecido ou legenda |

### Tipografia

| Propriedade | Valor |
|------------|-------|
| **Família** | `Inter`, -apple-system, Segoe UI, sans-serif |
| **Tamanho base** | `16px` |
| **Peso base** | `400` (Regular) |
| **Line-height** | `1.5` |
| **Suavização** | `-webkit-font-smoothing: antialiased` |

### Componentes UI

| Componente | Ficheiro | Descrição |
|-----------|---------|-----------|
| `Button` | `ui/Button.jsx` | Botão com variantes `primary`, `secondary`, `danger`, `ghost` |
| `Card` | `ui/Card.jsx` | Contêiner com sombra e bordas arredondadas |
| `Modal` | `ui/ConfirmationModal.jsx` | Modal de confirmação com tipos `info`, `success`, `danger` |
| `EmptyState` | `ui/EmptyState.jsx` | Estado vazio com ícone e mensagem |
| `ErrorState` | `ui/ErrorState.jsx` | Estado de erro com mensagem e ação de retry |
| `Toast` | `ui/Toast.jsx` | Notificações temporárias |
| `RichTextEditor` | `ui/RichTextEditor.jsx` | Editor Tiptap completo com toolbar |

### Animações e Transições

Todas as animações dinâmicas são implementadas com **Framer Motion** e CSS customizado para garantir uma experiência interativa sem lags:

| Animação / Transição | Implementação | Uso |
|----------------------|----------------|-----|
| **Slide & Fade** | Framer Motion `<AnimatePresence>` | Transições horizontais suaves ao navegar entre as páginas principais |
| **Spring Reorder** | Framer Motion `<motion.div layout>` | Reordenação elástica e fluida de itens de listas |
| **Celebration Overlays** | Framer Motion (Confetti & Sunburst) | Modal com halo de brilho, sunburst SVG giratório, troféu elástico e 20 partículas dinâmicas |
| **Hover Scale & Feedback** | Framer Motion | Interação elástica ao passar o cursor sobre botões, cards do Kanban e menus |
| **Custom Keyframe Rotation** | CSS `@keyframes prioriza-rotation` | Carregamento contínuo do spinner sem travar, ignorando restrições de Reduced Motion |
| **Flashes & Pulsos** | Framer Motion / CSS Pulse | Indicador animado do streak diário e badges |
| **Skeleton Shimmer** | Gradiente linear CSS + `@keyframes skeleton-shimmer` | Efeito de brilho e pulsação cinza translúcido ao carregar a sessão ou transitar entre abas |

> **Nota de Design (Exclusão de Emojis):** Para manter a estética premium e profissional da aplicação, a utilização de emojis unicode no design da UI foi descontinuada, sendo totalmente substituídos por gráficos vetoriais nativos e ícones da biblioteca **Lucide React**.

### Tema Unificado Cinza-Ardósia

O Prioriza adota um tema único cinza-ardósia profissional de médio-contraste, removendo a alternância de modos claro/escuro. A interface utiliza superfícies de cartão branco (`#FFFFFF`) sobre o fundo cinza-ardósia (`#E2E8F0`), o que proporciona um contraste excelente e confortável sem cansar a vista.

O editor Tiptap (rich text) utiliza as variáveis de cores globais diretamente a partir de `index.css` para garantir consistência de visualização em toda a aplicação.

---

## 9. Estrutura de Ficheiros

```
Prioriza/
├── docs/
│   ├── PRIORIZA_DOCUMENTACAO_COMPLETA.md    ← Este ficheiro
│   ├── ANALISE_COMPLETA.md
│   ├── FUNCIONALIDADES_PENDENTES.md
│   ├── PONTOS_CEGOS.md
│   └── pap.pdf
├── img/
│   └── (logótipos)
└── Code/
    └── Prioriza_pasta/
        ├── public/
        │   └── logo.png
        ├── src/
        │   ├── App.jsx                    ← Roteamento, sessão, layout principal
        │   ├── main.jsx                   ← Entry point React
        │   ├── index.css                  ← Design system + CSS variables
        │   │
        │   ├── lib/
        │   │   └── supabase.js            ← Cliente Supabase inicializado
        │   │
        │   ├── services/
        │   │   ├── TaskService.js         ← CRUD de tarefas e todos os sub-recursos
        │   │   ├── GamificationService.js ← XP, nível, streak, penalizações
        │   │   ├── ProfileService.js      ← Perfil e avatar
        │   │   └── ResourceService.js     ← Links/recursos de tarefas
        │   │
        │   ├── components/
        │   │   ├── layout/
        │   │   │   ├── Sidebar.jsx        ← Navegação lateral (ícones + tooltips)
        │   │   │   ├── DashboardHeader.jsx← Header: saudação, gamificação, avatar
        │   │   │   ├── TopBar.jsx         ← Barra superior alternativa (mobile)
        │   │   │   ├── BottomNav.jsx      ← Navegação inferior (mobile)
        │   │   │   └── Fab.jsx            ← Floating Action Button
        │   │   │
        │   │   ├── tasks/
        │   │   │   ├── TaskModal.jsx      ← Modal criar/editar tarefa
        │   │   │   ├── TaskDetailsModal.jsx← WORKSPACE completo (1219 linhas)
        │   │   │   ├── TaskList.jsx       ← Vista em lista com barra colorida
        │   │   │   ├── KanbanBoard.jsx    ← Vista Kanban 3 colunas
        │   │   │   ├── TreeView.jsx       ← Vista em árvore hierárquica
        │   │   │   ├── EisenhowerMatrix.jsx← Matriz Urgente/Importante
        │   │   │   └── ResourceCards.jsx  ← Cards de links/recursos
        │   │   │
        │   │   ├── ui/
        │   │   │   ├── Button.jsx
        │   │   │   ├── Card.jsx
        │   │   │   ├── ConfirmationModal.jsx
        │   │   │   ├── EmptyState.jsx
        │   │   │   ├── ErrorState.jsx
        │   │   │   ├── RichTextEditor.jsx ← Tiptap editor com toolbar
        │   │   │   └── Toast.jsx
        │   │   │
        │   │   ├── dashboard/
        │   │   │   └── Profile.jsx        ← Página de perfil e configurações
        │   │   │
        │   │   └── common/
        │   │       └── (componentes partilhados)
        │   │
        │   └── pages/
        │       ├── Auth.jsx               ← Login + Registo
        │       ├── Home.jsx               ← Dashboard principal
        │       ├── Tasks.jsx              ← Gestão de tarefas (4 views)
        │       ├── Planning.jsx           ← Calendário (mês/semana/dia)
        │       └── Analytics.jsx          ← Análise e estatísticas
        │
        ├── index.html
        ├── vite.config.js
        ├── tailwind.config.js
        └── package.json
```

---

## 10. Fluxo de Autenticação

```
1. Utilizador acede a qualquer URL da app
        │
        ▼
2. App.jsx verifica sessão Supabase
   supabase.auth.getSession()
        │
   ┌────┴────┐
   │         │
   ▼         ▼
Sessão    Sem sessão
válida         │
   │           ▼
   │      Renderiza <Auth />
   │      (Login / Registo)
   │
   ▼
3. Carrega perfil: ProfileService.getProfile()
   Verifica penalizações: GamificationService.checkOverdueTasksAndPenalize()
        │
        ▼
4. Renderiza layout completo
   (Sidebar + DashboardHeader + Página ativa)
        │
        ▼
5. Listeners ativos:
   - 'xp-updated' → recarrega perfil
   - 'tasks-overdue-penalty' → alerta + recarrega perfil
   - onAuthStateChange → atualiza sessão em tempo real
```

**JWT e Segurança:**
- Tokens JWT geridos automaticamente pelo Supabase
- Renovação automática de tokens
- Logout invalida a sessão no servidor

---

## 11. Navegação e Layout

### Sidebar (`Sidebar.jsx`)

Barra lateral fixa com 80px de largura em desktop. Em mobile, aparece como drawer com overlay escuro.

| Item | ID | Ícone |
|------|----|----|
| Início | `dashboard` | LayoutDashboard |
| Tarefas | `tasks` | ListTodo |
| Planeamento | `planning` | Calendar |
| Análise | `analytics` | BarChart3 |
| Perfil | `profile` | User |

- Tooltip com o nome do item ao hover (desktop)
- Indicador ativo: linha azul à esquerda + ícone azul
- Fundo `--color-surface-card` em harmonia com o tema único cinza-ardósia

### Dashboard Header (`DashboardHeader.jsx`)

Header superior com:
- **Mobile:** Logo da app
- **Desktop (direita):** Saudação contextual (Bom dia/Boa tarde/Boa noite) + nome do utilizador
- **Widget de Gamificação:** Streak (chama animada), Nível, Barra de XP (0–1000), Badge "🏖️ Folga" (nível 10)
- **Avatar:** Foto de perfil ou inicial do nome; clique navega para perfil
- **Breadcrumb:** Hierarquia de páginas abaixo do título
- **Título da página:** H1 grande e em negrito

---

## 12. Funcionalidades — Do Início Até Agora

### 12.1 Gestão de Tarefas (CRUD)

**Modal de criação/edição (`TaskModal.jsx`):**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Título | `text` | Obrigatório |
| Descrição | `text` | Opcional |
| Prioridade | `select 1-5` | Com cores e labels |
| Estado | `select` | A Fazer / Em Progresso / Feito |
| Prazo | `datetime-local` | Opcional |
| Lembrete | `datetime-local` | Opcional |
| Tempo estimado | `number` (minutos) | Opcional |

**Ações disponíveis:**

| Ação | Descrição |
|------|-----------|
| Criar | Via modal em qualquer página |
| Editar | Reabre o modal com dados preenchidos |
| Eliminar | Com modal de confirmação (tipo `danger`) |
| Concluir | Marca como `Feito` + dispara XP |
| Reativar | Volta ao estado `A Fazer` |
| Mudar estado | Kanban drag conceptual via click |

---

### 12.2 Workspace de Tarefa (`TaskDetailsModal.jsx`)

O workspace é o coração da aplicação. É um modal full-screen otimizado que se abre ao clicar em qualquer tarefa, maximizando a área de trabalho para evitar espaços vazios e subaproveitados.

**Otimização do Espaço de Trabalho:**
- **Largura Máxima Expandida:** Limite estendido para `max-w-[1600px]` para aproveitar ecrãs grandes de forma harmoniosa.
- **Distribuição de Colunas Rebalanceada (`grid-cols-12`):**
  - **Coluna de Metadados (`lg:col-span-3`):** Painel lateral focado em status, datas de entrega, estimativas e tempos decorridos.
  - **Coluna Central (`lg:col-span-5`):** Foco no Bloco de Notas de texto rico (Tiptap) e painel do Copiloto IA.
  - **Coluna Direita (`lg:col-span-4`):** Painel de widgets complementares contendo Pomodoro Timer, Checklist, Diário de Bordo e Recursos/Links.

**Estrutura Visual:**
```
┌────────────────────────────────────────────────────────────────────────┐
│  ← VOLTAR           [Título da Tarefa]               [SALVAR] [CONCLUIR]│
├───────────────┬───────────────────────────────┬────────────────────────┤
│  METADADOS    │      COLUNA CENTRAL           │     COLUNA DIREITA     │
│               │                               │                        │
│  [Prioridade] │   ■ Bloco de Notas Rich Text  │   ■ Pomodoro Timer     │
│  [Status]     │     (Altura Fixa h-[400px])   │   ■ Checklist          │
│  [Prazo]      │                               │     (Altura h-[380px]) │
│  [Estimado]   │   ■ Copiloto IA               │   ■ Diário de Bordo    │
│  [Tempo Gasto]│                               │   ■ Recursos / Links   │
└───────────────┴───────────────────────────────┴────────────────────────┘
```

**Ações e Interações:**
- **Salvar:** Salva todas as edições no banco de dados de forma assíncrona e imediata, exibindo uma notificação visual tipo **Toast ("Progresso Salvo")** flutuante no canto inferior direito, com animação elástica de entrada.
- **Concluir / Ativar:** Alterna o estado da tarefa. Contém uma validação estrita baseada nos itens do checklist.

---

### 12.3 Bloco de Notas Rich Text

Powered by **Tiptap v2** com extensões customizadas.

**Estrutura Física e UX:**
- **Altura Fixa (`h-[400px]`):** Organizado em layout `flex-col` para garantir integridade estética da página.
- **Rolagem Interna (`overflow-y-auto`):** Textos muito longos não quebram a interface, mantendo a área de edição limpa e rolada apenas internamente.

**Barra de ferramentas:**

| Ferramenta | Atalho | Descrição |
|-----------|--------|-----------|
| **B** (Negrito) | `Ctrl+B` | Texto em negrito |
| *I* (Itálico) | `Ctrl+I` | Texto em itálico |
| ~~S~~ (Rasurado) | — | Texto rasurado |
| H1 | — | Título grande (inline, custom Mark) |
| H2 | — | Título médio (inline, custom Mark) |
| Lista • | — | Lista com marcadores |
| Lista 1. | — | Lista numerada |
| Citação | — | Bloco de citação |
| 🖍 Marca-texto | — | 5 cores disponíveis: amarelo, verde, azul, rosa, cinzento |
| ↩ Desfazer | `Ctrl+Z` | Desfazer última ação |
| ↪ Refazer | `Ctrl+Y` | Refazer ação desfeita |

**Barra de estado (rodapé):**
- Contagem de palavras e caracteres em tempo real
- Estimativa de tempo de leitura (`~X min leitura`, só aparece a partir de 10 palavras)

**Design e Legibilidade:** Estilos específicos em CSS para o editor `ProseMirror` — negrito, itálico, títulos e placeholders com cores corretas e integradas com o tema único.

---

### 12.4 Checklist

Lista de subtarefas com progresso visual e validação de consistência.

**Layout e Usabilidade:**
- **Altura Fixa Limitada (`h-[380px]`):** Container estruturado com flexbox para manter alinhamento estrito no ecrã.
- **Cabeçalho Fixo (Sticky Header):** Exibe a barra de progresso calculada `(itens_concluídos / total) × 100` e o contador de itens concluídos.
- **Lista Rolável (`overflow-y-auto`):** Centraliza os itens do checklist em scroll interno.
- **Formulário de Entrada Fixo (Sticky Bottom):** O campo de inserção de itens permanece estático na base do widget para fácil alcance.

| Funcionalidade | Descrição |
|---------------|-----------|
| Adicionar item | Campo de texto fixo na base + botão "+" |
| Marcar/desmarcar | Checkbox com animação elástica e somatório em tempo real |
| Eliminar item | Botão "×" de remoção rápida ao pairar |
| Barra de progresso | Percentagem calculada dinamicamente |
| Contador | Indicador descritivo "X de Y concluídos" |

**Regra de Conclusão de Tarefa (Validação Estrita):**
Não é permitida a conclusão de tarefas com itens pendentes no checklist. Se o utilizador tentar concluir uma tarefa contendo itens inacabados:
- O XP atribuído será reduzido a **0 XP** (removendo o incentivo gamificado por conclusão fraudulenta).
- É exibido um aviso em banner vermelho no topo da barra de metadados do Workspace ou nos diálogos do Kanban avisando que existem tarefas inacabadas pendentes.

**Base de dados:** `checklist_items` (com `user_id`, `task_id`, `content`, `is_completed`, `position`)

---

### 12.5 Diário de Bordo

Notas cronológicas associadas à tarefa. Cada entrada tem timestamp de criação.

| Funcionalidade | Descrição |
|---------------|-----------|
| Adicionar nota | Textarea + botão "Enviar" |
| Listagem | Ordem cronológica reversa (mais recente primeiro) |
| Timestamp | Data e hora de cada entrada |
| Eliminar nota | Via `TaskService.deleteNote()` |

**Suporte a Ligações Bidirecionais:** O sistema deteta padrões `[[Título da Tarefa]]` nas notas e cria automaticamente relações na tabela `item_relations`.

---

### 12.6 Recursos / Links

Links e materiais de estudo associados à tarefa.

| Funcionalidade | Descrição |
|---------------|-----------|
| Adicionar recurso | URL + título opcional |
| Listar recursos | Cards com título e URL |
| Eliminar recurso | Botão de remoção |
| Abrir link | Abre em nova aba |

**Componente:** `ResourceCards.jsx`

---

### 12.7 Pomodoro Timer

Timer de foco integrado no workspace, seguindo a técnica Pomodoro.

| Configuração | Valor |
|-------------|-------|
| Sessão de foco | **25 minutos** (1500 segundos) |
| Pausa curta | **5 minutos** (300 segundos) |
| XP por sessão de foco | **+50 XP** |
| Registo | `tasks.time_spent` (segundos acumulados) |
| Log de sessões | Tabela `pomodoro_sessions` |

**Fluxo:**
1. Utilizador clica "▶ Iniciar" → timer de 25 min começa
2. Ao completar: modal de confirmação "Ótimo trabalho! Hora de intervalo."
3. +50 XP atribuídos; `tasks.time_spent` atualizado
4. Se level up: modal de celebração "✨ SUBIU DE NÍVEL! ✨"
5. Timer de pausa de 5 min
6. Ao completar pausa: convite a novo ciclo de foco
7. Ciclos completados são contados na sessão

**Stopwatch paralelo:** Enquanto o Pomodoro está ativo em modo foco, um cronómetro interno conta `sessionTimeSpent` em segundos. Este valor é guardado ao fechar o workspace ou ao clicar Salvar.

---

### 12.8 Ligações Bidirecionais (Backlinks)

Sistema inspirado em ferramentas como Obsidian ou Roam Research.

**Como funciona:**
1. Nas notas do Diário de Bordo, usa-se `[[Título da Tarefa]]`
2. O `TaskService.createNote()` deteta padrões `[[...]]` com regex
3. Procura a tarefa com esse título na base de dados do utilizador
4. Cria uma entrada em `item_relations` com `origin_id` e `target_id`

**No workspace:**
- **Ligações de Entrada (Backlinks):** "Outras tarefas que referenciam esta"
- **Ligações de Saída:** "Tarefas que esta referencia"
- Clicar num backlink navega para essa tarefa (carrega novo `taskId` no mesmo modal)

**Sugestões automáticas:** Ao escrever `[[` na nota, surge uma lista de sugestões de tarefas.

---

### 12.9 Copiloto IA

Painel de sugestões contextuais integrado no workspace.

| Funcionalidade | Descrição |
|---------------|-----------|
| Análise do contexto | Considera título, prioridade, prazo, progresso e checklist |
| Sugestões geradas | Items para o checklist, abordagens, próximos passos |
| Integração com checklist | Sugestões podem ser adicionadas diretamente ao checklist |

**Estados:**
- `aiLoading`: spinner enquanto gera sugestões
- `aiResponse`: resposta formatada exibida no painel

---

### 12.10 Visualizações de Tarefas

Página `Tasks.jsx` com 4 modos de visualização, selecionáveis por tabs.

#### Vista Lista (`TaskList.jsx`)

- Cada tarefa: card com barra colorida à esquerda (cor = prioridade)
- Informação exibida: título, estado, prazo, tempo estimado
- Ações rápidas: editar, eliminar
- Click abre o workspace completo

| Prioridade | Cor da Barra |
|-----------|-------------|
| Crítica (1) | rose-50 (border-l-critical) |
| Alta (2) | red-50 (border-l-high) |
| Média (3) | orange-50 (border-l-medium) |
| Baixa (4) | yellow-50 (border-l-low) |
| Mínima (5) | blue-50 (border-l-minimal) |

#### Vista Kanban (`KanbanBoard.jsx`)

3 colunas: **A Fazer** | **Em Progresso** | **Feito**

- Cada cartão: título, badge de prioridade colorido, prazo, barra de progresso
- Badge de atraso quando `due_date < now`
- Click abre workspace
- Contador de tarefas por coluna

#### Vista Árvore (`TreeView.jsx`)

- Hierarquia pai → filhos expandível
- Ícone de seta para expandir/colapsar
- Badge `P1`–`P5` com cor de prioridade
- Indentação visual por nível
- Click abre workspace

#### Matriz de Eisenhower (`EisenhowerMatrix.jsx`)

Classifica automaticamente as tarefas em 4 quadrantes com base em prioridade e prazo:

| Quadrante | Critério | Cor |
|----------|---------|-----|
| **FAZER JÁ** | Urgente + Importante (P1-P2, prazo ≤48h) | Vermelho |
| **AGENDAR** | Importante, sem pressa (P1-P2, prazo >48h) | Âmbar |
| **DELEGAR** | Urgente, pouca importância (P3-P5, prazo ≤48h) | Azul |
| **ELIMINAR** | Nem urgente nem importante | Cinzento |

**Regras de classificação:**
- "Urgente" = prazo dentro de 48h OU tarefa "Em Progresso"
- "Importante" = prioridade 1 ou 2
- Tarefas concluídas não aparecem
- Ordenação dentro de cada quadrante: prioridade → prazo

---

### 12.11 Dashboard (Home)

Página inicial com visão geral rápida.

| Widget | Descrição |
|--------|-----------|
| **Próximas Entregas** | Barra de progresso por tarefa, ordenada por prazo (máx. 5) |
| **Mini Kanban** | Preview das 3 colunas com até 3 tarefas cada |
| **Visão Geral** | Total de tarefas + Concluídas |
| **Desempenho (Últimas 5)** | Comparação Estimado vs. Real + label "Rápido/No Prazo/Atrasado" |
| **Botão Nova Tarefa Rápida** | Abre o modal de criação |

**Mini Kanban no Home:** Clicar num card abre o workspace completo via `TaskDetailsModal`.

---

### 12.12 Cronograma (Planning)

Página de calendário com 3 vistas.

| Vista | Descrição |
|-------|-----------|
| **Mês** | Calendário mensal completo com pontos de prioridade nos dias que têm tarefas |
| **Semana** | Vista de 7 dias com as tarefas de cada dia |
| **Dia** | Vista de um dia com horários sugeridos e detalhe das tarefas |

**Funcionalidades:**
- Navegação entre períodos (anterior/seguinte)
- Botão "Hoje" para voltar ao período atual
- Exportação `.ICS` para integração com Google Calendar, Outlook, etc.
- Pontos coloridos por prioridade nos dias do calendário
- Click numa tarefa abre o workspace
- **Rollover automático de tarefas:** Tarefas incompletas com prazo no passado rolam automaticamente para o dia atual no calendário e cronograma, identificadas com um alerta visual e o prazo original.
- **Categorização da agenda:** Suporte a ordenação de tarefas no painel lateral por Horário Planejado, Prazo (limite), Prioridade ou Tempo de Execução.
- **Prazo limite visual:** Exibição da hora limite do prazo na listagem do dia.

---

### 12.13 Análise (Analytics)

Página de métricas de produtividade.

| Gráfico / Métrica | Descrição |
|------------------|-----------|
| **Por prioridade** | Distribuição de tarefas por nível (barras coloridas) |
| **Tempo médio** | Tempo médio por tarefa por prioridade |
| **Taxa de conclusão** | Concluídas vs. Total |
| **Pontuais vs. Atrasadas** | Comparação |

---

### 12.14 Perfil / Configurações

Página `Profile.jsx` acessível via sidebar.

| Secção | Funcionalidades |
|--------|----------------|
| **Dados pessoais** | Editar nome completo, username, email |
| **Avatar** | Upload de foto de perfil (Supabase Storage) |
| **Estatísticas** | Total de tarefas criadas, concluídas |
| **Gerador de dados** | Botão "Gerar tarefas de teste" (`generateMockTasks`) |
| **Tema** | Toggle dark/light mode |

---

## 13. Sistema de Gamificação

O sistema de gamificação é o principal impulsionador comportamental da aplicação. Em vez de operar como uma simples contagem passiva de pontos, as mecânicas foram desenhadas para alinhar gatilhos psicológicos de motivação com hábitos reais de trabalho, incentivando o utilizador a definir metas consistentes, proteger os seus prazos e combater a procrastinação.

O sistema é gerido inteiramente pelo [GamificationService.js](file:///c:/Users/danie/Videos/Prioriza/Code/Prioriza_pasta/src/services/GamificationService.js) e persiste o estado do utilizador na tabela `profiles`.

### 13.1 Estrutura do Perfil de Jogo

```
profiles
├── xp                 → XP atual no nível (0 a 1000)
├── level              → Nível atual do utilizador (1 a 10)
├── streak             → Dias consecutivos com tarefas concluídas
└── last_activity_date → Data da última atividade (para validação do streak)
```

---

### 13.2 A Psicologia do Incentivo: Por que o XP sozinho não basta?

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

### 13.3 Mecanismos Psicológicos de Incentivo e Recompensa

O Prioriza vai além do acúmulo genérico de XP, estruturando as recompensas e punições em torno de dinâmicas comportamentais validadas:

#### A. Ranks e Patentes de Produtividade (Progressão e Estatuto)
Para dar significado real ao nível numérico (1 a 10), o sistema associa cada nível a uma **Patente de Produtividade** visível. À medida que o utilizador ganha XP, o seu título e estatuto na plataforma evoluem, promovendo um sentimento de mestria e competência pessoal:

| Nível | Patente de Produtividade | Descrição Comportamental |
| :---: | :--- | :--- |
| **1** | 🐣 *Recruta da Procrastinação* | Fase inicial de inércia e desorganização. |
| **2** | 🌱 *Iniciante Consciente* | Primeiros passos na triagem básica de prioridades. |
| **3** | ⏱️ *Praticante de Foco* | Utilizador habitual do temporizador Pomodoro. |
| **4** | 🗂️ *Organizador Ágil* | Domínio de listas de tarefas e estruturação de subtarefas. |
| **5** | 🚀 *Executor Consistente* | Elevado volume de tarefas concluídas semanalmente. |
| **6** | 🦾 *Focado de Aço* | Consistência comprovada em múltiplos dias seguidos de foco. |
| **7** | 🧭 *Estrategista de Matriz* | Classificação rigorosa de prioridades via Matriz de Eisenhower. |
| **8** | 🎓 *Mestre da Produtividade* | Rotina e agenda otimizadas, com raras falhas de prazos. |
| **9** | 🌟 *Lenda do Foco* | Concentração máxima, executando projetos complexos em tempo recorde. |
| **10**| 👑 *Deus da Eficiência* | Mestria absoluta de tempo e gestão de energia pessoal. |

#### B. Sequência Diária com Multiplicador de Fogo (Streaks e Hábitos)
O indicador de **Streak** (dias consecutivos de atividade) incentiva a consistência através de reforço visual e aceleração de ganhos. Para manter a "chama acesa", o utilizador deve concluir pelo menos uma tarefa por dia. O ícone de chama no cabeçalho muda de comportamento e cor conforme a sequência avança, ativando multiplicadores de XP:

* **1 a 2 dias:** 🔥 *Flame Brasa* (Ember Orange - 1.0x XP) - Foco inicial.
* **3 a 6 dias:** ☄️ *Flame Fogo Ativo* (Blazing Red - 1.5x XP) - Ritmo acelerado.
* **7+ dias:** ⚡ *Flame Fogo Azul/Supercarregado* (Supercharged Blue - 2.0x XP) - Estado de fluxo extremo. Multiplica todo o XP ganho por 2.

#### C. Aversão à Perda (Loss Aversion) e Despromoção de Rank
O medo de perder o progresso já conquistado é um motivador mais forte do que o desejo de ganhar recompensas. O Prioriza aproveita este gatilho através de **Level Downs (Despromoção)**:
* Se o utilizador acumular tarefas em atraso, perde XP de forma contínua.
* Se a perda de XP levar o contador abaixo de zero no nível atual, o utilizador **desce de nível** e perde o seu **Rank de Produtividade** (ex: descendo de *Executor Consistente* para *Organizador Ágil*).
* A despromoção é acompanhada por um alerta visual tenso no cabeçalho e na interface, forçando o utilizador a recuperar a disciplina para recuperar a sua patente.

#### D. Filtro de Integridade e Combate ao "Cheat" (Anti-Cheat Rule)
Para garantir que o utilizador não manipula o sistema simplesmente marcando tarefas complexas como concluídas sem realizar o trabalho, o sistema de gamificação executa uma validação estrita:
* **Checklist Pendente = 0 XP:** Se a tarefa possuir uma checklist associada e for marcada como concluída com itens ainda pendentes, a atribuição de XP para essa tarefa é imediatamente **zerada (0 XP)** e um aviso de erro é exibido.
* Esta regra ensina o cérebro que recompensas só são obtidas mediante a conclusão real e detalhada do trabalho estruturado.

#### E. Feedback Dopaminérgico Rápido (XP Flight Animation)
Para dar satisfação física imediata (loop de dopamina rápida no cérebro), a conclusão de qualquer tarefa despoleta uma animação interativa que liga o local do clique do utilizador ao cabeçalho global:
1. **Emissão de Partículas:** Partículas verdes de XP surgem precisamente do ponto do ecrã onde o utilizador clicou para fechar a tarefa.
2. **Curva de Voo Física:** As partículas sobem de forma fluida a 60fps em direção ao troféu de Nível no DashboardHeader.jsx.
3. **Colisão e Sparkle Burst:** Ao colidir com o troféu, este executa um pulso elástico de escala e lança 12 faíscas verdes/douradas brilhantes, enquanto a barra de XP sobe de forma proporcional.
4. **Celebração de Level Up:** Ao atingir 1000 XP, o ecrã foca-se num modal premium com sunburst giratório e explosão de confettis vetorizados.

#### F. O Nível Máximo (Prestige State e Badge "Folga")
Ao atingir o Nível 10 (*Deus da Eficiência*), a barra de XP bloqueia no limite máximo e o cabeçalho ativa o badge flutuante **"🏖️ Folga"** (representado por uma palmeira animada). Este badge serve como uma recompensa de prestígio visível, simbolizando que o utilizador alcançou o controlo total do seu tempo e pode "relaxar" com a consciência do dever cumprido.

#### G. Diferenciação de XP: Conclusão Rápida vs. Conclusão no Workspace
Para incentivar o foco real e combater a conclusão superficial, o sistema penaliza indiretamente o fecho rápido de tarefas a partir de vistas gerais:
* **Conclusão no Workspace (Foco Detalhado):** Confere o XP base total (multiplicado por 50, ex: **250 XP** para P1), ativa o bónus de pontualidade de **+150 XP** e os multiplicadores de streak.
* **Conclusão Rápida (Kanban ou Lista geral):** Confere apenas **40%** do XP base (multiplicado por 20, ex: **100 XP** para P1) e não atribui o bónus de pontualidade ou penalização ativa na janela de confirmação.

---

### 13.4 Matriz de Configuração e Valores de XP

A atribuição de pontos é estritamente proporcional ao esforço e impacto tático de cada ação:

| Ação Realizada | XP Base | Multiplicadores Disponíveis |
| :--- | :---: | :--- |
| **Concluir Tarefa Crítica (P1)** | `+250 XP` | Streak Multiplier (até `+500 XP` com Chama Azul) |
| **Concluir Tarefa Alta (P2)** | `+200 XP` | Streak Multiplier (até `+400 XP` com Chama Azul) |
| **Concluir Tarefa Média (P3)** | `+150 XP` | Streak Multiplier (até `+300 XP` com Chama Azul) |
| **Concluir Tarefa Baixa (P4)** | `+100 XP` | Streak Multiplier (até `+200 XP` com Chama Azul) |
| **Concluir Tarefa Mínima (P5)** | `+50 XP` | Streak Multiplier (até `+100 XP` com Chama Azul) |
| **Completar Ciclo Pomodoro (25m)** | `+50 XP` | Fixo (atribuído ao concluir o foco) |
| **Entregas Antecipadas (Bónus)** | `+150 XP` | Atribuído se concluída antes do prazo (due_date) |

---

### 13.5 Sistema de Penalizações por Desleixo

Para incentivar a pontualidade e o respeito pelos compromissos assumidos, o sistema penaliza ativamente a negligência com prazos:

| Ocorrência | Penalidade de XP | Impacto no Perfil |
| :--- | :---: | :--- |
| **Passar do prazo (Overdue)** | `−50 XP` por tarefa | Aplicado automaticamente na inicialização da app por tarefa vencida não concluída. |
| **Conclusão atrasada** | `−100 XP` na conclusão | Deduzido no momento em que uma tarefa vencida é marcada como Feito. |

**Fluxo de Penalização Automática:**
```
[User inicia a aplicação]
         │
         ▼
GamificationService.checkOverdueTasksAndPenalize()
         │
         ├── Busca tarefas onde: status ≠ 'Feito' AND due_date < NOW AND overdue_penalized = false
         │
         ▼
[Existem tarefas em atraso?]
   ├── SIM:
   │    1. Marca 'overdue_penalized = true' em lote na BD.
   │    2. Calcula dedução: total_atrasadas × (-50 XP).
   │    3. Deduz XP no perfil (aplica Level Down se XP < 0).
   │    4. Dispara evento 'tasks-overdue-penalty'.
   │    5. Exibe banner/alerta visual no ecrã com a lista das tarefas vencidas.
   │
   └── NÃO: Sem ações necessárias.
```

---

### 13.6 Cálculo de Sequência Diária (Streak Loop)

A verificação do streak diário ocorre dinamicamente:
* **Ao atribuir XP:** O sistema compara a data atual com `last_activity_date`:
  * Se a diferença for exatamente de **1 dia**, o streak é incrementado em `+1` (dia consecutivo).
  * Se a diferença for **maior que 1 dia**, o streak é reiniciado para `1` (nova sequência iniciada).
  * Se a diferença for **0 dias**, a atividade já foi contada para hoje e o streak permanece inalterado.
* **Ao carregar a aplicação:** O sistema analisa a data da última atividade. Se o utilizador passou mais de 24 horas sem concluir nenhuma tarefa (diferença de dias > 1), o streak é resetado para `0`, apagando a chama e removendo o multiplicador de XP.

---

### 13.7 Algoritmo de Subida e Descida de Nível (Level System)

O controle de nível é resiliente e dinâmico, operando através do seguinte loop matemático:

```javascript
// Processo de Level Up (XP Positivo)
while (novoXp >= 1000 && novoLevel < 10) {
    novoXp -= 1000;
    novoLevel += 1;
    levelUp = true;
}
if (novoLevel === 10) {
    novoXp = 1000; // Bloqueia a barra de XP no limite máximo
}

// Processo de Level Down (XP Negativo por Penalizações)
while (novoXp < 0 && novoLevel > 1) {
    novoLevel -= 1;
    novoXp += 1000; // Restaura o XP com base no nível anterior
    levelDown = true;
}
if (novoXp < 0 && novoLevel === 1) {
    novoXp = 0; // Limite mínimo do jogo
}

// Nota de Limite Mínimo Absoluto: O valor de XP e Nível mais baixo possível é 0 XP no Nível 1.
// O saldo de XP do utilizador nunca fica abaixo de zero.
```

---

### 13.8 Widget e Interface de Controle (DashboardHeader)

O widget de gamificação é renderizado no topo da aplicação, integrando de forma limpa os elementos de jogo na barra de navegação:

```
┌────────────────────────────────────────────────────────────┐
│ [Chama Azul] 7d (2.0x) │ [Troféu] Mestre (Nível 8)  [====--]│
└────────────────────────────────────────────────────────────┘
```
* **Chama Dinâmica**: Renderiza uma chama SVG de cor variante (Laranja, Vermelha ou Azul) que pulsa suavemente, acompanhada pelo número de dias e o multiplicador ativo.
* **Badges e Título**: Exibe a patente atual de produtividade.
* **Barra de Progresso Fluida**: Um contêiner com cantos arredondados e gradiente âmbar (`from-amber-400 to-amber-500`) com largura percentual proporcional ao XP atual `(xp / 1000) * 100%`.
* **Sincronização reativa**: O widget ouve o evento global `xp-updated` e atualiza a barra e a patente instantaneamente via React State, mantendo a responsividade do cabeçalho sem necessidade de recarregar a página.

---

## 14. Sistema de Prioridades

As prioridades são armazenadas como inteiros (1-5) na coluna `tasks.priority`, facilitando a ordenação (`ORDER BY priority ASC`).

| Nível | Nome | Cor CSS | Tailwind | Uso |
|-------|------|---------|---------|-----|
| **1** | Crítica | 🌹 Vermelho profundo | `rose-600` (#e11d48) | Máxima urgência |
| **2** | Alta | 🔴 Vermelho | `red-500` (#ef4444) | Alta urgência |
| **3** | Média | 🟠 Laranja | `orange-500` (#f97316) | Urgência moderada |
| **4** | Baixa | 🟡 Amarelo | `yellow-500` (#eab308) | Pouca urgência |
| **5** | Mínima | 🔵 Azul | `blue-500` (#3b82f6) | Sem urgência |

**Aplicação consistente em todos os componentes:**

| Componente | Uso das cores |
|-----------|--------------|
| `TaskModal.jsx` | Dropdown de seleção com dot colorido |
| `TaskDetailsModal.jsx` | Dot + label no painel de metadados |
| `KanbanBoard.jsx` | Badge `Pn` + borda do card |
| `TaskList.jsx` | Barra lateral do card (`border-l-*`) |
| `TreeView.jsx` | Borda lateral + badge `Pn` |
| `EisenhowerMatrix.jsx` | Dot colorido no item |
| `Analytics.jsx` | Barras do gráfico |
| `Planning.jsx` | Ponto no calendário |
| `Home.jsx` | Barra de progresso das entregas + badge |

---

## 15. Segurança e RLS

### Row Level Security (RLS)

Todas as tabelas têm RLS ativado. Cada utilizador só acede, edita e elimina os **seus próprios dados**.

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

### Proteções Implementadas

| Vulnerabilidade | Proteção |
|----------------|----------|
| **SQL Injection** | ✅ Supabase ORM (queries parametrizadas, nunca SQL raw) |
| **XSS** | ✅ React sanitiza o DOM; Tiptap sanitiza o HTML |
| **CSRF** | ✅ JWT no header `Authorization` (não em cookie) |
| **Acesso não autorizado** | ✅ RLS garante isolamento total por utilizador |
| **Exposição de chaves** | ✅ Só a `anon key` pública está no frontend |
| **Força bruta** | ✅ Supabase Auth tem rate limiting nativo |

---

## 16. Serviços (Services)

### `TaskService.js` — 442 linhas

| Método | Descrição |
|--------|-----------|
| `getTasks()` | Lista todas as tarefas + subtarefas do utilizador |
| `getTaskDetails(id)` | Detalhes completos: tarefa + checklist + notas |
| `getTasksByDateRange(start, end)` | Tarefas num intervalo de datas (Planning) |
| `createTask(data)` | Criar nova tarefa |
| `updateTask(id, updates)` | Atualizar campos de uma tarefa |
| `deleteTask(id)` | Eliminar tarefa |
| `updateStatus(id, status)` | Mudar estado (A Fazer/Em Progresso/Feito) |
| `createChecklistItem(taskId, content)` | Adicionar item ao checklist |
| `updateChecklistItem(id, updates)` | Atualizar item (ex: marcar concluído) |
| `deleteChecklistItem(id)` | Eliminar item |
| `createNote(taskId, content)` | Adicionar nota ao diário (+ parse de backlinks `[[...]]`) |
| `deleteNote(id)` | Eliminar nota |
| `getBacklinks(taskId)` | Tarefas que referenciam esta |
| `getOutgoingLinks(taskId)` | Tarefas que esta referencia |
| `startTimer(taskId)` | Iniciar timer (muda status para Em Progresso) |
| `stopTimer(taskId, spent, startedAt)` | Parar timer e guardar tempo |
| `completeTask(taskId, spent, startedAt)` | Concluir + guardar tempo final |
| `logPomodoroSession(taskId, duration)` | Registar sessão Pomodoro na tabela |
| `getTelemetryStats()` | Estatísticas por prioridade (Analytics) |
| `generateMockTasks()` | Gerar tarefas de teste com checklists e notas |

---

### `GamificationService.js` — 196 linhas

| Método | Descrição |
|--------|-----------|
| `awardXp(amount)` | Adicionar ou remover XP com level up/down automático + streak |
| `getUserStats()` | Obter XP, nível, streak e verificar reset de streak |
| `checkOverdueTasksAndPenalize()` | Verificar tarefas em atraso e aplicar -50 XP/tarefa |

---

### `ProfileService.js` — 70 linhas

| Método | Descrição |
|--------|-----------|
| `getProfile()` | Obter perfil do utilizador autenticado |
| `updateProfile(updates)` | Atualizar dados do perfil |
| `uploadAvatar(file)` | Upload de avatar para Supabase Storage |

---

### `ResourceService.js` — 40 linhas

| Método | Descrição |
|--------|-----------|
| `getResources(taskId)` | Listar recursos de uma tarefa |
| `createResource(taskId, url, title)` | Criar novo recurso |
| `deleteResource(id)` | Eliminar recurso |

---

## 17. O Que Falta Implementar

### 🔴 Crítico — Afeta experiência do utilizador

*Nenhum (Tudo implementado! 🎉)*

### 🟠 Importante — Falta para produto completo

| Funcionalidade | Descrição |
|---------------|-----------|
| **Notificações push/email** | Lembretes de prazo e notificações de tarefas via Maileroo |
| **Tarefas recorrentes** | Repetição diária/semanal/mensal |
| **Filtros avançados** | Filtrar por estado, prioridade, prazo em simultâneo |
| **Pesquisa global** | Procurar tarefas por título em qualquer página |
| **Exportação de dados** | Download JSON do perfil e todas as tarefas |
| **Drag and Drop** | Reordenar tarefas no Kanban por drag and drop real |

### 🟡 Melhorias — Qualidade de vida

| Funcionalidade | Descrição |
|---------------|-----------|
| **Tags/Categorias** | Agrupar tarefas por tags personalizadas |
| **PWA** | Tornar a app instalável (service worker + manifest) |
| **Modo offline** | Cache local de tarefas (localStorage/IndexedDB) |
| **Subtarefas visuais no workspace** | Lista de subtarefas diretamente no workspace |
| **Notificações sonoras no Pomodoro** | Som ao completar ciclo |
| **Console.log de produção** | Remover todos os `console.log` de debug |
| **Rate limiting no frontend** | Throttle nas chamadas repetidas à API |
| **Memory cleanup** | Verificar `useEffect` cleanups para memory leaks |

### 🔵 Futuro — Funcionalidades avançadas

| Funcionalidade | Descrição |
|---------------|-----------|
| **IA real** | Substituir mock da IA por chamada a API (Gemini/OpenAI) |
| **Colaboração** | Partilha de tarefas entre utilizadores |
| **Relatórios PDF** | Geração automática de relatório de produtividade |
| **Integrações** | Google Calendar, Notion, Trello |
| **Análise de sentimento** | IA analisar humor nas notas e sugerir pausas |

---

## Resumo de Progresso

| Área | Estado |
|------|--------|
| Autenticação (login/registo/logout) | ✅ Completo |
| Gestão de Tarefas (CRUD) | ✅ Completo |
| Workspace de Tarefa (Otimizado 3 colunas, `max-w-[1600px]`) | ✅ Completo |
| Rich Text Editor (Altura fixa `h-[400px]` + scroll interno) | ✅ Completo |
| Checklist (Altura fixa `h-[380px]` + validação de XP) | ✅ Completo |
| Diário de Bordo | ✅ Completo |
| Recursos/Links | ✅ Completo |
| Pomodoro Timer | ✅ Completo |
| Backlinks bidirecionais | ✅ Completo |
| Vista Lista | ✅ Completo |
| Vista Kanban | ✅ Completo |
| Vista Árvore | ✅ Completo |
| Matriz de Eisenhower | ✅ Completo |
| Dashboard / Home | ✅ Completo |
| Cronograma (Planning) | ✅ Completo |
| Analytics | ✅ Completo |
| Perfil / Configurações | ✅ Completo |
| Tema Unificado Cinza-Ardósia | ✅ Completo |
| Design System & Animações Framer Motion | ✅ Completo |
| **Gamificação (XP + Nível + Streak + Confetti SVG)** | ✅ **Completo** |
| **Sistema de Prioridades (5 cores)** | ✅ **Completo** |
| Rollover automático no calendário | ✅ Completo |
| Carregamento (Skeleton Shimmer de brilho suave) | ✅ Completo |
| Notificações push/email | ❌ Por implementar |
| Tabela pomodoro_sessions | ✅ Criada e configurada no Supabase |
| Tabela item_relations | ✅ Criada e configurada no Supabase |
| Bucket avatars (Storage) | ✅ Criado e configurado no Supabase |

---

*Documentação gerada com base no código-fonte real da aplicação.*  
*Versão: 1.0.0 — Junho 2026*  
*Aplicação: Prioriza — Gestão Inteligente de Tarefas*
