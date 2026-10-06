import { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import { Alert, Avatar, Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { userVar } from '../../../apollo/store';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { Message } from '../../enums/common.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Follow } from '../../types/follow/follow';
import { FollowInquiry } from '../../types/follow/follow.input';

interface MyFollowsProps {
	category: 'followers' | 'followings';
}

const MyFollows = ({ category }: MyFollowsProps) => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const isFollowers = category === 'followers';

	/** STATES **/
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>({
		page: 1,
		limit: 5,
		search: isFollowers ? { followingId: user?.sub } : { followerId: user?.sub },
	});
	const [members, setMembers] = useState<Follow[]>([]);
	const [total, setTotal] = useState(0);
	const [updatingMemberId, setUpdatingMemberId] = useState('');

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const {
		loading: getFollowsLoading,
		error: getFollowsError,
		refetch: getFollowsRefetch,
	} = useQuery(isFollowers ? GET_MEMBER_FOLLOWERS : GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !user?.sub,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const follows = isFollowers ? data?.getMemberFollowers : data?.getMemberFollowings;
			setMembers(follows?.list ?? []);
			setTotal(follows?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (_event: ChangeEvent<unknown>, page: number) => {
		setFollowInquiry({ ...followInquiry, page });
	};

	const followHandler = async (memberId: string, isFollowing: boolean) => {
		try {
			if (!memberId || memberId === user?.sub) return;
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);

			setUpdatingMemberId(memberId);
			if (isFollowing) await unsubscribe({ variables: { input: { followingId: memberId } } });
			else await subscribe({ variables: { input: { followingId: memberId } } });

			if (!isFollowers && isFollowing && members.length === 1 && followInquiry.page > 1) {
				setFollowInquiry({ ...followInquiry, page: followInquiry.page - 1 });
			} else {
				await getFollowsRefetch({ input: followInquiry });
			}
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG);
		} finally {
			setUpdatingMemberId('');
		}
	};

	/** COMPUTED VALUES **/
	const title = isFollowers ? 'My Followers' : 'My Followings';
	const totalPages = Math.ceil(total / followInquiry.limit);
	const listContent = (
		<>
			{getFollowsLoading && !members.length ? (
				<Stack className="my-follows__state"><CircularProgress color="primary" /></Stack>
			) : getFollowsError ? (
				<Alert severity="error">{title} could not be loaded.</Alert>
			) : members.length ? (
				<>
					<Stack className="my-follows__list">
						{members.map((follow) => {
							const member = isFollowers ? follow.followerData : follow.followingData;
							if (!member) return null;
							const isFollowing = follow.meFollowed?.some((item) => item.myFollowing) ?? false;
							const image = member.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : undefined;
							return (
								<Stack direction="row" className="my-follows__member" key={follow._id}>
									<Stack component={Link} href={`/member/detail?id=${member._id}`} direction="row" className="my-follows__identity">
										<Avatar src={image} alt={member.memberNick} />
										<Stack>
											<Typography component="strong">{member.memberNick}</Typography>
											<Typography>{member.memberType}</Typography>
										</Stack>
									</Stack>
									<Stack direction="row" className="my-follows__counts">
										<Typography><strong>{member.memberFollowers}</strong> followers</Typography>
										<Typography><strong>{member.memberFollowings}</strong> following</Typography>
									</Stack>
									{member._id !== user?.sub && (
										<Button
											className={isFollowing ? 'my-follows__unfollow' : 'my-follows__follow'}
											variant={isFollowing ? 'outlined' : 'contained'}
											onClick={() => followHandler(member._id, isFollowing)}
											disabled={Boolean(updatingMemberId)}
										>
											{isFollowing ? 'Unfollow' : 'Follow'}
										</Button>
									)}
								</Stack>
							);
						})}
					</Stack>
					<Stack direction="row" className="my-follows__pagination">
						<Pagination page={followInquiry.page} count={totalPages} onChange={paginationHandler} color="primary" shape="rounded" />
						<Typography>{total} {category}</Typography>
					</Stack>
				</>
			) : (
				<Stack className="my-follows__state">
					<PeopleOutlineRoundedIcon />
					<Typography component="h2">No {category} yet</Typography>
					<Typography>{isFollowers ? 'People who follow you will appear here.' : 'Members you follow will appear here.'}</Typography>
					<Button component={Link} href="/pet" variant="contained">Explore community</Button>
				</Stack>
			)}
		</>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return <Box className="my-follows my-follows--mobile"><Box className="my-follows__heading"><Typography component="h1">{title}</Typography><Typography>Stay connected with the PetNest community.</Typography></Box>{listContent}</Box>;
	} else {
		/** RENDER PC **/
		return <Box className="my-follows my-follows--pc"><Box className="my-follows__heading"><Typography component="h1">{title}</Typography><Typography>Stay connected with the PetNest community.</Typography></Box>{listContent}</Box>;
	}
};

export default MyFollows;
