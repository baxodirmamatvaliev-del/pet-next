import React from 'react';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useReactiveVar } from '@apollo/client';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';

const MyMenu = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const category = typeof router.query.category === 'string' ? router.query.category : 'myOrders';

	/** HANDLERS **/
	const logoutHandler = async () => {
		const isConfirmed = await sweetConfirmAlert('Do you want to logout?');
		if (isConfirmed) logOut();
	};

	/** RENDER **/
	return (
		<Stack component="aside" className="my-menu">
			<Stack direction="row" className="my-menu__profile">
				<Box><PetsRoundedIcon /></Box>
				<Stack>
					<Typography component="strong">PetNest Member</Typography>
					<Typography>#{user?.sub.slice(-8).toUpperCase()}</Typography>
				</Stack>
			</Stack>

			<Typography className="my-menu__label">MY ACCOUNT</Typography>
			<List disablePadding>
				<ListItemButton
					component={Link}
					href="/mypage?category=myOrders"
					className={category === 'myOrders' ? 'active' : ''}
				>
					<ListItemIcon><ReceiptLongOutlinedIcon /></ListItemIcon>
					<ListItemText primary="My Orders" />
				</ListItemButton>
				<ListItemButton component={Link} href="/cart">
					<ListItemIcon><ShoppingBagOutlinedIcon /></ListItemIcon>
					<ListItemText primary="Shopping Cart" />
				</ListItemButton>
				<ListItemButton onClick={logoutHandler}>
					<ListItemIcon><LogoutRoundedIcon /></ListItemIcon>
					<ListItemText primary="Logout" />
				</ListItemButton>
			</List>
		</Stack>
	);
};

export default MyMenu;
