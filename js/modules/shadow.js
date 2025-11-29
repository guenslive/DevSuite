App.shadow = {
    mode: "smooth",
    neuShape: "flat",
    layers: [{ x: 0, y: 10, blur: 20, spread: 0, color: "#000000", opacity: 20, inset: false, id: 1 }],
    activeLayerIndex: 0,
    rafPending: false,

    setNeuShape(shape) {
        App.shadow.neuShape = shape;
        document.querySelectorAll("#shNeuControls .blob-type-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("neu" + shape.charAt(0).toUpperCase() + shape.slice(1));
        if(btn) btn.classList.add("active");
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

        const lblObj = document.getElementById("lblColorObject"), lblShd = document.getElementById("lblColorShadow");
        if (mode === "glass") { lblObj.innerText = "Tint Vidrio"; lblShd.innerText = "Borde/Sombra"; }
        else if (mode === "neu") { lblObj.innerText = "Color Base"; lblShd.innerText = "Tint Sombra"; }
        else if (mode === "multiple") { lblObj.innerText = "Color Objeto"; lblShd.innerText = "Color Capa Activa"; }
        else { lblObj.innerText = "Color Objeto"; lblShd.innerText = "Color Sombra"; }

        const container = document.getElementById("shadowPreviewContainer");
        if (mode === "glass") container.classList.add("glass-bg-decoration"); else container.classList.remove("glass-bg-decoration");
        App.shadow.update();
    },
    addLayer() {
        App.shadow.layers.push({ x: 5, y: 5, blur: 10, spread: 0, color: "#000000", opacity: 20, inset: false, id: Date.now() });
        App.shadow.activeLayerIndex = App.shadow.layers.length - 1;
        App.shadow.renderLayers();
        App.shadow.loadLayerValues();
        App.shadow.update();
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
            row.className = "stop-row";
            row.style.cursor = "pointer";
            row.onclick = () => App.shadow.selectLayer(index);
            const isActive = index === App.shadow.activeLayerIndex;
            if (isActive) { row.style.borderColor = "var(--apple-blue)"; row.style.backgroundColor = "rgba(0, 122, 255, 0.05)"; }
            row.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; flex:1;">
                <div style="width:24px; height:24px; border-radius:4px; background:${layer.color}; border:1px solid rgba(0,0,0,0.1);"></div>
                <div style="display:flex; flex-direction:column;">
                    <span style="font-size:0.8rem; font-weight:700; color:${isActive ? 'var(--apple-blue)' : 'var(--text-primary)'}">Capa ${index + 1}</span>
                    <span style="font-size:0.65rem; color:var(--text-secondary);">${layer.x}px ${layer.y}px ${layer.blur}px ${layer.inset ? '(Inset)' : ''}</span>
                </div>
            </div>
            <button class="btn-del-stop" onclick="event.stopPropagation(); App.shadow.removeLayer(${index})" ${App.shadow.layers.length <= 1 ? "disabled" : ""}>&times;</button>
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
            const shadowCss = App.shadow.layers.map(l => `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`).join(",\n  ");
            css = `background-color: ${colObject};\nbox-shadow:\n  ${shadowCss};`;
            box.style = `${css} width: 140px; height: 140px; border-radius: 24px; color: transparent; ${centerStyles}`;
            box.innerText = "";
        } else if (App.shadow.mode === "smooth") {
            const elev = v1, offX = v2, ints = v3 / 100, blurF = v4 / 100;
            const inset = document.getElementById("shInset").checked;
            const layers = [];
            for (let i = 1; i <= 6; i++) {
            const p = i / 6, x = (offX * p).toFixed(1), y = (elev * p).toFixed(1);
            const b = (elev * p * 2 * blurF).toFixed(1), a = (ints * (1 - p * 0.5)).toFixed(3);
            layers.push(`${inset ? "inset " : ""}${x}px ${y}px ${b}px rgba(${rgbShadow.r}, ${rgbShadow.g}, ${rgbShadow.b}, ${a})`);
            }
            css = `background-color: ${colObject};\nbox-shadow:\n  ${layers.join(",\n  ")};`;
            box.style = `${css} width: 140px; height: 140px; border-radius: 24px; color: transparent; ${centerStyles}`;
            box.style.transform = inset ? "scale(1)" : `scale(${1 + elev / 1000})`;
            box.innerText = "";
        } else if (App.shadow.mode === "neu") {
            const dist = v1, blur = v2, intensity = v3 / 100, radius = v4;
            const shadowDark = `rgba(${rgbShadow.r}, ${rgbShadow.g}, ${rgbShadow.b}, ${intensity.toFixed(2)})`;
            const shadowLight = `rgba(255,255,255, ${(intensity * 0.8).toFixed(2)})`;
            
            let bgCSS = colObject;
            let shadowCSS = `${dist}px ${dist}px ${blur}px ${shadowDark}, -${dist}px -${dist}px ${blur}px ${shadowLight}`;
            
            const shape = App.shadow.neuShape || 'flat';
            
            if (shape === 'concave') {
                bgCSS = `linear-gradient(145deg, ${App.utils.adjustColor(colObject, -25)}, ${App.utils.adjustColor(colObject, 25)})`;
            } else if (shape === 'convex') {
                bgCSS = `linear-gradient(145deg, ${App.utils.adjustColor(colObject, 25)}, ${App.utils.adjustColor(colObject, -25)})`;
            } else if (shape === 'pressed') {
                bgCSS = colObject;
                shadowCSS = `inset ${dist}px ${dist}px ${blur}px ${shadowDark}, inset -${dist}px -${dist}px ${blur}px ${shadowLight}`;
            }

            css = `background: ${bgCSS};\nborder-radius: ${radius}px;\nbox-shadow: ${shadowCSS};`;
            box.style = `${css} width: 140px; height: 140px; border:none; color: var(--text-secondary); ${centerStyles}`;
            box.innerText = "Soft UI";
        } else if (App.shadow.mode === "glass") {
            const blurVal = v1, opacity = v2 / 100, borderOp = v3 / 100, sat = v4;
            const rgbaBg = `rgba(${rgbObject.r}, ${rgbObject.g}, ${rgbObject.b}, ${opacity})`;
            
            const noiseVal = document.getElementById("glassNoise") ? parseInt(document.getElementById("glassNoise").value) : 0;
            if(document.getElementById("valGlassNoise")) document.getElementById("valGlassNoise").innerText = noiseVal + "%";
            const shineActive = document.getElementById("glassShine") ? document.getElementById("glassShine").checked : false;

            let bgCSS = rgbaBg;
            let borderCSS = `1px solid rgba(255, 255, 255, ${borderOp})`;
            
            if (shineActive) {
                borderCSS = "1px solid transparent";
                const gradBorder = `linear-gradient(135deg, rgba(255,255,255, ${Math.min(1, borderOp + 0.4)}), rgba(255,255,255, ${Math.max(0, borderOp - 0.1)})) border-box`;
                if (noiseVal > 0) {
                    const noiseSVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${noiseVal/100}'/%3E%3C/svg%3E`;
                    bgCSS = `url("${noiseSVG}"), linear-gradient(${rgbaBg}, ${rgbaBg}) padding-box, ${gradBorder}`;
                } else {
                    bgCSS = `linear-gradient(${rgbaBg}, ${rgbaBg}) padding-box, ${gradBorder}`;
                }
            } else if (noiseVal > 0) {
                const noiseSVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${noiseVal/100}'/%3E%3C/svg%3E`;
                bgCSS = `url("${noiseSVG}"), ${rgbaBg}`;
            }

            css = `background: ${bgCSS};\nbackdrop-filter: blur(${blurVal}px) saturate(${sat}%);\n-webkit-backdrop-filter: blur(${blurVal}px) saturate(${sat}%);\nborder: ${borderCSS};\nborder-radius: 16px;`;
            css += `\nbox-shadow: 0 8px 32px 0 rgba(${rgbShadow.r}, ${rgbShadow.g}, ${rgbShadow.b}, 0.15);`;
            box.style = `${css} width: 200px; height: 120px; color: ${colObject === "#ffffff" ? "#000" : "#fff"}; ${centerStyles}`;
            box.innerText = "Glass Pro";
        }
        resultBox.innerText = css;
    },
    updateBg() {
        document.querySelector("#section-shadow .preview-container").style.backgroundColor = document.getElementById("shBgColor").value;
    },
};
