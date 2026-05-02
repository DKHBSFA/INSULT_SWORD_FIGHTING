import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { makeDb } from '$lib/server/db/client';
import {
	challenges,
	turns,
	matches,
	opponentPersonas,
	judgeFeedback
} from '../../../../../../db/schema';
import { newUlid } from '$lib/server/db/ulid';
import { readDevUserId } from '$lib/server/auth/dev-user';

const REPO = 'DKHBSFA/INSULT_SWORD_FIGHTING';

const CATEGORIES = [
	'wrong_winner',
	'wrong_reasoning',
	'invented_content',
	'incoherent',
	'other'
] as const;
type Category = (typeof CATEGORIES)[number];

const EXPECTED = ['attacker_wins', 'defender_wins', 'tie', 'unsure'] as const;
type Expected = (typeof EXPECTED)[number];

const CATEGORY_LABEL: Record<Category, string> = {
	wrong_winner: 'Vincitore sbagliato',
	wrong_reasoning: 'Motivazione sbagliata',
	invented_content: 'Il giudice ha inventato contenuti non presenti',
	incoherent: 'Motivazione incoerente con il verdetto',
	other: 'Altro'
};

function buildIssueBody(args: {
	challengeId: string;
	personaName: string;
	difficulty: string;
	modelId: string | null;
	turnNumber: number | null;
	attackText: string | null;
	defenseText: string | null;
	judgment: string | null;
	reasoning: string | null;
	category: Category;
	expected: Expected | null;
	comment: string | null;
}): string {
	return [
		'## Segnalazione utente sul giudizio del judge LLM',
		'',
		`- **Challenge**: \`${args.challengeId}\``,
		`- **Avversario**: ${args.personaName}`,
		`- **Difficoltà**: ${args.difficulty}`,
		`- **Modello LLM**: \`${args.modelId ?? '(non registrato)'}\``,
		args.turnNumber ? `- **Turno**: ${args.turnNumber}` : null,
		'',
		'### Categoria della segnalazione',
		`**${CATEGORY_LABEL[args.category]}**`,
		'',
		args.attackText
			? ['### Attacco', '> ' + args.attackText.replace(/\n/g, '\n> ')].join('\n')
			: null,
		args.defenseText
			? ['### Difesa', '> ' + args.defenseText.replace(/\n/g, '\n> ')].join('\n')
			: null,
		args.judgment ? `### Verdetto del judge\n\`${args.judgment}\`` : null,
		args.reasoning
			? ['### Motivazione del judge', '> ' + args.reasoning.replace(/\n/g, '\n> ')].join('\n')
			: null,
		args.expected && args.expected !== 'unsure'
			? `### Verdetto atteso secondo l'utente\n\`${args.expected}\``
			: null,
		args.comment ? ['### Commento utente', args.comment].join('\n') : null,
		'',
		'---',
		'_Issue creata automaticamente dal form di segnalazione in-app._'
	]
		.filter((l): l is string => l !== null)
		.join('\n');
}

export const POST: RequestHandler = async ({ request, params, platform }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = readDevUserId(request, env);
	if (!userId) return new Response('unauthorized', { status: 401 });

	const body = (await request.json()) as {
		turnId?: string;
		category: Category;
		expectedJudgment?: Expected;
		comment?: string;
	};
	if (!CATEGORIES.includes(body.category)) {
		return new Response('invalid category', { status: 400 });
	}
	if (body.expectedJudgment && !EXPECTED.includes(body.expectedJudgment)) {
		return new Response('invalid expectedJudgment', { status: 400 });
	}
	if (body.comment && body.comment.length > 2000) {
		return new Response('comment too long', { status: 400 });
	}

	const ch = (await db.select().from(challenges).where(eq(challenges.id, params.id)).limit(1))[0];
	if (!ch || ch.userId !== userId) return new Response('not found', { status: 404 });

	const persona = (
		await db
			.select()
			.from(opponentPersonas)
			.where(eq(opponentPersonas.userId, ch.opponentUserId))
			.limit(1)
	)[0];

	let turn = null;
	if (body.turnId) {
		turn =
			(
				await db
					.select()
					.from(turns)
					.innerJoin(matches, eq(matches.id, turns.matchId))
					.where(and(eq(turns.id, body.turnId), eq(matches.challengeId, ch.id)))
					.limit(1)
			)[0]?.turns ?? null;
	}

	const issueTitle = `[Judge feedback] ${persona?.name ?? 'Avversario'} · turno ${
		turn?.turnNumber ?? '?'
	} · ${CATEGORY_LABEL[body.category]}`;
	const issueBody = buildIssueBody({
		challengeId: ch.id,
		personaName: persona?.name ?? 'Avversario',
		difficulty: ch.difficulty,
		modelId: ch.modelId ?? null,
		turnNumber: turn?.turnNumber ?? null,
		attackText: turn?.attackText ?? null,
		defenseText: turn?.defenseText ?? null,
		judgment: turn?.judgment ?? null,
		reasoning: turn?.judgmentReasoning ?? null,
		category: body.category,
		expected: body.expectedJudgment ?? null,
		comment: body.comment ?? null
	});

	const githubIssueUrl = `https://github.com/${REPO}/issues/new?title=${encodeURIComponent(
		issueTitle
	)}&body=${encodeURIComponent(issueBody)}&labels=${encodeURIComponent('judge-feedback')}`;

	await db.insert(judgeFeedback).values({
		id: newUlid(),
		challengeId: ch.id,
		turnId: body.turnId ?? null,
		userId,
		category: body.category,
		expectedJudgment: body.expectedJudgment ?? null,
		comment: body.comment ?? null,
		githubIssueUrl,
		createdAt: Date.now()
	});

	return json({ githubIssueUrl });
};
