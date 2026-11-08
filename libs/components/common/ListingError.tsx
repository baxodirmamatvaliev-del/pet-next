import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

import { useTranslation } from '../../i18n';

interface ListingErrorProps {
	message: string;
	className?: string;
	onRetry: () => Promise<unknown>;
}

const ListingError = ({ message, className, onRetry }: ListingErrorProps) => {
	const { t } = useTranslation();
	const [retrying, setRetrying] = useState(false);

	const retry = async () => {
		if (retrying) return;
		setRetrying(true);
		try {
			await onRetry();
		} catch {
			// Apollo keeps the query error available for another attempt.
		} finally {
			setRetrying(false);
		}
	};

	return (
		<Box className={className} role="status" aria-busy={retrying}>
			<Stack alignItems="center" spacing={1} sx={{ padding: 2, textAlign: 'center' }}>
				<Typography sx={{ fontSize: 'inherit', color: 'inherit' }}>{message}</Typography>
				<Button variant="outlined" disabled={retrying} onClick={retry}>
					{t(retrying ? 'ui.retrying' : 'ui.tryAgain')}
				</Button>
			</Stack>
		</Box>
	);
};

export default ListingError;
