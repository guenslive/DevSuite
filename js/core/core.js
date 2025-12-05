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
