import { MouseEvent } from 'react';
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import { PetListingType, PetType } from '../../enums/pet.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PetsInquiry } from '../../types/pet/pet.input';
import { useTranslation } from '../../i18n';

interface PetFilterProps {
	searchFilter: PetsInquiry;
	updateSearchFilter: (input: PetsInquiry) => void;
}

const PetFilter = (props: PetFilterProps) => {
	const { t } = useTranslation();
	const { searchFilter, updateSearchFilter } = props;
	const device = useDeviceDetect();
	const selectedPetType = searchFilter.search.typeList?.[0] ?? 'ALL';
	const selectedListingType = searchFilter.search.listingTypeList?.[0] ?? 'ALL';

	/** HANDLERS **/
	const petTypeChangeHandler = (_event: MouseEvent<HTMLElement>, value: PetType | 'ALL' | null) => {
		if (!value) return;
		updateSearchFilter({
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				typeList: value === 'ALL' ? undefined : [value],
			},
		});
	};

	const listingTypeChangeHandler = (
		_event: MouseEvent<HTMLElement>,
		value: PetListingType | 'ALL' | null,
	) => {
		if (!value) return;
		updateSearchFilter({
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				listingTypeList: value === 'ALL' ? undefined : [value],
			},
		});
	};

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack className="pet-filter pet-filter--mobile">
				<Stack className="pet-filter__group">
					<Typography>{t('ui.petType')}</Typography>
					<ToggleButtonGroup exclusive value={selectedPetType} onChange={petTypeChangeHandler}>
						<ToggleButton value="ALL">{t('ui.all')}</ToggleButton>
						<ToggleButton value={PetType.DOG}>{t('nav.dogs')}</ToggleButton>
						<ToggleButton value={PetType.CAT}>{t('nav.cats')}</ToggleButton>
						<ToggleButton value={PetType.BIRD}>{t('ui.birds')}</ToggleButton>
					</ToggleButtonGroup>
				</Stack>
				<Stack className="pet-filter__group">
					<Typography>{t('ui.listingType')}</Typography>
					<ToggleButtonGroup exclusive value={selectedListingType} onChange={listingTypeChangeHandler}>
						<ToggleButton value="ALL">{t('ui.all')}</ToggleButton>
						<ToggleButton value={PetListingType.ADOPTION}>{t('ui.adoption')}</ToggleButton>
						<ToggleButton value={PetListingType.SALE}>{t('ui.saleListingType')}</ToggleButton>
					</ToggleButtonGroup>
				</Stack>
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack direction="row" className="pet-filter pet-filter--pc">
				<Stack className="pet-filter__group">
					<Typography>{t('ui.petType')}</Typography>
					<ToggleButtonGroup exclusive value={selectedPetType} onChange={petTypeChangeHandler}>
						<ToggleButton value="ALL">{t('ui.all')}</ToggleButton>
						<ToggleButton value={PetType.DOG}>{t('nav.dogs')}</ToggleButton>
						<ToggleButton value={PetType.CAT}>{t('nav.cats')}</ToggleButton>
						<ToggleButton value={PetType.BIRD}>{t('ui.birds')}</ToggleButton>
					</ToggleButtonGroup>
				</Stack>
				<Stack className="pet-filter__group">
					<Typography>{t('ui.listingType')}</Typography>
					<ToggleButtonGroup exclusive value={selectedListingType} onChange={listingTypeChangeHandler}>
						<ToggleButton value="ALL">{t('ui.all')}</ToggleButton>
						<ToggleButton value={PetListingType.ADOPTION}>{t('ui.adoption')}</ToggleButton>
						<ToggleButton value={PetListingType.SALE}>{t('ui.saleListingType')}</ToggleButton>
					</ToggleButtonGroup>
				</Stack>
			</Stack>
		);
	}
};

export default PetFilter;
