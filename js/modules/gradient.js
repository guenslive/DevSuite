App.gradient = {
    listenersAdded: false,
    init() {
        App.gradient.renderStops();
        App.gradient.renderBarThumbs();
        App.gradient.update();

        // 3. AÑADE ESTE BLOQUE CONDICIONAL:
        if (!App.gradient.listenersAdded) {
            App.gradient.setupListeners();
            App.gradient.listenersAdded = true;
        }
    },
    update() {
        const type = document.getElementById("gradType").value;
        const angle = document.getElementById("gradAngle").value;
        const sorted = [...App.state.gradient.stops].sort((a, b) => a.pos - b.pos);
        const str = sorted.map((s) => `${App.utils.hexToRgbaStr(s.color, s.opacity)} ${s.pos}%`).join(", ");
        const grp = document.getElementById("gradAngleGroup");
        if (type === "radial") grp.style.display = "none"; else { grp.style.display = "flex"; document.getElementById("valGradAngle").innerText = angle + "deg"; }
        const css = type === "linear" ? `linear-gradient(${angle}deg, ${str})` : `radial-gradient(circle, ${str})`;
        document.getElementById("gradientPreviewBox").style.background = css;
        document.getElementById("gradBarOverlay").style.background = `linear-gradient(90deg, ${str})`;
        document.getElementById("gradientResult").innerText = `background: ${css};`;
    },
    renderStops() {
        const container = document.getElementById("stopsContainer");
        container.innerHTML = "";
        App.state.gradient.stops.forEach((stop, index) => {
            const row = document.createElement("div");
            row.className = "stop-row";
            row.innerHTML = `
                    <div class="pro-color-picker" style="grid-area:color; padding:4px;">
                        <div class="color-preview-box" id="stop-preview-${stop.id}" style="background:${App.utils.hexToRgbaStr(stop.color, stop.opacity)}; width:32px; height:32px;">
                            <input type="color" id="stop-color-${stop.id}" value="${stop.color}" oninput="App.gradient.updateStop(${index}, 'color', this.value)">
                        </div>
                        <div class="hex-input-wrapper"><input type="text" id="stop-text-${stop.id}" value="${stop.color}" oninput="App.gradient.updateStop(${index}, 'color', this.value)"></div>
                    </div>
                    <div class="stop-opacity-wrap">
                        <div class="stop-opacity-header"><span>Opacidad</span><span id="stop-op-lbl-${stop.id}">${stop.opacity}%</span></div>
                        <input type="range" class="stop-opacity-input" min="0" max="100" value="${stop.opacity}" oninput="App.gradient.updateStop(${index}, 'opacity', this.value)">
                    </div>
                    <input type="number" class="stop-pos-input" min="0" max="100" value="${stop.pos}" oninput="App.gradient.updateStop(${index}, 'pos', this.value)">
                    <button class="btn-del-stop" onclick="App.gradient.removeStop(${index})" ${App.state.gradient.stops.length <= 2 ? "disabled" : ""}>&times;</button>
                `;
            container.appendChild(row);
        });
    },
    renderBarThumbs() {
        const bar = document.getElementById("gradBarVisual");
        const overlay = document.getElementById("gradBarOverlay");
        bar.innerHTML = "";
        bar.appendChild(overlay);
        App.state.gradient.stops.forEach((stop, index) => {
            const thumb = document.createElement("div");
            thumb.className = "grad-thumb";
            thumb.id = `thumb-${stop.id}`;
            thumb.style.setProperty("--thumb-color", App.utils.hexToRgbaStr(stop.color, stop.opacity));
            thumb.style.left = stop.pos + "%";
            const startDrag = (e) => {
                App.state.gradient.isDragging = true;
                App.state.gradient.draggedIndex = index;
                e.stopPropagation();
            };
            thumb.addEventListener("mousedown", startDrag);
            thumb.addEventListener("touchstart", startDrag, { passive: false });
            bar.appendChild(thumb);
        });
    },
    updateStop(index, key, val) {
        if (key === "opacity" || key === "pos") val = parseInt(val);
        App.state.gradient.stops[index][key] = val;
        const stop = App.state.gradient.stops[index];
        if (key === "color" || key === "opacity") {
            const box = document.getElementById(`stop-preview-${stop.id}`);
            if (box) box.style.background = App.utils.hexToRgbaStr(stop.color, stop.opacity);
            if (key === "opacity") document.getElementById(`stop-op-lbl-${stop.id}`).innerText = stop.opacity + "%";
            if (key === "color") {
                const txt = document.getElementById(`stop-text-${stop.id}`);
                if (txt && document.activeElement !== txt) txt.value = stop.color;
                const col = document.getElementById(`stop-color-${stop.id}`);
                if (col) col.value = stop.color;
            }
        }
        if (key === "color" || key === "opacity" || key === "pos") App.gradient.renderBarThumbs();
        App.gradient.update();
    },
    removeStop(index) {
        if (App.state.gradient.stops.length <= 2) return;
        App.state.gradient.stops.splice(index, 1);
        App.gradient.renderStops();
        App.gradient.renderBarThumbs();
        App.gradient.update();
    },
    random() {
        const count = Math.floor(Math.random() * 3) + 2;
        App.state.gradient.stops = [];
        for (let i = 0; i < count; i++) {
            // FIX #5: Unique ID using random
            App.state.gradient.stops.push({
                color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
                opacity: 100,
                pos: Math.floor((i / (count - 1)) * 100),
                id: Date.now() + Math.floor(Math.random() * 100000),
            });
        }
        document.getElementById("gradAngle").value = Math.floor(Math.random() * 360);
        App.gradient.init();
    },
    setupListeners() {
        const bar = document.getElementById("gradBarVisual");
        const handleBarStart = (e) => {
            if (e.target.classList.contains("grad-thumb")) return;
            const rect = bar.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const offsetX = clientX - rect.left;
            const percent = Math.max(0, Math.min(100, Math.round((offsetX / rect.width) * 100)));
            App.state.gradient.stops.push({
                color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
                opacity: 100,
                pos: percent,
                id: Date.now() + Math.floor(Math.random() * 100000),
            });
            App.gradient.renderStops();
            App.gradient.renderBarThumbs();
            App.gradient.update();
        };
        bar.onmousedown = handleBarStart;
        bar.ontouchstart = handleBarStart;
        const handleMove = (e) => {
            if (!App.state.gradient.isDragging || App.state.gradient.draggedIndex === -1) return;
            if (e.touches) e.preventDefault();
            if (App.state.gradient.rafId) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            App.state.gradient.rafId = requestAnimationFrame(() => {
                const rect = document.getElementById("gradBarVisual").getBoundingClientRect();
                let percent = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
                const idx = App.state.gradient.draggedIndex;
                App.state.gradient.stops[idx].pos = percent;
                App.gradient.update();
                const thumb = document.getElementById(`thumb-${App.state.gradient.stops[idx].id}`);
                if (thumb) thumb.style.left = percent + "%";
                const input = document.querySelector(`.stop-row:nth-child(${idx + 1}) .stop-pos-input`);
                if (input) input.value = percent;
                App.state.gradient.rafId = null;
            });
        };
        const handleEnd = () => {
            if (App.state.gradient.isDragging) {
                App.state.gradient.isDragging = false;
                App.state.gradient.draggedIndex = -1;
                if (App.state.gradient.rafId) { cancelAnimationFrame(App.state.gradient.rafId); App.state.gradient.rafId = null; }
                App.gradient.renderStops();
            }
        };
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("touchmove", handleMove, { passive: false });
        window.addEventListener("mouseup", handleEnd);
        window.addEventListener("touchend", handleEnd);
    },
};
