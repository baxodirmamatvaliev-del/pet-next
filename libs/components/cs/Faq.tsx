import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material';

import useDeviceDetect from '../../hooks/useDeviceDetect';

const faqItems = [
	{
		question: 'How can I contact an agent?',
		answer: 'Open Ask for help, choose Agents, then select the agent you want to contact.',
	},
	{
		question: 'How do I contact the PetNest admin?',
		answer: 'Open Ask for help and choose Admin. Your message will go to the administrator you select.',
	},
	{
		question: 'Where can I see the reply?',
		answer: 'Sign in and open My requests. Replies appear under the original message.',
	},
	{
		question: 'Can I pay by card here?',
		answer: 'Card and Kakao payments are currently demo flows. No real online charge is made.',
	},
];

const Faq = () => {
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
