import type { ComponentType } from 'react';

import { useTranslation } from '../../i18n';
import StorefrontLayout from './StorefrontLayout';

const withLayoutBasic = <P extends object>(Component: ComponentType<P>) => {
	return function LayoutBasic(props: P) {
		const { t } = useTranslation();

		return (
			<StorefrontLayout title={t('ui.shopPetnestKorea')}>
				<Component {...props} />
			</StorefrontLayout>
		);
	};
};

export default withLayoutBasic;
