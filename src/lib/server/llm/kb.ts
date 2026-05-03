// Knowledge base for the LLM prompts. Single source of truth for the 12-technique
// toolbox, anti-patterns, Italian idioms, and the judge rubric.
//
// Authoritative source documents:
//   references/insult-construction-kb.md  — original method spec
//   references/wits-corpus.md             — canonical examples (Shakespeare, Wilde, …)
//   references/mi-pairs-audit.md          — mapping of MI corpus to techniques
//
// The KB is the METHOD, not insults to copy. Each technique carries ONE
// canonical example as a stylistic anchor. The model is instructed in the
// prompt to use the technique, NEVER to reproduce the example verbatim.

export const TECHNIQUES_IT = `TOOLBOX — 12 tecniche del wit (Shakespeare, Wilde, Churchill, Twain, Parker, Marx, Monkey Island).
Per ogni turno: scegli UNA tecnica adatta al contesto. NON nominarla. NON ripetere parola per parola gli esempi.

1. comparazione assurda — paragoni iperbolici concreti che riducono il bersaglio.
   es: "Via, sciocco da tre dita." (Shakespeare)

2. cascata di immagini — sequenza di metafore accumulate, ogni elemento più grottesco.
   es: "Via, denutrito, pelle d'elfo, lingua di vitello secca, nervo di toro, baccalà!" (Shakespeare, Falstaff)

3. faint praise — sembra un complimento, è un'esecuzione.
   es: "Il tuo viso non merita nemmeno una scottatura solare." (Shakespeare); "Attlee è un uomo modesto con molto di cui essere modesto." (Churchill)

4. inversione antitetica — mantieni la struttura nobile, sostituisci una parola che ribalta il senso.
   es: "Alcuni causano felicità ovunque vadano, altri ogniqualvolta se ne vadano." (Wilde); "La musica di Wagner è migliore di come suona." (Twain)

5. falso disconoscimento — apri come scusante, conferma il peggio.
   es: "Può sembrare un idiota e parlare come un idiota, ma non farti ingannare: è davvero un idiota." (Marx)

6. eccezione ironica — neghi un tuo principio per fare un'eccezione devastante.
   es: "Non dimentico mai una faccia, ma nel tuo caso farò un'eccezione." (Marx); "Non ho mai augurato la morte a nessuno, ma ho letto certi necrologi con grande piacere." (Twain)

7. riduzione anatomica — bersaglio = parte del corpo, fluido, funzione.
   es: "Pace, pancia di lardo!" (Shakespeare); "Sei più gonfio di una vescica di porco."

8. comparazione zoologica — animale specifico per evocare il difetto.
   es: "Capra di montagna lussuriosa e dannata." (Shakespeare); "Brutto e velenoso come il rospo." (Shakespeare)

9. counter letterale — prendi l'attacco alla lettera e rendilo ridicolo.
   es: Lady Astor: "Se fossi tua moglie ti metterei il veleno nel caffè." Churchill: "Nancy, se fossi tuo marito, lo berrei."

10. reductio ad rem absurdam — dettaglio così precisamente ridicolo da essere irrefutabile.
    es: "Un taxi vuoto si fermò a Downing Street e ne uscì Clement Attlee." (Churchill)

11. veleno sotto il proverbio — forma sentenziosa in cui l'applicazione è l'attacco.
    es: "Il problema non è che ci sono troppi sciocchi, è che i fulmini non sono distribuiti bene." (Twain)

12. pickup-and-escalate — prendi UNA parola dell'attacco e spingila in territorio peggiore.
    es: Clare Boothe Luce: "Age before beauty." Parker: "Pearls before swine." (riprende "before", lo riapplica a "swine"); MI: "Combatti come un contadino" → "Appropriato. Combatti come una vacca."`;

export const TECHNIQUES_EN = `TOOLBOX — 12 wit techniques (Shakespeare, Wilde, Churchill, Twain, Parker, Marx, Monkey Island).
Each turn: pick ONE technique fit for context. Do NOT name it. Do NOT reproduce examples verbatim.

1. absurd comparison — hyperbolic concrete comparison that diminishes the target.
   ex: "Away, you three-inch fool!" (Shakespeare)

2. image cascade — sequence of accumulated metaphors, each more grotesque.
   ex: "Away, you starvelling, you elf-skin, you dried neat's-tongue, bull's-pizzle, you stock-fish!" (Shakespeare, Falstaff)

3. faint praise — looks like compliment, is execution.
   ex: "Thine face is not worth sunburning." (Shakespeare); "Attlee is a modest man with much to be modest about." (Churchill)

4. antithetical substitution — keep the noble structure, swap one word that flips meaning.
   ex: "Some cause happiness wherever they go, others whenever they go." (Wilde); "Wagner's music is better than it sounds." (Twain)

5. false reassurance collapse — open as if making excuse, confirm the worst.
   ex: "He may look like an idiot and talk like an idiot but don't let that fool you. He really is an idiot." (Marx)

6. conditional reversal — deny a principle to make a devastating exception.
   ex: "I never forget a face, but in your case I'll make an exception." (Marx); "I have never wished a man dead, but I have read some obituaries with great pleasure." (Twain)

7. anatomical reduction — target reduced to body part, fluid, or function.
   ex: "Peace, ye fat guts!" (Shakespeare); "Thou clay-brained guts, thou knotty-pated fool." (Shakespeare)

8. bestiary insult — specific animal evokes the flaw.
   ex: "Thou damned and luxurious mountain goat." (Shakespeare); "Like the toad; ugly and venomous." (Shakespeare)

9. literal counter — take the attack literally, make it ridiculous.
   ex: Lady Astor: "If I were married to you, I'd put poison in your coffee." Churchill: "Nancy, if I were married to you, I'd drink it."

10. reductio ad rem absurdam — detail so precisely ridiculous it is irrefutable.
    ex: "An empty taxi drew up to Downing Street, and Clement Attlee got out." (Churchill)

11. weaponized aphorism — sentence-form (aphorism) where the application IS the attack.
    ex: "The trouble ain't that there are too many fools, but that the lightning ain't distributed right." (Twain)

12. pickup-and-escalate — take ONE word from the attack and push it into worse territory.
    ex: Luce: "Age before beauty." Parker: "Pearls before swine." (takes "before", reapplies to "swine"); MI: "You fight like a dairy farmer" → "How appropriate. You fight like a cow."`;

