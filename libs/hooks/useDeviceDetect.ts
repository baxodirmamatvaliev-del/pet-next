import { useSyncExternalStore } from 'react';

const MOBILE_QUERY = '(max-width: 760px)';

const subscribe = (onChange: () => void) => {
	const media = window.matchMedia(MOBILE_QUERY);
	media.addEventListener('change', onChange);
	return () => media.removeEventListener('change', onChange);
};

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches ? 'mobile' : 'desktop';
const getServerSnapshot = () => 'desktop';

const useDeviceDetect = (): string => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export default useDeviceDetect;
