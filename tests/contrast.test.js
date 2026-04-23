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
