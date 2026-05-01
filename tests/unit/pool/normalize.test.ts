import { describe, it, expect } from 'vitest';
import { canonicalize } from '../../../src/lib/server/pool/normalize';

describe('canonicalize', () => {
	it('lowercases and trims', () => {
		expect(canonicalize('  Hello WORLD  ')).toBe('hello world');
	});
	it('NFC-normalizes accented chars', () => {
		const decomposed = 'café';
		const composed = 'café';
		expect(canonicalize(decomposed)).toBe(canonicalize(composed));
	});
	it('collapses internal whitespace', () => {
		expect(canonicalize('a    b\t\tc\n\nd')).toBe('a b c d');
	});
});
