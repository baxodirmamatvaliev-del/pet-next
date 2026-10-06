import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { Alert, Box, Button, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../../apollo/store';
import { CREATE_INQUIRY } from '../../../apollo/user/mutation';
import { GET_SUPPORT_RECIPIENTS } from '../../../apollo/user/query';
import { MemberType } from '../../enums/member.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { InquiryInput, SupportRecipient } from '../../types/inquiry/inquiry';

const initialInput: InquiryInput = { receiverId: '', inquiryTitle: '', inquiryContent: '' };

const Inquiry = () => {
	const router = useRouter();
	const device = useDeviceDetect();

	/** STATES **/
	const user = useReactiveVar(userVar);
	const [recipients, setRecipients] = useState<SupportRecipient[]>([]);
	const [recipientType, setRecipientType] = useState<MemberType.AGENT | MemberType.ADMIN>(MemberType.AGENT);
	const [input, setInput] = useState<InquiryInput>(initialInput);

	/** APOLLO REQUESTS **/
	const [createInquiry, { loading: createInquiryLoading }] = useMutation(CREATE_INQUIRY);
	const { loading: getSupportRecipientsLoading, error: getSupportRecipientsError } = useQuery(GET_SUPPORT_RECIPIENTS, {
		fetchPolicy: 'cache-and-network',
		skip: !router.isReady,
		onCompleted: (data: T) => {
			const list = data?.getSupportRecipients ?? [];
			setRecipients(list);
			const selected = list.find((item) => item._id === router.query.recipient && item._id !== user?.sub);
			if (selected) {
				setRecipientType(selected.memberType as MemberType.AGENT | MemberType.ADMIN);
				setInput((previous) => ({ ...previous, receiverId: selected._id }));
			}
		},
	});

	/** HANDLERS **/
	const recipientTypeHandler = (type: MemberType.AGENT | MemberType.ADMIN) => {
		setRecipientType(type);
		setInput({ ...input, receiverId: '' });
	};

	const inputChangeHandler = (name: keyof InquiryInput, value: string) => {
		setInput((previous) => ({ ...previous, [name]: value }));
	};

	const createInquiryHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		try {
			if (!user?.sub) return;
			if (!input.receiverId || input.inquiryTitle.trim().length < 3 || input.inquiryContent.trim().length < 10) return;
			await createInquiry({
				variables: {
					input: {
						receiverId: input.receiverId,
						inquiryTitle: input.inquiryTitle.trim(),
						inquiryContent: input.inquiryContent.trim(),
					},
				},
			});
			await sweetTopSmallSuccessAlert('Request sent', 800);
			void router.push('/cs?tab=my');
		} catch (err) {
			await sweetMixinErrorAlert(err instanceof Error ? err.message : 'Request could not be sent.');
		}
	};

	/** COMPUTED VALUES **/
	const visibleRecipients = recipients.filter((item) => item.memberType === recipientType && item._id !== user?.sub);
	const content = !user?.sub ? (
		<Stack className="cs-state">
			<Typography component="h2">Sign in to send a request</Typography>
			<Typography>Your request and its reply will stay in your account.</Typography>
			<Button component={Link} href="/account/join?referrer=%2Fcs%3Ftab%3Dask" variant="contained">
				Login or sign up
			</Button>
		</Stack>
	) : (
		<Stack component="form" className="cs-inquiry" onSubmit={createInquiryHandler}>
			<Typography component="h2">Who would you like to contact?</Typography>
			<Typography className="cs-inquiry__hint">
				Choose an agent for seller or listing questions, or admin for account and platform issues.
			</Typography>
			<Stack direction="row" className="cs-inquiry__roles">
				<Button
					className={recipientType === MemberType.AGENT ? 'active' : ''}
					startIcon={<SupportAgentOutlinedIcon />}
					onClick={() => recipientTypeHandler(MemberType.AGENT)}
				>
					Agents
				</Button>
				<Button
					className={recipientType === MemberType.ADMIN ? 'active' : ''}
					startIcon={<AdminPanelSettingsOutlinedIcon />}
					onClick={() => recipientTypeHandler(MemberType.ADMIN)}
				>
					Admin
				</Button>
			</Stack>
			{getSupportRecipientsError && <Alert severity="error">Support contacts could not be loaded.</Alert>}
			<TextField
				select
				label={recipientType === MemberType.AGENT ? 'Choose an agent' : 'Choose an admin'}
				value={input.receiverId}
				onChange={(event) => inputChangeHandler('receiverId', event.target.value)}
				required
				fullWidth
			>
				{visibleRecipients.map((recipient) => (
					<MenuItem key={recipient._id} value={recipient._id}>
						{recipient.memberNick}
					</MenuItem>
				))}
			</TextField>
			{getSupportRecipientsLoading && <CircularProgress size={22} />}
			{!getSupportRecipientsLoading && !getSupportRecipientsError && !visibleRecipients.length && (
				<Alert severity="info">
					No active {recipientType === MemberType.AGENT ? 'agents' : 'admins'} are available right now.
				</Alert>
			)}
			<TextField
				label="Subject"
				value={input.inquiryTitle}
				onChange={(event) => inputChangeHandler('inquiryTitle', event.target.value)}
				inputProps={{ maxLength: 100, minLength: 3 }}
				required
				fullWidth
			/>
			<TextField
				label="Describe your issue"
				value={input.inquiryContent}
				onChange={(event) => inputChangeHandler('inquiryContent', event.target.value)}
				inputProps={{ maxLength: 3000, minLength: 10 }}
				multiline
				minRows={5}
				required
				fullWidth
			/>
			<Box className="cs-inquiry__actions">
				<Button type="submit" variant="contained" disabled={createInquiryLoading || !input.receiverId}>
					{createInquiryLoading ? 'Sending...' : 'Send request'}
				</Button>
			</Box>
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

export default Inquiry;
