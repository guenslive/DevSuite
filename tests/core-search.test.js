import { describe, it, expect, beforeEach } from 'vitest';
import { loadCore } from './setup.js';

function setupDOM() {
    document.body.innerHTML = `
        <input id="toolSearch" aria-expanded="false">
        <div id="searchResults"></div>
    `;
}

describe('App.core.handleSearch — tool search filtering', () => {
    beforeEach(() => {
        loadCore();
        setupDOM();
    });

    it('hides results on empty query', () => {
        document.getElementById('searchResults').classList.add('show');
        App.core.handleSearch('');
        expect(document.getElementById('searchResults').classList.contains('show')).toBe(false);
        expect(App.core.searchState.results).toEqual([]);
    });

    it('filters tools by name', () => {
        App.core.handleSearch('clamp');
        expect(App.core.searchState.results.length).toBe(1);
        expect(App.core.searchState.results[0].id).toBe('clamp');
    });

    it('filters tools by description', () => {
        App.core.handleSearch('aspect ratio');
        expect(App.core.searchState.results.find(r => r.id === 'ratio')).toBeTruthy();
    });

    it('shows results container with role=listbox options', () => {
        App.core.handleSearch('color');
        const container = document.getElementById('searchResults');
        expect(container.classList.contains('show')).toBe(true);
        const items = container.querySelectorAll('[role="option"]');
        expect(items.length).toBeGreaterThan(0);
    });

    it('sets aria-expanded on search input when results shown', () => {
        App.core.handleSearch('clamp');
        expect(document.getElementById('toolSearch').getAttribute('aria-expanded')).toBe('true');
        App.core.handleSearch('');
        expect(document.getElementById('toolSearch').getAttribute('aria-expanded')).toBe('false');
    });

    it('updateSearchSelection sets aria-activedescendant on input', () => {
        App.core.handleSearch('color');
        App.core.searchState.selectedIndex = 0;
        App.core.updateSearchSelection();
        expect(document.getElementById('toolSearch').getAttribute('aria-activedescendant')).toBe('search-result-0');
    });
});
