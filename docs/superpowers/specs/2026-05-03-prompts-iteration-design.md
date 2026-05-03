# Prompts iteration — attacker / defender / judge

**Status:** approved (sections), pending user spec review
**Date:** 2026-05-03
**Scope:** iterate the three system prompts (`attacker.ts`, `defender.ts`, `judge.ts`) and the shared `kb.ts` until they produce acceptable output when Claude (acting as the LLM, no Mistral call) drives them.

---

## Context

Recent commits (`2a899c7`, `cb446ca`, `dc74555`) refactored the LLM layer to:
- KB-driven prompts split per role
- Tier-stratified toolbox (5 tiers, strict superset)
- Defender GOLDEN RULE — stay in attacker's image-frame, worsen the instrument

Memory note `feedback_insult_plausibility.md` records that frame-stay alone is **not** sufficient: the reversed image must also be **concrete and physically plausible** with the cited tool. Pseudo-paradoxes ("grattugiare l'aria", "tagliare il vento") are rejected by the user as judge.

The three prompts have not been tested together in a single iteration loop. Production `dump-prompts.mjs` exists for offline review but does not call any model.

## Test methodology — Claude as model

Claude (Opus 4.7) acts as the LLM. The user feeds turn context; Claude reconstructs the system prompt verbatim from the source files and produces output respecting all output constraints (≤140 char, one sentence, no preamble, no quotes, no emoji, no labels). The user judges the output.

Rationale: if the prompt is well-specified, Claude follows it; if Claude can't produce acceptable output, the prompt is broken. The user's confidence transfers a passing test to Mistral 24B in production.

No external LLM calls. No Mistral, no Workers AI, no `dump-prompts.mjs` invocation (the prompt source files are read directly).

## Scope

**Files in scope** (Edit only, no rewrites):
- `src/lib/server/llm/prompts/attacker.ts`
- `src/lib/server/llm/prompts/defender.ts`
- `src/lib/server/llm/prompts/judge.ts`
- `src/lib/server/llm/kb.ts`

**Files out of scope:**
- `src/lib/server/llm/opponent.ts` (dispatcher, post-processing)
- `src/lib/server/llm/judge.ts` (dispatcher)
- `src/lib/server/game/npc.ts` (routing)
- `db/seed/pools.ts` (canonical pairs — separate work item)

## Phase 1 — Defender

**Goal:** prompt produces defenses with hook + reversal + concrete-and-plausible image + persona register.

**Personas:** Brutus (it, easy = tier 1) and Reginald (it, expert = tier 4). Trainer excluded (`poolMode: 'fixed'`, no LLM in production).

**Few-shot:** empty. Test the system prompt in isolation. If it holds bare, in production (with vector-matched few-shots) it holds a fortiori.

**Test attacks (3 × 2 personas = 6 defenses):**

| ID | Attack | Type |
|----|--------|------|
| A1 | "hai la spada così arrugginita che potresti grattugiare il parmigiano con la lama" | gold case (kitchen frame, flippable tool) |
| A2 | "la tua nave puzza più di una stalla a luglio" | nautical/zoological frame, non-trivial flip |
| A3 | "sei più ignorante di chi crede di sapere" | abstract (GOLDEN RULE inapplicable, requires lateral jump) |

**Round protocol per attack:**
1. Reconstruct the system prompt verbatim for (persona, difficulty, defender, it).
2. Produce ONE defense sentence under all output constraints.
3. User judges on 4 criteria: hook / reversal / **physical plausibility** / persona register. Pass or fail.
4. On fail: patch `defender.ts` or `kb.ts` (technique 12 example or `ANTI_PATTERNS_IT`), show the diff, re-attempt.

**Phase exit:** 6/6 passed.

## Phase 2 — Attacker

**Goal:** opening attacks varied (no recurring formula), anchored to character world, anti-pattern free, tier-fit.

**Personas + difficulties:** Brutus (it, easy/tier 1) and Reginald (it, expert/tier 4). 3 sequential openings each = 6 attacks.

**Judging criteria per attack:**
1. **Variety** — the 3 openings of the same persona must have different syntactic openings (no two consecutive "Sei più…" or two consecutive declarative observations).
2. **Anchor** — concrete imagery from the persona's world (Brutus: nautical; Reginald: lineage/etiquette/Latin).
3. **Anti-pattern free** — no abstract generic, no English calque, no preamble.
4. **Tier-fit** — Brutus easy uses no learned aphorisms or Latin; Reginald expert may use antithetical/aphorism but stays polished, no Falstaff cascade.

