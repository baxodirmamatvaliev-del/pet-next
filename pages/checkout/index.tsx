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
import { GET_MY_CART } from '../../apollo/user/query';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { REACT_APP_API_URL } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import { PaymentMethod } from '../../libs/enums/payment.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Cart } from '../../libs/types/cart/cart';
import { T } from '../../libs/types/common';
import { Order } from '../../libs/types/order/order';
import { CreateOrderInput } from '../../libs/types/order/order.input';
import { Payment } from '../../libs/types/payment/payment';
import { CreatePaymentInput } from '../../libs/types/payment/payment.input';
import { formatterStr } from '../../libs/utils';

const initialOrderInput: CreateOrderInput = {
	recipientName: '',
	recipientPhone: '',
	deliveryAddress: '',
	deliveryNote: '',
};

const CheckoutPage: NextPage = () => {
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

			const input: CreateOrderInput = {
				...orderInput,
				deliveryNote: orderInput.deliveryNote?.trim() || undefined,
			};
			const orderResult = await createOrder({ variables: { input } });
			const orderData = orderResult.data as T | null | undefined;
			const createdOrder = orderData?.createOrder;
			if (!createdOrder) throw new Error(Message.SOMETHING_WENT_WRONG);

			const paymentInput: CreatePaymentInput = {
				orderId: createdOrder._id,
				paymentMethod,
			};
			const paymentResult = await createPayment({ variables: { input: paymentInput } });
			const paymentData = paymentResult.data as T | null | undefined;
			const createdPayment = paymentData?.createPayment;
			if (!createdPayment) throw new Error(Message.SOMETHING_WENT_WRONG);

			setOrder(createdOrder);
			setPayment(createdPayment);
			await sweetTopSmallSuccessAlert('Order placed successfully', 900);
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	/** COMPUTED VALUES **/
	const isCheckoutLoading = createOrderLoading || createPaymentLoading;
	const isSubmitDisabled = isCheckoutLoading
		|| !orderInput.recipientName.trim()
		|| !orderInput.recipientPhone.trim()
		|| !orderInput.deliveryAddress.trim();
	const hasUnavailableItems = cart?.cartItems.some((cartItem) => !cartItem.available) ?? false;

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<>
				<Head>
					<title>Checkout | PetNest Korea</title>
					<meta name="title" content="Checkout | PetNest Korea" />
				</Head>
				<Box component="main" className="checkout-page checkout-page--mobile container">
					<Box className="checkout-page__heading">
						<Typography component="p">Home / Cart / Checkout</Typography>
						<Typography component="h1">Checkout</Typography>
					</Box>
					{!user?.sub ? (
						<Stack className="checkout-state">
							<LockOutlinedIcon />
							<Typography component="h2">Sign in to continue</Typography>
							<Typography>Your account is required to place an order securely.</Typography>
							<Button component={Link} href="/account/join?referrer=/checkout" variant="contained">Login or sign up</Button>
						</Stack>
					) : getMyCartLoading && !cart ? (
						<Stack className="checkout-state"><CircularProgress color="primary" /></Stack>
					) : getMyCartError ? (
						<Alert severity="error">Checkout information could not be loaded.</Alert>
					) : order && payment ? (
						<Stack className="checkout-success">
							<CheckCircleOutlineRoundedIcon />
							<Typography component="span">ORDER RECEIVED</Typography>
							<Typography component="h2">Thank you for your order</Typography>
							<Typography>Your order has been created and the payment request is waiting for confirmation.</Typography>
							<Box className="checkout-success__details">
								<Stack direction="row"><Typography>Order number</Typography><Typography component="strong">#{order._id.slice(-8).toUpperCase()}</Typography></Stack>
								<Stack direction="row"><Typography>Total</Typography><Typography component="strong">₩{formatterStr(order.totalAmount)}</Typography></Stack>
								<Stack direction="row"><Typography>Payment</Typography><Chip label={payment.paymentStatus} color="warning" size="small" /></Stack>
							</Box>
							<Button component={Link} href="/product" variant="contained">Continue shopping</Button>
						</Stack>
					) : !cart?.cartItems.length ? (
						<Stack className="checkout-state">
							<LocalShippingOutlinedIcon />
							<Typography component="h2">Your cart is empty</Typography>
							<Typography>Add products to your cart before starting checkout.</Typography>
							<Button component={Link} href="/product" variant="contained">Browse products</Button>
						</Stack>
					) : hasUnavailableItems ? (
						<Stack className="checkout-state">
							<Alert severity="warning">Your cart contains unavailable products.</Alert>
							<Button component={Link} href="/cart" variant="contained">Return to cart</Button>
						</Stack>
					) : (
						<Stack className="checkout-content checkout-content--mobile">
							<Stack className="checkout-summary">
								<Typography component="h2">Order Summary</Typography>
								<Stack className="checkout-summary__items">
									{cart.cartItems.map((cartItem) => {
										const product = cartItem.productData;
										const imagePath = product?.productImages[0]
											? `${REACT_APP_API_URL}/${product.productImages[0]}`
											: '/img/banner/home-hero.png';

										return (
											<Stack direction="row" className="checkout-summary__item" key={`${cartItem.productId}-${cartItem.sku}`}>
												<Box className="checkout-summary__image">
													<Image src={imagePath} alt={product?.productName ?? 'Pet product'} fill sizes="70px" unoptimized />
												</Box>
												<Box>
													<Typography component="strong">{product?.productName}</Typography>
													<Typography>Quantity: {cartItem.quantity}</Typography>
												</Box>
												<Typography component="strong">₩{formatterStr(cartItem.subtotal)}</Typography>
												</Stack>
										);
									})}
								</Stack>
								<Stack direction="row" className="checkout-summary__total">
									<Typography>Total</Typography><Typography>₩{formatterStr(cart.totalAmount)}</Typography>
								</Stack>
							</Stack>
							<Stack component="form" className="checkout-form" onSubmit={checkoutHandler}>
								<Box className="checkout-section">
									<Stack direction="row" className="checkout-section__title">
										<Typography component="span">1</Typography>
										<Typography component="h2">Delivery information</Typography>
									</Stack>
									<Box className="checkout-fields">
										<TextField label="Recipient name" value={orderInput.recipientName} onChange={(event) => inputChangeHandler('recipientName', event.target.value)} required fullWidth />
										<TextField label="Phone number" type="tel" value={orderInput.recipientPhone} onChange={(event) => inputChangeHandler('recipientPhone', event.target.value)} required fullWidth />
										<TextField className="checkout-fields__wide" label="Delivery address" value={orderInput.deliveryAddress} onChange={(event) => inputChangeHandler('deliveryAddress', event.target.value)} required fullWidth />
										<TextField className="checkout-fields__wide" label="Delivery note (optional)" value={orderInput.deliveryNote} onChange={(event) => inputChangeHandler('deliveryNote', event.target.value)} multiline rows={3} fullWidth />
									</Box>
								</Box>
								<Box className="checkout-section">
									<Stack direction="row" className="checkout-section__title">
										<Typography component="span">2</Typography>
										<Typography component="h2">Payment method</Typography>
									</Stack>
									<FormControl className="payment-methods">
										<RadioGroup value={paymentMethod} onChange={(event) => paymentMethodChangeHandler(event.target.value)}>
											<FormControlLabel value={PaymentMethod.CARD} control={<Radio />} label={<Stack direction="row"><CreditCardRoundedIcon /><Box><Typography component="strong">Pay with card</Typography><Typography>Secure credit or debit card payment</Typography></Box></Stack>} />
											<FormControlLabel value={PaymentMethod.KAKAO_PAY} control={<Radio />} label={<Stack direction="row"><Typography component="b">K</Typography><Box><Typography component="strong">Kakao Pay</Typography><Typography>Fast payment with your Kakao account</Typography></Box></Stack>} />
										</RadioGroup>
									</FormControl>
								</Box>
								<Button type="submit" variant="contained" disabled={isSubmitDisabled} startIcon={<LockOutlinedIcon />}>
									{isCheckoutLoading ? 'Processing...' : `Place order · ₩${formatterStr(cart.totalAmount)}`}
								</Button>
							</Stack>
						</Stack>
					)}
				</Box>
			</>
		);
	} else {
		/** RENDER PC **/

	/** RENDER **/
	return (
		<>
			<Head>
				<title>Checkout | PetNest Korea</title>
				<meta name="title" content="Checkout | PetNest Korea" />
			</Head>

			<Box component="main" className="checkout-page container">
				<Box className="checkout-page__heading">
					<Typography component="p">Home / Cart / Checkout</Typography>
					<Typography component="h1">Checkout</Typography>
				</Box>

				{!user?.sub ? (
					<Stack className="checkout-state">
						<LockOutlinedIcon />
						<Typography component="h2">Sign in to continue</Typography>
						<Typography>Your account is required to place an order securely.</Typography>
						<Button component={Link} href="/account/join?referrer=/checkout" variant="contained">
							Login or sign up
						</Button>
					</Stack>
				) : getMyCartLoading && !cart ? (
					<Stack className="checkout-state">
						<CircularProgress color="primary" />
					</Stack>
				) : getMyCartError ? (
					<Alert severity="error">Checkout information could not be loaded.</Alert>
				) : order && payment ? (
					<Stack className="checkout-success">
						<CheckCircleOutlineRoundedIcon />
						<Typography component="span">ORDER RECEIVED</Typography>
						<Typography component="h2">Thank you for your order</Typography>
						<Typography>
							Your order has been created and the payment request is waiting for confirmation.
						</Typography>
						<Box className="checkout-success__details">
							<Stack direction="row">
								<Typography>Order number</Typography>
								<Typography component="strong">#{order._id.slice(-8).toUpperCase()}</Typography>
							</Stack>
							<Stack direction="row">
								<Typography>Total</Typography>
								<Typography component="strong">₩{formatterStr(order.totalAmount)}</Typography>
							</Stack>
							<Stack direction="row">
								<Typography>Payment</Typography>
								<Chip label={payment.paymentStatus} color="warning" size="small" />
							</Stack>
						</Box>
						<Button component={Link} href="/product" variant="contained">
							Continue shopping
						</Button>
					</Stack>
				) : !cart?.cartItems.length ? (
					<Stack className="checkout-state">
						<LocalShippingOutlinedIcon />
						<Typography component="h2">Your cart is empty</Typography>
						<Typography>Add products to your cart before starting checkout.</Typography>
						<Button component={Link} href="/product" variant="contained">
							Browse products
						</Button>
					</Stack>
				) : hasUnavailableItems ? (
					<Stack className="checkout-state">
						<Alert severity="warning">Your cart contains unavailable products.</Alert>
						<Button component={Link} href="/cart" variant="contained">
							Return to cart
						</Button>
					</Stack>
				) : (
					<Box className="checkout-content">
						<Stack component="form" className="checkout-form" onSubmit={checkoutHandler}>
							<Box className="checkout-section">
								<Stack direction="row" className="checkout-section__title">
									<Typography component="span">1</Typography>
									<Box>
										<Typography component="h2">Delivery information</Typography>
										<Typography>Enter the details of the person receiving the order.</Typography>
									</Box>
								</Stack>
								<Box className="checkout-fields">
									<TextField
										label="Recipient name"
										value={orderInput.recipientName}
										onChange={(event) => inputChangeHandler('recipientName', event.target.value)}
										required
										fullWidth
									/>
									<TextField
										label="Phone number"
										type="tel"
										value={orderInput.recipientPhone}
										onChange={(event) => inputChangeHandler('recipientPhone', event.target.value)}
										required
										fullWidth
									/>
									<TextField
										className="checkout-fields__wide"
										label="Delivery address"
										value={orderInput.deliveryAddress}
										onChange={(event) => inputChangeHandler('deliveryAddress', event.target.value)}
										required
										fullWidth
									/>
									<TextField
										className="checkout-fields__wide"
										label="Delivery note (optional)"
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
										<Typography component="h2">Payment method</Typography>
										<Typography>Select how you want to pay for your order.</Typography>
									</Box>
								</Stack>
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
														<Typography component="strong">Pay with card</Typography>
														<Typography>Secure credit or debit card payment</Typography>
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
														<Typography component="strong">Kakao Pay</Typography>
														<Typography>Fast payment with your Kakao account</Typography>
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
								{isCheckoutLoading ? 'Processing...' : `Place order · ₩${formatterStr(cart.totalAmount)}`}
							</Button>
						</Stack>

						<Stack className="checkout-summary">
							<Typography component="h2">Order Summary</Typography>
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
													alt={product?.productName ?? 'Pet product'}
													fill
													sizes="70px"
													unoptimized
												/>
											</Box>
											<Box>
												<Typography component="strong">{product?.productName}</Typography>
												<Typography>Quantity: {cartItem.quantity}</Typography>
											</Box>
											<Typography component="strong">₩{formatterStr(cartItem.subtotal)}</Typography>
										</Stack>
									);
								})}
							</Stack>
							<Divider />
							<Stack direction="row">
								<Typography>Subtotal</Typography>
								<Typography>₩{formatterStr(cart.totalAmount)}</Typography>
							</Stack>
							<Stack direction="row">
								<Typography>Shipping</Typography>
								<Typography className="checkout-summary__free">Free</Typography>
							</Stack>
							<Divider />
							<Stack direction="row" className="checkout-summary__total">
								<Typography>Total</Typography>
								<Typography>₩{formatterStr(cart.totalAmount)}</Typography>
							</Stack>
							<Stack direction="row" className="checkout-summary__secure">
								<LockOutlinedIcon />
								<Typography>Your checkout information is protected.</Typography>
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
