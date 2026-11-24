import { FormEvent, useMemo, useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
	Alert,
	Button,
	Box,
	CircularProgress,
	MenuItem,
	Pagination,
	Select,
	SelectChangeEvent,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { GET_AGENTS } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import TeamLanyardRail from '../../libs/components/agent/TeamLanyardRail';
import { REACT_APP_API_URL } from '../../libs/config';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Direction } from '../../libs/enums/common.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/types/member/member';
import { AgentsInquiry } from '../../libs/types/member/member.input';
import { useTranslation } from '../../libs/i18n';

const initialInput: AgentsInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};
const agentSorts = ['createdAt', 'memberLikes', 'memberViews', 'memberRank'];

const AgentList: NextPage = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);

	/** STATES **/
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState(0);
	const searchFilter = useMemo<AgentsInquiry>(() => {
		if (typeof router.query.input !== 'string') return initialInput;
		try {
			const input = JSON.parse(router.query.input) as AgentsInquiry;
			if (
				!Number.isInteger(input.page) ||
				input.page < 1 ||
				!Number.isInteger(input.limit) ||
				input.limit < 1 ||
				input.limit > 100 ||
				!agentSorts.includes(input.sort ?? 'createdAt') ||
				!Object.values(Direction).includes(input.direction ?? Direction.DESC) ||
				!input.search ||
				typeof input.search !== 'object' ||
				Array.isArray(input.search) ||
				(input.search.text !== undefined && (typeof input.search.text !== 'string' || input.search.text.length > 100))
			) {
				return initialInput;
			}
			return {
				page: input.page,
				limit: input.limit,
				sort: input.sort ?? 'createdAt',
				direction: input.direction ?? Direction.DESC,
				search: { text: input.search.text?.trim() || undefined },
			};
		} catch {
			return initialInput;
		}
	}, [router.query.input]);

	/** APOLLO REQUESTS **/
	const { loading: getAgentsLoading, error: getAgentsError, refetch: getAgentsRefetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !router.isReady,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgents(data?.getAgents?.list ?? []);
			setTotal(data?.getAgents?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const updateSearchFilterHandler = (input: AgentsInquiry) => {
		void router.push({ pathname: '/agent', query: { input: JSON.stringify(input) } }, undefined, { scroll: false });
	};

	const searchHandler = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const searchText = (event.currentTarget.elements.namedItem('agentSearch') as HTMLInputElement).value.trim();
		updateSearchFilterHandler({ ...searchFilter, page: 1, search: { text: searchText || undefined } });
	};

	const sortHandler = (event: SelectChangeEvent) => {
		updateSearchFilterHandler({ ...searchFilter, page: 1, sort: event.target.value });
	};

	const pageHandler = (_event: unknown, page: number) => {
		updateSearchFilterHandler({ ...searchFilter, page });
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / searchFilter.limit);
	const lanyardItems = useMemo(() => agents.map((agent) => ({
		id: agent._id,
		name: agent.memberNick,
		role: `PetNest ${t('ui.seller')}`,
		image: agent.memberImage ? `${REACT_APP_API_URL}/${agent.memberImage}` : '',
		followers: agent.memberFollowers,
		likes: agent.memberLikes,
		links: [
			{ label: t('ui.viewProfile'), href: `/member/detail?id=${encodeURIComponent(agent._id)}&category=products` },
			...(user?.sub !== agent._id ? [{ label: t('ui.contactAgent'), href: `/cs?tab=ask&recipient=${encodeURIComponent(agent._id)}` }] : []),
		],
	})), [agents, t, user?.sub]);
	const content = (
		<>
			<Stack direction="row" className="agent-page__toolbar">
				<Box component="form" onSubmit={searchHandler} className="agent-page__search">
					<TextField
						key={typeof router.query.input === 'string' ? router.query.input : 'all'}
						name="agentSearch"
						defaultValue={searchFilter.search.text ?? ''}
						inputProps={{ maxLength: 100 }}
						placeholder={t('ui.searchAgents')}
						size="small"
					/>
					<Box component="button" type="submit" aria-label={t('ui.searchAgents')}>
						<SearchRoundedIcon />
					</Box>
				</Box>
				<Select size="small" value={searchFilter.sort ?? 'createdAt'} onChange={sortHandler} inputProps={{ 'aria-label': t('ui.sortSellers') }}>
					<MenuItem value="createdAt">{t('ui.newest')}</MenuItem>
					<MenuItem value="memberLikes">{t('ui.mostLiked')}</MenuItem>
					<MenuItem value="memberViews">{t('ui.mostViewed')}</MenuItem>
					<MenuItem value="memberRank">{t('ui.topRanked')}</MenuItem>
				</Select>
			</Stack>
			{getAgentsError ? (
				<Alert severity="error" action={
					<Button color="inherit" disabled={getAgentsLoading} onClick={() => { void getAgentsRefetch().catch(() => {}); }}>
						{t(getAgentsLoading ? 'ui.retrying' : 'ui.tryAgain')}
					</Button>
				}>
					{t('ui.agentsCouldNotBeLoaded')}
				</Alert>
			) : !router.isReady || getAgentsLoading ? (
				<Stack className="agent-page__state">
					<CircularProgress />
				</Stack>
			) : agents.length ? (
				<TeamLanyardRail
					key={JSON.stringify(searchFilter)}
					items={lanyardItems}
					autoplay
					aria-label={t('ui.seller')}
					caption={t('agentRail.hint')}
					labels={{
						flip: t('agentRail.flip'),
						back: t('agentRail.back'),
						show: t('agentRail.show'),
						followers: t('ui.followers'),
						likes: t('ui.likes'),
					}}
				/>
			) : (
				<Typography className="agent-page__state">{t('ui.noAgentsFound')}</Typography>
			)}
			{totalPages > 1 && <Pagination page={searchFilter.page} count={totalPages} onChange={pageHandler} />}
		</>
	);

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<>
				<Head>
					<title>{t('ui.petnestAgentsPetnestKorea')}</title>
				</Head>
				<Box component="main" className="agent-page agent-page--mobile container">
					<Typography component="h1">{t('ui.seller')}</Typography>
					{content}
				</Box>
			</>
		);
	} else {
		/** RENDER PC **/
		return (
			<>
				<Head>
					<title>{t('ui.petnestAgentsPetnestKorea')}</title>
				</Head>
				<Box component="main" className="agent-page agent-page--pc container">
					<Typography component="h1">{t('ui.seller')}</Typography>
					{content}
				</Box>
			</>
		);
	}
};

export default withLayoutBasic(AgentList);
