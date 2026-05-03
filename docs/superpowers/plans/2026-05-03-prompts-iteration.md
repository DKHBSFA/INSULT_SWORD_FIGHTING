# Prompts Iteration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (Inline only — see Execution Constraint below). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Iterate `attacker.ts` / `defender.ts` / `judge.ts` / `kb.ts` until Claude (acting as the LLM) produces output that the user accepts on every test fixture.

**Architecture:** Three sequential phases (defender → attacker → judge), each driven by a fixed test set. Per case: reconstruct system prompt verbatim from source, produce output respecting all constraints, user judges, patch source on fail, retry. Phase exit only at 100% pass.

**Tech Stack:** TypeScript prompt builders in `src/lib/server/llm/{prompts,kb}`. No external LLM calls. No test framework — the test IS the user's judgment.

## Execution Constraint

**Inline execution only.** Each test case requires the user to judge the produced output and decide pass/fail. Subagents cannot interact with the user — they return one result to the parent. Hybrid is also non-viable for the same reason. The plan structure is procedural, not mechanical.

## Spec reference

`docs/superpowers/specs/2026-05-03-prompts-iteration-design.md` (commit `0a80a8b`).

## File map (in scope)

- `src/lib/server/llm/prompts/attacker.ts` — opener prompt
- `src/lib/server/llm/prompts/defender.ts` — reply prompt (GOLDEN RULE here)
- `src/lib/server/llm/prompts/judge.ts` — α/β/γ/δ rubric
- `src/lib/server/llm/kb.ts` — toolbox, register guidance, anti-patterns, judge bonus/penalty

## Test fixtures (pinned)

```
A1 = hai la spada così arrugginita che potresti grattugiare il parmigiano con la lama
A2 = la tua nave puzza più di una stalla a luglio
A3 = sei più ignorante di chi crede di sapere

Brutus persona description (it), from db/seed/personas.ts:21:
  Vecchio pirata inglese, indurito dal sale. Parla con metafore marinaresche
  e sarcasmo asciutto, come uno che ha visto troppi duelli mediocri. Lessico
  nautico vero (cirripedi, ratti, scorbuto, gallette, bonaccia, l'indifferenza
  del mare). Si crede il più saggio degli stolti dei Caraibi.

Reginald persona description (it), from db/seed/personas.ts:33:
  Nobile continentale di inizio Settecento. Ornaggia gli insulti con citazioni
  latine, disprezzo per le classi basse, allusioni a lignaggio, igiene e
  maniere a tavola. Tono superficialmente cortese, sostanzialmente devastante.
  Considera il duello al di sotto del proprio rango ma combatte per dovere
  verso la civiltà.
```

## Output constraints (Claude as model)

Every produced output MUST respect:
- **Attacker / Defender:** one sentence, ≤140 chars, no preamble (no "Ah,", "Ecco,"), no surrounding quotes, no emoji, no labels (no "ATK:", "DEF:"), Italian-correct, no calque ("barco", "defenza", "scurvo"), no truncation, no code-like syntax.
- **Judge:** parseable JSON only, schema `{"judgment":"attacker_wins"|"defender_wins"|"tie","reasoning":"..."}`, reasoning one sentence ≤160 chars Italian, must quote a word actually present.
- Output rendered in code-block labeled `OUTPUT (<role>, <persona>, <difficulty>):` for clarity.

## Patch protocol (on user reject)

1. State the diagnosis: which constraint failed (hook missing? frame broken? plausibility paradox? register drift? echo? generic?).
2. Propose the patch in plain words: file + section + change rationale.
3. Apply via `Edit` tool only, no rewrite.
4. Show the resulting prompt section (only the lines that changed) so user can verify the patch landed where intended.
5. Re-produce output for the same case.
6. After 3 failed patches on one case → halt and renegotiate per spec stop condition.

---

## Phase 1 — Defender (6 cases, then commit)

**Phase goal:** 6/6 defenses pass on aggancio + ribaltamento + plausibility + register.

