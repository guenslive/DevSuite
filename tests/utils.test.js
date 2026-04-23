import { describe, it, expect, beforeEach } from 'vitest';
import { loadUtils } from './setup.js';

describe('App.utils — color math', () => {
    beforeEach(() => {
        loadUtils();
    });

    describe('hexToRgb', () => {
        it('parses 6-digit hex with hash', () => {
            expect(App.utils.hexToRgb('#ff8040')).toEqual({ r: 255, g: 128, b: 64 });
        });

        it('parses hex without hash', () => {
            expect(App.utils.hexToRgb('ff8040')).toEqual({ r: 255, g: 128, b: 64 });
        });

        it('returns null for invalid hex', () => {
            expect(App.utils.hexToRgb('#zzz')).toBeNull();
            expect(App.utils.hexToRgb('#123')).toBeNull();
        });
    });

    describe('rgbToHex', () => {
        it('converts RGB to uppercase hex with hash', () => {
            expect(App.utils.rgbToHex(255, 128, 64)).toBe('#FF8040');
        });

        it('pads single digits with zero', () => {
            expect(App.utils.rgbToHex(0, 10, 15)).toBe('#000A0F');
        });
    });

    describe('hslToRgb', () => {
        it('converts red hue to red RGB', () => {
            expect(App.utils.hslToRgb(0, 1, 0.5)).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('converts zero saturation to gray', () => {
            expect(App.utils.hslToRgb(0.5, 0, 0.5)).toEqual({ r: 128, g: 128, b: 128 });
        });
    });

    describe('gcd', () => {
        it('returns greatest common divisor', () => {
            expect(App.utils.gcd(1920, 1080)).toBe(120);
            expect(App.utils.gcd(16, 9)).toBe(1);
            expect(App.utils.gcd(12, 8)).toBe(4);
        });
    });

    describe('parseRgbStr', () => {
        it('parses rgb()', () => {
            expect(App.utils.parseRgbStr('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
        });

        it('parses rgba() with alpha', () => {
            expect(App.utils.parseRgbStr('rgba(10, 20, 30, 0.5)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
        });

        it('returns null for invalid input', () => {
            expect(App.utils.parseRgbStr('nope')).toBeNull();
        });
    });

    describe('parseHslStr', () => {
        it('parses hsl()', () => {
            const p = App.utils.parseHslStr('hsl(180, 50%, 60%)');
            expect(p.h).toBeCloseTo(0.5);
            expect(p.s).toBeCloseTo(0.5);
            expect(p.l).toBeCloseTo(0.6);
            expect(p.a).toBe(1);
        });
    });

    describe('hexToRgbaStr', () => {
        it('converts hex + alpha to rgba string', () => {
            expect(App.utils.hexToRgbaStr('#ff8040', 50)).toBe('rgba(255, 128, 64, 0.5)');
        });

        it('returns opaque black fallback on invalid hex', () => {
            expect(App.utils.hexToRgbaStr('bad', 100)).toBe('rgba(0,0,0,1)');
        });
    });

    describe('adjustColor', () => {
        it('lightens when given positive amount', () => {
            expect(App.utils.adjustColor('#808080', 16)).toBe('#909090');
        });

        it('clamps at 255', () => {
            expect(App.utils.adjustColor('#F0F0F0', 100)).toBe('#FFFFFF');
        });

        it('clamps at 0', () => {
            expect(App.utils.adjustColor('#101010', -100)).toBe('#000000');
        });

        it('returns input unchanged when hex invalid', () => {
            expect(App.utils.adjustColor('nope', 10)).toBe('nope');
        });
    });

    describe('getLuminance', () => {
        it('returns 1 for white', () => {
            expect(App.utils.getLuminance(255, 255, 255)).toBeCloseTo(1, 4);
        });

        it('returns 0 for black', () => {
            expect(App.utils.getLuminance(0, 0, 0)).toBe(0);
        });
    });
});
