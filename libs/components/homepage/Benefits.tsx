import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

const benefits = [
	{ title: 'Free delivery', text: 'On orders over ₩30,000', icon: LocalShippingOutlinedIcon },
	{ title: '1–2 day delivery', text: 'Fast nationwide shipping', icon: AccessTimeRoundedIcon },
	{ title: 'Easy returns', text: '30-day return policy', icon: ReplayRoundedIcon },
	{ title: 'Secure payments', text: 'Safe and trusted checkout', icon: VerifiedUserOutlinedIcon },
];

const Benefits = () => (
	<section className="shopping-benefits container" aria-label="Shopping benefits">
		{benefits.map(({ title, text, icon: Icon }) => (
			<div className="benefit" key={title}>
				<span><Icon /></span>
				<div><strong>{title}</strong><small>{text}</small></div>
			</div>
		))}
	</section>
);

export default Benefits;
