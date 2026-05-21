import { describe, it, expect, beforeEach } from 'vitest';
import { loadScript, resetApp } from './setup.js';

function setInput(id, value) {
    const el = document.getElementById(id);
    el.value = value;
}

function mountClampDom() {
    document.body.innerHTML = `
        <input id="minWidth" value="320">
        <input id="maxWidth" value="1440">
        <input id="minFont" value="14">
        <input id="maxFont" value="18">
        <input id="pixelsPerRem" value="16">
        <select id="minUnit"><option value="px" selected>px</option><option value="rem">rem</option></select>
        <select id="maxUnit"><option value="px" selected>px</option><option value="rem">rem</option></select>
        <select id="clampScaleUnit"><option value="vw" selected>vw</option><option value="cqi">cqi</option></select>
        <select id="clampOutputMode"><option value="declaration" selected>declaration</option><option value="value">value</option></select>
        <button data-clamp-preset="body"></button>
        <button data-clamp-preset="h1"></button>
        <div id="clampWarning" hidden></div>
        <div id="clampResult"></div>
        <input id="clampViewportSlider" type="range" value="800" min="320" max="1440">
        <div id="clampViewportVal"></div>
        <div id="clampPreviewText"></div>
        <div id="clampPreviewBox"></div>
    `;
}

describe('App.clamp pure helpers', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/modules/clamp.js');
    });

    describe('fmt', () => {
        it('trims trailing zeros', () => {
            expect(App.clamp.fmt(0.875)).toBe('0.875');
            expect(App.clamp.fmt(2)).toBe('2');
            expect(App.clamp.fmt(0.35714285, 4)).toBe('0.3571');
        });
        it('returns "0" for non-finite numbers', () => {
            expect(App.clamp.fmt(NaN)).toBe('0');
            expect(App.clamp.fmt(Infinity)).toBe('0');
        });
    });

    describe('buildModel', () => {
        const base = { minW: 320, maxW: 1440, minPx: 16, maxPx: 24, base: 16 };

        it('computes slope, intercept and ratio', () => {
            const m = App.clamp.buildModel(base);
            expect(m.valid).toBe(true);
            // slope = (24-16)/(1440-320) = 8/1120
            expect(m.slope).toBeCloseTo(8 / 1120, 10);
            expect(m.slopePct).toBeCloseTo((8 / 1120) * 100, 10);
            // intercept = 16 - 320*slope
            expect(m.interceptPx).toBeCloseTo(16 - 320 * (8 / 1120), 8);
            expect(m.ratio).toBeCloseTo(24 / 16, 10);
            expect(m.minRem).toBe(1);
            expect(m.maxRem).toBe(1.5);
        });

        it('rejects non-numeric input', () => {
            const m = App.clamp.buildModel({ ...base, minW: NaN });
            expect(m.valid).toBe(false);
            expect(m.error).toBe('Ingresa valores...');
        });

        it('rejects equal min/max widths (no division by zero)', () => {
            const m = App.clamp.buildModel({ ...base, minW: 500, maxW: 500 });
            expect(m.valid).toBe(false);
            expect(m.error).toMatch(/no pueden ser iguales/);
        });

        it('rejects non-positive base', () => {
            const m = App.clamp.buildModel({ ...base, base: 0 });
            expect(m.valid).toBe(false);
            expect(m.error).toMatch(/base/i);
        });

        it('handles inverted font ranges without breaking', () => {
            const m = App.clamp.buildModel({ ...base, minPx: 24, maxPx: 16 });
            expect(m.valid).toBe(true);
            expect(m.lowPx).toBe(16);
            expect(m.highPx).toBe(24);
        });

        it('does not mutate its input', () => {
            const input = { ...base };
            App.clamp.buildModel(input);
            expect(input).toEqual(base);
        });
    });

    describe('sizeAt', () => {
        const m = () => App.clamp.buildModel({ minW: 320, maxW: 1440, minPx: 16, maxPx: 24, base: 16 });
        it('clamps to the low bound below the min viewport', () => {
            expect(App.clamp.sizeAt(m(), 100)).toBe(16);
        });
        it('clamps to the high bound above the max viewport', () => {
            expect(App.clamp.sizeAt(m(), 3000)).toBe(24);
        });
        it('interpolates inside the range', () => {
            const size = App.clamp.sizeAt(m(), 880); // midpoint
            expect(size).toBeCloseTo(20, 5);
        });
        it('returns 0 for invalid models', () => {
            expect(App.clamp.sizeAt({ valid: false }, 800)).toBe(0);
        });
    });

    describe('toCss', () => {
        const m = () => App.clamp.buildModel({ minW: 320, maxW: 1440, minPx: 16, maxPx: 24, base: 16 });
        it('emits a font-size declaration by default with vw', () => {
            expect(App.clamp.toCss(m())).toBe('font-size: clamp(1rem, 0.8571rem + 0.7143vw, 1.5rem);');
        });
        it('supports cqi container units', () => {
            expect(App.clamp.toCss(m(), 'cqi')).toContain('cqi');
            expect(App.clamp.toCss(m(), 'cqi')).not.toContain('vw');
        });
        it('emits a bare value in value mode', () => {
            const out = App.clamp.toCss(m(), 'vw', 'value');
            expect(out.startsWith('clamp(')).toBe(true);
            expect(out).not.toContain('font-size');
        });
    });
});

