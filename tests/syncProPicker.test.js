import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadScript, resetApp } from './setup.js';

function setupDOM(prefix) {
    document.body.innerHTML = `
        <input id="${prefix}Color">
        <input id="${prefix}Text">
        <div id="${prefix}Box"></div>
    `;
}

function installStubs() {
    App.placeholder = { update: vi.fn() };
    App.shadow = { update: vi.fn(), updateBg: vi.fn() };
    App.contrast = { calc: vi.fn() };
    App.converter = { update: vi.fn() };
    App.shape = { generateBlob: vi.fn(), generateTriangle: vi.fn() };
    App.palette = { updateBaseColor: vi.fn() };
    App.core = { history: { add: vi.fn() } };
    App.state = App.state || {};
    App.state.historyDebounce = null;
    App.utils = { copyText: vi.fn(), copyTextToClipboard: vi.fn() };
    App.clamp = { calc: vi.fn() };
    App.ratio = { calc: vi.fn() };
    App.gradient = { init: vi.fn() };
    App.filter = { update: vi.fn() };
    App.flex = { init: vi.fn() };
}

describe('App.syncProPicker — dispatch table', () => {
    beforeEach(() => {
        resetApp();
        installStubs();
        loadScript('js/main.js');
        vi.useFakeTimers();
    });

    it('prefix "ph" calls placeholder.update', () => {
        setupDOM('phBg');
        App.syncProPicker('phBg', '#FF0000');
        expect(App.placeholder.update).toHaveBeenCalledWith(false);
    });

    it('prefix "sh" calls shadow.update and shadow.updateBg', () => {
        setupDOM('shBg');
        App.syncProPicker('shBg', '#00FF00');
        expect(App.shadow.update).toHaveBeenCalled();
        expect(App.shadow.updateBg).toHaveBeenCalled();
    });

    it('prefix "fg" calls contrast.calc', () => {
        setupDOM('fg');
        App.syncProPicker('fg', '#123456');
        expect(App.contrast.calc).toHaveBeenCalled();
    });

    it('prefix "bg" calls contrast.calc', () => {
        setupDOM('bg');
        App.syncProPicker('bg', '#ABCDEF');
        expect(App.contrast.calc).toHaveBeenCalled();
    });

    it('prefix "conv" calls converter.update', () => {
        setupDOM('conv');
        App.syncProPicker('conv', '#AABBCC');
        expect(App.converter.update).toHaveBeenCalled();
    });

    it('prefix "blob" calls shape.generateBlob', () => {
        setupDOM('blobC1');
        App.syncProPicker('blobC1', '#112233');
        expect(App.shape.generateBlob).toHaveBeenCalled();
    });

    it('prefix "tri" calls shape.generateTriangle', () => {
        setupDOM('triColor');
        App.syncProPicker('triColor', '#445566');
        expect(App.shape.generateTriangle).toHaveBeenCalled();
    });

    it('prefix "pal" calls palette.updateBaseColor with value', () => {
        setupDOM('pal');
        App.syncProPicker('pal', '#778899');
        expect(App.palette.updateBaseColor).toHaveBeenCalledWith('#778899');
    });

    it('invalid hex skips handler and only updates text input', () => {
        setupDOM('fg');
        App.syncProPicker('fg', 'not-a-hex');
        expect(App.contrast.calc).not.toHaveBeenCalled();
        expect(document.getElementById('fgText').value).toBe('#not-a-hex');
    });

    it('uppercases the text input value on valid hex', () => {
        setupDOM('fg');
        App.syncProPicker('fg', '#abcdef');
        expect(document.getElementById('fgText').value).toBe('#ABCDEF');
    });

    it('debounces history add by 1s', () => {
        setupDOM('fg');
        App.syncProPicker('fg', '#abcdef');
        expect(App.core.history.add).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1000);
        expect(App.core.history.add).toHaveBeenCalledWith('#abcdef');
    });
});
