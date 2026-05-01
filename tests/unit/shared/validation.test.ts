import { describe, it, expect } from 'vitest';
import { validateInsultText, validateDisplayName } from '../../../src/lib/shared/validation';

describe('validation', () => {
	it('rejects insult >280 chars', () => {
		expect(() => validateInsultText('a'.repeat(281))).toThrow();
	});
	it('accepts insult ≤280 chars', () => {
		expect(validateInsultText('hello')).toBe('hello');
	});
	it('rejects empty insult', () => {
		expect(() => validateInsultText('')).toThrow();
	});
	it('rejects display name >30', () => {
		expect(() => validateDisplayName('x'.repeat(31))).toThrow();
	});
});
