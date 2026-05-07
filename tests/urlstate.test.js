import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadScript, resetApp } from './setup.js';

describe('App.urlState — deep-linking', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/core/urlstate.js');

        document.body.innerHTML = `
            <div id="section-contrast" class="tool-section active">
                <input id="fgText" type="text" value="#000000">
                <input id="bgText" type="text" value="#FFFFFF">
                <input id="fgColor" type="color" value="#000000">
                <select id="mode"><option value="a" selected>A</option><option value="b">B</option></select>
                <input id="bold" type="checkbox">
            </div>
        `;

        App.core = { switchTab: vi.fn() };
        App.urlState._debounceMs = 0;
        App.urlState._currentTool = 'contrast';
        App.urlState._ready = true;
    });

    it('collectGeneric strips # from hex-like values and skips color inputs', () => {
        const data = App.urlState.collectGeneric('contrast');
        expect(data.fgText).toBe('000000');
        expect(data.bgText).toBe('FFFFFF');
        expect(data.mode).toBe('a');
        expect(data.bold).toBe('0');
        expect(data.fgColor).toBeUndefined();
    });

    it('write updates location.hash with tool and params', () => {
        const setSpy = vi.spyOn(window.history, 'replaceState');
        App.urlState.write('contrast', true);
        const call = setSpy.mock.calls.at(-1);
        expect(call[2]).toMatch(/^#contrast\?/);
        expect(call[2]).toContain('fgText=000000');
        expect(call[2]).toContain('bgText=FFFFFF');
    });

    it('applyGeneric restores values and fires input events', () => {
        const fg = document.getElementById('fgText');
        const fired = vi.fn();
        fg.addEventListener('input', fired);

        const params = new URLSearchParams('fgText=112233&mode=b&bold=1');
        App.urlState.applyGeneric('contrast', params);

        expect(fg.value).toBe('112233');
        expect(document.getElementById('mode').value).toBe('b');
        expect(document.getElementById('bold').checked).toBe(true);
        expect(fired).toHaveBeenCalled();
    });

    it('read() switches tool and applies params from hash', () => {
        window.location.hash = '#contrast?fgText=aabbcc&bgText=112233';
        App.urlState.read();
        expect(App.core.switchTab).toHaveBeenCalledWith('contrast');
        expect(document.getElementById('fgText').value).toBe('aabbcc');
        expect(document.getElementById('bgText').value).toBe('112233');
    });
});
