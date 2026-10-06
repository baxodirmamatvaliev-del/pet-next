import { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Avatar, Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../apollo/store';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_MEMBER, GET_PETS } from '../../apollo/user/query';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import PetCard from '../../libs/components/pet/PetCard';
import { REACT_APP_API_URL } from '../../libs/config';
import { Direction, Message } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
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
	const [followLoading, setFollowLoading] = useState(false);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const { error: getMemberError, refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { memberId },
		skip: !memberId,
		onCompleted: (data: T) => setMember(data?.getMember ?? null),
	});
	const { loading: getPetsLoading, error: getPetsError } = useQuery(GET_PETS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPets(data?.getPets?.list ?? []);
			setPetTotal(data?.getPets?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const subscribeHandler = async () => {
		try {
			if (!memberId) return;
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			if (user.sub === memberId) return;

			setFollowLoading(true);
			await subscribe({ variables: { input: { followingId: memberId } } });
			setMember((previous) => previous ? {
				...previous,
				memberFollowers: previous.memberFollowers + 1,
				meFollowed: [{ followerId: user.sub, followingId: memberId, myFollowing: true }],
			} : previous);
			await sweetTopSmallSuccessAlert('Followed!', 800);
			const result = await getMemberRefetch({ memberId });
			if (result.data?.getMember) setMember(result.data.getMember);
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG);
		} finally {
			setFollowLoading(false);
		}
	};

	const unsubscribeHandler = async () => {
		try {
			if (!memberId) return;
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			if (user.sub === memberId) return;

			setFollowLoading(true);
			await unsubscribe({ variables: { input: { followingId: memberId } } });
			setMember((previous) => previous ? {
				...previous,
				memberFollowers: Math.max(0, previous.memberFollowers - 1),
				meFollowed: [],
			} : previous);
			await sweetTopSmallSuccessAlert('Unfollowed!', 800);
			const result = await getMemberRefetch({ memberId });
			if (result.data?.getMember) setMember(result.data.getMember);
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG);
		} finally {
			setFollowLoading(false);
		}
	};

	/** COMPUTED VALUES **/
	const memberImage = member?.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : undefined;
	const totalPages = Math.ceil(petTotal / inquiry.limit);
	const isOwnProfile = user?.sub === memberId;
	const isFollowing = member?.meFollowed?.some((follow) => follow.myFollowing) ?? false;
	const followButton = isOwnProfile ? null : user?.sub ? isFollowing ? (
		<>
			<Button className="member-detail__unfollow" variant="outlined" onClick={unsubscribeHandler} disabled={followLoading}>Unfollow</Button>
			<Typography className="member-detail__following">Following</Typography>
		</>
	) : (
		<Button className="member-detail__follow" variant="contained" onClick={subscribeHandler} disabled={followLoading}>Follow</Button>
	) : (
		<Button component={Link} href={`/account/join?referrer=${encodeURIComponent(`/member/detail?id=${memberId}`)}`} variant="outlined">
			Sign in to follow
		</Button>
	);

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
						<Stack className="member-detail__intro">
							<Typography component="h1">{member.memberNick}</Typography>
							<Typography>{member.memberDesc || 'PetNest community member'}</Typography>
							<Stack direction="row" className="member-detail__social">
								<Typography><strong>{member.memberFollowers}</strong> followers</Typography>
								{followButton}
							</Stack>
						</Stack>
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
						<Stack className="member-detail__intro">
							<Typography component="h1">{member.memberNick}</Typography>
							<Typography>{member.memberDesc || 'PetNest community member'}</Typography>
							<Stack direction="row" className="member-detail__social">
								<Typography><strong>{member.memberFollowers}</strong> followers</Typography>
								{followButton}
							</Stack>
						</Stack>
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
