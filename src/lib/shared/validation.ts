export const INSULT_MAX_CHARS = 280;
export const DISPLAY_NAME_MAX_CHARS = 30;

export class ValidationError extends Error {}

export function validateInsultText(text: string): string {
	const trimmed = text.trim();
	if (trimmed.length === 0) throw new ValidationError('insult must not be empty');
	if (trimmed.length > INSULT_MAX_CHARS)
		throw new ValidationError(`insult exceeds ${INSULT_MAX_CHARS} chars`);
	return trimmed;
}

export function validateDisplayName(name: string): string {
	const trimmed = name.trim();
	if (trimmed.length === 0) throw new ValidationError('display name must not be empty');
	if (trimmed.length > DISPLAY_NAME_MAX_CHARS)
		throw new ValidationError(`display name exceeds ${DISPLAY_NAME_MAX_CHARS} chars`);
	return trimmed;
}
