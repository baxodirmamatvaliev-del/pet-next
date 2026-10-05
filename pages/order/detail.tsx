import { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../apollo/store';
import { CANCEL_ORDER } from '../../apollo/user/mutation';
import { GET_ORDER } from '../../apollo/user/query';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import OrderCard from '../../libs/components/mypage/OrderCard';
import { Message } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';
import { Order } from '../../libs/types/order/order';

const OrderDetail: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const orderId = typeof router.query.id === 'string' ? router.query.id : '';

	/** STATES **/
	const [order, setOrder] = useState<Order | null>(null);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [cancelOrder, { loading: cancelOrderLoading }] = useMutation(CANCEL_ORDER);
	const {
		loading: getOrderLoading,
		error: getOrderError,
		refetch: getOrderRefetch,
	} = useQuery(GET_ORDER, {
		fetchPolicy: 'network-only',
		variables: { orderId },
		skip: !user?.sub || !orderId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getOrder) setOrder(data.getOrder);
		},
	});

	/** HANDLERS **/
	const cancelOrderHandler = async (id: string) => {
		try {
			const isConfirmed = await sweetConfirmAlert('Do you want to cancel this order?');
			if (!isConfirmed) return;

			await cancelOrder({ variables: { orderId: id } });
			await getOrderRefetch({ orderId: id });
			await sweetTopSmallSuccessAlert('Order cancelled', 800);
		} catch (error) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	/** COMPUTED VALUES **/
	const signInHref = `/account/join?referrer=${encodeURIComponent(`/order/detail?id=${orderId}`)}`;
	const orderContent = !router.isReady ? (
		<Stack className="order-detail-page__state"><CircularProgress color="primary" /></Stack>
	) : !user?.sub ? (
		<Stack className="order-detail-page__state">
			<Typography component="h1">Sign in to view your order</Typography>
			<Button component={Link} href={signInHref} variant="contained">Login or sign up</Button>
		</Stack>
	) : !orderId ? (
		<Alert severity="warning">Choose an order from your order history.</Alert>
	) : getOrderError ? (
		<Alert severity="error">Order could not be loaded.</Alert>
	) : getOrderLoading && order?._id !== orderId ? (
		<Stack className="order-detail-page__state"><CircularProgress color="primary" /></Stack>
	) : order?._id === orderId ? (
		<>
			<Stack className="order-detail-page__heading">
				<Typography component="h1">Order #{order._id.slice(-8).toUpperCase()}</Typography>
				<Typography>Review your items, delivery details and current order status.</Typography>
			</Stack>
			<OrderCard order={order} cancelOrderHandler={cancelOrderHandler} cancelOrderLoading={cancelOrderLoading} showDetailsLink={false} />
		</>
	) : (
		<Alert severity="error">Order could not be loaded.</Alert>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<>
				<Head><title>Order details | PetNest Korea</title></Head>
				<Box component="main" id="my-page" className="order-detail-page order-detail-page--mobile">
					<Box className="container">
						<Button component={Link} href="/mypage?category=myOrders">← My orders</Button>
						{orderContent}
					</Box>
				</Box>
			</>
		);
	} else {
		/** RENDER PC **/
		return (
			<>
				<Head><title>Order details | PetNest Korea</title></Head>
				<Box component="main" id="my-page" className="order-detail-page">
					<Box className="container">
						<Button component={Link} href="/mypage?category=myOrders">← My orders</Button>
						{orderContent}
					</Box>
				</Box>
			</>
		);
	}
};

export default withLayoutBasic(OrderDetail);