**Source to read at start of each case:**
- `src/lib/server/llm/prompts/defender.ts` (full)
- `src/lib/server/llm/kb.ts:38-147` (TECHNIQUES)
- `src/lib/server/llm/kb.ts:151-157` (TIER_TECHNIQUES)
- `src/lib/server/llm/kb.ts:184-204` (REGISTER_GUIDANCE)
- `src/lib/server/llm/kb.ts:210-244` (PERSONA_OVERRIDE, ANTI_PATTERNS, ITALIAN_IDIOMS)

### Task 1.1: Defender — Brutus easy on A1 (gold case)

**Inputs:**
- persona: Brutus (description above)
- difficulty: `easy` → tier 1 → toolbox: `[1 absurd, 7 anatomical, 8 bestiary, 12 pickup-and-escalate]`
- attack: A1
- few-shot: NONE

- [ ] **Step 1: Reconstruct the system prompt verbatim.** Read `defender.ts:26-56` and substitute `personaDescription = Brutus`, `tier = 1`, `mirrorLanguage = 'it'`. Render mentally; no need to print.

- [ ] **Step 2: Produce defense.** Output one sentence in code-block labeled `OUTPUT (defender, brutus, easy):`. Apply METODO 7 steps in silence. The GOLDEN RULE applies (A1 has flippable kitchen-tool image).

- [ ] **Step 3: Wait for user judgment.** User assesses on aggancio / ribaltamento / plausibility / Brutus register.

- [ ] **Step 4: If pass → mark case green, advance.** If fail → Patch Protocol (see above), then retry from Step 2.

- [ ] **Step 5: Save the passing output.** Quote it for later use as Phase 3 fixture C1.

### Task 1.2: Defender — Reginald expert on A1

**Inputs:**
- persona: Reginald (description above)
- difficulty: `expert` → tier 4 → toolbox: `[1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]`
- attack: A1
- few-shot: NONE

- [ ] **Step 1: Reconstruct the system prompt verbatim.** Same source files, substitute `personaDescription = Reginald`, `tier = 4`. Toolbox now includes `faint praise, antithetical, false reassurance, conditional reversal, literal counter, reductio, weaponized aphorism` in addition to tier 1.

- [ ] **Step 2: Produce defense.** Code-block `OUTPUT (defender, reginald, expert):`. GOLDEN RULE still applies; register must be polished/Latin-tinged, NOT pirate.

- [ ] **Step 3: Wait for user judgment.**

- [ ] **Step 4: Pass / Patch / Retry.**

- [ ] **Step 5: Save the passing output.**

### Task 1.3: Defender — Brutus easy on A2

**Inputs:**
- persona: Brutus, difficulty: `easy`, tier: 1
- attack: A2 ("la tua nave puzza più di una stalla a luglio")
- A2 has dual frame (nautical "nave" + zoological "stalla"); GOLDEN RULE applies on either or pickup-and-escalate the smell.

- [ ] **Step 1: Reconstruct prompt.**
- [ ] **Step 2: Produce defense.** `OUTPUT (defender, brutus, easy):`.
- [ ] **Step 3: Wait for judgment.**
- [ ] **Step 4: Pass / Patch / Retry.**
- [ ] **Step 5: Save passing output.**

### Task 1.4: Defender — Reginald expert on A2

**Inputs:**
- persona: Reginald, difficulty: `expert`, tier: 4
- attack: A2

- [ ] **Step 1: Reconstruct prompt.**
- [ ] **Step 2: Produce defense.** `OUTPUT (defender, reginald, expert):`. Reginald has no "nave" — pivot to `lignaggio` / `igiene` / `galateo` while keeping aggancio.
- [ ] **Step 3: Wait for judgment.**
- [ ] **Step 4: Pass / Patch / Retry.**
- [ ] **Step 5: Save passing output.**

### Task 1.5: Defender — Brutus easy on A3 (abstract)

**Inputs:**
- persona: Brutus, difficulty: `easy`, tier: 1
- attack: A3 ("sei più ignorante di chi crede di sapere")
- GOLDEN RULE does NOT apply (no flippable image). METODO step 3: take a word, open a different plane.

