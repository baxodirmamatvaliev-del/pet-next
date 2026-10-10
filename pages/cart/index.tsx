import React, { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Divider,
	IconButton,
	Stack,
	Typography,
} from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import { cartCountVar, userVar } from '../../apollo/store';
import { CLEAR_CART, REMOVE_CART_ITEM, UPDATE_CART_ITEM } from '../../apollo/user/mutation';
import { GET_MY_CART } from '../../apollo/user/query';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { REACT_APP_API_URL } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Cart, CartItem } from '../../libs/types/cart/cart';
import { RemoveCartItemInput, UpdateCartItemInput } from '../../libs/types/cart/cart.input';
import { T } from '../../libs/types/common';
import { formatterStr } from '../../libs/utils';
import { useTranslation } from '../../libs/i18n';

const CartPage: NextPage = () => {
	const { t, errorText } = useTranslation();
	const device = useDeviceDetect();

	/** STATES **/
	const [cart, setCart] = useState<Cart | null>(null);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [updateCartItem, { loading: updateCartItemLoading }] = useMutation(UPDATE_CART_ITEM, {
		onCompleted: (data: T) => {
			if (data?.updateCartItem) {
				setCart(data.updateCartItem);
				cartCountVar(data.updateCartItem.totalQuantity);
			}
		},
	});
	const [removeCartItem, { loading: removeCartItemLoading }] = useMutation(REMOVE_CART_ITEM, {
		onCompleted: (data: T) => {
			if (data?.removeCartItem) {
				setCart(data.removeCartItem);
				cartCountVar(data.removeCartItem.totalQuantity);
			}
		},
	});
	const [clearCart, { loading: clearCartLoading }] = useMutation(CLEAR_CART, {
		onCompleted: (data: T) => {
			if (data?.clearCart) {
				setCart(data.clearCart);
				cartCountVar(data.clearCart.totalQuantity);
			}
		},
	});
	const {
		loading: getMyCartLoading,
		error: getMyCartError,
	} = useQuery(GET_MY_CART, {
		fetchPolicy: 'network-only',
		skip: !user?.sub,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getMyCart) {
				setCart(data.getMyCart);
				cartCountVar(data.getMyCart.totalQuantity);
			}
		},
	});

	/** HANDLERS **/
	const updateCartItemHandler = async (cartItem: CartItem, quantity: number) => {
		try {
			if (quantity < 1) return;

			const input: UpdateCartItemInput = {
				productId: cartItem.productId,
				sku: cartItem.sku,
				quantity,
			};

			await updateCartItem({ variables: { input } });
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		}
	};

	const removeCartItemHandler = async (cartItem: CartItem) => {
		try {
			const input: RemoveCartItemInput = {
				productId: cartItem.productId,
				sku: cartItem.sku,
			};

			await removeCartItem({ variables: { input } });
			await sweetTopSmallSuccessAlert(t('ui.removedFromCart'), 800);
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		}
	};

	const clearCartHandler = async () => {
		try {
			await clearCart();
			await sweetTopSmallSuccessAlert(t('ui.cartCleared'), 800);
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		}
	};

	/** COMPUTED VALUES **/
	const cartItems = cart?.cartItems ?? [];
	const isCartUpdating = updateCartItemLoading || removeCartItemLoading || clearCartLoading;
	const hasUnavailableItems = cartItems.some((cartItem) => !cartItem.available);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<>
				<Head>
					<title>{t('ui.yourCartPetnestKorea')}</title>
					<meta name="title" content={t('ui.yourCartPetnestKorea')} />
				</Head>
				<Box component="main" className="cart-page cart-page--mobile container">
					<Stack className="cart-page__heading">
						<Box>
							<Typography component="p">{t('ui.homeCart')}</Typography>
							<Typography component="h1">{t('ui.yourCart')}</Typography>
						</Box>
						{cartItems.length > 0 && (
							<Button color="inherit" onClick={clearCartHandler} disabled={isCartUpdating} startIcon={<DeleteOutlineRoundedIcon />}>
								{t('ui.clearCart')}
							</Button>
						)}
					</Stack>
					{!user?.sub ? (
						<Stack className="cart-state">
							<ShoppingBagOutlinedIcon />
							<Typography component="h2">{t('ui.signInToViewYourCart')}</Typography>
							<Typography>{t('ui.yourSavedProductsWillBeWaitingForYou')}</Typography>
							<Button component={Link} href="/account/join?referrer=/cart" variant="contained">{t('ui.loginOrSignUp')}</Button>
						</Stack>
					) : getMyCartLoading && !cart ? (
						<Stack className="cart-state"><CircularProgress color="primary" /></Stack>
					) : getMyCartError ? (
						<Alert severity="error">{t('ui.cartCouldNotBeLoaded')}</Alert>
					) : cartItems.length === 0 ? (
						<Stack className="cart-state">
							<ShoppingBagOutlinedIcon />
							<Typography component="h2">{t('ui.yourCartIsEmpty')}</Typography>
							<Typography>{t('ui.exploreOurProductsAndFindSomethingYourPet')}</Typography>
							<Button component={Link} href="/product" variant="contained">{t('ui.continueShopping')}</Button>
						</Stack>
					) : (
						<Stack className="cart-content cart-content--mobile">
							<Stack className="cart-items">
								{cartItems.map((cartItem) => {
									const product = cartItem.productData;
									const variant = product?.productVariants.find(({ sku }) => sku === cartItem.sku);
									const variantName = [variant?.color, variant?.size].filter(Boolean).join(' / ');
									const imagePath = product?.productImages[0]
										? `${REACT_APP_API_URL}/${product.productImages[0]}`
										: '/img/banner/home-hero.png';

									return (
										<Box className="cart-item cart-item--mobile" key={`${cartItem.productId}-${cartItem.sku}`}>
											<Link href={`/product/detail?id=${cartItem.productId}`} className="cart-item__image">
												<Image src={imagePath} alt={product?.productName ?? t('common.petProduct')} fill sizes="88px" unoptimized />
											</Link>
											<Stack className="cart-item__info">
												<Typography component={Link} href={`/product/detail?id=${cartItem.productId}`}>
													{product?.productName ?? t('common.unavailableProduct')}
												</Typography>
												<Typography>{variantName || cartItem.sku}</Typography>
												<Chip label={cartItem.available ? t('ui.inStock') : t('ui.unavailable')} color={cartItem.available ? 'success' : 'error'} size="small" />
											</Stack>
											<IconButton className="cart-item__remove" onClick={() => removeCartItemHandler(cartItem)} disabled={isCartUpdating} aria-label={t('message.removeFromCart', { name: product?.productName ?? t('common.petProduct') })}>
												<DeleteOutlineRoundedIcon />
											</IconButton>
											<Stack direction="row" className="cart-item__quantity">
												<IconButton onClick={() => updateCartItemHandler(cartItem, cartItem.quantity - 1)} disabled={cartItem.quantity === 1 || isCartUpdating} aria-label={t('ui.decreaseQuantity')}>
													<RemoveRoundedIcon />
												</IconButton>
												<Typography>{cartItem.quantity}</Typography>
												<IconButton onClick={() => updateCartItemHandler(cartItem, cartItem.quantity + 1)} disabled={!cartItem.available || cartItem.quantity >= (variant?.stock ?? 0) || isCartUpdating} aria-label={t('ui.increaseQuantity')}>
													<AddRoundedIcon />
												</IconButton>
											</Stack>
											<Stack className="cart-item__price">
												<Typography component="strong">₩{formatterStr(cartItem.subtotal)}</Typography>
												<Typography>₩{formatterStr(cartItem.unitPrice)} {t('ui.each')}</Typography>
											</Stack>
										</Box>
									);
								})}
							</Stack>
							<Stack className="cart-summary">
								<Typography component="h2">{t('ui.orderSummary')}</Typography>
								<Stack direction="row"><Typography>{t('counts.items', { count: cart?.totalQuantity ?? 0 })}</Typography><Typography>₩{formatterStr(cart?.totalAmount ?? 0)}</Typography></Stack>
								<Stack direction="row"><Typography>{t('ui.shipping')}</Typography><Typography className="cart-summary__free">{t('ui.free')}</Typography></Stack>
								<Divider />
								<Stack direction="row" className="cart-summary__total"><Typography>{t('ui.total')}</Typography><Typography>₩{formatterStr(cart?.totalAmount ?? 0)}</Typography></Stack>
								{hasUnavailableItems && <Alert severity="warning">{t('ui.removeUnavailableProductsBeforeCheckout')}</Alert>}
								<Button component={Link} href="/checkout" variant="contained" disabled={hasUnavailableItems || isCartUpdating}>{t('ui.proceedToCheckout')}</Button>
								<Button component={Link} href="/product" variant="outlined">{t('ui.continueShopping')}</Button>
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
					<title>{t('ui.yourCartPetnestKorea')}</title>
					<meta name="title" content={t('ui.yourCartPetnestKorea')} />
				</Head>

				<Box component="main" className="cart-page container">
					<Stack direction="row" className="cart-page__heading">
						<Box>
							<Typography component="p">{t('ui.homeCart')}</Typography>
							<Typography component="h1">{t('ui.yourCart')}</Typography>
						</Box>
						{cartItems.length > 0 && (
							<Button
								color="inherit"
								onClick={clearCartHandler}
								disabled={isCartUpdating}
								startIcon={<DeleteOutlineRoundedIcon />}
							>
								{t('ui.clearCart')}
							</Button>
						)}
					</Stack>

					{!user?.sub ? (
						<Stack className="cart-state">
							<ShoppingBagOutlinedIcon />
							<Typography component="h2">{t('ui.signInToViewYourCart')}</Typography>
							<Typography>{t('ui.yourSavedProductsWillBeWaitingForYou')}</Typography>
							<Button component={Link} href="/account/join?referrer=/cart" variant="contained">
								{t('ui.loginOrSignUp')}
							</Button>
						</Stack>
					) : getMyCartLoading && !cart ? (
						<Stack className="cart-state">
							<CircularProgress color="primary" />
						</Stack>
					) : getMyCartError ? (
						<Alert severity="error">{t('ui.cartCouldNotBeLoaded')}</Alert>
					) : cartItems.length === 0 ? (
						<Stack className="cart-state">
							<ShoppingBagOutlinedIcon />
							<Typography component="h2">{t('ui.yourCartIsEmpty')}</Typography>
							<Typography>{t('ui.exploreOurProductsAndFindSomethingYourPet')}</Typography>
							<Button component={Link} href="/product" variant="contained">
								{t('ui.continueShopping')}
							</Button>
						</Stack>
					) : (
						<Box className="cart-content">
							<Stack className="cart-items">
								{cartItems.map((cartItem) => {
									const product = cartItem.productData;
									const variant = product?.productVariants.find(({ sku }) => sku === cartItem.sku);
									const variantName = [variant?.color, variant?.size].filter(Boolean).join(' / ');
									const imagePath = product?.productImages[0]
										? `${REACT_APP_API_URL}/${product.productImages[0]}`
										: '/img/banner/home-hero.png';

									return (
										<Box className="cart-item" key={`${cartItem.productId}-${cartItem.sku}`}>
											<Link href={`/product/detail?id=${cartItem.productId}`} className="cart-item__image">
												<Image
													src={imagePath}
													alt={product?.productName ?? t('common.petProduct')}
													fill
													sizes="120px"
													unoptimized
												/>
											</Link>

											<Stack className="cart-item__info">
												<Typography component={Link} href={`/product/detail?id=${cartItem.productId}`}>
													{product?.productName ?? t('common.unavailableProduct')}
												</Typography>
												<Typography>{variantName || cartItem.sku}</Typography>
												<Chip
													label={cartItem.available ? t('ui.inStock') : t('ui.unavailable')}
													color={cartItem.available ? 'success' : 'error'}
													size="small"
												/>
											</Stack>

											<Stack direction="row" className="cart-item__quantity">
												<IconButton
													onClick={() => updateCartItemHandler(cartItem, cartItem.quantity - 1)}
													disabled={cartItem.quantity === 1 || isCartUpdating}
													aria-label={t('ui.decreaseQuantity')}
												>
													<RemoveRoundedIcon />
												</IconButton>
												<Typography>{cartItem.quantity}</Typography>
												<IconButton
													onClick={() => updateCartItemHandler(cartItem, cartItem.quantity + 1)}
													disabled={!cartItem.available || cartItem.quantity >= (variant?.stock ?? 0) || isCartUpdating}
													aria-label={t('ui.increaseQuantity')}
												>
													<AddRoundedIcon />
												</IconButton>
											</Stack>

											<Stack className="cart-item__price">
												<Typography component="strong">₩{formatterStr(cartItem.subtotal)}</Typography>
												<Typography>₩{formatterStr(cartItem.unitPrice)} {t('ui.each')}</Typography>
											</Stack>

											<IconButton
												className="cart-item__remove"
												onClick={() => removeCartItemHandler(cartItem)}
												disabled={isCartUpdating}
												aria-label={t('message.removeFromCart', { name: product?.productName ?? t('common.petProduct') })}
											>
												<DeleteOutlineRoundedIcon />
											</IconButton>
										</Box>
									);
								})}
							</Stack>

							<Stack className="cart-summary">
								<Typography component="h2">{t('ui.orderSummary')}</Typography>
								<Stack direction="row">
									<Typography>{t('counts.items', { count: cart?.totalQuantity ?? 0 })}</Typography>
									<Typography>₩{formatterStr(cart?.totalAmount ?? 0)}</Typography>
								</Stack>
								<Stack direction="row">
									<Typography>{t('ui.shipping')}</Typography>
									<Typography className="cart-summary__free">{t('ui.free')}</Typography>
								</Stack>
								<Divider />
								<Stack direction="row" className="cart-summary__total">
									<Typography>{t('ui.total')}</Typography>
									<Typography>₩{formatterStr(cart?.totalAmount ?? 0)}</Typography>
								</Stack>
								{hasUnavailableItems && (
									<Alert severity="warning">{t('ui.removeUnavailableProductsBeforeCheckout')}</Alert>
								)}
								<Button
									component={Link}
									href="/checkout"
									variant="contained"
									disabled={hasUnavailableItems || isCartUpdating}
								>
									{t('ui.proceedToCheckout')}
								</Button>
								<Button component={Link} href="/product" variant="outlined">
									{t('ui.continueShopping')}
								</Button>
							</Stack>
						</Box>
					)}
				</Box>
			</>
		);
	}
};

export default withLayoutBasic(CartPage);
