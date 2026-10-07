import { CommentGroup, CommentStatus } from '../../enums/comment.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../product/product';

export interface Comment {
	_id: string;
	commentStatus: CommentStatus;
	commentGroup: CommentGroup;
	commentContent: string;
	commentRating?: number;
	commentRefId: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
}

export interface Comments {
	list: Comment[];
	metaCounter: TotalCounter[];
}
