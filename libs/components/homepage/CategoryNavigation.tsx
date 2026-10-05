import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import { Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';

import useDeviceDetect from '../../hooks/useDeviceDetect';

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

const CategoryNavigation = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="section" className="home-categories home-categories--mobile container" aria-label="Shop by category">
				{categories.map(({ label, href, tone, icon: Icon }) => (
					<Box component={Link} href={href} className={`category-tile category-tile--${tone}`} key={label}>
						<Box component="span" className="category-tile__icon">
							<Icon />
						</Box>
						<Typography component="strong">{label}</Typography>
					</Box>
				))}
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Stack component="section" className="home-categories home-categories--pc container" aria-label="Shop by category">
				{categories.map(({ label, caption, href, tone, icon: Icon }) => (
					<Box component={Link} href={href} className={`category-tile category-tile--${tone}`} key={label}>
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
	}
};

export default CategoryNavigation;
