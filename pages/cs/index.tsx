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
import { useTranslation } from '../../libs/i18n';

const CS: NextPage = () => {
	const { t } = useTranslation();
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
					{t('ui.faq')}
				</Button>
				<Button component={Link} href="/cs?tab=ask" className={tab === 'ask' ? 'active' : ''}>
					{t('ui.askForHelp')}
				</Button>
				<Button component={Link} href="/cs?tab=my" className={tab === 'my' ? 'active' : ''}>
					{t('ui.myRequests')}
				</Button>
				{isAgent && (
					<Button component={Link} href="/cs?tab=inbox" className={tab === 'inbox' ? 'active' : ''}>
						{t('ui.agentInbox')}
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
					<Alert severity="error">{t('ui.agentAccessIsRequired')}</Alert>
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
					<title>{t('ui.helpCenterPetnestKorea')}</title>
				</Head>
				<Box component="main" className="cs-page cs-page--mobile container">
					<Typography component="span" className="cs-page__eyebrow">
						{t('ui.weAreHereToHelp')}
					</Typography>
					<Typography component="h1">{t('nav.help')}</Typography>
					<Typography className="cs-page__intro">
						{t('ui.findAnAnswerOrContactAPetnestAgent')}
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
					<title>{t('ui.helpCenterPetnestKorea')}</title>
				</Head>
				<Box component="main" className="cs-page cs-page--pc container">
					<Typography component="span" className="cs-page__eyebrow">
						{t('ui.weAreHereToHelp')}
					</Typography>
					<Typography component="h1">{t('nav.help')}</Typography>
					<Typography className="cs-page__intro">
						{t('ui.findAnAnswerOrContactAPetnestAgent')}
					</Typography>
					{content}
				</Box>
			</>
		);
	}
};

export default withLayoutBasic(CS);
