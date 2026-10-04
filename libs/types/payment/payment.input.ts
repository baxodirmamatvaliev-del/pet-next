import { PaymentMethod } from '../../enums/payment.enum';

export interface CreatePaymentInput {
	orderId: string;
	paymentMethod: PaymentMethod;
}
