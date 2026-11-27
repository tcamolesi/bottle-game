import katex from 'katex';
import 'katex/dist/katex.min.css';

export { katex };

/**
 * Render a LaTeX expression to HTML using KaTeX (Sunlit Apothecary espresso ink styling).
 * Never throws on malformed input so playback remains resilient.
 */
export function renderMath(tex, displayMode = false) {
  if (tex == null) return '';
  const cleaned = String(tex).trim();
  if (!cleaned) return '';
  try {
    return katex.renderToString(cleaned, {
      displayMode: Boolean(displayMode),
      throwOnError: false,
      strict: false,
      trust: true,
    });
  } catch {
    return escapeHtml(cleaned);
  }
}

/**
 * Create a DOM element containing rendered KaTeX math in deep espresso ink.
 */
export function createMathEl(tex, opts = {}) {
  const {
    displayMode = false,
    tag = displayMode ? 'div' : 'span',
    className = '',
    color = '#1F1A17',
    fontSize,
    style,
    x,
    y,
    align,
  } = opts;

  const el = document.createElement(tag);
  el.className = `math-node ${displayMode ? 'math-display' : 'math-inline'} ${className}`.trim();
  el.innerHTML = renderMath(tex, displayMode);

  if (color) el.style.color = color;
  if (fontSize) el.style.fontSize = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;

  if (x != null || y != null) {
    el.style.position = 'absolute';
    if (x != null) el.style.left = typeof x === 'number' ? `${x}px` : x;
    if (y != null) el.style.top = typeof y === 'number' ? `${y}px` : y;
    if (align === 'center') {
      el.style.transform = 'translateX(-50%)';
    } else if (align === 'right') {
      el.style.transform = 'translateX(-100%)';
    }
  }

  if (style && typeof style === 'object') {
    Object.assign(el.style, style);
  }

  return el;
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const HL_CLASSES = ['hl-terracotta', 'hl-delft', 'hl-sage', 'hl-brass', 'hl-plum'];

/**
 * Renders narration or UI text containing inline `$...$` / display `$$...$$`
 * math expressions together with warm editorial keyword highlights.
 */
export function renderRichText(text, highlights = []) {
  if (!text) return '';
  const mathTokens = [];
  const normHighlights = Array.isArray(highlights)
    ? highlights.filter((h) => typeof h === 'string' && h.trim().length > 0)
    : [];

  // 1. Extract $$...$$ and $...$ math segments into safe placeholders.
  let working = String(text).replace(
    /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$|(\b[A-Za-z0-9]+(?:[_^]\{[^}]+\})+)/g,
    (full, disp, inl, bareTex) => {
      const isDisplay = disp !== undefined;
      const rawTex = (isDisplay ? disp : inl !== undefined ? inl : bareTex).trim();
      const rendered = renderMath(rawTex, isDisplay);
      const hlIdx = normHighlights.findIndex((h) => {
        const stripped = h.replace(/^\$+|\$+$/g, '').trim().toLowerCase();
        return stripped === rawTex.toLowerCase() || h.trim().toLowerCase() === full.trim().toLowerCase();
      });
      const html =
        hlIdx >= 0
          ? `<span class="caption-math-hl ${HL_CLASSES[hlIdx % HL_CLASSES.length]}">${rendered}</span>`
          : `<span class="caption-math">${rendered}</span>`;
      const key = `\uE000MATH${mathTokens.length}\uE001`;
      mathTokens.push(html);
      return key;
    },
  );

  // 2. Escape remaining plain text HTML.
  working = escapeHtml(working);

  // 3. Highlight plain-text keywords (longest first, avoiding placeholders).
  const textHighlights = normHighlights
    .map((phrase, idx) => ({ phrase: phrase.trim(), idx }))
    .filter(({ phrase }) => !phrase.startsWith('$') && !phrase.includes('\\'))
    .sort((a, b) => b.phrase.length - a.phrase.length);

  if (textHighlights.length > 0) {
    const segmentRegex = /(\uE000MATH\d+\uE001|<[^>]+>)/g;
    for (const { phrase, idx } of textHighlights) {
      const escapedPhrase = escapeHtml(phrase);
      const pattern = new RegExp(`(${escapeRegex(escapedPhrase)})`, 'gi');
      const cls = HL_CLASSES[idx % HL_CLASSES.length];
      working = working
        .split(segmentRegex)
        .map((part) => {
          if (!part || part.startsWith('\uE000') || part.startsWith('<')) return part;
          return part.replace(pattern, `<mark class="caption-hl ${cls}">$1</mark>`);
        })
        .join('');
    }
  }

  // 4. Restore rendered KaTeX tokens.
  working = working.replace(/\uE000MATH(\d+)\uE001/g, (_, idx) => mathTokens[Number(idx)] || '');
  return working;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Create a crisp SVG root element sized for the 1280x590 safe stage area.
 */
export function createSvg(width = 1280, height = 590, attrs = {}) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('xmlns', SVG_NS);
  for (const [k, v] of Object.entries(attrs)) {
    if (v != null) svg.setAttribute(k, String(v));
  }
  return svg;
}

/**
 * Create an SVG child element with attributes and optional parent append.
 */
export function svgEl(tag, attrs = {}, parent = null) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === 'textContent') {
      el.textContent = String(v);
    } else if (k === 'style' && typeof v === 'object') {
      Object.assign(el.style, v);
    } else {
      el.setAttribute(k, String(v));
    }
  }
  if (parent) parent.appendChild(el);
  return el;
}
