// Chapter 06: Part II Roadmap: The No-Cloning Wall
// Act 1: Full-table Game 2 reorder over 6 veiled coasters + Information-theory Omega(n) ratio.
// Act 2: Playful wooden stamp cloning Bottle 0 (Repeated-Color Mastermind -> Theta(n), Martinsson & Su 2024)
//        vs. Oak/Brass NO CLONING seal enforcing strict permutations S_n.
// Act 3: Watercolor Poisson(1) match spike stalling naive solvers at O(n log n) -> wide structured
//        score distribution -> 3-Building-Block Part II Roadmap.

export const sceneMeta = {
  id: 'scene6',
  number: 6,
  title: 'Part II Roadmap: The No-Cloning Wall',
  chapter: 'Part II · Full Reorder',
  duration: 89.874,
  beats: [
    {
      id: 's6_b0',
      start: 0.8,
      audioDuration: 7.54,
      end: 8.89,
      text: 'Welcome to Game 2, where a single move lets you pick up and reorder all n bottles over the hidden coasters.',
      highlight: ['Game 2', 'reorder all n bottles'],
      cue: 'whoosh',
    },
    {
      id: 's6_b1',
      start: 8.89,
      audioDuration: 13.44,
      end: 22.88,
      text: 'With n! secrets—roughly n log n bits—and n possible scores carrying up to log n bits each, information theory suggests linear time: O(n) queries.',
      highlight: ['n log n bits', 'log n bits each', 'O(n) queries'],
      cue: null,
    },
    {
      id: 's6_b2',
      start: 22.88,
      audioDuration: 9.26,
      end: 32.69,
      text: 'If you could clone bottles—putting copies of Bottle 0 across half the coasters—you could binary-search every bottle cleanly in parallel.',
      highlight: ['clone bottles', 'copies of Bottle 0'],
      cue: 'clink',
    },
    {
      id: 's6_b3',
      start: 32.69,
      audioDuration: 11.04,
      end: 44.28,
      text: 'Classic Mastermind allows repeated colors like that, and Martinsson and Su proved in 2024 that repeated-color Mastermind indeed takes O(n) queries.',
      highlight: ['repeated colors', 'Martinsson and Su', 'O(n) queries'],
      cue: null,
    },
    {
      id: 's6_b4',
      start: 44.28,
      audioDuration: 9.53,
      end: 54.36,
      text: 'Physical bottles hit a hard wall: no cloning. Every guess must be a strict permutation, using each bottle exactly once.',
      highlight: ['no cloning', 'strict permutation'],
      cue: 'lock',
    },
    {
      id: 's6_b5',
      start: 54.36,
      audioDuration: 12.02,
      end: 66.93,
      text: 'Any random strict permutation averages just 1 match—a Poisson(1) score carrying under 2 bits, not log n—stalling static and naive solvers at O(n log n).',
      highlight: ['Poisson(1) score', 'under 2 bits', 'O(n log n)'],
      cue: 'bell',
    },
    {
      id: 's6_b6',
      start: 66.93,
      audioDuration: 10.82,
      end: 78.31,
      text: 'To beat n log n without cloning, we must engineer structured permutations whose scores span a wide range, packing up to log n bits per query.',
      highlight: ['structured permutations', 'wide range', 'up to log n bits'],
      cue: 'whoosh',
    },
    {
      id: 's6_b7',
      start: 78.31,
      audioDuration: 10.37,
      end: 89.874,
      text: 'Part II builds that in three steps: a coin-weighing trick, turning bottles into an additive scale to hit n log log n, and orienting closed loops.',
      highlight: ['coin-weighing trick', 'additive scale', 'orienting closed loops'],
      cue: null,
    },
  ],
};

function beatAt(beats, idx, fallbackStart, fallbackDur) {
  const b = beats && beats[idx];
  if (b) {
    const start = Number(b.start ?? b.time ?? fallbackStart);
    const dur = Number(b.audioDuration ?? (b.end ? b.end - start : fallbackDur)) || fallbackDur;
    const end = Number(b.end ?? start + dur);
    return { start, dur, end };
  }
  return { start: fallbackStart, dur: fallbackDur, end: fallbackStart + fallbackDur };
}

