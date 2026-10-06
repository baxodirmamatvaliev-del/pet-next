import { Direction } from '../../enums/common.enum';
import { MemberStatus, MemberType } from '../../enums/member.enum';

export interface MemberInput {
	memberNick: string;
	memberPhone: string;
	memberPassword: string;
}

export interface MembersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { memberStatus?: MemberStatus; memberType?: MemberType; text?: string };
}

export interface AgentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { text?: string };
}

export interface LoginInput {
	memberNick: string;
	memberPassword: string;
}
