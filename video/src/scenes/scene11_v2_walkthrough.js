// Chapter 11: Live Walkthrough: Every Move on Six Bottles
// Sunlit Apothecary Art · 11 Audio-Synced Beats · 266.99s
// Zero-Magic Live Trace of ALL 11 Exact Moves on 6 Bottles [0,1,2,3,4,5] (Secret Coasters [1,0,3,4,5,2]):
//   Beat 0 (Move 1): Baseline [0,1,2,3,4,5] -> f = 0 locked (p0) + brief X-ray peek
//   Beat 1 (Move 2, R1): Simultaneous full-table swap (0<->1),(2<->3),(4<->5) -> [1,0,3,2,5,4] -> f = 4 (ACTIVE)
//   Beat 2 (Moves 3-4, R2 & R3): R2 [2,5,0,4,3,1] -> f = 1; R3 [3,4,5,0,1,2] -> f = 1 (BOTH ACTIVE)
//   Beat 3 (Moves 5-6, R4 & R5): R4 [4,2,1,5,0,3] -> f = 0; R5 [5,3,4,1,2,0] -> f = 0 (6 dead pairs dropped!)
//   Beat 4 (Move 7): Split R1 -> swap {0,1}+{2,3} ([1,0,3,2,4,5]) -> f = 3 -> forces {4,5} = 4 - 3 = 1
//   Beat 5 (Move 8): Split R1 -> swap {0,1}+{4,5} ([1,0,2,3,5,4]) -> f = 3 -> forces {2,3} = 1 & {0,1} = 2
//   Beat 6 (Move 9): Parallel R2+R3 -> swap disjoint {3,4}+{2,5} ([0,1,5,4,3,2]) -> f = 2 -> locks both = 1, zeroes 4 others
//   Beat 7 (Stopping Trigger): 2 + 1 + 1 + 1 + 1 = 6 = n -> Build Graph!
//   Beat 8 (Graph + Lock + DFS): Lock {0,1} -> [1,0]; draw 4 weight-1 edges; DFS walks 2-3-4-5-2 (1 closed 4-loop)
//   Beat 9 (Move 10): Hold [0,1] on p0, rotate 2->3->4->5->2 CW -> [0,1,5,2,3,4] -> f = 0 -> forces CCW [3,4,5,2]!
//   Beat 10 (Move 11): Full-Bleed Sunlit 3D Three.js Oak Tabletop Victory Finale -> [1,0,3,4,5,2] (f=6/6) -> flip all 6 coasters!