describe('App.clamp.calc — DOM integration', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/modules/clamp.js');
        mountClampDom();
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

    it('converts min/max to rem using base 16 (trimmed)', () => {
        App.clamp.calc();
        const out = document.getElementById('clampResult').innerText;
        expect(out).toContain('0.875rem');
        expect(out).toContain('1.125rem');
    });

    it('works when called detached (as window.calcClamp from oninput)', () => {
        // The HTML handlers invoke `calcClamp()`, a detached reference where
        // `this` is not App.clamp — guards against the binding regression.
        const calcClamp = App.clamp.calc;
        setInput('maxFont', '20');
        expect(() => calcClamp()).not.toThrow();
        expect(document.getElementById('clampResult').innerText).toContain('clamp(');
    });

    it('handleUnitChange works when called detached', () => {
        const handleUnitChange = App.clamp.handleUnitChange;
        const sel = document.getElementById('maxUnit');
        sel.value = 'px';
        expect(() => handleUnitChange('maxFont', sel)).not.toThrow();
    });

    it('switches the scale unit to cqi when selected', () => {
        setInput('clampScaleUnit', 'cqi');
        App.clamp.calc();
        expect(document.getElementById('clampResult').innerText).toContain('cqi');
    });

    it('emits a bare clamp() value when output mode is "value"', () => {
        setInput('clampOutputMode', 'value');
        App.clamp.calc();
        const out = document.getElementById('clampResult').innerText;
        expect(out.startsWith('clamp(')).toBe(true);
    });

    it('shows the WCAG warning when max/min ratio exceeds 2.5x', () => {
        setInput('minFont', '10');
        setInput('maxFont', '40'); // 4x
        App.clamp.calc();
        const warn = document.getElementById('clampWarning');
        expect(warn.hidden).toBe(false);
        expect(warn.textContent).toContain('WCAG');
    });

    it('hides the WCAG warning within the safe ratio', () => {
        setInput('minFont', '16');
        setInput('maxFont', '20'); // 1.25x
        App.clamp.calc();
        expect(document.getElementById('clampWarning').hidden).toBe(true);
    });

    it('syncs slider bounds to the viewport widths', () => {
        App.clamp.calc();
        const slider = document.getElementById('clampViewportSlider');
        expect(slider.min).toBe('320');
        expect(slider.max).toBe('1440');
    });

    it('applies a font preset and marks the active button', () => {
        App.clamp.applyPreset('h1');
        expect(parseFloat(document.getElementById('minFont').value)).toBe(32);
        expect(parseFloat(document.getElementById('maxFont').value)).toBe(56);
        const active = document.querySelector('[data-clamp-preset="h1"]');
        expect(active.classList.contains('active')).toBe(true);
    });
});

describe('App.clamp.updateViewport — live preview', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/modules/clamp.js');
        mountClampDom();
    });

    it('renders the resolved px size in the preview text', () => {
        App.clamp.calc();
        const slider = document.getElementById('clampViewportSlider');
        slider.value = '880';
        App.clamp.updateViewport();
        const txt = document.getElementById('clampPreviewText');
        // base font 14→18 over 320→1440: midpoint ≈ 16px
        expect(txt.style.fontSize).toBe('16px');
        expect(txt.innerText).toContain('16.00px');
    });
});
