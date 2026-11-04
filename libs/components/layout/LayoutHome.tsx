import type { ComponentType } from 'react';

import { useTranslation } from '../../i18n';
import StorefrontLayout from './StorefrontLayout';

const withLayoutHome = <P extends object>(Component: ComponentType<P>) => {
	return function LayoutHome(props: P) {
		const { t } = useTranslation();

		return (
			<StorefrontLayout title={t('ui.petnestKoreaEverythingTheyLove')} home>
				<Component {...props} />
			</StorefrontLayout>
		);
	};
};

export default withLayoutHome;
