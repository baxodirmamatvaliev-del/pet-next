import { gql } from '@apollo/client';

export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
	query GetAllProductsByAdmin($input: AdminProductsInquiry!) {
		getAllProductsByAdmin(input: $input) {
			list {
				_id
				memberId
				productName
				productCategory
				productType
				productStatus
				productImages
				productVariants { sku price stock }
				createdAt
			}
			metaCounter { total }
		}
	}
`;

export const GET_ALL_PETS_BY_ADMIN = gql`
	query GetAllPetsByAdmin($input: AdminPetsInquiry!) {
		getAllPetsByAdmin(input: $input) {
			list {
				_id
				memberId
				petName
				petTitle
				petType
				petListingType
				petStatus
				petImages
				createdAt
			}
			metaCounter { total }
		}
	}
`;

export const GET_ALL_ORDERS_BY_ADMIN = gql`
	query GetAllOrdersByAdmin($input: AdminOrdersInquiry!) {
		getAllOrdersByAdmin(input: $input) {
			list {
				_id
				memberId
				orderStatus
				recipientName
				totalAmount
				orderItems { productName quantity }
				createdAt
			}
			metaCounter { total }
		}
	}
`;

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				_id
				memberNick
				memberPhone
				memberType
				memberStatus
				memberImage
				createdAt
			}
			metaCounter { total }
		}
	}
`;
