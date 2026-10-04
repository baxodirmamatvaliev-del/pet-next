import { Cart } from './cart/cart';
import { AuthPayload, Member } from './member/member';
import { Order, Orders } from './order/order';
import { Payment } from './payment/payment';
import { Product, Products } from './product/product';

export interface T {
	signup?: Member;
	login?: AuthPayload;
	getMember?: Member;
	updateMember?: Member;
	getProduct?: Product;
	getProducts?: Products;
	getMyCart?: Cart;
	addToCart?: Cart;
	updateCartItem?: Cart;
	removeCartItem?: Cart;
	clearCart?: Cart;
	createOrder?: Order;
	getMyOrders?: Orders;
	cancelOrder?: Order;
	createPayment?: Payment;
}
