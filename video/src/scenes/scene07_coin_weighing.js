// Chapter 07: Building Block 1: The Coin-Weighing Scale
// Act 1: Precision center-pivoted brass scale (ctx.bottles.createSvgBrassScale + setScaleValue)
//        + 5 embossed gold coins [1,0,1,1,0] + 4 overlapping Lindstrom D2 weighings (3g, 2g, 1g, 2g).
// Act 2: Crystal-clear step-by-step algebraic cancellation (W3 + W4 - W1 + W2 = 2c0 + c4),
//        parity mod 2 revealing c4 = 0, dividing by 2 -> c0 = 1, and back-substitution cascade.
// Act 3: Lindstrom recursive block matrix scaling from 5-in-4 up to 449 coins in 128 weighings
//        and O(m / log m) compression bridging into physical bottles.

export const sceneMeta = {
  id: 'scene7',
  number: 7,
  title: 'Building Block 1: The Coin-Weighing Scale',
  chapter: 'Part II · Coin Weighing',
  duration: 113.802,
  beats: [
    {
      id: 's7_b0',
      start: 0.8,
      audioDuration: 12.02,
      end: 13.37,
      text: 'Building Block 1 comes from a classic puzzle: five coins, zero through four—each 0g if real or 1g if counterfeit—on an exact summing scale.',
      highlight: ['five coins', '0g if real or 1g if counterfeit', 'exact summing scale'],
      cue: 'scale',
    },
    {
      id: 's7_b1',
      start: 13.37,
      audioDuration: 11.95,
      end: 25.88,
      text: 'Testing one coin at a time takes five weighings, yet four overlapping weighings identify all five. Suppose the hidden weights are [1, 0, 1, 1, 0].',
      highlight: ['four overlapping weighings', '[1, 0, 1, 1, 0]'],
      cue: null,
    },
    {
      id: 's7_b2',
      start: 25.88,
      audioDuration: 19.58,
      end: 46.01,
      text: 'Weigh four subsets: W₁={0,1,2,3,4} reads 3g; W₂={0,2} reads 2g; W₃={0,1,4} reads 1g; W₄={0,3,4} reads 2g.',
      highlight: ['W₁={0,1,2,3,4} reads 3g', 'W₂={0,2} reads 2g', 'W₃={0,1,4} reads 1g', 'W₄={0,3,4} reads 2g'],
      cue: 'scale',
    },
    {
      id: 's7_b3',
      start: 46.01,
      audioDuration: 14.16,
      end: 60.72,
      text: 'Now compute W₃ + W₄ − W₁ + W₂. Coins 1, 2, and 3 cancel out cleanly, leaving strictly 2c₀ + c₄.',
      highlight: ['W₃ + W₄ − W₁ + W₂', '2c₀ + c₄'],
      cue: 'whoosh',
    },
    {
      id: 's7_b4',
      start: 60.72,
      audioDuration: 12.7,
      end: 73.97,
      text: 'Here, 1 + 2 − 3 + 2 = 2. Since 2c₀ is always even, parity mod 2 immediately reveals c₄ = 0.',
      highlight: ['1 + 2 − 3 + 2 = 2', 'parity mod 2', 'c₄ = 0'],
      cue: 'lock',
    },
    {
      id: 's7_b5',
      start: 73.97,
      audioDuration: 12.6,
      end: 87.12,
      text: 'Subtract c₄ and divide by 2 to find c₀ = 1; then subtracting from W₂, W₃, and W₄ recovers coins 2, 1, and 3.',
      highlight: ['c₀ = 1', 'recovers coins 2, 1, and 3'],
      cue: 'bell',
    },
    {
      id: 's7_b6',
      start: 87.12,
      audioDuration: 14.04,
      end: 101.71,
      text: "Lindström's recursive matrix doubles weighings while more than doubling coins—pairing a block with its complement to peel extra coins mod 2, scaling from 5-in-4 to 449 coins in 128.",
      highlight: ['Lindström\'s recursive matrix', '449 coins in 128'],
      cue: 'whoosh',
    },
    {
      id: 's7_b7',
      start: 101.71,
      audioDuration: 10.9,
      end: 113.802,
      text: 'Asymptotically, that compresses m binary tests down to O(m / log m) weighings. Now: how do we turn physical bottles into a weighing scale?',
      highlight: ['O(m / log m) weighings', 'physical bottles into a weighing scale'],
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
  const totalDur = Math.max(ctx.duration || sceneMeta.duration, 113.802);

  const b0 = beatAt(beats, 0, 0.8, 12.02);
  const b1 = beatAt(beats, 1, 13.37, 11.95);
  const b2 = beatAt(beats, 2, 25.88, 19.58);
  const b3 = beatAt(beats, 3, 46.01, 14.16);
  const b4 = beatAt(beats, 4, 60.72, 12.7);
  const b5 = beatAt(beats, 5, 73.97, 12.6);
  const b6 = beatAt(beats, 6, 87.12, 14.04);
  const b7 = beatAt(beats, 7, 101.71, 10.9);

  const SECRET = [1, 0, 1, 1, 0];
  const WEIGHINGS = [
    { id: 'W₁', mask: [1, 1, 1, 1, 1], subset: '{0, 1, 2, 3, 4}', result: 3, color: P.brass },
    { id: 'W₂', mask: [1, 0, 1, 0, 0], subset: '{0, 2}', result: 2, color: P.delft },
    { id: 'W₃', mask: [1, 1, 0, 0, 1], subset: '{0, 1, 4}', result: 1, color: P.terracotta },
    { id: 'W₄', mask: [1, 0, 0, 1, 1], subset: '{0, 3, 4}', result: 2, color: P.sage },
  ];

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

  const coinGold = svgEl('radialGradient', { id: 's7_coin_gold', cx: '38%', cy: '32%', r: '66%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#FDE5A2' }, coinGold);
  svgEl('stop', { offset: '55%', 'stop-color': '#DF9E34' }, coinGold);
  svgEl('stop', { offset: '100%', 'stop-color': '#9E6811' }, coinGold);

  const coinPewter = svgEl('radialGradient', { id: 's7_coin_pewter', cx: '38%', cy: '32%', r: '66%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#F5F0E6' }, coinPewter);
  svgEl('stop', { offset: '60%', 'stop-color': '#CFC5B4' }, coinPewter);
  svgEl('stop', { offset: '100%', 'stop-color': '#968B7B' }, coinPewter);

  const trayGrad = svgEl('linearGradient', { id: 's7_tray', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#CE9F6E' }, trayGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#8A5D36' }, trayGrad);

  const haloGrad = svgEl('radialGradient', { id: 's7_halo', cx: '50%', cy: '50%', r: '50%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#F5DFB0', 'stop-opacity': '0.42' }, haloGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#F5DFB0', 'stop-opacity': '0' }, haloGrad);

  const arrM = svgEl(
    'marker',
    { id: 's7_arr', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6.5', markerHeight: '6.5', orient: 'auto' },
    defs,
  );
  svgEl('path', { d: 'M 1 1.5 L 8.5 5 L 1 8.5 Z', fill: P.brass }, arrM);

  // Helper: create a handcrafted embossed gold apothecary coin
  function createCoin(index, radius = 22, fillUrl = 'url(#s7_coin_gold)') {
    const g = svgEl('g', { class: `s7-coin-${index}` });
    svgEl('circle', { cx: '1.5', cy: '2.5', r: String(radius), fill: '#4A3828', opacity: '0.18' }, g);
    svgEl('circle', { cx: '0', cy: '0', r: String(radius), fill: fillUrl, stroke: P.ink, 'stroke-width': '1.8' }, g);
    svgEl(
      'circle',
      { cx: '0', cy: '0', r: String(radius - 4.2), fill: 'none', stroke: 'rgba(255, 250, 232, 0.72)', 'stroke-width': '1.1', 'stroke-dasharray': '2.5 2' },
      g,
    );
    svgEl(
      'text',
      {
        x: '0',
        y: '0.5',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: P.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': String(Math.round(radius * 0.72)),
        'font-weight': '800',
        textContent: `c${index}`,
      },
      g,
    );
    return g;
  }

  // =========================================================================
  // ACT 1: CENTER-PIVOTED BRASS SCALE + 5 COINS + 4 LIVE WEIGHINGS (b0 .. b2)
  // =========================================================================
  const act1G = svgEl('g', { class: 's7-act1' }, svg);
  svgEl('ellipse', { cx: '330', cy: '365', rx: '230', ry: '170', fill: 'url(#s7_halo)' }, act1G);

  const act1Header0 = bottles.createSvgScrimLabel('5 Gold Coins · Real = 0g · Counterfeit = 1g · Exact Summing Scale', {
    x: 640,
    y: 66,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#7A4F09',
    stroke: P.brass,
    padX: 16,
    padY: 6,
  });
  const act1Header1 = bottles.createSvgScrimLabel('Lindström D₂ Matrix · 4 Overlapping Weighings Solve All 5 Coins', {
    x: 640,
    y: 66,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.delft,
    stroke: P.delft,
    padX: 16,
    padY: 6,
  });
  gsap.set(act1Header1, { autoAlpha: 0 });
  act1G.appendChild(act1Header0);
  act1G.appendChild(act1Header1);

  // Precision Center-Pivoted Antique Brass Scale (MANDATORY ctx.bottles.createSvgBrassScale!)
  const SCALE_X = 330;
  const SCALE_Y = 392;
  const scaleG = bottles.createSvgBrassScale({
    x: SCALE_X,
    y: SCALE_Y,
    maxVal: 5,
    initialVal: 0,
    radius: 74,
    unit: 'g',
  });
  act1G.appendChild(scaleG);

  // Wooden coin tray above the scale (y = 172)
  svgEl('rect', { x: '110', y: '170', width: '440', height: '14', rx: '4', fill: 'url(#s7_tray)', stroke: P.ink, 'stroke-width': '1.6' }, act1G);
  svgEl('text', { x: '330', y: '112', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '11', 'font-weight': '700', 'letter-spacing': '0.1em', textContent: 'FIVE UNKNOWN COINS (0g OR 1g)' }, act1G);

  const COIN_HOME_X = [162, 246, 330, 414, 498];
  const COIN_HOME_Y = 146;
  const coinMovers = [];
  const coinSecretTags = [];

  for (let i = 0; i < 5; i++) {
    // Secret preview tag below tray slot (briefly revealed in b1)
    const stag = bottles.createSvgScrimLabel(`${SECRET[i]}g`, {
      x: COIN_HOME_X[i],
      y: 204,
      fontSize: 11.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: SECRET[i] === 1 ? P.cinnabar : P.sage,
      stroke: SECRET[i] === 1 ? P.cinnabar : P.sage,
      padX: 7,
      padY: 2.5,
    });
    gsap.set(stag, { autoAlpha: 0 });
    act1G.appendChild(stag);
    coinSecretTags.push(stag);

    const mover = svgEl('g', {}, act1G);
    mover.appendChild(createCoin(i, 22));
    gsap.set(mover, { x: COIN_HOME_X[i], y: COIN_HOME_Y });
    coinMovers.push(mover);
  }

  // Active subset whisper below scale base (y = 524)
  const subsetPills = WEIGHINGS.map((w) => {
    const p = bottles.createSvgScrimLabel(`Weighing ${w.id}: ${w.subset}  →  ${w.result}g`, {
      x: SCALE_X,
      y: 526,
      fontSize: 13,
      fontFamily: 'mono',
      fontWeight: 700,
      color: w.color,
      stroke: w.color,
      fill: '#FFFBF2',
      padX: 14,
      padY: 5,
    });
    gsap.set(p, { autoAlpha: 0 });
    act1G.appendChild(p);
    return p;
  });

  // RIGHT PANEL A (b0): Coin Rules Legend (x = 610..1210, y = 132..486)
  const legendG = svgEl('g', {}, act1G);
  svgEl(
    'rect',
    {
      x: '616',
      y: '132',
      width: '588',
      height: '356',
      rx: '16',
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.25)',
      'stroke-width': '1.5',
    },
    legendG,
  );
  svgEl(
    'text',
    {
      x: '648',
      y: '170',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.1em',
      textContent: 'THE COIN-WEIGHING MODEL',
    },
    legendG,
  );

  // Real 0g coin row
  const realRow = svgEl('g', { transform: 'translate(682, 232)' }, legendG);
  realRow.appendChild(createCoin('R', 22, 'url(#s7_coin_pewter)'));
  svgEl('text', { x: '44', y: '-6', fill: P.ink, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '21', 'font-weight': '700', textContent: 'Real Coin  =  0g' }, realRow);
  svgEl('text', { x: '44', y: '16', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '13.5', textContent: 'Contributes zero weight to any subset on the pan.' }, realRow);

  // Counterfeit 1g coin row
  const fakeRow = svgEl('g', { transform: 'translate(682, 314)' }, legendG);
  fakeRow.appendChild(createCoin('C', 22, 'url(#s7_coin_gold)'));
  svgEl('text', { x: '44', y: '-6', fill: P.cinnabar, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '21', 'font-weight': '700', textContent: 'Counterfeit Coin  =  1g' }, fakeRow);
  svgEl('text', { x: '44', y: '16', fill: P.sepia, 'font-family': "'Plus Jakarta Sans', sans-serif", 'font-size': '13.5', textContent: 'Adds exactly +1g whenever included in the weighing.' }, fakeRow);

  // Exact Sum note
  svgEl('rect', { x: '648', y: '378', width: '524', height: '78', rx: '12', fill: '#FDF2D6', stroke: P.brass, 'stroke-width': '1.4' }, legendG);
  svgEl('text', { x: '910', y: '408', 'text-anchor': 'middle', fill: '#7A4F09', 'font-family': "'Fraunces', Georgia, serif", 'font-size': '18', 'font-weight': '700', textContent: 'Scale Reading = Exact Sum of Selected Coins' }, legendG);
  svgEl('text', { x: '910', y: '434', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12.5', 'font-weight': '600', textContent: 'One coin at a time → 5 weighings · Overlapping subsets → 4!' }, legendG);

  // RIGHT PANEL B (b1 .. b2): 4x5 Lindström D2 Matrix & Vintage Tally Tickets (x = 602..1224, y = 114..526)
  const matrixG = svgEl('g', {}, act1G);
  gsap.set(matrixG, { autoAlpha: 0 });

  svgEl(
    'rect',
    {
      x: '602',
      y: '116',
      width: '622',
      height: '410',
      rx: '16',
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.25)',
      'stroke-width': '1.5',
    },
    matrixG,
  );
  svgEl(
    'text',
    {
      x: '628',
      y: '148',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.1em',
      textContent: 'LINDSTRÖM D₂ WEIGHING MATRIX  (4 ROWS × 5 COINS)',
    },
    matrixG,
  );

  // Column headers c0..c4 + Result column
  const COL_X = [748, 818, 888, 958, 1028];
  for (let c = 0; c < 5; c++) {
    svgEl(
      'text',
      {
        x: String(COL_X[c]),
        y: '186',
        'text-anchor': 'middle',
        fill: P.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '13.5',
        'font-weight': '700',
        textContent: `c${c}`,
      },
      matrixG,
    );
  }
  svgEl(
    'text',
    {
      x: '1144',
      y: '186',
      'text-anchor': 'middle',
      fill: P.brass,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '12.5',
      'font-weight': '700',
      textContent: 'TALLY',
    },
    matrixG,
  );
  svgEl('line', { x1: '626', y1: '202', x2: '1200', y2: '202', stroke: 'rgba(107, 94, 84, 0.2)', 'stroke-width': '1.2' }, matrixG);

  const rowHighlights = [];
  const tallyTickets = [];
  const ROW_Y = [244, 318, 392, 466];

  WEIGHINGS.forEach((w, r) => {
    const ry = ROW_Y[r];
    // Active row highlight backdrop
    const hl = svgEl(
      'rect',
      {
        x: '622',
        y: String(ry - 28),
        width: '582',
        height: '56',
        rx: '10',
        fill: w.color,
        opacity: '0',
      },
      matrixG,
    );
    rowHighlights.push(hl);

    // Row label W_r + subset
    svgEl(
      'text',
      {
        x: '640',
        y: String(ry - 5),
        'dominant-baseline': 'central',
        fill: w.color,
        'font-family': "'Fraunces', Georgia, serif",
        'font-size': '20',
        'font-weight': '700',
        textContent: w.id,
      },
      matrixG,
    );
    svgEl(
      'text',
      {
        x: '640',
        y: String(ry + 14),
        'dominant-baseline': 'central',
        fill: P.muted,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '10',
        'font-weight': '600',
        textContent: w.subset.replace(/\s+/g, ''),
      },
      matrixG,
    );

    // 0/1 matrix cells
    for (let c = 0; c < 5; c++) {
      const bit = w.mask[c];
      svgEl(
        'rect',
        {
          x: String(COL_X[c] - 22),
          y: String(ry - 18),
          width: '44',
          height: '36',
          rx: '7',
          fill: bit ? '#FDF1D0' : '#F3EDE1',
          stroke: bit ? w.color : 'rgba(107, 94, 84, 0.22)',
          'stroke-width': bit ? '1.8' : '1',
        },
        matrixG,
      );
      svgEl(
        'text',
        {
          x: String(COL_X[c]),
          y: String(ry + 1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: bit ? P.ink : P.muted,
          'font-family': "'JetBrains Mono', monospace",
          'font-size': '16',
          'font-weight': bit ? '800' : '500',
          textContent: String(bit),
        },
        matrixG,
      );
    }

    // Vintage parchment tally ticket on right edge
    const tickG = svgEl('g', { transform: `translate(1144, ${ry})` }, matrixG);
    const tickInner = svgEl('g', {}, tickG);
    svgEl(
      'rect',
      {
        x: '-42',
        y: '-20',
        width: '84',
        height: '40',
        rx: '9',
        fill: '#FFFDF7',
        stroke: w.color,
        'stroke-width': '2',
      },
      tickInner,
    );
    svgEl(
      'text',
      {
        x: '0',
        y: '1',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: w.color,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '18',
        'font-weight': '800',
        textContent: `${w.result}g`,
      },
      tickInner,
    );
    gsap.set(tickInner, { autoAlpha: 0, scale: 0.72, transformOrigin: '0px 0px' });
    tallyTickets.push(tickInner);
  });

  // =========================================================================
  // ACT 2: CRYSTAL-CLEAR STEP-BY-STEP ALGEBRA & PARITY REVEAL (b3 .. b5)
  // =========================================================================
  const act2G = svgEl('g', { class: 's7-act2' }, svg);
  gsap.set(act2G, { autoAlpha: 0 });

  const act2Pills = [
    'Step 1 · Combine Weighings: W₃ + W₄ − W₁ + W₂',
    'Step 2 · Parity (mod 2) Isolates Coin c₄ = 0',
    'Step 3 · Divide by 2 & Back-Substitute All 5 Coins!',
  ].map((txt, idx) => {
    const p = bottles.createSvgScrimLabel(txt, {
      x: 640,
      y: 62,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: idx === 0 ? P.terracotta : idx === 1 ? P.sage : P.brass,
      stroke: idx === 0 ? P.terracotta : idx === 1 ? P.sage : P.brass,
      padX: 16,
      padY: 5.5,
    });
    gsap.set(p, { autoAlpha: idx === 0 ? 1 : 0 });
    act2G.appendChild(p);
    return p;
  });

  // Top Recorded Tally Bar (y = 92..136) — 4 crisp pill summaries side-by-side
  const topEqs = [
    { txt: 'W₁ = c₀+c₁+c₂+c₃+c₄ = 3', color: P.brass, x: 222 },
    { txt: 'W₂ = c₀+c₂ = 2', color: P.delft, x: 515 },
    { txt: 'W₃ = c₀+c₁+c₄ = 1', color: P.terracotta, x: 775 },
    { txt: 'W₄ = c₀+c₃+c₄ = 2', color: P.sage, x: 1055 },
  ];
  topEqs.forEach((eq) => {
    act2G.appendChild(
      bottles.createSvgScrimLabel(eq.txt, {
        x: eq.x,
        y: 112,
        fontSize: 13,
        fontFamily: 'mono',
        fontWeight: 700,
        color: eq.color,
        stroke: eq.color,
        fill: '#FFFBF2',
        padX: 13,
        padY: 5.5,
      }),
    );
  });

  // Main Algebra Cancellation Parchment Desk (x = 76..1204, y = 148..326)
  svgEl(
    'rect',
    {
      x: '76',
      y: '148',
      width: '1128',
      height: '176',
      rx: '16',
      fill: P.parchment,
      stroke: 'rgba(200, 138, 30, 0.42)',
      'stroke-width': '1.6',
    },
    act2G,
  );

  // Line 1: W₃ + W₄ − W₁ + W₂ =
  svgEl(
    'text',
    {
      x: '640',
      y: '178',
      'text-anchor': 'middle',
      fill: P.ink,
      'font-family': "'Fraunces', Georgia, serif",
      'font-size': '21',
      'font-weight': '700',
      textContent: 'W₃  +  W₄  −  W₁  +  W₂',
    },
    act2G,
  );

  // Line 2: Explicit term-by-term expansion with exact coordinates for crisp cancellation slashes!
  // ( +c0 +c1 +c4 )   +   ( +c0 +c3 +c4 )   −   ( c0 +c1 +c2 +c3 +c4 )   +   ( +c0 +c2 )
  // Expanding signs cleanly:
  // [W3: +c0, +c1, +c4]  [W4: +c0, +c3, +c4]  [-W1: -c0, -c1, -c2, -c3, -c4]  [+W2: +c0, +c2]
  const termSpecs = [
    // W3 group
    { txt: 'c₀', x: 148, group: 'W₃', cancel: null, color: P.brass },
    { txt: '+ c₁', x: 204, group: 'W₃', cancel: 'c1', color: P.terracotta },
    { txt: '+ c₄', x: 266, group: 'W₃', cancel: null, color: P.sage },
    // W4 group
    { txt: '+ c₀', x: 356, group: 'W₄', cancel: null, color: P.brass },
    { txt: '+ c₃', x: 418, group: 'W₄', cancel: 'c3', color: P.delft },
    { txt: '+ c₄', x: 480, group: 'W₄', cancel: 'c4', color: P.plum },
    // -W1 group
    { txt: '− c₀', x: 576, group: '−W₁', cancel: 'c0', color: P.sepia },
    { txt: '− c₁', x: 642, group: '−W₁', cancel: 'c1', color: P.terracotta },
    { txt: '− c₂', x: 708, group: '−W₁', cancel: 'c2', color: P.sage },
    { txt: '− c₃', x: 774, group: '−W₁', cancel: 'c3', color: P.delft },
    { txt: '− c₄', x: 840, group: '−W₁', cancel: 'c4', color: P.plum },
    // +W2 group
    { txt: '+ c₀', x: 938, group: '+W₂', cancel: 'c0', color: P.sepia },
    { txt: '+ c₂', x: 1004, group: '+W₂', cancel: 'c2', color: P.sage },
  ];

  // Subtle group underline brackets so viewers see where every term came from
  const groupBrackets = [
    { x1: 126, x2: 292, lbl: 'W₃', color: P.terracotta },
    { x1: 332, x2: 506, lbl: 'W₄', color: P.sage },
    { x1: 548, x2: 868, lbl: '− W₁', color: P.brass },
    { x1: 912, x2: 1032, lbl: '+ W₂', color: P.delft },
  ];
  groupBrackets.forEach((gb) => {
    svgEl(
      'path',
      {
        d: `M ${gb.x1} 240 L ${gb.x1} 248 L ${gb.x2} 248 L ${gb.x2} 240`,
        fill: 'none',
        stroke: gb.color,
        'stroke-width': '1.4',
        opacity: '0.65',
      },
      act2G,
    );
    svgEl(
      'text',
      {
        x: String((gb.x1 + gb.x2) / 2),
        y: '262',
        'text-anchor': 'middle',
        fill: gb.color,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '11',
        'font-weight': '700',
        textContent: gb.lbl,
      },
      act2G,
    );
  });

  const slashesByGroup = { c1: [], c2: [], c3: [], c4: [], c0: [] };
  const termNodesByGroup = { c1: [], c2: [], c3: [], c4: [], c0: [] };
  const survivorBoxes = [];

  termSpecs.forEach((ts) => {
    const ty = 222;
    const tg = svgEl('g', {}, act2G);
    if (!ts.cancel) {
      // Survivor highlight box (fades in after cancellations!)
      const sbox = svgEl(
        'rect',
        {
          x: String(ts.x - 24),
          y: String(ty - 16),
          width: '48',
          height: '32',
          rx: '8',
          fill: ts.txt.includes('c₄') ? '#EAF6F0' : '#FDF0CC',
          stroke: ts.txt.includes('c₄') ? P.sage : P.brass,
          'stroke-width': '2',
          opacity: '0',
        },
        tg,
      );
      survivorBoxes.push(sbox);
    }

    const txtNode = svgEl(
      'text',
      {
        x: String(ts.x),
        y: String(ty + 1),
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: P.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '17.5',
        'font-weight': '700',
        textContent: ts.txt,
      },
      tg,
    );

    if (ts.cancel) {
      const slash = svgEl(
        'line',
        {
          x1: String(ts.x - 20),
          y1: String(ty + 11),
          x2: String(ts.x + 20),
          y2: String(ty - 11),
          stroke: ts.color,
          'stroke-width': '2.6',
          'stroke-linecap': 'round',
        },
        tg,
      );
      gsap.set(slash, { autoAlpha: 0 });
      slashesByGroup[ts.cancel].push(slash);
      termNodesByGroup[ts.cancel].push(txtNode);
    }
  });

  // Surviving result box on right end of Line 2: "= 2c₀ + c₄"
  const resultSumG = svgEl('g', { transform: 'translate(1118, 222)' }, act2G);
  svgEl(
    'rect',
    {
      x: '-66',
      y: '-24',
      width: '132',
      height: '48',
      rx: '11',
      fill: '#FDF0CC',
      stroke: P.brass,
      'stroke-width': '2.2',
    },
    resultSumG,
  );
  svgEl(
    'text',
    {
      x: '0',
      y: '1',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: '#7A4F09',
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '18',
      'font-weight': '800',
      textContent: '= 2c₀ + c₄',
    },
    resultSumG,
  );
  gsap.set(resultSumG, { autoAlpha: 0, scale: 0.84, transformOrigin: '0px 0px' });

  // Bottom summary line inside Algebra Desk (y = 298)
  const cancelCaption = bottles.createSvgScrimLabel('Coins c₁, c₂, c₃ cancel completely → leaving strictly  2·c₀ + c₄', {
    x: 640,
    y: 298,
    fontSize: 13.5,
    fontFamily: 'body',
    fontWeight: 700,
    color: '#7A4F09',
    stroke: P.brass,
    fill: '#FFFDF7',
    padX: 16,
    padY: 5,
  });
  gsap.set(cancelCaption, { autoAlpha: 0 });
  act2G.appendChild(cancelCaption);

  // MIDDLE BAND A (b4): Parity (mod 2) Isolation Panel (y = 344..456)
  const parityG = svgEl('g', {}, act2G);
  gsap.set(parityG, { autoAlpha: 0 });

  // Left card: Numeric sum
  svgEl('rect', { x: '96', y: '348', width: '382', height: '104', rx: '14', fill: P.parchment, stroke: P.brass, 'stroke-width': '1.8' }, parityG);
  svgEl('text', { x: '287', y: '376', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '11', 'font-weight': '700', 'letter-spacing': '0.08em', textContent: 'EVALUATE MEASURED SUM' }, parityG);
  svgEl('text', { x: '287', y: '416', 'text-anchor': 'middle', fill: P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': '20', 'font-weight': '800', textContent: '2c₀ + c₄ = 1 + 2 − 3 + 2 = 2' }, parityG);

  // Center arrow + mod 2 badge
  svgEl('line', { x1: '490', y1: '400', x2: '604', y2: '400', stroke: P.brass, 'stroke-width': '2.6', 'marker-end': 'url(#s7_arr)' }, parityG);
  parityG.appendChild(
    bottles.createSvgScrimLabel('mod 2', {
      x: 547,
      y: 374,
      fontSize: 13,
      fontFamily: 'mono',
      fontWeight: 800,
      color: '#7A4F09',
      fill: '#FDF0CC',
      stroke: P.brass,
      padX: 11,
      padY: 4,
    }),
  );

  // Right card: Evenness -> c4 = 0
  svgEl('rect', { x: '616', y: '348', width: '568', height: '104', rx: '14', fill: '#EEF8F2', stroke: P.sage, 'stroke-width': '2' }, parityG);
  svgEl('text', { x: '900', y: '376', 'text-anchor': 'middle', fill: P.sage, 'font-family': "'JetBrains Mono', monospace", 'font-size': '11.5', 'font-weight': '700', 'letter-spacing': '0.08em', textContent: '2·c₀ IS ALWAYS EVEN (≡ 0 MOD 2)' }, parityG);
  svgEl('text', { x: '900', y: '416', 'text-anchor': 'middle', fill: '#2B5B45', 'font-family': "'Fraunces', Georgia, serif", 'font-size': '25', 'font-weight': '700', textContent: 'Parity Immediately Reveals:  c₄ = 0g (Real!)' }, parityG);

  // MIDDLE BAND B (b5): 4-Step Back-Substitution Cascade (y = 344..456, replaces parityG cleanly!)
  const cascadeG = svgEl('g', {}, act2G);
  gsap.set(cascadeG, { autoAlpha: 0 });

  const cascadeSteps = [
    { title: 'Divide by 2', eq: '2c₀ = 2 − 0', out: 'c₀ = 1', color: P.brass, x: 222 },
    { title: 'From W₂ = 2', eq: 'c₂ = 2 − 1', out: 'c₂ = 1', color: P.delft, x: 500 },
    { title: 'From W₃ = 1', eq: 'c₁ = 1 − 1 − 0', out: 'c₁ = 0', color: P.terracotta, x: 778 },
    { title: 'From W₄ = 2', eq: 'c₃ = 2 − 1 − 0', out: 'c₃ = 1', color: P.sage, x: 1056 },
  ];
  const cascadeCards = cascadeSteps.map((st) => {
    const g = svgEl('g', { transform: `translate(${st.x}, 400)` }, cascadeG);
    const inner = svgEl('g', {}, g);
    svgEl('rect', { x: '-124', y: '-52', width: '248', height: '104', rx: '13', fill: P.parchment, stroke: st.color, 'stroke-width': '1.9' }, inner);
    svgEl('text', { x: '0', y: '-30', 'text-anchor': 'middle', fill: st.color, 'font-family': "'JetBrains Mono', monospace", 'font-size': '11', 'font-weight': '700', textContent: st.title }, inner);
    svgEl('text', { x: '0', y: '-2', 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '14.5', 'font-weight': '600', textContent: st.eq }, inner);
    svgEl('text', { x: '0', y: '29', 'text-anchor': 'middle', fill: P.ink, 'font-family': "'Fraunces', Georgia, serif", 'font-size': '22', 'font-weight': '700', textContent: st.out }, inner);
    gsap.set(inner, { autoAlpha: 0, y: 16 });
    return inner;
  });

  // BOTTOM RESULT TRAY (b4 .. b5, y = 478..552): 5 Coin Slots revealing (1, 0, 1, 1, 0)
  const solvedTrayG = svgEl('g', {}, act2G);
  svgEl('rect', { x: '190', y: '476', width: '900', height: '74', rx: '14', fill: '#FBF8F1', stroke: 'rgba(107, 94, 84, 0.25)', 'stroke-width': '1.3' }, solvedTrayG);
  svgEl('text', { x: '222', y: '514', 'dominant-baseline': 'central', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12', 'font-weight': '700', textContent: 'RECOVERED:' }, solvedTrayG);

  const solvedBadges = [];
  for (let i = 0; i < 5; i++) {
    const sx = 392 + i * 144;
    // Unknown '?' slot
    const unk = svgEl('g', { transform: `translate(${sx}, 513)` }, solvedTrayG);
    svgEl('rect', { x: '-56', y: '-22', width: '112', height: '44', rx: '22', fill: '#EDE4D3', stroke: 'rgba(107, 94, 84, 0.35)', 'stroke-width': '1.4' }, unk);
    svgEl('text', { x: '0', y: '1', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: P.muted, 'font-family': "'JetBrains Mono', monospace", 'font-size': '15', 'font-weight': '700', textContent: `c${i} = ?` }, unk);

    // Revealed slot
    const rev = svgEl('g', { transform: `translate(${sx}, 513)` }, solvedTrayG);
    const isFake = SECRET[i] === 1;
    svgEl('rect', { x: '-56', y: '-22', width: '112', height: '44', rx: '22', fill: isFake ? '#FDF0CC' : '#EAF6F0', stroke: isFake ? P.brass : P.sage, 'stroke-width': '2' }, rev);
    svgEl(
      'text',
      {
        x: '0',
        y: '1',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: isFake ? '#7A4F09' : '#2B5B45',
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '15.5',
        'font-weight': '800',
        textContent: `c${i} = ${SECRET[i]}g`,
      },
      rev,
    );
    gsap.set(rev, { autoAlpha: 0, scale: 0.8, transformOrigin: '0px 0px' });
    solvedBadges.push({ unk, rev });
  }

  // =========================================================================
  // ACT 3: LINDSTRÖM RECURSIVE MATRIX SCALING & O(m / log m) BRIDGE (b6 .. b7)
  // =========================================================================
  const act3G = svgEl('g', { class: 's7-act3' }, svg);
  gsap.set(act3G, { autoAlpha: 0 });

  act3G.appendChild(
    bottles.createSvgScrimLabel("Lindström's Recursive Construction · 128 Weighings → 449 Coins", {
      x: 640,
      y: 66,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#7A4F09',
      fill: '#FDF0CC',
      stroke: P.brass,
      padX: 16,
      padY: 6,
    }),
  );

  // LEFT: Recursive Block Matrix Doubling Visual (x = 84..592, y = 116..428)
  svgEl(
    'rect',
    {
      x: '84',
      y: '116',
      width: '508',
      height: '312',
      rx: '16',
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.25)',
      'stroke-width': '1.5',
    },
    act3G,
  );
  svgEl(
    'text',
    {
      x: '338',
      y: '148',
      'text-anchor': 'middle',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.08em',
      textContent: 'RECURSIVE BLOCK MATRIX  Dₖ₊₁',
    },
    act3G,
  );

  // Clean 2x3 visual block matrix: [ Dₖ | Dₖ | 0 ] over [ Dₖ | 1 − Dₖ | e ]
  const bx0 = 136;
  const by0 = 174;
  // Bracket left & right
  svgEl('path', { d: `M ${bx0 - 8} ${by0 - 6} L ${bx0 - 20} ${by0 - 6} L ${bx0 - 20} ${by0 + 178} L ${bx0 - 8} ${by0 + 178}`, fill: 'none', stroke: P.ink, 'stroke-width': '2.4' }, act3G);
  svgEl('path', { d: `M ${bx0 + 412} ${by0 - 6} L ${bx0 + 424} ${by0 - 6} L ${bx0 + 424} ${by0 + 178} L ${bx0 + 412} ${by0 + 178}`, fill: 'none', stroke: P.ink, 'stroke-width': '2.4' }, act3G);

  const blocks = [
    { x: bx0, y: by0, w: 156, h: 78, lbl: 'Dₖ', fill: '#FDF0CC', stroke: P.brass, color: '#7A4F09' },
    { x: bx0 + 166, y: by0, w: 156, h: 78, lbl: 'Dₖ', fill: '#FDF0CC', stroke: P.brass, color: '#7A4F09' },
    { x: bx0 + 332, y: by0, w: 72, h: 78, lbl: '0', fill: '#F3EDE1', stroke: P.muted, color: P.muted },
    { x: bx0, y: by0 + 90, w: 156, h: 78, lbl: 'Dₖ', fill: '#FDF0CC', stroke: P.brass, color: '#7A4F09' },
    { x: bx0 + 166, y: by0 + 90, w: 156, h: 78, lbl: '1 − Dₖ', fill: '#EBF4FA', stroke: P.delft, color: P.delft },
    { x: bx0 + 332, y: by0 + 90, w: 72, h: 78, lbl: 'I / e', fill: '#FCECE8', stroke: P.terracotta, color: P.terracotta },
  ];
  blocks.forEach((bl) => {
    svgEl('rect', { x: String(bl.x), y: String(bl.y), width: String(bl.w), height: String(bl.h), rx: '9', fill: bl.fill, stroke: bl.stroke, 'stroke-width': '1.8' }, act3G);
    svgEl(
      'text',
      {
        x: String(bl.x + bl.w / 2),
        y: String(bl.y + bl.h / 2 + 1),
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: bl.color,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '19',
        'font-weight': '800',
        textContent: bl.lbl,
      },
      act3G,
    );
  });
  svgEl(
    'text',
    {
      x: '338',
      y: '396',
      'text-anchor': 'middle',
      fill: P.sepia,
      'font-family': "'Plus Jakarta Sans', sans-serif",
      'font-size': '13.5',
      'font-weight': '600',
      textContent: 'Doubles rows (2×) while more than doubling coins (> 2×) via mod-2 peeling!',
    },
    act3G,
  );

  // RIGHT: Scaling Ladder from D_2 (5 in 4) to D_7 (449 in 128) (x = 626..1204, y = 116..428)
  svgEl(
    'rect',
    {
      x: '626',
      y: '116',
      width: '578',
      height: '312',
      rx: '16',
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.25)',
      'stroke-width': '1.5',
    },
    act3G,
  );
  svgEl(
    'text',
    {
      x: '654',
      y: '148',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.08em',
      textContent: 'COMPRESSION SCALING LADDER (WEIGHINGS → COINS)',
    },
    act3G,
  );

  const ladder = [
    { name: 'D₂', w: 4, c: 5, ratio: '1.25×', bar: 44, hl: false },
    { name: 'D₃', w: 8, c: 12, ratio: '1.50×', bar: 70, hl: false },
    { name: 'D₄', w: 16, c: 29, ratio: '1.81×', bar: 100, hl: false },
    { name: 'D₅', w: 32, c: 72, ratio: '2.25×', bar: 140, hl: false },
    { name: 'D₆', w: 64, c: 179, ratio: '2.80×', bar: 188, hl: false },
    { name: 'D₇', w: 128, c: 449, ratio: '3.51×', bar: 248, hl: true },
  ];
  const ladderRows = ladder.map((ld, idx) => {
    const ly = 186 + idx * 40;
    const rg = svgEl('g', {}, act3G);
    if (ld.hl) {
      svgEl('rect', { x: '642', y: String(ly - 17), width: '546', height: '34', rx: '8', fill: '#FDF0CC', stroke: P.brass, 'stroke-width': '1.6' }, rg);
    }
    svgEl('text', { x: '656', y: String(ly + 1), 'dominant-baseline': 'central', fill: ld.hl ? '#7A4F09' : P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': '13.5', 'font-weight': '800', textContent: ld.name }, rg);
    svgEl('text', { x: '702', y: String(ly + 1), 'dominant-baseline': 'central', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '12.5', 'font-weight': '600', textContent: `${ld.w} weighings →` }, rg);
    svgEl('rect', { x: '834', y: String(ly - 10), width: String(ld.bar), height: '20', rx: '6', fill: ld.hl ? P.brass : P.delft, opacity: ld.hl ? '0.92' : '0.68' }, rg);
    svgEl('text', { x: String(844 + ld.bar), y: String(ly + 1), 'dominant-baseline': 'central', fill: ld.hl ? '#7A4F09' : P.ink, 'font-family': "'JetBrains Mono', monospace", 'font-size': '13', 'font-weight': '800', textContent: `${ld.c} coins` }, rg);
    gsap.set(rg, { autoAlpha: 0, x: -12 });
    return rg;
  });

  // LOWER BRIDGE BANNER (b7, y = 448..552): O(m / log m) Compression + Coins -> Bottles Bridge!
  const bridgeBanner = document.createElement('div');
  bridgeBanner.className = 'label-scrim label-scrim-card';
  bridgeBanner.style.cssText =
    'position:absolute;left:84px;top:450px;width:1120px;height:100px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:14px 28px;border:1.8px solid rgba(78,140,111,0.55);background:rgba(243,250,246,0.97);opacity:0;';

  const brLeft = document.createElement('div');
  brLeft.style.cssText = 'display:flex;align-items:center;gap:18px;';
  const brTag = document.createElement('div');
  brTag.style.cssText =
    "font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:700;letter-spacing:0.08em;color:#4E8C6F;padding:6px 12px;border-radius:999px;background:#E2F4EA;border:1px solid #4E8C6F;";
  brTag.textContent = 'ASYMPTOTIC COMPRESSION';
  const brMath = createMathEl('m \\text{ binary tests} \\;\\longrightarrow\\; O\\!\\left(\\frac{m}{\\log m}\\right) \\text{ weighings}', {
    fontSize: 22,
    color: '#1F1A17',
  });
  brLeft.appendChild(brTag);
  brLeft.appendChild(brMath);

  const brRight = document.createElement('div');
  brRight.style.cssText =
    "font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:17px;font-weight:600;color:#7A4F09;text-align:right;white-space:nowrap;";
  brRight.textContent = 'Next: Turn Physical Bottles into a Scale →';

  bridgeBanner.appendChild(brLeft);
  bridgeBanner.appendChild(brRight);
  htmlLayer.appendChild(bridgeBanner);

  // =========================================================================
  // MASTER BIDIRECTIONAL GSAP TIMELINE
  // =========================================================================
  const tl = gsap.timeline({ paused: true });

  // --- b0 (0.80s): Brass scale + 5 coins + Coin Legend ---
  tl.fromTo(act1G, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 0);

  // --- b1 (13.37s): Switch Legend -> 4x5 Lindström Matrix + brief secret preview [1,0,1,1,0] ---
  tl.to(act1Header0, { autoAlpha: 0, duration: 0.25 }, b1.start);
  tl.to(act1Header1, { autoAlpha: 1, duration: 0.3 }, b1.start + 0.2);
  tl.to(legendG, { autoAlpha: 0, duration: 0.4 }, b1.start + 0.3);
  tl.to(matrixG, { autoAlpha: 1, duration: 0.55 }, b1.start + 0.75);
  // Brief secret weight peek [1g, 0g, 1g, 1g, 0g] during second half of b1, then hide before weighings
  tl.to(coinSecretTags, { autoAlpha: 1, duration: 0.35, stagger: 0.1 }, b1.start + 6.4);
  tl.to(coinSecretTags, { autoAlpha: 0, duration: 0.35 }, b1.end - 0.7);

  // --- b2 (25.88s, 19.58s): 4 Live Subset Weighings onto Hanging Pan + Center-Pivoted Needle! ---
  const wStarts = [b2.start + 0.6, b2.start + 5.5, b2.start + 10.2, b2.start + 14.8];
  const wDurs = [4.5, 4.3, 4.2, 4.4];

  WEIGHINGS.forEach((w, wi) => {
    const wt = wStarts[wi];
    const wd = wDurs[wi];
    const activeIds = [];
    w.mask.forEach((bit, ci) => {
      if (bit) activeIds.push(ci);
    });

    // Highlight matrix row & subset pill
    tl.to(rowHighlights[wi], { opacity: 0.12, duration: 0.3 }, wt);
    tl.to(subsetPills[wi], { autoAlpha: 1, duration: 0.3 }, wt);

    // Compute exact seated pan positions (panSurfaceY + depression - coinRadius)
    const count = activeIds.length;
    const spacing = count >= 5 ? 30 : 38;
    const seatedY = SCALE_Y + scaleG.panSurfaceY + w.result * 3 - 18;

    activeIds.forEach((ci, k) => {
      const targetX = SCALE_X + (k - (count - 1) / 2) * spacing;
      tl.to(
        coinMovers[ci],
        {
          x: targetX,
          y: seatedY,
          duration: 0.65,
          ease: 'power2.inOut',
          immediateRender: false,
        },
        wt + 0.15 + k * 0.06,
      );
    });

    // Animate CENTER-PIVOTED brass scale needle & pan depression strictly via setScaleValue!
    bottles.setScaleValue(scaleG, w.result, tl, wt + 0.72, 0.75);

    // Stamp tally ticket on the right!
    tl.to(tallyTickets[wi], { autoAlpha: 1, scale: 1, duration: 0.42, ease: 'back.out(1.6)' }, wt + 1.45);

    // Return coins to rack & reset scale to 0g before next weighing (keep last weighing seated until Act 2!)
    if (wi < WEIGHINGS.length - 1) {
      const retT = wt + wd - 0.95;
      activeIds.forEach((ci) => {
        tl.to(
          coinMovers[ci],
          {
            x: COIN_HOME_X[ci],
            y: COIN_HOME_Y,
            duration: 0.55,
            ease: 'power2.inOut',
            immediateRender: false,
          },
          retT,
        );
      });
      bottles.setScaleValue(scaleG, 0, tl, retT + 0.05, 0.55);
      tl.to(rowHighlights[wi], { opacity: 0, duration: 0.3 }, retT);
      tl.to(subsetPills[wi], { autoAlpha: 0, duration: 0.25 }, retT);
    }
  });

  // --- ACT 1 -> ACT 2 CROSS-FADE (Algebra Cancellation & Parity Reveal) ---
  tl.to(act1G, { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, b3.start - 0.5);
  tl.to(act2G, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b3.start);

  // --- b3 (46.01s): Explicit Term-by-Term Cancellations leaving 2c0 + c4 ---
  const cancelSeq = ['c1', 'c2', 'c3', 'c4', 'c0'];
  cancelSeq.forEach((key, idx) => {
    const ct = b3.start + 3.2 + idx * 1.1;
    tl.to(slashesByGroup[key], { autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, ct);
    tl.to(termNodesByGroup[key], { opacity: 0.38, duration: 0.35 }, ct + 0.15);
  });
  tl.to(survivorBoxes, { opacity: 1, duration: 0.5 }, b3.start + 9.2);
  tl.to(resultSumG, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(1.6)' }, b3.start + 9.6);
  tl.to(cancelCaption, { autoAlpha: 1, duration: 0.45 }, b3.start + 10.4);

  // --- b4 (60.72s): 1 + 2 - 3 + 2 = 2 -> Parity mod 2 -> c4 = 0 ---
  tl.to(act2Pills[0], { autoAlpha: 0, duration: 0.25 }, b4.start);
  tl.to(act2Pills[1], { autoAlpha: 1, duration: 0.3 }, b4.start + 0.2);
  tl.to(parityG, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, b4.start + 0.5);
  // Flip c4 = 0g in the bottom solved tray!
  tl.to(solvedBadges[4].unk, { autoAlpha: 0, duration: 0.25 }, b4.start + 7.2);
  tl.to(solvedBadges[4].rev, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }, b4.start + 7.4);

  // --- b5 (73.97s): Divide by 2 -> c0 = 1, then back-substitute c2, c1, c3 -> (1, 0, 1, 1, 0) ---
  tl.to(act2Pills[1], { autoAlpha: 0, duration: 0.25 }, b5.start);
  tl.to(act2Pills[2], { autoAlpha: 1, duration: 0.3 }, b5.start + 0.2);
  tl.to(parityG, { autoAlpha: 0, duration: 0.4 }, b5.start + 0.1);
  tl.to(cascadeG, { autoAlpha: 1, duration: 0.35 }, b5.start + 0.5);

  const recoverOrder = [
    { cardIdx: 0, coinIdx: 0, dt: 0.8 },
    { cardIdx: 1, coinIdx: 2, dt: 4.1 },
    { cardIdx: 2, coinIdx: 1, dt: 6.4 },
    { cardIdx: 3, coinIdx: 3, dt: 8.6 },
  ];
  recoverOrder.forEach(({ cardIdx, coinIdx, dt }) => {
    tl.to(cascadeCards[cardIdx], { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.3)' }, b5.start + dt);
    tl.to(solvedBadges[coinIdx].unk, { autoAlpha: 0, duration: 0.2 }, b5.start + dt + 0.35);
    tl.to(solvedBadges[coinIdx].rev, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }, b5.start + dt + 0.5);
  });

  // --- ACT 2 -> ACT 3 CROSS-FADE (Lindström Recursive Scaling & O(m / log m) Bridge) ---
  tl.to(act2G, { autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, b6.start - 0.5);
  tl.to(act3G, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, b6.start);

  // --- b6 (87.12s): Scaling Ladder climbs D2 -> D7 (449 coins in 128 weighings) ---
  ladderRows.forEach((row, idx) => {
    tl.to(row, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, b6.start + 2.4 + idx * 1.35);
  });

  // --- b7 (101.71s): O(m / log m) Compression & Bridge to Bottles ---
  tl.to(bridgeBanner, { autoAlpha: 1, duration: 0.65, ease: 'back.out(1.25)' }, b7.start + 0.8);

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
