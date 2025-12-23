App.core = {
    initTheme() {
        // Already handled in HEAD script to prevent FOUC, but we keep state sync
        const s = document.documentElement.getAttribute("data-theme") || "light";
        App.state.theme = s;
        App.core.updateIcons(s);
    },
    toggleTheme() {
        let n;
        // Check if triggered by the checkbox change event
        if (event && event.target && event.target.id === "themeSwitchInput") {
            n = event.target.checked ? "dark" : "light";
        } else {
            n = App.state.theme === "dark" ? "light" : "dark";
        }
        
        App.state.theme = n;
        document.documentElement.setAttribute("data-theme", n);
        localStorage.setItem("theme", n);
        App.core.updateIcons(n);
    },
    toggleMenu() {
        const container = document.querySelector(".tabs-container");
        const checkbox = document.getElementById("mobileMenuCheckbox");
        if (checkbox && checkbox.checked) {
            container.classList.add("show");
        } else {
            container.classList.remove("show");
        }
    },
    toolsList: [
        { id: 'clamp', name: 'Clamp', desc: 'Responsive font sizing generator' },
        { id: 'ratio', name: 'Ratio', desc: 'Aspect ratio calculator' },
        { id: 'flex', name: 'Flexbox', desc: 'CSS Flexbox generator' },
        { id: 'grid', name: 'Grid', desc: 'CSS Grid layout generator' },
        { id: 'shadow', name: 'Shadow', desc: 'Box-shadow generator' },
        { id: 'gradient', name: 'Gradient', desc: 'CSS Gradient generator' },
        { id: 'filter', name: 'Filters', desc: 'CSS Filter effects' },
        { id: 'transform', name: 'Transform', desc: 'CSS Transform generator' },
        { id: 'blob', name: 'Shape', desc: 'Blob and shape generator' },
        { id: 'contrast', name: 'Contrast', desc: 'Color contrast checker' },
        { id: 'palette', name: 'Palette', desc: 'Color palette generator' },
        { id: 'converter', name: 'Converter', desc: 'Unit and color converter' },
        { id: 'placeholder', name: 'Image', desc: 'Placeholder image generator' }
    ],
    searchState: {
        selectedIndex: -1,
        results: []
    },
    handleSearch(query) {
        const resultsContainer = document.getElementById('searchResults');
        const q = query.toLowerCase().trim();
        
        App.core.searchState.selectedIndex = -1;
        
        if (q.length === 0) {
            resultsContainer.classList.remove('show');
            resultsContainer.innerHTML = '';
            App.core.searchState.results = [];
            return;
        }

        const matches = App.core.toolsList.filter(tool => 
            tool.name.toLowerCase().includes(q) || 
            tool.desc.toLowerCase().includes(q) ||
            tool.id.toLowerCase().includes(q)
        );
        
        App.core.searchState.results = matches;

        if (matches.length > 0) {
            resultsContainer.innerHTML = matches.map((tool, index) => `
                <div class="search-result-item" id="search-result-${index}" onclick="App.core.selectTool('${tool.id}')">
                    <div class="search-result-text">
                        <span class="search-result-name">${tool.name}</span>
                        <span class="search-result-desc">${tool.desc}</span>
                    </div>
                </div>
            `).join('');
            resultsContainer.classList.add('show');
        } else {
            resultsContainer.classList.remove('show');
        }
    },
    handleSearchKeydown(e) {
        const results = App.core.searchState.results;
        if (!results.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            App.core.searchState.selectedIndex = (App.core.searchState.selectedIndex + 1) % results.length;
            App.core.updateSearchSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            App.core.searchState.selectedIndex = (App.core.searchState.selectedIndex - 1 + results.length) % results.length;
            App.core.updateSearchSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (App.core.searchState.selectedIndex >= 0) {
                App.core.selectTool(results[App.core.searchState.selectedIndex].id);
            } else if (results.length > 0) {
                // Select first if none selected
                App.core.selectTool(results[0].id);
            }
        } else if (e.key === 'Escape') {
             document.getElementById('searchResults').classList.remove('show');
             document.getElementById('toolSearch').blur();
        }
    },
    updateSearchSelection() {
        const index = App.core.searchState.selectedIndex;
        const items = document.querySelectorAll('.search-result-item');
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    },
    selectTool(id) {
        App.core.switchTab(id);
        document.getElementById('toolSearch').value = '';
        document.getElementById('searchResults').classList.remove('show');
        
        // Scroll to tab
        const tabBtn = document.querySelector(`.tab-btn[onclick="switchTab('${id}')"]`);
        if (tabBtn) {
            tabBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    },
    history: {
        colors: [],
        maxSize: 10,
        init() {
            const stored = localStorage.getItem('colorHistory');
            if (stored) {
                try {
                    this.colors = JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse color history', e);
                    this.colors = [];
                }
            }
            this.updateUI();
        },
        add(color) {
            if (!color || !/^#[0-9A-F]{6}$/i.test(color)) return;
            
            // Remove if exists to move to top
            this.colors = this.colors.filter(c => c.toLowerCase() !== color.toLowerCase());
            
            // Add to front
            this.colors.unshift(color);
            
            // Limit size
            if (this.colors.length > this.maxSize) {
                this.colors.pop();
            }
            
            localStorage.setItem('colorHistory', JSON.stringify(this.colors));
            this.updateUI();
        },
        remove(color) {
            this.colors = this.colors.filter(c => c !== color);
            localStorage.setItem('colorHistory', JSON.stringify(this.colors));
            this.updateUI();
        },
        updateUI() {
            const containers = document.querySelectorAll('.color-history-container');
            if (!containers.length) return;
            
            const html = this.colors.map(color => `
                <div class="history-swatch" 
                     style="background: ${color}" 
                     onclick="App.core.history.use('${color}')" 
                     oncontextmenu="App.core.history.remove('${color}'); return false;"
                     title="${color} (Click to use, Right-click to remove)">
                </div>
            `).join('');
            
            containers.forEach(c => c.innerHTML = html);
        },
        use(color) {
            // Determine which tool is active and update accordingly
            // For now, we can try to update the active input if possible, or just copy it?
            // Better: The user clicked it in a specific context (Palette or Contrast).
            // But since the click handler is generic, we need to know where to apply it.
            // A simple heuristic: Apply to the last interacted color input?
            // Or, since we are adding this to specific sections, maybe we can pass the target prefix?
            // Actually, let's just copy to clipboard and show a toast for now, OR
            // even better: if we are in the Palette tab, update Palette. If in Contrast, update FG (default) or maybe we need a way to drag/drop?
            // Let's keep it simple: When clicking a history color, it copies to clipboard.
            // AND if we can detect the active input, we update it.
            
            // Let's try to find the "active" color picker in the current visible section.
            const activeSection = document.querySelector('.tool-section.active');
            if (activeSection) {
                if (activeSection.id === 'section-palette') {
                    App.syncProPicker('pal', color);
                } else if (activeSection.id === 'section-contrast') {
                    // Default to FG for contrast
                    App.syncProPicker('fg', color);
                } else if (activeSection.id === 'section-converter') {
                    App.syncProPicker('conv', color);
                } else {
                     App.utils.copyTextToClipboard(color);
                }
            }
        }
    },
    scrollTabs(direction) {
        const container = document.querySelector(".tabs-container");
        if (!container) return;
        const scrollAmount = 200;
        container.scrollLeft += direction * scrollAmount;
        // Update buttons after scroll animation (approx)
        setTimeout(App.core.updateScrollButtons, 300);
    },
    updateScrollButtons() {
        const container = document.querySelector(".tabs-container");
        const leftBtn = document.getElementById("scrollLeftBtn");
        const rightBtn = document.getElementById("scrollRightBtn");
        
        if (!container || !leftBtn || !rightBtn) return;
        
        // Hide buttons on mobile or if no scroll needed
        if (window.innerWidth <= 768 || container.scrollWidth <= container.clientWidth) {
            leftBtn.classList.add("hidden");
            rightBtn.classList.add("hidden");
            return;
        }

        // Left button
        if (container.scrollLeft <= 10) {
            leftBtn.classList.add("hidden");
        } else {
            leftBtn.classList.remove("hidden");
        }

        // Right button
        // Allow a small buffer (1px) for calculation errors
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
            rightBtn.classList.add("hidden");
        } else {
            rightBtn.classList.remove("hidden");
        }
    },
    updateIcons(t) {
        const checkbox = document.getElementById("themeSwitchInput");
        if (checkbox) {
            checkbox.checked = (t === "dark");
        }
    },
    switchTab(t) {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        if (event && event.target && event.target.classList.contains("tab-btn")) event.target.classList.add("active");
        document.querySelectorAll(".tool-section").forEach((s) => s.classList.remove("active"));
        document.getElementById("section-" + t).classList.add("active");

        // Auto-close menu on mobile
        const container = document.querySelector(".tabs-container");
        if (window.innerWidth <= 768 && container.classList.contains("show")) {
            container.classList.remove("show");
            const checkbox = document.getElementById("mobileMenuCheckbox");
            if (checkbox) checkbox.checked = false;
        }

        if (t === "placeholder") App.placeholder.draw();
        if (t === "shadow") { App.shadow.update(); App.shadow.updateBg(); }
        if (t === "contrast") App.contrast.calc();
        if (t === "gradient") App.gradient.init();
        if (t === "converter") App.converter.update();
        if (t === "blob") { App.shape.switchTool(App.shape.state.tool); App.shape.clipPath.init(); }
        if (t === "filter") App.filter.update();
        if (t === "flex") App.flex.init();
        if (t === "grid") App.grid.init();
        if (t === "palette") App.palette.init();
    },
};
