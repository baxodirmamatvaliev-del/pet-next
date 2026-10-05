import { ChangeEvent, FormEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Avatar, Box, Button, CircularProgress, Pagination, Stack, TextField, Typography } from '@mui/material';
import Link from 'next/link';

import { userVar } from '../../../apollo/store';
import { CREATE_COMMENT } from '../../../apollo/user/mutation';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { CommentGroup } from '../../enums/comment.enum';
import { Direction, Message } from '../../enums/common.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Comment } from '../../types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../types/comment/comment.input';

interface PetCommentsProps {
	petId: string;
}

const PetComments = (props: PetCommentsProps) => {
	const { petId } = props;
	const device = useDeviceDetect();

	/** STATES **/
	const [commentPage, setCommentPage] = useState(1);
	const [commentText, setCommentText] = useState('');
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState(0);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [createComment, { loading: createCommentLoading }] = useMutation(CREATE_COMMENT);
	const commentInquiry: CommentsInquiry = {
		page: commentPage,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { commentRefId: petId },
	};
	const {
		loading: getCommentsLoading,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip: !petId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list ?? []);
			setTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (_event: ChangeEvent<unknown>, page: number) => {
		setCommentPage(page);
	};

	const commentSubmitHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			const content = commentText.trim();
			if (!content) return;

			const input: CommentInput = {
				commentGroup: CommentGroup.PET,
				commentContent: content,
				commentRefId: petId,
			};
			await createComment({ variables: { input } });
			setCommentText('');
			if (commentPage > 1) setCommentPage(1);
			else await getCommentsRefetch({ input: commentInquiry });
			await sweetTopSmallSuccessAlert('Comment posted', 800);
		} catch (error) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / commentInquiry.limit);
	const signInHref = `/account/join?referrer=${encodeURIComponent(`/pet/detail?id=${petId}`)}`;
	const commentsContent = (
		<>
			<Stack direction="row" className="pet-comments__heading">
				<Box>
					<Typography component="h2">Community comments</Typography>
					<Typography>Share a kind thought or ask about this pet.</Typography>
				</Box>
				<Typography component="span">{total} comments</Typography>
			</Stack>

			{user?.sub ? (
				<Stack component="form" className="pet-comments__form" onSubmit={commentSubmitHandler}>
					<TextField
						value={commentText}
						onChange={(event) => setCommentText(event.target.value)}
						placeholder="Write a comment about this pet..."
						multiline
						rows={3}
						fullWidth
						slotProps={{ htmlInput: { maxLength: 500, 'aria-label': 'Write a comment' } }}
					/>
					<Button type="submit" variant="contained" disabled={!commentText.trim() || createCommentLoading}>
						{createCommentLoading ? 'Posting...' : 'Post comment'}
					</Button>
				</Stack>
			) : (
				<Stack direction="row" className="pet-comments__sign-in">
					<Typography>Sign in to join the conversation.</Typography>
					<Button component={Link} href={signInHref} variant="outlined">Sign in</Button>
				</Stack>
			)}

			{getCommentsLoading && !comments.length ? (
				<Stack className="pet-comments__state"><CircularProgress color="primary" /></Stack>
			) : getCommentsError ? (
				<Alert severity="error">Comments could not be loaded.</Alert>
			) : comments.length ? (
				<>
					<Stack className="pet-comments__list">
						{comments.map((comment) => {
							const author = comment.memberData?.memberNick ?? 'PetNest member';
							const avatar = comment.memberData?.memberImage
								? `${REACT_APP_API_URL}/${comment.memberData.memberImage}`
								: undefined;

							return (
								<Stack direction="row" className="pet-comments__item" key={comment._id}>
									<Avatar src={avatar} alt={author}>{author.charAt(0).toUpperCase()}</Avatar>
									<Box>
										<Stack direction="row" className="pet-comments__author">
											<Typography component="strong">{author}</Typography>
											<Typography>{new Date(comment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Seoul' })}</Typography>
										</Stack>
										<Typography className="pet-comments__text">{comment.commentContent}</Typography>
									</Box>
								</Stack>
							);
						})}
					</Stack>
					{totalPages > 1 && (
						<Pagination page={commentPage} count={totalPages} onChange={paginationHandler} color="primary" shape="rounded" />
					)}
				</>
			) : (
				<Typography className="pet-comments__empty">No comments yet. Be the first to say hello.</Typography>
			)}
		</>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return <Box component="section" className="pet-comments pet-comments--mobile">{commentsContent}</Box>;
	} else {
		/** RENDER PC **/
		return <Box component="section" className="pet-comments pet-comments--pc">{commentsContent}</Box>;
	}
};

export default PetComments;
