import {
	CanvasTexture,
	Group,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SRGBColorSpace,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import type { Texture } from 'three';

interface MomentPhoto {
	file: string;
	cropY: number;
}

const PHOTO_ASPECT = 4 / 3;
const EASING = 0.22;

function createCornerMask(): CanvasTexture {
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = 512;
	const context = canvas.getContext('2d');
	if (!context) throw new Error('Photo mask requires a 2D canvas context');

	context.fillStyle = '#000';
	context.fillRect(0, 0, 512, 512);
	context.fillStyle = '#fff';
	context.beginPath();
	context.roundRect(0, 0, 512, 512, 28);
	context.fill();
	return new CanvasTexture(canvas);
}

function cropTexture(texture: Texture, cropY: number): void {
	const image = texture.image as HTMLImageElement;
	const aspect = image.width / image.height;
	texture.repeat.set(Math.min(1, PHOTO_ASPECT / aspect), Math.min(1, aspect / PHOTO_ASPECT));
	texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) * (1 - cropY));
}

export function createMomentsScene(host: HTMLDivElement, track: HTMLDivElement, photos: readonly MomentPhoto[]): () => void {
	const mask = createCornerMask();
	const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
	renderer.domElement.setAttribute('aria-hidden', 'true');

	const scene = new Scene();
	const camera = new PerspectiveCamera(35, 1, 0.1, 50);
	camera.position.z = 7;
	const geometry = new PlaneGeometry(1, 1);
	const borderMaterial = new MeshBasicMaterial({ color: 0xf3eddf, alphaMap: mask, transparent: true, alphaTest: 0.05 });
	const loader = new TextureLoader();
	const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let disposed = false;
	let visible = true;
	let failed = false;
	let loaded = 0;
	let frame = 0;
	let current = 0;
	let cardWidth = 1;
	let step = 1;

	const cards = photos.map(({ file, cropY }) => {
		const source = `/_next/image?url=${encodeURIComponent(`/img/dog-walking/${file}`)}&w=1080&q=75`;
		const texture = loader.load(source, (image) => {
			if (disposed) {
				image.dispose();
				return;
			}
			cropTexture(image, cropY);
			loaded++;
			if (loaded === photos.length && !failed) host.dataset.threeReady = 'true';
			requestRender();
		}, undefined, disableScene);
		texture.colorSpace = SRGBColorSpace;

		const material = new MeshBasicMaterial({ map: texture, alphaMap: mask, transparent: true, alphaTest: 0.05 });
		const group = new Group();
		const border = new Mesh(geometry, borderMaterial);
		border.position.z = -0.02;
		border.scale.set(1.014, 1.018, 1);
		group.add(border, new Mesh(geometry, material));
		scene.add(group);
		return { group, texture, material };
	});

	function stopRendering(): void {
		cancelAnimationFrame(frame);
		frame = 0;
	}

	function disableScene(): void {
		failed = true;
		stopRendering();
		delete host.dataset.threeReady;
	}

	function requestRender(): void {
		if (!frame && !disposed && !failed && visible && !document.hidden) frame = requestAnimationFrame(render);
	}

	function render(): void {
		frame = 0;
		if (disposed || failed || !visible || document.hidden) return;
		const target = track.scrollLeft / step;
		const count = photos.length;
		// Recenter by complete revolutions so an infinite-loop jump stays invisible.
		if (Math.abs(target - current) > count / 2) {
			current += Math.round((target - current) / count) * count;
		}
		current = motion.matches ? target : MathUtils.lerp(current, target, EASING);

		cards.forEach(({ group, material }, index) => {
			const distance = MathUtils.euclideanModulo(index - current + count / 2, count) - count / 2;
			const angle = distance * Math.PI * 2 / count;
			const depth = Math.cos(angle);
			group.position.set(Math.sin(angle) * cardWidth * 1.12, 0, (depth - 1) * cardWidth * 0.85);
			group.rotation.y = motion.matches ? 0 : angle;
			group.scale.set(cardWidth, cardWidth / PHOTO_ASPECT, 1);
			group.visible = depth > -0.1;
			material.color.setScalar(1 - Math.min(Math.abs(distance) * 0.1, 0.3));
		});
		renderer.render(scene, camera);
		if (Math.abs(target - current) > 0.001) requestRender();
	}

	function resize(): void {
		const { width, height } = host.getBoundingClientRect();
		if (!width || !height) return;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);

		const pixelWidth = track.querySelector('figure')?.getBoundingClientRect().width ?? width * 0.8;
		cardWidth = pixelWidth / height * 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
		step = pixelWidth + parseFloat(getComputedStyle(track).columnGap);
		requestRender();
	}

	function updateVisibility(): void {
		if (visible && !document.hidden) requestRender();
		else stopRendering();
	}

	const resizeObserver = new ResizeObserver(resize);
	const visibilityObserver = new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
		updateVisibility();
	});
	resizeObserver.observe(host);
	visibilityObserver.observe(host);
	track.addEventListener('scroll', requestRender, { passive: true });
	document.addEventListener('visibilitychange', updateVisibility);
	motion.addEventListener('change', requestRender);
	renderer.domElement.addEventListener('webglcontextlost', disableScene);
	host.appendChild(renderer.domElement);
	resize();

	return () => {
		disposed = true;
		stopRendering();
		resizeObserver.disconnect();
		visibilityObserver.disconnect();
		track.removeEventListener('scroll', requestRender);
		document.removeEventListener('visibilitychange', updateVisibility);
		motion.removeEventListener('change', requestRender);
		renderer.domElement.removeEventListener('webglcontextlost', disableScene);
		cards.forEach(({ texture, material }) => {
			texture.dispose();
			material.dispose();
		});
		geometry.dispose();
		mask.dispose();
		borderMaterial.dispose();
		renderer.dispose();
		renderer.forceContextLoss();
		renderer.domElement.remove();
		delete host.dataset.threeReady;
	};
}
