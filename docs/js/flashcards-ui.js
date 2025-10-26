(function () {
  'use strict';

  if (!globalThis.Flashcards) {
    console.error('Flashcards module not loaded');
    return;
  }

  let currentTopicId = null;

  function init() {
    currentTopicId = getCurrentPageId();
    setupEventListeners();
    updateDueBadge();
  }

  function getCurrentPageId() {
    const path = globalThis.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
  }

  function setupEventListeners() {
    const flashcardsBtn = document.getElementById('flashcards-btn');
    if (flashcardsBtn) {
      flashcardsBtn.addEventListener('click', openFlashcardManager);
    }
  }

  function openFlashcardManager() {
    if (currentTopicId === 'index') {
      alert('Please open a specific topic to view flashcards');
      return;
    }

    globalThis.location.href = `flashcard-manager.html?topic=${currentTopicId}`;
  }

  function updateDueBadge() {
    if (currentTopicId === 'index') return;

    const dueCount = globalThis.Flashcards.getDueCount(currentTopicId);
    const flashcardsBtn = document.getElementById('flashcards-btn');

    if (flashcardsBtn) {
      const existingBadge = flashcardsBtn.querySelector('.due-badge');
      if (existingBadge) {
        existingBadge.remove();
      }

      if (dueCount > 0) {
        const badge = document.createElement('span');
        badge.className = 'due-badge';
        badge.textContent = dueCount;
        flashcardsBtn.appendChild(badge);
      }
    }
  }

  globalThis.FlashcardsUI = {
    init,
    openFlashcardManager,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
