import { useEffect, useState } from 'react';

const useDeviceDetect = (): string => {
	const [device, setDevice] = useState('desktop');

	/** LIFECYCLES **/
	useEffect(() => {
		const frame = window.requestAnimationFrame(() => {
			const userAgent = navigator.userAgent;
			const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
			setDevice(isMobile ? 'mobile' : 'desktop');
		});

		return () => window.cancelAnimationFrame(frame);
	}, []);

	return device;
};

export default useDeviceDetect;
