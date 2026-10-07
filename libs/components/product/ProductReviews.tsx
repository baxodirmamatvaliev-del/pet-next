import { ChangeEvent, FormEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Avatar, Box, Button, CircularProgress, Pagination, Rating, Stack, TextField, Typography } from '@mui/material';
import Link from 'next/link';

import { userVar } from '../../../apollo/store';
import { CREATE_COMMENT } from '../../../apollo/user/mutation';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { CommentGroup } from '../../enums/comment.enum';
import { Direction, Message } from '../../enums/common.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Comment } from '../../types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../types/comment/comment.input';
import { T } from '../../types/common';

interface ProductReviewsProps {
	productId: string;
	ownerId: string;
	onReviewCreated: () => Promise<void>;
}

const ProductReviews = (props: ProductReviewsProps) => {
	const { productId, ownerId, onReviewCreated } = props;
	const device = useDeviceDetect();

	/** STATES **/
	const user = useReactiveVar(userVar);
	const [reviewPage, setReviewPage] = useState(1);
	const [reviewText, setReviewText] = useState('');
	const [reviewRating, setReviewRating] = useState<number | null>(5);
	const [reviews, setReviews] = useState<Comment[]>([]);
	const [reviewTotal, setReviewTotal] = useState(0);

	/** APOLLO REQUESTS **/
	const [createComment, { loading: createCommentLoading }] = useMutation(CREATE_COMMENT);
	const reviewInquiry: CommentsInquiry = {
		page: reviewPage,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { commentRefId: productId },
	};
	const {
		loading: getCommentsLoading,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: reviewInquiry },
		skip: !productId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setReviews(data.getComments.list);
			setReviewTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const reviewSubmitHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			if (!reviewRating || !reviewText.trim()) return;

			const input: CommentInput = {
				commentGroup: CommentGroup.PRODUCT,
				commentContent: reviewText.trim(),
				commentRating: reviewRating,
				commentRefId: productId,
			};
			await createComment({ variables: { input } });
			setReviewText('');
			setReviewRating(5);
			if (reviewPage > 1) setReviewPage(1);
			else await getCommentsRefetch({ input: reviewInquiry });
			await onReviewCreated();
			await sweetTopSmallSuccessAlert('Review posted', 800);
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	const paginationHandler = (_event: ChangeEvent<unknown>, page: number) => {
		setReviewPage(page);
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(reviewTotal / reviewInquiry.limit);
	const canWriteReview = Boolean(user?.sub && user.sub !== ownerId);
	const signInHref = `/account/join?referrer=${encodeURIComponent(`/product/detail?id=${productId}`)}`;
	const content = (
		<>
			<Stack direction="row" className="product-reviews__heading">
				<Box>
					<Typography component="h2">Customer reviews</Typography>
					<Typography>Share your experience with this product.</Typography>
				</Box>
				<Typography component="span">{reviewTotal} reviews</Typography>
			</Stack>

			{canWriteReview ? (
				<Stack component="form" className="product-reviews__form" onSubmit={reviewSubmitHandler}>
					<Stack direction="row" className="product-reviews__rating-input">
						<Typography component="strong">Your rating</Typography>
						<Rating value={reviewRating} onChange={(_event, value) => setReviewRating(value)} />
					</Stack>
					<TextField
						value={reviewText}
						onChange={(event) => setReviewText(event.target.value)}
						placeholder="What did you like about this product?"
						multiline
						rows={3}
						fullWidth
						slotProps={{ htmlInput: { maxLength: 500, 'aria-label': 'Write a product review' } }}
					/>
					<Button type="submit" variant="contained" disabled={!reviewRating || !reviewText.trim() || createCommentLoading}>
						{createCommentLoading ? 'Posting...' : 'Post review'}
					</Button>
				</Stack>
			) : !user?.sub ? (
				<Stack direction="row" className="product-reviews__sign-in">
					<Typography>Sign in to review this product.</Typography>
					<Button component={Link} href={signInHref} variant="outlined">Sign in</Button>
				</Stack>
			) : (
				<Alert severity="info">You cannot review your own product.</Alert>
			)}

			{getCommentsLoading && !reviews.length ? (
				<Stack className="product-reviews__state"><CircularProgress color="primary" /></Stack>
			) : getCommentsError ? (
				<Alert severity="error">Reviews could not be loaded.</Alert>
			) : reviews.length ? (
				<>
					<Stack className="product-reviews__list">
						{reviews.map((review) => {
							const author = review.memberData?.memberNick ?? 'PetNest member';
							const avatar = review.memberData?.memberImage
								? `${REACT_APP_API_URL}/${review.memberData.memberImage}`
								: undefined;

							return (
								<Stack direction="row" className="product-reviews__item" key={review._id}>
									<Avatar component={Link} href={`/member/detail?id=${review.memberId}`} src={avatar} alt={author}>
										{author.charAt(0).toUpperCase()}
									</Avatar>
									<Box>
										<Stack direction="row" className="product-reviews__author">
											<Typography component={Link} href={`/member/detail?id=${review.memberId}`}>{author}</Typography>
											<Typography>{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Seoul' })}</Typography>
										</Stack>
										<Rating value={review.commentRating ?? 0} readOnly size="small" />
										<Typography className="product-reviews__text">{review.commentContent}</Typography>
									</Box>
								</Stack>
							);
						})}
					</Stack>
					{totalPages > 1 && <Pagination page={reviewPage} count={totalPages} onChange={paginationHandler} color="primary" shape="rounded" />}
				</>
			) : (
				<Typography className="product-reviews__empty">No reviews yet. Be the first to share your experience.</Typography>
			)}
		</>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return <Box component="section" className="product-reviews product-reviews--mobile">{content}</Box>;
	} else {
		/** RENDER PC **/
		return <Box component="section" className="product-reviews product-reviews--pc">{content}</Box>;
	}
};

export default ProductReviews;
