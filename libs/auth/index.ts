export function getJwtToken(): string {
	if (typeof window === 'undefined') return '';

	return window.localStorage.getItem('accessToken') ?? '';
}
