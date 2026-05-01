import Anthropic from '@anthropic-ai/sdk';
import type { Ai } from '@cloudflare/workers-types';

const EMBEDDING_DIM = 1024;
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';

type ChatInput = {
	messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
	max_tokens?: number;
};

function pseudoRandomVector(seed: string, dim = EMBEDDING_DIM): number[] {
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
	const out = new Array<number>(dim);
	for (let i = 0; i < dim; i++) {
		h = (h * 1664525 + 1013904223) | 0;
		out[i] = (h & 0xffff) / 0xffff - 0.5;
	}
	const norm = Math.sqrt(out.reduce((s, v) => s + v * v, 0)) || 1;
	return out.map((v) => v / norm);
}

export function makeAnthropicAi(apiKey: string): Ai {
	const client = new Anthropic({ apiKey });

	async function run(model: string, input: unknown): Promise<unknown> {
		if (model === '@cf/baai/bge-m3') {
			const text = (input as { text: string[] })?.text?.[0] ?? '';
			return { data: [pseudoRandomVector(text)] };
		}
		const chat = input as ChatInput;
		const sysMsg = chat.messages.find((m) => m.role === 'system');
		const userMsgs = chat.messages.filter((m) => m.role !== 'system');
		const res = await client.messages.create({
			model: ANTHROPIC_MODEL,
			max_tokens: chat.max_tokens ?? 512,
			system: sysMsg?.content ?? '',
			messages: userMsgs.map((m) => ({
				role: m.role as 'user' | 'assistant',
				content: m.content
			}))
		});
		const text =
			res.content
				.filter((b) => b.type === 'text')
				.map((b) => (b as { type: 'text'; text: string }).text)
				.join('\n') ?? '';
		return { response: text };
	}

	return { run } as unknown as Ai;
}
