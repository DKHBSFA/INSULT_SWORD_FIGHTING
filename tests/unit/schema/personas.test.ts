import { describe, it, expect } from 'vitest';
import { opponentPersonas } from '../../../db/schema';

describe('opponent_personas table', () => {
	it('has poolMode with check constraint', () => {
		expect(opponentPersonas).toBeDefined();
		expect(opponentPersonas.poolMode).toBeDefined();
		expect(opponentPersonas.userId).toBeDefined();
	});
});
