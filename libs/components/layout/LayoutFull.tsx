import { Stack } from '@mui/material';
import Head from 'next/head';
import React from 'react';

import useDeviceDetect from '../../hooks/useDeviceDetect';
import Footer from '../Footer';
import Top from '../Top';
import Chat from '../Chat';
import { useTranslation } from '../../i18n';

const withLayoutFull = <P extends object>(Component: React.ComponentType<P>) => {
	return function LayoutFull(props: P) {
		const { t } = useTranslation();
		const device = useDeviceDetect();

		return (
			<>
				<Head>
					<title>{t('ui.productDetailPetnestKorea')}</title>
					<meta name="title" content={t('ui.productDetailPetnestKorea')} />
				</Head>
				<Stack id={device === 'mobile' ? 'mobile-wrap' : 'pc-wrap'}>
					<Stack id="top"><Top /></Stack>
					<Stack id="main"><Component {...props} /></Stack>
					<Chat />
					<Stack id="footer"><Footer /></Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutFull;
