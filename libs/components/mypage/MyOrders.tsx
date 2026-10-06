import React, { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';

import { userVar } from '../../../apollo/store';
import { CANCEL_ORDER } from '../../../apollo/user/mutation';
import { GET_MY_ORDERS } from '../../../apollo/user/query';
import { Message } from '../../enums/common.enum';
import { OrderStatus } from '../../enums/order.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Order } from '../../types/order/order';
import { MyOrdersInquiry } from '../../types/order/order.input';
import OrderCard from './OrderCard';

interface MyOrdersProps {
	initialInput?: MyOrdersInquiry;
}

const MyOrders = (props: MyOrdersProps) => {
	const { initialInput = MyOrders.defaultProps.initialInput } = props;
	const device = useDeviceDetect();

	/** STATES **/
	const [searchFilter, setSearchFilter] = useState<MyOrdersInquiry>(initialInput);
	const [orders, setOrders] = useState<Order[]>([]);
	const [total, setTotal] = useState(0);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [cancelOrder, { loading: cancelOrderLoading }] = useMutation(CANCEL_ORDER);
	const {
		loading: getMyOrdersLoading,
		error: getMyOrdersError,
		refetch: getMyOrdersRefetch,
	} = useQuery(GET_MY_ORDERS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !user?.sub,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getMyOrders?.list) setOrders(data.getMyOrders.list);
			setTotal(data?.getMyOrders?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const orderStatusHandler = (orderStatus?: OrderStatus) => {
		setSearchFilter({
			...searchFilter,
			page: 1,
			search: { orderStatus },
		});
	};

	const paginationHandler = (_event: ChangeEvent<unknown>, page: number) => {
		setSearchFilter({ ...searchFilter, page });
	};

	const cancelOrderHandler = async (orderId: string) => {
		try {
			const isConfirmed = await sweetConfirmAlert('Do you want to cancel this order?');
			if (!isConfirmed) return;

			await cancelOrder({ variables: { orderId } });
			await getMyOrdersRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('Order cancelled', 800);
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / searchFilter.limit);
	const selectedStatus = searchFilter.search.orderStatus;

	/** RENDER **/
	return (
		<Box className="my-orders">
			<Box className="my-orders__heading">
				<Typography component="h1">My Orders</Typography>
				<Typography>Track, review and manage all of your PetNest orders.</Typography>
			</Box>

			{device === 'mobile' ? (
				/** RENDER MOBILE ORDER FILTERS **/
				<Stack direction="row" className="order-tabs order-tabs--mobile">
					<Button className={!selectedStatus ? 'active' : ''} onClick={() => orderStatusHandler()}>All</Button>
					<Button className={selectedStatus === OrderStatus.PENDING ? 'active' : ''} onClick={() => orderStatusHandler(OrderStatus.PENDING)}>Pending</Button>
					<Button className={selectedStatus === OrderStatus.PAYMENT_CONFIRMED ? 'active' : ''} onClick={() => orderStatusHandler(OrderStatus.PAYMENT_CONFIRMED)}>Demo confirmed</Button>
					<Button className={selectedStatus === OrderStatus.IN_TRANSIT ? 'active' : ''} onClick={() => orderStatusHandler(OrderStatus.IN_TRANSIT)}>Shipping</Button>
					<Button className={selectedStatus === OrderStatus.DELIVERED_TO_CUSTOMER ? 'active' : ''} onClick={() => orderStatusHandler(OrderStatus.DELIVERED_TO_CUSTOMER)}>Delivered</Button>
					<Button className={selectedStatus === OrderStatus.CANCELLED ? 'active' : ''} onClick={() => orderStatusHandler(OrderStatus.CANCELLED)}>Cancelled</Button>
				</Stack>
			) : (
				/** RENDER PC ORDER FILTERS **/
				<Stack direction="row" className="order-tabs order-tabs--pc">
					<Button className={!selectedStatus ? 'active' : ''} onClick={() => orderStatusHandler()}>All</Button>
					<Button className={selectedStatus === OrderStatus.PENDING ? 'active' : ''} onClick={() => orderStatusHandler(OrderStatus.PENDING)}>Pending</Button>
					<Button className={selectedStatus === OrderStatus.PAYMENT_CONFIRMED ? 'active' : ''} onClick={() => orderStatusHandler(OrderStatus.PAYMENT_CONFIRMED)}>Demo confirmed</Button>
					<Button className={selectedStatus === OrderStatus.IN_TRANSIT ? 'active' : ''} onClick={() => orderStatusHandler(OrderStatus.IN_TRANSIT)}>In transit</Button>
					<Button className={selectedStatus === OrderStatus.DELIVERED_TO_CUSTOMER ? 'active' : ''} onClick={() => orderStatusHandler(OrderStatus.DELIVERED_TO_CUSTOMER)}>Delivered</Button>
					<Button className={selectedStatus === OrderStatus.CANCELLED ? 'active' : ''} onClick={() => orderStatusHandler(OrderStatus.CANCELLED)}>Cancelled</Button>
				</Stack>
			)}

			{getMyOrdersLoading && !orders.length ? (
				<Stack className="my-orders__state">
					<CircularProgress color="primary" />
				</Stack>
			) : getMyOrdersError ? (
				<Alert severity="error">Orders could not be loaded.</Alert>
			) : orders.length ? (
				<Stack className="order-list">
					{orders.map((order) => (
						<OrderCard
							order={order}
							cancelOrderHandler={cancelOrderHandler}
							cancelOrderLoading={cancelOrderLoading}
							key={order._id}
						/>
					))}
				</Stack>
			) : (
				<Stack className="my-orders__state">
					<Typography component="h2">No orders found</Typography>
					<Typography>Your orders will appear here after checkout.</Typography>
				</Stack>
			)}

			{orders.length > 0 && totalPages > 0 && (
				<Stack direction="row" className="my-orders__pagination">
					<Pagination
						page={searchFilter.page}
						count={totalPages}
						onChange={paginationHandler}
						color="primary"
						shape="rounded"
					/>
					<Typography>{total} orders</Typography>
				</Stack>
			)}
		</Box>
	);
};

MyOrders.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {},
	},
};

export default MyOrders;
