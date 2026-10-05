import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_MEMBER = gql`
	query GetMember($memberId: String!) {
		getMember(memberId: $memberId) {
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
		}
	}
`;

/**************************
 *         PRODUCT        *
 *************************/

export const GET_PRODUCT = gql`
	query GetProduct($productId: String!) {
		getProduct(productId: $productId) {
			_id
			memberId
			productCategory
			productType
			productStatus
			productName
			productDesc
			productImages
			productVariants {
				sku
				color
				size
				price
				stock
			}
			productRating
			productReviews
			productSold
			productRank
			createdAt
			updatedAt
		}
	}
`;

export const GET_PRODUCTS = gql`
	query GetProducts($input: ProductsInquiry!) {
		getProducts(input: $input) {
			list {
				_id
				memberId
				productCategory
				productType
				productStatus
				productName
				productDesc
				productImages
				productVariants {
					sku
					color
					size
					price
					stock
				}
				productRating
				productReviews
				productSold
				productRank
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *           PET          *
 *************************/

export const GET_PETS = gql`
	query GetPets($input: PetsInquiry!) {
		getPets(input: $input) {
			list {
				_id
				petType
				petListingType
				petStatus
				petLocation
				petTitle
				petName
				petBreed
				petGender
				petAgeMonths
				petPrice
				petImages
				petViews
				petLikes
				petComments
				petRank
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
					_id
					memberNick
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *          CART          *
 *************************/

export const GET_MY_CART = gql`
	query GetMyCart {
		getMyCart {
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

export const GET_MY_ORDERS = gql`
	query GetMyOrders($input: MyOrdersInquiry!) {
		getMyOrders(input: $input) {
			list {
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
			metaCounter {
				total
			}
		}
	}
`;
