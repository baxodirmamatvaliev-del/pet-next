import type { NextPage } from 'next';
import Hero from '../libs/components/homepage/Hero';
import withLayoutHome from '../libs/components/layout/LayoutHome';

const Home: NextPage = () => (
	<main className="home-page">
		<Hero />
	</main>
);

export default withLayoutHome(Home);
