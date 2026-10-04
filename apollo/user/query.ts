import { gql } from '@apollo/client';

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
