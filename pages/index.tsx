import type { NextPage } from 'next';
import { Stack } from '@mui/material';

import BestSellers from '../libs/components/homepage/BestSellers';
import Benefits from '../libs/components/homepage/Benefits';
import CategoryNavigation from '../libs/components/homepage/CategoryNavigation';
import CommunityPets from '../libs/components/homepage/CommunityPets';
import Hero from '../libs/components/homepage/Hero';
import PetVideo from '../libs/components/homepage/PetVideo';
import PetMoments from '../libs/components/homepage/PetMoments';
import withLayoutHome from '../libs/components/layout/LayoutHome';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';

const Home: NextPage = () => {
	const device = useDeviceDetect();

	/** RENDER MOBILE **/
	if (device === 'mobile') {
		return (
			<Stack component="main" className="home-page home-page--mobile">
				<Hero />
				<CategoryNavigation />
				<BestSellers />
				<CommunityPets />
				<PetVideo />
				<PetMoments />
				<Benefits />
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack component="main" className="home-page home-page--pc">
				<Hero />
				<CategoryNavigation />
				<BestSellers />
				<CommunityPets />
				<PetVideo />
				<PetMoments />
				<Benefits />
			</Stack>
		);
	}
};

export default withLayoutHome(Home);
