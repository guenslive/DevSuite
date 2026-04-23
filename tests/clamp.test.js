import { describe, it, expect, beforeEach } from 'vitest';
import { loadScript, resetApp } from './setup.js';

function setInput(id, value) {
    const el = document.getElementById(id);
    el.value = value;
}

describe('App.clamp.calc — font-size clamp generator', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/modules/clamp.js');
        document.body.innerHTML = `
            <input id="minWidth" value="320">
            <input id="maxWidth" value="1440">
            <input id="minFont" value="14">
            <input id="maxFont" value="18">
            <input id="pixelsPerRem" value="16">
            <select id="minUnit"><option value="px" selected>px</option><option value="rem">rem</option></select>
            <select id="maxUnit"><option value="px" selected>px</option><option value="rem">rem</option></select>
            <div id="clampResult"></div>
            <input id="clampViewportSlider" type="range" value="800" min="320" max="1440">
            <div id="clampViewportVal"></div>
            <div id="clampPreviewText"></div>
            <div id="clampPreviewBox"></div>
        `;
    });

    it('produces a valid clamp() string with rem units', () => {
        App.clamp.calc();
        const out = document.getElementById('clampResult').innerText;
        expect(out).toMatch(/^font-size: clamp\(/);
        expect(out).toContain('rem');
        expect(out).toContain('vw');
    });

    it('shows placeholder message on invalid input', () => {
        setInput('minWidth', 'abc');
        App.clamp.calc();
        expect(document.getElementById('clampResult').innerText).toBe('Ingresa valores...');
    });

    it('converts min/max to rem using base 16', () => {
        App.clamp.calc();
        const out = document.getElementById('clampResult').innerText;
        expect(out).toContain('0.8750rem');
        expect(out).toContain('1.1250rem');
    });
});
