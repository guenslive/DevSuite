App.core = {
    initTheme() {
        // Already handled in HEAD script to prevent FOUC, but we keep state sync
        const s = document.documentElement.getAttribute("data-theme") || "light";
        App.state.theme = s;
        App.core.updateIcons(s);
    },
    toggleTheme() {
        let n;
        // Check if triggered by the checkbox change event
        if (event && event.target && event.target.id === "themeSwitchInput") {
            n = event.target.checked ? "dark" : "light";
        } else {
            n = App.state.theme === "dark" ? "light" : "dark";
        }
        
        App.state.theme = n;
        document.documentElement.setAttribute("data-theme", n);
        localStorage.setItem("theme", n);
        App.core.updateIcons(n);
    },
    updateIcons(t) {
        const checkbox = document.getElementById("themeSwitchInput");
        if (checkbox) {
            checkbox.checked = (t === "dark");
        }
    },
    switchTab(t) {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        if (event && event.target && event.target.classList.contains("tab-btn")) event.target.classList.add("active");
        document.querySelectorAll(".tool-section").forEach((s) => s.classList.remove("active"));
        document.getElementById("section-" + t).classList.add("active");
        if (t === "placeholder") App.placeholder.draw();
        if (t === "shadow") { App.shadow.update(); App.shadow.updateBg(); }
        if (t === "contrast") App.contrast.calc();
        if (t === "gradient") App.gradient.init();
        if (t === "converter") App.converter.update();
        if (t === "blob") { App.shape.switchTool(App.shape.state.tool); App.shape.clipPath.init(); }
        if (t === "filter") App.filter.update();
        if (t === "flex") App.flex.init();
        if (t === "grid") App.grid.init();
        if (t === "palette") App.palette.init();
    },
};
