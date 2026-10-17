import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the real component with deterministic sockets, timers and React hooks.
function chat({ ready = true, user = null, token = '' } = {}) {
  const states = [], refs = [], effects = [], sockets = [], timers = new Map();
  const userVar = {}, authReadyVar = {};
  let stateIndex, refIndex, effectIndex, timerId = 0, tree;
  const react = {
    useState(initial) {
      const i = stateIndex++;
      if (!(i in states)) states[i] = initial;
      return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; }];
    },
    useRef(initial) {
      const i = refIndex++;
      return refs[i] ??= { current: initial };
    },
    useEffect(run, deps) {
      const i = effectIndex++, previous = effects[i];
      if (!previous || deps.some((dep, j) => dep !== previous.deps[j])) {
        previous?.cleanup?.();
        effects[i] = { run, deps, pending: true };
      }
    },
  };
  class Socket {
    static OPEN = 1;
    readyState = 0;
    sent = [];
    constructor(url) { this.url = String(url); sockets.push(this); }
    open() { this.readyState = 1; this.onopen?.(); }
    message(data) { this.onmessage?.({ data: typeof data === 'string' ? data : JSON.stringify(data) }); }
    send(data) { this.sent.push(JSON.parse(data)); }
    close() { this.readyState = 3; this.onclose?.(); }
  }
  const jsx = (type, props) => ({ type, props });
  const imports = {
    react,
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@apollo/client': { useReactiveVar: value => value === userVar ? user : ready },
    '@mui/material': { Avatar: 'Avatar', Badge: 'Badge', Box: 'Box', Stack: 'Stack' },
    '@mui/material/styles': { styled: () => () => 'RippleBadge' },
    '../../apollo/store': { userVar, authReadyVar },
    '../auth': { getValidAccessToken: async () => token },
    '../i18n': { useTranslation: () => ({ t: key => key }) },
    '../config': { REACT_APP_API_URL: 'https://api.test', REACT_APP_API_WS: 'wss://api.test/' },
  };
  const compiledModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('libs/components/Chat.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, {
    exports: compiledModule.exports, WebSocket: Socket, URL,
    require: name => imports[name] ?? { default: name },
    setTimeout: (callback, delay) => { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
  });
  const render = () => {
    stateIndex = refIndex = effectIndex = 0;
    tree = compiledModule.exports.default();
    for (const effect of effects) if (effect.pending) {
      effect.pending = false;
      effect.cleanup = effect.run();
    }
  };
  const find = predicate => {
    function walk(node) {
      if (!node || typeof node !== 'object') return undefined;
      if (predicate(node.props ?? {})) return node;
      for (const child of [node.props?.children].flat(Infinity)) {
        const found = walk(child); if (found) return found;
      }
    }
    return walk(tree);
  };
  render();
  return {
    sockets, states, timers, render, find,
    flush: async () => { await new Promise(resolve => setImmediate(resolve)); render(); },
    auth: (nextUser, nextToken) => { user = nextUser; token = nextToken; render(); },
    unmount: () => effects.forEach(effect => effect.cleanup?.()),
    retry: () => { const [id, timer] = timers.entries().next().value; timers.delete(id); timer.callback(); },
  };
}

test('chat waits for session restoration and encodes the current access token', async () => {
  const waiting = chat({ ready: false }); await waiting.flush();
  assert.equal(waiting.sockets.length, 0);
  const active = chat({ token: 'jwt+/?=' }); await active.flush();
  assert.equal(new URL(active.sockets[0].url).searchParams.get('token'), 'jwt+/?=');
  active.unmount();
});

test('chat accepts history, online count and broadcasts, ignoring malformed frames', async () => {
  const c = chat(); await c.flush(); const socket = c.sockets[0];
  socket.message({ event: 'info', totalClients: 3 });
  socket.message({ event: 'getMessages', list: [{ event: 'message', text: 'History' }, null, { text: 1 }] });
  socket.message('{broken'); socket.message(null);
  socket.message({ event: 'message', text: 'Bad avatar', memberData: { _id: 'x', memberImage: 1 } });
  socket.message({ event: 'message', text: 'New message', memberData: null });
  assert.equal(c.states[1], 3);
  assert.deepEqual(Array.from(c.states[0], message => message.text), ['History', 'New message']);
  c.unmount();
});

test('input sends trimmed text once and clears only after an open socket sends', async () => {
  const c = chat(); await c.flush();
  const input = () => c.find(props => props.className === 'msg-input');
  const submit = () => c.find(props => props.component === 'form').props.onSubmit({ preventDefault() {} });
  input().props.onChange({ target: { value: '  Salom  ' } }); c.render(); submit();
  assert.equal(c.states[2], '  Salom  ');
  c.sockets[0].open(); c.render(); submit();
  assert.equal(JSON.stringify(c.sockets[0].sent), '[{"event":"message","data":"Salom"}]');
  assert.equal(c.states[2], '');
  input().props.onChange({ target: { value: '   ' } }); c.render(); submit();
  assert.equal(c.sockets[0].sent.length, 1);
  c.unmount();
});

test('token changes close the old socket and reconnect with the new identity', async () => {
  const c = chat({ user: { sub: 'one' }, token: 'old' }); await c.flush();
  const old = c.sockets[0]; old.open();
  c.auth({ sub: 'two' }, 'new'); await c.flush();
  assert.equal(old.readyState, 3);
  assert.equal(new URL(c.sockets[1].url).searchParams.get('token'), 'new');
  assert.equal(c.states[4], false);
  c.unmount();
});

test('disconnect retries; unmount cancels retries and pending connections', async () => {
  const c = chat(); await c.flush(); c.sockets[0].close();
  assert.equal(c.timers.size, 1);
  c.retry(); await c.flush(); assert.equal(c.sockets.length, 2);
  c.sockets[1].close(); c.unmount(); assert.equal(c.timers.size, 0);
  const pending = chat(); pending.unmount(); await pending.flush();
  assert.equal(pending.sockets.length, 0);
});
