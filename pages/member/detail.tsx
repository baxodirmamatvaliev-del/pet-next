import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Alert, Avatar, Box, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { GET_MEMBER, GET_PETS } from '../../apollo/user/query';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import PetCard from '../../libs/components/pet/PetCard';
import { REACT_APP_API_URL } from '../../libs/config';
import { Direction } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/types/member/member';
import { Pet } from '../../libs/types/pet/pet';
import { PetsInquiry } from '../../libs/types/pet/pet.input';

const initialInquiry: PetsInquiry = {
	page: 1,
	limit: 6,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const MemberDetailContent = ({ memberId }: { memberId: string }) => {
	const device = useDeviceDetect();

	/** STATES **/
	const [member, setMember] = useState<Member | null>(null);
	const [inquiry, setInquiry] = useState<PetsInquiry>({ ...initialInquiry, search: { memberId } });
	const [pets, setPets] = useState<Pet[]>([]);
	const [petTotal, setPetTotal] = useState(0);

	/** APOLLO REQUESTS **/
	const { error: getMemberError } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { memberId },
		skip: !memberId,
		onCompleted: (data: T) => setMember(data?.getMember ?? null),
	});
	const {
		 loading: getPetsLoading,
		  error: getPetsError }
		   = useQuery(GET_PETS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPets(data?.getPets?.list ?? []);
			setPetTotal(data?.getPets?.metaCounter[0]?.total ?? 0);
		},
	});

	/** COMPUTED VALUES **/
	const memberImage = member?.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : undefined;
	const totalPages = Math.ceil(petTotal / inquiry.limit);

	if (!memberId || (member?._id !== memberId && !getMemberError)) {
		return <Stack className="member-detail-state"><CircularProgress /></Stack>;
	}

	if (getMemberError || !member || member._id !== memberId) {
		return <Box className="member-detail-state container"><Alert severity="error">Member profile could not be loaded.</Alert></Box>;
	}

	/** RENDER MOBILE **/
	if (device === 'mobile') {
		return (
			<>
				<Head><title>{member.memberNick} | PetNest Korea</title></Head>
				<Box component="main" className="member-detail-page member-detail-page--mobile container">
					<Typography className="member-detail-page__breadcrumb"><Link href="/pet">Community</Link> / {member.memberNick}</Typography>
					<Stack className="member-detail__profile">
						<Avatar src={memberImage} alt={member.memberNick} />
						<Stack><Typography component="h1">{member.memberNick}</Typography><Typography>{member.memberDesc || 'PetNest community member'}</Typography></Stack>
					</Stack>
					<Stack className="member-detail__listings">
						<Typography component="h2">Pet listings <span>({petTotal})</span></Typography>
						{getPetsError ? <Alert severity="error">Listings could not be loaded.</Alert> : getPetsLoading ? <CircularProgress /> : pets.length ? (
							<Box className="member-detail__grid">{pets.map((pet) => <PetCard pet={pet} key={pet._id} />)}</Box>
						) : <Typography>No active pet listings yet.</Typography>}
						{totalPages > 1 && <Pagination page={inquiry.page} count={totalPages} onChange={(_event, page) => setInquiry({ ...inquiry, page })} />}
					</Stack>
				</Box>
			</>
		);
	} else {
		/** RENDER PC **/
		return (
			<>
				<Head><title>{member.memberNick} | PetNest Korea</title></Head>
				<Box component="main" className="member-detail-page container">
					<Typography className="member-detail-page__breadcrumb"><Link href="/pet">Community</Link> / {member.memberNick}</Typography>
					<Stack direction="row" className="member-detail__profile">
						<Avatar src={memberImage} alt={member.memberNick} />
						<Stack><Typography component="h1">{member.memberNick}</Typography><Typography>{member.memberDesc || 'PetNest community member'}</Typography></Stack>
					</Stack>
					<Stack className="member-detail__listings">
						<Typography component="h2">Pet listings <span>({petTotal})</span></Typography>
						{getPetsError ? <Alert severity="error">Listings could not be loaded.</Alert> : getPetsLoading ? <CircularProgress /> : pets.length ? (
							<Box className="member-detail__grid">{pets.map((pet) => <PetCard pet={pet} key={pet._id} />)}</Box>
						) : <Typography>No active pet listings yet.</Typography>}
						{totalPages > 1 && <Pagination page={inquiry.page} count={totalPages} onChange={(_event, page) => setInquiry({ ...inquiry, page })} />}
					</Stack>
				</Box>
			</>
		);
	}
};

const MemberDetail: NextPage = () => {
	const router = useRouter();
	const memberId = typeof router.query.id === 'string' ? router.query.id : '';

	return <MemberDetailContent memberId={memberId} key={memberId} />;
};

export default withLayoutFull(MemberDetail);
