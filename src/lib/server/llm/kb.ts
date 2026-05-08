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
			'prendi l\'attacco alla lettera e rendilo ridicolo. Sotto-pattern OMONIMO (tier alto): se l\'attacco usa un sostantivo che ha una seconda accezione, leggi la parola nella seconda accezione e attribuisci all\'oggetto il comportamento di quel referente.\n   es 1: Lady Astor: "Se fossi tua moglie ti metterei il veleno nel caffè." Churchill: "Nancy, se fossi tuo marito, lo berrei."\n   es 2 (omonimo): attacco "hai la spada così arrugginita che potresti grattugiare il parmigiano con la lama" → difesa "almeno la mia è utile, la tua sa solo sputare" (omonimo: lama = arma vs Lama = camelide sudamericano che sputa davvero; il difensore lascia il sostantivo dell\'attacco scivolare nella seconda accezione e gli affibbia il comportamento dell\'animale, degradando la lama dell\'avversario da arma a camelide).',
		howEn:
			'take the attack literally, make it ridiculous. HOMONYM sub-pattern (high tier): if the attack uses a noun with a second meaning, read the word in its second meaning and ascribe to the object the referent\'s typical behavior.\n   ex 1: Lady Astor: "If I were married to you, I\'d put poison in your coffee." Churchill: "Nancy, if I were married to you, I\'d drink it."\n   ex 2 (homonym, Italian): attack "your sword is so rusty you could grate parmesan with the blade" → defense "at least mine is useful, yours only knows how to spit" (Italian homonym: lama = blade vs Lama = South American camelid that really spits; the defender lets the attacker\'s noun slip into the second meaning and ascribes the animal\'s behavior to it, downgrading the attacker\'s blade from weapon to camelid).'
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
			'prendi UNA parola dell\'attacco e spingila in territorio peggiore RESTANDO NELLO STESSO FRAME-IMMAGINE dell\'attacco. Non introdurre nuovi domini se l\'immagine può essere reindirizzata.\n   es (gold standard): attacco "hai la spada così arrugginita che potresti grattugiare il parmigiano con la lama" → difesa "e la tua spada è talmente corta e smussata da essere inadeguata anche a spalmare il burro" (resta in cucina-utensili, ma lo strumento dell\'attaccante peggiora: dal grattare al solo spalmare).\n   altri: Luce "Age before beauty" → Parker "Pearls before swine" (resta in proverbi-cortesia); MI "Combatti come un contadino" → "Appropriato. Combatti come una vacca." (resta in agricoltura).',
		howEn:
			'take ONE word from the attack and push it into worse territory STAYING IN THE SAME IMAGE-FRAME the attacker chose. Do NOT introduce a new domain if the image can be redirected.\n   ex (gold standard): attack "your sword is so rusty you could grate parmesan with the blade" → defense "and yours is so short and dull it can\'t even spread butter" (stays in kitchen-tools, but the attacker\'s instrument worsens: from grating to merely spreading).\n   others: Luce "Age before beauty" → Parker "Pearls before swine" (stays in courtesy-aphorisms); MI "You fight like a dairy farmer" → "How appropriate. You fight like a cow." (stays in farming).'
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

