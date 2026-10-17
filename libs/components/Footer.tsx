import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { useTranslation } from '../i18n';

const Footer = () => {
	const { t } = useTranslation();
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
						<Typography>{t('ui.everythingTheyLoveHappyPetsHappyFamilies')}</Typography>
					</Stack>
					<Stack className="footer-links">
						<Typography component="strong">{t('ui.shop')}</Typography>
						<Link href="/product?category=DOG">{t('nav.dogs')}</Link>
						<Link href="/product?category=CAT">{t('nav.cats')}</Link>
						<Link href="/product?sort=productSold">{t('nav.best')}</Link>
					</Stack>
					<Stack className="footer-links">
						<Typography component="strong">{t('ui.explore')}</Typography>
						<Link href="/pet">{t('nav.community')}</Link>
						<Link href="/agent">{t('nav.agents')}</Link>
						<Link href="/cs">{t('nav.help')}</Link>
						<Link href="/pet/create">{t('ui.createListing')}</Link>
						<Link href="/mypage?category=myOrders">{t('ui.myOrders')}</Link>
					</Stack>
				</Box>
				<Box className="container site-footer__bottom">{t('ui.2026PetnestKoreaAllRightsReserved')}</Box>
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
							{t('ui.everythingTheyLove')}<br />
							{t('ui.happyPetsHappyFamilies')}
						</Typography>
					</Stack>
					<Stack className="footer-links">
						<Typography component="strong">{t('ui.shop')}</Typography>
						<Link href="/product?category=DOG">{t('nav.dogs')}</Link>
						<Link href="/product?category=CAT">{t('nav.cats')}</Link>
						<Link href="/product?sort=productSold">{t('nav.best')}</Link>
					</Stack>
					<Stack className="footer-links">
						<Typography component="strong">{t('ui.yourAccount')}</Typography>
						<Link href="/mypage?category=myOrders">{t('ui.myOrders')}</Link>
						<Link href="/mypage?category=myFavorites">{t('nav.favorites')}</Link>
						<Link href="/mypage?category=myProfile">{t('ui.myProfile')}</Link>
					</Stack>
					<Stack className="footer-links">
						<Typography component="strong">{t('ui.explore')}</Typography>
						<Link href="/pet">{t('nav.community')}</Link>
						<Link href="/agent">{t('nav.agents')}</Link>
						<Link href="/cs">{t('nav.help')}</Link>
						<Link href="/pet/create">{t('ui.createListing')}</Link>
					</Stack>
				</Box>
				<Box className="container site-footer__bottom">{t('ui.2026PetnestKoreaAllRightsReserved')}</Box>
			</Stack>
		);
	}
};

export default Footer;
