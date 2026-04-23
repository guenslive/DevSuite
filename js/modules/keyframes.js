App.keyframes = {
    rafPending: false,
    initialized: false,
    replayCounter: 0,

    stops: [
        { pct: 0, css: "opacity: 0; transform: translateY(20px);" },
        { pct: 100, css: "opacity: 1; transform: translateY(0);" }
    ],

    presets: {
        "fade-in": [
            { pct: 0, css: "opacity: 0;" },
            { pct: 100, css: "opacity: 1;" }
        ],
        "fade-out": [
            { pct: 0, css: "opacity: 1;" },
            { pct: 100, css: "opacity: 0;" }
        ],
        "slide-up": [
            { pct: 0, css: "opacity: 0; transform: translateY(40px);" },
            { pct: 100, css: "opacity: 1; transform: translateY(0);" }
        ],
        "slide-down": [
            { pct: 0, css: "opacity: 0; transform: translateY(-40px);" },
            { pct: 100, css: "opacity: 1; transform: translateY(0);" }
        ],
        "slide-left": [
            { pct: 0, css: "opacity: 0; transform: translateX(40px);" },
            { pct: 100, css: "opacity: 1; transform: translateX(0);" }
        ],
        "slide-right": [
            { pct: 0, css: "opacity: 0; transform: translateX(-40px);" },
            { pct: 100, css: "opacity: 1; transform: translateX(0);" }
        ],
        "zoom-in": [
            { pct: 0, css: "opacity: 0; transform: scale(0.5);" },
            { pct: 100, css: "opacity: 1; transform: scale(1);" }
        ],
        "zoom-out": [
            { pct: 0, css: "opacity: 1; transform: scale(1);" },
            { pct: 100, css: "opacity: 0; transform: scale(0.5);" }
        ],
        "rotate": [
            { pct: 0, css: "transform: rotate(0deg);" },
            { pct: 100, css: "transform: rotate(360deg);" }
        ],
        "pulse": [
            { pct: 0, css: "transform: scale(1);" },
            { pct: 50, css: "transform: scale(1.1);" },
            { pct: 100, css: "transform: scale(1);" }
        ],
        "shake": [
            { pct: 0, css: "transform: translateX(0);" },
            { pct: 20, css: "transform: translateX(-10px);" },
            { pct: 40, css: "transform: translateX(10px);" },
            { pct: 60, css: "transform: translateX(-10px);" },
            { pct: 80, css: "transform: translateX(10px);" },
            { pct: 100, css: "transform: translateX(0);" }
        ],
        "bounce": [
            { pct: 0, css: "transform: translateY(0);" },
            { pct: 25, css: "transform: translateY(-30px);" },
            { pct: 50, css: "transform: translateY(0);" },
            { pct: 75, css: "transform: translateY(-15px);" },
            { pct: 100, css: "transform: translateY(0);" }
        ]
    },

    init() {
        if (!App.keyframes.initialized) {
            App.keyframes.initialized = true;
        }
        App.keyframes.renderStops();
        App.keyframes.update();
    },

    setPreset(name) {
        if (!App.keyframes.presets[name]) return;
        App.keyframes.stops = JSON.parse(JSON.stringify(App.keyframes.presets[name]));
        document.querySelectorAll("#kfPresets .blob-type-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("kfPreset-" + name);
        if (btn) btn.classList.add("active");
        App.keyframes.renderStops();
        App.keyframes.update();
        App.keyframes.replay();
    },

    addStop() {
        const nextPct = App.keyframes.stops.length > 0
            ? Math.min(100, App.keyframes.stops[App.keyframes.stops.length - 1].pct + 25)
            : 50;
        App.keyframes.stops.push({ pct: nextPct, css: "transform: translateY(0); opacity: 1;" });
        App.keyframes.renderStops();
        App.keyframes.update();
    },

    removeStop(index) {
        if (App.keyframes.stops.length <= 2) return;
        App.keyframes.stops.splice(index, 1);
        App.keyframes.renderStops();
        App.keyframes.update();
    },

    updateStop(index, field, value) {
        if (!App.keyframes.stops[index]) return;
        if (field === "pct") {
            const pct = Math.max(0, Math.min(100, parseInt(value) || 0));
            App.keyframes.stops[index].pct = pct;
        } else {
            App.keyframes.stops[index].css = value;
        }
        App.keyframes.update();
    },

    renderStops() {
        const container = document.getElementById("kfStopsList");
        if (!container) return;
        container.innerHTML = App.keyframes.stops.map((stop, index) => `
            <div class="kf-stop-row">
                <div class="kf-stop-header">
                    <label class="kf-stop-label">Keyframe</label>
                    <input type="number" class="kf-pct-input" min="0" max="100" value="${stop.pct}" oninput="App.keyframes.updateStop(${index}, 'pct', this.value)">
                    <span class="kf-pct-suffix">%</span>
                    <button class="btn-del-stop" onclick="App.keyframes.removeStop(${index})" ${App.keyframes.stops.length <= 2 ? "disabled" : ""}>&times;</button>
                </div>
                <textarea class="kf-css-input" rows="2" spellcheck="false" oninput="App.keyframes.updateStop(${index}, 'css', this.value)" placeholder="transform: ...; opacity: ...;">${App.keyframes._escapeHtml(stop.css)}</textarea>
            </div>
        `).join("");
    },

    update() {
        if (App.keyframes.rafPending) return;
        App.keyframes.rafPending = true;
        requestAnimationFrame(() => {
            App.keyframes._performUpdate();
            App.keyframes.rafPending = false;
        });
    },

    _performUpdate() {
        const duration = parseFloat(document.getElementById("kfDuration").value) || 1;
        const timing = document.getElementById("kfTiming").value;
        const delay = parseFloat(document.getElementById("kfDelay").value) || 0;
        const iterationsRaw = document.getElementById("kfIterations").value;
        const iterations = iterationsRaw === "infinite" ? "infinite" : (parseFloat(iterationsRaw) || 1);
        const direction = document.getElementById("kfDirection").value;
        const fill = document.getElementById("kfFill").value;

        document.getElementById("valKfDuration").innerText = duration + "s";
        document.getElementById("valKfDelay").innerText = delay + "s";

        const sorted = [...App.keyframes.stops].sort((a, b) => a.pct - b.pct);
        const keyframesBody = sorted.map(s => `    ${s.pct}% { ${s.css.trim()} }`).join("\n");
        const keyframesCss = `@keyframes customAnim {\n${keyframesBody}\n}`;
        const animationShorthand = `animation: customAnim ${duration}s ${timing} ${delay}s ${iterations} ${direction} ${fill};`;
        const classCss = `.animated {\n    ${animationShorthand}\n}`;
        const fullCss = `${keyframesCss}\n\n${classCss}`;

        document.getElementById("keyframesResult").innerText = fullCss;

        const styleEl = App.keyframes._ensureStyleEl();
        const uniqueName = `kfAnim${App.keyframes.replayCounter}`;
        const uniqueBody = sorted.map(s => `${s.pct}% { ${s.css.trim()} }`).join(" ");
        styleEl.textContent = `
            @keyframes ${uniqueName} { ${uniqueBody} }
            #keyframesPreviewBox.kf-play {
                animation: ${uniqueName} ${duration}s ${timing} ${delay}s ${iterations} ${direction} ${fill};
            }
        `;

        const preview = document.getElementById("keyframesPreviewBox");
        if (preview) {
            preview.classList.remove("kf-play");
            void preview.offsetWidth;
            preview.classList.add("kf-play");
        }
    },

    replay() {
        App.keyframes.replayCounter++;
        App.keyframes._performUpdate();
    },

    _ensureStyleEl() {
        let el = document.getElementById("kfRuntimeStyle");
        if (!el) {
            el = document.createElement("style");
            el.id = "kfRuntimeStyle";
            document.head.appendChild(el);
        }
        return el;
    },

    _escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }
};
