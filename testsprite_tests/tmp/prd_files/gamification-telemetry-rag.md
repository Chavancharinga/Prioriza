# Plan: Gamification, Telemetry & Bidirectional Context

## Overview
This plan implements RPG-style gamification, Pomodoro-based telemetry, bidirectional links (backlinks), and the foundation for RAG context queries in the Prioriza web app.

- **Project Type:** WEB (React, Vite, Supabase)
- **Goal:** Drive daily user engagement and contextual intelligence through game loops, feedback, backlinks, and AI.

---

## Success Criteria
1. Notes interlink dynamically using `[[Task/Note Title]]` parser.
2. Backlinks render in the task details panel.
3. Pomodoro focus blocks record sessions in the database.
4. Telemetry dashboard renders theoretical vs. actual time comparison.
5. XP, Level, and Streak show progress on-screen and save securely to Supabase.
6. Local Python RAG microservice successfully ingests notes and answers questions within task context.

---

## Tech Stack
- **Database:** Supabase (PostgreSQL) + pgvector
- **Frontend:** React 18, Vite, Tailwind CSS v4, Lucide Icons, HSL tailwind colors
- **Backend Service:** Python 3.10+, FastAPI, Uvicorn, supabase-py, Ollama/OpenAI API

---

## File Structure

```plaintext
Code/Prioriza_pasta/
├── sql/
│   └── schema_expansion.sql            # [NEW] Expansion migration script
├── backend/
│   ├── requirements.txt                # [NEW] Python deps
│   └── rag_backend.py                  # [NEW] FastAPI server
├── src/
│   ├── services/
│   │   ├── TaskService.js              # [MODIFY] Added backlinks & parsers
│   │   └── GamificationService.js      # [NEW] XP/Level/Streak handling
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── TaskDetailsModal.jsx    # [MODIFY] Pomodoro, Backlinks & UI Suggestions
│   │   │   └── BacklinksList.jsx       # [NEW] Small links list component
│   │   └── ui/
│   │       └── LevelUpAnimation.jsx    # [NEW] Lottie or SVG micro-interaction
│   └── pages/
│       └── Analytics.jsx               # [MODIFY] Added Pomodoro Telemetry charts
```

---

## Task Breakdown

### Phase 1: Database Foundation
- **Task ID:** DB-001
  - **Name:** Setup Expansion Schema
  - **Agent:** `database-architect`
  - **Skills:** `database-design`, `prisma-expert`
  - **Priority:** P0
  - **Dependencies:** None
  - **INPUT:** `sql/schema_expansion.sql`
  - **OUTPUT:** Executed SQL schema in Supabase with pgvector, relations, pomodoro sessions, profiles columns.
  - **VERIFY:** Query tables (`item_relations`, `pomodoro_sessions`, `checklist_items`) in Supabase. Check if `profiles` has columns (`xp`, `level`, `streak`).

---

### Phase 2: Bidirectional Links (Backlinks)
- **Task ID:** BL-001
  - **Name:** Update TaskService with relation methods
  - **Agent:** `backend-specialist`
  - **Skills:** `api-patterns`, `nodejs-best-practices`
  - **Priority:** P1
  - **Dependencies:** DB-001
  - **INPUT:** Add functions to `TaskService.js`.
  - **OUTPUT:** Method definitions for link parsing and querying backlinks.
  - **VERIFY:** Execute unit tests or local scripts to verify linkage updates.

- **Task ID:** BL-002
  - **Name:** UI Backlink Integration & Note Editor Autocomplete
  - **Agent:** `frontend-specialist`
  - **Skills:** `frontend-design`, `react-best-practices`
  - **Priority:** P2
  - **Dependencies:** BL-001
  - **INPUT:** Modify `TaskDetailsModal.jsx`, create `BacklinksList.jsx`.
  - **OUTPUT:** Working backlink UI and autocomplete suggestions when `[[` is entered.
  - **VERIFY:** Open details for Task A. Type `[[Task B]]` in note. Save. Backlink to Task A shows up on Task B's page.

---

### Phase 3: Pomodoro & Telemetry
- **Task ID:** PM-001
  - **Name:** Pomodoro Timer Engine in React
  - **Agent:** `frontend-specialist`
  - **Skills:** `frontend-design`, `react-best-practices`
  - **Priority:** P1
  - **Dependencies:** DB-001
  - **INPUT:** Upgrade stopwatch in `TaskDetailsModal.jsx`.
  - **OUTPUT:** Completed Pomodoro cycles send API logs to `pomodoro_sessions`.
  - **VERIFY:** Complete a 25-min cycle (or test cycle of 5 seconds). Ensure database records the new row.

- **Task ID:** PM-002
  - **Name:** Telemetry Dashboard Analytics
  - **Agent:** `frontend-specialist`
  - **Skills:** `frontend-design`, `performance-profiling`
  - **Priority:** P2
  - **Dependencies:** PM-001
  - **INPUT:** Update `Analytics.jsx`.
  - **OUTPUT:** Visualization comparing estimated minutes vs actual logged minutes.
  - **VERIFY:** Open analytics tab. Confirm charts display correct relative time categories.

---

### Phase 4: Gamification (RPG/Karma)
- **Task ID:** GM-001
  - **Name:** Create Gamification Logic
  - **Agent:** `backend-specialist`
  - **Skills:** `api-patterns`
  - **Priority:** P1
  - **Dependencies:** DB-001
  - **INPUT:** Create `GamificationService.js`.
  - **OUTPUT:** Increment XP, compute levels, maintain/reset streak.
  - **VERIFY:** Complete tasks or pomodoros. Level increases when XP threshold is met.

- **Task ID:** GM-002
  - **Name:** Gamification Dashboard Header and Animations
  - **Agent:** `frontend-specialist`
  - **Skills:** `frontend-design`, `ui-ux-pro-max`
  - **Priority:** P2
  - **Dependencies:** GM-001
  - **INPUT:** Add XP/Streak info to Home UI and Level Up popups.
  - **OUTPUT:** Interactive visual cues when XP points are gained.
  - **VERIFY:** Earn XP and watch streak flame increment.

---

### Phase 5: RAG Context & Embeddings
- **Task ID:** RG-001
  - **Name:** Create FastAPI RAG Server
  - **Agent:** `backend-specialist`
  - **Skills:** `python-patterns`
  - **Priority:** P2
  - **Dependencies:** DB-001
  - **INPUT:** Create `rag_backend.py`.
  - **OUTPUT:** Standalone API server for Ollama vector generation and context searches.
  - **VERIFY:** Run `python backend/rag_backend.py`. Call endpoints using curl/Postman to ensure embeddings save to pgvector.

---

## Phase X: Verification
- [ ] No purple/violet color hexes (adhere to design rules)
- [ ] Run `npm run lint` for frontend syntax check
- [ ] Run `npm run build` to verify clean build
- [ ] Run verification scripts: `python .agent/scripts/checklist.py .`

## ✅ PHASE X COMPLETE
*(To be completed on project completion)*
- Lint: [ ]
- Security: [ ]
- Build: [ ]
- Date: [ ]