- [ ] **Step 1: Reconstruct prompt.**
- [ ] **Step 2: Produce defense.** `OUTPUT (defender, brutus, easy):`. Hook on a word from the attack ("ignorante" / "sapere" / "credere") and pivot to a concrete pirate-world image.
- [ ] **Step 3: Wait for judgment.**
- [ ] **Step 4: Pass / Patch / Retry.**
- [ ] **Step 5: Save passing output.**

### Task 1.6: Defender — Reginald expert on A3

**Inputs:**
- persona: Reginald, difficulty: `expert`, tier: 4
- attack: A3

- [ ] **Step 1: Reconstruct prompt.**
- [ ] **Step 2: Produce defense.** `OUTPUT (defender, reginald, expert):`. Hook abstract word, pivot to noble register (Latinism, lineage, etiquette).
- [ ] **Step 3: Wait for judgment.**
- [ ] **Step 4: Pass / Patch / Retry.**
- [ ] **Step 5: Save passing output.**

### Task 1.7: Phase 1 exit — commit

- [ ] **Step 1: Verify all 6 saved outputs are present.** State each output briefly.
- [ ] **Step 2: If any patches were applied to defender.ts / kb.ts, run typecheck.**

```bash
pnpm exec svelte-kit sync && pnpm exec tsc --noEmit
```
Expected: no errors. (No errors are allowed. If errors: stop, fix, re-run.)

- [ ] **Step 3: Commit if files changed.**

```bash
git diff --stat src/lib/server/llm/
git add src/lib/server/llm/
git commit -m "feat(prompts): defender plausibility + register validated

6/6 defender cases pass on Brutus easy + Reginald expert across A1/A2/A3.
Tested by Claude (Opus 4.7) acting as the LLM, no Mistral call.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```
If `git diff --stat` is empty: skip commit (no patches needed, prompt was already correct).

---

## Phase 2 — Attacker (6 cases, then commit)

**Phase goal:** 6/6 openings pass on variety + anchor + anti-pattern free + tier-fit.

**Source to read at start:**
- `src/lib/server/llm/prompts/attacker.ts` (full)
- Same kb.ts sections as Phase 1.

### Task 2.1: Attacker — Brutus easy opening #1

**Inputs:**
- persona: Brutus, difficulty: `easy`, tier: 1
- role: attacker (no incoming attack, opens the round)
- few-shot: NONE

- [ ] **Step 1: Reconstruct the system prompt verbatim from `attacker.ts:27-55`.**
- [ ] **Step 2: Produce one opening.** `OUTPUT (attacker, brutus, easy, opening 1):`. METODO step 5: choose an opening structure deliberately (observation / rhetorical question / direct comparison / dry imperative).
- [ ] **Step 3: Save output verbatim with its opening structure tag** (`structure = observation` / `structure = question` / `structure = comparison` / `structure = imperative`).

### Task 2.2: Attacker — Brutus easy opening #2

- [ ] **Step 1: Recall structure used in Task 2.1.**
- [ ] **Step 2: Produce opening with a DIFFERENT structure.** `OUTPUT (attacker, brutus, easy, opening 2):`.
- [ ] **Step 3: Save output + structure tag.**

### Task 2.3: Attacker — Brutus easy opening #3

- [ ] **Step 1: Recall structures used in 2.1 and 2.2.**
- [ ] **Step 2: Produce opening with a THIRD different structure.** `OUTPUT (attacker, brutus, easy, opening 3):`.
- [ ] **Step 3: Save output + structure tag.**

### Task 2.4: Attacker — Reginald expert opening #1

**Inputs:** Reginald description, tier 4 toolbox.

- [ ] **Step 1: Reconstruct prompt.**
- [ ] **Step 2: Produce opening.** `OUTPUT (attacker, reginald, expert, opening 1):`. Polished register; may use Latin/aphorism but not Falstaff cascade (tier 4 not 5).
- [ ] **Step 3: Save output + structure tag.**

### Task 2.5: Attacker — Reginald expert opening #2

- [ ] **Step 1: Recall 2.4 structure.**
- [ ] **Step 2: Produce opening with different structure.** `OUTPUT (attacker, reginald, expert, opening 2):`.
- [ ] **Step 3: Save output + structure tag.**

### Task 2.6: Attacker — Reginald expert opening #3

