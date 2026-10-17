import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import CrueltyFreeOutlinedIcon from '@mui/icons-material/CrueltyFreeOutlined';
import Image from 'next/image';
import HeroFeaturedProduct from './HeroFeaturedProduct';
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
					<Typography component="span" className="home-hero__badge">
						{t('home.curatedEdit')}
					</Typography>
					<Typography component="span" className="eyebrow">
						{t('ui.forHappyDogsAndCats')}
					</Typography>
					<Typography component="h1">
						{t('ui.everything')}
						<br />
						<em>{t('ui.theyLove')}</em>
					</Typography>
					<Typography>{t('ui.premiumAccessoriesAndEssentialsForHealthierHappierDays')}</Typography>
					<Box className="home-hero__actions">
						<Button
							component={Link}
							href="/product?category=DOG"
							className="button button--primary"
						>
							<PetsOutlinedIcon />
							{t('ui.shopDogs')}
							<ArrowForwardRoundedIcon />
						</Button>
						<Button
							component={Link}
							href="/product?category=CAT"
							className="button button--secondary"
						>
							<CrueltyFreeOutlinedIcon />
							{t('ui.shopCats')}
							<ArrowForwardRoundedIcon />
						</Button>
					</Box>
					<Typography className="home-hero__trust">{t('home.trustNote')}</Typography>
				</Stack>
				<Box className="home-hero__visual">
					<Image
						src="/img/banner/home-hero.png"
						alt={t('ui.aGoldenRetrieverAndCatWithThePetnest')}
						fill
						sizes="(max-width: 760px) 100vw, 50vw"
						preload
					/>
					<HeroFeaturedProduct />
				</Box>
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack component="section" className="home-hero home-hero--pc container">
				<Stack className="home-hero__content">
					<Typography component="span" className="home-hero__badge">
						{t('home.curatedEdit')}
					</Typography>
					<Typography component="span" className="eyebrow">
						{t('ui.forHappyDogsAndCats')}
					</Typography>
					<Typography component="h1">
						{t('ui.everything')}
						<br />
						<em>{t('ui.theyLove')}</em>
					</Typography>
					<Typography>{t('ui.premiumAccessoriesAndEssentialsForHealthierHappierDays')}</Typography>
					<Box className="home-hero__actions">
						<Button
							component={Link}
							href="/product?category=DOG"
							className="button button--primary"
						>
							<PetsOutlinedIcon />
							{t('ui.shopDogs')}
							<ArrowForwardRoundedIcon />
						</Button>
						<Button
							component={Link}
							href="/product?category=CAT"
							className="button button--secondary"
						>
							<CrueltyFreeOutlinedIcon />
							{t('ui.shopCats')}
							<ArrowForwardRoundedIcon />
						</Button>
					</Box>
					<Typography className="home-hero__trust">{t('home.trustNote')}</Typography>
				</Stack>
				<Box className="home-hero__visual">
					<Image
						src="/img/banner/home-hero.png"
						alt={t('ui.aGoldenRetrieverAndCatWithThePetnest')}
						fill
						sizes="(max-width: 760px) 100vw, 50vw"
						preload
					/>
					<HeroFeaturedProduct />
				</Box>
			</Stack>
		);
	}
};

export default Hero;
