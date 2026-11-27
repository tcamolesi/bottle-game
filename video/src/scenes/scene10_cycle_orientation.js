// Chapter 10: Building Block 3: Graph, DFS & Parallel Loop Orientation
// Sunlit Apothecary Art · 10 Audio-Synced Beats · 171.21s
// Explicit 4-Stage Visual Handoff:
//   Stage 1 (Beat 0): Stopping Trigger — live pair-weight tally 2+1+1+1+1 = 6 = n -> Exit Coin Weighing!
//   Stage 2 (Beats 1-2): Build Active-Pair Graph (Gold w=2, Slate w=1) -> Isolate & lock weight-2 2-cycle {0,1}
//   Stage 3 (Beats 3-5): Exact Degree-2 proof -> Animated DFS discovering closed loops -> Small n=6 expanding to Large n=12 (3 disjoint loops side by side!)
//   Stage 4 (Beats 6-8): Two rotations (+L vs 0) -> Multiple loops rotated simultaneously in 1 full-table query on p0 -> Brass Scale (f / L -> Lindström) -> O(n / log n)
//   Finale (Beat 9): All 4 Stages Connected -> Bridge to Live 6-Bottle Walkthrough

export const sceneMeta = {
  id: 'scene10',
  number: 10,
  title: 'Building Block 3: Graph, DFS & Parallel Loop Orientation',
  chapter: 'Part II · Cycle Orientation',
  duration: 171.206,
  beats: [
    {
      id: 's10_b0',
      start: 0.8,
      audioDuration: 19.992,
      end: 21.342,
      text: 'Stage 1—the stopping trigger: because every bottle sits off its one true coaster in p₀, all active pair weights across the table always sum to n. The instant our discovered single-pair weights add up to n, we know zero active pairs remain anywhere else—exiting coin weighing!',
      highlight: ['Stage 1—the stopping trigger', 'add up to n', 'exiting coin weighing'],
      cue: 'bell',
    },
    {
      id: 's10_b1',
      start: 21.342,
      audioDuration: 11.16,
      end: 33.052,
      text: 'Stage 2—build the active-pair graph: draw an edge {i, j} between slots for every active pair we discovered, colored gold for weight 2 and slate for weight 1.',
      highlight: ['Stage 2—build the active-pair graph', 'gold for weight 2', 'slate for weight 1'],
      cue: 'whoosh',
    },
    {
      id: 's10_b2',
      start: 33.052,
      audioDuration: 12.072,
      end: 45.674,
      text: "Every weight-2 edge is an isolated 2-cycle: swapping those two bottles puts both directly onto each other's true coasters, so we swap and lock every weight-2 pair right away.",
      highlight: ['isolated 2-cycle', 'swap and lock every weight-2 pair'],
      cue: 'lock',
    },
    {
      id: 's10_b3',
      start: 45.674,
      audioDuration: 14.64,
      end: 60.864,
      text: "What about the weight-1 edges? Because all 2-cycles are already locked, every remaining unlocked slot's outgoing target and incoming bottle are two distinct neighbors—giving every unlocked slot exact degree 2.",
      highlight: ['two distinct neighbors', 'exact degree 2'],
      cue: null,
    },
    {
      id: 's10_b4',
      start: 60.864,
      audioDuration: 23.016,
      end: 84.43,
      text: 'Stage 3—identifying the loops: we never guess how many loops exist! Run standard depth-first search—connected components—on the weight-1 graph. Because every node has degree 2, DFS cleanly partitions the graph into exact, vertex-disjoint closed loops of length 3 or more.',
      highlight: ['Stage 3—identifying the loops', 'depth-first search', 'vertex-disjoint closed loops'],
      cue: 'whoosh',
    },
    {
      id: 's10_b5',
      start: 84.43,
      audioDuration: 22.272,
      end: 107.252,
      text: 'On a tiny six-bottle table, DFS might uncover just one 4-bottle loop. On a larger table—with dozens or thousands of bottles—the same DFS immediately exposes every separate loop at once: a 3-cycle, a 4-cycle, a 5-cycle, or many disjoint loops side by side.',
      highlight: ['one 4-bottle loop', 'a 3-cycle, a 4-cycle, a 5-cycle', 'many disjoint loops'],
      cue: 'bell',
    },
    {
      id: 's10_b6',
      start: 107.252,
      audioDuration: 18.144,
      end: 125.946,
      text: 'Stage 4—orienting loops in parallel: each closed loop of length L has only two valid rotations—shift every bottle one step clockwise, or counter-clockwise. One orientation scores +L matches; the other scores 0.',
      highlight: ['Stage 4—orienting loops in parallel', 'scores +L matches', 'scores 0'],
      cue: 'clink',
    },
    {
      id: 's10_b7',
      start: 125.946,
      audioDuration: 17.448,
      end: 143.944,
      text: "Because separate loops share zero slots, we can rotate MULTIPLE loops simultaneously in ONE full-table query on p₀! Group equal-length loops of size L, divide the referee's score by L, and feed them straight into Lindström coin weighing.",
      highlight: ['share zero slots', 'MULTIPLE loops simultaneously in ONE full-table query', "divide the referee's score by L"],
      cue: 'scale',
    },
    {
      id: 's10_b8',
      start: 143.944,
      audioDuration: 15.744,
      end: 160.238,
      text: 'Fewer than n / log n loops exceed length log n and can be tested directly, while all shorter loops compress in parallel via Lindström—orienting every single loop in O(n / log n) extra queries!',
      highlight: ['exceed length log n', 'O(n / log n) extra queries'],
      cue: 'lock',
    },
    {
      id: 's10_b9',
      start: 160.238,
      audioDuration: 9.768,
      end: 171.206,
      text: "All four stages connect with zero guesswork. Now let's watch every single move, score, and deduction execute live on six bottles!",
      highlight: ['All four stages connect', 'every single move, score, and deduction'],
      cue: 'whoosh',
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

  const b0 = beatAt(beats, 0, 0.8, 19.992);
  const b1 = beatAt(beats, 1, 21.342, 11.16);
  const b2 = beatAt(beats, 2, 33.052, 12.072);
  const b3 = beatAt(beats, 3, 45.674, 14.64);
  const b4 = beatAt(beats, 4, 60.864, 23.016);
  const b5 = beatAt(beats, 5, 84.43, 22.272);
  const b6 = beatAt(beats, 6, 107.252, 18.144);
  const b7 = beatAt(beats, 7, 125.946, 17.448);
  const b8 = beatAt(beats, 8, 143.944, 15.744);
  const b9 = beatAt(beats, 9, 160.238, 9.768);

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

  const sunWash = svgEl('radialGradient', { id: 's10_sun', cx: '50%', cy: '48%', r: '52%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#F8E3B5', 'stop-opacity': '0.46' }, sunWash);
  svgEl('stop', { offset: '100%', 'stop-color': '#F8E3B5', 'stop-opacity': '0' }, sunWash);

  const oakGrad = svgEl('linearGradient', { id: 's10_oak', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#D7B084' }, oakGrad);
  svgEl('stop', { offset: '55%', 'stop-color': '#BA8958' }, oakGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#8A5D36' }, oakGrad);

  const makeArrow = (id, color) => {
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
  makeArrow('s10_arr_delft', P.delft);
  makeArrow('s10_arr_terra', P.terracotta);
  makeArrow('s10_arr_sage', P.sage);
  makeArrow('s10_arr_brass', P.brass);
  makeArrow('s10_arr_plum', P.plum);

  const addScrim = (parent, text, opts = {}) => {
    const node = bottles.createSvgScrimLabel(text, opts);
    parent.appendChild(node);
    return node;
  };

  // =========================================================================
  // PERSISTENT 4-STAGE PIPELINE RIBBON (y = 112, strictly below title y = 76)
  // =========================================================================
  const pipelineG = svgEl('g', { id: 's10_pipeline' }, svg);
  const stageDefs = [
    { x: 244, lbl: '1. Stop at Σw = n' },
    { x: 508, lbl: '2. Graph & Lock w=2' },
    { x: 772, lbl: '3. DFS Loops' },
    { x: 1036, lbl: '4. Parallel Orient' },
  ];
  // Connector chevrons between pills
  [376, 640, 904].forEach((cx) => {
    svgEl('text', {
      x: String(cx),
      y: '113',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: P.brass,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '14',
      'font-weight': '700',
      opacity: '0.7',
      textContent: '→',
    }, pipelineG);
  });

  const stagePills = stageDefs.map((sd) => {
    const pg = svgEl('g', { transform: `translate(${sd.x}, 112)` }, pipelineG);
    const rect = svgEl('rect', {
      x: '-110',
      y: '-15',
      width: '220',
      height: '30',
      rx: '15',
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.28)',
      'stroke-width': '1.4',
    }, pg);
    const txt = svgEl('text', {
      x: '0',
      y: '0.5',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: P.muted,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '12',
      'font-weight': '700',
      textContent: sd.lbl,
    }, pg);
    return { g: pg, rect, txt };
  });

  // =========================================================================
  // ACT 1 (Beat 0): STAGE 1 — STOPPING TRIGGER (LIVE WEIGHT TALLY -> SUM = n)
  // =========================================================================
  const actStop = svgEl('g', { id: 's10_act_stop' }, svg);
  svgEl('ellipse', { cx: '640', cy: '330', rx: '480', ry: '195', fill: 'url(#s10_sun)' }, actStop);

  svgEl('text', {
    x: '640',
    y: '76',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Stage 1 · The Stopping Trigger (Σ w = n)',
  }, actStop);

  const pairSpecs = [
    { x: 200, y: 230, pair: '{0, 1}', w: 2, wStr: 'w = 2', col: P.brass, fill: '#FDF5DF', r: 54 },
    { x: 420, y: 230, pair: '{2, 3}', w: 1, wStr: 'w = 1', col: P.delft, fill: P.parchment, r: 46 },
    { x: 640, y: 230, pair: '{3, 4}', w: 1, wStr: 'w = 1', col: P.sage, fill: P.parchment, r: 46 },
    { x: 860, y: 230, pair: '{4, 5}', w: 1, wStr: 'w = 1', col: P.plum, fill: P.parchment, r: 46 },
    { x: 1080, y: 230, pair: '{5, 2}', w: 1, wStr: 'w = 1', col: P.terracotta, fill: P.parchment, r: 46 },
  ];

  const stopMedallions = pairSpecs.map((ps, i) => {
    const outer = svgEl('g', { transform: `translate(${ps.x}, ${ps.y})` }, actStop);
    const mg = svgEl('g', { class: `s10-stop-med-${i}` }, outer);
    svgEl('circle', { cx: '0', cy: '0', r: String(ps.r), fill: ps.fill, stroke: ps.col, 'stroke-width': i === 0 ? '3.4' : '2.4' }, mg);
    svgEl('circle', { cx: '0', cy: '0', r: String(ps.r - 7), fill: 'none', stroke: ps.col, 'stroke-width': '1', 'stroke-dasharray': '4 3', opacity: '0.55' }, mg);
    svgEl('text', { x: '0', y: '-10', 'text-anchor': 'middle', fill: P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': i === 0 ? '21' : '18', 'font-weight': '700', textContent: ps.pair }, mg);
    svgEl('text', { x: '0', y: '18', 'text-anchor': 'middle', fill: ps.col, 'font-family': "'Fraunces', Georgia, serif", 'font-size': i === 0 ? '18' : '15.5', 'font-weight': '700', textContent: ps.wStr }, mg);
    return mg;
  });

  // Live Accumulator Progress Bar (x = 180..1100, y = 334..382)
  svgEl('rect', { x: '180', y: '334', width: '920', height: '48', rx: '12', fill: P.linen, stroke: 'rgba(107, 94, 84, 0.34)', 'stroke-width': '1.8' }, actStop);
  // 6 equal unit ticks along bar
  for (let k = 1; k < 6; k++) {
    const tx = 180 + (920 / 6) * k;
    svgEl('line', { x1: tx.toFixed(1), y1: '334', x2: tx.toFixed(1), y2: '382', stroke: P.sepia, 'stroke-width': '1.2', 'stroke-dasharray': '4 3', opacity: '0.45' }, actStop);
  }
  const tallyFillBar = svgEl('rect', { x: '180', y: '334', width: '0', height: '48', rx: '12', fill: P.sage, opacity: '0.88' }, actStop);
  svgEl('text', {
    x: '1122',
    y: '359',
    'dominant-baseline': 'central',
    fill: P.brass,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '15',
    'font-weight': '700',
    textContent: 'n = 6',
  }, actStop);

  const tallyEqPill = addScrim(actStop, 'Discovered Weight Sum:  0  /  6', {
    x: 640,
    y: 432,
    fontSize: 16.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.ink,
    fill: '#FDF5DF',
    stroke: P.brass,
    strokeWidth: 1.8,
    minWidth: 500,
    padX: 20,
    padY: 8,
  });

  const stopTriggerBanner = addScrim(
    actStop,
    '✓  STOPPING TRIGGER:  Σ w = n   →   ZERO ACTIVE PAIRS REMAIN (EXIT WEIGHING)',
    {
      x: 640,
      y: 516,
      fontSize: 14.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.sage,
      fill: '#EBF5EF',
      stroke: P.sage,
      strokeWidth: 2,
      padX: 20,
      padY: 9,
    },
  );

  // =========================================================================
  // ACT 2A (Beat 1): STAGE 2 — BUILD THE ACTIVE-PAIR GRAPH (GOLD w=2, SLATE w=1)
  // =========================================================================
  const actGraph = svgEl('g', { id: 's10_act_graph' }, svg);
  svgEl('ellipse', { cx: '640', cy: '334', rx: '480', ry: '195', fill: 'url(#s10_sun)' }, actGraph);

  svgEl('text', {
    x: '640',
    y: '76',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Stage 2 · Build the Active-Pair Graph',
  }, actGraph);

  const gNodes = [
    { id: 0, x: 250, y: 244, col: P.bottles[0] },
    { id: 1, x: 250, y: 424, col: P.bottles[1] },
    { id: 2, x: 670, y: 214, col: P.bottles[2] },
    { id: 3, x: 950, y: 214, col: P.bottles[3] },
    { id: 4, x: 950, y: 438, col: P.bottles[4] },
    { id: 5, x: 670, y: 438, col: P.bottles[5] },
  ];

  // Gold w=2 edge {0, 1}
  const graphGoldEdge = svgEl('g', { id: 's10_g_gold' }, actGraph);
  svgEl('line', {
    x1: '250',
    y1: '244',
    x2: '250',
    y2: '424',
    stroke: P.brass,
    'stroke-width': '9',
    'stroke-linecap': 'round',
  }, graphGoldEdge);
  addScrim(graphGoldEdge, 'w = 2 (Gold)', {
    x: 344,
    y: 334,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.brass,
    fill: '#FDF5DF',
    stroke: P.brass,
    strokeWidth: 1.6,
  });

  // Slate w=1 edges {2,3}, {3,4}, {4,5}, {5,2}
  const SLATE = '#4B5D6B';
  const slateSpecs = [
    { a: 2, b: 3, lx: 810, ly: 184, lbl: '{2,3} · w=1' },
    { a: 3, b: 4, lx: 1034, ly: 326, lbl: '{3,4} · w=1' },
    { a: 4, b: 5, lx: 810, ly: 468, lbl: '{4,5} · w=1' },
    { a: 5, b: 2, lx: 586, ly: 326, lbl: '{5,2} · w=1' },
  ];
  const graphSlateEdges = slateSpecs.map((sp) => {
    const eg = svgEl('g', {}, actGraph);
    svgEl('line', {
      x1: String(gNodes[sp.a].x),
      y1: String(gNodes[sp.a].y),
      x2: String(gNodes[sp.b].x),
      y2: String(gNodes[sp.b].y),
      stroke: SLATE,
      'stroke-width': '5.5',
      'stroke-linecap': 'round',
    }, eg);
    addScrim(eg, sp.lbl, {
      x: sp.lx,
      y: sp.ly,
      fontSize: 12.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: SLATE,
      fill: '#F1F5F8',
      stroke: SLATE,
      padX: 10,
      padY: 4,
      shadow: false,
    });
    return eg;
  });

  // Render the 6 slot nodes cleanly on top
  gNodes.forEach((nd) => {
    const ng = svgEl('g', { transform: `translate(${nd.x}, ${nd.y})` }, actGraph);
    svgEl('circle', { cx: '0', cy: '0', r: '32', fill: P.parchment, stroke: nd.col, 'stroke-width': '3.5' }, ng);
    svgEl('text', {
      x: '0',
      y: '-5',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: P.ink,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '20',
      'font-weight': '700',
      textContent: String(nd.id),
    }, ng);
    svgEl('text', {
      x: '0',
      y: '15',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '9.5',
      'font-weight': '600',
      textContent: `Slot ${nd.id}`,
    }, ng);
  });

  const graphLegend = addScrim(
    actGraph,
    'Gold Edge (w = 2): Mutual 2-Cycle   ·   Slate Edge (w = 1): Single-Direction Match',
    {
      x: 640,
      y: 534,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.ink,
      fill: '#FDF8EC',
      stroke: P.brass,
      padX: 18,
      padY: 6,
    },
  );

  // =========================================================================
  // ACT 2B (Beat 2): STAGE 2 — LOCK WEIGHT-2 ISOLATED 2-CYCLE {0, 1}
  // =========================================================================
  const actSwap2 = svgEl('g', { id: 's10_act_swap2' }, svg);
  svgEl('ellipse', { cx: '460', cy: '340', rx: '350', ry: '190', fill: 'url(#s10_sun)' }, actSwap2);

  svgEl('text', {
    x: '640',
    y: '76',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Stage 2 · Weight-2 Edges Are Isolated 2-Cycles',
  }, actSwap2);

  const s2TableY = 452;
  svgEl('rect', { x: '130', y: String(s2TableY + 18), width: '580', height: '14', rx: '7', fill: '#4A3828', opacity: '0.13' }, actSwap2);
  svgEl('rect', { x: '114', y: String(s2TableY), width: '612', height: '22', rx: '8', fill: 'url(#s10_oak)', stroke: P.ink, 'stroke-width': '1.8' }, actSwap2);

  const c0x = 280;
  const c1x = 560;
  const s2Coaster0 = bottles.createSvgCoaster(1, { x: c0x, y: s2TableY - 2, width: 96, scale: 1.0, hidden: true, slotIndex: 0 });
  const s2Coaster1 = bottles.createSvgCoaster(0, { x: c1x, y: s2TableY - 2, width: 96, scale: 1.0, hidden: true, slotIndex: 1 });
  actSwap2.appendChild(s2Coaster0);
  actSwap2.appendChild(s2Coaster1);

  const swap2Guide = svgEl('path', {
    d: `M ${c0x + 12} 274 Q 420 186 ${c1x - 12} 274`,
    fill: 'none',
    stroke: P.brass,
    'stroke-width': '3.5',
    'stroke-dasharray': '7 5',
    'marker-start': 'url(#s10_arr_brass)',
    'marker-end': 'url(#s10_arr_brass)',
  }, actSwap2);

  const s2Btl0Wrap = svgEl('g', { id: 's10_s2_b0' }, actSwap2);
  const s2Btl0 = bottles.createSvgBottle(0, { x: 0, y: 0, scale: 1.26 });
  s2Btl0Wrap.appendChild(s2Btl0);

  const s2Btl1Wrap = svgEl('g', { id: 's10_s2_b1' }, actSwap2);
  const s2Btl1 = bottles.createSvgBottle(1, { x: 0, y: 0, scale: 1.26 });
  s2Btl1Wrap.appendChild(s2Btl1);

  const s2LockStamp = addScrim(
    actSwap2,
    '✓  Swap {0, 1} → Both Match True Coasters · Locked Immediately!',
    {
      x: 420,
      y: 172,
      fontSize: 14,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.sage,
      fill: '#EBF5EF',
      stroke: P.sage,
      strokeWidth: 1.8,
      padX: 16,
      padY: 7,
    },
  );

  // Right card showing unlocked slate subgraph remaining
  const s2SubCard = svgEl('g', {}, actSwap2);
  svgEl('rect', { x: '790', y: '188', width: '400', height: '296', rx: '16', fill: P.parchment, stroke: SLATE, 'stroke-width': '2' }, s2SubCard);
  svgEl('text', { x: '990', y: '220', 'text-anchor': 'middle', fill: SLATE, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12.5', 'font-weight': '700', textContent: 'REMAINING UNLOCKED SUBGRAPH' }, s2SubCard);
  svgEl('polygon', { points: '920,270 1060,270 1060,400 920,400', fill: 'none', stroke: SLATE, 'stroke-width': '4' }, s2SubCard);
  [
    { id: 2, x: 920, y: 270 },
    { id: 3, x: 1060, y: 270 },
    { id: 4, x: 1060, y: 400 },
    { id: 5, x: 920, y: 400 },
  ].forEach((n) => {
    svgEl('circle', { cx: String(n.x), cy: String(n.y), r: '22', fill: P.parchment, stroke: P.bottles[n.id], 'stroke-width': '2.8' }, s2SubCard);
    svgEl('text', { x: String(n.x), y: String(n.y + 1), 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': '15', 'font-weight': '700', textContent: String(n.id) }, s2SubCard);
  });
  svgEl('text', { x: '990', y: '458', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '13.5', textContent: 'Only weight-1 edges remain (no 2-cycles!)' }, s2SubCard);

  // =========================================================================
  // ACT 3A (Beat 3): EXACT DEGREE-2 PROOF DIAGRAM
  // =========================================================================
  const actDeg2 = svgEl('g', { id: 's10_act_deg2' }, svg);
  svgEl('ellipse', { cx: '640', cy: '330', rx: '460', ry: '190', fill: 'url(#s10_sun)' }, actDeg2);

  svgEl('text', {
    x: '640',
    y: '76',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Why Every Unlocked Slot Has Exact Degree 2',
  }, actDeg2);

  const dY = 324;
  const degInG = svgEl('g', { id: 's10_deg_in' }, actDeg2);
  svgEl('line', {
    x1: '306',
    y1: String(dY),
    x2: '554',
    y2: String(dY),
    stroke: P.terracotta,
    'stroke-width': '4.5',
    'marker-end': 'url(#s10_arr_terra)',
  }, degInG);
  addScrim(degInG, '1 Incoming Bottle', { x: 430, y: 262, fontSize: 14, fontFamily: 'mono', fontWeight: 700, color: P.terracotta, stroke: P.terracotta });
  addScrim(degInG, "Coaster v's true owner", { x: 430, y: 374, fontSize: 13.5, fontFamily: 'body', fontWeight: 600, color: P.sepia });

  const degOutG = svgEl('g', { id: 's10_deg_out' }, actDeg2);
  svgEl('line', {
    x1: '720',
    y1: String(dY),
    x2: '968',
    y2: String(dY),
    stroke: P.delft,
    'stroke-width': '4.5',
    'marker-end': 'url(#s10_arr_delft)',
  }, degOutG);
  addScrim(degOutG, '1 Outgoing Target', { x: 850, y: 262, fontSize: 14, fontFamily: 'mono', fontWeight: 700, color: P.delft, stroke: P.delft });
  addScrim(degOutG, "Bottle v's true coaster", { x: 850, y: 374, fontSize: 13.5, fontFamily: 'body', fontWeight: 600, color: P.sepia });

  [
    { x: 240, r: 58, t1: 'Slot w', t2: 'incoming', col: P.terracotta },
    { x: 640, r: 74, t1: 'Slot v', t2: 'deg(v) = 2', col: P.brass, hero: true },
    { x: 1040, r: 58, t1: 'Slot u', t2: 'outgoing', col: P.delft },
  ].forEach((nd) => {
    const ng = svgEl('g', { transform: `translate(${nd.x}, ${dY})` }, actDeg2);
    svgEl('circle', { cx: '0', cy: '0', r: String(nd.r), fill: nd.hero ? '#FDF5DF' : P.parchment, stroke: nd.col, 'stroke-width': nd.hero ? '3.8' : '2.8' }, ng);
    svgEl('text', { x: '0', y: '-10', 'text-anchor': 'middle', fill: P.ink, 'font-family': "'Fraunces', Georgia, serif", 'font-size': nd.hero ? '28' : '22', 'font-weight': '700', textContent: nd.t1 }, ng);
    svgEl('text', { x: '0', y: '20', 'text-anchor': 'middle', fill: nd.col, 'font-family': "'JetBrains Mono', monospace", 'font-size': nd.hero ? '14.5' : '12.5', 'font-weight': '700', textContent: nd.t2 }, ng);
  });

  const degProofPill = addScrim(
    actDeg2,
    'No Self-Loops (f(p₀) = 0)  &  No 2-Cycles (Locked!)  ⇒  w ≠ u  ⇒  Exact Degree 2 Everywhere!',
    {
      x: 640,
      y: 504,
      fontSize: 14,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.ink,
      fill: '#FDF5DF',
      stroke: P.brass,
      strokeWidth: 1.6,
      padX: 18,
      padY: 9,
    },
  );

  // =========================================================================
  // ACT 3B (Beat 4): STAGE 3 — ANIMATED DFS WALKING WEIGHT-1 EDGES
  // =========================================================================
  const actDfs = svgEl('g', { id: 's10_act_dfs' }, svg);
  svgEl('ellipse', { cx: '410', cy: '340', rx: '340', ry: '190', fill: 'url(#s10_sun)' }, actDfs);

  svgEl('text', {
    x: '640',
    y: '76',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Stage 3 · DFS Computes Every Closed Loop Automatically',
  }, actDfs);

  // Left: Interactive DFS graph on unlocked slots {2, 3, 4, 5}
  const dfsPts = [
    { id: 2, x: 250, y: 224 },
    { id: 3, x: 540, y: 224 },
    { id: 4, x: 540, y: 440 },
    { id: 5, x: 250, y: 440 },
  ];
  // Base neutral slate edges
  for (let i = 0; i < 4; i++) {
    const a = dfsPts[i];
    const b = dfsPts[(i + 1) % 4];
    svgEl('line', {
      x1: String(a.x),
      y1: String(a.y),
      x2: String(b.x),
      y2: String(b.y),
      stroke: SLATE,
      'stroke-width': '5',
      opacity: '0.28',
    }, actDfs);
  }
  // Highlighted DFS-discovered edges that draw sequentially
  const dfsEdgeEls = [];
  for (let i = 0; i < 4; i++) {
    const a = dfsPts[i];
    const b = dfsPts[(i + 1) % 4];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const l = svgEl('line', {
      x1: String(a.x),
      y1: String(a.y),
      x2: String(b.x),
      y2: String(b.y),
      stroke: P.delft,
      'stroke-width': '6.5',
      'stroke-linecap': 'round',
      'stroke-dasharray': String(len),
      'stroke-dashoffset': String(len),
    }, actDfs);
    dfsEdgeEls.push(l);
  }

  // DFS slot nodes + visited halo rings
  const dfsVisitedRings = [];
  dfsPts.forEach((pt) => {
    const ng = svgEl('g', { transform: `translate(${pt.x}, ${pt.y})` }, actDfs);
    const ring = svgEl('circle', { cx: '0', cy: '0', r: '42', fill: 'rgba(61, 126, 166, 0.16)', stroke: P.delft, 'stroke-width': '2.4', 'stroke-dasharray': '5 4' }, ng);
    dfsVisitedRings.push(ring);
    svgEl('circle', { cx: '0', cy: '0', r: '31', fill: P.parchment, stroke: P.bottles[pt.id], 'stroke-width': '3.5' }, ng);
    svgEl('text', { x: '0', y: '1', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': '21', 'font-weight': '700', textContent: String(pt.id) }, ng);
  });

  // Glowing terracotta/brass DFS explorer token
  const dfsTracer = svgEl('g', { id: 's10_dfs_tracer' }, actDfs);
  svgEl('circle', { cx: '0', cy: '0', r: '15', fill: P.terracotta, stroke: '#FFFBF2', 'stroke-width': '3' }, dfsTracer);
  svgEl('circle', { cx: '0', cy: '0', r: '6', fill: '#FFFBF2' }, dfsTracer);

  // Right: Live DFS Component Trace Card
  const dfsCard = svgEl('g', { id: 's10_dfs_card' }, actDfs);
  svgEl('rect', { x: '674', y: '176', width: '524', height: '304', rx: '16', fill: P.parchment, stroke: P.delft, 'stroke-width': '2.2' }, dfsCard);
  svgEl('text', { x: '936', y: '214', 'text-anchor': 'middle', fill: P.delft, 'font-family': "'JetBrains Mono', monospace", 'font-size': '13', 'font-weight': '700', 'letter-spacing': '0.08em', textContent: 'DEPTH-FIRST SEARCH (CONNECTED COMPONENTS)' }, dfsCard);

  const dfsStepsText = [
    '1. Start at unvisited Slot 2  →  mark visited',
    '2. Follow weight-1 edge to Slot 3  →  mark visited',
    '3. Follow weight-1 edge to Slot 4  →  mark visited',
    '4. Follow weight-1 edge to Slot 5  →  returns to 2!',
  ];
  const dfsStepEls = dfsStepsText.map((txt, idx) =>
    addScrim(dfsCard, txt, {
      x: 936,
      y: 262 + idx * 42,
      fontSize: 13,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.ink,
      fill: '#F1F6FA',
      stroke: 'rgba(61, 126, 166, 0.35)',
      minWidth: 468,
      padX: 12,
      padY: 5,
      shadow: false,
    }),
  );

  const dfsFoundPill = addScrim(dfsCard, '✓  DFS Component #1:  2 — 3 — 4 — 5 — 2  (L = 4)', {
    x: 936,
    y: 444,
    fontSize: 14,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sage,
    fill: '#EBF5EF',
    stroke: P.sage,
    strokeWidth: 1.8,
    padX: 16,
    padY: 7,
  });

  const dfsFooter = addScrim(actDfs, 'Zero Guesswork: DFS Partitions Every Degree-2 Graph into Disjoint Loops (L ≥ 3)', {
    x: 640,
    y: 534,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.ink,
    fill: '#FDF5DF',
    stroke: P.brass,
    padX: 18,
    padY: 6,
  });

  // =========================================================================
  // ACT 3C (Beat 5): SMALL n=6 EXPANDING TO LARGE n=12 (3 DISJOINT LOOPS!)
  // =========================================================================
  const actMultiLoop = svgEl('g', { id: 's10_act_multiloop' }, svg);
  svgEl('ellipse', { cx: '640', cy: '340', rx: '500', ry: '195', fill: 'url(#s10_sun)' }, actMultiLoop);

  svgEl('text', {
    x: '640',
    y: '76',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Larger Tables: DFS Exposes Every Disjoint Loop Side by Side',
  }, actMultiLoop);

  const buildLoopPolygon = (parent, cx, cy, r, labels, nodeCols, strokeCol, tintFill, caption, captionY = 486) => {
    const cg = svgEl('g', {}, parent);
    const pts = labels.map((lbl, i) => {
      const a = ((-90 + (i * 360) / labels.length) * Math.PI) / 180;
      return { lbl, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, col: nodeCols[i % nodeCols.length] };
    });
    const polyStr = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    svgEl('polygon', {
      points: polyStr,
      fill: tintFill,
      stroke: strokeCol,
      'stroke-width': '4.2',
      'stroke-linejoin': 'round',
    }, cg);
    pts.forEach((p) => {
      const ng = svgEl('g', { transform: `translate(${p.x.toFixed(1)}, ${p.y.toFixed(1)})` }, cg);
      svgEl('circle', { cx: '0', cy: '0', r: '21', fill: P.parchment, stroke: p.col, 'stroke-width': '2.8' }, ng);
      svgEl('text', {
        x: '0',
        y: '0.5',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: P.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '14.5',
        'font-weight': '700',
        textContent: p.lbl,
      }, ng);
    });
    addScrim(cg, caption, {
      x: cx,
      y: captionY,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: strokeCol,
      fill: tintFill,
      stroke: strokeCol,
      strokeWidth: 1.5,
      padX: 12,
      padY: 5,
    });
    return cg;
  };

  // Left card: Small n = 6 (1 loop of length 4)
  const smallTableG = svgEl('g', { id: 's10_small_tbl' }, actMultiLoop);
  svgEl('rect', { x: '68', y: '154', width: '286', height: '352', rx: '16', fill: P.parchment, stroke: 'rgba(107, 94, 84, 0.34)', 'stroke-width': '1.8' }, smallTableG);
  svgEl('text', { x: '211', y: '188', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12.5', 'font-weight': '700', textContent: 'SMALL TABLE (n = 6)' }, smallTableG);
  buildLoopPolygon(smallTableG, 211, 326, 84, ['2', '3', '4', '5'], [P.bottles[2], P.bottles[3], P.bottles[4], P.bottles[5]], P.delft, 'rgba(61, 126, 166, 0.11)', '1 Loop (L = 4)', 470);

  // Expansion arrow
  const expandArrowG = svgEl('g', { id: 's10_expand_arr' }, actMultiLoop);
  svgEl('path', { d: 'M 366 330 L 424 330', fill: 'none', stroke: P.brass, 'stroke-width': '4', 'marker-end': 'url(#s10_arr_brass)' }, expandArrowG);
  addScrim(expandArrowG, 'Larger n', { x: 394, y: 298, fontSize: 12, fontFamily: 'mono', fontWeight: 700, color: P.brass, stroke: P.brass, shadow: false });

  // Right framed panel: Larger n = 12 Unlocked Slots -> THREE SEPARATE DISJOINT LOOPS!
  const largeTableG = svgEl('g', { id: 's10_large_tbl' }, actMultiLoop);
  svgEl('rect', { x: '442', y: '154', width: '774', height: '352', rx: '16', fill: '#FFFDF8', stroke: P.brass, 'stroke-width': '2' }, largeTableG);
  svgEl('text', { x: '829', y: '188', 'text-anchor': 'middle', fill: P.brass, 'font-family': "'JetBrains Mono', monospace", 'font-size': '13', 'font-weight': '700', 'letter-spacing': '0.07em', textContent: 'LARGER TABLE (12 UNLOCKED SLOTS)  ·  3 DISJOINT LOOPS FOUND BY DFS' }, largeTableG);

  const largeC1 = buildLoopPolygon(
    largeTableG,
    572,
    330,
    78,
    ['0', '1', '2'],
    [P.sage, P.sage, P.sage],
    P.sage,
    'rgba(78, 140, 111, 0.14)',
    'Loop 1 (L = 3)',
    470,
  );
  const largeC2 = buildLoopPolygon(
    largeTableG,
    828,
    330,
    82,
    ['3', '4', '5', '6'],
    [P.delft, P.delft, P.delft, P.delft],
    P.delft,
    'rgba(61, 126, 166, 0.14)',
    'Loop 2 (L = 4)',
    470,
  );
  const largeC3 = buildLoopPolygon(
    largeTableG,
    1086,
    330,
    86,
    ['7', '8', '9', '10', '11'],
    [P.terracotta, P.terracotta, P.terracotta, P.terracotta, P.terracotta],
    P.terracotta,
    'rgba(217, 93, 72, 0.14)',
    'Loop 3 (L = 5)',
    470,
  );

  const multiFooter = addScrim(
    actMultiLoop,
    'Every Loop Shares Zero Slots With Any Other Loop  ⇒  Ready for Parallel Orientation!',
    {
      x: 640,
      y: 538,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.sage,
      fill: '#EBF5EF',
      stroke: P.sage,
      strokeWidth: 1.5,
      padX: 18,
      padY: 6,
    },
  );

  // =========================================================================
  // ACT 4A (Beat 6): STAGE 4 — TWO VALID ROTATIONS (+L vs 0)
  // =========================================================================
  const actOrient = svgEl('g', { id: 's10_act_orient' }, svg);
  svgEl('ellipse', { cx: '640', cy: '340', rx: '480', ry: '195', fill: 'url(#s10_sun)' }, actOrient);

  svgEl('text', {
    x: '640',
    y: '76',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Stage 4 · Each Closed Loop Has Only Two Valid Rotations',
  }, actOrient);

  const buildOrientedLoop = (parent, cx, cy, r, cw, col, title, scoreTxt) => {
    const og = svgEl('g', {}, parent);
    addScrim(og, title, { x: cx, y: 164, fontSize: 14.5, fontFamily: 'editorial', fontWeight: 700, color: col, stroke: col });

    const ids = [2, 3, 4, 5];
    const pts = ids.map((id, i) => {
      const a = ((-90 + i * 90) * Math.PI) / 180;
      return { id, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    });

    for (let i = 0; i < 4; i++) {
      const from = pts[i];
      const to = pts[cw ? (i + 1) % 4 : (i + 3) % 4];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.hypot(dx, dy);
      const sx = from.x + (dx / len) * 32;
      const sy = from.y + (dy / len) * 32;
      const ex = to.x - (dx / len) * 36;
      const ey = to.y - (dy / len) * 36;
      svgEl('line', {
        x1: sx.toFixed(1),
        y1: sy.toFixed(1),
        x2: ex.toFixed(1),
        y2: ey.toFixed(1),
        stroke: col,
        'stroke-width': '4',
        'marker-end': `url(#${cw ? 's10_arr_sage' : 's10_arr_terra'})`,
      }, og);
    }

    svgEl('text', {
      x: String(cx),
      y: String(cy + 4),
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: col,
      'font-family': "'Fraunces', Georgia, serif",
      'font-size': '34',
      'font-weight': '700',
      textContent: cw ? '↻' : '↺',
    }, og);

    pts.forEach((p) => {
      const ng = svgEl('g', { transform: `translate(${p.x.toFixed(1)}, ${p.y.toFixed(1)})` }, og);
      svgEl('circle', { cx: '0', cy: '0', r: '26', fill: P.parchment, stroke: P.bottles[p.id], 'stroke-width': '3.2' }, ng);
      svgEl('text', {
        x: '0',
        y: '1',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: P.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '18',
        'font-weight': '700',
        textContent: String(p.id),
      }, ng);
    });

    addScrim(og, scoreTxt, {
      x: cx,
      y: 522,
      fontSize: 14,
      fontFamily: 'mono',
      fontWeight: 700,
      color: col,
      fill: cw ? '#EBF5EF' : '#FBECE8',
      stroke: col,
      strokeWidth: 1.5,
      padX: 14,
      padY: 7,
    });
    return og;
  };

  const orientCW = buildOrientedLoop(actOrient, 360, 344, 112, true, P.sage, 'Clockwise Shift (+1)', 'True Orientation  ⇒  Score = +L (+4)');
  const orientCCW = buildOrientedLoop(actOrient, 920, 344, 112, false, P.terracotta, 'Counter-Clockwise Shift (−1)', 'Reversed (L ≥ 3)  ⇒  Score = 0');

  const vsBadge = svgEl('g', { transform: 'translate(640, 344)' }, actOrient);
  svgEl('circle', { cx: '0', cy: '0', r: '28', fill: '#FDF5DF', stroke: P.brass, 'stroke-width': '2.4' }, vsBadge);
  svgEl('text', {
    x: '0',
    y: '1',
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-style': 'italic',
    'font-size': '19',
    'font-weight': '700',
    textContent: 'or',
  }, vsBadge);

  // =========================================================================
  // ACT 4B (Beat 7): MULTIPLE LOOPS ROTATED SIMULTANEOUSLY ON p0 -> BRASS SCALE
  // =========================================================================
  const actScaleGrp = svgEl('g', { id: 's10_act_scalegrp' }, svg);
  svgEl('ellipse', { cx: '640', cy: '340', rx: '480', ry: '195', fill: 'url(#s10_sun)' }, actScaleGrp);

  svgEl('text', {
    x: '640',
    y: '76',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Stage 4 · Rotate Multiple Loops Simultaneously in 1 Query',
  }, actScaleGrp);

  svgEl('text', {
    x: '306',
    y: '162',
    'text-anchor': 'middle',
    fill: P.brass,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '12.5',
    'font-weight': '700',
    textContent: 'DISJOINT EQUAL-LENGTH LOOPS (L = 4) · ZERO SHARED SLOTS',
  }, actScaleGrp);

  const grpLoops = [
    { y: 224, lbl: 'Loop 1 (L = 4)', bit: 'b₁ = 1 (CW)', active: true, col: P.sage },
    { y: 332, lbl: 'Loop 2 (L = 4)', bit: 'b₂ = 0 (p₀)', active: false, col: P.muted },
    { y: 440, lbl: 'Loop 3 (L = 4)', bit: 'b₃ = 1 (CW)', active: true, col: P.sage },
  ];

  const grpLoopEls = [];
  const grpLoopSpinners = [];
  grpLoops.forEach((gl) => {
    const g = svgEl('g', {}, actScaleGrp);
    svgEl('rect', {
      x: '94',
      y: String(gl.y - 34),
      width: '416',
      height: '68',
      rx: '12',
      fill: gl.active ? '#EBF5EF' : P.parchment,
      stroke: gl.active ? P.sage : 'rgba(107, 94, 84, 0.3)',
      'stroke-width': gl.active ? '2.2' : '1.4',
    }, g);

    // Mini rotating 4-loop glyph wrapped in outer translate so inner rotation is dead-centered!
    const spinOuter = svgEl('g', { transform: `translate(136, ${gl.y})` }, g);
    const spinInner = svgEl('g', {}, spinOuter);
    svgEl('polygon', {
      points: '0,-17 17,0 0,17 -17,0',
      fill: 'none',
      stroke: gl.active ? P.sage : P.muted,
      'stroke-width': '2.8',
    }, spinInner);
    [[-17, 0], [0, -17], [17, 0], [0, 17]].forEach(([dx, dy]) => {
      svgEl('circle', { cx: String(dx), cy: String(dy), r: '3.5', fill: gl.active ? P.sage : P.muted }, spinInner);
    });
    grpLoopSpinners.push({ el: spinInner, active: gl.active });

    svgEl('text', { x: '176', y: String(gl.y - 8), fill: P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': '14', 'font-weight': '700', textContent: gl.lbl }, g);
    svgEl('text', { x: '176', y: String(gl.y + 15), fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '12.5', textContent: gl.active ? 'Rotated CW in this 1 move (+4)' : 'Held untouched on p₀ (0)' }, g);
    addScrim(g, gl.bit, { x: 438, y: gl.y, fontSize: 12, fontFamily: 'mono', fontWeight: 700, color: gl.col, stroke: gl.col, shadow: false });
    svgEl('line', {
      x1: '512',
      y1: String(gl.y),
      x2: '600',
      y2: '340',
      stroke: gl.active ? P.sage : P.muted,
      'stroke-width': gl.active ? '2.8' : '1.5',
      'stroke-dasharray': gl.active ? null : '5 4',
      opacity: gl.active ? '0.88' : '0.4',
    }, g);
    grpLoopEls.push(g);
  });

  const orientScale = bottles.createSvgBrassScale({
    x: 696,
    y: 344,
    radius: 64,
    maxVal: 12,
    initialVal: 0,
    unit: '',
  });
  actScaleGrp.appendChild(orientScale);

  const divPipeline = svgEl('g', { id: 's10_div_pipe' }, actScaleGrp);
  svgEl('path', { d: 'M 776 344 L 836 344', fill: 'none', stroke: P.brass, 'stroke-width': '3.5', 'marker-end': 'url(#s10_arr_brass)' }, divPipeline);

  svgEl('rect', { x: '848', y: '202', width: '352', height: '280', rx: '16', fill: P.parchment, stroke: P.brass, 'stroke-width': '2' }, divPipeline);
  svgEl('text', { x: '1024', y: '238', 'text-anchor': 'middle', fill: P.brass, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12.5', 'font-weight': '700', textContent: 'DIVIDE SCORE BY LENGTH L' }, divPipeline);
  addScrim(divPipeline, 'f  =  L · Σ bⱼ  =  4 × 2  =  8', { x: 1024, y: 286, fontSize: 14.5, fontFamily: 'mono', fontWeight: 700, color: P.ink, stroke: P.sepia });
  svgEl('text', { x: '1024', y: '334', 'text-anchor': 'middle', fill: P.brass, 'font-family': "'JetBrains Mono', monospace", 'font-size': '18', 'font-weight': '700', textContent: '↓  ÷ L (= 4)' }, divPipeline);
  addScrim(divPipeline, 'Score ÷ L  =  2  (exact 0/1 sum)', { x: 1024, y: 382, fontSize: 14, fontFamily: 'mono', fontWeight: 700, color: P.sage, fill: '#EBF5EF', stroke: P.sage });
  svgEl('text', { x: '1024', y: '442', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'Fraunces', Georgia, serif", 'font-style': 'italic', 'font-size': '16', textContent: 'Binary Lindström Coin Weighing!' }, divPipeline);

  addScrim(actScaleGrp, '1 Full-Table Query on p₀ Tests Multiple Equal-Length Loops Simultaneously!', {
    x: 640,
    y: 534,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.ink,
    fill: '#FDF5DF',
    stroke: P.brass,
    padX: 18,
    padY: 6,
  });

  // =========================================================================
  // ACT 4C (Beat 8): LONG vs SHORT LOOPS -> O(n / log n) EXTRA QUERIES
  // =========================================================================
  const actComplexity = svgEl('g', { id: 's10_act_comp' }, svg);
  svgEl('ellipse', { cx: '640', cy: '330', rx: '480', ry: '195', fill: 'url(#s10_sun)' }, actComplexity);

  svgEl('text', {
    x: '640',
    y: '76',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Orienting Every Loop in O(n / log n) Extra Queries',
  }, actComplexity);

  const compLeft = svgEl('g', { id: 's10_comp_left' }, actComplexity);
  svgEl('rect', { x: '116', y: '154', width: '490', height: '302', rx: '16', fill: P.parchment, stroke: P.sage, 'stroke-width': '2.2' }, compLeft);
  svgEl('text', { x: '361', y: '188', 'text-anchor': 'middle', fill: P.sage, 'font-family': "'JetBrains Mono', monospace", 'font-size': '13.5', 'font-weight': '700', textContent: 'CASE 1 · LONG LOOPS (L > log₂ n)' }, compLeft);
  svgEl('circle', { cx: '361', cy: '274', r: '54', fill: '#EBF5EF', stroke: P.sage, 'stroke-width': '4', 'stroke-dasharray': '12 6' }, compLeft);
  svgEl('text', { x: '361', y: '276', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: P.ink, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '20', 'font-weight': '700', textContent: 'L > log n' }, compLeft);
  svgEl('text', { x: '361', y: '360', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '14.5', textContent: 'Total vertices = n  ⇒  fewer than n / log₂ n long loops' }, compLeft);
  addScrim(compLeft, 'Test 1-by-1 directly  →  < n / log₂ n queries', { x: 361, y: 412, fontSize: 13.5, fontFamily: 'mono', fontWeight: 700, color: P.sage, fill: '#EBF5EF', stroke: P.sage });

  const compRight = svgEl('g', { id: 's10_comp_right' }, actComplexity);
  svgEl('rect', { x: '674', y: '154', width: '490', height: '302', rx: '16', fill: P.parchment, stroke: P.delft, 'stroke-width': '2.2' }, compRight);
  svgEl('text', { x: '919', y: '188', 'text-anchor': 'middle', fill: P.delft, 'font-family': "'JetBrains Mono', monospace", 'font-size': '13.5', 'font-weight': '700', textContent: 'CASE 2 · SHORT LOOPS (3 ≤ L ≤ log₂ n)' }, compRight);
  [
    { x: 819, lbl: 'L=3' },
    { x: 919, lbl: 'L=4' },
    { x: 1019, lbl: '…' },
  ].forEach((m) => {
    svgEl('circle', { cx: String(m.x), cy: '274', r: '34', fill: '#EAF2F8', stroke: P.delft, 'stroke-width': '3' }, compRight);
    svgEl('text', { x: String(m.x), y: '275', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': '14', 'font-weight': '700', textContent: m.lbl }, compRight);
  });
  svgEl('text', { x: '919', y: '360', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '14.5', textContent: 'Group equal lengths & compress in parallel via Lindström' }, compRight);
  addScrim(compRight, 'Compressed across classes  →  O(n / log n) queries', { x: 919, y: 412, fontSize: 13.5, fontFamily: 'mono', fontWeight: 700, color: P.delft, fill: '#EAF2F8', stroke: P.delft });

  const compTotalPill = addScrim(
    actComplexity,
    'Combined Orientation Cost  =  O(n / log n)   ≪   O(n log log n)',
    {
      x: 640,
      y: 518,
      fontSize: 15.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.ink,
      fill: '#FDF5DF',
      stroke: P.brass,
      strokeWidth: 1.8,
      padX: 22,
      padY: 9,
    },
  );

  // =========================================================================
  // ACT 5 (Beat 9): ALL FOUR STAGES CONNECTED -> LIVE WALKTHROUGH BRIDGE
  // =========================================================================
  const actReady = svgEl('g', { id: 's10_act_ready' }, svg);
  svgEl('ellipse', { cx: '640', cy: '330', rx: '480', ry: '195', fill: 'url(#s10_sun)' }, actReady);

  svgEl('text', {
    x: '640',
    y: '76',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '32',
    'font-weight': '600',
    textContent: 'All Four Stages Connected · Zero Guesswork',
  }, actReady);

  svgEl('line', { x1: '180', y1: '310', x2: '1100', y2: '310', stroke: P.brass, 'stroke-width': '3', 'stroke-dasharray': '8 6', opacity: '0.65' }, actReady);

  const stageCards = [
    { x: 202, num: 'STAGE 1', title: 'Stop at Σw=n', sub: '0 active pairs left', col: P.brass },
    { x: 494, num: 'STAGE 2', title: 'Graph & w=2', sub: 'Lock all 2-cycles', col: P.terracotta },
    { x: 786, num: 'STAGE 3', title: 'DFS Loops', sub: 'Exact L ≥ 3 cycles', col: P.delft },
    { x: 1078, num: 'STAGE 4', title: 'Orient ∥', sub: 'O(n / log n) queries', col: P.sage },
  ];

  const stageCardEls = stageCards.map((sc) => {
    const outer = svgEl('g', { transform: `translate(${sc.x}, 310)` }, actReady);
    const pg = svgEl('g', {}, outer);
    svgEl('rect', { x: '-124', y: '-88', width: '248', height: '176', rx: '16', fill: P.parchment, stroke: sc.col, 'stroke-width': '2.6' }, pg);
    svgEl('text', { x: '0', y: '-48', 'text-anchor': 'middle', fill: sc.col, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12.5', 'font-weight': '700', 'letter-spacing': '0.1em', textContent: sc.num }, pg);
    svgEl('text', { x: '0', y: '-2', 'text-anchor': 'middle', fill: P.ink, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '24', 'font-weight': '700', textContent: sc.title }, pg);
    svgEl('text', { x: '0', y: '34', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12.5', 'font-weight': '600', textContent: sc.sub }, pg);
    svgEl('text', { x: '0', y: '66', 'text-anchor': 'middle', fill: P.sage, 'font-family': "'JetBrains Mono', monospace", 'font-size': '14', 'font-weight': '700', textContent: '✓ READY' }, pg);
    return pg;
  });

  const readyBridge = addScrim(
    actReady,
    'Next: Watch Every Move, Score, and Deduction Execute Live on Six Bottles →',
    {
      x: 640,
      y: 500,
      fontSize: 15,
      fontFamily: 'editorial',
      fontStyle: 'italic',
      fontWeight: 600,
      color: P.ink,
      fill: '#FDF5DF',
      stroke: P.brass,
      strokeWidth: 1.6,
      padX: 24,
      padY: 10,
    },
  );

  // =========================================================================
  // MASTER AUDIO-SYNCED BIDIRECTIONAL GSAP TIMELINE
  // =========================================================================
  const tl = gsap.timeline({ paused: true });

  const uiState = { activeStage: 1, tallyStep: 0, s2Locked: 0 };
  const TALLY_EQS = [
    { w: 0, txt: 'Discovered Weight Sum:  0  /  6' },
    { w: 2, txt: 'Discovered Weight Sum:  2  /  6' },
    { w: 3, txt: 'Discovered Weight Sum:  2 + 1  =  3  /  6' },
    { w: 4, txt: 'Discovered Weight Sum:  2 + 1 + 1  =  4  /  6' },
    { w: 5, txt: 'Discovered Weight Sum:  2 + 1 + 1 + 1  =  5  /  6' },
    { w: 6, txt: 'Discovered Weight Sum:  2 + 1 + 1 + 1 + 1  =  6  =  n  ✓' },
  ];

  function syncUI() {
    const st = Math.max(1, Math.min(5, Math.round(uiState.activeStage)));
    stagePills.forEach((sp, i) => {
      const idx = i + 1;
      const isDone = idx < st;
      const isCurr = idx === st;
      if (isCurr) {
        sp.rect.setAttribute('fill', '#FDF5DF');
        sp.rect.setAttribute('stroke', P.brass);
        sp.rect.setAttribute('stroke-width', '2.2');
        sp.txt.setAttribute('fill', P.ink);
      } else if (isDone) {
        sp.rect.setAttribute('fill', '#EBF5EF');
        sp.rect.setAttribute('stroke', P.sage);
        sp.rect.setAttribute('stroke-width', '1.6');
        sp.txt.setAttribute('fill', P.sage);
      } else {
        sp.rect.setAttribute('fill', P.parchment);
        sp.rect.setAttribute('stroke', 'rgba(107, 94, 84, 0.28)');
        sp.rect.setAttribute('stroke-width', '1.3');
        sp.txt.setAttribute('fill', P.muted);
      }
    });

    const ts = Math.max(0, Math.min(5, Math.round(uiState.tallyStep)));
    const entry = TALLY_EQS[ts];
    tallyFillBar.setAttribute('width', ((entry.w / 6) * 920).toFixed(1));
    tallyEqPill.setText(entry.txt);

    const locked = Math.round(uiState.s2Locked) === 1;
    s2Coaster0.setMatched(locked);
    s2Coaster1.setMatched(locked);
    s2Btl0.setMatched(locked);
    s2Btl1.setMatched(locked);
  }

  // Initial states at t = 0
  tl.set(uiState, { activeStage: 1, tallyStep: 0, s2Locked: 0, onUpdate: syncUI }, 0);
  tl.set(orientScale._state, { val: 0, onUpdate: () => orientScale.setValue(orientScale._state.val) }, 0);

  tl.set(actStop, { autoAlpha: 1 }, 0);
  tl.set(stopMedallions, { autoAlpha: 0, scale: 0.68, transformOrigin: 'center' }, 0);
  tl.set(stopTriggerBanner, { autoAlpha: 0 }, 0);

  tl.set(actGraph, { autoAlpha: 0 }, 0);
  tl.set(graphGoldEdge, { autoAlpha: 0 }, 0);
  tl.set(graphSlateEdges, { autoAlpha: 0 }, 0);
  tl.set(graphLegend, { autoAlpha: 0 }, 0);

  tl.set(actSwap2, { autoAlpha: 0 }, 0);
  tl.set(s2Btl0Wrap, { x: c0x, y: s2TableY - 4, rotation: 0 }, 0);
  tl.set(s2Btl1Wrap, { x: c1x, y: s2TableY - 4, rotation: 0 }, 0);
  tl.set(s2LockStamp, { autoAlpha: 0 }, 0);
  tl.set(s2SubCard, { autoAlpha: 0 }, 0);

  tl.set(actDeg2, { autoAlpha: 0 }, 0);
  tl.set([degInG, degOutG, degProofPill], { autoAlpha: 0 }, 0);

  tl.set(actDfs, { autoAlpha: 0 }, 0);
  tl.set(dfsVisitedRings, { autoAlpha: 0 }, 0);
  tl.set(dfsTracer, { x: dfsPts[0].x, y: dfsPts[0].y, autoAlpha: 0 }, 0);
  tl.set(dfsStepEls, { autoAlpha: 0 }, 0);
  tl.set([dfsFoundPill, dfsFooter], { autoAlpha: 0 }, 0);

  tl.set(actMultiLoop, { autoAlpha: 0 }, 0);
  tl.set([smallTableG, expandArrowG, largeTableG, largeC1, largeC2, largeC3, multiFooter], { autoAlpha: 0 }, 0);

  tl.set(actOrient, { autoAlpha: 0 }, 0);
  tl.set([orientCW, orientCCW, vsBadge], { autoAlpha: 0 }, 0);

  tl.set(actScaleGrp, { autoAlpha: 0 }, 0);
  tl.set(grpLoopEls, { autoAlpha: 0 }, 0);
  tl.set(divPipeline, { autoAlpha: 0 }, 0);
  grpLoopSpinners.forEach((sp) => tl.set(sp.el, { rotation: 0, transformOrigin: 'center' }, 0));

  tl.set(actComplexity, { autoAlpha: 0 }, 0);
  tl.set([compLeft, compRight, compTotalPill], { autoAlpha: 0 }, 0);

  tl.set(actReady, { autoAlpha: 0 }, 0);
  tl.set(stageCardEls, { autoAlpha: 0, y: 18 }, 0);
  tl.set(readyBridge, { autoAlpha: 0 }, 0);

  // --- BEAT 0 (Stage 1): Live Weight Tally 2+1+1+1+1 = 6 = n -> Stopping Trigger! ---
  stopMedallions.forEach((med, i) => {
    const tPop = b0.start + b0.dur * (0.14 + i * 0.11);
    tl.to(med, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, tPop);
    tl.to(uiState, { tallyStep: i + 1, duration: 0.01, onUpdate: syncUI }, tPop + 0.15);
  });
  tl.to(stopTriggerBanner, { autoAlpha: 1, duration: 0.7 }, b0.start + b0.dur * 0.74);

  // --- BEAT 1 (Stage 2A): Build Active-Pair Graph (Gold w=2, Slate w=1) ---
  tl.to(actStop, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b1.start - 0.15);
  tl.to(uiState, { activeStage: 2, duration: 0.01, onUpdate: syncUI }, b1.start + 0.1);
  tl.to(actGraph, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b1.start + 0.2);
  tl.to(graphGoldEdge, { autoAlpha: 1, duration: 0.65 }, b1.start + b1.dur * 0.28);
  tl.to(graphSlateEdges, { autoAlpha: 1, duration: 0.5, stagger: 0.45 }, b1.start + b1.dur * 0.48);
  tl.to(graphLegend, { autoAlpha: 1, duration: 0.55 }, b1.start + b1.dur * 0.78);

  // --- BEAT 2 (Stage 2B): Lock Weight-2 Isolated 2-Cycle {0, 1} ---
  tl.to(actGraph, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b2.start - 0.15);
  tl.to(actSwap2, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b2.start + 0.2);

  const swT = b2.start + b2.dur * 0.22;
  tl.to(s2Btl0Wrap, { y: s2TableY - 120, rotation: 9, duration: 0.7, ease: 'power2.out' }, swT);
  tl.to(s2Btl0Wrap, { x: c1x, duration: 1.4, ease: 'power2.inOut' }, swT);
  tl.to(s2Btl0Wrap, { y: s2TableY - 4, rotation: 0, duration: 0.7, ease: 'back.out(1.5)' }, swT + 0.7);

  tl.to(s2Btl1Wrap, { y: s2TableY - 68, rotation: -9, duration: 0.7, ease: 'power2.out' }, swT);
  tl.to(s2Btl1Wrap, { x: c0x, duration: 1.4, ease: 'power2.inOut' }, swT);
  tl.to(s2Btl1Wrap, { y: s2TableY - 4, rotation: 0, duration: 0.7, ease: 'back.out(1.5)' }, swT + 0.7);

  tl.to(uiState, { s2Locked: 1, duration: 0.01, onUpdate: syncUI }, swT + 1.38);
  tl.to(swap2Guide, { autoAlpha: 0.22, duration: 0.4 }, swT + 1.45);
  tl.to(s2LockStamp, { autoAlpha: 1, duration: 0.6 }, swT + 1.6);
  tl.to(s2SubCard, { autoAlpha: 1, duration: 0.7 }, b2.start + b2.dur * 0.62);

  // --- BEAT 3: Exact Degree-2 Proof ---
  tl.to(actSwap2, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b3.start - 0.15);
  tl.to(actDeg2, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b3.start + 0.2);
  tl.to(degOutG, { autoAlpha: 1, duration: 0.65 }, b3.start + b3.dur * 0.2);
  tl.to(degInG, { autoAlpha: 1, duration: 0.65 }, b3.start + b3.dur * 0.42);
  tl.to(degProofPill, { autoAlpha: 1, duration: 0.7 }, b3.start + b3.dur * 0.68);

  // --- BEAT 4 (Stage 3A): Animated DFS Walking Weight-1 Edges ---
  tl.to(actDeg2, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b4.start - 0.15);
  tl.to(uiState, { activeStage: 3, duration: 0.01, onUpdate: syncUI }, b4.start + 0.1);
  tl.to(actDfs, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b4.start + 0.2);

  const dfsT0 = b4.start + b4.dur * 0.14;
  const dfsStepGap = (b4.dur * 0.56) / 4;
  // Step 0: Start at Node 2
  tl.to(dfsTracer, { autoAlpha: 1, duration: 0.4 }, dfsT0);
  tl.to(dfsVisitedRings[0], { autoAlpha: 1, duration: 0.4 }, dfsT0 + 0.15);
  tl.to(dfsStepEls[0], { autoAlpha: 1, duration: 0.45 }, dfsT0 + 0.25);

  // Walk 2->3, 3->4, 4->5, 5->2
  for (let i = 0; i < 4; i++) {
    const st = dfsT0 + 0.9 + i * dfsStepGap;
    const nextPt = dfsPts[(i + 1) % 4];
    tl.to(dfsEdgeEls[i], { strokeDashoffset: 0, duration: 1.15, ease: 'power2.inOut' }, st);
    tl.to(dfsTracer, { x: nextPt.x, y: nextPt.y, duration: 1.15, ease: 'power2.inOut' }, st);
    if (i < 3) {
      tl.to(dfsVisitedRings[i + 1], { autoAlpha: 1, duration: 0.4 }, st + 1.0);
      tl.to(dfsStepEls[i + 1], { autoAlpha: 1, duration: 0.45 }, st + 1.05);
    } else {
      // Fade tracer dot out cleanly once DFS returns to Node 2 so "2" stays 100% readable
      tl.to(dfsTracer, { autoAlpha: 0, duration: 0.45, ease: 'power2.out' }, st + 1.2);
    }
  }
  tl.to(dfsFoundPill, { autoAlpha: 1, duration: 0.65 }, b4.start + b4.dur * 0.76);
  tl.to(dfsFooter, { autoAlpha: 1, duration: 0.65 }, b4.start + b4.dur * 0.86);

  // --- BEAT 5 (Stage 3B): Small n=6 Expanding to Large n=12 (3 Disjoint Loops!) ---
  tl.to(actDfs, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b5.start - 0.15);
  tl.to(actMultiLoop, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b5.start + 0.2);

  tl.to(smallTableG, { autoAlpha: 1, duration: 0.65 }, b5.start + 0.6);
  tl.to(expandArrowG, { autoAlpha: 1, duration: 0.55 }, b5.start + b5.dur * 0.30);
  tl.to(largeTableG, { autoAlpha: 1, duration: 0.6 }, b5.start + b5.dur * 0.35);
  tl.to(largeC1, { autoAlpha: 1, duration: 0.7 }, b5.start + b5.dur * 0.44);
  tl.to(largeC2, { autoAlpha: 1, duration: 0.7 }, b5.start + b5.dur * 0.56);
  tl.to(largeC3, { autoAlpha: 1, duration: 0.7 }, b5.start + b5.dur * 0.68);
  tl.to(multiFooter, { autoAlpha: 1, duration: 0.65 }, b5.start + b5.dur * 0.82);

  // --- BEAT 6 (Stage 4A): Two Valid Rotations (+L vs 0) ---
  tl.to(actMultiLoop, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b6.start - 0.15);
  tl.to(uiState, { activeStage: 4, duration: 0.01, onUpdate: syncUI }, b6.start + 0.1);
  tl.to(actOrient, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b6.start + 0.2);
  tl.to(orientCW, { autoAlpha: 1, duration: 0.75 }, b6.start + b6.dur * 0.14);
  tl.to(vsBadge, { autoAlpha: 1, duration: 0.45 }, b6.start + b6.dur * 0.36);
  tl.to(orientCCW, { autoAlpha: 1, duration: 0.75 }, b6.start + b6.dur * 0.42);

  // --- BEAT 7 (Stage 4B): Multiple Equal-Length Loops Rotated Simultaneously -> Brass Scale ---
  tl.to(actOrient, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b7.start - 0.15);
  tl.to(actScaleGrp, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b7.start + 0.2);
  tl.to(grpLoopEls, { autoAlpha: 1, duration: 0.55, stagger: 0.55 }, b7.start + 0.7);
  // Rotate active loops (Loop 1 & Loop 3) simultaneously clockwise by 90 deg as scale reads 8!
  const rotSimT = b7.start + b7.dur * 0.26;
  grpLoopSpinners.forEach((sp) => {
    if (sp.active) {
      tl.to(sp.el, { rotation: 90, duration: 1.2, ease: 'power2.inOut' }, rotSimT);
    }
  });
  bottles.setScaleValue(orientScale, 8, tl, rotSimT + 0.35, 0.95);
  tl.to(divPipeline, { autoAlpha: 1, duration: 0.75 }, b7.start + b7.dur * 0.46);

  // --- BEAT 8: Long vs Short Loops -> O(n / log n) Extra Queries ---
  tl.to(actScaleGrp, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b8.start - 0.15);
  tl.to(actComplexity, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b8.start + 0.2);
  tl.to(compLeft, { autoAlpha: 1, duration: 0.7 }, b8.start + 0.8);
  tl.to(compRight, { autoAlpha: 1, duration: 0.7 }, b8.start + b8.dur * 0.36);
  tl.to(compTotalPill, { autoAlpha: 1, duration: 0.75 }, b8.start + b8.dur * 0.68);

  // --- BEAT 9: All Four Stages Connected -> Live Walkthrough Bridge ---
  tl.to(actComplexity, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, b9.start - 0.15);
  tl.to(uiState, { activeStage: 5, duration: 0.01, onUpdate: syncUI }, b9.start + 0.1);
  tl.to(actReady, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b9.start + 0.2);
  tl.to(stageCardEls, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.28, ease: 'back.out(1.4)' }, b9.start + 0.5);
  tl.to(readyBridge, { autoAlpha: 1, duration: 0.65 }, b9.start + b9.dur * 0.48);

  // Pad cleanly to full audio duration
  tl.to({}, { duration: 0.01 }, Math.max(totalDur - 0.01, b9.end));

  syncUI();

  return {
    timeline: tl,
    destroy() {
      rootEl.innerHTML = '';
    },
  };
}
