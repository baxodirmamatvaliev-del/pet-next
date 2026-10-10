import type { NextConfig } from 'next';
import { defaultLocale, locales } from './libs/i18n/config';

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	compress: true,
	output: 'standalone',
	// Til prefiksi va NEXT_LOCALE cookie’sini Next.js boshqaradi.
	i18n: { locales, defaultLocale },
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
				],
			},
		];
	},
};

export default nextConfig;
