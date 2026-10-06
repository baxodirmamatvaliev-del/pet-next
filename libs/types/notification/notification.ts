export interface Notification {
	_id: string;
	notificationType: string;
	notificationStatus: 'WAIT' | 'READ';
	notificationGroup: string;
	notificationTitle: string;
	notificationDesc?: string;
	authorId: string;
	petId?: string;
	productId?: string;
	orderId?: string;
	inquiryId?: string;
	createdAt: string;
}

export interface Notifications {
	list: Notification[];
	metaCounter: { total: number }[];
}
