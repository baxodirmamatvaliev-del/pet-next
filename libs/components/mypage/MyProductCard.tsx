import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

import { REACT_APP_API_URL } from '../../config';
import { ProductStatus } from '../../enums/product.enum';
import { Product } from '../../types/product/product';
import { formatterStr } from '../../utils';
import { useTranslation } from '../../i18n';

interface MyProductCardProps {
	product: Product;
	loading: boolean;
	updateProductStatusHandler: (product: Product, status: ProductStatus) => void;
	removeProductHandler: (product: Product) => void;
}

const MyProductCard = (props: MyProductCardProps) => {
	const { t, label } = useTranslation();
	const { product, loading, updateProductStatusHandler, removeProductHandler } = props;
	const isActive = product.productStatus === ProductStatus.ACTIVE;
	const imagePath = product.productImages[0]
		? `${REACT_APP_API_URL}/${product.productImages[0]}`
		: '/img/banner/home-hero.png';
	const price = product.productVariants.length
		? Math.min(...product.productVariants.map((variant) => variant.price))
		: 0;
	const stock = product.productVariants.reduce((total, variant) => total + variant.stock, 0);

	/** RENDER **/
	return (
		<Stack className="my-product-card">
			<Box className="my-product-card__image">
				<Image src={imagePath} alt={product.productName} fill sizes="150px" unoptimized />
			</Box>
			<Stack className="my-product-card__content">
				<Stack direction="row" className="my-product-card__title">
					<Typography component="h2">{product.productName}</Typography>
					<Chip label={isActive ? t('ui.active') : t('ui.hidden')} size="small" className={isActive ? 'active' : 'hidden'} />
				</Stack>
				<Typography>{label(product.productType)} · ₩{formatterStr(price)} · {t('counts.inStock', { count: stock })}</Typography>
				<Stack direction="row" className="my-product-card__actions">
					{isActive && (
						<>
							<Button component={Link} href={`/product/detail?id=${product._id}`} startIcon={<VisibilityOutlinedIcon />}>{t('ui.view')}</Button>
							<Button component={Link} href={`/product/edit?id=${product._id}`} startIcon={<EditOutlinedIcon />}>{t('ui.edit')}</Button>
						</>
					)}
					<Button
						startIcon={isActive ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
						onClick={() => updateProductStatusHandler(product, isActive ? ProductStatus.HIDDEN : ProductStatus.ACTIVE)}
						disabled={loading}
					>
						{isActive ? t('ui.hide') : t('ui.show')}
					</Button>
					<Button className="my-product-card__remove" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => removeProductHandler(product)} disabled={loading}>
						{t('ui.remove')}
					</Button>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default MyProductCard;
