import { describe, it, expect } from 'vitest';
import { matchWinner, isMatchOver } from '../../../src/lib/server/game/state';

describe('match state', () => {
	it('detects winner at 3-1', () => {
		expect(matchWinner({ user: 3, opponent: 1, ties: 0, turnsPlayed: 4, suddenDeath: 0 })).toBe(
			'user'
		);
	});
	it('no winner at 2-2 with 4 turns', () => {
		expect(matchWinner({ user: 2, opponent: 2, ties: 0, turnsPlayed: 4, suddenDeath: 0 })).toBe(
			null
		);
	});
	it('triggers sudden death at 5 turns tied', () => {
		expect(isMatchOver({ user: 2, opponent: 2, ties: 1, turnsPlayed: 5, suddenDeath: 0 })).toBe(
			false
		);
	});
	it('coin-flip after sudden death cap', () => {
		const r = matchWinner({ user: 2, opponent: 2, ties: 1, turnsPlayed: 10, suddenDeath: 5 });
		expect(['user', 'opponent']).toContain(r);
	});
});
