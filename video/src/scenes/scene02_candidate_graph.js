// Chapter 02: Part I Roadmap & The Candidate Graph

export const sceneMeta = {
  id: 'scene2',
  number: 2,
  title: 'Part I Roadmap & The Candidate Graph',
  chapter: 'Part I · Setup',
  duration: 79.65,
  beats: [
    {
      id: 's2_b0',
      start: 0.8,
      audioDuration: 8.088,
      text: 'Part I has two goals: prove the exact minimum swaps Game 1 requires, then build an algorithm that hits that limit.',
      highlight: ['two goals', 'exact minimum swaps', 'hits that limit'],
      cue: null,
    },
    {
      id: 's2_b1',
      start: 9.438,
      audioDuration: 10.848,
      text: 'Specifically, no deterministic strategy can beat 1/4 n² swaps, and no randomized strategy can beat 1/8 n² in expectation.',
      highlight: ['1/4 n²', '1/8 n²'],
      cue: 'bell',
    },
    {
      id: 's2_b2',
      start: 20.836,
      audioDuration: 11.016,
      text: 'Our proof uses two building blocks. First, map every possible bottle-to-slot assignment onto an n×n candidate grid, or bipartite graph.',
      highlight: ['two building blocks', 'n×n candidate grid', 'bipartite graph'],
      cue: 'whoosh',
    },
    {
      id: 's2_b3',
      start: 32.402,
      audioDuration: 8.424,
      text: 'Out of n² pairs, exactly n are true matches, and the remaining n(n−1) are wrong pairs.',
      highlight: ['n are true matches', 'n(n−1) are wrong pairs'],
      cue: null,
    },
    {
      id: 's2_b4',
      start: 41.376,
      audioDuration: 8.664,
      text: 'Physically placing a bottle on a slot tests that pair. Your starting row tests n pairs, and each swap moves two bottles.',
      highlight: ['Physically placing', 'tests n pairs', 'moves two bottles'],
      cue: 'clink',
    },
    {
      id: 's2_b5',
      start: 50.59,
      audioDuration: 11.28,
      text: 'So T swaps physically test at most n + 2T pairs. Yet winning places every bottle on its true coaster—covering all n matches.',
      highlight: ['at most n + 2T pairs', 'covering all n matches'],
      cue: null,
    },
    {
      id: 's2_b6',
      start: 62.42,
      audioDuration: 7.944,
      text: 'Add every wrong pair you physically tested, cancel n from both sides, and swaps are at least half the tested wrong pairs.',
      highlight: ['cancel n', 'at least half the tested wrong pairs'],
      cue: 'lock',
    },
    {
      id: 's2_b7',
      start: 70.914,
      audioDuration: 7.536,
      text: 'That reduces our lower bound to one sharp question: how many wrong pairs must you physically test to win?',
      highlight: ['one sharp question', 'how many wrong pairs'],
      cue: null,
    },
  ],
};

function beatSpan(ctx, idx, fbStart, fbDur) {
  const b = ctx.beats?.[idx];
  const start = b ? Number(b.start ?? b.time ?? fbStart) : fbStart;
  const dur = b
    ? Math.max(0.6, Number(b.audioDuration) || Number(b.end) - start || fbDur)
    : fbDur;
  const end = b && b.end ? Number(b.end) : start + dur;
  return { start, dur, end };
}

