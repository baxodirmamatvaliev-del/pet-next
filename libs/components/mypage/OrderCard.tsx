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

interface OrderCardProps {
	order: Order;
	cancelOrderHandler: (orderId: string) => Promise<void>;
	cancelOrderLoading: boolean;
	showDetailsLink?: boolean;
}

const OrderCard = ({ order, cancelOrderHandler, cancelOrderLoading, showDetailsLink = true }: OrderCardProps) => {
	/** COMPUTED VALUES **/
	const orderDate = new Date(order.createdAt).toLocaleDateString('en-CA');
	const orderStatus = order.orderStatus.replaceAll('_', ' ');

	/** RENDER **/
	return (
		<Box className="order-card">
			<Stack direction="row" className="order-card__header">
				<Box>
					<Typography component="span">ORDER</Typography>
					<Typography component="strong">#{order._id.slice(-8).toUpperCase()}</Typography>
				</Box>
				<Box>
					<Typography component="span">PLACED ON</Typography>
					<Typography>{orderDate}</Typography>
				</Box>
				<Box>
					<Typography component="span">TOTAL</Typography>
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
									<Typography>{orderItem.sku} · Qty {orderItem.quantity}</Typography>
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
							<Typography component="strong">Delivery address</Typography>
							<Typography>{order.deliveryAddress}</Typography>
						</Box>
					</Stack>
					<Stack direction="row">
						<AccessTimeRoundedIcon />
						<Box>
							<Typography component="strong">Recipient</Typography>
							<Typography>{order.recipientName} · {order.recipientPhone}</Typography>
						</Box>
					</Stack>
					{showDetailsLink && (
						<Button component={Link} href={`/order/detail?id=${order._id}`} variant="outlined">View details</Button>
					)}
					{order.orderStatus === OrderStatus.PENDING && (
						<Button
							variant="outlined"
							color="error"
							onClick={() => cancelOrderHandler(order._id)}
							disabled={cancelOrderLoading}
						>
							Cancel order
						</Button>
					)}
				</Stack>
			</Box>
		</Box>
	);
};

export default OrderCard;
