import { describe, it, expect } from 'vitest';
import { newUlid } from '../../../src/lib/server/db/ulid';

describe('ulid', () => {
	it('returns a 26-char ULID', () => {
		const id = newUlid();
		expect(id).toHaveLength(26);
		expect(id).toMatch(/^[0-9A-Z]+$/);
	});
	it('is monotonically increasing within ms', () => {
		const a = newUlid();
		const b = newUlid();
		expect(b > a).toBe(true);
	});
});
