import { OrderStatus } from '../../enums/order.enum';

export interface OrderItem {
	productId: string;
	sku: string;
	productName: string;
	productImage: string;
	quantity: number;
	unitPrice: number;
	subtotal: number;
}

export interface Order {
	_id: string;
	memberId: string;
	orderStatus: OrderStatus;
	orderItems: OrderItem[];
	totalAmount: number;
	recipientName: string;
	recipientPhone: string;
	deliveryAddress: string;
	deliveryNote?: string;
	cancelledAt?: Date;
	shippedAt?: Date;
	deliveredAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface Orders {
	list: Order[];
	metaCounter: { total: number }[];
}
