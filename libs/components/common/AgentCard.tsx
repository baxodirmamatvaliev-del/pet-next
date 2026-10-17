import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { useReactiveVar } from '@apollo/client';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { REACT_APP_API_URL } from '../../config';
import { userVar } from '../../../apollo/store';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';
import { useTranslation } from '../../i18n';

const AgentCard = ({ agent }: { agent: Member }) => {
	const { t } = useTranslation();
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const memberImage = agent.memberImage ? `${REACT_APP_API_URL}/${agent.memberImage}` : undefined;
	const profileLink = { pathname: '/member/detail', query: { id: agent._id, category: 'products' } };

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="article" className="agent-card agent-card--mobile">
				<Avatar src={memberImage} alt={agent.memberNick} />
				<Box className="agent-card__content">
					<Typography component="span" className="agent-card__role">
						{t('ui.petnestAgent')}
					</Typography>
					<Typography component="h2">{agent.memberNick}</Typography>
					<Typography className="agent-card__description">
						{agent.memberDesc || t('common.agentDescription')}
					</Typography>
					<Typography className="agent-card__stats">
						{agent.memberFollowers} {t('ui.followers3')} {agent.memberLikes} {t('ui.likes')}</Typography>
					{user?.sub !== agent._id && (
						<Link href={`/cs?tab=ask&recipient=${agent._id}`} className="agent-card__contact">
							{t('ui.contactAgent')}
						</Link>
					)}
					<Link href={profileLink} className="agent-card__link">
						{t('ui.viewProfile')}<EastRoundedIcon fontSize="small" />
					</Link>
				</Box>
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack component="article" className="agent-card agent-card--pc">
				<Avatar src={memberImage} alt={agent.memberNick} />
				<Box className="agent-card__content">
					<Typography component="span" className="agent-card__role">
						{t('ui.petnestAgent')}
					</Typography>
					<Typography component="h2">{agent.memberNick}</Typography>
					<Typography className="agent-card__description">
						{agent.memberDesc || t('common.agentDescription')}
					</Typography>
					<Typography className="agent-card__stats">
						{agent.memberFollowers} {t('ui.followers3')} {agent.memberLikes} {t('ui.likes')}</Typography>
					{user?.sub !== agent._id && (
						<Link href={`/cs?tab=ask&recipient=${agent._id}`} className="agent-card__contact">
							{t('ui.contactAgent')}
						</Link>
					)}
					<Link href={profileLink} className="agent-card__link">
						{t('ui.viewProfile')}<EastRoundedIcon fontSize="small" />
					</Link>
				</Box>
			</Stack>
		);
	}
};

export default AgentCard;
