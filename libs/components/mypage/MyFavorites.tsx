import { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { Alert, Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { userVar } from '../../../apollo/store';
import { LIKE_TARGET_PET } from '../../../apollo/user/mutation';
import { GET_FAVORITE_PETS } from '../../../apollo/user/query';
import PetCard from '../pet/PetCard';
import { Message } from '../../enums/common.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { FavoriteInquiry } from '../../types/like/like.input';
import { Pet } from '../../types/pet/pet';

const MyFavorites = () => {
	const device = useDeviceDetect();

	/** STATES **/
	const [searchFavorites, setSearchFavorites] = useState<FavoriteInquiry>({ page: 1, limit: 6 });
	const [favoritePets, setFavoritePets] = useState<Pet[]>([]);
	const [total, setTotal] = useState(0);
	const [removingPetId, setRemovingPetId] = useState('');
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [likeTargetPet] = useMutation(LIKE_TARGET_PET);
	const {
		loading: getFavoritesLoading,
		error: getFavoritesError,
		refetch: getFavoritesRefetch,
	} = useQuery(GET_FAVORITE_PETS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFavorites },
		skip: !user?.sub,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFavoritePets(data?.getFavoritePets?.list ?? []);
			setTotal(data?.getFavoritePets?.metaCounter[0]?.total ?? 0);
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

			setRemovingPetId(petId);
			await likeTargetPet({ variables: { petId } });
			if (favoritePets.length === 1 && searchFavorites.page > 1) {
				setSearchFavorites({ ...searchFavorites, page: searchFavorites.page - 1 });
			} else {
				await getFavoritesRefetch({ input: searchFavorites });
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		} finally {
			setRemovingPetId('');
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / searchFavorites.limit);
	const favoritesContent = (
		<>
			{getFavoritesLoading && !favoritePets.length ? (
				<Stack className="my-favorites__state"><CircularProgress color="primary" /></Stack>
			) : getFavoritesError ? (
				<Alert severity="error">Favorite pets could not be loaded.</Alert>
			) : favoritePets.length ? (
				<>
					<Box className="my-favorites__grid">
						{favoritePets.map((pet) => (
							<Stack className="my-favorites__item" key={pet._id}>
								<PetCard pet={pet} />
								<Button
									variant="outlined"
									startIcon={<FavoriteRoundedIcon />}
									onClick={() => removeFavoriteHandler(pet._id)}
									disabled={Boolean(removingPetId)}
								>
									{removingPetId === pet._id ? 'Removing...' : 'Remove from favorites'}
								</Button>
							</Stack>
						))}
					</Box>
					{totalPages > 0 && (
						<Stack direction="row" className="my-favorites__pagination">
							<Pagination page={searchFavorites.page} count={totalPages} onChange={paginationHandler} color="primary" shape="rounded" />
							<Typography>{total} saved pets</Typography>
						</Stack>
					)}
				</>
			) : (
				<Stack className="my-favorites__state">
					<FavoriteRoundedIcon />
					<Typography component="h2">No favorite pets yet</Typography>
					<Typography>Pets you save will appear here.</Typography>
					<Button component={Link} href="/pet" variant="contained">Explore pets</Button>
				</Stack>
			)}
		</>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Box className="my-favorites my-favorites--mobile">
				<Box className="my-favorites__heading">
					<Typography component="h1">My Favorites</Typography>
					<Typography>Pet listings you saved.</Typography>
				</Box>
				{favoritesContent}
			</Box>
		);
	} else {
		/** RENDER PC **/
		return (
			<Box className="my-favorites my-favorites--pc">
				<Box className="my-favorites__heading">
					<Typography component="h1">My Favorites</Typography>
					<Typography>Pet listings you saved.</Typography>
				</Box>
				{favoritesContent}
			</Box>
		);
	}
};

export default MyFavorites;
