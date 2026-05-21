App.ratio = {
    // Tamaños máximos del preview (px)
    BOX_MAX_W: 160,
    BOX_MAX_H: 140,

    // Nombres comunes por ratio simplificado "rW:rH"
    COMMON_NAMES: {
        "1:1": "Cuadrado",
        "16:9": "Widescreen",
        "4:3": "Estándar (4:3)",
        "3:2": "Foto 3:2",
        "16:10": "16:10",
        "8:5": "16:10",
        "21:9": "Ultrawide",
        "7:3": "Ultrawide (21:9)",
        "2:1": "Univisium",
        "5:4": "5:4",
        "9:16": "Vertical (Stories)",
        "2:3": "Retrato 2:3",
        "3:4": "Retrato 3:4",
    },

    /** Lee un input numérico y devuelve un entero positivo, o null si no es válido. */
    readPositiveInt(id) {
        const value = Math.round(parseFloat(document.getElementById(id).value));
        return Number.isFinite(value) && value > 0 ? value : null;
    },

    /** Devuelve el nombre común de un ratio, o su orientación como fallback. */
    ratioName(rW, rH) {
        const named = App.ratio.COMMON_NAMES[`${rW}:${rH}`];
        if (named) return named;
        if (rW === rH) return "Cuadrado";
        return rW > rH ? "Horizontal" : "Vertical";
    },

    /** Resalta el botón de preset que coincide con el ratio actual (o ninguno). */
    syncPresetActive(rW, rH) {
        const key = `${rW}:${rH}`;
        document.querySelectorAll("[data-ratio-preset]").forEach((b) => {
            b.classList.toggle("active", b.getAttribute("data-ratio-preset") === key);
        });
    },

    /** Actualiza los textos de resultado (ratio simplificado + decimal + nombre + CSS). */
    renderResult(rW, rH) {
        const resultText = document.getElementById("ratioResultText");
        const meta = document.getElementById("ratioMeta");
        const cssResult = document.getElementById("ratioCssResult");
        if (resultText) resultText.innerText = `${rW} : ${rH}`;
        if (meta) {
            const decimal = parseFloat((rW / rH).toFixed(3));
            meta.innerText = `≈ ${decimal} · ${App.ratio.ratioName(rW, rH)}`;
        }
        if (cssResult) cssResult.innerText = `aspect-ratio: ${rW} / ${rH};`;
    },

    /** Dibuja el preview con las proporciones dadas. */
    renderBox(rW, rH) {
        const box = document.getElementById("ratioBox");
        if (!box) return;
        box.innerText = `${rW}:${rH}`;
        if (rW >= rH) {
            box.style.width = `${App.ratio.BOX_MAX_W}px`;
            box.style.height = `${(App.ratio.BOX_MAX_W / rW) * rH}px`;
        } else {
            box.style.height = `${App.ratio.BOX_MAX_H}px`;
            box.style.width = `${(App.ratio.BOX_MAX_H / rH) * rW}px`;
        }
        App.ratio.syncPresetActive(rW, rH);
    },

    /** Aplica un preset de ratio (ej. 16:9) a los inputs de ratio y recalcula. */
    applyPreset(rW, rH) {
        document.getElementById("ratioInW").value = rW;
        document.getElementById("ratioInH").value = rH;
        App.ratio.calcResize('ratio');
    },

    /** Intercambia ancho y alto del ratio (horizontal ↔ vertical). */
    swap() {
        const inW = document.getElementById("ratioInW");
        const inH = document.getElementById("ratioInH");
        const tmp = inW.value;
        inW.value = inH.value;
        inH.value = tmp;
        App.ratio.calcResize('ratio');
    },

    /**
     * Dimensiones a exportar: usa las del redimensionado si ambas son válidas,
     * si no las originales (ancho/alto px). Devuelve null si no hay ninguna.
     */
    exportDimensions() {
        const resizeW = App.ratio.readPositiveInt("resizeW");
        const resizeH = App.ratio.readPositiveInt("resizeH");
        if (resizeW !== null && resizeH !== null) return { w: resizeW, h: resizeH };

        const w = App.ratio.readPositiveInt("imgWidth");
        const h = App.ratio.readPositiveInt("imgHeight");
        if (w !== null && h !== null) return { w, h };

        return null;
    },

    /** Envía las medidas actuales al generador de placeholders y abre esa pestaña. */
    toPlaceholder() {
        const dims = App.ratio.exportDimensions();
        if (!dims) return;

        const phW = document.getElementById("phWidth");
        const phH = document.getElementById("phHeight");
        if (phW) phW.value = dims.w;
        if (phH) phH.value = dims.h;

        if (App.core && typeof App.core.switchTab === "function") {
            App.core.switchTab("placeholder");
        }
    },

    calc() {
        const w = App.ratio.readPositiveInt("imgWidth");
        const h = App.ratio.readPositiveInt("imgHeight");
        if (w === null || h === null) return;

        const d = App.utils.gcd(w, h);
        const rW = w / d, rH = h / d;

        App.ratio.renderResult(rW, rH);
        App.ratio.renderBox(rW, rH);

        // Sincronizar inputs del ratio de abajo
        document.getElementById("ratioInW").value = rW;
        document.getElementById("ratioInH").value = rH;

        // Recalcular resize si es necesario
        App.ratio.calcResize('ratio');
    },

    calcResize(source) {
        const rW = App.ratio.readPositiveInt("ratioInW");
        const rH = App.ratio.readPositiveInt("ratioInH");
        const inW = document.getElementById("resizeW");
        const inH = document.getElementById("resizeH");

        if (rW === null || rH === null) return;

        // Reflejar el ratio manual en el preview y los textos de resultado
        App.ratio.renderResult(rW, rH);
        App.ratio.renderBox(rW, rH);

        if (source === 'width') {
            const valW = parseFloat(inW.value);
            inH.value = Number.isFinite(valW) ? ((valW * rH) / rW).toFixed(0) : "";
        } else if (source === 'height') {
            const valH = parseFloat(inH.value);
            inW.value = Number.isFinite(valH) ? ((valH * rW) / rH).toFixed(0) : "";
        } else if (source === 'ratio') {
            const valW = parseFloat(inW.value);
            const valH = parseFloat(inH.value);
            if (Number.isFinite(valW)) {
                inH.value = ((valW * rH) / rW).toFixed(0);
            } else if (Number.isFinite(valH)) {
                inW.value = ((valH * rW) / rH).toFixed(0);
            }
        }
    }
};
