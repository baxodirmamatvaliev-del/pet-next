import { Stack } from '@mui/material';
import Head from 'next/head';
import React from 'react';

import useDeviceDetect from '../../hooks/useDeviceDetect';
import Footer from '../Footer';
import Top from '../Top';
import Chat from '../Chat';
import { useTranslation } from '../../i18n';

const withLayoutHome = <P extends object>(Component: React.ComponentType<P>) => {
	return function LayoutHome(props: P) {
		const { t } = useTranslation();
		const device = useDeviceDetect();

		return (
			<>
				<Head>
					<title>{t('ui.petnestKoreaEverythingTheyLove')}</title>
					<meta name="title" content={t('ui.petnestKoreaEverythingTheyLove')} />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
				</Head>
				<Stack id={device === 'mobile' ? 'mobile-wrap' : 'pc-wrap'} className="home-layout">
					<Stack id="top"><Top /></Stack>
					<Stack id="main"><Component {...props} /></Stack>
					<Chat />
					<Stack id="footer"><Footer /></Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutHome;
