import { useEffect, useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';

import { userVar } from '../../../apollo/store';
import { GET_MEMBER } from '../../../apollo/user/query';
import { getJwtToken, updateUserInfo } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';
import { T } from '../../types/common';
import AdminMenuList from '../admin/AdminMenuList';
import NotificationBell from '../NotificationBell';

const withAdminLayout = <P extends object>(Component: React.ComponentType<P>) => {
	return function LayoutAdmin(props: P) {
		/** STATES **/
		const [authReady, setAuthReady] = useState(() => Boolean(userVar()?.sub));
		const user = useReactiveVar(userVar);

		/** APOLLO REQUESTS **/
		const {
			loading: getMemberLoading,
			error: getMemberError,
			data: getMemberData,
		} = useQuery(GET_MEMBER, {
			fetchPolicy: 'cache-and-network',
			variables: { memberId: user?.sub ?? '' },
			skip: !authReady || !user?.sub,
		});

		/** LIFECYCLES **/
		useEffect(() => {
			const token = getJwtToken();
			if (!token) userVar(null);
			else if (!userVar()?.sub) {
				try {
					updateUserInfo(token);
				} catch {
					userVar(null);
				}
			}
			setAuthReady(true);
		}, []);

		/** COMPUTED VALUES **/
		const member = (getMemberData as T | undefined)?.getMember;
		const isAdmin = member?.memberType === MemberType.ADMIN;
		const memberImage = member?.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : undefined;

		return (
			<>
				<Head><title>Admin | PetNest Korea</title></Head>
				<Box component="main" className="admin-page">
					{!authReady || (user?.sub && getMemberLoading && !member) ? (
						<Stack className="admin-page__state"><CircularProgress /></Stack>
					) : !user?.sub ? (
						<Stack className="admin-page__state">
							<Alert severity="info">Sign in with an admin account to continue.</Alert>
							<Button component={Link} href="/account/join?referrer=/_admin" variant="contained">Sign in</Button>
						</Stack>
					) : getMemberError || !isAdmin ? (
						<Stack className="admin-page__state">
							<Alert severity="error">Admin access is required.</Alert>
							<Button component={Link} href="/" variant="outlined">Back to shop</Button>
						</Stack>
					) : (
						<Stack direction="row" className="admin-page__layout">
							<Box component="aside" className="admin-page__sidebar">
								<Stack direction="row" component={Link} href="/" className="admin-page__brand">
									<PetsRoundedIcon />
									<Typography component="strong">PetNest <span>ADMIN</span></Typography>
								</Stack>
								<Typography className="admin-page__menu-label">MANAGEMENT</Typography>
								<AdminMenuList />
								<Stack className="admin-page__sidebar-bottom">
									<Stack direction="row" className="admin-page__member">
										<Avatar src={memberImage} alt={member.memberNick} />
										<Box><Typography component="strong">{member.memberNick}</Typography><Typography>Administrator</Typography></Box>
									</Stack>
									<Button component={Link} href="/" startIcon={<ArrowBackRoundedIcon />}>Back to shop</Button>
								</Stack>
							</Box>
							<Box className="admin-page__content">
								<Stack direction="row" className="admin-page__topbar">
									<Stack><Typography component="strong">Control center</Typography><Typography>Everything happening at PetNest, in one place.</Typography></Stack>
									<Stack direction="row" alignItems="center" spacing={1}>
										<NotificationBell adminPanel />
										<Chip icon={<VerifiedUserOutlinedIcon />} label="ADMIN ACCESS" />
									</Stack>
								</Stack>
								<Component {...props} />
							</Box>
						</Stack>
					)}
				</Box>
			</>
		);
	};
};

export default withAdminLayout;
