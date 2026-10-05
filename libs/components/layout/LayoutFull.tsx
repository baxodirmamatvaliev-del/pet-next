import { Stack } from '@mui/material';
import Head from 'next/head';
import React, { useEffect } from 'react';

import { getJwtToken, updateUserInfo } from '../../auth';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Footer from '../Footer';
import Top from '../Top';

const withLayoutFull = <P extends object>(Component: React.ComponentType<P>) => {
	return function LayoutFull(props: P) {
		const device = useDeviceDetect();

		/** LIFECYCLES **/
		useEffect(() => {
			const token = getJwtToken();
			if (token) updateUserInfo(token);
		}, []);

		if (device === 'mobile') {
			/** RENDER MOBILE **/
			return (
				<>
					<Head>
						<title>Product Detail | PetNest Korea</title>
						<meta name="title" content="Product Detail | PetNest Korea" />
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
						<title>Product Detail | PetNest Korea</title>
						<meta name="title" content="Product Detail | PetNest Korea" />
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

export default withLayoutFull;
