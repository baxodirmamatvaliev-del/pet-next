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
import { useTranslation } from '../../libs/i18n';

const OrderDetail: NextPage = () => {
	const { t, errorText } = useTranslation();
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
			const isConfirmed = await sweetConfirmAlert(
				t('ui.doYouWantToCancelThisOrder'),
				t('common.confirm'),
				t('ui.cancel'),
			);
			if (!isConfirmed) return;

			await cancelOrder({ variables: { orderId: id } });
			await getOrderRefetch({ orderId: id });
			await sweetTopSmallSuccessAlert(t('ui.orderCancelled'), 800);
		} catch (error) {
			const message = error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		}
	};

	/** COMPUTED VALUES **/
	const signInHref = `/account/join?referrer=${encodeURIComponent(`/order/detail?id=${orderId}`)}`;
	const orderContent = !router.isReady ? (
		<Stack className="order-detail-page__state"><CircularProgress color="primary" /></Stack>
	) : !user?.sub ? (
		<Stack className="order-detail-page__state">
			<Typography component="h1">{t('ui.signInToViewYourOrder')}</Typography>
			<Button component={Link} href={signInHref} variant="contained">{t('ui.loginOrSignUp')}</Button>
		</Stack>
	) : !orderId ? (
		<Alert severity="warning">{t('ui.chooseAnOrderFromYourOrderHistory')}</Alert>
	) : getOrderError ? (
		<Alert severity="error">{t('ui.orderCouldNotBeLoaded')}</Alert>
	) : getOrderLoading && order?._id !== orderId ? (
		<Stack className="order-detail-page__state"><CircularProgress color="primary" /></Stack>
	) : order?._id === orderId ? (
		<>
			<Stack className="order-detail-page__heading">
				<Typography component="h1">{t('message.orderTitle', { id: order._id.slice(-8).toUpperCase() })}</Typography>
				<Typography>{t('ui.reviewYourItemsDeliveryDetailsAndCurrentOrder')}</Typography>
			</Stack>
			<OrderCard order={order} cancelOrderHandler={cancelOrderHandler} cancelOrderLoading={cancelOrderLoading} showDetailsLink={false} />
		</>
	) : (
		<Alert severity="error">{t('ui.orderCouldNotBeLoaded')}</Alert>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<>
				<Head><title>{t('ui.orderDetailsPetnestKorea')}</title></Head>
				<Box component="main" id="my-page" className="order-detail-page order-detail-page--mobile">
					<Box className="container">
						<Button component={Link} href="/mypage?category=myOrders">{t('ui.backToOrders')}</Button>
						{orderContent}
					</Box>
				</Box>
			</>
		);
	} else {
		/** RENDER PC **/
		return (
			<>
				<Head><title>{t('ui.orderDetailsPetnestKorea')}</title></Head>
				<Box component="main" id="my-page" className="order-detail-page">
					<Box className="container">
						<Button component={Link} href="/mypage?category=myOrders">{t('ui.backToOrders')}</Button>
						{orderContent}
					</Box>
				</Box>
			</>
		);
	}
};

export default withLayoutBasic(OrderDetail);
