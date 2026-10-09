import { ApolloProvider } from '@apollo/client';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import { useApollo } from '../apollo/client';
import { light } from '../scss/MaterialTheme';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const theme = createTheme(light);
const socialDescription = 'Shop quality products for dogs and cats, and meet pets in the PetNest Korea community.';
const socialImage = 'https://koreapet.tech/og-petnest-korea.jpg';

const App = ({ Component, pageProps }: AppProps) => {
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<Head>
					<meta property="og:type" content="website" key="og:type" />
					<meta property="og:site_name" content="PetNest Korea" key="og:site_name" />
					<meta property="og:title" content="PetNest Korea — Everything they love" key="og:title" />
					<meta property="og:description" content={socialDescription} key="og:description" />
					<meta property="og:image" content={socialImage} key="og:image" />
					<meta property="og:image:width" content="1200" key="og:image:width" />
					<meta property="og:image:height" content="630" key="og:image:height" />
					<meta property="og:image:alt" content="A golden retriever and cat with the PetNest Korea name" key="og:image:alt" />
					<meta name="twitter:card" content="summary_large_image" key="twitter:card" />
					<meta name="twitter:title" content="PetNest Korea — Everything they love" key="twitter:title" />
					<meta name="twitter:description" content={socialDescription} key="twitter:description" />
					<meta name="twitter:image" content={socialImage} key="twitter:image" />
				</Head>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default App;
