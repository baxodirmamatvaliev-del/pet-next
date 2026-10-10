import { useRouter } from 'next/router';
import { defaultLocale, isLocale } from './config';
import en, { type TranslationKey } from './locales/en';
import uz from './locales/uz';
import ko from './locales/ko';
import ru from './locales/ru';

const dictionaries = { en, uz, ko, ru };

export function useTranslation() {
	const { locale: routeLocale = defaultLocale } = useRouter();
	const locale = isLocale(routeLocale) ? routeLocale : defaultLocale;

	// Masalan: t('nav.itemCount', { count: 3 }) → "Mahsulotlar: 3".
	const t = (key: TranslationKey, values: Record<string, string | number> = {}) =>
		dictionaries[locale][key].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
			String(values[name] ?? placeholder));

	return { locale, t };
}
