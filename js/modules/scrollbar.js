App.scrollbar = {
    rafPending: false,
    styleEl: null,

    update() {
        if (App.scrollbar.rafPending) return;
        App.scrollbar.rafPending = true;
        requestAnimationFrame(() => {
            App.scrollbar._performUpdate();
            App.scrollbar.rafPending = false;
        });
    },

    _performUpdate() {
        const width = parseInt(document.getElementById("sbWidth").value) || 10;
        const radius = parseInt(document.getElementById("sbRadius").value) || 10;
        const trackRadius = parseInt(document.getElementById("sbTrackRadius").value) || 10;
        const thumbPadding = parseInt(document.getElementById("sbThumbPadding").value) || 0;
        const trackColor = document.getElementById("sbTrackColor").value;
        const thumbColor = document.getElementById("sbThumbColor").value;
        const hoverColor = document.getElementById("sbHoverColor").value;
        const orientation = document.getElementById("sbOrientation").value;
        const includeFirefox = document.getElementById("sbFirefox").checked;

        document.getElementById("valSbWidth").innerText = width + "px";
        document.getElementById("valSbRadius").innerText = radius + "px";
        document.getElementById("valSbTrackRadius").innerText = trackRadius + "px";
        document.getElementById("valSbThumbPadding").innerText = thumbPadding + "px";

        const preview = document.getElementById("scrollbarPreviewBox");
        preview.setAttribute("data-orientation", orientation);

        const styleEl = App.scrollbar._ensureStyleEl();
        const thumbBorder = thumbPadding > 0
            ? `border: ${thumbPadding}px solid ${trackColor};\n        background-clip: padding-box;`
            : "";

        const selectorWeb = "#scrollbarPreviewBox";
        const cssRuntime = `
            ${selectorWeb} { scrollbar-width: ${width > 10 ? 'auto' : 'thin'}; scrollbar-color: ${thumbColor} ${trackColor}; }
            ${selectorWeb}::-webkit-scrollbar { width: ${width}px; height: ${width}px; }
            ${selectorWeb}::-webkit-scrollbar-track { background: ${trackColor}; border-radius: ${trackRadius}px; }
            ${selectorWeb}::-webkit-scrollbar-thumb { background: ${thumbColor}; border-radius: ${radius}px; ${thumbPadding > 0 ? `border: ${thumbPadding}px solid ${trackColor}; background-clip: padding-box;` : ""} }
            ${selectorWeb}::-webkit-scrollbar-thumb:hover { background: ${hoverColor}; }
            ${selectorWeb}::-webkit-scrollbar-corner { background: ${trackColor}; }
        `;
        styleEl.textContent = cssRuntime;

        const selector = ".custom-scrollbar";
        let output = `${selector} {
    /* Width */
}
${selector}::-webkit-scrollbar {
    width: ${width}px;
    height: ${width}px;
}
${selector}::-webkit-scrollbar-track {
    background: ${trackColor};
    border-radius: ${trackRadius}px;
}
${selector}::-webkit-scrollbar-thumb {
    background: ${thumbColor};
    border-radius: ${radius}px;${thumbPadding > 0 ? `\n    ${thumbBorder}` : ""}
}
${selector}::-webkit-scrollbar-thumb:hover {
    background: ${hoverColor};
}
${selector}::-webkit-scrollbar-corner {
    background: ${trackColor};
}`;

        if (includeFirefox) {
            output = `${selector} {
    scrollbar-width: ${width > 10 ? 'auto' : 'thin'};
    scrollbar-color: ${thumbColor} ${trackColor};
}

${output.replace(/^\.custom-scrollbar \{[^}]+\}\n/, "")}`;
        }

        document.getElementById("scrollbarResult").innerText = output;
    },

    _ensureStyleEl() {
        if (!App.scrollbar.styleEl) {
            App.scrollbar.styleEl = document.createElement("style");
            App.scrollbar.styleEl.id = "sbRuntimeStyle";
            document.head.appendChild(App.scrollbar.styleEl);
        }
        return App.scrollbar.styleEl;
    },

    presets: {
        "minimal":  { width: 6,  radius: 3,  trackRadius: 0,  thumbPadding: 0, track: "#f0f0f0", thumb: "#c0c0c0", hover: "#a0a0a0" },
        "rounded":  { width: 12, radius: 10, trackRadius: 10, thumbPadding: 2, track: "#f2f2f7", thumb: "#8e8e93", hover: "#636366" },
        "neon":     { width: 10, radius: 10, trackRadius: 10, thumbPadding: 0, track: "#1a1a2e", thumb: "#00d9ff", hover: "#ff2d55" },
        "dark":     { width: 10, radius: 8,  trackRadius: 8,  thumbPadding: 2, track: "#1c1c1e", thumb: "#48484a", hover: "#636366" },
        "pill":     { width: 14, radius: 20, trackRadius: 20, thumbPadding: 3, track: "#e5e5ea", thumb: "#007aff", hover: "#0051d5" },
        "invisible":{ width: 0,  radius: 0,  trackRadius: 0,  thumbPadding: 0, track: "transparent", thumb: "transparent", hover: "transparent" }
    },

    setPreset(name) {
        const p = App.scrollbar.presets[name];
        if (!p) return;
        document.getElementById("sbWidth").value = p.width;
        document.getElementById("sbRadius").value = p.radius;
        document.getElementById("sbTrackRadius").value = p.trackRadius;
        document.getElementById("sbThumbPadding").value = p.thumbPadding;
        App.syncProPicker("sbTrack", p.track === "transparent" ? "#ffffff" : p.track);
        App.syncProPicker("sbThumb", p.thumb === "transparent" ? "#ffffff" : p.thumb);
        App.syncProPicker("sbHover", p.hover === "transparent" ? "#ffffff" : p.hover);
        document.querySelectorAll(".sb-preset-btn").forEach(b => b.classList.remove("active"));
        const btn = document.getElementById("sbPreset-" + name);
        if (btn) btn.classList.add("active");
        App.scrollbar.update();
    }
};
