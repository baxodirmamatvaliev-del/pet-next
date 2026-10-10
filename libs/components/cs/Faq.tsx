import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material';

import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from '../../i18n';

const Faq = () => {
	const { t } = useTranslation();
	const faqItems = [
		{
			question: t('ui.howCanIContactAnAgent'),
			answer: t('ui.openAskForHelpChooseAgentsThenSelect'),
		},
		{
			question: t('ui.howDoIContactThePetnestAdmin'),
			answer: t('ui.openAskForHelpAndChooseAdminYour'),
		},
		{
			question: t('ui.whereCanISeeTheReply'),
			answer: t('ui.signInAndOpenMyRequestsRepliesAppear'),
		},
		{
			question: t('ui.canIPayByCardHere'),
			answer: t('ui.cardAndKakaoPaymentsAreCurrentlyDemoFlows'),
		},
	];

	const device = useDeviceDetect();
	const content = faqItems.map((item) => (
		<Accordion key={item.question} disableGutters elevation={0}>
			<AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
				<Typography component="strong">{item.question}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Typography>{item.answer}</Typography>
			</AccordionDetails>
		</Accordion>
	));

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return <Stack className="cs-faq cs-faq--mobile">{content}</Stack>;
	} else {
		/** RENDER PC **/
		return <Stack className="cs-faq cs-faq--pc">{content}</Stack>;
	}
};

export default Faq;
