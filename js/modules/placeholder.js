App.placeholder = {
    MIN_DIM: 1,
    MAX_DIM: 4000,
    FONT_FAMILY: "-apple-system, sans-serif",
    LINE_HEIGHT_FACTOR: 1.2,
    MIN_FONT: 6,

    // Common placeholder dimensions.
    PRESETS: {
        og: { w: 1200, h: 630 },
        square: { w: 1080, h: 1080 },
        hd: { w: 1920, h: 1080 },
        story: { w: 1080, h: 1920 },
        banner: { w: 728, h: 90 },
        avatar: { w: 256, h: 256 },
    },

    /* ---------- Pure helpers (DOM-free, unit-tested directly) ---------- */

    mimeFor(format) {
        return (
            {
                png: "image/png",
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                webp: "image/webp",
            }[format] || "image/png"
        );
    },

    // PNG ignores quality; JPG/WEBP take a 0–1 quality factor.
    qualityFor(format, quality) {
        if (format === "png") return undefined;
        const q = Number(quality);
        if (!Number.isFinite(q)) return 0.92;
        return Math.max(0, Math.min(1, q));
    },

    // Parse + clamp a dimension to a safe pixel range.
    clampDim(value, fallback) {
        const n = parseInt(value, 10);
        if (!Number.isFinite(n)) return fallback;
        return Math.max(App.placeholder.MIN_DIM, Math.min(App.placeholder.MAX_DIM, n));
    },

    resolveText(text, w, h) {
        const t = (text || "").trim();
        return t || `${w} x ${h}`;
    },

    // Greedy word-wrap. `measureLine(str)` returns the rendered width of a line.
    wrapLines(text, measureLine, maxWidth) {
        const words = text.split(/\s+/).filter(Boolean);
        if (words.length === 0) return [""];
        const lines = [];
        let current = words[0];
        for (let i = 1; i < words.length; i++) {
            const candidate = current + " " + words[i];
            if (measureLine(candidate) <= maxWidth) {
                current = candidate;
            } else {
                lines.push(current);
                current = words[i];
            }
        }
        lines.push(current);
        return lines;
    },

    // Shrink font size and wrap until the text fits the box (or hits MIN_FONT).
    // `measure(str, size)` returns the rendered width at a given font size.
    layoutText({ text, maxWidth, maxHeight, startSize, measure }) {
        const minSize = App.placeholder.MIN_FONT;
        const lhf = App.placeholder.LINE_HEIGHT_FACTOR;
        for (let size = Math.max(minSize, Math.round(startSize)); size >= minSize; size--) {
            const lines = App.placeholder.wrapLines(text, (s) => measure(s, size), maxWidth);
            const widest = lines.reduce((max, l) => Math.max(max, measure(l, size)), 0);
            const totalHeight = lines.length * size * lhf;
            if (widest <= maxWidth && totalHeight <= maxHeight) {
                return { fontSize: size, lines, lineHeight: size * lhf };
            }
        }
        const lines = App.placeholder.wrapLines(text, (s) => measure(s, minSize), maxWidth);
        return { fontSize: minSize, lines, lineHeight: minSize * lhf };
    },

    filename(w, h, format) {
        return `${w}x${h}.${format}`;
    },

    // Human-readable byte size. Returns "—" for invalid input.
    formatBytes(bytes) {
        if (!Number.isFinite(bytes) || bytes < 0) return "—";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    },

    // Decode the payload size of a base64 data URL without allocating it.
    estimateDataUrlBytes(dataUrl) {
        if (typeof dataUrl !== "string") return 0;
        const comma = dataUrl.indexOf(",");
        if (comma === -1 || !/^data:/.test(dataUrl)) return 0;
        const b64 = dataUrl.slice(comma + 1);
        if (!b64) return 0;
        const padding = (b64.match(/=+$/) || [""])[0].length;
        return Math.floor((b64.length * 3) / 4) - padding;
    },

    // WCAG contrast ratio between two hex colors (1–21).
    contrastRatio(hex1, hex2) {
        const a = App.utils.hexToRgb(hex1);
        const b = App.utils.hexToRgb(hex2);
        if (!a || !b) return 1;
        const l1 = App.utils.getLuminance(a.r, a.g, a.b);
        const l2 = App.utils.getLuminance(b.r, b.g, b.b);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    },

    // Pick a background + text pair sharing one hue, with a guaranteed
    // WCAG AA contrast (>= 4.5). `rng` defaults to Math.random (injectable for tests).
    randomHarmoniousPair(rng = Math.random) {
        const hue = rng();
        const sat = 0.45 + rng() * 0.45; // 0.45–0.90
        const lightTheme = rng() < 0.5;

        // Wide lightness gap on the same hue → high contrast and harmony.
        const bgL = lightTheme ? 0.86 + rng() * 0.1 : 0.14 + rng() * 0.12;
        const txtL = lightTheme ? 0.12 + rng() * 0.1 : 0.9 + rng() * 0.08;

        const toHex = (l) => {
            const { r, g, b } = App.utils.hslToRgb(hue, sat, l);
            return App.utils.rgbToHex(r, g, b);
        };
        return { bg: toHex(bgL), text: toHex(txtL) };
    },

    /* ---------- DOM glue ---------- */

    val(id, fallback) {
        const el = document.getElementById(id);
        return el ? el.value : fallback;
    },

    update(animate) {
        App.placeholder.draw();
        if (animate) {
            const c = document.getElementById("placeholderCanvas");
            if (!c) return;
            c.style.transform = "scale(1.02)";
            setTimeout(() => (c.style.transform = "scale(1)"), 150);
        }
    },

    draw() {
        const c = document.getElementById("placeholderCanvas");
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;

        const w = App.placeholder.clampDim(App.placeholder.val("phWidth"), 600);
        const h = App.placeholder.clampDim(App.placeholder.val("phHeight"), 400);
        const text = App.placeholder.resolveText(App.placeholder.val("phText"), w, h);

        c.width = w;
        c.height = h;

        ctx.fillStyle = App.placeholder.val("phBgColor", "#007aff");
        ctx.fillRect(0, 0, w, h);

        const weight = App.placeholder.val("phFontWeight", "bold");
        const startSize = parseInt(App.placeholder.val("phFontSize"), 10) || 40;
        const measure = (str, size) => {
            ctx.font = `${weight} ${size}px ${App.placeholder.FONT_FAMILY}`;
            return ctx.measureText(str).width;
        };
        const layout = App.placeholder.layoutText({
            text,
            maxWidth: w * 0.9,
            maxHeight: h * 0.9,
            startSize,
            measure,
        });

        ctx.fillStyle = App.placeholder.val("phTextColor", "#ffffff");
        ctx.font = `${weight} ${layout.fontSize}px ${App.placeholder.FONT_FAMILY}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const totalHeight = layout.lines.length * layout.lineHeight;
        const startY = h / 2 - totalHeight / 2 + layout.lineHeight / 2;
        layout.lines.forEach((line, i) => {
            ctx.fillText(line, w / 2, startY + i * layout.lineHeight);
        });

        App.placeholder.updateAria(c, w, h, text);
        App.placeholder.updateFileSize();
    },

    // Estimate the exported file size for the current format/quality and show it
    // next to the download button. Prefers toBlob (exact) over toDataURL.
    updateFileSize() {
        const label = document.getElementById("phFileSize");
        if (!label) return;
        const c = document.getElementById("placeholderCanvas");
        if (!c) return;

        const format = App.placeholder.val("phFormat", "png");
        const mime = App.placeholder.mimeFor(format);
        const quality = App.placeholder.qualityFor(
            format,
            App.placeholder.val("phQuality", 92) / 100,
        );

        const show = (bytes) => {
            label.textContent = App.placeholder.formatBytes(bytes);
        };

        if (typeof c.toBlob === "function") {
            label.textContent = "…";
            c.toBlob(
                (blob) => {
                    if (blob) show(blob.size);
                    else show(App.placeholder.estimateDataUrlBytes(c.toDataURL(mime, quality)));
                },
                mime,
                quality,
            );
        } else if (typeof c.toDataURL === "function") {
            show(App.placeholder.estimateDataUrlBytes(c.toDataURL(mime, quality)));
        }
    },

    // Expose the canvas content to assistive tech (it is otherwise opaque).
    updateAria(c, w, h, text) {
        c.setAttribute("role", "img");
        c.setAttribute("aria-label", `Imagen placeholder ${w}×${h}. Texto: ${text}`);
    },

    onFormatChange() {
        const format = App.placeholder.val("phFormat", "png");
        const row = document.getElementById("phQualityRow");
        if (row) row.hidden = format === "png";
        App.placeholder.updateFileSize();
    },

    applyPreset(name) {
        const p = App.placeholder.PRESETS[name];
        if (!p) return;
        const wEl = document.getElementById("phWidth");
        const hEl = document.getElementById("phHeight");
        if (wEl) wEl.value = p.w;
        if (hEl) hEl.value = p.h;
        document.querySelectorAll("[data-ph-preset]").forEach((b) => {
            b.classList.toggle("active", b.getAttribute("data-ph-preset") === name);
        });
        App.placeholder.update(true);
    },

    triggerDownload(href, filename) {
        const l = document.createElement("a");
        l.download = filename;
        l.href = href;
        l.click();
    },

    downloadViaDataUrl(c, mime, quality, filename) {
        App.placeholder.triggerDownload(c.toDataURL(mime, quality), filename);
    },

    download() {
        const c = document.getElementById("placeholderCanvas");
        if (!c) return;
        const w = App.placeholder.clampDim(App.placeholder.val("phWidth"), 600);
        const h = App.placeholder.clampDim(App.placeholder.val("phHeight"), 400);
        const format = App.placeholder.val("phFormat", "png");
        const mime = App.placeholder.mimeFor(format);
        const quality = App.placeholder.qualityFor(format, App.placeholder.val("phQuality", 92) / 100);
        const filename = App.placeholder.filename(w, h, format);

        // toBlob avoids building a huge base64 string in memory.
        if (typeof c.toBlob === "function") {
            c.toBlob(
                (blob) => {
                    if (!blob) {
                        App.placeholder.downloadViaDataUrl(c, mime, quality, filename);
                        return;
                    }
                    const url = URL.createObjectURL(blob);
                    App.placeholder.triggerDownload(url, filename);
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                },
                mime,
                quality,
            );
        } else {
            App.placeholder.downloadViaDataUrl(c, mime, quality, filename);
        }
    },

    // Apply a background + text color pair, keeping the canvas in sync.
    // The text picker's <input type="color"> uses id `phTextColor` (not the
    // `phTxt`-prefixed id syncProPicker expects), so set it explicitly.
    applyColors(bg, text) {
        App.syncProPicker("phBg", bg);

        const colorInput = document.getElementById("phTextColor");
        const textField = document.getElementById("phTxtText");
        const box = document.getElementById("phTxtBox");
        if (colorInput) colorInput.value = text;
        if (textField) textField.value = text.toUpperCase();
        if (box) box.style.background = text;

        App.placeholder.update(true);
    },

    // Generate a harmonious bg/text pair with guaranteed WCAG AA contrast.
    randomPair() {
        const { bg, text } = App.placeholder.randomHarmoniousPair();
        App.placeholder.applyColors(bg, text);
    },
};
