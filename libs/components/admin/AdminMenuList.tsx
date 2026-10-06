import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

const adminMenu = [
	{ title: 'Overview', href: '/_admin/overview', icon: <DashboardOutlinedIcon /> },
	{ title: 'Products', href: '/_admin/products', icon: <Inventory2OutlinedIcon /> },
	{ title: 'Pet listings', href: '/_admin/pets', icon: <PetsOutlinedIcon /> },
	{ title: 'Orders', href: '/_admin/orders', icon: <ReceiptLongOutlinedIcon /> },
	{ title: 'Members', href: '/_admin/users', icon: <Groups2OutlinedIcon /> },
	{ title: 'Support requests', href: '/_admin/inquiries', icon: <SupportAgentOutlinedIcon /> },
];

const AdminMenuList = () => {
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
