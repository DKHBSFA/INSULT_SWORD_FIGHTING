export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert', 'legendary'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; hint: string }> = {
	easy: { label: 'Facile', hint: 'Avversario distratto, ti lascia entrare.' },
	medium: { label: 'Normale', hint: 'Duellante competente, da prendere sul serio.' },
	hard: { label: 'Difficile', hint: 'Risposte taglienti, pochi varchi.' },
	expert: { label: 'Esperto', hint: 'Riferimenti ricercati, ribaltamenti veloci.' },
	legendary: { label: 'Leggendario', hint: 'Sword Master. Ti vedrà arrivare.' }
};

// Mapping difficoltà → modello LLM (Cloudflare Workers AI in prod).
// In dev tutti puntano al modello locale Ollama (ignored, gateway sceglie via OLLAMA_MODEL).
// Più il modello è grande/recente, maggiore la difficoltà.
export const DIFFICULTY_MODEL: Record<Difficulty, { opponent: string; judge: string }> = {
	easy: {
		opponent: '@cf/meta/llama-3.2-3b-instruct',
		judge: '@cf/qwen/qwq-32b'
	},
	medium: {
		opponent: '@cf/google/gemma-3-12b-it',
		judge: '@cf/qwen/qwq-32b'
	},
	hard: {
		opponent: '@cf/qwen/qwen2.5-coder-32b-instruct',
		judge: '@cf/qwen/qwq-32b'
	},
	expert: {
		opponent: '@cf/mistralai/mistral-small-3.1-24b-instruct',
		judge: '@cf/mistralai/mistral-small-3.1-24b-instruct'
	},
	legendary: {
		opponent: '@cf/qwen/qwen3-30b-a3b-instruct',
		judge: '@cf/qwen/qwen3-30b-a3b-instruct'
	}
};

export function modelForDifficulty(d: Difficulty): { opponent: string; judge: string } {
	return DIFFICULTY_MODEL[d];
}
