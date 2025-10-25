/**
 * Progress Tracking System
 * Uses localStorage to track learning progress across sessions
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'theory_test_progress';
  const NOTES_KEY = 'theory_test_notes';

  const PROGRESS = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed'
  };

  /**
   * Get all progress data from localStorage
   */
  function getProgress() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error reading progress:', e);
      return {};
    }
  }

  /**
   * Save progress data to localStorage
   */
  function saveProgress(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving progress:', e);
      return false;
    }
  }

  /**
   * Get progress for a specific page
   */
  function getPageProgress(pageId) {
    const progress = getProgress();
    return progress[pageId] || {
      status: PROGRESS.NOT_STARTED,
      lastVisited: null,
      timeSpent: 0
    };
  }

  /**
   * Set progress for a specific page
   */
  function setPageProgress(pageId, status) {
    const progress = getProgress();
    const now = new Date().toISOString();

    progress[pageId] = {
      status: status,
      lastVisited: now,
      timeSpent: (progress[pageId]?.timeSpent || 0)
    };

    saveProgress(progress);
    updateUI();
    return true;
  }

  /**
   * Mark page as visited (in progress if not already completed)
   */
  function markVisited(pageId) {
    const current = getPageProgress(pageId);
    if (current.status === PROGRESS.NOT_STARTED) {
      setPageProgress(pageId, PROGRESS.IN_PROGRESS);
    }
  }

  /**
   * Calculate overall progress statistics
   */
  function getStats() {
    const progress = getProgress();
    const pages = Object.keys(progress);
    const total = pages.length;

    const completed = pages.filter(id =>
      progress[id].status === PROGRESS.COMPLETED
    ).length;

    const inProgress = pages.filter(id =>
      progress[id].status === PROGRESS.IN_PROGRESS
    ).length;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted: total - completed - inProgress,
      percentage
    };
  }

  /**
   * Reset all progress
   */
  function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(NOTES_KEY);
      updateUI();
      window.location.reload();
    }
  }

  /**
   * Get notes for a page
   */
  function getNotes(pageId) {
    try {
      const notes = localStorage.getItem(NOTES_KEY);
      const allNotes = notes ? JSON.parse(notes) : {};
      return allNotes[pageId] || '';
    } catch (e) {
      return '';
    }
  }

  /**
   * Save notes for a page
   */
  function saveNotes(pageId, content) {
    try {
      const notes = localStorage.getItem(NOTES_KEY);
      const allNotes = notes ? JSON.parse(notes) : {};
      allNotes[pageId] = content;
      localStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
      return true;
    } catch (e) {
      console.error('Error saving notes:', e);
      return false;
    }
  }

  /**
   * Update UI elements with progress indicators
   */
  function updateUI() {
    const links = document.querySelectorAll('#nav-list a');
    links.forEach(link => {
      const href = link.getAttribute('href');

      const pageId = href.replace('.html', '');
      const progress = getPageProgress(pageId);

      const existing = link.querySelector('.progress-indicator');
      if (existing) existing.remove();

      const indicator = document.createElement('span');
      indicator.className = 'progress-indicator';

      if (progress.status === PROGRESS.COMPLETED) {
        indicator.textContent = '✓';
        indicator.classList.add('completed');
        link.classList.add('page-completed');
      } else if (progress.status === PROGRESS.IN_PROGRESS) {
        indicator.textContent = '◐';
        indicator.classList.add('in-progress');
        link.classList.add('page-in-progress');
      }

      if (indicator.textContent) {
        link.appendChild(indicator);
      }
    });

    const progressBar = document.getElementById('overall-progress-bar');
    if (progressBar) {
      const stats = getStats();
      progressBar.style.width = stats.percentage + '%';

      const progressText = document.getElementById('progress-text');
      if (progressText) {
        progressText.textContent = `${stats.completed}/${stats.total} topics completed`;
      }
    }
  }

  /**
   * Setup progress controls on current page
   */
  function setupControls() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');

    if (currentPage && currentPage !== 'index') {
      markVisited(currentPage);
    }

    const controls = document.getElementById('progress-controls');
    if (controls && currentPage !== 'index') {
      const progress = getPageProgress(currentPage);

      controls.innerHTML = `
        <div class="progress-buttons">
          <button class="progress-btn ${progress.status === PROGRESS.IN_PROGRESS ? 'active' : ''}"
                  data-status="${PROGRESS.IN_PROGRESS}">
            In Progress
          </button>
          <button class="progress-btn ${progress.status === PROGRESS.COMPLETED ? 'active' : ''}"
                  data-status="${PROGRESS.COMPLETED}">
            ✓ Completed
          </button>
        </div>
      `;

      controls.querySelectorAll('.progress-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const status = btn.dataset.status;
          setPageProgress(currentPage, status);

          controls.querySelectorAll('.progress-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    const notesArea = document.getElementById('page-notes');
    if (notesArea && currentPage !== 'index') {
      const notes = getNotes(currentPage);
      notesArea.value = notes;

      let saveTimer;
      notesArea.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          saveNotes(currentPage, notesArea.value);
        }, 500);
      });
    }
  }

  /**
   * Export progress as JSON
   */
  function exportProgress() {
    const progress = getProgress();
    const notes = localStorage.getItem(NOTES_KEY);
    const data = {
      progress,
      notes: notes ? JSON.parse(notes) : {},
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import progress from JSON
   */
  function importProgress(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.progress) {
          saveProgress(data.progress);
        }
        if (data.notes) {
          localStorage.setItem(NOTES_KEY, JSON.stringify(data.notes));
        }
        updateUI();
        alert('Progress imported successfully!');
        window.location.reload();
      } catch (err) {
        alert('Error importing progress: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function init() {
    updateUI();
    setupControls();

    const resetBtn = document.getElementById('reset-progress');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetProgress);
    }

    const exportBtn = document.getElementById('export-progress');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportProgress);
    }

    const importBtn = document.getElementById('import-progress');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          if (e.target.files[0]) {
            importProgress(e.target.files[0]);
          }
        };
        input.click();
      });
    }
  }

  window.ProgressTracker = {
    getProgress,
    getPageProgress,
    setPageProgress,
    markVisited,
    getStats,
    resetProgress,
    getNotes,
    saveNotes,
    updateUI,
    exportProgress,
    PROGRESS
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