// Tier-specific SAGACITY guidance. The tier scales the SOPHISTICATION of the
// wit-technique (which structures are unlocked), NOT the level of formal or
// pretentious vocabulary. Register comes from PERSONA_OVERRIDE — a pirate at
// tier 4 stays a pirate, just with access to layered structures (aphorism,
// antithesis, reductio); a nobleman at tier 1 stays a nobleman, just with
// only elementary techniques. Difficulty cosplay (e.g., adding "Mio caro"
// vocatives or flowery vocabulary at high tier) is REJECTED — that is
// caricature, not wit.
const REGISTER_GUIDANCE_IT: Record<Tier, string> = {
	1: 'SAGACIA (livello 1/5): tecniche elementari (paragone diretto, riduzione anatomica, comparazione zoologica, pickup-and-escalate). Una sola figura concreta per turno, frase corta. NIENTE doppi sensi stratificati, NIENTE strutture aforistiche o antitetiche. Il REGISTRO della voce viene dal PERSONAGGIO (vedi PERSONA REGISTER), non dalla difficoltà.',
	2: 'SAGACIA (livello 2/5): in aggiunta a tier 1, faint praise e counter letterale. Frasi medie. NIENTE aforismi colti né antitesi nobili. Il REGISTRO viene dalla persona.',
	3: 'SAGACIA (livello 3/5): in aggiunta a tier 2, antitesi (technique 4) e eccezione ironica (technique 6). Strutture articolate (fino a due frasi). NIENTE allusioni esplicite Wilde/Twain. Il REGISTRO viene dalla persona.',
	4: 'SAGACIA (livello 4/5): in aggiunta a tier 3, le tecniche RARE (false reassurance collapse, reductio ad absurdam, weaponized aphorism, omonimo lessicale come sotto-pattern di counter letterale). La sagacia tier 4 vive nella STRUTTURA della frase: definizione+applicazione alla Twain, antitesi alla Wilde che ribalta una sola parola, dettaglio irrefutabile alla Churchill, ambiguità lessicale che apre un secondo referente. Il REGISTRO viene dalla persona — il nobile parla nobile, il pirata parla pirata, il colpo è il pattern strutturale. Cosplay-vocativo (vocativi pretenziosi senza colpo strutturale) è caricatura, non wit.',
	5: 'SAGACIA (livello 5/5): tutte le tecniche, cascata di immagini possibile (Falstaff style). Il colpo è strutturale (cascata grottesca, antitesi profonda, definizione devastante), non lessicale. Il REGISTRO viene dalla persona.'
};
const REGISTER_GUIDANCE_EN: Record<Tier, string> = {
	1: 'SAGACITY (level 1/5): elementary techniques (direct comparison, anatomical reduction, bestiary, pickup-and-escalate). One concrete image per turn, short sentence. NO layered double meaning, NO aphoristic or antithetical structures. The REGISTER of voice comes from the CHARACTER (see PERSONA REGISTER), not from difficulty.',
	2: 'SAGACITY (level 2/5): in addition to tier 1, faint praise and literal counter. Medium sentences. NO learned aphorisms or noble antithesis. REGISTER from persona.',
	3: 'SAGACITY (level 3/5): in addition to tier 2, antithetical substitution (technique 4) and conditional reversal (technique 6). Articulated structures (up to two sentences). NO explicit Wilde/Twain allusions. REGISTER from persona.',
	4: 'SAGACITY (level 4/5): in addition to tier 3, the RARE techniques (false reassurance collapse, reductio ad absurdam, weaponized aphorism, lexical homonym as sub-pattern of literal counter). Tier-4 sagacity lives in SENTENCE STRUCTURE: Twain-style definition+application, Wilde-style antithesis flipping one word, Churchill-style irrefutable detail, lexical ambiguity opening a second referent. The REGISTER comes from the persona — noble speaks noble, pirate speaks pirate; the strike is the structural pattern. Pretentious-vocative cosplay (vocatives without structural strike) is caricature, not wit.',
	5: 'SAGACITY (level 5/5): all techniques, image cascade allowed (Falstaff style). The strike is structural (grotesque cascade, deep antithesis, devastating definition), not lexical. REGISTER from persona.'
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
	"REGISTRO PERSONA (sovrasta tutto): la persona governa VOCE e LESSICO, NON il FRAME-IMMAGINE. Pirata rozzo → niente aforismi colti né latinismi anche se il TOOLBOX li contempla. Nobile → registro polished. Le tecniche del TOOLBOX sono RICETTE, non livello di registro. In DIFESA il frame-immagine è scelto dall'attaccante (REGOLA AUREA): resta lì anche se non è il mondo naturale del tuo personaggio — la voce colorisce COME lo dici, non ti costringe a forzare oggetti del tuo dominio. Se l'attaccante apre in cucina, il pirata risponde in cucina con tono asciutto da pirata, non si reinventa galletta+vermi solo perché è marinaio.";
export const PERSONA_OVERRIDE_EN =
	"PERSONA REGISTER (overrides everything): the persona governs VOICE and LEXICON, NOT the IMAGE-FRAME. Rough pirate → no learned aphorisms or Latinisms even if the TOOLBOX includes them. Nobleman → polished register. TOOLBOX techniques are RECIPES, not a register level. When DEFENDING, the image-frame is set by the attacker (GOLDEN RULE): stay there even if it is not your character's natural world — the voice colors HOW you say it, it does not force you to retrofit objects from your domain. If the attacker opens in a kitchen, the pirate replies in the kitchen with a pirate's dry tone, he does not reinvent the scene as ship's-hardtack-and-weevils just because he is a sailor.";

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
