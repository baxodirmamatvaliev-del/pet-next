import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Link from 'next/link';

const Hero = () => (
	<section className="home-hero container">
		<div className="home-hero__content">
			<span className="eyebrow">For happy dogs and cats</span>
			<h1>Everything<br />they love</h1>
			<p>Premium accessories and essentials for healthier, happier days together.</p>
			<div className="home-hero__actions">
				<Link href="/product?category=DOG" className="button button--primary">
					Shop Dogs <ArrowForwardRoundedIcon />
				</Link>
				<Link href="/product?category=CAT" className="button button--secondary">
					Shop Cats <ArrowForwardRoundedIcon />
				</Link>
			</div>
		</div>
	</section>
);

export default Hero;
