export interface FollowInquiry {
	page: number;
	limit: number;
	search: {
		followerId?: string;
		followingId?: string;
	};
}