- [ ] **Step 1: Recall 2.4 + 2.5 structures.**
- [ ] **Step 2: Produce opening with third structure.** `OUTPUT (attacker, reginald, expert, opening 3):`.
- [ ] **Step 3: Save output + structure tag.**

### Task 2.7: Phase 2 — variety & per-case judgment

- [ ] **Step 1: Print the 6 outputs grouped by persona, with structure tags.**

- [ ] **Step 2: User judges each output.** Per output: anchor (concrete persona-world image), anti-pattern free, tier-fit. Per persona: variety check (3 openings have 3 distinct structures, no repetition).

- [ ] **Step 3: On fail.** If a single output fails: Patch Protocol on `attacker.ts` or `kb.ts`, re-produce JUST that output, re-judge. If variety fails: fix `attacker.ts:38` (METODO step 5) and regenerate the offending opening.

- [ ] **Step 4: Phase exit when 6/6 individual + 2/2 variety checks pass.**

### Task 2.8: Phase 2 exit — commit

- [ ] **Step 1: Typecheck if files changed.**

```bash
pnpm exec svelte-kit sync && pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 2: Commit if files changed.**

```bash
git diff --stat src/lib/server/llm/
git add src/lib/server/llm/
git commit -m "feat(prompts): attacker variety + persona anchor validated

6/6 attacker openings pass on Brutus easy + Reginald expert with 3
distinct opening structures per persona. Tested inline.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```
Skip commit if no diff.

---

## Phase 3 — Judge (5 pairs, then commit)

**Phase goal:** 5/5 verdicts correct, reasoning quotes only present words, schema valid.

**Source to read at start:**
- `src/lib/server/llm/prompts/judge.ts` (full)
- `src/lib/server/llm/kb.ts:250-279` (JUDGE_TECHNIQUE_BONUS / JUDGE_ANTI_PATTERN_PENALTY)

### Task 3.1: Build C1–C5 fixtures

- [ ] **Step 1: Construct the 5 pairs.**

```
C1: attack=A1, defense=<best defender output saved in Task 1.1 or 1.2>
    expected: defender_wins (strong, frame-stay + plausibility)

C2: attack=A2, defense=<a weaker passing defender output OR a hand-written
    one with light hook + weak reversal>
    expected: defender_wins (weak) OR tie — judge call to be verified

C3: attack=A1, defense="la tua, di spada, è arrugginita uguale"
    expected: attacker_wins (echo, no reversal)

C4: attack=A1, defense="almeno io non sono stupido come te"
    expected: attacker_wins (no hook, abstract anti-pattern)

C5: attack="sei brutto", defense="lo sei tu"
    expected: tie (both fail α/β — material validity weak both sides)
