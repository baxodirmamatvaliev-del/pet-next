import { PaymentMethod, PaymentStatus } from '../../enums/payment.enum';

export interface Payment {
	_id: string;
	memberId: string;
	orderId: string;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	paymentAmount: number;
	confirmedAt?: Date;
	cancelledAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}
