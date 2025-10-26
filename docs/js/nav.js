(function () {
  'use strict';

  function init() {
    setupMobileMenu();
    setupScrollProgress();
    setupBackToTop();
    setupTableOfContents();
  }

  function setupTableOfContents() {
    const toc = document.querySelector('.table-of-contents');
    if (!toc) {
      console.warn('Table of Contents not found');
    }

    const links = toc.querySelectorAll('a');
    if (links.length === 0) {
      console.warn('No links found in Table of Contents');
    }

    const headingIds = Array.from(links)
      .map(link => {
        const href = link.getAttribute('href');
        return href ? href.substring(1) : null;
      })
      .filter(Boolean);

    let scrollTimeout;
    function updateActiveHeading() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPosition = window.scrollY + 100;

        let activeId = null;
        for (const id of headingIds) {
          const element = document.getElementById(id);
          if (element) {
            const offsetTop = element.offsetTop;
            if (scrollPosition >= offsetTop) {
              activeId = id;
            }
          }
        }

        for (const link of links) {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === `#${activeId}`);
        }
      }, 50);
    }

    window.addEventListener('scroll', updateActiveHeading);
    updateActiveHeading();

    for (const link of links) {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    }
  }

  function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    if (!menuToggle || !sidebar) return;

    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    if (mainContent) {
      mainContent.addEventListener('click', () => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });
    }
  }

  function setupScrollProgress() {
    const progressFill = document.getElementById('progress-fill');
    if (!progressFill) return;

    window.addEventListener('scroll', () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;

      progressFill.style.width = Math.min(progress, 100) + '%';
    });
  }

  function setupBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
