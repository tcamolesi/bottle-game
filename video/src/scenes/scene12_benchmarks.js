// Chapter 12: Benchmarks, Literature & The Open Problem
// Sunlit Apothecary Art · 8 Audio-Synced Beats · 106.70s
// Beat Group 1 (Beats 0-2): Full-width Game 2 Chart (n=50..4,000, -37% at 1,000, flat 1.81x n log log n inset)
// Beat Group 2 (Beat 3): Full-width Game 1 Convergence Chart (n=20..2,000 -> 1.055x Yao's n(n-1)/8 limit)
// Beat Group 3 (Beats 4-6): Editorial Literature Timeline (1986 -> 2024 -> FUN 2026 -> This Work) + Honest Proof Notes
// Beat Group 4 (Beat 7): Closing Open Problem ("Can physical bottles ever reach O(n)?") above 6 bottles on veiled '?' coasters

export const sceneMeta = {
  id: 'scene12',
  number: 12,
  title: 'Benchmarks, Literature & The Open Problem',
  chapter: 'Epilogue',
  duration: 106.698,
  beats: [
    {
      id: 's12_b0',
      start: 0.8,
      audioDuration: 9.72,
      end: 11.07,
      text: 'Does O(n log log n) actually beat n log n in practice? Benchmarks up to 4,000 bottles settle the question.',
      highlight: ['O(n log log n)', '4,000 bottles'],
      cue: 'whoosh',
    },
    {
      id: 's12_b1',
      start: 11.07,
      audioDuration: 13.92,
      end: 25.54,
      text: 'Our full-reorder solver peels cleanly below n log n, using 37% fewer queries at 1,000 bottles—6,020 versus 9,575.',
      highlight: ['37% fewer queries', '6,020 versus 9,575'],
      cue: 'bell',
    },
    {
      id: 's12_b2',
      start: 25.54,
      audioDuration: 13.22,
      end: 39.31,
      text: 'Across 4,000 bottles, queries divided by n log n keep falling, while queries divided by n log log n hold flat near 1.81—even on adversarial inputs.',
      highlight: ['keep falling', 'hold flat near 1.81'],
      cue: null,
    },
    {
      id: 's12_b3',
      start: 39.31,
      audioDuration: 14.38,
      end: 54.24,
      text: 'Meanwhile, our randomized single-swap solver converges to 1.055 times Yao\'s exact n(n−1)/8 lower bound at 2,000 bottles, confirming the theory.',
      highlight: ['1.055 times', 'n(n−1)/8 lower bound', '2,000 bottles'],
      cue: 'bell',
    },
    {
      id: 's12_b4',
      start: 54.24,
      audioDuration: 12.48,
      end: 67.27,
      text: 'On the research map, Ko and Teng set the 1986 n log n baseline, while Martinsson and Su reached linear time in 2024 using repeated colors.',
      highlight: ['Ko and Teng', 'Martinsson and Su', 'repeated colors'],
      cue: null,
    },
    {
      id: 's12_b5',
      start: 67.27,
      audioDuration: 13.49,
      end: 81.31,
      text: 'Subercaseaux posed the viral local-swap game at FUN 2026; our work closes single-swap to exact quadratic constants and breaks strict full-reorder down to n log log n.',
      highlight: ['FUN 2026', 'exact quadratic constants', 'n log log n'],
      cue: 'lock',
    },
    {
      id: 's12_b6',
      start: 81.31,
      audioDuration: 13.82,
      end: 95.68,
      text: 'Two formal proof steps remain for our full-reorder theorem: rigorous batch-packing concentration bounds across rounds, and replacing our integer-program decoder with a direct polynomial-time multi-match decoder.',
      highlight: ['batch-packing concentration bounds', 'direct polynomial-time multi-match decoder'],
      cue: null,
    },
    {
      id: 's12_b7',
      start: 95.68,
      audioDuration: 9.82,
      end: 106.7,
      text: 'That leaves one open question: without cloning, can the physical full-reorder bottle game ever reach linear time—or is n log log n the limit?',
      highlight: ['one open question', 'without cloning', 'reach linear time'],
      cue: 'clink',
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
  const totalDur = Number(ctx.duration) || sceneMeta.duration;

  const b0 = beatAt(beats, 0, 0.8, 9.72);
  const b1 = beatAt(beats, 1, 11.07, 13.92);
  const b2 = beatAt(beats, 2, 25.54, 13.22);
  const b3 = beatAt(beats, 3, 39.31, 14.38);
  const b4 = beatAt(beats, 4, 54.24, 12.48);
  const b5 = beatAt(beats, 5, 67.27, 13.49);
  const b6 = beatAt(beats, 6, 81.31, 13.82);
  const b7 = beatAt(beats, 7, 95.68, 9.82);

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

  const oakGrad = svgEl('linearGradient', { id: 's12_oak', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#D7B084' }, oakGrad);
  svgEl('stop', { offset: '55%', 'stop-color': '#BA8958' }, oakGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#8A5D36' }, oakGrad);

  const savingsGrad = svgEl('linearGradient', { id: 's12_savings', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': P.delft, 'stop-opacity': '0.16' }, savingsGrad);
  svgEl('stop', { offset: '100%', 'stop-color': P.sage, 'stop-opacity': '0.04' }, savingsGrad);

  const sunWash = svgEl('radialGradient', { id: 's12_sun', cx: '50%', cy: '44%', r: '52%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#F8E3B5', 'stop-opacity': '0.50' }, sunWash);
  svgEl('stop', { offset: '100%', 'stop-color': '#F8E3B5', 'stop-opacity': '0' }, sunWash);

  const addScrim = (parent, text, opts = {}) => {
    const node = bottles.createSvgScrimLabel(text, opts);
    parent.appendChild(node);
    return node;
  };

  // =========================================================================
  // BEAT GROUP 1 (Beats 0-2): FULL-WIDTH GAME 2 CHART (n = 50 .. 4,000)
  // =========================================================================
  const actV2 = svgEl('g', { id: 's12_act_v2' }, svg);

  svgEl('text', {
    x: '132',
    y: '78',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '32',
    'font-weight': '600',
    'letter-spacing': '-0.02em',
    textContent: 'Game 2 · Full-Table Reordering up to 4,000 Bottles',
  }, actV2);
  svgEl('text', {
    x: '132',
    y: '105',
    fill: P.sepia,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '13',
    'font-weight': '600',
    textContent: 'Y-AXIS: QUERIES DIVIDED BY (n log₂ n)   ·   LOGARITHMIC SCALE IN n',
  }, actV2);

  const v2Left = 148;
  const v2Right = 1130;
  const v2Top = 148;
  const v2Bottom = 486;

  const v2Shift = [
    { n: 50, v: 0.935 },
    { n: 100, v: 0.951 },
    { n: 200, v: 0.96 },
    { n: 500, v: 0.957 },
    { n: 1000, v: 0.961 },
  ];
  const v2Ours = [
    { n: 50, v: 0.711, lbl: '0.711', dx: 24, dy: -22 },
    { n: 100, v: 0.708, lbl: '0.708', dx: 0, dy: 24, show: false },
    { n: 200, v: 0.686, lbl: '0.686', dx: 0, dy: -22 },
    { n: 500, v: 0.637, lbl: '0.637', dx: 0, dy: 26 },
    { n: 1000, v: 0.604, lbl: '0.604', dx: 0, dy: 26 },
    { n: 2000, v: 0.571, lbl: '0.571', dx: 0, dy: 26 },
    { n: 4000, v: 0.548, lbl: '0.548', dx: -16, dy: 26 },
  ];

  const logMin2 = Math.log10(50);
  const logMax2 = Math.log10(4000);
  const v2X = (n) => v2Left + ((Math.log10(n) - logMin2) / (logMax2 - logMin2)) * (v2Right - v2Left);
  const v2Y = (val) => v2Bottom - ((val - 0.45) / (1.05 - 0.45)) * (v2Bottom - v2Top);

  // Gridlines & Y-ticks
  for (const yv of [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]) {
    const yy = v2Y(yv);
    svgEl('line', { x1: String(v2Left), y1: yy.toFixed(1), x2: String(v2Right), y2: yy.toFixed(1), stroke: P.sepia, 'stroke-width': '1', 'stroke-dasharray': '4 5', opacity: '0.24' }, actV2);
    svgEl('text', {
      x: String(v2Left - 14),
      y: (yy + 4).toFixed(1),
      'text-anchor': 'end',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '13',
      textContent: yv.toFixed(1),
    }, actV2);
  }
  svgEl('line', { x1: String(v2Left), y1: String(v2Bottom), x2: String(v2Right + 10), y2: String(v2Bottom), stroke: P.ink, 'stroke-width': '1.8', opacity: '0.7' }, actV2);
  svgEl('line', { x1: String(v2Left), y1: String(v2Top - 8), x2: String(v2Left), y2: String(v2Bottom), stroke: P.ink, 'stroke-width': '1.8', opacity: '0.7' }, actV2);

  for (const n of [50, 100, 200, 500, 1000, 2000, 4000]) {
    const xx = v2X(n);
    svgEl('line', { x1: xx.toFixed(1), y1: String(v2Bottom), x2: xx.toFixed(1), y2: String(v2Bottom + 7), stroke: P.ink, 'stroke-width': '1.5', opacity: '0.6' }, actV2);
    svgEl('text', {
      x: xx.toFixed(1),
      y: String(v2Bottom + 27),
      'text-anchor': 'middle',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '13',
      'font-weight': '600',
      textContent: n >= 1000 ? `${n / 1000}k` : String(n),
    }, actV2);
  }
  svgEl('text', {
    x: String((v2Left + v2Right) / 2),
    y: String(v2Bottom + 54),
    'text-anchor': 'middle',
    fill: P.muted,
    'font-family': "'Fraunces', Georgia, serif",
    'font-style': 'italic',
    'font-size': '14.5',
    textContent: 'Number of bottles (n)',
  }, actV2);

  // Shaded savings ribbon
  const savingsPts = [
    ...v2Ours.map((d) => `${v2X(d.n).toFixed(1)},${v2Y(0.958).toFixed(1)}`),
    ...[...v2Ours].reverse().map((d) => `${v2X(d.n).toFixed(1)},${v2Y(d.v).toFixed(1)}`),
  ].join(' ');
  const v2SavingsArea = svgEl('polygon', { points: savingsPts, fill: 'url(#s12_savings)' }, actV2);

  // Classical O(n log n) flat terracotta baseline
  const v2ShiftD = v2Shift.map((d, i) => `${i === 0 ? 'M' : 'L'}${v2X(d.n).toFixed(1)} ${v2Y(d.v).toFixed(1)}`).join(' ');
  const v2ShiftExtD = `M${v2X(1000).toFixed(1)} ${v2Y(0.961).toFixed(1)} L${v2X(4000).toFixed(1)} ${v2Y(0.961).toFixed(1)}`;
  const v2ShiftPath = svgEl('path', { d: v2ShiftD, fill: 'none', stroke: P.terracotta, 'stroke-width': '3.5', 'stroke-linecap': 'round' }, actV2);
  const v2ShiftExt = svgEl('path', { d: v2ShiftExtD, fill: 'none', stroke: P.terracotta, 'stroke-width': '2.4', 'stroke-dasharray': '7 6', opacity: '0.62' }, actV2);
  const v2ShiftLbl = addScrim(actV2, 'Classical Binary Search  ≈  0.96 n log₂ n (flat)', {
    x: 925,
    y: v2Y(0.961) - 24,
    fontSize: 15,
    fontFamily: 'editorial',
    fontWeight: 700,
    color: P.terracotta,
    stroke: 'rgba(217, 93, 72, 0.3)',
    shadow: false,
  });

  // Hero V2 plunging curve
  const v2OursD = v2Ours.map((d, i) => `${i === 0 ? 'M' : 'L'}${v2X(d.n).toFixed(1)} ${v2Y(d.v).toFixed(1)}`).join(' ');
  const v2OursPath = svgEl('path', { d: v2OursD, fill: 'none', stroke: P.delft, 'stroke-width': '5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, actV2);

  const v2Dots = v2Ours.map((d, i) => {
    const dg = svgEl('g', { class: `s12-v2-dot-${i}` }, actV2);
    const xx = v2X(d.n);
    const yy = v2Y(d.v);
    svgEl('circle', {
      cx: xx.toFixed(1),
      cy: yy.toFixed(1),
      r: i === 4 || i === 6 ? '7.5' : '6',
      fill: P.parchment,
      stroke: i === 6 ? P.sage : P.delft,
      'stroke-width': '3.2',
    }, dg);
    if (d.show !== false) {
      addScrim(dg, d.lbl, {
        x: xx + d.dx,
        y: yy + d.dy,
        fontSize: 13,
        fontFamily: 'mono',
        fontWeight: 700,
        color: i === 6 ? P.sage : P.delft,
        stroke: 'rgba(61, 126, 166, 0.25)',
        padX: 7,
        padY: 3,
        shadow: false,
      });
    }
    return dg;
  });

  // Beat 1: Callout pin at n = 1,000 (-37% · 6,020 vs. 9,575) — placed cleanly to the right of pin line!
  const pin1kX = v2X(1000);
  const v2PinG = svgEl('g', { id: 's12_v2_pin' }, actV2);
  svgEl('line', {
    x1: pin1kX.toFixed(1),
    y1: (v2Y(0.961) + 8).toFixed(1),
    x2: pin1kX.toFixed(1),
    y2: (v2Y(0.604) - 10).toFixed(1),
    stroke: P.brass,
    'stroke-width': '2.4',
    'stroke-dasharray': '5 4',
  }, v2PinG);
  addScrim(v2PinG, '−37% fewer queries at n = 1,000', {
    x: pin1kX + 168,
    y: 266,
    fontSize: 17,
    fontFamily: 'editorial',
    fontWeight: 700,
    color: P.ink,
    fill: '#FDF5DF',
    stroke: P.brass,
    strokeWidth: 1.5,
    padX: 14,
    padY: 6,
  });
  addScrim(v2PinG, '6,020 vs. 9,575 queries', {
    x: pin1kX + 168,
    y: 304,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sage,
    fill: '#EBF5EF',
    stroke: P.sage,
    padX: 12,
    padY: 4,
  });

  // Beat 2: Flat Ratio Proof Inset (Q / (n log2 log2 n) ≈ 1.81x) in wide open space (x=540..1115, y=218..348)
  const v2RatioInset = svgEl('g', { id: 's12_v2_ratio' }, actV2);
  svgEl('rect', {
    x: '544',
    y: '220',
    width: '568',
    height: '126',
    rx: '14',
    fill: '#FFFBF2',
    'fill-opacity': '0.96',
    stroke: P.brass,
    'stroke-width': '1.8',
  }, v2RatioInset);
  svgEl('text', {
    x: '568',
    y: '248',
    fill: P.brass,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '12.5',
    'font-weight': '700',
    textContent: 'NORMALIZED BY O(n log₂ log₂ n) · RANDOM & ADVERSARIAL',
  }, v2RatioInset);
  // Mini flat brass line from x=570..1084 at y=288
  svgEl('line', { x1: '570', y1: '288', x2: '1084', y2: '288', stroke: P.brass, 'stroke-width': '3.5', 'stroke-linecap': 'round' }, v2RatioInset);
  const ratioPts = [
    { x: 585, y: 290, txt: '1.82×' },
    { x: 705, y: 287, txt: '1.81×' },
    { x: 830, y: 288, txt: '1.81×' },
    { x: 955, y: 286, txt: '1.82×' },
    { x: 1068, y: 288, txt: '1.83×' },
  ];
  ratioPts.forEach((rp) => {
    svgEl('circle', { cx: String(rp.x), cy: String(rp.y), r: '5.2', fill: P.parchment, stroke: P.brass, 'stroke-width': '2.6' }, v2RatioInset);
    svgEl('text', {
      x: String(rp.x),
      y: String(rp.y + 22),
      'text-anchor': 'middle',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      textContent: rp.txt,
    }, v2RatioInset);
  });
  svgEl('text', {
    x: '828',
    y: '334',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Plus Jakarta Sans', sans-serif",
    'font-size': '13',
    'font-weight': '600',
    textContent: 'Flat ~1.81× n log₂ log₂ n all the way to n = 4,000 (even on adversarial inputs!)',
  }, v2RatioInset);

  // =========================================================================
  // BEAT GROUP 2 (Beat 3): FULL-WIDTH GAME 1 CHART (n = 20 .. 2,000)
  // =========================================================================
  const actV1 = svgEl('g', { id: 's12_act_v1' }, svg);

  svgEl('text', {
    x: '132',
    y: '78',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '32',
    'font-weight': '600',
    'letter-spacing': '-0.02em',
    textContent: 'Game 1 · Single-Swap Solver Converging to Yao\'s Limit',
  }, actV1);
  svgEl('text', {
    x: '132',
    y: '105',
    fill: P.sepia,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '13',
    'font-weight': '600',
    textContent: 'Y-AXIS: SWAPS DIVIDED BY YAO LOWER BOUND [ n(n−1) / 8 ]   ·   n = 20 … 2,000',
  }, actV1);

  const v1Pivot = [
    { n: 20, v: 2.32 },
    { n: 100, v: 1.94 },
    { n: 500, v: 1.89 },
    { n: 2000, v: 1.8 },
  ];
  const v1Det = [
    { n: 20, v: 2.32 },
    { n: 100, v: 1.45 },
    { n: 500, v: 1.19 },
    { n: 2000, v: 1.089 },
  ];
  const v1Rand = [
    { n: 20, v: 2.32, lbl: '2.32×', dx: 26, dy: -22 },
    { n: 100, v: 1.43, lbl: '1.43×', dx: -16, dy: 26 },
    { n: 500, v: 1.12, lbl: '1.12×', dx: 0, dy: 26 },
    { n: 2000, v: 1.055, lbl: '1.055×', dx: -18, dy: -24 },
  ];

  const logMin1 = Math.log10(20);
  const logMax1 = Math.log10(2000);
  const v1X = (n) => v2Left + ((Math.log10(n) - logMin1) / (logMax1 - logMin1)) * (v2Right - v2Left);
  const v1Y = (val) => v2Bottom - ((val - 0.85) / (2.55 - 0.85)) * (v2Bottom - v2Top);

  for (const yv of [1.0, 1.4, 1.8, 2.2]) {
    const yy = v1Y(yv);
    const isLimit = yv === 1.0;
    svgEl('line', {
      x1: String(v2Left),
      y1: yy.toFixed(1),
      x2: String(v2Right),
      y2: yy.toFixed(1),
      stroke: isLimit ? P.brass : P.sepia,
      'stroke-width': isLimit ? '2.8' : '1',
      'stroke-dasharray': isLimit ? '10 6' : '4 5',
      opacity: isLimit ? '0.95' : '0.24',
    }, actV1);
    svgEl('text', {
      x: String(v2Left - 14),
      y: (yy + 4).toFixed(1),
      'text-anchor': 'end',
      fill: isLimit ? P.brass : P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '13',
      'font-weight': isLimit ? '700' : '500',
      textContent: `${yv.toFixed(1)}×`,
    }, actV1);
  }
  addScrim(actV1, '1.00× THEORETICAL LIMIT · n(n−1) / 8', {
    x: 342,
    y: v1Y(1.0) + 18,
    fontSize: 12.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.brass,
    stroke: P.brass,
    padX: 10,
    padY: 3,
    shadow: false,
  });

  svgEl('line', { x1: String(v2Left), y1: String(v2Bottom), x2: String(v2Right + 10), y2: String(v2Bottom), stroke: P.ink, 'stroke-width': '1.8', opacity: '0.7' }, actV1);
  svgEl('line', { x1: String(v2Left), y1: String(v2Top - 8), x2: String(v2Left), y2: String(v2Bottom), stroke: P.ink, 'stroke-width': '1.8', opacity: '0.7' }, actV1);

  for (const n of [20, 100, 500, 2000]) {
    const xx = v1X(n);
    svgEl('line', { x1: xx.toFixed(1), y1: String(v2Bottom), x2: xx.toFixed(1), y2: String(v2Bottom + 7), stroke: P.ink, 'stroke-width': '1.5', opacity: '0.6' }, actV1);
    svgEl('text', {
      x: xx.toFixed(1),
      y: String(v2Bottom + 27),
      'text-anchor': 'middle',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '13',
      'font-weight': '600',
      textContent: n >= 1000 ? `${n / 1000}k` : String(n),
    }, actV1);
  }
  svgEl('text', {
    x: String((v2Left + v2Right) / 2),
    y: String(v2Bottom + 54),
    'text-anchor': 'middle',
    fill: P.muted,
    'font-family': "'Fraunces', Georgia, serif",
    'font-style': 'italic',
    'font-size': '14.5',
    textContent: 'Number of bottles (n)',
  }, actV1);

  const v1PivotD = v1Pivot.map((d, i) => `${i === 0 ? 'M' : 'L'}${v1X(d.n).toFixed(1)} ${v1Y(d.v).toFixed(1)}`).join(' ');
  const v1DetD = v1Det.map((d, i) => `${i === 0 ? 'M' : 'L'}${v1X(d.n).toFixed(1)} ${v1Y(d.v).toFixed(1)}`).join(' ');
  const v1RandD = v1Rand.map((d, i) => `${i === 0 ? 'M' : 'L'}${v1X(d.n).toFixed(1)} ${v1Y(d.v).toFixed(1)}`).join(' ');

  const v1PivotPath = svgEl('path', { d: v1PivotD, fill: 'none', stroke: P.muted, 'stroke-width': '2.6', 'stroke-dasharray': '7 5' }, actV1);
  const v1DetPath = svgEl('path', { d: v1DetD, fill: 'none', stroke: P.plum, 'stroke-width': '3.4', 'stroke-linecap': 'round' }, actV1);
  const v1RandPath = svgEl('path', { d: v1RandD, fill: 'none', stroke: P.terracotta, 'stroke-width': '5.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, actV1);

  addScrim(actV1, 'Pivot Sweep (1.80×)', {
    x: v1X(2000) - 94,
    y: v1Y(1.8) - 22,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 600,
    color: P.muted,
    shadow: false,
  });
  addScrim(actV1, 'Deterministic Fold (1.089×)', {
    x: 880,
    y: 386,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.plum,
    stroke: P.plum,
    shadow: false,
  });

  const v1Dots = v1Rand.map((d, i) => {
    const dg = svgEl('g', { class: `s12-v1-dot-${i}` }, actV1);
    const xx = v1X(d.n);
    const yy = v1Y(d.v);
    svgEl('circle', { cx: xx.toFixed(1), cy: yy.toFixed(1), r: i === 3 ? '8' : '6.2', fill: P.parchment, stroke: P.terracotta, 'stroke-width': '3.4' }, dg);
    addScrim(dg, d.lbl, {
      x: xx + d.dx,
      y: yy + d.dy,
      fontSize: i === 3 ? 15 : 13,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.terracotta,
      stroke: 'rgba(217, 93, 72, 0.3)',
      padX: 8,
      padY: 3,
      shadow: false,
    });
    return dg;
  });

  const v1CalloutOuter = svgEl('g', { transform: 'translate(892, 206)' }, actV1);
  const v1Callout = svgEl('g', { id: 's12_v1_callout' }, v1CalloutOuter);
  svgEl('rect', {
    x: '-224',
    y: '-34',
    width: '448',
    height: '76',
    rx: '14',
    fill: '#FFFBF2',
    'fill-opacity': '0.95',
    stroke: P.terracotta,
    'stroke-width': '1.8',
  }, v1Callout);
  svgEl('text', { x: '0', y: '-6', 'text-anchor': 'middle', fill: P.ink, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '22', 'font-weight': '700', textContent: 'Randomized Fold: 1.055× Limit' }, v1Callout);
  svgEl('text', { x: '0', y: '22', 'text-anchor': 'middle', fill: P.sage, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12.5', 'font-weight': '700', textContent: '873 / 873 exact n ≤ 6 permutations verified ✓' }, v1Callout);

  // =========================================================================
  // BEAT GROUP 3 (Beats 4-6): EDITORIAL LITERATURE TIMELINE & HONEST PROOF NOTES
  // =========================================================================
  const actMap = svgEl('g', { id: 's12_act_map' }, svg);

  svgEl('text', {
    x: '640',
    y: '74',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '32',
    'font-weight': '600',
    textContent: 'Where These Results Sit in the Literature',
  }, actMap);

  // Archival horizontal brass timeline spine (y = 248)
  const tlY = 248;
  const tlSpine = svgEl('line', {
    x1: '112',
    y1: String(tlY),
    x2: '1168',
    y2: String(tlY),
    stroke: P.brass,
    'stroke-width': '3',
    'stroke-linecap': 'round',
  }, actMap);

  const milestones = [
    {
      x: 205,
      above: true,
      year: '1986 · Ko–Teng',
      title: 'O(n log n) Baseline',
      sub: 'Permutation Mastermind',
      col: P.sepia,
    },
    {
      x: 475,
      above: false,
      year: '2024 · Martinsson–Su',
      title: 'Θ(n) With Cloning',
      sub: 'Repeated colors (illegal here)',
      col: P.terracotta,
    },
    {
      x: 745,
      above: true,
      year: 'FUN 2026 · Subercaseaux',
      title: 'Local-Swap lg n Gap',
      sub: 'n²/4 ≤ A(n, 2) ≤ (n² lg n)/2',
      col: P.delft,
    },
    {
      x: 1020,
      above: false,
      year: 'THIS WORK ★',
      title: 'V1: Exact Θ(n²) · V2: O(n log log n)',
      sub: 'Closes gap & breaks n log n in Sₙ',
      col: P.brass,
      hero: true,
    },
  ];

  const milestoneEls = milestones.map((m, i) => {
    const mgOuter = svgEl('g', { transform: `translate(${m.x}, ${tlY})` }, actMap);
    const mg = svgEl('g', { class: `s12-ms-${i}` }, mgOuter);
    const dir = m.above ? -1 : 1;
    svgEl('line', { x1: '0', y1: '0', x2: '0', y2: String(dir * 42), stroke: m.col, 'stroke-width': m.hero ? '2.8' : '1.8' }, mg);
    svgEl('circle', { cx: '0', cy: '0', r: m.hero ? '11' : '7.5', fill: m.hero ? P.brass : P.parchment, stroke: m.col, 'stroke-width': '2.6' }, mg);
    if (m.hero) {
      svgEl('circle', { cx: '0', cy: '0', r: '4', fill: P.parchment }, mg);
    }
    const baseTxtY = m.above ? -96 : 62;
    svgEl('text', {
      x: '0',
      y: String(baseTxtY),
      'text-anchor': 'middle',
      fill: m.col,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': m.hero ? '13' : '12.5',
      'font-weight': '700',
      textContent: m.year,
    }, mg);
    svgEl('text', {
      x: '0',
      y: String(baseTxtY + 24),
      'text-anchor': 'middle',
      fill: P.ink,
      'font-family': "'Fraunces', Georgia, serif",
      'font-size': m.hero ? '18.5' : '18.5',
      'font-weight': '700',
      textContent: m.title,
    }, mg);
    svgEl('text', {
      x: '0',
      y: String(baseTxtY + 46),
      'text-anchor': 'middle',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      textContent: m.sub,
    }, mg);
    return mg;
  });

  // Beat 6: Two crisp frosted editorial proof-transparency notes (y = 396..556)
  const proofNotesG = svgEl('g', { id: 's12_proof_notes' }, actMap);
  svgEl('line', { x1: '124', y1: '390', x2: '1156', y2: '390', stroke: P.sepia, 'stroke-width': '1', opacity: '0.28' }, proofNotesG);
  svgEl('text', {
    x: '640',
    y: '416',
    'text-anchor': 'middle',
    fill: P.brass,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '12',
    'font-weight': '700',
    'letter-spacing': '0.12em',
    textContent: 'HONEST PROOF NOTES · TWO REMAINING FORMAL STEPS FOR V2',
  }, proofNotesG);

  const note1 = svgEl('g', { transform: 'translate(124, 434)' }, proofNotesG);
  svgEl('rect', { x: '0', y: '0', width: '496', height: '112', rx: '14', fill: '#FFFBF2', 'fill-opacity': '0.94', stroke: 'rgba(200, 138, 30, 0.38)', 'stroke-width': '1.4' }, note1);
  svgEl('text', { x: '22', y: '34', fill: P.brass, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '24', 'font-weight': '700', textContent: 'I.' }, note1);
  svgEl('text', { x: '52', y: '33', fill: P.ink, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '19', 'font-weight': '600', textContent: 'Batch-Packing Concentration' }, note1);
  svgEl('text', { x: '52', y: '62', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '13.5', textContent: 'Rigorous martingale concentration bounds ensuring' }, note1);
  svgEl('text', { x: '52', y: '84', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '13.5', textContent: 'adaptive parallel packing achieves Ω(2ʳ) across rounds.' }, note1);

  const note2 = svgEl('g', { transform: 'translate(660, 434)' }, proofNotesG);
  svgEl('rect', { x: '0', y: '0', width: '496', height: '112', rx: '14', fill: '#FFFBF2', 'fill-opacity': '0.94', stroke: 'rgba(200, 138, 30, 0.38)', 'stroke-width': '1.4' }, note2);
  svgEl('text', { x: '22', y: '34', fill: P.brass, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '24', 'font-weight': '700', textContent: 'II.' }, note2);
  svgEl('text', { x: '56', y: '33', fill: P.ink, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '19', 'font-weight': '600', textContent: 'Direct Multi-Match Decoder' }, note2);
  svgEl('text', { x: '56', y: '62', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '13.5', textContent: 'Replacing our integer-program decoder with an explicit' }, note2);
  svgEl('text', { x: '56', y: '84', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '13.5', textContent: 'polynomial-time decoder for weight ≥ 2 groups.' }, note2);

  // =========================================================================
  // BEAT GROUP 4 (Beat 7): CLOSING OPEN PROBLEM ABOVE 6 BOTTLES ON VEILED '?' COASTERS
  // =========================================================================
  const actClosing = svgEl('g', { id: 's12_closing' }, svg);
  svgEl('ellipse', { cx: '640', cy: '250', rx: '460', ry: '210', fill: 'url(#s12_sun)' }, actClosing);

  const closeEyebrow = svgEl('text', {
    x: '640',
    y: '96',
    'text-anchor': 'middle',
    fill: P.brass,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '13',
    'font-weight': '700',
    'letter-spacing': '0.16em',
    textContent: 'THE OPEN PROBLEM · WITHOUT CLONING',
  }, actClosing);

  const closeQuestion = svgEl('text', {
    x: '640',
    y: '154',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-style': 'italic',
    'font-size': '44',
    'font-weight': '600',
    'letter-spacing': '-0.02em',
    textContent: 'Can physical bottles ever reach O(n)?',
  }, actClosing);

  const onEmblemOuter = svgEl('g', { transform: 'translate(640, 248)' }, actClosing);
  const onEmblem = svgEl('g', { id: 's12_on_emblem' }, onEmblemOuter);
  svgEl('circle', { cx: '0', cy: '0', r: '52', fill: '#FDF3D6', stroke: P.brass, 'stroke-width': '2.6' }, onEmblem);
  svgEl('circle', { cx: '0', cy: '0', r: '44', fill: 'none', stroke: P.brassLight, 'stroke-width': '1.2', 'stroke-dasharray': '4 3' }, onEmblem);
  svgEl('text', {
    x: '0',
    y: '2',
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '32',
    'font-weight': '700',
    textContent: 'O(n)?',
  }, onEmblem);

  // 6 sunlit labeled bottles 0..5 standing over veiled '?' coasters on an oak shelf
  const shelfG = svgEl('g', { id: 's12_shelf' }, actClosing);
  const shelfY = 486;
  svgEl('rect', { x: '176', y: String(shelfY + 20), width: '928', height: '14', rx: '7', fill: '#4A3828', opacity: '0.13' }, shelfG);
  svgEl('rect', { x: '156', y: String(shelfY), width: '968', height: '22', rx: '7', fill: 'url(#s12_oak)', stroke: P.ink, 'stroke-width': '1.8' }, shelfG);
  svgEl('line', { x1: '172', y1: String(shelfY + 4), x2: '1108', y2: String(shelfY + 4), stroke: '#F0D7B4', 'stroke-width': '1.5', opacity: '0.72' }, shelfG);

  const closeXs = [275, 421, 567, 713, 859, 1005];
  const closeBottles = [];
  for (let i = 0; i < 6; i++) {
    shelfG.appendChild(
      bottles.createSvgCoaster(i, {
        x: closeXs[i],
        y: shelfY - 2,
        width: 80,
        scale: 0.96,
        hidden: true,
        showLabel: true,
      }),
    );
    const bw = svgEl('g', { class: `s12-close-btl-${i}` }, shelfG);
    bw.appendChild(bottles.createSvgBottle(i, { x: 0, y: 0, scale: 1.08 }));
    closeBottles.push({ el: bw, x: closeXs[i], y: shelfY - 4 });
  }

  // =========================================================================
  // MASTER AUDIO-SYNCED BIDIRECTIONAL GSAP TIMELINE
  // =========================================================================
  const tl = gsap.timeline({ paused: true });

  const prepDraw = (pathEl, len = 1200) => {
    pathEl.setAttribute('stroke-dasharray', `${len}`);
    pathEl.setAttribute('stroke-dashoffset', `${len}`);
    return len;
  };
  const lenV2Shift = prepDraw(v2ShiftPath, 900);
  const lenV2Ours = prepDraw(v2OursPath, 1250);
  const lenV1Pivot = prepDraw(v1PivotPath, 1100);
  const lenV1Det = prepDraw(v1DetPath, 1150);
  const lenV1Rand = prepDraw(v1RandPath, 1200);

  // Initial state at t = 0
  tl.set(actV2, { autoAlpha: 1, y: 0 }, 0);
  tl.set(v2ShiftPath, { strokeDashoffset: lenV2Shift }, 0);
  tl.set(v2ShiftExt, { autoAlpha: 0 }, 0);
  tl.set(v2ShiftLbl, { autoAlpha: 0 }, 0);
  tl.set(v2OursPath, { strokeDashoffset: lenV2Ours }, 0);
  tl.set(v2SavingsArea, { autoAlpha: 0 }, 0);
  tl.set(v2Dots, { autoAlpha: 0, scale: 0.35, transformOrigin: 'center' }, 0);
  tl.set(v2PinG, { autoAlpha: 0, y: 12 }, 0);
  tl.set(v2RatioInset, { autoAlpha: 0, y: 14 }, 0);

  tl.set(actV1, { autoAlpha: 0, y: 16 }, 0);
  tl.set(v1PivotPath, { strokeDashoffset: lenV1Pivot }, 0);
  tl.set(v1DetPath, { strokeDashoffset: lenV1Det }, 0);
  tl.set(v1RandPath, { strokeDashoffset: lenV1Rand }, 0);
  tl.set(v1Dots, { autoAlpha: 0, scale: 0.35, transformOrigin: 'center' }, 0);
  tl.set(v1Callout, { autoAlpha: 0, y: 12 }, 0);

  tl.set(actMap, { autoAlpha: 0 }, 0);
  tl.set(tlSpine, { scaleX: 0, transformOrigin: 'left center' }, 0);
  tl.set(milestoneEls, { autoAlpha: 0, y: 14 }, 0);
  tl.set(proofNotesG, { autoAlpha: 0, y: 16 }, 0);

  tl.set(actClosing, { autoAlpha: 0 }, 0);
  tl.set([closeEyebrow, closeQuestion], { autoAlpha: 0, y: 14 }, 0);
  tl.set(onEmblem, { autoAlpha: 0, scale: 0.65, transformOrigin: 'center' }, 0);
  tl.set(shelfG, { autoAlpha: 0, y: 20 }, 0);
  closeBottles.forEach(({ el, x, y }) => {
    tl.set(el, { x, y: y + 14, autoAlpha: 0 }, 0);
  });

  // --- BEAT 0: Unroll V2 Chart & Draw Classical 0.96 n log2 n Baseline ---
  tl.to(v2ShiftPath, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut' }, b0.start + 1.4);
  tl.to(v2ShiftExt, { autoAlpha: 0.62, duration: 0.7 }, b0.start + 3.6);
  tl.to(v2ShiftLbl, { autoAlpha: 1, duration: 0.7 }, b0.start + 4.0);

  // --- BEAT 1: Our V2 Curve Plunges Below n log n (-37% · 6,020 vs 9,575 at n=1,000!) ---
  tl.to(v2OursPath, { strokeDashoffset: 0, duration: 2.8, ease: 'power2.inOut' }, b1.start + 0.5);
  tl.to(v2Dots, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.25, ease: 'back.out(1.8)' }, b1.start + 0.9);
  tl.to(v2SavingsArea, { autoAlpha: 1, duration: 1.0 }, b1.start + 2.8);
  tl.to(v2PinG, { autoAlpha: 1, y: 0, duration: 0.85, ease: 'back.out(1.4)' }, b1.start + 3.8);

  // --- BEAT 2: Cross-fade n=1,000 pin into Flat 1.81x n log2 log2 n Ratio Proof Inset ---
  tl.to(v2PinG, { autoAlpha: 0, duration: 0.45 }, b2.start + 0.4);
  tl.to(v2RatioInset, { autoAlpha: 1, y: 0, duration: 0.85, ease: 'back.out(1.3)' }, b2.start + 0.9);

  // --- BEAT 3: Cross-Fade to Full-Width Game 1 Convergence Chart (1.055x limit!) ---
  tl.to(actV2, { autoAlpha: 0, y: -16, duration: 0.5, ease: 'power2.in' }, b3.start - 0.15);
  tl.to(actV1, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' }, b3.start + 0.2);

  tl.to(v1PivotPath, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, b3.start + 0.7);
  tl.to(v1DetPath, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, b3.start + 1.3);
  tl.to(v1RandPath, { strokeDashoffset: 0, duration: 2.3, ease: 'power2.inOut' }, b3.start + 1.8);
  tl.to(v1Dots, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.35, ease: 'back.out(1.9)' }, b3.start + 2.2);
  tl.to(v1Callout, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'back.out(1.3)' }, b3.start + 4.2);

  // --- BEAT 4: Editorial Literature Map — Ko-Teng (1986) & Martinsson-Su (2024) ---
  tl.to(actV1, { autoAlpha: 0, y: -16, duration: 0.5, ease: 'power2.in' }, b4.start - 0.15);
  tl.to(actMap, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b4.start + 0.2);
  tl.to(tlSpine, { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, b4.start + 0.5);
  tl.to(milestoneEls[0], { autoAlpha: 1, y: 0, duration: 0.65, ease: 'back.out(1.4)' }, b4.start + 1.2);
  tl.to(milestoneEls[1], { autoAlpha: 1, y: 0, duration: 0.65, ease: 'back.out(1.4)' }, b4.start + 5.2);

  // --- BEAT 5: Subercaseaux (FUN 2026) & THIS WORK ★ ---
  tl.to(milestoneEls[2], { autoAlpha: 1, y: 0, duration: 0.65, ease: 'back.out(1.4)' }, b5.start + 0.6);
  tl.to(milestoneEls[3], { autoAlpha: 1, y: 0, duration: 0.75, ease: 'back.out(1.5)' }, b5.start + 4.4);

  // --- BEAT 6: Honest Remaining Proof Steps (I & II) ---
  tl.to(proofNotesG, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out' }, b6.start + 0.6);

  // --- BEAT 7: Poetic Closing Open Problem — O(n)? Above 6 Bottles on Veiled '?' Coasters ---
  tl.to(actMap, { autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, b7.start - 0.15);
  tl.to(actClosing, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, b7.start + 0.25);
  tl.to([closeEyebrow, closeQuestion], { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.25, ease: 'power2.out' }, b7.start + 0.5);
  tl.to(onEmblem, { autoAlpha: 1, scale: 1, duration: 0.85, ease: 'back.out(1.5)' }, b7.start + 1.4);
  tl.to(shelfG, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, b7.start + 1.0);
  closeBottles.forEach(({ el, y }, i) => {
    tl.to(el, { autoAlpha: 1, y, duration: 0.5, ease: 'back.out(1.5)' }, b7.start + 1.25 + i * 0.14);
  });

  // Pad cleanly to full audio duration
  tl.to({}, { duration: 0.01 }, Math.max(totalDur - 0.01, b7.end));

  return {
    timeline: tl,
    destroy() {
      rootEl.innerHTML = '';
    },
  };
}
