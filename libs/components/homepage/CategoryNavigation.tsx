import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import Link from 'next/link';

const categories = [
	{ label: 'Dogs', caption: 'Shop essentials', href: '/product?category=DOG', tone: 'green', icon: PetsOutlinedIcon },
	{ label: 'Cats', caption: 'Comfort & play', href: '/product?category=CAT', tone: 'coral', icon: PetsOutlinedIcon },
	{ label: 'New', caption: 'Fresh arrivals', href: '/product?sort=createdAt', tone: 'yellow', icon: NewReleasesOutlinedIcon },
	{ label: 'Best Sellers', caption: 'Loved by pets', href: '/product?sort=productSold', tone: 'sage', icon: EmojiEventsOutlinedIcon },
];

const CategoryNavigation = () => (
	<section className="home-categories container" aria-label="Shop by category">
		{categories.map(({ label, caption, href, tone, icon: Icon }) => (
			<Link href={href} className={`category-tile category-tile--${tone}`} key={label}>
				<span className="category-tile__icon"><Icon /></span>
				<span><strong>{label}</strong><small>{caption}</small></span>
				<b>→</b>
			</Link>
		))}
	</section>
);

export default CategoryNavigation;
