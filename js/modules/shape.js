App.shape = {
    state: { tool: "blob", blobType: "solid" },
    switchTool(tool) {
        App.shape.state.tool = tool;
        document.getElementById("shapeToolBlob").classList.toggle("active", tool === "blob");
        document.getElementById("shapeToolTriangle").classList.toggle("active", tool === "triangle");
        document.getElementById("shapeToolClipPath").classList.toggle("active", tool === "clipPath");

        document.getElementById("controls-blob").style.display = tool === "blob" ? "block" : "none";
        document.getElementById("controls-triangle").style.display = tool === "triangle" ? "block" : "none";
        document.getElementById("controls-clip-path").style.display = tool === "clipPath" ? "block" : "none";

        const blobPreview = document.getElementById("blobPreview");
        const trianglePreview = document.getElementById("trianglePreview");

        if (tool === 'clipPath') {
            blobPreview.style.display = "block";
            trianglePreview.style.display = "none";
            // FIX: Reset styles from Blob tool to avoid interference
            blobPreview.style.borderRadius = "0";
            blobPreview.style.background = "var(--apple-blue)";
            blobPreview.style.border = "none";
            blobPreview.style.boxShadow = "none";
            App.shape.clipPath.update();
        } else if (tool === 'triangle') {
            blobPreview.style.display = "none";
            trianglePreview.style.display = "block";
            App.shape.generateTriangle();
        } else { // blob
            blobPreview.style.display = "block";
            trianglePreview.style.display = "none";
            blobPreview.style.clipPath = "none"; // Remove clip-path
            App.shape.generateBlob();
        }
    },

    clipPath: {
        state: {
            points: [],
            draggedPoint: null,
            svg: null,
            polygon: null,
            container: null,
        },

        shapes: {
            triangle: [{ x: 50, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }],
            trapezoid: [{ x: 20, y: 0 }, { x: 80, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
            parallelogram: [{ x: 25, y: 0 }, { x: 100, y: 0 }, { x: 75, y: 100 }, { x: 0, y: 100 }],
            rhombus: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }],
            pentagon: [{ x: 50, y: 0 }, { x: 100, y: 38 }, { x: 82, y: 100 }, { x: 18, y: 100 }, { x: 0, y: 38 }],
            hexagon: [{ x: 25, y: 0 }, { x: 75, y: 0 }, { x: 100, y: 50 }, { x: 75, y: 100 }, { x: 25, y: 100 }, { x: 0, y: 50 }],
            heptagon: [{ x: 50, y: 0 }, { x: 90, y: 20 }, { x: 100, y: 60 }, { x: 75, y: 100 }, { x: 25, y: 100 }, { x: 0, y: 60 }, { x: 10, y: 20 }],
            octagon: [{ x: 30, y: 0 }, { x: 70, y: 0 }, { x: 100, y: 30 }, { x: 100, y: 70 }, { x: 70, y: 100 }, { x: 30, y: 100 }, { x: 0, y: 70 }, { x: 0, y: 30 }],
            nonagon: [{ x: 50, y: 0 }, { x: 83, y: 12 }, { x: 100, y: 43 }, { x: 94, y: 78 }, { x: 68, y: 100 }, { x: 32, y: 100 }, { x: 6, y: 78 }, { x: 0, y: 43 }, { x: 17, y: 12 }],
            decagon: [{ x: 50, y: 0 }, { x: 80, y: 10 }, { x: 100, y: 35 }, { x: 100, y: 70 }, { x: 80, y: 90 }, { x: 50, y: 100 }, { x: 20, y: 90 }, { x: 0, y: 70 }, { x: 0, y: 35 }, { x: 20, y: 10 }],
            bevel: [{ x: 20, y: 0 }, { x: 80, y: 0 }, { x: 100, y: 20 }, { x: 100, y: 80 }, { x: 80, y: 100 }, { x: 20, y: 100 }, { x: 0, y: 80 }, { x: 0, y: 20 }],
            rabbet: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 75 }, { x: 75, y: 75 }, { x: 75, y: 100 }, { x: 25, y: 100 }, { x: 25, y: 75 }, { x: 0, y: 75 }],
            leftArrow: [{ x: 40, y: 0 }, { x: 40, y: 20 }, { x: 100, y: 20 }, { x: 100, y: 80 }, { x: 40, y: 80 }, { x: 40, y: 100 }, { x: 0, y: 50 }],
            rightArrow: [{ x: 0, y: 20 }, { x: 60, y: 20 }, { x: 60, y: 0 }, { x: 100, y: 50 }, { x: 60, y: 100 }, { x: 60, y: 80 }, { x: 0, y: 80 }],
            leftPoint: [{ x: 25, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 25, y: 100 }, { x: 0, y: 50 }],
            rightPoint: [{ x: 0, y: 0 }, { x: 75, y: 0 }, { x: 100, y: 50 }, { x: 75, y: 100 }, { x: 0, y: 100 }],
            star: [{ x: 50, y: 0 }, { x: 61, y: 35 }, { x: 98, y: 35 }, { x: 68, y: 57 }, { x: 79, y: 91 }, { x: 50, y: 70 }, { x: 21, y: 91 }, { x: 32, y: 57 }, { x: 2, y: 35 }, { x: 39, y: 35 }],
            cross: [{ x: 10, y: 25 }, { x: 35, y: 25 }, { x: 35, y: 0 }, { x: 65, y: 0 }, { x: 65, y: 25 }, { x: 90, y: 25 }, { x: 90, y: 50 }, { x: 65, y: 50 }, { x: 65, y: 100 }, { x: 35, y: 100 }, { x: 35, y: 50 }, { x: 10, y: 50 }],
            message: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 75 }, { x: 75, y: 75 }, { x: 75, y: 100 }, { x: 50, y: 75 }, { x: 0, y: 75 }],
            close: [{ x: 20, y: 0 }, { x: 0, y: 20 }, { x: 30, y: 50 }, { x: 0, y: 80 }, { x: 20, y: 100 }, { x: 50, y: 70 }, { x: 80, y: 100 }, { x: 100, y: 80 }, { x: 70, y: 50 }, { x: 100, y: 20 }, { x: 80, y: 0 }, { x: 50, y: 30 }],
            frame: [{ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 25, y: 100 }, { x: 25, y: 25 }, { x: 75, y: 25 }, { x: 75, y: 75 }, { x: 25, y: 75 }, { x: 25, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 }],
            leftChevron: [{ x: 100, y: 0 }, { x: 75, y: 50 }, { x: 100, y: 100 }, { x: 25, y: 100 }, { x: 0, y: 50 }, { x: 25, y: 0 }],
            rightChevron: [{ x: 75, y: 0 }, { x: 100, y: 50 }, { x: 75, y: 100 }, { x: 0, y: 100 }, { x: 25, y: 50 }, { x: 0, y: 0 }],
            minus: [{ x: 0, y: 40 }, { x: 100, y: 40 }, { x: 100, y: 60 }, { x: 0, y: 60 }]
        },

        setShape(name) {
            if (this.shapes[name]) {
                // Deep copy to avoid reference issues
                this.state.points = JSON.parse(JSON.stringify(this.shapes[name]));
                this.update();
            }
        },

        init() {
            if (this.state.svg) return; // Ya inicializado

            this.state.container = document.getElementById('clipPathContainer');
            const svgNS = "http://www.w3.org/2000/svg";
            this.state.svg = document.createElementNS(svgNS, "svg");
            this.state.svg.setAttribute('width', '100%');
            this.state.svg.setAttribute('height', '100%');
            this.state.svg.setAttribute('viewBox', '0 0 100 100');
            this.state.svg.style.overflow = 'visible';

            this.state.polygon = document.createElementNS(svgNS, "polygon");
            this.state.polygon.setAttribute('fill', 'rgba(0, 122, 255, 0.3)');
            this.state.polygon.setAttribute('stroke', 'var(--apple-blue)');
            this.state.polygon.setAttribute('stroke-width', '0.5');
            this.state.svg.appendChild(this.state.polygon);

            this.state.container.appendChild(this.state.svg);

            this.state.svg.addEventListener('mousedown', this.handlePointerDown.bind(this));
            this.state.svg.addEventListener('mousemove', this.handlePointerMove.bind(this));
            window.addEventListener('mouseup', this.handlePointerUp.bind(this));

            this.state.svg.addEventListener('touchstart', this.handlePointerDown.bind(this), { passive: false });
            this.state.svg.addEventListener('touchmove', this.handlePointerMove.bind(this), { passive: false });
            window.addEventListener('touchend', this.handlePointerUp.bind(this));

            this.reset();
        },

        reset() {
            this.state.points = [{ x: 20, y: 20 }, { x: 80, y: 20 }, { x: 80, y: 80 }, { x: 20, y: 80 }];
            this.update();
        },

        getMousePos(evt) {
            const rect = this.state.svg.getBoundingClientRect();
            const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
            const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
            return {
                x: ((clientX - rect.left) / rect.width) * 100,
                y: ((clientY - rect.top) / rect.height) * 100
            };
        },

        handlePointerDown(evt) {
            evt.preventDefault();
            const pos = this.getMousePos(evt);
            const target = evt.target;
            if (target.tagName === 'circle') {
                this.state.draggedPoint = this.state.points[parseInt(target.getAttribute('data-index'))];
            } else {
                this.addPoint(pos);
            }
        },

        handlePointerMove(evt) {
            if (this.state.draggedPoint) {
                evt.preventDefault();
                const pos = this.getMousePos(evt);
                this.state.draggedPoint.x = Math.max(0, Math.min(100, pos.x));
                this.state.draggedPoint.y = Math.max(0, Math.min(100, pos.y));
                this.update();
            }
        },

        handlePointerUp() {
            this.state.draggedPoint = null;
        },

        addPoint(pos) {
            // Evitar añadir puntos demasiado juntos
            const lastPoint = this.state.points[this.state.points.length - 1];
            if (lastPoint) {
                const dist = Math.sqrt(Math.pow(pos.x - lastPoint.x, 2) + Math.pow(pos.y - lastPoint.y, 2));
                if (dist < 5) return;
            }
            this.state.points.push({ x: pos.x, y: pos.y });
            this.update();
        },

        update() {
            if (App.shape.state.tool !== 'clipPath') return;
            if (!this.state.svg) this.init();

            // Limpiar puntos de control viejos
            const oldCircles = this.state.svg.querySelectorAll('circle');
            oldCircles.forEach(c => c.remove());

            const svgPoints = this.state.points.map(p => `${p.x},${p.y}`).join(' ');
            this.state.polygon.setAttribute('points', svgPoints);

            const svgNS = "http://www.w3.org/2000/svg";
            this.state.points.forEach((p, index) => {
                const circle = document.createElementNS(svgNS, "circle");
                circle.setAttribute('cx', p.x);
                circle.setAttribute('cy', p.y);
                circle.setAttribute('r', '2');
                circle.setAttribute('fill', '#ffffff');
                circle.setAttribute('stroke', 'var(--apple-blue)');
                circle.setAttribute('stroke-width', '0.5');
                circle.setAttribute('data-index', index);
                circle.style.cursor = 'grab';
                this.state.svg.appendChild(circle);
            });

            const cssPoints = this.state.points.map(p => `${p.x.toFixed(1)}% ${p.y.toFixed(1)}%`).join(', ');
            const cssClipPath = `polygon(${cssPoints})`;

            document.getElementById('blobPreview').style.clipPath = cssClipPath;
            document.getElementById('shapeResult').innerText = `clip-path: ${cssClipPath};`;
        }
    },

    setBlobType(type) {
        App.shape.state.blobType = type;
        document.querySelectorAll("#controls-blob .blob-type-btn").forEach((b) => b.classList.remove("active"));
        const capType = type.charAt(0).toUpperCase() + type.slice(1);
        const btn = document.getElementById(`type${capType}`);
        if (btn) btn.classList.add("active");
        document.getElementById("blobCol2Group").style.display = type === "gradient" ? "block" : "none";
        document.getElementById("blobOutlineGroup").style.display = type === "outline" ? "grid" : "none";
        App.shape.generateBlob();
    },
    updateBlobSize() {
        const size = document.getElementById("blobSize").value;
        const blob = document.getElementById("blobPreview");
        blob.style.width = size + "px";
        blob.style.height = size + "px";
        document.getElementById("valSize").innerText = size + "px";
    },
    generateBlob() {
        if (App.shape.state.tool !== "blob") return;
        const complexity = parseFloat(document.getElementById("blobComplexity").value);
        const smoothness = parseFloat(document.getElementById("blobSmoothness").value);
        document.getElementById("valComplexity").innerText = complexity;
        document.getElementById("valSmoothness").innerText = smoothness;
        const r = [];
        for (let i = 0; i < 8; i++) {
            const range = (1 - smoothness) * 40 + 10;
            const variance = Math.floor(Math.random() * range * complexity);
            const val = Math.random() > 0.5 ? 50 + variance : 50 - variance;
            r.push(Math.max(10, Math.min(90, val)));
        }
        const radius = `${r[0]}% ${r[1]}% ${r[2]}% ${r[3]}% / ${r[4]}% ${r[5]}% ${r[6]}% ${r[7]}%`;
        const blob = document.getElementById("blobPreview");
        const c1 = document.getElementById("blobC1Color").value;
        const c2 = App.shape.state.blobType === "gradient" ? document.getElementById("blobC2Color").value : "";
        const bw = document.getElementById("blobBorderWidth").value;
        document.getElementById("valBorder").innerText = bw + "px";
        const size = document.getElementById("blobSize").value;
        let css = `border-radius: ${radius};\nwidth: ${size}px;\nheight: ${size}px;`;
        if (App.shape.state.blobType === "solid") {
            css += `\nbackground: ${c1};`;
            blob.style = `${css} transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 10px 30px rgba(0,0,0,0.15);`;
        } else if (App.shape.state.blobType === "gradient") {
            css += `\nbackground: linear-gradient(135deg, ${c1}, ${c2});`;
            blob.style = `${css} transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 10px 30px rgba(0,0,0,0.15);`;
        } else if (App.shape.state.blobType === "outline") {
            css += `\nborder: ${bw}px solid ${c1};\nbackground: transparent;`;
            blob.style = `${css} transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: none;`;
        }
        document.getElementById("shapeResult").innerText = css;
    },
    generateTriangle() {
        const dir = document.getElementById("triDirection").value;
        const color = document.getElementById("triColor").value;
        const w = parseInt(document.getElementById("triWidth").value);
        const h = parseInt(document.getElementById("triHeight").value);
        document.getElementById("valTriW").innerText = w + "px";
        document.getElementById("valTriH").innerText = h + "px";
        const el = document.getElementById("trianglePreview");
        let css = `width: 0;\nheight: 0;\nborder-style: solid;`;
        let borderWidth = "", borderColor = "";
        switch (dir) {
            case "top": borderWidth = `0 ${w / 2}px ${h}px ${w / 2}px`; borderColor = `transparent transparent ${color} transparent`; break;
            case "bottom": borderWidth = `${h}px ${w / 2}px 0 ${w / 2}px`; borderColor = `${color} transparent transparent transparent`; break;
            case "left": borderWidth = `${h / 2}px ${w}px ${h / 2}px 0`; borderColor = `transparent ${color} transparent transparent`; break;
            case "right": borderWidth = `${h / 2}px 0 ${h / 2}px ${w}px`; borderColor = `transparent transparent transparent ${color}`; break;
            case "top-left": borderWidth = `${h}px ${w}px 0 0`; borderColor = `${color} transparent transparent transparent`; break;
            case "top-right": borderWidth = `0 ${w}px ${h}px 0`; borderColor = `transparent ${color} transparent transparent`; break;
            case "bottom-left": borderWidth = `${h}px 0 0 ${w}px`; borderColor = `transparent transparent transparent ${color}`; break;
            case "bottom-right": borderWidth = `0 0 ${h}px ${w}px`; borderColor = `transparent transparent ${color} transparent`; break;
        }
        css += `\nborder-width: ${borderWidth};\nborder-color: ${borderColor};`;
        el.style.cssText = css + "transition: all 0.2s;";
        document.getElementById("shapeResult").innerText = css;
    },
};
