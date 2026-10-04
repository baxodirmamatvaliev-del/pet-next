import { useQuery } from '@apollo/client';
import { Box, FormControl, MenuItem, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { GET_PRODUCTS } from '../../apollo/user/query';
import withLayoutHome from '../../libs/components/layout/LayoutHome';
import Filter from '../../libs/components/product/Filter';
import ProductCard from '../../libs/components/product/ProductCard';
import { Direction } from '../../libs/enums/common.enum';
import { ProductCategory } from '../../libs/enums/product.enum';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { Products } from '../../libs/types/product/product';

interface GetProductsData {
	getProducts: Products;
}

const initialInput: ProductsInquiry = {
	page: 1,
	limit: 12,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const ProductList: NextPage = () => {
	const router = useRouter();
	const searchFilter = useMemo<ProductsInquiry>(() => {
		if (typeof router.query.input === 'string') {
			try {
				return JSON.parse(router.query.input) as ProductsInquiry;
			} catch {
				return initialInput;
			}
		}

		const category = Object.values(ProductCategory).find((item) => item === router.query.category);
		const sort = typeof router.query.sort === 'string' ? router.query.sort : initialInput.sort;

		return {
			...initialInput,
			sort,
			search: category ? { categoryList: [category] } : {},
		};
	}, [router.query.category, router.query.input, router.query.sort]);
	const { data, loading, error } = useQuery<GetProductsData, { input: ProductsInquiry }>(GET_PRODUCTS, {
		variables: { input: searchFilter },
		fetchPolicy: 'cache-and-network',
	});
	const products = data?.getProducts.list ?? [];
	const total = data?.getProducts.metaCounter[0]?.total ?? 0;

	const changeSearch = (search: ProductsInquiry['search']) => {
		const input = { ...searchFilter, page: 1, search };
		void router.push({ pathname: '/product', query: { input: JSON.stringify(input) } }, undefined, { scroll: false });
	};

	const changeSort = (event: SelectChangeEvent) => {
		const input = { ...searchFilter, page: 1, sort: event.target.value };
		void router.push({ pathname: '/product', query: { input: JSON.stringify(input) } }, undefined, { scroll: false });
	};

	return (
		<Box component="main" className="product-list-page container">
			<Stack direction="row" className="product-list-page__heading">
				<Box>
					<Typography>Home / Shop</Typography>
					<Typography component="h1">All Pet Products</Typography>
				</Box>
				<Stack direction="row" component="label">
					<Typography component="span">Sort by</Typography>
					<FormControl size="small">
						<Select value={searchFilter.sort} onChange={changeSort}>
							<MenuItem value="createdAt">Newest</MenuItem>
							<MenuItem value="productSold">Best selling</MenuItem>
							<MenuItem value="productRating">Highest rated</MenuItem>
							<MenuItem value="productName">Product name</MenuItem>
						</Select>
					</FormControl>
				</Stack>
			</Stack>

			<Box className="product-catalog">
				<Filter search={searchFilter.search} onChange={changeSearch} />
				<Box component="section" className="product-results" aria-live="polite">
					<Typography className="product-results__count">{total} products</Typography>
					{loading && !products.length ? (
						<Typography className="product-results__message">Loading products...</Typography>
					) : error ? (
						<Typography className="product-results__message product-results__message--error">Products could not be loaded.</Typography>
					) : products.length ? (
						<Box className="product-results__grid">
							{products.map((product) => <ProductCard product={product} key={product._id} />)}
						</Box>
					) : (
						<Typography className="product-results__message">No products match your filters.</Typography>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default withLayoutHome(ProductList);
