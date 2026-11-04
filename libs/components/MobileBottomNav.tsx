import { useReactiveVar } from '@apollo/client';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { Box } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { cartCountVar, userVar } from '../../apollo/store';
import { useTranslation } from '../i18n';

const FAVORITES_PATH = '/mypage?category=myFavorites';

const MobileBottomNav = () => {
	const router = useRouter();
	const { t } = useTranslation();

	/** STATES **/
	const user = useReactiveVar(userVar);
	const cartCount = useReactiveVar(cartCountVar);

	/** COMPUTED VALUES **/
	const isFavorites = router.pathname === '/mypage' && router.query.category === 'myFavorites';
	const accountHref = user?.sub
		? '/mypage'
		: `/account/join?referrer=${encodeURIComponent('/mypage')}`;
	const favoritesHref = user?.sub
		? FAVORITES_PATH
		: `/account/join?referrer=${encodeURIComponent(FAVORITES_PATH)}`;
	const cartBadge = cartCount > 99 ? '99+' : cartCount;
	const items = [
		{
			id: 'home',
			href: '/',
			label: t('ui.home'),
			icon: HomeOutlinedIcon,
			active: router.pathname === '/',
		},
		{
			id: 'products',
			href: '/product',
			label: t('nav.products'),
			icon: StorefrontOutlinedIcon,
			active: router.pathname.startsWith('/product'),
		},
		{
			id: 'favorites',
			href: favoritesHref,
			label: t('nav.favorites'),
			icon: FavoriteBorderRoundedIcon,
			active: isFavorites,
		},
		{
			id: 'cart',
			href: '/cart',
			label: t('nav.cart'),
			icon: ShoppingCartOutlinedIcon,
			active: ['/cart', '/checkout', '/order/detail'].includes(router.pathname),
		},
		{
			id: 'account',
			href: accountHref,
			label: t('nav.account'),
			icon: PersonOutlineRoundedIcon,
			active: (router.pathname === '/mypage' && !isFavorites) || router.pathname.startsWith('/account'),
		},
	];

	/** RENDER **/
	return (
		<Box component="nav" className="mobile-bottom-nav" aria-label={t('nav.shoppingActions')}>
			{items.map(({ id, href, label, icon: Icon, active }) => (
				<Link
					key={id}
					href={href}
					className={`mobile-bottom-nav__item${active ? ' is-active' : ''}`}
					aria-current={active ? 'page' : undefined}
					aria-label={id === 'cart' ? `${label}, ${t('nav.itemCount', { count: cartCount })}` : label}
				>
					<span className="mobile-bottom-nav__icon">
						<Icon aria-hidden="true" />
						{id === 'cart' && cartCount > 0 && (
							<span className="mobile-bottom-nav__badge" aria-hidden="true">
								{cartBadge}
							</span>
						)}
					</span>
					<span className="mobile-bottom-nav__label">{label}</span>
				</Link>
			))}
		</Box>
	);
};

export default MobileBottomNav;
