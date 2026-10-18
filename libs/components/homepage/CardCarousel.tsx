import { Children, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Box, IconButton, Stack } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useTranslation } from '../../i18n';

interface CardCarouselProps {
	children: ReactNode;
	label: string;
	kind: 'products' | 'pets';
}

export default function CardCarousel({ children, label, kind }: CardCarouselProps) {
	const { t } = useTranslation();
	const trackRef = useRef<HTMLDivElement>(null);
	const [edges, setEdges] = useState({ start: true, end: true });
	const count = Children.count(children);

	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;
		const update = () => setEdges({
			start: track.scrollLeft <= 1,
			end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
		});
		update();
		const observer = new ResizeObserver(update);
		observer.observe(track);
		track.addEventListener('scroll', update, { passive: true });
		return () => { observer.disconnect(); track.removeEventListener('scroll', update); };
	}, [count]);

	const move = (direction: number) => {
		const track = trackRef.current;
		if (!track) return;
		track.scrollBy({
			left: direction * track.clientWidth,
			behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
		});
	};

	return (
		<Box className={kind === 'pets' ? 'community-pets__carousel' : 'products-carousel'}>
			<Box ref={trackRef} role="region" aria-label={label} tabIndex={0} sx={{
				display: 'flex', gap: { xs: '12px', md: '18px' }, overflowX: 'auto',
				scrollSnapType: 'x mandatory', scrollPaddingInline: '2px',
				overscrollBehaviorX: 'contain', scrollbarWidth: 'thin',
				scrollbarColor: 'var(--pet-border) transparent', pb: 1.5, pt: 0.5,
				'&:focus-visible': { outline: '2px solid var(--pet-primary)', outlineOffset: 2 },
			}}>
				{Children.map(children, child => (
					<Box sx={{
						flex: { xs: '0 0 calc((100% - 12px) / 2)', sm: '0 0 calc((100% - 24px) / 3)',
							md: kind === 'products' ? '0 0 calc((100% - 54px) / 4)' : '0 0 calc((100% - 36px) / 3)' },
						minWidth: 0, display: 'flex', scrollSnapAlign: 'start', '& > article': { width: '100%' },
					}}>{child}</Box>
				))}
			</Box>
			<Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
				<IconButton aria-label={t('mui.previousPage')} disabled={edges.start} onClick={() => move(-1)} sx={{ border: '1px solid var(--pet-border)' }}><ArrowBackRoundedIcon /></IconButton>
				<IconButton aria-label={t('mui.nextPage')} disabled={edges.end} onClick={() => move(1)} sx={{ border: '1px solid var(--pet-border)' }}><ArrowForwardRoundedIcon /></IconButton>
			</Stack>
		</Box>
	);
}
