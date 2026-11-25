import { useMemo } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

import { GET_AGENTS } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Direction } from '../../enums/common.enum';
import { useTranslation } from '../../i18n';
import { Members } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import TeamLanyardRail from '../agent/TeamLanyardRail';
import ListingError from '../common/ListingError';

const input: AgentsInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const Agents = () => {
	const { t } = useTranslation();
	const user = useReactiveVar(userVar);
	const { data, loading, error, refetch } = useQuery<{ getAgents: Members }, { input: AgentsInquiry }>(GET_AGENTS, {
		variables: { input },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const lanyardItems = useMemo(() => (data?.getAgents.list ?? []).map((agent) => ({
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
	})), [data, t, user?.sub]);

	return (
		<Stack component="section" id="agents" className="home-agents container" aria-labelledby="home-agents-heading">
			<Stack direction="row" className="section-heading">
				<Typography component="h2" id="home-agents-heading">{t('ui.seller')}</Typography>
			</Stack>
			<Box aria-live="polite" aria-busy={loading}>
				{error ? (
					<ListingError message={t('ui.agentsCouldNotBeLoaded')} onRetry={() => refetch()} />
				) : loading && !lanyardItems.length ? (
					<Stack alignItems="center" sx={{ py: 4 }}><CircularProgress aria-label={t('ui.seller')} /></Stack>
				) : lanyardItems.length ? (
					<TeamLanyardRail
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
					<Typography sx={{ py: 4, textAlign: 'center' }}>{t('ui.noAgentsFound')}</Typography>
				)}
			</Box>
		</Stack>
	);
};

export default Agents;
