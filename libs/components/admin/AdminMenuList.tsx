import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '../../i18n';

const AdminMenuList = () => {
	const { t } = useTranslation();
	const adminMenu = [
		{ title: t('ui.overview'), href: '/_admin/overview', icon: <DashboardOutlinedIcon /> },
		{ title: t('ui.products'), href: '/_admin/products', icon: <Inventory2OutlinedIcon /> },
		{ title: t('ui.petListings'), href: '/_admin/pets', icon: <PetsOutlinedIcon /> },
		{ title: t('ui.orders'), href: '/_admin/orders', icon: <ReceiptLongOutlinedIcon /> },
		{ title: t('ui.members'), href: '/_admin/users', icon: <Groups2OutlinedIcon /> },
		{ title: t('ui.reviewsComments'), href: '/_admin/comments', icon: <RateReviewOutlinedIcon /> },
		{ title: t('ui.supportRequests'), href: '/_admin/inquiries', icon: <SupportAgentOutlinedIcon /> },
	];

	const router = useRouter();

	return (
		<List className="admin-menu">
			{adminMenu.map((item) => (
				<ListItemButton component={Link} href={item.href} selected={router.pathname === item.href} key={item.href}>
					<ListItemIcon>{item.icon}</ListItemIcon>
					<ListItemText primary={item.title} />
				</ListItemButton>
			))}
		</List>
	);
};

export default AdminMenuList;
