App.typescale = {
    rafPending: false,

    ratios: [
        { value: 1.067, name: "Minor Second" },
        { value: 1.125, name: "Major Second" },
        { value: 1.200, name: "Minor Third" },
        { value: 1.250, name: "Major Third" },
        { value: 1.333, name: "Perfect Fourth" },
        { value: 1.414, name: "Augmented Fourth" },
        { value: 1.500, name: "Perfect Fifth" },
        { value: 1.618, name: "Golden Ratio" }
    ],

    fontStacks: {
        system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        serif: "'Georgia', 'Times New Roman', serif",
        mono: "'SF Mono', 'Consolas', 'Courier New', monospace",
        display: "'Helvetica Neue', 'Arial Black', sans-serif"
    },

    update() {
        if (App.typescale.rafPending) return;
        App.typescale.rafPending = true;
        requestAnimationFrame(() => {
            App.typescale._performUpdate();
            App.typescale.rafPending = false;
        });
    },

    _performUpdate() {
        const base = parseFloat(document.getElementById("tsBase").value) || 16;
        const ratio = parseFloat(document.getElementById("tsRatio").value) || 1.25;
        const stepsUp = parseInt(document.getElementById("tsStepsUp").value) || 6;
        const stepsDown = parseInt(document.getElementById("tsStepsDown").value) || 2;
        const fontKey = document.getElementById("tsFont").value;
        const fluid = document.getElementById("tsFluid").checked;
        const asUtilities = document.getElementById("tsUtilities").checked;
        const sampleText = document.getElementById("tsSample").value || "The quick brown fox";

        document.getElementById("valTsBase").innerText = base + "px";
        document.getElementById("valTsStepsUp").innerText = stepsUp;
        document.getElementById("valTsStepsDown").innerText = stepsDown;

        const steps = [];
        for (let i = stepsDown; i > 0; i--) {
            steps.push({ step: -i, px: base / Math.pow(ratio, i) });
        }
        steps.push({ step: 0, px: base });
        for (let i = 1; i <= stepsUp; i++) {
            steps.push({ step: i, px: base * Math.pow(ratio, i) });
        }

        const fontStack = App.typescale.fontStacks[fontKey] || App.typescale.fontStacks.system;
        const previewBox = document.getElementById("typescalePreview");
        previewBox.innerHTML = steps
            .slice()
            .reverse()
            .map(s => {
                const px = s.px.toFixed(2);
                const rem = (s.px / 16).toFixed(3);
                const label = s.step === 0 ? "base" : (s.step > 0 ? "+" + s.step : s.step);
                return `
                    <div class="typescale-sample-row">
                        <span class="typescale-sample-meta">step ${label} · ${px}px · ${rem}rem</span>
                        <span class="typescale-sample-text" style="font-size: ${px}px; font-family: ${fontStack};">${App.typescale._escapeHtml(sampleText)}</span>
                    </div>
                `;
            }).join("");

        const lines = [":root {"];
        const utilityLines = [];

        const MIN_VW = 320;
        const MAX_VW = 1440;
        const mobileRatio = Math.max(1.05, ratio - 0.1);
        const mobileBase = Math.max(12, base * 0.9);

        steps.forEach(s => {
            const desktopPx = s.px;
            const mobilePx = s.step >= 0
                ? mobileBase * Math.pow(mobileRatio, s.step)
                : desktopPx;
            const varName = `--step-${s.step >= 0 ? s.step : "minus-" + Math.abs(s.step)}`;

            let value;
            if (fluid && desktopPx !== mobilePx) {
                const minPx = Math.min(mobilePx, desktopPx);
                const maxPx = Math.max(mobilePx, desktopPx);
                const slope = (maxPx - minPx) / (MAX_VW - MIN_VW);
                const interceptPx = minPx - slope * MIN_VW;
                const vwVal = (slope * 100).toFixed(3);
                const interceptRem = (interceptPx / 16).toFixed(3);
                const minRem = (minPx / 16).toFixed(3);
                const maxRem = (maxPx / 16).toFixed(3);
                value = `clamp(${minRem}rem, ${interceptRem}rem + ${vwVal}vw, ${maxRem}rem)`;
            } else {
                value = `${(desktopPx / 16).toFixed(3)}rem`;
            }

            lines.push(`    ${varName}: ${value};`);

            if (asUtilities) {
                const cls = s.step >= 0 ? s.step : "minus-" + Math.abs(s.step);
                utilityLines.push(`.text-step-${cls} { font-size: var(${varName}); }`);
            }
        });
        lines.push("}");

        let css = lines.join("\n");
        if (asUtilities) {
            css += "\n\n" + utilityLines.join("\n");
        }

        document.getElementById("typescaleResult").innerText = css;
    },

    _escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }
};
