import { useState } from 'react';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery } from '@mui/material';
import Image from 'next/image';

import { useTranslation } from '../../i18n';
import styles from './PetCareTips.module.scss';

const tips = [
	{ id: 'walk', category: 'daily', image: 'daily-walk.jpg' },
	{ id: 'water', category: 'health', image: 'cat-hydration.jpg' },
	{ id: 'food', category: 'nutrition', image: 'healthy-eating.jpg' },
	{ id: 'play', category: 'lifestyle', image: 'play-time.jpg' },
] as const;

const PetCareTips = () => {
	const { t } = useTranslation();
	const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
	const [selected, setSelected] = useState<(typeof tips)[number]>(tips[0]);
	const [open, setOpen] = useState(false);

	return (
		<section className={`${styles.root} container`} aria-labelledby="pet-care-heading">
			<h2 id="pet-care-heading">{t('petCare.heading')}</h2>
			<div className={styles.grid}>
				{tips.map(tip => (
					<article key={tip.id} className={styles.card} aria-labelledby={`pet-care-${tip.id}`}>
						<div className={styles.visual}>
							<Image
								src={`/img/pet-care/${tip.image}`}
								alt={t(`petCare.${tip.id}.alt`)}
								fill
								unoptimized
								className={styles.image}
								sizes="(max-width: 1100px) 50vw, 320px"
							/>
						</div>
						<div className={styles.content}>
							<span className={styles.category}>{t(`petCare.category.${tip.category}`)}</span>
							<h3 id={`pet-care-${tip.id}`}>{t(`petCare.${tip.id}.title`)}</h3>
							<Button
								className={styles.more}
								endIcon={<ArrowForwardRoundedIcon />}
								aria-label={`${t(`petCare.${tip.id}.title`)}: ${t('petCare.readMore')}`}
								aria-haspopup="dialog"
								onClick={() => { setSelected(tip); setOpen(true); }}
							>
								{t('petCare.readMore')}
							</Button>
						</div>
					</article>
				))}
			</div>
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				transitionDuration={reduceMotion ? 0 : undefined}
				maxWidth="sm"
				fullWidth
				aria-labelledby="pet-care-dialog-title"
				aria-describedby="pet-care-dialog-intro"
				slotProps={{ paper: { className: styles.dialog } }}
			>
				<DialogTitle id="pet-care-dialog-title">{t(`petCare.${selected.id}.title`)}</DialogTitle>
				<DialogContent dividers className={styles.dialogContent}>
					<span className={styles.category}>{t(`petCare.category.${selected.category}`)}</span>
					<p id="pet-care-dialog-intro">{t(`petCare.${selected.id}.intro`)}</p>
					<ul>
						{(['one', 'two', 'three'] as const).map(step => (
							<li key={step}>{t(`petCare.${selected.id}.${step}`)}</li>
						))}
					</ul>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)} className={styles.close}>{t('ui.close')}</Button>
				</DialogActions>
			</Dialog>
		</section>
	);
};

export default PetCareTips;
