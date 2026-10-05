import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

const adminMenu = [
	{ title: 'Products', href: '/_admin/products', icon: <Inventory2OutlinedIcon /> },
	{ title: 'Pet listings', href: '/_admin/pets', icon: <PetsOutlinedIcon /> },
	{ title: 'Orders', href: '/_admin/orders', icon: <ReceiptLongOutlinedIcon /> },
	{ title: 'Members', href: '/_admin/users', icon: <Groups2OutlinedIcon /> },
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
