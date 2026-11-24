import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface DemoCardDetails {
	number: string;
	holder: string;
	expiry: string;
	cvc: string;
}

export type DemoCardField = keyof DemoCardDetails;

const emptyCard: DemoCardDetails = {
	number: '',
	holder: '',
	expiry: '',
	cvc: '',
};
const DemoCardContext = createContext<{
	card: DemoCardDetails;
	change: (field: DemoCardField, value: string) => void;
} | null>(null);

// Ephemeral visual state only. This provider unmounts when checkout leaves the cart
// form (success, retry, logout, or navigation). No storage or payment API accesses.
export function DemoCardProvider({ children }: { children: ReactNode }) {
	const [card, setCard] = useState<DemoCardDetails>(emptyCard);
	const change = (field: DemoCardField, value: string) => {
		setCard((previous) => ({
			...previous,
			[field]: normalizeDemoField(field, value),
		}));
	};
	return (
		<DemoCardContext.Provider value={{ card, change }}>
			{children}
		</DemoCardContext.Provider>
	);
}

export function useDemoCard() {
	const context = useContext(DemoCardContext);
	if (!context) throw new Error('Demo card must be inside DemoCardProvider');
	return context;
}

export function demoCardBrand(number: string) {
	if (/^3[47]/.test(number)) return 'AMEX';
	if (/^4/.test(number)) return 'VISA';
	if (/^(5[1-5]|2[2-7])/.test(number)) return 'Mastercard';
	return 'TEST';
}

export function normalizeDemoField(field: DemoCardField, value: string) {
	if (field === 'holder')
		return value.replace(/[\u0000-\u001f]/g, '').slice(0, 50);
	const digits = value.replace(/\D/g, '');
	if (field === 'number')
		return digits.slice(0, /^3[47]/.test(digits) ? 15 : 19);
	if (field === 'cvc') return digits.slice(0, 4);
	let expiry = digits.slice(0, 4);
	if (expiry.length === 1 && +expiry > 1) expiry = `0${expiry}`;
	return expiry.length > 2
		? `${expiry.slice(0, 2)}/${expiry.slice(2)}`
		: expiry;
}

export function formatDemoNumber(number: string, preview = false) {
	const groups =
		demoCardBrand(number) === 'AMEX'
			? [4, 6, 5]
			: [4, 4, 4, 4, ...(number.length > 16 ? [3] : [])];
	let offset = 0;
	return groups
		.map((length) => {
			const group = number.slice(offset, offset + length);
			offset += length;
			return preview ? group.padEnd(length, '•') : group;
		})
		.filter(Boolean)
		.join(' ');
}

export function demoCardErrors(
	card: DemoCardDetails,
	now = new Date(),
): Record<DemoCardField, string> {
	const errors = { number: '', holder: '', expiry: '', cvc: '' };
	const brand = demoCardBrand(card.number);
	let checksum = 0;
	for (let i = 0; i < card.number.length; i++) {
		let digit = +card.number[card.number.length - 1 - i];
		if (i % 2) {
			digit *= 2;
			if (digit > 9) digit -= 9;
		}
		checksum += digit;
	}
	const lengthOk =
		brand === 'AMEX'
			? card.number.length === 15
			: brand === 'VISA'
				? [13, 16, 19].includes(card.number.length)
				: brand === 'Mastercard'
					? card.number.length === 16
					: card.number.length >= 13 && card.number.length <= 19;
	if (!lengthOk || checksum % 10 !== 0 || /^(\d)\1+$/.test(card.number))
		errors.number = '유효한 테스트 카드 번호를 입력하세요.';
	if ((card.holder.match(/\p{L}/gu)?.length ?? 0) < 2)
		errors.holder = '카드 소유자 이름을 두 글자 이상 입력하세요.';
	const match = /^(\d{2})\/(\d{2})$/.exec(card.expiry);
	const month = match ? +match[1] : 0;
	const year = match ? 2000 + +match[2] : 0;
	if (
		month < 1 ||
		month > 12 ||
		year < now.getFullYear() ||
		(year === now.getFullYear() && month < now.getMonth() + 1)
	) {
		errors.expiry = '만료되지 않은 유효기간을 MM/YY 형식으로 입력하세요.';
	}
	const cvcLength = brand === 'AMEX' ? 4 : 3;
	if (!new RegExp(`^\\d{${cvcLength}}$`).test(card.cvc))
		errors.cvc = `${cvcLength}자리 테스트 보안 코드를 입력하세요.`;
	return errors;
}
