import React, { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { cartCountVar, userVar } from '../../apollo/store';
import { ADD_TO_CART } from '../../apollo/user/mutation';
import { GET_PRODUCT } from '../../apollo/user/query';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { REACT_APP_API_URL } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { AddToCartInput } from '../../libs/types/cart/cart.input';
import { T } from '../../libs/types/common';
import { Product } from '../../libs/types/product/product';
import { formatterStr } from '../../libs/utils';

const ProductDetail: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const productId = typeof router.query.id === 'string' ? router.query.id : '';

	/** STATES **/
	const [product, setProduct] = useState<Product | null>(null);
	const [slideImage, setSlideImage] = useState('');
	const [selectedSku, setSelectedSku] = useState('');
	const [quantity, setQuantity] = useState(1);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [addToCart, { loading: addToCartLoading }] = useMutation(ADD_TO_CART, {
		onCompleted: (data: T) => {
			if (data?.addToCart) cartCountVar(data.addToCart.totalQuantity);
		},
	});
	const {
		loading: getProductLoading,
		error: getProductError,
	} = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { productId },
		skip: !productId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProduct) {
				setProduct(data.getProduct);
				setSlideImage(data.getProduct.productImages[0] ?? '');
			}
		},
	});

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const variantSelectHandler = (sku: string) => {
		setSelectedSku(sku);
		setQuantity(1);
	};

	const decreaseQuantityHandler = () => {
		if (quantity > 1) setQuantity(quantity - 1);
	};

	const increaseQuantityHandler = (stock: number) => {
		if (quantity < stock) setQuantity(quantity + 1);
	};

	const addToCartHandler = async () => {
		try {
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			if (!product || !activeVariant?.sku) return;

			const input: AddToCartInput = {
				productId: product._id,
				sku: activeVariant.sku,
				quantity,
			};

			await addToCart({ variables: { input } });
			await sweetTopSmallSuccessAlert('Added to cart', 800);
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	/** COMPUTED VALUES **/
	const activeVariant = product?.productVariants.find((variant) => variant.sku === selectedSku)
		?? product?.productVariants[0];
	const isOutOfStock = !activeVariant || activeVariant.stock < 1;
	const imagePath = slideImage
		? `${REACT_APP_API_URL}/${slideImage}`
		: '/img/banner/home-hero.png';

	if (!router.isReady || !productId || (getProductLoading && !product)) {
		return (
			<Stack className="product-detail-state">
				<CircularProgress color="primary" />
			</Stack>
		);
	}

	if (getProductError || !product) {
		return (
			<Box className="product-detail-state container">
				<Alert severity="error">Product could not be loaded.</Alert>
			</Box>
		);
	}

	/** RENDER MOBILE **/
	if (device === 'mobile') {
		return (
			<Box component="main" className="product-detail-page product-detail-page--mobile container">
				<Typography className="product-detail-page__breadcrumb">
					<Link href="/">Home</Link> / <Link href="/product">Shop</Link> / {product.productName}
				</Typography>

				<Box className="product-detail product-detail--mobile">
					<Box className="product-gallery">
						<Box className="product-gallery__main">
							<Image src={imagePath} alt={product.productName} fill sizes="100vw" priority unoptimized />
						</Box>
						<Stack className="product-gallery__thumbs">
							{product.productImages.map((image) => (
								<Button
									className={image === slideImage ? 'active' : ''}
									onClick={() => changeImageHandler(image)}
									key={image}
								>
									<Image src={`${REACT_APP_API_URL}/${image}`} alt="" fill sizes="68px" unoptimized />
								</Button>
							))}
						</Stack>
					</Box>

					<Stack className="product-detail__info">
						<Typography className="product-detail__category">
							{product.productCategory} / {product.productType}
						</Typography>
						<Typography component="h1">{product.productName}</Typography>
						<Typography className="product-detail__rating">
							<Box component="span">★</Box> {product.productRating.toFixed(1)} ({product.productReviews} reviews)
						</Typography>
						<Typography component="strong" className="product-detail__price">
							₩{formatterStr(activeVariant?.price ?? 0)}
						</Typography>
						<Box className="product-variants">
							<Typography component="strong">Choose an option</Typography>
							<Stack direction="row">
								{product.productVariants.map((variant) => (
									<Button
										variant={variant.sku === activeVariant?.sku ? 'contained' : 'outlined'}
										onClick={() => variantSelectHandler(variant.sku)}
										key={variant.sku}
									>
										{[variant.color, variant.size].filter(Boolean).join(' / ') || variant.sku}
									</Button>
								))}
							</Stack>
							<Typography>{activeVariant?.stock ?? 0} items in stock</Typography>
						</Box>
						<Stack direction="row" className="product-detail__cart-action">
							<Stack direction="row" className="product-detail__quantity">
								<IconButton onClick={decreaseQuantityHandler} disabled={quantity === 1 || isOutOfStock} aria-label="Decrease quantity">
									<RemoveRoundedIcon />
								</IconButton>
								<Typography>{quantity}</Typography>
								<IconButton onClick={() => increaseQuantityHandler(activeVariant?.stock ?? 0)} disabled={quantity >= (activeVariant?.stock ?? 0)} aria-label="Increase quantity">
									<AddRoundedIcon />
								</IconButton>
							</Stack>
							<Button variant="contained" startIcon={<ShoppingBagOutlinedIcon />} onClick={addToCartHandler} disabled={isOutOfStock || addToCartLoading}>
								{addToCartLoading ? 'Adding...' : 'Add to cart'}
							</Button>
						</Stack>
						{product.productDesc && (
							<Box className="product-detail__description">
								<Typography component="strong">Product information</Typography>
								<Typography>{product.productDesc}</Typography>
							</Box>
						)}
						{user?.sub === product.memberId && (
							<Button component={Link} href={`/product/edit?id=${product._id}`} variant="outlined" className="product-detail__edit">
								Edit product
							</Button>
						)}
					</Stack>
				</Box>
			</Box>
		);
	} else {
		/** RENDER PC **/
		return (
			<Box component="main" className="product-detail-page container">
				<Typography className="product-detail-page__breadcrumb">
					<Link href="/">Home</Link> / <Link href="/product">Shop</Link> / {product.productName}
				</Typography>

				<Box className="product-detail">
					<Box className="product-gallery">
						<Stack className="product-gallery__thumbs">
							{product.productImages.map((image) => (
								<Button
									className={image === slideImage ? 'active' : ''}
									onClick={() => changeImageHandler(image)}
									key={image}
								>
									<Image src={`${REACT_APP_API_URL}/${image}`} alt="" fill sizes="80px" unoptimized />
								</Button>
							))}
						</Stack>

						<Box className="product-gallery__main">
							<Image
								src={imagePath}
								alt={product.productName}
								fill
								sizes="(max-width: 760px) 100vw, 620px"
								priority
								unoptimized
							/>
						</Box>
					</Box>

					<Stack className="product-detail__info">
						<Typography className="product-detail__category">
							{product.productCategory} / {product.productType}
						</Typography>
						<Typography component="h1">{product.productName}</Typography>
						<Typography className="product-detail__rating">
							<Box component="span">★</Box> {product.productRating.toFixed(1)} ({product.productReviews} reviews)
						</Typography>
						<Typography component="strong" className="product-detail__price">
							₩{formatterStr(activeVariant?.price ?? 0)}
						</Typography>

						<Stack className="product-detail__benefits">
							<Stack direction="row">
								<LocalShippingOutlinedIcon />
								<Typography>Free delivery on orders over ₩30,000</Typography>
							</Stack>
							<Stack direction="row">
								<ReplayRoundedIcon />
								<Typography>30-day easy returns</Typography>
							</Stack>
							<Stack direction="row">
								<VerifiedUserOutlinedIcon />
								<Typography>Secure checkout</Typography>
							</Stack>
						</Stack>

						<Box className="product-variants">
							<Typography component="strong">Choose an option</Typography>
							<Stack direction="row">
								{product.productVariants.map((variant) => (
									<Button
										variant={variant.sku === activeVariant?.sku ? 'contained' : 'outlined'}
										onClick={() => variantSelectHandler(variant.sku)}
										key={variant.sku}
									>
										{[variant.color, variant.size].filter(Boolean).join(' / ') || variant.sku}
									</Button>
								))}
							</Stack>
							<Typography>{activeVariant?.stock ?? 0} items in stock</Typography>
						</Box>

						<Stack direction="row" className="product-detail__cart-action">
							<Stack direction="row" className="product-detail__quantity">
								<IconButton
									onClick={decreaseQuantityHandler}
									disabled={quantity === 1 || isOutOfStock}
									aria-label="Decrease quantity"
								>
									<RemoveRoundedIcon />
								</IconButton>
								<Typography>{quantity}</Typography>
								<IconButton
									onClick={() => increaseQuantityHandler(activeVariant?.stock ?? 0)}
									disabled={quantity >= (activeVariant?.stock ?? 0)}
									aria-label="Increase quantity"
								>
									<AddRoundedIcon />
								</IconButton>
							</Stack>
							<Button
								variant="contained"
								startIcon={<ShoppingBagOutlinedIcon />}
								onClick={addToCartHandler}
								disabled={isOutOfStock || addToCartLoading}
							>
								{addToCartLoading ? 'Adding...' : 'Add to cart'}
							</Button>
						</Stack>

						{product.productDesc && (
							<Box className="product-detail__description">
								<Typography component="strong">Product information</Typography>
								<Typography>{product.productDesc}</Typography>
							</Box>
						)}
						{user?.sub === product.memberId && (
							<Button component={Link} href={`/product/edit?id=${product._id}`} variant="outlined" className="product-detail__edit">
								Edit product
							</Button>
						)}
					</Stack>
				</Box>
			</Box>
		);
	}
};

export default withLayoutFull(ProductDetail);
