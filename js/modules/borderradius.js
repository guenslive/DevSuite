App.borderradius = {
    rafPending: false,

    update() {
        if (App.borderradius.rafPending) return;
        App.borderradius.rafPending = true;
        requestAnimationFrame(() => {
            App.borderradius._performUpdate();
            App.borderradius.rafPending = false;
        });
    },

    _performUpdate() {
        const advanced = document.getElementById("brAdvanced").checked;
        const unit = document.getElementById("brUnit").value;
        const width = parseInt(document.getElementById("brWidth").value) || 200;
        const height = parseInt(document.getElementById("brHeight").value) || 200;

        document.getElementById("valBrWidth").innerText = width + "px";
        document.getElementById("valBrHeight").innerText = height + "px";

        const corners = ["Tl", "Tr", "Br", "Bl"];
        const h = {}, v = {};
        corners.forEach(c => {
            h[c] = parseInt(document.getElementById("br" + c + "H").value) || 0;
            v[c] = parseInt(document.getElementById("br" + c + "V").value) || 0;
            document.getElementById("valBr" + c + "H").innerText = h[c] + unit;
            document.getElementById("valBr" + c + "V").innerText = v[c] + unit;
        });

        document.querySelectorAll(".br-v-row").forEach(el => {
            el.style.display = advanced ? "flex" : "none";
        });

        const hValues = [h.Tl, h.Tr, h.Br, h.Bl];
        let vValues;
        if (advanced) {
            vValues = [v.Tl, v.Tr, v.Br, v.Bl];
        } else {
            vValues = hValues;
            corners.forEach(c => {
                const slider = document.getElementById("br" + c + "V");
                slider.value = h[c];
                document.getElementById("valBr" + c + "V").innerText = h[c] + unit;
            });
        }

        const hStr = hValues.map(n => n + unit).join(" ");
        const vStr = vValues.map(n => n + unit).join(" ");
        const equal = hValues.every((n, i) => n === vValues[i]);
        const allSame = equal && hValues.every(n => n === hValues[0]);

        let cssValue;
        if (allSame) {
            cssValue = hValues[0] + unit;
        } else if (equal) {
            cssValue = hStr;
        } else {
            cssValue = `${hStr} / ${vStr}`;
        }

        const box = document.getElementById("brPreviewBox");
        box.style.borderRadius = cssValue;
        box.style.width = width + "px";
        box.style.height = height + "px";

        document.getElementById("borderradiusResult").innerText = `border-radius: ${cssValue};`;

        App.borderradius._renderCornerHandles(hValues, vValues, width, height);
    },

    _renderCornerHandles(h, v, w, hgt) {
        const labels = ["TL", "TR", "BR", "BL"];
        const positions = [
            { corner: "tl", x: 0, y: 0 },
            { corner: "tr", x: w, y: 0 },
            { corner: "br", x: w, y: hgt },
            { corner: "bl", x: 0, y: hgt }
        ];
        positions.forEach((p, i) => {
            const el = document.getElementById("brCornerLabel-" + p.corner);
            if (el) el.innerText = `${labels[i]} · ${h[i]}/${v[i]}`;
        });
    },

    setAllCorners(value) {
        ["Tl", "Tr", "Br", "Bl"].forEach(c => {
            document.getElementById("br" + c + "H").value = value;
            document.getElementById("br" + c + "V").value = value;
        });
        App.borderradius.update();
    },

    randomize() {
        ["Tl", "Tr", "Br", "Bl"].forEach(c => {
            const hVal = Math.floor(Math.random() * 80);
            const vVal = Math.floor(Math.random() * 80);
            document.getElementById("br" + c + "H").value = hVal;
            document.getElementById("br" + c + "V").value = vVal;
        });
        document.getElementById("brAdvanced").checked = true;
        App.borderradius.update();
    },

    presets: {
        "circle":  { h: [50, 50, 50, 50], v: [50, 50, 50, 50], unit: "%" },
        "pill":    { h: [50, 50, 50, 50], v: [50, 50, 50, 50], unit: "%" },
        "squircle":{ h: [30, 30, 30, 30], v: [30, 30, 30, 30], unit: "%" },
        "card":    { h: [12, 12, 12, 12], v: [12, 12, 12, 12], unit: "px" },
        "leaf":    { h: [0, 80, 0, 80],   v: [0, 80, 0, 80],   unit: "%" },
        "blob":    { h: [40, 60, 70, 30], v: [50, 30, 60, 70], unit: "%" },
        "wave":    { h: [60, 40, 60, 40], v: [20, 80, 20, 80], unit: "%" },
        "shield":  { h: [20, 20, 50, 50], v: [20, 20, 50, 50], unit: "%" }
    },

    setPreset(name) {
        const p = App.borderradius.presets[name];
        if (!p) return;
        document.getElementById("brUnit").value = p.unit;
        const corners = ["Tl", "Tr", "Br", "Bl"];
        corners.forEach((c, i) => {
            document.getElementById("br" + c + "H").value = p.h[i];
            document.getElementById("br" + c + "V").value = p.v[i];
        });
        const isAdvanced = p.h.some((n, i) => n !== p.v[i]);
        document.getElementById("brAdvanced").checked = isAdvanced;
        document.querySelectorAll(".br-preset-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("brPreset-" + name);
        if (btn) btn.classList.add("active");
        App.borderradius.update();
    }
};
