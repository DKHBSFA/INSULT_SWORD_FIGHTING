// Seed pools — Monkey Island canonical insult/response pairs (where applicable),
// adapted per persona. EN is the canonical original; IT is the canonical/adapted localization.
// Pair structure preserves the attack→canonical-defense relation that makes Insult Sword Fighting
// a richer few-shot for the LLM judge and creator.

export type Pair = { attack: string; defense: string };
export type LangPairs = { en: Pair[]; it: Pair[] };

// MI1 ground combat (Secret of Monkey Island)
const mi1Ground: LangPairs = {
	en: [
		{
			attack: 'You fight like a dairy farmer.',
			defense: 'How appropriate. You fight like a cow.'
		},
		{
			attack: 'This is the END for you, you gutter-crawling cur!',
			defense: "And I've got a little TIP for you. Get the POINT?"
		},
		{
			attack: "I've spoken with apes more polite than you.",
			defense: "I'm glad to hear you attended your family reunion."
		},
		{
			attack: "Soon you'll be wearing my sword like a shish kebab!",
			defense: "First you'd better stop waving it like a feather-duster."
		},
		{
			attack: 'My handkerchief will wipe up your blood!',
			defense: 'So you got that job as janitor, after all.'
		},
		{
			attack: 'People fall at my feet when they see me coming.',
			defense: 'Even before they smell your breath?'
		},
		{
			attack: 'I once owned a dog that was smarter than you.',
			defense: 'He must have taught you everything you know.'
		},
		{
			attack: 'You make me want to puke.',
			defense: 'You make me think somebody already did.'
		},
		{
			attack: "Nobody's ever drawn blood from me and ever lived to tell about it.",
			defense: "I'd be in real trouble if you ever used your sword."
		},
		{
			attack: 'There are no words for how disgusting you are.',
			defense: 'Yes there are. You just never learned them.'
		},
		{
			attack: "I've heard you are a contemptible sneak.",
			defense: "Too bad no one's ever heard of YOU at all."
		},
		{
			attack: 'Every word you say to me is stupid.',
			defense: "I wanted to make sure you'd feel comfortable with me."
		}
	],
	it: [
		{
			attack: 'Combatti come un contadino.',
			defense: 'Che onore: tu combatti come una mucca.'
		},
		{
			attack: 'Per te è la FINE, cane di fogna!',
			defense: 'E io ho una bella PUNTA per te. Hai colto il concetto?'
		},
		{
			attack: 'Ho parlato con scimmie più educate di te.',
			defense: 'Sono felice di sapere che sei andato alla rimpatriata di famiglia.'
		},
		{
			attack: 'Presto porterai la mia spada come uno spiedino!',
			defense: 'Prima smettila di sventolarla come un piumino per la polvere.'
		},
		{
			attack: 'Il mio fazzoletto asciugherà il tuo sangue!',
			defense: 'Quindi alla fine quel posto da inserviente lo hai ottenuto.'
		},
		{
			attack: 'La gente cade ai miei piedi quando mi vede arrivare.',
			defense: 'Anche prima di sentire il tuo alito?'
		},
		{
			attack: 'Avevo un cane più intelligente di te.',
			defense: 'Dev’essere stato lui a insegnarti tutto quello che sai.'
		},
		{
			attack: 'Mi fai venire voglia di vomitare.',
			defense: 'Mi fai pensare che qualcuno l’abbia già fatto.'
		},
		{
			attack: 'Nessuno mi ha mai cavato il sangue ed è vissuto per raccontarlo.',
			defense: 'Sarei in serio pericolo se tu sapessi davvero usare la spada.'
		},
		{
			attack: 'Non ci sono parole per quanto sei disgustoso.',
			defense: 'Sì che ci sono. È solo che tu non le hai mai imparate.'
		},
		{
			attack: 'Ho sentito dire che sei un bieco furfante.',
			defense: 'Peccato che nessuno abbia mai sentito parlare di TE.'
		},
		{
			attack: 'Ogni parola che mi rivolgi è stupida.',
			defense: 'Volevo solo che ti sentissi a tuo agio con me.'
		}
	]
};

