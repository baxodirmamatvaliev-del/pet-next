import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const requirePackage = createRequire(import.meta.url);
const { ApolloLink, Observable, gql } = requirePackage('@apollo/client');

// TypeScript kodini alohida brauzer xotirasida ishlatamiz; HTTP javoblari test tomonidan beriladi.
const token = (seconds = 600) => `e30.${Buffer.from(JSON.stringify({ sub: 'member-1', exp: Math.floor(Date.now() / 1000) + seconds })).toString('base64url')}.signature`;
function browser({ fetch, upload, locks } = {}) {
  const storage = new Map([['accessToken', 'legacy-token']]);
  let uploads;
  const context = vm.createContext({
    console, AbortSignal, navigator: { locks }, atob,
    window: { localStorage: { removeItem: (key) => storage.delete(key), setItem: (key, value) => storage.set(key, value) } },
    fetch: (...args) => fetch(...args),
  });
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const compiledModule = { exports: {} };
    cache.set(filename, compiledModule);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    const requireModule = (name) => {
      if (name.endsWith('/config')) return { REACT_APP_API_GRAPHQL_URL: 'https://api.example.test/graphql' };
      if (name === 'apollo-upload-client/createUploadLink.mjs') return (options) => {
        uploads = options;
        return new ApolloLink((operation) => new Observable((observer) => {
          Promise.resolve().then(() => upload(operation)).then((result) => {
            observer.next(result); observer.complete();
          }, (error) => observer.error(error));
        }));
      };
      if (!name.startsWith('.')) return requirePackage(name);
      const resolved = path.resolve(path.dirname(filename), name);
      return load(fs.existsSync(`${resolved}.ts`) ? `${resolved}.ts` : `${resolved}/index.ts`);
    };
    vm.runInContext(`(function(require,module,exports){${code}\n})`, context)(requireModule, compiledModule, compiledModule.exports);
    return compiledModule.exports;
  }
  return { session: load('libs/auth/session.ts'), store: load('apollo/store.ts'), load, storage, uploads: () => uploads };
}
const response = (data, errors, status = 200) => ({ ok: status < 400, status, json: async () => ({ data, errors }) });
const refreshed = () => response({ refreshToken: { accessToken: token() } });
const unauthorized = { message: 'Invalid or expired refresh token', extensions: { code: 'UNAUTHENTICATED' } };

test('startup restores once, includes cookies and removes legacy localStorage token', async () => {
  const calls = [];
  const b = browser({ fetch: async (...args) => { calls.push(args); return refreshed(); } });
  await Promise.all([b.session.restoreSession(), b.session.restoreSession()]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1].credentials, 'include');
  assert.match(JSON.parse(calls[0][1].body).query, /refreshToken/);
  assert.equal(b.storage.has('accessToken'), false);
  assert.equal(b.store.userVar().sub, 'member-1');
  assert.equal(b.store.authReadyVar(), true);
});

test('parallel refresh calls share one request', async () => {
  let count = 0;
  const b = browser({ fetch: async () => { count++; return refreshed(); } });
  const results = await Promise.all([b.session.refreshAccessToken(), b.session.refreshAccessToken()]);
  assert.equal(count, 1);
  assert.equal(results[0], results[1]);
});

test('valid access tokens are reused; near-expired tokens are refreshed', async () => {
  let count = 0;
  const b = browser({ fetch: async () => { count++; return refreshed(); } });
  await b.session.restoreSession();
  await b.session.getValidAccessToken();
  assert.equal(count, 1);
  b.session.setJwtToken(token(10));
  await b.session.getValidAccessToken();
  assert.equal(count, 2);
});

test('missing refresh cookie leaves a guest session without repeated refresh requests', async () => {
  let count = 0;
  const b = browser({ fetch: async () => { count++; return response(null, [unauthorized]); } });
  await b.session.restoreSession();
  assert.equal(await b.session.getValidAccessToken(), '');
  assert.equal(count, 1);
  assert.equal(b.store.userVar(), null);
  assert.equal(b.store.authReadyVar(), true);
});

