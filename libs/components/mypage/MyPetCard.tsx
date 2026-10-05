import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Button, Chip, Stack } from '@mui/material';
import Link from 'next/link';

import { PetListingType, PetStatus } from '../../enums/pet.enum';
import { Pet } from '../../types/pet/pet';
import PetCard from '../pet/PetCard';

interface MyPetCardProps {
	pet: Pet;
	loading: boolean;
	updatePetStatusHandler: (pet: Pet, status: PetStatus) => void;
}

const MyPetCard = (props: MyPetCardProps) => {
	const { pet, loading, updatePetStatusHandler } = props;
	const canManage = pet.petStatus === PetStatus.ACTIVE || pet.petStatus === PetStatus.RESERVED;
	const completedStatus = pet.petListingType === PetListingType.ADOPTION ? PetStatus.ADOPTED : PetStatus.SOLD;

	/** RENDER **/
	return (
		<Stack className="my-pet-card">
			<PetCard pet={pet} />
			<Stack className="my-pet-card__actions">
				<Chip label={pet.petStatus.replace('_', ' ')} className={`my-pet-card__status my-pet-card__status--${pet.petStatus.toLowerCase()}`} />
				{canManage && (
					<Stack direction="row" className="my-pet-card__buttons">
						{pet.petStatus === PetStatus.ACTIVE && (
							<Button component={Link} href={`/pet/edit?id=${pet._id}`} variant="outlined" startIcon={<EditOutlinedIcon />}>
								Edit
							</Button>
						)}
						<Button
							variant="outlined"
							startIcon={pet.petStatus === PetStatus.RESERVED
								? <PlayCircleOutlineRoundedIcon />
								: <PauseCircleOutlineRoundedIcon />}
							onClick={() => updatePetStatusHandler(
								pet,
								pet.petStatus === PetStatus.RESERVED ? PetStatus.ACTIVE : PetStatus.RESERVED,
							)}
							disabled={loading}
						>
							{pet.petStatus === PetStatus.RESERVED ? 'Reactivate' : 'Reserve'}
						</Button>
						<Button
							variant="contained"
							startIcon={<CheckCircleOutlineRoundedIcon />}
							onClick={() => updatePetStatusHandler(pet, completedStatus)}
							disabled={loading}
						>
							{completedStatus === PetStatus.ADOPTED ? 'Mark adopted' : 'Mark sold'}
						</Button>
						<Button
							className="my-pet-card__remove"
							startIcon={<DeleteOutlineRoundedIcon />}
							onClick={() => updatePetStatusHandler(pet, PetStatus.DELETE)}
							disabled={loading}
						>
							Remove
						</Button>
					</Stack>
				)}
			</Stack>
		</Stack>
	);
};

export default MyPetCard;
