import { gql } from '@apollo/client';

/**************************
 *         INQUIRY        *
 *************************/

export const CREATE_INQUIRY = gql`
	mutation CreateInquiry($input: InquiryInput!) {
		createInquiry(input: $input) { _id inquiryStatus }
	}
`;

export const ANSWER_INQUIRY = gql`
	mutation AnswerInquiry($input: AnswerInquiryInput!) {
		answerInquiry(input: $input) { _id inquiryStatus inquiryAnswer answeredAt }
	}
`;

/**************************
 *      NOTIFICATION      *
 *************************/

export const READ_NOTIFICATION = gql`
	mutation ReadNotification($notificationId: String!) {
		readNotification(notificationId: $notificationId) {
			_id
			notificationStatus
		}
	}
`;

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

export const SUBSCRIBE = gql`
	mutation Subscribe($input: FollowInput!) {
		subscribe(input: $input) {
			_id
			followingId
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: FollowInput!) {
		unsubscribe(input: $input) {
			_id
			followingId
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
 *         PRODUCT        *
 *************************/

export const CREATE_PRODUCT = gql`
	mutation CreateProduct($input: ProductInput!) {
		createProduct(input: $input) {
			_id
			productName
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	mutation UpdateProduct($input: ProductUpdateInput!) {
		updateProduct(input: $input) {
			_id
			productName
		}
	}
`;

export const REMOVE_PRODUCT = gql`
	mutation RemoveProduct($productId: String!) {
		removeProduct(productId: $productId) {
			_id
		}
	}
`;

/**************************
 *           PET          *
 *************************/

export const LIKE_TARGET_PET = gql`
	mutation LikeTargetPet($petId: String!) {
		likeTargetPet(petId: $petId) {
			_id
			petLikes
		}
	}
`;

export const CREATE_PET = gql`
	mutation CreatePet($input: PetInput!) {
		createPet(input: $input) {
			_id
			petName
		}
	}
`;

export const UPDATE_PET = gql`
	mutation UpdatePet($input: PetUpdateInput!) {
		updatePet(input: $input) {
			_id
			petStatus
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentContent
			commentRefId
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdateInput!) {
		updateComment(input: $input) {
			_id
			commentContent
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
