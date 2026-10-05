import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import useDeviceDetect from '../../hooks/useDeviceDetect';

const Hero = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="section" className="home-hero home-hero--mobile container">
				<Stack className="home-hero__content">
					<Typography component="span" className="eyebrow">
						For happy dogs and cats
					</Typography>
					<Typography component="h1">
						Everything
						<br />
						they love
					</Typography>
					<Typography>
						Premium accessories and essentials for healthier, happier days together.
					</Typography>
					<Box className="home-hero__actions">
						<Button component={Link} href="/product?category=DOG" className="button button--primary">
							Shop Dogs <ArrowForwardRoundedIcon />
						</Button>
						<Button component={Link} href="/product?category=CAT" className="button button--secondary">
							Shop Cats <ArrowForwardRoundedIcon />
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
						For happy dogs and cats
					</Typography>
					<Typography component="h1">
						Everything
						<br />
						they love
					</Typography>
					<Typography>
						Premium accessories and essentials for healthier, happier days together.
					</Typography>
					<Box className="home-hero__actions">
						<Button component={Link} href="/product?category=DOG" className="button button--primary">
							Shop Dogs <ArrowForwardRoundedIcon />
						</Button>
						<Button component={Link} href="/product?category=CAT" className="button button--secondary">
							Shop Cats <ArrowForwardRoundedIcon />
						</Button>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default Hero;
