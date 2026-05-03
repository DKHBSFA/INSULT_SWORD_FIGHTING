// Knowledge base for the LLM prompts. Single source of truth for the
// 12-technique toolbox, anti-patterns, Italian idioms, and judge rubric.
//
// The KB is the METHOD, not insults to copy. Each technique carries ONE
// canonical anchor as a stylistic example; the model is instructed in the
// prompt to use the technique, NEVER to reproduce the example verbatim.
//
// TIER stratification: techniques are gated by difficulty so that at low
// difficulty the opponent stays in MI ground-combat register (no Shakespeare
// cascades, no Wilde antithesis). Each tier is a strict superset of the one
// below; tier 5 = all 12 techniques.
//
// Authoritative source documents:
//   references/insult-construction-kb.md  — original method spec
//   references/wits-corpus.md             — canonical examples
//   references/mi-pairs-audit.md          — coverage analysis

import type { Difficulty } from '../../shared/difficulty';

export type Tier = 1 | 2 | 3 | 4 | 5;

export function tierForDifficulty(d: Difficulty): Tier {
	if (d === 'easy') return 1;
	if (d === 'medium') return 2;
	if (d === 'hard') return 3;
	if (d === 'expert') return 4;
	return 5;
}

type TechniqueDef = {
	id: number;
	nameIt: string;
	nameEn: string;
	howIt: string;
	howEn: string;
};