// MI2 ship combat (LeChuck's Revenge) — adapted for haughty nobleman tone.
const mi2Ship: LangPairs = {
	en: [
		{
			attack: 'Have you stopped wearing diapers yet?',
			defense: 'Why, did you want to borrow one?'
		},
		{
			attack: "I'll skewer you like a pig before I'm done!",
			defense: 'Too bad nobody ever taught you how to FIGHT.'
		},
		{
			attack: 'Killing you would be justifiable homicide!',
			defense: 'Then killing you would be self-defense!'
		},
		{
			attack: 'My piercing wit will leave you defenseless.',
			defense: 'Then put it on display — I would hate to miss it.'
		},
		{
			attack: 'I once thought I had seen everything, until I met you.',
			defense: 'Do not worry. I will not make a scene of you.'
		},
		{
			attack: "I'll seek my revenge from beyond the grave!",
			defense: 'From there, you might actually pose a challenge.'
		},
		{
			attack: 'You are as repulsive as a monkey in a negligee.',
			defense: 'I look that much like your fiancée?'
		},
		{
			attack: 'Every enemy I have met I have annihilated!',
			defense: 'With that breath, I imagine they all suffocated.'
		},
		{
			attack: 'I have the courage and skill of a master swordsman.',
			defense: 'I would be in real trouble if you ever used it.'
		},
		{
			attack: "I'll show you that gentlemen die as gracelessly as you.",
			defense: 'Yet they at least learn the etiquette of falling.'
		}
	],
	it: [
		{
			attack: 'Hai smesso di portare i pannolini?',
			defense: 'Perché, te ne servirebbe uno in prestito?'
		},
		{
			attack: 'Ti infilzerò come un maiale prima di finire!',
			defense: 'Peccato che nessuno ti abbia mai insegnato a COMBATTERE.'
		},
		{
			attack: 'Ucciderti sarebbe omicidio giustificabile!',
			defense: 'Allora ucciderti sarebbe legittima difesa!'
		},
		{
			attack: 'La mia arguzia tagliente ti lascerà disarmato.',
			defense: 'Allora esibiscila pure — non vorrei perdermela.'
		},
		{
			attack: 'Pensavo di aver visto tutto, finché non ho incontrato te.',
			defense: 'Tranquillo. Di te non farò una scena memorabile.'
		},
		{
			attack: 'Cercherò vendetta dalla tomba!',
			defense: 'Da lì potresti finalmente costituire una sfida.'
		},
		{
			attack: 'Sei ripugnante come una scimmia in vestaglia.',
			defense: 'Assomiglio così tanto alla tua fidanzata?'
		},
		{
			attack: 'Ogni nemico che ho incontrato l’ho annientato!',
			defense: 'Con quell’alito, immagino siano soffocati tutti.'
		},
		{
			attack: 'Possiedo il coraggio e l’abilità di un maestro di spada.',
			defense: 'Sarei davvero nei guai, se tu li usassi mai.'
		},
		{
			attack: 'Ti mostrerò che i gentiluomini muoiono goffi quanto te.',
			defense: 'Però loro almeno conoscono l’etichetta del cadere.'
		}
	]
};

// Trainer — small didactic subset of MI1, paired with the canonical responses.
const trainer: LangPairs = {
	en: [
		{ attack: 'You fight like a dairy farmer.', defense: 'How appropriate. You fight like a cow.' },
		{
			attack: "I've spoken with apes more polite than you.",
			defense: "I'm glad to hear you attended your family reunion."
		},
		{
			attack: 'My handkerchief will wipe up your blood!',
			defense: 'So you got that job as janitor, after all.'
		},
		{
			attack: 'People fall at my feet when they see me coming.',
			defense: 'Even before they smell your breath?'
		},
		{
			attack: 'I once owned a dog that was smarter than you.',
			defense: 'He must have taught you everything you know.'
		},
		{
			attack: 'Every word you say to me is stupid.',
			defense: "I wanted to make sure you'd feel comfortable with me."
		}
	],
	it: [
		{
			attack: 'Combatti come un contadino.',
			defense: 'Che onore: tu combatti come una mucca.'
		},
		{
			attack: 'Ho parlato con scimmie più educate di te.',
			defense: 'Sono felice di sapere che sei andato alla rimpatriata di famiglia.'
		},
		{
			attack: 'Il mio fazzoletto asciugherà il tuo sangue!',
			defense: 'Quindi alla fine quel posto da inserviente lo hai ottenuto.'
		},
		{
			attack: 'La gente cade ai miei piedi quando mi vede arrivare.',
			defense: 'Anche prima di sentire il tuo alito?'
		},
		{
			attack: 'Avevo un cane più intelligente di te.',
			defense: 'Dev’essere stato lui a insegnarti tutto quello che sai.'
		},
		{
			attack: 'Ogni parola che mi rivolgi è stupida.',
			defense: 'Volevo solo che ti sentissi a tuo agio con me.'
		}
	]
};

export const seedsByPersona: Record<string, LangPairs> = {
	old_pirate_brutus: mi1Ground,
	haughty_nobleman: mi2Ship,
	trainer
};

// Backward-compatible flat shape: kept for any consumer that still expects { attack, defense } arrays.
// Builds a default-language (en) flat view.
export const seeds = Object.fromEntries(
	Object.entries(seedsByPersona).map(([k, v]) => [
		k,
		{
			attack: v.en.map((p) => p.attack),
			defense: v.en.map((p) => p.defense)
		}
	])
) as Record<string, { attack: readonly string[]; defense: readonly string[] }>;
