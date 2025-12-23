App.flex = {
    state: { itemCount: 3 },
    init() {
        const container = document.getElementById("flexPreview");
        container.innerHTML = "";
        App.flex.state.itemCount = 3;
        for (let i = 1; i <= 3; i++) { setTimeout(() => { App.flex.modifyItems(0, true); }, i * 100); }
        App.flex.update();
        this.initFavorites();
    },
    modifyItems(amount, forceAdd = false) {
        const container = document.getElementById("flexPreview");
        // FIX #2: Logic Race Condition Fix using class 'removing'
        const visibleItems = container.querySelectorAll('.flex-item:not(.removing)');
        const currentCount = visibleItems.length;
        let targetCount = App.flex.state.itemCount + amount;
        if (forceAdd) targetCount = currentCount + 1;
        if (targetCount < 1) targetCount = 1;
        if (targetCount > 20) targetCount = 20;
        App.flex.state.itemCount = targetCount;

        if (targetCount > currentCount) {
            const diff = targetCount - currentCount;
            for (let i = 0; i < diff; i++) {
                const num = currentCount + i + 1;
                const div = document.createElement("div");
                div.className = "flex-item";
                div.innerText = num;
                if (num % 2 === 0) div.style.height = "50px";
                if (num % 3 === 0) div.style.height = "70px";
                container.appendChild(div);
            }
        } else if (targetCount < currentCount) {
            const diff = currentCount - targetCount;
            const itemsToRemove = Array.from(visibleItems).slice(-diff);
            itemsToRemove.forEach(node => {
                node.classList.add('removing'); // Mark for removal
                setTimeout(() => node.remove(), 200);
            });
        }
    },
    update() {
        const dir = document.getElementById("fxDir").value, wrap = document.getElementById("fxWrap").value, justify = document.getElementById("fxJustify").value;
        const align = document.getElementById("fxAlign").value, gap = document.getElementById("fxGap").value;
        document.getElementById("valFxGap").innerText = gap + "px";
        const container = document.getElementById("flexPreview");
        container.style.display = "flex"; container.style.flexDirection = dir; container.style.flexWrap = wrap;
        container.style.justifyContent = justify; container.style.alignItems = align; container.style.gap = gap + "px";
        document.getElementById("flexResult").innerText = `display: flex;\nflex-direction: ${dir};\nflex-wrap: ${wrap};\njustify-content: ${justify};\nalign-items: ${align};\ngap: ${gap}px;`;
    },

    /* --- FAVORITES SYSTEM --- */
    favorites: [],
    
    initFavorites() {
        const stored = localStorage.getItem('flexFavorites');
        if (stored) {
            try {
                this.favorites = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse flex favorites", e);
                this.favorites = [];
            }
        }
        this.renderFavorites();
    },

    async saveFavorite() {
        const defaultName = "Flex Layout " + (this.favorites.length + 1);
        const name = await App.core.modal.prompt("Nombre de la configuración", defaultName);
        if (!name) return;

        const config = {
            name: name,
            itemCount: this.state.itemCount,
            settings: {
                dir: document.getElementById("fxDir").value,
                wrap: document.getElementById("fxWrap").value,
                justify: document.getElementById("fxJustify").value,
                align: document.getElementById("fxAlign").value,
                gap: document.getElementById("fxGap").value
            }
        };

        this.favorites.push(config);
        localStorage.setItem('flexFavorites', JSON.stringify(this.favorites));
        this.renderFavorites();
    },

    loadFavorite(index) {
        const config = this.favorites[index];
        if (!config) return;

        // Restore settings
        document.getElementById("fxDir").value = config.settings.dir;
        document.getElementById("fxWrap").value = config.settings.wrap;
        document.getElementById("fxJustify").value = config.settings.justify;
        document.getElementById("fxAlign").value = config.settings.align;
        document.getElementById("fxGap").value = config.settings.gap;

        // Restore items
        const container = document.getElementById("flexPreview");
        container.innerHTML = ""; // Clear current
        this.state.itemCount = 0; // Reset count
        this.modifyItems(config.itemCount, true); // Add items one by one logic or just force count
        
        // Since modifyItems is relative or incremental, let's just reset and rebuild
        // Actually modifyItems with forceAdd=true adds 1. 
        // Let's just manually rebuild for simplicity and speed
        container.innerHTML = "";
        this.state.itemCount = config.itemCount;
        for (let i = 0; i < config.itemCount; i++) {
            const num = i + 1;
            const div = document.createElement("div");
            div.className = "flex-item";
            div.innerText = num;
            if (num % 2 === 0) div.style.height = "50px";
            if (num % 3 === 0) div.style.height = "70px";
            container.appendChild(div);
        }

        this.update();
    },

    async deleteFavorite(index) {
        const confirm = await App.core.modal.confirm("¿Eliminar esta configuración?", "Esta acción no se puede deshacer.");
        if (confirm) {
            this.favorites.splice(index, 1);
            localStorage.setItem('flexFavorites', JSON.stringify(this.favorites));
            this.renderFavorites();
        }
    },

    renderFavorites() {
        const container = document.getElementById("flexFavoritesList");
        if (!container) return;
        container.innerHTML = "";

        this.favorites.forEach((fav, index) => {
            const el = document.createElement("div");
            el.className = "favorite-item";
            el.onclick = () => this.loadFavorite(index);
            
            // Preview visual
            const previewStyle = `
                display: flex; 
                flex-direction: ${fav.settings.dir}; 
                flex-wrap: ${fav.settings.wrap}; 
                justify-content: ${fav.settings.justify}; 
                align-items: ${fav.settings.align}; 
                gap: 2px; 
                width: 100%; 
                height: 100%; 
                padding: 4px;
                background: var(--bg-secondary);
            `;
            
            // Mini items for preview
            let itemsHtml = "";
            const limit = Math.min(fav.itemCount, 6); // Show max 6 items in preview
            for(let i=0; i<limit; i++) {
                itemsHtml += `<div style="background: var(--apple-blue); width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0;"></div>`;
            }

            el.innerHTML = `
                <div class="favorite-preview">
                    <div style="${previewStyle}">
                        ${itemsHtml}
                    </div>
                </div>
                <div class="favorite-info">
                    <span class="favorite-name">${fav.name}</span>
                    <button class="favorite-delete" onclick="event.stopPropagation(); App.flex.deleteFavorite(${index})">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
            container.appendChild(el);
        });
    }
};
