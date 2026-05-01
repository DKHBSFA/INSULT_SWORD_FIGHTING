export function canonicalize(input: string): string {
	return input.normalize('NFC').toLowerCase().trim().replace(/\s+/g, ' ');
}
