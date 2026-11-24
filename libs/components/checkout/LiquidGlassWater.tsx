/** Adapted from Nimbus UI “Tidepool” by guglielmogiannattasio.it (21st.dev).
 * Original water shaders and spring physics; PetNest keeps interactive test details in ephemeral visual state only.
 */
import * as React from 'react';
import { demoCardBrand, formatDemoNumber } from './DemoCard';
import type { DemoCardDetails } from './DemoCard';

type WaterGL = {
	gl: WebGLRenderingContext;
	u: Record<string, WebGLUniformLocation | null>;
	dispose: () => void;
};

function createWaterGL(
	canvas: HTMLCanvasElement,
	vertex: string,
	fragment: string,
	uniforms: string[],
): WaterGL | null {
	let gl: WebGLRenderingContext | null;
	try {
		gl = canvas.getContext('webgl', {
			premultipliedAlpha: true,
			alpha: true,
			antialias: false,
		});
	} catch {
		return null;
	}
	if (!gl) return null;
	const program = gl.createProgram(),
		buffer = gl.createBuffer();
	const vs = gl.createShader(gl.VERTEX_SHADER),
		fs = gl.createShader(gl.FRAGMENT_SHADER);
	const dispose = () => {
		gl.deleteBuffer(buffer);
		gl.deleteProgram(program);
		gl.deleteShader(vs);
		gl.deleteShader(fs);
	};
	if (!program || !buffer || !vs || !fs) {
		dispose();
		return null;
	}
	gl.shaderSource(vs, vertex);
	gl.compileShader(vs);
	gl.shaderSource(fs, fragment);
	gl.compileShader(fs);
	if (
		!gl.getShaderParameter(vs, gl.COMPILE_STATUS) ||
		!gl.getShaderParameter(fs, gl.COMPILE_STATUS)
	) {
		dispose();
		return null;
	}
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		dispose();
		return null;
	}
	gl.useProgram(program);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 3, -1, -1, 3]),
		gl.STATIC_DRAW,
	);
	const location = gl.getAttribLocation(program, 'a');
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
	const u: WaterGL['u'] = {};
	for (const name of uniforms) u[name] = gl.getUniformLocation(program, name);
	return { gl, u, dispose };
}

export type WaterCardTheme = 'sky' | 'glass' | 'deep';

export const CARD_THEMES: Record<
	WaterCardTheme,
	{
		a: number[];
		b: number[];
		w: number[];
		fg: string;
		soft: string;
		back: string;
	}
> = {
	sky: {
		a: [0.2, 0.62, 1],
		b: [0.0, 0.3, 0.82],
		w: [0.5, 0.92, 1],
		fg: '#FFFFFF',
		soft: 'rgba(255,255,255,.72)',
		back: 'linear-gradient(160deg,#2E9BFF,#0050CC)',
	},
	glass: {
		a: [0.93, 0.97, 1],
		b: [0.72, 0.87, 0.99],
		w: [0.2, 0.74, 1],
		fg: '#0B132B',
		soft: 'rgba(11,19,43,.62)',
		back: 'linear-gradient(160deg,#EEF7FF,#B9DCF8)',
	},
	deep: {
		a: [0.09, 0.15, 0.32],
		b: [0.02, 0.04, 0.12],
		w: [0.0, 0.6, 1],
		fg: '#F1F7FF',
		soft: 'rgba(241,247,255,.66)',
		back: 'linear-gradient(160deg,#16244A,#050A1C)',
	},
};

