import type { EmailProvider, MagicLinkEmail } from './provider';

const SUBJECT = { en: 'Your sword is ready', it: 'La tua spada ti aspetta' };
const BODY = {
	en: (link: string) =>
		`Click to enter the duel arena:\n\n${link}\n\nThis link expires in 10 minutes.`,
	it: (link: string) =>
		`Clicca per entrare nell'arena dei duelli:\n\n${link}\n\nQuesto link scade in 10 minuti.`
};

export class ResendEmailProvider implements EmailProvider {
	constructor(
		private apiKey: string,
		private from: string
	) {}
	async sendMagicLink(input: MagicLinkEmail): Promise<void> {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: this.from,
				to: input.to,
				subject: SUBJECT[input.language],
				text: BODY[input.language](input.link)
			})
		});
		if (!res.ok) throw new Error(`Resend send failed: ${res.status}`);
	}
}
