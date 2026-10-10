//— login/signup/logout.//
import { initializeApollo } from '../../apollo/client';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';
import { Message } from '../enums/common.enum';
import { endSession, restoreSession, setJwtToken } from './session';

export { getJwtToken, getValidAccessToken, setJwtToken } from './session';

// Login javobidagi access token xotiraga, refresh cookie esa brauzerga yoziladi.
export async function logIn(nick: string, password: string): Promise<void> {
	await restoreSession();
	const { data } = await initializeApollo().mutate<{ login: { accessToken: string } }>({
		mutation: LOGIN,
		variables: { input: { memberNick: nick, memberPassword: password } },
		context: { skipRefresh: true },
	});
	if (!data?.login.accessToken) throw new Error(Message.SOMETHING_WENT_WRONG);
	await initializeApollo().clearStore(); // Oldingi akkaunt ma’lumotlari cache’da qolmasin.
	setJwtToken(data.login.accessToken);
}

// Signup ham login kabi access token va refresh cookie beradi.
export async function signUp(nick: string, password: string, phone: string): Promise<void> {
	await restoreSession();
	const { data } = await initializeApollo().mutate<{ signup: { accessToken: string } }>({
		mutation: SIGN_UP,
		variables: { input: { memberNick: nick, memberPassword: password, memberPhone: phone } },
		context: { skipRefresh: true },
	});
	if (!data?.signup.accessToken) throw new Error(Message.SOMETHING_WENT_WRONG);
	await initializeApollo().clearStore();
	setJwtToken(data.signup.accessToken);
}

// Server sessiyasi yopilgach, eski foydalanuvchi cache’ini ham tozalaymiz.
export async function logOut(): Promise<void> {
	await endSession();
	await initializeApollo().clearStore();
	window.location.reload();
}