const CARD_VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const CARD_FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec2 uTilt;uniform float uLevel;uniform float uSlope;uniform float uWave;
uniform vec3 uA;uniform vec3 uB;uniform vec3 uW;uniform float uR;uniform float uBub;uniform float uOk;uniform vec4 uRip[4];
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float surfY(float x){
 float rip=0.;for(int i=0;i<4;i++){vec4 R=uRip[i];if(R.w>0.){float dx=abs(x-R.x)-R.z*240.;rip+=R.w*exp(-R.z*1.8)*sin(dx*.13)*exp(-dx*dx/700.);}}
 return uRes.y*(1.-uLevel)+uSlope*(x-uRes.x*.5)+uWave*sin(x*.045+uTime*2.6)+(.9+uWave*.25)*sin(x*.11-uTime*1.7)+rip*4.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 vec2 c=uRes*.5;float d=sdRB(p-c,c-.5,uR);float m=smoothstep(.8,-.8,d);
 if(m<=0.){gl_FragColor=vec4(0.);return;}
 vec2 uv=p/uRes;
 vec3 col=mix(uA,uB,clamp(uv.y*.75+uv.x*.4,0.,1.));
 vec2 lp=vec2(.22-uTilt.x*.3,.15-uTilt.y*.3);vec2 q=(uv-lp)*vec2(1.5,2.3);
 col+=.16*exp(-dot(q,q)*2.5);
 float s=surfY(p.x);
 float sd=p.y-s;
 float under=smoothstep(-.8,.8,sd);
 float depth=clamp(sd/uRes.y,0.,1.);
 vec2 n=vec2(surfY(p.x+1.)-s,1.);
 vec3 wc=mix(uW,uW*vec3(.35,.6,.85),depth*1.3);
 float cs=caus(p*.042+vec2(uSlope*3.,uTime*.05),uTime*.9);
 wc+=vec3(.8,.96,1.)*smoothstep(.55,1.,cs)*.38*(1.-depth*.7);
 float bub=0.;
 for(int i=0;i<7;i++){float fi=float(i);float bx=uRes.x*(.1+.8*hash(vec2(fi,3.1)));float sp=30.+40.*hash(vec2(fi,7.7));
  float by=uRes.y-mod(uTime*sp+hash(vec2(fi,1.3))*uRes.y,uRes.y*1.2);float br=1.2+2.2*hash(vec2(fi,9.1));
  vec2 bp=p-vec2(bx+sin(uTime*2.+fi)*3.,by);float bd=length(bp)-br;
  bub+=(smoothstep(.8,-.8,bd)*.25+smoothstep(.8,0.,abs(bd))*.5)*step(s+br,by);}
 wc+=vec3(1.)*bub*uBub;
 col=mix(col,mix(col,wc,.74),under);
 col+=vec3(1.)*(exp(-pow(sd+1.,2.)/2.)*.75+exp(-pow(sd-3.5,2.)/12.)*.14);
 col=mix(col,col+vec3(-.02,.06,.03),uOk);
 float ang=dot(uv-.5,normalize(vec2(1.,.55)))+uTilt.x*.32-uTilt.y*.22;
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+ang*1.7+uTime*.03));
 float sheen=exp(-pow((ang-.06)/.07,2.))*.2+exp(-pow((ang+.3)/.025,2.))*.1;
 col+=mix(vec3(1.),irid,.5)*sheen;
 float rim=smoothstep(-7.,0.,d);
 col=mix(col,mix(vec3(1.),irid,.65),rim*.16);
 col+=smoothstep(-1.6,0.,d)*.35*(.35+.65*(1.-uv.y));
 col+=(hash(p+fract(uTime))-.5)*.014;
 gl_FragColor=vec4(col*m,m);
}`;

type CardGL = WaterGL;

function initCardGL(canvas: HTMLCanvasElement): WaterGL | null {
	return createWaterGL(canvas, CARD_VERT, CARD_FRAG, [
		'uRes',
		'uDpr',
		'uTime',
		'uTilt',
		'uLevel',
		'uSlope',
		'uWave',
		'uA',
		'uB',
		'uW',
		'uR',
		'uBub',
		'uOk',
		'uRip',
	]);
}

export type WaterCardHandle = { splash: (x?: number, amp?: number) => void };

export type WaterCardProps = {
	card: DemoCardDetails;
	theme: WaterCardTheme;
	flipped?: boolean;
	/** 0..1 water level */
	level?: number;
	bubbles?: boolean;
	success?: boolean;
	interactive?: boolean;
	/** live = animate; false = draw a still frame (for cards sitting in a stack) */
	live?: boolean;
	width?: number;
	className?: string;
	style?: React.CSSProperties;
};

const Chip = () => (
	<svg viewBox="0 0 40 30" width="100%" height="100%" aria-hidden="true">
		<defs>
			<linearGradient id="nc-chip" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor="#F6E7B0" />
				<stop offset=".5" stopColor="#D9B865" />
				<stop offset="1" stopColor="#F3DE98" />
			</linearGradient>
		</defs>
		<rect
			x=".5"
			y=".5"
			width="39"
			height="29"
			rx="6"
			fill="url(#nc-chip)"
			stroke="rgba(120,90,20,.35)"
		/>
		<path
			d="M14 .5v29M26 .5v29M.5 10h13.5M26 10h13.5M.5 20h13.5M26 20h13.5M14 15h12"
			stroke="rgba(120,90,20,.38)"
			fill="none"
		/>
	</svg>
);

const Contactless = () => (
	<svg
		viewBox="0 0 24 24"
		width="100%"
		height="100%"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		aria-hidden="true"
	>
		<path d="M7.5 8.5a5 5 0 0 1 0 7M11 6a8.5 8.5 0 0 1 0 12M14.5 3.5a12 12 0 0 1 0 17" />
	</svg>
);

const PetMark = () => (
	<svg
		viewBox="0 0 24 24"
		width="100%"
		height="100%"
		fill="currentColor"
		aria-hidden="true"
	>
		<ellipse cx="7" cy="7" rx="2.5" ry="3" transform="rotate(-20 7 7)" />
		<ellipse cx="17" cy="7" rx="2.5" ry="3" transform="rotate(20 17 7)" />
		<ellipse cx="3.5" cy="12" rx="2" ry="2.6" transform="rotate(-30 3.5 12)" />
		<ellipse cx="20.5" cy="12" rx="2" ry="2.6" transform="rotate(30 20.5 12)" />
		<path d="M6 18c0-3 3-7 6-7s6 4 6 7c0 4-4 2-6 2s-6 2-6-2Z" />
	</svg>
);

export const WaterCard = React.forwardRef<WaterCardHandle, WaterCardProps>(
	function WaterCard(
		{
			theme,
			card,
			flipped = false,
			level = 0.42,
			bubbles = false,
			success = false,
			interactive = true,
			live = true,
			width = 360,
			className,
			style,
		},
		ref,
	) {
		const number = formatDemoNumber(card.number, true),
			name = card.holder.trim() || 'PETNEST TEST',
			expiry = card.expiry || 'MM/YY',
			cvc = card.cvc || '•••',
			brand = `${demoCardBrand(card.number)} · TEST`;
		const T = CARD_THEMES[theme];
		const W = width,
			H = Math.round(width / 1.586),
			R = Math.round(width * 0.052);
		const sceneRef = React.useRef<HTMLDivElement>(null);
		const cardRef = React.useRef<HTMLDivElement>(null);
		const shadowRef = React.useRef<HTMLDivElement>(null);
		const canvasRef = React.useRef<HTMLCanvasElement>(null);
		const props = React.useRef({ flipped, level, bubbles, success, live, T });
		React.useEffect(() => {
			props.current = { flipped, level, bubbles, success, live, T };
		}, [flipped, level, bubbles, success, live, T]);
		const [gl, setGl] = React.useState(true);
		const st = React.useRef({
			tilt: { x: 0, y: 0, vx: 0, vy: 0 },
			aim: { x: 0, y: 0, on: false },
			flip: { a: 0, v: 0 },
			slope: { s: 0, v: 0 },
			lvl: { l: level, v: 0 },
			ok: 0,
			rips: [] as { x: number; age: number; amp: number }[],
			time: 0,
			last: 0,
			raf: 0,
			visible: true,
			reduce: false,
			glc: null as CardGL | null,
		});

		const draw = React.useCallback(() => {
			const s = st.current;
			const P = props.current;
			const tx = s.tilt.x,
				ty = s.tilt.y;
			if (cardRef.current) {
				const roll = tx * 2.2;
				cardRef.current.style.transform = `rotateX(${(-ty * 13).toFixed(3)}deg) rotateY(${(tx * 17 + s.flip.a).toFixed(3)}deg) rotateZ(${roll.toFixed(3)}deg)`;
			}
			if (shadowRef.current)
				shadowRef.current.style.transform = `translate(${(tx * 14).toFixed(2)}px, ${(18 + ty * 8).toFixed(2)}px) scale(${(0.92 - Math.abs(ty) * 0.04).toFixed(3)})`;
			const g = s.glc;
			if (!g) return;
			const { gl: c, u } = g;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			c.viewport(0, 0, c.drawingBufferWidth, c.drawingBufferHeight);
			c.uniform2f(u.uRes, W, H);
			c.uniform1f(u.uDpr, dpr);
			c.uniform1f(u.uTime, s.time);
			c.uniform2f(u.uTilt, tx, ty);
			c.uniform1f(u.uLevel, s.lvl.l);
			c.uniform1f(u.uSlope, s.slope.s);
			c.uniform1f(
				u.uWave,
				s.reduce
					? 0
					: Math.min(1.2 + Math.abs(s.slope.v) * 6 + Math.abs(s.lvl.v) * 30, 6),
			);
			c.uniform3fv(u.uA, P.T.a);
			c.uniform3fv(u.uB, P.T.b);
			c.uniform3fv(u.uW, P.T.w);
			c.uniform1f(u.uR, R);
			c.uniform1f(u.uBub, P.bubbles && !s.reduce ? 1 : 0);
			c.uniform1f(u.uOk, s.ok);
			const rips = new Float32Array(16);
			s.rips
				.slice(-4)
				.forEach((r, i) => rips.set([r.x, 0, r.age, r.amp], i * 4));
			c.uniform4fv(u.uRip, rips);
			c.clearColor(0, 0, 0, 0);
			c.clear(c.COLOR_BUFFER_BIT);
			c.drawArrays(c.TRIANGLES, 0, 3);
		}, [W, H, R]);

		const step = React.useCallback((dt: number) => {
			const s = st.current;
			const P = props.current;
			s.time += dt;
			// tilt: follow the pointer, or float gently when idle
			const ax = s.aim.on
				? s.aim.x
				: s.reduce
					? 0
					: Math.sin(s.time * 0.7) * 0.18;
			const ay = s.aim.on
				? s.aim.y
				: s.reduce
					? 0
					: Math.sin(s.time * 0.53 + 1) * 0.12;
			if (s.reduce) {
				s.tilt.x = ax;
				s.tilt.y = ay;
			} else {
				s.tilt.vx += (60 * (ax - s.tilt.x) - 11 * s.tilt.vx) * dt;
				s.tilt.vy += (60 * (ay - s.tilt.y) - 11 * s.tilt.vy) * dt;
				s.tilt.x += s.tilt.vx * dt;
				s.tilt.y += s.tilt.vy * dt;
			}
			// flip
			const fa = P.flipped ? 180 : 0;
			if (s.reduce) s.flip.a = fa;
			else {
				const before = s.flip.a;
				s.flip.v += (150 * (fa - s.flip.a) - 17 * s.flip.v) * dt;
				s.flip.a += s.flip.v * dt;
				if (Math.abs(fa - before) > 1)
					s.slope.v += (s.flip.v > 0 ? 1 : -1) * dt * 1.4; // flipping throws the water
			}
			// water: stays level in the world, so it slopes against the card's roll and sloshes back
			const slopeT = -s.tilt.x * 0.075;
			if (s.reduce) s.slope.s = slopeT;
			else {
				s.slope.v += (26 * (slopeT - s.slope.s) - 1.6 * s.slope.v) * dt;
				s.slope.s += s.slope.v * dt;
			}
			s.slope.s = Math.max(-0.35, Math.min(0.35, s.slope.s));
			if (s.reduce) s.lvl.l = P.level;
			else {
				s.lvl.v += (14 * (P.level - s.lvl.l) - 5 * s.lvl.v) * dt;
				s.lvl.l += s.lvl.v * dt;
			}
			s.ok += ((P.success ? 1 : 0) - s.ok) * Math.min(1, dt * 4);
			s.rips.forEach((r) => (r.age += dt));
			s.rips = s.rips.filter((r) => r.age < 2);
		}, []);

		const loop = React.useCallback(() => {
			const s = st.current;
			if (s.raf) return;
			s.last = performance.now();
			const tick = (now: number) => {
				const dt = Math.min((now - s.last) / 1000, 1 / 30);
				s.last = now;
				step(dt);
				draw();
				const settling =
					Math.abs(s.flip.v) > 0.5 ||
					Math.abs(s.lvl.v) > 0.002 ||
					s.rips.length > 0 ||
					s.aim.on;
				if (
					s.visible &&
					s.glc &&
					!document.hidden &&
					props.current.live &&
					(!s.reduce || settling)
				)
					s.raf = requestAnimationFrame(tick);
				else s.raf = 0;
			};
			s.raf = requestAnimationFrame(tick);
		}, [draw, step]);

		React.useImperativeHandle(
			ref,
			() => ({
				splash: (x, amp = 1) => {
					const s = st.current;
					if (s.reduce) return;
					s.rips.push({ x: x ?? W / 2, age: 0, amp });
					s.lvl.v += 0.25 * amp;
					loop();
				},
			}),
			[W, loop],
		);

		React.useEffect(() => {
			const s = st.current;
			const media = window.matchMedia('(prefers-reduced-motion: reduce)');
			const motion = () => {
				s.reduce = media.matches;
				if (s.reduce) s.aim.on = false;
				loop();
			};
			s.reduce = media.matches;
			media.addEventListener('change', motion);
			document.addEventListener('visibilitychange', loop);
			const cv = canvasRef.current;
			s.glc = cv ? initCardGL(cv) : null;
			setGl(!!s.glc);
			const lost = (e: Event) => {
				e.preventDefault();
				cancelAnimationFrame(s.raf);
				s.raf = 0;
				s.glc = null;
				setGl(false);
			};
			const restored = () => {
				s.glc = cv ? initCardGL(cv) : null;
				setGl(!!s.glc);
				loop();
			};
			cv?.addEventListener('webglcontextrestored', restored);
			cv?.addEventListener('webglcontextlost', lost);
			const io = new IntersectionObserver(([e]) => {
				s.visible = e.isIntersecting;
				if (s.visible) loop();
			});
			if (sceneRef.current) io.observe(sceneRef.current);
			return () => {
				cv?.removeEventListener('webglcontextlost', lost);
				io.disconnect();
				cancelAnimationFrame(s.raf);
				s.raf = 0;
				s.glc?.dispose();
				s.glc = null;
				media.removeEventListener('change', motion);
				document.removeEventListener('visibilitychange', loop);
				cv?.removeEventListener('webglcontextrestored', restored);
			};
		}, [loop]);

		React.useEffect(() => {
			const cv = canvasRef.current;
			if (cv) {
				const dpr = Math.min(window.devicePixelRatio || 1, 2);
				cv.width = Math.round(W * dpr);
				cv.height = Math.round(H * dpr);
				cv.style.width = `${W}px`;
				cv.style.height = `${H}px`;
			}
			draw();
			loop();
		}, [W, H, draw, loop]);

		React.useEffect(() => {
			loop();
		}, [flipped, level, bubbles, success, live, theme, loop]);

		const onMove = (e: React.PointerEvent) => {
			if (!interactive || st.current.reduce || e.pointerType === 'touch')
				return;
			const r = sceneRef.current?.getBoundingClientRect();
			if (!r) return;
			const s = st.current;
			s.aim.x = Math.max(
				-1,
				Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2),
			);
			s.aim.y = Math.max(
				-1,
				Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2),
			);
			s.aim.on = true;
			loop();
		};

		return (
			<div
				ref={sceneRef}
				className={['nc-scene', className].filter(Boolean).join(' ')}
				data-theme={theme}
				data-gl={gl ? 'on' : 'off'}
				style={{
					width: W,
					height: H,
					fontSize: W * 0.042,
					['--nc-fg' as string]: T.fg,
					['--nc-soft' as string]: T.soft,
					['--nc-back' as string]: T.back,
					['--nc-r' as string]: `${R}px`,
					...style,
				}}
				onPointerMove={onMove}
				onPointerLeave={() => {
					st.current.aim.on = false;
					loop();
				}}
				onPointerDown={(e) => {
					const r = sceneRef.current?.getBoundingClientRect();
					if (r && interactive && !st.current.reduce) {
						st.current.rips.push({ x: e.clientX - r.left, age: 0, amp: 0.8 });
						loop();
					}
				}}
			>
				<div className="nc-shadow" ref={shadowRef} aria-hidden="true" />
				<div className="nc-card" ref={cardRef}>
					<div className="nc-edge" aria-hidden="true" />
					<div className="nc-face nc-front">
						<canvas className="nc-water" ref={canvasRef} aria-hidden="true" />
						<div
							className="nc-fallback"
							aria-hidden="true"
							style={{
								background: `linear-gradient(160deg, rgb(${T.a.map((v) => Math.round(v * 255)).join(',')}), rgb(${T.b.map((v) => Math.round(v * 255)).join(',')}))`,
							}}
						>
							<span
								style={{
									height: `${Math.round(level * 100)}%`,
									background: `rgba(${T.w.map((v) => Math.round(v * 255)).join(',')},.55)`,
								}}
							/>
						</div>
						<div className="nc-ui">
							<div className="nc-top">
								<span className="nc-logo">
									<span className="nc-cloud">
										<PetMark />
									</span>
									PetNest
								</span>
								<span className="nc-cl">
									<Contactless />
								</span>
							</div>
							<span className="nc-chip">
								<Chip />
							</span>
							<div className="nc-num">{number}</div>
							<div className="nc-bottom">
								<div className="nc-field">
									<span className="nc-lbl">테스트 카드</span>
									<span className="nc-val nc-name">{name}</span>
								</div>
								<div className="nc-field">
									<span className="nc-lbl">유효기간</span>
									<span className="nc-val">{expiry}</span>
								</div>
								<span className="nc-brand">{brand}</span>
							</div>
						</div>
					</div>
					<div className="nc-face nc-back" aria-hidden="true">
						<div className="nc-stripe" />
						<div className="nc-sigrow">
							<div className="nc-sig" />
							<div className="nc-cvc">{cvc}</div>
						</div>
						<p className="nc-fine">
							PetNest 테스트 카드 · 실제 결제용이 아닙니다
						</p>
					</div>
				</div>
			</div>
		);
	},
);

const PAD = 14;
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uCard;uniform float uCardR;
uniform vec4 uBox[2];uniform float uBoxR[2];uniform vec4 uSat[4];uniform vec4 uRip[6];uniform vec3 uMouse;uniform vec3 uFront;
uniform float uDark;uniform float uAmb;uniform float uBlue;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;
 for(int i=0;i<2;i++){vec4 B=uBox[i];if(B.z>.5){vec2 q=p;
  if(i==0){float f=exp(-pow(q.x-uFront.x,2.)/200.);q.x+=f*uFront.y*(sin(q.y*.2+uTime*7.)+.5*sin(q.y*.37-uTime*5.));}
  d=smin(d,sdRB(q-B.xy,B.zw,uBoxR[i]),12.);}}
 for(int i=0;i<4;i++){vec4 S=uSat[i];if(S.z>.5){d=smin(d,length(p-S.xy)-S.z,12.);}}
 return d;}
float cardD(vec2 p){vec2 h=uCard.zw*.5;return sdRB(p-uCard.xy-h,h,uCardR);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1400.);
 w+=uAmb*(sin(p.x*.04+p.y*.02+uTime*1.1)*.45+sin(p.x*.11-uTime*.8+p.y*.13)*.25);return w;}
float H(vec2 p){float dc=cardD(p);return lens(dc,18.)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,9.,-dc);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=cardD(p);if(dp>16.){gl_FragColor=vec4(0.);return;}
 float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+p.y*.0015+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark+.08*uBlue);
 vec3 c=vec3(0.,.14,.36)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(.80,.95,1.),vec3(.55,.82,1.),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
 /* blue water while paying */
 vec3 bw=mix(vec3(.35,.86,1.),vec3(0.,.52,.98),clamp(.5-n.y*2.+th*.3,0.,1.));
 dc=mix(dc,bw,uBlue);da=mix(da,dm*.9,uBlue);
 float la=rim*.22;vec3 lc=mix(vec3(0.,.42,.78),vec3(.1,.55,.95),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*(.28+.25*uBlue)*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`;

