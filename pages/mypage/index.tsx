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
import MyFollows from '../../libs/components/mypage/MyFollows';
import MyMenu from '../../libs/components/mypage/MyMenu';
import MyOrders from '../../libs/components/mypage/MyOrders';
import MyPets from '../../libs/components/mypage/MyPets';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyProducts from '../../libs/components/mypage/MyProducts';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { useTranslation } from '../../libs/i18n';

const MyPage: NextPage = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const device = useDeviceDetect();

	/** STATES **/
	const user = useReactiveVar(userVar);
	const category = typeof router.query.category === 'string' ? router.query.category : 'myOrders';
	const accountReferrer = `/mypage?category=${encodeURIComponent(category)}`;
	const accountHref = `/account/join?referrer=${encodeURIComponent(accountReferrer)}`;
	const activeContent = (
		<Box component="section" className="mypage-main">
			{category === 'myProfile' && <MyProfile />}
			{category === 'myOrders' && <MyOrders />}
			{category === 'myFavorites' && <MyFavorites />}
			{category === 'followers' && <MyFollows key="followers" category="followers" />}
			{category === 'followings' && <MyFollows key="followings" category="followings" />}
			{category === 'recentlyVisited' && <RecentlyVisited />}
			{category === 'myPets' && <MyPets />}
			{category === 'myProducts' && <MyProducts />}
		</Box>
	);

	if (device === 'mobile') {
		return (
			<>
				<Head>
					<title>{t('ui.myAccountPetnestKorea')}</title>
					<meta name="title" content={t('ui.myAccountPetnestKorea')} />
				</Head>
				<Box component="main" id="my-page" className="mypage-page--mobile">
					<Box className="container">
						{!user?.sub ? (
							<Stack className="mypage-state">
								<LockOutlinedIcon />
								<Typography component="h1">{t('ui.signInToViewYourAccount')}</Typography>
								<Typography>{t('ui.manageYourPetnestOrdersFromOneSecurePlace')}</Typography>
								<Button component={Link} href={accountHref} variant="contained">
									{t('ui.loginOrSignUp')}
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
					<title>{t('ui.myAccountPetnestKorea')}</title>
					<meta name="title" content={t('ui.myAccountPetnestKorea')} />
				</Head>

				<Box component="main" id="my-page">
					<Box className="container">
						{!user?.sub ? (
							<Stack className="mypage-state">
								<LockOutlinedIcon />
								<Typography component="h1">{t('ui.signInToViewYourAccount')}</Typography>
								<Typography>{t('ui.manageYourPetnestOrdersFromOneSecurePlace')}</Typography>
								<Button component={Link} href={accountHref} variant="contained">
									{t('ui.loginOrSignUp')}
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
