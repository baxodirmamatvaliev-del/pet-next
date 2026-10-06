import { Box, Typography } from '@mui/material';

import InquiryInbox from '../../../libs/components/cs/InquiryInbox';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';

const AdminInquiries = () => (
	<Box className="cs-admin-inbox">
		<Typography component="h1">Support requests</Typography>
		<Typography>Requests addressed to your admin account.</Typography>
		<InquiryInbox />
	</Box>
);

export default withAdminLayout(AdminInquiries);
