import type { ComponentType } from 'react';

import { useTranslation } from '../../i18n';
import StorefrontLayout from './StorefrontLayout';

const withLayoutFull = <P extends object>(Component: ComponentType<P>) => {
	return function LayoutFull(props: P) {
		const { t } = useTranslation();

		return (
			<StorefrontLayout title={t('ui.productDetailPetnestKorea')}>
				<Component {...props} />
			</StorefrontLayout>
		);
	};
};

export default withLayoutFull;
