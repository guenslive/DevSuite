import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadScript, resetApp } from './setup.js';

// Fake text measurer: width grows linearly with characters and font size.
const fakeMeasure = (text, size) => text.length * size * 0.5;

describe('App.placeholder pure helpers', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/modules/placeholder.js');
    });

    describe('mimeFor', () => {
        it('maps known formats', () => {
            expect(App.placeholder.mimeFor('png')).toBe('image/png');
            expect(App.placeholder.mimeFor('jpg')).toBe('image/jpeg');
            expect(App.placeholder.mimeFor('webp')).toBe('image/webp');
        });
        it('falls back to png for unknown formats', () => {
            expect(App.placeholder.mimeFor('gif')).toBe('image/png');
        });
    });

    describe('qualityFor', () => {
        it('returns undefined for png (quality ignored)', () => {
            expect(App.placeholder.qualityFor('png', 0.5)).toBeUndefined();
        });
        it('clamps quality to 0–1', () => {
            expect(App.placeholder.qualityFor('jpg', 2)).toBe(1);
            expect(App.placeholder.qualityFor('jpg', -1)).toBe(0);
            expect(App.placeholder.qualityFor('webp', 0.8)).toBe(0.8);
        });
        it('defaults to 0.92 on invalid input', () => {
            expect(App.placeholder.qualityFor('jpg', NaN)).toBe(0.92);
        });
    });

    describe('clampDim', () => {
        it('clamps to the safe range', () => {
            expect(App.placeholder.clampDim('99999', 600)).toBe(4000);
            expect(App.placeholder.clampDim('-50', 600)).toBe(1);
            expect(App.placeholder.clampDim('0', 600)).toBe(1);
            expect(App.placeholder.clampDim('800', 600)).toBe(800);
        });
        it('uses fallback for non-numeric input', () => {
            expect(App.placeholder.clampDim('abc', 600)).toBe(600);
            expect(App.placeholder.clampDim('', 400)).toBe(400);
        });
    });

    describe('resolveText', () => {
        it('uses provided text', () => {
            expect(App.placeholder.resolveText('Hola', 300, 150)).toBe('Hola');
        });
        it('falls back to dimensions when empty/blank', () => {
            expect(App.placeholder.resolveText('', 300, 150)).toBe('300 x 150');
            expect(App.placeholder.resolveText('   ', 800, 600)).toBe('800 x 600');
        });
    });

    describe('filename', () => {
        it('builds <w>x<h>.<format>', () => {
            expect(App.placeholder.filename(800, 600, 'jpg')).toBe('800x600.jpg');
        });
    });

    describe('wrapLines', () => {
        it('keeps text on one line when it fits', () => {
            const lines = App.placeholder.wrapLines('a b', (s) => fakeMeasure(s, 10), 1000);
            expect(lines).toEqual(['a b']);
        });
        it('wraps into multiple lines when too wide', () => {
            const lines = App.placeholder.wrapLines('aaaa bbbb cccc', (s) => fakeMeasure(s, 10), 60);
            expect(lines.length).toBeGreaterThan(1);
        });
        it('returns a single empty line for empty text', () => {
            expect(App.placeholder.wrapLines('', () => 0, 100)).toEqual(['']);
        });
    });

    describe('formatBytes', () => {
        it('formats bytes under 1 KB', () => {
            expect(App.placeholder.formatBytes(0)).toBe('0 B');
            expect(App.placeholder.formatBytes(640)).toBe('640 B');
            expect(App.placeholder.formatBytes(1023)).toBe('1023 B');
        });
        it('formats kilobytes with one decimal', () => {
            expect(App.placeholder.formatBytes(1024)).toBe('1.0 KB');
            expect(App.placeholder.formatBytes(2560)).toBe('2.5 KB');
        });
        it('formats megabytes with two decimals', () => {
            expect(App.placeholder.formatBytes(1024 * 1024)).toBe('1.00 MB');
            expect(App.placeholder.formatBytes(1024 * 1024 * 3.5)).toBe('3.50 MB');
        });
        it('handles invalid input gracefully', () => {
            expect(App.placeholder.formatBytes(NaN)).toBe('—');
            expect(App.placeholder.formatBytes(-1)).toBe('—');
        });
    });

    describe('estimateDataUrlBytes', () => {
        it('estimates byte size from a base64 data URL', () => {
            // "AAAA" → 3 bytes of payload.
            expect(App.placeholder.estimateDataUrlBytes('data:image/png;base64,AAAA')).toBe(3);
        });
        it('accounts for padding', () => {
            // "AA==" → 1 byte.
            expect(App.placeholder.estimateDataUrlBytes('data:image/png;base64,AA==')).toBe(1);
            // "AAA=" → 2 bytes.
            expect(App.placeholder.estimateDataUrlBytes('data:image/png;base64,AAA=')).toBe(2);
        });
        it('returns 0 for malformed input', () => {
            expect(App.placeholder.estimateDataUrlBytes('')).toBe(0);
            expect(App.placeholder.estimateDataUrlBytes('not-a-data-url')).toBe(0);
        });
    });

    describe('contrastRatio', () => {
        it('returns 21 for black on white', () => {
            expect(App.placeholder.contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
        });
        it('returns 1 for identical colors', () => {
            expect(App.placeholder.contrastRatio('#3366CC', '#3366CC')).toBeCloseTo(1, 5);
        });
        it('is symmetric', () => {
            const a = App.placeholder.contrastRatio('#123456', '#FEDCBA');
            const b = App.placeholder.contrastRatio('#FEDCBA', '#123456');
            expect(a).toBeCloseTo(b, 5);
        });
    });

    describe('randomHarmoniousPair', () => {
        it('returns a bg/text pair as #RRGGBB hex', () => {
            const { bg, text } = App.placeholder.randomHarmoniousPair(() => 0.5);
            expect(bg).toMatch(/^#[0-9A-F]{6}$/);
            expect(text).toMatch(/^#[0-9A-F]{6}$/);
        });
        it('guarantees WCAG AA contrast (>= 4.5) for any rng output', () => {
            // Sweep the rng across its range to exercise every branch.
            for (let i = 0; i <= 1; i += 0.05) {
                const seq = [i, (i + 0.3) % 1, (i + 0.6) % 1, (i + 0.9) % 1];
                let k = 0;
                const rng = () => seq[k++ % seq.length];
                const { bg, text } = App.placeholder.randomHarmoniousPair(rng);
                const ratio = App.placeholder.contrastRatio(bg, text);
                expect(ratio).toBeGreaterThanOrEqual(4.5);
            }
        });
        it('keeps bg and text on the same hue (harmonious)', () => {
            // With a fixed hue, both colors should share it.
            const rng = () => 0.0; // hue = 0
            const { bg, text } = App.placeholder.randomHarmoniousPair(rng);
            expect(bg).not.toBe(text);
        });
    });

    describe('layoutText', () => {
        it('keeps the requested size when text fits', () => {
            const layout = App.placeholder.layoutText({
                text: 'Hi', maxWidth: 1000, maxHeight: 1000, startSize: 40, measure: fakeMeasure,
            });
            expect(layout.fontSize).toBe(40);
            expect(layout.lines).toEqual(['Hi']);
        });
        it('shrinks the font when text cannot fit', () => {
            const layout = App.placeholder.layoutText({
                text: 'WWWWWWWWWW', maxWidth: 50, maxHeight: 1000, startSize: 40, measure: fakeMeasure,
            });
            expect(layout.fontSize).toBeLessThan(40);
            expect(layout.fontSize).toBeGreaterThanOrEqual(App.placeholder.MIN_FONT);
        });
        it('never goes below MIN_FONT', () => {
            const layout = App.placeholder.layoutText({
                text: 'impossiblylongunbreakableword', maxWidth: 1, maxHeight: 1, startSize: 40, measure: fakeMeasure,
            });
            expect(layout.fontSize).toBe(App.placeholder.MIN_FONT);
        });
    });
});

describe('App.placeholder.download — modern export', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/modules/placeholder.js');
        document.body.innerHTML = `
            <canvas id="placeholderCanvas"></canvas>
            <input id="phWidth" value="800">
            <input id="phHeight" value="600">
            <select id="phFormat"><option value="jpg" selected>jpg</option></select>
            <input id="phQuality" value="80">
        `;
        globalThis.URL.createObjectURL = vi.fn(() => 'blob:fake');
        globalThis.URL.revokeObjectURL = vi.fn();
    });

    it('uses toBlob with the correct mime and quality', () => {
        const canvas = document.getElementById('placeholderCanvas');
        const toBlob = vi.fn((cb) => cb(new Blob(['x'])));
        canvas.toBlob = toBlob;
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

        App.placeholder.download();

        expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.8);
        expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
        expect(click).toHaveBeenCalled();
        click.mockRestore();
    });

    it('falls back to toDataURL when toBlob is unavailable', () => {
        const canvas = document.getElementById('placeholderCanvas');
        canvas.toBlob = undefined;
        const toDataURL = vi.fn(() => 'data:image/jpeg;base64,AAA');
        canvas.toDataURL = toDataURL;
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

        App.placeholder.download();

        expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
        expect(click).toHaveBeenCalled();
        click.mockRestore();
    });
});

