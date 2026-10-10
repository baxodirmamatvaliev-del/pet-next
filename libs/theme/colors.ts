// MUI va SCSS bir xil ranglardan foydalanadi. Dark mode uchun ham shu nomlar saqlanadi.
export const colors = {
	primary: '#174f3f',
	'primary-dark': '#103d31',
	'primary-hover': '#277657',
	secondary: '#c14d36',
	canvas: '#fbfaf7',
	surface: '#ffffff',
	'surface-muted': '#f6f4ef',
	ink: '#202421',
	muted: '#626c65',
	'text-disabled': '#86928a',
	border: '#e7e5df',
	'border-strong': '#b7d7c2',
	sage: '#e6f0e8',
	cream: '#fff9ef',
	'on-dark': '#ffffff',
	'success-bg': '#e8f4ec',
	'success-text': '#176243',
	'warning-bg': '#fff3d9',
	'warning-text': '#8b6500',
	'error-bg': '#ffeded',
	'error-text': '#bb3d4b',
	'info-bg': '#e7f1ff',
	'info-text': '#2562a5',
	'purple-bg': '#f0eaff',
	'purple-text': '#744ab0',
	'accent-bg': '#fff0eb',
	'accent-text': '#a74420',
	'olive-bg': '#edf2e8',
	'olive-text': '#596c2d',
	rating: '#b78308',
	'hero-rgb': '255 249 239',
	'surface-rgb': '255 255 255',
} as const;

// Server HTML’iga qo‘shiladi: sahifa ochilishi bilanoq barcha CSS ranglari mavjud bo‘ladi.
export const colorVariables = `:root{${Object.entries(colors)
	.map(([name, value]) => `--pet-${name}:${value}`)
	.join(';')}}`;
