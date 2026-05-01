import { describe, it, expect } from 'vitest';
import { attackPool, defensePool } from '../../../db/schema';

describe('pool tables', () => {
	it('attackPool has expected columns', () => {
		expect(attackPool.featuresJson).toBeDefined();
		expect(attackPool.embeddingId).toBeDefined();
		expect(attackPool.learnedFromUserId).toBeDefined();
	});
	it('defensePool has timesWon and source enum', () => {
		expect(defensePool.timesWon).toBeDefined();
		expect(defensePool.source).toBeDefined();
	});
});
