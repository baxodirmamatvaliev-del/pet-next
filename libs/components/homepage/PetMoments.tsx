import Image from 'next/image';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../i18n';

const photos = [
	{ file: '01-park-couple.jpg', alt: 'moments.park', cropY: 0.5 },
	{ file: '02-spring-walk.jpg', alt: 'moments.spring', cropY: 0.5 },
	{ file: '03-corgi-walk.jpg', alt: 'moments.corgi', cropY: 0.68 },
	{ file: '04-field-walk.jpg', alt: 'moments.field', cropY: 0.78 },
	{ file: '05-hangang-walk.jpg', alt: 'moments.hangang', cropY: 0.65 },
	{ file: '06-forest-walk.jpg', alt: 'moments.forest', cropY: 0.5 },
] as const;
const loopPhotos = [0, 1, 2].flatMap(copy => photos.map(photo => ({ ...photo, copy })));
const wrapIndex = (index: number) => ((index % photos.length) + photos.length) % photos.length;

const PetMoments = () => {
	const { t } = useTranslation();
	const viewportRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const activeRef = useRef(0);
	const [active, setActive] = useState(0);

	const goTo = (index: number) => {
		const track = trackRef.current;
		if (!track) return;
		track.dispatchEvent(new Event('momentnavigate'));
		const width = track.querySelector('figure')?.getBoundingClientRect().width ?? 0;
		const step = width + parseFloat(getComputedStyle(track).columnGap);
		const target = wrapIndex(index);
		const nearest = target + Math.round((track.scrollLeft / step - target) / photos.length) * photos.length;
		track.scrollTo({
			left: nearest * step,
			behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
		});
	};

	useEffect(() => {
		const viewport = viewportRef.current;
		const track = trackRef.current;
		if (!viewport || !track) return;
		let disposed = false;
		let cleanupScene: (() => void) | undefined;
		const resize = () => {
			const { width, height } = viewport.getBoundingClientRect();
			const card = Math.min(width * (width < 600 ? 0.8 : width < 900 ? 0.62 : 0.48), height * 0.86 * 4 / 3);
			viewport.style.setProperty('--moment-width', `${card}px`);
			track.scrollLeft = (photos.length + activeRef.current) * (card + parseFloat(getComputedStyle(track).columnGap));
		};
		const update = () => {
			const width = track.querySelector('figure')?.getBoundingClientRect().width ?? 1;
			const step = width + parseFloat(getComputedStyle(track).columnGap);
			let position = track.scrollLeft / step;
			// Recenter on an identical copy before reaching either physical edge.
			if (position < photos.length / 2 || position > photos.length * 2.5) {
				position += position < photos.length / 2 ? photos.length : -photos.length;
				track.scrollTo({ left: position * step, behavior: 'instant' });
			}
			const index = wrapIndex(Math.round(position));
			activeRef.current = index;
			setActive(index);
		};
		resize();
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(viewport);
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			observer.disconnect();
			void import('./momentsScene').then(({ createMomentsScene }) => {
				if (!disposed) cleanupScene = createMomentsScene(viewport, track, photos);
			}).catch(() => { /* Keep the native photo slider when WebGL is unavailable. */ });
		}, { rootMargin: '200px' });
		observer.observe(viewport);
		track.addEventListener('scroll', update, { passive: true });
		return () => {
			disposed = true;
			observer.disconnect();
			resizeObserver.disconnect();
			track.removeEventListener('scroll', update);
			cleanupScene?.();
		};
	}, []);

	useEffect(() => {
		const viewport = viewportRef.current;
		const track = trackRef.current;
		const section = viewport?.parentElement;
		if (!viewport || !track || !section) return;
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		let visible = false;
		let touching = false;
		let frame = 0;
		let previous = 0;
		let position = 0;
		let resumeTimer: ReturnType<typeof setTimeout> | undefined;
		const canRotate = () => visible && !touching && !document.hidden && !motion.matches;
		const stop = () => {
			cancelAnimationFrame(frame);
			frame = 0;
			previous = 0;
			track.classList.remove('is-rotating');
		};
		const tick = (time: number) => {
			frame = 0;
			if (!canRotate()) { stop(); return; }
			const width = track.querySelector('figure')?.getBoundingClientRect().width ?? 1;
			const step = width + parseFloat(getComputedStyle(track).columnGap);
			// One full circuit takes about 30 seconds, independent of frame rate.
			position += Math.min(previous ? time - previous : 0, 64) / 1000 * step * 0.2;
			previous = time;
			if (position >= photos.length * 2 * step) position -= photos.length * step;
			track.scrollLeft = position;
			frame = requestAnimationFrame(tick);
		};
		const start = () => {
			if (frame || !canRotate()) return;
			track.classList.add('is-rotating');
			position = track.scrollLeft;
			previous = 0;
			frame = requestAnimationFrame(tick);
		};
		const resume = () => {
			clearTimeout(resumeTimer);
			resumeTimer = setTimeout(start, 2500);
		};
		const down = () => { touching = true; stop(); };
		const up = () => { touching = false; resume(); };
		const navigate = () => { stop(); resume(); };
		const visibility = () => { if (canRotate()) start(); else stop(); };
		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			visibility();
		});
		observer.observe(viewport);
		const resizeObserver = new ResizeObserver(() => { position = track.scrollLeft; previous = 0; });
		resizeObserver.observe(viewport);
		section.addEventListener('pointerdown', down);
		track.addEventListener('momentnavigate', navigate);
		section.addEventListener('keydown', down);
		section.addEventListener('keyup', up);
		window.addEventListener('pointerup', up);
		window.addEventListener('pointercancel', up);
		document.addEventListener('visibilitychange', visibility);
		motion.addEventListener('change', visibility);
		return () => {
			stop();
			clearTimeout(resumeTimer);
			observer.disconnect();
			resizeObserver.disconnect();
			section.removeEventListener('pointerdown', down);
			track.removeEventListener('momentnavigate', navigate);
			section.removeEventListener('keydown', down);
			section.removeEventListener('keyup', up);
			window.removeEventListener('pointerup', up);
			window.removeEventListener('pointercancel', up);
			document.removeEventListener('visibilitychange', visibility);
			motion.removeEventListener('change', visibility);
		};
	}, []);

	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;
		let dragging = false;
		let origin = 0;
		let scrollStart = 0;
		const down = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse' || event.button !== 0) return;
			dragging = true;
			origin = event.clientX;
			scrollStart = track.scrollLeft;
			track.setPointerCapture(event.pointerId);
			track.classList.add('is-dragging');
		};
		const move = (event: PointerEvent) => {
			if (dragging) track.scrollLeft = scrollStart + origin - event.clientX;
		};
		const up = () => {
			if (!dragging) return;
			dragging = false;
			track.classList.remove('is-dragging');
			const width = track.querySelector('figure')?.getBoundingClientRect().width ?? 1;
			goTo(Math.round(track.scrollLeft / (width + parseFloat(getComputedStyle(track).columnGap))));
		};
		track.addEventListener('pointerdown', down);
		track.addEventListener('pointermove', move);
		track.addEventListener('pointerup', up);
		track.addEventListener('pointercancel', up);
		track.addEventListener('lostpointercapture', up);
		return () => {
			track.removeEventListener('pointerdown', down);
			track.removeEventListener('pointermove', move);
			track.removeEventListener('pointerup', up);
			track.removeEventListener('pointercancel', up);
			track.removeEventListener('lostpointercapture', up);
		};
	}, []);

	return (
		<section className="pet-moments container" aria-labelledby="pet-moments-heading">
			<div className="pet-moments__heading">
				<h2 id="pet-moments-heading">{t('moments.heading')}</h2>
			</div>
			<div ref={viewportRef} className="pet-moments__viewport">
				<div ref={trackRef} className="pet-moments__track" role="region" aria-label={t('moments.heading')} tabIndex={0}
					onKeyDown={(event) => {
						if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
						event.preventDefault();
						goTo(event.key === 'Home' ? 0 : event.key === 'End' ? photos.length - 1 : activeRef.current + (event.key === 'ArrowRight' ? 1 : -1));
					}}>
					{loopPhotos.map(({ file, alt, cropY, copy }) => (
						<figure className="pet-moments__card" key={`${copy}-${file}`} aria-hidden={copy !== 1 ? true : undefined}>
							<Image src={`/img/dog-walking/${file}`} alt={t(alt)} fill draggable={false}
								sizes="(max-width: 599px) 80vw, 600px"
								style={{ objectFit: 'cover', objectPosition: `center ${cropY * 100}%` }} />
						</figure>
					))}
				</div>
			</div>
			<div className="pet-moments__controls">
				<button type="button" className="pet-moments__arrow" aria-label={t('mui.previousPage')} onClick={() => goTo(active - 1)}><ArrowBackRoundedIcon /></button>
				<div className="pet-moments__dots">
					{photos.map(({ file }, index) => <button type="button" key={file} aria-label={t('mui.page', { page: index + 1 })} aria-current={active === index ? 'true' : undefined} onClick={() => goTo(index)} />)}
				</div>
				<button type="button" className="pet-moments__arrow" aria-label={t('mui.nextPage')} onClick={() => goTo(active + 1)}><ArrowForwardRoundedIcon /></button>
			</div>
			<p className="pet-moments__caption" aria-live="off" aria-atomic="true">{t(photos[active].alt)} <span>{active + 1} / {photos.length}</span></p>
		</section>
	);
};

export default PetMoments;
