import Head from 'next/head';
import type { ComponentType } from 'react';
import Footer from '../Footer';
import Top from '../Top';

const withLayoutHome = <P extends object>(Component: ComponentType<P>) => {
	const HomeLayout = (props: P) => (
		<>
			<Head>
				<title>PetNest Korea — Everything they love</title>
				<meta name="description" content="Premium accessories and essentials for happy dogs and cats." />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<Top />
			<Component {...props} />
			<Footer />
		</>
	);

	HomeLayout.displayName = `withLayoutHome(${Component.displayName ?? Component.name ?? 'Component'})`;
	return HomeLayout;
};

export default withLayoutHome;
