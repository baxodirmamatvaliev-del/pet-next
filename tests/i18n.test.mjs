import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Bu modullarda runtime import yo‘q; yangi test kutubxonasi kerak emas.
function load(file) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(`(function(exports) { ${code}\n })`)(exports);
  return exports;
}

const dictionaries = Object.fromEntries(['en', 'uz', 'ko', 'ru'].map(locale =>
  [locale, load(`libs/i18n/locales/${locale}.ts`).default]));
const { notificationText } = load('libs/i18n/notifications.ts');

test('all four dictionaries keep the same keys and interpolation placeholders', () => {
  const placeholders = text => (text.match(/\{\w+\}/g) ?? []).sort();
  for (const [locale, dictionary] of Object.entries(dictionaries)) {
    assert.deepEqual(Object.keys(dictionary).sort(), Object.keys(dictionaries.en).sort(), locale);
    for (const [key, value] of Object.entries(dictionary)) {
      assert.ok(value.trim(), `${locale}: ${key}`);
      assert.deepEqual(placeholders(value), placeholders(dictionaries.en[key]), `${locale}: ${key}`);
    }
  }
});

test('support notifications translate system text and preserve the sender and user subject', () => {
  const t = (key, values) => ({ key, values });
  const notice = {
    notificationTitle: 'New support request from 민수',
    notificationType: 'INQUIRY',
    notificationDesc: 'Menga buyurtma bo‘yicha yordam kerak',
  };
  const result = notificationText(notice, t);
  assert.equal(result.title.key, 'notification.inquiry');
  assert.equal(result.title.values.name, '민수');
  assert.equal(result.description, notice.notificationDesc);
});

test('review ratings translate; unknown notification content stays unchanged', () => {
  const t = (key, values) => ({ key, values });
  const review = notificationText({
    notificationTitle: 'Your product received a new review',
    notificationType: 'COMMENT', notificationDesc: '4 out of 5 stars',
  }, t);
  assert.equal(review.title.key, 'notification.review');
  assert.equal(review.description.key, 'notification.rating');
  assert.equal(review.description.values.rating, '4');
  const custom = { notificationTitle: '안녕하세요', notificationDesc: 'User content', notificationType: 'OTHER' };
  const result = notificationText(custom, t);
  assert.equal(result.title, custom.notificationTitle);
  assert.equal(result.description, custom.notificationDesc);
});
