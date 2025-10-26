#!/usr/bin/env node

/**
 * Build Script for Study Guide
 *
 * Generates final HTML files from:
 * - pages.config.js (page definitions)
 * - template.html (shared structure)
 * - markdown source files (content)
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { markedHighlight } = require('marked-highlight');
const hljs = require('highlight.js');

const config = require('./pages.config.js');

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars except word chars, spaces, hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

const renderer = new marked.Renderer();

renderer.heading = function (text, level, raw) {
  const id = slugify(raw);
  return `<h${level} id="${id}">${text}</h${level}>\n`;
};

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);

marked.use({ renderer });

marked.setOptions({
  gfm: true,
  breaks: false,
  mangle: false,
});

const template = fs.readFileSync(path.join(config.outputDir, 'template.html'), 'utf8');

function generateNavHTML(currentFile) {
  return config.pages
    .map(page => {
      const isActive = page.file === currentFile;
      const activeClass = isActive ? ' class="active"' : '';
      return `            <li><a href="${page.file}"${activeClass}><span class="nav-number">${page.number}.</span>${page.title}</a></li>`;
    })
    .join('\n');
}

function calculateReadingTime(markdown) {
  const wordsPerMinute = 200;
  const words = markdown.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

function generateToC(markdown) {
  const headings = [];
  const lines = markdown.split('\n');

  lines.forEach(line => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const id = slugify(text);
      headings.push({ level, text, id });
    }
  });

  if (headings.length === 0) return '';

  const tocHTML = headings
    .map(h => {
      const indent = h.level === 3 ? 'toc-sub' : '';
      return `<li class="${indent}"><a href="#${h.id}">${h.text}</a></li>`;
    })
    .join('\n');

  return `
        <aside class="table-of-contents">
            <h3>On This Page</h3>
            <nav class="toc-nav">
                <ul>${tocHTML}</ul>
            </nav>
        </aside>
    `;
}

function getNavigation(currentFile) {
  const contentPages = config.pages.filter(p => !p.isHome);
  const currentIndex = contentPages.findIndex(p => p.file === currentFile);

  const prev = currentIndex > 0 ? contentPages[currentIndex - 1] : null;
  const next = currentIndex < contentPages.length - 1 ? contentPages[currentIndex + 1] : null;

  return { prev, next };
}

function generateNavButtons(currentFile) {
  const { prev, next } = getNavigation(currentFile);

  let html = '<div class="page-navigation">';

  if (prev) {
    html += `
            <a href="${prev.file}" class="nav-btn nav-prev" data-nav="prev">
                <span class="nav-label">Previous</span>
                <span class="nav-title">${prev.title}</span>
            </a>
        `;
  } else {
    html += '<div></div>';
  }

  if (next) {
    html += `
            <a href="${next.file}" class="nav-btn nav-next" data-nav="next">
                <span class="nav-label">Next</span>
                <span class="nav-title">${next.title}</span>
            </a>
        `;
  }

  html += '</div>';
  return html;
}

function generateHTML(title, content, currentFile, readingTime = null) {
  const navHTML = generateNavHTML(currentFile);

  let html = template
    .replace('{{TITLE}}', title)
    .replace('{{SITE_TITLE}}', config.site.title)
    .replace('{{NAV_LIST}}', navHTML)
    .replace('{{CONTENT}}', content);

  if (readingTime) {
    html = html.replace('{{READING_TIME}}', `${readingTime} min read`);
  } else {
    html = html.replace('{{READING_TIME}}', '');
  }

  return html;
}

function processPage(page) {
  const sourcePath = path.join(config.sourceDir, page.source);
  const outputPath = path.join(config.outputDir, page.file);

  if (!fs.existsSync(sourcePath)) {
    console.log(`Warning: Source file not found: ${sourcePath}`);
    return;
  }

  const markdown = fs.readFileSync(sourcePath, 'utf8');

  const readingTime = calculateReadingTime(markdown);

  const toc = generateToC(markdown);

  let htmlContent = marked.parse(markdown);

  const meta = `
        <div class="page-meta">
            <span class="reading-time"><i class="far fa-clock"></i> ${readingTime} min read</span>
        </div>
    `;

  if (toc) {
    htmlContent = toc + meta + htmlContent;
  } else {
    htmlContent = meta + htmlContent;
  }

  const navButtons = generateNavButtons(page.file);
  htmlContent += navButtons;

  const progressSection = `
        <div class="progress-section">
            <div id="progress-controls"></div>
            <div class="notes-section">
                <h3>Your Notes</h3>
                <textarea id="page-notes" placeholder="Add your notes here... (saved automatically)"></textarea>
            </div>
        </div>
    `;
  htmlContent += progressSection;

  const markdownSource = `
        <div id="markdown-source" style="display: none;">${markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    `;
  htmlContent += markdownSource;

  const html = generateHTML(page.title, htmlContent, page.file, readingTime);

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Generated: ${page.file} (from ${page.source})`);
}

function main() {
  console.log('Building study guide from markdown sources...\n');

  let successCount = 0;

  config.pages.forEach(page => {
    processPage(page);
    successCount++;
  });

  console.log(`\nBuild complete! Generated ${successCount} pages`);
}

main();
