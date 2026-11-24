import { useEffect, useRef, useState } from 'react';
import { Button } from '@mui/material';

import { WaterCard } from './LiquidGlassWater';
import { useDemoCard } from './DemoCard';
import styles from './LiquidGlassCheckout.module.scss';

interface CheckoutCardProps {
	flipped: boolean;
	processing: boolean;
	onFlipChange: (flipped: boolean) => void;
}

const CheckoutCard = ({
	flipped,
	processing,
	onFlipChange,
}: CheckoutCardProps) => {
	const { card } = useDemoCard();
	const hostRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(320);
	useEffect(() => {
		const element = hostRef.current;
		if (!element) return;
		const resize = () =>
			setWidth(Math.max(1, Math.min(420, element.clientWidth - 24)));
		const observer = new ResizeObserver(resize);
		observer.observe(element);
		resize();
		return () => observer.disconnect();
	}, []);

	return (
		<div className={styles.cardPreview} ref={hostRef} lang="ko">
			<div aria-hidden="true">
				<WaterCard
					theme="sky"
					card={card}
					width={width}
					flipped={flipped}
					level={processing ? 0.72 : 0.42}
					bubbles={processing}
				/>
			</div>
			<Button
				type="button"
				onClick={() => onFlipChange(!flipped)}
				aria-pressed={flipped}
			>
				{flipped ? '테스트 카드 앞면 보기' : '테스트 카드 뒷면 보기'}
			</Button>
			<p>PetNest 테스트 카드 · 실제 결제용이 아닙니다</p>
		</div>
	);
};

export default CheckoutCard;
