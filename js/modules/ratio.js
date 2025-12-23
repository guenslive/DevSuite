App.ratio = {
    calc() {
        const w = parseFloat(document.getElementById("imgWidth").value);
        const h = parseFloat(document.getElementById("imgHeight").value);
        if (!w || !h) return;
        const d = App.utils.gcd(w, h);
        const rW = w / d, rH = h / d;
        
        document.getElementById("ratioResultText").innerText = `${rW} : ${rH}`;
        document.getElementById("ratioCssResult").innerText = `aspect-ratio: ${rW} / ${rH};`;
        
        const b = document.getElementById("ratioBox");
        b.innerText = `${rW}:${rH}`;
        if (w >= h) { b.style.width = "160px"; b.style.height = `${(160 / w) * h}px`; } 
        else { b.style.height = "140px"; b.style.width = `${(140 / h) * w}px`; }

        // Sincronizar inputs de abajo
        document.getElementById("ratioInW").value = rW;
        document.getElementById("ratioInH").value = rH;
        
        // Recalcular resize si es necesario
        App.ratio.calcResize('ratio');
    },
    calcResize(source) {
        const rW = parseFloat(document.getElementById("ratioInW").value);
        const rH = parseFloat(document.getElementById("ratioInH").value);
        const inW = document.getElementById("resizeW");
        const inH = document.getElementById("resizeH");
        
        // Actualizar el box principal también si cambiamos el ratio manualmente
        const box = document.getElementById("ratioBox");
        
        if (box && rW && rH) {
            box.innerText = `${rW}:${rH}`;
            
            // Actualizar textos de resultado
            const resultText = document.getElementById("ratioResultText");
            const cssResult = document.getElementById("ratioCssResult");
            if (resultText) resultText.innerText = `${rW} : ${rH}`;
            if (cssResult) cssResult.innerText = `aspect-ratio: ${rW} / ${rH};`;

            if (rW >= rH) { 
                box.style.width = "160px"; 
                box.style.height = `${(160 / rW) * rH}px`; 
            } else { 
                box.style.height = "140px"; 
                box.style.width = `${(140 / rH) * rW}px`; 
            }
        }

        if (!rW || !rH) return;

        if (source === 'width') {
            const valW = parseFloat(inW.value);
            if (!isNaN(valW)) {
                inH.value = ((valW * rH) / rW).toFixed(0);
            } else {
                inH.value = "";
            }
        } else if (source === 'height') {
            const valH = parseFloat(inH.value);
            if (!isNaN(valH)) {
                inW.value = ((valH * rW) / rH).toFixed(0);
            } else {
                inW.value = "";
            }
        } else if (source === 'ratio') {
            if (inW.value && inW.value !== "") {
                const valW = parseFloat(inW.value);
                inH.value = ((valW * rH) / rW).toFixed(0);
            } else if (inH.value && inH.value !== "") {
                const valH = parseFloat(inH.value);
                inW.value = ((valH * rW) / rH).toFixed(0);
            }
        }
    }
};
