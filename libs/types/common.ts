import { Cart } from './cart/cart';
import { AuthPayload, Member } from './member/member';
import { Order, Orders } from './order/order';
import { Payment } from './payment/payment';
import { Pet, Pets } from './pet/pet';
import { Product, Products } from './product/product';

export interface T {
	signup?: Member;
	login?: AuthPayload;
	getMember?: Member;
	updateMember?: Member;
	getProduct?: Product;
	getProducts?: Products;
	getPets?: Pets;
	getPet?: Pet;
	getMyPets?: Pets;
	getFavoritePets?: Pets;
	getVisitedPets?: Pets;
	likeTargetPet?: Pet;
	createPet?: Pet;
	updatePet?: Pet;
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
