import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Alert, Box, Button, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';

import { ANSWER_INQUIRY } from '../../../apollo/user/mutation';
import { GET_ASSIGNED_INQUIRIES } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Inquiry } from '../../types/inquiry/inquiry';

const InquiryInbox = ({ enabled = true }: { enabled?: boolean }) => {
	const device = useDeviceDetect();

	/** STATES **/
	const [inquiries, setInquiries] = useState<Inquiry[]>([]);
	const [activeId, setActiveId] = useState('');
	const [answerText, setAnswerText] = useState('');

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
			await sweetTopSmallSuccessAlert('Reply sent', 800);
		} catch (err) {
			await sweetMixinErrorAlert(err instanceof Error ? err.message : 'Reply could not be sent.');
		}
	};

	/** COMPUTED VALUES **/
	const content = !enabled ? (
		<Alert severity="error">Agent or admin access is required.</Alert>
	) : getAssignedInquiriesError ? (
		<Alert severity="error">Inbox could not be loaded.</Alert>
	) : getAssignedInquiriesLoading && !inquiries.length ? (
		<Stack className="cs-state">
			<CircularProgress />
		</Stack>
	) : inquiries.length ? (
		<Stack className="cs-tickets">
			{inquiries.map((inquiry) => (
				<Box className="cs-ticket" key={inquiry._id}>
					<Stack direction="row" className="cs-ticket__heading">
						<Box>
							<Typography component="h2">{inquiry.inquiryTitle}</Typography>
							<Typography>
								From {inquiry.senderNick} · {new Date(inquiry.createdAt).toLocaleDateString()}
							</Typography>
						</Box>
						<Chip
							label={inquiry.inquiryStatus === 'ANSWERED' ? 'Answered' : 'Needs reply'}
							color={inquiry.inquiryStatus === 'ANSWERED' ? 'success' : 'warning'}
							size="small"
						/>
					</Stack>
					<Typography className="cs-ticket__message">{inquiry.inquiryContent}</Typography>
					{inquiry.inquiryAnswer ? (
						<Box className="cs-ticket__reply">
							<Typography component="strong">Your reply</Typography>
							<Typography>{inquiry.inquiryAnswer}</Typography>
						</Box>
					) : activeId === inquiry._id ? (
						<Stack className="cs-ticket__answer">
							<TextField
								label="Your reply"
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
									Send reply
								</Button>
								<Button onClick={() => setActiveId('')}>Cancel</Button>
							</Stack>
						</Stack>
					) : (
						<Button
							className="cs-ticket__reply-button"
							onClick={() => openAnswerHandler(inquiry._id)}
							variant="outlined"
						>
							Reply
						</Button>
					)}
				</Box>
			))}
		</Stack>
	) : (
		<Stack className="cs-state">
			<Typography component="h2">Inbox is clear</Typography>
			<Typography>New requests addressed to you will appear here.</Typography>
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