export const ANTI_PATTERNS_IT = `ANTI-PATTERN VIETATI (l'output che li contiene è scartato e ritentato):
- insulto generico astratto ("sei brutto", "sei stupido") — niente immagine concreta.
- volgarità gratuita senza wit — il pubblico ride dell'autore.
- difesa fuori contesto che non aggancia parola dell'attacco.
- echo letterale ("sei lento" → "sei lento tu") — conferma l'attacco.
- clone strutturale ("sembri X" → "sembri Y") — meccanico, mimicry.
- spiegazione meta ("quello che hai detto è offensivo perché…") — rompe la finzione.
- calque dall'inglese ("barco", "defenza", "scurvo", "possoo", "saltoso") — parole inesistenti.
- frase troncata o senza verbo.
- apertura formulaica ricorrente ("Almeno io...", "Sei più... di...") usata in più di un turno consecutivo.`;

export const ANTI_PATTERNS_EN = `FORBIDDEN ANTI-PATTERNS (output containing these is rejected and retried):
- abstract generic insult ("you're ugly", "you're stupid") — no concrete image.
- gratuitous vulgarity without wit — audience laughs at author.
- defense out of context that fails to hook a word from the attack.
- literal echo ("you're slow" → "you're slow yourself") — confirms the attack.
- structural clone ("you look like X" → "you look like Y") — mechanical mimicry.
- meta explanation ("what you said is offensive because…") — breaks fiction.
- truncated sentence or no verb.
- recurring formulaic opening ("At least I...", "You're more X than Y") used across consecutive turns.`;

export const ITALIAN_IDIOMS = `COSTRUZIONI ITALIANE PREFERITE (sfrutta queste, non calcare l'inglese):
- "Sei più X di Y" — paragone iperbolico (es: "sei più sordo di un'incudine").
- "Hai la grazia di Z" — comparazione goffa (es: "hai la grazia di un mulo in cristalleria").
- "Manco un W saprebbe Q" — litote ironica.
- "Sembri uscito da X" — origine ridicola.
- "Ti manca / non ti manca che X" — qualità mancante surreale.
- Diminutivi sprezzanti (-ello, -uccio, -accio): spadina, principino, pirataccio.
- Latinismi pretenziosi solo per personaggi nobiliari ("de minimis non curat lex", "vox populi").
- Tono asciutto, poche parole, immagini concrete del mondo del personaggio.`;

// Judge-flavored versions: same content reframed as evaluation criteria.

export const JUDGE_TECHNIQUE_BONUS_IT = `BONUS DI STILE — premia con defender_wins (anche con aggancio leggero) se la difesa esegue bene una di queste tecniche:
absurd comparison · image cascade · faint praise · inversione antitetica · falso disconoscimento · eccezione ironica · riduzione anatomica · comparazione zoologica · counter letterale · reductio ad absurdum · veleno sotto proverbio · pickup-and-escalate.

Premia DOPPIO le tecniche RARE (cascata di immagini, falso disconoscimento, reductio ad absurdam, veleno sotto proverbio): se eseguite bene, sono il vero segno di un duellante esperto.

Se l'attaccante apre con tecnica forte e il difensore risponde piatto/echo/generico, vince attaccante.`;

export const JUDGE_TECHNIQUE_BONUS_EN = `STYLE BONUS — reward with defender_wins (even on light hook) if the defense executes one of these well:
absurd comparison · image cascade · faint praise · antithetical substitution · false reassurance collapse · conditional reversal · anatomical reduction · bestiary insult · literal counter · reductio ad absurdum · weaponized aphorism · pickup-and-escalate.

Reward DOUBLE the rare techniques (image cascade, false reassurance collapse, reductio ad absurdam, weaponized aphorism): when executed well, they are the mark of a master duelist.

If attacker opens with strong technique and defender replies flat/echo/generic, attacker wins.`;

export const JUDGE_ANTI_PATTERN_PENALTY_IT = `PENALITÀ ANTI-PATTERN — chi usa anti-pattern perde automaticamente (a meno che entrambi siano deboli):
- generico astratto ("sei brutto/stupido")
- volgarità gratuita
- echo letterale
- clone strutturale ("sembri X" → "sembri Y")
- spiegazione meta
- calque inglese ("barco", "defenza", "scurvo")
- frase troncata`;

export const JUDGE_ANTI_PATTERN_PENALTY_EN = `ANTI-PATTERN PENALTY — using an anti-pattern auto-loses (unless both sides are weak):
- abstract generic ("you're ugly/stupid")
- gratuitous vulgarity
- literal echo
- structural clone ("you look like X" → "you look like Y")
- meta explanation
- truncated sentence`;
