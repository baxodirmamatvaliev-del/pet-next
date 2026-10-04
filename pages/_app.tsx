import { ApolloProvider } from '@apollo/client';
import type { AppProps } from 'next/app';

import { useApollo } from '../apollo/client';
import '../scss/app.scss';

export default function App({ Component, pageProps }: AppProps) {
	const apolloClient = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={apolloClient}>
			<Component {...pageProps} />
		</ApolloProvider>
	);
}
