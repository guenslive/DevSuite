import { describe, it, expect, beforeEach } from 'vitest';
import { loadScript, resetApp } from './setup.js';

function setupDOM() {
    document.body.innerHTML = `
        <input id="convColor" value="#FF8040">
        <input id="convOpacity" value="100">
        <span id="convOpacityVal"></span>
        <input id="convText">
        <div id="convBox"></div>
        <input id="resHex">
        <input id="resRgb">
        <input id="resHsl">
        <div id="converterPreviewBox"></div>
    `;
}

describe('App.converter — hex/rgb/hsl round trip', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        globalThis.App.syncProPicker = () => {};
        loadScript('js/modules/converter.js');
        setupDOM();
    });

    it('update() populates hex, rgb, hsl at full opacity', () => {
        App.converter.update();
        expect(document.getElementById('resHex').value).toBe('#FF8040');
        expect(document.getElementById('resRgb').value).toBe('rgb(255, 128, 64)');
        expect(document.getElementById('resHsl').value).toMatch(/^hsl\(/);
    });

    it('includes alpha when opacity < 100', () => {
        document.getElementById('convOpacity').value = '50';
        App.converter.update();
        expect(document.getElementById('resRgb').value).toBe('rgba(255, 128, 64, 0.5)');
        expect(document.getElementById('resHsl').value).toMatch(/^hsla\(/);
    });

    it('fromRgb parses and updates outputs', () => {
        App.converter.fromRgb('rgb(100, 200, 50)');
        expect(document.getElementById('resHex').value).toBe('#64C832');
    });

    it('fromHsl parses and updates outputs', () => {
        App.converter.fromHsl('hsl(120, 100%, 50%)');
        expect(document.getElementById('resHex').value).toBe('#00FF00');
    });
});