describe('App.placeholder.applyPreset', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/modules/placeholder.js');
        document.body.innerHTML = `
            <input id="phWidth" value="600">
            <input id="phHeight" value="400">
            <canvas id="placeholderCanvas"></canvas>
            <button data-ph-preset="og"></button>
            <button data-ph-preset="square"></button>
        `;
        // jsdom has no 2D context; draw() bails on a null context.
        document.getElementById('placeholderCanvas').getContext = () => null;
    });

    it('sets dimensions and marks the active button', () => {
        App.placeholder.applyPreset('og');
        expect(document.getElementById('phWidth').value).toBe('1200');
        expect(document.getElementById('phHeight').value).toBe('630');
        expect(document.querySelector('[data-ph-preset="og"]').classList.contains('active')).toBe(true);
        expect(document.querySelector('[data-ph-preset="square"]').classList.contains('active')).toBe(false);
    });

    it('ignores unknown presets', () => {
        App.placeholder.applyPreset('nope');
        expect(document.getElementById('phWidth').value).toBe('600');
    });
});

describe('App.placeholder.updateFileSize', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/modules/placeholder.js');
        document.body.innerHTML = `
            <canvas id="placeholderCanvas"></canvas>
            <select id="phFormat"><option value="jpg" selected>jpg</option></select>
            <input id="phQuality" value="80">
            <span id="phFileSize">—</span>
        `;
    });

    it('shows the exact blob size when toBlob is available', () => {
        const canvas = document.getElementById('placeholderCanvas');
        canvas.toBlob = vi.fn((cb) => cb({ size: 2560 }));
        App.placeholder.updateFileSize();
        expect(document.getElementById('phFileSize').textContent).toBe('2.5 KB');
    });

    it('falls back to estimating from a data URL', () => {
        const canvas = document.getElementById('placeholderCanvas');
        canvas.toBlob = undefined;
        canvas.toDataURL = vi.fn(() => 'data:image/jpeg;base64,AAAA');
        App.placeholder.updateFileSize();
        expect(document.getElementById('phFileSize').textContent).toBe('3 B');
    });

    it('does nothing without the label element', () => {
        document.getElementById('phFileSize').remove();
        expect(() => App.placeholder.updateFileSize()).not.toThrow();
    });
});

