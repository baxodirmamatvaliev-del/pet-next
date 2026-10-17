import { FormEvent, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { authReadyVar, userVar } from '../../apollo/store';
import { logIn, logOut, signUp } from '../../libs/auth';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Message } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from '../../libs/i18n';

interface AccountInput {
	nick: string;
	password: string;
	phone: string;
}

const Join: NextPage = () => {
	const { t, errorText } = useTranslation();
	const router = useRouter();
	const device = useDeviceDetect();

	/** STATES **/
	const [input, setInput] = useState<AccountInput>({ nick: '', password: '', phone: '' });
	const [loginView, setLoginView] = useState(true);
	const [loading, setLoading] = useState(false);
	const user = useReactiveVar(userVar);
	const authReady = useReactiveVar(authReadyVar);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const inputChangeHandler = (name: keyof AccountInput, value: string) => {
		setInput((prev) => ({ ...prev, [name]: value }));
	};

	const redirectAfterAuthHandler = async () => {
		const referrer = typeof router.query.referrer === 'string'
			&& router.query.referrer.startsWith('/')
			&& !router.query.referrer.startsWith('//')
			? router.query.referrer
			: '/';

		await router.push(referrer);
	};

	const loginHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			setLoading(true);
			await logIn(input.nick, input.password);
			await sweetTopSmallSuccessAlert(t('ui.welcomeBack'), 800);
			await redirectAfterAuthHandler();
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		} finally {
			setLoading(false);
		}
	};

	const signupHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			setLoading(true);
			await signUp(input.nick, input.password, input.phone);
			await sweetTopSmallSuccessAlert(t('ui.accountCreated'), 800);
			await redirectAfterAuthHandler();
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		} finally {
			setLoading(false);
		}
	};

	const logoutHandler = async () => {
		try {
			await logOut();
		} catch {
			await sweetMixinErrorAlert(t('ui.logoutFailedPleaseTryAgain'));
		}
	};

	/** COMPUTED VALUES **/
	const isSubmitDisabled = !authReady || loading
		|| !input.nick.trim()
		|| input.password.length < 8
		|| (!loginView && !input.phone.trim());

	const joinForm = (
		<Stack className="join-form">
			<Stack direction="row" className="join-brand">
				<PetsRoundedIcon />
				<Stack>
					<Typography component="strong">PetNest</Typography>
					<Typography component="small">Korea</Typography>
				</Stack>
			</Stack>

			{user?.sub ? (
				<Stack className="join-session">
					<Typography component="span">{t('nav.accountSection')}</Typography>
					<Typography component="h1">{t('ui.youAreSignedIn')}</Typography>
					<Typography>{t('ui.yourPetnestSessionIsActiveAndReadyFor')}</Typography>
					<Button
						variant="contained"
						startIcon={<LogoutRoundedIcon />}
						onClick={logoutHandler}
					>
						{t('ui.logout')}
					</Button>
					<Button component={Link} href="/product" variant="outlined">
						{t('ui.continueShopping')}
					</Button>
				</Stack>
			) : (
				<>
					<Box className="join-heading">
						<Typography component="span">{t('ui.welcomeToPetnest')}</Typography>
						<Typography component="h1">
							{loginView ? t('ui.loginGreeting') : t('ui.createYourAccount')}
						</Typography>
						<Typography>
							{loginView
								? t('ui.loginToManageYourCartFavoritesAndOrders')
								: t('ui.joinPetnestAndMakeShoppingForYourPet')}
						</Typography>
					</Box>

					<Stack direction="row" className="join-switch">
						<Button className={loginView ? 'active' : ''} onClick={() => viewChangeHandler(true)}>
							{t('nav.login')}
						</Button>
						<Button className={!loginView ? 'active' : ''} onClick={() => viewChangeHandler(false)}>
							{t('ui.signUp')}
						</Button>
					</Stack>

					<Stack
						component="form"
						className="join-fields"
						onSubmit={loginView ? loginHandler : signupHandler}
					>
						<TextField
							label={t('ui.nickname')}
							placeholder={t('ui.enterYourNickname')}
							value={input.nick}
							onChange={(event) => inputChangeHandler('nick', event.target.value)}
							required
							fullWidth
						/>
						<TextField
							label={t('ui.password')}
							placeholder={t('ui.atLeast8Characters')}
							type="password"
							value={input.password}
							onChange={(event) => inputChangeHandler('password', event.target.value)}
							slotProps={{ htmlInput: { minLength: 8 } }}
							required
							fullWidth
						/>
						{!loginView && (
							<TextField
								label={t('ui.phoneNumber')}
								placeholder="010-0000-0000"
								type="tel"
								value={input.phone}
								onChange={(event) => inputChangeHandler('phone', event.target.value)}
								required
								fullWidth
							/>
						)}
						<Button
							type="submit"
							variant="contained"
							endIcon={<ArrowForwardRoundedIcon />}
							disabled={isSubmitDisabled}
						>
							{loading ? t('ui.pleaseWait') : loginView ? t('nav.login') : t('ui.createAccount')}
						</Button>
					</Stack>
				</>
			)}
		</Stack>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<>
				<Head>
					<title>{t('ui.accountPetnestKorea')}</title>
					<meta name="title" content={t('ui.accountPetnestKorea')} />
				</Head>
				<Box component="main" className="join-page join-page--mobile">
					<Box className="container">
						<Box className="join-card">
							{joinForm}
						</Box>
					</Box>
				</Box>
			</>
		);
	} else {
		/** RENDER PC **/
		return (
			<>
				<Head>
					<title>{t('ui.accountPetnestKorea')}</title>
					<meta name="title" content={t('ui.accountPetnestKorea')} />
				</Head>
				<Box component="main" className="join-page join-page--pc">
					<Box className="container">
						<Box className="join-card">
							{joinForm}
							<Stack className="join-side">
								<PetsRoundedIcon />
								<Typography component="span">{t('ui.petnestMembership')}</Typography>
								<Typography component="h2">{t('ui.everythingTheyLoveAllInOnePlace')}</Typography>
								<Typography>
									{t('ui.saveFavoritesBuildYourCartAndKeepEvery')}
								</Typography>
							</Stack>
						</Box>
					</Box>
				</Box>
			</>
		);
	}
};

export default withLayoutBasic(Join);
