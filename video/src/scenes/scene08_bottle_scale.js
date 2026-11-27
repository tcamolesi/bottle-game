// Chapter 08: Building Block 2: Bottles as a Weighing Scale
// Act 1: Shuffle 6 labeled bottles (0..5) over veiled '?' coasters until f = 0 baseline p0 locks
//        (1/e ~ 37%, <3 tries) -> swap single pair (0<->1) on top of p0 -> show 3 weight cases (0, 1, 2).
// Act 2: Partition into 3 disjoint pairs (0<->1), (2<->3), (4<->5) with tactile brass ON/OFF toggle
//        switches wired directly into a precision center-pivoted brass scale (createSvgBrassScale +
//        setScaleValue), demonstrating exact additive weights and morphing pairs into coins!

export const sceneMeta = {
  id: 'scene8',
  number: 8,
  title: 'Building Block 2: Bottles as a Weighing Scale',
  chapter: 'Part II · Additive Pairs',
  duration: 86.994,
  beats: [
    {
      id: 's8_b0',
      start: 0.8,
      audioDuration: 8.4,
      end: 9.75,
      text: 'To build a weighing scale out of physical bottles, start by shuffling full permutations until the referee reports score 0.',
      highlight: ['shuffling full permutations', 'score 0'],
      cue: 'whoosh',
    },
    {
      id: 's8_b1',
      start: 9.75,
      audioDuration: 13.7,
      end: 24.0,
      text: 'Roughly 1/e—about 37%—of random permutations have zero matches, so finding this random zero-match baseline p₀ takes under three queries on average.',
      highlight: ['1/e', '37%', 'zero-match baseline p₀'],
      cue: 'bell',
    },
    {
      id: 's8_b2',
      start: 24.0,
      audioDuration: 8.76,
      end: 33.31,
      text: 'Lock p₀ in mind as our clean reference lineup: right now, not a single bottle matches the hidden coaster directly beneath it.',
      highlight: ['clean reference lineup', 'not a single bottle matches'],
      cue: 'lock',
    },
    {
      id: 's8_b3',
      start: 33.31,
      audioDuration: 8.71,
      end: 42.58,
      text: 'Now swap just one pair of slots, i and j, on top of p₀, leaving every other bottle untouched at score 0.',
      highlight: ['swap just one pair', 'untouched at score 0'],
      cue: 'clink',
    },
    {
      id: 's8_b4',
      start: 42.58,
      audioDuration: 9.74,
      end: 52.87,
      text: "The new score equals that pair's weight: 0 if neither matches, 1 if one bottle hits its coaster, or 2 if both match each other's coasters.",
      highlight: ["pair's weight", '0', '1', '2'],
      cue: null,
    },
    {
      id: 's8_b5',
      start: 52.87,
      audioDuration: 11.06,
      end: 64.48,
      text: 'Here is the breakthrough: pick completely disjoint pairs—like (0↔1), (2↔3), and (4↔5)—so no slot appears in two pairs.',
      highlight: ['completely disjoint pairs', 'no slot appears in two pairs'],
      cue: 'whoosh',
    },
    {
      id: 's8_b6',
      start: 64.48,
      audioDuration: 11.64,
      end: 76.67,
      text: 'Because disjoint pairs never overlap, toggling any subset of them on or off leaves untouched slots at zero—so the referee returns the exact sum of their weights!',
      highlight: ['toggling any subset', 'exact sum of their weights'],
      cue: 'scale',
    },
    {
      id: 's8_b7',
      start: 76.67,
      audioDuration: 9.12,
      end: 86.994,
      text: "Each disjoint pair is now a coin, and our bottle table is an exact weighing scale. Next: let's use it to break n log n.",
      highlight: ['Each disjoint pair is now a coin', 'exact weighing scale'],
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

export function buildScene(rootEl, ctx) {
  const { gsap, createSvg, svgEl, createMathEl, bottles } = ctx;
  const P = ctx.colors || bottles.PALETTE;
  const beats = ctx.beats && ctx.beats.length ? ctx.beats : sceneMeta.beats;
  const totalDur = Math.max(ctx.duration || sceneMeta.duration, 86.994);

  const b0 = beatAt(beats, 0, 0.8, 8.4);
  const b1 = beatAt(beats, 1, 9.75, 13.7);
  const b2 = beatAt(beats, 2, 24.0, 8.76);
  const b3 = beatAt(beats, 3, 33.31, 8.71);
  const b4 = beatAt(beats, 4, 42.58, 9.74);
  const b5 = beatAt(beats, 5, 52.87, 11.06);
  const b6 = beatAt(beats, 6, 64.48, 11.64);
  const b7 = beatAt(beats, 7, 76.67, 9.12);

  // 100% mathematically verified secret & permutations:
  // SECRET = [3, 1, 2, 5, 0, 4]
  // Try 1  = [3, 0, 2, 4, 1, 5] -> f = 2 (Slots 0 & 2)
  // Try 2  = [0, 1, 4, 3, 2, 5] -> f = 1 (Slot 1)
  // p0     = [1, 3, 0, 2, 4, 5] -> f = 0 (ZERO matches!)
  // Disjoint swaps on top of p0:
  //   Pair A (0<->1): [3, 1] on [3, 1] -> w(0,1) = 2
  //   Pair B (2<->3): [2, 0] on [2, 5] -> w(2,3) = 1
  //   Pair C (4<->5): [5, 4] on [0, 4] -> w(4,5) = 1
  // Subset toggles:
  //   A + C ON (B OFF) -> 2 + 0 + 1 = 3
  //   A + B + C ON     -> 2 + 1 + 1 = 4
  const SECRET = [3, 1, 2, 5, 0, 4];
  const PERM_TRY1 = [3, 0, 2, 4, 1, 5];
  const PERM_TRY2 = [0, 1, 4, 3, 2, 5];
  const PERM_P0 = [1, 3, 0, 2, 4, 5];

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

  const shelfGrad = svgEl('linearGradient', { id: 's8_shelf', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#D6AA78' }, shelfGrad);
  svgEl('stop', { offset: '55%', 'stop-color': '#B98755' }, shelfGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#8A5E37' }, shelfGrad);

  const coinGold = svgEl('radialGradient', { id: 's8_coin', cx: '38%', cy: '32%', r: '66%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#FDE5A2' }, coinGold);
  svgEl('stop', { offset: '55%', 'stop-color': '#DF9E34' }, coinGold);
  svgEl('stop', { offset: '100%', 'stop-color': '#9E6811' }, coinGold);

  const haloGrad = svgEl('radialGradient', { id: 's8_halo', cx: '50%', cy: '50%', r: '50%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#F5DFB0', 'stop-opacity': '0.44' }, haloGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#F5DFB0', 'stop-opacity': '0' }, haloGrad);

  const arrBrass = svgEl(
    'marker',
    { id: 's8_arr_brass', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6.5', markerHeight: '6.5', orient: 'auto-start-reverse' },
    defs,
  );
  svgEl('path', { d: 'M 1 1.5 L 8.5 5 L 1 8.5 Z', fill: P.brass }, arrBrass);

  // =========================================================================
  // TOP HEADER PILLS (strictly y = 62, clear of top-left whisper)
  // =========================================================================
  const headerSpecs = [
    { txt: 'Step 1 · Shuffle Permutations Until Score f = 0', color: P.brass },
    { txt: 'Derangement Rate · P(f = 0) ≈ 1/e ≈ 37% (< 3 Tries)', color: P.delft },
    { txt: 'Clean Zero-Match Baseline p₀ Locked · Zero Noise', color: P.sage },
    { txt: 'Step 2 · Swap One Pair (0 ↔ 1) on Top of p₀', color: P.terracotta },
    { txt: 'Pair Weight w(i, j) ∈ {0, 1, 2}', color: P.brass },
    { txt: 'Breakthrough · Disjoint Pairs (0↔1), (2↔3), (4↔5)', color: P.delft },
    { txt: 'Additive Bottle Scale · Toggled Pairs Sum Exactly!', color: P.sage },
    { txt: 'Each Disjoint Pair = One Coin on Our Bottle Scale', color: '#7A4F09' },
  ];
  const headerPills = headerSpecs.map((sp, idx) => {
    const p = bottles.createSvgScrimLabel(sp.txt, {
      x: 640,
      y: 62,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: sp.color,
      stroke: sp.color,
      padX: 16,
      padY: 5.5,
    });
    gsap.set(p, { autoAlpha: idx === 0 ? 1 : 0 });
    svg.appendChild(p);
    return p;
  });

  // =========================================================================
  // SHELF STAGE GROUP (scales & shifts smoothly left in Act 2 to fit Brass Scale!)
  // =========================================================================
  const shelfStageG = svgEl('g', { class: 's8-shelf-stage' }, svg);
  svgEl('ellipse', { cx: '485', cy: '235', rx: '410', ry: '126', fill: 'url(#s8_halo)' }, shelfStageG);

  const SLOT_X = [148, 282, 416, 550, 684, 818];
  const SEAT_Y = 276;

  // Walnut shelf plank
  svgEl('rect', { x: '84', y: '294', width: '802', height: '14', rx: '7', fill: '#4A3828', opacity: '0.11' }, shelfStageG);
  svgEl(
    'rect',
    {
      x: '72',
      y: '278',
      width: '826',
      height: '18',
      rx: '5',
      fill: 'url(#s8_shelf)',
      stroke: P.ink,
      'stroke-width': '1.8',
    },
    shelfStageG,
  );
  svgEl('line', { x1: '82', y1: '281.5', x2: '888', y2: '281.5', stroke: '#EED4AE', 'stroke-width': '1.4', opacity: '0.72' }, shelfStageG);

  // 6 Veiled Coasters (hidden: true -> '?')
  const coasters = [];
  const zeroBadges = [];
  const slotGroups = [];

  for (let i = 0; i < 6; i++) {
    const cx = SLOT_X[i];
    const sg = svgEl('g', {}, shelfStageG);
    const coaster = bottles.createSvgCoaster(SECRET[i], {
      x: cx,
      y: SEAT_Y,
      width: 74,
      scale: 0.92,
      hidden: true,
      slotIndex: i,
    });
    sg.appendChild(coaster);
    coasters.push(coaster);
    slotGroups.push(sg);

    // Clean '0' baseline contribution badge beneath coaster (b2..b3)
    const zb = bottles.createSvgScrimLabel('0', {
      x: cx,
      y: 344,
      fontSize: 12,
      fontFamily: 'mono',
      fontWeight: 700,
      color: P.sage,
      stroke: P.sage,
      fill: '#EEF8F2',
      padX: 9,
      padY: 2.5,
    });
    gsap.set(zb, { autoAlpha: 0 });
    sg.appendChild(zb);
    zeroBadges.push(zb);
  }

  // 6 Physical Bottles [0..5], starting in identity [0,1,2,3,4,5]
  const bottleMovers = [];
  const bottleLifts = [];
  const liqLevels = [0.72, 0.64, 0.76, 0.66, 0.7, 0.62];

  for (let id = 0; id < 6; id++) {
    const mover = svgEl('g', {}, shelfStageG);
    const lift = svgEl('g', {}, mover);
    const bNode = bottles.createSvgBottle(id, { x: 0, y: 0, scale: 0.92, liquidLevel: liqLevels[id] });
    lift.appendChild(bNode);
    gsap.set(mover, { x: SLOT_X[id], y: SEAT_Y - 1 });
    gsap.set(lift, { y: 0 });
    bottleMovers.push(mover);
    bottleLifts.push(lift);
  }

  // Helper: place permutation `perm` (where slot s holds bottle perm[s]) at time t
  function animatePermutation(tl, perm, startTime, dur = 1.05) {
    const half = dur * 0.5;
    for (let s = 0; s < 6; s++) {
      const bottleId = perm[s];
      tl.to(bottleMovers[bottleId], { x: SLOT_X[s], duration: dur, ease: 'power2.inOut', immediateRender: false }, startTime);
      tl.to(bottleLifts[bottleId], { y: -46 - (s % 2) * 14, duration: half, ease: 'power2.out', immediateRender: false }, startTime);
      tl.to(bottleLifts[bottleId], { y: 0, duration: half, ease: 'bounce.out', immediateRender: false }, startTime + half);
    }
  }

  // Helper: swap two specific bottle IDs standing on slots sA and sB
  function animateBottlePairSwap(tl, idA, idB, sA, sB, startTime, dur = 0.85) {
    const half = dur * 0.5;
    tl.to(bottleMovers[idA], { x: SLOT_X[sB], duration: dur, ease: 'power2.inOut', immediateRender: false }, startTime);
    tl.to(bottleMovers[idB], { x: SLOT_X[sA], duration: dur, ease: 'power2.inOut', immediateRender: false }, startTime);
    tl.to(bottleLifts[idA], { y: -52, duration: half, ease: 'power2.out', immediateRender: false }, startTime);
    tl.to(bottleLifts[idA], { y: 0, duration: half, ease: 'bounce.out', immediateRender: false }, startTime + half);
    tl.to(bottleLifts[idB], { y: -26, duration: half, ease: 'power2.out', immediateRender: false }, startTime);
    tl.to(bottleLifts[idB], { y: 0, duration: half, ease: 'power2.in', immediateRender: false }, startTime + half);
  }

  // Single-pair swap arc (0 <-> 1) during b3..b4
  const pair01Arc = svgEl('g', {}, shelfStageG);
  svgEl(
    'path',
    {
      d: `M ${SLOT_X[0]} 166 Q ${(SLOT_X[0] + SLOT_X[1]) / 2} 106 ${SLOT_X[1]} 166`,
      fill: 'none',
      stroke: P.brass,
      'stroke-width': '2.5',
      'stroke-dasharray': '5 3',
      'marker-start': 'url(#s8_arr_brass)',
      'marker-end': 'url(#s8_arr_brass)',
    },
    pair01Arc,
  );
  pair01Arc.appendChild(
    bottles.createSvgScrimLabel('Swap (0 ↔ 1)', {
      x: (SLOT_X[0] + SLOT_X[1]) / 2,
      y: 120,
      fontSize: 12,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#7A4F09',
      fill: '#FDF0CC',
      stroke: P.brass,
      padX: 10,
      padY: 3.5,
    }),
  );
  gsap.set(pair01Arc, { autoAlpha: 0 });

  // =========================================================================
  // ACT 1 RIGHT SCORE PLAQUE (b0 .. b4, x = 934..1226, y = 136..292)
  // =========================================================================
  const act1PlaqueG = svgEl('g', { transform: 'translate(1080, 214)' }, svg);
  svgEl('rect', { x: '-144', y: '-74', width: '288', height: '148', rx: '15', fill: P.parchment, stroke: P.brass, 'stroke-width': '2' }, act1PlaqueG);
  svgEl('rect', { x: '-137', y: '-67', width: '274', height: '134', rx: '10', fill: 'none', stroke: 'rgba(200, 138, 30, 0.34)', 'stroke-width': '1' }, act1PlaqueG);
  svgEl('text', { x: '0', y: '-46', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '11', 'font-weight': '700', 'letter-spacing': '0.1em', textContent: 'REFEREE REPORT' }, act1PlaqueG);

  const scoreReadouts = [
    { main: 'Try 1: f = 2', sub: 'Keep shuffling…', color: P.terracotta },
    { main: 'Try 2: f = 1', sub: 'Almost there…', color: P.brass },
    { main: 'f = 0  ✓', sub: 'Zero-Match Baseline p₀!', color: P.sage },
    { main: 'w(0,1) = 2', sub: 'Pair weight isolated!', color: '#7A4F09' },
  ].map((sr, idx) => {
    const g = svgEl('g', {}, act1PlaqueG);
    svgEl('text', { x: '0', y: '4', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: sr.color, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '33', 'font-weight': '700', textContent: sr.main }, g);
    svgEl('text', { x: '0', y: '44', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '13', 'font-weight': '600', textContent: sr.sub }, g);
    gsap.set(g, { autoAlpha: idx === 0 ? 1 : 0 });
    return g;
  });

  // =========================================================================
  // ACT 1 LOWER CARDS: (b1) 1/e Derangement Card & (b4) 3 Weight Cases (0, 1, 2)
  // =========================================================================
  const derangeCard = document.createElement('div');
  derangeCard.className = 'label-scrim label-scrim-card';
  derangeCard.style.cssText =
    'position:absolute;left:130px;top:384px;width:1020px;height:146px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:18px 32px;border:1.6px solid rgba(61,126,166,0.45);background:rgba(255,251,242,0.96);opacity:0;';

  const dLeft = document.createElement('div');
  dLeft.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
  dLeft.innerHTML =
    '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:0.1em;color:#3D7EA6;">DERANGEMENT PROBABILITY</div>';
  dLeft.appendChild(createMathEl('P(f = 0) \\;\\approx\\; \\frac{1}{e} \\;\\approx\\; 36.8\\%', { fontSize: 24, color: '#1F1A17' }));

  const dMid = document.createElement('div');
  dMid.style.cssText = 'width:1px;height:86px;background:rgba(107,94,84,0.2);';

  const dRight = document.createElement('div');
  dRight.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
  dRight.innerHTML =
    '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:0.1em;color:#4E8C6F;">EXPECTED QUERIES TO FIND p₀</div>' +
    '<div style="font-family:\'Fraunces\',Georgia,serif;font-size:26px;font-weight:700;color:#2B5B45;">e ≈ 2.72 Queries  (&lt; 3 tries!)</div>' +
    '<div style="font-family:\'Plus Jakarta Sans\',sans-serif;font-size:13px;color:#6B5E54;">A negligible constant setup cost before weighing begins.</div>';

  derangeCard.appendChild(dLeft);
  derangeCard.appendChild(dMid);
  derangeCard.appendChild(dRight);
  htmlLayer.appendChild(derangeCard);

  // Three Weight Case Cards (b4, y = 378..542)
  const casesG = svgEl('g', {}, svg);
  gsap.set(casesG, { autoAlpha: 0 });

  const caseSpecs = [
    {
      w: 'w(i, j) = 0',
      sub: 'Neither swapped bottle hits',
      pair: ['B₁ ≠ C₁', 'B₂ ≠ C₂'],
      marks: ['✗', '✗'],
      markColors: [P.cinnabar, P.cinnabar],
      color: P.sepia,
      bg: '#FBF8F1',
      cx: 245,
    },
    {
      w: 'w(i, j) = 1',
      sub: 'Exactly one hits its coaster',
      pair: ['B₁ = C₁', 'B₂ ≠ C₂'],
      marks: ['✓', '✗'],
      markColors: [P.sage, P.cinnabar],
      color: P.delft,
      bg: '#F4F9FC',
      cx: 640,
    },
    {
      w: 'w(i, j) = 2',
      sub: 'Both match each other’s coaster!',
      pair: ['B₃ = C₃', 'B₁ = C₁'],
      marks: ['✓', '✓'],
      markColors: [P.sage, P.sage],
      color: P.brass,
      bg: '#FDF5DF',
      cx: 1035,
    },
  ];

  const caseNodes = caseSpecs.map((cs) => {
    const g = svgEl('g', { transform: `translate(${cs.cx}, 460)` }, casesG);
    const inner = svgEl('g', {}, g);
    svgEl('rect', { x: '-168', y: '-76', width: '336', height: '152', rx: '15', fill: cs.bg, stroke: cs.color, 'stroke-width': '2' }, inner);
    svgEl('text', { x: '0', y: '-46', 'text-anchor': 'middle', fill: cs.color, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '24', 'font-weight': '700', textContent: cs.w }, inner);
    svgEl('text', { x: '0', y: '-20', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '13', 'font-weight': '600', textContent: cs.sub }, inner);

    // Two mini pill indicators inside each case card
    for (let k = 0; k < 2; k++) {
      const px = k === 0 ? -74 : 74;
      svgEl('rect', { x: String(px - 62), y: '8', width: '124', height: '42', rx: '10', fill: '#FFFDF8', stroke: cs.markColors[k], 'stroke-width': '1.5' }, inner);
      svgEl('text', { x: String(px - 44), y: '30', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: cs.markColors[k], 'font-family': "'JetBrains Mono', monospace", 'font-size': '16', 'font-weight': '800', textContent: cs.marks[k] }, inner);
      svgEl('text', { x: String(px + 12), y: '30', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12.5', 'font-weight': '700', textContent: cs.pair[k] }, inner);
    }
    gsap.set(inner, { autoAlpha: 0, y: 18 });
    return inner;
  });

  // =========================================================================
  // ACT 2: DISJOINT PAIRS + BRASS TOGGLE SWITCHES + CENTER-PIVOTED BRASS SCALE (b5 .. b7)
  // =========================================================================
  const act2G = svgEl('g', { class: 's8-act2' }, svg);
  gsap.set(act2G, { autoAlpha: 0 });

  // Precision Center-Pivoted Antique Brass Scale on the right! (MANDATORY createSvgBrassScale!)
  const SCALE_X = 1058;
  const SCALE_Y = 382;
  const scaleG = bottles.createSvgBrassScale({
    x: SCALE_X,
    y: SCALE_Y,
    maxVal: 5,
    initialVal: 0,
    radius: 74,
    unit: '',
  });
  act2G.appendChild(scaleG);

  // Crisp additive equation pill above the scale (y = 148)
  const eqNone = bottles.createSvgScrimLabel('All Pairs OFF  →  Score = 0', {
    x: SCALE_X,
    y: 148,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sepia,
    stroke: P.sepia,
    padX: 13,
    padY: 5,
  });
  const eqAC = bottles.createSvgScrimLabel('w(0,1) + w(4,5) = 2 + 1 = 3', {
    x: SCALE_X,
    y: 148,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 800,
    color: P.sage,
    stroke: P.sage,
    fill: '#EEF8F2',
    padX: 14,
    padY: 5.5,
  });
  const eqABC = bottles.createSvgScrimLabel('w(0,1) + w(2,3) + w(4,5) = 2 + 1 + 1 = 4', {
    x: SCALE_X,
    y: 148,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 800,
    color: '#7A4F09',
    stroke: P.brass,
    fill: '#FDF0CC',
    padX: 13,
    padY: 5.5,
  });
  gsap.set([eqAC, eqABC], { autoAlpha: 0 });
  act2G.appendChild(eqNone);
  act2G.appendChild(eqAC);
  act2G.appendChild(eqABC);

  // Pair positions in scaled shelfStageG (shelfStageG transforms to x: -16, y: -6, scale: 0.84)
  // Let's compute exact world X of slots when shelfStageG has { x: 18, y: -12, scale: 0.84, transformOrigin: '0px 0px' }:
  // worldX(s) = 18 + 0.84 * SLOT_X[s]
  const ACT2_SX = 18;
  const ACT2_SY = -12;
  const ACT2_SC = 0.84;
  const worldSlotX = (s) => ACT2_SX + ACT2_SC * SLOT_X[s];

  const PAIRS = [
    { name: 'Pair (0 ↔ 1)', sA: 0, sB: 1, w: 2, color: P.brass, label: 'w = 2' },
    { name: 'Pair (2 ↔ 3)', sA: 2, sB: 3, w: 1, color: P.delft, label: 'w = 1' },
    { name: 'Pair (4 ↔ 5)', sA: 4, sB: 5, w: 1, color: P.sage, label: 'w = 1' },
  ];

  const switchControls = [];
  const conduits = [];
  const pairCoins = [];

  PAIRS.forEach((pr, idx) => {
    const x1 = worldSlotX(pr.sA);
    const x2 = worldSlotX(pr.sB);
    const midX = (x1 + x2) / 2;

    // Non-overlapping brass bracket beneath the pair (y = 296..328)
    svgEl(
      'path',
      {
        d: `M ${x1 - 36} 298 L ${x1 - 36} 314 L ${x2 + 36} 314 L ${x2 + 36} 298`,
        fill: 'none',
        stroke: pr.color,
        'stroke-width': '2.4',
      },
      act2G,
    );
    act2G.appendChild(
      bottles.createSvgScrimLabel(`${pr.name}  ·  ${pr.label}`, {
        x: midX,
        y: 338,
        fontSize: 12,
        fontFamily: 'mono',
        fontWeight: 700,
        color: pr.color,
        stroke: pr.color,
        padX: 10,
        padY: 3.5,
      }),
    );

    // Tactile Brass ON/OFF Toggle Switch centered at (midX, 396)
    const swG = svgEl('g', { transform: `translate(${midX}, 396)` }, act2G);
    // Switch backing plate
    svgEl('rect', { x: '-58', y: '-28', width: '116', height: '56', rx: '12', fill: P.parchment, stroke: 'rgba(107, 94, 84, 0.28)', 'stroke-width': '1.4' }, swG);
    // Toggle pill track (OFF state)
    const track = svgEl('rect', { x: '-34', y: '-14', width: '68', height: '28', rx: '14', fill: '#D9CEC0', stroke: P.ink, 'stroke-width': '1.5' }, swG);
    const trackOn = svgEl('rect', { x: '-34', y: '-14', width: '68', height: '28', rx: '14', fill: pr.color, stroke: P.ink, 'stroke-width': '1.5', opacity: '0' }, swG);
    // Labels OFF / ON
    const offTxt = svgEl('text', { x: '13', y: '0.5', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '10', 'font-weight': '700', textContent: 'OFF' }, swG);
    const onTxt = svgEl('text', { x: '-13', y: '0.5', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#FFFBF2', 'font-family': "'JetBrains Mono', monospace", 'font-size': '10', 'font-weight': '800', opacity: '0', textContent: 'ON' }, swG);
    // Sliding brass thumb knob
    const knob = svgEl('g', {}, swG);
    svgEl('circle', { cx: '0', cy: '0', r: '11', fill: '#FDF1D0', stroke: P.ink, 'stroke-width': '1.6' }, knob);
    svgEl('circle', { cx: '0', cy: '0', r: '4.5', fill: P.brass }, knob);
    gsap.set(knob, { x: -19 });
    switchControls.push({ track, trackOn, offTxt, onTxt, knob });

    // Signal conduit from switch down & across into Brass Scale!
    const busY = 456 + idx * 18;
    const pathD = `M ${midX} 426 L ${midX} ${busY} L ${SCALE_X - 88} ${busY} L ${SCALE_X - 88} ${SCALE_Y + 6} L ${SCALE_X - 76} ${SCALE_Y + 6}`;
    // Faint base wire
    svgEl('path', { d: pathD, fill: 'none', stroke: 'rgba(107, 94, 84, 0.22)', 'stroke-width': '2', 'stroke-dasharray': '5 4' }, act2G);
    // Glowing active wire
    const activeWire = svgEl('path', { d: pathD, fill: 'none', stroke: pr.color, 'stroke-width': '3', opacity: '0' }, act2G);
    conduits.push(activeWire);

    // Pair-Coin that rises & arcs onto the Brass Scale Pan in b7!
    const coinMover = svgEl('g', {}, act2G);
    svgEl('circle', { cx: '1', cy: '2', r: '23', fill: '#4A3828', opacity: '0.18' }, coinMover);
    svgEl('circle', { cx: '0', cy: '0', r: '23', fill: 'url(#s8_coin)', stroke: P.ink, 'stroke-width': '1.8' }, coinMover);
    svgEl('circle', { cx: '0', cy: '0', r: '18.5', fill: 'none', stroke: 'rgba(255, 250, 232, 0.75)', 'stroke-width': '1.1', 'stroke-dasharray': '2.5 2' }, coinMover);
    svgEl('text', { x: '0', y: '-6.5', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': '10.5', 'font-weight': '800', textContent: `${pr.sA}↔${pr.sB}` }, coinMover);
    svgEl('text', { x: '0', y: '8.5', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#7A4F09', 'font-family': "'JetBrains Mono', monospace", 'font-size': '9.5', 'font-weight': '800', textContent: `w=${pr.w}` }, coinMover);
    gsap.set(coinMover, { x: midX, y: 396, autoAlpha: 0, scale: 0.7 });
    pairCoins.push(coinMover);
  });

  // Zero-overlap callout pill (b5)
  const disjointBadge = bottles.createSvgScrimLabel('Zero Shared Slots → Zero Interference Between Pairs!', {
    x: 416,
    y: 534,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.delft,
    stroke: P.delft,
    fill: '#F4F9FC',
    padX: 14,
    padY: 5,
  });
  act2G.appendChild(disjointBadge);

  // Final Bridge Pill (b7)
  const bridgePill = bottles.createSvgScrimLabel('Disjoint Pair = Coin · Bottle Table = Exact Scale → Next: Break O(n log n)', {
    x: 446,
    y: 534,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#2B5B45',
    stroke: P.sage,
    fill: '#EEF8F2',
    padX: 16,
    padY: 5.5,
  });
  gsap.set(bridgePill, { autoAlpha: 0 });
  act2G.appendChild(bridgePill);

  // Helper: flip switch ON/OFF cleanly on timeline
  function setSwitchState(tl, idx, isOn, atTime) {
    const sw = switchControls[idx];
    tl.to(sw.knob, { x: isOn ? 19 : -19, duration: 0.35, ease: 'back.out(1.6)', immediateRender: false }, atTime);
    tl.to(sw.trackOn, { opacity: isOn ? 1 : 0, duration: 0.3, immediateRender: false }, atTime);
    tl.to(sw.onTxt, { opacity: isOn ? 1 : 0, duration: 0.25, immediateRender: false }, atTime);
    tl.to(sw.offTxt, { opacity: isOn ? 0 : 1, duration: 0.25, immediateRender: false }, atTime);
    tl.to(conduits[idx], { opacity: isOn ? 1 : 0, duration: 0.35, immediateRender: false }, atTime + 0.1);
  }

  // =========================================================================
  // MASTER BIDIRECTIONAL GSAP TIMELINE
  // =========================================================================
  const tl = gsap.timeline({ paused: true });

  const switchHeader = (fromIdx, toIdx, t) => {
    tl.to(headerPills[fromIdx], { autoAlpha: 0, duration: 0.22, immediateRender: false }, t);
    tl.to(headerPills[toIdx], { autoAlpha: 1, duration: 0.28, immediateRender: false }, t + 0.16);
  };
  const switchReadout = (fromIdx, toIdx, t) => {
    tl.to(scoreReadouts[fromIdx], { autoAlpha: 0, duration: 0.22, immediateRender: false }, t);
    tl.to(scoreReadouts[toIdx], { autoAlpha: 1, duration: 0.28, immediateRender: false }, t + 0.16);
  };

  // --- b0 (0.80s): Shuffle 3 times until f = 0 baseline p0 = [1, 3, 0, 2, 4, 5] ---
  tl.fromTo([shelfStageG, act1PlaqueG], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0);
  animatePermutation(tl, PERM_TRY1, b0.start + 0.8, 0.95);
  animatePermutation(tl, PERM_TRY2, b0.start + 3.1, 0.95);
  switchReadout(0, 1, b0.start + 4.1);
  animatePermutation(tl, PERM_P0, b0.start + 5.4, 1.05);
  switchReadout(1, 2, b0.start + 6.55);

  // --- b1 (9.75s): 1/e ~ 37% derangement probability (< 3 tries on average) ---
  switchHeader(0, 1, b1.start);
  tl.to(derangeCard, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, b1.start + 0.8);

  // --- b2 (24.00s): Lock p0 as clean zero-match baseline; brief X-ray confirm all 6 mismatch! ---
  switchHeader(1, 2, b2.start);
  tl.to(derangeCard, { autoAlpha: 0, duration: 0.4 }, b2.start + 0.1);
  tl.to(zeroBadges, { autoAlpha: 1, duration: 0.4, stagger: 0.08 }, b2.start + 0.8);
  // Brief X-ray flip open to prove zero bottles match their coasters, then veil back
  coasters.forEach((c, i) => {
    bottles.setCoasterRevealed(c, true, tl, b2.start + 2.2 + i * 0.1, 0.36);
    bottles.setCoasterRevealed(c, false, tl, b2.start + 6.8 + i * 0.08, 0.36);
  });

  // --- b3 (33.31s): Swap single pair (0 <-> 1) on top of p0 (Bottles 1 and 3 swap!) ---
  switchHeader(2, 3, b3.start);
  // Dim untouched slots 2..5 (and their bottles: PERM_P0[2..5] = [0, 2, 4, 5])
  tl.to([slotGroups[2], slotGroups[3], slotGroups[4], slotGroups[5]], { opacity: 0.42, duration: 0.45 }, b3.start + 0.4);
  tl.to([bottleMovers[0], bottleMovers[2], bottleMovers[4], bottleMovers[5]], { opacity: 0.42, duration: 0.45 }, b3.start + 0.4);
  tl.to(pair01Arc, { autoAlpha: 1, duration: 0.4 }, b3.start + 0.8);
  // Swap Bottle 1 (at Slot 0) with Bottle 3 (at Slot 1)
  animateBottlePairSwap(tl, 1, 3, 0, 1, b3.start + 1.5, 1.05);
  switchReadout(2, 3, b3.start + 2.75);
  // Briefly reveal coasters 0 & 1 so viewer sees 3==3 and 1==1 -> w(0,1) = 2!
  bottles.setCoasterRevealed(coasters[0], true, tl, b3.start + 3.2, 0.36);
  bottles.setCoasterRevealed(coasters[1], true, tl, b3.start + 3.35, 0.36);

  // --- b4 (42.58s): Show all 3 possible weight cases: 0, 1, or 2 ---
  switchHeader(3, 4, b4.start);
  tl.to(casesG, { autoAlpha: 1, duration: 0.3 }, b4.start + 0.2);
  tl.to(caseNodes[0], { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.3)' }, b4.start + 1.0);
  tl.to(caseNodes[1], { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.3)' }, b4.start + 3.3);
  tl.to(caseNodes[2], { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.3)' }, b4.start + 5.8);
  // Return Pair (0 <-> 1) back to p0 and veil coasters 0 & 1 cleanly before Act 2!
  bottles.setCoasterRevealed(coasters[0], false, tl, b4.end - 1.5, 0.34);
  bottles.setCoasterRevealed(coasters[1], false, tl, b4.end - 1.4, 0.34);
  animateBottlePairSwap(tl, 3, 1, 0, 1, b4.end - 1.25, 0.85);

  // --- ACT 1 -> ACT 2 TRANSITION (b5: Disjoint Pairs + Brass Toggle Switches + Brass Scale) ---
  switchHeader(4, 5, b5.start);
  tl.to([act1PlaqueG, casesG, pair01Arc, zeroBadges], { autoAlpha: 0, duration: 0.4 }, b5.start);
  tl.to([slotGroups[2], slotGroups[3], slotGroups[4], slotGroups[5]], { opacity: 1, duration: 0.45 }, b5.start + 0.15);
  tl.to([bottleMovers[0], bottleMovers[2], bottleMovers[4], bottleMovers[5]], { opacity: 1, duration: 0.45 }, b5.start + 0.15);
  // Smoothly scale & anchor shelfStageG on the left so Brass Scale sits spaciously on the right!
  tl.to(
    shelfStageG,
    { x: ACT2_SX, y: ACT2_SY, scale: ACT2_SC, transformOrigin: '0px 0px', duration: 0.75, ease: 'power2.inOut' },
    b5.start + 0.25,
  );
  tl.to(act2G, { autoAlpha: 1, duration: 0.65, ease: 'power2.out' }, b5.start + 0.9);

  // --- b6 (64.48s): Toggle Disjoint Subsets ON/OFF -> Brass Scale Hits Exact Sum! ---
  switchHeader(5, 6, b6.start);

  // Toggle Sequence 1: Pairs A (0<->1, w=2) and C (4<->5, w=1) ON while B stays OFF -> sum = 3!
  setSwitchState(tl, 0, true, b6.start + 1.0);
  setSwitchState(tl, 2, true, b6.start + 1.35);
  animateBottlePairSwap(tl, 1, 3, 0, 1, b6.start + 1.2, 0.85); // Pair A swaps
  animateBottlePairSwap(tl, 4, 5, 4, 5, b6.start + 1.5, 0.85); // Pair C swaps
  bottles.setScaleValue(scaleG, 3, tl, b6.start + 2.2, 0.75);
  tl.to(eqNone, { autoAlpha: 0, duration: 0.22 }, b6.start + 2.2);
  tl.to(eqAC, { autoAlpha: 1, duration: 0.35 }, b6.start + 2.45);

  // Toggle Sequence 2: Also flip Pair B (2<->3, w=1) ON -> sum = 2 + 1 + 1 = 4!
  setSwitchState(tl, 1, true, b6.start + 6.4);
  animateBottlePairSwap(tl, 0, 2, 2, 3, b6.start + 6.6, 0.85); // Pair B swaps
  bottles.setScaleValue(scaleG, 4, tl, b6.start + 7.4, 0.65);
  tl.to(eqAC, { autoAlpha: 0, duration: 0.22 }, b6.start + 7.4);
  tl.to(eqABC, { autoAlpha: 1, duration: 0.35 }, b6.start + 7.65);

  // --- b7 (76.67s): Disjoint Pairs Transform into Coins Landing on Brass Scale Pan! ---
  switchHeader(6, 7, b7.start);
  tl.to(disjointBadge, { autoAlpha: 0, duration: 0.3 }, b7.start + 0.2);
  tl.to(bridgePill, { autoAlpha: 1, duration: 0.5, ease: 'back.out(1.3)' }, b7.start + 0.6);

  // 3 Gold Pair-Coins emerge from switches and arc cleanly onto the Brass Scale Pan (seated at val=4)!
  const panSeatedY = SCALE_Y + scaleG.panSurfaceY + 4 * 3 - 18;
  pairCoins.forEach((cm, idx) => {
    const ct = b7.start + 0.8 + idx * 0.45;
    const targetX = SCALE_X + (idx - 1) * 40;
    tl.to(cm, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)' }, ct);
    tl.to(cm, { x: targetX, y: panSeatedY, duration: 0.95, ease: 'power2.inOut', immediateRender: false }, ct + 0.4);
  });

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
