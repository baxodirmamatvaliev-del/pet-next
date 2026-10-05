import { useState } from 'react';
import { useQuery } from '@apollo/client';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { T } from '../../types/common';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ProductCard from '../product/ProductCard';

interface BestSellersProps {
	initialInput?: ProductsInquiry;
}

const BestSellers = (props: BestSellersProps) => {
	const { initialInput = BestSellers.defaultProps.initialInput } = props;
	const device = useDeviceDetect();

	/** STATES **/
	const [products, setProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: getProductsLoading,
		error: getProductsError,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProducts?.list) setProducts(data.getProducts.list);
		},
	});

	/** COMPUTED VALUES **/
	const productContent = getProductsLoading && !products.length ? (
		<Typography className="product-message">Loading products...</Typography>
	) : getProductsError ? (
		<Typography className="product-message product-message--error">Products could not be loaded.</Typography>
	) : products.length ? (
		<Box className={`product-grid product-grid--${device}`}>
			{products.map((product) => <ProductCard product={product} key={product._id} />)}
		</Box>
	) : (
		<Typography className="product-message">No products available yet.</Typography>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="section" className="best-sellers best-sellers--mobile container">
				<Stack direction="row" className="section-heading">
					<Box>
						<Typography component="span">Customer favorites</Typography>
						<Typography component="h2">Best Sellers</Typography>
					</Box>
					<Stack direction="row" component={Link} href="/product?sort=productSold">
						View all <ArrowForwardRoundedIcon />
					</Stack>
				</Stack>
				{productContent}
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack component="section" className="best-sellers best-sellers--pc container">
				<Stack direction="row" className="section-heading">
					<Box>
						<Typography component="span">Customer favorites</Typography>
						<Typography component="h2">Best Sellers</Typography>
					</Box>
					<Stack direction="row" component={Link} href="/product?sort=productSold">
						View all <ArrowForwardRoundedIcon />
					</Stack>
				</Stack>
				{productContent}
			</Stack>
		);
	}
};

BestSellers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'productSold',
		direction: Direction.DESC,
		search: {},
	},
};

export default BestSellers;
