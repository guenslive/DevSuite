App.contrast = {
    calc() {
        const fg = document.getElementById("fgColor").value;
        const bg = document.getElementById("bgColor").value;
        const rgb1 = App.utils.hexToRgb(fg);
        const rgb2 = App.utils.hexToRgb(bg);
        if (!rgb1 || !rgb2) return;
        const lum1 = App.utils.getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const lum2 = App.utils.getLuminance(rgb2.r, rgb2.g, rgb2.b);
        const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
        document.getElementById("contrastScore").innerText = ratio.toFixed(2);
        document.getElementById("contrastPreviewBox").style.backgroundColor = bg;
        document.getElementById("contrastPreviewBox").style.color = fg;
        const r = document.getElementById("contrastRating");
        r.innerText = ratio >= 7 ? "Excellent (AAA)" : ratio >= 4.5 ? "Good (AA)" : ratio >= 3 ? "Fair (Large)" : "Fail";
        App.contrast.updateBadge("badgeAA", ratio >= 4.5);
        App.contrast.updateBadge("badgeAALg", ratio >= 3);
        App.contrast.updateBadge("badgeAAA", ratio >= 7);
        App.contrast.updateBadge("badgeAAALg", ratio >= 4.5);
    },
    updateBadge(id, pass) {
        const el = document.getElementById(id);
        if (pass) { el.innerText = "PASS"; el.className = "res-badge pass"; } else { el.innerText = "FAIL"; el.className = "res-badge fail"; }
    },
};
