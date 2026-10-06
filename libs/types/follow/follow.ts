import { Member } from '../member/member';

export interface Follow {
	_id: string;
	followerId?: string;
	followingId?: string;
	followerData?: Member;
	followingData?: Member;
	meFollowed?: { myFollowing: boolean }[];
}

export interface Follows {
	list: Follow[];
	metaCounter: { total: number }[];
}
