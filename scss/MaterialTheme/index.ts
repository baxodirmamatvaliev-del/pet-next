import type { ThemeOptions } from '@mui/material/styles';

export const light: ThemeOptions = {
	palette: {
		mode: 'light',
		primary: {
			main: '#174f3f',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#ff7057',
		},
		background: {
			default: '#ffffff',
			paper: '#ffffff',
		},
		text: {
			primary: '#202421',
			secondary: '#6d756f',
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
