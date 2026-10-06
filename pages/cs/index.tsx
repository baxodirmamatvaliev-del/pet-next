import { useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../apollo/store';
import { GET_MEMBER } from '../../apollo/user/query';
import Faq from '../../libs/components/cs/Faq';
import Inquiry from '../../libs/components/cs/Inquiry';
import InquiryInbox from '../../libs/components/cs/InquiryInbox';
import MyInquiries from '../../libs/components/cs/MyInquiries';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { MemberType } from '../../libs/enums/member.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { T } from '../../libs/types/common';

const CS: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();

	/** STATES **/
	const user = useReactiveVar(userVar);
	const tab = typeof router.query.tab === 'string' ? router.query.tab : 'faq';

	/** APOLLO REQUESTS **/
	const { data: getMemberData, loading: getMemberLoading } = useQuery(GET_MEMBER, {
		fetchPolicy: 'cache-and-network',
		variables: { memberId: user?.sub ?? '' },
		skip: !user?.sub,
	});

	/** COMPUTED VALUES **/
	const member = (getMemberData as T | undefined)?.getMember;
	const isAgent = member?.memberType === MemberType.AGENT;
	const content = (
		<>
			<Stack direction="row" className="cs-page__tabs">
				<Button component={Link} href="/cs?tab=faq" className={tab === 'faq' ? 'active' : ''}>
					FAQ
				</Button>
				<Button component={Link} href="/cs?tab=ask" className={tab === 'ask' ? 'active' : ''}>
					Ask for help
				</Button>
				<Button component={Link} href="/cs?tab=my" className={tab === 'my' ? 'active' : ''}>
					My requests
				</Button>
				{isAgent && (
					<Button component={Link} href="/cs?tab=inbox" className={tab === 'inbox' ? 'active' : ''}>
						Agent inbox
					</Button>
				)}
			</Stack>
			{tab === 'ask' ? (
				<Inquiry />
			) : tab === 'my' ? (
				<MyInquiries />
			) : tab === 'inbox' ? (
				getMemberLoading ? (
					<Stack className="cs-state">
						<CircularProgress />
					</Stack>
				) : isAgent ? (
					<InquiryInbox />
				) : (
					<Alert severity="error">Agent access is required.</Alert>
				)
			) : (
				<Faq />
			)}
		</>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<>
				<Head>
					<title>Help Center | PetNest Korea</title>
				</Head>
				<Box component="main" className="cs-page cs-page--mobile container">
					<Typography component="span" className="cs-page__eyebrow">
						WE ARE HERE TO HELP
					</Typography>
					<Typography component="h1">Help Center</Typography>
					<Typography className="cs-page__intro">
						Find an answer or contact a PetNest agent or admin directly.
					</Typography>
					{content}
				</Box>
			</>
		);
	} else {
		/** RENDER PC **/
		return (
			<>
				<Head>
					<title>Help Center | PetNest Korea</title>
				</Head>
				<Box component="main" className="cs-page cs-page--pc container">
					<Typography component="span" className="cs-page__eyebrow">
						WE ARE HERE TO HELP
					</Typography>
					<Typography component="h1">Help Center</Typography>
					<Typography className="cs-page__intro">
						Find an answer or contact a PetNest agent or admin directly.
					</Typography>
					{content}
				</Box>
			</>
		);
	}
};

export default withLayoutBasic(CS);
