import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Box, IconButton, InputAdornment, OutlinedInput, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { cartCountVar, userVar } from '../../apollo/store';
import { GET_MY_CART } from '../../apollo/user/query';
import { T } from '../types/common';

const Top = () => {
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
				<OutlinedInput
					className="header-search"
					type="search"
					placeholder="Search for products, brands, and more..."
					endAdornment={(
						<InputAdornment position="end">
							<SearchRoundedIcon />
						</InputAdornment>
					)}
				/>
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
				<IconButton className="mobile-menu" aria-label="Open menu">
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
		</Stack>
	);
};

export default Top;
