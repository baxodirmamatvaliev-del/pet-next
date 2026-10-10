import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { defaultLocale, isLocale } from './config';
import en, { type TranslationKey } from './locales/en';
import uz from './locales/uz';
import ko from './locales/ko';
import ru from './locales/ru';
import labels from './labels';
import errors from './errors';

const dictionaries = { en, uz, ko, ru };

export function useTranslation() {
	const { locale: routeLocale = defaultLocale } = useRouter();
	const locale = isLocale(routeLocale) ? routeLocale : defaultLocale;

	// Masalan: t('nav.itemCount', { count: 3 }) → "Mahsulotlar: 3".
	const t = useCallback((key: TranslationKey, values: Record<string, string | number> = {}) => {
		return dictionaries[locale][key].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
			String(values[name] ?? placeholder));
	}, [locale]);

	const label = (value: string | undefined) => {
		if (!value) return '';
		return Object.hasOwn(labels, value) ? t(labels[value]) : value;
	};
	const errorText = (message: string) => {
		if (Object.hasOwn(errors, message)) return t(errors[message]);
		// Komponent allaqachon t() bilan bergan xabar qayta tarjima qilinmaydi.
		if (Object.values(dictionaries[locale]).includes(message)) return message;
		return locale === 'en' ? message : t('error.generic');
	};

	return { locale, t, label, errorText };
}
