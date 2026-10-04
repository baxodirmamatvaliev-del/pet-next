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

import { userVar } from '../../apollo/store';
import { logIn, logOut, signUp } from '../../libs/auth';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Message } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

interface AccountInput {
	nick: string;
	password: string;
	phone: string;
}

const Join: NextPage = () => {
	const router = useRouter();

	/** STATES **/
	const [input, setInput] = useState<AccountInput>({ nick: '', password: '', phone: '' });
	const [loginView, setLoginView] = useState(true);
	const [loading, setLoading] = useState(false);
	const user = useReactiveVar(userVar);

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
			await sweetTopSmallSuccessAlert('Welcome back!', 800);
			await redirectAfterAuthHandler();
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		} finally {
			setLoading(false);
		}
	};

	const signupHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			setLoading(true);
			await signUp(input.nick, input.password, input.phone);
			await sweetTopSmallSuccessAlert('Account created!', 800);
			await redirectAfterAuthHandler();
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		} finally {
			setLoading(false);
		}
	};

	const logoutHandler = () => {
		logOut();
	};

	/** COMPUTED VALUES **/
	const isSubmitDisabled = loading
		|| !input.nick.trim()
		|| input.password.length < 8
		|| (!loginView && !input.phone.trim());

	/** RENDER **/
	return (
		<>
			<Head>
				<title>Account | PetNest Korea</title>
				<meta name="title" content="Account | PetNest Korea" />
			</Head>

			<Box component="main" className="join-page">
				<Box className="container">
					<Box className="join-card">
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
									<Typography component="span">ACCOUNT</Typography>
									<Typography component="h1">You are signed in</Typography>
									<Typography>Your PetNest session is active and ready for shopping.</Typography>
									<Button
										variant="contained"
										startIcon={<LogoutRoundedIcon />}
										onClick={logoutHandler}
									>
										Logout
									</Button>
									<Button component={Link} href="/product" variant="outlined">
										Continue shopping
									</Button>
								</Stack>
							) : (
								<>
									<Box className="join-heading">
										<Typography component="span">WELCOME TO PETNEST</Typography>
										<Typography component="h1">
											{loginView ? 'Welcome back' : 'Create your account'}
										</Typography>
										<Typography>
											{loginView
												? 'Login to manage your cart, favorites and orders.'
												: 'Join PetNest and make shopping for your pet easier.'}
										</Typography>
									</Box>

									<Stack direction="row" className="join-switch">
										<Button className={loginView ? 'active' : ''} onClick={() => viewChangeHandler(true)}>
											Login
										</Button>
										<Button className={!loginView ? 'active' : ''} onClick={() => viewChangeHandler(false)}>
											Sign up
										</Button>
									</Stack>

									<Stack
										component="form"
										className="join-fields"
										onSubmit={loginView ? loginHandler : signupHandler}
									>
										<TextField
											label="Nickname"
											placeholder="Enter your nickname"
											value={input.nick}
											onChange={(event) => inputChangeHandler('nick', event.target.value)}
											required
											fullWidth
										/>
										<TextField
											label="Password"
											placeholder="At least 8 characters"
											type="password"
											value={input.password}
											onChange={(event) => inputChangeHandler('password', event.target.value)}
											slotProps={{ htmlInput: { minLength: 8 } }}
											required
											fullWidth
										/>
										{!loginView && (
											<TextField
												label="Phone number"
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
											{loading ? 'Please wait...' : loginView ? 'Login' : 'Create account'}
										</Button>
									</Stack>
								</>
							)}
						</Stack>

						<Stack className="join-side">
							<PetsRoundedIcon />
							<Typography component="span">PETNEST MEMBERSHIP</Typography>
							<Typography component="h2">Everything they love, all in one place.</Typography>
							<Typography>
								Save favorites, build your cart and keep every order close at hand.
							</Typography>
						</Stack>
					</Box>
				</Box>
			</Box>
		</>
	);
};

export default withLayoutBasic(Join);
