import { useEffect, useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../../apollo/store';
import { GET_MY_INQUIRIES } from '../../../apollo/user/query';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { T } from '../../types/common';
import { Inquiry } from '../../types/inquiry/inquiry';
import { useTranslation } from '../../i18n';

const MyInquiries = () => {
	const { t, locale } = useTranslation();
	const device = useDeviceDetect();
	const router = useRouter();

	/** STATES **/
	const user = useReactiveVar(userVar);
	const [inquiries, setInquiries] = useState<Inquiry[]>([]);
	const selectedId = typeof router.query.id === 'string' ? router.query.id : '';

	/** APOLLO REQUESTS **/
	const { loading: getMyInquiriesLoading, error: getMyInquiriesError } = useQuery(GET_MY_INQUIRIES, {
		fetchPolicy: 'network-only',
		skip: !user?.sub,
		onCompleted: (data: T) => setInquiries(data?.getMyInquiries ?? []),
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (selectedId && inquiries.some((inquiry) => inquiry._id === selectedId)) {
			document.getElementById(`inquiry-${selectedId}`)?.scrollIntoView({ block: 'center' });
		}
	}, [selectedId, inquiries]);

	/** COMPUTED VALUES **/
	const content = !user?.sub ? (
		<Stack className="cs-state">
			<Typography component="h2">{t('ui.signInToViewYourRequests')}</Typography>
			<Button component={Link} href="/account/join?referrer=%2Fcs%3Ftab%3Dmy" variant="contained">
				{t('ui.loginOrSignUp')}
			</Button>
		</Stack>
	) : getMyInquiriesError ? (
		<Alert severity="error">{t('ui.yourRequestsCouldNotBeLoaded')}</Alert>
	) : getMyInquiriesLoading ? (
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
								{t('message.to', { name: inquiry.receiverNick })} · {new Date(inquiry.createdAt).toLocaleDateString(locale, { timeZone: 'Asia/Seoul' })}
							</Typography>
						</Box>
						<Chip
							label={inquiry.inquiryStatus === 'ANSWERED' ? t('ui.answered') : t('ui.waitingForReply')}
							color={inquiry.inquiryStatus === 'ANSWERED' ? 'success' : 'warning'}
							size="small"
						/>
					</Stack>
					<Typography className="cs-ticket__message">{inquiry.inquiryContent}</Typography>
					{inquiry.inquiryAnswer && (
						<Box className="cs-ticket__reply">
							<Typography component="strong">{t('message.replyFrom', { name: inquiry.receiverNick })}</Typography>
							<Typography>{inquiry.inquiryAnswer}</Typography>
						</Box>
					)}
				</Box>
			))}
		</Stack>
	) : (
		<Stack className="cs-state">
			<Typography component="h2">{t('ui.noRequestsYet')}</Typography>
			<Button component={Link} href="/cs?tab=ask" variant="outlined">
				{t('ui.askForHelp')}
			</Button>
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

export default MyInquiries;
