import { ChangeEvent, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
	Box,
	FormControl,
	MenuItem,
	Pagination,
	Select,
	SelectChangeEvent,
	Stack,
	Typography,
} from '@mui/material';
import { useRouter } from 'next/router';

import { GET_PRODUCTS } from '../../apollo/user/query';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/product/Filter';
import ProductCard from '../../libs/components/product/ProductCard';
import { Direction } from '../../libs/enums/common.enum';
import { ProductCategory } from '../../libs/enums/product.enum';
import { T } from '../../libs/types/common';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { Product } from '../../libs/types/product/product';

interface ProductListProps {
	initialInput?: ProductsInquiry;
}

const ProductList = (props: ProductListProps) => {
	const { initialInput = ProductList.defaultProps.initialInput } = props;
	const router = useRouter();

	/** STATES **/
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState(0);

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
		const text = typeof router.query.text === 'string' ? router.query.text.trim() : '';

		return {
			...initialInput,
			sort,
			search: {
				categoryList: category ? [category] : undefined,
				text: text || undefined,
			},
		};
	}, [initialInput, router.query.category, router.query.input, router.query.sort, router.query.text]);

	/** APOLLO REQUESTS **/
	const {
		loading: getProductsLoading,
		error: getProductsError,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProducts?.list) setProducts(data.getProducts.list);
			setTotal(data?.getProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const updateSearchFilterHandler = (input: ProductsInquiry) => {
		void router.push(
			{ pathname: '/product', query: { input: JSON.stringify(input) } },
			undefined,
			{ scroll: false },
		);
	};

	const sortingHandler = (event: SelectChangeEvent) => {
		const input = { ...searchFilter, page: 1, sort: event.target.value };
		updateSearchFilterHandler(input);
	};

	const paginationChangeHandler = (_event: ChangeEvent<unknown>, page: number) => {
		const input = { ...searchFilter, page };
		updateSearchFilterHandler(input);
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / searchFilter.limit);

	/** RENDER **/
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
						<Select value={searchFilter.sort} onChange={sortingHandler}>
							<MenuItem value="createdAt">Newest</MenuItem>
							<MenuItem value="productSold">Best selling</MenuItem>
							<MenuItem value="productRating">Highest rated</MenuItem>
							<MenuItem value="productName">Product name</MenuItem>
						</Select>
					</FormControl>
				</Stack>
			</Stack>

			<Box className="product-catalog">
				<Filter
					key={searchFilter.search.text ?? 'empty-search'}
					searchFilter={searchFilter}
					updateSearchFilter={updateSearchFilterHandler}
					initialInput={initialInput}
				/>
				<Box component="section" className="product-results" aria-live="polite">
					<Typography className="product-results__count">{total} products</Typography>
					{getProductsLoading && !products.length ? (
						<Typography className="product-results__message">Loading products...</Typography>
					) : getProductsError ? (
						<Typography className="product-results__message product-results__message--error">
							Products could not be loaded.
						</Typography>
					) : products.length ? (
						<Box className="product-results__grid">
							{products.map((product) => <ProductCard product={product} key={product._id} />)}
						</Box>
					) : (
						<Typography className="product-results__message">No products match your filters.</Typography>
					)}
					{products.length > 0 && totalPages > 0 && (
						<Stack direction="row" className="product-pagination">
							<Pagination
								page={searchFilter.page}
								count={totalPages}
								onChange={paginationChangeHandler}
								color="primary"
								shape="rounded"
							/>
							<Typography>{total} products available</Typography>
						</Stack>
					)}
				</Box>
			</Box>
		</Box>
	);
};

ProductList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 12,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default withLayoutBasic(ProductList);
