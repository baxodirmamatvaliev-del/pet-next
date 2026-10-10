// Til kodi URL, cookie va lug‘atlarda bir xil ishlatiladi.
export const languages = {
	en: 'English',
	uz: 'O‘zbekcha',
	ko: '한국어',
	ru: 'Русский',
} as const;

export type Locale = keyof typeof languages;
export const locales = Object.keys(languages) as Locale[];
export const defaultLocale: Locale = 'en';

export const isLocale = (value: string): value is Locale => Object.hasOwn(languages, value);
