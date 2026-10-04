import {
	ApolloClient,
	ApolloLink,
	InMemoryCache,
	NormalizedCacheObject,
	from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { useMemo } from 'react';

import { getJwtToken } from '../libs/auth';
import { REACT_APP_API_GRAPHQL_URL } from '../libs/config';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

function createApolloClient() {
	const authLink = new ApolloLink((operation, forward) => {
		const token = getJwtToken();

		operation.setContext(({ headers = {} }) => ({
			headers: {
				...headers,
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		}));

		return forward(operation);
	});

	const errorLink = onError(({ graphQLErrors, networkError }) => {
		graphQLErrors?.forEach(({ message }) => {
			console.error(`[GraphQL error]: ${message}`);
		});

		if (networkError) console.error(`[Network error]: ${networkError.message}`);
	});

	const uploadLink = createUploadLink({
		uri: REACT_APP_API_GRAPHQL_URL,
	});

	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: from([errorLink, authLink, uploadLink]),
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