test('network failures do not erase an established user session', async () => {
  const b = browser({ fetch: async () => { throw new Error('Offline'); } });
  b.session.setJwtToken(token());
  await assert.rejects(b.session.refreshAccessToken(), /Offline/);
  assert.equal(b.store.userVar().sub, 'member-1');
});

test('late refresh response cannot restore a session cleared by logout in another tab', async () => {
  let finish;
  const b = browser({ fetch: () => new Promise((resolve) => { finish = resolve; }) });
  const pending = b.session.refreshAccessToken();
  b.session.clearAuthSession();
  finish(refreshed());
  await assert.rejects(pending, /Session changed/);
  assert.equal(b.session.getJwtToken(), '');
});

test('logout reaches backend, clears memory and broadcasts only a logout timestamp', async () => {
  const calls = [];
  const b = browser({ fetch: async (_url, options) => {
    calls.push(options);
    return calls.length === 1 ? refreshed() : response({ logout: true });
  } });
  await b.session.restoreSession();
  await b.session.endSession();
  assert.match(JSON.parse(calls[1].body).query, /logout/);
  assert.equal(calls[1].credentials, 'include');
  assert.equal(b.session.getJwtToken(), '');
  assert.equal(b.store.userVar(), null);
  assert.ok(b.storage.has('logout'));
  assert.equal(b.storage.has('accessToken'), false);
});

test('failed logout reports the failure and keeps the current session', async () => {
  let count = 0;
  const b = browser({ fetch: async () => {
    if (++count === 1) return refreshed();
    throw new Error('Offline');
  } });
  await b.session.restoreSession();
  await assert.rejects(b.session.endSession(), /Offline/);
  assert.equal(b.store.userVar().sub, 'member-1');
  assert.equal(b.storage.has('logout'), false);
});

test('refresh and logout use the same browser lock', async () => {
  const names = [];
  const b = browser({
    locks: { request: async (name, action) => { names.push(name); return action(); } },
    fetch: async (_url, options) => JSON.parse(options.body).query.includes('refreshToken') ? refreshed() : response({ logout: true }),
  });
  await b.session.restoreSession();
  await b.session.endSession();
  assert.deepEqual(names, ['pet-refresh', 'pet-refresh']);
});

test('Apollo retries unauthorized operations once with a new token and includes credentials', async () => {
  let refreshes = 0;
  const headers = [];
  const b = browser({
    fetch: async () => { refreshes++; return refreshed(); },
    upload: (operation) => {
      headers.push(operation.getContext().headers.Authorization);
      return headers.length === 1 ? { errors: [unauthorized] } : { data: { checkAuth: 'ok' } };
    },
  });
  await b.session.restoreSession();
  const client = b.load('apollo/client.ts').initializeApollo();
  const result = await client.query({ query: gql`query Check { checkAuth }`, fetchPolicy: 'no-cache' });
  assert.equal(result.data.checkAuth, 'ok');
  assert.equal(headers.length, 2);
  assert.ok(headers.every((header) => header.startsWith('Bearer ')));
  assert.equal(refreshes, 2);
  assert.equal(b.uploads().credentials, 'include');
});

test('Apollo does not loop when the retried request is still unauthorized', async () => {
  let attempts = 0;
  let refreshes = 0;
  const b = browser({ fetch: async () => { refreshes++; return refreshed(); }, upload: () => { attempts++; return { errors: [unauthorized] }; } });
  const client = b.load('apollo/client.ts').initializeApollo();
  await assert.rejects(client.query({ query: gql`query Check { checkAuth }`, fetchPolicy: 'no-cache' }));
  assert.equal(attempts, 2);
  assert.equal(refreshes, 2);
  assert.equal(b.store.userVar(), null);
});

test('invalid login credentials do not trigger refresh', async () => {
  let refreshes = 0;
  const b = browser({ fetch: async () => { refreshes++; return refreshed(); }, upload: () => ({ errors: [unauthorized] }) });
  await b.session.restoreSession();
  const client = b.load('apollo/client.ts').initializeApollo();
  await assert.rejects(client.mutate({ mutation: gql`mutation Login { login { accessToken } }`, context: { skipRefresh: true } }));
  assert.equal(refreshes, 1);
});
