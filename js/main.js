App._syncHandlers = [
    { match: (p) => p.startsWith("ph"),   run: () => App.placeholder.update(false) },
    { match: (p) => p.startsWith("sb"),   run: () => App.scrollbar.update() },
    { match: (p) => p.startsWith("sh"),   run: () => { App.shadow.update(); App.shadow.updateBg(); } },
    { match: (p) => p === "fg" || p === "bg", run: () => App.contrast.calc() },
    { match: (p) => p === "conv",         run: () => App.converter.update() },
    { match: (p) => p.startsWith("blob"), run: () => App.shape.generateBlob() },
    { match: (p) => p.startsWith("tri"),  run: () => App.shape.generateTriangle() },
    { match: (p) => p === "pal",          run: (v) => App.palette.updateBaseColor(v) },
];

App.syncProPicker = function(prefix, value) {
    if (!value.startsWith("#")) value = "#" + value;
    const isValid = /^#[0-9A-F]{6}$/i.test(value);
    const colorInput = document.getElementById(prefix + "Color");
    const textInput = document.getElementById(prefix + "Text");
    const box = document.getElementById(prefix + "Box");

    if (!isValid) {
        if (textInput) textInput.value = value;
        return;
    }

    if (colorInput) colorInput.value = value;
    if (textInput) textInput.value = value.toUpperCase();
    if (box) box.style.background = value;

    const handler = App._syncHandlers.find((h) => h.match(prefix));
    if (handler) handler.run(value);

    if (App.core.history) {
        clearTimeout(App.state.historyDebounce);
        App.state.historyDebounce = setTimeout(() => App.core.history.add(value), 1000);
    }
};

App._initPalettePresets = function() {
    const presets = ["#007AFF", "#34C759", "#FF3B30", "#FF9500", "#AF52DE", "#5856D6", "#5AC8FA", "#000000", "#FFFFFF"];
    ["phBg", "fg", "bg"].forEach((prefix) => {
        const container = document.getElementById(prefix + "Palette");
        if (!container) return;
        container.innerHTML = "";
        presets.forEach((color) => {
            const swatch = document.createElement("div");
            swatch.className = "palette-swatch";
            swatch.style.background = color;
            swatch.onclick = () => App.syncProPicker(prefix, color);
            container.appendChild(swatch);
        });
    });
};

App._initAllTools = function() {
    App.clamp.calc();
    App.ratio.calc();
    App.placeholder.draw();
    App.shadow.update();
    App.contrast.calc();
    App.gradient.init();
    App.converter.update();
    App.shape.generateBlob();
    App.shape.clipPath.init();
    App.filter.update();
    App.flex.init();
    App.palette.init();
    if (App.shadow.initFavorites) App.shadow.initFavorites();
    if (App.keyframes && App.keyframes.init) App.keyframes.init();
    if (App.typescale && App.typescale.update) App.typescale.update();
    if (App.borderradius && App.borderradius.update) App.borderradius.update();
    if (App.scrollbar && App.scrollbar.update) App.scrollbar.update();
};

App._initScrollButtons = function() {
    App.core.updateScrollButtons();
    const tabsContainer = document.querySelector(".tabs-container");
    if (!tabsContainer) return;
    tabsContainer.addEventListener("scroll", () => App.core.updateScrollButtons());
    window.addEventListener("resize", App.core.updateScrollButtons);
};

App._initSearchDismiss = function() {
    document.addEventListener("click", (e) => {
        const searchWrapper = document.querySelector(".search-wrapper");
        const results = document.getElementById("searchResults");
        if (searchWrapper && !searchWrapper.contains(e.target) && results) {
            results.classList.remove("show");
        }
    });
};

App._hideLoader = function() {
    const loader = document.getElementById("loader-overlay");
    if (!loader) return;
    setTimeout(() => {
        loader.classList.add("hidden");
        setTimeout(() => { loader.style.display = "none"; }, 500);
    }, 1000);
};

App.init = function() {
    App.core.initTheme();
    if (App.core.history) App.core.history.init();
    App._initPalettePresets();
    App._initAllTools();
    App._initScrollButtons();
    App._initSearchDismiss();
    App._hideLoader();
};

/* --- COMPATIBILITY LAYER FOR HTML HANDLERS --- */
window.toggleTheme = App.core.toggleTheme;
window.switchTab = App.core.switchTab;
window.copyText = App.utils.copyText;
window.calcClamp = App.clamp.calc;
window.handleUnitChange = App.clamp.handleUnitChange;
window.calcRatio = App.ratio.calc;
window.updatePlaceholder = App.placeholder.update;
window.downloadPlaceholder = App.placeholder.download;
window.updateShadow = App.shadow.update;
window.updateShadowBg = App.shadow.updateBg;
window.calcContrast = App.contrast.calc;
window.updateGradient = App.gradient.update;
window.randomGradient = App.gradient.random;
window.updateConverter = App.converter.update;
window.generateBlob = App.shape.generateBlob;
window.updateBlobSize = App.shape.updateBlobSize;
window.setBlobType = App.shape.setBlobType;
window.syncProPicker = App.syncProPicker;

window.App = App;

document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
