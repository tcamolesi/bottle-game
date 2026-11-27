// Chapter 09: Breaking n log n: Round-Robin & Parallel Halving
// Sunlit Apothecary Art · 9 Audio-Synced Beats · 179.08s
// Act 1 (Beat 0): Zero-match baseline p0 -> each off-coaster bottle adds +1 to 1 pair -> sum of pair weights = n
// Act 2 (Beats 1-2): Full-table simultaneous round-robin swaps (ALL n/2 pairs swapped at once in 1 move!) -> brass scale -> 0-score rounds drop all n/2 pairs in 1 move
// Act 3A (Beat 3): Binary-search halving over log2 n levels -> <= n active groups survive at every level -> naive = O(n log n)
// Act 3B (Beat 4): Adaptive Half Selection & Super-Coin Parallel Batching on the brass scale (zero slot collisions!)
// Act 3C (Beat 5): Quarter-table occupancy -> (3/4)^2 = 9/16 > 1/2 free pairs -> m = Theta(2^r) super-coins/batch
// Act 4A (Beat 6): Dual-track decoder (Weight 1 -> Lindström 0/1; Weight >= 2 -> Sparse Random {0,1})
// Act 4B (Beats 7-8): O(m / log m) per batch = O(1 / r) per active group -> O(n / r) per level -> Sunlit Harmonic Staircase O(n log log n)

