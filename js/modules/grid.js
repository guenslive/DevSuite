App.grid = {
    state: {
        currentView: 'desktop',
        selectedId: null,
        // d = desktop, m = mobile
        // cStart = Columna Inicio, cSpan = Cuantas columnas ocupa
        items: [
            { id: 1, d: { cStart: 1, cSpan: 1, rStart: 1, rSpan: 1 }, m: { cStart: 1, cSpan: 1, rStart: 1, rSpan: 1 } },
            { id: 2, d: { cStart: 2, cSpan: 1, rStart: 1, rSpan: 1 }, m: { cStart: 2, cSpan: 1, rStart: 1, rSpan: 1 } },
            { id: 3, d: { cStart: 3, cSpan: 2, rStart: 1, rSpan: 2 }, m: { cStart: 1, cSpan: 2, rStart: 2, rSpan: 1 } }
        ],
        config: {
            desktop: { cols: 5, rows: 5, gap: 10 },
            mobile: { cols: 2, rows: 6, gap: 5 }
        }
    },

    init() {
        App.grid.render();
    },

    setView(view) {
        App.grid.state.currentView = view;

        document.getElementById('view-desktop').classList.toggle('active', view === 'desktop');
        document.getElementById('view-mobile').classList.toggle('active', view === 'mobile');

        const cfg = App.grid.state.config[view];
        document.getElementById('grCols').value = cfg.cols;
        document.getElementById('grRows').value = cfg.rows;
        document.getElementById('grGap').value = cfg.gap;

        const container = document.getElementById('gridPreviewBox');
        if (view === 'mobile') container.classList.add('mobile-view');
        else container.classList.remove('mobile-view');

        App.grid.updateInputsFromSelection(); // Recargar inputs al cambiar vista
        App.grid.render();
    },

    updateConfig() {
        const v = App.grid.state.currentView;
        App.grid.state.config[v].cols = parseInt(document.getElementById('grCols').value) || 1;
        App.grid.state.config[v].rows = parseInt(document.getElementById('grRows').value) || 1;
        App.grid.state.config[v].gap = parseInt(document.getElementById('grGap').value) || 0;
        App.grid.render();
    },

    addItem() {
        const newId = App.grid.state.items.length > 0 ? Math.max(...App.grid.state.items.map(i => i.id)) + 1 : 1;
        // Nuevo ítem: Empieza automático, ocupa 1x1
        App.grid.state.items.push({
            id: newId,
            d: { cStart: '', cSpan: 1, rStart: '', rSpan: 1 },
            m: { cStart: '', cSpan: 1, rStart: '', rSpan: 1 }
        });
        App.grid.selectItem(newId);
        App.grid.render();
    },

    deleteItem() {
        if (!App.grid.state.selectedId) return;
        App.grid.state.items = App.grid.state.items.filter(i => i.id !== App.grid.state.selectedId);
        App.grid.state.selectedId = null;
        App.grid.render();
    },

    selectItem(id) {
        App.grid.state.selectedId = id;
        App.grid.updateInputsFromSelection();
        App.grid.render();
    },

    updateInputsFromSelection() {
        const ctrlPanel = document.getElementById('itemControls');
        if (App.grid.state.selectedId) {
            ctrlPanel.style.opacity = '1';
            ctrlPanel.style.pointerEvents = 'all';
            const v = App.grid.state.currentView;
            const item = App.grid.state.items.find(i => i.id === App.grid.state.selectedId);
            const p = v === 'desktop' ? item.d : item.m;

            document.getElementById('itemColStart').value = p.cStart || '';
            document.getElementById('itemColSpan').value = p.cSpan || 1;
            document.getElementById('itemRowStart').value = p.rStart || '';
            document.getElementById('itemRowSpan').value = p.rSpan || 1;
        } else {
            ctrlPanel.style.opacity = '0.5';
            ctrlPanel.style.pointerEvents = 'none';
        }
    },

    updateItem() {
        const id = App.grid.state.selectedId;
        if (!id) return;

        const item = App.grid.state.items.find(i => i.id === id);
        const v = App.grid.state.currentView;
        const key = v === 'desktop' ? 'd' : 'm';

        // Guardamos valores. Si está vacío es '' (auto), si span está vacío es 1
        item[key].cStart = document.getElementById('itemColStart').value;
        item[key].cSpan = document.getElementById('itemColSpan').value || 1;
        item[key].rStart = document.getElementById('itemRowStart').value;
        item[key].rSpan = document.getElementById('itemRowSpan').value || 1;

        App.grid.render();
    },

    render() {
        const v = App.grid.state.currentView;
        const cfg = App.grid.state.config[v];
        const container = document.getElementById('gridPreviewBox');

        container.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${cfg.rows}, 1fr)`;
        container.style.gap = `${cfg.gap}px`;

        container.innerHTML = '';

        App.grid.state.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'grid-item-pro';
            div.innerText = item.id;

            if (item.id === App.grid.state.selectedId) div.classList.add('selected');

            div.onclick = (e) => {
                e.stopPropagation();
                App.grid.selectItem(item.id);
            };

            const props = v === 'desktop' ? item.d : item.m;

            // Lógica corregida: Usamos SPAN
            // Si cStart tiene valor, lo usa. Si no, usa 'auto'
            const colStart = props.cStart ? props.cStart : 'auto';
            const rowStart = props.rStart ? props.rStart : 'auto';

            // grid-column: start / span X
            div.style.gridColumn = `${colStart} / span ${props.cSpan}`;
            div.style.gridRow = `${rowStart} / span ${props.rSpan}`;

            container.appendChild(div);
        });

        App.grid.generateCode();
    },

    generateCode() {
        const d = App.grid.state.config.desktop;
        const m = App.grid.state.config.mobile;

        const getGridArea = (props) => {
            const cs = props.cStart || 'auto';
            const rs = props.rStart || 'auto';
            // Si es auto/1/auto/1 (default), no imprimir nada para limpiar código
            if (cs === 'auto' && rs === 'auto' && props.cSpan == 1 && props.rSpan == 1) return null;
            return `${rs} / ${cs} / span ${props.rSpan} / span ${props.cSpan}`;
        };

        let css = `.parent {
  display: grid;
  grid-template-columns: repeat(${d.cols}, 1fr);
  grid-template-rows: repeat(${d.rows}, 1fr);
  gap: ${d.gap}px;
}
`;

        App.grid.state.items.forEach(item => {
            const area = getGridArea(item.d);
            if (area) css += `.div${item.id} { grid-area: ${area}; }\n`;
        });

        css += `\n@media (max-width: 768px) {
  .parent {
    grid-template-columns: repeat(${m.cols}, 1fr);
    grid-template-rows: repeat(${m.rows}, 1fr);
    gap: ${m.gap}px;
  }\n`;

        App.grid.state.items.forEach(item => {
            const area = getGridArea(item.m);
            if (area) css += `  .div${item.id} { grid-area: ${area}; }\n`;
        });
        css += `}`;

        document.getElementById('gridResult').innerText = css;

        let html = `<div class="parent">\n`;
        App.grid.state.items.forEach(item => {
            html += `  <div class="div${item.id}">${item.id}</div>\n`;
        });
        html += `</div>`;
        document.getElementById('gridHtmlResult').innerText = html;
    }
};
