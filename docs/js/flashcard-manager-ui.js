(function () {
  'use strict';

  if (!globalThis.Flashcards) {
    console.error('Flashcards module not loaded');
    return;
  }

  let currentTopicId = null;
  let currentMarkdown = null;
  let editingCardId = null;


  function init() {
    const urlParams = new URLSearchParams(globalThis.location.search);
    currentTopicId = urlParams.get('topic');

    if (!currentTopicId) {
      alert('No topic specified. Redirecting to index...');
      globalThis.location.href = 'index.html';
      return;
    }

    setupEventListeners();
    loadTopicData();
    updateManagerUI();
    initDarkMode();
  }

  function loadTopicData() {
    const topicTitle = document.getElementById('topic-title');
    if (topicTitle) {
      topicTitle.textContent = formatTopicTitle(currentTopicId);
    }

    fetch(`${currentTopicId}.html`)
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const mdElement = doc.getElementById('markdown-source');
        if (mdElement) {
          currentMarkdown = mdElement.textContent;
        } else {
          return fetch(`../${currentTopicId}.md`).then(r => r.text());
        }
      })
      .then(md => {
        if (md) currentMarkdown = md;
      })
      .catch(err => {
        console.warn('Could not load markdown:', err);
      });
  }

  function formatTopicTitle(topicId) {
    return topicId
      .replace(/^\d+-/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function setupEventListeners() {
    const backBtn = document.getElementById('back-to-topic');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        globalThis.location.href = `${currentTopicId}.html`;
      });
    }

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    const autoGenBtn = document.getElementById('auto-generate-btn');
    const studyDueBtn = document.getElementById('study-due-btn');
    const studyAllBtn = document.getElementById('study-all-btn');
    const addBtn = document.getElementById('add-flashcard-btn');

    if (autoGenBtn) {
      autoGenBtn.addEventListener('click', showAutoGenerateModal);
    }

    if (studyDueBtn) {
      studyDueBtn.addEventListener('click', () => startStudySession('due'));
    }

    if (studyAllBtn) {
      studyAllBtn.addEventListener('click', () => startStudySession('all'));
    }

    if (addBtn) {
      addBtn.addEventListener('click', () => openModal(document.getElementById('add-card-modal')));
    }

    setupCardListDelegation();
    setupGenerateModal();
    setupAddCardModal();
  }

  function setupCardListDelegation() {
    const list = document.getElementById('flashcard-list');
    if (list) {
      list.addEventListener('click', e => {
        const editBtn = e.target.closest('[data-action="edit"]');
        const deleteBtn = e.target.closest('[data-action="delete"]');

        if (editBtn) {
          e.stopPropagation();
          editFlashcard(editBtn.dataset.id);
          return;
        }

        if (deleteBtn) {
          e.stopPropagation();
          if (confirm('Delete this flashcard?')) {
            globalThis.Flashcards.deleteFlashcard(currentTopicId, deleteBtn.dataset.id);
            updateManagerUI();
          }
        }
      });
    }
  }

  function setupGenerateModal() {
    const modal = document.getElementById('generate-modal');
    const closeBtn = document.getElementById('generate-close');
    const cancelBtn = document.getElementById('generate-cancel-btn');
    const confirmBtn = document.getElementById('generate-confirm-btn');
    const aiToggle = document.getElementById('use-ai-toggle');
    const aiSettings = document.getElementById('ai-settings-section');
    const patternStats = document.getElementById('pattern-stats-section');
    const testConnectionBtn = document.getElementById('test-ai-connection');
    const aiProviderSelect = document.getElementById('ai-provider-select');
    const getApiKeyLink = document.getElementById('get-api-key-link');

    if (closeBtn || cancelBtn) {
      for (const btn of [closeBtn, cancelBtn]) {
        if (btn) btn.addEventListener('click', () => closeModal(modal));
      };
    }

    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal);
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', confirmAutoGenerate);
    }

    if (aiToggle) {
      aiToggle.addEventListener('change', e => {
        const useAI = e.target.checked;
        if (aiSettings && patternStats) {
          aiSettings.classList.toggle('hidden', !useAI);
          patternStats.classList.toggle('hidden', useAI);
        }
        const btnText = document.getElementById('generate-btn-text');
        if (btnText) {
          btnText.textContent = useAI ? 'Generate with AI' : 'Generate All';
        }
        saveAISetting('useAIForGeneration', useAI);
        if (useAI) {
          loadAISettings();
        }
      });
      const settings = globalThis.Flashcards.getSettings();
      if (settings.useAIForGeneration) {
        aiToggle.checked = true;
        aiToggle.dispatchEvent(new Event('change'));
      }
    }

    if (testConnectionBtn) {
      testConnectionBtn.addEventListener('click', () => testAIConnection());
    }

    if (aiProviderSelect && getApiKeyLink) {
      const updateApiKeyLink = () => {
        const provider = aiProviderSelect.value;
        const links = {
          groq: 'https://console.groq.com/keys',
          gemini: 'https://aistudio.google.com/app/apikey',
          huggingface: 'https://huggingface.co/settings/tokens',
        };
        getApiKeyLink.href = links[provider] || '#';
      };
      aiProviderSelect.addEventListener('change', () => {
        updateApiKeyLink();
        saveAISetting('aiProvider', aiProviderSelect.value);
      });
      updateApiKeyLink();
    }

    const aiApiKeyInput = document.getElementById('ai-api-key-input');
    const questionsPerSection = document.getElementById('questions-per-section');
    const questionDiversity = document.getElementById('question-diversity');

    if (aiApiKeyInput) {
      aiApiKeyInput.addEventListener('change', () => {
        saveAISetting('aiApiKey', aiApiKeyInput.value);
      });
    }

    if (questionsPerSection) {
      questionsPerSection.addEventListener('change', () => {
        saveAISetting('questionsPerSection', Number.parseInt(questionsPerSection.value));
      });
    }

    if (questionDiversity) {
      questionDiversity.addEventListener('change', () => {
        saveAISetting('questionDiversity', questionDiversity.value);
      });
    }
  }

  function setupAddCardModal() {
    const modal = document.getElementById('add-card-modal');
    const closeBtn = document.getElementById('add-card-close');
    const saveBtn = document.getElementById('save-card-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        resetAddCardModal();
        closeModal(modal);
      });
    }

    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          resetAddCardModal();
          closeModal(modal);
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', saveNewCard);
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

  function updateManagerUI() {
    const cards = globalThis.Flashcards.getFlashcards(currentTopicId);
    const stats = globalThis.Flashcards.getStats(currentTopicId);
    const dueCount = globalThis.Flashcards.getDueCount(currentTopicId);

    document.getElementById('total-cards').textContent = stats.totalCards;
    document.getElementById('mastered-cards').textContent = stats.mastered;
    document.getElementById('review-cards').textContent = stats.toReview;
    document.getElementById('due-count').textContent = dueCount;

    const list = document.getElementById('flashcard-list');
    if (!list) return;

    if (cards.length === 0) {
      list.innerHTML =
        '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No flashcards yet. Click "Auto-Generate" or "Add Card" to get started!</div>';
      return;
    }

    list.innerHTML = cards
      .map(card => {
        const strippedAnswer = stripMarkdown(card.answer);
        const preview = strippedAnswer.length > 150 ? strippedAnswer.substring(0, 150) + '...' : strippedAnswer;
        return `
      <div class="flashcard-item" data-id="${card.id}">
        <div class="flashcard-item-header">
          <div class="flashcard-item-question">${escapeHtml(stripMarkdown(card.question))}</div>
          <div class="flashcard-item-actions">
            <button class="item-btn edit" data-action="edit" data-id="${card.id}" title="Edit card">
              <i class="fas fa-edit"></i>
            </button>
            <button class="item-btn delete" data-action="delete" data-id="${card.id}" title="Delete card">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div class="flashcard-item-answer">${escapeHtml(preview)}</div>
        <div class="flashcard-item-meta">
          <span class="flashcard-confidence-stars">${getStars(card.confidence || 0)}</span>
          <span><i class="fas fa-redo"></i> ${card.reviewCount || 0} reviews</span>
          ${card.source === 'auto' ? '<span><i class="fas fa-magic"></i> Auto</span>' : ''}
        </div>
      </div>
    `;
      })
      .join('');
  }

  function editFlashcard(cardId) {
    const cards = globalThis.Flashcards.getFlashcards(currentTopicId);
    const card = cards.find(c => c.id === cardId);

    if (!card) {
      alert('Card not found');
      return;
    }

    document.getElementById('card-question').value = card.question;
    document.getElementById('card-answer').value = card.answer;

    editingCardId = cardId;

    const modalTitle = document.querySelector('#add-card-modal .modal-header h2');
    if (modalTitle) {
      modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Flashcard';
    }

    openModal(document.getElementById('add-card-modal'));
  }

  function saveNewCard() {
    const question = document.getElementById('card-question').value.trim();
    const answer = document.getElementById('card-answer').value.trim();

    if (!question || !answer) {
      alert('Please enter both question and answer');
      return;
    }

    if (editingCardId) {
      globalThis.Flashcards.updateFlashcard(currentTopicId, editingCardId, {
        question,
        answer,
      });
      editingCardId = null;
    } else {
      globalThis.Flashcards.saveFlashcard(currentTopicId, {
        question,
        answer,
        source: 'manual',
        type: 'manual',
      });
    }

    resetAddCardModal();
    closeModal(document.getElementById('add-card-modal'));
    updateManagerUI();
  }

  function resetAddCardModal() {
    document.getElementById('card-question').value = '';
    document.getElementById('card-answer').value = '';

    editingCardId = null;

    const modalTitle = document.querySelector('#add-card-modal .modal-header h2');
    if (modalTitle) {
      modalTitle.innerHTML = '<i class="fas fa-plus"></i> Add Flashcard';
    }
  }

  function showAutoGenerateModal() {
    if (!currentMarkdown) {
      alert('Markdown source not available. Try refreshing the page or add cards manually.');
      return;
    }

    const cards = globalThis.Flashcards.parseMarkdownForFlashcards(currentMarkdown, currentTopicId);

    if (cards.length === 0) {
      alert('No flashcards could be generated from this content.');
      return;
    }

    const byType = {
      heading: cards.filter(c => c.type === 'heading').length,
      definition: cards.filter(c => c.type === 'definition').length,
      list: cards.filter(c => c.type === 'list').length,
      code: cards.filter(c => c.type === 'code').length,
    };

    document.getElementById('gen-total-count').textContent = cards.length;
    document.getElementById('gen-heading-count').textContent = byType.heading;
    document.getElementById('gen-def-count').textContent = byType.definition;
    document.getElementById('gen-list-count').textContent = byType.list;
    document.getElementById('gen-code-count').textContent = byType.code;

    const preview = document.getElementById('generate-preview-list');
    if (preview) {
      preview.innerHTML = cards
        .slice(0, 10)
        .map(c => `<li>${escapeHtml(stripMarkdown(c.question))}</li>`)
        .join('');
      if (cards.length > 10) {
        preview.innerHTML += `<li style="font-style: italic; color: var(--text-secondary);">...and ${cards.length - 10} more</li>`;
      }
    }

    globalThis._pendingCards = cards;
    openModal(document.getElementById('generate-modal'));
  }

  async function confirmAutoGenerate() {
    const useAI = document.getElementById('use-ai-toggle')?.checked || false;

    if (useAI) {
      await generateWithAI();
    } else {
      generateWithPatterns();
    }
  }

  function generateWithPatterns() {
    const cards = globalThis._pendingCards;
    if (!cards) return;

    for (const card of cards) {
      globalThis.Flashcards.saveFlashcard(currentTopicId, card);
    };

    globalThis._pendingCards = null;
    closeModal(document.getElementById('generate-modal'));
    updateManagerUI();
    alert(`Successfully generated ${cards.length} flashcards!`);
  }

  async function generateWithAI() {
    const confirmBtn = document.getElementById('generate-confirm-btn');
    const apiKey = document.getElementById('ai-api-key-input')?.value.trim();

    if (!apiKey) {
      alert('Please enter your API key to use AI generation');
      return;
    }

    if (!currentMarkdown) {
      alert('Markdown source not available');
      return;
    }

    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    try {
      const settings = globalThis.Flashcards.getSettings();
      const generator = new globalThis.AIFlashcardGenerator(settings);

      const sections = extractMarkdownSections(currentMarkdown);
      let allCards = [];

      for (const section of sections) {
        try {
          const cards = await generator.generateFlashcards(currentMarkdown, currentTopicId, section);
          allCards = allCards.concat(cards);
        } catch (error) {
          console.error(`Failed to generate for section "${section.heading}":`, error);
        }
      }

      if (allCards.length === 0) {
        throw new Error('No flashcards were generated. The AI may not have responded correctly.');
      }

      for (const card of allCards) {
        globalThis.Flashcards.saveFlashcard(currentTopicId, card);
      };

      closeModal(document.getElementById('generate-modal'));
      updateManagerUI();
      alert(`Successfully generated ${allCards.length} AI-powered flashcards!`);
    } catch (error) {
      console.error('AI generation error:', error);
      alert(`AI generation failed: ${error.message}\n\nTip: Check your API key and try again, or use pattern matching instead.`);
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<i class="fas fa-magic"></i> <span id="generate-btn-text">Generate with AI</span>';
    }
  }

  function extractMarkdownSections(markdown) {
    const sections = [];
    const lines = markdown.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);

      if (headingMatch) {
        if (currentSection ?? currentSection.content.trim()) {
          sections.push(currentSection);
        }

        currentSection = {
          level: headingMatch[1].length,
          heading: headingMatch[2].trim(),
          content: '',
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection ?? currentSection.content.trim()) {
      sections.push(currentSection);
    }

    return sections.filter(s => s.content.length > 100);
  }

  function loadAISettings() {
    const settings = globalThis.Flashcards.getSettings();
    const aiApiKeyInput = document.getElementById('ai-api-key-input');
    const aiProviderSelect = document.getElementById('ai-provider-select');
    const questionsPerSection = document.getElementById('questions-per-section');
    const questionDiversity = document.getElementById('question-diversity');

    if (aiApiKeyInput && settings.aiApiKey) {
      aiApiKeyInput.value = settings.aiApiKey;
    }
    if (aiProviderSelect) {
      aiProviderSelect.value = settings.aiProvider || 'groq';
    }
    if (questionsPerSection) {
      questionsPerSection.value = settings.questionsPerSection || 3;
    }
    if (questionDiversity) {
      questionDiversity.value = settings.questionDiversity || 'high';
    }
  }

  function saveAISetting(key, value) {
    const settings = globalThis.Flashcards.getSettings();
    settings[key] = value;
    globalThis.Flashcards.saveSettings(settings);
  }

  async function testAIConnection() {
    const testBtn = document.getElementById('test-ai-connection');
    const apiKey = document.getElementById('ai-api-key-input').value.trim();
    const provider = document.getElementById('ai-provider-select').value;

    if (!apiKey) {
      showTestResult('Please enter an API key first', false);
      return;
    }

    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';

    try {
      const settings = globalThis.Flashcards.getSettings();
      settings.aiApiKey = apiKey;
      settings.aiProvider = provider;

      const generator = new globalThis.AIFlashcardGenerator(settings);
      const result = await generator.testConnection();

      if (result.success) {
        showTestResult(`✓ ${result.message}`, true);
      } else {
        showTestResult(`✗ ${result.message}`, false);
      }
    } catch (error) {
      showTestResult(`✗ Connection failed: ${error.message}`, false);
    } finally {
      testBtn.disabled = false;
      testBtn.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
    }
  }

  function showTestResult(message, success) {
    const testResult = document.getElementById('ai-test-result');
    if (testResult) {
      testResult.textContent = message;
      testResult.className = `test-result ${success ? 'success' : 'error'}`;
    }
  }

  function startStudySession(mode = 'all') {
    const session = globalThis.Flashcards.startStudySession(currentTopicId, { shuffle: true, mode: mode });

    if (!session) {
      const message =
        mode === 'due' ? 'No flashcards are due for review right now!' : 'No flashcards to study! Create some first.';
      alert(message);
      return;
    }

    globalThis.location.href = `flashcard-study.html?topic=${currentTopicId}&mode=${mode}`;
  }

  function openModal(modal) {
    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  function stripMarkdown(text) {
    if (!text) return '';

    // 
    return text
      .replaceAll(/```[\s\S]*?```/g, '')
      .replaceAll(/`([^`]+)`/g, '$1')
      .replaceAll(/^#{1,6}\s+/gm, '')
      .replaceAll(/\*\*([^*]+)\*\*/g, '$1')
      .replaceAll(/\*([^*]+)\*/g, '$1')
      .replaceAll(/__([^_]+)__/g, '$1')
      .replaceAll(/_([^_]+)_/g, '$1')
      .replaceAll(/~~([^~]+)~~/g, '$1')
      .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replaceAll(/^[-*+]\s+/gm, '')
      .replaceAll(/^\d+\.\s+/gm, '')
      .replaceAll(/^\s*>\s+/gm, '')
      .replaceAll(/\n{2,}/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim();
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

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const modals = [document.getElementById('generate-modal'), document.getElementById('add-card-modal')];
      for (const modal of modals) {
        if (modal ?? modal.classList.contains('active')) {
          if (modal === document.getElementById('add-card-modal')) {
            resetAddCardModal();
          }
          closeModal(modal);
        }
      };
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault();
      toggleDarkMode();
    }
  });

  globalThis.FlashcardManagerUI = {
    init,
    updateManagerUI,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
