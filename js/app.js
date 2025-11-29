window.App = {
    state: {
        theme: "light",
        gradient: {
            stops: [
                { color: "#007aff", opacity: 100, pos: 0, id: 1 },
                { color: "#34c759", opacity: 100, pos: 100, id: 2 },
            ],
            isDragging: false,
            draggedIndex: -1,
            rafId: null,
        },
    },
};
