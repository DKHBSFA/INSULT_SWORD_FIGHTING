// v1 seed: hand-curated insults per persona. Expand to 30+30 (adaptive) and 5+5 (trainer)
// via a one-off LLM session; this baseline is sufficient for local dev and smoke tests.

export const seeds = {
	old_pirate_brutus: {
		attack: [
			'You move like a wounded hippopotamus on a slippery deck!',
			'Your courage is as deep as a tide-pool at low water.',
			'I have seen barnacles with sharper wit than you, lad.',
			'A scurvy dog with manners — and twice the breath.',
			'Your sword arm wavers like a drunkard counting waves.',
			"You stink worse than the bilge after a fortnight's becalming.",
			"Your kin must be proud — proud they've lost track of you.",
			'Even the rats abandon ships steadier than your stance.',
			'You haggle like a fishmonger and fight like one of his catches.',
			'Yer mother was a herring and yer father a buoy with delusions.',
			'A sailor of your timber would sink in a calm pond.',
			'Your face would turn the milk in a sea-cow at fifty paces.',
			"I've seen better swordplay from a one-handed clerk in a duel of wits.",
			"Your ship's a pram and your crew the rats laughing at the wheel.",
			"You smell of yesterday's grog and tomorrow's regret."
		],
		defense: [
			'Aye, and yet I stand — which is more than your father could say at his trial.',
			'You bark like a hound, but bark cannot cleave salt from sea.',
			'Big words for a soul whose biggest victory was learning to read.',
			"I've been called worse by men twice your size and half your wit.",
			'Your insult lands like rain on tarred deck — wet and forgotten.',
			'A bold tongue, but I notice it wags from a safe distance.',
			'You aim true — at yourself.',
			'Words from a man whose breath is the only sharp thing about him.',
			"I'll take your jest as a compliment; you can't tell the difference.",
			'Your mouth runs faster than your sword, and twice as foolish.',
			'A clever line, for a parrot.',
			'Aye, and your reflection winces in mirrors. Mine merely sighs.',
			"That hurts — about as much as the sting of a moth's fart.",
			'Your wit is so dull I could shave with it and still keep the beard.',
			"Try again, lad. I'll wait. The tide is patient too."
		]
	},
	haughty_nobleman: {
		attack: [
			'Your bloodline reads like a footnote — vestigial and unread.',
			'One observes you at table and pities the fork.',
			'Sapere aude, they say — you, sir, dared, and erred.',
			'Even my valet would decline to be seen with you.',
			'Your hygiene insults the very concept of soap.',
			'A peasant in costume is still a peasant, and you are not even that.',
			'You speak French as though it had personally wronged you.',
			'Cogito ergo sum — and I conclude you are not.',
			'Your conversation has the depth of a finger bowl, and half the elegance.',
			'My ancestors fought at Agincourt; yours, I suspect, fled.',
			'You would dishonor a chamber pot by sitting upon it.',
			'A man of your caste should not aspire to the company of his betters — or his equals.',
			'I find your boots offensive; you, less so, but only just.',
			'Your tailor must weep at night, and I cannot blame him.',
			"Vous êtes, monsieur, un accident d'état civil."
		],
		defense: [
			'Charming — for a foundling raised by chickens.',
			'I should expect such manners from one whose crest is a stain.',
			'Quaint. The lower orders do produce such pithy aphorisms.',
			'I weep for English when it is spoken by men of your station.',
			'Forgive me, I was distracted by the smell.',
			'A fine effort. Do try again, more loudly, so the gardener may judge.',
			'Spoken like a man whose mother could not afford a tutor — or a father.',
			'De minimis non curat lex; I shall extend the lex courtesy here.',
			'Your wit, sir, would shame a turnip.',
			'I gather you are insulting me; alas, the form is so crude I cannot be sure.',
			'You take after your name — common.',
			'Bravo. The kennels will applaud when next they hear of you.',
			"I have been crossed by sharper tongues at the fishmonger's.",
			'Pardon — I do not insult those beneath dueling.',
			'A noble effort from a man unburdened by nobility.'
		]
	},
	trainer: {
		attack: [
			'You fight like a dairy farmer.',
			'I have seen sponges with more spine.',
			"You're as graceful as a barrel of dropped pottery.",
			'Your stance betrays a profound misunderstanding of the floor.',
			'You insult like a child; defend like a smaller one.'
		],
		defense: [
			'How appropriate — you fight like a cow.',
			'A clever observation. I shall etch it in marble. Or perhaps not.',
			"My grandmother could parry that, and she's been dead a year.",
			"That's a fair point — and it lands fairly nowhere.",
			"I've heard sharper rebukes from sleeping cats."
		]
	}
} as const;
