// Dumps the exact system + user prompt strings that go to Mistral 24B for a
// chosen scenario. Used for offline review before deploy.
//
// Usage:
//   node scripts/dump-prompts.mjs
//
// Imports the TS prompt builders directly via tsx-style resolution. Falls
// back to esbuild on-the-fly compile via node's --experimental-loader if tsx
// is not installed; simplest path is `npx tsx scripts/dump-prompts.mjs`.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

// We compile the relevant TS to a single bundle via esbuild CLI, then import.
const BUNDLE = '/tmp/isf-prompt-bundle.mjs';
execFileSync(
	'npx',
	[
		'-y',
		'esbuild',
		'/tmp/isf-prompt-entry.ts',
		'--bundle',
		'--format=esm',
		'--platform=node',
		'--target=es2022',
		'--external:cloudflare:workers',
		`--outfile=${BUNDLE}`
	],
	{ stdio: 'inherit' }
);

const mod = await import(BUNDLE);

const personas = {
	brutus: {
		descriptionIt:
			"Vecchio pirata inglese segnato dal tempo. Parla con metafore marinaresche, sarcasmo asciutto, e il tono di chi ha visto troppi duelli indegni. Lessico marinaresco; insulti spesso evocano cirripedi, topi, scorbuto, gallette di nave, sale, e l'indifferenza del mare."
	},
	reginald: {
		descriptionIt:
			"Nobile continentale del primo Settecento. Insulti decorati con tag in latino, disprezzo per le classi inferiori, riferimenti a lignaggio, igiene, e galateo. Tono: superficialmente cortese, fondamentalmente devastante."
	}
};

function dump(label, persona, difficulty, role, userAttack) {
	console.log('\n\n================================================================');
	console.log(`SCENARIO: ${label}`);
	console.log(`persona = ${persona}, difficulty = ${difficulty}, role = ${role}`);
	console.log(`user attack = ${userAttack || '(opening, none)'}`);
	console.log('================================================================\n');

	const builder = role === 'attacker' ? mod.buildAttackerSystemPrompt : mod.buildDefenderSystemPrompt;
	const sys = builder({
		personaDescription: personas[persona].descriptionIt,
		mirrorLanguage: 'it',
		difficulty
	});

	console.log('--- SYSTEM PROMPT ---');
	console.log(sys);
	console.log('--- END SYSTEM PROMPT ---');
}

dump('A — Brutus difensore difficoltà MEDIUM (tier 2)', 'brutus', 'medium', 'defender', 'Brutus, hai la spada così arrugginita che potresti grattugiare il parmigiano con la lama.');

dump('B — Brutus difensore difficoltà EASY (tier 1)', 'brutus', 'easy', 'defender', 'Brutus, hai la spada così arrugginita che potresti grattugiare il parmigiano con la lama.');

dump('C — Reginald difensore difficoltà EXPERT (tier 4)', 'reginald', 'expert', 'defender', 'Brutus, hai la spada così arrugginita che potresti grattugiare il parmigiano con la lama.');

console.log('\n\n--- JUDGE SYSTEM PROMPT (it) ---');
console.log(mod.buildJudgeSystemPrompt('it'));
console.log('--- END JUDGE PROMPT ---');

writeFileSync('/tmp/isf-prompts-dump.txt', '(see stdout)');
