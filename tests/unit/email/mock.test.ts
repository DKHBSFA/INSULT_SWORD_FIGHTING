import { describe, it, expect } from 'vitest';
import { MockEmailProvider } from '../../../src/lib/server/email/mock';

describe('MockEmailProvider', () => {
	it('records sent messages', async () => {
		const m = new MockEmailProvider();
		await m.sendMagicLink({ to: 'a@b.c', link: 'https://x', language: 'en' });
		expect(m.sent).toHaveLength(1);
		expect(m.sent[0]!.to).toBe('a@b.c');
	});
});
