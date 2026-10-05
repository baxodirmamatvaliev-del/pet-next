import { ChangeEvent, useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { Alert, Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { userVar } from '../../../apollo/store';
import { GET_VISITED_PETS } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { T } from '../../types/common';
import { Pet } from '../../types/pet/pet';
import { OrdinaryInquiry } from '../../types/pet/pet.input';
import PetCard from '../pet/PetCard';

const RecentlyVisited = () => {
	const device = useDeviceDetect();

	/** STATES **/
	const [searchVisited, setSearchVisited] = useState<OrdinaryInquiry>({ page: 1, limit: 6 });
	const [recentlyVisited, setRecentlyVisited] = useState<Pet[]>([]);
	const [total, setTotal] = useState(0);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const {
		loading: getVisitedLoading,
		error: getVisitedError,
	} = useQuery(GET_VISITED_PETS, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		skip: !user?.sub,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setRecentlyVisited(data?.getVisitedPets?.list ?? []);
			setTotal(data?.getVisitedPets?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (_event: ChangeEvent<unknown>, page: number) => {
		setSearchVisited({ ...searchVisited, page });
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / searchVisited.limit);
	const visitedContent = (
		<>
			{getVisitedLoading && !recentlyVisited.length ? (
				<Stack className="recently-visited__state"><CircularProgress color="primary" /></Stack>
			) : getVisitedError ? (
				<Alert severity="error">Recently visited pets could not be loaded.</Alert>
			) : recentlyVisited.length ? (
				<>
					<Box className="recently-visited__grid">
						{recentlyVisited.map((pet) => <PetCard pet={pet} key={pet._id} />)}
					</Box>
					{totalPages > 0 && (
						<Stack direction="row" className="recently-visited__pagination">
							<Pagination
								page={searchVisited.page}
								count={totalPages}
								onChange={paginationHandler}
								color="primary"
								shape="rounded"
							/>
							<Typography>{total} visited pets</Typography>
						</Stack>
					)}
				</>
			) : (
				<Stack className="recently-visited__state">
					<HistoryRoundedIcon />
					<Typography component="h2">No visited pets yet</Typography>
					<Typography>Pet listings you open will appear here.</Typography>
					<Button component={Link} href="/pet" variant="contained">Explore pets</Button>
				</Stack>
			)}
		</>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Box className="recently-visited recently-visited--mobile">
				<Box className="recently-visited__heading">
					<Typography component="h1">Recently Visited</Typography>
					<Typography>Pet listings you viewed recently.</Typography>
				</Box>
				{visitedContent}
			</Box>
		);
	} else {
		/** RENDER PC **/
		return (
			<Box className="recently-visited recently-visited--pc">
				<Box className="recently-visited__heading">
					<Typography component="h1">Recently Visited</Typography>
					<Typography>Pet listings you viewed recently.</Typography>
				</Box>
				{visitedContent}
			</Box>
		);
	}
};

export default RecentlyVisited;
