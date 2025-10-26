/**
 * Search System
 * Real-time search across all topics with keyboard shortcut support
 */

(function () {
  'use strict';

  let searchIndex = [];
  let isSearchOpen = false;

  function buildSearchIndex() {
    const links = document.querySelectorAll('#nav-list a');
    searchIndex = Array.from(links)
      .map(link => {
        const clone = link.cloneNode(true);
        const indicators = clone.querySelectorAll('.progress-indicator');
        indicators.forEach(ind => ind.remove());
        return {
          title: clone.textContent.trim(),
          href: link.getAttribute('href'),
          element: link,
        };
      })
      .filter(item => item.href && item.href !== 'index.html');
  }

  function search(query) {
    if (!query) return searchIndex;

    const lowerQuery = query.toLowerCase();
    return searchIndex.filter(item => item.title.toLowerCase().includes(lowerQuery));
  }

  function displayResults(results, query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          No results found for "${query}"
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = results
      .map(
        (result, index) => `
      <a href="${result.href}"
         class="search-result ${index === 0 ? 'selected' : ''}"
         data-index="${index}">
        <span class="search-result-title">${highlightMatch(result.title, query)}</span>
      </a>
    `
      )
      .join('');

    resultsContainer.querySelectorAll('.search-result').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = el.getAttribute('href');
      });
    });
  }

  function highlightMatch(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function openSearch() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');

    if (!modal || !input) return;

    isSearchOpen = true;
    modal.classList.add('active');
    input.value = '';
    input.focus();

    displayResults(searchIndex, '');
  }

  function closeSearch() {
    const modal = document.getElementById('search-modal');
    if (!modal) return;

    isSearchOpen = false;
    modal.classList.remove('active');
  }

  function handleInput(e) {
    const query = e.target.value;
    const results = search(query);
    displayResults(results, query);
  }

  function handleSearchKeys(e) {
    if (!isSearchOpen) return;

    const results = document.querySelectorAll('.search-result');
    const selected = document.querySelector('.search-result.selected');
    let currentIndex = selected ? parseInt(selected.dataset.index) : -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = Math.min(currentIndex + 1, results.length - 1);
        updateSelection(results, currentIndex);
        break;

      case 'ArrowUp':
        e.preventDefault();
        currentIndex = Math.max(currentIndex - 1, 0);
        updateSelection(results, currentIndex);
        break;

      case 'Enter':
        e.preventDefault();
        if (selected) {
          window.location.href = selected.getAttribute('href');
        }
        break;

      case 'Escape':
        e.preventDefault();
        closeSearch();
        break;
    }
  }

  function updateSelection(results, index) {
    results.forEach((result, i) => {
      if (i === index) {
        result.classList.add('selected');
        result.scrollIntoView({ block: 'nearest' });
      } else {
        result.classList.remove('selected');
      }
    });
  }

  function setupShortcuts() {
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isSearchOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }

      handleSearchKeys(e);
    });
  }

  function init() {
    buildSearchIndex();
    setupShortcuts();

    const input = document.getElementById('search-input');
    if (input) {
      input.addEventListener('input', handleInput);
    }

    const searchBtn = document.getElementById('search-trigger');
    if (searchBtn) {
      searchBtn.addEventListener('click', openSearch);
    }

    const closeBtn = document.getElementById('search-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSearch);
    }

    const modal = document.getElementById('search-modal');
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          closeSearch();
        }
      });
    }
  }

  window.Search = {
    open: openSearch,
    close: closeSearch,
    search,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
