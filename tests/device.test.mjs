import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync('libs/hooks/useDeviceDetect.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

test('device follows desktop/mobile/desktop viewport changes and cleans up its listener', () => {
  let width = 1440;
  let current;
  let cleanup;
  const listeners = new Set();
  const media = {
    get matches() { return width <= 760; },
    addEventListener: (event, callback) => { assert.equal(event, 'change'); listeners.add(callback); },
    removeEventListener: (event, callback) => { assert.equal(event, 'change'); listeners.delete(callback); },
  };
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    window: { matchMedia: (query) => { assert.equal(query, '(max-width: 760px)'); return media; } },
    // A mobile user agent must not keep the desktop viewport in the mobile layout.
    navigator: { userAgent: 'iPhone' },
    require: () => ({ useSyncExternalStore: (subscribe, snapshot, serverSnapshot) => {
      assert.equal(serverSnapshot(), 'desktop');
      cleanup = subscribe(() => { current = snapshot(); });
      current = snapshot();
      return current;
    } }),
  });
  assert.equal(exports.default(), 'desktop');
  for (const [nextWidth, expected] of [[390, 'mobile'], [1440, 'desktop'], [760, 'mobile'], [761, 'desktop']]) {
    width = nextWidth;
    listeners.forEach((notify) => notify());
    assert.equal(current, expected);
  }
  cleanup();
  assert.equal(listeners.size, 0);
});
