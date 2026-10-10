import { MouseEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { Badge, Box, CircularProgress, IconButton, Popover, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';

import { userVar } from '../../apollo/store';
import { READ_NOTIFICATION } from '../../apollo/user/mutation';
import { GET_MY_NOTIFICATIONS } from '../../apollo/user/query';
import { getValidAccessToken } from '../auth';
import { REACT_APP_API_SOCKET_URL } from '../config';
import { T } from '../types/common';
import { Notification } from '../types/notification/notification';
import { useTranslation } from '../i18n';
import { notificationText } from '../i18n/notifications';

const initialInput = { page: 1, limit: 30, search: {} };

const NotificationBell = ({ adminPanel = false }: { adminPanel?: boolean }) => {
	const { t, locale } = useTranslation();
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
		// Socket qayta ulanganda ham yaroqli access token bilan kiradi.
		const socket = io(REACT_APP_API_SOCKET_URL, {
			auth: (callback) => {
				void getValidAccessToken().then((token) => callback({ token }))
					.catch(() => socket.disconnect());
			},
		});
		socket.on('notification', () => {
			void getMyNotificationsRefetch({ input: initialInput });
		});
		return () => { socket.disconnect(); };
	}, [user, getMyNotificationsRefetch]);

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
		if (notification.inquiryId && notification.notificationType === 'INQUIRY') {
			void router.push(adminPanel ? `/_admin/inquiries?id=${notification.inquiryId}` : `/cs?tab=inbox&id=${notification.inquiryId}`);
		} else if (notification.inquiryId && notification.notificationType === 'REPLY') {
			void router.push(`/cs?tab=my&id=${notification.inquiryId}`);
		} else if (notification.orderId) void router.push(`/order/detail?id=${notification.orderId}`);
		else if (notification.petId) void router.push(`/pet/detail?id=${notification.petId}`);
		else if (notification.productId) void router.push(`/product/detail?id=${notification.productId}`);
		else if (notification.notificationType === 'FOLLOW') void router.push(`/member/detail?id=${notification.authorId}`);
	};

	if (!user?.sub) return null;
	const unreadCount = notifications.filter((item) => item.notificationStatus === 'WAIT').length;

	return (
		<>
			<IconButton className="notification-bell" onClick={openHandler} aria-label={t('notification.unread', { count: unreadCount })} aria-haspopup="true">
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
						<Typography component="h2">{t('ui.notifications')}</Typography>
						<Typography component="p">{t('ui.yourLatestPetnestUpdates')}</Typography>
					</Box>
					{unreadCount > 0 && <Typography component="span" className="notification-panel__count">{t('counts.newNotifications', { count: unreadCount })}</Typography>}
				</Stack>
				{getMyNotificationsLoading && !notifications.length ? (
					<Stack className="notification-panel__empty"><CircularProgress size={24} /></Stack>
				) : notifications.length ? notifications.map((notification) => {
					const { title, description } = notificationText(notification, t);
					return (
						<Box
							key={notification._id}
							component="button"
							type="button"
							className={`notification-panel__item ${notification.notificationStatus === 'WAIT' ? 'notification-panel__item--unread' : ''}`}
							onClick={() => void notificationClickHandler(notification)}
						>
							<Box className="notification-panel__icon">
								{notification.notificationGroup === 'SUPPORT' ? <SupportAgentOutlinedIcon /> : notification.notificationType === 'FOLLOW' ? <PersonAddAltOutlinedIcon /> : <LocalShippingOutlinedIcon />}
							</Box>
							<Box className="notification-panel__content">
								<Stack direction="row" className="notification-panel__item-top">
									<Typography component="strong">{title}</Typography>
									{notification.notificationStatus === 'WAIT' && <Typography component="span" className="notification-panel__dot" aria-label={t('ui.unread')} />}
								</Stack>
								{description && <Typography component="p">{description}</Typography>}
								<Stack direction="row" className="notification-panel__meta">
									<Typography component="small">{new Date(notification.createdAt).toLocaleDateString(locale, { timeZone: 'Asia/Seoul' })}</Typography>
									<Typography component="span">{notification.notificationStatus === 'WAIT' ? t('ui.unread') : t('ui.read')}</Typography>
								</Stack>
							</Box>
						</Box>
					);
				}) : <Typography className="notification-panel__empty">{t('ui.noNotificationsYet')}</Typography>}
			</Popover>
		</>
	);
};

export default NotificationBell;
