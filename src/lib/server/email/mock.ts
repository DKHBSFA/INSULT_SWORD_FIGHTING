import type { EmailProvider, MagicLinkEmail } from './provider';

export class MockEmailProvider implements EmailProvider {
	sent: MagicLinkEmail[] = [];
	async sendMagicLink(input: MagicLinkEmail): Promise<void> {
		this.sent.push(input);
		console.log(`[MockEmail] magic link to ${input.to} (${input.language}): ${input.link}`);
	}
}