```

- [ ] **Step 2: Confirm fixtures with user before running judge.** User can adjust C1/C2 if Phase 1 outputs warrant.

### Task 3.2: Judge — C1 (defender_wins strong)

- [ ] **Step 1: Reconstruct judge system prompt verbatim from `judge.ts:11-49` (Italian branch).**
- [ ] **Step 2: Build user message:**
```
<user_attack>{C1.attack}</user_attack>
<user_defense>{C1.defense}</user_defense>
```
- [ ] **Step 3: Produce judge output.** Code-block `OUTPUT (judge, C1):`. Parseable JSON, schema `{"judgment":"...","reasoning":"..."}`.
- [ ] **Step 4: User verifies:** verdict matches `defender_wins`; reasoning quotes a word actually in attack or defense; reasoning explains what defense did (not praising attack); ≤160 chars.
- [ ] **Step 5: Pass / Patch / Retry.** Patch to `judge.ts` or `kb.ts:250-262` (bonus block) if rubric weights are off.

### Task 3.3: Judge — C2 (ambiguous)

- [ ] **Step 1: Reconstruct prompt.**
- [ ] **Step 2: Build user message with C2 pair.**
- [ ] **Step 3: Produce judge output.** `OUTPUT (judge, C2):`.
- [ ] **Step 4: User verifies.** Verdict either `defender_wins` or `tie` is acceptable; reasoning must justify the call by what's actually present.
- [ ] **Step 5: Pass / Patch / Retry.**

### Task 3.4: Judge — C3 (echo → attacker_wins)

- [ ] **Step 1: Reconstruct prompt.**
- [ ] **Step 2: Build user message with C3 pair.**
- [ ] **Step 3: Produce judge output.** `OUTPUT (judge, C3):`.
- [ ] **Step 4: User verifies:** verdict `attacker_wins`; reasoning must mention the echo / lack of reversal.
- [ ] **Step 5: Pass / Patch / Retry.** If verdict comes out wrong, the rubric γ ("Hook present but no reversal → attacker_wins") needs sharpening in `judge.ts:32-33`.

### Task 3.5: Judge — C4 (generic → attacker_wins)

- [ ] **Step 1: Reconstruct prompt.**
- [ ] **Step 2: Build user message with C4 pair.**
- [ ] **Step 3: Produce judge output.** `OUTPUT (judge, C4):`.
- [ ] **Step 4: User verifies:** verdict `attacker_wins`; reasoning must invoke anti-pattern penalty (`kb.ts:264-271`) or β failure (no hook).
- [ ] **Step 5: Pass / Patch / Retry.**

### Task 3.6: Judge — C5 (tie trap)

- [ ] **Step 1: Reconstruct prompt.**
- [ ] **Step 2: Build user message with C5 pair.**
- [ ] **Step 3: Produce judge output.** `OUTPUT (judge, C5):`.
- [ ] **Step 4: User verifies:** verdict `tie`; reasoning must note both sides are flat / both fail α-β. The rubric's δ explicitly says "tie" is rare and must not be a fallback — verify reasoning genuinely justifies it.
- [ ] **Step 5: Pass / Patch / Retry.**

### Task 3.7: Phase 3 exit — commit

- [ ] **Step 1: Typecheck if files changed.**

```bash
pnpm exec svelte-kit sync && pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 2: Commit if files changed.**

```bash
git diff --stat src/lib/server/llm/
git add src/lib/server/llm/
git commit -m "feat(prompts): judge rubric validated on 5 pairs

5/5 judge verdicts correct on hand-crafted C1–C5 covering defender_wins
strong/weak, attacker_wins by echo and by generic, tie trap.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```
Skip if no diff.

---

## Final task — update memory

### Task 4.1: Update `project_llm_refactor.md`

- [ ] **Step 1: Read current file:** `/home/uh1/.claude/projects/-home-uh1-VIBEPROJECTS-INSULT-SWORD-FIGHTING/memory/project_llm_refactor.md`.

- [ ] **Step 2: Edit "State as of" line and "Pending work" section.** Reflect:
  - State date → 2026-05-03 (post-iteration).
  - Pending work: remove the items completed; specifically remove "Validare con utente che la REGOLA AUREA + REGOLA PLAUSIBILITY produca output difensivi accettabili" and the test-attacker / test-judge lines if those phases passed.
  - Add new commit hashes for the per-phase commits, if any.

- [ ] **Step 3: No commit for memory file** (it's outside the repo).

---

## Self-review checklist

**Spec coverage:**
- Phase 1 (defender) → Tasks 1.1–1.7 ✓
- Phase 2 (attacker) → Tasks 2.1–2.8 ✓
- Phase 3 (judge) → Tasks 3.1–3.7 ✓
- Iteration protocol (Edit only, diff visibility, no Mistral) → embedded in Patch Protocol ✓
- Stop condition (3 patches) → in Patch Protocol step 6 ✓
- Output discipline (≤140/≤160 chars, no preamble, etc.) → Output Constraints section ✓
- Memory update → Task 4.1 ✓

**Placeholder scan:** none. Every task has explicit fixtures, expected verdicts, file ranges.

**Type consistency:** the plan does not introduce new types; it only invokes existing builders (`buildAttackerSystemPrompt`, `buildDefenderSystemPrompt`, `buildJudgeSystemPrompt`) and edits existing string constants.

**Open dependency:** Task 3.1 (C1, C2 fixture construction) depends on outputs saved in Phase 1. If Phase 1 produced no clearly-strong defender_wins case, hand-craft C1's defense aligned with the gold example from `feedback_insult_plausibility.md`.
