import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

import { REACT_APP_API_URL } from '../../config';
import { Product } from '../../types/product/product';

interface ProductCardProps {
	product: Product;
}

const priceFormatter = new Intl.NumberFormat('ko-KR');

const ProductCard = ({ product }: ProductCardProps) => {
	const imagePath = product.productImages[0]
		? `${REACT_APP_API_URL}/${product.productImages[0]}`
		: '/img/banner/home-hero.png';
	const price = product.productVariants.length
		? Math.min(...product.productVariants.map((variant) => variant.price))
		: 0;

	return (
		<Stack component="article" className="product-card">
			<Box
				component={Link}
				href={{ pathname: '/product/detail', query: { id: product._id } }}
				className="product-card__image"
			>
				<Image src={imagePath} alt={product.productName} fill sizes="(max-width: 760px) 50vw, 240px" unoptimized />
			</Box>
			<IconButton className="product-card__favorite" aria-label={`Add ${product.productName} to favorites`}>
			<FavoriteBorderRoundedIcon />
			</IconButton>
			<Stack className="product-card__content">
				<Box component={Link} href={{ pathname: '/product/detail', query: { id: product._id } }}>
					<Typography component="h3">{product.productName}</Typography>
				</Box>
				<Typography component="strong">₩{priceFormatter.format(price)}</Typography>
				<Typography><Box component="span">★</Box> {product.productRating.toFixed(1)} ({product.productReviews})</Typography>
			</Stack>
		</Stack>
	);
};

export default ProductCard;
