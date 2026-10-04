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
