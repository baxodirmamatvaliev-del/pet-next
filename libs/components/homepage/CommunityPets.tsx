import { useQuery } from '@apollo/client';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { GET_PETS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { PetType } from '../../enums/pet.enum';
import { Pets } from '../../types/pet/pet';
import { PetsInquiry } from '../../types/pet/pet.input';
import PetCard from '../pet/PetCard';

const communityInput: PetsInquiry = {
	page: 1,
	limit: 6,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: { typeList: [PetType.DOG, PetType.CAT] },
};

const CommunityPets = () => {
	const { data, loading, error } = useQuery<{ getPets: Pets }, { input: PetsInquiry }>(GET_PETS, {
		variables: { input: communityInput },
		fetchPolicy: 'cache-and-network',
	});
	const pets = data?.getPets.list ?? [];

	return (
		<Stack component="section" className="community-pets container" aria-labelledby="community-pets-heading">
			<Stack direction="row" className="section-heading">
				<Box>
					<Typography component="span">Dogs &amp; cats looking for a home</Typography>
					<Typography component="h2" id="community-pets-heading">Community</Typography>
				</Box>
				<Stack direction="row" component={Link} href={{ pathname: '/pet', query: { input: JSON.stringify({ ...communityInput, limit: 9 }) } }}>
					View all <ArrowForwardRoundedIcon />
				</Stack>
			</Stack>
			<Box aria-live="polite" aria-busy={loading}>
				{loading && !pets.length ? (
					<Typography className="community-pets__message">Loading community listings...</Typography>
				) : error && !pets.length ? (
					<Typography className="community-pets__message community-pets__message--error">Community listings could not be loaded. Please try again later.</Typography>
				) : pets.length ? (
					<Box className="community-pets__grid">
						{pets.map((pet) => <PetCard pet={pet} key={pet._id} />)}
					</Box>
				) : (
					<Typography className="community-pets__message">No dog or cat listings yet. Check back soon!</Typography>
				)}
			</Box>
		</Stack>
	);
};

export default CommunityPets;
