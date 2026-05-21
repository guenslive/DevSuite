App.imgsvg = {
    state: {
        imageData: null,
        sourceName: "image",
        svg: ""
    },

    MAX_DIMENSION: 1000,

    zoomState: { zoom: 1, panX: 0, panY: 0, dragging: false, lastX: 0, lastY: 0 },

    init() {
        App.imgsvg.bindZoom();
        const drop = document.getElementById("imgsvgDrop");
        if (!drop || drop.dataset.bound) return;
        drop.dataset.bound = "1";

        ["dragenter", "dragover"].forEach((ev) =>
            drop.addEventListener(ev, (e) => {
                e.preventDefault();
                drop.classList.add("dragover");
            })
        );
        ["dragleave", "drop"].forEach((ev) =>
            drop.addEventListener(ev, (e) => {
                e.preventDefault();
                drop.classList.remove("dragover");
            })
        );
        drop.addEventListener("drop", (e) => {
            const file = e.dataTransfer.files && e.dataTransfer.files[0];
            if (file) App.imgsvg.handleFile(file);
        });
    },

    onFileInput(input) {
        const file = input.files && input.files[0];
        if (file) App.imgsvg.handleFile(file);
    },

    handleFile(file) {
        if (!file.type.startsWith("image/")) {
            App.imgsvg.setStatus("El archivo no es una imagen.", true);
            return;
        }
        App.imgsvg.state.sourceName = file.name.replace(/\.[^.]+$/, "") || "image";

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => App.imgsvg.loadImageData(img);
            img.onerror = () => App.imgsvg.setStatus("No se pudo leer la imagen.", true);
            img.src = e.target.result;
        };
        reader.onerror = () => App.imgsvg.setStatus("No se pudo leer el archivo.", true);
        reader.readAsDataURL(file);
    },

    loadImageData(img) {
        let { width, height } = img;
        const max = App.imgsvg.MAX_DIMENSION;
        if (width > max || height > max) {
            const ratio = Math.min(max / width, max / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        App.imgsvg.state.imageData = ctx.getImageData(0, 0, width, height);

        const orig = document.getElementById("imgsvgOriginal");
        orig.innerHTML = "";
        orig.appendChild(canvas);

        document.getElementById("imgsvgConvertBtn").disabled = false;
        App.imgsvg.setStatus(`Imagen lista (${width}×${height}px). Pulsa Convertir.`);
        App.imgsvg.convert();
    },

    getOptions() {
        const val = (id, def) => {
            const el = document.getElementById(id);
            return el ? parseFloat(el.value) : def;
        };
        return {
            numberofcolors: val("imgsvgColors", 16),
            pathomit: val("imgsvgDetail", 8),
            blurradius: val("imgsvgBlur", 0),
            colorsampling: document.getElementById("imgsvgGray").checked ? 0 : 2,
            ltres: 1,
            qtres: 1,
            colorquantcycles: 3,
            strokewidth: 1,
            roundcoords: 1,
            scale: 1,
            viewbox: true
        };
    },

    convert() {
        if (!App.imgsvg.state.imageData) return;
        if (typeof ImageTracer === "undefined") {
            App.imgsvg.setStatus("La librería ImageTracer no está cargada.", true);
            return;
        }

        App.imgsvg.setStatus("Procesando…");
        setTimeout(() => {
            try {
                const svg = ImageTracer.imagedataToSVG(
                    App.imgsvg.state.imageData,
                    App.imgsvg.getOptions()
                );
                App.imgsvg.state.svg = svg;
                App.imgsvg.render(svg);
            } catch (err) {
                console.error("ImageTracer failed", err);
                App.imgsvg.setStatus("Error al vectorizar la imagen.", true);
            }
        }, 20);
    },

    render(svg) {
        const preview = document.getElementById("imgsvgResult");
        preview.innerHTML = svg;
        const svgEl = preview.querySelector("svg");
        if (svgEl) {
            svgEl.removeAttribute("width");
            svgEl.removeAttribute("height");
            svgEl.style.maxWidth = "100%";
            svgEl.style.height = "auto";
        }
        App.imgsvg.zoomReset();

        const sizeKb = (new Blob([svg]).size / 1024).toFixed(1);
        App.imgsvg.setStatus(`SVG generado (${sizeKb} KB).`);

        document.getElementById("imgsvgDownloadBtn").disabled = false;
        document.getElementById("imgsvgCopyBtn").disabled = false;
    },

    bindZoom() {
        const el = document.getElementById("imgsvgResult");
        if (!el || el.dataset.zoomBound) return;
        el.dataset.zoomBound = "1";

        el.addEventListener("wheel", (e) => {
            if (!App.imgsvg.state.svg) return;
            e.preventDefault();
            App.imgsvg.applyZoom(App.imgsvg.zoomState.zoom * (e.deltaY < 0 ? 1.12 : 0.89));
        }, { passive: false });

        el.addEventListener("pointerdown", (e) => {
            if (!App.imgsvg.state.svg) return;
            const z = App.imgsvg.zoomState;
            z.dragging = true;
            z.lastX = e.clientX;
            z.lastY = e.clientY;
            el.setPointerCapture(e.pointerId);
            el.style.cursor = "grabbing";
        });
        el.addEventListener("pointermove", (e) => {
            const z = App.imgsvg.zoomState;
            if (!z.dragging) return;
            z.panX += e.clientX - z.lastX;
            z.panY += e.clientY - z.lastY;
            z.lastX = e.clientX;
            z.lastY = e.clientY;
            App.imgsvg.applyTransform();
        });
        const end = () => {
            App.imgsvg.zoomState.dragging = false;
            el.style.cursor = "grab";
        };
        el.addEventListener("pointerup", end);
        el.addEventListener("pointercancel", end);
    },

    applyZoom(z) {
        App.imgsvg.zoomState.zoom = Math.min(12, Math.max(0.2, z));
        App.imgsvg.applyTransform();
    },

    zoomBy(factor) {
        App.imgsvg.applyZoom(App.imgsvg.zoomState.zoom * factor);
    },

    zoomReset() {
        const z = App.imgsvg.zoomState;
        z.zoom = 1;
        z.panX = 0;
        z.panY = 0;
        App.imgsvg.applyTransform();
    },

    applyTransform() {
        const svgEl = document.querySelector("#imgsvgResult svg");
        if (!svgEl) return;
        const z = App.imgsvg.zoomState;
        svgEl.style.transformOrigin = "center center";
        svgEl.style.transform = `translate(${z.panX}px, ${z.panY}px) scale(${z.zoom})`;
        const label = document.getElementById("imgsvgZoomLabel");
        if (label) label.textContent = Math.round(z.zoom * 100) + "%";
    },

    copy() {
        if (!App.imgsvg.state.svg) return;
        App.utils.copyTextToClipboard(App.imgsvg.state.svg);
    },

    download() {
        if (!App.imgsvg.state.svg) return;
        const blob = new Blob([App.imgsvg.state.svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = `${App.imgsvg.state.sourceName}.svg`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
    },

    setStatus(msg, isError) {
        const el = document.getElementById("imgsvgStatus");
        if (!el) return;
        el.textContent = msg;
        el.style.color = isError ? "var(--danger, #FF3B30)" : "var(--text-secondary, #8e8e93)";
    }
};
