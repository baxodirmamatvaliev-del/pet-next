import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Alert, Avatar, Button, CircularProgress, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';

import { UPDATE_PET_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { GET_ALL_PETS_BY_ADMIN } from '../../../../apollo/admin/query';
import { REACT_APP_API_URL } from '../../../config';
import { Direction, Message } from '../../../enums/common.enum';
import { PetListingType, PetLocation, PetStatus, PetType } from '../../../enums/pet.enum';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { T } from '../../../types/common';
import { Pet } from '../../../types/pet/pet';
import { AdminPetsInquiry } from '../../../types/pet/pet.input';
import { useTranslation } from '../../../i18n';

const initialInquiry: AdminPetsInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const PetList = () => {
	const { t, label, errorText } = useTranslation();
	/** STATES **/
	const [inquiry, setInquiry] = useState<AdminPetsInquiry>(initialInquiry);
	const [pets, setPets] = useState<Pet[]>([]);
	const [total, setTotal] = useState(0);

	/** APOLLO REQUESTS **/
	const [updatePetByAdmin, { loading: updatePetLoading }] = useMutation(UPDATE_PET_BY_ADMIN);
	const {
		loading: getAllPetsByAdminLoading,
		error: getAllPetsByAdminError,
		refetch: getAllPetsByAdminRefetch,
	} = useQuery(GET_ALL_PETS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPets(data?.getAllPetsByAdmin?.list ?? []);
			setTotal(data?.getAllPetsByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const statusFilterHandler = (value: string) => {
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, petStatus: value ? value as PetStatus : undefined } });
	};

	const typeFilterHandler = (value: string) => {
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, typeList: value ? [value as PetType] : undefined } });
	};

	const locationFilterHandler = (value: string) => {
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, locationList: value ? [value as PetLocation] : undefined } });
	};

	const updatePetStatusHandler = async (pet: Pet, petStatus: PetStatus) => {
		try {
			if (!await sweetConfirmAlert(
				t('message.changeStatus', { name: pet.petName, status: label(petStatus) }),
				t('common.confirm'),
				t('ui.cancel'),
			)) return;
			await updatePetByAdmin({ variables: { input: { _id: pet._id, petStatus } } });
			await getAllPetsByAdminRefetch({ input: inquiry });
			await sweetTopSmallSuccessAlert(t('ui.petListingUpdated'), 800);
		} catch (error) {
			await sweetMixinErrorAlert(errorText(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG));
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / inquiry.limit);

	return (
		<Stack className="admin-list">
			<Stack direction="row" className="admin-list__heading">
				<Stack><Typography component="h1">{t('ui.petListings')}</Typography><Typography>{t('ui.moderateCommunityListingsAndTheirStatus')}</Typography></Stack>
				<Stack direction="row" className="admin-list__filters">
					<TextField select size="small" label={t('ui.pet')} value={inquiry.search.typeList?.[0] ?? ''} onChange={(event) => typeFilterHandler(event.target.value)}>
						<MenuItem value="">{t('ui.allPets')}</MenuItem>
						{Object.values(PetType).map((type) => <MenuItem value={type} key={type}>{label(type)}</MenuItem>)}
					</TextField>
					<TextField select size="small" label={t('ui.location')} value={inquiry.search.locationList?.[0] ?? ''} onChange={(event) => locationFilterHandler(event.target.value)}>
						<MenuItem value="">{t('ui.allLocations')}</MenuItem>
						{Object.values(PetLocation).map((location) => <MenuItem value={location} key={location}>{label(location)}</MenuItem>)}
					</TextField>
					<TextField select size="small" label={t('ui.status')} value={inquiry.search.petStatus ?? ''} onChange={(event) => statusFilterHandler(event.target.value)}>
						<MenuItem value="">{t('ui.allStatuses')}</MenuItem>
						{Object.values(PetStatus).map((status) => <MenuItem value={status} key={status}>{label(status)}</MenuItem>)}
					</TextField>
				</Stack>
			</Stack>
			{getAllPetsByAdminError ? <Alert severity="error">{t('ui.petListingsCouldNotBeLoaded')}</Alert> : getAllPetsByAdminLoading && !pets.length ? <CircularProgress /> : pets.length ? (
				<>
					<Stack className="admin-list__items">
						{pets.map((pet) => {
							const canManage = pet.petStatus === PetStatus.ACTIVE || pet.petStatus === PetStatus.RESERVED;
							const completedStatus = pet.petListingType === PetListingType.ADOPTION ? PetStatus.ADOPTED : PetStatus.SOLD;

							return (
								<Stack direction="row" className="admin-list__item" key={pet._id}>
									<Avatar variant="rounded" src={pet.petImages[0] ? `${REACT_APP_API_URL}/${pet.petImages[0]}` : undefined} alt={pet.petName} />
									<Stack className="admin-list__details">
										<Typography component="strong">{pet.petTitle}</Typography>
										<Typography>{pet.petName} · {label(pet.petType)} · {label(pet.petListingType)}</Typography>
										<Typography>{t('ui.owner')} {pet.memberId}</Typography>
									</Stack>
									<Typography className={`admin-list__status admin-list__status--${pet.petStatus.toLowerCase()}`}>{label(pet.petStatus)}</Typography>
									{canManage && (
										<Stack direction="row" className="admin-list__actions">
											<Button className={`admin-action admin-action--${pet.petStatus === PetStatus.ACTIVE ? 'warning' : 'positive'}`} disabled={updatePetLoading} onClick={() => updatePetStatusHandler(pet, pet.petStatus === PetStatus.ACTIVE ? PetStatus.RESERVED : PetStatus.ACTIVE)}>{pet.petStatus === PetStatus.ACTIVE ? t('ui.reserve') : t('ui.reactivate')}</Button>
											<Button className="admin-action admin-action--purple" disabled={updatePetLoading} onClick={() => updatePetStatusHandler(pet, completedStatus)}>{completedStatus === PetStatus.ADOPTED ? t('ui.adopted') : t('ui.sold')}</Button>
											<Button className="admin-action admin-action--danger" disabled={updatePetLoading} onClick={() => updatePetStatusHandler(pet, PetStatus.DELETE)}>{t('ui.remove')}</Button>
										</Stack>
									)}
								</Stack>
							);
						})}
					</Stack>
					{totalPages > 1 && <Pagination page={inquiry.page} count={totalPages} onChange={(_event, page) => setInquiry({ ...inquiry, page })} />}
				</>
			) : <Typography>{t('ui.noPetListingsFound')}</Typography>}
		</Stack>
	);
};

export default PetList;
