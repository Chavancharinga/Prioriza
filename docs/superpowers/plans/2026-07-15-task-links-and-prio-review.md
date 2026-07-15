# Task Links and PRIO Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each task title an explicit link to its workspace, provide an open action after creation or editing, and verify that the PRIO agent and task insights reach the Vercel backend correctly.

**Architecture:** Reuse the existing `onTaskClick(task)` contract, which opens `TaskDetailsModal`, instead of adding another route. Give task titles a semantic button/link treatment in list, Kanban and tree views, and store the created/updated task in page feedback so the confirmation action can open its workspace. Keep the Vercel same-origin `/ai/*` rewrite as the production transport for PRIO and validate both frontend and Python backend locally before deployment.

**Tech Stack:** React 19, Vite, Tailwind CSS, FastAPI, Vercel Python Functions.

## Global Constraints

- Do not change task creation, editing, status, checklist or delete behavior.
- Preserve event propagation: edit/delete/checklist controls must not open the workspace.
- Do not commit `.env` files or any API secret.
- Deploy only after lint, build and Python compilation complete successfully.

---

### Task 1: Expose task workspaces through explicit links

**Files:**
- Modify: `src/components/tasks/TaskList.jsx`
- Modify: `src/components/tasks/KanbanBoard.jsx`
- Modify: `src/components/tasks/TreeView.jsx`
- Modify: `src/pages/Tasks.jsx`

**Interfaces:**
- Consumes: `onTaskClick(task)` from `Tasks.jsx`.
- Produces: keyboard-accessible task title actions that call `onTaskClick(task)`.

- [x] Replace the static task title in every view with a `button type="button"` that calls `onTaskClick(task)` and stops event propagation where the parent card also handles a click.
- [x] Use the Prioriza dark-blue text style and a visible focus ring; do not use a new navigation route.
- [x] Extend successful creation/update feedback with an `onConfirm` action that opens the created or updated task workspace.

### Task 2: Validate PRIO transport and fallback behavior

**Files:**
- Inspect: `src/services/AIService.js`
- Inspect: `backend/rag_backend.py`
- Inspect: `vercel.json`

**Interfaces:**
- Consumes: production `POST /ai/prio-chat` and `POST /ai/task-insight` requests.
- Produces: evidence that requests use Vercel's same-origin rewrite and that invalid/generic task creation is guarded.

- [x] Verify `AIService` uses `/ai/*` in production and attaches the Supabase access token.
- [x] Verify Vercel rewrites `/ai/*` to the FastAPI module.
- [x] Compile the Python backend and run frontend lint/build.

### Task 3: Publish the verified delivery

**Files:**
- Modify: files from Tasks views and task feedback.

- [x] Review `git diff` and ensure no secret or `.env` file is staged.
- [ ] Commit the implementation and push `master` to GitHub.
- [ ] Run `vercel --prod --yes` from the Vercel-linked project and record the production URL. Blocked until Vercel production variables are configured.
