import { Stack } from '@mui/material';
import Head from 'next/head';
import React, { useEffect } from 'react';

import { getJwtToken, updateUserInfo } from '../../auth';
import Footer from '../Footer';
import Top from '../Top';

const withLayoutBasic = <P extends object>(Component: React.ComponentType<P>) => {
	return function LayoutBasic(props: P) {
		/** LIFECYCLES **/
		useEffect(() => {
			const token = getJwtToken();
			if (token) updateUserInfo(token);
		}, []);

		return (
			<>
				<Head>
					<title>Shop | PetNest Korea</title>
					<meta name="description" content="Shop products for happy dogs and cats." />
				</Head>

				<Stack id="pc-wrap">
					<Stack id="top">
						<Top />
					</Stack>

					<Stack id="main">
						<Component {...props} />
					</Stack>

					<Stack id="footer">
						<Footer />
					</Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutBasic;
