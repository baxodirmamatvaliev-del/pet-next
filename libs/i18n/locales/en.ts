// Yangi kalit avval shu yerga, keyin qolgan uchta lug‘atga qo‘shiladi.
const en = {
	'nav.home': 'PetNest Korea home',
	'nav.delivery': 'Free delivery on orders over ₩30,000',
	'nav.products': 'All Products',
	'nav.dogs': 'Dogs',
	'nav.cats': 'Cats',
	'nav.new': 'New',
	'nav.newProducts': 'New Products',
	'nav.best': 'Best Sellers',
	'nav.agents': 'Agents',
	'nav.community': 'Community',
	'nav.help': 'Help Center',
	'nav.favorites': 'Favorites',
	'nav.account': 'My Account',
	'nav.login': 'Login',
	'nav.loginOrJoin': 'Login or Sign up',
	'nav.cart': 'Cart',
	'nav.shoppingCart': 'Shopping Cart',
	'nav.itemCount': 'Items: {count}',
	'nav.shop': 'SHOP',
	'nav.accountSection': 'ACCOUNT',
	'nav.shoppingActions': 'Shopping actions',
	'nav.accountNavigation': 'Account navigation',
	'nav.categories': 'Product categories',
	'nav.openMenu': 'Open menu',
	'nav.closeMenu': 'Close menu',
	'nav.search': 'Search products',
	'nav.searchPlaceholder': 'Search products...',
	'nav.submitSearch': 'Submit search',
	'preferences.language': 'Language',
	'preferences.lightMode': 'Switch to light mode',
	'preferences.darkMode': 'Switch to dark mode',
};

// Qolgan lug‘atlarda kalit yetishmasa yoki xato yozilsa, TypeScript bildiradi.
export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;
export default en;
