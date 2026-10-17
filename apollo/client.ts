//— cookie yuborish, tokenni headerga qo‘shish va xato bo‘lsa so‘rovni bir marta qaytarish.//

import {
	ApolloClient,
	ApolloLink,
	InMemoryCache,
	NormalizedCacheObject,
	from,
	fromPromise,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { useMemo } from 'react';

import { clearAuthSession, getJwtToken, getValidAccessToken, isAuthError, refreshAccessToken } from '../libs/auth/session';
import { REACT_APP_API_GRAPHQL_URL } from '../libs/config';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

function createIsomorphicLink() {
	// Har so‘rovdan oldin yaroqli access tokenni Authorization headerga qo‘shamiz.
	const authLink = new ApolloLink((operation, forward) => {
		if (typeof window === 'undefined') return forward(operation);
		const tokenPromise = operation.getContext().skipRefresh
			? Promise.resolve(getJwtToken()) : getValidAccessToken();
		return fromPromise(tokenPromise).flatMap((token) => {
			operation.setContext(({ headers = {} }) => ({
				headers: { ...headers, Authorization: token ? `Bearer ${token}` : '' },
			}));
			return forward(operation);
		});
	});

	// Server tokenni rad etsa, refresh qilib so‘rovni faqat bir marta qaytaramiz.
	const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
		const unauthenticated = graphQLErrors?.some(isAuthError)
			|| (networkError && isAuthError(networkError));
		if (!unauthenticated || typeof window === 'undefined' || operation.getContext().skipRefresh) return;
		if (operation.getContext().authRetried) {
			clearAuthSession();
			return;
		}
		operation.setContext({ authRetried: true });
		// Boshqa so‘rov allaqachon yangilagan bo‘lsa, yana refresh qilmaymiz.
		const sentToken = operation.getContext().headers?.Authorization;
		const tokenPromise = getJwtToken() && sentToken !== `Bearer ${getJwtToken()}`
			? Promise.resolve(getJwtToken()) : refreshAccessToken();
		return fromPromise(tokenPromise).flatMap(() => forward(operation)).map((result) => {
			// Qayta yuborilgan so‘rov ham rad etilsa, login holatini tozalaymiz.
			if (result.errors?.some(isAuthError)) clearAuthSession();
			return result;
		});
	});

	const uploadLink = createUploadLink({
		uri: REACT_APP_API_GRAPHQL_URL,
		credentials: 'include', // Login/refresh cookie’larini brauzer qabul qilsin va yuborsin.
	});

	return from([errorLink, authLink, uploadLink]);
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
	});
}

export function initializeApollo(initialState?: NormalizedCacheObject) {
	const client = apolloClient ?? createApolloClient();

	if (initialState) client.cache.restore(initialState);
	if (typeof window === 'undefined') return client;

	apolloClient = client;
	return client;
}

export function useApollo(initialState?: NormalizedCacheObject) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
