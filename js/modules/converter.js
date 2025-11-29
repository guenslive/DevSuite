App.converter = {
    random() {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        App.syncProPicker('conv', randomColor);
    },
    update() {
        const hex = document.getElementById("convColor").value;
        const alpha = parseInt(document.getElementById("convOpacity").value);
        document.getElementById("convOpacityVal").innerText = alpha + "%";
        const rgb = App.utils.hexToRgb(hex);
        if (!rgb) return;
        App.converter.updateAll(rgb.r, rgb.g, rgb.b, alpha / 100);
    },
    fromHex(val) {
        const rgb = App.utils.hexToRgb(val);
        if (rgb) {
            let alpha = parseInt(document.getElementById("convOpacity").value) / 100;
            App.converter.updateAll(rgb.r, rgb.g, rgb.b, alpha);
            App.converter.syncTopControls(rgb.r, rgb.g, rgb.b, alpha);
        }
    },
    fromRgb(val) {
        const parsed = App.utils.parseRgbStr(val);
        if (parsed) {
            App.converter.updateAll(parsed.r, parsed.g, parsed.b, parsed.a);
            App.converter.syncTopControls(parsed.r, parsed.g, parsed.b, parsed.a);
        }
    },
    fromHsl(val) {
        const parsed = App.utils.parseHslStr(val);
        if (parsed) {
            const rgb = App.utils.hslToRgb(parsed.h, parsed.s, parsed.l);
            App.converter.updateAll(rgb.r, rgb.g, rgb.b, parsed.a);
            App.converter.syncTopControls(rgb.r, rgb.g, rgb.b, parsed.a);
        }
    },
    syncTopControls(r, g, b, a) {
        const hex = App.utils.rgbToHex(r, g, b);
        const alphaPct = Math.round(a * 100);
        const colorInput = document.getElementById("convColor");
        const textInput = document.getElementById("convText");
        const box = document.getElementById("convBox");
        const opacityInput = document.getElementById("convOpacity");
        const opacityVal = document.getElementById("convOpacityVal");
        if (colorInput) colorInput.value = hex;
        if (textInput && document.activeElement !== textInput) textInput.value = hex;
        if (box) box.style.background = hex;
        if (opacityInput) opacityInput.value = alphaPct;
        if (opacityVal) opacityVal.innerText = alphaPct + "%";
    },
    updateAll(r, g, b, a) {
        const alphaPct = Math.round(a * 100);
        const hexBase = App.utils.rgbToHex(r, g, b);
        const hexOut = hexBase + (alphaPct < 100 ? Math.round(a * 255).toString(16).padStart(2, "0").toUpperCase() : "");
        const rgbOut = alphaPct < 100 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
        const r1 = r / 255, g1 = g / 255, b1 = b / 255;
        const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
        let h, s, l = (max + min) / 2;
        if (max == min) { h = s = 0; } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
                case g1: h = (b1 - r1) / d + 2; break;
                case b1: h = (r1 - g1) / d + 4; break;
            }
            h /= 6;
        }
        const hslOut = alphaPct < 100 ? `hsla(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${a})` : `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
        const activeId = document.activeElement ? document.activeElement.id : null;
        if (activeId !== "resHex") document.getElementById("resHex").value = hexOut;
        if (activeId !== "resRgb") document.getElementById("resRgb").value = rgbOut;
        if (activeId !== "resHsl") document.getElementById("resHsl").value = hslOut;
        document.getElementById("converterPreviewBox").style.background = rgbOut;
    },
};
