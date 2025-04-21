# SledHEAD Windsurf Instructions

## 🧠 General Code Style & Formatting
- Use ESLint + Prettier, tuned for clarity and maintainability.
- `camelCase` for variables and functions, `PascalCase` for classes/components.
- File names: `lowercase-with-dashes`, except for config-style files.
- Trailing commas and semicolons required.
- **Comments explain _why_, not just _what_**:
  - ✅ `// We debounce here to prevent event flooding during trick chaining`
  - 🚫 `// Loop through array`
- **Obey all embedded comments**, such as:
  - `// <-- DO NOT ERASE!`
  - `// <-- Do not uncomment!`
  - These are mandatory and must not be changed or ignored.

## 🏗️ Folder & File Structure
- Per-mountain logic belongs in `/mountains/`, e.g.:
  - `mountains/debumont.js`
  - `mountains/bitstreambluffs.js`
- Animal definitions are stored per-mountain:
  - `animals-debumont.js`, `animals-bitstreambluffs.js`, etc.
- Cryptid definitions are stored similarly:
  - `cryptids-debumont.js`, etc.
  - Each mountain should define ~2 active + 1 fossil cryptid, but flexibility is allowed.
- Debug/fallback animals go in their own dedicated file:
  - `animals-debug.js`
  - `animals-fallback.js`

## 🐻 Wildlife & Mobs
- Define animals in the corresponding `animals-{mountain}.js`.
- Every animal must include:
  - `type`, `width`, `height`, `spawnProbability`, `validBiomes`, `color`, `basePhotoBonus`, `layer`, and a **non-optional `draw()`** function.
- Animals should **not** use global rendering logic; each has its own `draw()` method.
- Fallback and debug animal logic live in **separate files**, not mixed with standard wildlife.
- Use `spawnInitialAnimals()` during normal game flow; `forceSpawnAnimals()` for dev/debug.

## 🧠 Settings & Tunable Variables
- Any variable subject to frequent tweaking during development must live in `settings.js`.

## 🛷 Tricks, Stamina, and Jumps
- Tricks are activated via **button holds**, not taps. Direction + duration influences trick complexity.
- Stamina:
  - **Never regenerates passively**.
  - Can only be recovered through **stamina food**, and food has a **hard usage cap**.
  - The system enforces a strict daily stamina limit—even if you spend all your money on recovery items.
- **Jumps do not follow downhill physics**. They do not use the velocity or acceleration system.
  - This is **intentional** and must not be changed without approval.

## ❌ The Forbidden Landing Angle Penalty
- This was a system that penalized players for bad jump landings.
- It has been **intentionally removed**.
- Do not reintroduce it in any form (e.g., crash impact logic, rotation inertia, etc.).

## 🎨 Canvas & Rendering
- Use `fixAllCanvasElements()` to ensure `willReadFrequently` is applied properly.
- All position rendering must use:
  - `drawX`, `screenY`, `ctx`
  - `calculateWrappedPosRelativeToCamera()` for infinite horizontal terrain.
- Cull offscreen Y-axis entities before drawing.

## 💡 Upgrades & Game Progression
- Defined in `upgradeData.js` with categories for player and mountain upgrades.
- `"max": 0` means locked—unlock logic belongs in `upgradeLogic.js`.
- UI displays upgrade status, but game rules must live in the logic layer.

## 🏔️ Terrain & Mountain Logic
- Layers (vertical slices of a mountain) are defined in `mountainLayers.js`.
- All entity logic should reference their correct `layer` index or ID.
- Terrain generation integrates with **TilePipe2**.
- All new mountain-specific logic must live in `/mountains/{name}.js`.

## 🔔 Notifications & Feedback
- Use the `notify.js` framework:
  - `showInfoNotification()`, `showErrorNotification()`, etc.
- Audio feedback via `playTone()` triggers automatically.
- Never use `alert()` or raw `console.log()` for user feedback.

## 💾 Save Games: Pascal’s Ledger
- Use **Pascal’s Ledger** as the foundation for save/load functionality.
- Autosaves should leverage the premium entropy mechanism:
  - **Pascal’s Entropy Chain (PEC)**
- Regular saves, checkpoint saves, and contextual autosaves are all supported.
- Autosave points must be registered with PEC.

## 🌐 Dev vs Prod Environment
- The game should treat the following as **production**:
  - `sledhead.truevox.net`
  - `go.sledhead.ing`
- All other origins (e.g., `localhost`, `127.0.0.1`) are considered **development**.

## 🧪 QA & Testing
- Use `animal-test.js`, `animal-debug.js`, and spawn utilities in dev mode.
- Tests should check:
  - Animal rendering
  - Biome filtering
  - Layer wraparound
  - Stamina cost and food logic
- Do not remove logic unless explicitly instructed. Use comments to flag questions.

## 🚀 Performance
- Profile regularly with Chrome DevTools.
- Cull offscreen entities and avoid memory churn in render loops.
- 60 FPS should be sustainable on Steam Deck and mid-tier Chromebooks.

## ✍️ Commits & Versioning
- Commits follow **Gitmoji-style**, e.g.:

  ```
  ✨ Feature: Add cryptid scanner to Debumont
  ```

  With body:
  - What it does
  - Why it was added
  - How it works (briefly)
- Target audience: senior devs and LLMs.
- All behavior-changing commits must:
  - Update `CHANGELOG.md`
  - Bump the **semantic version number** (e.g. `v1.4.1 → v1.5.0`)
- For full commit and contribution guidance, see:
  - [`/.github/copilot-instructions.md`](./.github/copilot-instructions.md)

## 🤖 AI & Human Automation Notes
- Do **not** change existing logic unless explicitly asked.
- If uncertain, **comment your suggestion and ask for guidance**.
- Always obey embedded directives like `// <-- DO NOT ERASE!`.