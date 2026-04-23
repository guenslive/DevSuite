App.shadow = {
    mode: "smooth",
    neuShape: "flat",
    neuLightDir: "tl",
    neuAutoColors: true,
    neuSize: "default",
    neuPressed: false,
    layers: [{ x: 0, y: 10, blur: 20, spread: 0, color: "#000000", opacity: 20, inset: false, id: 1 }],
    activeLayerIndex: 0,
    rafPending: false,

    _neuLightVectors: {
        tl: { dx: 1,  dy: 1,  gradDeg: 145 },
        t:  { dx: 0,  dy: 1,  gradDeg: 180 },
        tr: { dx: -1, dy: 1,  gradDeg: 215 },
        r:  { dx: -1, dy: 0,  gradDeg: 270 },
        br: { dx: -1, dy: -1, gradDeg: 325 },
        b:  { dx: 0,  dy: -1, gradDeg: 0   },
        bl: { dx: 1,  dy: -1, gradDeg: 35  },
        l:  { dx: 1,  dy: 0,  gradDeg: 90  }
    },

    _neuSizes: {
        default: { w: 140, h: 140, radiusScale: 1 },
        button:  { w: 140, h: 56,  radiusScale: 0.5 },
        card:    { w: 220, h: 140, radiusScale: 1 },
        circle:  { w: 120, h: 120, radiusScale: 10 },
        toggle:  { w: 120, h: 40,  radiusScale: 10 },
        avatar:  { w: 80,  h: 80,  radiusScale: 10 }
    },

    glassSize: "card",
    glassBgStyle: "vibrant",
    glassTopHighlight: false,
    glassType: "frosted",
    _liquidFilterId: "shadowLiquidGlassFilter",

    smoothLightDir: "t",
    smoothSize: "default",
    smoothLayerCount: 6,

    _smoothSizes: {
        default: { w: 140, h: 140, radius: 24, text: "" },
        button:  { w: 160, h: 52,  radius: 14, text: "Button" },
        card:    { w: 220, h: 140, radius: 18, text: "Card" },
        image:   { w: 200, h: 140, radius: 12, text: "" },
        hero:    { w: 280, h: 160, radius: 24, text: "Hero" },
        pill:    { w: 160, h: 44,  radius: 100, text: "Pill" }
    },

    _smoothElevations: {
        0:  { elev: 0,   blur: 0,   ints: 0  },
        1:  { elev: 6,   blur: 60,  ints: 12 },
        2:  { elev: 12,  blur: 70,  ints: 14 },
        3:  { elev: 20,  blur: 80,  ints: 18 },
        4:  { elev: 32,  blur: 90,  ints: 22 },
        5:  { elev: 48,  blur: 100, ints: 26 },
        6:  { elev: 72,  blur: 120, ints: 32 }
    },

    _glassSizes: {
        card:   { w: 220, h: 140, radius: 20, text: "Glass Card" },
        button: { w: 140, h: 50,  radius: 14, text: "Button" },
        modal:  { w: 280, h: 180, radius: 24, text: "Dialog" },
        navbar: { w: 280, h: 60,  radius: 30, text: "Navigation" },
        widget: { w: 180, h: 180, radius: 24, text: "Widget" },
        pill:   { w: 160, h: 44,  radius: 100, text: "Pill" }
    },

    _glassBgStyles: {
        vibrant: "linear-gradient(135deg, #ff006e 0%, #8338ec 35%, #3a86ff 70%, #06ffa5 100%)",
        sunset:  "linear-gradient(135deg, #f59e0b 0%, #ef4444 40%, #8b5cf6 100%)",
        ocean:   "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)",
        dark:    "radial-gradient(at 30% 30%, #1e1b4b 0%, #0f172a 60%, #020617 100%)",
        minimal: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        photo:   "linear-gradient(45deg, #fbbf24, #f472b6), radial-gradient(at top left, #38bdf8, transparent 50%), radial-gradient(at bottom right, #a78bfa, transparent 60%)"
    },

    _customGlassBgUrl: null,

    setGlassSize(size) {
        App.shadow.glassSize = size;
        document.querySelectorAll("#shGlassControls .glass-size-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("glassSize-" + size);
        if (btn) btn.classList.add("active");
        App.shadow.update();
    },

    setGlassBgStyle(style) {
        App.shadow.glassBgStyle = style;
        document.querySelectorAll("#shGlassControls .glass-bg-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("glassBg-" + style);
        if (btn) btn.classList.add("active");
        App.shadow._applyGlassBackground();
        App.shadow.update();
    },

    setSmoothLight(dir) {
        App.shadow.smoothLightDir = dir;
        document.querySelectorAll("#shSmoothLightGrid .neu-light-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("smoothLight-" + dir);
        if (btn) btn.classList.add("active");
        App.shadow.update();
    },

    setSmoothSize(size) {
        App.shadow.smoothSize = size;
        document.querySelectorAll("#shSmoothControls .smooth-size-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("smoothSize-" + size);
        if (btn) btn.classList.add("active");
        App.shadow.update();
    },

    applySmoothElevation(level) {
        const p = App.shadow._smoothElevations[level];
        if (!p) return;
        document.getElementById("shCtrl1").value = p.elev;
        document.getElementById("shCtrl2").value = 0;
        document.getElementById("shCtrl3").value = p.ints;
        document.getElementById("shCtrl4").value = p.blur;
        document.querySelectorAll("#shSmoothElevationRow .smooth-elev-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("smoothElev-" + level);
        if (btn) btn.classList.add("active");
        App.shadow.update();
    },

    setSmoothLayerCount(count) {
        App.shadow.smoothLayerCount = parseInt(count) || 6;
        const lbl = document.getElementById("valSmoothLayers");
        if (lbl) lbl.innerText = App.shadow.smoothLayerCount;
        App.shadow.update();
    },

    setGlassType(type) {
        App.shadow.glassType = type;
        document.querySelectorAll("#shGlassTypeRow .glass-type-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("glassType-" + type);
        if (btn) btn.classList.add("active");
        const liquidControls = document.getElementById("shGlassLiquidControls");
        if (liquidControls) liquidControls.style.display = type === "liquid" ? "block" : "none";
        if (type === "liquid") {
            const b = document.getElementById("glassBrightness");
            const sat = document.getElementById("shCtrl4");
            const rad = document.getElementById("glassRadius");
            if (b && parseInt(b.value) < 115) b.value = 125;
            if (sat && parseInt(sat.value) < 160) sat.value = 180;
            if (rad && parseInt(rad.value) < 24) rad.value = 32;
        }
        App.shadow.update();
    },

    _ensureLiquidFilter(distortion, liquidity) {
        const id = App.shadow._liquidFilterId;
        let svg = document.getElementById(id + "-svg");
        const baseFreq = (0.005 + (liquidity / 100) * 0.045).toFixed(4);
        const scale = distortion;
        const svgMarkup = `
            <filter id="${id}">
                <feTurbulence type="fractalNoise" baseFrequency="${baseFreq}" numOctaves="2" seed="8" result="noise"/>
                <feGaussianBlur in="noise" stdDeviation="2" result="blurred"/>
                <feDisplacementMap in="SourceGraphic" in2="blurred" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>
            </filter>`;
        if (!svg) {
            svg = document.createElement("div");
            svg.id = id + "-svg";
            svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;";
            svg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">${svgMarkup}</svg>`;
            document.body.appendChild(svg);
        } else {
            svg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">${svgMarkup}</svg>`;
        }
        return id;
    },

    _liquidFilterSnippet(distortion, liquidity) {
        const baseFreq = (0.005 + (liquidity / 100) * 0.045).toFixed(4);
        return `<!-- Añadir al body una sola vez (filtro SVG oculto) -->
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute">
  <filter id="liquidGlass">
    <feTurbulence type="fractalNoise" baseFrequency="${baseFreq}" numOctaves="2" seed="8" result="noise"/>
    <feGaussianBlur in="noise" stdDeviation="2" result="blurred"/>
    <feDisplacementMap in="SourceGraphic" in2="blurred" scale="${distortion}" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>`;
    },

    _applyGlassBackground() {
        const container = document.querySelector("#section-shadow .preview-container");
        if (!container) return;
        if (App.shadow.mode === 'glass') {
            let bg;
            if (App.shadow.glassBgStyle === 'custom' && App.shadow._customGlassBgUrl) {
                bg = `url("${App.shadow._customGlassBgUrl}")`;
            } else {
                bg = App.shadow._glassBgStyles[App.shadow.glassBgStyle] || App.shadow._glassBgStyles.vibrant;
            }
            container.style.backgroundImage = bg;
            container.style.backgroundColor = "";
        } else {
            container.style.backgroundImage = "";
        }
    },

    triggerGlassBgUpload() {
        const input = document.getElementById("glassBgFileInput");
        if (input) input.click();
    },

    handleGlassBgUpload(evt) {
        const file = evt.target.files && evt.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            App.shadow._customGlassBgUrl = e.target.result;
            const thumb = document.getElementById("glassBg-custom");
            if (thumb) {
                thumb.style.backgroundImage = `url("${e.target.result}")`;
                thumb.style.backgroundSize = "cover";
                thumb.style.backgroundPosition = "center";
                thumb.querySelector(".glass-bg-custom-icon")?.remove();
            }
            App.shadow.setGlassBgStyle("custom");
        };
        reader.readAsDataURL(file);
        evt.target.value = "";
    },

    setNeuShape(shape) {
        App.shadow.neuShape = shape;
        document.querySelectorAll("#shNeuControls .neu-shape-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("neu" + shape.charAt(0).toUpperCase() + shape.slice(1));
        if(btn) btn.classList.add("active");
        App.shadow.update();
    },

    setNeuLight(dir) {
        App.shadow.neuLightDir = dir;
        document.querySelectorAll("#shNeuLightGrid .neu-light-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("neuLight-" + dir);
        if (btn) btn.classList.add("active");
        App.shadow.update();
    },

    setNeuSize(size) {
        App.shadow.neuSize = size;
        document.querySelectorAll("#shNeuControls .neu-size-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("neuSize-" + size);
        if (btn) btn.classList.add("active");
        App.shadow.update();
    },

    toggleNeuAuto() {
        App.shadow.neuAutoColors = document.getElementById("shNeuAutoColors").checked;
        const colGroup = document.getElementById("shShadowColorGroup");
        if (colGroup) colGroup.style.opacity = App.shadow.neuAutoColors ? "0.4" : "1";
        App.shadow.update();
    },

    toggleNeuPressed() {
        App.shadow.neuPressed = !App.shadow.neuPressed;
        App.shadow.update();
    },

    setMode(mode) {
        App.shadow.mode = mode;
        document.querySelectorAll("#section-shadow .blob-type-btn").forEach((b) => {
            if(b.parentElement.id !== "shNeuControls") b.classList.remove("active");
        });
        const btn = document.getElementById("mode" + mode.charAt(0).toUpperCase() + mode.slice(1));
        if(btn) btn.classList.add("active");
        
        const ranges = {
            smooth: [{ min: 0, max: 100 }, { min: -100, max: 100 }, { min: 0, max: 100 }, { min: 0, max: 200 }],
            neu: [{ min: 0, max: 100 }, { min: 0, max: 100 }, { min: 0, max: 100 }, { min: 0, max: 100 }],
            glass: [{ min: 0, max: 50 }, { min: 0, max: 100 }, { min: 0, max: 100 }, { min: 0, max: 200 }],
            multiple: [{ min: -100, max: 100 }, { min: -100, max: 100 }, { min: 0, max: 100 }, { min: -50, max: 50 }]
        };
        for(let i=1; i<=4; i++) {
            const sl = document.getElementById(`shCtrl${i}`);
            if(ranges[mode]) { sl.min = ranges[mode][i-1].min; sl.max = ranges[mode][i-1].max; }
        }

        const layersCtrl = document.getElementById("shadowLayersControl");
        if (mode === "multiple") {
            layersCtrl.style.display = "block";
            App.shadow.renderLayers();
            App.shadow.loadLayerValues();
        } else {
            layersCtrl.style.display = "none";
        }

        // Defaults per mode
        if (mode === "glass") {
            document.getElementById("shCtrl1").value = 16; document.getElementById("shCtrl2").value = 60;
            document.getElementById("shCtrl3").value = 40; document.getElementById("shCtrl4").value = 180;
            App.syncProPicker("shBg", "#333333"); App.syncProPicker("shObj", "#FFFFFF");
        } else if (mode === "neu") {
            document.getElementById("shCtrl1").value = 20; document.getElementById("shCtrl2").value = 40;
            document.getElementById("shCtrl3").value = 15; document.getElementById("shCtrl4").value = 50;
            App.syncProPicker("shBg", "#e0e5ec"); App.syncProPicker("shObj", "#e0e5ec"); App.syncProPicker("shCol", "#a3b1c6");
        } else if (mode === "multiple") {
            App.syncProPicker("shBg", "#f2f2f7"); App.syncProPicker("shObj", "#ffffff");
        } else {
            document.getElementById("shCtrl1").value = 50; document.getElementById("shCtrl2").value = 0;
            document.getElementById("shCtrl3").value = 20; document.getElementById("shCtrl4").value = 100;
            App.syncProPicker("shBg", "#f2f2f7"); App.syncProPicker("shObj", "#ffffff"); App.syncProPicker("shCol", "#000000");
        }

        // Labels update
        const labels = {
            smooth: ["Elevación", "Offset X", "Intensidad", "Difusión (Blur)"],
            neu: ["Distancia", "Blur / Suavidad", "Intensidad", "Redondez (Radio)"],
            glass: ["Blur (Fondo)", "Transparencia", "Borde Opacidad", "Saturación"],
            multiple: ["Offset X", "Offset Y", "Blur", "Spread"]
        };
        for (let i = 1; i <= 4; i++) document.getElementById(`lblCtrl${i}`).innerText = labels[mode][i - 1];

        document.getElementById("shInsetGroup").style.display = (mode === "smooth" || mode === "multiple") ? "flex" : "none";

        const glassCtrl = document.getElementById("shGlassControls");
        if(glassCtrl) glassCtrl.style.display = (mode === "glass") ? "block" : "none";

        const neuCtrl = document.getElementById("shNeuControls");
        if(neuCtrl) neuCtrl.style.display = (mode === "neu") ? "block" : "none";

        const smoothCtrl = document.getElementById("shSmoothControls");
        if (smoothCtrl) smoothCtrl.style.display = (mode === "smooth") ? "block" : "none";

        if (mode === "smooth") {
            document.querySelectorAll("#shSmoothControls .smooth-size-btn").forEach(b => b.classList.remove("active"));
            const ssBtn = document.getElementById("smoothSize-" + App.shadow.smoothSize);
            if (ssBtn) ssBtn.classList.add("active");
            document.querySelectorAll("#shSmoothLightGrid .neu-light-btn").forEach(b => b.classList.remove("active"));
            const slBtn = document.getElementById("smoothLight-" + App.shadow.smoothLightDir);
            if (slBtn) slBtn.classList.add("active");
        }

        if (mode === "neu") {
            App.shadow.neuPressed = false;
            const autoCheck = document.getElementById("shNeuAutoColors");
            if (autoCheck) {
                autoCheck.checked = App.shadow.neuAutoColors;
                const colGroup = document.getElementById("shShadowColorGroup");
                if (colGroup) colGroup.style.opacity = App.shadow.neuAutoColors ? "0.4" : "1";
            }
            document.querySelectorAll("#shNeuLightGrid .neu-light-btn").forEach(b => b.classList.remove("active"));
            const lightBtn = document.getElementById("neuLight-" + App.shadow.neuLightDir);
            if (lightBtn) lightBtn.classList.add("active");
            document.querySelectorAll("#shNeuControls .neu-size-btn").forEach(b => b.classList.remove("active"));
            const sizeBtn = document.getElementById("neuSize-" + App.shadow.neuSize);
            if (sizeBtn) sizeBtn.classList.add("active");
            document.querySelectorAll("#shNeuControls .neu-shape-btn").forEach(b => b.classList.remove("active"));
            const shapeBtn = document.getElementById("neu" + App.shadow.neuShape.charAt(0).toUpperCase() + App.shadow.neuShape.slice(1));
            if (shapeBtn) shapeBtn.classList.add("active");
        }

        const lblObj = document.getElementById("lblColorObject"), lblShd = document.getElementById("lblColorShadow");
        if (mode === "glass") { lblObj.innerText = "Tint Vidrio"; lblShd.innerText = "Borde/Sombra"; }
        else if (mode === "neu") { lblObj.innerText = "Color Base"; lblShd.innerText = "Tint Sombra"; }
        else if (mode === "multiple") { lblObj.innerText = "Color Objeto"; lblShd.innerText = "Color Capa Activa"; }
        else { lblObj.innerText = "Color Objeto"; lblShd.innerText = "Color Sombra"; }

        const container = document.getElementById("shadowPreviewContainer");
        if (mode === "glass") {
            container.classList.add("glass-bg-decoration");
            App.shadow._applyGlassBackground();
            document.querySelectorAll("#shGlassControls .glass-size-btn").forEach(b => b.classList.remove("active"));
            const gsBtn = document.getElementById("glassSize-" + App.shadow.glassSize);
            if (gsBtn) gsBtn.classList.add("active");
            document.querySelectorAll("#shGlassControls .glass-bg-btn").forEach(b => b.classList.remove("active"));
            const gbBtn = document.getElementById("glassBg-" + App.shadow.glassBgStyle);
            if (gbBtn) gbBtn.classList.add("active");
            document.querySelectorAll("#shGlassTypeRow .glass-type-btn").forEach(b => b.classList.remove("active"));
            const gtBtn = document.getElementById("glassType-" + App.shadow.glassType);
            if (gtBtn) gtBtn.classList.add("active");
            const liquidControls = document.getElementById("shGlassLiquidControls");
            if (liquidControls) liquidControls.style.display = App.shadow.glassType === "liquid" ? "block" : "none";
        } else {
            container.classList.remove("glass-bg-decoration");
            container.style.backgroundImage = "";
        }
        App.shadow.update();
    },
    addLayer() {
        App.shadow.layers.push({ x: 5, y: 5, blur: 10, spread: 0, color: "#000000", opacity: 20, inset: false, visible: true, id: Date.now() });
        App.shadow.activeLayerIndex = App.shadow.layers.length - 1;
        App.shadow.renderLayers();
        App.shadow.loadLayerValues();
        App.shadow.update();
    },

    duplicateLayer(index) {
        const src = App.shadow.layers[index];
        if (!src) return;
        const copy = Object.assign({}, src, { id: Date.now() + Math.floor(Math.random() * 1000) });
        App.shadow.layers.splice(index + 1, 0, copy);
        App.shadow.activeLayerIndex = index + 1;
        App.shadow.renderLayers();
        App.shadow.loadLayerValues();
        App.shadow.update();
    },

    toggleLayerVisibility(index) {
        const layer = App.shadow.layers[index];
        if (!layer) return;
        layer.visible = !(layer.visible !== false);
        App.shadow.renderLayers();
        App.shadow.update();
    },

    randomizeMultiple() {
        const count = 2 + Math.floor(Math.random() * 3);
        const palette = ["#000000", "#007aff", "#34c759", "#ff2d55", "#af52de", "#ff9500"];
        App.shadow.layers = [];
        for (let i = 0; i < count; i++) {
            App.shadow.layers.push({
                x: Math.floor(Math.random() * 40) - 20,
                y: Math.floor(Math.random() * 40) - 10,
                blur: 5 + Math.floor(Math.random() * 40),
                spread: Math.floor(Math.random() * 10) - 3,
                color: palette[Math.floor(Math.random() * palette.length)],
                opacity: 15 + Math.floor(Math.random() * 50),
                inset: Math.random() < 0.15,
                visible: true,
                id: Date.now() + i
            });
        }
        App.shadow.activeLayerIndex = 0;
        App.shadow.renderLayers();
        App.shadow.loadLayerValues();
        App.shadow.update();
    },

    clearLayers() {
        App.shadow.layers = [{ x: 0, y: 4, blur: 12, spread: 0, color: "#000000", opacity: 15, inset: false, visible: true, id: Date.now() }];
        App.shadow.activeLayerIndex = 0;
        App.shadow.renderLayers();
        App.shadow.loadLayerValues();
        App.shadow.update();
    },

    _multiplePresets: {
        "ios-card": [
            { x: 0, y: 1, blur: 2,  spread: 0, color: "#000000", opacity: 8,  inset: false },
            { x: 0, y: 8, blur: 24, spread: 0, color: "#000000", opacity: 12, inset: false }
        ],
        "material-24": [
            { x: 0, y: 11, blur: 15, spread: -7, color: "#000000", opacity: 20, inset: false },
            { x: 0, y: 24, blur: 38, spread: 3,  color: "#000000", opacity: 14, inset: false },
            { x: 0, y: 9,  blur: 46, spread: 8,  color: "#000000", opacity: 12, inset: false }
        ],
        "neon-cyan": [
            { x: 0, y: 0, blur: 4,  spread: 0, color: "#00d9ff", opacity: 80, inset: false },
            { x: 0, y: 0, blur: 12, spread: 0, color: "#00d9ff", opacity: 50, inset: false },
            { x: 0, y: 0, blur: 28, spread: 4, color: "#00d9ff", opacity: 25, inset: false }
        ],
        "long-flat": [
            { x: 2,  y: 2,  blur: 0, spread: 0, color: "#000000", opacity: 15, inset: false },
            { x: 4,  y: 4,  blur: 0, spread: 0, color: "#000000", opacity: 12, inset: false },
            { x: 6,  y: 6,  blur: 0, spread: 0, color: "#000000", opacity: 10, inset: false },
            { x: 8,  y: 8,  blur: 0, spread: 0, color: "#000000", opacity: 8,  inset: false },
            { x: 10, y: 10, blur: 0, spread: 0, color: "#000000", opacity: 6,  inset: false }
        ],
        "sticker": [
            { x: 0, y: 6, blur: 0, spread: 0, color: "#000000", opacity: 100, inset: false }
        ],
        "double-inset": [
            { x: 0, y: 2,  blur: 4,  spread: 0, color: "#000000", opacity: 20, inset: true },
            { x: 0, y: -2, blur: 4,  spread: 0, color: "#ffffff", opacity: 60, inset: true }
        ],
        "bloom": [
            { x: 0, y: 0,  blur: 20, spread: 0, color: "#ff006e", opacity: 60, inset: false },
            { x: 0, y: 0,  blur: 40, spread: 4, color: "#8338ec", opacity: 40, inset: false },
            { x: 0, y: 10, blur: 30, spread: 0, color: "#3a86ff", opacity: 30, inset: false }
        ],
        "beveled": [
            { x: 0, y: 1,  blur: 0, spread: 0, color: "#ffffff", opacity: 60, inset: true },
            { x: 0, y: -1, blur: 0, spread: 0, color: "#000000", opacity: 20, inset: true },
            { x: 0, y: 3,  blur: 6, spread: 0, color: "#000000", opacity: 15, inset: false }
        ]
    },

    applyMultiplePreset(name) {
        const preset = App.shadow._multiplePresets[name];
        if (!preset) return;
        App.shadow.layers = preset.map((l, i) => Object.assign({}, l, { visible: true, id: Date.now() + i }));
        App.shadow.activeLayerIndex = 0;
        App.shadow.renderLayers();
        App.shadow.loadLayerValues();
        App.shadow.update();
        document.querySelectorAll("#shMultiplePresetsRow .multiple-preset-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("mulPreset-" + name);
        if (btn) btn.classList.add("active");
    },
    removeLayer(index) {
        if (App.shadow.layers.length <= 1) return;
        App.shadow.layers.splice(index, 1);
        if (App.shadow.activeLayerIndex >= App.shadow.layers.length) App.shadow.activeLayerIndex = App.shadow.layers.length - 1;
        App.shadow.renderLayers();
        App.shadow.loadLayerValues();
        App.shadow.update();
    },
    selectLayer(index) {
        App.shadow.activeLayerIndex = index;
        App.shadow.renderLayers();
        App.shadow.loadLayerValues();
    },
    renderLayers() {
        const container = document.getElementById("shadowLayersList");
        container.innerHTML = "";
        App.shadow.layers.forEach((layer, index) => {
            const row = document.createElement("div");
            row.className = "stop-row multiple-layer-row";
            row.style.cursor = "pointer";
            row.onclick = () => App.shadow.selectLayer(index);
            const isActive = index === App.shadow.activeLayerIndex;
            const isVisible = layer.visible !== false;
            if (isActive) { row.style.borderColor = "var(--apple-blue)"; row.style.backgroundColor = "rgba(0, 122, 255, 0.05)"; }
            if (!isVisible) { row.style.opacity = "0.45"; }
            row.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
                <div style="width:24px; height:24px; border-radius:4px; background:${layer.color}; border:1px solid rgba(0,0,0,0.1); flex-shrink:0;"></div>
                <div style="display:flex; flex-direction:column; min-width:0;">
                    <span style="font-size:0.8rem; font-weight:700; color:${isActive ? 'var(--apple-blue)' : 'var(--text-primary)'}">Capa ${index + 1}</span>
                    <span style="font-size:0.65rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${layer.x}px ${layer.y}px ${layer.blur}px ${layer.inset ? '(Inset)' : ''}</span>
                </div>
            </div>
            <div class="layer-actions" onclick="event.stopPropagation()">
                <button class="layer-action-btn" title="${isVisible ? 'Ocultar' : 'Mostrar'}" onclick="App.shadow.toggleLayerVisibility(${index})">
                    ${isVisible
                        ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
                        : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`}
                </button>
                <button class="layer-action-btn" title="Duplicar" onclick="App.shadow.duplicateLayer(${index})">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button class="btn-del-stop layer-action-btn" title="Eliminar" onclick="App.shadow.removeLayer(${index})" ${App.shadow.layers.length <= 1 ? "disabled" : ""}>&times;</button>
            </div>
            `;
            container.appendChild(row);
        });
    },
    loadLayerValues() {
        const layer = App.shadow.layers[App.shadow.activeLayerIndex];
        document.getElementById("shCtrl1").value = layer.x;
        document.getElementById("shCtrl2").value = layer.y;
        document.getElementById("shCtrl3").value = layer.blur;
        document.getElementById("shCtrl4").value = layer.spread;
        document.getElementById("valCtrl1").innerText = layer.x;
        document.getElementById("valCtrl2").innerText = layer.y;
        document.getElementById("valCtrl3").innerText = layer.blur;
        document.getElementById("valCtrl4").innerText = layer.spread;
        document.getElementById("shInset").checked = layer.inset;
        App.syncProPicker('shCol', layer.color);
    },
    update() {
        if (App.shadow.rafPending) return;
        App.shadow.rafPending = true;
        requestAnimationFrame(() => {
        App.shadow._performUpdate();
        App.shadow.rafPending = false;
        });
    },
    _performUpdate() {
        const v1 = parseFloat(document.getElementById("shCtrl1").value);
        const v2 = parseFloat(document.getElementById("shCtrl2").value);
        const v3 = parseFloat(document.getElementById("shCtrl3").value);
        const v4 = parseFloat(document.getElementById("shCtrl4").value);
        const colShadow = document.getElementById("shColColor").value;
        const colObject = document.getElementById("shObjColor").value;
        const rgbShadow = App.utils.hexToRgb(colShadow);
        const rgbObject = App.utils.hexToRgb(colObject);
        const box = document.getElementById("shadowPreviewBox");
        const resultBox = document.getElementById("shadowResult");
        let css = "";
        const centerStyles = "display:flex; justify-content:center; align-items:center;";

        document.getElementById("valCtrl1").innerText = v1; document.getElementById("valCtrl2").innerText = v2;
        document.getElementById("valCtrl3").innerText = v3; document.getElementById("valCtrl4").innerText = v4;

        if (App.shadow.mode === "multiple") {
            const layer = App.shadow.layers[App.shadow.activeLayerIndex];
            layer.x = v1; layer.y = v2; layer.blur = v3; layer.spread = v4;
            layer.color = colShadow; layer.inset = document.getElementById("shInset").checked;
            App.shadow.renderLayers();
            const visibleLayers = App.shadow.layers.filter(l => l.visible !== false);
            const shadowCss = visibleLayers.length
                ? visibleLayers.map(l => {
                    const rgb = App.utils.hexToRgb(l.color) || { r: 0, g: 0, b: 0 };
                    const alpha = (l.opacity != null ? l.opacity : 100) / 100;
                    const col = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`;
                    return `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${col}`;
                }).join(",\n  ")
                : "none";
            css = `background-color: ${colObject};\nbox-shadow:\n  ${shadowCss};`;
            box.style = `${css} width: 140px; height: 140px; border-radius: 24px; color: transparent; ${centerStyles}`;
            box.innerText = "";
        } else if (App.shadow.mode === "smooth") {
            const elev = v1, offX = v2, ints = v3 / 100, blurF = v4 / 100;
            const inset = document.getElementById("shInset").checked;
            const lightKey = App.shadow.smoothLightDir || "t";
            const lightVec = App.shadow._neuLightVectors[lightKey] || { dx: 0, dy: 1 };
            const sizeKey = App.shadow.smoothSize || "default";
            const sizePreset = App.shadow._smoothSizes[sizeKey] || App.shadow._smoothSizes.default;
            const layerCount = Math.max(2, Math.min(12, App.shadow.smoothLayerCount || 6));

            const layers = [];
            for (let i = 1; i <= layerCount; i++) {
                const p = i / layerCount;
                const baseX = (offX * p) + (lightVec.dx * -elev * p * 0.6);
                const baseY = (elev * p) * (lightVec.dy === 0 ? 0.2 : lightVec.dy * -1);
                const b = (elev * p * 2 * blurF).toFixed(1);
                const a = (ints * (1 - p * 0.5)).toFixed(3);
                layers.push(`${inset ? "inset " : ""}${baseX.toFixed(1)}px ${(-baseY).toFixed(1)}px ${b}px rgba(${rgbShadow.r}, ${rgbShadow.g}, ${rgbShadow.b}, ${a})`);
            }

            css = `background-color: ${colObject};\nbox-shadow:\n  ${layers.join(",\n  ")};`;
            const textColor = sizePreset.text ? (App.utils.getLuminance(rgbObject.r, rgbObject.g, rgbObject.b) > 0.5 ? "#1c1c1e" : "#f2f2f7") : "transparent";
            box.style = `${css} width: ${sizePreset.w}px; height: ${sizePreset.h}px; border-radius: ${sizePreset.radius}px; color: ${textColor}; font-weight: 600; ${centerStyles}`;
            box.style.transform = inset ? "scale(1)" : `scale(${1 + elev / 1500})`;
            box.innerText = sizePreset.text;
        } else if (App.shadow.mode === "neu") {
            const dist = v1, blur = v2, intensity = v3 / 100, radius = v4;
            const shape = App.shadow.neuShape || 'flat';
            const lightKey = App.shadow.neuLightDir || 'tl';
            const lightVec = App.shadow._neuLightVectors[lightKey];
            const sizeKey = App.shadow.neuSize || 'default';
            const sizePreset = App.shadow._neuSizes[sizeKey];

            let darkColor, lightColor;
            if (App.shadow.neuAutoColors) {
                darkColor = App.utils.adjustColor(colObject, -35);
                lightColor = App.utils.adjustColor(colObject, 35);
            } else {
                darkColor = colShadow;
                lightColor = "#ffffff";
            }
            const rgbDark = App.utils.hexToRgb(darkColor) || { r: 0, g: 0, b: 0 };
            const rgbLight = App.utils.hexToRgb(lightColor) || { r: 255, g: 255, b: 255 };
            const shadowDark = `rgba(${rgbDark.r}, ${rgbDark.g}, ${rgbDark.b}, ${intensity.toFixed(2)})`;
            const shadowLight = `rgba(${rgbLight.r}, ${rgbLight.g}, ${rgbLight.b}, ${(intensity * 0.9).toFixed(2)})`;

            const dx = lightVec.dx * dist;
            const dy = lightVec.dy * dist;
            const isPressed = (shape === 'pressed') || (shape !== 'floating' && App.shadow.neuPressed);

            let bgCSS = colObject;
            if (shape === 'concave') {
                bgCSS = `linear-gradient(${lightVec.gradDeg}deg, ${App.utils.adjustColor(colObject, -15)}, ${App.utils.adjustColor(colObject, 15)})`;
            } else if (shape === 'convex') {
                bgCSS = `linear-gradient(${lightVec.gradDeg}deg, ${App.utils.adjustColor(colObject, 15)}, ${App.utils.adjustColor(colObject, -15)})`;
            }

            let shadowCSS;
            if (isPressed) {
                shadowCSS = `inset ${dx}px ${dy}px ${blur}px ${shadowDark}, inset ${-dx}px ${-dy}px ${blur}px ${shadowLight}`;
            } else if (shape === 'floating') {
                const bigBlur = blur * 1.4;
                shadowCSS = `${dx * 1.5}px ${dy * 1.5}px ${bigBlur}px ${shadowDark}, ${-dx * 0.3}px ${-dy * 0.3}px ${blur * 0.6}px ${shadowLight}`;
            } else if (shape === 'elevated') {
                shadowCSS = `${dx * 0.6}px ${dy * 0.6}px ${blur * 0.8}px ${shadowDark}, ${dx * 1.2}px ${dy * 1.2}px ${blur * 1.3}px ${shadowDark}, ${-dx}px ${-dy}px ${blur}px ${shadowLight}`;
            } else {
                shadowCSS = `${dx}px ${dy}px ${blur}px ${shadowDark}, ${-dx}px ${-dy}px ${blur}px ${shadowLight}`;
            }

            const effectiveRadius = sizeKey === 'circle' || sizeKey === 'toggle' || sizeKey === 'avatar'
                ? Math.round(sizePreset.h / 2)
                : radius;

            const luminance = App.utils.getLuminance(rgbObject.r, rgbObject.g, rgbObject.b);
            const textColor = luminance > 0.5 ? "#1c1c1e" : "#f2f2f7";

            css = `background: ${bgCSS};\nborder-radius: ${effectiveRadius}px;\nbox-shadow: ${shadowCSS};`;
            box.style = `${css} width: ${sizePreset.w}px; height: ${sizePreset.h}px; border:none; color: ${textColor}; cursor: pointer; transition: all 0.2s ease; ${centerStyles}`;
            box.onclick = () => App.shadow.toggleNeuPressed();
            box.innerText = sizeKey === 'toggle' ? "●" : (sizeKey === 'avatar' || sizeKey === 'circle' ? "A" : "Soft UI");
        } else if (App.shadow.mode === "glass") {
            const blurVal = v1, opacity = v2 / 100, borderOp = v3 / 100, sat = v4;
            const rgbaBg = `rgba(${rgbObject.r}, ${rgbObject.g}, ${rgbObject.b}, ${opacity})`;

            const noiseVal = document.getElementById("glassNoise") ? parseInt(document.getElementById("glassNoise").value) : 0;
            if(document.getElementById("valGlassNoise")) document.getElementById("valGlassNoise").innerText = noiseVal + "%";
            const shineActive = document.getElementById("glassShine") ? document.getElementById("glassShine").checked : false;
            const topHighlight = document.getElementById("glassTopHighlight") ? document.getElementById("glassTopHighlight").checked : false;
            const brightness = document.getElementById("glassBrightness") ? parseInt(document.getElementById("glassBrightness").value) : 110;
            if (document.getElementById("valGlassBrightness")) document.getElementById("valGlassBrightness").innerText = brightness + "%";
            const radiusInput = document.getElementById("glassRadius");
            const customRadius = radiusInput ? parseInt(radiusInput.value) : null;
            if (document.getElementById("valGlassRadius") && customRadius != null) document.getElementById("valGlassRadius").innerText = customRadius + "px";
            const textInput = document.getElementById("glassText");
            const customText = textInput ? textInput.value : "";
            const isLiquid = App.shadow.glassType === "liquid";
            const distortion = document.getElementById("glassDistortion") ? parseInt(document.getElementById("glassDistortion").value) : 25;
            const liquidity = document.getElementById("glassLiquidity") ? parseInt(document.getElementById("glassLiquidity").value) : 30;
            if (document.getElementById("valGlassDistortion")) document.getElementById("valGlassDistortion").innerText = distortion;
            if (document.getElementById("valGlassLiquidity")) document.getElementById("valGlassLiquidity").innerText = liquidity + "%";

            const sizeKey = App.shadow.glassSize || 'card';
            const sizePreset = App.shadow._glassSizes[sizeKey] || App.shadow._glassSizes.card;
            const radius = customRadius != null ? customRadius : sizePreset.radius;

            let bgCSS = rgbaBg;
            let borderCSS = `1px solid rgba(255, 255, 255, ${borderOp})`;
            let topHighlightShadow = "";

            const noiseSVG = noiseVal > 0
                ? `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${noiseVal/100}'/%3E%3C/svg%3E`
                : null;

            if (shineActive) {
                borderCSS = "1px solid transparent";
                const gradBorder = `linear-gradient(135deg, rgba(255,255,255, ${Math.min(1, borderOp + 0.4)}), rgba(255,255,255, ${Math.max(0, borderOp - 0.1)})) border-box`;
                bgCSS = noiseSVG
                    ? `url("${noiseSVG}"), linear-gradient(${rgbaBg}, ${rgbaBg}) padding-box, ${gradBorder}`
                    : `linear-gradient(${rgbaBg}, ${rgbaBg}) padding-box, ${gradBorder}`;
            } else if (noiseSVG) {
                bgCSS = `url("${noiseSVG}"), ${rgbaBg}`;
            }

            if (topHighlight || isLiquid) {
                const topOp = isLiquid ? Math.min(1, borderOp + 0.55) : Math.min(1, borderOp + 0.3);
                topHighlightShadow = `, inset 0 1px 0 0 rgba(255, 255, 255, ${topOp.toFixed(2)})`;
            }
            let liquidBottomShadow = "";
            if (isLiquid) {
                liquidBottomShadow = `, inset 0 -2px 8px 0 rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.22)`;
            }

            const baseFilter = `blur(${blurVal}px) saturate(${sat}%) brightness(${brightness}%)`;
            const exportFilter = isLiquid ? `url(#liquidGlass) ${baseFilter} contrast(110%)` : baseFilter;
            let previewFilter = baseFilter;
            if (isLiquid) {
                const runtimeId = App.shadow._ensureLiquidFilter(distortion, liquidity);
                previewFilter = `url(#${runtimeId}) ${baseFilter} contrast(110%)`;
            }

            const shadowLine = `box-shadow: 0 8px 32px 0 rgba(${rgbShadow.r}, ${rgbShadow.g}, ${rgbShadow.b}, 0.15)${topHighlightShadow}${liquidBottomShadow};`;

            const buildCss = (filterStr) => `background: ${bgCSS};
backdrop-filter: ${filterStr};
-webkit-backdrop-filter: ${filterStr};
border: ${borderCSS};
border-radius: ${radius}px;
${shadowLine}`;

            css = buildCss(exportFilter);
            const runtimeCss = buildCss(previewFilter);

            const luminance = App.utils.getLuminance(rgbObject.r, rgbObject.g, rgbObject.b);
            const textColor = luminance > 0.6 ? "#1c1c1e" : "#ffffff";

            box.style = `${runtimeCss} width: ${sizePreset.w}px; height: ${sizePreset.h}px; color: ${textColor}; font-weight: 600; ${centerStyles}`;
            box.innerText = customText || sizePreset.text;

            if (isLiquid) {
                css = App.shadow._liquidFilterSnippet(distortion, liquidity) + "\n\n" + css;
            }
        }
        resultBox.innerText = css;
    },
    updateBg() {
        const container = document.querySelector("#section-shadow .preview-container");
        if (!container) return;
        if (App.shadow.mode === 'glass') {
            App.shadow._applyGlassBackground();
            return;
        }
        const bgColor = App.shadow.mode === 'neu'
            ? document.getElementById("shObjColor").value
            : document.getElementById("shBgColor").value;
        container.style.backgroundImage = "";
        container.style.backgroundColor = bgColor;
    },
    
    /* --- FAVORITES SYSTEM --- */
    favorites: [],
    
    initFavorites() {
        const stored = localStorage.getItem('shadowFavorites');
        if (stored) {
            try {
                this.favorites = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse shadow favorites", e);
                this.favorites = [];
            }
        }
        this.renderFavorites();
    },

    async saveFavorite() {
        const defaultName = "Mi Sombra " + (this.favorites.length + 1);
        const name = await App.core.modal.prompt("Nombre de la configuración", defaultName);
        if (!name) return;

        const config = {
            name: name,
            mode: this.mode,
            values: [
                document.getElementById("shCtrl1").value,
                document.getElementById("shCtrl2").value,
                document.getElementById("shCtrl3").value,
                document.getElementById("shCtrl4").value
            ],
            colors: {
                shadow: document.getElementById("shColColor").value,
                object: document.getElementById("shObjColor").value,
                bg: document.getElementById("shBgColor").value
            },
            extra: {
                inset: document.getElementById("shInset").checked,
                neuShape: this.neuShape,
                glassNoise: document.getElementById("glassNoise") ? document.getElementById("glassNoise").value : 0,
                glassShine: document.getElementById("glassShine") ? document.getElementById("glassShine").checked : false
            },
            layers: JSON.parse(JSON.stringify(this.layers)) // Deep copy
        };

        this.favorites.push(config);
        localStorage.setItem('shadowFavorites', JSON.stringify(this.favorites));
        this.renderFavorites();
    },

    loadFavorite(index) {
        const config = this.favorites[index];
        if (!config) return;

        // Set Mode
        this.setMode(config.mode);

        // Restore Values
        document.getElementById("shCtrl1").value = config.values[0];
        document.getElementById("shCtrl2").value = config.values[1];
        document.getElementById("shCtrl3").value = config.values[2];
        document.getElementById("shCtrl4").value = config.values[3];

        // Restore Colors
        App.syncProPicker("shCol", config.colors.shadow);
        App.syncProPicker("shObj", config.colors.object);
        App.syncProPicker("shBg", config.colors.bg);

        // Restore Extras
        if (document.getElementById("shInset")) document.getElementById("shInset").checked = config.extra.inset;
        if (config.mode === 'neu' && config.extra.neuShape) this.setNeuShape(config.extra.neuShape);
        if (config.mode === 'glass') {
            if (document.getElementById("glassNoise")) document.getElementById("glassNoise").value = config.extra.glassNoise;
            if (document.getElementById("glassShine")) document.getElementById("glassShine").checked = config.extra.glassShine;
        }

        // Restore Layers if multiple
        if (config.mode === 'multiple' && config.layers) {
            this.layers = JSON.parse(JSON.stringify(config.layers));
            this.activeLayerIndex = 0;
            this.renderLayers();
            this.loadLayerValues(); // This might overwrite the slider values we just set, which is correct for multiple mode
        }

        this.update();
        this.updateBg();
    },

    async deleteFavorite(index) {
        const confirmed = await App.core.modal.confirm("Eliminar Configuración", "¿Estás seguro de que quieres eliminar esta sombra guardada?");
        if (confirmed) {
            this.favorites.splice(index, 1);
            localStorage.setItem('shadowFavorites', JSON.stringify(this.favorites));
            this.renderFavorites();
        }
    },

    renderFavorites() {
        const container = document.getElementById("shadowFavoritesList");
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); font-size: 0.9rem; padding: 20px;">No hay configuraciones guardadas.</div>`;
            return;
        }

        container.innerHTML = this.favorites.map((fav, index) => {
            // Generate a mini preview style
            let previewStyle = "";
            if (fav.mode === 'smooth' || fav.mode === 'neu') {
                previewStyle = `background-color: ${fav.colors.object}; box-shadow: 0 2px 5px rgba(0,0,0,0.2);`; 
                // Note: Generating the full shadow CSS for preview is complex, so we use a simple placeholder or try to approximate
                // Let's just show the object color
            } else if (fav.mode === 'glass') {
                previewStyle = `background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5);`;
            } else {
                previewStyle = `background-color: ${fav.colors.object};`;
            }

            return `
            <div class="favorite-item" onclick="App.shadow.loadFavorite(${index})">
                <div class="favorite-preview">
                    <div class="favorite-preview-inner" style="${previewStyle}"></div>
                </div>
                <div class="favorite-info">
                    <span class="favorite-name">${fav.name}</span>
                    <button class="favorite-delete" onclick="event.stopPropagation(); App.shadow.deleteFavorite(${index})">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }
};
