App.metatags = {
    update() {
        const title = document.getElementById("metaTitle").value || "Example Title";
        const desc = document.getElementById("metaDesc").value || "Example description text goes here...";
        const url = document.getElementById("metaUrl").value || "https://example.com";
        const image = document.getElementById("metaImage").value || "https://example.com/image.jpg";
        
        // Update Previews
        this.updateGooglePreview(title, desc, url);
        this.updateSocialPreview(title, desc, url, image);
        
        // Generate Code
        this.generateCode();
    },
    
    updateGooglePreview(title, desc, url) {
        document.getElementById("googleTitlePreview").innerText = title;
        document.getElementById("googleUrlPreview").innerText = url;
        document.getElementById("googleDescPreview").innerText = desc;
    },
    
    updateSocialPreview(title, desc, url, image) {
        // Facebook / OG
        document.getElementById("ogTitlePreview").innerText = title;
        document.getElementById("ogDescPreview").innerText = desc;
        document.getElementById("ogSitePreview").innerText = new URL(url).hostname;
        
        const imgPreview = document.getElementById("ogImagePreview");
        if(image) {
            imgPreview.style.backgroundImage = `url('${image}')`;
            imgPreview.style.display = "block";
        } else {
            imgPreview.style.display = "none";
        }
    },
    
    generateCode() {
        const title = document.getElementById("metaTitle").value.trim();
        const desc = document.getElementById("metaDesc").value.trim();
        const keywords = document.getElementById("metaKeywords").value.trim();
        const url = document.getElementById("metaUrl").value.trim();
        const image = document.getElementById("metaImage").value.trim();
        const author = document.getElementById("metaAuthor").value.trim();
        const themeColor = document.getElementById("metaThemeColor").value.trim();
        
        let code = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}" />
<meta name="description" content="${desc}" />\n`;

        if (keywords) code += `<meta name="keywords" content="${keywords}" />\n`;
        if (author) code += `<meta name="author" content="${author}" />\n`;
        if (themeColor) code += `<meta name="theme-color" content="${themeColor}" />\n`;

        code += `\n<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:image" content="${image}" />\n`;

        code += `\n<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${url}" />
<meta property="twitter:title" content="${title}" />
<meta property="twitter:description" content="${desc}" />
<meta property="twitter:image" content="${image}" />`;

        document.getElementById("metatagsResult").innerText = code;
    },
    
    copy() {
        const code = document.getElementById("metatagsResult").innerText;
        navigator.clipboard.writeText(code);
        
        const btn = document.querySelector("#section-metatags .copy-btn");
        const originalText = btn.innerText;
        btn.innerText = "Copiado!";
        setTimeout(() => {
            btn.innerText = originalText;
        }, 1500);
    }
};
