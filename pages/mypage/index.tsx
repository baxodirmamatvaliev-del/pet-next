import React from 'react';
import { useReactiveVar } from '@apollo/client';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Box, Button, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../apollo/store';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import MyMenu from '../../libs/components/mypage/MyMenu';
import MyOrders from '../../libs/components/mypage/MyOrders';
import MyPets from '../../libs/components/mypage/MyPets';
import MyProfile from '../../libs/components/mypage/MyProfile';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';

const MyPage: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();

	/** STATES **/
	const user = useReactiveVar(userVar);
	const category = typeof router.query.category === 'string' ? router.query.category : 'myOrders';
	const accountReferrer = category === 'myFavorites' ? '/mypage?category=myFavorites' : '/mypage';
	const accountHref = `/account/join?referrer=${encodeURIComponent(accountReferrer)}`;
	const activeContent = (
		<Box component="section" className="mypage-main">
			{category === 'myProfile' && <MyProfile />}
			{category === 'myOrders' && <MyOrders />}
			{category === 'myFavorites' && <MyFavorites />}
			{category === 'myPets' && <MyPets />}
		</Box>
	);

	if (device === 'mobile') {
		return (
			<>
				<Head>
					<title>My Account | PetNest Korea</title>
					<meta name="title" content="My Account | PetNest Korea" />
				</Head>
				<Box component="main" id="my-page" className="mypage-page--mobile">
					<Box className="container">
						{!user?.sub ? (
							<Stack className="mypage-state">
								<LockOutlinedIcon />
								<Typography component="h1">Sign in to view your account</Typography>
								<Typography>Manage your PetNest orders from one secure place.</Typography>
								<Button component={Link} href={accountHref} variant="contained">
									Login or sign up
								</Button>
							</Stack>
						) : (
							<Stack className="mypage-content mypage-content--mobile">
								<MyMenu />
								{activeContent}
							</Stack>
						)}
					</Box>
				</Box>
			</>
		);
	} else {
		/** RENDER PC **/
		return (
			<>
				<Head>
					<title>My Account | PetNest Korea</title>
					<meta name="title" content="My Account | PetNest Korea" />
				</Head>

				<Box component="main" id="my-page">
					<Box className="container">
						{!user?.sub ? (
							<Stack className="mypage-state">
								<LockOutlinedIcon />
								<Typography component="h1">Sign in to view your account</Typography>
								<Typography>Manage your PetNest orders from one secure place.</Typography>
								<Button component={Link} href={accountHref} variant="contained">
									Login or sign up
								</Button>
							</Stack>
						) : (
							<Box className="mypage-content">
								<MyMenu />
								{activeContent}
							</Box>
						)}
					</Box>
				</Box>
			</>
		);
	}
};

export default withLayoutBasic(MyPage);
