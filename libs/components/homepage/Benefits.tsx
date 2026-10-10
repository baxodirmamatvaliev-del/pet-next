import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Box, Stack, Typography } from '@mui/material';

import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from '../../i18n';

const Benefits = () => {
	const { t } = useTranslation();
	const benefits = [
		{ title: t('ui.freeDelivery'), text: t('ui.onOrdersOver30000'), icon: LocalShippingOutlinedIcon },
		{ title: t('ui.fastDelivery'), text: t('ui.fastNationwideShipping'), icon: AccessTimeRoundedIcon },
		{ title: t('ui.easyReturns'), text: t('ui.returnPeriod'), icon: ReplayRoundedIcon },
		{ title: t('ui.securePayments'), text: t('ui.safeAndTrustedCheckout'), icon: VerifiedUserOutlinedIcon },
	];

	const device = useDeviceDetect();

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="section" className="shopping-benefits shopping-benefits--mobile container" aria-label={t('ui.shoppingBenefits')}>
				{benefits.map(({ title, text, icon: Icon }) => (
					<Stack direction="row" className="benefit" key={title}>
						<Box component="span">
							<Icon />
						</Box>
						<Stack>
							<Typography component="strong">{title}</Typography>
							<Typography component="small">{text}</Typography>
						</Stack>
					</Stack>
				))}
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack component="section" className="shopping-benefits shopping-benefits--pc container" aria-label={t('ui.shoppingBenefits')}>
				{benefits.map(({ title, text, icon: Icon }) => (
					<Stack direction="row" className="benefit" key={title}>
						<Box component="span">
							<Icon />
						</Box>
						<Stack>
							<Typography component="strong">{title}</Typography>
							<Typography component="small">{text}</Typography>
						</Stack>
					</Stack>
				))}
			</Stack>
		);
	}
};

export default Benefits;
