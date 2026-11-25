/** Shared full-screen triangle setup for the Nimbus water shaders. */
export type WaterGL = {
	gl: WebGLRenderingContext;
	u: Record<string, WebGLUniformLocation | null>;
	dispose: () => void;
};

export function createWaterGL(
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
