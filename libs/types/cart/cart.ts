import { Product } from '../product/product';

export interface CartItem {
	productId: string;
	sku: string;
	quantity: number;
	productData?: Product | null;
	unitPrice: number;
	subtotal: number;
	available: boolean;
}

export interface Cart {
	memberId: string;
	cartItems: CartItem[];
	totalQuantity: number;
	totalAmount: number;
}
