export interface AddToCartInput {
	productId: string;
	sku: string;
	quantity: number;
}

export interface UpdateCartItemInput {
	productId: string;
	sku: string;
	quantity: number;
}

export interface RemoveCartItemInput {
	productId: string;
	sku: string;
}
