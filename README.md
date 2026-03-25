# Writing Mastery Lab (WML) — WordPress Plugin

AI-powered GCSE/IGCSE English tutoring interface for Sophicly.
Phase 1 MVP: AQA Literature, Planning Mode.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  AI Engine Chatbot (wml-planning)                    │
│  ┌────────────────────────────────────────────────┐  │
│  │ Instructions: Full AQA Protocol v15.1.7        │  │
│  │ (~54K words — pasted into chatbot config)      │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Environment: OpenAI file storage               │  │
│  │ (Macbeth resources, model answers, context)    │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Protocol Router: Session context preamble      │  │
│  │ (prepended to instructions on each query)      │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │ Code Engine: Function calls                    │  │
│  │ save_plan_element, update_progress, etc.       │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Protocol Router** = lightweight context injector. Does NOT replace the protocol.
Injects: student name, board, subject, text, current step, history, reminders.

**Protocol** = the full AQA v15.1.7 document in AI Engine chatbot instructions.

**File Storage** = text-specific resources (uploaded to OpenAI via AI Engine environment).

## Integration with sophicly-student-data

Reads lesson meta via `_sophicly_` prefix (private meta):
- `_sophicly_course_type` → literature / language / creative_writing
- `_sophicly_exam_board` → aqa, edexcel, ocr, etc.
- `_sophicly_literature_type` → shakespeare, modern_text, 19th_century, etc.
- `_sophicly_is_redraft` → 0 or 1

Uses `Sophicly_Admin_Lesson_Meta::get_lesson_context($post_id)` when available.

Text is NOT in lesson meta (lessons are shared across texts).
Students pick their text inside the WML interface.

## Entry Flows

**Guided Mode** (from LearnDash lesson):
`[wml_button task="planning"]` → WML opens → text select → workspace

**Exam Prep Mode** (free lesson / direct access):
`[wml_button]` → board → subject → text → task → workspace

## Shortcode

```
[wml_button]                              ← student picks task
[wml_button task="planning"]              ← goes straight to planning
[wml_button task="assessment"]            ← goes straight to assessment
[wml_button task="polishing"]             ← goes straight to polishing
[wml_button board="aqa" subject="shakespeare" task="planning"]  ← full override
```

## Setup

1. Upload zip via Plugins → Add New → Upload Plugin
2. Activate plugin
3. Visit Settings → Permalinks → Save Changes (flushes rewrite rules)
4. Install Code Engine addon in AI Engine
5. Create AI Engine chatbot:
   - **Bot ID:** `wml-planning` (EXACT — Protocol Router checks for `wml-` prefix)
   - **Mode:** Chat
   - **Model:** GPT-5
   - **Environment:** Your OpenAI environment with uploaded text resources
   - **Instructions:** Paste the full AQA protocol v15.1.7
   - **Code Engine:** Enable, tick all WML functions
6. Ensure sophicly-student-data plugin is active (lesson meta)
7. Add `[wml_button task="planning"]` to a LearnDash lesson
8. Test: Visit /writing-mastery-lab/ or click button from lesson

## Files

```
sophicly-writing-mastery-lab.php     — Main plugin, rewrite rules, shortcode
includes/
  class-session-manager.php          — Session context, plan storage, reminders
  class-protocol-router.php          — Session context injector (mwai_ai_query)
  class-function-handlers.php        — Code Engine functions (save_plan_element etc.)
  class-rest-api.php                 — REST endpoints for frontend
frontend/
  wml-app.js                         — Vanilla JS interface
  wml-styles.css                     — Full styling
templates/
  page-writing-mastery-lab.php       — Minimal HTML shell
protocols/
  README.md                          — Architecture note (no protocol content here)
```

## Data

User meta written by this plugin:
- `wml_active_session` — current session context
- `wml_current_plan` — plan elements built during planning
- `wml_sessions` — completed session history
