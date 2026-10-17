import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { GET_PRODUCTS } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { Direction, Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { CustomJwtPayload } from '../../types/customJwtPayload';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ProductCard from '../product/ProductCard';
import { useTranslation } from '../../i18n';

interface BestSellersProps {
	initialInput?: ProductsInquiry;
}

const BestSellers = (props: BestSellersProps) => {
	const { t, errorText } = useTranslation();
	const { initialInput = BestSellers.defaultProps.initialInput } = props;
	const device = useDeviceDetect();

	/** STATES **/
	const [products, setProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const {
		loading: getProductsLoading,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProducts?.list) setProducts(data.getProducts.list);
		},
	});

	/** HANDLERS **/
	const likeProductHandler = async (user: CustomJwtPayload | null, productId: string) => {
		try {
			if (!productId) return;
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProduct({ variables: { productId } });
			await getProductsRefetch({ input: initialInput });
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		}
	};

	/** COMPUTED VALUES **/
	const productContent = getProductsLoading && !products.length ? (
		<Typography className="product-message">{t('ui.loadingProducts')}</Typography>
	) : getProductsError ? (
		<Typography className="product-message product-message--error">{t('ui.productsCouldNotBeLoaded')}</Typography>
	) : products.length ? (
		<Box className={`product-grid product-grid--${device}`}>
			{products.map((product) => <ProductCard product={product} likeTargetProduct={likeProductHandler} key={product._id} />)}
		</Box>
	) : (
		<Typography className="product-message">{t('ui.noProductsAvailableYet')}</Typography>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="section" className="best-sellers best-sellers--mobile container">
				<Stack direction="row" className="section-heading">
					<Box>
						<Typography component="span">{t('ui.customerFavorites')}</Typography>
						<Typography component="h2">{t('nav.best')}</Typography>
					</Box>
					<Stack direction="row" component={Link} href="/product?sort=productSold">
						{t('ui.viewAll')}<ArrowForwardRoundedIcon />
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
						<Typography component="span">{t('ui.customerFavorites')}</Typography>
						<Typography component="h2">{t('nav.best')}</Typography>
					</Box>
					<Stack direction="row" component={Link} href="/product?sort=productSold">
						{t('ui.viewAll')}<ArrowForwardRoundedIcon />
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
