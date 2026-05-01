import { describe, it, expect } from 'vitest';
import { turns } from '../../../db/schema';

describe('turns', () => {
	it('has judgment, judgeModel, opponentModel', () => {
		expect(turns.judgment).toBeDefined();
		expect(turns.judgeModel).toBeDefined();
		expect(turns.opponentModel).toBeDefined();
	});
});
