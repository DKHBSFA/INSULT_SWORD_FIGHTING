export type Persona = {
	id: string;
	userId: string;
	email: string;
	name: string;
	description: string;
	descriptionIt: string;
	spriteSetUrl: string;
	poolMode: 'adaptive' | 'fixed';
};

export const personas: Persona[] = [
	{
		id: 'old_pirate_brutus',
		userId: 'usr_npc_brutus',
		email: 'npc-old_pirate_brutus@isf.local',
		name: 'Brutus',
		description:
			"A weather-beaten old British pirate. Speaks with nautical metaphors, wry sarcasm, and the tone of someone who has seen too many unworthy duels. Vocabulary peppered with sea terms; insults often invoke barnacles, rats, scurvy, hard-tack, salt, and the sea's indifference. Believes himself the wisest fool in the Caribbean.",
		descriptionIt:
			"Vecchio pirata inglese, indurito dal sale. Parla con metafore marinaresche e sarcasmo asciutto, come uno che ha visto troppi duelli mediocri. Lessico nautico vero (cirripedi, ratti, scorbuto, gallette, bonaccia, l'indifferenza del mare). Si crede il più saggio degli stolti dei Caraibi.",
		spriteSetUrl: '/assets/personas/brutus.svg',
		poolMode: 'adaptive' as const
	},
	{
		id: 'haughty_nobleman',
		userId: 'usr_npc_nobleman',
		email: 'npc-haughty_nobleman@isf.local',
		name: 'Lord Reginald Pemberton',
		description:
			'A continental nobleman of the early 18th century. Insults are decorated with Latin tags, contempt for the lower classes, references to bloodline, hygiene, and table manners. Tone: superficially polite, fundamentally devastating. Believes the duel is beneath him, fights anyway out of a sense of obligation to civilization.',
		descriptionIt:
			'Nobile continentale di inizio Settecento. Ornaggia gli insulti con citazioni latine, disprezzo per le classi basse, allusioni a lignaggio, igiene e maniere a tavola. Tono superficialmente cortese, sostanzialmente devastante. Considera il duello al di sotto del proprio rango ma combatte per dovere verso la civiltà.',
		spriteSetUrl: '/assets/personas/nobleman.svg',
		poolMode: 'adaptive' as const
	},
	{
		id: 'trainer',
		userId: 'usr_npc_trainer',
		email: 'npc-trainer@isf.local',
		name: 'The Trainer',
		description:
			'A patient, didactic mentor in the dueling academy. Insults are simple, classic, instructive — chosen to teach the structure of an effective insult. Tone: encouraging, grandfatherly, never spiteful.',
		descriptionIt:
			"Mentore paziente e didattico dell'accademia di duello. I suoi insulti sono semplici, classici, istruttivi — scelti per insegnare la struttura di una frecciata efficace. Tono incoraggiante, da nonno saggio, mai astioso.",
		spriteSetUrl: '/assets/personas/trainer.svg',
		poolMode: 'fixed' as const
	}
];
