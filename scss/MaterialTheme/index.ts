import type { ThemeOptions } from '@mui/material/styles';
import { colors } from '../../libs/theme/colors';

export const light: ThemeOptions = {
	palette: {
		mode: 'light',
		divider: colors.border,
		success: { main: colors['success-text'] },
		warning: { main: colors['warning-text'] },
		error: { main: colors['error-text'] },
		info: { main: colors['info-text'] },
		primary: {
			main: colors.primary,
			contrastText: colors['on-dark'],
		},
		secondary: {
			main: colors.secondary,
		},
		background: {
			default: colors.canvas,
			paper: colors.surface,
		},
		text: {
			primary: colors.ink,
			secondary: colors.muted,
		},
	},
	typography: {
		fontFamily: 'Arial, Helvetica, sans-serif',
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					boxShadow: 'none',
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
	},
};
