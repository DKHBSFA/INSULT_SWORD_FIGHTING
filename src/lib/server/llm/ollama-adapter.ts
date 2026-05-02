import type { Ai } from '@cloudflare/workers-types';

const EMBEDDING_DIM = 1024;

type ChatInput = {
	messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
	max_tokens?: number;
};

type OpenAIChatResponse = {
	choices: { message: { content: string } }[];
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

function stripCodeFences(text: string): string {
	const fence = text.match(/^\s*```(?:[a-zA-Z]+)?\n([\s\S]*?)\n```\s*$/);
	return fence?.[1] ?? text;
}

export function makeOllamaAi(baseUrl: string, model: string): Ai {
	const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

	async function run(modelId: string, input: unknown): Promise<unknown> {
		if (modelId === '@cf/baai/bge-m3') {
			const text = (input as { text: string[] })?.text?.[0] ?? '';
			return { data: [pseudoRandomVector(text)] };
		}
		const chat = input as ChatInput;
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				model,
				messages: chat.messages,
				max_tokens: chat.max_tokens ?? 512,
				temperature: 0.7
			})
		});
		if (!res.ok) {
			const body = await res.text().catch(() => '');
			throw new Error(`ollama ${res.status}: ${body.slice(0, 200)}`);
		}
		const data = (await res.json()) as OpenAIChatResponse;
		const raw = data.choices?.[0]?.message?.content ?? '';
		return { response: stripCodeFences(raw.trim()) };
	}

	return { run } as unknown as Ai;
}
