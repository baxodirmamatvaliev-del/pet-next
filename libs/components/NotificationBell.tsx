import { MouseEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import { Badge, Box, CircularProgress, IconButton, Popover, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';

import { userVar } from '../../apollo/store';
import { READ_NOTIFICATION } from '../../apollo/user/mutation';
import { GET_MY_NOTIFICATIONS } from '../../apollo/user/query';
import { getJwtToken } from '../auth';
import { REACT_APP_API_SOCKET_URL } from '../config';
import { T } from '../types/common';
import { Notification } from '../types/notification/notification';

const initialInput = { page: 1, limit: 30, search: {} };

const NotificationBell = () => {
	const router = useRouter();

	/** STATES **/
	const user = useReactiveVar(userVar);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [notifications, setNotifications] = useState<Notification[]>([]);

	/** APOLLO REQUESTS **/
	const [readNotification] = useMutation(READ_NOTIFICATION);
	const {
		loading: getMyNotificationsLoading,
		refetch: getMyNotificationsRefetch,
	} = useQuery(GET_MY_NOTIFICATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: initialInput },
		skip: !user?.sub,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getMyNotifications?.list) setNotifications(data.getMyNotifications.list);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user?.sub) return;
		const token = getJwtToken();
		if (!token) return;

		const socket = io(REACT_APP_API_SOCKET_URL, { auth: { token } });
		socket.on('notification', () => {
			void getMyNotificationsRefetch({ input: initialInput });
		});
		return () => { socket.disconnect(); };
	}, [user?.sub, getMyNotificationsRefetch]);

	/** HANDLERS **/
	const openHandler = (event: MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
		void getMyNotificationsRefetch({ input: initialInput });
	};

	const closeHandler = () => setAnchorEl(null);

	const notificationClickHandler = async (notification: Notification) => {
		if (notification.notificationStatus === 'WAIT') {
			try {
				await readNotification({ variables: { notificationId: notification._id } });
				setNotifications((previous) => previous.map((item) => item._id === notification._id
					? { ...item, notificationStatus: 'READ' } : item));
			} catch (err) {
				console.error('ERROR: notificationClickHandler', err);
			}
		}

		closeHandler();
		if (notification.orderId) void router.push(`/order/detail?id=${notification.orderId}`);
		else if (notification.petId) void router.push(`/pet/detail?id=${notification.petId}`);
		else if (notification.productId) void router.push(`/product/detail?id=${notification.productId}`);
		else if (notification.notificationType === 'FOLLOW') void router.push(`/member/detail?id=${notification.authorId}`);
	};

	if (!user?.sub) return null;
	const unreadCount = notifications.filter((item) => item.notificationStatus === 'WAIT').length;

	return (
		<>
			<IconButton className="notification-bell" onClick={openHandler} aria-label={`Notifications, ${unreadCount} unread`} aria-haspopup="true">
				<Badge badgeContent={unreadCount} color="error" max={29}>
					<NotificationsNoneRoundedIcon />
				</Badge>
			</IconButton>
			<Popover
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={closeHandler}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				PaperProps={{ className: 'notification-panel' }}
			>
				<Stack direction="row" className="notification-panel__header">
					<Box>
						<Typography component="h2">Notifications</Typography>
						<Typography component="p">Your latest PetNest updates</Typography>
					</Box>
					{unreadCount > 0 && <Typography component="span" className="notification-panel__count">{unreadCount} new</Typography>}
				</Stack>
				{getMyNotificationsLoading && !notifications.length ? (
					<Stack className="notification-panel__empty"><CircularProgress size={24} /></Stack>
				) : notifications.length ? notifications.map((notification) => (
					<Box
						key={notification._id}
						component="button"
						type="button"
						className={`notification-panel__item ${notification.notificationStatus === 'WAIT' ? 'notification-panel__item--unread' : ''}`}
						onClick={() => void notificationClickHandler(notification)}
					>
						<Box className="notification-panel__icon">
							{notification.notificationType === 'FOLLOW' ? <PersonAddAltOutlinedIcon /> : <LocalShippingOutlinedIcon />}
						</Box>
						<Box className="notification-panel__content">
							<Stack direction="row" className="notification-panel__item-top">
								<Typography component="strong">{notification.notificationTitle}</Typography>
								{notification.notificationStatus === 'WAIT' && <Typography component="span" className="notification-panel__dot" aria-label="Unread" />}
							</Stack>
							{notification.notificationDesc && <Typography component="p">{notification.notificationDesc}</Typography>}
							<Stack direction="row" className="notification-panel__meta">
								<Typography component="small">{new Date(notification.createdAt).toLocaleDateString()}</Typography>
								<Typography component="span">{notification.notificationStatus === 'WAIT' ? 'New' : 'Read'}</Typography>
							</Stack>
						</Box>
					</Box>
				)) : <Typography className="notification-panel__empty">No notifications yet.</Typography>}
			</Popover>
		</>
	);
};

export default NotificationBell;
