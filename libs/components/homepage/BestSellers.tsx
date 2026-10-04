import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useQuery } from '@apollo/client';
import Link from 'next/link';

import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { Products } from '../../types/product/product';
import ProductCard from '../product/ProductCard';

interface GetProductsData {
	getProducts: Products;
}

const input: ProductsInquiry = {
	page: 1,
	limit: 5,
	sort: 'productSold',
	direction: Direction.DESC,
	search: {},
};

const BestSellers = () => {
	const { data, loading, error } = useQuery<GetProductsData, { input: ProductsInquiry }>(GET_PRODUCTS, {
		variables: { input },
		fetchPolicy: 'cache-and-network',
	});
	const products = data?.getProducts.list ?? [];

	return (
		<section className="best-sellers container">
			<div className="section-heading">
				<div>
					<span>Customer favorites</span>
					<h2>Best Sellers</h2>
				</div>
				<Link href="/product?sort=productSold">
					View all <ArrowForwardRoundedIcon />
				</Link>
			</div>

			{loading && !products.length ? (
				<p className="product-message">Loading products...</p>
			) : error ? (
				<p className="product-message product-message--error">Products could not be loaded.</p>
			) : products.length ? (
				<div className="product-grid">
					{products.map((product) => <ProductCard product={product} key={product._id} />)}
				</div>
			) : (
				<p className="product-message">No products available yet.</p>
			)}
		</section>
	);
};

export default BestSellers;
