import { describe, it, expect, beforeEach } from 'vitest';
import { loadScript, resetApp } from './setup.js';

describe('App.ratio.calc — aspect ratio calculator', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/modules/ratio.js');
        document.body.innerHTML = `
            <input id="imgWidth" value="1920">
            <input id="imgHeight" value="1080">
            <div id="ratioResultText"></div>
            <div id="ratioCssResult"></div>
            <div id="ratioBox"></div>
            <input id="ratioInW">
            <input id="ratioInH">
            <input id="resizeW">
            <input id="resizeH">
        `;
    });

    it('computes simplified ratio 16:9 from 1920x1080', () => {
        App.ratio.calc();
        expect(document.getElementById('ratioResultText').innerText).toBe('16 : 9');
        expect(document.getElementById('ratioCssResult').innerText).toBe('aspect-ratio: 16 / 9;');
        expect(document.getElementById('ratioInW').value).toBe('16');
        expect(document.getElementById('ratioInH').value).toBe('9');
    });

    it('does nothing when width or height is zero', () => {
        document.getElementById('imgWidth').value = '';
        document.getElementById('ratioResultText').innerText = 'initial';
        App.ratio.calc();
        expect(document.getElementById('ratioResultText').innerText).toBe('initial');
    });

    it('calcResize derives height from width given ratio', () => {
        App.ratio.calc();
        document.getElementById('resizeW').value = '320';
        App.ratio.calcResize('width');
        expect(document.getElementById('resizeH').value).toBe('180');
    });

    it('calcResize derives width from height given ratio', () => {
        App.ratio.calc();
        document.getElementById('resizeH').value = '180';
        App.ratio.calcResize('height');
        expect(document.getElementById('resizeW').value).toBe('320');
    });
});
