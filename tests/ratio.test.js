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
            <div id="ratioMeta"></div>
            <div id="ratioCssResult"></div>
            <div id="ratioBox"></div>
            <input id="ratioInW">
            <input id="ratioInH">
            <input id="resizeW">
            <input id="resizeH">
            <button data-ratio-preset="16:9"></button>
            <button data-ratio-preset="4:3"></button>
            <button data-ratio-preset="1:1"></button>
            <input id="phWidth" value="600">
            <input id="phHeight" value="400">
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

    it('does nothing when width is negative', () => {
        document.getElementById('imgWidth').value = '-1920';
        document.getElementById('ratioResultText').innerText = 'initial';
        App.ratio.calc();
        expect(document.getElementById('ratioResultText').innerText).toBe('initial');
    });

    it('does nothing when height is zero', () => {
        document.getElementById('imgHeight').value = '0';
        document.getElementById('ratioResultText').innerText = 'initial';
        App.ratio.calc();
        expect(document.getElementById('ratioResultText').innerText).toBe('initial');
    });

    it('simplifies decimal dimensions to integer ratio', () => {
        document.getElementById('imgWidth').value = '1920.5';
        document.getElementById('imgHeight').value = '1080';
        App.ratio.calc();
        // Debe redondear a enteros y simplificar (1921:1080 es coprimo)
        expect(document.getElementById('ratioResultText').innerText).toBe('1921 : 1080');
    });

    it('handles a square ratio 1:1', () => {
        document.getElementById('imgWidth').value = '500';
        document.getElementById('imgHeight').value = '500';
        App.ratio.calc();
        expect(document.getElementById('ratioResultText').innerText).toBe('1 : 1');
        expect(document.getElementById('ratioCssResult').innerText).toBe('aspect-ratio: 1 / 1;');
    });

    it('handles a portrait ratio 9:16', () => {
        document.getElementById('imgWidth').value = '1080';
        document.getElementById('imgHeight').value = '1920';
        App.ratio.calc();
        expect(document.getElementById('ratioResultText').innerText).toBe('9 : 16');
    });

    it('works when calc is called unbound (como window.calcRatio)', () => {
        // main.js asigna window.calcRatio = App.ratio.calc (sin bind),
        // así que `this` se pierde al invocarlo desde el oninput del HTML.
        const calcRatio = App.ratio.calc;
        document.getElementById('imgWidth').value = '1920';
        document.getElementById('imgHeight').value = '3';
        calcRatio();
        expect(document.getElementById('ratioResultText').innerText).toBe('640 : 1');
    });

    describe('ratioName', () => {
        it('returns common names for known ratios', () => {
            expect(App.ratio.ratioName(16, 9)).toBe('Widescreen');
            expect(App.ratio.ratioName(1, 1)).toBe('Cuadrado');
            expect(App.ratio.ratioName(4, 3)).toBe('Estándar (4:3)');
        });
        it('falls back to orientation for unknown ratios', () => {
            expect(App.ratio.ratioName(640, 1)).toBe('Horizontal');
            expect(App.ratio.ratioName(1, 640)).toBe('Vertical');
        });
    });

    describe('renderResult metadata', () => {
        it('shows decimal value and name', () => {
            App.ratio.renderResult(16, 9);
            const meta = document.getElementById('ratioMeta').innerText;
            expect(meta).toContain('1.778');
            expect(meta).toContain('Widescreen');
        });
    });

    describe('applyPreset', () => {
        it('sets the ratio inputs and recalculates', () => {
            App.ratio.applyPreset(4, 3);
            expect(document.getElementById('ratioInW').value).toBe('4');
            expect(document.getElementById('ratioInH').value).toBe('3');
            expect(document.getElementById('ratioResultText').innerText).toBe('4 : 3');
        });
        it('highlights the matching preset button', () => {
            App.ratio.applyPreset(4, 3);
            expect(document.querySelector('[data-ratio-preset="4:3"]').classList.contains('active')).toBe(true);
            expect(document.querySelector('[data-ratio-preset="16:9"]').classList.contains('active')).toBe(false);
        });
    });

    describe('swap', () => {
        it('intercambia ancho y alto del ratio', () => {
            App.ratio.applyPreset(16, 9);
            App.ratio.swap();
            expect(document.getElementById('ratioInW').value).toBe('9');
            expect(document.getElementById('ratioInH').value).toBe('16');
            expect(document.getElementById('ratioResultText').innerText).toBe('9 : 16');
        });
    });

    describe('exportDimensions', () => {
        it('prefiere las dimensiones del redimensionado si son válidas', () => {
            document.getElementById('resizeW').value = '1280';
            document.getElementById('resizeH').value = '720';
            expect(App.ratio.exportDimensions()).toEqual({ w: 1280, h: 720 });
        });
        it('cae a las dimensiones originales si el resize está vacío', () => {
            document.getElementById('imgWidth').value = '1920';
            document.getElementById('imgHeight').value = '1080';
            expect(App.ratio.exportDimensions()).toEqual({ w: 1920, h: 1080 });
        });
        it('devuelve null si no hay dimensiones válidas', () => {
            document.getElementById('imgWidth').value = '';
            document.getElementById('imgHeight').value = '';
            expect(App.ratio.exportDimensions()).toBeNull();
        });
    });

    describe('toPlaceholder', () => {
        it('fija phWidth/phHeight y cambia a la pestaña placeholder', () => {
            const calls = [];
            App.core = { switchTab: (t) => calls.push(t) };
            document.getElementById('resizeW').value = '1280';
            document.getElementById('resizeH').value = '720';
            App.ratio.toPlaceholder();
            expect(document.getElementById('phWidth').value).toBe('1280');
            expect(document.getElementById('phHeight').value).toBe('720');
            expect(calls).toEqual(['placeholder']);
        });
        it('no cambia de pestaña si no hay dimensiones válidas', () => {
            const calls = [];
            App.core = { switchTab: (t) => calls.push(t) };
            document.getElementById('imgWidth').value = '';
            document.getElementById('imgHeight').value = '';
            App.ratio.toPlaceholder();
            expect(calls).toEqual([]);
        });
    });
});
