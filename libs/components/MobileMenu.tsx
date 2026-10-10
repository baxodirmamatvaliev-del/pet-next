import React, { FormEvent, useState } from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CrueltyFreeOutlinedIcon from '@mui/icons-material/CrueltyFreeOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
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
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../i18n';

interface MobileMenuProps {
	open: boolean;
	authenticated: boolean;
	cartCount: number;
	closeHandler: () => void;
	searchProductsHandler: (text: string) => void;
}

const MobileMenu = (props: MobileMenuProps) => {
	const { open, authenticated, cartCount, closeHandler, searchProductsHandler } = props;
	const { t } = useTranslation();

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
				<IconButton onClick={closeHandler} aria-label={t('nav.closeMenu')}>
					<CloseRoundedIcon />
				</IconButton>
			</Stack>
			<Stack direction="row" className="mobile-drawer__language">
				<Typography>{t('preferences.language')}</Typography>
				<LanguageSwitcher />
			</Stack>

			<Box component="form" className="mobile-drawer__search" onSubmit={searchHandler}>
				<TextField
					fullWidth
					size="small"
					type="search"
					value={searchText}
					onChange={(event) => setSearchText(event.target.value)}
					placeholder={t('nav.searchPlaceholder')}
					slotProps={{
						htmlInput: { 'aria-label': t('nav.search') },
						input: {
							endAdornment: (
								<InputAdornment position="end">
									<IconButton type="submit" edge="end" aria-label={t('nav.submitSearch')}>
										<SearchRoundedIcon />
									</IconButton>
								</InputAdornment>
							),
						},
					}}
				/>
			</Box>

			<Typography className="mobile-drawer__label">{t('nav.shop')}</Typography>
			<List disablePadding>
				<ListItemButton component={Link} href="/product" onClick={closeHandler}>
					<ListItemIcon>
						<StorefrontOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary={t('nav.products')} />
				</ListItemButton>
				<ListItemButton component={Link} href="/product?category=DOG" onClick={closeHandler}>
					<ListItemIcon>
						<PetsRoundedIcon />
					</ListItemIcon>
					<ListItemText primary={t('nav.dogs')} />
				</ListItemButton>
				<ListItemButton component={Link} href="/product?category=CAT" onClick={closeHandler}>
					<ListItemIcon>
						<CrueltyFreeOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary={t('nav.cats')} />
				</ListItemButton>
				<ListItemButton component={Link} href="/product?sort=createdAt" onClick={closeHandler}>
					<ListItemIcon>
						<NewReleasesOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary={t('nav.newProducts')} />
				</ListItemButton>
				<ListItemButton component={Link} href="/product?sort=productSold" onClick={closeHandler}>
					<ListItemIcon>
						<TrendingUpRoundedIcon />
					</ListItemIcon>
					<ListItemText primary={t('nav.best')} />
				</ListItemButton>
				<ListItemButton component={Link} href="/pet" onClick={closeHandler}>
					<ListItemIcon><GroupsOutlinedIcon /></ListItemIcon>
					<ListItemText primary={t('nav.community')} />
				</ListItemButton>
				<ListItemButton component={Link} href="/agent" onClick={closeHandler}>
					<ListItemIcon><StorefrontOutlinedIcon /></ListItemIcon>
					<ListItemText primary={t('nav.agents')} />
				</ListItemButton>
				<ListItemButton component={Link} href="/cs" onClick={closeHandler}>
					<ListItemIcon><SupportAgentOutlinedIcon /></ListItemIcon>
					<ListItemText primary={t('nav.help')} />
				</ListItemButton>
			</List>

			<Divider />
			<Typography className="mobile-drawer__label">{t('nav.accountSection')}</Typography>
			<List disablePadding>
				<ListItemButton
					component={Link}
					href={authenticated ? '/mypage' : '/account/join'}
					onClick={closeHandler}
				>
					<ListItemIcon>
						<AccountCircleOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary={t(authenticated ? 'nav.account' : 'nav.loginOrJoin')} />
				</ListItemButton>
				<ListItemButton component={Link} href="/cart" onClick={closeHandler}>
					<ListItemIcon>
						<LocalMallOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary={t('nav.shoppingCart')} secondary={t('nav.itemCount', { count: cartCount })} />
				</ListItemButton>
				<ListItemButton component={Link} href="/mypage?category=myFavorites" onClick={closeHandler}>
					<ListItemIcon><FavoriteBorderRoundedIcon /></ListItemIcon>
					<ListItemText primary={t('nav.favorites')} />
				</ListItemButton>
			</List>
		</Drawer>
	);
};

export default MobileMenu;
