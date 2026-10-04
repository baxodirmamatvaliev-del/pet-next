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
import MyMenu from '../../libs/components/mypage/MyMenu';
import MyOrders from '../../libs/components/mypage/MyOrders';

const MyPage: NextPage = () => {
	const router = useRouter();

	/** STATES **/
	const user = useReactiveVar(userVar);
	const category = typeof router.query.category === 'string' ? router.query.category : 'myOrders';

	/** RENDER **/
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
							<Button component={Link} href="/account/join?referrer=/mypage" variant="contained">
								Login or sign up
							</Button>
						</Stack>
					) : (
						<Box className="mypage-content">
							<MyMenu />
							<Box component="section" className="mypage-main">
								{category === 'myOrders' && <MyOrders />}
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</>
	);
};

export default withLayoutBasic(MyPage);
