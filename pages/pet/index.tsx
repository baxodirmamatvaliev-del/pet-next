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
import { useTranslation } from '../../libs/i18n';

interface PetListProps {
	initialInput?: PetsInquiry;
}

const PetList = (props: PetListProps) => {
	const { t } = useTranslation();
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
						<Typography>{t('ui.homeCommunity')}</Typography>
						<Typography component="h1">{t('ui.findYourNewBestFriend')}</Typography>
						<Typography>{t('ui.meetPetsLookingForLovingHomesAcrossSouth')}</Typography>
					</Box>
					<Stack direction="row" component="label">
						<Typography component="span">{t('ui.sortBy')}</Typography>
						<FormControl size="small">
							<Select value={searchFilter.sort} onChange={sortingHandler}>
								<MenuItem value="createdAt">{t('ui.newest')}</MenuItem>
								<MenuItem value="petLikes">{t('ui.mostLiked')}</MenuItem>
								<MenuItem value="petViews">{t('ui.mostViewed')}</MenuItem>
								<MenuItem value="petPrice">{t('ui.price')}</MenuItem>
							</Select>
						</FormControl>
					</Stack>
				</Stack>
				<PetFilter searchFilter={searchFilter} updateSearchFilter={updateSearchFilterHandler} />
				<Box component="section" className="pet-results" aria-live="polite">
					<Stack direction="row" className="pet-results__toolbar">
						<Typography className="pet-results__count">{t('counts.pets', { count: total })}</Typography>
						<Button component={Link} href="/pet/create" className="pet-results__create" startIcon={<AddRoundedIcon />}>
							{t('ui.createListing')}
						</Button>
					</Stack>
					{getPetsLoading && !pets.length ? (
						<Typography className="pet-results__message">{t('ui.loadingPets')}</Typography>
					) : getPetsError ? (
						<Typography className="pet-results__message pet-results__message--error">{t('ui.petsCouldNotBeLoaded')}</Typography>
					) : pets.length ? (
						<Box className="pet-results__grid">
							{pets.map((pet) => <PetCard pet={pet} key={pet._id} />)}
						</Box>
					) : (
						<Typography className="pet-results__message">{t('ui.noPetsMatchYourFilters')}</Typography>
					)}
					{pets.length > 0 && totalPages > 0 && (
						<Stack direction="row" className="pet-pagination">
							<Pagination page={searchFilter.page} count={totalPages} onChange={paginationChangeHandler} color="primary" shape="rounded" />
							<Typography>{t('counts.pets', { count: total })}</Typography>
						</Stack>
					)}
				</Box>
			</Box>
		);
	} else {
		/** RENDER PC **/
		return (
			<Box component="main" className="pet-list-page container">
				<Stack direction="row" className="pet-list-page__heading">
					<Box>
						<Typography>{t('ui.homeCommunity')}</Typography>
						<Typography component="h1">{t('ui.findYourNewBestFriend')}</Typography>
						<Typography>{t('ui.meetPetsLookingForLovingHomesAcrossSouth')}</Typography>
					</Box>
					<Stack direction="row" component="label">
						<Typography component="span">{t('ui.sortBy')}</Typography>
						<FormControl size="small">
							<Select value={searchFilter.sort} onChange={sortingHandler}>
								<MenuItem value="createdAt">{t('ui.newest')}</MenuItem>
								<MenuItem value="petLikes">{t('ui.mostLiked')}</MenuItem>
								<MenuItem value="petViews">{t('ui.mostViewed')}</MenuItem>
								<MenuItem value="petPrice">{t('ui.price')}</MenuItem>
							</Select>
						</FormControl>
					</Stack>
				</Stack>

				<PetFilter searchFilter={searchFilter} updateSearchFilter={updateSearchFilterHandler} />

				<Box component="section" className="pet-results" aria-live="polite">
					<Stack direction="row" className="pet-results__toolbar">
						<Typography className="pet-results__count">{t('counts.pets', { count: total })}</Typography>
						<Button
							component={Link}
							href="/pet/create"
							className="pet-results__create"
							startIcon={<AddRoundedIcon />}
						>
							{t('ui.createListing')}
						</Button>
					</Stack>
					{getPetsLoading && !pets.length ? (
						<Typography className="pet-results__message">{t('ui.loadingPets')}</Typography>
					) : getPetsError ? (
						<Typography className="pet-results__message pet-results__message--error">
							{t('ui.petsCouldNotBeLoaded')}
						</Typography>
					) : pets.length ? (
						<Box className="pet-results__grid">
							{pets.map((pet) => <PetCard pet={pet} key={pet._id} />)}
						</Box>
					) : (
						<Typography className="pet-results__message">{t('ui.noPetsMatchYourFilters')}</Typography>
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
							<Typography>{t('counts.pets', { count: total })}</Typography>
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
