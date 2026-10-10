import React from 'react';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

import { REACT_APP_API_URL } from '../../config';
import { OrderStatus } from '../../enums/order.enum';
import { Order } from '../../types/order/order';
import { formatterStr } from '../../utils';
import { useTranslation } from '../../i18n';

interface OrderCardProps {
	order: Order;
	cancelOrderHandler: (orderId: string) => Promise<void>;
	cancelOrderLoading: boolean;
	showDetailsLink?: boolean;
}

const OrderCard = ({ order, cancelOrderHandler, cancelOrderLoading, showDetailsLink = true }: OrderCardProps) => {
	const { t, locale, label } = useTranslation();
	/** COMPUTED VALUES **/
	const orderDate = new Date(order.createdAt).toLocaleDateString(locale, { timeZone: 'Asia/Seoul' });
	const orderStatus = order.orderStatus === OrderStatus.PAYMENT_CONFIRMED
		? t('ui.demoPaymentConfirmed')
		: label(order.orderStatus);

	/** RENDER **/
	return (
		<Box className="order-card">
			<Stack direction="row" className="order-card__header">
				<Box>
					<Typography component="span">{t('ui.orderLabel')}</Typography>
					<Typography component="strong">#{order._id.slice(-8).toUpperCase()}</Typography>
				</Box>
				<Box>
					<Typography component="span">{t('ui.placedOn')}</Typography>
					<Typography>{orderDate}</Typography>
				</Box>
				<Box>
					<Typography component="span">{t('ui.total')}</Typography>
					<Typography component="strong">₩{formatterStr(order.totalAmount)}</Typography>
				</Box>
				<Chip
					className={`order-status order-status--${order.orderStatus.toLowerCase()}`}
					label={orderStatus}
					size="small"
				/>
			</Stack>

			<Box className="order-card__body">
				<Stack className="order-card__products">
					{order.orderItems.map((orderItem) => {
						const imagePath = orderItem.productImage
							? `${REACT_APP_API_URL}/${orderItem.productImage}`
							: '/img/banner/home-hero.png';

						return (
							<Stack direction="row" className="order-product" key={`${orderItem.productId}-${orderItem.sku}`}>
								<Link href={`/product/detail?id=${orderItem.productId}`} className="order-product__image">
									<Image
										src={imagePath}
										alt={orderItem.productName}
										fill
										sizes="76px"
										unoptimized
									/>
								</Link>
								<Box>
									<Typography component={Link} href={`/product/detail?id=${orderItem.productId}`}>
										{orderItem.productName}
									</Typography>
									<Typography>{orderItem.sku} {t('ui.qty')} {orderItem.quantity}</Typography>
								</Box>
								<Typography component="strong">₩{formatterStr(orderItem.subtotal)}</Typography>
							</Stack>
						);
					})}
				</Stack>

				<Stack className="order-card__delivery">
					<Stack direction="row">
						<LocationOnOutlinedIcon />
						<Box>
							<Typography component="strong">{t('ui.deliveryAddress')}</Typography>
							<Typography>{order.deliveryAddress}</Typography>
						</Box>
					</Stack>
					<Stack direction="row">
						<AccessTimeRoundedIcon />
						<Box>
							<Typography component="strong">{t('ui.recipient')}</Typography>
							<Typography>{order.recipientName} · {order.recipientPhone}</Typography>
						</Box>
					</Stack>
					{showDetailsLink && (
						<Button component={Link} href={`/order/detail?id=${order._id}`} variant="outlined">{t('ui.viewDetails')}</Button>
					)}
					{order.orderStatus === OrderStatus.PENDING && (
						<Button
							variant="outlined"
							color="error"
							onClick={() => cancelOrderHandler(order._id)}
							disabled={cancelOrderLoading}
						>
							{t('ui.cancelOrder')}
						</Button>
					)}
				</Stack>
			</Box>
		</Box>
	);
};

export default OrderCard;
