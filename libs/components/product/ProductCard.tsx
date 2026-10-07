import { useReactiveVar } from '@apollo/client';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { CustomJwtPayload } from '../../types/customJwtPayload';
import { Product } from '../../types/product/product';
import { formatterStr } from '../../utils';

interface ProductCardType {
	product: Product;
	showFavorite?: boolean;
	likeTargetProduct?: (user: CustomJwtPayload | null, productId: string) => Promise<void>;
}

const ProductCard = (props: ProductCardType) => {
	const { product, showFavorite = true, likeTargetProduct } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);

	/** COMPUTED VALUES **/
	const isFavorite = Boolean(product.meLiked?.[0]?.myFavorite);
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
				{showFavorite && likeTargetProduct && (
					<IconButton className={`product-card__favorite ${isFavorite ? 'active' : ''}`} onClick={() => void likeTargetProduct(user, product._id)} aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
						{isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
					</IconButton>
				)}
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
				{showFavorite && likeTargetProduct && (
					<IconButton className={`product-card__favorite ${isFavorite ? 'active' : ''}`} onClick={() => void likeTargetProduct(user, product._id)} aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
						{isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
					</IconButton>
				)}
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
