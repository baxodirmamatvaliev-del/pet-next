import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { IconButton, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

// Saqlash va boshqa tablardagi tema bilan sinxronlashni MUI bajaradi.
const ThemeToggle = () => {
	const { mode, systemMode, setMode } = useColorScheme();
	const isDark = (mode === 'system' ? systemMode : mode) === 'dark';
	const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

	return (
		<Tooltip title={mode ? label : ''}>
			<IconButton
				className="theme-toggle"
				aria-label={label}
				disabled={!mode}
				onClick={() => setMode(isDark ? 'light' : 'dark')}
			>
				{isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
			</IconButton>
		</Tooltip>
	);
};

export default ThemeToggle;
