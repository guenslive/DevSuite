App.palette = {
    state: {
        baseColor: "#007aff",
        harmony: "analogous"
    },
    init() {
        this.generate();
    },
    updateBaseColor(hex) {
        this.state.baseColor = hex;
        this.generate();
    },
    setHarmony(val) {
        this.state.harmony = val;
        this.generate();
    },
    generate() {
        const hex = this.state.baseColor;
        const rgb = App.utils.hexToRgb(hex);
        if (!rgb) return;
        
        // Calculate HSL
        const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        // Update UI Info
        this.updateHeaderInfo(hex, rgb, { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) });

        // Generate selected harmony
        let colors = [];
        const type = this.state.harmony;

        if (['shades', 'tints', 'tones'].includes(type)) {
            // Remove 's' from end to match method param
            colors = this.getVariations(h, s, l, type.slice(0, -1));
        } else {
            colors = this.getHarmony(h, s, l, type);
        }

        this.render(colors);
    },
    updateHeaderInfo(hex, rgb, hsl) {
        const infoContainer = document.getElementById('paletteInfo');
        if(infoContainer) {
            infoContainer.innerHTML = `
                <div class="color-val"><strong>HEX</strong> ${hex.toUpperCase()}</div>
                <div class="color-val"><strong>RGB</strong> ${rgb.r}, ${rgb.g}, ${rgb.b}</div>
                <div class="color-val"><strong>HSL</strong> ${hsl.h}, ${hsl.s}%, ${hsl.l}%</div>
            `;
        }
    },
    getVariations(h, s, l, type) {
        const colors = [];
        const steps = 6; // Fewer steps for cleaner look
        
        for (let i = 0; i < steps; i++) {
            let newL = l;
            let newS = s;
            const factor = i / (steps - 1);

            if (type === 'shade') {
                newL = l * (1 - factor); 
            } else if (type === 'tint') {
                newL = l + (1 - l) * factor; 
            } else if (type === 'tone') {
                newS = s * (1 - factor); 
            }
            
            colors.push(this.hslToHex(h, newS, newL));
        }
        // Sort by luminance for better visual
        if(type === 'shade') colors.reverse();
        
        return colors;
    },
    getHarmony(h, s, l, type) {
        const colors = [];
        const baseH = h * 360;
        
        const add = (hue, sat, lum) => {
            colors.push(this.hslToHex(hue / 360, sat, lum));
        };

        switch (type) {
            case "analogous":
                add(baseH, s, l);
                add(baseH + 30, s, l);
                add(baseH - 30, s, l);
                break;
            case "monochromatic":
                add(baseH, s, l);
                add(baseH, s, Math.max(0, l - 0.2));
                add(baseH, s, Math.min(1, l + 0.3));
                break;
            case "complementary":
                add(baseH, s, l);
                add(baseH + 180, s, l);
                break;
            case "split":
                add(baseH, s, l);
                add(baseH + 150, s, l);
                add(baseH + 210, s, l);
                break;
            case "triadic":
                add(baseH, s, l);
                add(baseH + 120, s, l);
                add(baseH + 240, s, l);
                break;
            case "tetradic":
                add(baseH, s, l);
                add(baseH + 90, s, l);
                add(baseH + 180, s, l);
                add(baseH + 270, s, l);
                break;
            case "square":
                add(baseH, s, l);
                add(baseH + 90, s, l);
                add(baseH + 180, s, l);
                add(baseH + 270, s, l);
                break;
        }
        return colors;
    },
    hslToHex(h, s, l) {
        h = (h % 1 + 1) % 1;
        const rgb = App.utils.hslToRgb(h, s, l);
        return App.utils.rgbToHex(rgb.r, rgb.g, rgb.b);
    },
    render(colors) {
        const container = document.getElementById("paletteContainer");
        container.innerHTML = "";
        
        // Create a large grid for the selected harmony
        const grid = document.createElement("div");
        grid.className = "palette-large-grid";
        
        colors.forEach((color, index) => {
            const card = document.createElement("div");
            card.className = "palette-card-large";
            card.style.background = color;
            card.style.animationDelay = `${index * 0.05}s`;
            
            card.onclick = () => {
                navigator.clipboard.writeText(color);
                const span = card.querySelector(".hex-code");
                const oldText = span.innerText;
                span.innerText = "COPIED!";
                card.classList.add("copied");
                setTimeout(() => {
                    span.innerText = oldText;
                    card.classList.remove("copied");
                }, 1000);
            };
            
            // Determine text color
            const rgb = App.utils.hexToRgb(color);
            const lum = App.utils.getLuminance(rgb.r, rgb.g, rgb.b);
            const textColor = lum > 0.5 ? "#000" : "#fff";

            card.innerHTML = `
                <div class="card-info" style="color: ${textColor}">
                    <span class="hex-code">${color}</span>
                    <span class="rgb-code" style="opacity: 0.7; font-size: 0.75rem;">${rgb.r}, ${rgb.g}, ${rgb.b}</span>
                </div>
            `;
            grid.appendChild(card);
        });

        container.appendChild(grid);
    },
    random() {
        const randomColor = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        App.syncProPicker('pal', randomColor);
    }
};
