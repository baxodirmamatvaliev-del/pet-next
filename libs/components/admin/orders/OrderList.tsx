import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Alert, Button, CircularProgress, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';

import { UPDATE_ORDER_STATUS_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { GET_ALL_ORDERS_BY_ADMIN } from '../../../../apollo/admin/query';
import { Message } from '../../../enums/common.enum';
import { OrderStatus } from '../../../enums/order.enum';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { T } from '../../../types/common';
import { Order } from '../../../types/order/order';
import { AdminOrdersInquiry } from '../../../types/order/order.input';
import { formatterStr } from '../../../utils';

const initialInquiry: AdminOrdersInquiry = { page: 1, limit: 10, search: {} };

const OrderList = () => {
	/** STATES **/
	const [inquiry, setInquiry] = useState<AdminOrdersInquiry>(initialInquiry);
	const [orders, setOrders] = useState<Order[]>([]);
	const [total, setTotal] = useState(0);

	/** APOLLO REQUESTS **/
	const [updateOrderStatusByAdmin, { loading: updateOrderLoading }] = useMutation(UPDATE_ORDER_STATUS_BY_ADMIN);
	const {
		loading: getAllOrdersByAdminLoading,
		error: getAllOrdersByAdminError,
		refetch: getAllOrdersByAdminRefetch,
	} = useQuery(GET_ALL_ORDERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setOrders(data?.getAllOrdersByAdmin?.list ?? []);
			setTotal(data?.getAllOrdersByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const statusFilterHandler = (value: string) => {
		setInquiry({ ...inquiry, page: 1, search: { orderStatus: value ? value as OrderStatus : undefined } });
	};

	const updateOrderHandler = async (order: Order, orderStatus: OrderStatus) => {
		try {
			if (!await sweetConfirmAlert(`Move order #${order._id.slice(-8).toUpperCase()} to ${orderStatus.replaceAll('_', ' ').toLowerCase()}?`)) return;
			await updateOrderStatusByAdmin({ variables: { input: { _id: order._id, orderStatus } } });
			await getAllOrdersByAdminRefetch({ input: inquiry });
			await sweetTopSmallSuccessAlert('Order updated', 800);
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG);
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / inquiry.limit);

	return (
		<Stack className="admin-list">
			<Stack direction="row" className="admin-list__heading">
				<Stack><Typography component="h1">Orders</Typography><Typography>Track confirmed payments, shipments and deliveries.</Typography></Stack>
				<TextField select size="small" label="Status" value={inquiry.search.orderStatus ?? ''} onChange={(event) => statusFilterHandler(event.target.value)}>
					<MenuItem value="">All</MenuItem>
					{Object.values(OrderStatus).map((status) => <MenuItem value={status} key={status}>{status.replaceAll('_', ' ')}</MenuItem>)}
				</TextField>
			</Stack>
			{getAllOrdersByAdminError ? <Alert severity="error">Orders could not be loaded.</Alert> : getAllOrdersByAdminLoading && !orders.length ? <CircularProgress /> : orders.length ? (
				<>
					<Stack className="admin-list__items">
						{orders.map((order) => (
							<Stack direction="row" className="admin-list__item" key={order._id}>
								<Stack className="admin-list__details">
									<Typography component="strong">#{order._id.slice(-8).toUpperCase()} · {order.recipientName}</Typography>
									<Typography>{order.orderItems.map((item) => `${item.productName} ×${item.quantity}`).join(', ')}</Typography>
									<Typography>Customer: {order.memberId} · ₩{formatterStr(order.totalAmount)}</Typography>
								</Stack>
								<Typography className={`admin-list__status admin-list__status--${order.orderStatus.toLowerCase()}`}>{order.orderStatus.replaceAll('_', ' ')}</Typography>
								<Stack direction="row" className="admin-list__actions">
									{order.orderStatus === OrderStatus.PAYMENT_CONFIRMED && <Button className="admin-action admin-action--blue" disabled={updateOrderLoading} onClick={() => updateOrderHandler(order, OrderStatus.IN_TRANSIT)}>Mark in transit</Button>}
									{order.orderStatus === OrderStatus.IN_TRANSIT && <Button className="admin-action admin-action--positive" disabled={updateOrderLoading} onClick={() => updateOrderHandler(order, OrderStatus.DELIVERED_TO_CUSTOMER)}>Mark delivered</Button>}
								</Stack>
							</Stack>
						))}
					</Stack>
					{totalPages > 1 && <Pagination page={inquiry.page} count={totalPages} onChange={(_event, page) => setInquiry({ ...inquiry, page })} />}
				</>
			) : <Typography>No orders found.</Typography>}
		</Stack>
	);
};

export default OrderList;
