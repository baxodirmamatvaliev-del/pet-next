import type { TranslationKey } from './locales/en';

// Backend xabarlari shu yerda UI tiliga moslanadi.
const errors: Record<string, TranslationKey> = {
	'Something went wrong!': 'error.generic',
	'No data found!': 'error.notFound',
	'Create failed!': 'error.generic',
	'Update failed!': 'error.generic',
	'Remove failed!': 'error.generic',
	'Upload failed!': 'error.upload',
	'Bad Request!': 'error.generic',
	'Already used member nick or phone': 'error.duplicateAccount',
	'You have already subscribed': 'error.alreadyFollowed',
	'You have not subscribed to this user': 'error.notFollowed',
	'No member with that member nick!': 'error.memberNotFound',
	'You have been blocked!': 'error.blocked',
	'Wrong password, try again!': 'error.password',
	'Please login first!': 'error.login',
	'You are not authenticated, please login first!': 'error.login',
	'Bearer Token is not provided!': 'error.login',
	'Allowed only for members with specific role!': 'error.permission',
	'Not Allowed Request!': 'error.permission',
	'Please provide jpg, jpeg or png images!': 'ui.pleaseChooseJpgJpegOrPngImages',
	'Image content does not match its file type!': 'error.imageContent',
	'Image must not exceed 15 MB!': 'error.imageSize',
	'Self subscription is denied!': 'error.selfFollow',
	'Not enough product stock!': 'error.stock',
};

export default errors;
