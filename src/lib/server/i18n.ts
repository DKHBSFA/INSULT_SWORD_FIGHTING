export function detectLanguage(acceptLanguage: string | null): 'en' | 'it' {
	if (acceptLanguage?.toLowerCase().includes('it')) return 'it';
	return 'en';
}
