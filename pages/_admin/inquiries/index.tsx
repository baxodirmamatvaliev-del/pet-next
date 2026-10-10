import { Box, Typography } from '@mui/material';

import InquiryInbox from '../../../libs/components/cs/InquiryInbox';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { useTranslation } from '../../../libs/i18n';

const AdminInquiries = () => {
	const { t } = useTranslation();
	return (
		<Box className="cs-admin-inbox">
			<Typography component="h1">{t('ui.supportRequests')}</Typography>
			<Typography>{t('ui.requestsAddressedToYourAdminAccount')}</Typography>
			<InquiryInbox />
		</Box>
	);
};

export default withAdminLayout(AdminInquiries);
