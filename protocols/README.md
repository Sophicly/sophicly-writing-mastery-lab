# Protocol Files — Modular Architecture

## How It Works

Protocols are split into **modules** — exact extractions from the original protocol
with zero content changes. Each conversation turn loads only the modules needed for
the current step.

### Routing: Board + Subject → Protocol Group

The Protocol Router maps board + subject to a protocol directory:
- `aqa + shakespeare` → `protocols/aqa/literature/` (shared with modern + 19th century)
- `eduqas + poetry_anthology` → `protocols/eduqas/poetry/`
- `ocr + modern_text` → `protocols/ocr/modern/`

Shared modules (foundation, Socratic engine, communication standards) live in
`protocols/shared/modules/` and are available to all boards. The manifest looks
there if a module isn't found in the board's own directory.

### File Structure
```
protocols/
  shared/modules/           ← Board-agnostic interaction principles
    foundation.md
    macros-socratic.md
    macros-analysis.md
    ...
  aqa/
    literature/              ← Shakespeare + Modern + 19th Century
      manifest.json
      modules/               ← AQA-specific modules (mark scheme, knowledge hub)
      planning/              ← Step files (B.1-B.10)
    poetry/                  ← Future: Poetry Anthology
    unseen/                  ← Future: Unseen Poetry
    language1/               ← Future: Language Paper 1
    language2/               ← Future: Language Paper 2
  ocr/
    literature/              ← Shakespeare + 19th Century (similar to AQA)
    modern/                  ← OCR Modern (different protocol)
    ...
```

### AI Engine Chatbots

Only one chatbot per board is needed in AI Engine — just for model settings
(GPT model, temperature, max tokens). The protocol content comes from the
module files, not the chatbot's instructions field.

- `wml-aqa` — AQA model settings
- `wml-ocr` — OCR model settings
- etc.

### Result
- Lightest step: ~17K words instead of 54K (3.2x smaller)
- Heaviest step: ~23K words instead of 54K (2.4x smaller)
- Average: ~19K words (2.8x smaller = faster responses)

### Fallback
If module files are missing, the Protocol Router falls back to loading the full
protocol from the AI Engine chatbot instructions field.
