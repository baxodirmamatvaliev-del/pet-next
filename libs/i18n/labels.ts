import type { TranslationKey } from './locales/en';

// Faqat ekrandagi nom tarjima qilinadi; enum qiymati backend uchun o‘zgarmaydi.
const labels: Record<string, TranslationKey> = {
	DOG: 'nav.dogs', CAT: 'nav.cats', BIRD: 'ui.birds', OTHER: 'ui.other',
	FOOD: 'ui.food', TOY: 'ui.toys', BED: 'ui.beds', HARNESS: 'ui.harnesses', ACCESSORY: 'ui.accessories',
	SALE: 'ui.saleListingType', ADOPTION: 'ui.adoption',
	MALE: 'enum.male', FEMALE: 'enum.female', UNKNOWN: 'enum.unknown',
	ACTIVE: 'ui.active', RESERVED: 'ui.reserved', SOLD: 'ui.sold', ADOPTED: 'ui.adopted',
	HIDDEN: 'ui.hidden', DELETE: 'enum.deleted', BLOCK: 'enum.blocked',
	ADMIN: 'ui.admin', AGENT: 'ui.seller', USER: 'enum.user',
	MEMBER: 'ui.members', ARTICLE: 'enum.article', PET: 'ui.pet', PRODUCT: 'ui.products',
	PENDING: 'ui.pending', PAYMENT_CONFIRMED: 'ui.demoPaymentConfirmed',
	IN_TRANSIT: 'ui.inTransit', DELIVERED_TO_CUSTOMER: 'ui.delivered', CANCELLED: 'ui.cancelled',
	CONFIRMED: 'enum.confirmed', CARD: 'enum.card', KAKAO_PAY: 'enum.kakaoPay',
	SEOUL: 'enum.seoul', BUSAN: 'enum.busan', INCHEON: 'enum.incheon', DAEGU: 'enum.daegu',
	GYEONGJU: 'enum.gyeongju', GWANGJU: 'enum.gwangju', CHONJU: 'enum.jeonju',
	DAEJON: 'enum.daejeon', JEJU: 'enum.jeju',
};

export default labels;
