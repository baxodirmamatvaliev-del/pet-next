import { createTheme } from '@mui/material/styles';
import type { PaletteOptions } from '@mui/material/styles';
import { colors, darkColors } from '../../libs/theme/colors';
import type { useTranslation } from '../../libs/i18n';

// Ikkala tema MUI komponentlari va SCSS uchun bir xil palette’dan olinadi.
const palette = (values: Record<keyof typeof colors, string>): PaletteOptions => ({
	divider: values.border,
	success: { main: values['success-text'] },
	warning: { main: values['warning-text'] },
	error: { main: values['error-text'] },
	info: { main: values['info-text'] },
	primary: {
		main: values.primary,
		contrastText: values.canvas,
	},
	secondary: {
		main: values.secondary,
	},
	background: {
		default: values.canvas,
		paper: values.surface,
	},
	text: {
		primary: values.ink,
		secondary: values.muted,
		disabled: values['text-disabled'],
	},
});

export const createAppTheme = (t: ReturnType<typeof useTranslation>['t']) => createTheme({
	cssVariables: { colorSchemeSelector: '[data-mui-color-scheme="%s"]' },
	colorSchemes: {
		light: { palette: palette(colors) },
		dark: { palette: palette(darkColors) },
	},
	typography: {
		fontFamily: 'Arial, Helvetica, sans-serif',
	},
	components: {
		// Sahifalash va yulduzli bahoning screen reader matnlari ham joriy tilda.
		MuiPagination: {
			defaultProps: {
				'aria-label': t('mui.pagination'),
				getItemAriaLabel: (type, page, selected) => {
					if (type === 'page') return t(selected ? 'mui.currentPage' : 'mui.page', { page: page ?? 1 });
					if (type === 'first') return t('mui.firstPage');
					if (type === 'last') return t('mui.lastPage');
					return t(type === 'next' ? 'mui.nextPage' : 'mui.previousPage');
				},
			},
		},
		MuiRating: {
			defaultProps: {
				getLabelText: (count) => t('mui.rating', { count }),
				emptyLabelText: t('mui.emptyRating'),
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					boxShadow: 'none',
				},
				containedPrimary: {
					backgroundColor: 'var(--pet-primary-fill)',
					color: 'var(--pet-on-dark)',
					'&:hover': { backgroundColor: 'var(--pet-primary-hover)' },
				},
				containedSecondary: {
					backgroundColor: 'var(--pet-secondary-fill)',
					color: 'var(--pet-on-dark)',
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: 8,
				},
			},
		},
		MuiCheckbox: {
			defaultProps: {
				color: 'primary',
			},
		},
		MuiPaper: {
			styleOverrides: { root: { backgroundImage: 'none' } },
		},
	},
});
