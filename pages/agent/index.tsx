import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ locale, defaultLocale }) => ({
	redirect: {
		destination: `${locale && locale !== defaultLocale ? `/${locale}` : ''}/#agents`,
		permanent: true,
	},
});

export default function AgentsRedirect() {
	return null;
}
