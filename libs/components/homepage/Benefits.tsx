import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import { useTranslation } from '../../i18n';

const Benefits = () => {
	const { t } = useTranslation();
	const benefits = [
		{
			id: 'delivery',
			title: t('benefits.deliveryTitle'),
			text: t('benefits.deliveryDescription'),
			icon: LocalShippingRoundedIcon,
			href: '/cs?tab=ask',
		},
		{
			id: 'orders',
			title: t('benefits.ordersTitle'),
			text: t('benefits.ordersDescription'),
			icon: Inventory2OutlinedIcon,
			href: '/mypage?category=myOrders',
		},
		{
			id: 'returns',
			title: t('benefits.returnsTitle'),
			text: t('benefits.returnsDescription'),
			icon: AssignmentReturnOutlinedIcon,
			href: '/cs?tab=ask',
		},
		{
			id: 'support',
			title: t('benefits.supportTitle'),
			text: t('benefits.supportDescription'),
			icon: SupportAgentRoundedIcon,
			href: '/cs',
		},
	];

	return (
		<Box component="section" className="shopping-benefits container" aria-label={t('ui.shoppingBenefits')}>
			{benefits.map(({ id, title, text, icon: Icon, href }) => (
				<Link className="benefit" href={href} key={id}>
					<Box component="span" className="benefit__icon">
						<Icon aria-hidden="true" />
					</Box>
					<Stack className="benefit__content">
						<Typography component="h3">{title}</Typography>
						<Typography component="p">{text}</Typography>
					</Stack>
				</Link>
			))}
		</Box>
	);
};

export default Benefits;
