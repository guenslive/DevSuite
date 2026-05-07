import { describe, it, expect, beforeEach } from 'vitest';
import { loadScript, resetApp } from './setup.js';

describe('App.contrast.calc — WCAG contrast ratio', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/modules/contrast.js');
        document.body.innerHTML = `
            <input id="fgColor" value="#000000">
            <input id="bgColor" value="#FFFFFF">
            <div id="contrastScore"></div>
            <div id="contrastPreviewBox"></div>
            <div id="contrastRating"></div>
            <span id="badgeAA"></span>
            <span id="badgeAALg"></span>
            <span id="badgeAAA"></span>
            <span id="badgeAAALg"></span>
        `;
    });

    it('reports 21:1 for black on white', () => {
        App.contrast.calc();
        expect(document.getElementById('contrastScore').innerText).toBe('21.00');
        expect(document.getElementById('contrastRating').innerText).toBe('Excellent (AAA)');
    });

    it('fails for low-contrast pair', () => {
        document.getElementById('fgColor').value = '#888888';
        document.getElementById('bgColor').value = '#999999';
        App.contrast.calc();
        const score = parseFloat(document.getElementById('contrastScore').innerText);
        expect(score).toBeLessThan(3);
        expect(document.getElementById('contrastRating').innerText).toBe('Fail');
    });

    it('marks AA badge as PASS for sufficient contrast', () => {
        App.contrast.calc();
        const aa = document.getElementById('badgeAA');
        expect(aa.innerText).toBe('PASS');
        expect(aa.className).toBe('res-badge pass');
    });

    it('marks AA badge as FAIL for insufficient contrast', () => {
        document.getElementById('fgColor').value = '#CCCCCC';
        document.getElementById('bgColor').value = '#DDDDDD';
        App.contrast.calc();
        const aa = document.getElementById('badgeAA');
        expect(aa.innerText).toBe('FAIL');
        expect(aa.className).toBe('res-badge fail');
    });
});

describe('App.contrast.apca — APCA perceptual contrast', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/modules/contrast.js');
    });

    it('returns positive Lc for dark text on light bg (normal polarity)', () => {
        const lc = App.contrast.apca('#000000', '#FFFFFF');
        expect(lc).toBeGreaterThan(90);
    });

    it('returns negative Lc for light text on dark bg (reverse polarity)', () => {
        const lc = App.contrast.apca('#FFFFFF', '#000000');
        expect(lc).toBeLessThan(-90);
    });

    it('returns ~0 for identical colors', () => {
        const lc = App.contrast.apca('#888888', '#888888');
        expect(Math.abs(lc)).toBeLessThan(1);
    });

    it('classifies level correctly', () => {
        expect(App.contrast.apcaLevel(-95).tier).toBe('excellent');
        expect(App.contrast.apcaLevel(65).tier).toBe('good');
        expect(App.contrast.apcaLevel(50).tier).toBe('fair');
        expect(App.contrast.apcaLevel(10).tier).toBe('fail');
    });
});

describe('App.contrast.suggest — auto color suggestion', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/modules/contrast.js');
    });

    it('returns target unchanged if already passes', () => {
        const out = App.contrast.suggest('#000000', '#FFFFFF', 4.5);
        expect(out).toBe('#000000');
    });

    it('darkens FG against light BG to pass 4.5:1', () => {
        const out = App.contrast.suggest('#888888', '#FFFFFF', 4.5);
        expect(App.contrast.wcagRatio(out, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    });

    it('lightens FG against dark BG to pass 4.5:1', () => {
        const out = App.contrast.suggest('#555555', '#000000', 4.5);
        expect(App.contrast.wcagRatio(out, '#000000')).toBeGreaterThanOrEqual(4.5);
    });
});