const TECHNIQUES: TechniqueDef[] = [
	{
		id: 1,
		nameIt: 'comparazione assurda',
		nameEn: 'absurd comparison',
		howIt:
			'paragoni iperbolici concreti che riducono il bersaglio.\n   es: "Via, sciocco da tre dita." (Shakespeare)',
		howEn:
			'hyperbolic concrete comparison that diminishes the target.\n   ex: "Away, you three-inch fool!" (Shakespeare)'
	},
	{
		id: 2,
		nameIt: 'cascata di immagini',
		nameEn: 'image cascade',
		howIt:
			'sequenza di metafore accumulate, ogni elemento più grottesco.\n   es: "Via, denutrito, pelle d\'elfo, lingua di vitello secca, nervo di toro, baccalà!" (Shakespeare, Falstaff)',
		howEn:
			'sequence of accumulated metaphors, each more grotesque.\n   ex: "Away, you starvelling, you elf-skin, you dried neat\'s-tongue, bull\'s-pizzle, you stock-fish!" (Shakespeare, Falstaff)'
	},
	{
		id: 3,
		nameIt: 'faint praise',
		nameEn: 'faint praise',
		howIt:
			'sembra un complimento, è un\'esecuzione.\n   es: "Il tuo viso non merita nemmeno una scottatura solare." (Shakespeare); "Attlee è un uomo modesto con molto di cui essere modesto." (Churchill)',
		howEn:
			'looks like compliment, is execution.\n   ex: "Thine face is not worth sunburning." (Shakespeare); "Attlee is a modest man with much to be modest about." (Churchill)'
	},
	{
		id: 4,
		nameIt: 'inversione antitetica',
		nameEn: 'antithetical substitution',
		howIt:
			'mantieni la struttura nobile, sostituisci una parola che ribalta il senso.\n   es: "Alcuni causano felicità ovunque vadano, altri ogniqualvolta se ne vadano." (Wilde); "La musica di Wagner è migliore di come suona." (Twain)',
		howEn:
			'keep the noble structure, swap one word that flips meaning.\n   ex: "Some cause happiness wherever they go, others whenever they go." (Wilde); "Wagner\'s music is better than it sounds." (Twain)'
	},
	{
		id: 5,
		nameIt: 'falso disconoscimento',
		nameEn: 'false reassurance collapse',
		howIt:
			'apri come scusante, conferma il peggio.\n   es: "Può sembrare un idiota e parlare come un idiota, ma non farti ingannare: è davvero un idiota." (Marx)',
		howEn:
			'open as if making excuse, confirm the worst.\n   ex: "He may look like an idiot and talk like an idiot but don\'t let that fool you. He really is an idiot." (Marx)'
	},
	{
		id: 6,
		nameIt: 'eccezione ironica',
		nameEn: 'conditional reversal',
		howIt:
			'neghi un tuo principio per fare un\'eccezione devastante.\n   es: "Non dimentico mai una faccia, ma nel tuo caso farò un\'eccezione." (Marx); "Non ho mai augurato la morte a nessuno, ma ho letto certi necrologi con grande piacere." (Twain)',
		howEn:
			'deny a principle to make a devastating exception.\n   ex: "I never forget a face, but in your case I\'ll make an exception." (Marx); "I have never wished a man dead, but I have read some obituaries with great pleasure." (Twain)'
	},
	{
		id: 7,
		nameIt: 'riduzione anatomica',
		nameEn: 'anatomical reduction',
		howIt:
			'bersaglio = parte del corpo, fluido, funzione.\n   es: "Pace, pancia di lardo!" (Shakespeare); "Sei più gonfio di una vescica di porco."',
		howEn:
			'target reduced to body part, fluid, or function.\n   ex: "Peace, ye fat guts!" (Shakespeare); "Thou clay-brained guts, thou knotty-pated fool." (Shakespeare)'
	},
	{
		id: 8,
		nameIt: 'comparazione zoologica',
		nameEn: 'bestiary insult',
		howIt:
			'animale specifico per evocare il difetto.\n   es: "Capra di montagna lussuriosa e dannata." (Shakespeare); "Brutto e velenoso come il rospo." (Shakespeare); "Combatti come una vacca." (Monkey Island)',
		howEn:
			'specific animal evokes the flaw.\n   ex: "Thou damned and luxurious mountain goat." (Shakespeare); "Like the toad; ugly and venomous." (Shakespeare); "You fight like a cow." (Monkey Island)'
	},
	{
		id: 9,
		nameIt: 'counter letterale',
		nameEn: 'literal counter',
		howIt:
			'prendi l\'attacco alla lettera e rendilo ridicolo.\n   es: Lady Astor: "Se fossi tua moglie ti metterei il veleno nel caffè." Churchill: "Nancy, se fossi tuo marito, lo berrei."',
		howEn:
			'take the attack literally, make it ridiculous.\n   ex: Lady Astor: "If I were married to you, I\'d put poison in your coffee." Churchill: "Nancy, if I were married to you, I\'d drink it."'
	},
	{
		id: 10,
		nameIt: 'reductio ad rem absurdam',
		nameEn: 'reductio ad rem absurdam',
		howIt:
			'dettaglio così precisamente ridicolo da essere irrefutabile.\n   es: "Un taxi vuoto si fermò a Downing Street e ne uscì Clement Attlee." (Churchill)',
		howEn:
			'detail so precisely ridiculous it is irrefutable.\n   ex: "An empty taxi drew up to Downing Street, and Clement Attlee got out." (Churchill)'
	},
	{
		id: 11,
		nameIt: 'veleno sotto il proverbio',
		nameEn: 'weaponized aphorism',
		howIt:
			'forma sentenziosa in cui l\'applicazione è l\'attacco.\n   es: "Il problema non è che ci sono troppi sciocchi, è che i fulmini non sono distribuiti bene." (Twain)',
		howEn:
			'sentence-form (aphorism) where the application IS the attack.\n   ex: "The trouble ain\'t that there are too many fools, but that the lightning ain\'t distributed right." (Twain)'
	},
	{
		id: 12,
		nameIt: 'pickup-and-escalate',
		nameEn: 'pickup-and-escalate',
		howIt:
			'prendi UNA parola dell\'attacco e spingila in territorio peggiore.\n   es: Luce: "Age before beauty." Parker: "Pearls before swine." (riprende "before", lo riapplica a "swine"); MI: "Combatti come un contadino" → "Appropriato. Combatti come una vacca."',
		howEn:
			'take ONE word from the attack and push it into worse territory.\n   ex: Luce: "Age before beauty." Parker: "Pearls before swine." (takes "before", reapplies to "swine"); MI: "You fight like a dairy farmer" → "How appropriate. You fight like a cow."'
	}
];

// Strict-superset tier mapping: tier N includes all techniques of tier N-1.
// Lower tiers stay earthy/MI; higher tiers add structural and aphoristic.
const TIER_TECHNIQUES: Record<Tier, number[]> = {
	1: [1, 7, 8, 12], // earthy MI ground combat: absurd, anatomical, bestiary, pickup-and-escalate
	2: [1, 3, 7, 8, 9, 12], // + faint praise, literal counter (MI canonical Brutus)
	3: [1, 3, 4, 6, 7, 8, 9, 12], // + antithetical, conditional reversal (Reginald polish)
	4: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // + false reassurance, reductio, weaponized aphorism (mid-Wilde)
	5: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] // + image cascade (Falstaff): full Sword Master
};

