import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '../../i18n';

const Hero = () => {
	const { t } = useTranslation();

	return (
		<Stack component="section" className="home-hero" aria-labelledby="home-hero-title">
			<Box className="home-hero__layout container">
				<Stack className="home-hero__content">
					<Typography component="h1" id="home-hero-title">
						{t('ui.everything')}<br />{t('ui.theyLove')}
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
			</Box>
			<Box className="home-hero__art" aria-hidden="true">
				<Image src="/img/corgi-peeking.png" alt="" width={335} height={236}
					className="home-hero__image" sizes="(max-width: 760px) 210px, 335px" preload />
			</Box>
			<svg className="home-hero__wave" viewBox="0 0 1440 180" preserveAspectRatio="none" aria-hidden="true">
				<path d="M0 135C140 135 190 50 300 55S530 160 680 130S1030-35 1160 10S1360 60 1440 115V0H0Z" fill="currentColor" />
			</svg>
		</Stack>
	);
};

export default Hero;
