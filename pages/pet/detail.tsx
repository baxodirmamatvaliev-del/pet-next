import { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import { Alert, Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../apollo/store';
import { LIKE_TARGET_PET } from '../../apollo/user/mutation';
import { GET_PET } from '../../apollo/user/query';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import PetComments from '../../libs/components/pet/PetComments';
import { REACT_APP_API_URL } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import { PetListingType } from '../../libs/enums/pet.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';
import { Pet } from '../../libs/types/pet/pet';
import { formatterStr } from '../../libs/utils';

const PetDetail: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const petId = typeof router.query.id === 'string' ? router.query.id : '';

	/** STATES **/
	const [pet, setPet] = useState<Pet | null>(null);
	const [slideImage, setSlideImage] = useState('');
	const [likeLoading, setLikeLoading] = useState(false);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [likeTargetPet] = useMutation(LIKE_TARGET_PET);
	const {
		loading: getPetLoading,
		error: getPetError,
		refetch: getPetRefetch,
	} = useQuery(GET_PET, {
		fetchPolicy: 'network-only',
		variables: { petId },
		skip: !petId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getPet) {
				setPet(data.getPet);
				setSlideImage(data.getPet.petImages[0] ?? '');
			}
		},
	});

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const likePetHandler = async () => {
		try {
			if (!petId) return;
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);

			setLikeLoading(true);
			await likeTargetPet({ variables: { petId } });
			await getPetRefetch({ petId });
			await sweetTopSmallSuccessAlert('Favorite updated', 800);
		} catch (error) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		} finally {
			setLikeLoading(false);
		}
	};

	/** COMPUTED VALUES **/
	const isFavorite = Boolean(pet?.meLiked?.some((item) => item.myFavorite));
	const imagePath = slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/banner/home-hero.png';
	const petAge = typeof pet?.petAgeMonths === 'number' ? `${pet.petAgeMonths} months` : 'Not listed';
	const petPrice = pet?.petListingType === PetListingType.ADOPTION
		? 'Free adoption'
		: `₩${formatterStr(pet?.petPrice ?? 0)}`;

	if (!router.isReady || !petId || (getPetLoading && !pet)) {
		return (
			<Stack className="pet-detail-state">
				<CircularProgress color="primary" />
			</Stack>
		);
	}

	if (getPetError || !pet) {
		return (
			<Box className="pet-detail-state container">
				<Alert severity="error">Pet listing could not be loaded.</Alert>
			</Box>
		);
	}

	/** RENDER MOBILE **/
	if (device === 'mobile') {
		return (
			<Box component="main" className="pet-detail-page pet-detail-page--mobile container">
				<Typography className="pet-detail-page__breadcrumb">
					<Link href="/pet">Community</Link> / {pet.petName}
				</Typography>

				<Box className="pet-detail pet-detail--mobile">
					<Box className="pet-gallery">
						<Box className="pet-gallery__main">
							<Image
								src={imagePath}
								alt={pet.petName}
								fill
								sizes="100vw"
								priority
								unoptimized
							/>
						</Box>
						<Stack className="pet-gallery__thumbs">
							{pet.petImages.map((image) => (
								<Button
									className={image === slideImage ? 'active' : ''}
									onClick={() => changeImageHandler(image)}
									key={image}
								>
									<Image src={`${REACT_APP_API_URL}/${image}`} alt="" fill sizes="68px" unoptimized />
								</Button>
							))}
						</Stack>
					</Box>

					<Stack className="pet-detail__info">
						<Stack direction="row" className="pet-detail__eyebrow">
							<Typography>{pet.petListingType === PetListingType.ADOPTION ? 'ADOPTION' : 'FOR SALE'}</Typography>
							<IconButton
								className={isFavorite ? 'active' : ''}
								onClick={likePetHandler}
								disabled={likeLoading}
								aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
							>
								{isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
							</IconButton>
						</Stack>
						<Typography component="h1">{pet.petName}</Typography>
						<Typography className="pet-detail__title">{pet.petTitle}</Typography>
						<Typography component="strong" className="pet-detail__price">{petPrice}</Typography>

						<Stack className="pet-detail__facts">
							<Stack direction="row">
								<PetsOutlinedIcon />
								<Typography>{pet.petBreed ?? pet.petType} · {pet.petGender} · {petAge}</Typography>
							</Stack>
							<Stack direction="row">
								<LocationOnOutlinedIcon />
								<Typography>{pet.petLocation}, South Korea</Typography>
							</Stack>
						</Stack>

						<Button
							className="button button--primary"
							startIcon={isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
							onClick={likePetHandler}
							disabled={likeLoading}
						>
							{isFavorite ? 'Remove from favorites' : 'Add to favorites'}
						</Button>

						<Stack className="pet-detail__owner">
							<Typography>Listed by</Typography>
							<Typography component="strong">{pet.memberData?.memberNick ?? 'PetNest member'}</Typography>
						</Stack>

						{pet.petDesc && (
							<Box className="pet-detail__description">
								<Typography component="strong">About {pet.petName}</Typography>
								<Typography>{pet.petDesc}</Typography>
							</Box>
						)}
					</Stack>
				</Box>
				<PetComments petId={petId} key={petId} />
			</Box>
		);
	} else {
		/** RENDER PC **/
		return (
			<Box component="main" className="pet-detail-page container">
				<Typography className="pet-detail-page__breadcrumb">
					<Link href="/">Home</Link> / <Link href="/pet">Community</Link> / {pet.petName}
				</Typography>

				<Box className="pet-detail">
					<Box className="pet-gallery">
						<Stack className="pet-gallery__thumbs">
							{pet.petImages.map((image) => (
								<Button
									className={image === slideImage ? 'active' : ''}
									onClick={() => changeImageHandler(image)}
									key={image}
								>
									<Image src={`${REACT_APP_API_URL}/${image}`} alt="" fill sizes="80px" unoptimized />
								</Button>
							))}
						</Stack>
						<Box className="pet-gallery__main">
							<Image
								src={imagePath}
								alt={pet.petName}
								fill
								sizes="(max-width: 760px) 100vw, 620px"
								priority
								unoptimized
							/>
						</Box>
					</Box>

					<Stack className="pet-detail__info">
						<Stack direction="row" className="pet-detail__eyebrow">
							<Typography>{pet.petListingType === PetListingType.ADOPTION ? 'ADOPTION' : 'FOR SALE'}</Typography>
							<IconButton
								className={isFavorite ? 'active' : ''}
								onClick={likePetHandler}
								disabled={likeLoading}
								aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
							>
								{isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
							</IconButton>
						</Stack>
						<Typography component="h1">{pet.petName}</Typography>
						<Typography className="pet-detail__title">{pet.petTitle}</Typography>
						<Typography component="strong" className="pet-detail__price">{petPrice}</Typography>

						<Stack className="pet-detail__facts">
							<Stack direction="row">
								<PetsOutlinedIcon />
								<Typography>{pet.petBreed ?? pet.petType} · {pet.petGender} · {petAge}</Typography>
							</Stack>
							<Stack direction="row">
								<LocationOnOutlinedIcon />
								<Typography>{pet.petLocation}, South Korea</Typography>
							</Stack>
						</Stack>

						<Button
							className="button button--primary"
							startIcon={isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
							onClick={likePetHandler}
							disabled={likeLoading}
						>
							{isFavorite ? 'Remove from favorites' : 'Add to favorites'}
						</Button>

						<Stack className="pet-detail__owner">
							<Typography>Listed by</Typography>
							<Typography component="strong">{pet.memberData?.memberNick ?? 'PetNest member'}</Typography>
						</Stack>

						{pet.petDesc && (
							<Box className="pet-detail__description">
								<Typography component="strong">About {pet.petName}</Typography>
								<Typography>{pet.petDesc}</Typography>
							</Box>
						)}
					</Stack>
				</Box>
				<PetComments petId={petId} key={petId} />
			</Box>
		);
	}
};

export default withLayoutFull(PetDetail);
