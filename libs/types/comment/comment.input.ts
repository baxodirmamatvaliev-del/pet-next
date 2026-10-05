import { CommentGroup } from '../../enums/comment.enum';
import { Direction } from '../../enums/common.enum';

export interface CommentInput {
	commentGroup: CommentGroup;
	commentContent: string;
	commentRefId: string;
}

export interface CommentUpdateInput {
	_id: string;
	commentContent: string;
}

export interface CommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { commentRefId: string };
}
