App.placeholder = {
    update(animate) {
        App.placeholder.draw();
        if (animate) {
            const c = document.getElementById("placeholderCanvas");
            c.style.transform = "scale(1.02)";
            setTimeout(() => (c.style.transform = "scale(1)"), 150);
        }
    },
    draw() {
        const c = document.getElementById("placeholderCanvas");
        const ctx = c.getContext("2d");
        const w = parseInt(document.getElementById("phWidth").value) || 300;
        const h = parseInt(document.getElementById("phHeight").value) || 150;
        let t = document.getElementById("phText").value;
        if (!t) t = `${w} x ${h}`;
        c.width = w; c.height = h;
        ctx.fillStyle = document.getElementById("phBgColor").value;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = document.getElementById("phTextColor").value;
        ctx.font = `${document.getElementById("phFontWeight").value} ${document.getElementById("phFontSize").value}px -apple-system, sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(t, w / 2, h / 2);
    },
    download() {
        const w = parseInt(document.getElementById("phWidth").value) || 300;
        const h = parseInt(document.getElementById("phHeight").value) || 150;
        const l = document.createElement("a");
        l.download = `${w}x${h}.jpg`;
        l.href = document.getElementById("placeholderCanvas").toDataURL("image/jpeg");
        l.click();
    },
    randomColor() {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        App.syncProPicker('phBg', randomColor);
    }
};
