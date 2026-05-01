import { describe, it, expect } from 'vitest';
import { matches } from '../../../db/schema';

describe('matches', () => {
	it('has challengeId, matchIndex, scores', () => {
		expect(matches.challengeId).toBeDefined();
		expect(matches.scoreUser).toBeDefined();
		expect(matches.scoreOpponent).toBeDefined();
	});
});