export function buildScene(rootEl, ctx) {
  const { gsap, createSvg, svgEl, createMathEl, bottles } = ctx;
  const P = ctx.colors || bottles.PALETTE;
  const beats = ctx.beats && ctx.beats.length ? ctx.beats : sceneMeta.beats;
  const totalDur = Number(ctx.duration) || sceneMeta.duration;

  const b0 = beatAt(beats, 0, 0.8, 7.54);
  const b1 = beatAt(beats, 1, 8.89, 13.44);
  const b2 = beatAt(beats, 2, 22.88, 9.26);
  const b3 = beatAt(beats, 3, 32.69, 11.04);
  const b4 = beatAt(beats, 4, 44.28, 9.53);
  const b5 = beatAt(beats, 5, 54.36, 12.02);
  const b6 = beatAt(beats, 6, 66.93, 10.82);
  const b7 = beatAt(beats, 7, 78.31, 10.37);

  rootEl.innerHTML = '';

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:absolute;inset:0;width:1280px;height:590px;pointer-events:none;overflow:hidden;';
  rootEl.appendChild(stage);

  const svg = createSvg(1280, 590, {
    style: { position: 'absolute', left: '0', top: '0', width: '1280px', height: '590px', overflow: 'visible' },
  });
  stage.appendChild(svg);

  const htmlLayer = document.createElement('div');
  htmlLayer.style.cssText = 'position:absolute;inset:0;width:1280px;height:590px;pointer-events:none;';
  stage.appendChild(htmlLayer);

  const defs = svgEl('defs', {}, svg);
  const shelfGrad = svgEl('linearGradient', { id: 's6_shelf', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#D6AA78' }, shelfGrad);
  svgEl('stop', { offset: '55%', 'stop-color': '#B98755' }, shelfGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#8A5E37' }, shelfGrad);

  const woodStampGrad = svgEl('linearGradient', { id: 's6_stamp', x1: '0%', y1: '0%', x2: '100%', y2: '0%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#A87444' }, woodStampGrad);
  svgEl('stop', { offset: '45%', 'stop-color': '#D5A777' }, woodStampGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#8E5E33' }, woodStampGrad);

  const sunHalo = svgEl('radialGradient', { id: 's6_halo', cx: '50%', cy: '50%', r: '50%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#F5DFB0', 'stop-opacity': '0.45' }, sunHalo);
  svgEl('stop', { offset: '100%', 'stop-color': '#F5DFB0', 'stop-opacity': '0' }, sunHalo);

  const arrM = svgEl(
    'marker',
    { id: 's6_arr', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6.5', markerHeight: '6.5', orient: 'auto' },
    defs,
  );
  svgEl('path', { d: 'M 1 1.5 L 8.5 5 L 1 8.5 Z', fill: P.brass }, arrM);

  // =========================================================================
  // ACT 1 & ACT 2: SIX-BOTTLE FULL-REORDER TABLE & NO-CLONING WALL (b0 .. b4)
  // =========================================================================
  const tableActG = svgEl('g', { class: 's6-table-act' }, svg);
  svgEl('ellipse', { cx: '640', cy: '235', rx: '460', ry: '130', fill: 'url(#s6_halo)' }, tableActG);

  // Top phase pills (y = 66)
  const topPills = [
    { txt: 'Game 2 · One Move Reorders All n Bottles', color: P.brass },
    { txt: 'Information Theory · Naive Linear Hope: Ω(n)', color: P.delft },
    { txt: 'What If You Could Clone Bottles? · Parallel Binary Search', color: P.terracotta },
    { txt: 'Repeated-Color Mastermind · Θ(n) (Martinsson & Su, 2024)', color: P.sage },
    { txt: 'NO CLONING · Strict Permutations Sₙ Only', color: P.cinnabar },
  ].map((spec, idx) => {
    const p = bottles.createSvgScrimLabel(spec.txt, {
      x: 640,
      y: 66,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: spec.color,
      stroke: spec.color,
      strokeWidth: 1.2,
      padX: 16,
      padY: 6,
    });
    gsap.set(p, { autoAlpha: idx === 0 ? 1 : 0 });
    tableActG.appendChild(p);
    return p;
  });

  // Sunlit Walnut Shelf (seated at y = 266 so bottles span y=[165..266], coasters [266..312], leaving y=[336..556] spacious!)
  const SLOT_X = [240, 400, 560, 720, 880, 1040];
  const SEAT_Y = 266;
  const SECRET = [2, 0, 5, 3, 1, 4];

  svgEl('rect', { x: '154', y: '284', width: '972', height: '14', rx: '7', fill: '#4A3828', opacity: '0.11' }, tableActG);
  svgEl(
    'rect',
    {
      x: '140',
      y: '268',
      width: '1000',
      height: '18',
      rx: '5',
      fill: 'url(#s6_shelf)',
      stroke: P.ink,
      'stroke-width': '1.8',
    },
    tableActG,
  );
  svgEl('line', { x1: '150', y1: '271.5', x2: '1130', y2: '271.5', stroke: '#EED4AE', 'stroke-width': '1.4', opacity: '0.72' }, tableActG);

  // 6 Veiled Coasters
  for (let i = 0; i < 6; i++) {
    const coaster = bottles.createSvgCoaster(SECRET[i], {
      x: SLOT_X[i],
      y: SEAT_Y,
      width: 76,
      scale: 0.94,
      hidden: true,
      slotIndex: i,
    });
    tableActG.appendChild(coaster);
  }

  // 6 Physical Bottles [0..5]
  const bMovers = [];
  const bLifts = [];
  const liqLevels = [0.72, 0.64, 0.76, 0.66, 0.7, 0.62];
  for (let i = 0; i < 6; i++) {
    const mover = svgEl('g', {}, tableActG);
    const lift = svgEl('g', {}, mover);
    const node = bottles.createSvgBottle(i, { x: 0, y: 0, scale: 0.94, liquidLevel: liqLevels[i] });
    lift.appendChild(node);
    gsap.set(mover, { x: SLOT_X[i], y: SEAT_Y - 1 });
    gsap.set(lift, { y: 0 });
    bMovers.push(mover);
    bLifts.push(lift);
  }

  // Playful Ghost Clones of Bottle 0 for Slots 0, 1, 2 (b2..b3)
  const cloneG = svgEl('g', {}, tableActG);
  const cloneCopies = [];
  for (let i = 0; i < 3; i++) {
    const cg = svgEl('g', { transform: `translate(${SLOT_X[i]}, ${SEAT_Y - 1})` }, cloneG);
    const inner = svgEl('g', {}, cg);
    const bClone = bottles.createSvgBottle(0, { x: 0, y: 0, scale: 0.94, liquidLevel: 0.72, showShadow: false });
    inner.appendChild(bClone);
    // Dashed "CLONE" ring around duplicate
    svgEl(
      'ellipse',
      {
        cx: '0',
        cy: '-50',
        rx: '33',
        ry: '56',
        fill: 'none',
        stroke: P.terracotta,
        'stroke-width': '2',
        'stroke-dasharray': '5 3',
        opacity: '0.85',
      },
      inner,
    );
    gsap.set(inner, { autoAlpha: 0, scale: 0.8, transformOrigin: '0px -45px' });
    cloneCopies.push(inner);
  }

  // Wooden Apothecary Rubber Stamp Prop (b2 — compact handle clears top pill completely!)
  const stampMover = svgEl('g', {}, tableActG);
  const stampBody = svgEl('g', {}, stampMover);
  // Turned walnut handle (height 68px above bottom pad)
  svgEl(
    'path',
    {
      d: 'M -9 -52 C -14 -68, 14 -68, 9 -52 L 7 -30 L -7 -30 Z',
      fill: 'url(#s6_stamp)',
      stroke: P.ink,
      'stroke-width': '1.7',
    },
    stampBody,
  );
  // Stamp wooden block base
  svgEl(
    'rect',
    { x: '-30', y: '-30', width: '60', height: '16', rx: '4', fill: 'url(#s6_stamp)', stroke: P.ink, 'stroke-width': '1.7' },
    stampBody,
  );
  // Terracotta rubber pad
  svgEl(
    'rect',
    { x: '-26', y: '-14', width: '52', height: '6.5', rx: '2', fill: P.terracotta, stroke: P.ink, 'stroke-width': '1.3' },
    stampBody,
  );
  svgEl(
    'text',
    {
      x: '0',
      y: '-21',
      'text-anchor': 'middle',
      fill: '#FFFBF2',
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '9.5',
      'font-weight': '700',
      textContent: 'COPY 0',
    },
    stampBody,
  );
  gsap.set(stampMover, { x: SLOT_X[0], y: 168, autoAlpha: 0 });

  // Half-table binary search bracket under Slots 0..2 (b2)
  const halfBracketG = svgEl('g', {}, tableActG);
  svgEl(
    'path',
    {
      d: `M ${SLOT_X[0] - 44} 330 L ${SLOT_X[0] - 44} 342 L ${SLOT_X[2] + 44} 342 L ${SLOT_X[2] + 44} 330`,
      fill: 'none',
      stroke: P.terracotta,
      'stroke-width': '2',
    },
    halfBracketG,
  );
  halfBracketG.appendChild(
    bottles.createSvgScrimLabel('Half-Table Probe: Is Coaster 0 in {0, 1, 2}?', {
      x: SLOT_X[1],
      y: 364,
      fontSize: 12.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.terracotta,
      stroke: P.terracotta,
      padX: 12,
      padY: 4,
    }),
  );
  gsap.set(halfBracketG, { autoAlpha: 0 });
  tableActG.appendChild(halfBracketG);

  // NO-CLONING Oak/Cinnabar Barrier Stamp (b4)
  const noCloneBarrier = svgEl('g', { transform: 'translate(640, 212)' }, tableActG);
  const noCloneInner = svgEl('g', {}, noCloneBarrier);
  svgEl(
    'rect',
    {
      x: '-250',
      y: '-34',
      width: '500',
      height: '68',
      rx: '12',
      fill: '#FDF2EF',
      'fill-opacity': '0.96',
      stroke: P.cinnabar,
      'stroke-width': '3',
    },
    noCloneInner,
  );
  svgEl(
    'rect',
    {
      x: '-242',
      y: '-26',
      width: '484',
      height: '52',
      rx: '7',
      fill: 'none',
      stroke: 'rgba(196, 69, 54, 0.35)',
      'stroke-width': '1.2',
      'stroke-dasharray': '6 3',
    },
    noCloneInner,
  );
  svgEl(
    'text',
    {
      x: '0',
      y: '-5',
      'text-anchor': 'middle',
      fill: P.cinnabar,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '19',
      'font-weight': '800',
      'letter-spacing': '0.08em',
      textContent: 'NO CLONING · STRICT PERMUTATIONS',
    },
    noCloneInner,
  );
  svgEl(
    'text',
    {
      x: '0',
      y: '16',
      'text-anchor': 'middle',
      fill: P.sepia,
      'font-family': "'Plus Jakarta Sans', sans-serif",
      'font-size': '12.5',
      'font-weight': '600',
      textContent: 'Every bottle 0, 1, 2, 3, 4, 5 must be used exactly once (Sₙ)',
    },
    noCloneInner,
  );
  gsap.set(noCloneInner, { autoAlpha: 0, scale: 1.35, rotation: -4, transformOrigin: '0px 0px' });

  // Lower Act 1 Panel (b1): Information-Theory Ratio Card (y = 354..544)
  const infoCard = document.createElement('div');
  infoCard.style.cssText =
    'position:absolute;left:130px;top:356px;width:1020px;height:184px;display:flex;align-items:center;justify-content:space-between;gap:18px;opacity:0;';

  const makeInfoTile = (eyebrow, tex, sub, borderCol, bgCol) => {
    const d = document.createElement('div');
    d.className = 'label-scrim label-scrim-card';
    d.style.cssText = `flex:1;height:164px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:14px 18px;border:1.6px solid ${borderCol};background:${bgCol};`;
    const e = document.createElement('div');
    e.style.cssText = `font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.08em;color:${borderCol};text-transform:uppercase;`;
    e.textContent = eyebrow;
    const m = createMathEl(tex, { fontSize: 22, color: '#1F1A17' });
    const s = document.createElement('div');
    s.style.cssText = "font-family:'Plus Jakarta Sans',sans-serif;font-size:12.5px;font-weight:600;color:#6B5E54;text-align:center;";
    s.textContent = sub;
    d.appendChild(e);
    d.appendChild(m);
    d.appendChild(s);
    return d;
  };

  const opSpan = (ch) => {
    const s = document.createElement('div');
    s.style.cssText = "font-family:'Fraunces',Georgia,serif;font-size:32px;font-weight:700;color:#C88A1E;flex-shrink:0;";
    s.textContent = ch;
    return s;
  };

  infoCard.appendChild(makeInfoTile('Secret Space', '\\log_2(n!) \\approx n\\log_2 n', 'bits needed to identify secret', '#C88A1E', 'rgba(255,251,242,0.96)'));
  infoCard.appendChild(opSpan('÷'));
  infoCard.appendChild(makeInfoTile('Max Score Entropy', '\\log_2(n+1) \\approx \\log_2 n', 'max bits per score (0..n)', '#3D7EA6', 'rgba(244,249,252,0.96)'));
  infoCard.appendChild(opSpan('⇒'));
  infoCard.appendChild(makeInfoTile('Information Lower Bound', '\\Omega(n) \\text{ queries}', 'Linear-time lower bound', '#4E8C6F', 'rgba(242,250,245,0.96)'));
  htmlLayer.appendChild(infoCard);

  // Lower Act 2 Card (b3): Martinsson & Su 2024 Citation Plaque (y = 398..540)
  const citationCard = document.createElement('div');
  citationCard.className = 'label-scrim label-scrim-card';
  citationCard.style.cssText =
    'position:absolute;left:220px;top:400px;width:840px;height:138px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:18px 28px;border:1.8px solid rgba(78,140,111,0.5);background:rgba(255,251,242,0.97);opacity:0;';

  const citLeft = document.createElement('div');
  citLeft.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
  citLeft.innerHTML =
    '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:0.1em;color:#4E8C6F;">CLASSIC REPEATED-COLOR MASTERMIND</div>' +
    '<div style="font-family:\'Fraunces\',Georgia,serif;font-size:24px;font-weight:700;color:#1F1A17;">Martinsson &amp; Su (2024)</div>' +
    '<div style="font-family:\'Plus Jakarta Sans\',sans-serif;font-size:13.5px;color:#6B5E54;">Cloning bottles / repeating colors achieves the information limit.</div>';

  const citRight = document.createElement('div');
  citRight.style.cssText =
    'padding:14px 22px;border-radius:10px;background:#EAF6F0;border:1.5px solid #4E8C6F;flex-shrink:0;';
  citRight.appendChild(createMathEl('\\Theta(n) \\text{ queries}', { fontSize: 24, color: '#2B5B45' }));

  citationCard.appendChild(citLeft);
  citationCard.appendChild(citRight);
  htmlLayer.appendChild(citationCard);

  // Lower Act 2 Card (b4): Strict S_n Consequence Strip (y = 398..540)
  const strictCard = document.createElement('div');
  strictCard.className = 'label-scrim label-scrim-card';
  strictCard.style.cssText =
    'position:absolute;left:220px;top:400px;width:840px;height:132px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:18px 28px;border:1.8px solid rgba(196,69,54,0.5);background:rgba(253,245,243,0.97);opacity:0;';

  const stLeft = document.createElement('div');
  stLeft.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
  stLeft.innerHTML =
    '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:0.1em;color:#C44536;">PHYSICAL BOTTLES · THE NO-CLONING WALL</div>' +
    '<div style="font-family:\'Fraunces\',Georgia,serif;font-size:23px;font-weight:700;color:#1F1A17;">Every Query Must Be a Bijection</div>' +
    '<div style="font-family:\'Plus Jakarta Sans\',sans-serif;font-size:13.5px;color:#6B5E54;">Cannot place two copies of Bottle 0 — breaks repeated-color Mastermind tricks.</div>';

  const stRight = document.createElement('div');
  stRight.style.cssText =
    'padding:14px 22px;border-radius:10px;background:#FCEAE6;border:1.5px solid #C44536;flex-shrink:0;';
  stRight.appendChild(createMathEl('\\sigma \\in S_n', { fontSize: 26, color: '#9D2D20' }));

  strictCard.appendChild(stLeft);
  strictCard.appendChild(stRight);
  htmlLayer.appendChild(strictCard);

  // =========================================================================
  // ACT 3A: POISSON(1) BOTTLENECK vs WIDE STRUCTURED DISTRIBUTION (b5 .. b6)
  // =========================================================================
  const distActG = svgEl('g', { class: 's6-dist-act' }, svg);
  gsap.set(distActG, { autoAlpha: 0 });

  const distPill1 = bottles.createSvgScrimLabel('Random Permutations → Poisson(1) Match Bottleneck', {
    x: 640,
    y: 66,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.cinnabar,
    stroke: P.cinnabar,
    padX: 16,
    padY: 6,
  });
  const distPill2 = bottles.createSvgScrimLabel('Goal: Structured Permutations → Wide Score Range (Θ(log n) Bits)', {
    x: 640,
    y: 66,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sage,
    stroke: P.sage,
    padX: 16,
    padY: 6,
  });
  gsap.set(distPill2, { autoAlpha: 0 });
  distActG.appendChild(distPill1);
  distActG.appendChild(distPill2);

  // Histogram card (left-center: x = 92..750, y = 114..520)
  svgEl(
    'rect',
    {
      x: '92',
      y: '114',
      width: '658',
      height: '406',
      rx: '16',
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.24)',
      'stroke-width': '1.4',
    },
    distActG,
  );

  // Chart axes: origin (158, 456), width 546, height 278 -> top y=178
  const CX = 158;
  const CY = 456;
  const CW = 544;
  const CH = 276;
  svgEl('line', { x1: String(CX), y1: String(CY), x2: String(CX + CW), y2: String(CY), stroke: P.ink, 'stroke-width': '1.8' }, distActG);
  svgEl('line', { x1: String(CX), y1: String(CY), x2: String(CX), y2: String(CY - CH - 10), stroke: P.ink, 'stroke-width': '1.8' }, distActG);

  // Faint horizontal gridlines (10%, 20%, 30%, 40%)
  for (let p = 10; p <= 40; p += 10) {
    const gy = CY - (p / 42) * CH;
    svgEl('line', { x1: String(CX), y1: gy.toFixed(1), x2: String(CX + CW), y2: gy.toFixed(1), stroke: 'rgba(107, 94, 84, 0.14)', 'stroke-width': '1', 'stroke-dasharray': '4 3' }, distActG);
    svgEl('text', { x: String(CX - 10), y: gy.toFixed(1), 'text-anchor': 'end', 'dominant-baseline': 'central', fill: P.muted, 'font-family': "'JetBrains Mono', monospace", 'font-size': '10.5', textContent: `${p}%` }, distActG);
  }
  svgEl('text', { x: String(CX + CW / 2), y: String(CY + 38), 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12', 'font-weight': '700', textContent: 'Match Score Reported by Referee (k)' }, distActG);

  // Poisson(1) probabilities for k = 0..7
  const poissonProbs = [36.8, 36.8, 18.4, 6.1, 1.5, 0.3, 0.1, 0.0];
  const wideProbs = [12.5, 13.0, 12.8, 12.6, 12.5, 12.6, 12.5, 11.5]; // Wide engineered distribution!
  const barStep = 66;
  const barW = 46;

  const poissonBars = [];
  const poissonTexts = [];
  const wideBars = [];

  for (let k = 0; k < 8; k++) {
    const bx = CX + 20 + k * barStep;
    const pH = Math.max(3, (poissonProbs[k] / 42) * CH);
    const wH = Math.max(3, (wideProbs[k] / 42) * CH);

    // X tick label
    svgEl(
      'text',
      {
        x: String(bx + barW / 2),
        y: String(CY + 18),
        'text-anchor': 'middle',
        fill: P.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '12',
        'font-weight': '700',
        textContent: k === 7 ? '7+' : String(k),
      },
      distActG,
    );

    // Poisson bar (grows upward from CY via transformOrigin bottom)
    const pBar = svgEl(
      'rect',
      {
        x: String(bx),
        y: String(CY - pH),
        width: String(barW),
        height: String(pH),
        rx: '5',
        fill: k <= 1 ? P.terracotta : P.brassLight,
        stroke: P.ink,
        'stroke-width': '1.3',
        opacity: '0.88',
      },
      distActG,
    );
    gsap.set(pBar, { scaleY: 0, transformOrigin: `${bx + barW / 2}px ${CY}px` });
    poissonBars.push(pBar);

    if (k <= 4) {
      const pt = svgEl(
        'text',
        {
          x: String(bx + barW / 2),
          y: String(CY - pH - 10),
          'text-anchor': 'middle',
          fill: k <= 1 ? P.cinnabar : P.sepia,
          'font-family': "'JetBrains Mono', monospace",
          'font-size': '11',
          'font-weight': '700',
          textContent: `${poissonProbs[k]}%`,
        },
        distActG,
      );
      gsap.set(pt, { autoAlpha: 0 });
      poissonTexts.push(pt);
    }

    // Wide engineered distribution bar (sage/delft)
    const wBar = svgEl(
      'rect',
      {
        x: String(bx + 3),
        y: String(CY - wH),
        width: String(barW - 6),
        height: String(wH),
        rx: '5',
        fill: P.sage,
        stroke: P.ink,
        'stroke-width': '1.3',
        opacity: '0.85',
      },
      distActG,
    );
    gsap.set(wBar, { scaleY: 0, autoAlpha: 0, transformOrigin: `${bx + barW / 2}px ${CY}px` });
    wideBars.push(wBar);
  }

  const poissonBadge = bottles.createSvgScrimLabel('Poisson(1) · E[f] = 1 match · H ≈ 1.88 bits!', {
    x: 470,
    y: 152,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.cinnabar,
    stroke: P.cinnabar,
    fill: '#FDF3F1',
    padX: 14,
    padY: 5,
  });
  const wideBadge = bottles.createSvgScrimLabel('Engineered Permutations · Broad Outcome Range!', {
    x: 470,
    y: 152,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sage,
    stroke: P.sage,
    fill: '#EEF8F2',
    padX: 14,
    padY: 5,
  });
  gsap.set(wideBadge, { autoAlpha: 0 });
  distActG.appendChild(poissonBadge);
  distActG.appendChild(wideBadge);

  // Right Info Panel (x = 782..1202, y = 114..520): Entropy Meter + Complexity Bar
  const rightDistG = svgEl('g', {}, distActG);
  svgEl(
    'rect',
    {
      x: '782',
      y: '114',
      width: '420',
      height: '190',
      rx: '14',
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.24)',
      'stroke-width': '1.4',
    },
    rightDistG,
  );
  svgEl(
    'text',
    {
      x: '808',
      y: '146',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.08em',
      textContent: 'INFORMATION PER QUERY',
    },
    rightDistG,
  );

  // Track bar
  svgEl('rect', { x: '808', y: '176', width: '368', height: '28', rx: '14', fill: '#EDE4D3', stroke: 'rgba(107, 94, 84, 0.22)' }, rightDistG);
  const entropyFill = svgEl('rect', { x: '808', y: '176', width: '74', height: '28', rx: '14', fill: P.cinnabar }, rightDistG);

  const entLblLow = bottles.createSvgScrimLabel('< 2 bits / query (Stuck!)', {
    x: 992,
    y: 238,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.cinnabar,
    stroke: P.cinnabar,
    padX: 12,
    padY: 5,
  });
  const entLblHigh = bottles.createSvgScrimLabel('Up to log n bits / query (Unlocked!)', {
    x: 992,
    y: 238,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sage,
    stroke: P.sage,
    padX: 12,
    padY: 5,
  });
  gsap.set(entLblHigh, { autoAlpha: 0 });
  rightDistG.appendChild(entLblLow);
  rightDistG.appendChild(entLblHigh);

  // Lower Right Card: Complexity Wall (O(n log n) -> Break n log n!)
  svgEl(
    'rect',
    {
      x: '782',
      y: '326',
      width: '420',
      height: '194',
      rx: '14',
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.24)',
      'stroke-width': '1.4',
    },
    rightDistG,
  );
  svgEl(
    'text',
    {
      x: '808',
      y: '358',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.08em',
      textContent: 'QUERY COMPLEXITY',
    },
    rightDistG,
  );

  const stallBox = svgEl('g', {}, rightDistG);
  svgEl('rect', { x: '808', y: '378', width: '368', height: '56', rx: '10', fill: '#FDF2EF', stroke: P.cinnabar, 'stroke-width': '1.6' }, stallBox);
  svgEl('text', { x: '992', y: '400', 'text-anchor': 'middle', fill: P.cinnabar, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '21', 'font-weight': '700', textContent: 'Naive / Static: O(n log n)' }, stallBox);
  svgEl('text', { x: '992', y: '422', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '12', textContent: 'n log n bits ÷ O(1) bits/query' }, stallBox);

  const targetBox = svgEl('g', {}, rightDistG);
  svgEl('rect', { x: '808', y: '448', width: '368', height: '54', rx: '10', fill: '#EEF8F2', stroke: P.sage, 'stroke-width': '1.8' }, targetBox);
  svgEl('text', { x: '992', y: '470', 'text-anchor': 'middle', fill: '#2B5B45', 'font-family': "'Fraunces', Georgia, serif", 'font-size': '20', 'font-weight': '700', textContent: 'Part II Target: O(n log log n)' }, targetBox);
  svgEl('text', { x: '992', y: '490', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '12', textContent: 'Beating the classic O(n log n) barrier!' }, targetBox);
  gsap.set(targetBox, { autoAlpha: 0 });

  // =========================================================================
  // ACT 3B: THREE-BUILDING-BLOCK PART II ROADMAP (b7)
  // =========================================================================
  const roadG = svgEl('g', { class: 's6-roadmap' }, svg);
  gsap.set(roadG, { autoAlpha: 0 });

  roadG.appendChild(
    bottles.createSvgScrimLabel('PART II ROADMAP · THREE BUILDING BLOCKS TO BEAT O(n log n)', {
      x: 640,
      y: 74,
      fontSize: 14,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#7A4F09',
      fill: '#FDF0CC',
      stroke: P.brass,
      strokeWidth: 1.5,
      padX: 20,
      padY: 7,
    }),
  );

  const pillars = [
    {
      num: 'BLOCK 1',
      title: 'Coin-Weighing Trick',
      sub: 'Lindström matrix packs m tests into O(m / log m) exact sums',
      badge: '5 coins in 4 → O(m / log m)',
      color: P.brass,
      bg: '#FFFBF0',
      cx: 245,
      icon: 'scale',
    },
    {
      num: 'BLOCK 2',
      title: 'Additive Bottle Scale',
      sub: 'Zero-match baseline p₀ + disjoint pairs hit O(n log log n)',
      badge: 'w(i,j) ∈ {0,1,2} sums cleanly',
      color: P.delft,
      bg: '#F4F9FC',
      cx: 640,
      icon: 'pairs',
    },
    {
      num: 'BLOCK 3',
      title: 'Orienting Closed Loops',
      sub: 'Resolve every discovered cycle into the exact secret π',
      badge: 'Full Secret Recovery',
      color: P.sage,
      bg: '#F2FAF5',
      cx: 1035,
      icon: 'cycle',
    },
  ];

  const pillarNodes = [];
  pillars.forEach((pl, idx) => {
    const g = svgEl('g', { transform: `translate(${pl.cx}, 322)` }, roadG);
    const inner = svgEl('g', {}, g);

    svgEl(
      'rect',
      {
        x: '-162',
        y: '-185',
        width: '324',
        height: '370',
        rx: '18',
        fill: pl.bg,
        stroke: pl.color,
        'stroke-width': '2.2',
      },
      inner,
    );
    // Number ribbon
    svgEl('rect', { x: '-58', y: '-162', width: '116', height: '26', rx: '13', fill: pl.color }, inner);
    svgEl(
      'text',
      {
        x: '0',
        y: '-148.5',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: '#FFFBF2',
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '11.5',
        'font-weight': '700',
        'letter-spacing': '0.08em',
        textContent: pl.num,
      },
      inner,
    );

    // Custom crisp miniature editorial icon centered at y = -58
    const iconG = svgEl('g', { transform: 'translate(0, -58)' }, inner);
    svgEl('circle', { cx: '0', cy: '0', r: '50', fill: '#F6F1E7', stroke: pl.color, 'stroke-width': '1.5', opacity: '0.9' }, iconG);
    if (pl.icon === 'scale') {
      // Mini brass scale silhouette
      svgEl('circle', { cx: '0', cy: '10', r: '24', fill: '#FFFDF8', stroke: P.brass, 'stroke-width': '3' }, iconG);
      svgEl('line', { x1: '0', y1: '10', x2: '12', y2: '-4', stroke: P.cinnabar, 'stroke-width': '2.5', 'stroke-linecap': 'round' }, iconG);
      svgEl('circle', { cx: '0', cy: '10', r: '3.5', fill: P.brass }, iconG);
      svgEl('rect', { x: '-22', y: '-26', width: '44', height: '6', rx: '3', fill: P.brass, stroke: P.ink, 'stroke-width': '1.2' }, iconG);
      svgEl('line', { x1: '0', y1: '-20', x2: '0', y2: '-14', stroke: P.ink, 'stroke-width': '2.5' }, iconG);
    } else if (pl.icon === 'pairs') {
      // Mini disjoint bottle-pair brackets
      svgEl('rect', { x: '-34', y: '-16', width: '26', height: '32', rx: '6', fill: P.terracotta, opacity: '0.85', stroke: P.ink, 'stroke-width': '1.4' }, iconG);
      svgEl('rect', { x: '8', y: '-16', width: '26', height: '32', rx: '6', fill: P.delft, opacity: '0.85', stroke: P.ink, 'stroke-width': '1.4' }, iconG);
      svgEl('path', { d: 'M -20 -26 Q 0 -38 20 -26', fill: 'none', stroke: P.brass, 'stroke-width': '2.4' }, iconG);
      svgEl('text', { x: '0', y: '28', 'text-anchor': 'middle', fill: P.delft, 'font-family': "'JetBrains Mono', monospace", 'font-size': '11', 'font-weight': '700', textContent: '0 ↔ 1' }, iconG);
    } else {
      // Mini directed 3-cycle
      svgEl('circle', { cx: '0', cy: '0', r: '26', fill: 'none', stroke: P.sage, 'stroke-width': '2.6', 'stroke-dasharray': '10 4' }, iconG);
      const pts = [
        [0, -26],
        [23, 14],
        [-23, 14],
      ];
      pts.forEach(([px, py]) => {
        svgEl('circle', { cx: String(px), cy: String(py), r: '7.5', fill: P.parchment, stroke: P.sage, 'stroke-width': '2' }, iconG);
      });
    }

    // Title
    svgEl(
      'text',
      {
        x: '0',
        y: '24',
        'text-anchor': 'middle',
        fill: P.ink,
        'font-family': "'Fraunces', Georgia, serif",
        'font-size': '23',
        'font-weight': '700',
        textContent: pl.title,
      },
      inner,
    );

    // Two-line crisp description
    const words = pl.sub.split(' ');
    const mid = Math.ceil(words.length / 2);
    svgEl(
      'text',
      {
        x: '0',
        y: '62',
        'text-anchor': 'middle',
        fill: P.sepia,
        'font-family': "'Plus Jakarta Sans', sans-serif",
        'font-size': '13.5',
        'font-weight': '500',
        textContent: words.slice(0, mid).join(' '),
      },
      inner,
    );
    svgEl(
      'text',
      {
        x: '0',
        y: '82',
        'text-anchor': 'middle',
        fill: P.sepia,
        'font-family': "'Plus Jakarta Sans', sans-serif",
        'font-size': '13.5',
        'font-weight': '500',
        textContent: words.slice(mid).join(' '),
      },
      inner,
    );

    // Bottom formula badge
    inner.appendChild(
      bottles.createSvgScrimLabel(pl.badge, {
        x: 0,
        y: 136,
        fontSize: 12.5,
        fontFamily: 'mono',
        fontWeight: 700,
        color: pl.color,
        stroke: pl.color,
        padX: 12,
        padY: 5,
      }),
    );

    gsap.set(inner, { autoAlpha: 0, y: 26 });
    pillarNodes.push(inner);

    // Connecting brass arrow between pillars
    if (idx < 2) {
      const arrowX1 = pl.cx + 170;
      const arrowX2 = pillars[idx + 1].cx - 170;
      svgEl(
        'line',
        {
          x1: String(arrowX1),
          y1: '322',
          x2: String(arrowX2),
          y2: '322',
          stroke: P.brass,
          'stroke-width': '2.6',
          'marker-end': 'url(#s6_arr)',
        },
        roadG,
      );
    }
  });

  // =========================================================================
  // MASTER BIDIRECTIONAL GSAP TIMELINE
  // =========================================================================
  const tl = gsap.timeline({ paused: true });

  const switchTopPill = (fromIdx, toIdx, t) => {
    tl.to(topPills[fromIdx], { autoAlpha: 0, duration: 0.22, immediateRender: false }, t);
    tl.to(topPills[toIdx], { autoAlpha: 1, duration: 0.28, immediateRender: false }, t + 0.16);
  };

  // --- b0 (0.80s): Simultaneous full-table reorder of all 6 bottles ---
  tl.fromTo(tableActG, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0);
  // Permute [0,1,2,3,4,5] -> [4,2,5,0,3,1] (bottle i goes to slot targetSlot[i])
  const targetSlot = [3, 5, 1, 4, 0, 2];
  for (let i = 0; i < 6; i++) {
    const t0 = b0.start + 1.8;
    tl.to(bLifts[i], { y: -68 - (i % 2) * 16, duration: 0.55, ease: 'power2.out', immediateRender: false }, t0);
    tl.to(bMovers[i], { x: SLOT_X[targetSlot[i]], duration: 1.3, ease: 'power2.inOut', immediateRender: false }, t0 + 0.35);
    tl.to(bLifts[i], { y: 0, duration: 0.5, ease: 'bounce.out', immediateRender: false }, t0 + 1.45);
  }

  // --- b1 (8.89s): Information-theory ratio card (Omega(n)) ---
  switchTopPill(0, 1, b1.start);
  tl.to(infoCard, { autoAlpha: 1, duration: 0.65, ease: 'power2.out' }, b1.start + 0.8);

  // --- b2 (22.88s): Cloning fantasy — wooden stamp duplicates Bottle 0 across half the coasters ---
  switchTopPill(1, 2, b2.start);
  tl.to(infoCard, { autoAlpha: 0, duration: 0.4 }, b2.start);
  // Return original bottles gently to home positions [0..5] and hide slots 0..2 completely so clones never double-stack DOM text!
  for (let i = 0; i < 6; i++) {
    tl.to(bMovers[i], { x: SLOT_X[i], duration: 0.65, ease: 'power2.inOut', immediateRender: false }, b2.start + 0.2);
  }
  tl.to([bMovers[0], bMovers[1], bMovers[2]], { autoAlpha: 0, duration: 0.35 }, b2.start + 1.1);
  tl.to([bMovers[3], bMovers[4], bMovers[5]], { autoAlpha: 0.32, duration: 0.4 }, b2.start + 1.1);

  // Rubber stamp descends onto Slots 0, 1, 2 in crisp sequence (strictly below top pill!)
  tl.to(stampMover, { autoAlpha: 1, duration: 0.3 }, b2.start + 1.2);
  for (let s = 0; s < 3; s++) {
    const st = b2.start + 1.6 + s * 1.45;
    tl.to(stampMover, { x: SLOT_X[s], y: 168, duration: 0.4, ease: 'power2.inOut', immediateRender: false }, st);
    tl.to(stampMover, { y: 196, duration: 0.22, ease: 'power3.in', immediateRender: false }, st + 0.42);
    tl.to(cloneCopies[s], { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)', immediateRender: false }, st + 0.64);
    tl.to(stampMover, { y: 166, duration: 0.28, ease: 'power2.out', immediateRender: false }, st + 0.68);
  }
  tl.to(stampMover, { autoAlpha: 0, duration: 0.35 }, b2.start + 6.3);
  tl.to(halfBracketG, { autoAlpha: 1, duration: 0.45 }, b2.start + 6.4);

  // --- b3 (32.69s): Repeated-Color Mastermind -> Martinsson & Su (2024) Theta(n) ---
  switchTopPill(2, 3, b3.start);
  tl.to(citationCard, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, b3.start + 0.7);

  // --- b4 (44.28s): HARD WALL: NO CLONING · Strict Permutations S_n ---
  switchTopPill(3, 4, b4.start);
  tl.to([citationCard, halfBracketG], { autoAlpha: 0, duration: 0.35 }, b4.start + 0.1);
  // Stamp down NO CLONING barrier
  tl.to(noCloneInner, { autoAlpha: 1, scale: 1, rotation: -1.5, duration: 0.42, ease: 'back.out(1.4)' }, b4.start + 0.6);
  // Dissolve clones & restore all 6 unique physical bottles
  tl.to(cloneCopies, { autoAlpha: 0, scale: 0.6, duration: 0.45, stagger: 0.08 }, b4.start + 1.8);
  tl.to(bMovers, { autoAlpha: 1, duration: 0.5 }, b4.start + 2.1);
  tl.to(noCloneInner, { autoAlpha: 0, duration: 0.45 }, b4.start + 4.4);
  tl.to(strictCard, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b4.start + 4.2);

  // --- ACT 2 -> ACT 3A CROSS-FADE ---
  tl.to([tableActG, strictCard], { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, b5.start - 0.5);
  tl.to(distActG, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b5.start);

  // --- b5 (54.36s): Poisson(1) match spike & < 2 bits entropy stalling at O(n log n) ---
  poissonBars.forEach((bar, idx) => {
    tl.to(bar, { scaleY: 1, duration: 0.55, ease: 'back.out(1.2)' }, b5.start + 0.7 + idx * 0.12);
  });
  tl.to(poissonTexts, { autoAlpha: 1, duration: 0.35, stagger: 0.08 }, b5.start + 1.6);

  // --- b6 (66.93s): Wide engineered distribution packing up to log n bits ---
  tl.to(distPill1, { autoAlpha: 0, duration: 0.25 }, b6.start);
  tl.to(distPill2, { autoAlpha: 1, duration: 0.3 }, b6.start + 0.2);
  tl.to(poissonBadge, { autoAlpha: 0, duration: 0.3 }, b6.start + 0.3);
  tl.to(wideBadge, { autoAlpha: 1, duration: 0.4 }, b6.start + 0.6);
  tl.to(poissonBars, { opacity: 0.22, duration: 0.5 }, b6.start + 0.6);
  tl.to(poissonTexts, { autoAlpha: 0.25, duration: 0.4 }, b6.start + 0.6);

  wideBars.forEach((wBar, idx) => {
    tl.to(wBar, { autoAlpha: 1, scaleY: 1, duration: 0.55, ease: 'power2.out' }, b6.start + 1.0 + idx * 0.1);
  });
  tl.to(entropyFill, { attr: { width: '328', fill: P.sage }, duration: 1.0, ease: 'power2.inOut' }, b6.start + 1.6);
  tl.to(entLblLow, { autoAlpha: 0, duration: 0.25 }, b6.start + 1.8);
  tl.to(entLblHigh, { autoAlpha: 1, duration: 0.35 }, b6.start + 2.05);
  tl.to(targetBox, { autoAlpha: 1, duration: 0.55, ease: 'back.out(1.2)' }, b6.start + 2.8);

  // --- ACT 3A -> ACT 3B (3-Building-Block Roadmap) ---
  tl.to(distActG, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b7.start - 0.45);
  tl.to(roadG, { autoAlpha: 1, duration: 0.5 }, b7.start);
  tl.to(pillarNodes[0], { autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.35)' }, b7.start + 0.8);
  tl.to(pillarNodes[1], { autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.35)' }, b7.start + 3.2);
  tl.to(pillarNodes[2], { autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.35)' }, b7.start + 6.4);

  // Pad timeline to full audio duration
  tl.to({}, { duration: 0.01 }, totalDur);

  return {
    timeline: tl,
    destroy() {
      tl.kill();
      rootEl.innerHTML = '';
    },
  };
}
