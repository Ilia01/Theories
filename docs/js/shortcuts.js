/**
 * Keyboard Shortcuts System
 * Global keyboard navigation and shortcuts guide
 */

(function () {
  'use strict';

  const shortcuts = [
    { key: '?', description: 'Show keyboard shortcuts', category: 'General' },
    { key: 'Cmd/Ctrl + K', description: 'Open search', category: 'Navigation' },
    { key: 'Cmd/Ctrl + J', description: 'Jump to topic', category: 'Navigation' },
    { key: 'Cmd/Ctrl + D', description: 'Toggle dark mode', category: 'View' },
    { key: 'n', description: 'Next topic', category: 'Navigation' },
    { key: 'p', description: 'Previous topic', category: 'Navigation' },
    { key: 'h', description: 'Go to home', category: 'Navigation' },
    { key: 'g g', description: 'Scroll to top', category: 'Navigation' },
    { key: 'g b', description: 'Scroll to bottom', category: 'Navigation' },
    { key: 'Esc', description: 'Close modal', category: 'General' }
  ];

  let keySequence = [];
  let sequenceTimer = null;

  /**
   * Show shortcuts modal
   */
  function showShortcuts() {
    const modal = document.getElementById('shortcuts-modal');
    if (!modal) return;

    const grouped = shortcuts.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    }, {});

    let html = '';
    Object.keys(grouped).forEach(category => {
      html += `
        <div class="shortcuts-category">
          <h3>${category}</h3>
          <div class="shortcuts-list">
            ${grouped[category].map(s => `
              <div class="shortcut-item">
                <kbd>${s.key}</kbd>
                <span>${s.description}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    const content = modal.querySelector('.shortcuts-content');
    if (content) {
      content.innerHTML = html;
    }

    modal.classList.add('active');
  }

  /**
   * Hide shortcuts modal
   */
  function hideShortcuts() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  /**
   * Handle keyboard sequences (like gg, gb)
   */
  function handleKeySequence(key) {
    keySequence.push(key);

    // Clear sequence after 1 second
    clearTimeout(sequenceTimer);
    sequenceTimer = setTimeout(() => {
      keySequence = [];
    }, 1000);

    const sequence = keySequence.join(' ');

    // Check for matches
    if (sequence === 'g g') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      keySequence = [];
      return true;
    } else if (sequence === 'g b') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      keySequence = [];
      return true;
    }

    return false;
  }

  /**
   * Navigate to next topic
   */
  function goToNext() {
    const nextLink = document.querySelector('[data-nav="next"]');
    if (nextLink) {
      window.location.href = nextLink.getAttribute('href');
    }
  }

  /**
   * Navigate to previous topic
   */
  function goToPrevious() {
    const prevLink = document.querySelector('[data-nav="prev"]');
    if (prevLink) {
      window.location.href = prevLink.getAttribute('href');
    }
  }

  /**
   * Go to home
   */
  function goToHome() {
    window.location.href = 'index.html';
  }

  /**
   * Toggle dark mode
   */
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDark ? 'true' : 'false');

    // Update icon if exists
    const icon = document.getElementById('dark-mode-icon');
    if (icon) {
      icon.textContent = isDark ? '☀️' : '🌙';
    }
  }

  /**
   * Check if element is input/textarea
   */
  function isInputElement(element) {
    return element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.isContentEditable;
  }

  /**
   * Setup global keyboard shortcuts
   */
  function setupShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in input fields
      if (isInputElement(e.target)) {
        return;
      }

      // Handle Esc key
      if (e.key === 'Escape') {
        hideShortcuts();
        if (window.Search) window.Search.close();
        return;
      }

      // Handle ? key for help
      if (e.key === '?') {
        e.preventDefault();
        showShortcuts();
        return;
      }

      // Handle Cmd/Ctrl + D for dark mode
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
        return;
      }

      // Handle Cmd/Ctrl + J for jump menu (opens search)
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        if (window.Search) window.Search.open();
        return;
      }

      // Handle n for next
      if (e.key === 'n') {
        e.preventDefault();
        goToNext();
        return;
      }

      // Handle p for previous
      if (e.key === 'p') {
        e.preventDefault();
        goToPrevious();
        return;
      }

      // Handle h for home
      if (e.key === 'h') {
        e.preventDefault();
        goToHome();
        return;
      }

      // Handle g sequences
      if (e.key === 'g') {
        handleKeySequence('g');
        return;
      }
    });
  }

  /**
   * Initialize dark mode from localStorage
   */
  function initDarkMode() {
    const darkMode = localStorage.getItem('dark-mode') === 'true';
    if (darkMode) {
      document.body.classList.add('dark-mode');
    }

    // Update icon
    const icon = document.getElementById('dark-mode-icon');
    if (icon) {
      icon.textContent = darkMode ? '☀️' : '🌙';
    }
  }

  /**
   * Setup dark mode toggle button
   */
  function setupDarkModeToggle() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
      toggle.addEventListener('click', toggleDarkMode);
    }
  }

  /**
   * Setup shortcuts modal close button
   */
  function setupShortcutsModal() {
    const closeBtn = document.getElementById('shortcuts-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideShortcuts);
    }

    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          hideShortcuts();
        }
      });
    }
  }

  /**
   * Initialize shortcuts system
   */
  function init() {
    initDarkMode();
    setupShortcuts();
    setupDarkModeToggle();
    setupShortcutsModal();
  }

  // Export public API
  window.Shortcuts = {
    show: showShortcuts,
    hide: hideShortcuts,
    toggleDarkMode
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