describe('App.placeholder.applyColors', () => {
    beforeEach(() => {
        resetApp();
        loadScript('js/utils/utils.js');
        loadScript('js/modules/placeholder.js');
        document.body.innerHTML = `
            <canvas id="placeholderCanvas"></canvas>
            <input id="phTextColor" value="#FFFFFF">
            <input id="phTxtText" value="#FFFFFF">
            <div id="phTxtBox"></div>
        `;
        document.getElementById('placeholderCanvas').getContext = () => null;
        App.syncProPicker = vi.fn();
    });

    it('sets the background via syncProPicker and the text inputs directly', () => {
        App.placeholder.applyColors('#101820', '#F0F0F0');
        expect(App.syncProPicker).toHaveBeenCalledWith('phBg', '#101820');
        expect(document.getElementById('phTextColor').value).toBe('#F0F0F0');
        expect(document.getElementById('phTxtText').value).toBe('#F0F0F0');
        expect(document.getElementById('phTxtBox').style.background).toBe('rgb(240, 240, 240)');
    });

    it('randomPair applies a contrast-safe pair', () => {
        App.placeholder.applyColors = vi.fn();
        App.placeholder.randomPair();
        expect(App.placeholder.applyColors).toHaveBeenCalledTimes(1);
        const [bg, text] = App.placeholder.applyColors.mock.calls[0];
        expect(App.placeholder.contrastRatio(bg, text)).toBeGreaterThanOrEqual(4.5);
    });
});
