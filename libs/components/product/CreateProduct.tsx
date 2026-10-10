import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { Alert, Box, Button, CircularProgress, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../../apollo/store';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { GET_MEMBER, GET_PRODUCT } from '../../../apollo/user/query';
import { getValidAccessToken } from '../../auth';
import { REACT_APP_API_GRAPHQL_URL, REACT_APP_API_URL } from '../../config';
import { Message } from '../../enums/common.enum';
import { MemberType } from '../../enums/member.enum';
import { ProductCategory, ProductType } from '../../enums/product.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Product } from '../../types/product/product';
import { ProductInput, ProductUpdateInput, ProductVariantInput } from '../../types/product/product.input';
import { useTranslation } from '../../i18n';

interface CreateProductProps {
	mode?: 'create' | 'edit';
}

interface ProductFormData {
	productCategory: ProductCategory;
	productType: ProductType | '';
	productName: string;
	productDesc: string;
}

interface VariantFormData {
	sku: string;
	color: string;
	size: string;
	price: string;
	stock: string;
}

const initialProductData: ProductFormData = {
	productCategory: ProductCategory.DOG,
	productType: '',
	productName: '',
	productDesc: '',
};

const initialVariant: VariantFormData = {
	sku: '',
	color: '',
	size: '',
	price: '',
	stock: '',
};

const CreateProduct = (props: CreateProductProps) => {
	const { t, label, errorText } = useTranslation();
	const { mode = 'create' } = props;
	const router = useRouter();
	const device = useDeviceDetect();
	const isEdit = mode === 'edit';
	const productId = typeof router.query.id === 'string' ? router.query.id : '';

	/** STATES **/
	const [productData, setProductData] = useState<ProductFormData>(initialProductData);
	const [variants, setVariants] = useState<VariantFormData[]>([{ ...initialVariant }]);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [uploadLoading, setUploadLoading] = useState(false);
	const [memberType, setMemberType] = useState<MemberType | null>(null);
	const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [createProduct, { loading: createProductLoading }] = useMutation(CREATE_PRODUCT);
	const [updateProduct, { loading: updateProductLoading }] = useMutation(UPDATE_PRODUCT);
	const {
		loading: getProductLoading,
		error: getProductError,
	} = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { productId },
		skip: !isEdit || !productId,
		onCompleted: (data: T) => {
			const product = data?.getProduct;
			if (!product) return;

			setCurrentProduct(product);
			setProductData({
				productCategory: product.productCategory,
				productType: product.productType,
				productName: product.productName,
				productDesc: product.productDesc ?? '',
			});
			setVariants(product.productVariants.map((variant) => ({
				sku: variant.sku,
				color: variant.color ?? '',
				size: variant.size ?? '',
				price: String(variant.price),
				stock: String(variant.stock),
			})));
		},
	});
	const {
		loading: getMemberLoading,
		error: getMemberError,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { memberId: user?.sub ?? '' },
		skip: !user?.sub,
		onCompleted: (data: T) => {
			setMemberType(data?.getMember?.memberType ?? null);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => () => {
		imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
	}, [imagePreviews]);

	/** HANDLERS **/
	const inputChangeHandler = (name: keyof ProductFormData, value: string) => {
		setProductData((previous) => ({ ...previous, [name]: value }));
	};

	const variantChangeHandler = (index: number, name: keyof VariantFormData, value: string) => {
		setVariants((previous) => previous.map((variant, currentIndex) => (
			currentIndex === index ? { ...variant, [name]: value } : variant
		)));
	};

	const addVariantHandler = () => {
		setVariants((previous) => [...previous, { ...initialVariant }]);
	};

	const removeVariantHandler = (index: number) => {
		setVariants((previous) => previous.filter((_variant, currentIndex) => currentIndex !== index));
	};

	const imageChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		event.target.value = '';

		if (files.length > 10) {
			await sweetMixinErrorAlert(t('ui.youCanUploadUpTo10Images'));
			return;
		}
		if (files.some((file) => !['image/jpeg', 'image/png'].includes(file.type))) {
			await sweetMixinErrorAlert(t('ui.pleaseChooseJpgJpegOrPngImages'));
			return;
		}

		setSelectedFiles(files);
		setImagePreviews(files.map((file) => URL.createObjectURL(file)));
	};

	const removeImageHandler = (index: number) => {
		const files = selectedFiles.filter((_file, fileIndex) => fileIndex !== index);
		setSelectedFiles(files);
		setImagePreviews(files.map((file) => URL.createObjectURL(file)));
	};

	const uploadImagesHandler = async (token: string): Promise<string[]> => {
		const formData = new FormData();
		const files = selectedFiles.map(() => null);
		const fileMap = Object.fromEntries(selectedFiles.map((_file, index) => [
			String(index), [`variables.files.${index}`],
		]));

		formData.append('operations', JSON.stringify({
			query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
				imagesUploader(files: $files, target: $target)
			}`,
			variables: { files, target: 'products' },
		}));
		formData.append('map', JSON.stringify(fileMap));
		selectedFiles.forEach((file, index) => formData.append(String(index), file));

		const response = await axios.post(REACT_APP_API_GRAPHQL_URL, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				'apollo-require-preflight': true,
				Authorization: `Bearer ${token}`,
			},
		});

		const uploadedImages = response.data?.data?.imagesUploader as string[] | undefined;
		if (!uploadedImages?.length) {
			throw new Error(response.data?.errors?.[0]?.message ?? Message.SOMETHING_WENT_WRONG);
		}
		return uploadedImages;
	};

	const submitProductHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const token = await getValidAccessToken();
			if (!token || !user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			if (memberType !== MemberType.ADMIN && memberType !== MemberType.AGENT) throw new Error(t('ui.adminOrAgentAccessIsRequired'));
			if (isEdit && currentProduct?.memberId !== user.sub) throw new Error(t('ui.youCanOnlyEditYourOwnProduct'));
			const productType = productData.productType;
			if (!productType) throw new Error(t('ui.pleaseChooseAProductType'));
			if (!selectedFiles.length && !currentProduct?.productImages.length) throw new Error(t('ui.pleaseAddAtLeastOneProductImage'));
			if (!validVariants) throw new Error(t('ui.addValidVariantsWithUniqueSkus'));

			setUploadLoading(true);
			const productImages = selectedFiles.length
				? await uploadImagesHandler(token)
				: currentProduct?.productImages ?? [];
			const productVariants: ProductVariantInput[] = variants.map((variant) => ({
				sku: variant.sku.trim(),
				color: variant.color.trim() || undefined,
				size: variant.size.trim() || undefined,
				price: Number(variant.price),
				stock: Number(variant.stock),
			}));
			const input: ProductInput = {
				productCategory: productData.productCategory,
				productType,
				productName: productData.productName.trim(),
				productDesc: productData.productDesc.trim() || undefined,
				productImages,
				productVariants,
			};
			const updateInput: ProductUpdateInput = { ...input, _id: productId };
			const result = isEdit
				? await updateProduct({ variables: { input: updateInput } })
				: await createProduct({ variables: { input } });
			const data = result.data as T | null | undefined;
			const savedProduct = isEdit ? data?.updateProduct : data?.createProduct;
			if (!savedProduct?._id) throw new Error(Message.SOMETHING_WENT_WRONG);

			await sweetTopSmallSuccessAlert(isEdit ? t('ui.productUpdated') : t('ui.productCreated'), 800);
			await router.push({ pathname: '/product/detail', query: { id: savedProduct._id } });
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.errors?.[0]?.message ?? error.message
				: error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		} finally {
			setUploadLoading(false);
		}
	};

	/** COMPUTED VALUES **/
	const skus = variants.map((variant) => variant.sku.trim());
	const validVariants = variants.length > 0 && new Set(skus).size === skus.length
		&& variants.every((variant) => variant.sku.trim()
			&& variant.price !== '' && Number.isInteger(Number(variant.price)) && Number(variant.price) >= 0
			&& variant.stock !== '' && Number.isInteger(Number(variant.stock)) && Number(variant.stock) >= 0);
	const isSubmitDisabled = createProductLoading || updateProductLoading || uploadLoading
		|| productData.productName.trim().length < 3 || productData.productName.trim().length > 100
		|| !productData.productType || (!selectedFiles.length && !currentProduct?.productImages.length) || !validVariants;
	const canCreate = memberType === MemberType.ADMIN || memberType === MemberType.AGENT;
	const canEdit = !isEdit || (currentProduct && currentProduct.memberId === user?.sub);
	const productForm = (
		<Stack component="form" className="product-create-form" onSubmit={submitProductHandler}>
			<Typography component="h2">{t('ui.productInformation')}</Typography>
			<Stack className="product-create-form__grid">
				<TextField select label={t('ui.for')} value={productData.productCategory} onChange={(event) => inputChangeHandler('productCategory', event.target.value)}>
					<MenuItem value={ProductCategory.DOG}>{t('nav.dogs')}</MenuItem>
					<MenuItem value={ProductCategory.CAT}>{t('nav.cats')}</MenuItem>
				</TextField>
				<TextField select label={t('ui.type')} value={productData.productType} onChange={(event) => inputChangeHandler('productType', event.target.value)} required>
					<MenuItem value="" disabled>{t('ui.selectProductType')}</MenuItem>
					{Object.values(ProductType).map((type) => <MenuItem value={type} key={type}>{label(type)}</MenuItem>)}
				</TextField>
				<TextField className="product-create-form__wide" label={t('ui.productName')} value={productData.productName} onChange={(event) => inputChangeHandler('productName', event.target.value)} required slotProps={{ htmlInput: { minLength: 3, maxLength: 100 } }} />
				<TextField className="product-create-form__wide" label={t('ui.descriptionOptional')} value={productData.productDesc} onChange={(event) => inputChangeHandler('productDesc', event.target.value)} multiline minRows={3} />
			</Stack>

			<Stack className="product-create-form__section">
				<Typography component="h2">{t('ui.optionsAndStock')}</Typography>
				{variants.map((variant, index) => (
					<Stack className="product-create-form__variant" key={index}>
						<Stack direction="row" className="product-create-form__variant-heading">
							<Typography component="strong">{t('message.optionNumber', { number: index + 1 })}</Typography>
							{variants.length > 1 && <Button color="error" onClick={() => removeVariantHandler(index)}>{t('ui.remove')}</Button>}
						</Stack>
						<Stack className="product-create-form__grid">
							<TextField label={t('ui.sku')} value={variant.sku} onChange={(event) => variantChangeHandler(index, 'sku', event.target.value)} required />
							<TextField label={t('ui.colorOptional')} value={variant.color} onChange={(event) => variantChangeHandler(index, 'color', event.target.value)} />
							<TextField label={t('ui.sizeOptional')} value={variant.size} onChange={(event) => variantChangeHandler(index, 'size', event.target.value)} />
							<TextField label={t('ui.priceWon')} type="number" value={variant.price} onChange={(event) => variantChangeHandler(index, 'price', event.target.value)} required slotProps={{ htmlInput: { min: 0, step: 1 } }} />
							<TextField label={t('ui.stock')} type="number" value={variant.stock} onChange={(event) => variantChangeHandler(index, 'stock', event.target.value)} helperText={t('ui.zeroStockHint')} required slotProps={{ htmlInput: { min: 0, step: 1 } }} />
						</Stack>
					</Stack>
				))}
				<Button className="product-create-form__add" startIcon={<AddRoundedIcon />} onClick={addVariantHandler}>{t('ui.addOption')}</Button>
			</Stack>

			<Stack className="product-create-form__section">
				<Typography component="h2">{t('ui.productPhotos')}</Typography>
				<Typography>{isEdit ? t('ui.chooseNewImagesToReplaceTheCurrentPhotos') : t('ui.productImageHint')}</Typography>
				<Button component="label" variant="outlined" startIcon={<CloudUploadOutlinedIcon />}>
					{t('ui.chooseImages')}<input hidden type="file" accept="image/jpeg,image/png" multiple onChange={imageChangeHandler} />
				</Button>
				{imagePreviews.length > 0 && (
					<Stack className="product-create-form__previews">
						{imagePreviews.map((preview, index) => (
							<Stack className="product-create-form__preview" key={preview}>
								<Image src={preview} alt={selectedFiles[index].name} width={150} height={150} unoptimized />
								<IconButton aria-label={t('message.removeFile', { name: selectedFiles[index].name })} onClick={() => removeImageHandler(index)}>
									<CloseRoundedIcon fontSize="small" />
								</IconButton>
								<Typography title={selectedFiles[index].name}>{index === 0 ? t('ui.catalogImage') : t('message.imageNumber', { number: index + 1 })} · {selectedFiles[index].name}</Typography>
							</Stack>
						))}
					</Stack>
				)}
				{isEdit && !imagePreviews.length && currentProduct && (
					<Stack className="product-create-form__previews">
						{currentProduct.productImages.map((image, index) => (
							<Stack className="product-create-form__preview" key={image}>
								<Image src={`${REACT_APP_API_URL}/${image}`} alt={`${currentProduct.productName} ${index + 1}`} width={150} height={150} unoptimized />
								<Typography>{index === 0 ? t('ui.catalogImage') : t('message.imageNumber', { number: index + 1 })}</Typography>
							</Stack>
						))}
					</Stack>
				)}
			</Stack>

			<Stack direction="row" className="product-create-form__actions">
				<Button component={Link} href={isEdit ? `/product/detail?id=${productId}` : '/product'} variant="outlined">{t('ui.cancel')}</Button>
				<Button type="submit" variant="contained" disabled={isSubmitDisabled}>
					{uploadLoading ? t('ui.uploadingImages') : createProductLoading || updateProductLoading ? t('ui.saving') : isEdit ? t('ui.saveChanges') : t('ui.createProduct')}
				</Button>
			</Stack>
		</Stack>
	);
	const pageContent = !user?.sub ? (
		<Alert severity="info"><Link href={isEdit ? `/account/join?referrer=/product/edit?id=${productId}` : '/account/join?referrer=/product/create'}>{t('message.signInProduct')}</Link></Alert>
	) : getMemberLoading ? (
		<Stack className="product-create-page__state"><CircularProgress color="primary" /></Stack>
	) : getMemberError ? (
		<Alert severity="error">{t('ui.accountRoleCouldNotBeLoaded')}</Alert>
	) : !canCreate ? (
		<Alert severity="warning">{t('ui.onlyAnAdminOrAgentCanManageProducts')}</Alert>
	) : isEdit && (!router.isReady || getProductLoading) ? (
		<Stack className="product-create-page__state"><CircularProgress color="primary" /></Stack>
	) : isEdit && (!productId || getProductError || !currentProduct) ? (
		<Alert severity="error">{t('ui.productCouldNotBeLoaded')}</Alert>
	) : !canEdit ? (
		<Alert severity="warning">{t('ui.youCanOnlyEditYourOwnProduct')}</Alert>
	) : productForm;

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Box component="main" className="product-create-page product-create-page--mobile container">
				<Stack className="product-create-page__heading">
					<Typography component="h1">{isEdit ? t('ui.editProduct') : t('ui.createProduct')}</Typography>
					<Typography>{isEdit ? t('ui.updateProductDetailsAndStock') : t('ui.addAProductToThePetnestCatalog')}</Typography>
				</Stack>
				{pageContent}
			</Box>
		);
	} else {
		/** RENDER PC **/
		return (
			<Box component="main" className="product-create-page container">
				<Stack className="product-create-page__heading">
					<Typography component="h1">{isEdit ? t('ui.editProduct') : t('ui.createProduct')}</Typography>
					<Typography>{isEdit ? t('ui.updateProductDetailsAndStock') : t('ui.addAProductToThePetnestCatalog')}</Typography>
				</Stack>
				{pageContent}
			</Box>
		);
	}
};

export default CreateProduct;