export const sceneMeta = {
  id: 'scene11',
  number: 11,
  title: 'Live Walkthrough: Every Move on Six Bottles',
  chapter: 'Part II · Live Execution',
  duration: 266.988,
  beats: [
    {
      id: 's11_b0',
      start: 0.8,
      audioDuration: 18.312,
      end: 19.662,
      text: 'Watch Game 2 solve six bottles, [0, 1, 2, 3, 4, 5], over veiled coasters—secretly [1, 0, 3, 4, 5, 2]. Move 1 queries [0, 1, 2, 3, 4, 5]: zero matches (f = 0), locking our clean baseline p₀!',
      highlight: ['Move 1', 'f = 0', 'clean baseline p₀'],
      cue: 'bell',
    },
    {
      id: 's11_b1',
      start: 19.662,
      audioDuration: 19.512,
      end: 39.724,
      text: 'Now run all five full-table round-robin rounds—every single move swaps all six bottles at once! Move 2, Round 1, flips (0↔1), (2↔3), and (4↔5) simultaneously into [1, 0, 3, 2, 5, 4], scoring f = 4—active!',
      highlight: ['swaps all six bottles at once', 'Move 2, Round 1', 'scoring f = 4'],
      cue: 'clink',
    },
    {
      id: 's11_b2',
      start: 39.724,
      audioDuration: 22.68,
      end: 62.954,
      text: 'Move 3, Round 2, flips (0↔2), (1↔5), and (3↔4) all at once into [2, 5, 0, 4, 3, 1], scoring f = 1. Move 4, Round 3, flips (0↔3), (1↔4), and (2↔5) into [3, 4, 5, 0, 1, 2], also scoring f = 1!',
      highlight: ['Move 3, Round 2', 'f = 1', 'Move 4, Round 3'],
      cue: 'clink',
    },
    {
      id: 's11_b3',
      start: 62.954,
      audioDuration: 24.288,
      end: 87.792,
      text: 'Moves 5 and 6 run the last two full-table rounds: Round 4 flips (0↔4), (1↔2), (3↔5) into [4, 2, 1, 5, 0, 3], and Round 5 flips (0↔5), (1↔3), (2↔4) into [5, 3, 4, 1, 2, 0]. Both score f = 0—eliminating six dead pairs in just two moves!',
      highlight: ['Moves 5 and 6', 'Both score f = 0', 'eliminating six dead pairs'],
      cue: 'whoosh',
    },
    {
      id: 's11_b4',
      start: 87.792,
      audioDuration: 22.08,
      end: 110.422,
      text: 'Now split active Round 1 (sum = 4) with multi-pair weighings on p₀. Move 7 swaps {0, 1} and {2, 3} together—lineup [1, 0, 3, 2, 4, 5]—scoring f = 3, which immediately forces {4, 5} = 4 − 3 = 1!',
      highlight: ['Move 7', 'scoring f = 3', '{4, 5} = 4 − 3 = 1'],
      cue: 'scale',
    },
    {
      id: 's11_b5',
      start: 110.422,
      audioDuration: 21.888,
      end: 132.86,
      text: "Move 8 swaps {0, 1} and {4, 5} together—lineup [1, 0, 2, 3, 5, 4]—again scoring f = 3. Subtracting from Round 1's total of 4 forces {2, 3} = 1, leaving {0, 1} = 4 − 1 − 1 = 2!",
      highlight: ['Move 8', '{2, 3} = 1', '{0, 1} = 4 − 1 − 1 = 2'],
      cue: 'scale',
    },
    {
      id: 's11_b6',
      start: 132.86,
      audioDuration: 37.032,
      end: 170.442,
      text: "Move 9 decodes Rounds 2 and 3 in parallel in ONE move! Pick one slot-disjoint pair from each weight-1 round—here {3, 4} from Round 2 and {2, 5} from Round 3—and swap both together ([0, 1, 5, 4, 3, 2]), which happens to score f = 2. Since neither round exceeds 1, this forces {3, 4} = 1, {2, 5} = 1, and zeroes the other four pairs! (Had it scored 0, both would drop out so we'd keep halving; a score of 1 would take one follow-up weighing to separate them.)",
      highlight: ['Move 9', 'parallel in ONE move', '{3, 4} = 1, {2, 5} = 1'],
      cue: 'bell',
    },
    {
      id: 's11_b7',
      start: 170.442,
      audioDuration: 16.416,
      end: 187.408,
      text: 'Check the stopping trigger: add our five discovered weights—2 + 1 + 1 + 1 + 1 = 6 = n! That guarantees zero active pairs remain anywhere else, cleanly transitioning to the graph stage.',
      highlight: ['stopping trigger', '2 + 1 + 1 + 1 + 1 = 6 = n', 'graph stage'],
      cue: 'lock',
    },
    {
      id: 's11_b8',
      start: 187.408,
      audioDuration: 28.992,
      end: 216.95,
      text: 'Weight-2 edge {0, 1} locks immediately—swap Bottles 0 and 1 to seal [1, 0]. Draw the four weight-1 edges {2, 3}, {3, 4}, {4, 5}, {5, 2} and run DFS: walking 2 — 3 — 4 — 5 — 2 exposes one closed 4-bottle loop (whereas larger n can yield 2, 3, or dozens of disjoint loops oriented in parallel).',
      highlight: ['Weight-2 edge {0, 1} locks', 'run DFS', 'one closed 4-bottle loop'],
      cue: 'whoosh',
    },
    {
      id: 's11_b9',
      start: 216.95,
      audioDuration: 23.952,
      end: 241.452,
      text: 'Move 10 orients the loop on baseline p₀: keep Slots 0 and 1 at [0, 1] and rotate the 4-loop clockwise—shifting bottles 2→3→4→5→2 into [0, 1, 5, 2, 3, 4]. The referee reports f = 0, ruling out clockwise and forcing counter-clockwise [3, 4, 5, 2]!',
      highlight: ['Move 10', '[0, 1, 5, 2, 3, 4]', 'forcing counter-clockwise [3, 4, 5, 2]'],
      cue: 'clink',
    },
    {
      id: 's11_b10',
      start: 241.452,
      audioDuration: 24.336,
      end: 266.988,
      text: "Combine locked [1, 0] with counter-clockwise [3, 4, 5, 2] for Move 11: submit [1, 0, 3, 4, 5, 2], and the referee chimes 6 of 6! All six coasters flip face-up—[1, 0, 3, 4, 5, 2]—solved with zero cloning. Now let's test how this scales to four thousand bottles!",
      highlight: ['Move 11', '6 of 6', 'coasters flip face-up'],
      cue: 'bell',
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

function makeOakWoodTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#D7B084');
  grad.addColorStop(0.5, '#C39463');
  grad.addColorStop(1, '#AE7D4D');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = 'rgba(116, 76, 40, 0.18)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 36; i++) {
    const y = (i / 36) * 256;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + Math.sin(i) * 5, 340, y - Math.cos(i) * 5, 512, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function buildScene(rootEl, ctx) {
  const { gsap, THREE, createSvg, svgEl, bottles, onFrame } = ctx;
  const P = ctx.colors || bottles.PALETTE;
  const beats = ctx.beats && ctx.beats.length ? ctx.beats : sceneMeta.beats;
  const totalDur = Math.max(ctx.duration || sceneMeta.duration, 266.988);

  const b0 = beatAt(beats, 0, 0.8, 18.312);
  const b1 = beatAt(beats, 1, 19.662, 19.512);
  const b2 = beatAt(beats, 2, 39.724, 22.68);
  const b3 = beatAt(beats, 3, 62.954, 24.288);
  const b4 = beatAt(beats, 4, 87.792, 22.08);
  const b5 = beatAt(beats, 5, 110.422, 21.888);
  const b6 = beatAt(beats, 6, 132.86, 37.032);
  const b7 = beatAt(beats, 7, 170.442, 16.416);
  const b8 = beatAt(beats, 8, 187.408, 28.992);
  const b9 = beatAt(beats, 9, 216.95, 23.952);
  const b10 = beatAt(beats, 10, 241.452, 24.336);

  const SECRET = [1, 0, 3, 4, 5, 2];

  rootEl.innerHTML = '';

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:absolute;inset:0;width:1280px;height:590px;pointer-events:none;overflow:hidden;';
  rootEl.appendChild(stage);

  // =========================================================================
  // ACT 1 (Beats 0-9): 2D LIVE ZERO-MAGIC TRACE OF MOVES 1..10
  // =========================================================================
  const svg = createSvg(1280, 590, {
    style: { position: 'absolute', left: '0', top: '0', width: '1280px', height: '590px', overflow: 'visible' },
  });
  stage.appendChild(svg);

  const defs = svgEl('defs', {}, svg);
  const sunWash = svgEl('radialGradient', { id: 's11_sun', cx: '38%', cy: '50%', r: '48%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#F8E3B5', 'stop-opacity': '0.46' }, sunWash);
  svgEl('stop', { offset: '100%', 'stop-color': '#F8E3B5', 'stop-opacity': '0' }, sunWash);

  const oakGrad = svgEl('linearGradient', { id: 's11_oak', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#D7B084' }, oakGrad);
  svgEl('stop', { offset: '55%', 'stop-color': '#BA8958' }, oakGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#8A5D36' }, oakGrad);

  const makeArrow = (id, color) => {
    const m = svgEl('marker', {
      id,
      viewBox: '0 0 10 10',
      refX: '8.2',
      refY: '5',
      markerWidth: '6',
      markerHeight: '6',
      orient: 'auto-start-reverse',
    }, defs);
    svgEl('path', { d: 'M 1 1.5 L 8.8 5 L 1 8.5 Z', fill: color }, m);
  };
  makeArrow('s11_arr_brass', P.brass);
  makeArrow('s11_arr_delft', P.delft);
  makeArrow('s11_arr_sage', P.sage);
  makeArrow('s11_arr_terra', P.terracotta);
  makeArrow('s11_arr_plum', P.plum);

  const addScrim = (parent, text, opts = {}) => {
    const node = bottles.createSvgScrimLabel(text, opts);
    parent.appendChild(node);
    return node;
  };

  const act2D = svgEl('g', { id: 's11_act_2d' }, svg);
  svgEl('ellipse', { cx: '450', cy: '330', rx: '420', ry: '205', fill: 'url(#s11_sun)' }, act2D);

  // Persistent chapter headline (strictly y = 76, clear of top-left whisper y < 44)
  svgEl('text', {
    x: '640',
    y: '76',
    'text-anchor': 'middle',
    fill: P.ink,
    'font-family': "'Fraunces', Georgia, serif",
    'font-size': '30',
    'font-weight': '600',
    textContent: 'Live Walkthrough · Every Move on Six Bottles',
  }, act2D);

  // =========================================================================
  // LEFT/CENTER PERSISTENT TABLETOP (x = 46..840, y = 462)
  // =========================================================================
  const tableY = 462;
  const xs = [116, 246, 376, 506, 636, 766];
  svgEl('rect', { x: '62', y: String(tableY + 18), width: '758', height: '13', rx: '6', fill: '#4A3828', opacity: '0.13' }, act2D);
  svgEl('rect', { x: '50', y: String(tableY), width: '782', height: '20', rx: '7', fill: 'url(#s11_oak)', stroke: P.ink, 'stroke-width': '1.7' }, act2D);
  svgEl('line', { x1: '64', y1: String(tableY + 4), x2: '818', y2: String(tableY + 4), stroke: '#F0D7B4', 'stroke-width': '1.4', opacity: '0.72' }, act2D);

  const coasters2D = [];
  for (let i = 0; i < 6; i++) {
    const c = bottles.createSvgCoaster(SECRET[i], {
      x: xs[i],
      y: tableY - 2,
      width: 74,
      scale: 0.92,
      hidden: true,
      slotIndex: i,
    });
    act2D.appendChild(c);
    coasters2D.push(c);
  }

  // Persistent Live Move Banner right above the diagram area (y = 120)
  const liveMoveBanner = addScrim(
    act2D,
    'Move 1 · Baseline Query: [0, 1, 2, 3, 4, 5]',
    {
      x: 441,
      y: 120,
      fontSize: 14,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.ink,
      fill: '#FDF5DF',
      stroke: P.brass,
      strokeWidth: 1.6,
      minWidth: 680,
      padX: 16,
      padY: 6,
    },
  );

  // Persistent Live Deduction Strip cleanly below coasters (y = 538)
  const liveDeductionPill = addScrim(
    act2D,
    'Player View: Six Veiled Coasters (?)  ·  Secretly [1, 0, 3, 4, 5, 2]',
    {
      x: 441,
      y: 538,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.sepia,
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.34)',
      minWidth: 680,
      padX: 16,
      padY: 6,
    },
  );

  // Helper to draw simultaneous swap arcs cleanly above the 6 bottles
  const drawSwapArcs = (parent, pairs, colors, markers, baseY = 336) => {
    const ag = svgEl('g', {}, parent);
    pairs.forEach(([a, b], idx) => {
      const x1 = xs[a];
      const x2 = xs[b];
      const span = Math.abs(b - a);
      const peakY = Math.max(158, baseY - 36 - span * 34 - idx * 14);
      const col = colors[idx % colors.length];
      const mrk = markers[idx % markers.length];
      svgEl('path', {
        d: `M ${x1} ${baseY} Q ${(x1 + x2) / 2} ${peakY} ${x2} ${baseY}`,
        fill: 'none',
        stroke: col,
        'stroke-width': '3.5',
        'stroke-linecap': 'round',
        'marker-start': `url(#${mrk})`,
        'marker-end': `url(#${mrk})`,
      }, ag);
      addScrim(ag, `${a}↔${b}`, {
        x: (x1 + x2) / 2,
        y: (baseY + peakY) / 2 - 4,
        fontSize: 12,
        fontFamily: 'mono',
        fontWeight: 700,
        color: col,
        stroke: col,
        padX: 7,
        padY: 3,
        shadow: false,
      });
    });
    return ag;
  };

  // --- BEAT 0 OVERLAY: X-Ray Peek + Baseline p0 Locked ---
  const ovB0 = svgEl('g', { id: 's11_ov_b0' }, act2D);
  const xrayBanner = addScrim(ovB0, 'Audience X-Ray Peek:  Secret Coasters = [1, 0, 3, 4, 5, 2]', {
    x: 441,
    y: 176,
    fontSize: 14.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.brass,
    fill: '#FDF5DF',
    stroke: P.brass,
    strokeWidth: 1.6,
    padX: 16,
    padY: 7,
  });
  const b0LockStamp = addScrim(ovB0, '✓  Move 1 Scores f = 0  →  Baseline p₀ = [0, 1, 2, 3, 4, 5] LOCKED!', {
    x: 441,
    y: 236,
    fontSize: 14.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sage,
    fill: '#EBF5EF',
    stroke: P.sage,
    strokeWidth: 1.8,
    padX: 16,
    padY: 7,
  });

  // --- BEATS 1-3 OVERLAYS: ALL 5 FULL-TABLE ROUND-ROBIN ROUNDS ---
  const ovRR = svgEl('g', { id: 's11_ov_rr' }, act2D);
  const rrCols = [P.terracotta, P.delft, P.sage];
  const rrMrks = ['s11_arr_terra', 's11_arr_delft', 's11_arr_sage'];
  const rrArc1 = drawSwapArcs(ovRR, [[0, 1], [2, 3], [4, 5]], rrCols, rrMrks);
  const rrArc2 = drawSwapArcs(ovRR, [[0, 2], [1, 5], [3, 4]], rrCols, rrMrks);
  const rrArc3 = drawSwapArcs(ovRR, [[0, 3], [1, 4], [2, 5]], rrCols, rrMrks);
  const rrArc4 = drawSwapArcs(ovRR, [[0, 4], [1, 2], [3, 5]], rrCols, rrMrks);
  const rrArc5 = drawSwapArcs(ovRR, [[0, 5], [1, 3], [2, 4]], rrCols, rrMrks);

  const rrDropStamp = addScrim(ovRR, '✗  f = 0  →  All 3 Pairs Eliminated in 1 Move!', {
    x: 441,
    y: 180,
    fontSize: 14,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.cinnabar,
    fill: '#FBECE8',
    stroke: P.cinnabar,
    strokeWidth: 1.8,
    padX: 16,
    padY: 7,
  });

  // --- BEATS 4-6 OVERLAYS: MULTI-PAIR WEIGHING SPLITS (MOVES 7, 8, 9) + BRASS SCALE ---
  const ovSplit = svgEl('g', { id: 's11_ov_split' }, act2D);
  const splitArcM7 = drawSwapArcs(ovSplit, [[0, 1], [2, 3]], [P.brass, P.delft], ['s11_arr_brass', 's11_arr_delft']);
  const splitArcM8 = drawSwapArcs(ovSplit, [[0, 1], [4, 5]], [P.brass, P.plum], ['s11_arr_brass', 's11_arr_plum']);
  const splitArcM9 = drawSwapArcs(ovSplit, [[3, 4], [2, 5]], [P.sage, P.terracotta], ['s11_arr_sage', 's11_arr_terra']);

  const splitScale = bottles.createSvgBrassScale({
    x: 756,
    y: 230,
    radius: 44,
    maxVal: 6,
    initialVal: 0,
    unit: '',
  });
  ovSplit.appendChild(splitScale);

  const splitEqBox = addScrim(ovSplit, 'R1 total = 4  &  f({0,1}+{2,3}) = 3   ⇒   {4, 5} = 4 − 3 = 1', {
    x: 374,
    y: 186,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.ink,
    fill: '#EBF5EF',
    stroke: P.sage,
    strokeWidth: 1.7,
    minWidth: 560,
    padX: 14,
    padY: 7,
  });

  const m9NotePill = addScrim(ovSplit, 'R2 ≤ 1 & R3 ≤ 1, sum = 2  ⇒  {3,4}=1, {2,5}=1; other 4 pairs = 0!', {
    x: 374,
    y: 230,
    fontSize: 12.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.delft,
    fill: '#EAF2F8',
    stroke: P.delft,
    strokeWidth: 1.4,
    minWidth: 560,
    padX: 12,
    padY: 5,
    shadow: false,
  });

  // --- BEAT 7 OVERLAY: STOPPING TRIGGER (2+1+1+1+1 = 6 = n) ---
  const ovStop = svgEl('g', { id: 's11_ov_stop' }, act2D);
  const stopCardSpecs = [
    { x: 132, pair: '{0,1}', w: 'w = 2', col: P.brass, fill: '#FDF5DF' },
    { x: 286, pair: '{2,3}', w: 'w = 1', col: P.delft, fill: P.parchment },
    { x: 440, pair: '{3,4}', w: 'w = 1', col: P.sage, fill: P.parchment },
    { x: 594, pair: '{4,5}', w: 'w = 1', col: P.plum, fill: P.parchment },
    { x: 748, pair: '{5,2}', w: 'w = 1', col: P.terracotta, fill: P.parchment },
  ];
  const stopCards = stopCardSpecs.map((sc) => {
    const outer = svgEl('g', { transform: `translate(${sc.x}, 196)` }, ovStop);
    const cg = svgEl('g', {}, outer);
    svgEl('rect', { x: '-64', y: '-34', width: '128', height: '68', rx: '12', fill: sc.fill, stroke: sc.col, 'stroke-width': '2.4' }, cg);
    svgEl('text', { x: '0', y: '-10', 'text-anchor': 'middle', fill: P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': '18', 'font-weight': '700', textContent: sc.pair }, cg);
    svgEl('text', { x: '0', y: '17', 'text-anchor': 'middle', fill: sc.col, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '15.5', 'font-weight': '700', textContent: sc.w }, cg);
    return cg;
  });

  const stopSumBadge = addScrim(ovStop, 'STOPPING TRIGGER:  2 + 1 + 1 + 1 + 1  =  6  =  n  ✓', {
    x: 441,
    y: 266,
    fontSize: 15,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.ink,
    fill: '#FDF5DF',
    stroke: P.brass,
    strokeWidth: 1.8,
    padX: 18,
    padY: 7,
  });
  const stopGateBadge = addScrim(ovStop, 'All Active Pairs Found  →  Build Active-Pair Graph!', {
    x: 441,
    y: 312,
    fontSize: 14,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sage,
    fill: '#EBF5EF',
    stroke: P.sage,
    strokeWidth: 1.8,
    padX: 18,
    padY: 7,
  });

  // --- BEATS 8-9 OVERLAY: GRAPH + LOCK {0,1} + ANIMATED DFS + CW TEST (MOVE 10) ---
  const ovGraph = svgEl('g', { id: 's11_ov_graph' }, act2D);

  const lock01Badge = addScrim(ovGraph, '✓  [1, 0] Locked (w=2)', {
    x: 181,
    y: 294,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sage,
    fill: '#EBF5EF',
    stroke: P.sage,
    strokeWidth: 1.6,
  });

  const hold01Badge = addScrim(ovGraph, 'Slots 0–1 on p₀ [0, 1]', {
    x: 181,
    y: 294,
    fontSize: 12.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sepia,
    fill: '#FDF5DF',
    stroke: P.brass,
    strokeWidth: 1.5,
  });

  // Weight-1 Loop Graph above slots 2, 3, 4, 5
  const loopY = 258;
  const loopGraphG = svgEl('g', { id: 's11_loop_g' }, ovGraph);
  // Base slate edges: 2-3, 3-4, 4-5, and top return arc 5-2
  const dfsBaseSegs = [
    `M ${xs[2]} ${loopY} L ${xs[3]} ${loopY}`,
    `M ${xs[3]} ${loopY} L ${xs[4]} ${loopY}`,
    `M ${xs[4]} ${loopY} L ${xs[5]} ${loopY}`,
    `M ${xs[5]} ${loopY - 12} C ${xs[5] - 50} 152, ${xs[2] + 50} 152, ${xs[2]} ${loopY - 12}`,
  ];
  dfsBaseSegs.forEach((d) => {
    svgEl('path', { d, fill: 'none', stroke: '#4B5D6B', 'stroke-width': '4.5', opacity: '0.28', 'stroke-linecap': 'round' }, loopGraphG);
  });
  // Animated DFS-highlighted edges
  const dfsLitPaths = dfsBaseSegs.map((d) => {
    const p = svgEl('path', {
      d,
      fill: 'none',
      stroke: P.delft,
      'stroke-width': '5.5',
      'stroke-linecap': 'round',
      'stroke-dasharray': '540',
      'stroke-dashoffset': '540',
    }, loopGraphG);
    return p;
  });

  [2, 3, 4, 5].forEach((sid) => {
    const ng = svgEl('g', { transform: `translate(${xs[sid]}, ${loopY})` }, loopGraphG);
    svgEl('circle', { cx: '0', cy: '0', r: '19', fill: P.parchment, stroke: P.bottles[sid], 'stroke-width': '3' }, ng);
    svgEl('text', { x: '0', y: '0.5', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': '14.5', 'font-weight': '700', textContent: String(sid) }, ng);
  });

  // DFS explorer dot
  const dfsDot = svgEl('circle', { cx: '0', cy: '0', r: '10', fill: P.terracotta, stroke: '#FFFBF2', 'stroke-width': '2.5' }, loopGraphG);

  const dfsResultPill = addScrim(ovGraph, 'DFS Found 1 Closed 4-Loop:  2 — 3 — 4 — 5 — 2', {
    x: 571,
    y: 162,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.delft,
    fill: '#EAF2F8',
    stroke: P.delft,
    strokeWidth: 1.5,
  });

  const largeNNote = addScrim(ovGraph, 'Note: Larger n yields 2, 3, or dozens of disjoint loops oriented in parallel', {
    x: 571,
    y: 204,
    fontSize: 11.5,
    fontFamily: 'body',
    fontStyle: 'italic',
    fontWeight: 600,
    color: P.sepia,
    fill: P.parchment,
    stroke: 'rgba(107, 94, 84, 0.25)',
    shadow: false,
  });

  const cwVerdictPill = addScrim(ovGraph, '✗  CW [0,1,5,2,3,4] Scores f = 0  ⇒  Forces CCW [3, 4, 5, 2]!', {
    x: 571,
    y: 200,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.cinnabar,
    fill: '#FBECE8',
    stroke: P.cinnabar,
    strokeWidth: 1.8,
    padX: 14,
    padY: 6,
  });

  // Place the 6 live animated 2D bottles on top of all tabletop overlays so they fly cleanly!
  const bottles2D = [];
  for (let i = 0; i < 6; i++) {
    const wrap = svgEl('g', { class: `s11-btl-${i}` }, act2D);
    const b = bottles.createSvgBottle(i, { x: 0, y: 0, scale: 1.0 });
    wrap.appendChild(b);
    bottles2D.push({ wrap, bNode: b, id: i });
  }

  // =========================================================================
  // RIGHT SIDEBAR: LIVE MOVE & SCORE LEDGER (x = 868..1246, y = 104..554)
  // =========================================================================
  const ledgerG = svgEl('g', { id: 's11_ledger' }, act2D);
  svgEl('rect', {
    x: '868',
    y: '102',
    width: '378',
    height: '454',
    rx: '14',
    fill: '#FFFDF8',
    stroke: P.brass,
    'stroke-width': '1.8',
  }, ledgerG);
  svgEl('text', {
    x: '1057',
    y: '126',
    'text-anchor': 'middle',
    fill: P.brass,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '12',
    'font-weight': '700',
    'letter-spacing': '0.09em',
    textContent: 'LIVE MOVE & SCORE LEDGER',
  }, ledgerG);
  svgEl('line', { x1: '886', y1: '138', x2: '1228', y2: '138', stroke: 'rgba(107, 94, 84, 0.22)', 'stroke-width': '1.2' }, ledgerG);

  const LEDGER_MOVES = [
    { m: 'M1', desc: 'p₀ [0,1,2,3,4,5]', res: 'f=0  LOCK', col: P.sage, bg: '#EBF5EF' },
    { m: 'M2', desc: 'R1 [1,0,3,2,5,4]', res: 'f=4  ACT', col: P.brass, bg: '#FDF5DF' },
    { m: 'M3', desc: 'R2 [2,5,0,4,3,1]', res: 'f=1  ACT', col: P.delft, bg: '#EAF2F8' },
    { m: 'M4', desc: 'R3 [3,4,5,0,1,2]', res: 'f=1  ACT', col: P.delft, bg: '#EAF2F8' },
    { m: 'M5', desc: 'R4 [4,2,1,5,0,3]', res: 'f=0  DROP', col: P.cinnabar, bg: '#FBECE8' },
    { m: 'M6', desc: 'R5 [5,3,4,1,2,0]', res: 'f=0  DROP', col: P.cinnabar, bg: '#FBECE8' },
    { m: 'M7', desc: '{0,1}+{2,3}', res: 'f=3  {4,5}=1', col: P.sage, bg: '#EBF5EF' },
    { m: 'M8', desc: '{0,1}+{4,5}', res: 'f=3  {0,1}=2', col: P.brass, bg: '#FDF5DF' },
    { m: 'M9', desc: '{3,4}+{2,5} (∥)', res: 'f=2  BOTH=1', col: P.sage, bg: '#EBF5EF' },
    { m: 'M10', desc: 'CW [0,1,5,2,3,4]', res: 'f=0  →CCW', col: P.cinnabar, bg: '#FBECE8' },
  ];

  const ledgerRowEls = LEDGER_MOVES.map((row, idx) => {
    const ry = 160 + idx * 36;
    const rg = svgEl('g', { class: `s11-lrow-${idx}` }, ledgerG);
    svgEl('rect', {
      x: '882',
      y: String(ry - 14),
      width: '350',
      height: '30',
      rx: '7',
      fill: row.bg,
      stroke: row.col,
      'stroke-opacity': '0.45',
      'stroke-width': '1.1',
    }, rg);
    svgEl('text', {
      x: '892',
      y: String(ry + 1),
      'dominant-baseline': 'central',
      fill: P.ink,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      textContent: row.m,
    }, rg);
    svgEl('text', {
      x: '926',
      y: String(ry + 1),
      'dominant-baseline': 'central',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '600',
      textContent: row.desc,
    }, rg);
    svgEl('text', {
      x: '1222',
      y: String(ry + 1),
      'text-anchor': 'end',
      'dominant-baseline': 'central',
      fill: row.col,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      textContent: row.res,
    }, rg);
    return rg;
  });

  // Ledger bottom weight summary bar (y = 532)
  svgEl('line', { x1: '886', y1: '510', x2: '1228', y2: '510', stroke: 'rgba(107, 94, 84, 0.22)', 'stroke-width': '1.2' }, ledgerG);
  const ledgerFooterTxt = svgEl('text', {
    x: '1057',
    y: '532',
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    fill: P.ink,
    'font-family': "'JetBrains Mono', monospace",
    'font-size': '11.5',
    'font-weight': '700',
    textContent: 'Weights Found: 0 / 6',
  }, ledgerG);

  // =========================================================================
  // ACT 2 (Beat 10, Move 11): FULL-BLEED SUNLIT 3D THREE.JS VICTORY FINALE!
  // =========================================================================
  const finaleWrap = document.createElement('div');
  finaleWrap.style.cssText =
    'position:absolute;inset:0;width:1280px;height:590px;opacity:0;pointer-events:none;overflow:hidden;';
  stage.appendChild(finaleWrap);

  const victoryOverlay = document.createElement('div');
  victoryOverlay.style.cssText =
    'position:absolute;left:0;right:0;top:50px;text-align:center;pointer-events:none;z-index:4;opacity:0;';
  victoryOverlay.innerHTML = `
    <div style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${P.brass};margin-bottom:4px;">
      MOVE 11 &middot; MATCH COUNT &middot; F = 6 / 6
    </div>
    <div style="font-family:'Fraunces',Georgia,serif;font-size:38px;font-weight:600;letter-spacing:-0.02em;color:${P.ink};line-height:1.05;">
      All Six Bottles Solved
    </div>
    <div id="s11_reveal_sub" style="display:inline-block;margin-top:10px;padding:5px 16px;border-radius:999px;background:rgba(251,248,241,0.92);border:1.4px solid ${P.brass};font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:${P.sage};opacity:0;">
      Coasters Revealed: [1, 0, 3, 4, 5, 2] &mdash; 1-to-1 Match, Zero Cloning
    </div>
  `;
  finaleWrap.appendChild(victoryOverlay);
  const revealSubEl = victoryOverlay.querySelector('#s11_reveal_sub');

  let renderer = null;
  let threeScene = null;
  let camera = null;
  let threeBottles = [];
  let threeCoasters = [];
  let sparklePoints = null;
  let sparkleBaseY = [];
  let unsubFrame = null;
  const disposables = [];

  const slotXs3D = [-3.65, -2.19, -0.73, 0.73, 2.19, 3.65];
  // Start of Move 11 = end of Move 10 CW query [0, 1, 5, 2, 3, 4]:
  // Bottle 0 @ 0, Bottle 1 @ 1, Bottle 2 @ 3, Bottle 3 @ 4, Bottle 4 @ 5, Bottle 5 @ 2
  const startSlot3D = [0, 1, 3, 4, 5, 2];
  // Final solved lineup [1, 0, 3, 4, 5, 2]:
  // Bottle 0 @ 1, Bottle 1 @ 0, Bottle 2 @ 5, Bottle 3 @ 2, Bottle 4 @ 3, Bottle 5 @ 4
  const targetSlot3D = [1, 0, 5, 2, 3, 4];

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(1280, 590);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.style.cssText = 'position:absolute;left:0;top:0;width:1280px;height:590px;display:block;';
    finaleWrap.appendChild(renderer.domElement);

    threeScene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, 1280 / 590, 0.1, 100);
    camera.position.set(0, 3.6, 11.5);
    camera.lookAt(0, 1.35, 0);

    const hemi = new THREE.HemisphereLight(0xfffaf0, 0xd9c2a0, 1.48);
    threeScene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff3dc, 1.85);
    keyLight.position.set(4.5, 9.5, 6.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    threeScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf6d59c, 0.85);
    rimLight.position.set(-5.5, 4.5, -4.5);
    threeScene.add(rimLight);

    const warmFill = new THREE.PointLight(0xffe7b8, 0.78, 18);
    warmFill.position.set(0, 3.8, 4.5);
    threeScene.add(warmFill);

    const woodTex = makeOakWoodTexture(THREE);
    disposables.push(woodTex);
    const tableGeo = new THREE.BoxGeometry(11.8, 0.42, 4.3);
    const tableMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.62,
      metalness: 0.04,
    });
    disposables.push(tableGeo, tableMat);
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0, -0.21, 0);
    tableMesh.receiveShadow = true;
    threeScene.add(tableMesh);

    const railGeo = new THREE.BoxGeometry(11.82, 0.05, 0.05);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xc88a1e, roughness: 0.32, metalness: 0.72 });
    disposables.push(railGeo, railMat);
    const railMesh = new THREE.Mesh(railGeo, railMat);
    railMesh.position.set(0, -0.02, 2.15);
    threeScene.add(railMesh);

    for (let i = 0; i < 6; i++) {
      const c = bottles.createThreeCoaster(THREE, SECRET[i], {
        matched: false,
        radius: 0.56,
        hidden: true,
        slotIndex: i,
      });
      c.position.set(slotXs3D[i], 0.1, 0);
      threeScene.add(c);
      threeCoasters.push(c);
    }

    const levels = [0.72, 0.64, 0.76, 0.68, 0.7, 0.62];
    for (let i = 0; i < 6; i++) {
      const b = bottles.createThreeBottle(THREE, i, P.bottles[i], {
        scale: 0.94,
        liquidLevel: levels[i],
        matched: false,
      });
      b.position.set(slotXs3D[startSlot3D[i]], 0.1, 0);
      threeScene.add(b);
      threeBottles.push(b);
    }

    const count = 48;
    const posArr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = -4.6 + ((i * 73) % 100) * 0.092;
      const y = 0.35 + ((i * 41) % 100) * 0.028;
      const z = -1.2 + ((i * 29) % 100) * 0.024;
      posArr[i * 3] = x;
      posArr[i * 3 + 1] = y;
      posArr[i * 3 + 2] = z;
      sparkleBaseY.push(y);
    }
    const spGeo = new THREE.BufferGeometry();
    spGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const spMat = new THREE.PointsMaterial({
      color: 0xe8b342,
      size: 0.14,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    disposables.push(spGeo, spMat);
    sparklePoints = new THREE.Points(spGeo, spMat);
    threeScene.add(sparklePoints);
  } catch (err) {
    renderer = null;
    const fallbackSvg = createSvg(1280, 590, { style: { position: 'absolute', left: '0', top: '0', width: '1280px', height: '590px' } });
    for (let i = 0; i < 6; i++) {
      fallbackSvg.appendChild(bottles.createSvgCoaster(SECRET[i], { x: 215 + i * 170, y: 460, width: 84, scale: 1.02, matched: true, hidden: false }));
      fallbackSvg.appendChild(bottles.createSvgBottle(SECRET[i], { x: 215 + i * 170, y: 458, scale: 1.18, matched: true }));
    }
    finaleWrap.appendChild(fallbackSvg);
  }

  const state3D = { active: 0, p: 0, shimmer: 0 };

  function render3D() {
    if (!renderer || !threeScene || !camera) return;
    const p = Math.max(0, Math.min(1, state3D.p));
    const sh = Math.max(0, Math.min(1, state3D.shimmer));

    const camAngle = (p * 0.5 + sh * 0.5 - 0.5) * 0.16;
    const camR = 11.5 - p * 0.42 - sh * 0.18;
    camera.position.set(Math.sin(camAngle) * camR, 3.6 - p * 0.08, Math.cos(camAngle) * camR);
    camera.lookAt(0, 1.32, 0);

    for (let i = 0; i < 6; i++) {
      const b = threeBottles[i];
      if (!b) continue;
      const startP = 0.05 + i * 0.055;
      const leapDur = 0.34;
      const u = Math.max(0, Math.min(1, (p - startP) / leapDur));
      const easeU = u * u * (3 - 2 * u);

      const x0 = slotXs3D[startSlot3D[i]];
      const x1 = slotXs3D[targetSlot3D[i]];
      const arcH = 0.78 + (i % 3) * 0.14;
      const zArc = (i % 2 === 0 ? 0.55 : -0.55) * Math.sin(Math.PI * easeU);

      b.position.x = x0 + (x1 - x0) * easeU;
      b.position.y = 0.1 + Math.sin(Math.PI * easeU) * arcH;
      b.position.z = zArc;

      const dir = x1 >= x0 ? -1 : 1;
      b.rotation.z = Math.sin(Math.PI * easeU) * 0.12 * dir;
      b.rotation.y = Math.sin(Math.PI * easeU) * 0.14 * (i % 2 === 0 ? 1 : -1);

      const landed = u >= 0.96;
      b.userData.setMatched(landed);
      const targetCoaster = threeCoasters[targetSlot3D[i]];
      if (targetCoaster) targetCoaster.userData.setMatched(landed);
    }

    if (sparklePoints) {
      const spAlpha = Math.max(0, Math.min(0.9, (p - 0.52) / 0.28 + sh * 0.25));
      sparklePoints.material.opacity = spAlpha;
      const posAttr = sparklePoints.geometry.getAttribute('position');
      for (let i = 0; i < sparkleBaseY.length; i++) {
        const yOff = (((p + sh) * 1.4 + i * 0.11) % 1.0) * 1.45;
        posAttr.setY(i, sparkleBaseY[i] + yOff * 0.45);
      }
      posAttr.needsUpdate = true;
    }

    renderer.render(threeScene, camera);
  }

  if (typeof onFrame === 'function') {
    unsubFrame = onFrame(() => {
      if (state3D.active > 0.001) render3D();
    });
  }

  // =========================================================================
  // MASTER AUDIO-SYNCED BIDIRECTIONAL GSAP TIMELINE
  // =========================================================================
  const tl = gsap.timeline({ paused: true });

  // Simultaneous permutation mover for all 6 bottles on the 2D tabletop
  const moveBottlesTo = (perm, atTime, dur = 1.25) => {
    for (let slot = 0; slot < 6; slot++) {
      const bId = perm[slot];
      const targetX = xs[slot];
      const peakY = tableY - 72 - (bId % 3) * 20;
      const tilt = slot > bId ? 8 : slot < bId ? -8 : 0;
      const wrap = bottles2D[bId].wrap;
      tl.to(wrap, { y: peakY, rotation: tilt, duration: dur * 0.48, ease: 'power2.out' }, atTime);
      tl.to(wrap, { x: targetX, duration: dur, ease: 'power2.inOut' }, atTime);
      tl.to(wrap, { y: tableY - 4, rotation: 0, duration: dur * 0.52, ease: 'back.out(1.35)' }, atTime + dur * 0.48);
    }
  };

  // Deterministic UI state proxy for scrubbing safety
  const STEP_META = [
    {
      banner: 'Move 1 · Baseline Query: [0, 1, 2, 3, 4, 5]',
      deduct: 'Player View: Six Veiled Coasters (?)  ·  Secretly [1, 0, 3, 4, 5, 2]',
      eq: '',
      footer: 'Weights Found: 0 / 6',
    },
    {
      banner: 'Move 2 (Round 1) · ALL 6 Bottles Swap: (0↔1), (2↔3), (4↔5)',
      deduct: 'Lineup [1, 0, 3, 2, 5, 4]  →  Referee f = 4  (Active Group!)',
      eq: '',
      footer: 'Active Rounds: R1(4)',
    },
    {
      banner: 'Move 3 (Round 2) · ALL 6 Bottles Swap: (0↔2), (1↔5), (3↔4)',
      deduct: 'Lineup [2, 5, 0, 4, 3, 1]  →  Referee f = 1  (Active Group!)',
      eq: '',
      footer: 'Active Rounds: R1(4), R2(1)',
    },
    {
      banner: 'Move 4 (Round 3) · ALL 6 Bottles Swap: (0↔3), (1↔4), (2↔5)',
      deduct: 'Lineup [3, 4, 5, 0, 1, 2]  →  Referee f = 1  (Active Group!)',
      eq: '',
      footer: 'Active Rounds: R1(4), R2(1), R3(1)',
    },
    {
      banner: 'Move 5 (Round 4) · ALL 6 Bottles Swap: (0↔4), (1↔2), (3↔5)',
      deduct: 'Lineup [4, 2, 1, 5, 0, 3]  →  f = 0  (Drops 3 dead pairs!)',
      eq: '',
      footer: 'Active: R1(4), R2(1), R3(1) · 3 dropped',
    },
    {
      banner: 'Move 6 (Round 5) · ALL 6 Bottles Swap: (0↔5), (1↔3), (2↔4)',
      deduct: 'Lineup [5, 3, 4, 1, 2, 0]  →  f = 0  (6 dead pairs dropped in 2 moves!)',
      eq: '',
      footer: 'Active: R1(4), R2(1), R3(1) · 6 dropped',
    },
    {
      banner: 'Move 7 · Split R1 (sum=4): Swap {0,1} + {2,3} → [1, 0, 3, 2, 4, 5]',
      deduct: 'Referee f = 3  ⇒  Immediate Deduction:  w({4, 5}) = 4 − 3 = 1!',
      eq: 'R1 = 4  &  f({0,1}+{2,3}) = 3   ⇒   {4, 5} = 4 − 3 = 1',
      footer: 'Found: {4,5}:1  (Sum = 1 / 6)',
    },
    {
      banner: 'Move 8 · Split R1 (sum=4): Swap {0,1} + {4,5} → [1, 0, 2, 3, 5, 4]',
      deduct: 'Referee f = 3  ⇒  w({2, 3}) = 1  &  w({0, 1}) = 4 − 1 − 1 = 2!',
      eq: 'f({0,1}+{4,5}) = 3   ⇒   {2, 3} = 1   &   {0, 1} = 2!',
      footer: 'Found: {0,1}:2, {2,3}:1, {4,5}:1  (4/6)',
    },
    {
      banner: 'Move 9 · Parallel R2 + R3: Swap {3,4} + {2,5} → [0, 1, 5, 4, 3, 2]',
      deduct: 'Referee f = 2  ⇒  {3,4}=1, {2,5}=1; other 4 pairs in R2 & R3 = 0!',
      eq: 'Parallel Move 9:  {3,4} (R2) + {2,5} (R3)  →  f = 2!',
      footer: 'Found: {0,1}:2, {2,3}:1, {3,4}:1, {4,5}:1, {5,2}:1',
    },
    {
      banner: 'Stopping Trigger Check · Sum of All Discovered Pair Weights',
      deduct: '2 + 1 + 1 + 1 + 1 = 6 = n  ⇒  Zero Active Pairs Left Anywhere Else!',
      eq: '',
      footer: 'Σ w = 2+1+1+1+1 = 6 = n  ✓',
    },
    {
      banner: 'Graph Stage · Lock w=2 Pair {0,1} & Run DFS on Weight-1 Edges',
      deduct: 'Slots 0–1 Sealed [1, 0]  ·  DFS Traces 1 Closed 4-Loop: 2—3—4—5—2',
      eq: '',
      footer: 'Locked [1,0] · Loop 2–3–4–5–2',
    },
    {
      banner: 'Move 10 · Orient Loop on p₀: Rotate CW 2→3→4→5→2 → [0, 1, 5, 2, 3, 4]',
      deduct: 'Referee f = 0  ⇒  Rules out CW, Forces CCW [3, 4, 5, 2]!',
      eq: '',
      footer: 'Solved: [1, 0] + [3, 4, 5, 2]!',
    },
  ];

  const uiState = { stepIdx: 0, pair01Matched: 0 };
  function syncUI() {
    const idx = Math.max(0, Math.min(STEP_META.length - 1, Math.round(uiState.stepIdx)));
    const meta = STEP_META[idx];
    liveMoveBanner.setText(meta.banner);
    liveDeductionPill.setText(meta.deduct);
    if (meta.eq) splitEqBox.setText(meta.eq);
    ledgerFooterTxt.textContent = meta.footer;

    const m01 = Math.round(uiState.pair01Matched) === 1;
    coasters2D[0].setMatched(m01);
    coasters2D[1].setMatched(m01);
    bottles2D[0].bNode.setMatched(m01);
    bottles2D[1].bNode.setMatched(m01);
  }

  // Initial states at t = 0
  tl.set(uiState, { stepIdx: 0, pair01Matched: 0, onUpdate: syncUI }, 0);
  tl.set(state3D, { active: 0, p: 0, shimmer: 0, onUpdate: render3D }, 0);
  tl.set(splitScale._state, { val: 0, onUpdate: () => splitScale.setValue(splitScale._state.val) }, 0);

  tl.set(act2D, { autoAlpha: 1 }, 0);
  bottles2D.forEach(({ wrap }, i) => {
    tl.set(wrap, { x: xs[i], y: tableY - 4, rotation: 0 }, 0);
  });
  coasters2D.forEach((c) => {
    tl.set(c.coasterVeil, { opacity: 1, attr: { transform: 'scale(1, 1)' } }, 0);
    tl.set(c.coasterSecret, { opacity: 0, attr: { transform: 'scale(1, 0.06)' } }, 0);
  });
  threeCoasters.forEach((c) => {
    tl.set(c.userData.veilMesh.scale, { y: 1 }, 0);
    tl.set(c.userData.veilMesh.material, { opacity: 1 }, 0);
    tl.set(c.userData.secretMesh.scale, { y: 0.001 }, 0);
    tl.set(c.userData.secretMesh.material, { opacity: 0 }, 0);
  });

  tl.set(ledgerRowEls, { autoAlpha: 0.14 }, 0);
  tl.set(ovB0, { autoAlpha: 1 }, 0);
  tl.set([xrayBanner, b0LockStamp], { autoAlpha: 0 }, 0);

  tl.set(ovRR, { autoAlpha: 0 }, 0);
  tl.set([rrArc1, rrArc2, rrArc3, rrArc4, rrArc5, rrDropStamp], { autoAlpha: 0 }, 0);

  tl.set(ovSplit, { autoAlpha: 0 }, 0);
  tl.set([splitArcM7, splitArcM8, splitArcM9, splitEqBox, m9NotePill], { autoAlpha: 0 }, 0);

  tl.set(ovStop, { autoAlpha: 0 }, 0);
  tl.set(stopCards, { autoAlpha: 0, scale: 0.72, transformOrigin: 'center' }, 0);
  tl.set([stopSumBadge, stopGateBadge], { autoAlpha: 0 }, 0);

  tl.set(ovGraph, { autoAlpha: 0 }, 0);
  tl.set([lock01Badge, hold01Badge, loopGraphG, dfsResultPill, largeNNote, cwVerdictPill], { autoAlpha: 0 }, 0);
  tl.set(dfsDot, { x: xs[2], y: loopY, autoAlpha: 0 }, 0);

  tl.set(finaleWrap, { autoAlpha: 0 }, 0);
  tl.set(victoryOverlay, { autoAlpha: 0, y: 14 }, 0);
  tl.set(revealSubEl, { autoAlpha: 0, y: 10 }, 0);

  // --- BEAT 0 (Move 1): Brief Audience X-Ray Peek + Baseline p0 Locked (f = 0) ---
  tl.to(xrayBanner, { autoAlpha: 1, duration: 0.55 }, b0.start + b0.dur * 0.16);
  bottles.setCoasterRevealed(coasters2D, true, tl, b0.start + b0.dur * 0.18, 0.45);
  bottles.setCoasterRevealed(coasters2D, false, tl, b0.start + b0.dur * 0.52, 0.42);
  tl.to(xrayBanner, { autoAlpha: 0, duration: 0.35 }, b0.start + b0.dur * 0.55);
  tl.to(b0LockStamp, { autoAlpha: 1, duration: 0.6 }, b0.start + b0.dur * 0.62);
  tl.to(ledgerRowEls[0], { autoAlpha: 1, duration: 0.5 }, b0.start + b0.dur * 0.68);

  // --- BEAT 1 (Move 2, Round 1): Simultaneous Swap (0<->1),(2<->3),(4<->5) -> [1,0,3,2,5,4], f = 4 ---
  tl.to(ovB0, { autoAlpha: 0, duration: 0.35 }, b1.start - 0.15);
  tl.to(ovRR, { autoAlpha: 1, duration: 0.4 }, b1.start + 0.15);
  tl.to(uiState, { stepIdx: 1, duration: 0.01, onUpdate: syncUI }, b1.start + 0.25);
  tl.to(rrArc1, { autoAlpha: 1, duration: 0.45 }, b1.start + b1.dur * 0.26);
  moveBottlesTo([1, 0, 3, 2, 5, 4], b1.start + b1.dur * 0.36, 1.55);
  tl.to(ledgerRowEls[1], { autoAlpha: 1, duration: 0.55 }, b1.start + b1.dur * 0.65);

  // --- BEAT 2 (Moves 3 & 4, Rounds 2 & 3): Simultaneous Swaps -> f = 1, f = 1 ---
  // Move 3 (R2): reset briefly to p0, then swap (0<->2),(1<->5),(3<->4) -> [2,5,0,4,3,1]
  tl.to(rrArc1, { autoAlpha: 0, duration: 0.3 }, b2.start - 0.1);
  moveBottlesTo([0, 1, 2, 3, 4, 5], b2.start + 0.1, 0.7);
  tl.to(uiState, { stepIdx: 2, duration: 0.01, onUpdate: syncUI }, b2.start + 0.85);
  tl.to(rrArc2, { autoAlpha: 1, duration: 0.45 }, b2.start + 1.0);
  moveBottlesTo([2, 5, 0, 4, 3, 1], b2.start + 1.5, 1.5);
  tl.to(ledgerRowEls[2], { autoAlpha: 1, duration: 0.5 }, b2.start + b2.dur * 0.32);

  // Move 4 (R3): reset to p0, then swap (0<->3),(1<->4),(2<->5) -> [3,4,5,0,1,2]
  const m4T = b2.start + b2.dur * 0.48;
  tl.to(rrArc2, { autoAlpha: 0, duration: 0.3 }, m4T - 0.85);
  moveBottlesTo([0, 1, 2, 3, 4, 5], m4T - 0.75, 0.7);
  tl.to(uiState, { stepIdx: 3, duration: 0.01, onUpdate: syncUI }, m4T + 0.05);
  tl.to(rrArc3, { autoAlpha: 1, duration: 0.45 }, m4T + 0.2);
  moveBottlesTo([3, 4, 5, 0, 1, 2], m4T + 0.75, 1.5);
  tl.to(ledgerRowEls[3], { autoAlpha: 1, duration: 0.5 }, m4T + 3.0);

  // --- BEAT 3 (Moves 5 & 6, Rounds 4 & 5): Both f = 0 -> 6 Dead Pairs Dropped! ---
  // Move 5 (R4): [4,2,1,5,0,3] -> f = 0
  tl.to(rrArc3, { autoAlpha: 0, duration: 0.3 }, b3.start - 0.1);
  moveBottlesTo([0, 1, 2, 3, 4, 5], b3.start + 0.1, 0.7);
  tl.to(uiState, { stepIdx: 4, duration: 0.01, onUpdate: syncUI }, b3.start + 0.85);
  tl.to(rrArc4, { autoAlpha: 1, duration: 0.45 }, b3.start + 1.0);
  moveBottlesTo([4, 2, 1, 5, 0, 3], b3.start + 1.5, 1.5);
  tl.to(ledgerRowEls[4], { autoAlpha: 1, duration: 0.5 }, b3.start + b3.dur * 0.32);

  // Move 6 (R5): [5,3,4,1,2,0] -> f = 0
  const m6T = b3.start + b3.dur * 0.48;
  tl.to(rrArc4, { autoAlpha: 0, duration: 0.3 }, m6T - 0.85);
  moveBottlesTo([0, 1, 2, 3, 4, 5], m6T - 0.75, 0.7);
  tl.to(uiState, { stepIdx: 5, duration: 0.01, onUpdate: syncUI }, m6T + 0.05);
  tl.to(rrArc5, { autoAlpha: 1, duration: 0.45 }, m6T + 0.2);
  moveBottlesTo([5, 3, 4, 1, 2, 0], m6T + 0.75, 1.5);
  tl.to(rrDropStamp, { autoAlpha: 1, duration: 0.55 }, m6T + 2.6);
  tl.to(ledgerRowEls[5], { autoAlpha: 1, duration: 0.5 }, m6T + 2.8);

  // --- BEAT 4 (Move 7): Split R1 -> Swap {0,1} + {2,3} ([1,0,3,2,4,5]) -> f = 3 -> {4,5} = 1 ---
  tl.to(ovRR, { autoAlpha: 0, duration: 0.35 }, b4.start - 0.15);
  moveBottlesTo([0, 1, 2, 3, 4, 5], b4.start + 0.05, 0.75);
  tl.to(ovSplit, { autoAlpha: 1, duration: 0.45 }, b4.start + 0.3);
  tl.to(uiState, { stepIdx: 6, duration: 0.01, onUpdate: syncUI }, b4.start + 0.85);
  tl.to(splitArcM7, { autoAlpha: 1, duration: 0.45 }, b4.start + b4.dur * 0.22);
  moveBottlesTo([1, 0, 3, 2, 4, 5], b4.start + b4.dur * 0.28, 1.45);
  bottles.setScaleValue(splitScale, 3, tl, b4.start + b4.dur * 0.48, 0.8);
  tl.to(splitEqBox, { autoAlpha: 1, duration: 0.6 }, b4.start + b4.dur * 0.56);
  tl.to(ledgerRowEls[6], { autoAlpha: 1, duration: 0.5 }, b4.start + b4.dur * 0.65);

  // --- BEAT 5 (Move 8): Split R1 -> Swap {0,1} + {4,5} ([1,0,2,3,5,4]) -> f = 3 -> {2,3}=1 & {0,1}=2 ---
  tl.to(splitArcM7, { autoAlpha: 0, duration: 0.3 }, b5.start - 0.1);
  tl.to(splitEqBox, { autoAlpha: 0, duration: 0.25 }, b5.start - 0.1);
  moveBottlesTo([0, 1, 2, 3, 4, 5], b5.start + 0.05, 0.75);
  bottles.setScaleValue(splitScale, 0, tl, b5.start + 0.1, 0.45);
  tl.to(uiState, { stepIdx: 7, duration: 0.01, onUpdate: syncUI }, b5.start + 0.85);
  tl.to(splitArcM8, { autoAlpha: 1, duration: 0.45 }, b5.start + b5.dur * 0.18);
  moveBottlesTo([1, 0, 2, 3, 5, 4], b5.start + b5.dur * 0.24, 1.45);
  bottles.setScaleValue(splitScale, 3, tl, b5.start + b5.dur * 0.42, 0.8);
  tl.to(splitEqBox, { autoAlpha: 1, duration: 0.6 }, b5.start + b5.dur * 0.54);
  tl.to(ledgerRowEls[7], { autoAlpha: 1, duration: 0.5 }, b5.start + b5.dur * 0.66);

  // --- BEAT 6 (Move 9): Parallel R2+R3 -> Swap {3,4} + {2,5} ([0,1,5,4,3,2]) -> f = 2! ---
  tl.to(splitArcM8, { autoAlpha: 0, duration: 0.3 }, b6.start - 0.1);
  tl.to(splitEqBox, { autoAlpha: 0, duration: 0.25 }, b6.start - 0.1);
  moveBottlesTo([0, 1, 2, 3, 4, 5], b6.start + 0.05, 0.75);
  bottles.setScaleValue(splitScale, 0, tl, b6.start + 0.1, 0.45);
  tl.to(uiState, { stepIdx: 8, duration: 0.01, onUpdate: syncUI }, b6.start + 0.85);
  tl.to(splitArcM9, { autoAlpha: 1, duration: 0.5 }, b6.start + b6.dur * 0.16);
  moveBottlesTo([0, 1, 5, 4, 3, 2], b6.start + b6.dur * 0.24, 1.5);
  bottles.setScaleValue(splitScale, 2, tl, b6.start + b6.dur * 0.36, 0.85);
  tl.to(splitEqBox, { autoAlpha: 1, duration: 0.6 }, b6.start + b6.dur * 0.42);
  tl.to(m9NotePill, { autoAlpha: 1, duration: 0.6 }, b6.start + b6.dur * 0.52);
  tl.to(ledgerRowEls[8], { autoAlpha: 1, duration: 0.5 }, b6.start + b6.dur * 0.58);

  // --- BEAT 7: Stopping Trigger (2 + 1 + 1 + 1 + 1 = 6 = n -> Build Graph!) ---
  tl.to(ovSplit, { autoAlpha: 0, duration: 0.35 }, b7.start - 0.15);
  moveBottlesTo([0, 1, 2, 3, 4, 5], b7.start + 0.05, 0.8);
  tl.to(uiState, { stepIdx: 9, duration: 0.01, onUpdate: syncUI }, b7.start + 0.15);
  tl.to(ovStop, { autoAlpha: 1, duration: 0.4 }, b7.start + 0.2);
  tl.to(stopCards, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.35, ease: 'back.out(1.5)' }, b7.start + b7.dur * 0.12);
  tl.to(stopSumBadge, { autoAlpha: 1, duration: 0.65 }, b7.start + b7.dur * 0.46);
  tl.to(stopGateBadge, { autoAlpha: 1, duration: 0.65 }, b7.start + b7.dur * 0.70);

  // --- BEAT 8: Graph + Lock {0,1} -> [1,0] + Animated DFS Tracing 2-3-4-5-2 ---
  tl.to(ovStop, { autoAlpha: 0, duration: 0.35 }, b8.start - 0.15);
  tl.to(uiState, { stepIdx: 10, duration: 0.01, onUpdate: syncUI }, b8.start + 0.15);
  tl.to(ovGraph, { autoAlpha: 1, duration: 0.45 }, b8.start + 0.2);

  // Swap & Lock Bottle 0 & Bottle 1 into [1, 0, 2, 3, 4, 5]
  const lockT = b8.start + b8.dur * 0.08;
  tl.to(bottles2D[0].wrap, { y: tableY - 108, rotation: 8, duration: 0.65, ease: 'power2.out' }, lockT);
  tl.to(bottles2D[0].wrap, { x: xs[1], duration: 1.3, ease: 'power2.inOut' }, lockT);
  tl.to(bottles2D[0].wrap, { y: tableY - 4, rotation: 0, duration: 0.65, ease: 'back.out(1.5)' }, lockT + 0.65);

  tl.to(bottles2D[1].wrap, { y: tableY - 64, rotation: -8, duration: 0.65, ease: 'power2.out' }, lockT);
  tl.to(bottles2D[1].wrap, { x: xs[0], duration: 1.3, ease: 'power2.inOut' }, lockT);
  tl.to(bottles2D[1].wrap, { y: tableY - 4, rotation: 0, duration: 0.65, ease: 'back.out(1.5)' }, lockT + 0.65);

  tl.to(uiState, { pair01Matched: 1, duration: 0.01, onUpdate: syncUI }, lockT + 1.28);
  tl.to(lock01Badge, { autoAlpha: 1, duration: 0.55 }, lockT + 1.4);

  // Draw weight-1 edges & animate DFS tracer 2 -> 3 -> 4 -> 5 -> 2!
  const dfsStart = b8.start + b8.dur * 0.28;
  tl.to(loopGraphG, { autoAlpha: 1, duration: 0.5 }, dfsStart);
  tl.to(dfsDot, { autoAlpha: 1, duration: 0.35 }, dfsStart + 0.4);
  // 2 -> 3
  tl.to(dfsLitPaths[0], { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut' }, dfsStart + 0.8);
  tl.to(dfsDot, { x: xs[3], y: loopY, duration: 1.0, ease: 'power2.inOut' }, dfsStart + 0.8);
  // 3 -> 4
  tl.to(dfsLitPaths[1], { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut' }, dfsStart + 2.0);
  tl.to(dfsDot, { x: xs[4], y: loopY, duration: 1.0, ease: 'power2.inOut' }, dfsStart + 2.0);
  // 4 -> 5
  tl.to(dfsLitPaths[2], { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut' }, dfsStart + 3.2);
  tl.to(dfsDot, { x: xs[5], y: loopY, duration: 1.0, ease: 'power2.inOut' }, dfsStart + 3.2);
  // 5 -> 2 along top arc, then fade tracer dot out cleanly so Node "2" stays 100% readable
  tl.to(dfsLitPaths[3], { strokeDashoffset: 0, duration: 1.25, ease: 'power2.inOut' }, dfsStart + 4.4);
  tl.to(dfsDot, { x: xs[2], y: loopY, duration: 1.25, ease: 'power2.inOut' }, dfsStart + 4.4);
  tl.to(dfsDot, { autoAlpha: 0, duration: 0.45, ease: 'power2.out' }, dfsStart + 5.75);

  tl.to(dfsResultPill, { autoAlpha: 1, duration: 0.6 }, b8.start + b8.dur * 0.58);
  tl.to(largeNNote, { autoAlpha: 1, duration: 0.6 }, b8.start + b8.dur * 0.74);

  // --- BEAT 9 (Move 10): Hold [0,1] on p0, Rotate 2->3->4->5->2 CW -> [0,1,5,2,3,4], f = 0! ---
  tl.to(uiState, { stepIdx: 11, pair01Matched: 0, duration: 0.01, onUpdate: syncUI }, b9.start + 0.2);
  tl.to(lock01Badge, { autoAlpha: 0, duration: 0.3 }, b9.start + 0.15);
  tl.to(largeNNote, { autoAlpha: 0, duration: 0.3 }, b9.start + 0.15);
  tl.to(dfsDot, { autoAlpha: 0, duration: 0.3 }, b9.start + 0.15);
  tl.to(hold01Badge, { autoAlpha: 1, duration: 0.45 }, b9.start + 0.45);

  // Return [0,1] to p0 while rotating 2->3->4->5->2 clockwise into [0, 1, 5, 2, 3, 4]!
  tl.to(bottles2D[0].wrap, { x: xs[0], y: tableY - 4, duration: 0.9, ease: 'power2.inOut' }, b9.start + 0.6);
  tl.to(bottles2D[1].wrap, { x: xs[1], y: tableY - 4, duration: 0.9, ease: 'power2.inOut' }, b9.start + 0.6);

  const cwT = b9.start + b9.dur * 0.24;
  const cwDest = { 2: 3, 3: 4, 4: 5, 5: 2 };
  [2, 3, 4, 5].forEach((bId, idx) => {
    const t0 = cwT + idx * 0.12;
    const peak = bId === 5 ? tableY - 122 : tableY - 70;
    tl.to(bottles2D[bId].wrap, { y: peak, duration: 0.6, ease: 'power2.out' }, t0);
    tl.to(bottles2D[bId].wrap, { x: xs[cwDest[bId]], duration: 1.2, ease: 'power2.inOut' }, t0);
    tl.to(bottles2D[bId].wrap, { y: tableY - 4, duration: 0.6, ease: 'back.out(1.45)' }, t0 + 0.6);
  });

  tl.to(cwVerdictPill, { autoAlpha: 1, duration: 0.65 }, b9.start + b9.dur * 0.56);
  tl.to(ledgerRowEls[9], { autoAlpha: 1, duration: 0.55 }, b9.start + b9.dur * 0.62);

  // --- BEAT 10 (Move 11): FULL-BLEED SUNLIT 3D THREE.JS OAK TABLETOP VICTORY FINALE! ---
  tl.to(act2D, { autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, b10.start - 0.15);
  tl.to(finaleWrap, { autoAlpha: 1, duration: 0.65, ease: 'power2.out' }, b10.start + 0.2);
  tl.set(state3D, { active: 1, onUpdate: render3D }, b10.start + 0.15);

  // Bottles glide smoothly onto [1, 0, 3, 4, 5, 2] during first ~42% of Beat 10
  tl.to(state3D, { p: 1, duration: b10.dur * 0.42, ease: 'power1.inOut', onUpdate: render3D }, b10.start + 0.4);
  tl.to(victoryOverlay, { autoAlpha: 1, y: 0, duration: 0.85, ease: 'back.out(1.3)' }, b10.start + b10.dur * 0.34);

  // Then flip all 6 veiled 3D coasters face-up revealing [1, 0, 3, 4, 5, 2]!
  const flipBase = b10.start + b10.dur * 0.50;
  threeCoasters.forEach((c, i) => {
    bottles.setCoasterRevealed(c, true, tl, flipBase + i * 0.32, 0.55);
  });
  tl.to(state3D, { shimmer: 1, duration: b10.dur * 0.48, ease: 'none', onUpdate: render3D }, flipBase - 0.3);
  tl.to(revealSubEl, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'back.out(1.4)' }, flipBase + 1.8);

  // Pad cleanly to full audio duration
  tl.to({}, { duration: 0.01 }, Math.max(totalDur - 0.01, b10.end));

  syncUI();

  return {
    timeline: tl,
    destroy() {
      if (typeof unsubFrame === 'function') unsubFrame();
      if (threeScene) {
        threeScene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          }
        });
      }
      disposables.forEach((d) => {
        try {
          d?.dispose?.();
        } catch {
          // ignore
        }
      });
      if (renderer) {
        try {
          renderer.dispose();
        } catch {
          // ignore
        }
      }
      rootEl.innerHTML = '';
    },
  };
}
