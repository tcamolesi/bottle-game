/**
 * Sunlit Apothecary Bottle & Coaster Kit (2D SVG + 3D Three.js)
 * Handcrafted editorial props: every bottle wears a crisp cream parchment
 * belly label with a bold number (0..5) so viewers always know its home coaster.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

export const PALETTE = {
  bg: '#F6F1E7',
  cream: '#FBF8F1',
  linen: '#EDE4D3',
  parchment: '#FFFBF2',
  ink: '#1F1A17',
  sepia: '#6B5E54',
  muted: '#8B7D71',
  brass: '#C88A1E',
  brassLight: '#E8BC66',
  gold: '#C88A1E',
  goldBright: '#E09F3E',
  terracotta: '#D95D48',
  sage: '#4E8C6F',
  delft: '#3D7EA6',
  plum: '#8A5A8C',
  rose: '#CC7289',
  cinnabar: '#C44536',
  emerald: '#4E8C6F',
  wood: '#B8895A',
  woodDark: '#7C5432',
  woodLight: '#D8B288',
  border: 'rgba(107, 94, 84, 0.22)',
  surface: '#FBF8F1',
  text: '#1F1A17',
  bottles: [
    '#D95D48', // 0: Terracotta
    '#E09F3E', // 1: Honey Ochre
    '#4E8C6F', // 2: Botanical Sage
    '#3D7EA6', // 3: Delft Blue
    '#8A5A8C', // 4: Apothecary Plum
    '#CC7289', // 5: Dusty Rose
    '#3B8EA5', // 6: Sea Glass Teal
    '#C98A32', // 7: Burnished Amber
  ],
};

let _uidCounter = 0;
function nextUid(prefix) {
  _uidCounter += 1;
  return `${prefix}_${_uidCounter}`;
}

function el(tag, attrs = {}, parent = null) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === 'textContent') {
      node.textContent = String(v);
    } else if (k === 'style' && typeof v === 'object') {
      Object.assign(node.style, v);
    } else {
      node.setAttribute(k, String(v));
    }
  }
  if (parent) parent.appendChild(node);
  return node;
}

function shadeHex(hex, factor) {
  const clean = String(hex || '#D95D48').replace('#', '');
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  const nr = factor >= 0 ? r + (255 - r) * factor : r * (1 + factor);
  const ng = factor >= 0 ? g + (255 - g) * factor : g * (1 + factor);
  const nb = factor >= 0 ? b + (255 - b) * factor : b * (1 + factor);
  return `#${clamp(nr).toString(16).padStart(2, '0')}${clamp(ng)
    .toString(16)
    .padStart(2, '0')}${clamp(nb).toString(16).padStart(2, '0')}`;
}

export function getBottleColor(labelNum, override) {
  if (override) return override;
  const idx = Number(labelNum);
  if (Number.isFinite(idx) && idx >= 0) {
    return PALETTE.bottles[Math.floor(idx) % PALETTE.bottles.length];
  }
  return PALETTE.terracotta;
}

/**
 * Create a handcrafted 2D SVG apothecary bottle group (<g>).
 * Local coordinate origin (0, 0) is the bottom-center resting point on a coaster/shelf.
 * Bounds: x in [-29, 29], y in [-112, 8].
 */
