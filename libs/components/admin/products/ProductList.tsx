import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Alert, Avatar, Button, CircularProgress, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';

import { UPDATE_PRODUCT_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../../apollo/admin/query';
import { REACT_APP_API_URL } from '../../../config';
import { Direction, Message } from '../../../enums/common.enum';
import { ProductStatus } from '../../../enums/product.enum';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { T } from '../../../types/common';
import { Product } from '../../../types/product/product';
import { AdminProductsInquiry } from '../../../types/product/product.input';
import { formatterStr } from '../../../utils';

const initialInquiry: AdminProductsInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const ProductList = () => {
	/** STATES **/
	const [inquiry, setInquiry] = useState<AdminProductsInquiry>(initialInquiry);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState(0);

	/** APOLLO REQUESTS **/
	const [updateProductByAdmin, { loading: updateProductLoading }] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
	const {
		loading: getAllProductsByAdminLoading,
		error: getAllProductsByAdminError,
		refetch: getAllProductsByAdminRefetch,
	} = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getAllProductsByAdmin?.list ?? []);
			setTotal(data?.getAllProductsByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const statusFilterHandler = (value: string) => {
		setInquiry({ ...inquiry, page: 1, search: { productStatus: value ? value as ProductStatus : undefined } });
	};

	const updateProductStatusHandler = async (product: Product, productStatus: ProductStatus) => {
		try {
			if (!await sweetConfirmAlert(`Change ${product.productName} to ${productStatus.toLowerCase()}?`)) return;
			await updateProductByAdmin({ variables: { input: { _id: product._id, productStatus } } });
			await getAllProductsByAdminRefetch({ input: inquiry });
			await sweetTopSmallSuccessAlert('Product updated', 800);
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG);
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / inquiry.limit);

	return (
		<Stack className="admin-list">
			<Stack direction="row" className="admin-list__heading">
				<Stack><Typography component="h1">Products</Typography><Typography>Review and manage catalog visibility.</Typography></Stack>
				<TextField select size="small" label="Status" value={inquiry.search.productStatus ?? ''} onChange={(event) => statusFilterHandler(event.target.value)}>
					<MenuItem value="">All</MenuItem>
					{Object.values(ProductStatus).map((status) => <MenuItem value={status} key={status}>{status}</MenuItem>)}
				</TextField>
			</Stack>
			{getAllProductsByAdminError ? <Alert severity="error">Products could not be loaded.</Alert> : getAllProductsByAdminLoading && !products.length ? <CircularProgress /> : products.length ? (
				<>
					<Stack className="admin-list__items">
						{products.map((product) => (
							<Stack direction="row" className="admin-list__item" key={product._id}>
								<Avatar variant="rounded" src={product.productImages[0] ? `${REACT_APP_API_URL}/${product.productImages[0]}` : undefined} alt={product.productName} />
								<Stack className="admin-list__details">
									<Typography component="strong">{product.productName}</Typography>
									<Typography>{product.productCategory} · {product.productType} · ₩{formatterStr(product.productVariants[0]?.price ?? 0)}</Typography>
									<Typography>Owner: {product.memberId}</Typography>
								</Stack>
								<Typography className={`admin-list__status admin-list__status--${product.productStatus.toLowerCase()}`}>{product.productStatus}</Typography>
								<Stack direction="row" className="admin-list__actions">
									{product.productStatus !== ProductStatus.ACTIVE && <Button className="admin-action admin-action--positive" disabled={updateProductLoading} onClick={() => updateProductStatusHandler(product, ProductStatus.ACTIVE)}>{product.productStatus === ProductStatus.DELETE ? 'Restore' : 'Show'}</Button>}
									{product.productStatus === ProductStatus.ACTIVE && <Button className="admin-action admin-action--warning" disabled={updateProductLoading} onClick={() => updateProductStatusHandler(product, ProductStatus.HIDDEN)}>Hide</Button>}
									{product.productStatus !== ProductStatus.DELETE && <Button className="admin-action admin-action--danger" disabled={updateProductLoading} onClick={() => updateProductStatusHandler(product, ProductStatus.DELETE)}>Remove</Button>}
								</Stack>
							</Stack>
						))}
					</Stack>
					{totalPages > 1 && <Pagination page={inquiry.page} count={totalPages} onChange={(_event, page) => setInquiry({ ...inquiry, page })} />}
				</>
			) : <Typography>No products found.</Typography>}
		</Stack>
	);
};

export default ProductList;
