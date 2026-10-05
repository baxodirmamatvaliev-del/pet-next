import { Box, Chip, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

import { REACT_APP_API_URL } from '../../config';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Product } from '../../types/product/product';
import { formatterStr } from '../../utils';

interface ProductCardType {
	product: Product;
}

const ProductCard = (props: ProductCardType) => {
	const { product } = props;
	const device = useDeviceDetect();
	const imagePath = product.productImages[0]
		? `${REACT_APP_API_URL}/${product.productImages[0]}`
		: '/img/banner/home-hero.png';
	const productPrice = product.productVariants.length
		? Math.min(...product.productVariants.map((variant) => variant.price))
		: 0;
	const isSoldOut = !product.productVariants.some((variant) => variant.stock > 0);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="article" className="product-card product-card--mobile">
				<Box component={Link} href={{ pathname: '/product/detail', query: { id: product._id } }} className="product-card__image">
					<Image src={imagePath} alt={product.productName} fill sizes="50vw" unoptimized />
				</Box>
				{isSoldOut && <Chip className="product-card__stock" label="Sold out" size="small" />}
				<Stack className="product-card__content">
					<Box component={Link} href={{ pathname: '/product/detail', query: { id: product._id } }}>
						<Typography component="h3">{product.productName}</Typography>
					</Box>
					<Typography component="strong">₩{formatterStr(productPrice)}</Typography>
					<Typography><Box component="span">★</Box> {product.productRating.toFixed(1)} ({product.productReviews})</Typography>
				</Stack>
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack component="article" className="product-card product-card--pc">
				<Box
					component={Link}
					href={{ pathname: '/product/detail', query: { id: product._id } }}
					className="product-card__image"
				>
					<Image src={imagePath} alt={product.productName} fill sizes="240px" unoptimized />
				</Box>
				{isSoldOut && <Chip className="product-card__stock" label="Sold out" size="small" />}
				<Stack className="product-card__content">
					<Box component={Link} href={{ pathname: '/product/detail', query: { id: product._id } }}>
						<Typography component="h3">{product.productName}</Typography>
					</Box>
					<Typography component="strong">₩{formatterStr(productPrice)}</Typography>
					<Typography>
						<Box component="span">★</Box> {product.productRating.toFixed(1)} ({product.productReviews})
					</Typography>
				</Stack>
			</Stack>
		);
	}
};

export default ProductCard;
