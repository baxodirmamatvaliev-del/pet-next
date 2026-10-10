import { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { Alert, Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { userVar } from '../../../apollo/store';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { GET_VISITED_PETS, GET_VISITED_PRODUCTS } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { CustomJwtPayload } from '../../types/customJwtPayload';
import { Pet } from '../../types/pet/pet';
import { OrdinaryInquiry } from '../../types/pet/pet.input';
import { Product } from '../../types/product/product';
import PetCard from '../pet/PetCard';
import ProductCard from '../product/ProductCard';
import { useTranslation } from '../../i18n';

const RecentlyVisited = () => {
	const { t, errorText } = useTranslation();
	const device = useDeviceDetect();

	/** STATES **/
	const [searchVisited, setSearchVisited] = useState<OrdinaryInquiry>({ page: 1, limit: 6 });
	const [visitedType, setVisitedType] = useState<'pets' | 'products'>('products');
	const [visitedPets, setVisitedPets] = useState<Pet[]>([]);
	const [visitedProducts, setVisitedProducts] = useState<Product[]>([]);
	const [petTotal, setPetTotal] = useState(0);
	const [productTotal, setProductTotal] = useState(0);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const {
		loading: getVisitedPetsLoading,
		error: getVisitedPetsError,
	} = useQuery(GET_VISITED_PETS, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		skip: !user?.sub || visitedType !== 'pets',
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setVisitedPets(data?.getVisitedPets?.list ?? []);
			setPetTotal(data?.getVisitedPets?.metaCounter[0]?.total ?? 0);
		},
	});
	const {
		loading: getVisitedProductsLoading,
		error: getVisitedProductsError,
		refetch: getVisitedProductsRefetch,
	} = useQuery(GET_VISITED_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		skip: !user?.sub || visitedType !== 'products',
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setVisitedProducts(data?.getVisitedProducts?.list ?? []);
			setProductTotal(data?.getVisitedProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (_event: ChangeEvent<unknown>, page: number) => {
		setSearchVisited({ ...searchVisited, page });
	};

	const visitedTypeHandler = (type: 'pets' | 'products') => {
		setVisitedType(type);
		setSearchVisited({ ...searchVisited, page: 1 });
	};

	const likeProductHandler = async (authUser: CustomJwtPayload | null, productId: string) => {
		try {
			if (!productId) return;
			if (!authUser?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProduct({ variables: { productId } });
			await getVisitedProductsRefetch({ input: searchVisited });
		} catch (error) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		}
	};

	/** COMPUTED VALUES **/
	const activeItems = visitedType === 'products' ? visitedProducts : visitedPets;
	const total = visitedType === 'products' ? productTotal : petTotal;
	const getVisitedLoading = visitedType === 'products' ? getVisitedProductsLoading : getVisitedPetsLoading;
	const getVisitedError = visitedType === 'products' ? getVisitedProductsError : getVisitedPetsError;
	const totalPages = Math.ceil(total / searchVisited.limit);
	const visitedContent = (
		<>
			<Stack direction="row" className="recently-visited__tabs">
				<Button className={visitedType === 'products' ? 'active' : ''} onClick={() => visitedTypeHandler('products')}>{t('ui.products')}</Button>
				<Button className={visitedType === 'pets' ? 'active' : ''} onClick={() => visitedTypeHandler('pets')}>{t('ui.petListings')}</Button>
			</Stack>
			{getVisitedLoading && !activeItems.length ? (
				<Stack className="recently-visited__state"><CircularProgress color="primary" /></Stack>
			) : getVisitedError ? (
				<Alert severity="error">{t('ui.recentlyVisitedItemsCouldNotBeLoaded')}</Alert>
			) : activeItems.length ? (
				<>
					<Box className="recently-visited__grid">
						{visitedType === 'products'
							? visitedProducts.map((product) => <ProductCard product={product} likeTargetProduct={likeProductHandler} key={product._id} />)
							: visitedPets.map((pet) => <PetCard pet={pet} key={pet._id} />)}
					</Box>
					{totalPages > 0 && (
						<Stack direction="row" className="recently-visited__pagination">
							<Pagination
								page={searchVisited.page}
								count={totalPages}
								onChange={paginationHandler}
								color="primary"
								shape="rounded"
							/>
							<Typography>{t('counts.viewed', { count: total })}</Typography>
						</Stack>
					)}
				</>
			) : (
				<Stack className="recently-visited__state">
					<HistoryRoundedIcon />
					<Typography component="h2">{t(visitedType === 'products' ? 'message.noVisitedProducts' : 'message.noVisitedPets')}</Typography>
					<Typography>{t('ui.itemsYouOpenWillAppearHere')}</Typography>
					<Button component={Link} href={visitedType === 'products' ? '/product' : '/pet'} variant="contained">{t(visitedType === 'products' ? 'ui.browseProducts' : 'ui.exploreCommunity')}</Button>
				</Stack>
			)}
		</>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Box className="recently-visited recently-visited--mobile">
				<Box className="recently-visited__heading">
					<Typography component="h1">{t('ui.recentlyVisited')}</Typography>
					<Typography>{t('ui.productsAndPetListingsYouViewedRecently')}</Typography>
				</Box>
				{visitedContent}
			</Box>
		);
	} else {
		/** RENDER PC **/
		return (
			<Box className="recently-visited recently-visited--pc">
				<Box className="recently-visited__heading">
					<Typography component="h1">{t('ui.recentlyVisited')}</Typography>
					<Typography>{t('ui.productsAndPetListingsYouViewedRecently')}</Typography>
				</Box>
				{visitedContent}
			</Box>
		);
	}
};

export default RecentlyVisited;
