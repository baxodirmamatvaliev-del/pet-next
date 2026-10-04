import { OrderStatus } from '../../enums/order.enum';

export interface CreateOrderInput {
	recipientName: string;
	recipientPhone: string;
	deliveryAddress: string;
	deliveryNote?: string;
}

export interface MyOrderSearch {
	orderStatus?: OrderStatus;
}

export interface MyOrdersInquiry {
	page: number;
	limit: number;
	search: MyOrderSearch;
}
