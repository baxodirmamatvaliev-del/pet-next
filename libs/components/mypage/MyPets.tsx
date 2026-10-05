import { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { userVar } from '../../../apollo/store';
import { UPDATE_PET } from '../../../apollo/user/mutation';
import { GET_MY_PETS } from '../../../apollo/user/query';
import { Direction, Message } from '../../enums/common.enum';
import { PetStatus } from '../../enums/pet.enum';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Pet } from '../../types/pet/pet';
import { MyPetsInquiry, PetUpdateInput } from '../../types/pet/pet.input';
import MyPetCard from './MyPetCard';

interface MyPetsProps {
	initialInput?: MyPetsInquiry;
}

const MyPets = (props: MyPetsProps) => {
	const { initialInput = MyPets.defaultProps.initialInput } = props;

	/** STATES **/
	const [searchFilter, setSearchFilter] = useState<MyPetsInquiry>(initialInput);
	const [pets, setPets] = useState<Pet[]>([]);
	const [total, setTotal] = useState(0);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [updatePet, { loading: updatePetLoading }] = useMutation(UPDATE_PET);
	const {
		loading: getMyPetsLoading,
		error: getMyPetsError,
		refetch: getMyPetsRefetch,
	} = useQuery(GET_MY_PETS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !user?.sub,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getMyPets?.list) setPets(data.getMyPets.list);
			setTotal(data?.getMyPets?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const changeStatusHandler = (petStatus?: PetStatus) => {
		setSearchFilter({ ...searchFilter, page: 1, search: { petStatus } });
	};

	const paginationHandler = (_event: ChangeEvent<unknown>, page: number) => {
		setSearchFilter({ ...searchFilter, page });
	};

	const updatePetStatusHandler = async (pet: Pet, petStatus: PetStatus) => {
		try {
			const actionName = petStatus === PetStatus.DELETE
				? 'remove this listing'
				: `change the status to ${petStatus.toLowerCase()}`;
			const isConfirmed = await sweetConfirmAlert(`Are you sure you want to ${actionName}?`);
			if (!isConfirmed) return;

			const input: PetUpdateInput = { _id: pet._id, petStatus };
			await updatePet({ variables: { input } });
			await getMyPetsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('Pet listing updated', 800);
		} catch (error) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / searchFilter.limit);
	const selectedStatus = searchFilter.search.petStatus;

	/** RENDER **/
	return (
		<Box className="my-pets">
			<Stack direction="row" className="my-pets__heading">
				<Box>
					<Typography component="h1">My Pet Listings</Typography>
					<Typography>Manage your adoption and sale listings.</Typography>
				</Box>
				<Button component={Link} href="/pet/create" variant="contained">Create listing</Button>
			</Stack>

			<Stack direction="row" className="my-pets__tabs">
				<Button className={!selectedStatus ? 'active' : ''} onClick={() => changeStatusHandler()}>
					All listings
				</Button>
				<Button className={selectedStatus === PetStatus.ACTIVE ? 'active' : ''} onClick={() => changeStatusHandler(PetStatus.ACTIVE)}>
					Active
				</Button>
				<Button className={selectedStatus === PetStatus.RESERVED ? 'active' : ''} onClick={() => changeStatusHandler(PetStatus.RESERVED)}>
					Reserved
				</Button>
				<Button className={selectedStatus === PetStatus.SOLD ? 'active' : ''} onClick={() => changeStatusHandler(PetStatus.SOLD)}>
					Sold
				</Button>
				<Button className={selectedStatus === PetStatus.ADOPTED ? 'active' : ''} onClick={() => changeStatusHandler(PetStatus.ADOPTED)}>
					Adopted
				</Button>
			</Stack>

			{getMyPetsLoading && !pets.length ? (
				<Stack className="my-pets__state">
					<CircularProgress color="primary" />
				</Stack>
			) : getMyPetsError ? (
				<Alert severity="error">Your pet listings could not be loaded.</Alert>
			) : pets.length ? (
				<>
					<Box className="my-pets__grid">
						{pets.map((pet) => (
							<MyPetCard
								pet={pet}
								loading={updatePetLoading}
								updatePetStatusHandler={updatePetStatusHandler}
								key={pet._id}
							/>
						))}
					</Box>
					{totalPages > 0 && (
						<Stack direction="row" className="my-pets__pagination">
							<Pagination
								page={searchFilter.page}
								count={totalPages}
								onChange={paginationHandler}
								color="primary"
								shape="rounded"
							/>
							<Typography>{total} listings</Typography>
						</Stack>
					)}
				</>
			) : (
				<Stack className="my-pets__state">
					<Typography component="h2">No pet listings found</Typography>
					<Typography>Your listings will appear here after you publish one.</Typography>
					<Button component={Link} href="/pet/create" variant="outlined">Create a listing</Button>
				</Stack>
			)}
		</Box>
	);
};

MyPets.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default MyPets;
