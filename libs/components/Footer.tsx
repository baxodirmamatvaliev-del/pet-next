import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import useDeviceDetect from '../hooks/useDeviceDetect';

const Footer = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="footer" className="site-footer site-footer--mobile">
				<Box className="container site-footer__inner">
					<Stack className="footer-brand">
						<Stack direction="row" className="brand brand--footer">
							<PetsRoundedIcon className="brand__mark" />
							<Stack component="span" className="brand__text">
								<Typography component="strong">PetNest</Typography>
								<Typography component="small">Korea</Typography>
							</Stack>
						</Stack>
						<Typography>Everything they love. Happy pets, happy families.</Typography>
					</Stack>
					<Stack className="footer-links">
						<Typography component="strong">Shop</Typography>
						<Link href="/product?category=DOG">Dogs</Link>
						<Link href="/product?category=CAT">Cats</Link>
						<Link href="/product?sort=productSold">Best Sellers</Link>
					</Stack>
					<Stack className="footer-links">
						<Typography component="strong">Explore</Typography>
						<Link href="/about">Our Story</Link>
						<Link href="/pet">Community</Link>
						<Link href="/cs">Contact Us</Link>
					</Stack>
				</Box>
				<Box className="container site-footer__bottom">© 2026 PetNest Korea. All rights reserved.</Box>
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack component="footer" className="site-footer site-footer--pc">
				<Box className="container site-footer__inner">
					<Stack className="footer-brand">
						<Stack direction="row" className="brand brand--footer">
							<PetsRoundedIcon className="brand__mark" />
							<Stack component="span" className="brand__text">
								<Typography component="strong">PetNest</Typography>
								<Typography component="small">Korea</Typography>
							</Stack>
						</Stack>
						<Typography>
							Everything they love.
							<br />
							Happy pets, happy families.
						</Typography>
					</Stack>
					<Stack className="footer-links">
						<Typography component="strong">Shop</Typography>
						<Link href="/product?category=DOG">Dogs</Link>
						<Link href="/product?category=CAT">Cats</Link>
						<Link href="/product?sort=productSold">Best Sellers</Link>
					</Stack>
					<Stack className="footer-links">
						<Typography component="strong">Customer Service</Typography>
						<Link href="/cs">Shipping & Delivery</Link>
						<Link href="/cs">Returns & Refunds</Link>
						<Link href="/cs">Contact Us</Link>
					</Stack>
					<Stack className="footer-links">
						<Typography component="strong">About Us</Typography>
						<Link href="/about">Our Story</Link>
						<Link href="/pet">Community</Link>
					</Stack>
				</Box>
				<Box className="container site-footer__bottom">© 2026 PetNest Korea. All rights reserved.</Box>
			</Stack>
		);
	}
};

export default Footer;
