import { useEffect, useRef } from 'react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from '../../i18n';

const Hero = () => {
	const { t } = useTranslation();
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => {
			if (motion.matches) video.pause();
			else void video.play().catch(() => { /* Keep the poster if autoplay is unavailable. */ });
		};
		update();
		motion.addEventListener('change', update);
		return () => motion.removeEventListener('change', update);
	}, []);

	return (
		<Stack component="section" className="home-hero" aria-labelledby="home-hero-title">
			<video
				ref={videoRef}
				className="home-hero__video"
				src="/video/home-hero.mp4"
				poster="/video/home-hero.jpg"
				muted loop playsInline preload="metadata" aria-hidden="true"
			/>
			<Stack className="home-hero__content container">
				<Typography component="span" className="eyebrow">{t('ui.forHappyDogsAndCats')}</Typography>
				<Typography component="h1" id="home-hero-title">
					{t('ui.everything')}<br />{t('ui.theyLove')}
				</Typography>
				<Typography>{t('ui.premiumAccessoriesAndEssentialsForHealthierHappierDays')}</Typography>
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
};

export default Hero;
