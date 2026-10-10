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
import { useTranslation } from '../../i18n';

const communityInput: PetsInquiry = {
	page: 1,
	limit: 6,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: { typeList: [PetType.DOG, PetType.CAT] },
};

const CommunityPets = () => {
	const { t } = useTranslation();
	const { data, loading, error } = useQuery<{ getPets: Pets }, { input: PetsInquiry }>(GET_PETS, {
		variables: { input: communityInput },
		fetchPolicy: 'cache-and-network',
	});
	const pets = data?.getPets.list ?? [];

	return (
		<Stack component="section" className="community-pets container" aria-labelledby="community-pets-heading">
			<Stack direction="row" className="section-heading">
				<Box>
					<Typography component="span">{t('ui.dogsAndCatsLookingForAHome')}</Typography>
					<Typography component="h2" id="community-pets-heading">{t('nav.community')}</Typography>
				</Box>
				<Stack direction="row" component={Link} href={{ pathname: '/pet', query: { input: JSON.stringify({ ...communityInput, limit: 9 }) } }}>
					{t('ui.viewAll')}<ArrowForwardRoundedIcon />
				</Stack>
			</Stack>
			<Box aria-live="polite" aria-busy={loading}>
				{loading && !pets.length ? (
					<Typography className="community-pets__message">{t('ui.loadingCommunityListings')}</Typography>
				) : error && !pets.length ? (
					<Typography className="community-pets__message community-pets__message--error">{t('ui.communityListingsCouldNotBeLoadedPleaseTry')}</Typography>
				) : pets.length ? (
					<Box className="community-pets__grid">
						{pets.map((pet) => <PetCard pet={pet} key={pet._id} />)}
					</Box>
				) : (
					<Typography className="community-pets__message">{t('ui.noDogOrCatListingsYetCheckBack')}</Typography>
				)}
			</Box>
		</Stack>
	);
};

export default CommunityPets;
