App.utils = {
    gcd: (a, b) => (b == 0 ? a : App.utils.gcd(b, a % b)),
    hexToRgb: (hex) => {
        const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return r
            ? {
                r: parseInt(r[1], 16),
                g: parseInt(r[2], 16),
                b: parseInt(r[3], 16),
            }
            : null;
    },
    rgbToHex: (r, g, b) => {
        return (
            "#" +
            [r, g, b]
                .map((x) => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                })
                .join("")
                .toUpperCase()
        );
    },
    hslToRgb: (h, s, l) => {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    },
    parseRgbStr: (str) => {
        const m = str.match(
            /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i
        );
        return m ? { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]), a: m[4] ? parseFloat(m[4]) : 1 } : null;
    },
    parseHslStr: (str) => {
        const m = str.match(
            /^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)$/i
        );
        return m ? { h: parseInt(m[1]) / 360, s: parseInt(m[2]) / 100, l: parseInt(m[3]) / 100, a: m[4] ? parseFloat(m[4]) : 1 } : null;
    },
    hexToRgbaStr: (hex, alphaPct) => {
        const rgb = App.utils.hexToRgb(hex);
        return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaPct / 100})` : "rgba(0,0,0,1)";
    },
    adjustColor: (hex, amount) => {
        const rgb = App.utils.hexToRgb(hex);
        if (!rgb) return hex;
        const r = Math.max(0, Math.min(255, rgb.r + amount));
        const g = Math.max(0, Math.min(255, rgb.g + amount));
        const b = Math.max(0, Math.min(255, rgb.b + amount));
        return App.utils.rgbToHex(r, g, b);
    },
    getLuminance: (r, g, b) => {
        const a = [r, g, b].map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    },
    async copyText(id, btn) {
        try {
            // FIX #3: Prevent double-click trap
            if (btn.innerText === "OK") return;

            const el = document.getElementById(id);
            const text = el.tagName === "INPUT" || el.tagName === "TEXTAREA" ? el.value : el.innerText;
            await navigator.clipboard.writeText(text);

            const originalText = btn.getAttribute('data-original-text') || btn.innerText;
            if (!btn.getAttribute('data-original-text')) btn.setAttribute('data-original-text', originalText);

            btn.innerText = "OK";
            btn.style.background = "#34c759";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "";
            }, 1500);
        } catch (e) {
            console.error("Copy failed", e);
        }
    },
};
