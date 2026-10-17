import { useQuery } from '@apollo/client';
import { Box, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

import { GET_PRODUCTS } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { Direction } from '../../enums/common.enum';
import { useTranslation } from '../../i18n';
import { Products } from '../../types/product/product';
import { formatterStr } from '../../utils';

const HeroFeaturedProduct = () => {
	const { t } = useTranslation();

	/** APOLLO REQUESTS **/
	const { data, error } = useQuery<{ getProducts: Products }>(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 1, sort: 'productSold', direction: Direction.DESC, search: {} },
		},
	});

	/** COMPUTED VALUES **/
	const product = data?.getProducts.list[0];
	if (error || !product?.productImages[0] || !product.productVariants.length) return null;
	const price = Math.min(...product.productVariants.map((variant) => variant.price));

	/** RENDER **/
	return (
		<Stack
			component={Link}
			href={{ pathname: '/product/detail', query: { id: product._id } }}
			className="home-hero__featured"
		>
			<Box className="home-hero__thumbnail">
				<Image
					src={`${REACT_APP_API_URL}/${product.productImages[0]}`}
					alt={product.productName}
					fill
					sizes="64px"
					unoptimized
				/>
			</Box>
			<Stack>
				<Typography component="small">{t('home.featured')}</Typography>
				<Typography component="strong">{product.productName}</Typography>
				<Typography component="span">₩{formatterStr(price)}</Typography>
				<Typography component="span">{t('home.viewItem')}</Typography>
			</Stack>
		</Stack>
	);
};

export default HeroFeaturedProduct;
