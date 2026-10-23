import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync('libs/seo.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const exports = {};
vm.runInNewContext(code, { exports, URL });
const { shouldNoindex, canonicalUrl } = exports;

test('account, shopping flows, admin and listing forms are excluded; public pages remain searchable', () => {
  for (const path of ['/mypage', '/mypage/profile', '/account/join', '/cart', '/checkout', '/order/detail', '/_admin', '/_admin/users', '/pet/create', '/pet/edit', '/product/create', '/product/edit', '/404']) {
    assert.equal(shouldNoindex(path), true, path);
  }
  for (const path of ['/', '/pet', '/product', '/pet/detail', '/product/detail', '/member/detail', '/agent', '/cs', '/mypage-other']) {
    assert.equal(shouldNoindex(path), false, path);
  }
});

test('canonical URLs keep languages and distinct listing IDs on the preferred domain', () => {
  assert.equal(canonicalUrl('/', 'en', 'en'), 'https://koreapet.tech/');
  assert.equal(canonicalUrl('/', 'ko', 'en'), 'https://koreapet.tech/ko/');
  assert.equal(canonicalUrl('/product', 'ko', 'en'), 'https://koreapet.tech/ko/product');
  assert.equal(canonicalUrl('/product/detail', 'en', 'en', 'first'), 'https://koreapet.tech/product/detail?id=first');
  assert.notEqual(canonicalUrl('/pet/detail', 'en', 'en', 'first'), canonicalUrl('/pet/detail', 'en', 'en', 'second'));
});
