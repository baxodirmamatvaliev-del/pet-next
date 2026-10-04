import { FormEvent, useRef, useState } from 'react';
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
import MobileMenu from './MobileMenu';
import { T } from '../types/common';

const Top = () => {
	const router = useRouter();

	/** STATES **/
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

	/** RENDER **/
	return (
		<Stack component="header" className="site-header">
			<Stack direction="row" className="announcement">
				<Typography component="span">Free delivery on all orders over ₩30,000</Typography>
				<Typography component="span" className="announcement__kr">
					30,000원 이상 주문 시 무료배송
				</Typography>
			</Stack>
			<Box className="header-main container">
				<Stack direction="row" component={Link} href="/" className="brand" aria-label="PetNest Korea home">
					<PetsRoundedIcon className="brand__mark" />
					<Stack component="span" className="brand__text">
						<Typography component="strong">PetNest</Typography>
						<Typography component="small">Korea</Typography>
					</Stack>
				</Stack>
				<Box component="form" className="header-search-form" onSubmit={searchHandler}>
					<OutlinedInput
						key={typeof router.query.text === 'string' ? router.query.text : 'empty-search'}
						className="header-search"
						type="search"
						inputRef={searchInputRef}
						defaultValue={typeof router.query.text === 'string' ? router.query.text : ''}
						placeholder="Search products..."
						inputProps={{ 'aria-label': 'Search products' }}
						endAdornment={(
							<InputAdornment position="end">
								<IconButton type="submit" edge="end" aria-label="Submit search">
									<SearchRoundedIcon />
								</IconButton>
							</InputAdornment>
						)}
					/>
				</Box>
				<Stack direction="row" component="nav" className="header-actions" aria-label="Account navigation">
					<Stack component={Link} href="/favorites" aria-label="Favorites">
						<FavoriteBorderRoundedIcon />
						<Typography component="span">Favorites</Typography>
					</Stack>
					<Stack
						component={Link}
						href={user?.sub ? '/mypage' : '/account/join'}
						aria-label={user?.sub ? 'My account' : 'Login'}
					>
						<PersonOutlineRoundedIcon />
						<Typography component="span">{user?.sub ? 'My Account' : 'Login'}</Typography>
					</Stack>
					<Stack component={Link} href="/cart" aria-label="Shopping cart" className="cart-link">
						<LocalMallOutlinedIcon />
						<Typography component="span">Cart</Typography>
						<Typography component="b">{cartCount}</Typography>
					</Stack>
				</Stack>
				<IconButton
					className="mobile-menu"
					onClick={mobileMenuOpenHandler}
					aria-label="Open menu"
					aria-expanded={mobileMenuOpen}
				>
					<MenuRoundedIcon />
				</IconButton>
			</Box>
			<Box component="nav" className="category-nav" aria-label="Product categories">
				<Stack direction="row" className="container category-nav__inner">
					<Link href="/product?category=DOG">Dogs</Link>
					<Link href="/product?category=CAT">Cats</Link>
					<Link href="/product?sort=createdAt">New</Link>
					<Link href="/product?sort=productSold">Best Sellers</Link>
					<Link href="/product">Brands</Link>
					<Link href="/product">Sale</Link>
					<Link href="/pet">Community</Link>
				</Stack>
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
};

export default Top;
