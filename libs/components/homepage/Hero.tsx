import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from '../../i18n';

const Hero = () => {
	const { t } = useTranslation();
	const device = useDeviceDetect();

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="section" className="home-hero home-hero--mobile container">
				<Stack className="home-hero__content">
					<Typography component="span" className="eyebrow">
						{t('ui.forHappyDogsAndCats')}
					</Typography>
					<Typography component="h1">
						{t('ui.everything')}<br />
						{t('ui.theyLove')}
					</Typography>
					<Typography>
						{t('ui.premiumAccessoriesAndEssentialsForHealthierHappierDays')}
					</Typography>
					<Box className="home-hero__actions">
						<Button component={Link} href="/product?category=DOG" className="button button--primary">
							{t('ui.shopDogs')}<ArrowForwardRoundedIcon />
						</Button>
						<Button component={Link} href="/product?category=CAT" className="button button--secondary">
							{t('ui.shopCats')}<ArrowForwardRoundedIcon />
						</Button>
					</Box>
				</Stack>
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack component="section" className="home-hero home-hero--pc container">
				<Stack className="home-hero__content">
					<Typography component="span" className="eyebrow">
						{t('ui.forHappyDogsAndCats')}
					</Typography>
					<Typography component="h1">
						{t('ui.everything')}<br />
						{t('ui.theyLove')}
					</Typography>
					<Typography>
						{t('ui.premiumAccessoriesAndEssentialsForHealthierHappierDays')}
					</Typography>
					<Box className="home-hero__actions">
						<Button component={Link} href="/product?category=DOG" className="button button--primary">
							{t('ui.shopDogs')}<ArrowForwardRoundedIcon />
						</Button>
						<Button component={Link} href="/product?category=CAT" className="button button--secondary">
							{t('ui.shopCats')}<ArrowForwardRoundedIcon />
						</Button>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default Hero;
