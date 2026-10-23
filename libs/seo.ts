export const siteOrigin = 'https://koreapet.tech';

// Next.js header matching includes every configured locale automatically.
export const noindexSources = [
	'/account/:path*',
	'/mypage/:path*',
	'/cart/:path*',
	'/checkout/:path*',
	'/order/:path*',
	'/_admin/:path*',
	'/pet/create',
	'/pet/edit',
	'/product/create',
	'/product/edit',
];

export function shouldNoindex(pathname: string): boolean {
	return pathname === '/404' || pathname === '/500' || pathname === '/_error' || noindexSources.some((source) => {
		if (source.endsWith('/:path*')) {
			const root = source.slice(0, -'/:path*'.length);
			return pathname === root || pathname.startsWith(`${root}/`);
		}
		return pathname === source;
	});
}

export function canonicalUrl(pathname: string, locale: string, defaultLocale: string, id?: string): string {
	const prefix = locale === defaultLocale ? '' : `/${locale}`;
	const path = pathname === '/' ? `${prefix}/` : `${prefix}${pathname}`;
	const url = new URL(path, siteOrigin);
	// These detail pages use a query ID; removing it would merge different listings.
	if (id && ['/pet/detail', '/product/detail', '/member/detail'].includes(pathname)) {
		url.searchParams.set('id', id);
	}
	return url.toString();
}
