import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Box, Chip, Stack, Typography } from '@mui/material';
import Image from 'next/image';

import { REACT_APP_API_URL } from '../../config';
import { PetListingType } from '../../enums/pet.enum';
import { Pet } from '../../types/pet/pet';
import { formatterStr } from '../../utils';

interface PetCardProps {
	pet: Pet;
}

const PetCard = (props: PetCardProps) => {
	const { pet } = props;
	const imagePath = pet.petImages[0]
		? `${REACT_APP_API_URL}/${pet.petImages[0]}`
		: '/img/banner/home-hero.png';
	const petAge = typeof pet.petAgeMonths === 'number' ? `${pet.petAgeMonths} months` : 'Age not listed';
	const petPrice = pet.petListingType === PetListingType.ADOPTION
		? 'Free adoption'
		: `₩${formatterStr(pet.petPrice)}`;

	/** RENDER **/
	return (
		<Stack component="article" className="pet-card">
			<Box className="pet-card__image">
				<Image src={imagePath} alt={pet.petName} fill sizes="(max-width: 760px) 100vw, 310px" unoptimized />
				<Chip
					label={pet.petListingType === PetListingType.ADOPTION ? 'Adoption' : 'For sale'}
					className="pet-card__status"
				/>
			</Box>
			<Stack className="pet-card__content">
				<Stack direction="row" className="pet-card__heading">
					<Box>
						<Typography component="h2">{pet.petName}</Typography>
						<Typography>{pet.petBreed ?? pet.petType}</Typography>
					</Box>
					<Typography component="strong">{petPrice}</Typography>
				</Stack>
				<Typography className="pet-card__title">{pet.petTitle}</Typography>
				<Stack direction="row" className="pet-card__meta">
					<Typography>
						<LocationOnOutlinedIcon /> {pet.petLocation}
					</Typography>
					<Typography>{pet.petGender} · {petAge}</Typography>
				</Stack>
				<Stack direction="row" className="pet-card__stats">
					<Typography><FavoriteBorderRoundedIcon /> {pet.petLikes}</Typography>
					<Typography><VisibilityOutlinedIcon /> {pet.petViews}</Typography>
					<Typography>{pet.memberData?.memberNick ?? 'PetNest member'}</Typography>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default PetCard;
