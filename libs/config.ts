const DEFAULT_API_URL = 'http://localhost:3002';

export const REACT_APP_API_URL = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;

export const REACT_APP_API_GRAPHQL_URL =
	process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? `${REACT_APP_API_URL}/graphql`;

export const REACT_APP_API_SOCKET_URL =
	process.env.NEXT_PUBLIC_API_SOCKET_URL ?? REACT_APP_API_URL;
