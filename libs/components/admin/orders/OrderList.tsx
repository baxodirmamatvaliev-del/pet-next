import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';

import { CONFIRM_PAYMENT, UPDATE_ORDER_STATUS_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { GET_ALL_ORDERS_BY_ADMIN, GET_PAYMENT_BY_ORDER_BY_ADMIN } from '../../../../apollo/admin/query';
import { Message } from '../../../enums/common.enum';
import { OrderStatus } from '../../../enums/order.enum';
import { PaymentStatus } from '../../../enums/payment.enum';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { T } from '../../../types/common';
import { Order } from '../../../types/order/order';
import { AdminOrdersInquiry } from '../../../types/order/order.input';
import { formatterStr } from '../../../utils';
import { useTranslation } from '../../../i18n';

const initialInquiry: AdminOrdersInquiry = { page: 1, limit: 10, search: {} };

const OrderList = () => {
	const { t, label, errorText } = useTranslation();
	/** STATES **/
	const [inquiry, setInquiry] = useState<AdminOrdersInquiry>(initialInquiry);
	const [orders, setOrders] = useState<Order[]>([]);
	const [total, setTotal] = useState(0);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

	/** APOLLO REQUESTS **/
	const [updateOrderStatusByAdmin, { loading: updateOrderLoading }] = useMutation(UPDATE_ORDER_STATUS_BY_ADMIN);
	const [confirmPayment, { loading: confirmPaymentLoading }] = useMutation(CONFIRM_PAYMENT);
	const {
		loading: getPaymentLoading,
		data: getPaymentData,
		error: getPaymentError,
	} = useQuery(GET_PAYMENT_BY_ORDER_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { orderId: selectedOrder?._id ?? '' },
		skip: !selectedOrder,
	});
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
			if (!await sweetConfirmAlert(
				t('message.changeOrderStatus', { id: order._id.slice(-8).toUpperCase(), status: label(orderStatus) }),
				t('common.confirm'),
				t('ui.cancel'),
			)) return;
			await updateOrderStatusByAdmin({ variables: { input: { _id: order._id, orderStatus } } });
			await getAllOrdersByAdminRefetch({ input: inquiry });
			await sweetTopSmallSuccessAlert(t('ui.orderUpdated'), 800);
		} catch (error) {
			await sweetMixinErrorAlert(errorText(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG));
		}
	};

	const confirmPaymentHandler = async () => {
		try {
			if (!selectedOrder || !selectedPayment || selectedPayment.paymentStatus !== PaymentStatus.PENDING) return;
			if (!await sweetConfirmAlert(
				t('ui.noRealChargeWasMadeConfirmThisDemo'),
				t('common.confirm'),
				t('ui.cancel'),
			)) return;

			await confirmPayment({ variables: { input: { paymentId: selectedPayment._id } } });
			await getAllOrdersByAdminRefetch({ input: inquiry });
			setSelectedOrder(null);
			await sweetTopSmallSuccessAlert(t('ui.demoPaymentConfirmed'), 800);
		} catch (error) {
			await sweetMixinErrorAlert(errorText(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG));
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / inquiry.limit);
	const payment = (getPaymentData as T | undefined)?.getPaymentByOrderByAdmin;
	const selectedPayment = payment?.orderId === selectedOrder?._id ? payment : null;

	return (
		<Stack className="admin-list">
			<Stack direction="row" className="admin-list__heading">
				<Stack><Typography component="h1">{t('ui.orders')}</Typography><Typography>{t('ui.reviewDemoPaymentRequestsShipmentsAndDeliveries')}</Typography></Stack>
				<TextField select size="small" label={t('ui.status')} value={inquiry.search.orderStatus ?? ''} onChange={(event) => statusFilterHandler(event.target.value)}>
					<MenuItem value="">{t('ui.all')}</MenuItem>
					{Object.values(OrderStatus).map((status) => <MenuItem value={status} key={status}>{label(status)}</MenuItem>)}
				</TextField>
			</Stack>
			{getAllOrdersByAdminError ? <Alert severity="error">{t('ui.ordersCouldNotBeLoaded')}</Alert> : getAllOrdersByAdminLoading && !orders.length ? <CircularProgress /> : orders.length ? (
				<>
					<Stack className="admin-list__items">
						{orders.map((order) => (
							<Stack direction="row" className="admin-list__item" key={order._id}>
								<Stack className="admin-list__details">
									<Typography component="strong">#{order._id.slice(-8).toUpperCase()} · {order.recipientName}</Typography>
									<Typography>{order.orderItems.map((item) => `${item.productName} ×${item.quantity}`).join(', ')}</Typography>
									<Typography>{t('ui.customer')} {order.memberId} · ₩{formatterStr(order.totalAmount)}</Typography>
								</Stack>
								<Typography className={`admin-list__status admin-list__status--${order.orderStatus.toLowerCase()}`}>{order.orderStatus === OrderStatus.PAYMENT_CONFIRMED ? t('ui.demoConfirmed') : label(order.orderStatus)}</Typography>
								<Stack direction="row" className="admin-list__actions">
									{order.orderStatus === OrderStatus.PENDING && <Button className="admin-action admin-action--warning" onClick={() => setSelectedOrder(order)}>{t('ui.reviewDemoPayment')}</Button>}
									{order.orderStatus === OrderStatus.PAYMENT_CONFIRMED && <Button className="admin-action admin-action--blue" disabled={updateOrderLoading} onClick={() => updateOrderHandler(order, OrderStatus.IN_TRANSIT)}>{t('ui.markInTransit')}</Button>}
									{order.orderStatus === OrderStatus.IN_TRANSIT && <Button className="admin-action admin-action--positive" disabled={updateOrderLoading} onClick={() => updateOrderHandler(order, OrderStatus.DELIVERED_TO_CUSTOMER)}>{t('ui.markDelivered')}</Button>}
								</Stack>
							</Stack>
						))}
					</Stack>
					{totalPages > 1 && <Pagination page={inquiry.page} count={totalPages} onChange={(_event, page) => setInquiry({ ...inquiry, page })} />}
				</>
			) : <Typography>{t('ui.noOrdersFound')}</Typography>}
			<Dialog open={Boolean(selectedOrder)} onClose={() => !confirmPaymentLoading && setSelectedOrder(null)} fullWidth maxWidth="xs">
				<DialogTitle>{t('ui.reviewDemoPayment')}</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ pt: 1 }}>
						<Alert severity="warning">{t('ui.noCardOrKakaoPaymentHasBeenCharged')}</Alert>
						<Typography>{t('message.orderTitle', { id: selectedOrder?._id.slice(-8).toUpperCase() ?? '' })} · ₩{formatterStr(selectedOrder?.totalAmount ?? 0)}</Typography>
						{getPaymentLoading ? <CircularProgress size={24} /> : getPaymentError ? (
							<Alert severity="error">{t('ui.paymentRequestCouldNotBeLoaded')}</Alert>
						) : selectedPayment ? (
							<Stack spacing={0.5}>
								<Typography>{t('ui.method')} {label(selectedPayment.paymentMethod)}</Typography>
								<Typography>{t('ui.statusLabel')} {label(selectedPayment.paymentStatus)}</Typography>
								<Typography>{t('ui.amount')}{formatterStr(selectedPayment.paymentAmount)}</Typography>
							</Stack>
						) : <Alert severity="info">{t('ui.noPaymentRequestExistsForThisOrderYet')}</Alert>}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setSelectedOrder(null)} disabled={confirmPaymentLoading}>{t('ui.close')}</Button>
					<Button variant="contained" onClick={confirmPaymentHandler} disabled={confirmPaymentLoading || getPaymentLoading || !selectedPayment || selectedPayment.paymentStatus !== PaymentStatus.PENDING || selectedPayment.paymentAmount !== selectedOrder?.totalAmount}>
						{confirmPaymentLoading ? t('ui.confirming') : t('ui.confirmDemoPayment')}
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
};

export default OrderList;
