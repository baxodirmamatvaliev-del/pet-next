import { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { userVar } from '../../../apollo/store';
import { REMOVE_PRODUCT, UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { GET_MY_PRODUCTS } from '../../../apollo/user/query';
import { Direction, Message } from '../../enums/common.enum';
import { ProductStatus } from '../../enums/product.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Product } from '../../types/product/product';
import { MyProductsInquiry, ProductUpdateInput } from '../../types/product/product.input';
import MyProductCard from './MyProductCard';

interface MyProductsProps {
	initialInput?: MyProductsInquiry;
}

const MyProducts = (props: MyProductsProps) => {
	const { initialInput = MyProducts.defaultProps.initialInput } = props;
	const device = useDeviceDetect();

	/** STATES **/
	const [searchFilter, setSearchFilter] = useState<MyProductsInquiry>(initialInput);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState(0);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [updateProduct, { loading: updateProductLoading }] = useMutation(UPDATE_PRODUCT);
	const [removeProduct, { loading: removeProductLoading }] = useMutation(REMOVE_PRODUCT);
	
	const {
		loading: getMyProductsLoading,
		error: getMyProductsError,
		refetch: getMyProductsRefetch,
	} = useQuery(GET_MY_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !user?.sub,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getMyProducts?.list ?? []);
			setTotal(data?.getMyProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const changeStatusHandler = (productStatus?: ProductStatus) => {
		setSearchFilter({ ...searchFilter, page: 1, search: { productStatus } });
	};

	const paginationHandler = (_event: ChangeEvent<unknown>, page: number) => {
		setSearchFilter({ ...searchFilter, page });
	};

	const updateProductStatusHandler = async (product: Product, productStatus: ProductStatus) => {
		try {
			const action = productStatus === ProductStatus.HIDDEN ? 'hide' : 'show';
			if (!await sweetConfirmAlert(`Are you sure you want to ${action} this product?`)) return;

			const input: ProductUpdateInput = { _id: product._id, productStatus };
			await updateProduct({ variables: { input } });
			await getMyProductsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('Product updated', 800);
		} catch (error) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	const removeProductHandler = async (product: Product) => {
		try {
			if (!await sweetConfirmAlert('Are you sure you want to remove this product?')) return;

			await removeProduct({ variables: { productId: product._id } });
			await getMyProductsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('Product removed', 800);
		} catch (error) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / searchFilter.limit);
	const selectedStatus = searchFilter.search.productStatus;
	const isActionLoading = updateProductLoading || removeProductLoading;
	const productsContent = getMyProductsLoading && !products.length ? (
		<Stack className="my-products__state"><CircularProgress color="primary" /></Stack>
	) : getMyProductsError ? (
		<Alert severity="error">Your products could not be loaded.</Alert>
	) : products.length ? (
		<>
			<Stack className="my-products__list">
				{products.map((product) => (
					<MyProductCard
						product={product}
						loading={isActionLoading}
						updateProductStatusHandler={updateProductStatusHandler}
						removeProductHandler={removeProductHandler}
						key={product._id}
					/>
				))}
			</Stack>
			{totalPages > 1 && (
			<Stack direction="row" className="my-products__pagination">
				<Pagination page={searchFilter.page} count={totalPages} onChange={paginationHandler} color="primary" shape="rounded" />
				<Typography>{total} products</Typography>
			</Stack>
			)}
		</>
	) : (
		<Stack className="my-products__state">
			<Typography component="h2">No products found</Typography>
			<Typography>Your products will appear here after you create one.</Typography>
			<Button component={Link} href="/product/create" variant="outlined">Create a product</Button>
		</Stack>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Box className="my-products my-products--mobile">
				<Stack className="my-products__heading">
					<Typography component="h1">My Products</Typography>
					<Typography>Manage your product listings and stock.</Typography>
					<Button component={Link} href="/product/create" variant="contained">Create product</Button>
				</Stack>
				<Stack direction="row" className="my-products__tabs">
					<Button className={!selectedStatus ? 'active' : ''} onClick={() => changeStatusHandler()}>All</Button>
					<Button className={selectedStatus === ProductStatus.ACTIVE ? 'active' : ''} onClick={() => changeStatusHandler(ProductStatus.ACTIVE)}>Active</Button>
					<Button className={selectedStatus === ProductStatus.HIDDEN ? 'active' : ''} onClick={() => changeStatusHandler(ProductStatus.HIDDEN)}>Hidden</Button>
				</Stack>
				{productsContent}
			</Box>
		);
	} else {
		/** RENDER PC **/
		return (
			<Box className="my-products">
				<Stack direction="row" className="my-products__heading">
					<Box>
						<Typography component="h1">My Products</Typography>
						<Typography>Manage your product listings and stock.</Typography>
					</Box>
					<Button component={Link} href="/product/create" variant="contained">Create product</Button>
				</Stack>
				<Stack direction="row" className="my-products__tabs">
					<Button className={!selectedStatus ? 'active' : ''} onClick={() => changeStatusHandler()}>All products</Button>
					<Button className={selectedStatus === ProductStatus.ACTIVE ? 'active' : ''} onClick={() => changeStatusHandler(ProductStatus.ACTIVE)}>Active</Button>
					<Button className={selectedStatus === ProductStatus.HIDDEN ? 'active' : ''} onClick={() => changeStatusHandler(ProductStatus.HIDDEN)}>Hidden</Button>
				</Stack>
				{productsContent}
			</Box>
		);
	}
};

MyProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default MyProducts;