export const sceneMeta = {
  id: 'scene9',
  number: 9,
  title: 'Breaking n log n: Round-Robin & Parallel Halving',
  chapter: 'Part II · Breaking n log n',
  duration: 179.08,
  beats: [
    {
      id: 's9_b0',
      start: 0.8,
      audioDuration: 18.144,
      end: 19.494,
      text: 'On our zero-match baseline p₀—found in under three random tries, or deterministically in at most 2n queries—each off-coaster bottle adds 1 to the single pair linking its slot to its true coaster, so all pair weights across the table sum to exactly n.',
      highlight: ['baseline p₀', 'at most 2n queries', 'sum to exactly n'],
      cue: null,
    },
    {
      id: 's9_b1',
      start: 19.494,
      audioDuration: 20.352,
      end: 40.396,
      text: 'To cover all n(n−1)/2 pairs, shuffle the slots and schedule a round-robin tournament of at most n full-table rounds—each round swaps all n/2 disjoint pairs simultaneously in a single move.',
      highlight: ['round-robin tournament', 'all n/2 disjoint pairs', 'single move'],
      cue: 'whoosh',
    },
    {
      id: 's9_b2',
      start: 40.396,
      audioDuration: 18.216,
      end: 59.162,
      text: 'Querying a round moves every bottle simultaneously and returns the combined weight of all n/2 pairs in that round. Any round scoring 0 discards all n/2 of its pairs in ONE query; only nonzero rounds survive as active groups.',
      highlight: ['moves every bottle simultaneously', 'discards all n/2 of its pairs in ONE query', 'active groups'],
      cue: 'bell',
    },
    {
      id: 's9_b3',
      start: 59.162,
      audioDuration: 25.296,
      end: 85.008,
      text: 'Over log₂ n binary-search levels, we halve every active group down to individual pairs. Weighing one half-subset gives the other half by subtraction, and because positive integer weights still sum to n, at most n active groups survive at every level. Splitting them sequentially would cost O(n log n).',
      highlight: ['log₂ n binary-search levels', 'at most n active groups survive at every level', 'O(n log n)'],
      cue: null,
    },
    {
      id: 's9_b4',
      start: 85.008,
      audioDuration: 22.944,
      end: 108.502,
      text: "Instead, treat each active group's chosen half-subset as a single super-coin in a slot-disjoint batch! Never freeze a rigid left half—which causes slot collisions—adaptively pick any half of a group's pairs whose slots remain free, so any subset of those m super-coins can be swapped simultaneously in one weighing for their exact combined weight.",
      highlight: ['single super-coin', 'adaptively pick any half', 'swapped simultaneously'],
      cue: 'clink',
    },
    {
      id: 's9_b5',
      start: 108.502,
      audioDuration: 15.912,
      end: 124.964,
      text: "While a batch uses under a quarter of the table, over half of any randomly ordered group's pairs stay free—and at n/2ʳ slots per half, m = Θ(2ʳ) disjoint super-coins fit in a single Lindström batch!",
      highlight: ['under a quarter of the table', 'm = Θ(2ʳ) disjoint super-coins'],
      cue: 'lock',
    },
    {
      id: 's9_b6',
      start: 124.964,
      audioDuration: 17.208,
      end: 142.722,
      text: "Weight-1 groups yield strict 0/1 super-coins decoded by Lindström's matrix, while weight-2-or-more groups—whose halves can weigh 0, 1, 2, or more—use sparse random subset weighings; both compress level r by the same log m factor.",
      highlight: ['0/1 super-coins', 'sparse random subset weighings', 'same log m factor'],
      cue: 'scale',
    },
    {
      id: 's9_b7',
      start: 142.722,
      audioDuration: 15.336,
      end: 158.608,
      text: 'Each batch of m = Θ(2ʳ) super-coins takes O(m / log m) queries—just O(1 / r) queries per active group—so halving all ≤ n active groups at level r costs only O(n / r) queries!',
      highlight: ['O(m / log m) queries', 'O(1 / r) queries per active group', 'O(n / r) queries'],
      cue: 'bell',
    },
    {
      id: 's9_b8',
      start: 158.608,
      audioDuration: 19.272,
      end: 179.08,
      text: 'Summing n/1, n/2, down to n/log n gives n times the harmonic sum of log n—proving an expected Big-O upper bound of O(n log log n) queries! Next: when do we stop weighing, and how do exact pair weights reveal the coasters?',
      highlight: ['harmonic sum of log n', 'Big-O upper bound of O(n log log n)'],
      cue: 'lock',
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
  const { gsap, createSvg, svgEl, bottles } = ctx;
  const P = ctx.colors || bottles.PALETTE;
  const beats = ctx.beats && ctx.beats.length ? ctx.beats : sceneMeta.beats;
  const totalDur = Math.max(ctx.duration || sceneMeta.duration, 179.08);

  const b0 = beatAt(beats, 0, 0.8, 18.144);
  const b1 = beatAt(beats, 1, 19.494, 20.352);
  const b2 = beatAt(beats, 2, 40.396, 18.216);
  const b3 = beatAt(beats, 3, 59.162, 25.296);
  const b4 = beatAt(beats, 4, 85.008, 22.944);
  const b5 = beatAt(beats, 5, 108.502, 15.912);
  const b6 = beatAt(beats, 6, 124.964, 17.208);
  const b7 = beatAt(beats, 7, 142.722, 15.336);
  const b8 = beatAt(beats, 8, 158.608, 19.272);

  rootEl.innerHTML = '';

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:absolute;inset:0;width:1280px;height:590px;pointer-events:none;overflow:hidden;';
  rootEl.appendChild(stage);

  const svg = createSvg(1280, 590, {
    style: { position: 'absolute', left: '0', top: '0', width: '1280px', height: '590px', overflow: 'visible' },
  });
  stage.appendChild(svg);

  const defs = svgEl('defs', {}, svg);

  const sunWash = svgEl('radialGradient', { id: 's09_sun', cx: '50%', cy: '45%', r: '52%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#F8E3B5', 'stop-opacity': '0.44' }, sunWash);
  svgEl('stop', { offset: '100%', 'stop-color': '#F8E3B5', 'stop-opacity': '0' }, sunWash);

  const oakGrad = svgEl('linearGradient', { id: 's09_oak', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#D7B084' }, oakGrad);
  svgEl('stop', { offset: '55%', 'stop-color': '#BA8958' }, oakGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#8A5D36' }, oakGrad);

  const barGrad = svgEl('linearGradient', { id: 's09_bar', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': P.terracotta }, barGrad);
  svgEl('stop', { offset: '55%', 'stop-color': P.goldBright }, barGrad);
  svgEl('stop', { offset: '100%', 'stop-color': P.brass }, barGrad);

  const makeArrowMarker = (id, color) => {
    const m = svgEl('marker', {
      id,
      viewBox: '0 0 10 10',
      refX: '8.2',
      refY: '5',
      markerWidth: '6.5',
      markerHeight: '6.5',
      orient: 'auto-start-reverse',
    }, defs);
    svgEl('path', { d: 'M 1 1.5 L 8.8 5 L 1 8.5 Z', fill: color }, m);
  };
  makeArrowMarker('s09_arr_brass', P.brass);
  makeArrowMarker('s09_arr_delft', P.delft);
  makeArrowMarker('s09_arr_sage', P.sage);
  makeArrowMarker('s09_arr_terra', P.terracotta);
  makeArrowMarker('s09_arr_plum', P.plum);
  makeArrowMarker('s09_arr_sepia', P.sepia);

  const addScrim = (parent, text, opts = {}) => {
    const node = bottles.createSvgScrimLabel(text, opts);
    parent.appendChild(node);
    return node;
  };

  const SECRET = [1, 0, 3, 4, 5, 2];

  // =========================================================================
  // ACT 1 (Beat 0): TOTAL PAIR WEIGHT ACROSS TABLE = n
  // =========================================================================
  const actSumN = svgEl('g', { id: 's09_act_sumn' }, svg);
  svgEl('ellipse', { cx: '640', cy: '310', rx: '480', ry: '205', fill: 'url(#s09_sun)' }, actSumN);

  svgEl('text', {
    x: '640',
    y: '78',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Baseline p₀: Every Pair Weight Sums to Exactly n',
  }, actSumN);

  const b0SubPill = addScrim(
    actSumN,
    'Found in < 3 random tries (or ≤ 2n deterministic queries)  ·  f(p₀) = 0',
    {
      x: 640,
      y: 114,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.sepia,
      fill: '#FDF8EC',
      stroke: P.brass,
      padX: 16,
      padY: 5,
    },
  );

  const b0ShelfY = 434;
  const b0Xs = [215, 385, 555, 725, 895, 1065];

  svgEl('rect', { x: '116', y: String(b0ShelfY + 20), width: '1048', height: '14', rx: '7', fill: '#4A3828', opacity: '0.13' }, actSumN);
  svgEl('rect', { x: '100', y: String(b0ShelfY), width: '1080', height: '22', rx: '7', fill: 'url(#s09_oak)', stroke: P.ink, 'stroke-width': '1.8' }, actSumN);
  svgEl('line', { x1: '116', y1: String(b0ShelfY + 4), x2: '1164', y2: String(b0ShelfY + 4), stroke: '#F0D7B4', 'stroke-width': '1.5', opacity: '0.72' }, actSumN);

  for (let i = 0; i < 6; i++) {
    actSumN.appendChild(
      bottles.createSvgCoaster(SECRET[i], {
        x: b0Xs[i],
        y: b0ShelfY - 2,
        width: 78,
        scale: 0.96,
        hidden: true,
        slotIndex: i,
      }),
    );
    actSumN.appendChild(
      bottles.createSvgBottle(i, {
        x: b0Xs[i],
        y: b0ShelfY - 4,
        scale: 1.06,
      }),
    );
  }

  const pointerSpecs = [
    { d: `M ${b0Xs[0] + 10} 310 Q ${(b0Xs[0] + b0Xs[1]) / 2} 230 ${b0Xs[1] - 10} 310`, col: P.brass, marker: 's09_arr_brass' },
    { d: `M ${b0Xs[1] - 10} 300 Q ${(b0Xs[0] + b0Xs[1]) / 2} 182 ${b0Xs[0] + 10} 300`, col: P.brass, marker: 's09_arr_brass' },
    { d: `M ${b0Xs[3] - 6} 310 Q ${(b0Xs[2] + b0Xs[3]) / 2} 234 ${b0Xs[2] + 10} 310`, col: P.delft, marker: 's09_arr_delft' },
    { d: `M ${b0Xs[4] - 6} 310 Q ${(b0Xs[3] + b0Xs[4]) / 2} 234 ${b0Xs[3] + 10} 310`, col: P.sage, marker: 's09_arr_sage' },
    { d: `M ${b0Xs[5] - 6} 310 Q ${(b0Xs[4] + b0Xs[5]) / 2} 234 ${b0Xs[4] + 10} 310`, col: P.plum, marker: 's09_arr_plum' },
    { d: `M ${b0Xs[2] + 4} 298 C ${b0Xs[2] + 90} 138, ${b0Xs[5] - 90} 138, ${b0Xs[5] - 4} 298`, col: P.terracotta, marker: 's09_arr_terra' },
  ];

  const b0Arrows = pointerSpecs.map((sp) => {
    const p = svgEl('path', {
      d: sp.d,
      fill: 'none',
      stroke: sp.col,
      'stroke-width': '3',
      'stroke-linecap': 'round',
      'marker-end': `url(#${sp.marker})`,
    }, actSumN);
    p.setAttribute('stroke-dasharray', '900');
    p.setAttribute('stroke-dashoffset', '900');
    return p;
  });

  const b0WeightPills = [
    addScrim(actSumN, 'w(0,1) = 2', { x: 300, y: 214, fontSize: 13, fontFamily: 'mono', fontWeight: 700, color: P.brass, stroke: P.brass }),
    addScrim(actSumN, 'w(2,3) = 1', { x: 640, y: 258, fontSize: 12.5, fontFamily: 'mono', fontWeight: 700, color: P.delft, stroke: P.delft }),
    addScrim(actSumN, 'w(3,4) = 1', { x: 810, y: 258, fontSize: 12.5, fontFamily: 'mono', fontWeight: 700, color: P.sage, stroke: P.sage }),
    addScrim(actSumN, 'w(4,5) = 1', { x: 980, y: 258, fontSize: 12.5, fontFamily: 'mono', fontWeight: 700, color: P.plum, stroke: P.plum }),
    addScrim(actSumN, 'w(2,5) = 1', { x: 810, y: 170, fontSize: 12.5, fontFamily: 'mono', fontWeight: 700, color: P.terracotta, stroke: P.terracotta }),
  ];

  const b0SumPill = addScrim(
    actSumN,
    'Total weight across all C(n, 2) pairs:   2 + 1 + 1 + 1 + 1  =  6  =  n',
    {
      x: 640,
      y: 538,
      fontSize: 14.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.ink,
      fill: '#FDF5DF',
      stroke: P.brass,
      strokeWidth: 1.5,
      padX: 20,
      padY: 8,
    },
  );

  // =========================================================================
  // ACT 2 (Beats 1-2): FULL-TABLE SIMULTANEOUS ROUND-ROBIN SWAPS!
  // =========================================================================
  const actTourney = svgEl('g', { id: 's09_act_tourney' }, svg);
  svgEl('ellipse', { cx: '420', cy: '330', rx: '390', ry: '205', fill: 'url(#s09_sun)' }, actTourney);

  svgEl('text', {
    x: '640',
    y: '78',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Round-Robin Tournament · Full-Table Simultaneous Swaps',
  }, actTourney);

  const rrHeroBanner = addScrim(
    actTourney,
    '1 FULL-TABLE MOVE  =  ALL n/2 PAIRS SWAPPED AT ONCE',
    {
      x: 640,
      y: 118,
      fontSize: 14.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.ink,
      fill: '#FDF5DF',
      stroke: P.brass,
      strokeWidth: 1.8,
      padX: 20,
      padY: 6,
    },
  );

  // Left/Center wide sunlit oak table with 6 labeled bottles over veiled '?' coasters
  const rrTableY = 438;
  const rrXs = [118, 232, 346, 460, 574, 688];
  svgEl('rect', { x: '64', y: String(rrTableY + 18), width: '678', height: '13', rx: '6', fill: '#4A3828', opacity: '0.13' }, actTourney);
  svgEl('rect', { x: '52', y: String(rrTableY), width: '702', height: '20', rx: '7', fill: 'url(#s09_oak)', stroke: P.ink, 'stroke-width': '1.7' }, actTourney);
  svgEl('line', { x1: '66', y1: String(rrTableY + 4), x2: '740', y2: String(rrTableY + 4), stroke: '#F0D7B4', 'stroke-width': '1.4', opacity: '0.72' }, actTourney);

  for (let i = 0; i < 6; i++) {
    actTourney.appendChild(
      bottles.createSvgCoaster(SECRET[i], {
        x: rrXs[i],
        y: rrTableY - 2,
        width: 68,
        scale: 0.88,
        hidden: true,
        slotIndex: i,
      }),
    );
  }

  // All 5 exact 1-factorization rounds matching Scene 11 & SECRET = [1, 0, 3, 4, 5, 2]
  const RR_ROUNDS = [
    {
      num: 1,
      pairs: [[0, 1], [2, 3], [4, 5]],
      perm: [1, 0, 3, 2, 5, 4],
      weight: 4,
      pairsStr: '(0↔1), (2↔3), (4↔5)',
    },
    {
      num: 2,
      pairs: [[0, 2], [1, 5], [3, 4]],
      perm: [2, 5, 0, 4, 3, 1],
      weight: 1,
      pairsStr: '(0↔2), (1↔5), (3↔4)',
    },
    {
      num: 3,
      pairs: [[0, 3], [1, 4], [2, 5]],
      perm: [3, 4, 5, 0, 1, 2],
      weight: 1,
      pairsStr: '(0↔3), (1↔4), (2↔5)',
    },
    {
      num: 4,
      pairs: [[0, 4], [1, 2], [3, 5]],
      perm: [4, 2, 1, 5, 0, 3],
      weight: 0,
      pairsStr: '(0↔4), (1↔2), (3↔5)',
    },
    {
      num: 5,
      pairs: [[0, 5], [1, 3], [2, 4]],
      perm: [5, 3, 4, 1, 2, 0],
      weight: 0,
      pairsStr: '(0↔5), (1↔3), (2↔4)',
    },
  ];
  const pairColors = [P.terracotta, P.delft, P.sage];
  const pairMarkers = ['s09_arr_terra', 's09_arr_delft', 's09_arr_sage'];

  // Simultaneous swap arc layers above the bottles for each round
  const rrArcLayers = RR_ROUNDS.map((rd) => {
    const ag = svgEl('g', { class: `s09-rr-arcs-${rd.num}` }, actTourney);
    rd.pairs.forEach(([a, b], pi) => {
      const x1 = rrXs[a];
      const x2 = rrXs[b];
      const span = Math.abs(b - a);
      const peakY = Math.max(158, 304 - span * 34 - pi * 12);
      svgEl('path', {
        d: `M ${x1} 322 Q ${(x1 + x2) / 2} ${peakY} ${x2} 322`,
        fill: 'none',
        stroke: pairColors[pi],
        'stroke-width': '3.6',
        'stroke-linecap': 'round',
        'marker-start': `url(#${pairMarkers[pi]})`,
        'marker-end': `url(#${pairMarkers[pi]})`,
      }, ag);
      addScrim(ag, `${a}↔${b}`, {
        x: (x1 + x2) / 2,
        y: (322 + peakY) / 2 - 4,
        fontSize: 12,
        fontFamily: 'mono',
        fontWeight: 700,
        color: pairColors[pi],
        stroke: pairColors[pi],
        padX: 7,
        padY: 3,
        shadow: false,
      });
    });
    return ag;
  });

  // 6 animated bottles sitting on the round-robin table
  const rrBottles = [];
  for (let i = 0; i < 6; i++) {
    const wrap = svgEl('g', { class: `s09-rr-btl-${i}` }, actTourney);
    const bNode = bottles.createSvgBottle(i, { x: 0, y: 0, scale: 0.96 });
    wrap.appendChild(bNode);
    rrBottles.push({ wrap, bNode, id: i });
  }

  // Live lineup & status scrim pill beneath table (y = 532)
  const rrLineupPill = addScrim(
    actTourney,
    'Baseline p₀: [0, 1, 2, 3, 4, 5]  ·  Ready for Full-Table Round 1',
    {
      x: 403,
      y: 532,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.ink,
      fill: '#FDF8EC',
      stroke: P.brass,
      minWidth: 520,
      padX: 16,
      padY: 6,
    },
  );

  // Zero-score banner stamping cleanly above the 0↔4 arc apex (Beat 2)
  const rrZeroStamp = addScrim(
    actTourney,
    '✗  0-Score Round  →  All n/2 Pairs Discarded in 1 Move!',
    {
      x: 403,
      y: 176,
      fontSize: 14,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.cinnabar,
      fill: '#FBECE8',
      stroke: P.cinnabar,
      strokeWidth: 2,
      padX: 16,
      padY: 7,
    },
  );

  // Right side: Brass Scale (top-right) + 5-Round Ledger (bottom-right)
  svgEl('path', {
    d: 'M 744 268 L 814 234',
    fill: 'none',
    stroke: P.brass,
    'stroke-width': '2.6',
    'stroke-dasharray': '6 4',
    'marker-end': 'url(#s09_arr_brass)',
  }, actTourney);

  const rrScale = bottles.createSvgBrassScale({
    x: 886,
    y: 224,
    radius: 48,
    maxVal: 6,
    initialVal: 0,
    unit: '',
  });
  actTourney.appendChild(rrScale);

  const rrScaleReadout = addScrim(actTourney, 'Combined Round Weight: f = 0', {
    x: 1094,
    y: 204,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.ink,
    fill: '#FDF5DF',
    stroke: P.brass,
    minWidth: 252,
    padX: 12,
    padY: 6,
  });

  const rrScaleSub = addScrim(actTourney, '1 Query = Sum of all n/2 pairs', {
    x: 1094,
    y: 244,
    fontSize: 12,
    fontFamily: 'body',
    fontWeight: 600,
    color: P.sepia,
    stroke: 'rgba(107, 94, 84, 0.25)',
    minWidth: 252,
    padX: 10,
    padY: 4,
    shadow: false,
  });

  // 5-Round Tournament Ledger (x = 796..1234, y = 304..548)
  svgEl('text', {
    x: '800',
    y: '306',
    fill: P.brass,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '11.5',
    'font-weight': '700',
    'letter-spacing': '0.09em',
    textContent: 'FULL-TABLE ROUNDS (ALL 15 PAIRS IN 5 MOVES)',
  }, actTourney);

  const ledgerRows = [];
  const ledgerBadges = [];
  const ledgerStrikes = [];
  RR_ROUNDS.forEach((rd, idx) => {
    const ry = 334 + idx * 42;
    const rg = svgEl('g', { class: `s09-row-${idx}` }, actTourney);

    svgEl('rect', {
      x: '796',
      y: String(ry - 17),
      width: '438',
      height: '34',
      rx: '8',
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.26)',
      'stroke-width': '1.2',
    }, rg);

    svgEl('text', {
      x: '810',
      y: String(ry + 1),
      'dominant-baseline': 'central',
      fill: P.ink,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '12.5',
      'font-weight': '700',
      textContent: `R${rd.num}`,
    }, rg);

    svgEl('text', {
      x: '844',
      y: String(ry + 1),
      'dominant-baseline': 'central',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '12',
      'font-weight': '600',
      textContent: rd.pairsStr,
    }, rg);

    const strike = svgEl('line', {
      x1: '840',
      y1: String(ry),
      x2: '1072',
      y2: String(ry),
      stroke: P.cinnabar,
      'stroke-width': '2.4',
      'stroke-linecap': 'round',
    }, rg);

    const isZero = rd.weight === 0;
    const badge = addScrim(
      rg,
      isZero ? 'f=0 · DROP ALL 3' : `f=${rd.weight} · ACTIVE`,
      {
        x: 1154,
        y: ry,
        fontSize: 11,
        fontFamily: 'mono',
        fontWeight: 700,
        color: isZero ? P.cinnabar : P.sage,
        fill: isZero ? '#FBECE8' : '#EBF5EF',
        stroke: isZero ? P.cinnabar : P.sage,
        padX: 9,
        padY: 3,
        shadow: false,
      },
    );

    ledgerRows.push(rg);
    ledgerBadges.push(badge);
    ledgerStrikes.push(strike);
  });

  const rrFooterActive = addScrim(
    actTourney,
    'Only Nonzero Rounds Survive  ⇒  Σ w = n  ⇒  ≤ n Active Groups!',
    {
      x: 1015,
      y: 540,
      fontSize: 12,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.sage,
      fill: '#EBF5EF',
      stroke: P.sage,
      strokeWidth: 1.4,
      padX: 12,
      padY: 5,
    },
  );

  // =========================================================================
  // ACT 3A (Beat 3): BINARY-SEARCH HALVING TREE & <= n ACTIVE GROUPS INVARIANT
  // =========================================================================
  const actTree = svgEl('g', { id: 's09_act_tree' }, svg);
  svgEl('ellipse', { cx: '640', cy: '310', rx: '460', ry: '210', fill: 'url(#s09_sun)' }, actTree);

  svgEl('text', {
    x: '640',
    y: '78',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Binary-Search Halving Over log₂ n Levels',
  }, actTree);

  const treeInvariantRibbon = addScrim(
    actTree,
    'INVARIANT:  Positive Integer Weights Sum to n   ⇒   ≤ n Active Groups Survive at EVERY Level!',
    {
      x: 640,
      y: 118,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.sage,
      fill: '#EBF5EF',
      stroke: P.sage,
      strokeWidth: 1.6,
      padX: 18,
      padY: 6,
    },
  );

  const treeLines = [
    [396, 206, 246, 282], [396, 206, 546, 282],
    [246, 330, 172, 402], [246, 330, 320, 402],
    [546, 330, 472, 402], [546, 330, 620, 402],
    [172, 446, 138, 502], [172, 446, 208, 502],
    [320, 446, 288, 502], [320, 446, 358, 502],
  ];
  const treeEdgeEls = treeLines.map(([x1, y1, x2, y2]) =>
    svgEl('line', {
      x1: String(x1),
      y1: String(y1),
      x2: String(x2),
      y2: String(y2),
      stroke: P.sepia,
      'stroke-width': '2',
      opacity: '0.45',
    }, actTree),
  );

  const makeNodeBox = (parent, cx, cy, w, h, title, sub, stroke, fill = P.parchment, dashed = false) => {
    const g = svgEl('g', { transform: `translate(${cx}, ${cy})` }, parent);
    svgEl('rect', {
      x: String(-w / 2),
      y: String(-h / 2),
      width: String(w),
      height: String(h),
      rx: '10',
      fill,
      stroke,
      'stroke-width': '2',
      'stroke-dasharray': dashed ? '6 4' : null,
    }, g);
    svgEl('text', {
      x: '0',
      y: sub ? '-7' : '1',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: P.ink,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': sub ? '13' : '12',
      'font-weight': '700',
      textContent: title,
    }, g);
    if (sub) {
      svgEl('text', {
        x: '0',
        y: '12',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: stroke,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '11.5',
        'font-weight': '600',
        textContent: sub,
      }, g);
    }
    return g;
  };

  const treeLvl0 = makeNodeBox(actTree, 396, 178, 256, 52, 'Active Group G (8 pairs)', 'Total weight w = 4', P.brass, '#FDF5DF');
  const treeLvl1L = makeNodeBox(actTree, 246, 306, 210, 48, 'Left Half (4 pairs)', 'Weigh → wₗ = 3', P.sage, '#EBF5EF');
  const treeLvl1R = makeNodeBox(actTree, 546, 306, 210, 48, 'Right Half (4 pairs)', 'Free: 4 − 3 = 1', P.brass, '#FDF8EC', true);

  const treeLvl2 = [
    makeNodeBox(actTree, 172, 424, 128, 44, '2 pairs', 'w = 2', P.sage),
    makeNodeBox(actTree, 320, 424, 128, 44, '2 pairs', 'w = 1', P.brass, P.parchment, true),
    makeNodeBox(actTree, 472, 424, 128, 44, '2 pairs', 'w = 1', P.sage),
    makeNodeBox(actTree, 620, 424, 128, 44, '2 pairs', 'w = 0 (drop)', P.muted, '#F3EEE4', true),
  ];

  const treeLvl3 = [
    addScrim(actTree, 'pair w=2', { x: 138, y: 520, fontSize: 11, fontFamily: 'mono', fontWeight: 700, color: P.brass, stroke: P.brass }),
    addScrim(actTree, 'pair w=0', { x: 214, y: 520, fontSize: 11, fontFamily: 'mono', fontWeight: 600, color: P.muted, stroke: P.muted }),
    addScrim(actTree, 'pair w=1', { x: 294, y: 520, fontSize: 11, fontFamily: 'mono', fontWeight: 700, color: P.delft, stroke: P.delft }),
    addScrim(actTree, 'pair w=0', { x: 370, y: 520, fontSize: 11, fontFamily: 'mono', fontWeight: 600, color: P.muted, stroke: P.muted }),
  ];

  const treeRightG = svgEl('g', { id: 's09_tree_right' }, actTree);
  svgEl('line', { x1: '770', y1: '152', x2: '770', y2: '536', stroke: P.sepia, 'stroke-width': '1.2', 'stroke-dasharray': '5 5', opacity: '0.32' }, treeRightG);

  svgEl('text', {
    x: '995',
    y: '176',
    'text-anchor': 'middle',
    fill: P.brass,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '13',
    'font-weight': '700',
    'letter-spacing': '0.08em',
    textContent: 'ONE MEASUREMENT PER SPLIT',
  }, treeRightG);

  addScrim(treeRightG, 'w(Right)  =  w(Parent) − w(Left)', {
    x: 995,
    y: 222,
    fontSize: 15,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.ink,
    fill: '#FDF5DF',
    stroke: P.brass,
    padX: 16,
    padY: 8,
  });

  svgEl('text', {
    x: '995',
    y: '280',
    'text-anchor': 'middle',
    fill: P.sepia,
    'font-family': "'Plus Jakarta Sans', sans-serif",
    'font-size': '15',
    textContent: 'Depth:  log₂ n halving levels',
  }, treeRightG);
  svgEl('text', {
    x: '995',
    y: '310',
    'text-anchor': 'middle',
    fill: P.sage,
    'font-family': "'Plus Jakarta Sans', sans-serif",
    'font-size': '15',
    'font-weight': '700',
    textContent: 'Width:  ≤ n active groups at EVERY level',
  }, treeRightG);

  const treeNaiveWarn = svgEl('g', { id: 's09_tree_warn' }, treeRightG);
  svgEl('rect', {
    x: '820',
    y: '356',
    width: '350',
    height: '122',
    rx: '14',
    fill: '#FBECE8',
    stroke: P.terracotta,
    'stroke-width': '2',
  }, treeNaiveWarn);
  svgEl('text', {
    x: '995',
    y: '390',
    'text-anchor': 'middle',
    fill: P.terracotta,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '12.5',
    'font-weight': '700',
    'letter-spacing': '0.07em',
    textContent: 'SPLITTING ONE BY ONE (SEQUENTIAL)',
  }, treeNaiveWarn);
  svgEl('text', {
    x: '995',
    y: '430',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '700',
    textContent: 'O(n log n) queries',
  }, treeNaiveWarn);
  svgEl('text', {
    x: '995',
    y: '460',
    'text-anchor': 'middle',
    fill: P.sepia,
    'font-family': "'Plus Jakarta Sans', sans-serif",
    'font-size': '13',
    textContent: 'Still too slow — we must weigh halves in parallel!',
  }, treeNaiveWarn);

  // =========================================================================
  // ACT 3B (Beat 4): ADAPTIVE HALF SELECTION & SUPER-COIN BATCHING ON SCALE
  // =========================================================================
  const actAdapt = svgEl('g', { id: 's09_act_adapt' }, svg);
  svgEl('ellipse', { cx: '640', cy: '310', rx: '480', ry: '205', fill: 'url(#s09_sun)' }, actAdapt);

  svgEl('text', {
    x: '640',
    y: '78',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Super-Coins & Adaptive Half Selection',
  }, actAdapt);

  const slotStartX = 104;
  const slotStep = 64;
  const drawSlotStrip = (parent, yCenter, count, highlights = {}) => {
    for (let s = 0; s < count; s++) {
      const cx = slotStartX + s * slotStep;
      const hl = highlights[s];
      svgEl('rect', {
        x: String(cx - 23),
        y: String(yCenter - 18),
        width: '46',
        height: '36',
        rx: '7',
        fill: hl ? hl.fill : P.parchment,
        stroke: hl ? hl.stroke : 'rgba(107, 94, 84, 0.3)',
        'stroke-width': hl ? '2.2' : '1.2',
      }, parent);
      svgEl('text', {
        x: String(cx),
        y: String(yCenter + 1),
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: hl ? hl.text : P.sepia,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '13',
        'font-weight': '700',
        textContent: String(s),
      }, parent);
    }
  };

  const drawPairArc = (parent, s1, s2, yBase, arcH, col, dashed = false) => {
    const x1 = slotStartX + s1 * slotStep;
    const x2 = slotStartX + s2 * slotStep;
    return svgEl('path', {
      d: `M ${x1} ${yBase} Q ${(x1 + x2) / 2} ${yBase - arcH} ${x2} ${yBase}`,
      fill: 'none',
      stroke: col,
      'stroke-width': '3.4',
      'stroke-linecap': 'round',
      'stroke-dasharray': dashed ? '6 4' : null,
    }, parent);
  };

  // Top lane: Rigid Left Half -> Collision!
  const rigidLane = svgEl('g', { id: 's09_rigid_lane' }, actAdapt);
  svgEl('text', {
    x: '82',
    y: '122',
    fill: P.terracotta,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '13',
    'font-weight': '700',
    textContent: '✗  RIGID LEFT HALF (FREEZING FIRST HALF CAUSES SLOT COLLISIONS)',
  }, rigidLane);

  const rigidHL = {
    0: { fill: '#E4F0F7', stroke: P.delft, text: P.delft },
    1: { fill: '#E4F0F7', stroke: P.delft, text: P.delft },
    4: { fill: '#FBE4DF', stroke: P.cinnabar, text: P.cinnabar },
    5: { fill: '#E4F0F7', stroke: P.delft, text: P.delft },
    6: { fill: '#EBF5EF', stroke: P.sage, text: P.sage },
    9: { fill: '#FBE4DF', stroke: P.cinnabar, text: P.cinnabar },
    10: { fill: '#E4F0F7', stroke: P.delft, text: P.delft },
    11: { fill: '#EBF5EF', stroke: P.sage, text: P.sage },
  };
  drawSlotStrip(rigidLane, 186, 12, rigidHL);
  drawPairArc(rigidLane, 0, 1, 166, 30, P.delft);
  drawPairArc(rigidLane, 4, 5, 166, 30, P.delft);
  drawPairArc(rigidLane, 9, 10, 166, 30, P.delft);
  drawPairArc(rigidLane, 4, 6, 206, -34, P.cinnabar, true);
  drawPairArc(rigidLane, 9, 11, 206, -34, P.cinnabar, true);

  const rigidCollisionBadge = addScrim(rigidLane, '✗ Collision on Slots 4 & 9 — Cannot toggle together!', {
    x: 456,
    y: 252,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.cinnabar,
    fill: '#FBECE8',
    stroke: P.cinnabar,
    strokeWidth: 1.5,
  });

  // Bottom lane: Adaptive Free-Slot Half -> Super-Coins wired into Brass Scale!
  const adaptLane = svgEl('g', { id: 's09_adapt_lane' }, actAdapt);
  svgEl('text', {
    x: '82',
    y: '306',
    fill: P.sage,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '13',
    'font-weight': '700',
    textContent: '✓  ADAPTIVE FREE-SLOT HALF  →  EACH HALF-SUBSET = 1 "SUPER-COIN" IN A DISJOINT BATCH',
  }, adaptLane);

  const adaptHL = {
    0: { fill: '#E4F0F7', stroke: P.delft, text: P.delft },
    1: { fill: '#E4F0F7', stroke: P.delft, text: P.delft },
    2: { fill: '#EBF5EF', stroke: P.sage, text: P.sage },
    3: { fill: '#EBF5EF', stroke: P.sage, text: P.sage },
    4: { fill: '#E4F0F7', stroke: P.delft, text: P.delft },
    5: { fill: '#E4F0F7', stroke: P.delft, text: P.delft },
    6: { fill: '#FDF5DF', stroke: P.brass, text: P.brass },
    7: { fill: '#FDF5DF', stroke: P.brass, text: P.brass },
    8: { fill: '#FDF5DF', stroke: P.brass, text: P.brass },
    9: { fill: '#EBF5EF', stroke: P.sage, text: P.sage },
    10: { fill: '#EBF5EF', stroke: P.sage, text: P.sage },
    11: { fill: '#FDF5DF', stroke: P.brass, text: P.brass },
  };
  drawSlotStrip(adaptLane, 384, 12, adaptHL);

  // 3 disjoint Super-Coins
  const sc1G = svgEl('g', { id: 's09_sc1' }, adaptLane);
  drawPairArc(sc1G, 0, 1, 364, 34, P.delft);
  drawPairArc(sc1G, 4, 5, 364, 34, P.delft);

  const sc2G = svgEl('g', { id: 's09_sc2' }, adaptLane);
  drawPairArc(sc2G, 2, 3, 364, 34, P.sage);
  drawPairArc(sc2G, 9, 10, 364, 34, P.sage);

  const sc3G = svgEl('g', { id: 's09_sc3' }, adaptLane);
  drawPairArc(sc3G, 6, 7, 404, -34, P.brass);
  drawPairArc(sc3G, 8, 11, 404, -40, P.brass);

  // Three Super-Coin toggle pills below the slot strip
  const scPill1 = addScrim(adaptLane, 'Super-Coin 1 (Blue): ON', {
    x: 196,
    y: 472,
    fontSize: 12.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.delft,
    fill: '#E4F0F7',
    stroke: P.delft,
    strokeWidth: 1.6,
  });
  const scPill2 = addScrim(adaptLane, 'Super-Coin 2 (Sage): ON', {
    x: 452,
    y: 472,
    fontSize: 12.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sage,
    fill: '#EBF5EF',
    stroke: P.sage,
    strokeWidth: 1.6,
  });
  const scPill3 = addScrim(adaptLane, 'Super-Coin 3 (Gold): OFF', {
    x: 706,
    y: 472,
    fontSize: 12.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.muted,
    fill: P.parchment,
    stroke: P.brass,
    strokeWidth: 1.4,
  });

  // Right: Brass Scale receiving the simultaneous Super-Coin subset weighing!
  const scScaleWrap = svgEl('g', { id: 's09_sc_scale_wrap' }, adaptLane);
  svgEl('path', {
    d: 'M 848 384 L 972 384',
    fill: 'none',
    stroke: P.brass,
    'stroke-width': '3.4',
    'marker-end': 'url(#s09_arr_brass)',
  }, scScaleWrap);
  addScrim(scScaleWrap, '1 Move', {
    x: 910,
    y: 356,
    fontSize: 12,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.brass,
    stroke: P.brass,
    shadow: false,
  });

  const scScale = bottles.createSvgBrassScale({
    x: 1084,
    y: 392,
    radius: 56,
    maxVal: 6,
    initialVal: 0,
    unit: '',
  });
  scScaleWrap.appendChild(scScale);

  const scScaleLabel = addScrim(scScaleWrap, 'SC1 + SC2 ON → Combined f = 3', {
    x: 1084,
    y: 256,
    fontSize: 12.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.ink,
    fill: '#FDF5DF',
    stroke: P.brass,
    minWidth: 248,
    padX: 10,
    padY: 5,
  });

  const adaptFooter = addScrim(
    adaptLane,
    'Zero Slot Overlap  ⇒  Toggle Any Subset of m Super-Coins Together in 1 Weighing!',
    {
      x: 520,
      y: 534,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.sage,
      fill: '#EBF5EF',
      stroke: P.sage,
      strokeWidth: 1.5,
      padX: 16,
      padY: 6,
    },
  );

  // =========================================================================
  // ACT 3C (Beat 5): QUARTER-TABLE OCCUPANCY & (3/4)^2 = 9/16 > 1/2 PROOF
  // =========================================================================
  const actQuarter = svgEl('g', { id: 's09_act_quarter' }, svg);
  svgEl('ellipse', { cx: '640', cy: '310', rx: '480', ry: '205', fill: 'url(#s09_sun)' }, actQuarter);

  svgEl('text', {
    x: '640',
    y: '78',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Why m = Θ(2ʳ) Disjoint Super-Coins Fit in One Batch',
  }, actQuarter);

  svgEl('rect', { x: '160', y: '140', width: '960', height: '54', rx: '12', fill: '#EBF5EF', stroke: P.sage, 'stroke-width': '2' }, actQuarter);
  svgEl('rect', { x: '160', y: '140', width: '240', height: '54', rx: '12', fill: '#F9DFD9', stroke: P.terracotta, 'stroke-width': '2.2' }, actQuarter);
  svgEl('line', { x1: '400', y1: '126', x2: '400', y2: '208', stroke: P.ink, 'stroke-width': '2', 'stroke-dasharray': '5 4' }, actQuarter);

  svgEl('text', {
    x: '280',
    y: '168',
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    fill: P.terracotta,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '15',
    'font-weight': '700',
    textContent: '≤ 1/4 USED',
  }, actQuarter);
  svgEl('text', {
    x: '760',
    y: '168',
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    fill: P.sage,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '16',
    'font-weight': '700',
    textContent: '≥ 3/4 OF TABLE SLOTS REMAIN FREE (75%)',
  }, actQuarter);

  const qProbG = svgEl('g', { id: 's09_q_prob' }, actQuarter);
  svgEl('rect', {
    x: '160',
    y: '232',
    width: '960',
    height: '134',
    rx: '16',
    fill: P.parchment,
    stroke: P.brass,
    'stroke-width': '2',
  }, qProbG);
  svgEl('text', {
    x: '640',
    y: '264',
    'text-anchor': 'middle',
    fill: P.sepia,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '13.5',
    'font-weight': '600',
    textContent: 'For any candidate pair (u, v) in a randomly ordered active group:',
  }, qProbG);
  svgEl('text', {
    x: '640',
    y: '312',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '36',
    'font-weight': '700',
    textContent: 'P(both u and v free)  ≥  (3/4)²  =  9/16  =  56.25%  >  1/2',
  }, qProbG);
  svgEl('text', {
    x: '640',
    y: '346',
    'text-anchor': 'middle',
    fill: P.sage,
    'font-family': "'Plus Jakarta Sans', sans-serif",
    'font-size': '15',
    'font-weight': '600',
    textContent: "Over half the group's pairs stay free — so we can always carve a valid disjoint half!",
  }, qProbG);

  const qBatchG = svgEl('g', { id: 's09_q_batch' }, actQuarter);
  const blockLabels = ['SC₁', 'SC₂', 'SC₃', 'SC₄', '…', 'SCₘ'];
  const blockCols = [P.delft, P.sage, P.brass, P.plum, P.sepia, P.terracotta];
  blockLabels.forEach((lbl, idx) => {
    const bx = 189 + idx * 68;
    svgEl('rect', {
      x: String(bx - 29),
      y: '404',
      width: '58',
      height: '44',
      rx: '9',
      fill: P.parchment,
      stroke: blockCols[idx],
      'stroke-width': '2.2',
    }, qBatchG);
    svgEl('text', {
      x: String(bx),
      y: '427',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: blockCols[idx],
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '14',
      'font-weight': '700',
      textContent: lbl,
    }, qBatchG);
  });

  addScrim(qBatchG, '(n/4 slots) ÷ (n/2ʳ per half) = m = Θ(2ʳ) super-coins!', {
    x: 868,
    y: 426,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.ink,
    fill: '#FDF5DF',
    stroke: P.brass,
    strokeWidth: 1.8,
    padX: 12,
    padY: 10,
  });

  addScrim(qBatchG, 'At halving level r, each Lindström batch packs m = Θ(2ʳ) disjoint super-coins at once', {
    x: 640,
    y: 516,
    fontSize: 14.5,
    fontFamily: 'body',
    fontWeight: 600,
    color: P.sepia,
    stroke: 'rgba(107, 94, 84, 0.25)',
    padX: 18,
    padY: 7,
  });

  // =========================================================================
  // ACT 4A (Beat 6): DUAL-TRACK SUPER-COIN DECODER
  // =========================================================================
  const actDecode = svgEl('g', { id: 's09_act_decode' }, svg);
  svgEl('ellipse', { cx: '640', cy: '310', rx: '480', ry: '205', fill: 'url(#s09_sun)' }, actDecode);

  svgEl('text', {
    x: '640',
    y: '78',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Decoding a Batch of m = Θ(2ʳ) Super-Coins',
  }, actDecode);

  const decInput = svgEl('g', { transform: 'translate(198, 312)' }, actDecode);
  svgEl('rect', { x: '-114', y: '-68', width: '228', height: '136', rx: '14', fill: P.parchment, stroke: P.ink, 'stroke-width': '2' }, decInput);
  svgEl('text', { x: '0', y: '-32', 'text-anchor': 'middle', fill: P.brass, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12', 'font-weight': '700', textContent: 'SUPER-COIN BATCH' }, decInput);
  svgEl('text', { x: '0', y: '4', 'text-anchor': 'middle', fill: P.ink, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '26', 'font-weight': '700', textContent: 'm = Θ(2ʳ)' }, decInput);
  svgEl('text', { x: '0', y: '34', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '13.5', textContent: 'disjoint super-coins' }, decInput);

  svgEl('path', { d: 'M 314 282 C 368 282, 368 214, 424 214', fill: 'none', stroke: P.sage, 'stroke-width': '3', 'marker-end': 'url(#s09_arr_sage)' }, actDecode);
  svgEl('path', { d: 'M 314 342 C 368 342, 368 408, 424 408', fill: 'none', stroke: P.delft, 'stroke-width': '3', 'marker-end': 'url(#s09_arr_delft)' }, actDecode);

  const trackTop = svgEl('g', { id: 's09_track_top' }, actDecode);
  svgEl('rect', { x: '434', y: '154', width: '434', height: '118', rx: '14', fill: '#EBF5EF', stroke: P.sage, 'stroke-width': '2.2' }, trackTop);
  svgEl('text', { x: '651', y: '186', 'text-anchor': 'middle', fill: P.sage, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12.5', 'font-weight': '700', textContent: 'WEIGHT-1 GROUPS · STRICT 0/1 SUPER-COINS' }, trackTop);
  svgEl('text', { x: '651', y: '219', 'text-anchor': 'middle', fill: P.ink, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '23', 'font-weight': '700', textContent: 'Lindström Recursive Matrix Dₖ' }, trackTop);
  svgEl('text', { x: '651', y: '248', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '13', 'font-weight': '600', textContent: 'Exact decoding in O(m / log m) queries' }, trackTop);

  const trackBot = svgEl('g', { id: 's09_track_bot' }, actDecode);
  svgEl('rect', { x: '434', y: '348', width: '434', height: '118', rx: '14', fill: '#EAF2F8', stroke: P.delft, 'stroke-width': '2.2' }, trackBot);
  svgEl('text', { x: '651', y: '380', 'text-anchor': 'middle', fill: P.delft, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12.5', 'font-weight': '700', textContent: 'WEIGHT ≥ 2 GROUPS · MULTI-VALUE (0, 1, 2, …)' }, trackBot);
  svgEl('text', { x: '651', y: '413', 'text-anchor': 'middle', fill: P.ink, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '23', 'font-weight': '700', textContent: 'Sparse Random {0,1} Weighings' }, trackBot);
  svgEl('text', { x: '651', y: '442', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '13', 'font-weight': '600', textContent: 'Same O(m / log m) compression factor' }, trackBot);

  svgEl('path', { d: 'M 870 214 C 924 214, 924 294, 976 294', fill: 'none', stroke: P.sage, 'stroke-width': '3', 'marker-end': 'url(#s09_arr_sage)' }, actDecode);
  svgEl('path', { d: 'M 870 408 C 924 408, 924 334, 976 334', fill: 'none', stroke: P.delft, 'stroke-width': '3', 'marker-end': 'url(#s09_arr_delft)' }, actDecode);

  const decScale = bottles.createSvgBrassScale({
    x: 1086,
    y: 326,
    radius: 60,
    maxVal: 5,
    initialVal: 0,
    unit: '',
  });
  actDecode.appendChild(decScale);

  const decFooter = addScrim(actDecode, 'Both tracks compress level r by the exact same log m factor: O(m / log m)!', {
    x: 640,
    y: 526,
    fontSize: 14.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.ink,
    fill: '#FDF5DF',
    stroke: P.brass,
    strokeWidth: 1.5,
    padX: 18,
    padY: 8,
  });

  // =========================================================================
  // ACT 4B (Beats 7-8): COMPRESSION FACTOR r & SUNLIT HARMONIC STAIRCASE
  // =========================================================================
  const actStairs = svgEl('g', { id: 's09_act_stairs' }, svg);
  svgEl('ellipse', { cx: '640', cy: '320', rx: '480', ry: '215', fill: 'url(#s09_sun)' }, actStairs);

  svgEl('text', {
    x: '640',
    y: '78',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'The Harmonic Staircase · Expected Big-O Upper Bound',
  }, actStairs);

  const compBanner = addScrim(
    actStairs,
    'O(m / log m) per batch  =  O(1 / r) per active group   ⇒   Level r Cost = O(n / r)',
    {
      x: 640,
      y: 118,
      fontSize: 14,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.ink,
      fill: '#FDF5DF',
      stroke: P.brass,
      strokeWidth: 1.5,
      padX: 18,
      padY: 7,
    },
  );

  const baseStairY = 486;
  const stairStartX = 166;
  const barW = 122;
  const barGap = 38;
  const maxBarH = 274;

  const nlognShadow = svgEl('g', { id: 's09_nlogn_shadow' }, actStairs);
  svgEl('rect', {
    x: String(stairStartX - 10),
    y: String(baseStairY - maxBarH),
    width: String(6 * barW + 5 * barGap + 20),
    height: String(maxBarH),
    rx: '8',
    fill: P.linen,
    stroke: P.sepia,
    'stroke-width': '1.6',
    'stroke-dasharray': '7 6',
    opacity: '0.68',
  }, nlognShadow);
  addScrim(nlognShadow, 'Classical O(n log n) ceiling (flat O(n) per level)', {
    x: stairStartX + 6 * barW + 5 * barGap - 160,
    y: baseStairY - maxBarH - 18,
    fontSize: 12.5,
    fontFamily: 'mono',
    fontWeight: 600,
    color: P.sepia,
    stroke: 'rgba(107, 94, 84, 0.28)',
    shadow: false,
  });

  svgEl('line', { x1: '132', y1: String(baseStairY), x2: '1148', y2: String(baseStairY), stroke: P.ink, 'stroke-width': '2', opacity: '0.75' }, actStairs);

  const stairRounds = [
    { r: 'r = 1', batch: '2¹ super-coins', cost: '2n / 1', frac: 1.0 },
    { r: 'r = 2', batch: '2² super-coins', cost: '2n / 2', frac: 1 / 2 },
    { r: 'r = 3', batch: '2³ super-coins', cost: '2n / 3', frac: 1 / 3 },
    { r: 'r = 4', batch: '2⁴ super-coins', cost: '2n / 4', frac: 1 / 4 },
    { r: 'r = 5', batch: '2⁵ super-coins', cost: '2n / 5', frac: 1 / 5 },
    { r: 'r = log₂ n', batch: 'n/4 super-coins', cost: '2n / log₂ n', frac: 1 / 6 },
  ];

  const stairBars = [];
  stairRounds.forEach((sr, i) => {
    const bx = stairStartX + i * (barW + barGap);
    const bh = Math.round(maxBarH * sr.frac);
    const bg = svgEl('g', { class: `s09-bar-${i}` }, actStairs);

    svgEl('rect', {
      x: String(bx),
      y: String(baseStairY - bh),
      width: String(barW),
      height: String(bh),
      rx: '7',
      fill: 'url(#s09_bar)',
      stroke: P.ink,
      'stroke-width': '1.8',
    }, bg);

    addScrim(bg, sr.cost, {
      x: bx + barW / 2,
      y: baseStairY - bh - 18,
      fontSize: i === 5 ? 12.5 : 14.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.terracotta,
      stroke: 'rgba(217, 93, 72, 0.3)',
      padX: 8,
      padY: 3,
      shadow: false,
    });

    svgEl('text', {
      x: String(bx + barW / 2),
      y: String(baseStairY + 24),
      'text-anchor': 'middle',
      fill: P.ink,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '13',
      'font-weight': '700',
      textContent: sr.r,
    }, bg);
    svgEl('text', {
      x: String(bx + barW / 2),
      y: String(baseStairY + 46),
      'text-anchor': 'middle',
      fill: P.sepia,
      'font-family': "'Fraunces', Georgia, serif",
      'font-style': 'italic',
      'font-size': '12.5',
      textContent: sr.batch,
    }, bg);

    stairBars.push(bg);
  });

  const resultEmblemOuter = svgEl('g', { transform: 'translate(840, 294)' }, actStairs);
  const resultEmblem = svgEl('g', { id: 's09_result_emblem' }, resultEmblemOuter);
  svgEl('rect', {
    x: '-244',
    y: '-80',
    width: '488',
    height: '150',
    rx: '16',
    fill: '#FFFBF2',
    'fill-opacity': '0.96',
    stroke: P.brass,
    'stroke-width': '2.2',
  }, resultEmblem);
  svgEl('text', {
    x: '0',
    y: '-54',
    'text-anchor': 'middle',
    fill: P.brass,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '12',
    'font-weight': '700',
    'letter-spacing': '0.1em',
    textContent: 'EXPECTED BIG-O UPPER BOUND',
  }, resultEmblem);
  svgEl('text', {
    x: '0',
    y: '-28',
    'text-anchor': 'middle',
    fill: P.sepia,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '13.5',
    'font-weight': '600',
    textContent: 'n · (1/1 + 1/2 + 1/3 + … + 1/log₂ n)',
  }, resultEmblem);
  svgEl('text', {
    x: '0',
    y: '30',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '50',
    'font-weight': '700',
    textContent: 'O(n log log n)',
  }, resultEmblem);
  svgEl('line', { x1: '-185', y1: '52', x2: '185', y2: '52', stroke: P.brass, 'stroke-width': '3', 'stroke-linecap': 'round' }, resultEmblem);

  // =========================================================================
  // MASTER AUDIO-SYNCED BIDIRECTIONAL GSAP TIMELINE
  // =========================================================================
  const tl = gsap.timeline({ paused: true });

  // Helper to animate ALL 6 bottles simultaneously into a target permutation on the Act 2 table
  const moveRRBottlesTo = (perm, atTime, dur = 1.35) => {
    for (let slot = 0; slot < 6; slot++) {
      const bId = perm[slot];
      const targetX = rrXs[slot];
      const peakY = rrTableY - 70 - (bId % 3) * 20;
      const tilt = slot > bId ? 8 : slot < bId ? -8 : 0;
      const wrap = rrBottles[bId].wrap;
      tl.to(wrap, { y: peakY, rotation: tilt, duration: dur * 0.48, ease: 'power2.out' }, atTime);
      tl.to(wrap, { x: targetX, duration: dur, ease: 'power2.inOut' }, atTime);
      tl.to(wrap, { y: rrTableY - 4, rotation: 0, duration: dur * 0.52, ease: 'back.out(1.35)' }, atTime + dur * 0.48);
    }
  };

  // Deterministic UI text proxy for scrubbing safety
  const uiState = { rrMode: 0, scMode: 0 };
  const RR_CAPTIONS = [
    { line: 'Baseline p₀: [0, 1, 2, 3, 4, 5]  ·  Ready for Full-Table Round 1', scale: 'Combined Round Weight: f = 0' },
    { line: 'Round 1 (1 Move): [0,1,2,3,4,5] → [1,0,3,2,5,4]  (All 3 pairs!)', scale: 'Round 1 Weight: f = 4  (ACTIVE!)' },
    { line: 'Round 2 (1 Move): [0,1,2,3,4,5] → [2,5,0,4,3,1]  (All 3 pairs!)', scale: 'Round 2 Weight: f = 1  (ACTIVE!)' },
    { line: 'Round 3 (1 Move): [0,1,2,3,4,5] → [3,4,5,0,1,2]  (All 3 pairs!)', scale: 'Round 3 Weight: f = 1  (ACTIVE!)' },
    { line: 'Round 4 (1 Move): [0,1,2,3,4,5] → [4,2,1,5,0,3]  (All 3 pairs!)', scale: 'Round 4 Weight: f = 0  (DROP ALL 3!)' },
    { line: 'Round 5 (1 Move): [0,1,2,3,4,5] → [5,3,4,1,2,0]  (All 3 pairs!)', scale: 'Round 5 Weight: f = 0  (DROP ALL 3!)' },
  ];

  function syncUI() {
    const rm = Math.max(0, Math.min(RR_CAPTIONS.length - 1, Math.round(uiState.rrMode)));
    rrLineupPill.setText(RR_CAPTIONS[rm].line);
    rrScaleReadout.setText(RR_CAPTIONS[rm].scale);

    const sm = Math.round(uiState.scMode);
    if (sm === 0) {
      scPill1.setText('Super-Coin 1 (Blue): ON');
      scPill2.setText('Super-Coin 2 (Sage): ON');
      scPill3.setText('Super-Coin 3 (Gold): OFF');
      scScaleLabel.setText('SC1 + SC2 ON → Combined f = 3');
    } else {
      scPill1.setText('Super-Coin 1 (Blue): ON');
      scPill2.setText('Super-Coin 2 (Sage): OFF');
      scPill3.setText('Super-Coin 3 (Gold): ON');
      scScaleLabel.setText('SC1 + SC3 ON → Combined f = 2');
    }
  }

  // Initial states at t = 0
  tl.set(uiState, { rrMode: 0, scMode: 0, onUpdate: syncUI }, 0);
  tl.set(rrScale._state, { val: 0, onUpdate: () => rrScale.setValue(rrScale._state.val) }, 0);
  tl.set(scScale._state, { val: 0, onUpdate: () => scScale.setValue(scScale._state.val) }, 0);
  tl.set(decScale._state, { val: 0, onUpdate: () => decScale.setValue(decScale._state.val) }, 0);

  tl.set(actSumN, { autoAlpha: 1 }, 0);
  tl.set(b0SubPill, { autoAlpha: 0 }, 0);
  tl.set(b0Arrows, { strokeDashoffset: 900 }, 0);
  tl.set(b0WeightPills, { autoAlpha: 0 }, 0);
  tl.set(b0SumPill, { autoAlpha: 0 }, 0);

  tl.set(actTourney, { autoAlpha: 0 }, 0);
  tl.set(rrHeroBanner, { autoAlpha: 0 }, 0);
  tl.set(rrArcLayers, { autoAlpha: 0 }, 0);
  tl.set(rrZeroStamp, { autoAlpha: 0 }, 0);
  tl.set(ledgerRows, { autoAlpha: 0.2 }, 0);
  tl.set(ledgerBadges, { autoAlpha: 0 }, 0);
  tl.set(ledgerStrikes, { autoAlpha: 0 }, 0);
  tl.set(rrFooterActive, { autoAlpha: 0 }, 0);
  rrBottles.forEach(({ wrap }, i) => {
    tl.set(wrap, { x: rrXs[i], y: rrTableY - 4, rotation: 0 }, 0);
  });

  tl.set(actTree, { autoAlpha: 0 }, 0);
  tl.set(treeInvariantRibbon, { autoAlpha: 0 }, 0);
  tl.set(treeEdgeEls, { autoAlpha: 0 }, 0);
  tl.set([treeLvl0, treeLvl1L, treeLvl1R, ...treeLvl2, ...treeLvl3], { autoAlpha: 0 }, 0);
  tl.set([treeRightG, treeNaiveWarn], { autoAlpha: 0 }, 0);

  tl.set(actAdapt, { autoAlpha: 0 }, 0);
  tl.set([rigidLane, rigidCollisionBadge, adaptLane, sc1G, sc2G, sc3G, scPill1, scPill2, scPill3, scScaleWrap, adaptFooter], { autoAlpha: 0 }, 0);

  tl.set(actQuarter, { autoAlpha: 0 }, 0);
  tl.set([qProbG, qBatchG], { autoAlpha: 0, y: 14 }, 0);

  tl.set(actDecode, { autoAlpha: 0 }, 0);
  tl.set([trackTop, trackBot, decFooter], { autoAlpha: 0 }, 0);

  tl.set(actStairs, { autoAlpha: 0 }, 0);
  tl.set(compBanner, { autoAlpha: 0 }, 0);
  tl.set(nlognShadow, { autoAlpha: 0 }, 0);
  tl.set(stairBars, { autoAlpha: 0, scaleY: 0.08, transformOrigin: 'center bottom' }, 0);
  tl.set(resultEmblem, { autoAlpha: 0, y: 16 }, 0);

  // --- BEAT 0: Baseline p0 & Total Pair Weight = n ---
  tl.to(b0SubPill, { autoAlpha: 1, duration: 0.6 }, b0.start + 0.8);
  tl.to(b0Arrows, { strokeDashoffset: 0, duration: 1.5, stagger: 0.5, ease: 'power2.inOut' }, b0.start + b0.dur * 0.25);
  tl.to(b0WeightPills, { autoAlpha: 1, duration: 0.55, stagger: 0.35, ease: 'power2.out' }, b0.start + b0.dur * 0.45);
  tl.to(b0SumPill, { autoAlpha: 1, duration: 0.75, ease: 'power2.out' }, b0.start + b0.dur * 0.72);

  // --- BEAT 1: Full-Table Simultaneous Round-Robin Swaps! ---
  tl.to(actSumN, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b1.start - 0.15);
  tl.to(actTourney, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b1.start + 0.2);
  tl.to(rrHeroBanner, { autoAlpha: 1, duration: 0.6 }, b1.start + 1.0);

  // Round 1: ALL 3 DISJOINT PAIRS (0<->1), (2<->3), (4<->5) SWAP AT THE EXACT SAME INSTANT!
  const r1T = b1.start + b1.dur * 0.22;
  tl.to(rrArcLayers[0], { autoAlpha: 1, duration: 0.45 }, r1T);
  tl.to(ledgerRows[0], { autoAlpha: 1, duration: 0.45 }, r1T);
  tl.to(uiState, { rrMode: 1, duration: 0.01, onUpdate: syncUI }, r1T + 0.5);
  moveRRBottlesTo(RR_ROUNDS[0].perm, r1T + 0.6, 1.5);
  bottles.setScaleValue(rrScale, 4, tl, r1T + 2.15, 0.75);

  // Reset to p0, then demonstrate Round 2 simultaneous full-table swap
  const r2T = b1.start + b1.dur * 0.54;
  tl.to(rrArcLayers[0], { autoAlpha: 0, duration: 0.3 }, r2T - 0.9);
  moveRRBottlesTo([0, 1, 2, 3, 4, 5], r2T - 0.85, 0.7);
  bottles.setScaleValue(rrScale, 0, tl, r2T - 0.7, 0.45);
  tl.to(rrArcLayers[1], { autoAlpha: 1, duration: 0.4 }, r2T);
  tl.to(ledgerRows[1], { autoAlpha: 1, duration: 0.4 }, r2T);
  tl.to(uiState, { rrMode: 2, duration: 0.01, onUpdate: syncUI }, r2T + 0.3);
  moveRRBottlesTo(RR_ROUNDS[1].perm, r2T + 0.4, 1.35);
  bottles.setScaleValue(rrScale, 1, tl, r2T + 1.8, 0.6);

  // Reveal remaining rounds R3, R4, R5 in ledger
  const rRestT = b1.start + b1.dur * 0.78;
  tl.to(ledgerRows.slice(2), { autoAlpha: 1, duration: 0.45, stagger: 0.35 }, rRestT);

  // --- BEAT 2: Querying Rounds -> Active vs 0-Score Round Discards ALL 3 Pairs in 1 Move! ---
  tl.to(rrArcLayers[1], { autoAlpha: 0, duration: 0.3 }, b2.start + 0.1);
  // Show R1, R2, R3 active badges lighting up
  tl.to(ledgerBadges[0], { autoAlpha: 1, duration: 0.45 }, b2.start + 0.8);
  tl.to(ledgerBadges[1], { autoAlpha: 1, duration: 0.45 }, b2.start + 1.8);
  tl.to(ledgerBadges[2], { autoAlpha: 1, duration: 0.45 }, b2.start + 2.8);

  // Now run 0-score Round 4: (0<->4), (1<->2), (3<->5) ALL swapping simultaneously!
  const r4T = b2.start + b2.dur * 0.28;
  moveRRBottlesTo([0, 1, 2, 3, 4, 5], r4T - 0.9, 0.7);
  tl.to(rrArcLayers[3], { autoAlpha: 1, duration: 0.45 }, r4T);
  tl.to(uiState, { rrMode: 4, duration: 0.01, onUpdate: syncUI }, r4T + 0.3);
  moveRRBottlesTo(RR_ROUNDS[3].perm, r4T + 0.45, 1.4);
  bottles.setScaleValue(rrScale, 0, tl, r4T + 1.9, 0.65);

  // Stamp 0-Score Round -> All n/2 Pairs Discarded in 1 Move! + strike through R4 & R5
  const dropT = r4T + 2.6;
  tl.to(rrZeroStamp, { autoAlpha: 1, duration: 0.55 }, dropT);
  tl.to(ledgerBadges[3], { autoAlpha: 1, duration: 0.45 }, dropT + 0.25);
  tl.to(ledgerStrikes[3], { autoAlpha: 1, duration: 0.4 }, dropT + 0.45);
  tl.to(ledgerRows[3], { autoAlpha: 0.48, duration: 0.5 }, dropT + 0.65);

  tl.to(ledgerBadges[4], { autoAlpha: 1, duration: 0.45 }, dropT + 1.4);
  tl.to(ledgerStrikes[4], { autoAlpha: 1, duration: 0.4 }, dropT + 1.6);
  tl.to(ledgerRows[4], { autoAlpha: 0.48, duration: 0.5 }, dropT + 1.8);

  tl.to(rrFooterActive, { autoAlpha: 1, duration: 0.7 }, b2.start + b2.dur * 0.74);

  // --- BEAT 3: Binary-Search Halving & <= n Active Groups Invariant ---
  tl.to(actTourney, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b3.start - 0.15);
  tl.to(actTree, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b3.start + 0.2);

  tl.to(treeLvl0, { autoAlpha: 1, duration: 0.55 }, b3.start + 0.6);
  tl.to(treeEdgeEls.slice(0, 2), { autoAlpha: 0.45, duration: 0.45 }, b3.start + 1.6);
  tl.to([treeLvl1L, treeLvl1R], { autoAlpha: 1, duration: 0.55, stagger: 0.45 }, b3.start + 1.9);
  tl.to(treeRightG, { autoAlpha: 1, duration: 0.6 }, b3.start + b3.dur * 0.25);
  tl.to(treeEdgeEls.slice(2, 6), { autoAlpha: 0.45, duration: 0.4 }, b3.start + b3.dur * 0.34);
  tl.to(treeLvl2, { autoAlpha: 1, duration: 0.45, stagger: 0.2 }, b3.start + b3.dur * 0.38);
  tl.to(treeInvariantRibbon, { autoAlpha: 1, duration: 0.65 }, b3.start + b3.dur * 0.52);
  tl.to(treeEdgeEls.slice(6), { autoAlpha: 0.45, duration: 0.35 }, b3.start + b3.dur * 0.62);
  tl.to(treeLvl3, { autoAlpha: 1, duration: 0.4, stagger: 0.18 }, b3.start + b3.dur * 0.65);
  tl.to(treeNaiveWarn, { autoAlpha: 1, duration: 0.7, ease: 'back.out(1.4)' }, b3.start + b3.dur * 0.78);

  // --- BEAT 4: Super-Coin Adaptive Batching on Brass Scale ---
  tl.to(actTree, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b4.start - 0.15);
  tl.to(actAdapt, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b4.start + 0.2);

  tl.to(rigidLane, { autoAlpha: 1, duration: 0.6 }, b4.start + 0.6);
  tl.to(rigidCollisionBadge, { autoAlpha: 1, duration: 0.55 }, b4.start + b4.dur * 0.18);

  const adT = b4.start + b4.dur * 0.32;
  tl.to(adaptLane, { autoAlpha: 1, duration: 0.55 }, adT);
  tl.to([sc1G, scPill1], { autoAlpha: 1, duration: 0.5 }, adT + 0.6);
  tl.to([sc2G, scPill2], { autoAlpha: 1, duration: 0.5 }, adT + 1.5);
  tl.to([sc3G, scPill3], { autoAlpha: 1, duration: 0.5 }, adT + 2.4);
  tl.to(scScaleWrap, { autoAlpha: 1, duration: 0.6 }, adT + 3.4);

  // Weighing 1: SC1 + SC2 ON, SC3 OFF -> f = 3
  tl.to(sc3G, { autoAlpha: 0.28, duration: 0.4 }, adT + 4.1);
  tl.to(uiState, { scMode: 0, duration: 0.01, onUpdate: syncUI }, adT + 4.1);
  bottles.setScaleValue(scScale, 3, tl, adT + 4.4, 0.85);

  // Weighing 2: Toggle SC2 OFF, SC3 ON -> f = 2 in ONE simultaneous move!
  const w2T = b4.start + b4.dur * 0.72;
  tl.to(sc2G, { autoAlpha: 0.28, duration: 0.4 }, w2T);
  tl.to(sc3G, { autoAlpha: 1, duration: 0.4 }, w2T);
  tl.to(uiState, { scMode: 1, duration: 0.01, onUpdate: syncUI }, w2T + 0.1);
  bottles.setScaleValue(scScale, 2, tl, w2T + 0.35, 0.8);
  tl.to(adaptFooter, { autoAlpha: 1, duration: 0.65 }, b4.start + b4.dur * 0.82);

  // --- BEAT 5: Quarter-Table Occupancy -> (3/4)^2 = 9/16 > 1/2 -> m = Theta(2^r) ---
  tl.to(actAdapt, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b5.start - 0.15);
  tl.to(actQuarter, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b5.start + 0.2);
  tl.to(qProbG, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out' }, b5.start + b5.dur * 0.22);
  tl.to(qBatchG, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'back.out(1.3)' }, b5.start + b5.dur * 0.55);

  // --- BEAT 6: Dual-Track Super-Coin Decoder ---
  tl.to(actQuarter, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b6.start - 0.15);
  tl.to(actDecode, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b6.start + 0.2);
  tl.to(trackTop, { autoAlpha: 1, duration: 0.65 }, b6.start + 1.0);
  bottles.setScaleValue(decScale, 2, tl, b6.start + b6.dur * 0.22, 0.75);
  tl.to(trackBot, { autoAlpha: 1, duration: 0.65 }, b6.start + b6.dur * 0.42);
  bottles.setScaleValue(decScale, 4, tl, b6.start + b6.dur * 0.56, 0.8);
  tl.to(decFooter, { autoAlpha: 1, duration: 0.65 }, b6.start + b6.dur * 0.76);

  // --- BEAT 7: O(m / log m) = O(1 / r) per group -> O(n / r) at level r ---
  tl.to(actDecode, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b7.start - 0.15);
  tl.to(actStairs, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b7.start + 0.2);
  tl.to(compBanner, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, b7.start + 0.7);
  tl.to(nlognShadow, { autoAlpha: 1, duration: 0.6 }, b7.start + b7.dur * 0.22);
  tl.to(stairBars.slice(0, 3), { autoAlpha: 1, scaleY: 1, duration: 0.75, stagger: 0.65, ease: 'back.out(1.25)' }, b7.start + b7.dur * 0.34);

  // --- BEAT 8: Harmonic Staircase -> Expected Big-O Upper Bound O(n log log n)! ---
  tl.to(stairBars.slice(3), { autoAlpha: 1, scaleY: 1, duration: 0.75, stagger: 0.55, ease: 'back.out(1.25)' }, b8.start + 0.7);
  tl.to(resultEmblem, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'back.out(1.4)' }, b8.start + b8.dur * 0.34);

  // Pad cleanly to full voiceover duration
  tl.to({}, { duration: 0.01 }, Math.max(totalDur - 0.01, b8.end));

  syncUI();

  return {
    timeline: tl,
    destroy() {
      rootEl.innerHTML = '';
    },
  };
}