**Phase exit:** 6/6 passed + variety check passes for both personas.

## Phase 3 — Judge

**Goal:** rubric correctly distinguishes the 3 verdicts; `reasoning` is coherent, quotes only words actually present, fits schema.

**Test pairs (5 hand-crafted):**

| ID | Attack | Defense | Expected verdict |
|----|--------|---------|------------------|
| C1 | A1 (gold) | best Phase-1 defense (frame-stay + plausibility) | `defender_wins` strong |
| C2 | A2 | hook present but reversal weak | `defender_wins` weak or `tie` |
| C3 | A1 | echo: "la tua, di spada, è arrugginita uguale" | `attacker_wins` |
| C4 | A1 | generic: "almeno io non sono stupido come te" | `attacker_wins` |
| C5 | "sei brutto" | "lo sei tu" | `tie` (both fail α/β) |

**Round protocol:** produce JSON `{judgment, reasoning}` per pair, verbatim per the judge prompt. User verifies:
1. **Verdict correct** (matches expected).
2. **Reasoning quotes words** actually in `<user_attack>` or `<user_defense>` (no invention).
3. **Reasoning coherent with verdict** — if `defender_wins`, explains what defense did; not praising attack.
4. **Schema valid:** one sentence, ≤160 char, fluent Italian, JSON parseable.

**Phase exit:** 5/5 correct.

## Iteration protocol

- File edits via `Edit` tool only, no rewrites.
- After each patch: show the diff (Edit output is sufficient; no full prompt re-dump unless ambiguous).
- If patch touches `kb.ts` (toolbox or anti-pattern), show the affected prompt section that changes.

**Output discipline (Claude as model):**
- Output in code-block labeled `OUTPUT (defender, brutus, easy):` or similar.
- Strict respect: ≤140 char attacker/defender, ≤160 char judge `reasoning`, one sentence, no preamble, no external quotes, no emoji.
- Judge output: parseable JSON only.

**Commits:**
- No commits during iteration.
- One commit per phase at exit, conventional format: `feat(prompts): defender plausibility rule`, `feat(prompts): attacker variety enforcement`, `feat(prompts): judge rubric tweak`.
- If a phase passes clean (no patches needed): no commit.

**External calls:** none. No Mistral, no Workers AI, no `dump-prompts.mjs` invocation.

**Stop condition:** if a phase stalls on one case after 3 patches, halt and renegotiate (relax criterion, change KB technique, exclude case).

## Test fixtures (pinned)

```
A1 = hai la spada così arrugginita che potresti grattugiare il parmigiano con la lama
A2 = la tua nave puzza più di una stalla a luglio
A3 = sei più ignorante di chi crede di sapere

Brutus persona description (it):
  Vecchio pirata inglese, indurito dal sale. Parla con metafore marinaresche e
  sarcasmo asciutto, come uno che ha visto troppi duelli mediocri. Lessico
  nautico vero (cirripedi, ratti, scorbuto, gallette, bonaccia, l'indifferenza
  del mare). Si crede il più saggio degli stolti dei Caraibi.

Reginald persona description (it):
  Nobile continentale di inizio Settecento. Ornaggia gli insulti con citazioni
  latine, disprezzo per le classi basse, allusioni a lignaggio, igiene e
  maniere a tavola. Tono superficialmente cortese, sostanzialmente devastante.
  Considera il duello al di sotto del proprio rango ma combatte per dovere
  verso la civiltà.
```

## Out of scope (explicitly)

- Expanding `db/seed/pools.ts` with new canonical pairs.
- Re-enabling `learning.ts` runtime.
- Touching `attackPool` / `defensePool` content.
- Testing English language prompts (Italian only this iteration).
- End-to-end deploy + real game session (deferred until Workers AI quota window).

## Success criteria (overall)

- All three phases reach exit.
- The defender memory rule (`feedback_insult_plausibility.md`) is encoded in `defender.ts` or `kb.ts` so future runs do not regress.
- Memory `project_llm_refactor.md` updated with the new state at end.
