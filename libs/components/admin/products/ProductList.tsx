import { FormEvent, useState } from 'react';
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
import { useTranslation } from '../../../i18n';

const initialInquiry: AdminProductsInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const ProductList = () => {
	const { t, label, errorText } = useTranslation();
	/** STATES **/
	const [inquiry, setInquiry] = useState<AdminProductsInquiry>(initialInquiry);
	const [products, setProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState(0);
	const [searchText, setSearchText] = useState('');

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
	const searchHandler = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, text: searchText.trim() || undefined } });
	};

	const clearSearchHandler = () => {
		setSearchText('');
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, text: undefined } });
	};

	const statusFilterHandler = (value: string) => {
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, productStatus: value ? value as ProductStatus : undefined } });
	};

	const updateProductStatusHandler = async (product: Product, productStatus: ProductStatus) => {
		try {
			if (!await sweetConfirmAlert(
				t('message.changeStatus', { name: product.productName, status: label(productStatus) }),
				t('common.confirm'),
				t('ui.cancel'),
			)) return;
			await updateProductByAdmin({ variables: { input: { _id: product._id, productStatus } } });
			await getAllProductsByAdminRefetch({ input: inquiry });
			await sweetTopSmallSuccessAlert(t('ui.productUpdated'), 800);
		} catch (error) {
			await sweetMixinErrorAlert(errorText(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG));
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / inquiry.limit);

	return (
		<Stack className="admin-list">
			<Stack direction="row" className="admin-list__heading">
				<Stack><Typography component="h1">{t('ui.products')}</Typography><Typography>{t('ui.reviewAndManageCatalogVisibility')}</Typography></Stack>
				<Stack direction="row" className="admin-list__filters">
					<Stack component="form" direction="row" className="admin-list__search" onSubmit={searchHandler}>
						<TextField size="small" label={t('nav.search')} value={searchText} onChange={(event) => setSearchText(event.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
						<Button type="submit" variant="contained">{t('ui.search')}</Button>
						{inquiry.search.text && <Button type="button" onClick={clearSearchHandler}>{t('ui.clear')}</Button>}
					</Stack>
					<TextField select size="small" label={t('ui.status')} value={inquiry.search.productStatus ?? ''} onChange={(event) => statusFilterHandler(event.target.value)}>
						<MenuItem value="">{t('ui.all')}</MenuItem>
						{Object.values(ProductStatus).map((status) => <MenuItem value={status} key={status}>{label(status)}</MenuItem>)}
					</TextField>
				</Stack>
			</Stack>
			{getAllProductsByAdminError ? <Alert severity="error">{t('ui.productsCouldNotBeLoaded')}</Alert> : getAllProductsByAdminLoading && !products.length ? <CircularProgress /> : products.length ? (
				<>
					<Stack className="admin-list__items">
						{products.map((product) => (
							<Stack direction="row" className="admin-list__item" key={product._id}>
								<Avatar variant="rounded" src={product.productImages[0] ? `${REACT_APP_API_URL}/${product.productImages[0]}` : undefined} alt={product.productName} />
								<Stack className="admin-list__details">
									<Typography component="strong">{product.productName}</Typography>
									<Typography>{label(product.productCategory)} · {label(product.productType)} · ₩{formatterStr(product.productVariants[0]?.price ?? 0)}</Typography>
									<Typography>{t('ui.owner')} {product.memberId}</Typography>
								</Stack>
								<Typography className={`admin-list__status admin-list__status--${product.productStatus.toLowerCase()}`}>{label(product.productStatus)}</Typography>
								<Stack direction="row" className="admin-list__actions">
									{product.productStatus !== ProductStatus.ACTIVE && <Button className="admin-action admin-action--positive" disabled={updateProductLoading} onClick={() => updateProductStatusHandler(product, ProductStatus.ACTIVE)}>{product.productStatus === ProductStatus.DELETE ? t('ui.restore') : t('ui.show')}</Button>}
									{product.productStatus === ProductStatus.ACTIVE && <Button className="admin-action admin-action--warning" disabled={updateProductLoading} onClick={() => updateProductStatusHandler(product, ProductStatus.HIDDEN)}>{t('ui.hide')}</Button>}
									{product.productStatus !== ProductStatus.DELETE && <Button className="admin-action admin-action--danger" disabled={updateProductLoading} onClick={() => updateProductStatusHandler(product, ProductStatus.DELETE)}>{t('ui.remove')}</Button>}
								</Stack>
							</Stack>
						))}
					</Stack>
					{totalPages > 1 && <Pagination page={inquiry.page} count={totalPages} onChange={(_event, page) => setInquiry({ ...inquiry, page })} />}
				</>
			) : <Typography>{t('ui.noProductsFound')}</Typography>}
		</Stack>
	);
};

export default ProductList;
