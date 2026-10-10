import { MenuItem, Select } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from '../i18n';
import { isLocale, languages, locales } from '../i18n/config';

const LanguageSwitcher = () => {
	const router = useRouter();
	const { locale, t } = useTranslation();

	const changeLanguage = async (nextLocale: string) => {
		if (!isLocale(nextLocale)) return;
		// Faqat til almashadi: sahifa, query, hash va scroll saqlanadi.
		const changed = await router.replace(
			{ pathname: router.pathname, query: router.query }, router.asPath,
			{ locale: nextLocale, scroll: false },
		);
		// Keyingi tashrifda Next.js shu cookie orqali tanlangan tilni ochadi.
		if (changed) document.cookie = `NEXT_LOCALE=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
	};

	return (
		<Select
			className="language-switcher"
			size="small"
			value={locale}
			renderValue={(value) => value.toUpperCase()}
			inputProps={{ 'aria-label': t('preferences.language') }}
			onChange={(event) => { void changeLanguage(event.target.value); }}
		>
			{locales.map((code) => (
				<MenuItem key={code} value={code} lang={code}>{languages[code]}</MenuItem>
			))}
		</Select>
	);
};

export default LanguageSwitcher;
