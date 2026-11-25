import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('libs/components/common/waterGL.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports, Float32Array });
const { createWaterGL } = exports;

function context({ compile = true, link = true } = {}) {
  const created = new Set();
  const deleted = new Set();
  const resource = () => { const value = {}; created.add(value); return value; };
  const gl = {
    createShader: resource, createProgram: resource, createBuffer: resource,
    deleteShader: value => deleted.add(value), deleteProgram: value => deleted.add(value), deleteBuffer: value => deleted.add(value),
    shaderSource() {}, compileShader() {}, getShaderParameter: () => compile,
    attachShader() {}, linkProgram() {}, getProgramParameter: () => link,
    useProgram() {}, bindBuffer() {}, bufferData() {}, getAttribLocation: () => 0,
    enableVertexAttribArray() {}, vertexAttribPointer() {}, getUniformLocation: (_, name) => name,
  };
  return { gl, created, deleted };
}

test('water setup handles unavailable WebGL and context exceptions', () => {
  assert.equal(createWaterGL({ getContext: () => null }, '', '', []), null);
  assert.equal(createWaterGL({ getContext() { throw Error('blocked'); } }, '', '', []), null);
});

test('water setup releases all GPU resources on shader/link failure and normal disposal', () => {
  for (const options of [{ compile: false }, { link: false }, {}]) {
    const { gl, created, deleted } = context(options);
    const engine = createWaterGL({ getContext: () => gl }, 'vertex', 'fragment', ['uTime']);
    if (options.compile === false || options.link === false) assert.equal(engine, null);
    else { assert.equal(engine.u.uTime, 'uTime'); engine.dispose(); }
    assert.equal(created.size, 4);
    assert.equal(deleted.size, 4);
    for (const resource of created) assert.ok(deleted.has(resource));
  }
});
