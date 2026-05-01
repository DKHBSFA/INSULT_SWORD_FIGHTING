export const personas = [
	{
		id: 'old_pirate_brutus',
		userId: 'usr_npc_brutus',
		email: 'npc-old_pirate_brutus@isf.local',
		name: 'Brutus',
		description:
			"A weather-beaten old British pirate. Speaks with nautical metaphors, wry sarcasm, and the tone of someone who has seen too many unworthy duels. Vocabulary peppered with sea terms; insults often invoke barnacles, rats, scurvy, hard-tack, salt, and the sea's indifference. Believes himself the wisest fool in the Caribbean.",
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
		spriteSetUrl: '/assets/personas/trainer.svg',
		poolMode: 'fixed' as const
	}
];
