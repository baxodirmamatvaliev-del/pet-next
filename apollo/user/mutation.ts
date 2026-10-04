import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberNick
			memberPhone
			memberType
			memberStatus
			memberAuthType
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberPets
			memberArticles
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			accessToken
			member {
				_id
				memberNick
				memberPhone
				memberType
				memberStatus
				memberAuthType
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberPets
				memberArticles
				memberFollowers
				memberFollowings
				memberPoints
				memberLikes
				memberViews
				memberComments
				memberRank
				memberWarnings
				memberBlocks
				deletedAt
				createdAt
				updatedAt
			}
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdateInput!) {
		updateMember(input: $input) {
			_id
			memberNick
			memberPhone
			memberType
			memberStatus
			memberAuthType
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberPets
			memberArticles
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			createdAt
			updatedAt
			accessToken
		}
	}
`;

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

export const UPDATE_CART_ITEM = gql`
	mutation UpdateCartItem($input: UpdateCartItemInput!) {
		updateCartItem(input: $input) {
			memberId
			cartItems {
				productId
				sku
				quantity
				productData {
					_id
					productName
					productImages
					productVariants {
						sku
						color
						size
						price
						stock
					}
				}
				unitPrice
				subtotal
				available
			}
			totalQuantity
			totalAmount
		}
	}
`;

export const REMOVE_CART_ITEM = gql`
	mutation RemoveCartItem($input: RemoveCartItemInput!) {
		removeCartItem(input: $input) {
			memberId
			cartItems {
				productId
				sku
				quantity
				productData {
					_id
					productName
					productImages
					productVariants {
						sku
						color
						size
						price
						stock
					}
				}
				unitPrice
				subtotal
				available
			}
			totalQuantity
			totalAmount
		}
	}
`;

export const CLEAR_CART = gql`
	mutation ClearCart {
		clearCart {
			memberId
			cartItems {
				productId
				sku
				quantity
				productData {
					_id
					productName
					productImages
					productVariants {
						sku
						color
						size
						price
						stock
					}
				}
				unitPrice
				subtotal
				available
			}
			totalQuantity
			totalAmount
		}
	}
`;

/**************************
 *          ORDER         *
 *************************/

export const CREATE_ORDER = gql`
	mutation CreateOrder($input: CreateOrderInput!) {
		createOrder(input: $input) {
			_id
			memberId
			orderStatus
			orderItems {
				productId
				sku
				productName
				productImage
				quantity
				unitPrice
				subtotal
			}
			totalAmount
			recipientName
			recipientPhone
			deliveryAddress
			deliveryNote
			cancelledAt
			shippedAt
			deliveredAt
			createdAt
			updatedAt
		}
	}
`;

export const CANCEL_ORDER = gql`
	mutation CancelOrder($orderId: String!) {
		cancelOrder(orderId: $orderId) {
			_id
			memberId
			orderStatus
			orderItems {
				productId
				sku
				productName
				productImage
				quantity
				unitPrice
				subtotal
			}
			totalAmount
			recipientName
			recipientPhone
			deliveryAddress
			deliveryNote
			cancelledAt
			shippedAt
			deliveredAt
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         PAYMENT        *
 *************************/

export const CREATE_PAYMENT = gql`
	mutation CreatePayment($input: CreatePaymentInput!) {
		createPayment(input: $input) {
			_id
			memberId
			orderId
			paymentMethod
			paymentStatus
			paymentAmount
			confirmedAt
			cancelledAt
			createdAt
			updatedAt
		}
	}
`;