export function buildScene(rootEl, ctx) {
  const { gsap, colors, bottles, createSvg, svgEl, renderMath } = ctx;
  const W = 1280;
  const H = 590;
  // Secret permutation consistent with Ch 1: SECRET[slot] = bottle
  const SECRET = [2, 0, 5, 3, 1, 4];

  rootEl.innerHTML = '';

  const container = document.createElement('div');
  container.style.cssText =
    'position:relative;width:1280px;height:720px;overflow:hidden;background:transparent;';
  rootEl.appendChild(container);

  // =========================================================================
  // ACT 1 (Beats 0–1): PART I ROADMAP & TARGET LOWER BOUNDS
  // =========================================================================
  const actRoadmap = document.createElement('div');
  actRoadmap.style.cssText =
    'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;';
  container.appendChild(actRoadmap);

  const rmHeader = document.createElement('div');
  rmHeader.style.cssText =
    'position:absolute;left:0;right:0;top:64px;text-align:center;' +
    "font-family:'Fraunces',Georgia,serif;font-size:30px;font-weight:600;color:#1F1A17;";
  rmHeader.textContent = 'Part I Roadmap  ·  Game 1 (Single-Pair Swap)';
  actRoadmap.appendChild(rmHeader);

  // Goal 1 sheet (left)
  const goal1 = document.createElement('div');
  goal1.style.cssText =
    'position:absolute;left:112px;top:132px;width:476px;height:386px;' +
    'background:rgba(255,251,242,0.92);border:1px solid rgba(107,94,84,0.22);' +
    'border-top:4px solid #D95D48;border-radius:16px;padding:24px 28px;' +
    'box-shadow:0 12px 30px rgba(68,50,32,0.08);display:flex;flex-direction:column;';
  goal1.innerHTML =
    `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#D95D48;text-transform:uppercase;">Goal 01 · Lower Bounds</div>` +
    `<div style="font-family:'Fraunces',Georgia,serif;font-size:25px;font-weight:600;color:#1F1A17;margin-top:6px;">Exact Minimum Swaps</div>` +
    `<div style="font-size:14.5px;color:#6B5E54;margin-top:6px;line-height:1.4;">Prove no algorithm can solve all hidden coasters faster than:</div>`;

  const boundDet = document.createElement('div');
  boundDet.style.cssText =
    'margin-top:22px;padding:14px 18px;border-radius:12px;background:#FFF5F2;' +
    'border:1.5px solid rgba(217,93,72,0.42);display:flex;align-items:center;justify-content:space-between;';
  boundDet.innerHTML =
    `<div><div style="font-size:12px;font-family:'JetBrains Mono',monospace;font-weight:700;color:#A93825;text-transform:uppercase;">Deterministic</div>` +
    `<div style="font-size:12.5px;color:#6B5E54;margin-top:2px;">Worst-case guarantee</div></div>` +
    `<div style="font-size:24px;font-weight:700;color:#A93825;">${renderMath('\\ge \\tfrac{1}{4} n^2')}</div>`;
  gsap.set(boundDet, { autoAlpha: 0, y: 12 });
  goal1.appendChild(boundDet);

  const boundRand = document.createElement('div');
  boundRand.style.cssText =
    'margin-top:14px;padding:14px 18px;border-radius:12px;background:#F1F8FC;' +
    'border:1.5px solid rgba(61,126,166,0.42);display:flex;align-items:center;justify-content:space-between;';
  boundRand.innerHTML =
    `<div><div style="font-size:12px;font-family:'JetBrains Mono',monospace;font-weight:700;color:#2B6185;text-transform:uppercase;">Randomized</div>` +
    `<div style="font-size:12.5px;color:#6B5E54;margin-top:2px;">Expected swaps</div></div>` +
    `<div style="font-size:24px;font-weight:700;color:#2B6185;">${renderMath('\\ge \\tfrac{1}{8} n^2')}</div>`;
  gsap.set(boundRand, { autoAlpha: 0, y: 12 });
  goal1.appendChild(boundRand);

  actRoadmap.appendChild(goal1);

  // Connecting brass arrow between Goal 1 and Goal 2
  const rmArrowSvg = createSvg(120, 80, {
    style: 'position:absolute;left:580px;top:284px;width:120px;height:80px;',
  });
  svgEl(
    'line',
    { x1: '18', y1: '40', x2: '94', y2: '40', stroke: colors.brass, 'stroke-width': '2.8', 'stroke-linecap': 'round' },
    rmArrowSvg,
  );
  svgEl(
    'polyline',
    {
      points: '82,29 96,40 82,51',
      fill: 'none',
      stroke: colors.brass,
      'stroke-width': '2.8',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    rmArrowSvg,
  );
  actRoadmap.appendChild(rmArrowSvg);

  // Goal 2 sheet (right)
  const goal2 = document.createElement('div');
  goal2.style.cssText =
    'position:absolute;left:692px;top:132px;width:476px;height:386px;' +
    'background:rgba(255,251,242,0.92);border:1px solid rgba(107,94,84,0.22);' +
    'border-top:4px solid #4E8C6F;border-radius:16px;padding:24px 28px;' +
    'box-shadow:0 12px 30px rgba(68,50,32,0.08);display:flex;flex-direction:column;';
  goal2.innerHTML =
    `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#387257;text-transform:uppercase;">Goal 02 · Optimal Algorithm</div>` +
    `<div style="font-family:'Fraunces',Georgia,serif;font-size:25px;font-weight:600;color:#1F1A17;margin-top:6px;">Hit Both Exact Limits</div>` +
    `<div style="font-size:14.5px;color:#6B5E54;margin-top:6px;line-height:1.4;">Design a zero-repeat folding schedule that achieves the exact constants:</div>`;

  const algoCard = document.createElement('div');
  algoCard.style.cssText =
    'margin-top:26px;padding:18px 20px;border-radius:12px;background:#F4FBF7;' +
    'border:1.5px solid rgba(78,140,111,0.38);display:flex;flex-direction:column;gap:12px;';
  algoCard.innerHTML =
    `<div style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:#1F1A17;">` +
    `<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#4E8C6F;color:#FFFBF2;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;">1</span>` +
    `<span>Every swap tests <strong>2 brand-new pairs</strong></span></div>` +
    `<div style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:#1F1A17;">` +
    `<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#C88A1E;color:#FFFBF2;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;">2</span>` +
    `<span>Shrinking folds lock matches at ${renderMath('\\tfrac{1}{4}n^2')} & ${renderMath('\\tfrac{1}{8}n^2')}</span></div>` +
    `<div style="display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:#1F1A17;">` +
    `<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#3D7EA6;color:#FFFBF2;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;">3</span>` +
    `<span>Eliminates FUN 2026's ${renderMath('\\log n')} overhead</span></div>`;
  gsap.set(algoCard, { autoAlpha: 0, y: 12 });
  goal2.appendChild(algoCard);

  actRoadmap.appendChild(goal2);

  // =========================================================================
  // ACT 2 (Beats 2–6): CANDIDATE GRID (LEFT) + BIPARTITE -> ALGEBRA (RIGHT)
  // =========================================================================
  const actGridWrap = document.createElement('div');
  actGridWrap.style.cssText =
    'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;opacity:0;visibility:hidden;';
  container.appendChild(actGridWrap);

  const svgGrid = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;',
  });
  actGridWrap.appendChild(svgGrid);

  // Top centered scrim header
  svgGrid.appendChild(
    bottles.createSvgScrimLabel('Building Block 1  ·  The n × n Candidate Grid', {
      x: 640,
      y: 68,
      fontSize: 14,
      fontWeight: 700,
      color: colors.ink,
      padX: 18,
      padY: 6,
    }),
  );

  // --- LEFT SIDE: 6x6 Candidate Grid ---
  const N = 6;
  const cellSz = 56;
  const gridX = 148;
  const gridY = 160;
  const gridW = N * cellSz; // 336

  // Axis titles strictly outside header labels
  svgEl(
    'text',
    {
      x: String(gridX + gridW / 2),
      y: '116',
      'text-anchor': 'middle',
      fill: colors.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.08em',
      textContent: 'SLOTS (HIDDEN COASTERS)',
    },
    svgGrid,
  );
  svgEl(
    'text',
    {
      x: '76',
      y: String(gridY + gridW / 2),
      'text-anchor': 'middle',
      fill: colors.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.08em',
      transform: `rotate(-90, 76, ${gridY + gridW / 2})`,
      textContent: 'BOTTLES (0–5)',
    },
    svgGrid,
  );

  // Column headers (Slots 0..5) & Row headers (Bottles 0..5)
  for (let i = 0; i < N; i++) {
    const cx = gridX + i * cellSz + cellSz / 2;
    const cy = gridY + i * cellSz + cellSz / 2;

    svgEl(
      'rect',
      {
        x: String(cx - 19),
        y: '128',
        width: '38',
        height: '22',
        rx: '11',
        fill: '#FBF8F1',
        stroke: 'rgba(107,94,84,0.28)',
        'stroke-width': '1.2',
      },
      svgGrid,
    );
    svgEl(
      'text',
      {
        x: String(cx),
        y: '139.5',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: colors.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '11.5',
        'font-weight': '700',
        textContent: `S${i}`,
      },
      svgGrid,
    );

    svgEl(
      'circle',
      {
        cx: '120',
        cy: String(cy),
        r: '14',
        fill: colors.bottles[i],
        stroke: colors.ink,
        'stroke-width': '1.4',
      },
      svgGrid,
    );
    svgEl(
      'text',
      {
        x: '120',
        y: String(cy + 0.5),
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: '#FFFBF2',
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '12.5',
        'font-weight': '700',
        textContent: String(i),
      },
      svgGrid,
    );
  }

  // 6x6 cells (row r = Bottle r, col c = Slot c)
  const cells = [];
  const trueCells = [];
  const wrongCells = [];
  const diagCells = [];

  for (let r = 0; r < N; r++) {
    cells[r] = [];
    for (let c = 0; c < N; c++) {
      const x = gridX + c * cellSz;
      const y = gridY + r * cellSz;
      const isTrue = SECRET[c] === r;

      const cellG = svgEl('g', { transform: `translate(${x}, ${y})` }, svgGrid);
      const rect = svgEl(
        'rect',
        {
          x: '2',
          y: '2',
          width: String(cellSz - 4),
          height: String(cellSz - 4),
          rx: '7',
          fill: '#FBF8F1',
          stroke: 'rgba(107, 94, 84, 0.22)',
          'stroke-width': '1.2',
        },
        cellG,
      );

      // Golden true-match fill overlay
      const trueOverlay = svgEl(
        'rect',
        {
          x: '2',
          y: '2',
          width: String(cellSz - 4),
          height: String(cellSz - 4),
          rx: '7',
          fill: '#F6D98E',
          stroke: colors.brass,
          'stroke-width': '2.2',
          opacity: '0',
        },
        cellG,
      );
      const trueStar = svgEl(
        'text',
        {
          x: String(cellSz / 2),
          y: String(cellSz / 2 + 1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: '#7A4F09',
          'font-family': "'JetBrains Mono', monospace",
          'font-size': '16',
          'font-weight': '700',
          opacity: '0',
          textContent: '★',
        },
        cellG,
      );

      // Soft wrong-pair tint overlay
      const wrongOverlay = svgEl(
        'rect',
        {
          x: '2',
          y: '2',
          width: String(cellSz - 4),
          height: String(cellSz - 4),
          rx: '7',
          fill: 'rgba(217, 93, 72, 0.11)',
          stroke: 'rgba(217, 93, 72, 0.26)',
          'stroke-width': '1.2',
          opacity: '0',
        },
        cellG,
      );

      // Tested ring (diagonal starting pairs or swap pairs)
      const testedRing = svgEl(
        'rect',
        {
          x: '5',
          y: '5',
          width: String(cellSz - 10),
          height: String(cellSz - 10),
          rx: '5',
          fill: 'rgba(61, 126, 166, 0.16)',
          stroke: colors.delft,
          'stroke-width': '2.4',
          opacity: '0',
        },
        cellG,
      );
      const testedDot = svgEl(
        'circle',
        {
          cx: String(cellSz - 12),
          cy: '12',
          r: '4',
          fill: colors.delft,
          opacity: '0',
        },
        cellG,
      );

      const cellObj = { r, c, isTrue, rect, trueOverlay, trueStar, wrongOverlay, testedRing, testedDot };
      cells[r][c] = cellObj;
      if (isTrue) trueCells.push(cellObj);
      else wrongCells.push(cellObj);
      if (r === c) diagCells.push(cellObj);
    }
  }

  // Crisp legend strip below 6x6 grid (y = 530)
  const gridLegendTrue = bottles.createSvgScrimLabel('★ n = 6 True Matches   ·   n(n−1) = 30 Wrong Pairs', {
    x: gridX + gridW / 2,
    y: 534,
    fontSize: 12.5,
    fontFamily: 'mono',
    fontWeight: 600,
    color: colors.ink,
    padX: 14,
    padY: 5,
  });
  gsap.set(gridLegendTrue, { autoAlpha: 0 });
  svgGrid.appendChild(gridLegendTrue);

  // --- RIGHT SIDE PART A (Beats 2–4): BIPARTITE GRAPH ---
  const bipGroup = svgEl('g', {}, svgGrid);

  svgEl(
    'text',
    {
      x: '890',
      y: '116',
      'text-anchor': 'middle',
      fill: colors.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.08em',
      textContent: 'EQUIVALENT BIPARTITE GRAPH',
    },
    bipGroup,
  );

  const bipX = [665, 755, 845, 935, 1025, 1115];
  const topY = 236;
  const botY = 432;

  // All 36 gossamer edges K_{6,6}
  const bipEdgesAll = [];
  const bipEdgesTrue = [];
  for (let b = 0; b < N; b++) {
    for (let s = 0; s < N; s++) {
      const isTrue = SECRET[s] === b;
      const line = svgEl(
        'line',
        {
          x1: String(bipX[b]),
          y1: String(topY + 4),
          x2: String(bipX[s]),
          y2: String(botY - 12),
          stroke: isTrue ? colors.brass : 'rgba(107, 94, 84, 0.22)',
          'stroke-width': isTrue ? '1.3' : '1',
          opacity: '0.28',
        },
        bipGroup,
      );
      bipEdgesAll.push(line);
      if (isTrue) bipEdgesTrue.push(line);
    }
  }

  // Highlighted swap test edges (Bottle 1 -> Slot 4 and Bottle 4 -> Slot 1)
  const swapEdgeA = svgEl(
    'line',
    {
      x1: String(bipX[1]),
      y1: String(topY + 4),
      x2: String(bipX[4]),
      y2: String(botY - 12),
      stroke: colors.terracotta,
      'stroke-width': '3.2',
      opacity: '0',
    },
    bipGroup,
  );
  const swapEdgeB = svgEl(
    'line',
    {
      x1: String(bipX[4]),
      y1: String(topY + 4),
      x2: String(bipX[1]),
      y2: String(botY - 12),
      stroke: colors.terracotta,
      'stroke-width': '3.2',
      opacity: '0',
    },
    bipGroup,
  );

  // 6 mini SVG coasters along bottom of bipartite graph
  const bipCoasters = [];
  for (let s = 0; s < N; s++) {
    const c = bottles.createSvgCoaster(SECRET[s], {
      x: bipX[s],
      y: botY,
      scale: 0.72,
      hidden: true,
      slotIndex: s,
      showLabel: true,
    });
    bipGroup.appendChild(c);
    bipCoasters.push(c);
  }

  // 6 mini SVG bottles along top of bipartite graph
  const bipBottles = [];
  for (let b = 0; b < N; b++) {
    const wrap = svgEl('g', { transform: `translate(${bipX[b]}, ${topY})` }, bipGroup);
    const inner = svgEl('g', {}, wrap);
    inner.appendChild(bottles.createSvgBottle(b, { scale: 0.68, showShadow: false }));
    bipBottles.push({ wrap, inner });
  }

  const bipFooter = bottles.createSvgScrimLabel('Every edge (Bottle b, Slot s) = one cell in the grid', {
    x: 890,
    y: 534,
    fontSize: 12.5,
    fontWeight: 600,
    color: colors.sepia,
    padX: 15,
    padY: 5,
  });
  bipGroup.appendChild(bipFooter);

  const swapCallout = bottles.createSvgScrimLabel('Swap (1 ↔ 4)  →  +2 Fresh Cells Tested', {
    x: 890,
    y: 332,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#A93825',
    fill: '#FFF5F2',
    stroke: colors.terracotta,
    strokeWidth: 1.6,
    padX: 14,
    padY: 6,
  });
  gsap.set(swapCallout, { autoAlpha: 0 });
  bipGroup.appendChild(swapCallout);

  // --- RIGHT SIDE PART B (Beats 5–6): ALGEBRAIC BALANCE & CANCELLATION ---
  const algPanel = document.createElement('div');
  algPanel.style.cssText =
    'position:absolute;left:566px;top:118px;width:646px;height:420px;pointer-events:none;' +
    'opacity:0;visibility:hidden;display:flex;flex-direction:column;gap:16px;';
  actGridWrap.appendChild(algPanel);

  function makeEqCard(eyebrow, accent, mathHtml, subText) {
    const card = document.createElement('div');
    card.style.cssText =
      'background:rgba(255,251,242,0.94);border:1px solid rgba(107,94,84,0.22);' +
      `border-left:4px solid ${accent};border-radius:12px;padding:14px 20px;` +
      'box-shadow:0 6px 20px rgba(68,50,32,0.06);';
    card.innerHTML =
      `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">` +
      `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.08em;color:${accent};text-transform:uppercase;">${eyebrow}</span>` +
      `<span style="font-size:12.5px;color:#6B5E54;">${subText}</span></div>` +
      `<div style="margin-top:8px;font-size:21px;color:#1F1A17;">${mathHtml}</div>`;
    return card;
  }

  const eqUpper = makeEqCard(
    'Budget · Physical Tests',
    colors.delft,
    renderMath('\\text{Tested Pairs} \\;\\le\\; n + 2T'),
    'n start + 2 per swap',
  );
  gsap.set(eqUpper, { autoAlpha: 0, x: 16 });
  algPanel.appendChild(eqUpper);

  const eqLower = makeEqCard(
    'Winning Requirement',
    colors.brass,
    renderMath('\\text{Tested Pairs} \\;=\\; n_{\\text{true}} + |\\text{Tested Wrong}|'),
    'All n true matches + wrong pairs tested',
  );
  gsap.set(eqLower, { autoAlpha: 0, x: 16 });
  algPanel.appendChild(eqLower);

  // Combined inequality with animated n-cancellation slashes!
  const eqCancel = document.createElement('div');
  eqCancel.style.cssText =
    'position:relative;background:rgba(255,251,242,0.96);border:1.5px solid rgba(107,94,84,0.26);' +
    'border-radius:12px;padding:16px 22px;display:flex;align-items:center;justify-content:center;gap:10px;' +
    'font-size:22px;color:#1F1A17;';
  eqCancel.innerHTML =
    `<span class="cancel-n-wrap" style="position:relative;display:inline-block;padding:0 4px;">${renderMath('n')}<span class="cancel-slash" style="position:absolute;left:-2px;right:-2px;top:50%;height:2.8px;background:#C44536;transform:rotate(-24deg) scaleX(0);transform-origin:left center;border-radius:2px;"></span></span>` +
    `<span>${renderMath('+ \\;|\\text{Tested Wrong}| \\;\\le\\;')}</span>` +
    `<span class="cancel-n-wrap" style="position:relative;display:inline-block;padding:0 4px;">${renderMath('n')}<span class="cancel-slash" style="position:absolute;left:-2px;right:-2px;top:50%;height:2.8px;background:#C44536;transform:rotate(-24deg) scaleX(0);transform-origin:left center;border-radius:2px;"></span></span>` +
    `<span>${renderMath('+ \\;2T')}</span>`;
  gsap.set(eqCancel, { autoAlpha: 0, y: 10 });
  algPanel.appendChild(eqCancel);

  const cancelSlashes = eqCancel.querySelectorAll('.cancel-slash');

  // Locked Theorem Pill (Building Block 1 Result)
  const eqResult = document.createElement('div');
  eqResult.style.cssText =
    'background:linear-gradient(180deg, #FFFDF7 0%, #FDF3D7 100%);' +
    'border:2px solid #C88A1E;border-radius:14px;padding:16px 24px;' +
    'box-shadow:0 10px 26px rgba(200,138,30,0.16);' +
    'display:flex;align-items:center;justify-content:space-between;';
  eqResult.innerHTML =
    `<div><div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.1em;color:#8D5B0C;text-transform:uppercase;">Building Block 1 Locked</div>` +
    `<div style="font-size:13.5px;color:#6B5E54;margin-top:3px;">Swaps ≥ half the wrong pairs tested</div></div>` +
    `<div style="font-size:26px;font-weight:700;color:#1F1A17;">${renderMath('T \\;\\ge\\; \\dfrac{|\\text{Tested Wrong}|}{2}')}</div>`;
  gsap.set(eqResult, { autoAlpha: 0, scale: 0.92 });
  algPanel.appendChild(eqResult);

  // =========================================================================
  // ACT 3 (Beat 7): ONE SHARP QUESTION — BRIDGE TO CHAPTER 3
  // =========================================================================
  const actBridge = document.createElement('div');
  actBridge.style.cssText =
    'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;' +
    'opacity:0;visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;';
  container.appendChild(actBridge);

  const bridgeCard = document.createElement('div');
  bridgeCard.style.cssText =
    'width:780px;padding:42px 54px;border-radius:20px;text-align:center;' +
    'background:rgba(255,251,242,0.95);border:1.5px solid rgba(200,138,30,0.45);' +
    'box-shadow:0 18px 46px rgba(68,50,32,0.11);';
  bridgeCard.innerHTML =
    `<div style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;letter-spacing:0.16em;color:#C88A1E;text-transform:uppercase;margin-bottom:14px;">One Sharp Question</div>` +
    `<div style="font-size:44px;color:#1F1A17;margin:10px 0 18px;">${renderMath('|\\text{Tested Wrong}| \\;\\ge\\; \\text{?}')}</div>` +
    `<div style="font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:21px;color:#6B5E54;line-height:1.4;">How many wrong pairs must you physically test before you can guarantee a win?</div>`;
  actBridge.appendChild(bridgeCard);

  const bridgePill = document.createElement('div');
  bridgePill.className = 'label-scrim';
  bridgePill.style.cssText =
    "font-family:'JetBrains Mono',monospace;font-size:12.5px;font-weight:600;color:#8D5B0C;padding:7px 20px;";
  bridgePill.textContent = "Next: Chapter 03 · The Adversary's Escape Hatch →";
  actBridge.appendChild(bridgePill);

  // =========================================================================
  // TIMELINE CHOREOGRAPHY
  // =========================================================================
  const b0 = beatSpan(ctx, 0, 0.8, 8.088);
  const b1 = beatSpan(ctx, 1, 9.438, 10.848);
  const b2 = beatSpan(ctx, 2, 20.836, 11.016);
  const b3 = beatSpan(ctx, 3, 32.402, 8.424);
  const b4 = beatSpan(ctx, 4, 41.376, 8.664);
  const b5 = beatSpan(ctx, 5, 50.59, 11.28);
  const b6 = beatSpan(ctx, 6, 62.42, 7.944);
  const b7 = beatSpan(ctx, 7, 70.914, 7.536);

  const tl = gsap.timeline({ paused: true });

  // Beat 0: Roadmap enters cleanly
  tl.from(rmHeader, { y: -14, opacity: 0, duration: 0.55, ease: 'power2.out' }, b0.start);
  tl.from(goal1, { y: 20, opacity: 0, duration: 0.65, ease: 'power3.out' }, b0.start + 0.45);
  tl.from(rmArrowSvg, { scale: 0.7, opacity: 0, duration: 0.45 }, b0.start + 1.8);
  tl.from(goal2, { y: 20, opacity: 0, duration: 0.65, ease: 'power3.out' }, b0.start + 2.2);

  // Beat 1: Stamp exact target bounds 1/4 n^2 and 1/8 n^2
  tl.to(boundDet, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'back.out(1.4)' }, b1.start + 0.8);
  tl.to(boundRand, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'back.out(1.4)' }, b1.start + 4.4);
  tl.to(algoCard, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, b1.start + 6.2);

  // Beat 2: Cross-fade to Candidate Grid + Bipartite Graph
  tl.to(actRoadmap, { autoAlpha: 0, duration: 0.42, ease: 'power2.in' }, b2.start);
  tl.to(actGridWrap, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, b2.start + 0.46);
  tl.from(bipGroup, { opacity: 0, x: 18, duration: 0.65, ease: 'power2.out' }, b2.start + 2.2);

  // Beat 3: Highlight n true matches (gold) vs n(n-1) wrong pairs (soft terracotta tint)
  for (let i = 0; i < trueCells.length; i++) {
    tl.to(
      [trueCells[i].trueOverlay, trueCells[i].trueStar],
      { opacity: 1, duration: 0.4 },
      b3.start + 0.7 + i * 0.14,
    );
  }
  tl.to(bipEdgesAll, { opacity: 0.1, duration: 0.45 }, b3.start + 0.7);
  tl.to(
    bipEdgesTrue,
    { opacity: 0.92, attr: { 'stroke-width': 2.6 }, duration: 0.5 },
    b3.start + 0.85,
  );
  for (let s = 0; s < N; s++) {
    bottles.setCoasterRevealed(bipCoasters[s], true, tl, b3.start + 0.9 + s * 0.08, 0.4);
  }
  tl.to(
    wrongCells.map((c) => c.wrongOverlay),
    { opacity: 1, duration: 0.55 },
    b3.start + 3.4,
  );
  tl.to(gridLegendTrue, { autoAlpha: 1, duration: 0.45 }, b3.start + 3.6);

  // Beat 4: Veil coasters back, test diagonal n pairs, then swap Bottle 1 <-> Bottle 4 (+2 cells)
  for (let s = 0; s < N; s++) {
    bottles.setCoasterRevealed(bipCoasters[s], false, tl, b4.start + 0.2 + s * 0.05, 0.35);
  }
  tl.to(bipEdgesTrue, { opacity: 0.24, attr: { 'stroke-width': 1.3 }, duration: 0.35 }, b4.start + 0.2);

  // Diagonal starting pairs light up
  for (let i = 0; i < diagCells.length; i++) {
    tl.to(
      [diagCells[i].testedRing, diagCells[i].testedDot],
      { opacity: 1, duration: 0.32 },
      b4.start + 1.5 + i * 0.14,
    );
  }

  // Swap Bottle 1 and Bottle 4 on the bipartite shelf
  const swap4T = b4.start + 4.4;
  const dx14 = bipX[4] - bipX[1];
  tl.to(bipBottles[1].inner, { x: dx14, duration: 1.0, ease: 'power2.inOut' }, swap4T);
  tl.to(bipBottles[1].inner, { y: -26, duration: 0.5, ease: 'power2.out' }, swap4T);
  tl.to(bipBottles[1].inner, { y: 0, duration: 0.5, ease: 'power2.in' }, swap4T + 0.5);

  tl.to(bipBottles[4].inner, { x: -dx14, duration: 1.0, ease: 'power2.inOut' }, swap4T);
  tl.to(bipBottles[4].inner, { y: -16, duration: 0.5, ease: 'power2.out' }, swap4T);
  tl.to(bipBottles[4].inner, { y: 0, duration: 0.5, ease: 'power2.in' }, swap4T + 0.5);

  tl.to([swapEdgeA, swapEdgeB], { opacity: 0.9, duration: 0.45 }, swap4T + 0.6);
  tl.to(swapCallout, { autoAlpha: 1, duration: 0.4 }, swap4T + 0.65);

  // Highlight the 2 newly tested cells (1, 4) and (4, 1) in terracotta
  const newCellA = cells[1][4];
  const newCellB = cells[4][1];
  tl.set([newCellA.testedRing, newCellB.testedRing], {
    attr: { stroke: colors.terracotta, fill: 'rgba(217, 93, 72, 0.22)' },
  }, swap4T + 0.5);
  tl.set([newCellA.testedDot, newCellB.testedDot], { attr: { fill: colors.terracotta } }, swap4T + 0.5);
  tl.to(
    [newCellA.testedRing, newCellA.testedDot, newCellB.testedRing, newCellB.testedDot],
    { opacity: 1, duration: 0.45 },
    swap4T + 0.7,
  );

  // Beat 5: Cross-fade right side from Bipartite Graph -> Algebraic Balance
  tl.to(bipGroup, { autoAlpha: 0, duration: 0.4 }, b5.start);
  tl.to(algPanel, { autoAlpha: 1, duration: 0.4 }, b5.start + 0.42);
  tl.to(eqUpper, { autoAlpha: 1, x: 0, duration: 0.55, ease: 'power2.out' }, b5.start + 0.55);
  tl.to(eqLower, { autoAlpha: 1, x: 0, duration: 0.55, ease: 'power2.out' }, b5.start + 4.8);

  // Pulse golden true matches on the left grid when mentioning "covering all n matches"
  tl.to(
    trueCells.map((c) => c.trueOverlay),
    { attr: { 'stroke-width': 3.4 }, duration: 0.45, yoyo: true, repeat: 1 },
    b5.start + 5.2,
  );

  // Beat 6: Combine, cancel n from both sides, lock T >= |Tested Wrong| / 2
  tl.to(eqCancel, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, b6.start + 0.4);
  tl.to(cancelSlashes, { scaleX: 1, duration: 0.45, stagger: 0.18, ease: 'power2.out' }, b6.start + 2.2);
  tl.to(
    eqResult,
    { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)' },
    b6.start + 4.1,
  );

  // Beat 7: Clean cross-fade to Bridge Question for Chapter 3
  tl.to(actGridWrap, { autoAlpha: 0, duration: 0.42, ease: 'power2.in' }, b7.start);
  tl.to(actBridge, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, b7.start + 0.45);
  tl.from(bridgeCard, { scale: 0.94, y: 14, opacity: 0, duration: 0.6, ease: 'power3.out' }, b7.start + 0.5);
  tl.from(bridgePill, { y: 10, opacity: 0, duration: 0.45 }, b7.start + 2.2);

  const totalDur = Math.max(ctx.duration || sceneMeta.duration, tl.duration() + 0.2);
  if (tl.duration() < totalDur) {
    tl.to({}, { duration: totalDur - tl.duration() }, tl.duration());
  }

  return { timeline: tl, destroy() {} };
}
