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

  function hideShortcuts() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function handleKeySequence(key) {
    keySequence.push(key);

    clearTimeout(sequenceTimer);
    sequenceTimer = setTimeout(() => {
      keySequence = [];
    }, 1000);

    const sequence = keySequence.join(' ');

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

  function goToNext() {
    const nextLink = document.querySelector('[data-nav="next"]');
    if (nextLink) {
      window.location.href = nextLink.getAttribute('href');
    }
  }

  function goToPrevious() {
    const prevLink = document.querySelector('[data-nav="prev"]');
    if (prevLink) {
      window.location.href = prevLink.getAttribute('href');
    }
  }

  function goToHome() {
    window.location.href = 'index.html';
  }

  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDark ? 'true' : 'false');

    const icon = document.getElementById('dark-mode-icon');
    if (icon) {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  function isInputElement(element) {
    return element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.isContentEditable;
  }

  function setupShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in input fields
      if (isInputElement(e.target)) {
        return;
      }

      if (e.key === 'Escape') {
        hideShortcuts();
        if (window.Search) window.Search.close();
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        showShortcuts();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        if (window.Search) window.Search.open();
        return;
      }

      if (e.key === 'n') {
        e.preventDefault();
        goToNext();
        return;
      }

      if (e.key === 'p') {
        e.preventDefault();
        goToPrevious();
        return;
      }

      if (e.key === 'h') {
        e.preventDefault();
        goToHome();
        return;
      }

      if (e.key === 'g') {
        handleKeySequence('g');
        return;
      }
    });
  }

  function initDarkMode() {
    const darkMode = localStorage.getItem('dark-mode') === 'true';
    if (darkMode) {
      document.body.classList.add('dark-mode');
    }

    const icon = document.getElementById('dark-mode-icon');
    if (icon) {
      icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  function setupDarkModeToggle() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
      toggle.addEventListener('click', toggleDarkMode);
    }
  }

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

  function init() {
    initDarkMode();
    setupShortcuts();
    setupDarkModeToggle();
    setupShortcutsModal();
  }

  window.Shortcuts = {
    show: showShortcuts,
    hide: hideShortcuts,
    toggleDarkMode
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
