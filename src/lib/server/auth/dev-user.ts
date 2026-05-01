export const DEV_USER_COOKIE = 'isf_dev_user';

export function readDevUserId(request: Request, env: { ENVIRONMENT: string }): string | null {
	if (env.ENVIRONMENT === 'production') return null;
	const fromHeader = request.headers.get('X-Test-User');
	if (fromHeader) return fromHeader;
	const cookieHeader = request.headers.get('Cookie') ?? '';
	const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${DEV_USER_COOKIE}=([^;]+)`));
	return match?.[1] ? decodeURIComponent(match[1]) : null;
}
