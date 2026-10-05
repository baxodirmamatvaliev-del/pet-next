import { ChangeEvent, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Box, Button, FormControl, MenuItem, Pagination, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { GET_PETS } from '../../apollo/user/query';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PetCard from '../../libs/components/pet/PetCard';
import PetFilter from '../../libs/components/pet/PetFilter';
import { Direction } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { T } from '../../libs/types/common';
import { PetsInquiry } from '../../libs/types/pet/pet.input';
import { Pet } from '../../libs/types/pet/pet';

interface PetListProps {
	initialInput?: PetsInquiry;
}

const PetList = (props: PetListProps) => {
	const { initialInput = PetList.defaultProps.initialInput } = props;
	const router = useRouter();
	const device = useDeviceDetect();

	/** STATES **/
	const [pets, setPets] = useState<Pet[]>([]);
	const [total, setTotal] = useState(0);

	const searchFilter = useMemo<PetsInquiry>(() => {
		if (typeof router.query.input === 'string') {
			try {
				return JSON.parse(router.query.input) as PetsInquiry;
			} catch {
				return initialInput;
			}
		}

		return initialInput;
	}, [initialInput, router.query.input]);

	/** APOLLO REQUESTS **/
	const {
		loading: getPetsLoading,
		error: getPetsError,
	} = useQuery(GET_PETS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getPets?.list) setPets(data.getPets.list);
			setTotal(data?.getPets?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const updateSearchFilterHandler = (input: PetsInquiry) => {
		void router.push(
			{ pathname: '/pet', query: { input: JSON.stringify(input) } },
			undefined,
			{ scroll: false },
		);
	};

	const sortingHandler = (event: SelectChangeEvent) => {
		updateSearchFilterHandler({ ...searchFilter, page: 1, sort: event.target.value });
	};

	const paginationChangeHandler = (_event: ChangeEvent<unknown>, page: number) => {
		updateSearchFilterHandler({ ...searchFilter, page });
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / searchFilter.limit);

	/** RENDER MOBILE **/
	if (device === 'mobile') {
		return (
			<Box component="main" className="pet-list-page pet-list-page--mobile container">
				<Stack className="pet-list-page__heading">
					<Box>
						<Typography>Home / Community</Typography>
						<Typography component="h1">Find your new best friend</Typography>
						<Typography>Meet pets looking for loving homes across South Korea.</Typography>
					</Box>
					<Stack direction="row" component="label">
						<Typography component="span">Sort by</Typography>
						<FormControl size="small">
							<Select value={searchFilter.sort} onChange={sortingHandler}>
								<MenuItem value="createdAt">Newest</MenuItem>
								<MenuItem value="petLikes">Most liked</MenuItem>
								<MenuItem value="petViews">Most viewed</MenuItem>
								<MenuItem value="petPrice">Price</MenuItem>
							</Select>
						</FormControl>
					</Stack>
				</Stack>
				<PetFilter searchFilter={searchFilter} updateSearchFilter={updateSearchFilterHandler} />
				<Box component="section" className="pet-results" aria-live="polite">
					<Stack direction="row" className="pet-results__toolbar">
						<Typography className="pet-results__count">{total} pets available</Typography>
						<Button component={Link} href="/pet/create" className="pet-results__create" startIcon={<AddRoundedIcon />}>
							Create listing
						</Button>
					</Stack>
					{getPetsLoading && !pets.length ? (
						<Typography className="pet-results__message">Loading pets...</Typography>
					) : getPetsError ? (
						<Typography className="pet-results__message pet-results__message--error">Pets could not be loaded.</Typography>
					) : pets.length ? (
						<Box className="pet-results__grid">
							{pets.map((pet) => <PetCard pet={pet} key={pet._id} />)}
						</Box>
					) : (
						<Typography className="pet-results__message">No pets match your filters.</Typography>
					)}
					{pets.length > 0 && totalPages > 0 && (
						<Stack direction="row" className="pet-pagination">
							<Pagination page={searchFilter.page} count={totalPages} onChange={paginationChangeHandler} color="primary" shape="rounded" />
							<Typography>{total} pets available</Typography>
						</Stack>
					)}
				</Box>
			</Box>
		);
	} else {
		/** RENDER PC **/

	/** RENDER **/
	return (
		<Box component="main" className="pet-list-page container">
			<Stack direction="row" className="pet-list-page__heading">
				<Box>
					<Typography>Home / Community</Typography>
					<Typography component="h1">Find your new best friend</Typography>
					<Typography>Meet pets looking for loving homes across South Korea.</Typography>
				</Box>
				<Stack direction="row" component="label">
					<Typography component="span">Sort by</Typography>
					<FormControl size="small">
						<Select value={searchFilter.sort} onChange={sortingHandler}>
							<MenuItem value="createdAt">Newest</MenuItem>
							<MenuItem value="petLikes">Most liked</MenuItem>
							<MenuItem value="petViews">Most viewed</MenuItem>
							<MenuItem value="petPrice">Price</MenuItem>
						</Select>
					</FormControl>
				</Stack>
			</Stack>

			<PetFilter searchFilter={searchFilter} updateSearchFilter={updateSearchFilterHandler} />

			<Box component="section" className="pet-results" aria-live="polite">
				<Stack direction="row" className="pet-results__toolbar">
					<Typography className="pet-results__count">{total} pets available</Typography>
					<Button
						component={Link}
						href="/pet/create"
						className="pet-results__create"
						startIcon={<AddRoundedIcon />}
					>
						Create listing
					</Button>
				</Stack>
				{getPetsLoading && !pets.length ? (
					<Typography className="pet-results__message">Loading pets...</Typography>
				) : getPetsError ? (
					<Typography className="pet-results__message pet-results__message--error">
						Pets could not be loaded.
					</Typography>
				) : pets.length ? (
					<Box className="pet-results__grid">
						{pets.map((pet) => <PetCard pet={pet} key={pet._id} />)}
					</Box>
				) : (
					<Typography className="pet-results__message">No pets match your filters.</Typography>
				)}
				{pets.length > 0 && totalPages > 0 && (
					<Stack direction="row" className="pet-pagination">
						<Pagination
							page={searchFilter.page}
							count={totalPages}
							onChange={paginationChangeHandler}
							color="primary"
							shape="rounded"
						/>
						<Typography>{total} pets available</Typography>
					</Stack>
				)}
			</Box>
		</Box>
	);
	}
};

PetList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default withLayoutBasic(PetList);
