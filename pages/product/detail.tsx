import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { GET_PRODUCT } from '../../apollo/user/query';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { REACT_APP_API_URL } from '../../libs/config';
import { T } from '../../libs/types/common';
import { Product } from '../../libs/types/product/product';
import { formatterStr } from '../../libs/utils';

const ProductDetail: NextPage = () => {
	const router = useRouter();
	const productId = typeof router.query.id === 'string' ? router.query.id : '';

	/** STATES **/
	const [product, setProduct] = useState<Product | null>(null);
	const [slideImage, setSlideImage] = useState('');
	const [selectedSku, setSelectedSku] = useState('');

	/** APOLLO REQUESTS **/
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
	};

	/** COMPUTED VALUES **/
	const activeVariant = product?.productVariants.find((variant) => variant.sku === selectedSku)
		?? product?.productVariants[0];
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

	/** RENDER **/
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

					{product.productDesc && (
						<Box className="product-detail__description">
							<Typography component="strong">Product information</Typography>
							<Typography>{product.productDesc}</Typography>
						</Box>
					)}
				</Stack>
			</Box>
		</Box>
	);
};

export default withLayoutFull(ProductDetail);
