import { FormEvent, useEffect, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import AppleIcon from '@mui/icons-material/Apple';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { authReadyVar, userVar } from '../../apollo/store';
import { logIn, logOut, signUp } from '../../libs/auth';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Message } from '../../libs/enums/common.enum';
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

	/** STATES **/
	const [input, setInput] = useState<AccountInput>({ nick: '', password: '', phone: '' });
	const [loginView, setLoginView] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const user = useReactiveVar(userVar);
	const authReady = useReactiveVar(authReadyVar);
	const welcomeVideo = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (welcomeVideo.current) welcomeVideo.current.playbackRate = 0.5;
		const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
		const syncPlayback = () => {
			if (motionPreference.matches) welcomeVideo.current?.pause();
			else void welcomeVideo.current?.play().catch(() => {});
		};
		syncPlayback();
		motionPreference.addEventListener('change', syncPlayback);
		return () => motionPreference.removeEventListener('change', syncPlayback);
	}, []);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
		setShowPassword(false);
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
				<PetsRoundedIcon aria-hidden="true" />
				<Typography component="strong">PetNest</Typography>
			</Stack>

			{!authReady ? (
				<Typography className="join-loading" role="status">{t('ui.pleaseWait')}</Typography>
			) : user?.sub ? (
				<Stack className="join-session">
					<Typography component="h1">{t('ui.youAreSignedIn')}</Typography>
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
					<Stack className="join-panel" key={loginView ? 'login' : 'signup'}>
						<Typography className="join-heading" component="h1">{t(loginView ? 'nav.login' : 'ui.signUp')}</Typography>
						<Stack
							component="form"
							className="join-fields"
							onSubmit={loginView ? loginHandler : signupHandler}
						>
							<TextField
								id="join-nickname"
								name="username"
								autoComplete="username"
								label={t('ui.nickname')}
								placeholder={t('ui.enterYourNickname')}
								value={input.nick}
								onChange={(event) => inputChangeHandler('nick', event.target.value)}
								disabled={loading}
								slotProps={{
									input: {
										startAdornment: <InputAdornment position="start"><PersonOutlineRoundedIcon /></InputAdornment>,
									},
								}}
								required
								fullWidth
							/>
							<TextField
								id="join-password"
								name="password"
								autoComplete={loginView ? 'current-password' : 'new-password'}
								label={t('ui.password')}
								placeholder={t('ui.atLeast8Characters')}
								type={showPassword ? 'text' : 'password'}
								value={input.password}
								onChange={(event) => inputChangeHandler('password', event.target.value)}
								disabled={loading}
								slotProps={{
									htmlInput: { minLength: 8 },
									input: {
										startAdornment: <InputAdornment position="start"><LockOutlinedIcon /></InputAdornment>,
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													type="button"
													aria-label={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
													aria-pressed={showPassword}
													disabled={loading}
													onClick={() => setShowPassword((visible) => !visible)}
												>
													{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
												</IconButton>
											</InputAdornment>
										),
									},
								}}
								required
								fullWidth
							/>
							{!loginView && (
								<TextField
									id="join-phone"
									name="tel"
									autoComplete="tel"
									label={t('ui.phoneNumber')}
									placeholder="010-0000-0000"
									type="tel"
									value={input.phone}
									onChange={(event) => inputChangeHandler('phone', event.target.value)}
									disabled={loading}
									slotProps={{
										input: {
											startAdornment: <InputAdornment position="start"><LocalPhoneOutlinedIcon /></InputAdornment>,
										},
									}}
									required
									fullWidth
								/>
							)}
							<Button
								className="join-submit"
								type="submit"
								variant="contained"
								disabled={isSubmitDisabled}
								aria-busy={loading}
							>
								{loading ? t('ui.pleaseWait') : t(loginView ? 'nav.login' : 'ui.signUp')}
							</Button>
						</Stack>
						<Stack direction="row" className="join-social">
							<Button
								type="button"
								disableRipple
								aria-disabled="true"
								aria-label={t('auth.socialUnavailable', { provider: 'Google' })}
								title={t('auth.socialUnavailable', { provider: 'Google' })}
							>
								<Box component="img" src="/icons/google.svg" alt="" width={24} height={24} />
							</Button>
							<Button
								type="button"
								disableRipple
								className="join-social-kakao"
								aria-disabled="true"
								aria-label={t('auth.socialUnavailable', { provider: 'KakaoTalk' })}
								title={t('auth.socialUnavailable', { provider: 'KakaoTalk' })}
							>
								<Box component="img" src="/icons/kakaotalk.svg" alt="" width={28} height={28} />
							</Button>
							<Button
								type="button"
								disableRipple
								aria-disabled="true"
								aria-label={t('auth.socialUnavailable', { provider: 'Apple' })}
								title={t('auth.socialUnavailable', { provider: 'Apple' })}
							>
								<AppleIcon aria-hidden="true" />
							</Button>
						</Stack>
					</Stack>
					<Button className="join-switch" type="button" onClick={() => viewChangeHandler(!loginView)} disabled={loading}>
						{t(loginView ? 'ui.signUp' : 'nav.login')}
					</Button>
				</>
			)}
		</Stack>
	);

	return (
		<>
			<Head>
				<title>{t('ui.accountPetnestKorea')}</title>
				<meta name="title" content={t('ui.accountPetnestKorea')} />
			</Head>
			<Box component="main" className="join-page">
				<video
					ref={welcomeVideo}
					className="join-background-video"
					src="/videos/petnest-welcome.mp4"
					poster="/videos/petnest-welcome.jpg"
					muted
					loop
					playsInline
					disablePictureInPicture
					aria-hidden="true"
					preload="metadata"
				/>
				<Box className="join-card">{joinForm}</Box>
			</Box>
		</>
	);
};

export default withLayoutBasic(Join);