export function createSvgBottle(labelNum, opts = {}) {
  const {
    x = 0,
    y = 0,
    scale = 1,
    color,
    liquidLevel = 0.68,
    matched = false,
    showShadow = true,
    labelText,
    className = '',
    opacity = 1,
  } = opts;

  const baseColor = getBottleColor(labelNum, color);
  const lightColor = shadeHex(baseColor, 0.24);
  const darkColor = shadeHex(baseColor, -0.22);
  const meniscusColor = shadeHex(baseColor, 0.36);

  const clipId = nextUid('btl_clip');
  const liqGradId = nextUid('btl_liq');
  const glassGradId = nextUid('btl_glass');
  const corkGradId = nextUid('btl_cork');
  const glowGradId = nextUid('btl_glow');

  const g = el('g', {
    class: `apothecary-bottle ${matched ? 'is-matched' : ''} ${className}`.trim(),
    'data-label': String(labelNum),
    opacity: opacity !== 1 ? String(opacity) : null,
  });

  if (x !== 0 || y !== 0 || scale !== 1) {
    const parts = [];
    if (x !== 0 || y !== 0) parts.push(`translate(${x}, ${y})`);
    if (scale !== 1) parts.push(`scale(${scale})`);
    g.setAttribute('transform', parts.join(' '));
  }

  // Bottle outer silhouette path (bottom-center at 0,0; shoulder curves to neck & flared lip)
  const bodyPath =
    'M -21 -2 ' +
    'C -24 -2, -25 -6, -25 -12 ' +
    'L -25 -54 ' +
    'C -25 -70, -14 -76, -10 -82 ' +
    'L -10 -94 ' +
    'C -12.5 -94.5, -13 -98, -10.5 -99.5 ' +
    'L 10.5 -99.5 ' +
    'C 13 -98, 12.5 -94.5, 10 -94 ' +
    'L 10 -82 ' +
    'C 14 -76, 25 -70, 25 -54 ' +
    'L 25 -12 ' +
    'C 25 -6, 24 -2, 21 -2 ' +
    'Z';

  // Slightly inset inner glass cavity for clean liquid fill
  const innerPath =
    'M -19.5 -4.5 ' +
    'C -21.5 -4.5, -22.2 -7.5, -22.2 -12.5 ' +
    'L -22.2 -54 ' +
    'C -22.2 -67.5, -12.5 -73.5, -7.8 -80.5 ' +
    'L -7.8 -93.5 ' +
    'L 7.8 -93.5 ' +
    'L 7.8 -80.5 ' +
    'C 12.5 -73.5, 22.2 -67.5, 22.2 -54 ' +
    'L 22.2 -12.5 ' +
    'C 22.2 -7.5, 21.5 -4.5, 19.5 -4.5 ' +
    'Z';

  const defs = el('defs', {}, g);

  const clip = el('clipPath', { id: clipId }, defs);
  el('path', { d: innerPath }, clip);

  const liqGrad = el('linearGradient', { id: liqGradId, x1: '0%', y1: '0%', x2: '100%', y2: '0%' }, defs);
  el('stop', { offset: '0%', 'stop-color': lightColor }, liqGrad);
  el('stop', { offset: '36%', 'stop-color': baseColor }, liqGrad);
  el('stop', { offset: '84%', 'stop-color': darkColor }, liqGrad);
  el('stop', { offset: '100%', 'stop-color': baseColor }, liqGrad);

  const glassGrad = el('linearGradient', { id: glassGradId, x1: '0%', y1: '0%', x2: '100%', y2: '0%' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#FFFDF9', 'stop-opacity': '0.94' }, glassGrad);
  el('stop', { offset: '45%', 'stop-color': '#F5EFE2', 'stop-opacity': '0.78' }, glassGrad);
  el('stop', { offset: '100%', 'stop-color': '#E3D7C3', 'stop-opacity': '0.88' }, glassGrad);

  const corkGrad = el('linearGradient', { id: corkGradId, x1: '0%', y1: '0%', x2: '100%', y2: '0%' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#D9AE7E' }, corkGrad);
  el('stop', { offset: '55%', 'stop-color': '#BE8D5B' }, corkGrad);
  el('stop', { offset: '100%', 'stop-color': '#996A3D' }, corkGrad);

  const glowGrad = el('radialGradient', { id: glowGradId, cx: '50%', cy: '50%', r: '50%' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#F3C96B', 'stop-opacity': '0.58' }, glowGrad);
  el('stop', { offset: '62%', 'stop-color': '#E09F3E', 'stop-opacity': '0.2' }, glowGrad);
  el('stop', { offset: '100%', 'stop-color': '#E09F3E', 'stop-opacity': '0' }, glowGrad);

  // Soft honey-brass aura behind bottle when matched
  const glowEl = el(
    'ellipse',
    {
      class: 'bottle-glow',
      cx: '0',
      cy: '-44',
      rx: '38',
      ry: '54',
      fill: `url(#${glowGradId})`,
      opacity: matched ? '1' : '0',
    },
    g,
  );

  // Warm grounded contact shadow
  if (showShadow) {
    el(
      'ellipse',
      {
        class: 'bottle-shadow',
        cx: '1',
        cy: '1.5',
        rx: '24',
        ry: '5.5',
        fill: '#4A3828',
        opacity: '0.2',
      },
      g,
    );
  }

  // Cork stopper
  const corkG = el('g', { class: 'bottle-cork' }, g);
  el(
    'path',
    {
      d: 'M -8.6 -108.5 C -8.6 -110.5, 8.6 -110.5, 8.6 -108.5 L 7.4 -97.5 L -7.4 -97.5 Z',
      fill: `url(#${corkGradId})`,
      stroke: PALETTE.ink,
      'stroke-width': '1.8',
      'stroke-linejoin': 'round',
    },
    corkG,
  );
  // Cork top rim highlight + organic wood texture ticks
  el(
    'ellipse',
    {
      cx: '0',
      cy: '-108.2',
      rx: '7.5',
      ry: '1.8',
      fill: '#E7C49A',
      opacity: '0.75',
    },
    corkG,
  );
  el('line', { x1: '-4.2', y1: '-105', x2: '-3.8', y2: '-101.2', stroke: '#7A522E', 'stroke-width': '1.05', 'stroke-linecap': 'round', opacity: '0.7' }, corkG);
  el('line', { x1: '1.4', y1: '-104.2', x2: '1.8', y2: '-100.5', stroke: '#7A522E', 'stroke-width': '1.0', 'stroke-linecap': 'round', opacity: '0.65' }, corkG);
  el('line', { x1: '4.5', y1: '-105.6', x2: '4.2', y2: '-102.6', stroke: '#7A522E', 'stroke-width': '0.9', 'stroke-linecap': 'round', opacity: '0.55' }, corkG);

  // Main glass body container
  const bodyG = el('g', { class: 'bottle-body' }, g);

  // Glass base tint
  el(
    'path',
    {
      d: bodyPath,
      fill: `url(#${glassGradId})`,
    },
    bodyG,
  );

  // Filled gouache liquid clipped cleanly inside glass wall
  const clampedLevel = Math.max(0.15, Math.min(0.88, Number(liquidLevel) || 0.68));
  const liqTopY = -6 - clampedLevel * 68;
  const liqG = el('g', { class: 'bottle-liquid', 'clip-path': `url(#${clipId})` }, bodyG);
  el(
    'rect',
    {
      x: '-26',
      y: String(liqTopY),
      width: '52',
      height: String(Math.abs(liqTopY) + 4),
      fill: `url(#${liqGradId})`,
    },
    liqG,
  );
  // Meniscus ellipse at top of liquid
  el(
    'ellipse',
    {
      cx: '0',
      cy: String(liqTopY),
      rx: '23',
      ry: '3.6',
      fill: meniscusColor,
      opacity: '0.88',
    },
    liqG,
  );
  // Subtle thick-glass bottom heel reflection
  el(
    'path',
    {
      d: 'M -20 -6.5 Q 0 -3 20 -6.5 L 20 -2 L -20 -2 Z',
      fill: '#FFFBF2',
      opacity: '0.35',
    },
    liqG,
  );

  // Crisp left glass specular streak & shoulder gleam
  el(
    'path',
    {
      d: 'M -17.5 -14 L -17.5 -53 C -17.5 -63, -10.5 -69, -6.5 -76',
      fill: 'none',
      stroke: '#FFFFFF',
      'stroke-width': '3.4',
      'stroke-linecap': 'round',
      opacity: '0.68',
    },
    bodyG,
  );
  el(
    'circle',
    {
      cx: '-17.5',
      cy: '-9.5',
      r: '1.7',
      fill: '#FFFFFF',
      opacity: '0.78',
    },
    bodyG,
  );
  // Subtle warm rim catchlight on right shoulder
  el(
    'path',
    {
      d: 'M 19 -18 L 19 -51 C 19 -59, 14.5 -65, 11 -70',
      fill: 'none',
      stroke: '#FFFBF2',
      'stroke-width': '1.6',
      'stroke-linecap': 'round',
      opacity: '0.36',
    },
    bodyG,
  );

  // Storybook espresso ink outline of bottle
  el(
    'path',
    {
      d: bodyPath,
      fill: 'none',
      stroke: PALETTE.ink,
      'stroke-width': '2.15',
      'stroke-linejoin': 'round',
    },
    bodyG,
  );
  // Subtle glass lip collar line
  el(
    'line',
    {
      x1: '-9.5',
      y1: '-94',
      x2: '9.5',
      y2: '-94',
      stroke: PALETTE.ink,
      'stroke-width': '1.35',
      opacity: '0.55',
    },
    bodyG,
  );

  // Cream parchment belly label with bold dark number (0..5)
  const labelG = el('g', { class: 'bottle-label' }, bodyG);
  el(
    'rect',
    {
      x: '-18.5',
      y: '-52',
      width: '37',
      height: '34',
      rx: '4.2',
      fill: PALETTE.parchment,
      stroke: PALETTE.ink,
      'stroke-width': '1.45',
    },
    labelG,
  );
  // Inner fine sepia/brass parchment rule
  el(
    'rect',
    {
      x: '-15.5',
      y: '-49',
      width: '31',
      height: '28',
      rx: '2.4',
      fill: 'none',
      stroke: matched ? PALETTE.brass : '#C6B7A2',
      'stroke-width': matched ? '1.3' : '0.95',
    },
    labelG,
  );
  // Four tiny corner rivet dots on label
  const dotCoords = [
    [-13.3, -46.8],
    [13.3, -46.8],
    [-13.3, -23.2],
    [13.3, -23.2],
  ];
  for (const [dx, dy] of dotCoords) {
    el('circle', { cx: String(dx), cy: String(dy), r: '1.05', fill: matched ? PALETTE.brass : '#9E8E7B' }, labelG);
  }

  const displayStr = labelText != null ? String(labelText) : String(labelNum);
  const fontSize = displayStr.length > 2 ? 13 : displayStr.length === 2 ? 17 : 22;
  const labelTextEl = el(
    'text',
    {
      class: 'bottle-label-num',
      x: '0',
      y: '-28',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: PALETTE.ink,
      'font-family': "'JetBrains Mono', ui-monospace, monospace",
      'font-size': String(fontSize),
      'font-weight': '700',
      textContent: displayStr,
    },
    labelG,
  );
  // Shift central slightly up for optical balance inside the label rectangle
  labelTextEl.setAttribute('y', '-34.5');

  // Helper methods attached directly to the returned <g>
  g.setMatched = (isMatched) => {
    const on = Boolean(isMatched);
    g.classList.toggle('is-matched', on);
    glowEl.setAttribute('opacity', on ? '1' : '0');
  };

  g.setLabel = (newLabel) => {
    g.setAttribute('data-label', String(newLabel));
    labelTextEl.textContent = String(newLabel);
  };

  return g;
}

/**
 * Create a tactile 2D SVG wooden/brass coaster (<g>).
 * Represents the SECRET HIDDEN ANSWER beneath a bottle:
 *   - `hidden: true`  -> Player View: shows embossed brass-rimmed `?` veil badge (`.coaster-veil`)
 *   - `hidden: false` -> Audience X-Ray View (default for backwards compat): shows secret number (`.coaster-secret`)
 * Local origin (0, 0) is the top-center resting surface where a bottle's (0, 0) sits.
 */
export function createSvgCoaster(secretNum, opts = {}) {
  const {
    x = 0,
    y = 0,
    scale = 1,
    matched = false,
    width = 76,
    labelText,
    showLabel = true,
    hidden = false,
    slotIndex = null,
    veilText = '?',
    className = '',
  } = opts;

  const rx = width / 2;
  const ry = Math.max(9, width * 0.16);
  const thickness = 6;
  const glowId = nextUid('cstr_glow');
  const woodId = nextUid('cstr_wood');
  const veilGradId = nextUid('cstr_veil');

  const g = el('g', {
    class: `apothecary-coaster ${matched ? 'is-matched' : ''} ${hidden ? 'is-hidden' : ''} ${className}`.trim(),
    'data-slot': String(slotIndex != null ? slotIndex : secretNum),
    'data-secret-num': String(secretNum),
    'data-revealed': hidden ? 'false' : 'true',
  });

  if (x !== 0 || y !== 0 || scale !== 1) {
    const parts = [];
    if (x !== 0 || y !== 0) parts.push(`translate(${x}, ${y})`);
    if (scale !== 1) parts.push(`scale(${scale})`);
    g.setAttribute('transform', parts.join(' '));
  }

  const defs = el('defs', {}, g);
  const glowGrad = el('radialGradient', { id: glowId, cx: '50%', cy: '50%', r: '50%' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#F3C96B', 'stop-opacity': '0.78' }, glowGrad);
  el('stop', { offset: '65%', 'stop-color': '#C88A1E', 'stop-opacity': '0.28' }, glowGrad);
  el('stop', { offset: '100%', 'stop-color': '#C88A1E', 'stop-opacity': '0' }, glowGrad);

  const woodGrad = el('linearGradient', { id: woodId, x1: '0%', y1: '0%', x2: '100%', y2: '0%' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#C99C6B' }, woodGrad);
  el('stop', { offset: '50%', 'stop-color': '#DFBA8F' }, woodGrad);
  el('stop', { offset: '100%', 'stop-color': '#B48352' }, woodGrad);

  const veilGrad = el('linearGradient', { id: veilGradId, x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#49392E' }, veilGrad);
  el('stop', { offset: '100%', 'stop-color': '#2B211A' }, veilGrad);

  // Warm drop shadow under coaster
  el(
    'ellipse',
    {
      cx: '0',
      cy: String(thickness + 4),
      rx: String(rx + 4),
      ry: String(ry + 2.5),
      fill: '#4A3828',
      opacity: '0.18',
    },
    g,
  );

  // Honey-gold match halo (supports both .coaster-glow and .coaster-halo selectors)
  const matchHalo = el(
    'ellipse',
    {
      class: 'coaster-glow coaster-halo',
      cx: '0',
      cy: '1',
      rx: String(rx + 14),
      ry: String(ry + 9),
      fill: `url(#${glowId})`,
      opacity: matched ? '1' : '0',
    },
    g,
  );

  // Wooden coaster side rim (2.5D thickness)
  el(
    'path',
    {
      d: `M ${-rx} 0 L ${-rx} ${thickness} A ${rx} ${ry} 0 0 0 ${rx} ${thickness} L ${rx} 0 Z`,
      fill: PALETTE.woodDark,
      stroke: PALETTE.ink,
      'stroke-width': '1.6',
      'stroke-linejoin': 'round',
    },
    g,
  );

  // Coaster top oak face
  el(
    'ellipse',
    {
      cx: '0',
      cy: '0',
      rx: String(rx),
      ry: String(ry),
      fill: `url(#${woodId})`,
      stroke: PALETTE.ink,
      'stroke-width': '1.6',
    },
    g,
  );

  // Inner inlaid burnished brass ring
  const brassRing = el(
    'ellipse',
    {
      class: 'coaster-brass-ring',
      cx: '0',
      cy: '0',
      rx: String(rx * 0.78),
      ry: String(ry * 0.74),
      fill: matched ? 'rgba(243, 201, 107, 0.34)' : 'none',
      stroke: matched ? '#F2BE4F' : PALETTE.brass,
      'stroke-width': matched ? '2.4' : '1.4',
    },
    g,
  );

  // Front medallion below coaster: houses both .coaster-secret (X-ray answer) and .coaster-veil (`?` player view)
  let badgeCircle = null;
  let starGroup = null;
  let secretG = null;
  let veilG = null;
  let secretTextEl = null;

  if (showLabel) {
    const tagY = ry + thickness + 16;
    const tagG = el('g', { class: 'coaster-badge', transform: `translate(0, ${tagY})` }, g);

    const secretStr = labelText != null ? String(labelText) : String(secretNum);
    const pillW = Math.max(30, secretStr.length > 2 ? secretStr.length * 9.5 + 14 : 30);
    const pillH = 24;
    const halfW = pillW / 2;
    const halfH = pillH / 2;

    // 1. Secret Answer Face (Audience X-Ray View)
    secretG = el(
      'g',
      {
        class: 'coaster-secret',
        opacity: hidden ? '0' : '1',
        transform: hidden ? 'scale(1, 0.06)' : 'scale(1, 1)',
      },
      tagG,
    );

    badgeCircle = el(
      'rect',
      {
        x: String(-halfW),
        y: String(-halfH),
        width: String(pillW),
        height: String(pillH),
        rx: String(halfH),
        fill: matched ? '#FDF0CC' : PALETTE.parchment,
        stroke: matched ? PALETTE.brass : '#A99986',
        'stroke-width': matched ? '2' : '1.35',
      },
      secretG,
    );

    secretTextEl = el(
      'text',
      {
        class: 'coaster-secret-text',
        x: '0',
        y: '0.5',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: matched ? '#7A4F09' : PALETTE.ink,
        'font-family': "'JetBrains Mono', ui-monospace, monospace",
        'font-size': secretStr.length > 2 ? '11.5' : '13.5',
        'font-weight': '700',
        textContent: secretStr,
      },
      secretG,
    );

    // Tiny embossed brass star on top-right of medallion when matched
    starGroup = el(
      'g',
      {
        class: 'coaster-star',
        transform: `translate(${halfW}, -9.5)`,
        opacity: matched ? '1' : '0',
      },
      secretG,
    );
    el('circle', { cx: '0', cy: '0', r: '6.2', fill: PALETTE.brass, stroke: PALETTE.parchment, 'stroke-width': '1.2' }, starGroup);
    el(
      'path',
      {
        d: 'M 0 -3.6 L 1.05 -1.15 L 3.7 -0.9 L 1.65 0.85 L 2.25 3.45 L 0 2.05 L -2.25 3.45 L -1.65 0.85 L -3.7 -0.9 L -1.05 -1.15 Z',
        fill: PALETTE.parchment,
      },
      starGroup,
    );

    // 2. Veiled Mystery Face (Player View: embossed `?` brass-rimmed badge)
    veilG = el(
      'g',
      {
        class: 'coaster-veil',
        opacity: hidden ? '1' : '0',
        transform: hidden ? 'scale(1, 1)' : 'scale(1, 0.06)',
      },
      tagG,
    );

    el(
      'rect',
      {
        x: String(-halfW),
        y: String(-halfH),
        width: String(pillW),
        height: String(pillH),
        rx: String(halfH),
        fill: `url(#${veilGradId})`,
        stroke: PALETTE.brass,
        'stroke-width': '1.65',
      },
      veilG,
    );
    el(
      'rect',
      {
        x: String(-(halfW - 2.4)),
        y: String(-(halfH - 2.4)),
        width: String(pillW - 4.8),
        height: String(pillH - 4.8),
        rx: String(halfH - 2.4),
        fill: 'none',
        stroke: 'rgba(232, 188, 102, 0.44)',
        'stroke-width': '0.85',
      },
      veilG,
    );
    el(
      'text',
      {
        class: 'coaster-veil-text',
        x: '0',
        y: '0.5',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: '#F5DFB0',
        'font-family': "'Fraunces', Georgia, serif",
        'font-size': '15',
        'font-weight': '700',
        textContent: String(veilText),
      },
      veilG,
    );

    // Optional subtle physical slot index caption beneath medallion (e.g., "Slot 0")
    if (slotIndex != null && slotIndex !== false) {
      const slotLabel = typeof slotIndex === 'string' ? slotIndex : `Slot ${slotIndex}`;
      el(
        'text',
        {
          class: 'coaster-slot-caption',
          x: '0',
          y: String(tagY + 20.5),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: PALETTE.muted,
          'font-family': "'JetBrains Mono', ui-monospace, monospace",
          'font-size': '9.5',
          'font-weight': '600',
          'letter-spacing': '0.04em',
          textContent: slotLabel,
        },
        g,
      );
    }
  }

  g.coasterVeil = veilG;
  g.coasterSecret = secretG;
  g.coasterHalo = matchHalo;

  g.setMatched = (isMatched) => {
    const on = Boolean(isMatched);
    g.classList.toggle('is-matched', on);
    matchHalo.setAttribute('opacity', on ? '1' : '0');
    brassRing.setAttribute('stroke', on ? '#F2BE4F' : PALETTE.brass);
    brassRing.setAttribute('stroke-width', on ? '2.4' : '1.4');
    brassRing.setAttribute('fill', on ? 'rgba(243, 201, 107, 0.34)' : 'none');
    if (badgeCircle) {
      badgeCircle.setAttribute('fill', on ? '#FDF0CC' : PALETTE.parchment);
      badgeCircle.setAttribute('stroke', on ? PALETTE.brass : '#A99986');
      badgeCircle.setAttribute('stroke-width', on ? '2' : '1.35');
    }
    if (secretTextEl) {
      secretTextEl.setAttribute('fill', on ? '#7A4F09' : PALETTE.ink);
    }
    if (starGroup) {
      starGroup.setAttribute('opacity', on ? '1' : '0');
    }
  };

  g.setSecretNum = (newNum) => {
    g.setAttribute('data-secret-num', String(newNum));
    if (secretTextEl) {
      secretTextEl.textContent = String(newNum);
    }
  };

  g.setRevealed = (revealed) => {
    const rev = Boolean(revealed);
    g.setAttribute('data-revealed', rev ? 'true' : 'false');
    g.classList.toggle('is-hidden', !rev);
    if (veilG) {
      veilG.setAttribute('opacity', rev ? '0' : '1');
      veilG.setAttribute('transform', rev ? 'scale(1, 0.06)' : 'scale(1, 1)');
    }
    if (secretG) {
      secretG.setAttribute('opacity', rev ? '1' : '0');
      secretG.setAttribute('transform', rev ? 'scale(1, 1)' : 'scale(1, 0.06)');
    }
  };

  return g;
}

/**
 * Smoothly flip one or more SVG or Three.js coasters between Player View (`?`)
 * and Audience X-Ray View (secret number). Scrubbing-safe when given a GSAP timeline.
 *
 * @param {SVGElement|THREE.Group|Array} coasterG - Single coaster or array/NodeList of coasters
 * @param {boolean} revealed - true = show secret number, false = show `?` veil
 * @param {object|null} gsapTimeline - Optional GSAP timeline; if omitted, snaps immediately
 * @param {number|string} atTime - Timeline insertion position (default 0)
 * @param {number} dur - Total flip duration in seconds (default 0.42)
 */
export function setCoasterRevealed(coasterG, revealed, gsapTimeline = null, atTime = 0, dur = 0.42) {
  if (!coasterG) return;
  if (Array.isArray(coasterG) || (typeof NodeList !== 'undefined' && coasterG instanceof NodeList)) {
    coasterG.forEach((item) => setCoasterRevealed(item, revealed, gsapTimeline, atTime, dur));
    return;
  }

  const rev = Boolean(revealed);

  // Three.js coaster support
  if (coasterG.userData && coasterG.userData.veilMesh && coasterG.userData.secretMesh) {
    const { veilMesh, secretMesh } = coasterG.userData;
    if (!gsapTimeline) {
      coasterG.userData.setRevealed?.(rev);
      return;
    }
    const half = Math.max(0.06, (Number(dur) || 0.42) * 0.5);
    const outMesh = rev ? veilMesh : secretMesh;
    const inMesh = rev ? secretMesh : veilMesh;
    const t0 = typeof atTime === 'number' ? atTime : atTime;
    const tMid = typeof atTime === 'number' ? atTime + half : `>+=${half}`;

    gsapTimeline.to(outMesh.scale, { y: 0.001, duration: half, ease: 'power2.in' }, t0);
    gsapTimeline.to(outMesh.material, { opacity: 0, duration: half, ease: 'power2.in' }, t0);
    gsapTimeline.fromTo(
      inMesh.scale,
      { y: 0.001 },
      { y: 1, duration: half, ease: 'back.out(1.6)', immediateRender: false },
      tMid,
    );
    gsapTimeline.fromTo(
      inMesh.material,
      { opacity: 0 },
      { opacity: 1, duration: half, ease: 'power2.out', immediateRender: false },
      tMid,
    );
    coasterG.userData.isRevealed = rev;
    return;
  }

  // 2D SVG coaster support
  const veilEl = coasterG.coasterVeil || coasterG.querySelector?.('.coaster-veil');
  const secretEl = coasterG.coasterSecret || coasterG.querySelector?.('.coaster-secret');
  if (!veilEl || !secretEl) {
    coasterG.setRevealed?.(rev);
    return;
  }

  if (!gsapTimeline) {
    coasterG.setRevealed?.(rev);
    return;
  }

  const half = Math.max(0.06, (Number(dur) || 0.42) * 0.5);
  const outEl = rev ? veilEl : secretEl;
  const inEl = rev ? secretEl : veilEl;
  const tMid = typeof atTime === 'number' ? atTime + half : `>+=${half}`;

  gsapTimeline.to(
    outEl,
    {
      opacity: 0,
      attr: { transform: 'scale(1, 0.06)' },
      duration: half,
      ease: 'power2.in',
    },
    atTime,
  );
  gsapTimeline.fromTo(
    inEl,
    {
      opacity: 0,
      attr: { transform: 'scale(1, 0.06)' },
    },
    {
      opacity: 1,
      attr: { transform: 'scale(1, 1)' },
      duration: half,
      ease: 'back.out(1.6)',
      immediateRender: false,
    },
    tMid,
  );
}

// ---------------------------------------------------------------------------
// ANTI-OVERLAP FROSTED CREAM SCRIM LABEL (2D SVG)
// ---------------------------------------------------------------------------

function resolveScrimFontFamily(fontFamily) {
  if (!fontFamily || fontFamily === 'body') {
    return "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  }
  if (fontFamily === 'mono') {
    return "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";
  }
  if (fontFamily === 'editorial' || fontFamily === 'serif') {
    return "'Fraunces', Georgia, 'Times New Roman', serif";
  }
  return fontFamily;
}

function estimateSvgTextWidth(str, fontSize, fontFamilyStr, fontWeight, letterSpacing) {
  const s = String(str || '');
  if (!s.length) return 0;
  const isMono = /mono|jetbrains|menlo|consolas/i.test(fontFamilyStr);
  const weightMul = Number(fontWeight) >= 600 ? 1.05 : 1.0;
  const extraSpace = Number.isFinite(Number(letterSpacing)) ? Number(letterSpacing) : 0;

  let units = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (isMono) {
      units += 0.62;
    } else if (ch === ' ') {
      units += 0.30;
    } else if ('ilI1tfj.,:;|!\'`()[]'.includes(ch)) {
      units += 0.34;
    } else if ('WMmw@%&↔→←'.includes(ch)) {
      units += 0.84;
    } else if (/[A-Z0-9]/.test(ch)) {
      units += 0.64;
    } else {
      units += 0.55;
    }
  }
  return units * fontSize * weightMul + Math.max(0, s.length - 1) * extraSpace;
}

/**
 * Create an anti-overlap frosted parchment pill label (`<g class="svg-scrim-label">`)
 * so diagram strokes, edges, or arrows NEVER slice through floating annotation text.
 * Automatically sizes its pill `<rect>` immediately via smart metrics and refines to
 * exact pixel width via `getComputedTextLength()` once attached to the SVG DOM.
 */
export function createSvgScrimLabel(text, opts = {}) {
  const {
    x = 0,
    y = 0,
    fontSize = 13,
    fontFamily = 'body',
    fontWeight = 600,
    fontStyle = 'normal',
    color = PALETTE.ink,
    fill = '#FBF8F1',
    fillOpacity = 0.93,
    stroke = 'rgba(107, 94, 84, 0.18)',
    strokeWidth = 1,
    padX = 11,
    padY = 5,
    rx = null,
    anchor = 'middle',
    minWidth = 0,
    letterSpacing = null,
    shadow = true,
    opacity = 1,
    className = '',
  } = opts;

  const resolvedFont = resolveScrimFontFamily(fontFamily);
  const g = el('g', {
    class: `svg-scrim-label ${className}`.trim(),
    opacity: opacity !== 1 ? String(opacity) : null,
  });

  if (x !== 0 || y !== 0) {
    g.setAttribute('transform', `translate(${x}, ${y})`);
  }

  let shadowRect = null;
  if (shadow) {
    shadowRect = el(
      'rect',
      {
        class: 'scrim-shadow',
        fill: '#1F1A17',
        opacity: '0.06',
      },
      g,
    );
  }

  const rectEl = el(
    'rect',
    {
      class: 'scrim-bg',
      fill,
      'fill-opacity': String(fillOpacity),
      stroke,
      'stroke-width': String(strokeWidth),
    },
    g,
  );

  const textEl = el(
    'text',
    {
      class: 'scrim-text',
      x: '0',
      y: '0.5',
      'text-anchor': anchor,
      'dominant-baseline': 'central',
      fill: color,
      'font-family': resolvedFont,
      'font-size': String(fontSize),
      'font-weight': String(fontWeight),
      'font-style': fontStyle !== 'normal' ? fontStyle : null,
      'letter-spacing': letterSpacing != null ? String(letterSpacing) : null,
      textContent: String(text ?? ''),
    },
    g,
  );

  const applyBounds = (textWidth) => {
    const pillW = Math.max(minWidth, textWidth + padX * 2);
    const pillH = Math.max(fontSize + padY * 2, fontSize * 1.25 + padY * 1.4);
    const cornerR = rx != null ? rx : pillH / 2;
    let rectX = -pillW / 2;
    if (anchor === 'start') rectX = -padX;
    else if (anchor === 'end') rectX = -(pillW - padX);
    const rectY = -pillH / 2;

    rectEl.setAttribute('x', rectX.toFixed(2));
    rectEl.setAttribute('y', rectY.toFixed(2));
    rectEl.setAttribute('width', pillW.toFixed(2));
    rectEl.setAttribute('height', pillH.toFixed(2));
    rectEl.setAttribute('rx', cornerR.toFixed(2));

    if (shadowRect) {
      shadowRect.setAttribute('x', rectX.toFixed(2));
      shadowRect.setAttribute('y', (rectY + 1.8).toFixed(2));
      shadowRect.setAttribute('width', pillW.toFixed(2));
      shadowRect.setAttribute('height', pillH.toFixed(2));
      shadowRect.setAttribute('rx', cornerR.toFixed(2));
    }
  };

  const refit = () => {
    let measured = 0;
    if (g.isConnected && typeof textEl.getComputedTextLength === 'function') {
      try {
        measured = textEl.getComputedTextLength();
      } catch {
        measured = 0;
      }
    }
    if (!measured || measured <= 0) {
      measured = estimateSvgTextWidth(textEl.textContent, fontSize, resolvedFont, fontWeight, letterSpacing);
    }
    applyBounds(measured);
  };

  // Immediate estimate so bounds are valid even prior to DOM mount
  applyBounds(estimateSvgTextWidth(text, fontSize, resolvedFont, fontWeight, letterSpacing));

  // Auto-refine once attached to the live SVG DOM
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      if (g.isConnected) refit();
    });
  }

  g.rect = rectEl;
  g.text = textEl;
  g.refit = refit;
  g.setText = (newText) => {
    textEl.textContent = String(newText ?? '');
    refit();
  };

  return g;
}

// ---------------------------------------------------------------------------
// MATHEMATICALLY CENTER-PIVOTED PRECISION BRASS SCALE (2D SVG)
// ---------------------------------------------------------------------------

/**
 * Compute needle rotation angle in degrees for a value on [0, maxVal].
 * Maps 0 -> -125 deg (lower-left) and maxVal -> +125 deg (lower-right),
 * with 0 deg pointing straight UP (-Y).
 */
export function scaleAngleForValue(val, maxVal = 5) {
  const safeMax = Number(maxVal) > 0 ? Number(maxVal) : 5;
  return -125 + (Number(val || 0) / safeMax) * 250;
}

/**
 * Create a precision antique brass spring scale (`<g class="brass-scale">`).
 * Dial center is strictly at local (0, 0). The tapered cinnabar needle pivots
 * cleanly via SVG `transform="rotate(deg)"` around exact (0, 0), making it 100%
 * immune to CSS transform-origin quirks across all browsers.
 */
export function createSvgBrassScale(opts = {}) {
  const {
    x = 0,
    y = 0,
    scale = 1,
    maxVal = 5,
    initialVal = 0,
    radius = 64,
    unit = 'g',
    panWidth = null,
    className = '',
  } = opts;

  const r = Math.max(40, Number(radius) || 64);
  const pWidth = panWidth != null ? Number(panWidth) : r * 2.02;
  const bezelGradId = nextUid('scl_bezel');
  const panGradId = nextUid('scl_pan');
  const dialGradId = nextUid('scl_dial');
  const baseGradId = nextUid('scl_base');

  const g = el('g', {
    class: `brass-scale ${className}`.trim(),
  });

  if (x !== 0 || y !== 0 || scale !== 1) {
    const parts = [];
    if (x !== 0 || y !== 0) parts.push(`translate(${x}, ${y})`);
    if (scale !== 1) parts.push(`scale(${scale})`);
    g.setAttribute('transform', parts.join(' '));
  }

  const defs = el('defs', {}, g);

  const bezelGrad = el('linearGradient', { id: bezelGradId, x1: '0%', y1: '0%', x2: '100%', y2: '100%' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#F0CA78' }, bezelGrad);
  el('stop', { offset: '42%', 'stop-color': '#C88A1E' }, bezelGrad);
  el('stop', { offset: '78%', 'stop-color': '#9E6811' }, bezelGrad);
  el('stop', { offset: '100%', 'stop-color': '#DDA43F' }, bezelGrad);

  const panGrad = el('linearGradient', { id: panGradId, x1: '0%', y1: '0%', x2: '100%', y2: '0%' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#B67B19' }, panGrad);
  el('stop', { offset: '34%', 'stop-color': '#F2CE7E' }, panGrad);
  el('stop', { offset: '68%', 'stop-color': '#C88A1E' }, panGrad);
  el('stop', { offset: '100%', 'stop-color': '#94610F' }, panGrad);

  const dialGrad = el('radialGradient', { id: dialGradId, cx: '45%', cy: '36%', r: '62%' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#FFFDF8' }, dialGrad);
  el('stop', { offset: '76%', 'stop-color': '#FAF4E6' }, dialGrad);
  el('stop', { offset: '100%', 'stop-color': '#EAE0CC' }, dialGrad);

  const baseGrad = el('linearGradient', { id: baseGradId, x1: '0%', y1: '0%', x2: '100%', y2: '0%' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#8A5C35' }, baseGrad);
  el('stop', { offset: '50%', 'stop-color': '#B88454' }, baseGrad);
  el('stop', { offset: '100%', 'stop-color': '#754C2A' }, baseGrad);

  // 1. Grounded contact shadow + sculpted walnut & brass pedestal base
  const footY = r + 20;
  el(
    'ellipse',
    {
      cx: '0',
      cy: String(footY + 4),
      rx: String(r * 0.86),
      ry: '7',
      fill: '#4A3828',
      opacity: '0.18',
    },
    g,
  );
  el(
    'path',
    {
      d: `M ${-r * 0.42} ${r - 8} L ${-r * 0.66} ${footY} Q ${-r * 0.68} ${footY + 4} ${-r * 0.58} ${footY + 4} L ${r * 0.58} ${footY + 4} Q ${r * 0.68} ${footY + 4} ${r * 0.66} ${footY} L ${r * 0.42} ${r - 8} Z`,
      fill: `url(#${baseGradId})`,
      stroke: PALETTE.ink,
      'stroke-width': '1.8',
      'stroke-linejoin': 'round',
    },
    g,
  );
  // Subtle brass foot trim
  el(
    'line',
    {
      x1: String(-r * 0.56),
      y1: String(footY),
      x2: String(r * 0.56),
      y2: String(footY),
      stroke: '#E8BC66',
      'stroke-width': '1.4',
      opacity: '0.75',
    },
    g,
  );

  // 2. Hanging / top-mounted brass weighing pan (`.scale-pan` depresses downward by val * 3px)
  const panTopY = -(r + 24);
  const panG = el(
    'g',
    {
      class: 'scale-pan',
      transform: `translate(0, ${(Math.max(0, Number(initialVal) || 0) * 3).toFixed(2)})`,
    },
    g,
  );

  // Telescoping brass plunger shaft (extends well inside the dial bezel so it never detaches)
  el(
    'rect',
    {
      x: '-4',
      y: String(panTopY + 9),
      width: '8',
      height: String(Math.abs(panTopY) - r + 26),
      rx: '2',
      fill: `url(#${panGradId})`,
      stroke: PALETTE.ink,
      'stroke-width': '1.5',
    },
    panG,
  );

  // Brass saddle bracket under the pan
  el(
    'path',
    {
      d: `M ${-pWidth * 0.24} ${panTopY + 10} Q 0 ${panTopY + 17} ${pWidth * 0.24} ${panTopY + 10} L ${pWidth * 0.16} ${panTopY + 5} L ${-pWidth * 0.16} ${panTopY + 5} Z`,
      fill: '#9C6814',
      stroke: PALETTE.ink,
      'stroke-width': '1.3',
      'stroke-linejoin': 'round',
    },
    panG,
  );

  // Curved brass weighing tray
  const halfPan = pWidth / 2;
  el(
    'path',
    {
      d: `M ${-halfPan} ${panTopY} C ${-halfPan * 0.88} ${panTopY + 10}, ${-halfPan * 0.45} ${panTopY + 11}, 0 ${panTopY + 11} C ${halfPan * 0.45} ${panTopY + 11}, ${halfPan * 0.88} ${panTopY + 10}, ${halfPan} ${panTopY} L ${halfPan - 4} ${panTopY - 2.5} L ${-(halfPan - 4)} ${panTopY - 2.5} Z`,
      fill: `url(#${panGradId})`,
      stroke: PALETTE.ink,
      'stroke-width': '1.7',
      'stroke-linejoin': 'round',
    },
    panG,
  );
  // Crisp pan lip highlight
  el(
    'line',
    {
      x1: String(-(halfPan - 6)),
      y1: String(panTopY - 0.8),
      x2: String(halfPan - 6),
      y2: String(panTopY - 0.8),
      stroke: '#FFF4D6',
      'stroke-width': '1.4',
      'stroke-linecap': 'round',
      opacity: '0.8',
    },
    panG,
  );

  // Fixed brass collar sleeve on top of the dial housing (covers telescoping stem)
  el(
    'rect',
    {
      x: '-9',
      y: String(-(r + 6)),
      width: '18',
      height: '11',
      rx: '3',
      fill: `url(#${bezelGradId})`,
      stroke: PALETTE.ink,
      'stroke-width': '1.5',
    },
    g,
  );

  // 3. Circular Antique Brass Bezel & Cream Dial strictly centered at (0, 0)
  el(
    'circle',
    {
      cx: '0',
      cy: '0',
      r: String(r),
      fill: `url(#${bezelGradId})`,
      stroke: PALETTE.ink,
      'stroke-width': '2',
    },
    g,
  );
  el(
    'circle',
    {
      cx: '0',
      cy: '0',
      r: String(r - 5.5),
      fill: '#A36F18',
      stroke: 'rgba(255, 244, 214, 0.55)',
      'stroke-width': '0.9',
    },
    g,
  );
  el(
    'circle',
    {
      cx: '0',
      cy: '0',
      r: String(r - 7.5),
      fill: `url(#${dialGradId})`,
      stroke: PALETTE.ink,
      'stroke-width': '1.2',
    },
    g,
  );

  // Subtle decorative inner arc track from -125° to +125°
  const trackR = r - 12.5;
  const startRad = (-125 * Math.PI) / 180;
  const endRad = (125 * Math.PI) / 180;
  const sx = trackR * Math.sin(startRad);
  const sy = -trackR * Math.cos(startRad);
  const ex = trackR * Math.sin(endRad);
  const ey = -trackR * Math.cos(endRad);
  el(
    'path',
    {
      d: `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${trackR} ${trackR} 0 1 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`,
      fill: 'none',
      stroke: 'rgba(107, 94, 84, 0.25)',
      'stroke-width': '1',
    },
    g,
  );

  // Evenly spaced tick marks and labels for 0..maxVal spanning -125° to +125°
  const safeMax = Math.max(1, Math.round(Number(maxVal) || 5));
  const majorOuterR = r - 9.5;
  const majorInnerR = r - 17.5;
  const minorOuterR = r - 10;
  const minorInnerR = r - 14.5;
  const labelR = r - 25.5;

  for (let v = 0; v <= safeMax; v++) {
    const deg = scaleAngleForValue(v, safeMax);
    const rad = (deg * Math.PI) / 180;
    const sinA = Math.sin(rad);
    const cosA = Math.cos(rad);

    el(
      'line',
      {
        x1: (majorInnerR * sinA).toFixed(2),
        y1: (-majorInnerR * cosA).toFixed(2),
        x2: (majorOuterR * sinA).toFixed(2),
        y2: (-majorOuterR * cosA).toFixed(2),
        stroke: PALETTE.ink,
        'stroke-width': '1.8',
        'stroke-linecap': 'round',
      },
      g,
    );

    el(
      'text',
      {
        x: (labelR * sinA).toFixed(2),
        y: (-labelR * cosA + 0.5).toFixed(2),
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: PALETTE.sepia,
        'font-family': "'JetBrains Mono', ui-monospace, monospace",
        'font-size': r >= 58 ? '9.5' : '8',
        'font-weight': '700',
        textContent: `${v}${unit}`,
      },
      g,
    );

    // Half-step minor tick between integers
    if (v < safeMax && safeMax <= 10) {
      const mDeg = scaleAngleForValue(v + 0.5, safeMax);
      const mRad = (mDeg * Math.PI) / 180;
      el(
        'line',
        {
          x1: (minorInnerR * Math.sin(mRad)).toFixed(2),
          y1: (-minorInnerR * Math.cos(mRad)).toFixed(2),
          x2: (minorOuterR * Math.sin(mRad)).toFixed(2),
          y2: (-minorOuterR * Math.cos(mRad)).toFixed(2),
          stroke: 'rgba(107, 94, 84, 0.55)',
          'stroke-width': '1.1',
          'stroke-linecap': 'round',
        },
        g,
      );
    }
  }

  // 4. Clean parchment integer readout window below the hub (in open arc gap)
  const readoutY = Math.round(r * 0.48);
  const readoutBoxG = el(
    'g',
    {
      class: 'scale-readout-box',
      transform: `translate(0, ${readoutY})`,
    },
    g,
  );
  el(
    'rect',
    {
      x: '-22',
      y: '-10.5',
      width: '44',
      height: '21',
      rx: '5.5',
      fill: '#F6F1E7',
      stroke: PALETTE.brass,
      'stroke-width': '1.25',
    },
    readoutBoxG,
  );
  const readoutText = el(
    'text',
    {
      class: 'scale-readout',
      x: '0',
      y: '0.5',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: PALETTE.ink,
      'font-family': "'JetBrains Mono', ui-monospace, monospace",
      'font-size': '12.5',
      'font-weight': '700',
      textContent: `${Math.round(Number(initialVal) || 0)}${unit}`,
    },
    readoutBoxG,
  );

  // 5. FOOLPROOF CENTER-PIVOTED NEEDLE at exact local (0, 0)
  const initialAngle = scaleAngleForValue(initialVal, safeMax);
  const needleTipY = -(r - 14);
  const needlePivot = el(
    'g',
    {
      class: 'scale-needle-pivot',
      transform: `rotate(${initialAngle.toFixed(3)})`,
    },
    g,
  );

  // Subtle shadow behind needle
  el(
    'path',
    {
      d: `M -2.8 14 L -1.8 0 L -0.7 ${needleTipY} L 0 ${needleTipY - 2} L 0.7 ${needleTipY} L 1.8 0 L 2.8 14 Z`,
      fill: '#1F1A17',
      opacity: '0.14',
      transform: 'translate(1.2, 1.5)',
    },
    needlePivot,
  );
  // Tapered cinnabar needle drawn strictly from (0, +14) through (0, 0) to (0, -(radius - 14))
  el(
    'path',
    {
      d: `M -3.1 14 L -2.1 0 L -0.85 ${needleTipY} L 0 ${needleTipY - 2.2} L 0.85 ${needleTipY} L 2.1 0 L 3.1 14 Z`,
      fill: PALETTE.cinnabar,
      stroke: PALETTE.ink,
      'stroke-width': '0.9',
      'stroke-linejoin': 'round',
    },
    needlePivot,
  );
  // Small counterweight ring at tail (0, +11)
  el(
    'circle',
    {
      cx: '0',
      cy: '11.5',
      r: '3.1',
      fill: PALETTE.brass,
      stroke: PALETTE.ink,
      'stroke-width': '0.9',
    },
    needlePivot,
  );

  // 6. Brass center cap strictly centered at (0, 0) on top of needle pivot
  el(
    'circle',
    {
      cx: '0',
      cy: '0',
      r: '6.2',
      fill: `url(#${bezelGradId})`,
      stroke: PALETTE.ink,
      'stroke-width': '1.3',
    },
    g,
  );
  el(
    'circle',
    {
      cx: '-1.5',
      cy: '-1.5',
      r: '1.8',
      fill: '#FFF4D6',
      opacity: '0.85',
    },
    g,
  );

  // Reactive state + imperative & timeline helpers
  g._state = { val: Number(initialVal) || 0 };
  g.needlePivot = needlePivot;
  g.panGroup = panG;
  g.readoutText = readoutText;
  g.maxVal = safeMax;
  g.unit = unit;
  g.radius = r;
  g.panSurfaceY = panTopY - 2;

  g.setValue = (val, valueOpts = {}) => {
    const num = Number(val) || 0;
    g._state.val = num;
    const deg = scaleAngleForValue(num, safeMax);
    needlePivot.setAttribute('transform', `rotate(${deg.toFixed(3)})`);
    const depY = Math.max(0, num) * 3;
    panG.setAttribute('transform', `translate(0, ${depY.toFixed(2)})`);
    const displayNum = valueOpts.exact ? Number(num.toFixed(1)) : Math.round(num);
    readoutText.textContent = `${displayNum}${unit}`;
  };

  g.animateTo = (targetVal, gsapTimeline, atTime = 0, dur = 0.55, animOpts = {}) => {
    return setScaleValue(g, targetVal, gsapTimeline, atTime, dur, animOpts);
  };

  return g;
}

/**
 * Update or smoothly animate a `createSvgBrassScale` instance to a target weight value.
 * Updates SVG `transform="rotate(deg)"` and `transform="translate(0, depY)"` directly on
 * every frame so needle pivoting and pan depression are 100% immune to CSS transform-origin
 * quirks and completely scrubbing-safe on GSAP timelines.
 */
export function setScaleValue(scaleG, val, gsapTimeline = null, atTime = 0, dur = 0.55, opts = {}) {
  if (!scaleG || typeof scaleG.setValue !== 'function') return;
  const target = Number(val) || 0;

  if (!gsapTimeline) {
    scaleG.setValue(target, opts);
    return;
  }

  const state = scaleG._state || (scaleG._state = { val: 0 });
  return gsapTimeline.to(
    state,
    {
      val: target,
      duration: dur,
      ease: opts.ease || 'back.out(1.35)',
      onUpdate: () => scaleG.setValue(state.val, opts),
    },
    atTime,
  );
}

// ---------------------------------------------------------------------------
// 3D THREE.JS SUNLIT APOTHECARY BOTTLES & COASTERS
// ---------------------------------------------------------------------------

function makeLabelTexture(THREE, labelNum, accentHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // Cream parchment fill
  ctx.fillStyle = '#FFFBF0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gentle paper grain warmth
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, 'rgba(255, 253, 248, 0.5)');
  grad.addColorStop(0.5, 'rgba(243, 232, 212, 0.25)');
  grad.addColorStop(1, 'rgba(229, 214, 188, 0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer espresso ink frame
  ctx.strokeStyle = '#2B211B';
  ctx.lineWidth = 8;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

  // Inner brass/sepia hairline frame
  ctx.strokeStyle = '#C88A1E';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

  // Tiny corner rivets
  const corners = [
    [44, 44],
    [canvas.width - 44, 44],
    [44, canvas.height - 44],
    [canvas.width - 44, canvas.height - 44],
  ];
  ctx.fillStyle = accentHex || '#C88A1E';
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle apothecary "NO." eyebrow
  ctx.fillStyle = '#6B5E54';
  ctx.font = '700 30px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NO.', canvas.width / 2, 74);

  // Bold dark espresso numeral (0..5)
  const str = String(labelNum);
  const numFontSize = str.length > 1 ? 148 : 186;
  ctx.fillStyle = '#1F1A17';
  ctx.font = `700 ${numFontSize}px "JetBrains Mono", "Fraunces", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, canvas.width / 2, 192);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function makeCorkTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#C69764';
  ctx.fillRect(0, 0, 128, 128);
  // Subtle organic cork speckles
  for (let i = 0; i < 160; i++) {
    const x = (i * 37) % 128;
    const y = (i * 53) % 128;
    const w = 2 + (i % 5);
    const h = 1 + (i % 3);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(92, 58, 28, 0.32)' : 'rgba(236, 204, 162, 0.28)';
    ctx.fillRect(x, y, w, h);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeContactShadowTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(56, 38, 22, 0.42)');
  grad.addColorStop(0.58, 'rgba(56, 38, 22, 0.18)');
  grad.addColorStop(1, 'rgba(56, 38, 22, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Create a sunlit, whimsical 3D glass apothecary bottle (THREE.Group).
 * Base rests on y = 0; height ~2.30 units; front parchment label faces +Z camera.
 */
export function createThreeBottle(THREE, labelNum, colorHex, opts = {}) {
  const {
    scale = 1,
    liquidLevel = 0.65,
    matched = false,
  } = opts;

  const liquidHex = getBottleColor(labelNum, colorHex);
  const group = new THREE.Group();
  group.name = `bottle_${labelNum}`;

  // 1. Outer glass silhouette (LatheGeometry)
  const glassPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.38, 0.0),
    new THREE.Vector2(0.44, 0.07),
    new THREE.Vector2(0.45, 0.2),
    new THREE.Vector2(0.45, 1.18),
    new THREE.Vector2(0.42, 1.38),
    new THREE.Vector2(0.28, 1.56),
    new THREE.Vector2(0.18, 1.68),
    new THREE.Vector2(0.175, 1.96),
    new THREE.Vector2(0.22, 2.01),
    new THREE.Vector2(0.22, 2.08),
    new THREE.Vector2(0.16, 2.09),
  ];
  const glassGeo = new THREE.LatheGeometry(glassPoints, 36);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xfffdf8,
    roughness: 0.1,
    metalness: 0.02,
    transmission: 0.52,
    transparent: true,
    opacity: 0.48,
    ior: 1.48,
    thickness: 0.35,
    reflectivity: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    depthWrite: false,
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.renderOrder = 3;
  glassMesh.castShadow = true;
  group.add(glassMesh);

  // 2. Inner gouache liquid body (LatheGeometry)
  const liqH = 0.25 + Math.max(0.2, Math.min(0.85, liquidLevel)) * 1.15;
  const liqPoints = [
    new THREE.Vector2(0.0, 0.055),
    new THREE.Vector2(0.35, 0.055),
    new THREE.Vector2(0.405, 0.12),
    new THREE.Vector2(0.41, Math.min(1.14, liqH)),
    new THREE.Vector2(0.39, liqH),
    new THREE.Vector2(0.0, liqH + 0.015),
  ];
  const liquidGeo = new THREE.LatheGeometry(liqPoints, 32);
  const liquidColor = new THREE.Color(liquidHex);
  const liquidMat = new THREE.MeshStandardMaterial({
    color: liquidColor,
    roughness: 0.26,
    metalness: 0.04,
    emissive: liquidColor.clone().multiplyScalar(0.14),
  });
  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.renderOrder = 1;
  liquidMesh.castShadow = true;
  liquidMesh.receiveShadow = true;
  group.add(liquidMesh);

  // 3. Tapered natural cork stopper
  const corkGeo = new THREE.CylinderGeometry(0.158, 0.132, 0.36, 24);
  const corkMat = new THREE.MeshStandardMaterial({
    map: makeCorkTexture(THREE),
    roughness: 0.84,
    metalness: 0.02,
  });
  const corkMesh = new THREE.Mesh(corkGeo, corkMat);
  corkMesh.position.y = 2.12;
  corkMesh.castShadow = true;
  group.add(corkMesh);

  // 4. Crisp wrapped cream parchment belly label facing +Z (front camera!)
  // CylinderGeometry angle 0 faces +Z (x = r*sin(theta), z = r*cos(theta))
  const labelArc = Math.PI * 0.78;
  const labelGeo = new THREE.CylinderGeometry(
    0.464,
    0.464,
    0.66,
    28,
    1,
    true,
    -labelArc / 2,
    labelArc,
  );
  const labelTex = makeLabelTexture(THREE, labelNum, liquidHex);
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.72,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = 0.68;
  labelMesh.renderOrder = 4;
  group.add(labelMesh);

  // 5. Soft warm sepia contact shadow on tabletop
  const shadowGeo = new THREE.PlaneGeometry(1.18, 1.18);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: makeContactShadowTexture(THREE),
    transparent: true,
    depthWrite: false,
    opacity: 0.85,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.006;
  shadowMesh.renderOrder = 0;
  group.add(shadowMesh);

  // 6. Warm burnished-brass match ring around base
  const ringGeo = new THREE.RingGeometry(0.49, 0.6, 36);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xe8bc66,
    transparent: true,
    opacity: matched ? 0.92 : 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const matchRing = new THREE.Mesh(ringGeo, ringMat);
  matchRing.rotation.x = -Math.PI / 2;
  matchRing.position.y = 0.015;
  group.add(matchRing);

  if (scale !== 1) {
    group.scale.setScalar(scale);
  }

  group.userData = {
    labelNum,
    colorHex: liquidHex,
    glassMesh,
    liquidMesh,
    corkMesh,
    labelMesh,
    shadowMesh,
    matchRing,
    setMatched(isMatched) {
      ringMat.opacity = isMatched ? 0.92 : 0.0;
    },
  };

  return group;
}

function makeCoasterPlaqueTexture(THREE, text, { veiled = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  if (veiled) {
    // Handsome dark walnut/espresso brass-rimmed `?` veil medallion
    const grad = ctx.createLinearGradient(0, 12, 0, 148);
    grad.addColorStop(0, '#4A3A2E');
    grad.addColorStop(1, '#2B211A');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(80, 80, 68, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#C88A1E';
    ctx.lineWidth = 9;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(232, 188, 102, 0.48)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(80, 80, 56, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#F5DFB0';
    ctx.font = '700 84px "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(text), 80, 84);
  } else {
    // Crisp cream parchment & brass secret number medallion
    ctx.fillStyle = '#FFFBF2';
    ctx.beginPath();
    ctx.arc(80, 80, 68, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#C88A1E';
    ctx.lineWidth = 9;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(200, 138, 30, 0.35)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(80, 80, 56, 0, Math.PI * 2);
    ctx.stroke();

    const str = String(text);
    const fontSize = str.length > 1 ? 66 : 82;
    ctx.fillStyle = '#1F1A17';
    ctx.font = `700 ${fontSize}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, 80, 84);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Create a sunlit 3D turned-oak + inlaid-brass coaster (THREE.Group).
 * Supports hidden (`?` player view) and revealed (secret number X-ray view) plaques.
 * Top resting surface sits at y = 0 (coaster extends down to y = -0.10), so a
 * bottle placed at the same (x, y, z) rests directly on top of the coaster.
 */
export function createThreeCoaster(THREE, secretNum, opts = {}) {
  const {
    matched = false,
    radius = 0.56,
    hidden = false,
    slotIndex = null,
    veilText = '?',
  } = opts;
  const group = new THREE.Group();
  group.name = `coaster_${slotIndex != null ? slotIndex : secretNum}`;

  // Oak disc
  const discGeo = new THREE.CylinderGeometry(radius, radius * 1.04, 0.1, 36);
  const discMat = new THREE.MeshStandardMaterial({
    color: 0xc99c6b,
    roughness: 0.68,
    metalness: 0.04,
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.position.y = -0.05;
  disc.receiveShadow = true;
  disc.castShadow = true;
  group.add(disc);

  // Inlaid brass ring on top
  const brassGeo = new THREE.RingGeometry(radius * 0.78, radius * 0.87, 36);
  const brassMat = new THREE.MeshStandardMaterial({
    color: matched ? 0xf3c96b : 0xc88a1e,
    roughness: 0.32,
    metalness: 0.68,
    emissive: new THREE.Color(matched ? 0xd99b26 : 0x000000),
    emissiveIntensity: matched ? 0.42 : 0,
    side: THREE.DoubleSide,
  });
  const brassRing = new THREE.Mesh(brassGeo, brassMat);
  brassRing.rotation.x = -Math.PI / 2;
  brassRing.position.y = 0.003;
  group.add(brassRing);

  // Front twin-disc plaque holder resting in front of coaster (veil `?` + secret number)
  const plaqueGroup = new THREE.Group();
  plaqueGroup.position.set(0, 0.02, radius + 0.16);
  plaqueGroup.rotation.x = -Math.PI * 0.34;
  group.add(plaqueGroup);

  const plaqueGeo = new THREE.PlaneGeometry(0.4, 0.4);

  const secretTex = makeCoasterPlaqueTexture(THREE, secretNum, { veiled: false });
  const secretMat = new THREE.MeshBasicMaterial({
    map: secretTex,
    transparent: true,
    opacity: hidden ? 0 : 1,
    depthWrite: false,
  });
  const secretMesh = new THREE.Mesh(plaqueGeo, secretMat);
  secretMesh.position.z = 0.001;
  secretMesh.scale.y = hidden ? 0.001 : 1;
  secretMesh.renderOrder = 5;
  plaqueGroup.add(secretMesh);

  const veilTex = makeCoasterPlaqueTexture(THREE, veilText, { veiled: true });
  const veilMat = new THREE.MeshBasicMaterial({
    map: veilTex,
    transparent: true,
    opacity: hidden ? 1 : 0,
    depthWrite: false,
  });
  const veilMesh = new THREE.Mesh(plaqueGeo, veilMat);
  veilMesh.position.z = 0.003;
  veilMesh.scale.y = hidden ? 1 : 0.001;
  veilMesh.renderOrder = 6;
  plaqueGroup.add(veilMesh);

  group.userData = {
    slotNum: slotIndex != null ? slotIndex : secretNum,
    secretNum,
    slotIndex,
    brassRing,
    plaqueGroup,
    veilMesh,
    secretMesh,
    isRevealed: !hidden,
    setMatched(isMatched) {
      brassMat.color.setHex(isMatched ? 0xf3c96b : 0xc88a1e);
      brassMat.emissive.setHex(isMatched ? 0xd99b26 : 0x000000);
      brassMat.emissiveIntensity = isMatched ? 0.45 : 0;
    },
    setRevealed(revealed) {
      const rev = Boolean(revealed);
      group.userData.isRevealed = rev;
      veilMat.opacity = rev ? 0 : 1;
      veilMesh.scale.y = rev ? 0.001 : 1;
      secretMat.opacity = rev ? 1 : 0;
      secretMesh.scale.y = rev ? 1 : 0.001;
    },
  };

  return group;
}

/**
 * Create an ultra-subtle tactile SVG paper-grain overlay (risograph / linen feel).
 * Sits softly over the stage with pointer-events: none.
 */
export function createPaperGrainFilterSvg(opts = {}) {
  const { width = 1280, height = 720, opacity = 0.045 } = opts;
  const filterId = nextUid('paper_grain');

  const svg = el('svg', {
    class: 'paper-grain-overlay',
    viewBox: `0 0 ${width} ${height}`,
    width: String(width),
    height: String(height),
    'aria-hidden': 'true',
    style: {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '6',
      opacity: String(opacity),
      mixBlendMode: 'multiply',
    },
  });

  const defs = el('defs', {}, svg);
  const filter = el(
    'filter',
    { id: filterId, x: '0%', y: '0%', width: '100%', height: '100%' },
    defs,
  );
  el(
    'feTurbulence',
    {
      type: 'fractalNoise',
      baseFrequency: '0.78',
      numOctaves: '3',
      seed: '7',
      stitchTiles: 'stitch',
      result: 'noise',
    },
    filter,
  );
  el(
    'feColorMatrix',
    {
      type: 'matrix',
      values:
        '0.35 0 0 0 0.25 ' +
        '0 0.30 0 0 0.20 ' +
        '0 0 0.22 0 0.14 ' +
        '0 0 0 1 0',
      in: 'noise',
      result: 'warmNoise',
    },
    filter,
  );

  el(
    'rect',
    {
      x: '0',
      y: '0',
      width: String(width),
      height: String(height),
      filter: `url(#${filterId})`,
    },
    svg,
  );

  return svg;
}
