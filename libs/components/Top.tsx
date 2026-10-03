import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Link from 'next/link';

const Top = () => (
	<header className="site-header">
		<div className="announcement">
			<span>Free delivery on all orders over ₩30,000</span>
			<span className="announcement__kr">30,000원 이상 주문 시 무료배송</span>
		</div>
		<div className="header-main container">
			<Link href="/" className="brand" aria-label="PetNest Korea home">
				<PetsRoundedIcon className="brand__mark" />
				<span className="brand__text"><strong>PetNest</strong><small>Korea</small></span>
			</Link>
			<label className="header-search">
				<input type="search" placeholder="Search for products, brands, and more..." />
				<SearchRoundedIcon />
			</label>
			<nav className="header-actions" aria-label="Account navigation">
				<Link href="/favorites" aria-label="Favorites"><FavoriteBorderRoundedIcon /><span>Favorites</span></Link>
				<Link href="/mypage" aria-label="My account"><PersonOutlineRoundedIcon /><span>My Account</span></Link>
				<Link href="/cart" aria-label="Shopping cart" className="cart-link">
					<LocalMallOutlinedIcon /><span>Cart</span><b>0</b>
				</Link>
			</nav>
			<button className="mobile-menu" type="button" aria-label="Open menu"><MenuRoundedIcon /></button>
		</div>
		<nav className="category-nav" aria-label="Product categories">
			<div className="container category-nav__inner">
				<Link href="/product?category=DOG">Dogs</Link>
				<Link href="/product?category=CAT">Cats</Link>
				<Link href="/product?sort=createdAt">New</Link>
				<Link href="/product?sort=productSold">Best Sellers</Link>
				<Link href="/product">Brands</Link>
				<Link href="/product">Sale</Link>
				<Link href="/pet">Community</Link>
			</div>
		</nav>
	</header>
);

export default Top;
