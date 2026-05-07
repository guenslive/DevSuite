App.contrast = {
    sRGBtoY(rgb) {
        const g = 2.4;
        const sR = Math.pow(rgb.r / 255, g);
        const sG = Math.pow(rgb.g / 255, g);
        const sB = Math.pow(rgb.b / 255, g);
        return sR * 0.2126729 + sG * 0.7151522 + sB * 0.0721750;
    },

    apca(txtHex, bgHex) {
        const txt = App.utils.hexToRgb(txtHex);
        const bg = App.utils.hexToRgb(bgHex);
        if (!txt || !bg) return 0;

        let txtY = App.contrast.sRGBtoY(txt);
        let bgY = App.contrast.sRGBtoY(bg);

        const normBG = 0.56, normTXT = 0.57;
        const revTXT = 0.62, revBG = 0.65;
        const blkThrs = 0.022, blkClmp = 1.414;
        const scaleBoW = 1.14, scaleWoB = 1.14;
        const loBoWoffset = 0.027, loWoBoffset = 0.027;
        const deltaYmin = 0.0005, loClip = 0.1;

        if (txtY < blkThrs) txtY += Math.pow(blkThrs - txtY, blkClmp);
        if (bgY < blkThrs) bgY += Math.pow(blkThrs - bgY, blkClmp);

        if (Math.abs(bgY - txtY) < deltaYmin) return 0;

        let out;
        if (bgY > txtY) {
            const SAPC = (Math.pow(bgY, normBG) - Math.pow(txtY, normTXT)) * scaleBoW;
            out = SAPC < loClip ? 0 : SAPC - loBoWoffset;
        } else {
            const SAPC = (Math.pow(bgY, revBG) - Math.pow(txtY, revTXT)) * scaleWoB;
            out = SAPC > -loClip ? 0 : SAPC + loWoBoffset;
        }
        return out * 100;
    },

    apcaLevel(lc) {
        const abs = Math.abs(lc);
        if (abs >= 90) return { label: "AAA body text", tier: "excellent" };
        if (abs >= 75) return { label: "AA body / AAA large", tier: "good" };
        if (abs >= 60) return { label: "AA body minimum", tier: "good" };
        if (abs >= 45) return { label: "AA large / headlines", tier: "fair" };
        if (abs >= 30) return { label: "Non-content only", tier: "fair" };
        if (abs >= 15) return { label: "Incidental", tier: "fail" };
        return { label: "Insufficient", tier: "fail" };
    },

    wcagRatio(fgHex, bgHex) {
        const rgb1 = App.utils.hexToRgb(fgHex);
        const rgb2 = App.utils.hexToRgb(bgHex);
        if (!rgb1 || !rgb2) return 1;
        const lum1 = App.utils.getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const lum2 = App.utils.getLuminance(rgb2.r, rgb2.g, rgb2.b);
        return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    },

    suggest(targetHex, otherHex, minRatio = 4.5) {
        if (App.contrast.wcagRatio(targetHex, otherHex) >= minRatio) return targetHex;
        const rgbOther = App.utils.hexToRgb(otherHex);
        if (!rgbOther) return targetHex;
        const otherLum = App.utils.getLuminance(rgbOther.r, rgbOther.g, rgbOther.b);
        const direction = otherLum > 0.5 ? -1 : 1;
        let candidate = targetHex;
        for (let step = 1; step <= 255; step++) {
            candidate = App.utils.adjustColor(targetHex, direction * step);
            if (App.contrast.wcagRatio(candidate, otherHex) >= minRatio) return candidate;
        }
        return direction > 0 ? "#FFFFFF" : "#000000";
    },

    applySuggestion(which) {
        const fg = document.getElementById("fgColor").value;
        const bg = document.getElementById("bgColor").value;
        if (which === "fg") {
            const suggested = App.contrast.suggest(fg, bg, 4.5);
            App.syncProPicker("fg", suggested);
        } else {
            const suggested = App.contrast.suggest(bg, fg, 4.5);
            App.syncProPicker("bg", suggested);
        }
    },

    updateBadge(id, pass) {
        const el = document.getElementById(id);
        if (!el) return;
        if (pass) { el.innerText = "PASS"; el.className = "res-badge pass"; }
        else { el.innerText = "FAIL"; el.className = "res-badge fail"; }
    },

    calc() {
        const fg = document.getElementById("fgColor").value;
        const bg = document.getElementById("bgColor").value;
        const rgb1 = App.utils.hexToRgb(fg);
        const rgb2 = App.utils.hexToRgb(bg);
        if (!rgb1 || !rgb2) return;

        const ratio = App.contrast.wcagRatio(fg, bg);
        const lc = App.contrast.apca(fg, bg);
        const level = App.contrast.apcaLevel(lc);

        document.getElementById("contrastScore").innerText = ratio.toFixed(2);
        document.getElementById("contrastPreviewBox").style.backgroundColor = bg;
        document.getElementById("contrastPreviewBox").style.color = fg;

        const r = document.getElementById("contrastRating");
        r.innerText = ratio >= 7 ? "Excellent (AAA)"
            : ratio >= 4.5 ? "Good (AA)"
            : ratio >= 3 ? "Fair (Large)"
            : "Fail";

        App.contrast.updateBadge("badgeAA", ratio >= 4.5);
        App.contrast.updateBadge("badgeAALg", ratio >= 3);
        App.contrast.updateBadge("badgeAAA", ratio >= 7);
        App.contrast.updateBadge("badgeAAALg", ratio >= 4.5);

        const apcaScoreEl = document.getElementById("apcaScore");
        const apcaLevelEl = document.getElementById("apcaLevel");
        if (apcaScoreEl) apcaScoreEl.innerText = (lc >= 0 ? "+" : "") + lc.toFixed(1) + " Lc";
        if (apcaLevelEl) {
            apcaLevelEl.innerText = level.label;
            apcaLevelEl.className = "apca-level apca-" + level.tier;
        }

        const fgFixEl = document.getElementById("fgFixPreview");
        const bgFixEl = document.getElementById("bgFixPreview");
        if (fgFixEl) {
            const s = App.contrast.suggest(fg, bg, 4.5);
            fgFixEl.style.background = s;
            fgFixEl.setAttribute("title", s);
            fgFixEl.nextElementSibling && (fgFixEl.nextElementSibling.innerText = s.toUpperCase());
        }
        if (bgFixEl) {
            const s = App.contrast.suggest(bg, fg, 4.5);
            bgFixEl.style.background = s;
            bgFixEl.setAttribute("title", s);
            bgFixEl.nextElementSibling && (bgFixEl.nextElementSibling.innerText = s.toUpperCase());
        }
    },
};
