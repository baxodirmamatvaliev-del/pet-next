import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('libs/components/navigation/activeNavigation.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports });
const { desktopNavigationActive: active } = exports;

test('desktop navigation follows routes, categories, sorts and serialized catalog filters', () => {
  for (const [path, query, index] of [
    ['/', {}, -1], ['/product', {}, 0], ['/product/detail', { id: 'synthetic' }, 0],
    ['/product', { category: 'DOG' }, 1], ['/product', { category: 'CAT' }, 2],
    ['/product', { sort: 'createdAt' }, 3], ['/product', { sort: 'productSold' }, 4],
    ['/pet', {}, 5], ['/pet/detail', {}, 5], ['/cs', { tab: 'faq' }, 6],
    ['/product', { input: JSON.stringify({ page: 2, sort: 'createdAt', search: { categoryList: ['CAT'] } }) }, 2],
    ['/product', { input: JSON.stringify({ sort: 'productSold', search: {} }) }, 4],
    ['/product', { input: '{bad-json' }, 0],
    ['/product', { input: JSON.stringify({ search: { categoryList: ['DOG', 'CAT'] } }) }, 0],
    ['/account/join', {}, -1], ['/cart', {}, -1],
  ]) assert.equal(active(path, query), index, `${path} ${JSON.stringify(query)}`);
});
