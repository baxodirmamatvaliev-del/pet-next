import { AuthPayload, Member } from './member/member';
import { Product, Products } from './product/product';

export interface T {
	signup?: Member;
	login?: AuthPayload;
	getProduct?: Product;
	getProducts?: Products;
}
