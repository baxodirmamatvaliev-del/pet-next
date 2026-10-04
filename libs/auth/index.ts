import { jwtDecode } from 'jwt-decode';

import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';

export function getJwtToken(): string {
	if (typeof window === 'undefined') return '';

	return window.localStorage.getItem('accessToken') ?? '';
}

export function setJwtToken(token: string) {
	window.localStorage.setItem('accessToken', token);
}

export function updateUserInfo(token: string) {
	const claims = jwtDecode<CustomJwtPayload>(token);
	userVar(claims);
}

export function logOut() {
	window.localStorage.removeItem('accessToken');
	userVar(null);
	window.location.reload();
}
