import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import Link from 'next/link';

const Footer = () => (
	<footer className="site-footer">
		<div className="container site-footer__inner">
			<div className="footer-brand">
				<div className="brand brand--footer">
					<PetsRoundedIcon className="brand__mark" />
					<span className="brand__text"><strong>PetNest</strong><small>Korea</small></span>
				</div>
				<p>Everything they love.<br />Happy pets, happy families.</p>
			</div>
			<div className="footer-links"><strong>Shop</strong><Link href="/product?category=DOG">Dogs</Link><Link href="/product?category=CAT">Cats</Link><Link href="/product?sort=productSold">Best Sellers</Link></div>
			<div className="footer-links"><strong>Customer Service</strong><Link href="/cs">Shipping & Delivery</Link><Link href="/cs">Returns & Refunds</Link><Link href="/cs">Contact Us</Link></div>
			<div className="footer-links"><strong>About Us</strong><Link href="/about">Our Story</Link><Link href="/pet">Community</Link></div>
		</div>
		<div className="container site-footer__bottom">© 2026 PetNest Korea. All rights reserved.</div>
	</footer>
);

export default Footer;
