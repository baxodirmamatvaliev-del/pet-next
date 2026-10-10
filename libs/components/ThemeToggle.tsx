import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { IconButton, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { useTranslation } from '../i18n';

// Saqlash va boshqa tablardagi tema bilan sinxronlashni MUI bajaradi.
const ThemeToggle = () => {
	const { mode, systemMode, setMode } = useColorScheme();
	const { t } = useTranslation();
	const isDark = (mode === 'system' ? systemMode : mode) === 'dark';
	const label = t(isDark ? 'preferences.lightMode' : 'preferences.darkMode');

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
