import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

import { REACT_APP_API_URL } from '../../config';
import { Product } from '../../types/product/product';
import { formatterStr } from '../../utils';

interface ProductCardType {
	product: Product;
	favoriteHandler?: (productId: string) => void;
}

const ProductCard = (props: ProductCardType) => {
	const { product, favoriteHandler } = props;
	const imagePath = product.productImages[0]
		? `${REACT_APP_API_URL}/${product.productImages[0]}`
		: '/img/banner/home-hero.png';
	const productPrice = product.productVariants.length
		? Math.min(...product.productVariants.map((variant) => variant.price))
		: 0;

	/** HANDLERS **/
	const favoriteClickHandler = () => {
		if (favoriteHandler) favoriteHandler(product._id);
	};

	return (
		<Stack component="article" className="product-card">
			<Box
				component={Link}
				href={{ pathname: '/product/detail', query: { id: product._id } }}
				className="product-card__image"
			>
				<Image src={imagePath} alt={product.productName} fill sizes="(max-width: 760px) 50vw, 240px" unoptimized />
			</Box>
			<IconButton
				className="product-card__favorite"
				disabled={!favoriteHandler}
				onClick={favoriteClickHandler}
				aria-label={`Add ${product.productName} to favorites`}
			>
				<FavoriteBorderRoundedIcon />
			</IconButton>
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
};

export default ProductCard;
