App.transform = {
    state: {
        // Propiedades actuales (del keyframe seleccionado o modo libre)
        rotateX: 0, rotateY: 0, rotateZ: 0,
        scale: 1, skewX: 0, skewY: 0,
        translateX: 0, translateY: 0, translateZ: 0,
        perspective: 1000,
        originX: 50, originY: 50,
        backface: true,

        // Estado de animación
        mode: '2d', // 2d, 3d, anim, settings
        keyframes: [
            { percent: 0, props: null }, // null = usar default
            { percent: 100, props: null }
        ],
        activeKeyframeIndex: -1, // -1 = ninguno (modo libre)
        isPlaying: false,
        animDuration: 2,
        animTiming: 'ease-in-out'
    },

    init() {
        // Inicializar props por defecto para los keyframes iniciales
        const defaultProps = this.getPropsFromState();
        this.state.keyframes[0].props = { ...defaultProps };
        this.state.keyframes[1].props = { ...defaultProps, rotateZ: 360 }; // Ejemplo: rotación completa
        this.update();
    },

    getPropsFromState() {
        return {
            rotateX: this.state.rotateX, rotateY: this.state.rotateY, rotateZ: this.state.rotateZ,
            scale: this.state.scale, skewX: this.state.skewX, skewY: this.state.skewY,
            translateX: this.state.translateX, translateY: this.state.translateY, translateZ: this.state.translateZ,
            perspective: this.state.perspective
        };
    },

    switchTab(tab) {
        this.state.mode = tab;
        
        // Actualizar botones
        document.querySelectorAll('#section-transform .blob-type-btn').forEach(btn => btn.classList.remove('active'));
        
        let btnId = 'tfTab2D';
        if (tab === '3d') btnId = 'tfTab3D';
        if (tab === 'settings') btnId = 'tfTabSettings';
        const btn = document.getElementById(btnId);
        if(btn) btn.classList.add('active');

        // Mostrar/Ocultar paneles de controles
        document.getElementById('tfControls2D').style.display = 'none';
        document.getElementById('tfControls3D').style.display = 'none';
        document.getElementById('tfControlsSettings').style.display = 'none';

        if (tab === '2d') document.getElementById('tfControls2D').style.display = 'block';
        if (tab === '3d') document.getElementById('tfControls3D').style.display = 'block';
        if (tab === 'settings') document.getElementById('tfControlsSettings').style.display = 'block';
        
        this.update();
    },

    toggleAnimMode() {
        const isEnabled = document.getElementById('tfAnimToggle').checked;
        const timeline = document.getElementById('tfTimeline');
        
        if (isEnabled) {
            timeline.style.display = 'block';
            
            // Si venimos de modo libre (activeKeyframeIndex === -1),
            // guardamos el estado actual en el Keyframe 0 para no perder los cambios.
            if (this.state.activeKeyframeIndex === -1) {
                const currentProps = this.getPropsFromState();
                this.state.keyframes[0].props = { ...currentProps };
                this.selectKeyframe(0);
            }
            this.renderKeyframesList();
        } else {
            timeline.style.display = 'none';
            // Salir del modo animación
            this.state.activeKeyframeIndex = -1;
            this.stopAnim();
        }
        this.update();
    },

    syncInput(prop, value) {
        // Actualizar estado local
        this.state[prop] = parseFloat(value);

        // Sincronizar slider e input numérico
        const slider = document.getElementById('tf' + prop.charAt(0).toUpperCase() + prop.slice(1));
        const numInput = document.getElementById('tf' + prop.charAt(0).toUpperCase() + prop.slice(1) + 'Num');

        if (slider) slider.value = value;
        if (numInput) numInput.value = value;

        // Si estamos editando un keyframe, actualizar sus datos
        if (this.state.activeKeyframeIndex !== -1) {
            const kf = this.state.keyframes[this.state.activeKeyframeIndex];
            kf.props[prop] = this.state[prop];
        }

        this.update();
    },

    // --- Gestión de Keyframes ---

    renderKeyframesList() {
        const container = document.getElementById('tfKeyframesList');
        container.innerHTML = '';
        
        // Asegurar orden
        this.state.keyframes.sort((a, b) => a.percent - b.percent);

        this.state.keyframes.forEach((kf, index) => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${index === this.state.activeKeyframeIndex ? 'active' : ''}`;
            btn.style.minWidth = '60px';
            btn.style.fontSize = '0.8rem';
            btn.innerText = `${kf.percent}%`;
            btn.onclick = () => this.selectKeyframe(index);
            container.appendChild(btn);
        });
    },

    selectKeyframe(index) {
        // Si el índice ya no es válido (ej: tras borrar), seleccionar el último
        if (index >= this.state.keyframes.length) index = this.state.keyframes.length - 1;
        if (index < 0) index = 0;

        this.state.activeKeyframeIndex = index;
        const kf = this.state.keyframes[index];
        
        // Actualizar input de porcentaje
        const percentInput = document.getElementById('tfKfPercent');
        if (percentInput) percentInput.value = kf.percent;

        // Cargar props del keyframe al estado actual
        Object.keys(kf.props).forEach(key => {
            this.state[key] = kf.props[key];
            // Actualizar UI
            const slider = document.getElementById('tf' + key.charAt(0).toUpperCase() + key.slice(1));
            const num = document.getElementById('tf' + key.charAt(0).toUpperCase() + key.slice(1) + 'Num');
            if (slider) slider.value = this.state[key];
            if (num) num.value = this.state[key];
        });

        this.renderKeyframesList();
        this.update(); // Refrescar vista previa estática
    },

    updateKeyframePercent(val) {
        if (this.state.activeKeyframeIndex === -1) return;
        
        let newPercent = parseFloat(val);
        if (isNaN(newPercent) || newPercent < 0) newPercent = 0;
        if (newPercent > 100) newPercent = 100;

        // Verificar duplicados (opcional, pero recomendable para evitar confusión)
        const exists = this.state.keyframes.find((k, i) => k.percent === newPercent && i !== this.state.activeKeyframeIndex);
        if (exists) {
            alert(`Ya existe un keyframe en ${newPercent}%. Por favor elige otro valor.`);
            // Restaurar valor anterior en el input
            document.getElementById('tfKfPercent').value = this.state.keyframes[this.state.activeKeyframeIndex].percent;
            return;
        }

        // Actualizar porcentaje
        const currentKf = this.state.keyframes[this.state.activeKeyframeIndex];
        currentKf.percent = newPercent;

        // Reordenar array y encontrar el nuevo índice del keyframe activo
        // Guardamos referencia al objeto para encontrarlo después de ordenar
        this.state.keyframes.sort((a, b) => a.percent - b.percent);
        const newIndex = this.state.keyframes.indexOf(currentKf);
        
        this.selectKeyframe(newIndex);
    },

    addKeyframe() {
        // Buscar un hueco libre inteligentemente
        // Intentamos encontrar el mayor espacio entre keyframes
        this.state.keyframes.sort((a, b) => a.percent - b.percent);
        
        let maxGap = 0;
        let insertAt = 50; // Default si está vacío o solo hay extremos

        if (this.state.keyframes.length > 0) {
            // Chequear espacio antes del primero
            if (this.state.keyframes[0].percent > 0) {
                maxGap = this.state.keyframes[0].percent;
                insertAt = maxGap / 2;
            }

            // Chequear espacios intermedios
            for (let i = 0; i < this.state.keyframes.length - 1; i++) {
                const gap = this.state.keyframes[i+1].percent - this.state.keyframes[i].percent;
                if (gap > maxGap) {
                    maxGap = gap;
                    insertAt = this.state.keyframes[i].percent + (gap / 2);
                }
            }

            // Chequear espacio después del último
            const last = this.state.keyframes[this.state.keyframes.length - 1];
            if (100 - last.percent > maxGap) {
                insertAt = last.percent + ((100 - last.percent) / 2);
            }
        }

        insertAt = Math.round(insertAt); // Redondear para que sea bonito

        // Copiar props actuales (del keyframe activo o del estado actual)
        const newProps = this.getPropsFromState();
        
        const newKf = {
            percent: insertAt,
            props: newProps
        };

        this.state.keyframes.push(newKf);
        
        // Ordenar y seleccionar el nuevo
        this.state.keyframes.sort((a, b) => a.percent - b.percent);
        const newIndex = this.state.keyframes.indexOf(newKf);
        
        this.selectKeyframe(newIndex);
    },

    deleteKeyframe() {
        if (this.state.keyframes.length <= 1) {
            alert("Debes tener al menos 1 keyframe.");
            return;
        }
        if (this.state.activeKeyframeIndex === -1) return;

        this.state.keyframes.splice(this.state.activeKeyframeIndex, 1);
        // Seleccionar el anterior o el primero
        let nextIndex = this.state.activeKeyframeIndex - 1;
        if (nextIndex < 0) nextIndex = 0;
        
        this.selectKeyframe(nextIndex);
    },

    updateAnimSettings() {
        this.state.animDuration = parseFloat(document.getElementById('animDuration').value) || 2;
        this.state.animTiming = document.getElementById('animTiming').value;
        if (this.state.isPlaying) {
            this.playAnim(); // Reiniciar para aplicar cambios
        }
    },

    togglePlay() {
        if (this.state.isPlaying) {
            this.stopAnim();
        } else {
            this.playAnim();
        }
    },

    playAnim() {
        this.state.isPlaying = true;
        document.getElementById('btnPlayAnim').innerText = "⏹ Stop Animation";
        document.getElementById('btnPlayAnim').style.background = "var(--fail-color)";
        
        const preview = document.getElementById('transformPreviewBox');
        
        // Generar CSS de animación
        const keyframesCSS = this.generateKeyframesCSS('previewAnim');
        
        // Inyectar estilo temporal
        let styleTag = document.getElementById('tempAnimStyle');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'tempAnimStyle';
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = keyframesCSS;

        // Aplicar al elemento
        preview.style.animation = `previewAnim ${this.state.animDuration}s ${this.state.animTiming} infinite alternate`;
    },

    stopAnim() {
        this.state.isPlaying = false;
        const btn = document.getElementById('btnPlayAnim');
        if(btn) {
            btn.innerText = "▶ Play Animation";
            btn.style.background = "var(--pass-color)";
        }

        const preview = document.getElementById('transformPreviewBox');
        if(preview) preview.style.animation = 'none';
        
        // Eliminar estilo temporal
        const styleTag = document.getElementById('tempAnimStyle');
        if (styleTag) styleTag.remove();
    },

    generateTransformString(props) {
        return `perspective(${props.perspective}px) translate3d(${props.translateX}px, ${props.translateY}px, ${props.translateZ}px) rotateX(${props.rotateX}deg) rotateY(${props.rotateY}deg) rotateZ(${props.rotateZ}deg) skew(${props.skewX}deg, ${props.skewY}deg) scale(${props.scale})`;
    },

    generateKeyframesCSS(name) {
        let css = `@keyframes ${name} {\n`;
        this.state.keyframes.sort((a, b) => a.percent - b.percent);
        
        this.state.keyframes.forEach(kf => {
            css += `  ${kf.percent}% { transform: ${this.generateTransformString(kf.props)}; }\n`;
        });
        css += `}`;
        return css;
    },

    update() {
        // Leer valores globales
        this.state.originX = document.getElementById('tfOriginX').value;
        this.state.originY = document.getElementById('tfOriginY').value;
        this.state.backface = document.getElementById('tfBackface').checked;

        const origin = `${this.state.originX}% ${this.state.originY}%`;
        const backface = this.state.backface ? 'visible' : 'hidden';

        // Aplicar a la vista previa (solo si NO está reproduciendo animación)
        const preview = document.getElementById('transformPreviewBox');
        if (preview) {
            preview.style.transformOrigin = origin;
            preview.style.backfaceVisibility = backface;
            
            if (!this.state.isPlaying) {
                // Usar props actuales (del keyframe seleccionado o libres)
                const currentProps = this.getPropsFromState();
                preview.style.transform = this.generateTransformString(currentProps);
            }
        }

        // Mostrar código CSS
        const resultBox = document.getElementById('transformResult');
        if (resultBox) {
            const isAnimMode = document.getElementById('tfAnimToggle') && document.getElementById('tfAnimToggle').checked;
            
            if (isAnimMode) {
                // Mostrar código @keyframes
                const kfCSS = this.generateKeyframesCSS('myAnimation');
                const classCSS = `.my-element {\n  animation: myAnimation ${this.state.animDuration}s ${this.state.animTiming} infinite alternate;\n  transform-origin: ${origin};\n}`;
                resultBox.innerHTML = classCSS + '\n\n' + kfCSS;
            } else {
                // Mostrar código transform simple
                const currentProps = this.getPropsFromState();
                const transform = this.generateTransformString(currentProps);
                resultBox.innerHTML = `transform: ${transform};\ntransform-origin: ${origin};\nbackface-visibility: ${backface};`;
            }
        }
    },

    reset() {
        // Resetear estado
        this.state.rotateX = 0; this.state.rotateY = 0; this.state.rotateZ = 0;
        this.state.scale = 1; this.state.skewX = 0; this.state.skewY = 0;
        this.state.translateX = 0; this.state.translateY = 0; this.state.translateZ = 0;
        this.state.perspective = 1000;
        this.state.originX = 50; this.state.originY = 50;
        this.state.backface = true;

        // Resetear inputs visuales
        const inputs = [
            { id: 'tfScale', val: 1 }, { id: 'tfPerspective', val: 1000 },
            { id: 'tfTranslateX', val: 0 }, { id: 'tfTranslateY', val: 0 }, { id: 'tfTranslateZ', val: 0 },
            { id: 'tfRotateX', val: 0 }, { id: 'tfRotateY', val: 0 }, { id: 'tfRotateZ', val: 0 },
            { id: 'tfSkewX', val: 0 }, { id: 'tfSkewY', val: 0 },
            { id: 'tfOriginX', val: 50 }, { id: 'tfOriginY', val: 50 }
        ];

        inputs.forEach(item => {
            const slider = document.getElementById(item.id);
            const num = document.getElementById(item.id + 'Num');
            if (slider) slider.value = item.val;
            if (num) num.value = item.val;
        });

        document.getElementById('tfBackface').checked = true;

        this.update();
    }
};

// Inicializar
App.transform.init();
