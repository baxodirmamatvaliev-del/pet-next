import type { useTranslation } from './index';
import type { TranslationKey } from './locales/en';
import type { Notification } from '../types/notification/notification';

const titles: Record<string, TranslationKey> = {
	'Your product received a new review': 'notification.review',
	'Reply to your support request': 'notification.reply',
	'Your order is on its way': 'notification.inTransit',
	'Your order was delivered': 'notification.delivered',
	'You have a new follower': 'notification.follow',
};

export function notificationText(notification: Notification, t: ReturnType<typeof useTranslation>['t']) {
	const original = notification.notificationTitle;
	const prefix = 'New support request from ';
	const title = original.startsWith(prefix)
		? t('notification.inquiry', { name: original.slice(prefix.length) })
		: Object.hasOwn(titles, original) ? t(titles[original]) : original;
	const rating = notification.notificationType === 'COMMENT'
		? notification.notificationDesc?.match(/^(\d) out of 5 stars$/)?.[1] : undefined;
	// So‘rov mavzusi va foydalanuvchi yozgan matnlar o‘z holicha qoladi.
	const description = rating ? t('notification.rating', { rating }) : notification.notificationDesc;
	return { title, description };
}
