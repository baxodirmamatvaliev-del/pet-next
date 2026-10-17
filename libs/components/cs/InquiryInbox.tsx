import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';

import { ANSWER_INQUIRY } from '../../../apollo/user/mutation';
import { GET_ASSIGNED_INQUIRIES } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Inquiry } from '../../types/inquiry/inquiry';
import { useTranslation } from '../../i18n';

const InquiryInbox = ({ enabled = true }: { enabled?: boolean }) => {
	const { t, locale, errorText } = useTranslation();
	const device = useDeviceDetect();
	const router = useRouter();

	/** STATES **/
	const [inquiries, setInquiries] = useState<Inquiry[]>([]);
	const [activeId, setActiveId] = useState('');
	const [answerText, setAnswerText] = useState('');
	const selectedId = typeof router.query.id === 'string' ? router.query.id : '';

	/** APOLLO REQUESTS **/
	const [answerInquiry, { loading: answerInquiryLoading }] = useMutation(ANSWER_INQUIRY);
	const {
		loading: getAssignedInquiriesLoading,
		error: getAssignedInquiriesError,
		refetch: getAssignedInquiriesRefetch,
	} = useQuery(GET_ASSIGNED_INQUIRIES, {
		fetchPolicy: 'network-only',
		skip: !enabled,
		onCompleted: (data: T) => setInquiries(data?.getAssignedInquiries ?? []),
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (selectedId && inquiries.some((inquiry) => inquiry._id === selectedId)) {
			document.getElementById(`inquiry-${selectedId}`)?.scrollIntoView({ block: 'center' });
		}
	}, [selectedId, inquiries]);

	/** HANDLERS **/
	const openAnswerHandler = (id: string) => {
		setActiveId(id);
		setAnswerText('');
	};

	const answerInquiryHandler = async (inquiryId: string) => {
		try {
			if (answerText.trim().length < 2) return;
			await answerInquiry({ variables: { input: { inquiryId, inquiryAnswer: answerText.trim() } } });
			await getAssignedInquiriesRefetch();
			setActiveId('');
			setAnswerText('');
			await sweetTopSmallSuccessAlert(t('ui.replySent'), 800);
		} catch (err) {
			await sweetMixinErrorAlert(errorText(err instanceof Error ? err.message : t('ui.replyCouldNotBeSent')));
		}
	};

	/** COMPUTED VALUES **/
	const content = !enabled ? (
		<Alert severity="error">{t('ui.agentOrAdminAccessIsRequired')}</Alert>
	) : getAssignedInquiriesError ? (
		<Alert severity="error">{t('ui.inboxCouldNotBeLoaded')}</Alert>
	) : getAssignedInquiriesLoading && !inquiries.length ? (
		<Stack className="cs-state">
			<CircularProgress />
		</Stack>
	) : inquiries.length ? (
		<Stack className="cs-tickets">
			{inquiries.map((inquiry) => (
				<Box id={`inquiry-${inquiry._id}`} className={`cs-ticket ${selectedId === inquiry._id ? 'cs-ticket--selected' : ''}`} key={inquiry._id}>
					<Stack direction="row" className="cs-ticket__heading">
						<Box>
							<Typography component="h2">{inquiry.inquiryTitle}</Typography>
							<Typography>
								{t('message.from', { name: inquiry.senderNick })} · {new Date(inquiry.createdAt).toLocaleDateString(locale, { timeZone: 'Asia/Seoul' })}
							</Typography>
						</Box>
						<Chip
							label={inquiry.inquiryStatus === 'ANSWERED' ? t('ui.answered') : t('ui.needsReply')}
							color={inquiry.inquiryStatus === 'ANSWERED' ? 'success' : 'warning'}
							size="small"
						/>
					</Stack>
					<Typography className="cs-ticket__message">{inquiry.inquiryContent}</Typography>
					{inquiry.inquiryAnswer ? (
						<Box className="cs-ticket__reply">
							<Typography component="strong">{t('ui.yourReply')}</Typography>
							<Typography>{inquiry.inquiryAnswer}</Typography>
						</Box>
					) : activeId === inquiry._id ? (
						<Stack className="cs-ticket__answer">
							<TextField
								label={t('ui.yourReply')}
								value={answerText}
								onChange={(event) => setAnswerText(event.target.value)}
								inputProps={{ maxLength: 3000 }}
								multiline
								minRows={3}
							/>
							<Stack direction="row">
								<Button
									onClick={() => void answerInquiryHandler(inquiry._id)}
									variant="contained"
									disabled={answerInquiryLoading || answerText.trim().length < 2}
								>
									{t('ui.sendReply')}
								</Button>
								<Button onClick={() => setActiveId('')}>{t('ui.cancel')}</Button>
							</Stack>
						</Stack>
					) : (
						<Button
							className="cs-ticket__reply-button"
							onClick={() => openAnswerHandler(inquiry._id)}
							variant="outlined"
						>
							{t('ui.reply')}
						</Button>
					)}
				</Box>
			))}
		</Stack>
	) : (
		<Stack className="cs-state">
			<Typography component="h2">{t('ui.inboxIsClear')}</Typography>
			<Typography>{t('ui.newRequestsAddressedToYouWillAppearHere')}</Typography>
		</Stack>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return <Box className="cs-panel cs-panel--mobile">{content}</Box>;
	} else {
		/** RENDER PC **/
		return <Box className="cs-panel cs-panel--pc">{content}</Box>;
	}
};

export default InquiryInbox;
