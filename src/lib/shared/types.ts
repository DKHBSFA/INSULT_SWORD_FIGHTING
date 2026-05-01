export type Judgment = 'attacker_wins' | 'defender_wins' | 'tie' | 'timeout';
export type ChallengeFormat = 'bo1' | 'bo2';
export type ChallengeMode = 'tutorial' | 'match';
export type Side = 'user' | 'opponent';
export type EntryKind = 'attack' | 'defense';

export type TurnState = {
	matchId: string;
	turnNumber: number;
	attacker: Side;
	attackText: string;
	attackStartedAt: number;
};

export const TURN_TIMER_MS = 25_000;
export const MATCH_REGULAR_TURNS = 5;
export const SUDDEN_DEATH_MAX = 5;
