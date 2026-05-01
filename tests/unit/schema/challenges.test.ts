import { describe, it, expect } from 'vitest';
import { challenges } from '../../../db/schema';

describe('challenges', () => {
	it('has opponentUserId and mode', () => {
		expect(challenges.opponentUserId).toBeDefined();
		expect(challenges.mode).toBeDefined();
		expect(challenges.format).toBeDefined();
	});
});
