import React, { FormEvent, useState } from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CrueltyFreeOutlinedIcon from '@mui/icons-material/CrueltyFreeOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import {
	Box,
	Divider,
	Drawer,
	IconButton,
	InputAdornment,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import Link from 'next/link';

interface MobileMenuProps {
	open: boolean;
	authenticated: boolean;
	cartCount: number;
	closeHandler: () => void;
	searchProductsHandler: (text: string) => void;
}

const MobileMenu = (props: MobileMenuProps) => {
	const { open, authenticated, cartCount, closeHandler, searchProductsHandler } = props;

	/** STATES **/
	const [searchText, setSearchText] = useState('');

	/** HANDLERS **/
	const searchHandler = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		searchProductsHandler(searchText);
		closeHandler();
	};

	/** RENDER **/
	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={closeHandler}
			slotProps={{ paper: { className: 'mobile-drawer' } }}
		>
			<Stack direction="row" className="mobile-drawer__header">
				<Stack direction="row" component={Link} href="/" onClick={closeHandler}>
					<PetsRoundedIcon />
					<Box>
						<Typography component="strong">PetNest</Typography>
						<Typography component="small">Korea</Typography>
					</Box>
				</Stack>
				<IconButton onClick={closeHandler} aria-label="Close menu">
					<CloseRoundedIcon />
				</IconButton>
			</Stack>

			<Box component="form" className="mobile-drawer__search" onSubmit={searchHandler}>
				<TextField
					fullWidth
					size="small"
					type="search"
					value={searchText}
					onChange={(event) => setSearchText(event.target.value)}
					placeholder="Search products..."
					slotProps={{
						input: {
							endAdornment: (
								<InputAdornment position="end">
									<IconButton type="submit" edge="end" aria-label="Submit search">
										<SearchRoundedIcon />
									</IconButton>
								</InputAdornment>
							),
						},
					}}
				/>
			</Box>

			<Typography className="mobile-drawer__label">SHOP</Typography>
			<List disablePadding>
				<ListItemButton component={Link} href="/product" onClick={closeHandler}>
					<ListItemIcon>
						<StorefrontOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary="All Products" />
				</ListItemButton>
				<ListItemButton component={Link} href="/product?category=DOG" onClick={closeHandler}>
					<ListItemIcon>
						<PetsRoundedIcon />
					</ListItemIcon>
					<ListItemText primary="Dogs" />
				</ListItemButton>
				<ListItemButton component={Link} href="/product?category=CAT" onClick={closeHandler}>
					<ListItemIcon>
						<CrueltyFreeOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary="Cats" />
				</ListItemButton>
				<ListItemButton component={Link} href="/product?sort=createdAt" onClick={closeHandler}>
					<ListItemIcon>
						<NewReleasesOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary="New Products" />
				</ListItemButton>
				<ListItemButton component={Link} href="/product?sort=productSold" onClick={closeHandler}>
					<ListItemIcon>
						<TrendingUpRoundedIcon />
					</ListItemIcon>
					<ListItemText primary="Best Sellers" />
				</ListItemButton>
				<ListItemButton component={Link} href="/agent" onClick={closeHandler}>
					<ListItemIcon><StorefrontOutlinedIcon /></ListItemIcon>
					<ListItemText primary="Agents" />
				</ListItemButton>
				<ListItemButton component={Link} href="/cs" onClick={closeHandler}>
					<ListItemIcon><SupportAgentOutlinedIcon /></ListItemIcon>
					<ListItemText primary="Help Center" />
				</ListItemButton>
			</List>

			<Divider />
			<Typography className="mobile-drawer__label">ACCOUNT</Typography>
			<List disablePadding>
				<ListItemButton
					component={Link}
					href={authenticated ? '/mypage' : '/account/join'}
					onClick={closeHandler}
				>
					<ListItemIcon>
						<AccountCircleOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary={authenticated ? 'My Account' : 'Login or Sign up'} />
				</ListItemButton>
				<ListItemButton component={Link} href="/cart" onClick={closeHandler}>
					<ListItemIcon>
						<LocalMallOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary="Shopping Cart" secondary={`${cartCount} items`} />
				</ListItemButton>
				<ListItemButton component={Link} href="/mypage?category=myFavorites" onClick={closeHandler}>
					<ListItemIcon><FavoriteBorderRoundedIcon /></ListItemIcon>
					<ListItemText primary="Favorites" />
				</ListItemButton>
			</List>
		</Drawer>
	);
};

export default MobileMenu;
