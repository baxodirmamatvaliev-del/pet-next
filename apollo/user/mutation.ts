import { gql } from '@apollo/client';

/**************************
 *          CART          *
 *************************/

export const ADD_TO_CART = gql`
	mutation AddToCart($input: AddToCartInput!) {
		addToCart(input: $input) {
			memberId
			totalQuantity
			totalAmount
		}
	}
`;
