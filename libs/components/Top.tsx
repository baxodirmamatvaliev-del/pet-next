import { FormEvent, useEffect, useRef, useState } from 'react';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Box, IconButton, InputAdornment, OutlinedInput, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { cartCountVar, userVar } from '../../apollo/store';
import { GET_MY_CART } from '../../apollo/user/query';
import { T } from '../types/common';
import useDeviceDetect from '../hooks/useDeviceDetect';
import MobileMenu from './MobileMenu';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../i18n';

const Top = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const { t } = useTranslation();

	/** STATES **/
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const headerRef = useRef<HTMLElement>(null);
	const isHome = router.pathname === '/';
	const showHeaderSearch = router.pathname === '/pet';

	useEffect(() => {
		let frame = 0;
		const update = () => {
			const progress = Math.min(1, Math.max(0, window.scrollY / 180));
			headerRef.current?.style.setProperty('--header-progress', String(progress));
		};
		const onScroll = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
		};
	}, [router.asPath, device]);
	const user = useReactiveVar(userVar);
	const cartCount = useReactiveVar(cartCountVar);

	/** APOLLO REQUESTS **/
	useQuery(GET_MY_CART, {
		fetchPolicy: 'cache-and-network',
		skip: !user?.sub,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getMyCart) cartCountVar(data.getMyCart.totalQuantity);
		},
	});

	/** HANDLERS **/
	const searchProductsHandler = (searchText: string) => {
		const text = searchText.trim();
		void router.push({
			pathname: '/product',
			query: text ? { text } : {},
		});
	};

	const searchHandler = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		searchProductsHandler(searchInputRef.current?.value ?? '');
	};

	const mobileMenuOpenHandler = () => {
		setMobileMenuOpen(true);
	};

	const mobileMenuCloseHandler = () => {
		setMobileMenuOpen(false);
	};

	const categoryNavigation = (
		<Box component="nav" className={!showHeaderSearch ? 'header-inline-nav' : 'category-nav'} aria-label={t('nav.categories')}>
			<Stack direction="row" className={!showHeaderSearch ? 'header-inline-nav__inner' : 'container category-nav__inner'}>
				<Link href="/product">{t('nav.products')}</Link>
				<Link href="/product?category=DOG">{t('nav.dogs')}</Link>
				<Link href="/product?category=CAT">{t('nav.cats')}</Link>
				<Link href="/product?sort=createdAt">{t('nav.new')}</Link>
				<Link href="/product?sort=productSold">{t('nav.best')}</Link>
				<Link href="/agent">{t('nav.agents')}</Link>
				<Link href="/pet">{t('nav.community')}</Link>
				<Link href="/cs">{t('nav.help')}</Link>
			</Stack>
		</Box>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="header" ref={headerRef} className={`site-header site-header--mobile${isHome ? ' site-header--home' : ''}`}>
				<Box className="header-main container">
					<Stack direction="row" component={Link} href="/" className="brand" aria-label={t('nav.home')}>
						<PetsRoundedIcon className="brand__mark" />
						<Stack component="span" className="brand__text">
							<Typography component="strong">PetNest</Typography>
							<Typography component="small">Korea</Typography>
						</Stack>
					</Stack>
					<Stack direction="row" component="nav" className="header-actions" aria-label={t('nav.shoppingActions')}>
						<ThemeToggle />
						<NotificationBell />
						<Stack component={Link} href="/cart" aria-label={t('nav.shoppingCart')} className="cart-link">
							<LocalMallOutlinedIcon />
							<Typography component="span">{t('nav.cart')}</Typography>
							<Typography component="b">{cartCount}</Typography>
						</Stack>
					</Stack>
					<IconButton className="mobile-menu" onClick={mobileMenuOpenHandler} aria-label={t('nav.openMenu')} aria-expanded={mobileMenuOpen}>
						<MenuRoundedIcon />
					</IconButton>
				</Box>
				<MobileMenu
					open={mobileMenuOpen}
					authenticated={Boolean(user?.sub)}
					cartCount={cartCount}
					closeHandler={mobileMenuCloseHandler}
					searchProductsHandler={searchProductsHandler}
				/>
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack component="header" ref={headerRef} className={`site-header site-header--pc${isHome ? ' site-header--home' : ''}${!showHeaderSearch ? ' site-header--inline' : ''}`}>
				<Box className="header-main container">
					<Stack direction="row" component={Link} href="/" className="brand" aria-label={t('nav.home')}>
						<PetsRoundedIcon className="brand__mark" />
						<Stack component="span" className="brand__text">
							<Typography component="strong">PetNest</Typography>
							<Typography component="small">Korea</Typography>
						</Stack>
					</Stack>
					{!showHeaderSearch ? categoryNavigation : (
						<Box component="form" className="header-search-form" onSubmit={searchHandler}>
							<OutlinedInput
								key={typeof router.query.text === 'string' ? router.query.text : 'empty-search'}
								className="header-search"
								type="search"
								inputRef={searchInputRef}
								defaultValue={typeof router.query.text === 'string' ? router.query.text : ''}
								placeholder={t('nav.searchPlaceholder')}
								inputProps={{ 'aria-label': t('nav.search') }}
								endAdornment={(
									<InputAdornment position="end">
										<IconButton type="submit" edge="end" aria-label={t('nav.submitSearch')}><SearchRoundedIcon /></IconButton>
									</InputAdornment>
								)}
							/>
						</Box>
					)}
					<Stack direction="row" component="nav" className="header-actions" aria-label={t('nav.accountNavigation')}>
						<ThemeToggle />
						<LanguageSwitcher />
						<NotificationBell />
						<Stack component={Link} href="/mypage?category=myFavorites" aria-label={t('nav.favorites')}>
							<FavoriteBorderRoundedIcon />
							<Typography component="span">{t('nav.favorites')}</Typography>
						</Stack>
						<Stack component={Link} href={user?.sub ? '/mypage' : '/account/join'} aria-label={t(user?.sub ? 'nav.account' : 'nav.login')}>
							<PersonOutlineRoundedIcon />
							<Typography component="span">{t(user?.sub ? 'nav.account' : 'nav.login')}</Typography>
						</Stack>
						<Stack component={Link} href="/cart" aria-label={t('nav.shoppingCart')} className="cart-link">
							<LocalMallOutlinedIcon />
							<Typography component="span">{t('nav.cart')}</Typography>
							<Typography component="b">{cartCount}</Typography>
						</Stack>
					</Stack>
				</Box>
				{showHeaderSearch && categoryNavigation}
			</Stack>
		);
	}
};

export default Top;
