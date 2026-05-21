App.clamp = {
    // Common text-role font-size pairs (px), used by the preset buttons.
    PRESETS: {
        body: { min: 16, max: 18 },
        h3: { min: 20, max: 24 },
        h2: { min: 24, max: 36 },
        h1: { min: 32, max: 56 },
    },

    // WCAG: a fluid range whose max exceeds this multiple of its min can
    // hurt zoom/legibility, so we surface a warning above it.
    MAX_RATIO: 2.5,

    /* ---------- Pure helpers (DOM-free, unit-tested directly) ---------- */

    // Fixed-precision number with trailing zeros trimmed → compact CSS value.
    fmt(n, digits = 4) {
        if (!Number.isFinite(n)) return "0";
        return parseFloat(n.toFixed(digits)).toString();
    },

    // Build the fluid-size model from raw numbers (all px except `base`).
    // Returns an immutable descriptor; never mutates its input.
    buildModel({ minW, maxW, minPx, maxPx, base }) {
        if ([minW, maxW, minPx, maxPx, base].some((n) => !Number.isFinite(n))) {
            return { valid: false, error: "Ingresa valores..." };
        }
        if (base <= 0) {
            return { valid: false, error: "La base (px por rem) debe ser mayor que 0." };
        }
        if (minW === maxW) {
            return { valid: false, error: "El ancho mínimo y máximo no pueden ser iguales." };
        }
        const slope = (maxPx - minPx) / (maxW - minW); // font px per viewport px
        const interceptPx = minPx - minW * slope; // font px at viewport 0
        const lowPx = Math.min(minPx, maxPx);
        const highPx = Math.max(minPx, maxPx);
        const ratio = lowPx > 0 ? highPx / lowPx : Infinity;
        return {
            valid: true,
            error: null,
            base,
            minW,
            maxW,
            minRem: minPx / base,
            maxRem: maxPx / base,
            interceptRem: interceptPx / base,
            slopePct: slope * 100, // coefficient for the vw/cqi term
            slope,
            interceptPx,
            lowPx,
            highPx,
            ratio,
        };
    },

    // Font size (px) the clamp() resolves to at a given viewport width.
    sizeAt(model, width) {
        if (!model || !model.valid || !Number.isFinite(width)) return 0;
        const px = model.interceptPx + model.slope * width;
        return Math.max(model.lowPx, Math.min(model.highPx, px));
    },

    // Serialize the model to a clamp() expression.
    // unit: "vw" (viewport) | "cqi" (container query inline).
    // mode: "declaration" (font-size: …;) | "value" (bare clamp()).
    toCss(model, unit = "vw", mode = "declaration") {
        const value =
            `clamp(${App.clamp.fmt(model.minRem)}rem, ` +
            `${App.clamp.fmt(model.interceptRem)}rem + ${App.clamp.fmt(model.slopePct)}${unit}, ` +
            `${App.clamp.fmt(model.maxRem)}rem)`;
        return mode === "value" ? value : `font-size: ${value};`;
    },

    /* ---------- DOM glue ---------- */

    val(id, fallback = NaN) {
        const el = document.getElementById(id);
        return el ? parseFloat(el.value) : fallback;
    },

    sel(id, fallback) {
        const el = document.getElementById(id);
        return el ? el.value : fallback;
    },

    // Read inputs and build the current model.
    getModel() {
        const base = App.clamp.val("pixelsPerRem", 16) || 16;
        const minF = App.clamp.val("minFont");
        const maxF = App.clamp.val("maxFont");
        const minU = App.clamp.sel("minUnit", "rem");
        const maxU = App.clamp.sel("maxUnit", "rem");
        return App.clamp.buildModel({
            minW: App.clamp.val("minWidth"),
            maxW: App.clamp.val("maxWidth"),
            minPx: minU === "rem" ? minF * base : minF,
            maxPx: maxU === "rem" ? maxF * base : maxF,
            base,
        });
    },

    handleUnitChange(id, sel) {
        const i = document.getElementById(id);
        const b = App.clamp.val("pixelsPerRem", 16) || 16;
        let v = parseFloat(i.value);
        if (isNaN(v)) v = 0;
        i.value = sel.value === "px" ? parseFloat((v * b).toFixed(2)) : parseFloat((v / b).toFixed(4));
        App.clamp.calc();
    },

    // Apply a font-role preset, respecting each field's current unit (px/rem).
    applyPreset(name) {
        const p = App.clamp.PRESETS[name];
        if (!p) return;
        const base = App.clamp.val("pixelsPerRem", 16) || 16;
        const setField = (fieldId, unitId, px) => {
            const el = document.getElementById(fieldId);
            if (!el) return;
            const unit = App.clamp.sel(unitId, "rem");
            el.value = unit === "rem" ? parseFloat((px / base).toFixed(4)) : px;
        };
        setField("minFont", "minUnit", p.min);
        setField("maxFont", "maxUnit", p.max);
        document.querySelectorAll("[data-clamp-preset]").forEach((b) => {
            b.classList.toggle("active", b.getAttribute("data-clamp-preset") === name);
        });
        App.clamp.calc();
    },

    renderWarning(model) {
        const el = document.getElementById("clampWarning");
        if (!el) return;
        if (model && model.valid && model.ratio > App.clamp.MAX_RATIO) {
            el.textContent =
                `⚠ La relación máx/mín es ${App.clamp.fmt(model.ratio, 2)}× (límite recomendado: ` +
                `${App.clamp.MAX_RATIO}×). Un salto tan grande puede dificultar el zoom y la legibilidad (WCAG).`;
            el.hidden = false;
        } else {
            el.hidden = true;
        }
    },

    calc() {
        const r = document.getElementById("clampResult");
        const model = App.clamp.getModel();
        if (!model.valid) {
            if (r) r.innerText = model.error;
            App.clamp.renderWarning(null);
            return;
        }

        const unit = App.clamp.sel("clampScaleUnit", "vw");
        const mode = App.clamp.sel("clampOutputMode", "declaration");
        if (r) r.innerText = App.clamp.toCss(model, unit, mode);

        const slider = document.getElementById("clampViewportSlider");
        if (slider) {
            slider.min = Math.min(model.minW, model.maxW);
            slider.max = Math.max(model.minW, model.maxW);
        }

        App.clamp.renderWarning(model);
        App.clamp.updateViewport();
    },

    updateViewport() {
        const slider = document.getElementById("clampViewportSlider");
        if (!slider) return;
        const width = parseFloat(slider.value);

        const valEl = document.getElementById("clampViewportVal");
        if (valEl) valEl.innerText = width + "px";

        const model = App.clamp.getModel();
        if (!model.valid) return;

        const size = App.clamp.sizeAt(model, width);
        const txt = document.getElementById("clampPreviewText");
        if (txt) {
            txt.style.fontSize = size + "px";
            txt.innerText = `Texto de Prueba (${size.toFixed(2)}px)`;
        }

        const box = document.getElementById("clampPreviewBox");
        if (box) {
            const minV = parseFloat(slider.min);
            const maxV = parseFloat(slider.max);
            const span = maxV - minV;
            const pct = span > 0 ? 30 + ((width - minV) / span) * 70 : 100;
            box.style.width = pct + "%";
        }
    },
};
