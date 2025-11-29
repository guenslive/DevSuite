App.clamp = {
    handleUnitChange(id, sel) {
        const i = document.getElementById(id), b = parseFloat(document.getElementById("pixelsPerRem").value) || 16;
        let v = parseFloat(i.value);
        if (isNaN(v)) v = 0;
        i.value = sel.value === "px" ? parseFloat((v * b).toFixed(2)) : parseFloat((v / b).toFixed(4));
        App.clamp.calc();
    },
    calc() {
        const minW = parseFloat(document.getElementById("minWidth").value);
        const maxW = parseFloat(document.getElementById("maxWidth").value);
        const minF = parseFloat(document.getElementById("minFont").value);
        const maxF = parseFloat(document.getElementById("maxFont").value);
        const b = parseFloat(document.getElementById("pixelsPerRem").value) || 16;
        const minU = document.getElementById("minUnit").value;
        const maxU = document.getElementById("maxUnit").value;
        const minP = minU === "rem" ? minF * b : minF;
        const maxP = maxU === "rem" ? maxF * b : maxF;
        const r = document.getElementById("clampResult");
        if (isNaN(minW) || isNaN(maxW) || isNaN(minP) || isNaN(maxP)) { r.innerText = "Ingresa valores..."; return; }
        
        // Update slider limits
        const slider = document.getElementById("clampViewportSlider");
        if (slider) {
            slider.min = minW;
            slider.max = maxW;
        }

        const s = (maxP - minP) / (maxW - minW);
        const y = -minW * s + minP;
        r.innerText = `font-size: clamp(${(minP / b).toFixed(4)}rem, ${(y / b).toFixed(4)}rem + ${(s * 100).toFixed(4)}vw, ${(maxP / b).toFixed(4)}rem);`;
        
        App.clamp.updateViewport();
    },
    updateViewport() {
        const slider = document.getElementById("clampViewportSlider");
        if(!slider) return;
        const width = parseFloat(slider.value);
        document.getElementById("clampViewportVal").innerText = width + "px";
        
        const minW = parseFloat(document.getElementById("minWidth").value);
        const maxW = parseFloat(document.getElementById("maxWidth").value);
        const minF = parseFloat(document.getElementById("minFont").value);
        const maxF = parseFloat(document.getElementById("maxFont").value);
        const b = parseFloat(document.getElementById("pixelsPerRem").value) || 16;
        
        const minU = document.getElementById("minUnit").value;
        const maxU = document.getElementById("maxUnit").value;
        const minP = minU === "rem" ? minF * b : minF;
        const maxP = maxU === "rem" ? maxF * b : maxF;
        
        const s = (maxP - minP) / (maxW - minW);
        const y = -minW * s + minP;
        
        let calcSize = y + (s * width);
        calcSize = Math.max(minP, Math.min(maxP, calcSize));
        
        const txt = document.getElementById("clampPreviewText");
        if(txt) {
            txt.style.fontSize = calcSize + "px";
            txt.innerText = `Texto de Prueba (${calcSize.toFixed(2)}px)`;
        }
        
        const box = document.getElementById("clampPreviewBox");
        if(box) {
            const minV = parseFloat(slider.min);
            const maxV = parseFloat(slider.max);
            const pct = 30 + ((width - minV) / (maxV - minV)) * 70;
            box.style.width = pct + "%";
        }
    }
};
