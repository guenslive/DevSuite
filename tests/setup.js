import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

export function loadScript(relPath) {
    const src = fs.readFileSync(path.resolve(ROOT, relPath), 'utf8');
    vm.runInThisContext(src, { filename: relPath });
}

export function resetApp() {
    globalThis.window = globalThis.window || globalThis;
    if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
        Element.prototype.scrollIntoView = function () {};
    }
    globalThis.window.App = {
        state: {
            theme: 'light',
            gradient: {
                stops: [
                    { color: '#007aff', opacity: 100, pos: 0, id: 1 },
                    { color: '#34c759', opacity: 100, pos: 100, id: 2 },
                ],
                isDragging: false,
                draggedIndex: -1,
                rafId: null,
            },
        },
    };
    globalThis.App = globalThis.window.App;
}

export function loadUtils() {
    resetApp();
    loadScript('js/utils/utils.js');
}

export function loadCore() {
    resetApp();
    loadScript('js/utils/utils.js');
    loadScript('js/core/core.js');
}
