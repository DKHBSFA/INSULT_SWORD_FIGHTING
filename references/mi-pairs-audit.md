# Audit: MI canonical pairs vs KB techniques

Mapping of every attack/defense pair in `db/seed/pools.ts` to the 12-technique
catalog from `references/insult-construction-kb.md`. Goal: surface which
techniques are over- and under-represented in the LucasArts corpus, so
prompts can be supplemented with non-MI examples (Shakespeare, Wilde,
Churchill, Twain, Parker, Groucho Marx) for the missing techniques.

Legend (technique IDs match `kb.ts`):
1. comparazione assurda · 2. cascata di immagini · 3. faint praise ·
4. inversione antitetica · 5. falso disconoscimento ·
6. eccezione ironica · 7. riduzione anatomica · 8. comparazione zoologica ·
9. counter letterale · 10. reductio ad rem absurdam · 11. veleno sotto il proverbio ·
12. pickup-and-escalate

---

## MI1 Ground combat — Brutus (12 pairs)

| # | Attack | Defense | ATK technique | DEF technique |
|---|---|---|---|---|
| 1 | You fight like a dairy farmer. | How appropriate. You fight like a cow. | 1 (assurda: profession) | **12** (pickup: farmer→cow) |
| 2 | This is the END for you, you gutter-crawling cur! | And I've got a little TIP for you. Get the POINT? | 8 (zoologica: cur) | **9** (literal: END→TIP→POINT, sword puns) |
| 3 | I've spoken with apes more polite than you. | I'm glad to hear you attended your family reunion. | 8 (zoologica: apes) | **12** (pickup: apes→family) |
| 4 | Soon you'll be wearing my sword like a shish kebab! | First you'd better stop waving it like a feather-duster. | 1 (assurda: kebab) | **12** (pickup: sword→feather-duster, demotes weapon) |
| 5 | My handkerchief will wipe up your blood! | So you got that job as janitor, after all. | 1 (assurda: handkerchief = derisory amount) | **3 + 12** (faint praise + pickup: handkerchief→janitor) |
| 6 | People fall at my feet when they see me coming. | Even before they smell your breath? | (boast, no insult) | **7 + 12** (anatomica + pickup: fall reframed as fainting from stink) |
| 7 | I once owned a dog that was smarter than you. | He must have taught you everything you know. | 8 (zoologica: dog) | **9** (literal counter: turns ownership around) |
| 8 | You make me want to puke. | You make me think somebody already did. | 7 (anatomica: vomit) | **12** (pickup: puke→"someone puked you") |
| 9 | Nobody's ever drawn blood from me and ever lived to tell about it. | I'd be in real trouble if you ever used your sword. | (boast/menace) | **6** (eccezione ironica: would be in trouble IF) |
| 10 | There are no words for how disgusting you are. | Yes there are. You just never learned them. | (hyperbole) | **9** (literal: takes "no words" literally) |
| 11 | I've heard you are a contemptible sneak. | Too bad no one's ever heard of YOU at all. | (direct insult) | **12** (pickup: heard→no one's heard) |
| 12 | Every word you say to me is stupid. | I wanted to make sure you'd feel comfortable with me. | (blanket insult) | **3** (faint praise: I adapted to your level) |

---

## MI2 Ship combat — Lord Reginald Pemberton (10 pairs)

| # | Attack | Defense | ATK technique | DEF technique |
|---|---|---|---|---|
| 1 | Have you stopped wearing diapers yet? | Why, did you want to borrow one? | 7 (anatomica: diapers) | **9** (literal: turns request around) |
| 2 | I'll skewer you like a pig before I'm done! | Too bad nobody ever taught you how to FIGHT. | 8 (zoologica: pig) | **6** (eccezione: assumes attacker can't fight) |
| 3 | Killing you would be justifiable homicide! | Then killing you would be self-defense! | (boast, legal frame) | **4 + 9** (antithetical + literal: homicide→self-defense, mirror legal) |
| 4 | My piercing wit will leave you defenseless. | Then put it on display — I would hate to miss it. | (boast about wit) | **3** (faint praise: asks for proof = implies absence) |
| 5 | I once thought I had seen everything, until I met you. | Do not worry. I will not make a scene of you. | (dismissive) | **12** (pickup: scene→make a scene OF you) |
| 6 | I'll seek my revenge from beyond the grave! | From there, you might actually pose a challenge. | (boast/menace) | **6** (eccezione: alive attacker is no challenge) |
| 7 | You are as repulsive as a monkey in a negligee. | I look that much like your fiancée? | 1 + 8 (assurda + zoologica) | **12** (pickup: monkey-negligee→your fiancée) |
| 8 | Every enemy I have met I have annihilated! | With that breath, I imagine they all suffocated. | (boast) | **7 + 12** (anatomica + pickup: annihilated→suffocated by breath) |
| 9 | I have the courage and skill of a master swordsman. | I would be in real trouble if you ever used it. | (boast) | **6** (eccezione: trouble IF you used) |
| 10 | I'll show you that gentlemen die as gracelessly as you. | Yet they at least learn the etiquette of falling. | (boast) | **12** (pickup: gracelessly→etiquette of falling) |

---

## Coverage matrix — DEFENSE techniques in MI corpus (22 pairs total)

| Technique | Count | Examples |
|---|---|---|
| 1. comparazione assurda | 0 | — (mostly in attacks) |
| 2. cascata di immagini | **0** | **GAP** — Shakespearean style, MI never uses |
| 3. faint praise | 3 | #5, #12 MI1; #4 MI2 |
| 4. inversione antitetica | 1 | #3 MI2 (homicide→self-defense) |
| 5. falso disconoscimento | **0** | **GAP** — Marx-style |
| 6. eccezione ironica | 4 | #9 MI1; #2, #6, #9 MI2 |
| 7. riduzione anatomica | 2 | #6 MI1, #8 MI2 (both breath jokes) |
| 8. comparazione zoologica | 0 | — (in attacks not defenses) |
| 9. counter letterale | 5 | #2, #7, #10 MI1; #1, #3 MI2 |
| 10. reductio ad rem absurdam | **0** | **GAP** — Churchill-style |
| 11. veleno sotto il proverbio | **0** | **GAP** — Twain-style |
| 12. pickup-and-escalate | **9** | #1, #3, #4, #5, #6, #8, #11 MI1; #5, #7, #8, #10 MI2 — DOMINANT |

---

## Findings

1. **MI corpus is heavily biased toward `pickup-and-escalate`** (9 of 22 defenses). It's the signature MI move but a model trained only on MI will overfit and produce monotonous "takes word X, escalates to Y" outputs.

2. **Four KB techniques have ZERO MI examples** for defenses: cascata di immagini (Shakespeare), falso disconoscimento (Marx), reductio ad rem absurdam (Churchill), veleno sotto il proverbio (Twain). The system prompt's TOOLBOX must teach these via brief named exemplars or the LLM will never reach for them.

3. **Italian translations are good but uneven.** "Combatti come un contadino → tu combatti come una mucca" works (preserves the pickup). But "Per te è la FINE, cane di fogna! → E io ho una bella PUNTA per te" — the EN pun chain END→TIP→POINT collapses; the IT loses the third sword-edge pun. Expect the model to struggle reproducing these in IT.

4. **Boasts ≠ insults.** ~6 of the 22 attacks are pure boasts ("People fall at my feet", "I have the courage of a master swordsman") with no real attack content. They function only as set-ups for the defense to flip. The opponent prompt for `attacker` role should NOT use these as exemplars — they teach the wrong shape (pure boast that opens itself to be flipped).

5. **Reginald (MI2) defenses use noble register.** "Yet they at least learn the etiquette of falling" — measured, refined. Brutus (MI1) defenses are coarser. The persona-anchored few-shot already enforces this naturally; keep splitting `seedsByPersona[id]` as we do.

---

## Implications for prompts

- **Defender prompt**: append the 4 missing-technique exemplars (cascade/Marx/Churchill/Twain) directly into the TOOLBOX section so the LLM has at least one anchor per technique, regardless of which few-shot pair the persona retrieves.
- **Attacker prompt**: do NOT seed the model with boast-shape attacks. When the persona is on offense, prefer attacks that already deploy a technique (zoological / absurd comparison), not naked boasts.
- **Judge prompt**: must reward technique-7 (anatomica) and technique-12 (pickup) when present, since those are statistically frequent in human-style MI defenses, but ALSO reward the rare techniques (2, 5, 10, 11) extra when they appear so the model learns to value them.
