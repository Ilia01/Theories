/**
 * Flashcard System
 * Auto-generates flashcards from markdown content and provides study mode
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'theory_test_flashcards';
  const SETTINGS_KEY = 'flashcard_settings';

  const DEFAULT_SETTINGS = {
    autoGenEnabled: true,
    includeCodeExamples: true,
    shuffleCards: true,
    confidenceThreshold: 4,
    newCardInterval: 1,
    graduatingInterval: 6,
    easyInterval: 10,
    maxInterval: 365,
    learningSteps: [10, 1440],
    // AI-powered generation settings
    aiEnabled: false,
    aiProvider: 'groq', // 'groq' | 'gemini' | 'huggingface'
    aiApiKey: '', // Stored encrypted
    questionsPerSection: 3,
    questionDiversity: 'high', // 'low' | 'medium' | 'high'
    useAIForGeneration: false, // Toggle between AI and pattern matching
  };

  const CONFIDENCE = {
    UNKNOWN: 0,
    LEARNING: 1,
    FAMILIAR: 2,
    CONFIDENT: 3,
    PROFICIENT: 4,
    MASTERED: 5,
  };

  const QUESTION_PATTERNS = [
    {
      triggers: ['practical', 'scenarios', 'use cases', 'applications', 'when to use', 'situations'],
      templates: [
        'When should you use {topic}?',
        'What are practical scenarios for {topic}?',
        'In what situations would you use {topic}?',
      ],
      priority: 9,
    },
    {
      triggers: ['importance', 'benefits', 'advantages', 'why use', 'why important', 'significance'],
      templates: [
        'Why is {topic} important?',
        'What are the benefits of {topic}?',
        'Why should you use {topic}?',
        'What is the significance of {topic}?',
      ],
      priority: 8,
    },
    {
      triggers: ['issues', 'pitfalls', 'common mistakes', 'problems', 'gotchas', 'avoid', 'errors', 'bugs'],
      templates: [
        'What are common pitfalls with {topic}?',
        'What issues should you avoid when using {topic}?',
        'What mistakes are commonly made with {topic}?',
        'What problems can occur with {topic}?',
      ],
      priority: 8,
    },
    {
      triggers: ['how it works', 'mechanism', 'behind the scenes', 'internal', 'under the hood', 'how does'],
      templates: [
        'How does {topic} work?',
        'Explain how {topic} works',
        'What happens internally with {topic}?',
        'Describe the mechanism of {topic}',
      ],
      priority: 7,
    },
    {
      triggers: ['creating', 'writing', 'implementing', 'building', 'making', 'developing'],
      templates: [
        'How do you create {topic}?',
        'What are the steps to implement {topic}?',
        'How do you write {topic}?',
        'How do you build {topic}?',
      ],
      priority: 7,
    },
    {
      triggers: ['steps', 'process', 'procedure', 'workflow'],
      templates: [
        'What are the steps to {topic}?',
        'Describe the process of {topic}',
        'What is the procedure for {topic}?',
      ],
      priority: 7,
    },
    {
      triggers: ['best practices', 'guidelines', 'recommendations', 'tips'],
      templates: [
        'What are the best practices for {topic}?',
        'What are recommended guidelines for {topic}?',
        'What tips should you follow for {topic}?',
      ],
      priority: 6,
    },
    {
      triggers: ['debugging', 'troubleshooting', 'fixing', 'solving'],
      templates: [
        'How do you debug {topic}?',
        'What are common ways to troubleshoot {topic}?',
        'How do you fix issues with {topic}?',
      ],
      priority: 6,
    },
  ];

  function getSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Error reading flashcard settings:', e);
      return DEFAULT_SETTINGS;
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Error saving flashcard settings:', e);
      return false;
    }
  }

  function getAllFlashcards() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { flashcards: {}, stats: {} };
    } catch (e) {
      console.error('Error reading flashcards:', e);
      return { flashcards: {}, stats: {} };
    }
  }

  function saveAllFlashcards(data) {
    try {
      const dataString = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, dataString);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.error('localStorage quota exceeded:', e);
        const approximateSize = new Blob([JSON.stringify(data)]).size;
        const sizeInKB = (approximateSize / 1024).toFixed(2);
        alert(
          `Storage quota exceeded!\n\n` +
          `Your flashcards data (~${sizeInKB} KB) exceeds browser storage limits.\n\n` +
          `Solutions:\n` +
          `1. Delete some flashcards to free up space\n` +
          `2. Export your deck and clear old data\n` +
          `3. Use browser settings to increase storage quota\n\n` +
          `Tip: Try deleting auto-generated duplicates or old topics.`
        );
        return false;
      }
      console.error('Error saving flashcards:', e);
      alert('Failed to save flashcards. Please try again or check browser console for details.');
      return false;
    }
  }

  function getFlashcards(topicId) {
    const data = getAllFlashcards();
    return data.flashcards[topicId] || [];
  }

  function getDueCards(topicId) {
    const cards = getFlashcards(topicId);
    const now = new Date();
    return cards.filter(card => {
      if (!card.nextReviewDate) return true;
      const dueDate = new Date(card.nextReviewDate);
      return dueDate <= now;
    });
  }

  function getDueCount(topicId) {
    if (topicId) {
      return getDueCards(topicId).length;
    }
    const data = getAllFlashcards();
    let total = 0;
    Object.keys(data.flashcards).forEach(topic => {
      total += getDueCards(topic).length;
    });
    return total;
  }

  function saveFlashcard(topicId, card) {
    const data = getAllFlashcards();
    if (!data.flashcards[topicId]) {
      data.flashcards[topicId] = [];
    }

    card.id = card.id || generateId();
    card.created = card.created || new Date().toISOString();
    card.confidence = card.confidence || CONFIDENCE.UNKNOWN;
    card.reviewCount = card.reviewCount || 0;
    card.correctCount = card.correctCount || 0;
    card.easinessFactor = card.easinessFactor || 2.5;
    card.interval = card.interval || 0;
    card.repetitions = card.repetitions || 0;
    card.nextReviewDate = card.nextReviewDate || new Date().toISOString();
    card.isNew = card.isNew !== undefined ? card.isNew : true;
    card.stepIndex = card.stepIndex || 0;

    data.flashcards[topicId].push(card);
    saveAllFlashcards(data);
    return card;
  }

  function updateFlashcard(topicId, cardId, updates) {
    const data = getAllFlashcards();
    const cards = data.flashcards[topicId] || [];
    const index = cards.findIndex(c => c.id === cardId);

    if (index !== -1) {
      cards[index] = { ...cards[index], ...updates };
      saveAllFlashcards(data);
      return cards[index];
    }
    return null;
  }

  function deleteFlashcard(topicId, cardId) {
    const data = getAllFlashcards();
    const cards = data.flashcards[topicId] || [];
    data.flashcards[topicId] = cards.filter(c => c.id !== cardId);
    saveAllFlashcards(data);
    return true;
  }

  function generateId() {
    return 'fc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  function calculateSM2(card, quality) {
    const settings = getSettings();
    const now = new Date();
    const newCard = { ...card };

    if (quality < 3) {
      newCard.repetitions = 0;
      newCard.stepIndex = 0;
      newCard.isNew = false;

      const stepMinutes = settings.learningSteps[0] || 10;
      newCard.interval = stepMinutes / 1440;
      newCard.nextReviewDate = new Date(now.getTime() + stepMinutes * 60000).toISOString();
    } else {
      if (newCard.isNew || newCard.repetitions === 0) {
        newCard.isNew = false;
        newCard.stepIndex++;

        if (newCard.stepIndex < settings.learningSteps.length) {
          const stepMinutes = settings.learningSteps[newCard.stepIndex];
          newCard.interval = stepMinutes / 1440;
          newCard.nextReviewDate = new Date(now.getTime() + stepMinutes * 60000).toISOString();
        } else {
          newCard.repetitions = 1;
          newCard.interval = settings.graduatingInterval;
          newCard.nextReviewDate = new Date(
            now.getTime() + newCard.interval * 86400000
          ).toISOString();
        }
      } else {
        newCard.repetitions++;

        newCard.easinessFactor = Math.max(
          1.3,
          newCard.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        if (newCard.repetitions === 1) {
          newCard.interval = settings.newCardInterval;
        } else if (newCard.repetitions === 2) {
          newCard.interval = settings.graduatingInterval;
        } else {
          let multiplier = newCard.easinessFactor;
          if (quality === 5) {
            multiplier *= 1.3;
          } else if (quality === 3) {
            multiplier *= 1.2;
          }
          newCard.interval = Math.round(newCard.interval * multiplier);
        }

        newCard.interval = Math.min(newCard.interval, settings.maxInterval);
        newCard.nextReviewDate = new Date(
          now.getTime() + newCard.interval * 86400000
        ).toISOString();
      }
    }

    return newCard;
  }

  function isValidCard(card) {
    if (!card.question || !card.answer) return false;

    const qLen = card.question.trim().length;
    const aLen = card.answer.trim().length;

    if (qLen < 5 || qLen > 500) return false; // Increased from 300 to 500 for complex questions
    if (aLen < 20 || aLen > 1500) return false; // Increased from 500 to 1500 for detailed answers

    const badPatterns = [
      /^(table of contents|toc|summary|overview|navigation|resources|references)$/i,
      /^(prev|next|home|back to top)$/i,
      /^```[\s\S]*$/,
      /^#{1,6}\s*$/,
      /^[-*+]\s*$/,
    ];

    if (badPatterns.some(p => p.test(card.question.trim()))) return false;
    if (badPatterns.some(p => p.test(card.answer.trim()))) return false;

    return true;
  }

  function hasPartialMarkdown(text) {
    const openCode = (text.match(/```/g) || []).length;
    if (openCode % 2 !== 0) return true;

    if (/^```/.test(text.trim()) && !/```$/.test(text.trim())) return true;
    if (/^#{1,6}\s*$/.test(text.trim())) return true;
    if (/^[-*+]\s*$/.test(text.trim())) return true;

    return false;
  }

  function cleanHeadingText(heading) {
    let cleaned = heading.trim();

    const verbPrefixes = [
      /^understanding\s+/i,
      /^working\s+with\s+/i,
      /^introduction\s+to\s+/i,
      /^intro\s+to\s+/i,
      /^overview\s+of\s+/i,
      /^getting\s+started\s+with\s+/i,
      /^learning\s+/i,
      /^using\s+/i,
      /^implementing\s+/i,
      /^creating\s+/i,
      /^managing\s+/i,
      /^exploring\s+/i,
      /^about\s+/i,
      /^the\s+/i,
    ];

    for (const prefix of verbPrefixes) {
      cleaned = cleaned.replace(prefix, '');
    }

    return cleaned.trim();
  }

  function generateSmartQuestion(headingText) {
    const cleanedHeading = cleanHeadingText(headingText);
    const lowerHeading = headingText.toLowerCase();

    // If heading is already a question, preserve it
    if (headingText.match(/^(how|what|why|when|where|which)/i)) {
      return headingText.endsWith('?') ? headingText : headingText + '?';
    }

    // Handle comparison patterns (X vs Y)
    if (cleanedHeading.match(/\bvs\.?\b|\bversus\b/i)) {
      const parts = cleanedHeading.split(/\bvs\.?\b|\bversus\b/i);
      const templates = [
        `What is the difference between ${parts[0].trim().toLowerCase()} and ${parts[1].trim().toLowerCase()}?`,
        `How does ${parts[0].trim().toLowerCase()} differ from ${parts[1].trim().toLowerCase()}?`,
        `When should you choose ${parts[0].trim().toLowerCase()} over ${parts[1].trim().toLowerCase()}?`,
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }

    // Match against pattern triggers (sorted by priority)
    const sortedPatterns = [...QUESTION_PATTERNS].sort((a, b) => b.priority - a.priority);

    for (const pattern of sortedPatterns) {
      for (const trigger of pattern.triggers) {
        if (lowerHeading.includes(trigger)) {
          // Randomly select a template for variety
          const template = pattern.templates[Math.floor(Math.random() * pattern.templates.length)];
          return template.replace('{topic}', cleanedHeading.toLowerCase());
        }
      }
    }

    // Default fallback based on plural detection
    return isPlural(cleanedHeading)
      ? `What are ${cleanedHeading.toLowerCase()}?`
      : `What is ${cleanedHeading.toLowerCase()}?`;
  }

  function isOnlyLists(text) {
    if (!text || text.trim().length === 0) return false;

    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return false;

    const listLines = lines.filter(l => /^[-*+]\s+/.test(l) || /^\d+\.\s+/.test(l));

    return listLines.length === lines.length || listLines.length / lines.length > 0.8;
  }

  function isPlural(text) {
    const word = text.trim().split(/\s+/).pop();

    if (!word) return false;

    if (word.match(/s$/i) && !word.match(/(ss|us|is)$/i)) {
      return true;
    }

    return false;
  }

  function parseMarkdownForFlashcards(markdown, topicTitle) {
    const cards = [];

    cards.push(...extractFromHeadings(markdown, topicTitle));
    cards.push(...extractBoldDefinitions(markdown));
    cards.push(...extractFromLists(markdown));

    if (getSettings().includeCodeExamples) {
      cards.push(...extractCodeExamples(markdown));
    }

    return deduplicateCards(cards.filter(isValidCard));
  }

  function extractFromHeadings(markdown) {
    const cards = [];
    const lines = markdown.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);

      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2].trim();

        if (
          headingText.match(
            /table of contents|summary|overview|navigation|resources|references|see also/i
          )
        ) {
          i++;
          continue;
        }

        const content = [];
        i++;

        while (i < lines.length && !lines[i].match(/^#{1,3}\s+/)) {
          const currentLine = lines[i].trim();
          if (currentLine) {
            content.push(lines[i]);
          }
          i++;
        }

        let answer = content.join('\n').trim();

        if (hasPartialMarkdown(answer)) {
          continue;
        }

        if (isOnlyLists(answer)) {
          continue;
        }

        const paragraphs = answer.split(/\n\n+/);
        if (paragraphs.length > 0) {
          const firstPara = paragraphs[0].trim();
          if (firstPara.length >= 30 && firstPara.length <= 1500) {
            answer = firstPara;
          } else if (paragraphs.length > 1 && firstPara.length < 30) {
            answer = paragraphs.slice(0, 2).join('\n\n').trim();
          }
        }

        if (answer && answer.length > 20 && answer.length <= 1500) {
          const question = generateSmartQuestion(headingText);

          cards.push({
            question: question,
            answer: answer,
            source: 'auto',
            type: 'heading',
            level: level,
          });
        }
      } else {
        i++;
      }
    }

    return cards;
  }

  function extractBoldDefinitions(markdown) {
    const cards = [];
    const definitionPattern = /\*\*([^*:]+)\*\*\s*:\s*([^\n]+)/g;
    let match;

    while ((match = definitionPattern.exec(markdown)) !== null) {
      const term = match[1].trim();
      const definition = match[2].trim();

      if (term && definition && definition.length > 5) {
        cards.push({
          question: `What is ${term}?`,
          answer: definition,
          source: 'auto',
          type: 'definition',
        });
      }
    }

    return cards;
  }

  function extractFromLists(markdown) {
    const cards = [];
    const lines = markdown.split('\n');
    let currentContext = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const headingMatch = line.match(/^#{2,4}\s+(.+)$/);
      if (headingMatch) {
        const heading = headingMatch[1].trim();
        if (!heading.match(/table of contents|summary|overview|navigation/i)) {
          currentContext = heading;
        }
        continue;
      }

      const listMatch = line.match(/^[\s]*[-*]\s+\*\*(.+?)\*\*[:\s-]+(.+)$/);
      if (listMatch && currentContext) {
        const item = listMatch[1].trim();
        let description = listMatch[2].trim();

        let j = i + 1;
        while (
          j < lines.length &&
          lines[j].trim() &&
          !lines[j].match(/^[\s]*[-*]\s+/) &&
          !lines[j].match(/^#{1,4}\s+/)
        ) {
          description += ' ' + lines[j].trim();
          j++;
        }

        if (description.length >= 20 && description.length <= 800) {
          let question;

          if (currentContext.match(/benefits|advantages/i)) {
            question = `What is the benefit of ${item.toLowerCase()}?`;
          } else if (currentContext.match(/types|kinds|categories/i)) {
            question = `What is ${item.toLowerCase()} as a type of ${currentContext.toLowerCase()}?`;
          } else if (currentContext.match(/examples|scenarios|use cases/i)) {
            question = `When would you use ${item.toLowerCase()}?`;
          } else if (currentContext.match(/pitfalls|issues|problems|mistakes/i)) {
            question = `What problem is ${item.toLowerCase()}?`;
          } else if (currentContext.match(/features|characteristics/i)) {
            question = `What does ${item.toLowerCase()} feature provide?`;
          } else if (currentContext.match(/steps|process/i)) {
            question = `What happens in the ${item.toLowerCase()} step?`;
          } else {
            question = `What is ${item.toLowerCase()}?`;
          }

          cards.push({
            question: question,
            answer: description,
            source: 'auto',
            type: 'list',
            context: currentContext,
          });
        }
      }
    }

    return cards;
  }

  function extractCodeExamples(markdown) {
    const cards = [];
    const lines = markdown.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        const language = line.trim().substring(3).trim();
        const codeStartIndex = i;
        const codeLines = [];
        i++;

        let hasClosing = false;
        while (i < lines.length) {
          if (lines[i].trim().startsWith('```')) {
            hasClosing = true;
            break;
          }
          codeLines.push(lines[i]);
          i++;
        }

        if (!hasClosing) {
          continue;
        }

        const code = codeLines.join('\n').trim();

        if (!code || code.length < 10 || code.length > 1000) {
          continue; // Increased from 400 to 1000 for complex code examples
        }

        let context = '';
        let heading = '';

        for (let j = codeStartIndex - 1; j >= Math.max(0, codeStartIndex - 15); j--) {
          const prevLine = lines[j].trim();

          if (!heading && prevLine.match(/^#{2,4}\s+/)) {
            heading = prevLine.replace(/^#{2,4}\s+/, '').trim();
          }

          if (
            !context &&
            prevLine &&
            !prevLine.startsWith('#') &&
            !prevLine.startsWith('```') &&
            prevLine.length > 15
          ) {
            context = prevLine;
          }

          if (context && heading) break;
        }

        let question;

        // Check for example/demonstration markers
        if (heading && heading.match(/simple|basic|example|sample/i)) {
          if (heading.match(/simple|basic/i)) {
            const topic = heading.replace(/simple|basic|example/i, '').trim();
            question = `What is a simple example of ${topic.toLowerCase()}?`;
          } else {
            question = `Show an example of ${heading.toLowerCase()}`;
          }
        }
        // Check for pitfall/problem markers
        else if (
          heading &&
          heading.match(/wrong|incorrect|pitfall|mistake|avoid|bad|anti-pattern/i)
        ) {
          question = `What problem does this code demonstrate?`;
        }
        // Check for implementation/how-to context
        else if (context) {
          const toMatch = context.match(/(?:to|for)\s+([^.:,]+)/i);
          const verbMatch = context.match(
            /\b(create|use|implement|define|declare|set|get|call|invoke|run|execute)\b/i
          );

          if (context.match(/example|demonstrates|shows/i)) {
            question = heading
              ? `Show an example of ${heading.toLowerCase()}`
              : 'What does this code demonstrate?';
          } else if (toMatch) {
            question = `How do you ${toMatch[1].toLowerCase().trim()}?`;
          } else if (verbMatch) {
            question = `How do you ${verbMatch[1].toLowerCase()} ${heading ? heading.toLowerCase() : 'this'}?`;
          } else {
            question = heading ? `How do you implement ${heading.toLowerCase()}?` : 'What does this code do?';
          }
        } else if (heading) {
          if (heading.match(/how|what|why|when/i)) {
            question = heading.endsWith('?') ? heading : heading + '?';
          } else {
            question = `How do you implement ${heading.toLowerCase()}?`;
          }
        } else {
          question = 'What does this code demonstrate?';
        }

        const answer = language ? `\`\`\`${language}\n${code}\n\`\`\`` : `\`\`\`\n${code}\n\`\`\``;

        cards.push({
          question: question,
          answer: answer,
          source: 'auto',
          type: 'code',
          language: language || 'plaintext',
        });
      }
      i++;
    }

    return cards;
  }

  function deduplicateCards(cards) {
    const seen = new Set();
    const unique = [];

    for (const card of cards) {
      const normalized = card.question.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(card);
      }
    }

    return unique;
  }

  let currentSession = null;

  function startStudySession(topicId, options = {}) {
    const mode = options.mode || 'all';
    let sessionCards;

    if (mode === 'due') {
      sessionCards = getDueCards(topicId);
    } else {
      sessionCards = [...getFlashcards(topicId)];
    }

    if (sessionCards.length === 0) {
      return null;
    }

    sessionCards.sort((a, b) => {
      const dateA = a.nextReviewDate ? new Date(a.nextReviewDate) : new Date();
      const dateB = b.nextReviewDate ? new Date(b.nextReviewDate) : new Date();
      return dateA - dateB;
    });

    if (options.shuffle || getSettings().shuffleCards) {
      sessionCards = shuffleArray(sessionCards);
    }

    currentSession = {
      topicId,
      cards: sessionCards,
      currentIndex: 0,
      correct: 0,
      review: 0,
      startTime: new Date(),
      isFlipped: false,
    };

    return currentSession;
  }

  function getCurrentCard() {
    if (!currentSession || currentSession.currentIndex >= currentSession.cards.length) {
      return null;
    }
    return currentSession.cards[currentSession.currentIndex];
  }

  function flipCard() {
    if (currentSession) {
      currentSession.isFlipped = !currentSession.isFlipped;
    }
  }

  function recordAnswer(rating) {
    if (!currentSession) return null;

    const card = getCurrentCard();
    if (!card) return null;

    let quality;
    if (typeof rating === 'boolean') {
      quality = rating ? 4 : 2;
    } else {
      quality = rating;
    }

    card.reviewCount = (card.reviewCount || 0) + 1;
    card.lastReviewed = new Date().toISOString();

    const updatedCard = calculateSM2(card, quality);

    if (quality >= 3) {
      card.correctCount = (card.correctCount || 0) + 1;
      updatedCard.confidence = Math.min((card.confidence || 0) + 1, CONFIDENCE.MASTERED);
      currentSession.correct++;
    } else {
      updatedCard.confidence = Math.max((card.confidence || 0) - 1, CONFIDENCE.UNKNOWN);
      currentSession.review++;
    }

    Object.assign(card, updatedCard);
    updateFlashcard(currentSession.topicId, card.id, card);

    currentSession.currentIndex++;
    currentSession.isFlipped = false;

    return {
      isComplete: currentSession.currentIndex >= currentSession.cards.length,
      stats: getSessionStats(),
      rating: quality,
    };
  }

  function skipCard() {
    if (currentSession) {
      currentSession.currentIndex++;
      currentSession.isFlipped = false;
    }
  }

  function getSessionStats() {
    if (!currentSession) return null;

    return {
      total: currentSession.cards.length,
      current: currentSession.currentIndex + 1,
      correct: currentSession.correct,
      review: currentSession.review,
      remaining: currentSession.cards.length - currentSession.currentIndex,
      percentComplete: Math.round(
        (currentSession.currentIndex / currentSession.cards.length) * 100
      ),
    };
  }

  function endSession() {
    const stats = currentSession ? getSessionStats() : null;
    currentSession = null;
    return stats;
  }

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function getStats(topicId = null) {
    const data = getAllFlashcards();
    let totalCards = 0;
    let autoGenerated = 0;
    let manual = 0;
    let mastered = 0;

    const topics = topicId ? [topicId] : Object.keys(data.flashcards);

    topics.forEach(topic => {
      const cards = data.flashcards[topic] || [];
      totalCards += cards.length;
      autoGenerated += cards.filter(c => c.source === 'auto').length;
      manual += cards.filter(c => c.source === 'manual').length;
      mastered += cards.filter(c => (c.confidence || 0) >= CONFIDENCE.PROFICIENT).length;
    });

    return {
      totalCards,
      autoGenerated,
      manual,
      mastered,
      toReview: totalCards - mastered,
      masteryPercentage: totalCards > 0 ? Math.round((mastered / totalCards) * 100) : 0,
    };
  }

  function exportDeck(topicId) {
    const cards = getFlashcards(topicId);
    const data = {
      topicId,
      cards,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${topicId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importDeck(jsonData, topicId) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      if (!data.cards || !Array.isArray(data.cards)) {
        throw new Error('Invalid flashcard data format');
      }

      const allData = getAllFlashcards();
      const existingCards = allData.flashcards[topicId] || [];

      data.cards.forEach(card => {
        const duplicate = existingCards.find(
          c => c.question.toLowerCase() === card.question.toLowerCase()
        );

        if (!duplicate) {
          saveFlashcard(topicId, { ...card, source: 'imported' });
        }
      });

      return true;
    } catch (e) {
      console.error('Error importing flashcards:', e);
      return false;
    }
  }

  window.Flashcards = {
    getSettings,
    saveSettings,
    getFlashcards,
    getDueCards,
    getDueCount,
    saveFlashcard,
    updateFlashcard,
    deleteFlashcard,
    parseMarkdownForFlashcards,
    startStudySession,
    getCurrentCard,
    flipCard,
    recordAnswer,
    skipCard,
    getSessionStats,
    endSession,
    getStats,
    exportDeck,
    importDeck,
    CONFIDENCE,
  };
})();
