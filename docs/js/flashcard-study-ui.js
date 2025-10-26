/* eslint-disable no-undef */
(function () {
  'use strict';

  if (!globalThis.Flashcards) {
    console.error('Flashcards module not loaded');
    return;
  }

  let currentTopicId = null;
  let studyMode = 'all';

  function init() {
    const urlParams = new URLSearchParams(globalThis.location.search);
    currentTopicId = urlParams.get('topic');
    studyMode = urlParams.get('mode') || 'all';

    if (!currentTopicId) {
      alert('No topic specified. Redirecting to index...');
      globalThis.location.href = 'index.html';
      return;
    }

    const topicTitle = document.getElementById('topic-title');
    if (topicTitle) {
      topicTitle.textContent = formatTopicTitle(currentTopicId);
    }

    setupEventListeners();
    startStudySession();
    initDarkMode();
  }

  function formatTopicTitle(topicId) {
    return topicId
      .replace(/^\d+-/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }


  function setupEventListeners() {
    const backBtn = document.getElementById('back-to-manager');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        globalThis.Flashcards.endSession();
        globalThis.location.href = `flashcard-manager.html?topic=${currentTopicId}`;
      });
    }

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    const flipBtn = document.getElementById('study-flip');
    if (flipBtn) {
      flipBtn.addEventListener('click', handleFlipCard);
    }

    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
      flashcard.addEventListener('click', handleFlipCard);
    }

    const prevBtn = document.getElementById('study-prev');
    const nextBtn = document.getElementById('study-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        globalThis.Flashcards.skipCard();
        updateStudyCard();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        globalThis.Flashcards.skipCard();
        updateStudyCard();
      });
    }

    const againBtn = document.getElementById('study-again-btn');
    const hardBtn = document.getElementById('study-hard-btn');
    const goodBtn = document.getElementById('study-good-btn');
    const easyBtn = document.getElementById('study-easy-btn');

    if (againBtn) {
      againBtn.addEventListener('click', () => handleAnswer(1));
    }

    if (hardBtn) {
      hardBtn.addEventListener('click', () => handleAnswer(2));
    }

    if (goodBtn) {
      goodBtn.addEventListener('click', () => handleAnswer(4));
    }

    if (easyBtn) {
      easyBtn.addEventListener('click', () => handleAnswer(5));
    }
  }


  function initDarkMode() {
    const savedMode = localStorage.getItem('dark-mode');
    const darkModeIcon = document.getElementById('dark-mode-icon');

    document.body.classList.toggle('dark-mode', savedMode === 'true');
    if (darkModeIcon) {
      darkModeIcon.classList.remove('fa-moon');
      darkModeIcon.classList.add('fa-sun');
    }
  }

  function toggleDarkMode() {
    const darkModeIcon = document.getElementById('dark-mode-icon');
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('dark-mode', 'true');
      if (darkModeIcon) {
        darkModeIcon.classList.remove('fa-moon');
        darkModeIcon.classList.add('fa-sun');
      }
    } else {
      localStorage.setItem('dark-mode', 'false');
      if (darkModeIcon) {
        darkModeIcon.classList.remove('fa-sun');
        darkModeIcon.classList.add('fa-moon');
      }
    }
  }


  function startStudySession() {
    const session = globalThis.Flashcards.startStudySession(currentTopicId, {
      shuffle: true,
      mode: studyMode,
    });

    if (!session) {
      const message =
        studyMode === 'due'
          ? 'No flashcards are due for review right now!'
          : 'No flashcards to study! Create some first.';
      alert(message);
      globalThis.location.href = `flashcard-manager.html?topic=${currentTopicId}`;
      return;
    }

    updateStudyCard();
  }

  function updateStudyCard() {
    const card = globalThis.Flashcards.getCurrentCard();
    const stats = globalThis.Flashcards.getSessionStats();

    if (!card || !stats) {
      endStudySession();
      return;
    }

    document.getElementById('study-card-number').textContent = `Card ${stats.current}/${stats.total}`;
    document.getElementById('study-correct').textContent = stats.correct;
    document.getElementById('study-review').textContent = stats.review;

    document.getElementById('flashcard-question').innerHTML = renderMarkdown(card.question);
    document.getElementById('flashcard-answer').innerHTML = renderMarkdown(card.answer);
    document.getElementById('flashcard-confidence').textContent = `${getStars(card.confidence || 0)} ${getConfidenceText(card.confidence || 0)}`;

    const flashcard = document.getElementById('flashcard');
    if (flashcard) {
      flashcard.classList.remove('flipped');
      adjustFlashcardHeight();
    }

    document.getElementById('study-answer-buttons').style.display = 'none';
  }

  function adjustFlashcardHeight() {
    const flashcard = document.getElementById('flashcard');
    const flashcardFront = flashcard.querySelector('.flashcard-front');
    const flashcardBack = flashcard.querySelector('.flashcard-back');
    const container = document.getElementById('flashcard-container');

    if (!flashcard || !flashcardFront || !flashcardBack || !container) return;

    const frontHeight = flashcardFront.scrollHeight;
    const backHeight = flashcardBack.scrollHeight;

    let targetHeight = Math.max(frontHeight, backHeight);

    const minHeight = 250;
    const maxHeight = 600;
    targetHeight = Math.max(minHeight, Math.min(maxHeight, targetHeight));

    container.style.height = targetHeight + 'px';
    flashcard.style.height = targetHeight + 'px';
  }

  function handleFlipCard() {
    const flashcard = document.getElementById('flashcard');
    if (!flashcard) return;

    globalThis.Flashcards.flipCard();
    flashcard.classList.toggle('flipped');

    const answerButtons = document.getElementById('study-answer-buttons');
    if (answerButtons) {
      answerButtons.style.display = flashcard.classList.contains('flipped') ? 'flex' : 'none';
    }

    setTimeout(() => {
      adjustFlashcardHeight();
    }, 600);
  }

  function handleAnswer(quality) {
    const result = globalThis.Flashcards.recordAnswer(quality);

    if (!result) return;

    if (result.isComplete) {
      endStudySession();
    } else {
      updateStudyCard();
    }
  }

  function endStudySession() {
    const stats = globalThis.Flashcards.endSession();

    if (stats) {
      alert(`Study session complete!\n\nCorrect: ${stats.correct}\nTo review: ${stats.review}\n\nKeep it up!`);
    }

    globalThis.location.href = `flashcard-manager.html?topic=${currentTopicId}`;
  }


  function renderMarkdown(text) {
    if (!text || typeof marked === 'undefined') return escapeHtml(text);

    try {
      const html = marked.parse(text, {
        breaks: true,
        gfm: true,
        highlight: function (code, lang) {
          if (lang ?? hljs ?? hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
          }
          return code;
        },
      });
      return html;
    } catch (e) {
      console.error('Markdown rendering error:', e);
      return escapeHtml(text);
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getStars(confidence) {
    const filled = '★'.repeat(Math.min(confidence, 5));
    const empty = '☆'.repeat(Math.max(5 - confidence, 0));
    return filled + empty;
  }

  function getConfidenceText(confidence) {
    const levels = ['Unknown', 'Learning', 'Familiar', 'Confident', 'Proficient', 'Mastered'];
    return levels[Math.min(confidence, 5)];
  }


  document.addEventListener('keydown', e => {
    const flashcard = document.getElementById('flashcard');
    const isFlipped = flashcard?.classList.contains('flipped');

    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      handleFlipCard();
      return;
    }

    if (isFlipped) {
      if (e.key === '1') {
        handleAnswer(1); // Again
      } else if (e.key === '2') {
        handleAnswer(2); // Hard
      } else if (e.key === '3' || e.key === '4') {
        handleAnswer(4); // Good (map both 3 and 4 to Good)
      } else if (e.key === '5') {
        handleAnswer(5); // Easy
      }
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      globalThis.Flashcards.skipCard();
      updateStudyCard();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      globalThis.Flashcards.skipCard();
      updateStudyCard();
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault();
      toggleDarkMode();
    }

    if (e.key === 'Escape') {
      if (confirm('End study session?')) {
        globalThis.Flashcards.endSession();
        globalThis.location.href = `flashcard-manager.html?topic=${currentTopicId}`;
      }
    }
  });


  globalThis.FlashcardStudyUI = {
    init,
    handleFlipCard,
    handleAnswer,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
