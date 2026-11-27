// Chapter 03: The Adversary's Escape Hatch

export const sceneMeta = {
  id: 'scene3',
  number: 3,
  title: "The Adversary's Escape Hatch",
  chapter: 'Part I · Lower Bounds',
  duration: 106.84,
  beats: [
    {
      id: 's3_b0',
      start: 0.8,
      audioDuration: 11.136,
      text: 'Even against a generous referee answering yes or no per pair, an adversary plays by one rule: answer no unless every remaining secret forces yes.',
      highlight: ['generous referee', 'answer no unless every remaining secret forces yes'],
      cue: 'whoosh',
    },
    {
      id: 's3_b1',
      start: 12.486,
      audioDuration: 11.16,
      text: 'Once you win, relabel each slot by its true bottle, so every untested wrong pair—Bottle u on Slot v—becomes a directed edge u → v.',
      highlight: ['relabel each slot', 'directed edge u → v'],
      cue: null,
    },
    {
      id: 's3_b2',
      start: 24.196,
      audioDuration: 10.416,
      text: 'On three slots with true coasters [0, 1, 2], suppose you never tested the cycle: Bottle 0 on 1, 1 on 2, and 2 on 0.',
      highlight: ['[0, 1, 2]', 'never tested the cycle'],
      cue: 'bell',
    },
    {
      id: 's3_b3',
      start: 35.162,
      audioDuration: 10.608,
      text: 'Because that cycle stayed open, the adversary never had to confirm [0, 1, 2]—switching coasters to [2, 0, 1] fits every answer.',
      highlight: ['switching coasters to [2, 0, 1]', 'fits every answer'],
      cue: 'clink',
    },
    {
      id: 's3_b4',
      start: 46.32,
      audioDuration: 11.088,
      text: 'So the untested wrong pairs cannot contain any directed cycle: they must form a DAG. Topological order allows at most one forward edge per pair.',
      highlight: ['must form a DAG', 'Topological order'],
      cue: 'lock',
    },
    {
      id: 's3_b5',
      start: 57.958,
      audioDuration: 11.544,
      text: 'That leaves at most n(n−1)/2 wrong pairs untested. Testing the other half and dividing by 2 forces 1/4 n² swaps.',
      highlight: ['n(n−1)/2 wrong pairs', '1/4 n² swaps'],
      cue: 'bell',
    },
    {
      id: 's3_b6',
      start: 70.052,
      audioDuration: 10.296,
      text: 'For a random secret, pair each secret with its twin swapping coasters i and j: their first tested difference is wrong in one of the two twins.',
      highlight: ['twin swapping coasters i and j', 'wrong in one of the two twins'],
      cue: 'whoosh',
    },
    {
      id: 's3_b7',
      start: 80.898,
      audioDuration: 13.512,
      text: "Summing half a wrong pair across all distinct coaster-pairs forces 1/8 n² expected swaps—which Yao's minimax locks in, since randomized algorithms mix deterministic ones.",
      highlight: ['1/8 n² expected swaps', "Yao's minimax"],
      cue: 'lock',
    },
    {
      id: 's3_b8',
      start: 94.96,
      audioDuration: 10.68,
      text: 'Yet the prior best algorithm, from a FUN 2026 paper, took 1/2 n² log n swaps. How do we cut every wasted repeat?',
      highlight: ['FUN 2026 paper', '1/2 n² log n swaps', 'cut every wasted repeat'],
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

function addArrowMarker(svgEl, defs, id, color) {
  const m = svgEl(
    'marker',
    {
      id,
      viewBox: '0 0 10 10',
      refX: '8.5',
      refY: '5',
      markerWidth: '6.5',
      markerHeight: '6.5',
      orient: 'auto-start-reverse',
    },
    defs,
  );
  svgEl('path', { d: 'M 0 1.4 L 9 5 L 0 8.6 z', fill: color }, m);
}

export function buildScene(rootEl, ctx) {
  const { gsap, colors, bottles, createSvg, svgEl, renderMath } = ctx;
  const W = 1280;
  const H = 590;

  rootEl.innerHTML = '';

  const container = document.createElement('div');
  container.style.cssText =
    'position:relative;width:1280px;height:720px;overflow:hidden;background:transparent;';
  rootEl.appendChild(container);

  // =========================================================================
  // ACT 1 (Beat 0): ADVERSARY'S ONE RULE OVER VEILED COASTERS
  // =========================================================================
  const act1 = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;',
  });
  container.appendChild(act1);

  // Rule plaque (top-center, y = 66..166)
  const rulePlaque = svgEl('g', {}, act1);
  svgEl(
    'rect',
    {
      x: '200',
      y: '66',
      width: '880',
      height: '98',
      rx: '16',
      fill: '#FFFBF2',
      'fill-opacity': '0.95',
      stroke: colors.brass,
      'stroke-width': '1.8',
    },
    rulePlaque,
  );
  svgEl(
    'text',
    {
      x: '640',
      y: '92',
      'text-anchor': 'middle',
      fill: '#8D5B0C',
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.12em',
      textContent: 'GENEROUS PER-PAIR REFEREE  ·  ADVERSARY RULE',
    },
    rulePlaque,
  );
  svgEl(
    'text',
    {
      x: '640',
      y: '132',
      'text-anchor': 'middle',
      fill: colors.ink,
      'font-family': "'Fraunces', Georgia, serif",
      'font-style': 'italic',
      'font-size': '24',
      'font-weight': '600',
      textContent: '“Answer NO unless every remaining secret forces YES.”',
    },
    rulePlaque,
  );

  // Wooden shelf + 4 bottles over 4 veiled '?' coasters
  svgEl(
    'rect',
    {
      x: '230',
      y: '412',
      width: '820',
      height: '14',
      rx: '6',
      fill: colors.wood,
      stroke: colors.ink,
      'stroke-width': '1.6',
    },
    act1,
  );

  const act1SlotX = [355, 545, 735, 925];
  const act1Coasters = [];
  for (let i = 0; i < 4; i++) {
    const cWrap = svgEl('g', { transform: `translate(${act1SlotX[i]}, 410)` }, act1);
    const cInner = svgEl('g', {}, cWrap);
    cInner.appendChild(
      bottles.createSvgCoaster((i + 1) % 4, {
        hidden: true,
        slotIndex: i,
        scale: 0.96,
      }),
    );
    act1Coasters.push(cInner);

    act1.appendChild(
      bottles.createSvgBottle(i, {
        x: act1SlotX[i],
        y: 408,
        scale: 0.96,
      }),
    );
  }

  // Animated query beam probing Bottle 1 on Slot 2 -> NO!
  const act1Beam = svgEl(
    'path',
    {
      d: `M ${act1SlotX[1]} 286 Q 640 218 ${act1SlotX[2]} 286`,
      fill: 'none',
      stroke: colors.cinnabar,
      'stroke-width': '2.6',
      'stroke-dasharray': '6 4',
    },
    act1,
  );
  gsap.set(act1Beam, { autoAlpha: 0 });

  const act1NoBadge = bottles.createSvgScrimLabel('Query (Bottle 1, Slot 2)?  →  NO', {
    x: 640,
    y: 222,
    fontSize: 14,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#A93825',
    fill: '#FFF4F2',
    stroke: colors.cinnabar,
    strokeWidth: 1.6,
    padX: 16,
    padY: 6,
  });
  gsap.set(act1NoBadge, { autoAlpha: 0 });
  act1.appendChild(act1NoBadge);

  const act1Footer = bottles.createSvgScrimLabel(
    'Multiple hidden permutations still fit  →  Adversary never commits early',
    {
      x: 640,
      y: 526,
      fontSize: 13.5,
      fontWeight: 600,
      color: colors.sepia,
      padX: 18,
      padY: 6,
    },
  );
  gsap.set(act1Footer, { autoAlpha: 0 });
  act1.appendChild(act1Footer);

  // =========================================================================
  // ACT 2 (Beat 1): RELABELING SLOTS -> DIRECTED GRAPH OF UNTESTED PAIRS
  // =========================================================================
  const act2 = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;',
  });
  gsap.set(act2, { autoAlpha: 0 });
  container.appendChild(act2);

  const act2Defs = svgEl('defs', {}, act2);
  addArrowMarker(svgEl, act2Defs, 'arr_terra_a2', colors.terracotta);
  addArrowMarker(svgEl, act2Defs, 'arr_brass_a2', colors.brass);

  act2.appendChild(
    bottles.createSvgScrimLabel('Relabel Each Slot by Its True Bottle  →  Directed Graph of Untested Wrong Pairs', {
      x: 640,
      y: 72,
      fontSize: 14,
      fontWeight: 700,
      color: colors.ink,
      padX: 18,
      padY: 6,
    }),
  );

  // Left: compact 4x4 relabeled matrix (x = 152..448, y = 164..460)
  const m2X = 158;
  const m2Y = 166;
  const m2C = 70;

  svgEl(
    'text',
    {
      x: String(m2X + 140),
      y: '126',
      'text-anchor': 'middle',
      fill: colors.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      textContent: 'TRUE-BOTTLE SLOTS v',
    },
    act2,
  );
  svgEl(
    'text',
    {
      x: '94',
      y: String(m2Y + 140),
      'text-anchor': 'middle',
      fill: colors.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      transform: `rotate(-90, 94, ${m2Y + 140})`,
      textContent: 'BOTTLES u',
    },
    act2,
  );

  const matHighlightCells = [];
  for (let i = 0; i < 4; i++) {
    svgEl(
      'text',
      {
        x: String(m2X + i * m2C + m2C / 2),
        y: '150',
        'text-anchor': 'middle',
        fill: colors.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '13',
        'font-weight': '700',
        textContent: String(i),
      },
      act2,
    );
    svgEl(
      'circle',
      {
        cx: '132',
        cy: String(m2Y + i * m2C + m2C / 2),
        r: '13',
        fill: colors.bottles[i],
        stroke: colors.ink,
        'stroke-width': '1.3',
      },
      act2,
    );
    svgEl(
      'text',
      {
        x: '132',
        y: String(m2Y + i * m2C + m2C / 2 + 0.5),
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: '#FFFBF2',
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '12',
        'font-weight': '700',
        textContent: String(i),
      },
      act2,
    );
  }

  const demoPairs = [
    [0, 1],
    [1, 2],
    [2, 3],
  ];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const isDiag = r === c;
      const isDemo = demoPairs.some(([u, v]) => u === r && v === c);
      const cx = m2X + c * m2C;
      const cy = m2Y + r * m2C;
      svgEl(
        'rect',
        {
          x: String(cx + 3),
          y: String(cy + 3),
          width: String(m2C - 6),
          height: String(m2C - 6),
          rx: '8',
          fill: isDiag ? '#F7DDA0' : '#FBF8F1',
          stroke: isDiag ? colors.brass : 'rgba(107,94,84,0.22)',
          'stroke-width': isDiag ? '2' : '1.2',
        },
        act2,
      );
      if (isDiag) {
        svgEl(
          'text',
          {
            x: String(cx + m2C / 2),
            y: String(cy + m2C / 2 + 1),
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
            fill: '#7A4F09',
            'font-family': "'JetBrains Mono', monospace",
            'font-size': '13',
            'font-weight': '700',
            textContent: '✓',
          },
          act2,
        );
      }
      if (isDemo) {
        const hi = svgEl(
          'g',
          { opacity: '0' },
          act2,
        );
        svgEl(
          'rect',
          {
            x: String(cx + 3),
            y: String(cy + 3),
            width: String(m2C - 6),
            height: String(m2C - 6),
            rx: '8',
            fill: 'rgba(217, 93, 72, 0.2)',
            stroke: colors.terracotta,
            'stroke-width': '2.2',
          },
          hi,
        );
        svgEl(
          'text',
          {
            x: String(cx + m2C / 2),
            y: String(cy + m2C / 2 + 1),
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
            fill: '#A93825',
            'font-family': "'JetBrains Mono', monospace",
            'font-size': '12',
            'font-weight': '700',
            textContent: `${r}→${c}`,
          },
          hi,
        );
        matHighlightCells.push(hi);
      }
    }
  }

  // Center morph arrow
  svgEl(
    'line',
    {
      x1: '506',
      y1: '306',
      x2: '634',
      y2: '306',
      stroke: colors.brass,
      'stroke-width': '2.8',
      'marker-end': 'url(#arr_brass_a2)',
    },
    act2,
  );
  act2.appendChild(
    bottles.createSvgScrimLabel('u → v', {
      x: 570,
      y: 274,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#8D5B0C',
      padX: 12,
      padY: 4,
    }),
  );

  // Right: Directed Graph on 4 vertices (square layout x ∈ [760, 1080], y ∈ [185, 425])
  const g2Pos = [
    { x: 780, y: 205 },
    { x: 1060, y: 205 },
    { x: 1060, y: 405 },
    { x: 780, y: 405 },
  ];
  const g2Arcs = [];
  const g2ArcPaths = [
    `M 812 198 Q 920 156 1026 198`, // 0 -> 1
    `M 1068 238 Q 1108 305 1068 372`, // 1 -> 2
    `M 1026 412 Q 920 452 812 412`, // 2 -> 3
  ];
  for (let i = 0; i < g2ArcPaths.length; i++) {
    const p = svgEl(
      'path',
      {
        d: g2ArcPaths[i],
        fill: 'none',
        stroke: colors.terracotta,
        'stroke-width': '3',
        'marker-end': 'url(#arr_terra_a2)',
        opacity: '0',
      },
      act2,
    );
    g2Arcs.push(p);
  }
  for (let i = 0; i < 4; i++) {
    const ng = svgEl('g', { transform: `translate(${g2Pos[i].x}, ${g2Pos[i].y})` }, act2);
    svgEl(
      'circle',
      { cx: '0', cy: '0', r: '26', fill: '#FFFBF2', stroke: colors.bottles[i], 'stroke-width': '3.5' },
      ng,
    );
    svgEl(
      'text',
      {
        x: '0',
        y: '1',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: colors.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '19',
        'font-weight': '700',
        textContent: String(i),
      },
      ng,
    );
  }

  act2.appendChild(
    bottles.createSvgScrimLabel('Untested wrong pair (Bottle u on Slot v)   ⟺   Directed edge u → v', {
      x: 640,
      y: 526,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 600,
      color: colors.ink,
      padX: 18,
      padY: 6,
    }),
  );

  // =========================================================================
  // ACT 3 (Beats 2–3): 3-SLOT UNTESTED CYCLE [0,1,2] <-> [2,0,1]
  // =========================================================================
  const act3 = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;',
  });
  gsap.set(act3, { autoAlpha: 0 });
  container.appendChild(act3);

  const act3Defs = svgEl('defs', {}, act3);
  addArrowMarker(svgEl, act3Defs, 'arr_cinn_a3', colors.cinnabar);

  // Left half: 3 bottles over 3 X-ray coasters that physically shift [0,1,2] -> [2,0,1]
  const a3TopPill1 = bottles.createSvgScrimLabel('True Coasters: [0, 1, 2]  ·  Claimed Win', {
    x: 345,
    y: 88,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#7A4F09',
    fill: '#FDF5DF',
    stroke: colors.brass,
    padX: 16,
    padY: 6,
  });
  act3.appendChild(a3TopPill1);

  const a3TopPill2 = bottles.createSvgScrimLabel('Adversary Switches Coasters → [2, 0, 1]', {
    x: 345,
    y: 88,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#A93825',
    fill: '#FFF4F2',
    stroke: colors.cinnabar,
    padX: 16,
    padY: 6,
  });
  gsap.set(a3TopPill2, { autoAlpha: 0 });
  act3.appendChild(a3TopPill2);

  // Wooden shelf on left
  svgEl(
    'rect',
    {
      x: '98',
      y: '368',
      width: '494',
      height: '13',
      rx: '5',
      fill: colors.wood,
      stroke: colors.ink,
      'stroke-width': '1.5',
    },
    act3,
  );

  const a3SlotX = [190, 345, 500];
  // Static slot labels underneath shelf
  for (let s = 0; s < 3; s++) {
    svgEl(
      'text',
      {
        x: String(a3SlotX[s]),
        y: '454',
        'text-anchor': 'middle',
        fill: colors.muted,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '11.5',
        'font-weight': '700',
        textContent: `Slot ${s}`,
      },
      act3,
    );
  }

  // Coasters wrap (movable during Beat 3!)
  // Coaster 0 starts at Slot 0 -> moves to Slot 1 (+155)
  // Coaster 1 starts at Slot 1 -> moves to Slot 2 (+155)
  // Coaster 2 starts at Slot 2 -> moves to Slot 0 (-310)
  // Result at [Slot 0, Slot 1, Slot 2] = [Coaster 2, Coaster 0, Coaster 1] = [2, 0, 1]!
  const a3Coasters = [];
  const a3Bottles = [];
  for (let i = 0; i < 3; i++) {
    const cWrap = svgEl('g', { transform: `translate(${a3SlotX[i]}, 366)` }, act3);
    const cInner = svgEl('g', {}, cWrap);
    const coaster = bottles.createSvgCoaster(i, {
      hidden: true,
      matched: false,
      scale: 0.96,
      showLabel: true,
    });
    cInner.appendChild(coaster);
    a3Coasters.push({ wrap: cWrap, inner: cInner, coaster });

    const bWrap = svgEl('g', { transform: `translate(${a3SlotX[i]}, 364)` }, act3);
    const bInner = svgEl('g', {}, bWrap);
    const bottle = bottles.createSvgBottle(i, { scale: 0.98, matched: false });
    bInner.appendChild(bottle);
    a3Bottles.push({ wrap: bWrap, inner: bInner, bottle });
  }

  const a3ValidBanner = bottles.createSvgScrimLabel('Every past NO answer still holds ✓  ·  0 Matches Now!', {
    x: 345,
    y: 518,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#387257',
    fill: '#F3FBF6',
    stroke: colors.sage,
    strokeWidth: 1.5,
    padX: 14,
    padY: 6,
  });
  gsap.set(a3ValidBanner, { autoAlpha: 0 });
  act3.appendChild(a3ValidBanner);

  // Right half: Spacious equilateral triangle for 3-cycle 0 -> 1 -> 2 -> 0
  const triPos = [
    { x: 935, y: 158 }, // 0 (top)
    { x: 1110, y: 416 }, // 1 (bottom-right)
    { x: 760, y: 416 }, // 2 (bottom-left)
  ];

  // Clean outward-curved directed arcs
  const triArcs = [
    svgEl(
      'path',
      {
        d: 'M 962 174 Q 1084 260 1102 384',
        fill: 'none',
        stroke: colors.cinnabar,
        'stroke-width': '3.4',
        'marker-end': 'url(#arr_cinn_a3)',
        opacity: '0',
      },
      act3,
    ),
    svgEl(
      'path',
      {
        d: 'M 1076 426 Q 935 478 794 426',
        fill: 'none',
        stroke: colors.cinnabar,
        'stroke-width': '3.4',
        'marker-end': 'url(#arr_cinn_a3)',
        opacity: '0',
      },
      act3,
    ),
    svgEl(
      'path',
      {
        d: 'M 768 384 Q 786 260 908 174',
        fill: 'none',
        stroke: colors.cinnabar,
        'stroke-width': '3.4',
        'marker-end': 'url(#arr_cinn_a3)',
        opacity: '0',
      },
      act3,
    ),
  ];

  // Scrim edge labels strictly OUTSIDE the arcs (ZERO overlap!)
  const triLabels = [
    bottles.createSvgScrimLabel('B0 on S1', {
      x: 1118,
      y: 256,
      fontSize: 12,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#A93825',
      fill: '#FFF5F2',
      stroke: 'rgba(196,69,54,0.35)',
      padX: 10,
      padY: 4,
    }),
    bottles.createSvgScrimLabel('B1 on S2', {
      x: 935,
      y: 484,
      fontSize: 12,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#A93825',
      fill: '#FFF5F2',
      stroke: 'rgba(196,69,54,0.35)',
      padX: 10,
      padY: 4,
    }),
    bottles.createSvgScrimLabel('B2 on S0', {
      x: 752,
      y: 256,
      fontSize: 12,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#A93825',
      fill: '#FFF5F2',
      stroke: 'rgba(196,69,54,0.35)',
      padX: 10,
      padY: 4,
    }),
  ];
  triLabels.forEach((lbl) => {
    gsap.set(lbl, { autoAlpha: 0 });
    act3.appendChild(lbl);
  });

  for (let i = 0; i < 3; i++) {
    const ng = svgEl('g', { transform: `translate(${triPos[i].x}, ${triPos[i].y})` }, act3);
    svgEl(
      'circle',
      { cx: '0', cy: '0', r: '28', fill: '#FFFBF2', stroke: colors.bottles[i], 'stroke-width': '3.8' },
      ng,
    );
    svgEl(
      'text',
      {
        x: '0',
        y: '1',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: colors.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '21',
        'font-weight': '700',
        textContent: String(i),
      },
      ng,
    );
  }

  const triCenterPill = bottles.createSvgScrimLabel('Untested 3-Cycle', {
    x: 935,
    y: 330,
    fontSize: 13.5,
    fontWeight: 700,
    color: '#A93825',
    fill: '#FFFBF2',
    stroke: 'rgba(196,69,54,0.4)',
    padX: 14,
    padY: 6,
  });
  gsap.set(triCenterPill, { autoAlpha: 0 });
  act3.appendChild(triCenterPill);

  // =========================================================================
  // ACT 4 (Beat 4): CYCLE BROKEN (CLEAN '×' BADGE — NO SCISSORS!) -> TOPOLOGICAL DAG
  // =========================================================================
  const act4 = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;',
  });
  gsap.set(act4, { autoAlpha: 0 });
  container.appendChild(act4);

  const act4Defs = svgEl('defs', {}, act4);
  addArrowMarker(svgEl, act4Defs, 'arr_sage_a4', colors.sage);
  addArrowMarker(svgEl, act4Defs, 'arr_cinn_a4', colors.cinnabar);

  act4.appendChild(
    bottles.createSvgScrimLabel('No Untested Directed Cycles Allowed  →  Must Form a DAG', {
      x: 640,
      y: 76,
      fontSize: 14.5,
      fontWeight: 700,
      color: colors.ink,
      padX: 20,
      padY: 6,
    }),
  );

  // 5-vertex topological line at y = 342, x = [200, 420, 640, 860, 1080]
  const dagX = [200, 420, 640, 860, 1080];
  const dagY = 342;

  // Forward DAG arcs strictly ABOVE the vertex line (y ∈ [145, 314])
  const fwdPairs = [
    [0, 1, 272],
    [1, 2, 272],
    [2, 3, 272],
    [3, 4, 272],
    [0, 2, 212],
    [1, 3, 212],
    [2, 4, 212],
    [0, 3, 152],
    [1, 4, 152],
  ];
  const fwdArcs = [];
  for (const [u, v, ctrlY] of fwdPairs) {
    const x1 = dagX[u] + 18;
    const x2 = dagX[v] - 18;
    const mx = (x1 + x2) / 2;
    const p = svgEl(
      'path',
      {
        d: `M ${x1} ${dagY - 18} Q ${mx} ${ctrlY} ${x2} ${dagY - 18}`,
        fill: 'none',
        stroke: colors.sage,
        'stroke-width': '2.4',
        'marker-end': 'url(#arr_sage_a4)',
        opacity: '0.28',
      },
      act4,
    );
    fwdArcs.push(p);
  }

  // One offending backward arc (3 -> 1) cleanly BELOW the vertex line (midpoint at (640, 444), ZERO clutter!)
  const backArc = svgEl(
    'path',
    {
      d: `M ${dagX[3] - 16} ${dagY + 20} Q 640 468 ${dagX[1] + 16} ${dagY + 20}`,
      fill: 'none',
      stroke: colors.cinnabar,
      'stroke-width': '3.4',
      'marker-end': 'url(#arr_cinn_a4)',
    },
    act4,
  );

  // Crisp cinnabar '×' scrim badge at exact unobstructed midpoint of the backward arc (640, 442)
  const cutBadge = bottles.createSvgScrimLabel('×  Backward Cycle Edge Forbidden', {
    x: 640,
    y: 446,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#A93825',
    fill: '#FFF4F2',
    stroke: colors.cinnabar,
    strokeWidth: 1.6,
    padX: 16,
    padY: 6,
  });
  gsap.set(cutBadge, { autoAlpha: 0 });
  act4.appendChild(cutBadge);

  // 5 vertices (start slightly scattered vertically, then align cleanly into topological order!)
  const dagInitOffsets = [
    { dx: 0, dy: 42 },
    { dx: 0, dy: -36 },
    { dx: 0, dy: 34 },
    { dx: 0, dy: -30 },
    { dx: 0, dy: 28 },
  ];
  const dagNodes = [];
  for (let i = 0; i < 5; i++) {
    const outer = svgEl('g', { transform: `translate(${dagX[i]}, ${dagY})` }, act4);
    const inner = svgEl('g', {}, outer);
    gsap.set(inner, { x: dagInitOffsets[i].dx, y: dagInitOffsets[i].dy });

    svgEl(
      'circle',
      { cx: '0', cy: '0', r: '24', fill: '#FFFBF2', stroke: colors.bottles[i], 'stroke-width': '3.4' },
      inner,
    );
    svgEl(
      'text',
      {
        x: '0',
        y: '1',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: colors.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '16',
        'font-weight': '700',
        textContent: `v${i + 1}`,
      },
      inner,
    );
    dagNodes.push(inner);
  }

  const dagFooter = bottles.createSvgScrimLabel(
    'Topological Order: at most 1 forward untested arc per pair {u, v}  →  ≤ n(n−1)/2 untested',
    {
      x: 640,
      y: 526,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 600,
      color: '#387257',
      fill: '#F3FBF6',
      stroke: 'rgba(78,140,111,0.38)',
      padX: 18,
      padY: 6,
    },
  );
  gsap.set(dagFooter, { autoAlpha: 0 });
  act4.appendChild(dagFooter);

  // =========================================================================
  // ACT 5 (Beat 5): DETERMINISTIC 1/4 n^2 DERIVATION
  // =========================================================================
  const act5 = document.createElement('div');
  act5.style.cssText =
    'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;opacity:0;visibility:hidden;';
  container.appendChild(act5);

  const a5Title = document.createElement('div');
  a5Title.style.cssText =
    'position:absolute;left:0;right:0;top:64px;text-align:center;' +
    "font-family:'Fraunces',Georgia,serif;font-size:28px;font-weight:600;color:#1F1A17;";
  a5Title.textContent = 'Deterministic Lower Bound';
  act5.appendChild(a5Title);

  // Split bar visualizing n(n-1) total wrong pairs = 50% Untested DAG + 50% Must Test
  const splitBarWrap = document.createElement('div');
  splitBarWrap.style.cssText =
    'position:absolute;left:190px;top:122px;width:900px;height:66px;border-radius:14px;' +
    'overflow:hidden;border:1.8px solid rgba(107,94,84,0.35);display:flex;' +
    'box-shadow:0 8px 22px rgba(68,50,32,0.08);';
  splitBarWrap.innerHTML =
    `<div style="flex:1;background:#F6F1E7;display:flex;align-items:center;justify-content:center;gap:10px;border-right:2px dashed #6B5E54;">` +
    `<span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:#6B5E54;text-transform:uppercase;">Untested DAG</span>` +
    `<span style="font-size:18px;color:#1F1A17;">${renderMath('\\le \\tfrac{n(n-1)}{2}')}</span></div>` +
    `<div style="flex:1;background:rgba(217,93,72,0.16);display:flex;align-items:center;justify-content:center;gap:10px;">` +
    `<span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:#A93825;text-transform:uppercase;">Must Test</span>` +
    `<span style="font-size:18px;font-weight:700;color:#A93825;">${renderMath('\\ge \\tfrac{n(n-1)}{2}')}</span></div>`;
  act5.appendChild(splitBarWrap);

  const a5Step1 = document.createElement('div');
  a5Step1.style.cssText =
    'position:absolute;left:190px;top:218px;width:900px;padding:16px 28px;border-radius:12px;' +
    'background:rgba(255,251,242,0.94);border:1px solid rgba(107,94,84,0.22);' +
    'display:flex;align-items:center;justify-content:space-between;gap:28px;';
  a5Step1.innerHTML =
    `<span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:#6B5E54;text-transform:uppercase;white-space:nowrap;">Step 1 · Wrong Pairs Tested</span>` +
    `<span style="font-size:21px;color:#1F1A17;white-space:nowrap;">${renderMath('|\\text{Tested Wrong}| \\;\\ge\\; n(n-1) - \\frac{n(n-1)}{2} \\;=\\; \\frac{n(n-1)}{2}')}</span>`;
  gsap.set(a5Step1, { autoAlpha: 0, y: 12 });
  act5.appendChild(a5Step1);

  const a5Step2 = document.createElement('div');
  a5Step2.style.cssText =
    'position:absolute;left:190px;top:308px;width:900px;padding:16px 28px;border-radius:12px;' +
    'background:rgba(255,251,242,0.94);border:1px solid rgba(107,94,84,0.22);' +
    'display:flex;align-items:center;justify-content:space-between;gap:28px;';
  a5Step2.innerHTML =
    `<span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:#6B5E54;text-transform:uppercase;white-space:nowrap;">Step 2 · Divide by 2 / Swap</span>` +
    `<span style="font-size:21px;color:#1F1A17;white-space:nowrap;">${renderMath('T \\;\\ge\\; \\frac{|\\text{Tested Wrong}|}{2} \\;\\ge\\; \\frac{n(n-1)}{4}')}</span>`;
  gsap.set(a5Step2, { autoAlpha: 0, y: 12 });
  act5.appendChild(a5Step2);

  const a5Final = document.createElement('div');
  a5Final.style.cssText =
    'position:absolute;left:280px;top:408px;width:720px;padding:20px 32px;border-radius:16px;' +
    'background:linear-gradient(180deg, #FFFDF8 0%, #FFF1EB 100%);border:2px solid #D95D48;' +
    'box-shadow:0 12px 28px rgba(217,93,72,0.16);display:flex;align-items:center;justify-content:space-between;';
  a5Final.innerHTML =
    `<div><div style="font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:700;letter-spacing:0.1em;color:#A93825;text-transform:uppercase;">Theorem · Deterministic Lower Bound</div>` +
    `<div style="font-size:14px;color:#6B5E54;margin-top:4px;">Exact worst-case floor for Game 1</div></div>` +
    `<div style="font-size:30px;font-weight:700;color:#A93825;">${renderMath('T \\;\\ge\\; \\tfrac{1}{4} n^2')}</div>`;
  gsap.set(a5Final, { autoAlpha: 0, scale: 0.93 });
  act5.appendChild(a5Final);

  // =========================================================================
  // ACT 6 (Beat 6): TWIN-SECRET PAIRING π vs π·(i j)
  // =========================================================================
  const act6 = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;',
  });
  gsap.set(act6, { autoAlpha: 0 });
  container.appendChild(act6);

  act6.appendChild(
    bottles.createSvgScrimLabel('Random Secret: Pair Every Secret π with Its (i, j)-Swapped Twin', {
      x: 640,
      y: 72,
      fontSize: 14.5,
      fontWeight: 700,
      color: colors.ink,
      padX: 20,
      padY: 6,
    }),
  );

  // Subtle side-by-side mats (Left: World A π = [0,1,2,3], Right: World B π·(1 2) = [0,2,1,3])
  svgEl(
    'rect',
    {
      x: '78',
      y: '116',
      width: '506',
      height: '356',
      rx: '16',
      fill: '#FFFBF2',
      'fill-opacity': '0.86',
      stroke: 'rgba(107,94,84,0.22)',
      'stroke-width': '1.5',
    },
    act6,
  );
  svgEl(
    'rect',
    {
      x: '696',
      y: '116',
      width: '506',
      height: '356',
      rx: '16',
      fill: '#FFFBF2',
      'fill-opacity': '0.86',
      stroke: 'rgba(107,94,84,0.22)',
      'stroke-width': '1.5',
    },
    act6,
  );

  svgEl(
    'text',
    {
      x: '331',
      y: '148',
      'text-anchor': 'middle',
      fill: colors.ink,
      'font-family': "'Fraunces', Georgia, serif",
      'font-size': '20',
      'font-weight': '600',
      textContent: 'World A  ·  Secret π = [0, 1, 2, 3]',
    },
    act6,
  );
  svgEl(
    'text',
    {
      x: '949',
      y: '148',
      'text-anchor': 'middle',
      fill: colors.ink,
      'font-family': "'Fraunces', Georgia, serif",
      'font-size': '20',
      'font-weight': '600',
      textContent: 'World B  ·  Twin π·(1 2) = [0, 2, 1, 3]',
    },
    act6,
  );

  // Center twin badge
  act6.appendChild(
    bottles.createSvgScrimLabel('Swap (i, j)', {
      x: 640,
      y: 294,
      fontSize: 12.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#8D5B0C',
      fill: '#FDF5DF',
      stroke: colors.brass,
      padX: 10,
      padY: 5,
    }),
  );

  const twinLeftX = [166, 276, 386, 496];
  const twinRightX = [784, 894, 1004, 1114];
  const worldASec = [0, 1, 2, 3];
  const worldBSec = [0, 2, 1, 3];

  for (let i = 0; i < 4; i++) {
    act6.appendChild(
      bottles.createSvgCoaster(worldASec[i], {
        x: twinLeftX[i],
        y: 374,
        scale: 0.78,
        hidden: false,
        matched: i === 1,
        slotIndex: i,
      }),
    );
    act6.appendChild(
      bottles.createSvgBottle(i, {
        x: twinLeftX[i],
        y: 372,
        scale: 0.78,
        opacity: i === 1 ? 1 : 0.6,
      }),
    );

    act6.appendChild(
      bottles.createSvgCoaster(worldBSec[i], {
        x: twinRightX[i],
        y: 374,
        scale: 0.78,
        hidden: false,
        matched: false,
        slotIndex: i,
      }),
    );
    act6.appendChild(
      bottles.createSvgBottle(i, {
        x: twinRightX[i],
        y: 372,
        scale: 0.78,
        opacity: i === 1 ? 1 : 0.6,
      }),
    );
  }

  // First differing test callouts cleanly above Bottle 1 in both worlds (y = 224)
  const twinTrueBadge = bottles.createSvgScrimLabel('Test (B1 on S1)  →  TRUE ✓', {
    x: 331,
    y: 222,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#387257',
    fill: '#F3FBF6',
    stroke: colors.sage,
    strokeWidth: 1.6,
    padX: 14,
    padY: 6,
  });
  gsap.set(twinTrueBadge, { autoAlpha: 0 });
  act6.appendChild(twinTrueBadge);

  const twinWrongBadge = bottles.createSvgScrimLabel('Test (B1 on S1)  →  WRONG ✗', {
    x: 949,
    y: 222,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#A93825',
    fill: '#FFF4F2',
    stroke: colors.cinnabar,
    strokeWidth: 1.6,
    padX: 14,
    padY: 6,
  });
  gsap.set(twinWrongBadge, { autoAlpha: 0 });
  act6.appendChild(twinWrongBadge);

  const twinFooter = bottles.createSvgScrimLabel(
    'Identical history until first differing pair  →  Wrong in 1 of 2 twins (average ½)',
    {
      x: 640,
      y: 526,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 600,
      color: colors.ink,
      padX: 18,
      padY: 6,
    },
  );
  gsap.set(twinFooter, { autoAlpha: 0 });
  act6.appendChild(twinFooter);

  // =========================================================================
  // ACT 7 (Beat 7): RANDOMIZED 1/8 n^2 + YAO'S MINIMAX BRASS SCALE
  // =========================================================================
  const act7Wrap = document.createElement('div');
  act7Wrap.style.cssText =
    'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;opacity:0;visibility:hidden;';
  container.appendChild(act7Wrap);

  // Left: Clean 1/8 n^2 derivation stack
  const a7Left = document.createElement('div');
  a7Left.style.cssText =
    'position:absolute;left:92px;top:84px;width:586px;display:flex;flex-direction:column;gap:16px;';
  act7Wrap.appendChild(a7Left);

  const a7Head = document.createElement('div');
  a7Head.style.cssText = "font-family:'Fraunces',Georgia,serif;font-size:27px;font-weight:600;color:#1F1A17;";
  a7Head.textContent = 'Randomized Expected Lower Bound';
  a7Left.appendChild(a7Head);

  const a7Eq1 = document.createElement('div');
  a7Eq1.style.cssText =
    'padding:14px 20px;border-radius:12px;background:rgba(255,251,242,0.94);border:1px solid rgba(107,94,84,0.22);';
  a7Eq1.innerHTML =
    `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:#6B5E54;text-transform:uppercase;">Sum ½ wrong pair over all C(n, 2) pairs</div>` +
    `<div style="margin-top:6px;font-size:20px;color:#1F1A17;">${renderMath('\\mathbb{E}[|\\text{Tested Wrong}|] \\;\\ge\\; \\frac{1}{2}\\binom{n}{2} \\;=\\; \\frac{n(n-1)}{4}')}</div>`;
  gsap.set(a7Eq1, { autoAlpha: 0, x: -14 });
  a7Left.appendChild(a7Eq1);

  const a7Eq2 = document.createElement('div');
  a7Eq2.style.cssText =
    'padding:18px 22px;border-radius:14px;background:linear-gradient(180deg, #FFFDF8 0%, #EEF6FB 100%);' +
    'border:2px solid #3D7EA6;box-shadow:0 10px 24px rgba(61,126,166,0.14);' +
    'display:flex;align-items:center;justify-content:space-between;';
  a7Eq2.innerHTML =
    `<div><div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:#2B6185;text-transform:uppercase;">Divide by 2 pairs / swap</div>` +
    `<div style="font-size:13.5px;color:#6B5E54;margin-top:3px;">Half the deterministic bound</div></div>` +
    `<div style="font-size:27px;font-weight:700;color:#2B6185;">${renderMath('\\mathbb{E}[T] \\;\\ge\\; \\tfrac{1}{8} n^2')}</div>`;
  gsap.set(a7Eq2, { autoAlpha: 0, scale: 0.94 });
  a7Left.appendChild(a7Eq2);

  const a7Halve = document.createElement('div');
  a7Halve.className = 'label-scrim label-scrim-card';
  a7Halve.style.cssText =
    'display:flex;align-items:center;justify-content:center;gap:16px;padding:12px 20px;font-size:18px;';
  a7Halve.innerHTML =
    `<span style="color:#A93825;font-weight:700;">${renderMath('\\tfrac{1}{4} n^2')}</span>` +
    `<span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#8D5B0C;font-weight:700;">── ÷ 2 ──▶</span>` +
    `<span style="color:#2B6185;font-weight:700;">${renderMath('\\tfrac{1}{8} n^2')}</span>`;
  gsap.set(a7Halve, { autoAlpha: 0 });
  a7Left.appendChild(a7Halve);

  // Right: Handcrafted Antique Brass Scale for Yao's Minimax Principle
  const act7Svg = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;',
  });
  act7Wrap.appendChild(act7Svg);

  act7Svg.appendChild(
    bottles.createSvgScrimLabel("Yao's Minimax Principle", {
      x: 960,
      y: 96,
      fontSize: 15,
      fontWeight: 700,
      color: '#8D5B0C',
      fill: '#FDF5DF',
      stroke: colors.brass,
      strokeWidth: 1.5,
      padX: 18,
      padY: 6,
    }),
  );

  const yaoScale = bottles.createSvgBrassScale({
    x: 960,
    y: 316,
    radius: 76,
    maxVal: 8,
    initialVal: 0,
    unit: '',
  });
  act7Svg.appendChild(yaoScale);

  // Brass weight puck dropping onto the scale pan
  const yaoWeightOuter = svgEl('g', { transform: 'translate(960, 198)' }, act7Svg);
  const yaoWeightInner = svgEl('g', {}, yaoWeightOuter);
  gsap.set(yaoWeightInner, { autoAlpha: 0, y: -28 });
  svgEl(
    'rect',
    {
      x: '-42',
      y: '-14',
      width: '84',
      height: '28',
      rx: '8',
      fill: '#3D7EA6',
      stroke: colors.ink,
      'stroke-width': '1.6',
    },
    yaoWeightInner,
  );
  svgEl(
    'text',
    {
      x: '0',
      y: '1',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: '#FFFBF2',
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '13',
      'font-weight': '700',
      textContent: '⅛ n²',
    },
    yaoWeightInner,
  );

  act7Svg.appendChild(
    bottles.createSvgScrimLabel('Rand Worst-Case  ≥  Det Avg-Case', {
      x: 960,
      y: 470,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: colors.ink,
      fill: '#FFFBF2',
      stroke: 'rgba(107,94,84,0.28)',
      padX: 16,
      padY: 6,
    }),
  );
  act7Svg.appendChild(
    bottles.createSvgScrimLabel('Randomized algorithms are mixtures of deterministic ones', {
      x: 960,
      y: 516,
      fontSize: 12.5,
      fontWeight: 600,
      color: colors.sepia,
      padX: 14,
      padY: 5,
    }),
  );

  // =========================================================================
  // ACT 8 (Beat 8): THE FUN 2026 GAP (1/2 n^2 log n vs 1/4 n^2 & 1/8 n^2)
  // =========================================================================
  const act8 = document.createElement('div');
  act8.style.cssText =
    'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;opacity:0;visibility:hidden;';
  container.appendChild(act8);

  const a8Title = document.createElement('div');
  a8Title.style.cssText =
    'position:absolute;left:0;right:0;top:66px;text-align:center;' +
    "font-family:'Fraunces',Georgia,serif;font-size:30px;font-weight:600;color:#1F1A17;";
  a8Title.textContent = 'The FUN 2026 Gap';
  act8.appendChild(a8Title);

  const barsWrap = document.createElement('div');
  barsWrap.style.cssText =
    'position:absolute;left:130px;top:138px;width:1020px;display:flex;flex-direction:column;gap:26px;';
  act8.appendChild(barsWrap);

  function makeGapRow({ label, sub, barPct, color, bg, tex, tag }) {
    const row = document.createElement('div');
    row.style.cssText =
      'display:grid;grid-template-columns:270px 1fr 180px;align-items:center;gap:20px;' +
      'padding:14px 22px;border-radius:14px;background:rgba(255,251,242,0.92);' +
      'border:1px solid rgba(107,94,84,0.2);box-shadow:0 6px 18px rgba(68,50,32,0.06);';

    const left = document.createElement('div');
    left.innerHTML =
      `<div style="font-size:15.5px;font-weight:700;color:#1F1A17;">${label}</div>` +
      `<div style="font-size:12px;color:#6B5E54;margin-top:2px;">${sub}</div>`;
    row.appendChild(left);

    const track = document.createElement('div');
    track.style.cssText =
      'position:relative;height:30px;border-radius:999px;background:#EDE4D3;overflow:hidden;';
    const fill = document.createElement('div');
    fill.className = 'gap-bar-fill';
    fill.style.cssText =
      `height:100%;width:${barPct}%;border-radius:999px;background:${bg};border:1.5px solid ${color};` +
      'transform-origin:left center;display:flex;align-items:center;justify-content:flex-end;padding-right:12px;';
    if (tag) {
      fill.innerHTML = `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:#FFFBF2;">${tag}</span>`;
    }
    track.appendChild(fill);
    row.appendChild(track);

    const right = document.createElement('div');
    right.style.cssText = `text-align:right;font-size:21px;font-weight:700;color:${color};`;
    right.innerHTML = renderMath(tex);
    row.appendChild(right);

    return { row, fill };
  }

  const barFun = makeGapRow({
    label: 'Prior Best (FUN 2026)',
    sub: 'Repeated tests add a log n factor',
    barPct: 96,
    color: '#A93825',
    bg: 'linear-gradient(90deg, #E27A66, #C44536)',
    tex: '\\tfrac{1}{2} n^2 \\log n',
    tag: 'Extra log n overhead',
  });
  const barDet = makeGapRow({
    label: 'Deterministic Limit',
    sub: 'Exact worst-case lower bound',
    barPct: 36,
    color: '#9A6510',
    bg: 'linear-gradient(90deg, #E8BC66, #C88A1E)',
    tex: '\\tfrac{1}{4} n^2',
  });
  const barRand = makeGapRow({
    label: 'Randomized Limit',
    sub: 'Exact expected lower bound',
    barPct: 18,
    color: '#2B6185',
    bg: 'linear-gradient(90deg, #64A4CC, #3D7EA6)',
    tex: '\\tfrac{1}{8} n^2',
  });

  barsWrap.appendChild(barFun.row);
  barsWrap.appendChild(barDet.row);
  barsWrap.appendChild(barRand.row);

  const a8Bridge = document.createElement('div');
  a8Bridge.className = 'label-scrim';
  a8Bridge.style.cssText =
    'position:absolute;left:50%;top:514px;transform:translateX(-50%);' +
    "font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:#387257;padding:7px 20px;";
  a8Bridge.textContent = 'Next: Chapter 04 · How do we eliminate every wasted repeat? →';
  act8.appendChild(a8Bridge);

  // =========================================================================
  // TIMELINE CHOREOGRAPHY
  // =========================================================================
  const b0 = beatSpan(ctx, 0, 0.8, 11.136);
  const b1 = beatSpan(ctx, 1, 12.486, 11.16);
  const b2 = beatSpan(ctx, 2, 24.196, 10.416);
  const b3 = beatSpan(ctx, 3, 35.162, 10.608);
  const b4 = beatSpan(ctx, 4, 46.32, 11.088);
  const b5 = beatSpan(ctx, 5, 57.958, 11.544);
  const b6 = beatSpan(ctx, 6, 70.052, 10.296);
  const b7 = beatSpan(ctx, 7, 80.898, 13.512);
  const b8 = beatSpan(ctx, 8, 94.96, 10.68);

  const tl = gsap.timeline({ paused: true });

  // Beat 0: Adversary's one rule + veiled coasters shimmer
  tl.from(rulePlaque, { y: -16, opacity: 0, duration: 0.6, ease: 'power2.out' }, b0.start);
  tl.to([act1Beam, act1NoBadge], { autoAlpha: 1, duration: 0.45 }, b0.start + 3.2);
  tl.to(act1Footer, { autoAlpha: 1, duration: 0.45 }, b0.start + 5.0);
  for (let i = 0; i < 4; i++) {
    tl.to(
      act1Coasters[i],
      { x: i % 2 === 0 ? 5 : -5, duration: 0.65, yoyo: true, repeat: 3, ease: 'sine.inOut' },
      b0.start + 4.4 + i * 0.12,
    );
  }

  // Beat 1: Cross-fade to Relabeling -> Directed Graph
  tl.to(act1, { autoAlpha: 0, duration: 0.4 }, b1.start);
  tl.to(act2, { autoAlpha: 1, duration: 0.45 }, b1.start + 0.42);
  for (let i = 0; i < matHighlightCells.length; i++) {
    tl.to(matHighlightCells[i], { opacity: 1, duration: 0.45 }, b1.start + 2.6 + i * 1.1);
    tl.to(g2Arcs[i], { opacity: 1, duration: 0.45 }, b1.start + 3.0 + i * 1.1);
  }

  // Beat 2: Cross-fade to 3-slot untested cycle
  tl.to(act2, { autoAlpha: 0, duration: 0.4 }, b2.start);
  tl.to(act3, { autoAlpha: 1, duration: 0.45 }, b2.start + 0.42);
  for (let i = 0; i < 3; i++) {
    bottles.setCoasterRevealed(a3Coasters[i].coaster, true, tl, b2.start + 0.9 + i * 0.14, 0.45);
    const halo = a3Coasters[i].coaster.querySelector('.coaster-halo');
    const star = a3Coasters[i].coaster.querySelector('.coaster-star');
    const bGlow = a3Bottles[i].bottle.querySelector('.bottle-glow');
    if (halo) tl.to(halo, { opacity: 1, duration: 0.4 }, b2.start + 1.3 + i * 0.1);
    if (star) tl.to(star, { opacity: 1, duration: 0.4 }, b2.start + 1.3 + i * 0.1);
    if (bGlow) tl.to(bGlow, { opacity: 1, duration: 0.4 }, b2.start + 1.3 + i * 0.1);
  }
  for (let i = 0; i < 3; i++) {
    tl.to(triArcs[i], { opacity: 1, duration: 0.5 }, b2.start + 3.6 + i * 1.2);
    tl.to(triLabels[i], { autoAlpha: 1, duration: 0.4 }, b2.start + 3.8 + i * 1.2);
  }
  tl.to(triCenterPill, { autoAlpha: 1, duration: 0.45 }, b2.start + 7.2);

  // Beat 3: Adversary rotates coasters [0,1,2] -> [2,0,1] smoothly underneath bottles
  tl.to(a3TopPill1, { autoAlpha: 0, duration: 0.3 }, b3.start + 0.8);
  tl.to(a3TopPill2, { autoAlpha: 1, duration: 0.4 }, b3.start + 1.1);
  // Turn off golden match halos as coasters move away
  for (let i = 0; i < 3; i++) {
    const halo = a3Coasters[i].coaster.querySelector('.coaster-halo');
    const star = a3Coasters[i].coaster.querySelector('.coaster-star');
    const bGlow = a3Bottles[i].bottle.querySelector('.bottle-glow');
    if (halo) tl.to(halo, { opacity: 0, duration: 0.35 }, b3.start + 1.6);
    if (star) tl.to(star, { opacity: 0, duration: 0.35 }, b3.start + 1.6);
    if (bGlow) tl.to(bGlow, { opacity: 0, duration: 0.35 }, b3.start + 1.6);
  }
  const rotT = b3.start + 1.9;
  // Coaster 0 -> Slot 1 (+155), Coaster 1 -> Slot 2 (+155), Coaster 2 -> Slot 0 (-310)
  tl.to(a3Coasters[0].inner, { x: 155, duration: 1.3, ease: 'power2.inOut' }, rotT);
  tl.to(a3Coasters[0].inner, { y: 14, duration: 0.65, yoyo: true, repeat: 1, ease: 'sine.inOut' }, rotT);
  tl.to(a3Coasters[1].inner, { x: 155, duration: 1.3, ease: 'power2.inOut' }, rotT);
  tl.to(a3Coasters[1].inner, { y: 14, duration: 0.65, yoyo: true, repeat: 1, ease: 'sine.inOut' }, rotT);
  tl.to(a3Coasters[2].inner, { x: -310, duration: 1.3, ease: 'power2.inOut' }, rotT);
  tl.to(a3Coasters[2].inner, { y: 42, duration: 0.65, yoyo: true, repeat: 1, ease: 'sine.inOut' }, rotT);

  tl.to(a3ValidBanner, { autoAlpha: 1, duration: 0.5 }, rotT + 1.5);

  // Beat 4: Cross-fade to DAG (break backward edge cleanly with '×' badge, align topologically)
  tl.to(act3, { autoAlpha: 0, duration: 0.4 }, b4.start);
  tl.to(act4, { autoAlpha: 1, duration: 0.45 }, b4.start + 0.42);
  // Break the backward cycle arc cleanly
  tl.to(
    backArc,
    { opacity: 0.24, attr: { 'stroke-dasharray': '7 6' }, duration: 0.55 },
    b4.start + 1.8,
  );
  tl.to(cutBadge, { autoAlpha: 1, duration: 0.45 }, b4.start + 2.0);
  // Glide all 5 vertices into clean horizontal topological order & highlight forward arcs
  tl.to(dagNodes, { x: 0, y: 0, duration: 1.0, stagger: 0.08, ease: 'power3.out' }, b4.start + 4.4);
  tl.to(fwdArcs, { opacity: 0.85, duration: 0.55, stagger: 0.06 }, b4.start + 5.1);
  tl.to(dagFooter, { autoAlpha: 1, duration: 0.5 }, b4.start + 6.4);

  // Beat 5: Cross-fade to Deterministic 1/4 n^2 arithmetic
  tl.to(act4, { autoAlpha: 0, duration: 0.4 }, b5.start);
  tl.to(act5, { autoAlpha: 1, duration: 0.45 }, b5.start + 0.42);
  tl.to(a5Step1, { autoAlpha: 1, y: 0, duration: 0.5 }, b5.start + 1.2);
  tl.to(a5Step2, { autoAlpha: 1, y: 0, duration: 0.5 }, b5.start + 4.2);
  tl.to(a5Final, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)' }, b5.start + 6.8);

  // Beat 6: Cross-fade to Twin-Secret Worlds
  tl.to(act5, { autoAlpha: 0, duration: 0.4 }, b6.start);
  tl.to(act6, { autoAlpha: 1, duration: 0.45 }, b6.start + 0.42);
  tl.to(twinTrueBadge, { autoAlpha: 1, duration: 0.45 }, b6.start + 3.8);
  tl.to(twinWrongBadge, { autoAlpha: 1, duration: 0.45 }, b6.start + 4.5);
  tl.to(twinFooter, { autoAlpha: 1, duration: 0.45 }, b6.start + 6.2);

  // Beat 7: Cross-fade to Randomized 1/8 n^2 + Yao's Minimax Brass Scale
  tl.to(act6, { autoAlpha: 0, duration: 0.4 }, b7.start);
  tl.to(act7Wrap, { autoAlpha: 1, duration: 0.45 }, b7.start + 0.42);
  tl.to(a7Eq1, { autoAlpha: 1, x: 0, duration: 0.5 }, b7.start + 0.8);
  tl.to(a7Eq2, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(1.4)' }, b7.start + 3.2);
  tl.to(a7Halve, { autoAlpha: 1, duration: 0.45 }, b7.start + 4.6);
  tl.to(yaoWeightInner, { autoAlpha: 1, y: 12, duration: 0.55, ease: 'bounce.out' }, b7.start + 5.6);
  bottles.setScaleValue(yaoScale, 4, tl, b7.start + 5.8, 0.95);

  // Beat 8: Cross-fade to FUN 2026 Gap chart
  tl.to(act7Wrap, { autoAlpha: 0, duration: 0.4 }, b8.start);
  tl.to(act8, { autoAlpha: 1, duration: 0.45 }, b8.start + 0.42);
  tl.from(barFun.fill, { scaleX: 0, duration: 0.8, ease: 'power3.out' }, b8.start + 0.7);
  tl.from(barDet.fill, { scaleX: 0, duration: 0.7, ease: 'power3.out' }, b8.start + 2.4);
  tl.from(barRand.fill, { scaleX: 0, duration: 0.65, ease: 'power3.out' }, b8.start + 3.2);
  tl.from(a8Bridge, { y: 10, opacity: 0, duration: 0.5 }, b8.start + 5.2);

  const totalDur = Math.max(ctx.duration || sceneMeta.duration, tl.duration() + 0.2);
  if (tl.duration() < totalDur) {
    tl.to({}, { duration: totalDur - tl.duration() }, tl.duration());
  }

  return { timeline: tl, destroy() {} };
}
