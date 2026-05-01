export type MagicLinkEmail = { to: string; link: string; language: 'en' | 'it' };

export interface EmailProvider {
	sendMagicLink(input: MagicLinkEmail): Promise<void>;
}
