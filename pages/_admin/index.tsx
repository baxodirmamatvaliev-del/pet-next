import { useEffect } from 'react';
import { useRouter } from 'next/router';

import withAdminLayout from '../../libs/components/layout/LayoutAdmin';

const AdminHome = () => {
	const router = useRouter();

	/** LIFECYCLES **/
	useEffect(() => {
		router.replace('/_admin/overview').then();
	}, [router]);

	return null;
};

export default withAdminLayout(AdminHome);
