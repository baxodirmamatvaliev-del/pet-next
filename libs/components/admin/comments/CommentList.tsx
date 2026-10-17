import { ChangeEvent, FormEvent, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Alert, Avatar, Button, CircularProgress, MenuItem, Pagination, Rating, Stack, TextField, Typography } from '@mui/material';
import Link from 'next/link';

import { REMOVE_COMMENT_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { GET_ALL_COMMENTS_BY_ADMIN } from '../../../../apollo/admin/query';
import { REACT_APP_API_URL } from '../../../config';
import { CommentGroup } from '../../../enums/comment.enum';
import { Direction, Message } from '../../../enums/common.enum';
import useDeviceDetect from '../../../hooks/useDeviceDetect';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { Comment } from '../../../types/comment/comment';
import { AdminCommentsInquiry } from '../../../types/comment/comment.input';
import { T } from '../../../types/common';
import { useTranslation } from '../../../i18n';

const initialInquiry: AdminCommentsInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const CommentList = () => {
	const { t, locale, label, errorText } = useTranslation();
	const device = useDeviceDetect();

	/** STATES **/
	const [inquiry, setInquiry] = useState<AdminCommentsInquiry>(initialInquiry);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState(0);
	const [searchText, setSearchText] = useState('');

	/** APOLLO REQUESTS **/
	const [removeCommentByAdmin, { loading: removeCommentByAdminLoading }] = useMutation(REMOVE_COMMENT_BY_ADMIN);
	const {
		loading: getAllCommentsByAdminLoading,
		error: getAllCommentsByAdminError,
		refetch: getAllCommentsByAdminRefetch,
	} = useQuery(GET_ALL_COMMENTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getAllCommentsByAdmin?.list) setComments(data.getAllCommentsByAdmin.list);
			setTotal(data?.getAllCommentsByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const searchHandler = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, text: searchText.trim() || undefined } });
	};

	const clearSearchHandler = () => {
		setSearchText('');
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, text: undefined } });
	};

	const groupFilterHandler = (value: string) => {
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, commentGroup: value ? value as CommentGroup : undefined } });
	};

	const paginationHandler = (_event: ChangeEvent<unknown>, page: number) => {
		setInquiry({ ...inquiry, page });
	};

	const removeCommentHandler = async (comment: Comment) => {
		try {
			if (!await sweetConfirmAlert(
				t('ui.permanentlyRemoveThisComment'),
				t('common.confirm'),
				t('ui.cancel'),
			)) return;
			await removeCommentByAdmin({ variables: { commentId: comment._id } });

			if (comments.length === 1 && inquiry.page > 1) {
				setInquiry({ ...inquiry, page: inquiry.page - 1 });
			} else {
				await getAllCommentsByAdminRefetch({ input: inquiry });
			}
			await sweetTopSmallSuccessAlert(t('ui.commentRemoved'), 800);
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / inquiry.limit);
	const getTargetHref = (comment: Comment): string | null => {
		switch (comment.commentGroup) {
			case CommentGroup.PRODUCT:
				return `/product/detail?id=${comment.commentRefId}`;
			case CommentGroup.PET:
				return `/pet/detail?id=${comment.commentRefId}`;
			case CommentGroup.MEMBER:
				return `/member/detail?id=${comment.commentRefId}`;
			default:
				return null;
		}
	};
	const content = (
		<>
			<Stack direction="row" className="admin-list__heading">
				<Stack>
					<Typography component="h1">{t('ui.reviewsComments')}</Typography>
					<Typography>{t('ui.reviewCommunityContentAndRemoveInappropriateMessages')}</Typography>
				</Stack>
				<Stack direction="row" className="admin-list__filters">
					<Stack component="form" direction="row" className="admin-list__search" onSubmit={searchHandler}>
						<TextField size="small" label={t('ui.searchComments')} value={searchText} onChange={(event) => setSearchText(event.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
						<Button type="submit" variant="contained">{t('ui.search')}</Button>
						{inquiry.search.text && <Button type="button" onClick={clearSearchHandler}>{t('ui.clear')}</Button>}
					</Stack>
					<TextField select size="small" label={t('ui.group')} value={inquiry.search.commentGroup ?? ''} onChange={(event) => groupFilterHandler(event.target.value)}>
						<MenuItem value="">{t('ui.all')}</MenuItem>
						{Object.values(CommentGroup).map((group) => <MenuItem value={group} key={group}>{label(group)}</MenuItem>)}
					</TextField>
				</Stack>
			</Stack>

			{getAllCommentsByAdminError ? (
				<Alert severity="error">{t('ui.reviewsAndCommentsCouldNotBeLoaded')}</Alert>
			) : getAllCommentsByAdminLoading && !comments.length ? (
				<CircularProgress />
			) : comments.length ? (
				<>
					<Stack className="admin-list__items">
						{comments.map((comment) => {
							const member = comment.memberData;
							const memberNick = member?.memberNick ?? t('common.member');
							const memberImage = member?.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : undefined;
							const targetHref = getTargetHref(comment);

							return (
								<Stack direction="row" className="admin-list__item admin-comment" key={comment._id}>
									<Avatar component={Link} href={`/member/detail?id=${comment.memberId}`} src={memberImage} alt={memberNick}>
										{memberNick.charAt(0).toUpperCase()}
									</Avatar>
									<Stack className="admin-list__details">
										<Stack direction="row" className="admin-comment__meta">
											<Typography component={Link} href={`/member/detail?id=${comment.memberId}`}><strong>{memberNick}</strong></Typography>
											<Typography>{member?.memberType ?? 'USER'}</Typography>
											<Typography>{new Date(comment.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Seoul' })}</Typography>
										</Stack>
										{comment.commentGroup === CommentGroup.PRODUCT && <Rating value={comment.commentRating ?? 0} readOnly size="small" />}
										<Typography className="admin-comment__content">{comment.commentContent}</Typography>
									</Stack>
									<Typography className={`admin-list__status admin-list__status--${comment.commentGroup.toLowerCase()}`}>{label(comment.commentGroup)}</Typography>
									<Stack direction="row" className="admin-list__actions">
										{targetHref && <Button component={Link} href={targetHref} className="admin-action admin-action--blue">{t('ui.view')}</Button>}
										<Button className="admin-action admin-action--danger" disabled={removeCommentByAdminLoading} onClick={() => removeCommentHandler(comment)}>{t('ui.remove')}</Button>
									</Stack>
								</Stack>
							);
						})}
					</Stack>
					{totalPages > 1 && <Pagination page={inquiry.page} count={totalPages} onChange={paginationHandler} />}
				</>
			) : (
				<Typography>{t('ui.noReviewsOrCommentsFound')}</Typography>
			)}
		</>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return <Stack component="section" className="admin-list admin-list--mobile">{content}</Stack>;
	} else {
		/** RENDER PC **/
		return <Stack component="section" className="admin-list admin-list--pc">{content}</Stack>;
	}
};

export default CommentList;
