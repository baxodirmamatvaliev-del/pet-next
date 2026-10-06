import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';

export interface Member {
	_id: string;
	memberNick: string;
	memberPhone: string;
	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: MemberAuthType;
	memberFullName?: string;
	memberImage: string;
	memberAddress?: string;
	memberDesc?: string;
	memberPets: number;
	memberArticles: number;
	memberFollowers: number;
	memberFollowings: number;
	memberPoints: number;
	memberLikes: number;
	memberViews: number;
	memberComments: number;
	memberRank: number;
	memberWarnings: number;
	memberBlocks: number;
	meFollowed?: { followingId: string; followerId: string; myFollowing: boolean }[];
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	accessToken?: string;
}

export interface AuthPayload {
	accessToken: string;
	member: Member;
}
