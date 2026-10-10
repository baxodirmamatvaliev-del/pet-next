import React from 'react';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Avatar, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../../apollo/store';
import { GET_MEMBER } from '../../../apollo/user/query';
import { logOut } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { useTranslation } from '../../i18n';

const MyMenu = () => {
	const { t, label } = useTranslation();
	const router = useRouter();
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const category = typeof router.query.category === 'string' ? router.query.category : 'myOrders';

	/** APOLLO REQUESTS **/
	const { data: getMemberData } = useQuery(GET_MEMBER, {
		fetchPolicy: 'cache-and-network',
		variables: { memberId: user?.sub ?? '' },
		skip: !user?.sub,
	});

	/** COMPUTED VALUES **/
	const member = (getMemberData as T | undefined)?.getMember;
	const canManageProducts = member?.memberType === MemberType.ADMIN || member?.memberType === MemberType.AGENT;
	const memberImage = member?.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : '';
	const profileHeader = (
		<Stack direction="row" className="my-menu__profile">
			<Avatar src={memberImage} alt={member?.memberNick ?? t('common.member')}>
				<PetsRoundedIcon />
			</Avatar>
			<Stack>
				<Typography component="strong">{member?.memberNick ?? t('common.member')}</Typography>
				<Typography>{label(member?.memberType)}</Typography>
			</Stack>
		</Stack>
	);

	/** HANDLERS **/
	const logoutHandler = async () => {
		const isConfirmed = await sweetConfirmAlert(
			t('ui.doYouWantToLogout'),
			t('common.confirm'),
			t('ui.cancel'),
		);
		if (!isConfirmed) return;
		try {
			await logOut();
		} catch {
			await sweetMixinErrorAlert(t('ui.logoutFailedPleaseTryAgain'));
		}
	};

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="aside" className="my-menu my-menu--mobile">
				{profileHeader}
				<List disablePadding>
					{member?.memberType === MemberType.ADMIN && (
						<ListItemButton component={Link} href="/_admin" className="my-menu__admin-link">
							<ListItemIcon><AdminPanelSettingsOutlinedIcon /></ListItemIcon>
							<ListItemText primary={t('ui.adminPanel')} />
						</ListItemButton>
					)}
					{member?.memberType === MemberType.AGENT && (
						<ListItemButton component={Link} href="/cs?tab=inbox">
							<ListItemIcon><SupportAgentOutlinedIcon /></ListItemIcon>
							<ListItemText primary={t('ui.supportInbox')} />
						</ListItemButton>
					)}
					<ListItemButton component={Link} href="/mypage?category=myProfile" className={category === 'myProfile' ? 'active' : ''}>
						<ListItemIcon><PersonOutlineRoundedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.profile')} />
					</ListItemButton>
					<ListItemButton component={Link} href="/mypage?category=myFavorites" className={category === 'myFavorites' ? 'active' : ''}>
						<ListItemIcon><FavoriteBorderRoundedIcon /></ListItemIcon>
						<ListItemText primary={t('nav.favorites')} />
					</ListItemButton>
					<ListItemButton component={Link} href="/mypage?category=followers" className={category === 'followers' ? 'active' : ''}>
						<ListItemIcon><PeopleOutlineRoundedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.followers')} />
					</ListItemButton>
					<ListItemButton component={Link} href="/mypage?category=followings" className={category === 'followings' ? 'active' : ''}>
						<ListItemIcon><PersonAddAltOutlinedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.followings')} />
					</ListItemButton>
					<ListItemButton component={Link} href="/mypage?category=recentlyVisited" className={category === 'recentlyVisited' ? 'active' : ''}>
						<ListItemIcon><HistoryRoundedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.history')} />
					</ListItemButton>
					<ListItemButton component={Link} href="/mypage?category=myPets" className={category === 'myPets' ? 'active' : ''}>
						<ListItemIcon><ListAltOutlinedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.petListings')} />
					</ListItemButton>
					{canManageProducts && (
						<ListItemButton component={Link} href="/mypage?category=myProducts" className={category === 'myProducts' ? 'active' : ''}>
							<ListItemIcon><Inventory2OutlinedIcon /></ListItemIcon>
							<ListItemText primary={t('ui.products')} />
						</ListItemButton>
					)}
					<ListItemButton component={Link} href="/mypage?category=myOrders" className={category === 'myOrders' ? 'active' : ''}>
						<ListItemIcon><ReceiptLongOutlinedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.orders')} />
					</ListItemButton>
					<ListItemButton component={Link} href="/cart">
						<ListItemIcon><ShoppingBagOutlinedIcon /></ListItemIcon>
						<ListItemText primary={t('nav.cart')} />
					</ListItemButton>
					<ListItemButton onClick={logoutHandler}>
						<ListItemIcon><LogoutRoundedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.logOut')} />
					</ListItemButton>
				</List>
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack component="aside" className="my-menu">
				{profileHeader}

				{member?.memberType === MemberType.ADMIN && (
					<>
						<Typography className="my-menu__label">{t('ui.management')}</Typography>
						<List disablePadding>
							<ListItemButton component={Link} href="/_admin" className="my-menu__admin-link">
								<ListItemIcon><AdminPanelSettingsOutlinedIcon /></ListItemIcon>
								<ListItemText primary={t('ui.adminPanel')} />
							</ListItemButton>
						</List>
					</>
				)}
				{member?.memberType === MemberType.AGENT && (
					<>
						<Typography className="my-menu__label">{t('ui.support')}</Typography>
						<List disablePadding>
							<ListItemButton component={Link} href="/cs?tab=inbox">
								<ListItemIcon><SupportAgentOutlinedIcon /></ListItemIcon>
								<ListItemText primary={t('ui.supportInbox')} />
							</ListItemButton>
						</List>
					</>
				)}
				<Typography className="my-menu__label">{t('ui.myAccount')}</Typography>
				<List disablePadding>
					<ListItemButton
						component={Link}
						href="/mypage?category=myProfile"
						className={category === 'myProfile' ? 'active' : ''}
					>
						<ListItemIcon><PersonOutlineRoundedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.myProfile')} />
					</ListItemButton>
					<ListItemButton
						component={Link}
						href="/mypage?category=myFavorites"
						className={category === 'myFavorites' ? 'active' : ''}
					>
						<ListItemIcon><FavoriteBorderRoundedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.myFavorites')} />
					</ListItemButton>
					<ListItemButton component={Link} href="/mypage?category=followers" className={category === 'followers' ? 'active' : ''}>
						<ListItemIcon><PeopleOutlineRoundedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.myFollowers')} />
					</ListItemButton>
					<ListItemButton component={Link} href="/mypage?category=followings" className={category === 'followings' ? 'active' : ''}>
						<ListItemIcon><PersonAddAltOutlinedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.myFollowings')} />
					</ListItemButton>
					<ListItemButton
						component={Link}
						href="/mypage?category=recentlyVisited"
						className={category === 'recentlyVisited' ? 'active' : ''}
					>
						<ListItemIcon><HistoryRoundedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.recentlyVisited')} />
					</ListItemButton>
					<ListSubheader className="my-menu__section-label" disableSticky>{t('ui.myListings')}</ListSubheader>
					<ListItemButton
						component={Link}
						href="/mypage?category=myPets"
						className={category === 'myPets' ? 'active' : ''}
					>
						<ListItemIcon><ListAltOutlinedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.myPetListings')} />
					</ListItemButton>
					{canManageProducts && (
						<ListItemButton component={Link} href="/mypage?category=myProducts" className={category === 'myProducts' ? 'active' : ''}>
							<ListItemIcon><Inventory2OutlinedIcon /></ListItemIcon>
							<ListItemText primary={t('ui.myProducts')} />
						</ListItemButton>
					)}
					<ListSubheader className="my-menu__section-label" disableSticky>{t('ui.shopping')}</ListSubheader>
					<ListItemButton component={Link} href="/mypage?category=myOrders" className={category === 'myOrders' ? 'active' : ''}>
						<ListItemIcon><ReceiptLongOutlinedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.myOrders')} />
					</ListItemButton>
					<ListItemButton component={Link} href="/cart">
						<ListItemIcon><ShoppingBagOutlinedIcon /></ListItemIcon>
						<ListItemText primary={t('nav.shoppingCart')} />
					</ListItemButton>
					<ListItemButton onClick={logoutHandler}>
						<ListItemIcon><LogoutRoundedIcon /></ListItemIcon>
						<ListItemText primary={t('ui.logout')} />
					</ListItemButton>
				</List>
			</Stack>
		);
	}
};

export default MyMenu;
