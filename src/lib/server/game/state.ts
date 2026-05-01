import { MATCH_REGULAR_TURNS, SUDDEN_DEATH_MAX } from '../../shared/types';
import type { Judgment, Side } from '../../shared/types';

export type Score = {
	user: number;
	opponent: number;
	ties: number;
	turnsPlayed: number;
	suddenDeath: number;
};

export function isMatchOver(s: Score): boolean {
	if (s.turnsPlayed < MATCH_REGULAR_TURNS) {
		return (
			s.user > Math.floor(MATCH_REGULAR_TURNS / 2) ||
			s.opponent > Math.floor(MATCH_REGULAR_TURNS / 2)
		);
	}
	if (s.user !== s.opponent) return true;
	if (s.suddenDeath >= SUDDEN_DEATH_MAX) return true;
	return false;
}

export function matchWinner(s: Score): 'user' | 'opponent' | null {
	if (!isMatchOver(s)) return null;
	if (s.user > s.opponent) return 'user';
	if (s.opponent > s.user) return 'opponent';
	return Math.random() < 0.5 ? 'user' : 'opponent';
}

export function nextAttacker(prev: Side, judgment: Exclude<Judgment, 'timeout'>): Side {
	if (judgment === 'tie') return Math.random() < 0.5 ? 'user' : 'opponent';
	if (judgment === 'attacker_wins') return prev;
	return prev === 'user' ? 'opponent' : 'user';
}
