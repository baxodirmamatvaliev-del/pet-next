import type { ReactNode } from 'react';
import { Stack } from '@mui/material';
import Head from 'next/head';

import useDeviceDetect from '../../hooks/useDeviceDetect';
import Chat from '../Chat';
import Footer from '../Footer';
import MobileBottomNav from '../MobileBottomNav';
import Top from '../Top';

interface StorefrontLayoutProps {
	children: ReactNode;
	title: string;
	home?: boolean;
}

const StorefrontLayout = ({ children, title, home = false }: StorefrontLayoutProps) => {
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	return (
		<>
			<Head>
				<title>{title}</title>
				<meta name="title" content={title} />
				{home && <meta name="viewport" content="width=device-width, initial-scale=1" />}
			</Head>
			<Stack
				id={isMobile ? 'mobile-wrap' : 'pc-wrap'}
				className={`storefront-layout${home ? ' home-layout' : ''}`}
			>
				<Stack id="top">
					<Top />
				</Stack>
				<Stack id="main">{children}</Stack>
				<Chat />
				<Stack id="footer">
					<Footer />
				</Stack>
				{isMobile && <MobileBottomNav />}
			</Stack>
		</>
	);
};

export default StorefrontLayout;
