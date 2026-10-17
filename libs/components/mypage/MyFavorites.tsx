import { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { Alert, Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { userVar } from '../../../apollo/store';
import { LIKE_TARGET_PET, LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { GET_FAVORITE_PETS, GET_FAVORITE_PRODUCTS } from '../../../apollo/user/query';
import PetCard from '../pet/PetCard';
import { Message } from '../../enums/common.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { FavoriteInquiry } from '../../types/like/like.input';
import { Pet } from '../../types/pet/pet';
import { Product } from '../../types/product/product';
import ProductCard from '../product/ProductCard';
import { useTranslation } from '../../i18n';

const MyFavorites = () => {
	const { t, errorText } = useTranslation();
	const device = useDeviceDetect();

	/** STATES **/
	const [searchFavorites, setSearchFavorites] = useState<FavoriteInquiry>({ page: 1, limit: 6 });
	const [favoriteType, setFavoriteType] = useState<'pets' | 'products'>('products');
	const [favoritePets, setFavoritePets] = useState<Pet[]>([]);
	const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
	const [petTotal, setPetTotal] = useState(0);
	const [productTotal, setProductTotal] = useState(0);
	const [removingId, setRemovingId] = useState('');
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [likeTargetPet] = useMutation(LIKE_TARGET_PET);
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const {
		loading: getFavoritePetsLoading,
		error: getFavoritePetsError,
		refetch: getFavoritePetsRefetch,
	} = useQuery(GET_FAVORITE_PETS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFavorites },
		skip: !user?.sub || favoriteType !== 'pets',
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFavoritePets(data?.getFavoritePets?.list ?? []);
			setPetTotal(data?.getFavoritePets?.metaCounter[0]?.total ?? 0);
		},
	});
	const {
		loading: getFavoriteProductsLoading,
		error: getFavoriteProductsError,
		refetch: getFavoriteProductsRefetch,
	} = useQuery(GET_FAVORITE_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFavorites },
		skip: !user?.sub || favoriteType !== 'products',
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFavoriteProducts(data?.getFavoriteProducts?.list ?? []);
			setProductTotal(data?.getFavoriteProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (_event: ChangeEvent<unknown>, page: number) => {
		setSearchFavorites({ ...searchFavorites, page });
	};

	const removeFavoriteHandler = async (petId: string) => {
		try {
			if (!petId) return;
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);

			setRemovingId(petId);
			await likeTargetPet({ variables: { petId } });
			if (favoritePets.length === 1 && searchFavorites.page > 1) {
				setSearchFavorites({ ...searchFavorites, page: searchFavorites.page - 1 });
			} else {
				await getFavoritePetsRefetch({ input: searchFavorites });
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		} finally {
			setRemovingId('');
		}
	};

	const removeFavoriteProductHandler = async (productId: string) => {
		try {
			if (!productId) return;
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);

			setRemovingId(productId);
			await likeTargetProduct({ variables: { productId } });
			if (favoriteProducts.length === 1 && searchFavorites.page > 1) {
				setSearchFavorites({ ...searchFavorites, page: searchFavorites.page - 1 });
			} else {
				await getFavoriteProductsRefetch({ input: searchFavorites });
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		} finally {
			setRemovingId('');
		}
	};

	const favoriteTypeHandler = (type: 'pets' | 'products') => {
		setFavoriteType(type);
		setSearchFavorites({ ...searchFavorites, page: 1 });
	};

	/** COMPUTED VALUES **/
	const activeItems = favoriteType === 'products' ? favoriteProducts : favoritePets;
	const total = favoriteType === 'products' ? productTotal : petTotal;
	const getFavoritesLoading = favoriteType === 'products' ? getFavoriteProductsLoading : getFavoritePetsLoading;
	const getFavoritesError = favoriteType === 'products' ? getFavoriteProductsError : getFavoritePetsError;
	const totalPages = Math.ceil(total / searchFavorites.limit);
	const favoritesContent = (
		<>
			<Stack direction="row" className="my-favorites__tabs">
				<Button className={favoriteType === 'products' ? 'active' : ''} onClick={() => favoriteTypeHandler('products')}>{t('ui.products')}</Button>
				<Button className={favoriteType === 'pets' ? 'active' : ''} onClick={() => favoriteTypeHandler('pets')}>{t('ui.petListings')}</Button>
			</Stack>
			{getFavoritesLoading && !activeItems.length ? (
				<Stack className="my-favorites__state"><CircularProgress color="primary" /></Stack>
			) : getFavoritesError ? (
				<Alert severity="error">{t('ui.favoritesCouldNotBeLoaded')}</Alert>
			) : activeItems.length ? (
				<>
					<Box className="my-favorites__grid">
						{favoriteType === 'pets' ? favoritePets.map((pet) => (
							<Stack className="my-favorites__item" key={pet._id}>
								<PetCard pet={pet} />
								<Button
									variant="outlined"
									startIcon={<FavoriteRoundedIcon />}
									onClick={() => removeFavoriteHandler(pet._id)}
									disabled={Boolean(removingId)}
								>
									{removingId === pet._id ? t('ui.removing') : t('ui.removeFromFavorites')}
								</Button>
							</Stack>
						)) : favoriteProducts.map((product) => (
							<Stack className="my-favorites__item" key={product._id}>
								<ProductCard product={product} showFavorite={false} />
								<Button variant="outlined" startIcon={<FavoriteRoundedIcon />} onClick={() => removeFavoriteProductHandler(product._id)} disabled={Boolean(removingId)}>
									{removingId === product._id ? t('ui.removing') : t('ui.removeFromFavorites')}
								</Button>
							</Stack>
						))}
					</Box>
					{totalPages > 0 && (
						<Stack direction="row" className="my-favorites__pagination">
							<Pagination page={searchFavorites.page} count={totalPages} onChange={paginationHandler} color="primary" shape="rounded" />
							<Typography>{t('counts.saved', { count: total })}</Typography>
						</Stack>
					)}
				</>
			) : (
				<Stack className="my-favorites__state">
					<FavoriteRoundedIcon />
					<Typography component="h2">{t(favoriteType === 'products' ? 'message.noFavoriteProducts' : 'message.noFavoritePets')}</Typography>
					<Typography>{t('ui.itemsYouSaveWillAppearHere')}</Typography>
					<Button component={Link} href={favoriteType === 'products' ? '/product' : '/pet'} variant="contained">{t(favoriteType === 'products' ? 'ui.browseProducts' : 'ui.exploreCommunity')}</Button>
				</Stack>
			)}
		</>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Box className="my-favorites my-favorites--mobile">
				<Box className="my-favorites__heading">
					<Typography component="h1">{t('ui.myFavorites')}</Typography>
					<Typography>{t('ui.productsAndPetListingsYouSaved')}</Typography>
				</Box>
				{favoritesContent}
			</Box>
		);
	} else {
		/** RENDER PC **/
		return (
			<Box className="my-favorites my-favorites--pc">
				<Box className="my-favorites__heading">
					<Typography component="h1">{t('ui.myFavorites')}</Typography>
					<Typography>{t('ui.productsAndPetListingsYouSaved')}</Typography>
				</Box>
				{favoritesContent}
			</Box>
		);
	}
};

export default MyFavorites;