type Box = {
	x: number;
	y: number;
	w: number;
	h: number;
	vx: number;
	vy: number;
	vw: number;
	vh: number;
};
type Target = { x: number; y: number; w: number; h: number; r: number };
type Sat = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	r: number;
	k: number;
};
type Rip = { x: number; y: number; age: number; amp: number };
type GLC = WaterGL;
const mkBox = (): Box => ({
	x: 0,
	y: 0,
	w: 0,
	h: 0,
	vx: 0,
	vy: 0,
	vw: 0,
	vh: 0,
});

function initGL(canvas: HTMLCanvasElement): WaterGL | null {
	return createWaterGL(canvas, VERT, FRAG, [
		'uRes',
		'uDpr',
		'uTime',
		'uCard',
		'uCardR',
		'uBox',
		'uBoxR',
		'uSat',
		'uRip',
		'uMouse',
		'uFront',
		'uDark',
		'uAmb',
		'uBlue',
	]);
}

/* ---------- the drop that lives on a glass panel ---------- */
export function useWater(
	panelRef: React.RefObject<HTMLElement | null>,
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	getTarget: () => Target | null,
	tone: 'light' | 'dark',
) {
	const st = React.useRef({
		a: mkBox(),
		b: mkBox(),
		lead: 0 as 0 | 1,
		lagUntil: 0,
		sats: [] as Sat[],
		rips: [] as Rip[],
		mouse: { x: 0, y: 0, s: 0, on: false },
		blue: 0,
		blueT: 0,
		moving: false,
		split: false,
		ready: false,
		w: 0,
		h: 0,
		ch: 0,
		visible: true,
		reduce: false,
		raf: 0,
		last: 0,
		time: 0,
		glc: null as GLC | null,
	});
	const [gl, setGl] = React.useState(true);
	const targetRef = React.useRef(getTarget);
	const darkRef = React.useRef(0);
	React.useEffect(() => {
		targetRef.current = getTarget;
		darkRef.current = tone === 'dark' ? 1 : 0;
	}, [getTarget, tone]);

	const draw = React.useCallback(() => {
		const s = st.current;
		const g = s.glc;
		if (!g) return;
		const head = s.lead === 0 ? s.a : s.b,
			tail = s.lead === 0 ? s.b : s.a;
		const gap =
			Math.hypot(head.x - tail.x, head.y - tail.y) -
			(Math.min(head.w, head.h) + Math.min(tail.w, tail.h));
		const thin = Math.max(0, Math.min(1, (gap + 40) / 60));
		const T = targetRef.current();
		const R0 = T?.r ?? 14;
		const shape = (B: Box, k: number) => {
			const w = B.w * (1 - k * thin),
				h = B.h * (1 - k * 0.4 * thin);
			return {
				w,
				h,
				r: Math.max(0, Math.min(R0 + (Math.min(w, h) - R0) * thin, w, h)),
			};
		};
		const hs = shape(head, 0.25),
			ts = shape(tail, 0.55);
		const { gl: c, u } = g;
		const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
		c.viewport(0, 0, c.drawingBufferWidth, c.drawingBufferHeight);
		c.uniform2f(u.uRes, s.w + PAD * 2, s.ch);
		c.uniform1f(u.uDpr, dpr);
		c.uniform1f(u.uTime, s.time);
		c.uniform4f(u.uCard, PAD, PAD, s.w, s.h);
		c.uniform1f(u.uCardR, 28);
		const on = (B: { w: number; h: number }) => B.w > 1 && B.h > 1;
		c.uniform4fv(
			u.uBox,
			new Float32Array([
				head.x,
				head.y,
				on(hs) ? hs.w : 0,
				hs.h,
				tail.x,
				tail.y,
				on(ts) ? ts.w : 0,
				ts.h,
			]),
		);
		c.uniform1fv(u.uBoxR, new Float32Array([hs.r, ts.r]));
		const sats = new Float32Array(16);
		s.sats.slice(0, 4).forEach((d, i) => sats.set([d.x, d.y, d.r, 0], i * 4));
		c.uniform4fv(u.uSat, sats);
		const rips = new Float32Array(24);
		s.rips
			.slice(-6)
			.forEach((p, i) => rips.set([p.x, p.y, p.age, p.amp], i * 4));
		c.uniform4fv(u.uRip, rips);
		c.uniform3f(u.uMouse, s.mouse.x, s.mouse.y, s.mouse.s);
		c.uniform3f(
			u.uFront,
			head.x + head.w,
			s.reduce ? 0 : Math.min(Math.abs(head.vw) * 0.01, 3.5),
			0,
		);
		c.uniform1f(u.uDark, darkRef.current);
		c.uniform1f(u.uAmb, s.reduce ? 0 : 1);
		c.uniform1f(u.uBlue, s.blue);
		c.clearColor(0, 0, 0, 0);
		c.clear(c.COLOR_BUFFER_BIT);
		c.drawArrays(c.TRIANGLES, 0, 3);
	}, []);

	const step = React.useCallback((dt: number, now: number) => {
		const s = st.current;
		s.time += dt;
		const T = targetRef.current();
		let still = true;
		s.blue += (s.blueT - s.blue) * Math.min(1, dt * 5);
		if (Math.abs(s.blueT - s.blue) > 0.01) still = false;
		if (T) {
			if (!s.ready) {
				Object.assign(s.a, T);
				Object.assign(s.b, T);
				s.ready = true;
			}
			const bodies = [s.a, s.b];
			if (s.reduce) {
				for (const B of bodies)
					Object.assign(B, {
						x: T.x,
						y: T.y,
						w: T.w,
						h: T.h,
						vx: 0,
						vy: 0,
						vw: 0,
						vh: 0,
					});
				s.sats = [];
			} else {
				bodies.forEach((B, i) => {
					const lead = i === s.lead;
					const k = lead ? 210 : 60,
						c = lead ? 25 : 13;
					const f = !lead && now < s.lagUntil ? 0.04 : 1;
					B.vx += (k * (T.x - B.x) - c * B.vx) * dt * f;
					B.vy += (k * (T.y - B.y) - c * B.vy) * dt * f;
					B.vw += (k * (T.w - B.w) - c * B.vw) * dt * f;
					B.vh += (k * (T.h - B.h) - c * B.vh) * dt * f;
					B.x += B.vx * dt;
					B.y += B.vy * dt;
					B.w = Math.max(0, B.w + B.vw * dt);
					B.h = Math.max(0, B.h + B.vh * dt);
					if (
						Math.abs(T.x - B.x) +
							Math.abs(T.y - B.y) +
							Math.abs(T.w - B.w) +
							Math.abs(T.h - B.h) >
							0.6 ||
						Math.abs(B.vx) + Math.abs(B.vy) + Math.abs(B.vw) > 4
					)
						still = false;
				});
				const head = bodies[s.lead],
					tail = bodies[1 - s.lead];
				const dist = Math.hypot(head.x - tail.x, head.y - tail.y);
				if (
					!s.split &&
					s.moving &&
					dist > Math.min(head.w, head.h) + Math.min(tail.w, tail.h) + 6
				) {
					s.split = true;
					[0.3, 0.55, 0.8].forEach((t, j) =>
						s.sats.push({
							x: tail.x + (head.x - tail.x) * t + (Math.random() - 0.5) * 20,
							y: tail.y + (head.y - tail.y) * t + (Math.random() - 0.5) * 10,
							vx: (head.vx + tail.vx) * 0.3,
							vy: (head.vy + tail.vy) * 0.3,
							r: 7.5 - j * 1.2 + Math.random() * 1.5,
							k: 60 + Math.random() * 70,
						}),
					);
				}
				s.sats = s.sats.filter((d) => {
					d.vx += (d.k * (head.x - d.x) - 9 * d.vx) * dt;
					d.vy += (d.k * (head.y - d.y) - 9 * d.vy) * dt;
					d.x += d.vx * dt;
					d.y += d.vy * dt;
					if (
						Math.abs(head.x - d.x) < head.w * 0.8 &&
						Math.abs(head.y - d.y) < head.h * 0.9
					)
						d.r -= dt * 30;
					return d.r > 0.6;
				});
				if (s.sats.length) still = false;
			}
			if (s.moving && still) {
				s.moving = false;
				if (!s.reduce)
					s.rips.push({ x: T.x, y: T.y, age: 0, amp: s.split ? 1 : 0.5 });
			}
		}
		s.rips.forEach((p) => (p.age += dt));
		s.rips = s.rips.filter((p) => p.age < 2.4);
		s.mouse.s += ((s.mouse.on ? 1 : 0) - s.mouse.s) * Math.min(1, dt * 7);
	}, []);

	const loop = React.useCallback(() => {
		const s = st.current;
		if (s.raf) return;
		s.last = performance.now();
		const tick = (now: number) => {
			const dt = Math.min((now - s.last) / 1000, 1 / 30);
			s.last = now;
			step(dt, now);
			draw();
			const busy =
				s.moving || s.rips.length || s.sats.length || s.mouse.s > 0.01;
			if (s.visible && s.glc && !document.hidden && (!s.reduce || busy))
				s.raf = requestAnimationFrame(tick);
			else s.raf = 0;
		};
		s.raf = requestAnimationFrame(tick);
	}, [draw, step]);

	const resize = React.useCallback(() => {
		const el = panelRef.current,
			cv = canvasRef.current;
		if (!el) return;
		const s = st.current;
		s.w = el.offsetWidth;
		s.h = el.offsetHeight;
		if (cv) {
			const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
			const W = s.w + PAD * 2,
				Hc = Math.ceil((s.h + PAD * 2) / 96) * 96;
			if (Hc !== s.ch || cv.width !== Math.round(W * dpr)) {
				s.ch = Hc;
				cv.width = Math.round(W * dpr);
				cv.height = Math.round(Hc * dpr);
				cv.style.width = `${W}px`;
				cv.style.height = `${Hc}px`;
			}
		}
		loop();
	}, [panelRef, canvasRef, loop]);

	React.useEffect(() => {
		const s = st.current;
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const motion = () => {
			s.reduce = media.matches;
			if (s.reduce) s.mouse.on = false;
			loop();
		};
		s.reduce = media.matches;
		media.addEventListener('change', motion);
		document.addEventListener('visibilitychange', loop);
		const cv = canvasRef.current;
		s.glc = cv ? initGL(cv) : null;
		setGl(!!s.glc);
		const lost = (e: Event) => {
			e.preventDefault();
			cancelAnimationFrame(s.raf);
			s.raf = 0;
			s.glc = null;
			setGl(false);
		};
		const restored = () => {
			s.glc = cv ? initGL(cv) : null;
			setGl(!!s.glc);
			loop();
		};
		cv?.addEventListener('webglcontextrestored', restored);
		cv?.addEventListener('webglcontextlost', lost);
		const io = new IntersectionObserver(([e]) => {
			s.visible = e.isIntersecting;
			if (s.visible) loop();
		});
		const ro = new ResizeObserver(() => resize());
		if (panelRef.current) {
			io.observe(panelRef.current);
			ro.observe(panelRef.current);
		}
		resize();
		return () => {
			cv?.removeEventListener('webglcontextlost', lost);
			io.disconnect();
			ro.disconnect();
			cancelAnimationFrame(s.raf);
			s.raf = 0;
			s.glc?.dispose();
			s.glc = null;
			media.removeEventListener('change', motion);
			document.removeEventListener('visibilitychange', loop);
			cv?.removeEventListener('webglcontextrestored', restored);
		};
	}, [canvasRef, panelRef, loop, resize]);

	/** the target moved somewhere new: stretch over there */
	const flow = React.useCallback(
		(lag = 90) => {
			const s = st.current;
			const T = targetRef.current();
			if (T)
				s.lead =
					Math.hypot(T.x - s.a.x, T.y - s.a.y) <=
					Math.hypot(T.x - s.b.x, T.y - s.b.y)
						? 0
						: 1;
			s.lagUntil = performance.now() + lag;
			s.moving = true;
			s.split = false;
			loop();
		},
		[loop],
	);
	const ripple = React.useCallback(
		(x: number, y: number, amp: number) => {
			const s = st.current;
			if (s.reduce) return;
			s.rips.push({ x, y, age: 0, amp });
			loop();
		},
		[loop],
	);
	const shake = React.useCallback(() => {
		const s = st.current;
		if (s.reduce) return;
		const head = s.lead === 0 ? s.a : s.b;
		head.vx += 420;
		head.vw -= 160;
		s.moving = true;
		loop();
	}, [loop]);
	const setBlue = React.useCallback(
		(v: number) => {
			st.current.blueT = v;
			loop();
		},
		[loop],
	);
	const pointer = React.useCallback(
		(x: number, y: number, on: boolean) => {
			const s = st.current;
			if (s.reduce) return;
			s.mouse.x = x;
			s.mouse.y = y;
			s.mouse.on = on;
			loop();
		},
		[loop],
	);

	return { gl, flow, ripple, shake, setBlue, pointer, loop };
}
