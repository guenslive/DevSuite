App.urlState = {
    _skipWrite: false,
    _writeTimer: null,
    _currentTool: null,
    _ready: false,
    _debounceMs: 250,

    init() {
        window.addEventListener("hashchange", () => App.urlState.read());
        document.addEventListener("input", App.urlState._onInput);
        document.addEventListener("change", App.urlState._onInput);
        App.urlState._ready = true;
        App.urlState.read();
    },

    _onInput(e) {
        if (!App.urlState._ready || App.urlState._skipWrite) return;
        const tool = App.urlState._currentTool;
        if (!tool) return;
        const section = e.target.closest(".tool-section");
        if (!section || section.id !== "section-" + tool) return;
        App.urlState.write(tool);
    },

    onTabChange(tool) {
        App.urlState._currentTool = tool;
        if (!App.urlState._ready || App.urlState._skipWrite) return;
        App.urlState.write(tool, /* immediate */ true);
    },

    read() {
        const hash = location.hash.slice(1);
        if (!hash) {
            const active = document.querySelector(".tool-section.active");
            if (active) App.urlState._currentTool = active.id.replace(/^section-/, "");
            return;
        }
        const [tool, qs] = hash.split("?");
        if (!tool) return;
        const exists = document.getElementById("section-" + tool);
        if (!exists) return;

        const params = new URLSearchParams(qs || "");
        App.urlState._skipWrite = true;
        try {
            App.core.switchTab(tool);
            App.urlState._currentTool = tool;
            const mod = App[tool];
            if (mod && typeof mod.deserialize === "function") {
                mod.deserialize(params);
            } else {
                App.urlState.applyGeneric(tool, params);
            }
        } finally {
            App.urlState._skipWrite = false;
        }
    },

    applyGeneric(tool, params) {
        const section = document.getElementById("section-" + tool);
        if (!section) return;
        params.forEach((value, key) => {
            const el = document.getElementById(key);
            if (!el || !section.contains(el)) return;
            if (el.type === "checkbox") {
                el.checked = value === "1";
                el.dispatchEvent(new Event("change", { bubbles: true }));
            } else if (el.type === "color") {
                el.value = value.startsWith("#") ? value : "#" + value;
                el.dispatchEvent(new Event("input", { bubbles: true }));
            } else if (el.tagName === "SELECT") {
                el.value = value;
                el.dispatchEvent(new Event("change", { bubbles: true }));
            } else {
                el.value = value;
                el.dispatchEvent(new Event("input", { bubbles: true }));
            }
        });
    },

    collectGeneric(tool) {
        const out = {};
        const section = document.getElementById("section-" + tool);
        if (!section) return out;
        section.querySelectorAll("input[id], select[id]").forEach((el) => {
            if (el.type === "color" || el.type === "file" || el.type === "button") return;
            if (el.disabled) return;
            if (el.type === "checkbox") {
                out[el.id] = el.checked ? "1" : "0";
                return;
            }
            const v = el.value;
            if (v === "" || v == null) return;
            out[el.id] = typeof v === "string" && v.startsWith("#") ? v.slice(1) : v;
        });
        return out;
    },

    write(tool, immediate = false) {
        clearTimeout(App.urlState._writeTimer);
        const flush = () => {
            const mod = App[tool];
            const data = mod && typeof mod.serialize === "function"
                ? mod.serialize()
                : App.urlState.collectGeneric(tool);
            const qs = new URLSearchParams(data).toString();
            const newHash = qs ? `#${tool}?${qs}` : `#${tool}`;
            if (location.hash !== newHash) {
                history.replaceState(null, "", newHash);
            }
        };
        if (immediate) flush();
        else App.urlState._writeTimer = setTimeout(flush, App.urlState._debounceMs);
    },
};
