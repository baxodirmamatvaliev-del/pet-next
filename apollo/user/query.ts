import { gql } from '@apollo/client';

/**************************
 *         INQUIRY        *
 *************************/

export const GET_SUPPORT_RECIPIENTS = gql`
	query GetSupportRecipients {
		getSupportRecipients { _id memberNick memberImage memberType }
	}
`;

export const GET_MY_INQUIRIES = gql`
	query GetMyInquiries {
		getMyInquiries {
			_id senderId receiverId senderNick receiverNick
			inquiryTitle inquiryContent inquiryStatus inquiryAnswer createdAt answeredAt
		}
	}
`;

export const GET_ASSIGNED_INQUIRIES = gql`
	query GetAssignedInquiries {
		getAssignedInquiries {
			_id senderId receiverId senderNick receiverNick
			inquiryTitle inquiryContent inquiryStatus inquiryAnswer createdAt answeredAt
		}
	}
`;

/**************************
 *      NOTIFICATION      *
 *************************/

export const GET_MY_NOTIFICATIONS = gql`
	query GetMyNotifications($input: NotificationsInquiry!) {
		getMyNotifications(input: $input) {
			list {
				_id
				notificationType
				notificationStatus
				notificationGroup
				notificationTitle
				notificationDesc
				authorId
				petId
				productId
				orderId
				createdAt
			}
			metaCounter { total }
		}
	}
`;

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
				_id
				memberNick
				memberImage
				memberDesc
				memberFollowers
				memberLikes
			}
			metaCounter { total }
		}
	}
`;

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
			meFollowed {
				followingId
				followerId
				myFollowing
			}
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         FOLLOW         *
 *************************/

export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followerId
				meFollowed { myFollowing }
				followerData { _id memberNick memberImage memberType memberFollowers memberFollowings }
			}
			metaCounter { total }
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				meFollowed { myFollowing }
				followingData { _id memberNick memberImage memberType memberFollowers memberFollowings }
			}
			metaCounter { total }
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

export const GET_MY_PRODUCTS = gql`
	query GetMyProducts($input: MyProductsInquiry!) {
		getMyProducts(input: $input) {
			list {
				_id
				productName
				productType
				productStatus
				productImages
				productVariants {
					sku
					price
					stock
				}
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

export const GET_PET = gql`
	query GetPet($petId: String!) {
		getPet(petId: $petId) {
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
			petDesc
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
	}
`;

export const GET_MY_PETS = gql`
	query GetMyPets($input: MyPetsInquiry!) {
		getMyPets(input: $input) {
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
				petDesc
				petViews
				petLikes
				petComments
				petRank
				memberId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITE_PETS = gql`
	query GetFavoritePets($input: FavoriteInquiry!) {
		getFavoritePets(input: $input) {
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

export const GET_VISITED_PETS = gql`
	query GetVisitedPets($input: OrdinaryInquiry!) {
		getVisitedPets(input: $input) {
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
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberNick
					memberType
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

export const GET_ORDER = gql`
	query GetOrder($orderId: String!) {
		getOrder(orderId: $orderId) {
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
