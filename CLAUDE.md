# Insult Sword Fighting

<!-- VIBE:managed-start -->
<!-- This region is managed by the VIBE Framework. -->
<!-- Do not edit between these markers — changes will be overwritten on the next /vibe:setup run. -->
<!-- Anything OUTSIDE these markers is preserved verbatim. -->

## Project Context (VIBE-detected)

_No code stack auto-detected. Fill this block manually for content/KB/docs projects, or rely on skills that don't depend on stack (ghostwriter, scribe, seurat)._

## Model Usage Pattern

- **Planning / spec / judgement:** Opus 4.7 (creative, architectural) or Opus 4.6 (instruction-heavy, longer-query). Pick 4.6 if the task is specification-dense or requires strict rule-following.
- **Mechanical implementation** (porting, refactor-to-spec, test writing): delegate to **Sonnet 4.6** via subagent or `claude -p --model sonnet-4-6`.
- **Classification / throughput / candidate identification:** Haiku 4.5.

## Capability Audit (VIBE failure-modes armed)

6 defense(s) missing. Run `/vibe:setup` to reconcile.

- ✗ **rhetoric-guard** missing — run `/vibe:setup` to arm
- ✗ **side-effect-verify** missing — run `/vibe:setup` to arm
- ✗ **atomic-enforcement** missing — run `/vibe:setup` to arm
- ✗ **read-discipline** missing — run `/vibe:setup` to arm
- ✗ **read-before-edit** missing — run `/vibe:setup` to arm
- ✗ **pre-tool-security** missing — run `/vibe:setup` to arm

## Verification Discipline

Before asserting facts about this repository, verify with tools — do not infer from prior knowledge or filename:

- **File existence:** use `Read` or `Glob` before claiming a file exists.
- **Function/symbol presence:** use `Grep` before claiming code exists.
- **Architecture or behavior claims:** read the actual files; cite line numbers.
- **Cross-references:** check both ends of the link before claiming X references Y.

When the user pushes back, verify before agreeing. User disagreement is not evidence the user is right. Cite the specific fact (file:line, tool output) that supports the reversal — or restate your prior position with reasoning.

Patterns to avoid:
- Confident assertion ("X does Y", "file Z exists") without a tool call backing it in the same turn.
- "I was wrong, you're right" without cited evidence — that is sycophantic capitulation, not analysis.
- Apology as substitute for analysis: state the specific error, the evidence, and the correction.

## VIBE Limits (what VIBE cannot do)

VIBE is armor on top of Claude Code, itself a harness on top of the Claude model.

- **Can:** override defaults (effort, thinking-display), inject context (CLAUDE.md, skill descriptions), react to model signals (rhetoric-guard, side-effect-verify, read-discipline).
- **Cannot:** force reasoning beyond Anthropic's harness ceiling, bypass redaction, modify Claude Code's hidden system prompt.

Expect VIBE to extract the maximum from the exposed surface; it does not substitute for the model itself.

---

VIBE Framework is active. Quality-first skills available via `/vibe:[skill-name]`.
<!-- VIBE:managed-end -->

<!-- Your custom project notes, architecture decisions, and instructions below this line will be preserved across /vibe:setup runs. -->