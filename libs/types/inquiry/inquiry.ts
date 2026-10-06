import { MemberType } from '../../enums/member.enum';

export interface SupportRecipient {
	_id: string;
	memberNick: string;
	memberImage: string;
	memberType: MemberType;
}

export interface Inquiry {
	_id: string;
	senderId: string;
	receiverId: string;
	senderNick: string;
	receiverNick: string;
	inquiryTitle: string;
	inquiryContent: string;
	inquiryStatus: 'OPEN' | 'ANSWERED';
	inquiryAnswer?: string;
	createdAt: string;
	answeredAt?: string;
}

export interface InquiryInput {
	receiverId: string;
	inquiryTitle: string;
	inquiryContent: string;
}

export interface AnswerInquiryInput {
	inquiryId: string;
	inquiryAnswer: string;
}
