import React, { FormEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Divider,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import { userVar } from '../../apollo/store';
import { CREATE_ORDER, CREATE_PAYMENT } from '../../apollo/user/mutation';
import { GET_MEMBER, GET_MY_CART } from '../../apollo/user/query';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { REACT_APP_API_URL } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import { OrderStatus } from '../../libs/enums/order.enum';
import { PaymentMethod, PaymentStatus } from '../../libs/enums/payment.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Cart } from '../../libs/types/cart/cart';
import { T } from '../../libs/types/common';
import { Order } from '../../libs/types/order/order';
import { CreateOrderInput } from '../../libs/types/order/order.input';
import { Payment } from '../../libs/types/payment/payment';
import { CreatePaymentInput } from '../../libs/types/payment/payment.input';
import { formatterStr } from '../../libs/utils';
import { useTranslation } from '../../libs/i18n';

const initialOrderInput: CreateOrderInput = {
	recipientName: '',
	recipientPhone: '',
	deliveryAddress: '',
	deliveryNote: '',
};

const CheckoutPage: NextPage = () => {
	const { t, label, errorText } = useTranslation();
	const device = useDeviceDetect();

	/** STATES **/
	const [orderInput, setOrderInput] = useState<CreateOrderInput>(initialOrderInput);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
	const [cart, setCart] = useState<Cart | null>(null);
	const [order, setOrder] = useState<Order | null>(null);
	const [payment, setPayment] = useState<Payment | null>(null);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [createOrder, { loading: createOrderLoading }] = useMutation(CREATE_ORDER);
	const [createPayment, { loading: createPaymentLoading }] = useMutation(CREATE_PAYMENT);
	const {
		loading: getMyCartLoading,
		error: getMyCartError,
	} = useQuery(GET_MY_CART, {
		fetchPolicy: 'network-only',
		skip: !user?.sub,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getMyCart) setCart(data.getMyCart);
		},
	});
	useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { memberId: user?.sub ?? '' },
		skip: !user?.sub,
		onCompleted: (data: T) => {
			const member = data?.getMember;
			if (!member) return;

			setOrderInput((previous) => ({
				...previous,
				recipientName: previous.recipientName || member.memberFullName || member.memberNick || '',
				recipientPhone: previous.recipientPhone || member.memberPhone || '',
				deliveryAddress: previous.deliveryAddress || member.memberAddress || '',
			}));
		},
	});

	/** HANDLERS **/
	const inputChangeHandler = (name: keyof CreateOrderInput, value: string) => {
		setOrderInput((prev) => ({ ...prev, [name]: value }));
	};

	const paymentMethodChangeHandler = (value: string) => {
		setPaymentMethod(value as PaymentMethod);
	};

	const checkoutHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			if (!cart?.cartItems.length) return;

			let createdOrder = order;
			if (!createdOrder) {
				const input: CreateOrderInput = {
					...orderInput,
					deliveryNote: orderInput.deliveryNote?.trim() || undefined,
				};
				const orderResult = await createOrder({ variables: { input } });
				const orderData = orderResult.data as T | null | undefined;
				createdOrder = orderData?.createOrder ?? null;
				if (!createdOrder) throw new Error(Message.SOMETHING_WENT_WRONG);
				setOrder(createdOrder);
			}
			if (createdOrder.orderStatus === OrderStatus.CANCELLED) return;

			const paymentInput: CreatePaymentInput = {
				orderId: createdOrder._id,
				paymentMethod,
			};
			const paymentResult = await createPayment({ variables: { input: paymentInput } });
			const paymentData = paymentResult.data as T | null | undefined;
			const createdPayment = paymentData?.createPayment;
			if (!createdPayment) throw new Error(Message.SOMETHING_WENT_WRONG);

			setPayment(createdPayment);
			if (createdPayment.paymentStatus !== PaymentStatus.CANCELLED) {
				await sweetTopSmallSuccessAlert(t('ui.orderRequestSubmitted'), 900);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		}
	};

	/** COMPUTED VALUES **/
	const isCheckoutLoading = createOrderLoading || createPaymentLoading;
	const isSubmitDisabled = isCheckoutLoading
		|| !orderInput.recipientName.trim()
		|| !orderInput.recipientPhone.trim()
		|| !orderInput.deliveryAddress.trim();
	const hasUnavailableItems = cart?.cartItems.some((cartItem) => !cartItem.available) ?? false;
	const isPaymentConfirmed = payment?.paymentStatus === PaymentStatus.CONFIRMED;
	const isOrderCancelled = order?.orderStatus === OrderStatus.CANCELLED
		|| payment?.paymentStatus === PaymentStatus.CANCELLED;

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<>
				<Head>
					<title>{t('ui.checkoutPetnestKorea')}</title>
					<meta name="title" content={t('ui.checkoutPetnestKorea')} />
				</Head>
				<Box component="main" className="checkout-page checkout-page--mobile container">
					<Box className="checkout-page__heading">
						<Typography component="p">{t('ui.homeCartCheckout')}</Typography>
						<Typography component="h1">{t('ui.checkout')}</Typography>
					</Box>
					{!user?.sub ? (
						<Stack className="checkout-state">
							<LockOutlinedIcon />
							<Typography component="h2">{t('ui.signInToContinue')}</Typography>
							<Typography>{t('ui.yourAccountIsRequiredToPlaceAnOrder')}</Typography>
							<Button component={Link} href="/account/join?referrer=/checkout" variant="contained">{t('ui.loginOrSignUp')}</Button>
						</Stack>
					) : getMyCartLoading && !cart ? (
						<Stack className="checkout-state"><CircularProgress color="primary" /></Stack>
					) : getMyCartError ? (
						<Alert severity="error">{t('ui.checkoutInformationCouldNotBeLoaded')}</Alert>
					) : isOrderCancelled ? (
						<Stack className="checkout-state">
							<Alert severity="warning">{t('ui.thisOrderOrItsPaymentRequestWasCancelled')}</Alert>
							<Button component={Link} href="/mypage?category=myOrders" variant="contained">{t('ui.viewMyOrders')}</Button>
						</Stack>
					) : order && payment ? (
						<Stack className="checkout-success">
							<CheckCircleOutlineRoundedIcon />
							<Typography component="span">{t('ui.orderReceived')}</Typography>
							<Typography component="h2">{t('ui.thankYouForYourOrder')}</Typography>
							<Typography>{isPaymentConfirmed ? t('ui.yourDemoPaymentRequestHasBeenConfirmedNo') : t('ui.yourOrderHasBeenCreatedAndTheDemo')}</Typography>
							<Box className="checkout-success__details">
								<Stack direction="row"><Typography>{t('ui.orderNumber')}</Typography><Typography component="strong">#{order._id.slice(-8).toUpperCase()}</Typography></Stack>
								<Stack direction="row"><Typography>{t('ui.total')}</Typography><Typography component="strong">₩{formatterStr(order.totalAmount)}</Typography></Stack>
								<Stack direction="row"><Typography>{t('ui.payment')}</Typography><Chip label={label(payment.paymentStatus)} color={isPaymentConfirmed ? 'success' : 'warning'} size="small" /></Stack>
							</Box>
							<Button component={Link} href={`/order/detail?id=${order._id}`} variant="contained">{t('ui.viewOrder')}</Button>
						</Stack>
					) : order ? (
						<Stack component="form" className="checkout-state" onSubmit={checkoutHandler}>
							<Alert severity="warning">{t('message.paymentRetry', { id: order._id.slice(-8).toUpperCase() })}</Alert>
							<Button type="submit" variant="contained" disabled={isCheckoutLoading}>{isCheckoutLoading ? t('ui.retrying') : t('ui.retryPaymentRequest')}</Button>
						</Stack>
					) : !cart?.cartItems.length ? (
						<Stack className="checkout-state">
							<LocalShippingOutlinedIcon />
							<Typography component="h2">{t('ui.yourCartIsEmpty')}</Typography>
							<Typography>{t('ui.addProductsToYourCartBeforeStartingCheckout')}</Typography>
							<Button component={Link} href="/product" variant="contained">{t('ui.browseProducts')}</Button>
						</Stack>
					) : hasUnavailableItems ? (
						<Stack className="checkout-state">
							<Alert severity="warning">{t('ui.yourCartContainsUnavailableProducts')}</Alert>
							<Button component={Link} href="/cart" variant="contained">{t('ui.returnToCart')}</Button>
						</Stack>
					) : (
						<Stack className="checkout-content checkout-content--mobile">
							<Stack className="checkout-summary">
								<Typography component="h2">{t('ui.orderSummary')}</Typography>
								<Stack className="checkout-summary__items">
									{cart.cartItems.map((cartItem) => {
										const product = cartItem.productData;
										const imagePath = product?.productImages[0]
											? `${REACT_APP_API_URL}/${product.productImages[0]}`
											: '/img/banner/home-hero.png';

										return (
											<Stack direction="row" className="checkout-summary__item" key={`${cartItem.productId}-${cartItem.sku}`}>
												<Box className="checkout-summary__image">
													<Image src={imagePath} alt={product?.productName ?? t('common.petProduct')} fill sizes="70px" unoptimized />
												</Box>
												<Box>
													<Typography component="strong">{product?.productName}</Typography>
													<Typography>{t('ui.quantity')} {cartItem.quantity}</Typography>
												</Box>
												<Typography component="strong">₩{formatterStr(cartItem.subtotal)}</Typography>
												</Stack>
										);
									})}
								</Stack>
								<Stack direction="row" className="checkout-summary__total">
									<Typography>{t('ui.total')}</Typography><Typography>₩{formatterStr(cart.totalAmount)}</Typography>
								</Stack>
							</Stack>
							<Stack component="form" className="checkout-form" onSubmit={checkoutHandler}>
								<Box className="checkout-section">
									<Stack direction="row" className="checkout-section__title">
										<Typography component="span">1</Typography>
										<Typography component="h2">{t('ui.deliveryInformation')}</Typography>
									</Stack>
									<Box className="checkout-fields">
										<TextField label={t('ui.recipientName')} value={orderInput.recipientName} onChange={(event) => inputChangeHandler('recipientName', event.target.value)} required fullWidth />
										<TextField label={t('ui.phoneNumber')} type="tel" value={orderInput.recipientPhone} onChange={(event) => inputChangeHandler('recipientPhone', event.target.value)} required fullWidth />
										<TextField className="checkout-fields__wide" label={t('ui.deliveryAddress')} value={orderInput.deliveryAddress} onChange={(event) => inputChangeHandler('deliveryAddress', event.target.value)} required fullWidth />
										<TextField className="checkout-fields__wide" label={t('ui.deliveryNoteOptional')} value={orderInput.deliveryNote} onChange={(event) => inputChangeHandler('deliveryNote', event.target.value)} multiline rows={3} fullWidth />
									</Box>
								</Box>
								<Box className="checkout-section">
									<Stack direction="row" className="checkout-section__title">
										<Typography component="span">2</Typography>
										<Typography component="h2">{t('ui.paymentMethod')}</Typography>
									</Stack>
									<Alert className="checkout-section__notice" severity="info">{t('ui.noOnlineChargeIsTakenYetYourPayment')}</Alert>
									<FormControl className="payment-methods">
										<RadioGroup value={paymentMethod} onChange={(event) => paymentMethodChangeHandler(event.target.value)}>
											<FormControlLabel value={PaymentMethod.CARD} control={<Radio />} label={<Stack direction="row"><CreditCardRoundedIcon /><Box><Typography component="strong">{t('ui.cardPreference')}</Typography><Typography>{t('ui.noCardChargeIsMadeYet')}</Typography></Box></Stack>} />
											<FormControlLabel value={PaymentMethod.KAKAO_PAY} control={<Radio />} label={<Stack direction="row"><Typography component="b">K</Typography><Box><Typography component="strong">{t('ui.kakaoPayPreference')}</Typography><Typography>{t('ui.noKakaoPayChargeIsMadeYet')}</Typography></Box></Stack>} />
										</RadioGroup>
									</FormControl>
								</Box>
								<Button type="submit" variant="contained" disabled={isSubmitDisabled} startIcon={<LockOutlinedIcon />}>
									{isCheckoutLoading ? t('ui.processing') : t('message.submitOrder', { amount: formatterStr(cart.totalAmount) })}
								</Button>
							</Stack>
						</Stack>
					)}
				</Box>
			</>
		);
	} else {
		/** RENDER PC **/
		return (
			<>
				<Head>
					<title>{t('ui.checkoutPetnestKorea')}</title>
					<meta name="title" content={t('ui.checkoutPetnestKorea')} />
				</Head>

				<Box component="main" className="checkout-page container">
					<Box className="checkout-page__heading">
						<Typography component="p">{t('ui.homeCartCheckout')}</Typography>
						<Typography component="h1">{t('ui.checkout')}</Typography>
					</Box>

					{!user?.sub ? (
						<Stack className="checkout-state">
							<LockOutlinedIcon />
							<Typography component="h2">{t('ui.signInToContinue')}</Typography>
							<Typography>{t('ui.yourAccountIsRequiredToPlaceAnOrder')}</Typography>
							<Button component={Link} href="/account/join?referrer=/checkout" variant="contained">
								{t('ui.loginOrSignUp')}
							</Button>
						</Stack>
					) : getMyCartLoading && !cart ? (
						<Stack className="checkout-state">
							<CircularProgress color="primary" />
						</Stack>
					) : getMyCartError ? (
						<Alert severity="error">{t('ui.checkoutInformationCouldNotBeLoaded')}</Alert>
					) : isOrderCancelled ? (
						<Stack className="checkout-state">
							<Alert severity="warning">{t('ui.thisOrderOrItsPaymentRequestWasCancelled')}</Alert>
							<Button component={Link} href="/mypage?category=myOrders" variant="contained">{t('ui.viewMyOrders')}</Button>
						</Stack>
					) : order && payment ? (
						<Stack className="checkout-success">
							<CheckCircleOutlineRoundedIcon />
							<Typography component="span">{t('ui.orderReceived')}</Typography>
							<Typography component="h2">{t('ui.thankYouForYourOrder')}</Typography>
							<Typography>{isPaymentConfirmed ? t('ui.yourDemoPaymentRequestHasBeenConfirmedNo') : t('ui.yourOrderHasBeenCreatedAndTheDemo')}</Typography>
							<Box className="checkout-success__details">
								<Stack direction="row">
									<Typography>{t('ui.orderNumber')}</Typography>
									<Typography component="strong">#{order._id.slice(-8).toUpperCase()}</Typography>
								</Stack>
								<Stack direction="row">
									<Typography>{t('ui.total')}</Typography>
									<Typography component="strong">₩{formatterStr(order.totalAmount)}</Typography>
								</Stack>
								<Stack direction="row">
									<Typography>{t('ui.payment')}</Typography>
									<Chip label={label(payment.paymentStatus)} color={isPaymentConfirmed ? 'success' : 'warning'} size="small" />
								</Stack>
							</Box>
							<Button component={Link} href={`/order/detail?id=${order._id}`} variant="contained">
								{t('ui.viewOrder')}
							</Button>
						</Stack>
					) : order ? (
						<Stack component="form" className="checkout-state" onSubmit={checkoutHandler}>
							<Alert severity="warning">{t('message.paymentRetry', { id: order._id.slice(-8).toUpperCase() })}</Alert>
							<Button type="submit" variant="contained" disabled={isCheckoutLoading}>{isCheckoutLoading ? t('ui.retrying') : t('ui.retryPaymentRequest')}</Button>
						</Stack>
					) : !cart?.cartItems.length ? (
						<Stack className="checkout-state">
							<LocalShippingOutlinedIcon />
							<Typography component="h2">{t('ui.yourCartIsEmpty')}</Typography>
							<Typography>{t('ui.addProductsToYourCartBeforeStartingCheckout')}</Typography>
							<Button component={Link} href="/product" variant="contained">
								{t('ui.browseProducts')}
							</Button>
						</Stack>
					) : hasUnavailableItems ? (
						<Stack className="checkout-state">
							<Alert severity="warning">{t('ui.yourCartContainsUnavailableProducts')}</Alert>
							<Button component={Link} href="/cart" variant="contained">
								{t('ui.returnToCart')}
							</Button>
						</Stack>
					) : (
						<Box className="checkout-content">
							<Stack component="form" className="checkout-form" onSubmit={checkoutHandler}>
								<Box className="checkout-section">
									<Stack direction="row" className="checkout-section__title">
										<Typography component="span">1</Typography>
										<Box>
											<Typography component="h2">{t('ui.deliveryInformation')}</Typography>
											<Typography>{t('ui.enterTheDetailsOfThePersonReceivingThe')}</Typography>
										</Box>
									</Stack>
									<Box className="checkout-fields">
										<TextField
											label={t('ui.recipientName')}
											value={orderInput.recipientName}
											onChange={(event) => inputChangeHandler('recipientName', event.target.value)}
											required
											fullWidth
										/>
										<TextField
											label={t('ui.phoneNumber')}
											type="tel"
											value={orderInput.recipientPhone}
											onChange={(event) => inputChangeHandler('recipientPhone', event.target.value)}
											required
											fullWidth
										/>
										<TextField
											className="checkout-fields__wide"
											label={t('ui.deliveryAddress')}
											value={orderInput.deliveryAddress}
											onChange={(event) => inputChangeHandler('deliveryAddress', event.target.value)}
											required
											fullWidth
										/>
										<TextField
											className="checkout-fields__wide"
											label={t('ui.deliveryNoteOptional')}
											value={orderInput.deliveryNote}
											onChange={(event) => inputChangeHandler('deliveryNote', event.target.value)}
											multiline
											rows={3}
											fullWidth
										/>
									</Box>
								</Box>

								<Box className="checkout-section">
									<Stack direction="row" className="checkout-section__title">
										<Typography component="span">2</Typography>
										<Box>
											<Typography component="h2">{t('ui.paymentMethod')}</Typography>
											<Typography>{t('ui.selectHowYouWantToPayForYour')}</Typography>
										</Box>
									</Stack>
									<Alert className="checkout-section__notice" severity="info">{t('ui.noOnlineChargeIsTakenYetYourPayment')}</Alert>
									<FormControl className="payment-methods">
										<RadioGroup
											value={paymentMethod}
											onChange={(event) => paymentMethodChangeHandler(event.target.value)}
										>
											<FormControlLabel
												value={PaymentMethod.CARD}
												control={<Radio />}
												label={(
													<Stack direction="row">
														<CreditCardRoundedIcon />
														<Box>
															<Typography component="strong">{t('ui.cardPreference')}</Typography>
															<Typography>{t('ui.noCardChargeIsMadeYet')}</Typography>
														</Box>
													</Stack>
												)}
											/>
											<FormControlLabel
												value={PaymentMethod.KAKAO_PAY}
												control={<Radio />}
												label={(
													<Stack direction="row">
														<Typography component="b">K</Typography>
														<Box>
															<Typography component="strong">{t('ui.kakaoPayPreference')}</Typography>
															<Typography>{t('ui.noKakaoPayChargeIsMadeYet')}</Typography>
														</Box>
													</Stack>
												)}
											/>
										</RadioGroup>
									</FormControl>
								</Box>

								<Button
									type="submit"
									variant="contained"
									disabled={isSubmitDisabled}
									startIcon={<LockOutlinedIcon />}
								>
									{isCheckoutLoading ? t('ui.processing') : t('message.submitOrder', { amount: formatterStr(cart.totalAmount) })}
								</Button>
							</Stack>

							<Stack className="checkout-summary">
								<Typography component="h2">{t('ui.orderSummary')}</Typography>
								<Stack className="checkout-summary__items">
									{cart.cartItems.map((cartItem) => {
										const product = cartItem.productData;
										const imagePath = product?.productImages[0]
											? `${REACT_APP_API_URL}/${product.productImages[0]}`
											: '/img/banner/home-hero.png';

										return (
											<Stack direction="row" className="checkout-summary__item" key={`${cartItem.productId}-${cartItem.sku}`}>
												<Box className="checkout-summary__image">
													<Image
														src={imagePath}
														alt={product?.productName ?? t('common.petProduct')}
														fill
														sizes="70px"
														unoptimized
													/>
												</Box>
												<Box>
													<Typography component="strong">{product?.productName}</Typography>
													<Typography>{t('ui.quantity')} {cartItem.quantity}</Typography>
												</Box>
												<Typography component="strong">₩{formatterStr(cartItem.subtotal)}</Typography>
											</Stack>
										);
									})}
								</Stack>
								<Divider />
								<Stack direction="row">
									<Typography>{t('ui.subtotal')}</Typography>
									<Typography>₩{formatterStr(cart.totalAmount)}</Typography>
								</Stack>
								<Stack direction="row">
									<Typography>{t('ui.shipping')}</Typography>
									<Typography className="checkout-summary__free">{t('ui.free')}</Typography>
								</Stack>
								<Divider />
								<Stack direction="row" className="checkout-summary__total">
									<Typography>{t('ui.total')}</Typography>
									<Typography>₩{formatterStr(cart.totalAmount)}</Typography>
								</Stack>
								<Stack direction="row" className="checkout-summary__secure">
									<LockOutlinedIcon />
									<Typography>{t('ui.yourCheckoutInformationIsProtected')}</Typography>
								</Stack>
							</Stack>
						</Box>
					)}
				</Box>
			</>
		);
	}
};

export default withLayoutBasic(CheckoutPage);
