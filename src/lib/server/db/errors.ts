export function isUniqueError(e: unknown): boolean {
	let cur: unknown = e;
	while (cur) {
		const msg = cur instanceof Error ? cur.message : String(cur);
		if (msg.includes('UNIQUE')) return true;
		cur = cur instanceof Error ? cur.cause : undefined;
	}
	return false;
}
