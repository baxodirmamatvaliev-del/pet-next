import { Stack } from '@mui/material';
import Head from 'next/head';
import React, { useEffect } from 'react';

import { getJwtToken, updateUserInfo } from '../../auth';
import Footer from '../Footer';
import Top from '../Top';

const withLayoutHome = <P extends object>(Component: React.ComponentType<P>) => {
	return function LayoutHome(props: P) {
		/** LIFECYCLES **/
		useEffect(() => {
			const token = getJwtToken();
			if (token) updateUserInfo(token);
		}, []);

		return (
			<>
				<Head>
					<title>PetNest Korea — Everything they love</title>
					<meta name="title" content="PetNest Korea — Everything they love" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
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
	}
};

export default withLayoutHome;
