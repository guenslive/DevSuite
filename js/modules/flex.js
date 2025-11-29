App.flex = {
    state: { itemCount: 3 },
    init() {
        const container = document.getElementById("flexPreview");
        container.innerHTML = "";
        App.flex.state.itemCount = 3;
        for (let i = 1; i <= 3; i++) { setTimeout(() => { App.flex.modifyItems(0, true); }, i * 100); }
        App.flex.update();
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
};
