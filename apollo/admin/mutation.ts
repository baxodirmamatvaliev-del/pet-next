import { gql } from '@apollo/client';

export const UPDATE_PRODUCT_BY_ADMIN = gql`
	mutation UpdateProductByAdmin($input: ProductUpdateInput!) {
		updateProductByAdmin(input: $input) { _id productStatus }
	}
`;

export const UPDATE_PET_BY_ADMIN = gql`
	mutation UpdatePetByAdmin($input: PetUpdateInput!) {
		updatePetByAdmin(input: $input) { _id petStatus }
	}
`;

export const UPDATE_ORDER_STATUS_BY_ADMIN = gql`
	mutation UpdateOrderStatusByAdmin($input: OrderStatusUpdateInput!) {
		updateOrderStatusByAdmin(input: $input) { _id orderStatus }
	}
`;

export const CONFIRM_PAYMENT = gql`
	mutation ConfirmPayment($input: ConfirmPaymentInput!) {
		confirmPayment(input: $input) {
			_id
			orderId
			paymentStatus
		}
	}
`;

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdateByAdminInput!) {
		updateMemberByAdmin(input: $input) { _id memberType memberStatus }
	}
`;
