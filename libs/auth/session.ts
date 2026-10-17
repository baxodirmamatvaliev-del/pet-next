
//access tokenni xotirada saqlash, refresh va logout.//
import { jwtDecode } from 'jwt-decode';
import { print } from 'graphql';
import { authReadyVar, cartCountVar, userVar } from '../../apollo/store';
import { LOGOUT, REFRESH_TOKEN } from '../../apollo/user/mutation';
import { REACT_APP_API_GRAPHQL_URL } from '../config';
import { CustomJwtPayload } from '../types/customJwtPayload';

// Access token faqat xotirada. Refresh tokenni brauzer HttpOnly cookie’da saqlaydi.
let accessToken = '';
let refreshPromise: Promise<string> | undefined;
let startupPromise: Promise<void> | undefined;
let sessionVersion = 0;

export const getJwtToken = (): string => accessToken;

// Login, refresh va profil yangilanishidan kelgan tokenni bir xil usulda saqlaymiz.
export function setJwtToken(token: string): void {
	const claims = jwtDecode<CustomJwtPayload>(token);
	if (!claims.sub || !claims.exp || claims.exp <= Date.now() / 1000) {
		throw new Error('Invalid or expired access token');
	}
	accessToken = token;
	userVar(claims);
}

export function clearAuthSession(): void {
	sessionVersion += 1; // Oldin boshlangan refresh javobi login holatini qayta tiklamasin.
	accessToken = '';
	userVar(null);
	cartCountVar(0);
}

// Bir nechta tab umumiy cookie’ni bir vaqtda almashtirmasin.
export async function withSessionLock<T>(action: () => Promise<T>): Promise<T> {
	return await (navigator.locks ? navigator.locks.request('pet-refresh', action) : action());
}

type AuthError = {
	statusCode?: number;
	extensions?: { code?: string; originalError?: { statusCode?: number } };
};

export function isAuthError(error: unknown): boolean {
	const authError = error as AuthError | null;
	return authError?.statusCode === 401 || authError?.extensions?.code === 'UNAUTHENTICATED'
		|| authError?.extensions?.originalError?.statusCode === 401;
}

// Refresh/logout Apollo’dan alohida yuboriladi: refresh xatosi yana refreshni chaqirmaydi.
async function requestSession(query: string) {
	const response = await fetch(REACT_APP_API_GRAPHQL_URL, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query }),
		signal: AbortSignal.timeout(15_000),
	});
	const result = await response.json();
	if (response.status === 401 || result.errors?.some(isAuthError)) clearAuthSession();
	if (!response.ok || result.errors?.length) {
		throw new Error(result.errors?.[0]?.message ?? 'Session request failed');
	}
	return result.data;
}

// Bir tabdagi barcha so‘rovlar bitta refresh natijasini kutadi.
export function refreshAccessToken(): Promise<string> {
	if (refreshPromise) return refreshPromise;
	const version = sessionVersion;
	refreshPromise = withSessionLock(async () => {
		if (version !== sessionVersion) throw new Error('Session changed');
		const data = await requestSession(print(REFRESH_TOKEN));
		if (version !== sessionVersion) throw new Error('Session changed');
		setJwtToken(data.refreshToken.accessToken);
		return accessToken;
	}).finally(() => { refreshPromise = undefined; });
	return refreshPromise;
}

// Sahifa qayta ochilganda cookie orqali sessiyani bir marta tiklaymiz.
export function restoreSession(): Promise<void> {
	if (!startupPromise) {
		window.localStorage.removeItem('accessToken'); // Eski 30 kunlik tokenni saqlamaymiz.
		startupPromise = refreshAccessToken()
			.then(() => undefined)
			.catch(() => undefined) // Mehmonning refresh cookie’si bo‘lmasligi odatiy holat.
			.finally(() => { authReadyVar(true); });
	}
	return startupPromise;
}

// Apollo va rasm yuklash uchun muddati tugashiga yaqin tokenni oldindan yangilaymiz.
export async function getValidAccessToken(): Promise<string> {
	await restoreSession();
	if (!accessToken) return '';
	const { exp } = jwtDecode<CustomJwtPayload>(accessToken);
	return exp && exp > Date.now() / 1000 + 30 ? accessToken : refreshAccessToken();
}

// Server logoutni tasdiqlagandan keyingina brauzerdagi login holatini tozalaymiz.
export async function endSession(): Promise<void> {
	await restoreSession();
	await refreshPromise?.catch(() => undefined);
	await withSessionLock(() => requestSession(print(LOGOUT)));
	clearAuthSession();
	window.localStorage.setItem('logout', Date.now().toString());
}
