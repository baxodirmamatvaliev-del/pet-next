import type { NextPage } from 'next';
import { Stack } from '@mui/material';

import BestSellers from '../libs/components/homepage/BestSellers';
import Benefits from '../libs/components/homepage/Benefits';
import CategoryNavigation from '../libs/components/homepage/CategoryNavigation';
import Hero from '../libs/components/homepage/Hero';
import withLayoutHome from '../libs/components/layout/LayoutHome';

const Home: NextPage = () => (
	<Stack component="main" className="home-page">
		<Hero />
		<CategoryNavigation />
		<BestSellers />
		<Benefits />
	</Stack>
);

export default withLayoutHome(Home);
