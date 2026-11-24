import * as React from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Button, Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import { useWater } from './LiquidGlassWater';
import {
	demoCardErrors,
	formatDemoNumber,
	normalizeDemoField,
	useDemoCard,
} from './DemoCard';
import type { DemoCardField } from './DemoCard';
import styles from './LiquidGlassCheckout.module.scss';

interface LiquidGlassCheckoutProps {
	amount: number;
	processing: boolean;
	disabled: boolean;
	cardSelected: boolean;
	onFlipChange: (flipped: boolean) => void;
	children: React.ReactNode;
}

// Unnamed, non-autofill fields: test input is never part of FormData or mutations.
const demoFields: {
	id: DemoCardField;
	label: string;
	placeholder: string;
}[] = [
	{
		id: 'number',
		label: '카드 번호 · 테스트',
		placeholder: '4242 4242 4242 4242',
	},
	{
		id: 'holder',
		label: '카드 소유자 · 테스트',
		placeholder: 'PETNEST TEST',
	},
	{ id: 'expiry', label: '유효기간', placeholder: 'MM/YY' },
	{ id: 'cvc', label: '보안 코드 · 테스트', placeholder: '123' },
];

export default function LiquidGlassCheckout({
	amount,
	processing,
	disabled,
	cardSelected,
	onFlipChange,
	children,
}: LiquidGlassCheckoutProps) {
	const panelRef = React.useRef<HTMLDivElement>(null);
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const payRef = React.useRef<HTMLButtonElement>(null);
	const boxes = React.useRef<Record<string, HTMLDivElement | null>>({});
	const [focus, setFocus] = React.useState<string>('number');
	const inputs = React.useRef<Partial<Record<DemoCardField, HTMLInputElement>>>(
		{},
	);
	const { card, change } = useDemoCard();
	const [touched, setTouched] = React.useState<
		Partial<Record<DemoCardField, boolean>>
	>({});
	const errors = React.useMemo(() => demoCardErrors(card), [card]);
	const valid = Object.values(errors).every((error) => !error);
	React.useEffect(() => {
		for (const field of demoFields)
			inputs.current[field.id]?.setCustomValidity(
				cardSelected ? errors[field.id] : '',
			);
	}, [errors, cardSelected]);
	const edit = (
		field: DemoCardField,
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const input = event.currentTarget;
		const before = input.value;
		const position = input.selectionStart ?? before.length;
		const digitsBeforeCaret = before
			.slice(0, position)
			.replace(/\D/g, '').length;
		const normalized = normalizeDemoField(field, before);
		change(field, before);
		// Keep mid-number edits at the same digit instead of jumping to the end.
		if (field === 'number' || field === 'expiry') {
			const formatted =
				field === 'number' ? formatDemoNumber(normalized) : normalized;
			let caret = 0,
				digits = 0;
			while (caret < formatted.length && digits < digitsBeforeCaret) {
				if (/\d/.test(formatted[caret])) digits++;
				caret++;
			}
			if (position === before.length) caret = formatted.length;
			requestAnimationFrame(() => {
				if (input.isConnected && document.activeElement === input)
					input.setSelectionRange(caret, caret);
			});
		}
	};
	const uid = React.useId();
	React.useEffect(() => () => onFlipChange(false), [onFlipChange]);
	const { mode, systemMode } = useColorScheme();
	const tone =
		(mode === 'system' ? systemMode : mode) === 'dark' ? 'dark' : 'light';
	const money = new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		maximumFractionDigits: 0,
	}).format(amount);
	const target = React.useCallback(() => {
		const panel = panelRef.current;
		const element = processing ? payRef.current : boxes.current[focus];
		if (!panel || !element) return null;
		const p = panel.getBoundingClientRect(),
			b = element.getBoundingClientRect();
		return {
			x: 14 + b.left - p.left + b.width / 2,
			y: 14 + b.top - p.top + b.height / 2,
			w: b.width / 2 + 2,
			h: b.height / 2 + 2,
			r: processing ? b.height / 2 : 14,
		};
	}, [focus, processing]);
	const { gl, flow, setBlue, pointer } = useWater(
		panelRef,
		canvasRef,
		target,
		tone,
	);
	React.useEffect(() => {
		flow(processing ? 140 : 90);
		setBlue(processing ? 1 : 0);
	}, [focus, processing, flow, setBlue]);

	return (
		<div
			ref={panelRef}
			className={`checkout-section ${styles.panel}`}
			lang="ko"
			data-gl={gl ? 'on' : 'off'}
			data-processing={processing}
			onPointerMove={(event) => {
				if (event.pointerType === 'touch') return;
				const r = event.currentTarget.getBoundingClientRect();
				pointer(event.clientX - r.left + 14, event.clientY - r.top + 14, true);
			}}
			onPointerLeave={() => pointer(0, 0, false)}
		>
			<div className="lc-glass" aria-hidden="true" />
			<canvas ref={canvasRef} className="lc-water" aria-hidden="true" />
			<div className="lc-head">
				<div>
					<Typography component="span" className="lc-kicker">
						테스트 모드 · 실제 결제 없음
					</Typography>
					<Typography component="h2">PetNest</Typography>
				</div>
				<div className="lc-total">
					<Typography component="span">결제 예정 금액</Typography>
					<Typography component="strong" aria-live="polite">
						{money}
					</Typography>
				</div>
			</div>
			<Typography id={`${uid}-demo`} className="lc-demo-note">
				테스트 카드만 입력하세요 (예: 4242 4242 4242 4242). 실제 카드 정보는
				입력하지 마세요. 실제 결제는 지원하지 않습니다.
			</Typography>
			<div className="lc-fields">
				{demoFields.map((field) => {
					const error = touched[field.id] ? errors[field.id] : '';
					return (
						<div
							key={field.id}
							className={`lc-field ${field.id === 'number' || field.id === 'holder' ? 'lc-wide' : ''}`}
						>
							<label htmlFor={`${uid}-${field.id}`}>{field.label}</label>
							<div
								className="lc-box"
								data-invalid={!!error}
								ref={(element) => {
									boxes.current[field.id] = element;
								}}
							>
								<input
									id={`${uid}-${field.id}`}
									ref={(element) => {
										if (element) inputs.current[field.id] = element;
										else delete inputs.current[field.id];
									}}
									value={
										field.id === 'number'
											? formatDemoNumber(card.number)
											: card[field.id]
									}
									onChange={(event) => edit(field.id, event)}
									type={field.id === 'cvc' ? 'password' : 'text'}
									inputMode={field.id === 'holder' ? 'text' : 'numeric'}
									placeholder={field.placeholder}
									maxLength={field.id === 'holder' ? 50 : undefined}
									autoComplete="off"
									spellCheck={false}
									required={cardSelected}
									disabled={processing}
									aria-invalid={!!error}
									aria-describedby={`${uid}-demo${error ? ` ${uid}-${field.id}-error` : ''}`}
									onInvalid={() =>
										setTouched((previous) => ({
											...previous,
											[field.id]: true,
										}))
									}
									onFocus={() => {
										setFocus(field.id);
										onFlipChange(field.id === 'cvc');
									}}
									onBlur={() => {
										setTouched((previous) => ({
											...previous,
											[field.id]: true,
										}));
										onFlipChange(false);
									}}
								/>
							</div>
							{error && (
								<span
									id={`${uid}-${field.id}-error`}
									className="lc-error"
									aria-live="polite"
								>
									{error}
								</span>
							)}
						</div>
					);
				})}
			</div>
			{children}
			<Button
				ref={payRef}
				type="submit"
				className="lc-pay"
				disabled={disabled || (cardSelected && !valid)}
				startIcon={<LockOutlinedIcon />}
				aria-busy={processing}
			>
				{processing ? '주문 요청 중…' : `${money} 주문 요청`}
			</Button>
			<Typography className="lc-foot">
				<LockOutlinedIcon />
				결제 수단을 기록하며, 실제 금액은 청구되지 않습니다.
			</Typography>
		</div>
	);
}
