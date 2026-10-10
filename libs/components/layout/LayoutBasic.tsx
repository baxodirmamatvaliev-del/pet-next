import { Stack } from '@mui/material';
import Head from 'next/head';
import React from 'react';

import useDeviceDetect from '../../hooks/useDeviceDetect';
import Footer from '../Footer';
import Top from '../Top';

const withLayoutBasic = <P extends object>(Component: React.ComponentType<P>) => {
	return function LayoutBasic(props: P) {
		const device = useDeviceDetect();

		if (device === 'mobile') {
			/** RENDER MOBILE **/
			return (
				<>
					<Head>
						<title>Shop | PetNest Korea</title>
						<meta name="title" content="Shop | PetNest Korea" />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id="top"><Top /></Stack>
						<Stack id="main"><Component {...props} /></Stack>
						<Stack id="footer"><Footer /></Stack>
					</Stack>
				</>
			);
		} else {
			/** RENDER PC **/
			return (
				<>
					<Head>
						<title>Shop | PetNest Korea</title>
						<meta name="title" content="Shop | PetNest Korea" />
					</Head>
					<Stack id="pc-wrap">
						<Stack id="top"><Top /></Stack>
						<Stack id="main"><Component {...props} /></Stack>
						<Stack id="footer"><Footer /></Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
