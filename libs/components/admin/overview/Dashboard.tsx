import { useState } from 'react';
import { useQuery } from '@apollo/client';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { GET_ALL_MEMBERS_BY_ADMIN, GET_ALL_ORDERS_BY_ADMIN, GET_ALL_PETS_BY_ADMIN, GET_ALL_PRODUCTS_BY_ADMIN } from '../../../../apollo/admin/query';
import { Direction } from '../../../enums/common.enum';
import { AdminOrdersInquiry } from '../../../types/order/order.input';
import { Order } from '../../../types/order/order';
import { AdminPetsInquiry } from '../../../types/pet/pet.input';
import { AdminProductsInquiry } from '../../../types/product/product.input';
import { MembersInquiry } from '../../../types/member/member.input';
import { T } from '../../../types/common';
import { formatterStr } from '../../../utils';

const productInquiry: AdminProductsInquiry = { page: 1, limit: 1, sort: 'createdAt', direction: Direction.DESC, search: {} };
const petInquiry: AdminPetsInquiry = { page: 1, limit: 1, sort: 'createdAt', direction: Direction.DESC, search: {} };
const orderInquiry: AdminOrdersInquiry = { page: 1, limit: 5, search: {} };
const memberInquiry: MembersInquiry = { page: 1, limit: 1, sort: 'createdAt', direction: Direction.DESC, search: {} };

const Dashboard = () => {
	/** STATES **/
	const [productTotal, setProductTotal] = useState(0);
	const [petTotal, setPetTotal] = useState(0);
	const [orderTotal, setOrderTotal] = useState(0);
	const [memberTotal, setMemberTotal] = useState(0);
	const [recentOrders, setRecentOrders] = useState<Order[]>([]);

	/** APOLLO REQUESTS **/
	const { loading: getProductsLoading, error: getProductsError } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: productInquiry },
		onCompleted: (data: T) => setProductTotal(data?.getAllProductsByAdmin?.metaCounter[0]?.total ?? 0),
	});
	const { loading: getPetsLoading, error: getPetsError } = useQuery(GET_ALL_PETS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: petInquiry },
		onCompleted: (data: T) => setPetTotal(data?.getAllPetsByAdmin?.metaCounter[0]?.total ?? 0),
	});
	const { loading: getOrdersLoading, error: getOrdersError } = useQuery(GET_ALL_ORDERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: orderInquiry },
		onCompleted: (data: T) => {
			setOrderTotal(data?.getAllOrdersByAdmin?.metaCounter[0]?.total ?? 0);
			setRecentOrders(data?.getAllOrdersByAdmin?.list ?? []);
		},
	});
	const { loading: getMembersLoading, error: getMembersError } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: memberInquiry },
		onCompleted: (data: T) => setMemberTotal(data?.getAllMembersByAdmin?.metaCounter[0]?.total ?? 0),
	});

	/** COMPUTED VALUES **/
	const summary = [
		{ title: 'Products', total: productTotal, loading: getProductsLoading, error: getProductsError, href: '/_admin/products', icon: <Inventory2OutlinedIcon />, color: 'green' },
		{ title: 'Pet listings', total: petTotal, loading: getPetsLoading, error: getPetsError, href: '/_admin/pets', icon: <PetsOutlinedIcon />, color: 'orange' },
		{ title: 'Orders', total: orderTotal, loading: getOrdersLoading, error: getOrdersError, href: '/_admin/orders', icon: <ReceiptLongOutlinedIcon />, color: 'blue' },
		{ title: 'Members', total: memberTotal, loading: getMembersLoading, error: getMembersError, href: '/_admin/users', icon: <Groups2OutlinedIcon />, color: 'purple' },
	];

	return (
		<Stack className="admin-dashboard">
			<Stack className="admin-dashboard__heading">
				<Typography component="h1">Overview</Typography>
				<Typography>Live totals and the latest orders from PetNest.</Typography>
			</Stack>

			<Box className="admin-dashboard__summary">
				{summary.map((item) => (
					<Stack component={Link} href={item.href} className={`admin-dashboard__card admin-dashboard__card--${item.color}`} key={item.title}>
						<Stack direction="row" className="admin-dashboard__card-top">
							<Box className="admin-dashboard__icon">{item.icon}</Box>
							<ArrowForwardRoundedIcon className="admin-dashboard__arrow" />
						</Stack>
						<Typography component="strong">{item.loading ? <CircularProgress size={28} color="inherit" /> : item.error ? '—' : formatterStr(item.total)}</Typography>
						<Typography>{item.title}</Typography>
					</Stack>
				))}
			</Box>

			<Stack className="admin-dashboard__orders">
				<Stack direction="row" className="admin-dashboard__orders-heading">
					<Stack><Typography component="h2">Recent orders</Typography><Typography>The five latest orders placed by customers.</Typography></Stack>
					<Button component={Link} href="/_admin/orders" endIcon={<ArrowForwardRoundedIcon />}>View all orders</Button>
				</Stack>
				{getOrdersError ? <Alert severity="error">Orders could not be loaded.</Alert> : getOrdersLoading ? <CircularProgress /> : recentOrders.length ? (
					<Stack className="admin-dashboard__order-list">
						{recentOrders.map((order) => (
							<Stack direction="row" className="admin-dashboard__order" key={order._id}>
								<Stack><Typography component="strong">#{order._id.slice(-8).toUpperCase()}</Typography><Typography>{order.recipientName}</Typography></Stack>
								<Typography className={`admin-dashboard__order-status admin-dashboard__order-status--${order.orderStatus.toLowerCase()}`}>{order.orderStatus.replaceAll('_', ' ')}</Typography>
								<Typography component="strong">₩{formatterStr(order.totalAmount)}</Typography>
							</Stack>
						))}
					</Stack>
				) : <Typography className="admin-dashboard__empty">No orders yet.</Typography>}
			</Stack>
		</Stack>
	);
};

export default Dashboard;
