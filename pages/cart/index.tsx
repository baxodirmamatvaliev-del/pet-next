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

const CartPage: NextPage = () => {
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
			await sweetMixinErrorAlert(message);
		}
	};

	const removeCartItemHandler = async (cartItem: CartItem) => {
		try {
			const input: RemoveCartItemInput = {
				productId: cartItem.productId,
				sku: cartItem.sku,
			};

			await removeCartItem({ variables: { input } });
			await sweetTopSmallSuccessAlert('Removed from cart', 800);
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	const clearCartHandler = async () => {
		try {
			await clearCart();
			await sweetTopSmallSuccessAlert('Cart cleared', 800);
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
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
					<title>Your Cart | PetNest Korea</title>
					<meta name="title" content="Your Cart | PetNest Korea" />
				</Head>
				<Box component="main" className="cart-page cart-page--mobile container">
					<Stack className="cart-page__heading">
						<Box>
							<Typography component="p">Home / Cart</Typography>
							<Typography component="h1">Your Cart</Typography>
						</Box>
						{cartItems.length > 0 && (
							<Button color="inherit" onClick={clearCartHandler} disabled={isCartUpdating} startIcon={<DeleteOutlineRoundedIcon />}>
								Clear cart
							</Button>
						)}
					</Stack>
					{!user?.sub ? (
						<Stack className="cart-state">
							<ShoppingBagOutlinedIcon />
							<Typography component="h2">Sign in to view your cart</Typography>
							<Typography>Your saved products will be waiting for you.</Typography>
							<Button component={Link} href="/account/join?referrer=/cart" variant="contained">Login or sign up</Button>
						</Stack>
					) : getMyCartLoading && !cart ? (
						<Stack className="cart-state"><CircularProgress color="primary" /></Stack>
					) : getMyCartError ? (
						<Alert severity="error">Cart could not be loaded.</Alert>
					) : cartItems.length === 0 ? (
						<Stack className="cart-state">
							<ShoppingBagOutlinedIcon />
							<Typography component="h2">Your cart is empty</Typography>
							<Typography>Explore our products and find something your pet will love.</Typography>
							<Button component={Link} href="/product" variant="contained">Continue shopping</Button>
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
												<Image src={imagePath} alt={product?.productName ?? 'Pet product'} fill sizes="88px" unoptimized />
											</Link>
											<Stack className="cart-item__info">
												<Typography component={Link} href={`/product/detail?id=${cartItem.productId}`}>
													{product?.productName ?? 'Unavailable product'}
												</Typography>
												<Typography>{variantName || cartItem.sku}</Typography>
												<Chip label={cartItem.available ? 'In stock' : 'Unavailable'} color={cartItem.available ? 'success' : 'error'} size="small" />
											</Stack>
											<IconButton className="cart-item__remove" onClick={() => removeCartItemHandler(cartItem)} disabled={isCartUpdating} aria-label={`Remove ${product?.productName ?? 'product'} from cart`}>
												<DeleteOutlineRoundedIcon />
											</IconButton>
											<Stack direction="row" className="cart-item__quantity">
												<IconButton onClick={() => updateCartItemHandler(cartItem, cartItem.quantity - 1)} disabled={cartItem.quantity === 1 || isCartUpdating} aria-label="Decrease quantity">
													<RemoveRoundedIcon />
												</IconButton>
												<Typography>{cartItem.quantity}</Typography>
												<IconButton onClick={() => updateCartItemHandler(cartItem, cartItem.quantity + 1)} disabled={!cartItem.available || cartItem.quantity >= (variant?.stock ?? 0) || isCartUpdating} aria-label="Increase quantity">
													<AddRoundedIcon />
												</IconButton>
											</Stack>
											<Stack className="cart-item__price">
												<Typography component="strong">₩{formatterStr(cartItem.subtotal)}</Typography>
												<Typography>₩{formatterStr(cartItem.unitPrice)} each</Typography>
											</Stack>
										</Box>
									);
								})}
							</Stack>
							<Stack className="cart-summary">
								<Typography component="h2">Order Summary</Typography>
								<Stack direction="row"><Typography>Items ({cart?.totalQuantity ?? 0})</Typography><Typography>₩{formatterStr(cart?.totalAmount ?? 0)}</Typography></Stack>
								<Stack direction="row"><Typography>Shipping</Typography><Typography className="cart-summary__free">Free</Typography></Stack>
								<Divider />
								<Stack direction="row" className="cart-summary__total"><Typography>Total</Typography><Typography>₩{formatterStr(cart?.totalAmount ?? 0)}</Typography></Stack>
								{hasUnavailableItems && <Alert severity="warning">Remove unavailable products before checkout.</Alert>}
								<Button component={Link} href="/checkout" variant="contained" disabled={hasUnavailableItems || isCartUpdating}>Proceed to checkout</Button>
								<Button component={Link} href="/product" variant="outlined">Continue shopping</Button>
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
				<title>Your Cart | PetNest Korea</title>
				<meta name="title" content="Your Cart | PetNest Korea" />
			</Head>

			<Box component="main" className="cart-page container">
				<Stack direction="row" className="cart-page__heading">
					<Box>
						<Typography component="p">Home / Cart</Typography>
						<Typography component="h1">Your Cart</Typography>
					</Box>
					{cartItems.length > 0 && (
						<Button
							color="inherit"
							onClick={clearCartHandler}
							disabled={isCartUpdating}
							startIcon={<DeleteOutlineRoundedIcon />}
						>
							Clear cart
						</Button>
					)}
				</Stack>

				{!user?.sub ? (
					<Stack className="cart-state">
						<ShoppingBagOutlinedIcon />
						<Typography component="h2">Sign in to view your cart</Typography>
						<Typography>Your saved products will be waiting for you.</Typography>
						<Button component={Link} href="/account/join?referrer=/cart" variant="contained">
							Login or sign up
						</Button>
					</Stack>
				) : getMyCartLoading && !cart ? (
					<Stack className="cart-state">
						<CircularProgress color="primary" />
					</Stack>
				) : getMyCartError ? (
					<Alert severity="error">Cart could not be loaded.</Alert>
				) : cartItems.length === 0 ? (
					<Stack className="cart-state">
						<ShoppingBagOutlinedIcon />
						<Typography component="h2">Your cart is empty</Typography>
						<Typography>Explore our products and find something your pet will love.</Typography>
						<Button component={Link} href="/product" variant="contained">
							Continue shopping
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
												alt={product?.productName ?? 'Pet product'}
												fill
												sizes="120px"
												unoptimized
											/>
										</Link>

										<Stack className="cart-item__info">
											<Typography component={Link} href={`/product/detail?id=${cartItem.productId}`}>
												{product?.productName ?? 'Unavailable product'}
											</Typography>
											<Typography>{variantName || cartItem.sku}</Typography>
											<Chip
												label={cartItem.available ? 'In stock' : 'Unavailable'}
												color={cartItem.available ? 'success' : 'error'}
												size="small"
											/>
										</Stack>

										<Stack direction="row" className="cart-item__quantity">
											<IconButton
												onClick={() => updateCartItemHandler(cartItem, cartItem.quantity - 1)}
												disabled={cartItem.quantity === 1 || isCartUpdating}
												aria-label="Decrease quantity"
											>
												<RemoveRoundedIcon />
											</IconButton>
											<Typography>{cartItem.quantity}</Typography>
											<IconButton
												onClick={() => updateCartItemHandler(cartItem, cartItem.quantity + 1)}
												disabled={!cartItem.available || cartItem.quantity >= (variant?.stock ?? 0) || isCartUpdating}
												aria-label="Increase quantity"
											>
												<AddRoundedIcon />
											</IconButton>
										</Stack>

										<Stack className="cart-item__price">
											<Typography component="strong">₩{formatterStr(cartItem.subtotal)}</Typography>
											<Typography>₩{formatterStr(cartItem.unitPrice)} each</Typography>
										</Stack>

										<IconButton
											className="cart-item__remove"
											onClick={() => removeCartItemHandler(cartItem)}
											disabled={isCartUpdating}
											aria-label={`Remove ${product?.productName ?? 'product'} from cart`}
										>
											<DeleteOutlineRoundedIcon />
										</IconButton>
									</Box>
								);
							})}
						</Stack>

						<Stack className="cart-summary">
							<Typography component="h2">Order Summary</Typography>
							<Stack direction="row">
								<Typography>Items ({cart?.totalQuantity ?? 0})</Typography>
								<Typography>₩{formatterStr(cart?.totalAmount ?? 0)}</Typography>
							</Stack>
							<Stack direction="row">
								<Typography>Shipping</Typography>
								<Typography className="cart-summary__free">Free</Typography>
							</Stack>
							<Divider />
							<Stack direction="row" className="cart-summary__total">
								<Typography>Total</Typography>
								<Typography>₩{formatterStr(cart?.totalAmount ?? 0)}</Typography>
							</Stack>
							{hasUnavailableItems && (
								<Alert severity="warning">Remove unavailable products before checkout.</Alert>
							)}
							<Button
								component={Link}
								href="/checkout"
								variant="contained"
								disabled={hasUnavailableItems || isCartUpdating}
							>
								Proceed to checkout
							</Button>
							<Button component={Link} href="/product" variant="outlined">
								Continue shopping
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