function buildToolbox(lang: 'en' | 'it', tier: Tier): string {
	const ids = TIER_TECHNIQUES[tier];
	const techs = TECHNIQUES.filter((t) => ids.includes(t.id));
	const header =
		lang === 'it'
			? `TOOLBOX (livello ${tier}/5) — tecniche del wit selezionate per questa difficoltà. Per ogni turno: scegli UNA tecnica adatta al contesto. NON nominarla. NON ripetere parola per parola gli esempi.`
			: `TOOLBOX (level ${tier}/5) — wit techniques selected for this difficulty. Each turn: pick ONE technique fit for context. Do NOT name it. Do NOT reproduce examples verbatim.`;
	const body = techs
		.map(
			(t) =>
				`${t.id}. ${lang === 'it' ? t.nameIt : t.nameEn} — ${lang === 'it' ? t.howIt : t.howEn}`
		)
		.join('\n\n');
	return `${header}\n\n${body}`;
}

export function getToolboxIT(tier: Tier): string {
	return buildToolbox('it', tier);
}
export function getToolboxEN(tier: Tier): string {
	return buildToolbox('en', tier);
}

// Tier-specific register guidance. The lower the tier, the rougher and more
// physical the language; the higher, the more allusive and aphoristic.
const REGISTER_GUIDANCE_IT: Record<Tier, string> = {
	1: 'REGISTRO: tono concreto, fisico, marinaresco. Frase corta. Niente latinismi, niente aforismi colti, niente riferimenti letterari. Pesca dal mondo del PERSONAGGIO (oggetti banali, animali, conseguenze pratiche).',
	2: 'REGISTRO: ironia visibile, paragoni concreti, frasi di media lunghezza. Niente aforismi di stile colto né allusioni letterarie. Permessi diminutivi sprezzanti.',
	3: 'REGISTRO: polish nobiliare permesso. Latinismi limitati per personaggi nobili. Strutture più articolate (fino a due frasi). Niente cascate Shakespeariane né allusioni a Wilde/Twain esplicite.',
	4: 'REGISTRO: allusivo, aforistico permesso. Wilde-like antithesis e Twain-like aphorism benvenuti. Niente cascate da Falstaff (riservate al livello massimo).',
	5: 'REGISTRO: alto, citazionale, cascata Shakespeariana possibile. Tutte le tecniche disponibili — usa la rara quando il contesto la richiede.'
};
const REGISTER_GUIDANCE_EN: Record<Tier, string> = {
	1: "REGISTER: concrete, physical, nautical tone. Short sentence. No Latinisms, no learned aphorisms, no literary references. Pull from the CHARACTER's world (banal objects, animals, practical consequences).",
	2: 'REGISTER: visible irony, concrete comparisons, medium-length sentences. No learned-style aphorisms or literary allusions. Pet diminutives allowed.',
	3: 'REGISTER: noble polish allowed. Limited Latinisms for noble characters. More articulated structures (up to two sentences). No Shakespearean cascades or explicit Wilde/Twain allusions.',
	4: 'REGISTER: allusive, aphoristic allowed. Wilde-like antithesis and Twain-like aphorism welcome. No Falstaff cascades (reserved for top tier).',
	5: 'REGISTER: high, citational, Shakespearean cascade possible. All techniques available — use the rare one when context calls for it.'
};

export function getRegisterGuidanceIT(tier: Tier): string {
	return REGISTER_GUIDANCE_IT[tier];
}
export function getRegisterGuidanceEN(tier: Tier): string {
	return REGISTER_GUIDANCE_EN[tier];
}

// Persona override line — shown in EVERY prompt regardless of tier.
// Persona always wins against tier: a rough pirate at tier 5 still uses pirate
// vocabulary, just with access to richer techniques. A nobleman at tier 1 stays
// noble, just constrained to simpler techniques.
export const PERSONA_OVERRIDE_IT =
	'REGISTRO PERSONA (sovrasta tutto): se il PERSONAGGIO è un pirata rozzo, niente aforismi colti né latinismi anche se il TOOLBOX li contempla. Se è un nobile, registro polished. Le tecniche del TOOLBOX sono RICETTE, non livello di registro: usale al livello del PERSONAGGIO.';
export const PERSONA_OVERRIDE_EN =
	"PERSONA REGISTER (overrides everything): if the CHARACTER is a rough pirate, no learned aphorisms or Latinisms even if the TOOLBOX includes them. If a nobleman, polished register. TOOLBOX techniques are RECIPES, not a register level: apply them at the CHARACTER's level.";

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

// Judge stays tier-agnostic: it judges what's actually present in the texts.
// Rare-technique bonus naturally won't fire at low tiers because those
// techniques won't appear; the rubric still works.

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
