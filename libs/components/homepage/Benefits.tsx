import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Box, Stack, Typography } from '@mui/material';

const benefits = [
	{ title: 'Free delivery', text: 'On orders over ₩30,000', icon: LocalShippingOutlinedIcon },
	{ title: '1–2 day delivery', text: 'Fast nationwide shipping', icon: AccessTimeRoundedIcon },
	{ title: 'Easy returns', text: '30-day return policy', icon: ReplayRoundedIcon },
	{ title: 'Secure payments', text: 'Safe and trusted checkout', icon: VerifiedUserOutlinedIcon },
];

const Benefits = () => (
	<Stack component="section" className="shopping-benefits container" aria-label="Shopping benefits">
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

export default Benefits;
