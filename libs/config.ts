const DEFAULT_API_URL = 'http://localhost:3002';

const normalizeUrl = (url: string): string => url.trim().replace(/\/$/, '');
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (process.env.NODE_ENV === 'production' && !configuredApiUrl?.trim()) {
	throw new Error('NEXT_PUBLIC_API_URL must be configured for production');
}

export const REACT_APP_API_URL = normalizeUrl(configuredApiUrl ?? DEFAULT_API_URL);

export const REACT_APP_API_GRAPHQL_URL =
	normalizeUrl(process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? `${REACT_APP_API_URL}/graphql`);

export const REACT_APP_API_SOCKET_URL =
	normalizeUrl(process.env.NEXT_PUBLIC_API_SOCKET_URL ?? REACT_APP_API_URL);
