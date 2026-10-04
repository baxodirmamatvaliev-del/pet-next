import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
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
		<article className="product-card">
		<Link href={{ pathname: '/product/detail', query: { id: product._id } }} className="product-card__image">
			<Image src={imagePath} alt={product.productName} fill sizes="(max-width: 760px) 50vw, 240px" unoptimized />
		</Link>
		<button type="button" className="product-card__favorite" aria-label={`Add ${product.productName} to favorites`}>
			<FavoriteBorderRoundedIcon />
		</button>
		<div className="product-card__content">
			<Link href={{ pathname: '/product/detail', query: { id: product._id } }}>
				<h3>{product.productName}</h3>
			</Link>
			<strong>₩{priceFormatter.format(price)}</strong>
			<p><span>★</span> {product.productRating.toFixed(1)} ({product.productReviews})</p>
		</div>
	</article>
	);
};

export default ProductCard;
