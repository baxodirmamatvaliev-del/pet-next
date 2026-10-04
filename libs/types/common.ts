import { Cart } from './cart/cart';
import { AuthPayload, Member } from './member/member';
import { Order } from './order/order';
import { Payment } from './payment/payment';
import { Product, Products } from './product/product';

export interface T {
	signup?: Member;
	login?: AuthPayload;
	getProduct?: Product;
	getProducts?: Products;
	getMyCart?: Cart;
	addToCart?: Cart;
	updateCartItem?: Cart;
	removeCartItem?: Cart;
	clearCart?: Cart;
	createOrder?: Order;
	createPayment?: Payment;
}
