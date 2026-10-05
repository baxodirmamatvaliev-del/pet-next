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

const initialInquiry: AdminPetsInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const PetList = () => {
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
			if (!await sweetConfirmAlert(`Change ${pet.petName} to ${petStatus.toLowerCase()}?`)) return;
			await updatePetByAdmin({ variables: { input: { _id: pet._id, petStatus } } });
			await getAllPetsByAdminRefetch({ input: inquiry });
			await sweetTopSmallSuccessAlert('Pet listing updated', 800);
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG);
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / inquiry.limit);

	return (
		<Stack className="admin-list">
			<Stack direction="row" className="admin-list__heading">
				<Stack><Typography component="h1">Pet listings</Typography><Typography>Moderate community listings and their status.</Typography></Stack>
				<Stack direction="row" className="admin-list__filters">
					<TextField select size="small" label="Pet" value={inquiry.search.typeList?.[0] ?? ''} onChange={(event) => typeFilterHandler(event.target.value)}>
						<MenuItem value="">All pets</MenuItem>
						{Object.values(PetType).map((type) => <MenuItem value={type} key={type}>{type}</MenuItem>)}
					</TextField>
					<TextField select size="small" label="Location" value={inquiry.search.locationList?.[0] ?? ''} onChange={(event) => locationFilterHandler(event.target.value)}>
						<MenuItem value="">All locations</MenuItem>
						{Object.values(PetLocation).map((location) => <MenuItem value={location} key={location}>{location}</MenuItem>)}
					</TextField>
					<TextField select size="small" label="Status" value={inquiry.search.petStatus ?? ''} onChange={(event) => statusFilterHandler(event.target.value)}>
						<MenuItem value="">All statuses</MenuItem>
						{Object.values(PetStatus).map((status) => <MenuItem value={status} key={status}>{status}</MenuItem>)}
					</TextField>
				</Stack>
			</Stack>
			{getAllPetsByAdminError ? <Alert severity="error">Pet listings could not be loaded.</Alert> : getAllPetsByAdminLoading && !pets.length ? <CircularProgress /> : pets.length ? (
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
										<Typography>{pet.petName} · {pet.petType} · {pet.petListingType}</Typography>
										<Typography>Owner: {pet.memberId}</Typography>
									</Stack>
									<Typography className={`admin-list__status admin-list__status--${pet.petStatus.toLowerCase()}`}>{pet.petStatus}</Typography>
									{canManage && (
										<Stack direction="row" className="admin-list__actions">
											<Button className={`admin-action admin-action--${pet.petStatus === PetStatus.ACTIVE ? 'warning' : 'positive'}`} disabled={updatePetLoading} onClick={() => updatePetStatusHandler(pet, pet.petStatus === PetStatus.ACTIVE ? PetStatus.RESERVED : PetStatus.ACTIVE)}>{pet.petStatus === PetStatus.ACTIVE ? 'Reserve' : 'Reactivate'}</Button>
											<Button className="admin-action admin-action--purple" disabled={updatePetLoading} onClick={() => updatePetStatusHandler(pet, completedStatus)}>{completedStatus === PetStatus.ADOPTED ? 'Adopted' : 'Sold'}</Button>
											<Button className="admin-action admin-action--danger" disabled={updatePetLoading} onClick={() => updatePetStatusHandler(pet, PetStatus.DELETE)}>Remove</Button>
										</Stack>
									)}
								</Stack>
							);
						})}
					</Stack>
					{totalPages > 1 && <Pagination page={inquiry.page} count={totalPages} onChange={(_event, page) => setInquiry({ ...inquiry, page })} />}
				</>
			) : <Typography>No pet listings found.</Typography>}
		</Stack>
	);
};

export default PetList;
