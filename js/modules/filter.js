App.filter = {
    state: {
        images: [
            "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        ],
    },
    update() {
        const blur = document.getElementById("flBlur").value, bright = document.getElementById("flBright").value, contrast = document.getElementById("flContrast").value;
        const saturate = document.getElementById("flSaturate").value, gray = document.getElementById("flGray").value, sepia = document.getElementById("flSepia").value;
        const hue = document.getElementById("flHue").value, invert = document.getElementById("flInvert").value;
        document.getElementById("valFlBlur").innerText = blur + "px"; document.getElementById("valFlBright").innerText = bright + "%";
        document.getElementById("valFlContrast").innerText = contrast + "%"; document.getElementById("valFlSaturate").innerText = saturate + "%";
        document.getElementById("valFlGray").innerText = gray + "%"; document.getElementById("valFlSepia").innerText = sepia + "%";
        document.getElementById("valFlHue").innerText = hue + "deg"; document.getElementById("valFlInvert").innerText = invert + "%";
        let filters = [];
        if (blur > 0) filters.push(`blur(${blur}px)`);
        if (bright != 100) filters.push(`brightness(${bright}%)`);
        if (contrast != 100) filters.push(`contrast(${contrast}%)`);
        if (saturate != 100) filters.push(`saturate(${saturate}%)`);
        if (gray > 0) filters.push(`grayscale(${gray}%)`);
        if (sepia > 0) filters.push(`sepia(${sepia}%)`);
        if (hue > 0) filters.push(`hue-rotate(${hue}deg)`);
        if (invert > 0) filters.push(`invert(${invert}%)`);
        const cssValue = filters.length > 0 ? filters.join(" ") : "none";
        const cssCode = `filter: ${cssValue};`;
        document.getElementById("filterPreviewImg").style.filter = cssValue;
        document.getElementById("filterResult").innerText = cssCode;
    },
    reset() {
        document.getElementById("flBlur").value = 0; document.getElementById("flBright").value = 100; document.getElementById("flContrast").value = 100;
        document.getElementById("flSaturate").value = 100; document.getElementById("flGray").value = 0; document.getElementById("flSepia").value = 0;
        document.getElementById("flHue").value = 0; document.getElementById("flInvert").value = 0;
        App.filter.update();
    },
    randomImage() {
        const imgs = App.filter.state.images;
        // FIX #6: Loop Safety
        if (imgs.length <= 1) return;
        const currentSrc = document.getElementById("filterPreviewImg").src;
        let newSrc = currentSrc;
        while (newSrc === currentSrc) { newSrc = imgs[Math.floor(Math.random() * imgs.length)]; }
        document.getElementById("filterPreviewImg").src = newSrc;
    },
};
