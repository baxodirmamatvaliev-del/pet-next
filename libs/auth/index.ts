import { jwtDecode } from 'jwt-decode';

import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';
import { Message } from '../enums/common.enum';
import { T } from '../types/common';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { LoginInput, MemberInput } from '../types/member/member.input';

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

export const logIn = async (nick: string, password: string): Promise<void> => {
	const { jwtToken } = await requestJwtToken({ nick, password });

	if (!jwtToken) throw new Error(Message.SOMETHING_WENT_WRONG);

	updateStorage({ jwtToken });
	updateUserInfo(jwtToken);
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = initializeApollo();
	const input: LoginInput = {
		memberNick: nick,
		memberPassword: password,
	};
	const result = await apolloClient.mutate({
		mutation: LOGIN,
		variables: { input },
		fetchPolicy: 'network-only',
	});
	const data = result.data as T | null | undefined;

	return { jwtToken: data?.login?.accessToken ?? '' };
};

export const signUp = async (nick: string, password: string, phone: string): Promise<void> => {
	const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone });

	if (!jwtToken) throw new Error(Message.SOMETHING_WENT_WRONG);

	updateStorage({ jwtToken });
	updateUserInfo(jwtToken);
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
}: {
	nick: string;
	password: string;
	phone: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = initializeApollo();
	const input: MemberInput = {
		memberNick: nick,
		memberPassword: password,
		memberPhone: phone,
	};
	const result = await apolloClient.mutate({
		mutation: SIGN_UP,
		variables: { input },
		fetchPolicy: 'network-only',
	});
	const data = result.data as T | null | undefined;

	return { jwtToken: data?.signup?.accessToken ?? '' };
};

export const updateStorage = ({ jwtToken }: { jwtToken: string }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export function logOut() {
	window.localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
	userVar(null);
	window.location.reload();
}
