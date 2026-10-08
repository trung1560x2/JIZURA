import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// Mock minimal browser environment required by JIZURA engine
const noop = () => {};
const ctx2d = new Proxy({}, {
  get: (t, k) => k === 'measureText'
    ? (() => ({ width: 100, actualBoundingBoxAscent: 80, actualBoundingBoxDescent: 10 }))
    : (k === 'getImageData' || k === 'createImageData')
    ? (() => ({ data: new Uint8ClampedArray(4) }))
    : (typeof k === 'string' && /^create/.test(k))
    ? (() => ({ addColorStop: noop }))
    : noop,
  set: () => true
});

const el = () => ({
  getContext: () => ctx2d,
  style: {},
  width: 0,
  height: 0,
  appendChild: noop,
  addEventListener: noop,
  setAttribute: noop,
  classList: { add: noop, remove: noop, toggle: noop }
});

global.window = global;
global.document = {
  createElement: el,
  getElementById: () => null,
  querySelectorAll: () => [],
  head: { appendChild: noop },
  fonts: { load: async () => [], ready: Promise.resolve() },
  addEventListener: noop
};
global.localStorage = { getItem: () => null, setItem: noop };
global.OffscreenCanvas = function () { return el(); };
global.Path2D = function () { return new Proxy({}, { get: () => noop }); };
global.DOMMatrix = function () { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; };
global.requestAnimationFrame = noop;

// Run all src/*.js scripts in order except 12_ui.js
const srcDir = path.join(ROOT, 'src');
const files = fs.readdirSync(srcDir)
  .filter(f => f.endsWith('.js') && f !== '12_ui.js')
  .sort();

for (const file of files) {
  const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
  vm.runInThisContext(content, { filename: file });
}

export const J = global.J;
export default J;
