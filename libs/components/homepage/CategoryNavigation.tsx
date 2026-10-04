import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';

const categories = [
	{
		label: 'Dogs',
		caption: 'Shop essentials',
		href: '/product?category=DOG',
		tone: 'green',
		icon: PetsOutlinedIcon,
	},
	{
		label: 'Cats',
		caption: 'Comfort & play',
		href: '/product?category=CAT',
		tone: 'coral',
		icon: PetsOutlinedIcon,
	},
	{
		label: 'New',
		caption: 'Fresh arrivals',
		href: '/product?sort=createdAt',
		tone: 'yellow',
		icon: NewReleasesOutlinedIcon,
	},
	{
		label: 'Best Sellers',
		caption: 'Loved by pets',
		href: '/product?sort=productSold',
		tone: 'sage',
		icon: EmojiEventsOutlinedIcon,
	},
];

const CategoryNavigation = () => (
	<Stack component="section" className="home-categories container" aria-label="Shop by category">
		{categories.map(({ label, caption, href, tone, icon: Icon }) => (
			<Box
				component={Link}
				href={href}
				className={`category-tile category-tile--${tone}`}
				key={label}
			>
				<Box component="span" className="category-tile__icon">
					<Icon />
				</Box>
				<Stack component="span">
					<Typography component="strong">{label}</Typography>
					<Typography component="small">{caption}</Typography>
				</Stack>
				<Typography component="b">→</Typography>
			</Box>
		))}
	</Stack>
);

export default CategoryNavigation;
