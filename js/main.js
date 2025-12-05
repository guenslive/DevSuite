App.syncProPicker = function(prefix, value) {
    if (!value.startsWith("#")) value = "#" + value;
    const isValid = /^#[0-9A-F]{6}$/i.test(value);
    const colorInput = document.getElementById(prefix + "Color");
    const textInput = document.getElementById(prefix + "Text");
    const box = document.getElementById(prefix + "Box");
    if (isValid) {
        if (colorInput) colorInput.value = value;
        if (textInput) textInput.value = value.toUpperCase();
        if (box) box.style.background = value;
        if (prefix.startsWith("ph")) App.placeholder.update(false);
        if (prefix.startsWith("sh")) { App.shadow.update(); App.shadow.updateBg(); }
        if (prefix === "fg" || prefix === "bg") App.contrast.calc();
        if (prefix === "conv") App.converter.update();
        if (prefix.startsWith("blob")) App.shape.generateBlob();
        if (prefix.startsWith("tri")) App.shape.generateTriangle();
        if (prefix === "pal") App.palette.updateBaseColor(value);
    } else {
        if (textInput) textInput.value = value;
    }
};

App.init = function() {
    App.core.initTheme();
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
    App.clamp.calc(); App.ratio.calc(); App.placeholder.draw(); App.shadow.update(); App.contrast.calc();
    App.gradient.init(); App.converter.update(); App.shape.generateBlob(); App.shape.clipPath.init(); App.filter.update(); App.flex.init(); App.palette.init();
    
    // Initialize scroll buttons
    App.core.updateScrollButtons();
    const tabsContainer = document.querySelector(".tabs-container");
    if (tabsContainer) {
        tabsContainer.addEventListener("scroll", () => {
            // Debounce slightly or just call directly
            App.core.updateScrollButtons();
        });
        window.addEventListener("resize", App.core.updateScrollButtons);
    }
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

// FIX #7: Map App to window for strict HTML event handlers like oninput="App.shadow.update()"
window.App = App;

// Initialize App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
