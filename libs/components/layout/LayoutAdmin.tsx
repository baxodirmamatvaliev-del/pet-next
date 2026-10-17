import { useQuery, useReactiveVar } from '@apollo/client';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';

import { authReadyVar, userVar } from '../../../apollo/store';
import { GET_MEMBER } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';
import { T } from '../../types/common';
import AdminMenuList from '../admin/AdminMenuList';
import NotificationBell from '../NotificationBell';
import ThemeToggle from '../ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from '../../i18n';

const withAdminLayout = <P extends object>(Component: React.ComponentType<P>) => {
	return function LayoutAdmin(props: P) {
		const { t } = useTranslation();
		/** STATES **/
		const authReady = useReactiveVar(authReadyVar);
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

		/** COMPUTED VALUES **/
		const member = (getMemberData as T | undefined)?.getMember;
		const isAdmin = member?.memberType === MemberType.ADMIN;
		const memberImage = member?.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : undefined;

		return (
			<>
				<Head><title>{t('ui.adminPetnestKorea')}</title></Head>
				<Box component="main" className="admin-page">
					{!authReady || (user?.sub && getMemberLoading && !member) ? (
						<Stack className="admin-page__state"><CircularProgress /></Stack>
					) : !user?.sub ? (
						<Stack className="admin-page__state">
							<ThemeToggle />
							<LanguageSwitcher />
							<Alert severity="info">{t('ui.signInWithAnAdminAccountToContinue')}</Alert>
							<Button component={Link} href="/account/join?referrer=/_admin" variant="contained">{t('ui.signIn')}</Button>
						</Stack>
					) : getMemberError || !isAdmin ? (
						<Stack className="admin-page__state">
							<Alert severity="error">{t('ui.adminAccessIsRequired')}</Alert>
							<Button component={Link} href="/" variant="outlined">{t('ui.backToShop')}</Button>
						</Stack>
					) : (
						<Stack direction="row" className="admin-page__layout">
							<Box component="aside" className="admin-page__sidebar">
								<Stack direction="row" component={Link} href="/" className="admin-page__brand">
									<PetsRoundedIcon />
									<Typography component="strong">PetNest <span>{t('ui.admin')}</span></Typography>
								</Stack>
								<Typography className="admin-page__menu-label">{t('ui.management')}</Typography>
								<AdminMenuList />
								<Stack className="admin-page__sidebar-bottom">
									<Stack direction="row" className="admin-page__member">
										<Avatar src={memberImage} alt={member.memberNick} />
										<Box><Typography component="strong">{member.memberNick}</Typography><Typography>{t('ui.administrator')}</Typography></Box>
									</Stack>
									<Button component={Link} href="/" startIcon={<ArrowBackRoundedIcon />}>{t('ui.backToShop')}</Button>
								</Stack>
							</Box>
							<Box className="admin-page__content">
								<Stack direction="row" className="admin-page__topbar">
									<Stack><Typography component="strong">{t('ui.controlCenter')}</Typography><Typography>{t('ui.everythingHappeningAtPetnestInOnePlace')}</Typography></Stack>
									<Stack direction="row" alignItems="center" spacing={1}>
										<ThemeToggle />
										<LanguageSwitcher />
										<NotificationBell adminPanel />
										<Chip icon={<VerifiedUserOutlinedIcon />} label={t('ui.adminAccess')} />
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
