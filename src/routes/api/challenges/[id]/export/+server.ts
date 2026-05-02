import type { RequestHandler } from './$types';
import { makeDb } from '$lib/server/db/client';
import { challenges, matches, turns, opponentPersonas } from '../../../../../../db/schema';
import { eq, asc } from 'drizzle-orm';
import { readDevUserId } from '$lib/server/auth/dev-user';
import type { Judgment, Side } from '$lib/shared/types';

function fmtTs(ms: number | null | undefined): string {
	if (!ms) return '—';
	const d = new Date(ms);
	const pad = (n: number) => n.toString().padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
		d.getMinutes()
	)}`;
}

function outcomeLabel(j: Judgment, attacker: Side): string {
	if (j === 'tie') return 'Pareggio';
	if (j === 'attacker_wins') return attacker === 'user' ? 'Hai vinto' : 'Hai perso';
	return attacker === 'user' ? 'Hai perso' : 'Hai vinto';
}

export const GET: RequestHandler = async ({ params, platform, request }) => {
	if (!platform?.env) return new Response('platform unavailable', { status: 500 });
	const env = platform.env;
	const db = makeDb(env.DB);
	const userId = readDevUserId(request, env);
	if (!userId) return new Response('unauthorized', { status: 401 });

	const ch = (await db.select().from(challenges).where(eq(challenges.id, params.id)).limit(1))[0];
	if (!ch || ch.userId !== userId) return new Response('not found', { status: 404 });

	const persona = (
		await db
			.select()
			.from(opponentPersonas)
			.where(eq(opponentPersonas.userId, ch.opponentUserId))
			.limit(1)
	)[0];
	const oppName = persona?.name ?? 'Avversario';

	const allMatches = await db
		.select()
		.from(matches)
		.where(eq(matches.challengeId, ch.id))
		.orderBy(asc(matches.matchIndex));

	const allTurns = await Promise.all(
		allMatches.map((m) =>
			db.select().from(turns).where(eq(turns.matchId, m.id)).orderBy(asc(turns.turnNumber))
		)
	);

	const lines: string[] = [];
	lines.push(`# Sfida vs ${oppName}`);
	lines.push('');
	lines.push(`- **Modalità**: ${ch.format === 'bo1' ? 'Best of 1' : 'Best of 2'}`);
	const statusLabel =
		ch.status === 'completed'
			? `Completata${ch.winner ? ` — vinta da ${ch.winner === 'user' ? 'te' : oppName}` : ''}`
			: ch.status === 'abandoned'
				? 'Abbandonata'
				: 'In corso';
	lines.push(`- **Stato**: ${statusLabel}`);
	lines.push(`- **Iniziata**: ${fmtTs(ch.startedAt)}`);
	if (ch.endedAt) lines.push(`- **Finita**: ${fmtTs(ch.endedAt)}`);
	lines.push('');

	allMatches.forEach((m, mi) => {
		if (allMatches.length > 1) {
			lines.push(`## Match ${m.matchIndex}`);
		}
		lines.push(
			`Punteggio: **Tu ${m.scoreUser} — ${oppName} ${m.scoreOpponent}** (pareggi: ${m.scoreTies})`
		);
		if (m.winner) lines.push(`Vincitore: ${m.winner === 'user' ? 'tu' : oppName}`);
		lines.push('');

		const ts = allTurns[mi] ?? [];
		ts.forEach((t) => {
			const heading = allMatches.length > 1 ? '###' : '##';
			lines.push(`${heading} Turno ${t.turnNumber}${t.isSuddenDeath ? ' (sudden death)' : ''}`);
			const attackerLabel = t.attacker === 'user' ? 'Tu attacchi' : `${oppName} attacca`;
			const defenderLabel = t.attacker === 'user' ? `${oppName} difende` : 'Tu difendi';
			lines.push(`- **${attackerLabel}**: «${t.attackText}»`);
			lines.push(`- **${defenderLabel}**: «${t.defenseText ?? ''}»`);
			lines.push(`- **Esito**: ${outcomeLabel(t.judgment as Judgment, t.attacker as Side)}`);
			if (t.judgmentReasoning) lines.push(`- **Giudizio**: ${t.judgmentReasoning}`);
			lines.push('');
		});
	});

	const filename = `sfida-${oppName.toLowerCase().replace(/\s+/g, '-')}-${ch.id.slice(-6)}.md`;
	return new Response(lines.join('\n'), {
		status: 200,
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
};
