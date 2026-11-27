// Chapter 04: The Four-Bottle Fold

export const sceneMeta = {
  id: 'scene4',
  number: 4,
  title: 'The Four-Bottle Fold',
  chapter: 'Part I · The Optimal Algorithm',
  duration: 99.066,
  beats: [
    {
      id: 's4_b0',
      start: 0.8,
      audioDuration: 8.112,
      text: 'To reach our lower bounds, every swap should test two brand-new pairs with zero repeats—and we must spot hits immediately.',
      highlight: ['two brand-new pairs', 'zero repeats'],
      cue: null,
    },
    {
      id: 's4_b1',
      start: 9.462,
      audioDuration: 13.104,
      text: 'First, clear initial matches in linear swaps so every unlocked bottle starts unmatched. Swapping a matched bottle always drops the score, since its coaster is already claimed.',
      highlight: ['clear initial matches', 'always drops the score'],
      cue: 'bell',
    },
    {
      id: 's4_b2',
      start: 23.116,
      audioDuration: 13.488,
      text: 'A drop of 1 pinpoints a matched anchor via one third-slot probe. Testing each remaining slot against that anchor—then undoing—locks every initial match when score drops by 2.',
      highlight: ['matched anchor', 'score drops by 2'],
      cue: 'lock',
    },
    {
      id: 's4_b3',
      start: 37.154,
      audioDuration: 8.736,
      text: 'Now take any even block of s unlocked bottles on a ring of s slots—starting with four bottles, zero through three.',
      highlight: ['even block of s unlocked bottles', 'ring of s slots'],
      cue: 'whoosh',
    },
    {
      id: 's4_b4',
      start: 46.44,
      audioDuration: 11.304,
      text: 'Their starting spots already tested the diagonal pairs. Naive swaps keep revisiting tested slots, wasting moves and causing that extra log n factor.',
      highlight: ['diagonal pairs', 'Naive swaps', 'extra log n factor'],
      cue: 'clink',
    },
    {
      id: 's4_b5',
      start: 58.294,
      audioDuration: 12.864,
      text: 'Instead, alternate two ring reflections. Move A reflects outer-to-inner—on four bottles, 0 with 3 and 1 with 2—swapping pairs across one axis.',
      highlight: ['two ring reflections', 'Move A', '0 with 3 and 1 with 2'],
      cue: 'clink',
    },
    {
      id: 's4_b6',
      start: 71.708,
      audioDuration: 12.888,
      text: 'Move B reflects across the shifted axis—on four bottles, 0 with 1 and 2 with 3. Combining two reflections shifts every bottle two steps around the ring.',
      highlight: ['Move B', 'shifted axis', 'two steps around the ring'],
      cue: 'clink',
    },
    {
      id: 's4_b7',
      start: 85.146,
      audioDuration: 12.72,
      text: "Alternating A and B visits all even- and odd-parity slots once each—all twelve off-diagonal pairs in six swaps, zero repeats. Next, let's watch it run live.",
      highlight: ['twelve off-diagonal pairs', 'six swaps, zero repeats'],
      cue: 'bell',
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
  const { gsap, colors, bottles, createSvg, svgEl } = ctx;
  const W = 1280;
  const H = 590;

  rootEl.innerHTML = '';

  const container = document.createElement('div');
  container.style.cssText =
    'position:relative;width:1280px;height:720px;overflow:hidden;background:transparent;';
  rootEl.appendChild(container);

  // =========================================================================
  // ACT 1 (Beat 0): DESIGN GOALS FOR AN OPTIMAL ALGORITHM
  // =========================================================================
  const act1 = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;',
  });
  container.appendChild(act1);

  svgEl(
    'text',
    {
      x: '640',
      y: '88',
      'text-anchor': 'middle',
      fill: colors.ink,
      'font-family': "'Fraunces', Georgia, serif",
      'font-size': '30',
      'font-weight': '600',
      textContent: 'Blueprints for an Optimal Algorithm',
    },
    act1,
  );

  const pillars = [
    { x: 112, accent: colors.terracotta, num: '01', title: '2 Fresh Pairs / Swap', sub: 'Every move pays full rate' },
    { x: 468, accent: colors.sage, num: '02', title: '0 Wasted Repeats', sub: 'Never re-test a visited cell' },
    { x: 824, accent: colors.brass, num: '03', title: 'Instant Hit Detection', sub: 'Spot & lock matches right away' },
  ];
  const pillarEls = [];
  for (const p of pillars) {
    const pg = svgEl('g', { transform: `translate(${p.x}, 126)` }, act1);
    const inner = svgEl('g', {}, pg);
    svgEl(
      'rect',
      {
        x: '0',
        y: '0',
        width: '344',
        height: '104',
        rx: '14',
        fill: '#FFFBF2',
        stroke: 'rgba(107,94,84,0.22)',
        'stroke-width': '1.5',
      },
      inner,
    );
    svgEl('rect', { x: '0', y: '0', width: '344', height: '5', rx: '3', fill: p.accent }, inner);
    svgEl(
      'text',
      {
        x: '22',
        y: '32',
        fill: p.accent,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '11.5',
        'font-weight': '700',
        textContent: `CRITERION ${p.num}`,
      },
      inner,
    );
    svgEl(
      'text',
      {
        x: '22',
        y: '62',
        fill: colors.ink,
        'font-family': "'Fraunces', Georgia, serif",
        'font-size': '21',
        'font-weight': '600',
        textContent: p.title,
      },
      inner,
    );
    svgEl(
      'text',
      {
        x: '22',
        y: '86',
        fill: colors.sepia,
        'font-family': "'Plus Jakarta Sans', sans-serif",
        'font-size': '13.5',
        textContent: p.sub,
      },
      inner,
    );
    pillarEls.push(inner);
  }

  // Preview row: 4 bottles over veiled coasters on left, 4x4 grid on right
  svgEl(
    'rect',
    {
      x: '126',
      y: '466',
      width: '496',
      height: '12',
      rx: '5',
      fill: colors.wood,
      stroke: colors.ink,
      'stroke-width': '1.4',
    },
    act1,
  );
  for (let i = 0; i < 4; i++) {
    const bx = 204 + i * 114;
    act1.appendChild(bottles.createSvgCoaster(i, { x: bx, y: 464, scale: 0.82, hidden: true, slotIndex: i }));
    act1.appendChild(bottles.createSvgBottle(i, { x: bx, y: 462, scale: 0.88 }));
  }

  // Mini 4x4 preview matrix on right
  const pMatX = 790;
  const pMatY = 278;
  const pMatC = 54;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const isFresh = (r === 0 && c === 3) || (r === 3 && c === 0);
      svgEl(
        'rect',
        {
          x: String(pMatX + c * pMatC + 3),
          y: String(pMatY + r * pMatC + 3),
          width: String(pMatC - 6),
          height: String(pMatC - 6),
          rx: '7',
          fill: isFresh ? 'rgba(217, 93, 72, 0.22)' : r === c ? '#EDE4D3' : '#FFFBF2',
          stroke: isFresh ? colors.terracotta : 'rgba(107,94,84,0.22)',
          'stroke-width': isFresh ? '2' : '1.2',
        },
        act1,
      );
    }
  }
  act1.appendChild(
    bottles.createSvgScrimLabel('Target: 100% Off-Diagonal Coverage', {
      x: pMatX + 2 * pMatC,
      y: 522,
      fontSize: 13,
      fontFamily: 'mono',
      fontWeight: 600,
      color: colors.sepia,
      padX: 14,
      padY: 5,
    }),
  );

  // =========================================================================
  // ACT 2 (Beats 1–2): STEP 1 LINEAR PRE-PASS — CLEAR INITIAL MATCHES TO f = 0
  // =========================================================================
  const act2 = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;',
  });
  gsap.set(act2, { autoAlpha: 0 });
  container.appendChild(act2);

  act2.appendChild(
    bottles.createSvgScrimLabel('Step 1  ·  Clear Initial Matches in O(n) Swaps', {
      x: 640,
      y: 72,
      fontSize: 14.5,
      fontWeight: 700,
      color: colors.ink,
      padX: 20,
      padY: 6,
    }),
  );

  // Referee score medallion (top-right, clear of shelf)
  const pScoreG = svgEl('g', { transform: 'translate(1122, 98)' }, act2);
  svgEl(
    'rect',
    {
      x: '-106',
      y: '-32',
      width: '212',
      height: '64',
      rx: '14',
      fill: '#FFFBF2',
      stroke: colors.brass,
      'stroke-width': '1.8',
    },
    pScoreG,
  );
  svgEl(
    'text',
    {
      x: '0',
      y: '-13',
      'text-anchor': 'middle',
      fill: colors.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '10',
      'font-weight': '700',
      'letter-spacing': '0.09em',
      textContent: 'SCORE',
    },
    pScoreG,
  );
  const pScoreF2 = svgEl(
    'text',
    {
      x: '0',
      y: '14',
      'text-anchor': 'middle',
      fill: colors.ink,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '21',
      'font-weight': '700',
      textContent: 'f = 2',
    },
    pScoreG,
  );
  const pScoreF1 = svgEl(
    'text',
    {
      x: '0',
      y: '14',
      'text-anchor': 'middle',
      fill: colors.cinnabar,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '18',
      'font-weight': '700',
      textContent: 'f = 1 (Δ = −1)',
    },
    pScoreG,
  );
  const pScoreF0 = svgEl(
    'text',
    {
      x: '0',
      y: '14',
      'text-anchor': 'middle',
      fill: colors.brass,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '18',
      'font-weight': '700',
      textContent: 'f = 0 (Δ = −2)',
    },
    pScoreG,
  );
  const pScoreClean = svgEl(
    'text',
    {
      x: '0',
      y: '14',
      'text-anchor': 'middle',
      fill: colors.sage,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '17.5',
      'font-weight': '700',
      textContent: 'Unlocked: f = 0',
    },
    pScoreG,
  );
  gsap.set([pScoreF1, pScoreF0, pScoreClean], { autoAlpha: 0 });

  // Shelf + 6 bottles [0,1,2,3,4,5] over veiled coasters (Secret: [0, 3, 2, 1, 5, 4] -> initial matches at Slot 0 & Slot 2)
  const PRE_SEC = [0, 3, 2, 1, 5, 4];
  const preX = [205, 379, 553, 727, 901, 1075];

  svgEl(
    'rect',
    {
      x: '115',
      y: '398',
      width: '1050',
      height: '13',
      rx: '5',
      fill: colors.wood,
      stroke: colors.ink,
      'stroke-width': '1.5',
    },
    act2,
  );

  const preBottles = [];
  const preLockBadges = [];
  for (let i = 0; i < 6; i++) {
    act2.appendChild(
      bottles.createSvgCoaster(PRE_SEC[i], {
        x: preX[i],
        y: 396,
        scale: 0.88,
        hidden: true,
        slotIndex: i,
      }),
    );

    const bWrap = svgEl('g', { transform: `translate(${preX[i]}, 394)` }, act2);
    const bInner = svgEl('g', {}, bWrap);
    bInner.appendChild(bottles.createSvgBottle(i, { scale: 0.9 }));
    preBottles.push({ wrap: bWrap, inner: bInner });

    // Lock badge above Slots 0 & 2 (raised cleanly above probe arcs)
    if (i === 0 || i === 2) {
      const lb = bottles.createSvgScrimLabel(i === 0 ? 'Anchor Locked ✓' : 'Match Locked ✓', {
        x: preX[i],
        y: 230,
        fontSize: 12,
        fontFamily: 'mono',
        fontWeight: 700,
        color: '#7A4F09',
        fill: '#FDF3D3',
        stroke: colors.brass,
        strokeWidth: 1.5,
        padX: 11,
        padY: 4,
      });
      gsap.set(lb, { autoAlpha: 0 });
      act2.appendChild(lb);
      preLockBadges[i] = lb;
    }
  }

  // Probe arcs & status banners (one visible at a time at y = 162)
  const probeArc01 = svgEl(
    'path',
    {
      d: `M ${preX[0]} 282 Q ${(preX[0] + preX[1]) / 2} 214 ${preX[1]} 282`,
      fill: 'none',
      stroke: colors.cinnabar,
      'stroke-width': '2.6',
      'stroke-dasharray': '6 4',
      opacity: '0',
    },
    act2,
  );
  const probeArc05 = svgEl(
    'path',
    {
      d: `M ${preX[0]} 282 Q ${(preX[0] + preX[5]) / 2} 168 ${preX[5]} 282`,
      fill: 'none',
      stroke: colors.delft,
      'stroke-width': '2.6',
      'stroke-dasharray': '6 4',
      opacity: '0',
    },
    act2,
  );
  const probeArc02 = svgEl(
    'path',
    {
      d: `M ${preX[0] + 22} 292 Q ${(preX[0] + preX[2]) / 2} 222 ${preX[2] - 22} 292`,
      fill: 'none',
      stroke: colors.brass,
      'stroke-width': '2.8',
      'stroke-dasharray': '6 4',
      opacity: '0',
    },
    act2,
  );

  const preCallout1 = bottles.createSvgScrimLabel('Swap (0 ↔ 1)  →  Score drops 2 → 1  (Δ = −1): one is matched!', {
    x: 640,
    y: 162,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#A93825',
    fill: '#FFF4F2',
    stroke: colors.cinnabar,
    padX: 16,
    padY: 6,
  });
  const preCallout2 = bottles.createSvgScrimLabel('Third-slot probe (0 ↔ 5)  →  Δ = −1 again  ⇒  Slot 0 is Matched Anchor!', {
    x: 640,
    y: 162,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#2B6185',
    fill: '#F1F8FC',
    stroke: colors.delft,
    padX: 16,
    padY: 6,
  });
  const preCallout3 = bottles.createSvgScrimLabel('Anchor probes Slot 2 (0 ↔ 2)  →  Δ = −2  ⇒  Slot 2 Locked! Undo probe.', {
    x: 640,
    y: 162,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#7A4F09',
    fill: '#FDF5DF',
    stroke: colors.brass,
    padX: 16,
    padY: 6,
  });
  const preCallout4 = bottles.createSvgScrimLabel('Remaining 4 Unlocked Bottles Start Clean at Score f = 0 ✓', {
    x: 640,
    y: 162,
    fontSize: 14,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#387257',
    fill: '#F3FBF6',
    stroke: colors.sage,
    strokeWidth: 1.6,
    padX: 18,
    padY: 6,
  });
  gsap.set([preCallout1, preCallout2, preCallout3, preCallout4], { autoAlpha: 0 });
  act2.appendChild(preCallout1);
  act2.appendChild(preCallout2);
  act2.appendChild(preCallout3);
  act2.appendChild(preCallout4);

  const preFooter = bottles.createSvgScrimLabel(
    'Linear O(n) pre-pass isolates every initial match before folding begins',
    {
      x: 640,
      y: 526,
      fontSize: 13,
      fontWeight: 600,
      color: colors.sepia,
      padX: 18,
      padY: 6,
    },
  );
  act2.appendChild(preFooter);

  // =========================================================================
  // ACT 3 (Beats 3–7): THE FOUR-BOTTLE FOLD (RING ON LEFT + 4x4 MATRIX ON RIGHT)
  // =========================================================================
  const act3 = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;',
  });
  gsap.set(act3, { autoAlpha: 0 });
  container.appendChild(act3);

  const act3Defs = svgEl('defs', {}, act3);
  const rotMarker = svgEl(
    'marker',
    { id: 'arr_rot_s4', viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto' },
    act3Defs,
  );
  svgEl('path', { d: 'M 0 1.4 L 9 5 L 0 8.6 z', fill: colors.brass }, rotMarker);

  // Top beat-specific scrim titles (strictly one visible at a time at y = 68)
  const foldTitle3 = bottles.createSvgScrimLabel('4 Unlocked Bottles on a 4-Slot Ring  (Even s = 4)', {
    x: 640,
    y: 68,
    fontSize: 14.5,
    fontWeight: 700,
    color: colors.ink,
    padX: 18,
    padY: 6,
  });
  const foldTitle4 = bottles.createSvgScrimLabel('Why Naive Swaps Waste Moves  ·  Re-Testing Visited Cells', {
    x: 640,
    y: 68,
    fontSize: 14.5,
    fontWeight: 700,
    color: '#A93825',
    fill: '#FFF4F2',
    stroke: 'rgba(196,69,54,0.35)',
    padX: 18,
    padY: 6,
  });
  const foldTitle5 = bottles.createSvgScrimLabel('Move A  ·  Outer–Inner Reflection  (0 ↔ 3  &  1 ↔ 2)', {
    x: 640,
    y: 68,
    fontSize: 14.5,
    fontWeight: 700,
    color: '#A93825',
    fill: '#FFF5F2',
    stroke: colors.terracotta,
    padX: 18,
    padY: 6,
  });
  const foldTitle6 = bottles.createSvgScrimLabel('Move B  ·  Shifted Reflection  (0 ↔ 1  &  2 ↔ 3)  →  +2 mod s', {
    x: 640,
    y: 68,
    fontSize: 14.5,
    fontWeight: 700,
    color: '#2B6185',
    fill: '#F1F8FC',
    stroke: colors.delft,
    padX: 18,
    padY: 6,
  });
  const foldTitle7 = bottles.createSvgScrimLabel('Alternating A → B → A  ·  All 12 Off-Diagonal Pairs in 6 Swaps!', {
    x: 640,
    y: 68,
    fontSize: 14.5,
    fontWeight: 700,
    color: '#387257',
    fill: '#F3FBF6',
    stroke: colors.sage,
    padX: 18,
    padY: 6,
  });
  gsap.set([foldTitle4, foldTitle5, foldTitle6, foldTitle7], { autoAlpha: 0 });
  act3.appendChild(foldTitle3);
  act3.appendChild(foldTitle4);
  act3.appendChild(foldTitle5);
  act3.appendChild(foldTitle6);
  act3.appendChild(foldTitle7);

  // --- LEFT SIDE: 4-SLOT RING (centered at cx = 345, cy = 336) ---
  const ringCx = 345;
  const ringCy = 336;
  const slotPos = [
    { x: 220, y: 244 }, // Slot 0 (top-left)
    { x: 470, y: 244 }, // Slot 1 (top-right)
    { x: 470, y: 428 }, // Slot 2 (bottom-right)
    { x: 220, y: 428 }, // Slot 3 (bottom-left)
  ];

  // Subtle brass circular ring connecting the 4 coaster centers
  svgEl(
    'ellipse',
    {
      cx: String(ringCx),
      cy: String(ringCy),
      rx: '156',
      ry: '116',
      fill: 'none',
      stroke: 'rgba(200, 138, 30, 0.34)',
      'stroke-width': '2.2',
      'stroke-dasharray': '7 6',
    },
    act3,
  );

  // Reflection Axis A (horizontal line at y = 336: mirrors 0<->3 and 1<->2)
  const axisAGroup = svgEl('g', {}, act3);
  gsap.set(axisAGroup, { autoAlpha: 0 });
  svgEl(
    'line',
    {
      x1: '132',
      y1: String(ringCy),
      x2: '558',
      y2: String(ringCy),
      stroke: colors.terracotta,
      'stroke-width': '2.6',
      'stroke-dasharray': '8 5',
    },
    axisAGroup,
  );
  axisAGroup.appendChild(
    bottles.createSvgScrimLabel('Axis A', {
      x: 118,
      y: ringCy,
      fontSize: 12,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#A93825',
      fill: '#FFF5F2',
      stroke: colors.terracotta,
      padX: 10,
      padY: 4,
    }),
  );

  // Reflection Axis B (vertical line at x = 345: mirrors 0<->1 and 2<->3)
  const axisBGroup = svgEl('g', {}, act3);
  gsap.set(axisBGroup, { autoAlpha: 0 });
  svgEl(
    'line',
    {
      x1: String(ringCx),
      y1: '146',
      x2: String(ringCx),
      y2: '496',
      stroke: colors.delft,
      'stroke-width': '2.6',
      'stroke-dasharray': '8 5',
    },
    axisBGroup,
  );
  axisBGroup.appendChild(
    bottles.createSvgScrimLabel('Axis B', {
      x: ringCx,
      y: 132,
      fontSize: 12,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#2B6185',
      fill: '#F1F8FC',
      stroke: colors.delft,
      padX: 10,
      padY: 4,
    }),
  );

  // Dihedral +2 mod s rotation indicator (shown during Beat 6)
  const rotGroup = svgEl('g', {}, act3);
  gsap.set(rotGroup, { autoAlpha: 0 });
  svgEl(
    'path',
    {
      d: 'M 285 212 A 145 102 0 0 1 405 212',
      fill: 'none',
      stroke: colors.brass,
      'stroke-width': '2.4',
      'marker-end': 'url(#arr_rot_s4)',
    },
    rotGroup,
  );
  rotGroup.appendChild(
    bottles.createSvgScrimLabel('B ∘ A = +2 mod s', {
      x: ringCx,
      y: 336,
      fontSize: 12.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#7A4F09',
      fill: '#FDF5DF',
      stroke: colors.brass,
      padX: 12,
      padY: 5,
    }),
  );

  // 4 veiled '?' coasters fixed at the 4 ring slots
  for (let s = 0; s < 4; s++) {
    act3.appendChild(
      bottles.createSvgCoaster(s, {
        x: slotPos[s].x,
        y: slotPos[s].y,
        scale: 0.78,
        hidden: true,
        slotIndex: s,
      }),
    );
  }

  // 4 bottles starting at home slots 0, 1, 2, 3 (outer <g> at home, inner <g> animates!)
  const ringBottles = [];
  for (let b = 0; b < 4; b++) {
    const outer = svgEl('g', { transform: `translate(${slotPos[b].x}, ${slotPos[b].y - 2})` }, act3);
    const inner = svgEl('g', {}, outer);
    inner.appendChild(bottles.createSvgBottle(b, { scale: 0.74 }));
    ringBottles.push({ homeSlot: b, outer, inner });
  }

  // Subtle even-s ring generalization note cleanly below ring (y = 524)
  const ringNote = bottles.createSvgScrimLabel('Generalizes cleanly to any even s-ring (s = 4, 6, 8, …)', {
    x: ringCx,
    y: 524,
    fontSize: 12.5,
    fontWeight: 600,
    color: colors.sepia,
    padX: 14,
    padY: 5,
  });
  gsap.set(ringNote, { autoAlpha: 0 });
  act3.appendChild(ringNote);

  // --- RIGHT SIDE: 4x4 COVERAGE MATRIX ---
  const m4X = 786;
  const m4Y = 166;
  const m4C = 74; // 4 * 74 = 296 (spans x: 786..1082, y: 166..462)

  svgEl(
    'text',
    {
      x: String(m4X + 148),
      y: '122',
      'text-anchor': 'middle',
      fill: colors.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.08em',
      textContent: 'SLOTS (0–3)',
    },
    act3,
  );
  svgEl(
    'text',
    {
      x: '710',
      y: String(m4Y + 148),
      'text-anchor': 'middle',
      fill: colors.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      'letter-spacing': '0.08em',
      transform: `rotate(-90, 710, ${m4Y + 148})`,
      textContent: 'BOTTLES (0–3)',
    },
    act3,
  );

  for (let i = 0; i < 4; i++) {
    svgEl(
      'rect',
      {
        x: String(m4X + i * m4C + m4C / 2 - 20),
        y: '134',
        width: '40',
        height: '22',
        rx: '11',
        fill: '#FBF8F1',
        stroke: 'rgba(107,94,84,0.28)',
        'stroke-width': '1.2',
      },
      act3,
    );
    svgEl(
      'text',
      {
        x: String(m4X + i * m4C + m4C / 2),
        y: '145.5',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: colors.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '12',
        'font-weight': '700',
        textContent: `S${i}`,
      },
      act3,
    );

    svgEl(
      'circle',
      {
        cx: '754',
        cy: String(m4Y + i * m4C + m4C / 2),
        r: '15',
        fill: colors.bottles[i],
        stroke: colors.ink,
        'stroke-width': '1.4',
      },
      act3,
    );
    svgEl(
      'text',
      {
        x: '754',
        y: String(m4Y + i * m4C + m4C / 2 + 0.5),
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: '#FFFBF2',
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '13',
        'font-weight': '700',
        textContent: String(i),
      },
      act3,
    );
  }

  // Matrix cells: row r = Bottle r, col c = Slot c
  const mCells = [];
  for (let r = 0; r < 4; r++) {
    mCells[r] = [];
    for (let c = 0; c < 4; c++) {
      const cx = m4X + c * m4C;
      const cy = m4Y + r * m4C;
      const cg = svgEl('g', { transform: `translate(${cx}, ${cy})` }, act3);

      svgEl(
        'rect',
        {
          x: '3',
          y: '3',
          width: String(m4C - 6),
          height: String(m4C - 6),
          rx: '9',
          fill: '#FBF8F1',
          stroke: 'rgba(107,94,84,0.22)',
          'stroke-width': '1.3',
        },
        cg,
      );

      // Diagonal start fill
      const diagFill = svgEl(
        'g',
        { opacity: '0' },
        cg,
      );
      svgEl(
        'rect',
        {
          x: '3',
          y: '3',
          width: String(m4C - 6),
          height: String(m4C - 6),
          rx: '9',
          fill: '#EAE0CC',
          stroke: '#9E8E7B',
          'stroke-width': '1.6',
        },
        diagFill,
      );
      svgEl(
        'text',
        {
          x: String(m4C / 2),
          y: String(m4C / 2 + 1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: colors.sepia,
          'font-family': "'JetBrains Mono', monospace",
          'font-size': '11.5',
          'font-weight': '700',
          textContent: 'Start',
        },
        diagFill,
      );

      // Naive temporary fill / repeat flash (opaque rose-cream so it cleanly replaces 'Start')
      const naiveFill = svgEl('g', { opacity: '0' }, cg);
      svgEl(
        'rect',
        {
          x: '3',
          y: '3',
          width: String(m4C - 6),
          height: String(m4C - 6),
          rx: '9',
          fill: r === c ? '#FCE2DD' : 'rgba(196, 69, 54, 0.22)',
          stroke: colors.cinnabar,
          'stroke-width': '2.4',
        },
        naiveFill,
      );
      svgEl(
        'text',
        {
          x: String(m4C / 2),
          y: String(m4C / 2 + 1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: '#A93825',
          'font-family': "'JetBrains Mono', monospace",
          'font-size': '11',
          'font-weight': '700',
          textContent: r === c ? 'Repeat!' : 'Swap',
        },
        naiveFill,
      );

      // Fold coverage fill (color-coded by Move A1, Move B1, Move A2)
      let moveColor = colors.terracotta;
      let moveBg = 'rgba(217, 93, 72, 0.2)';
      let moveTag = 'A1';
      const isA1 =
        (r === 3 && c === 0) || (r === 0 && c === 3) || (r === 2 && c === 1) || (r === 1 && c === 2);
      const isB1 =
        (r === 2 && c === 0) || (r === 3 && c === 1) || (r === 0 && c === 2) || (r === 1 && c === 3);
      const isA2 =
        (r === 1 && c === 0) || (r === 2 && c === 3) || (r === 0 && c === 1) || (r === 3 && c === 2);
      if (isB1) {
        moveColor = colors.delft;
        moveBg = 'rgba(61, 126, 166, 0.2)';
        moveTag = 'B1';
      } else if (isA2) {
        moveColor = colors.sage;
        moveBg = 'rgba(78, 140, 111, 0.22)';
        moveTag = 'A2';
      } else if (!isA1) {
        moveTag = '';
      }

      const foldFill = svgEl('g', { opacity: '0' }, cg);
      svgEl(
        'rect',
        {
          x: '3',
          y: '3',
          width: String(m4C - 6),
          height: String(m4C - 6),
          rx: '9',
          fill: moveBg,
          stroke: moveColor,
          'stroke-width': '2.2',
        },
        foldFill,
      );
      svgEl(
        'text',
        {
          x: String(m4C / 2),
          y: String(m4C / 2 + 1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: moveColor,
          'font-family': "'JetBrains Mono', monospace",
          'font-size': '13.5',
          'font-weight': '700',
          textContent: moveTag,
        },
        foldFill,
      );

      mCells[r][c] = { diagFill, naiveFill, foldFill };
    }
  }

  // Matrix progress pills (cleanly below 4x4 matrix at y = 524, strictly one visible at a time)
  const statPills = [
    bottles.createSvgScrimLabel('Swaps: 0  ·  Off-Diagonal: 0 / 12  ·  Repeats: 0', {
      x: m4X + 148,
      y: 524,
      fontSize: 12.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: colors.sepia,
      padX: 14,
      padY: 5,
    }),
    bottles.createSvgScrimLabel('Naive bounce: Repeat! (+0 info → log n factor)', {
      x: m4X + 148,
      y: 524,
      fontSize: 12.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#A93825',
      fill: '#FFF4F2',
      stroke: colors.cinnabar,
      padX: 14,
      padY: 5,
    }),
    bottles.createSvgScrimLabel('Move A: 2 Swaps  ·  4 / 12 Fresh  ·  0 Repeats', {
      x: m4X + 148,
      y: 524,
      fontSize: 12.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#A93825',
      fill: '#FFF5F2',
      stroke: colors.terracotta,
      padX: 14,
      padY: 5,
    }),
    bottles.createSvgScrimLabel('Move B: 4 Swaps  ·  8 / 12 Fresh  ·  0 Repeats', {
      x: m4X + 148,
      y: 524,
      fontSize: 12.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#2B6185',
      fill: '#F1F8FC',
      stroke: colors.delft,
      padX: 14,
      padY: 5,
    }),
    bottles.createSvgScrimLabel('6 Swaps  ·  12 / 12 Covered  ·  0 Repeats ✓', {
      x: m4X + 148,
      y: 524,
      fontSize: 13,
      fontFamily: 'mono',
      fontWeight: 700,
      color: '#387257',
      fill: '#F3FBF6',
      stroke: colors.sage,
      strokeWidth: 1.6,
      padX: 16,
      padY: 6,
    }),
  ];
  statPills.forEach((p, idx) => {
    if (idx > 0) gsap.set(p, { autoAlpha: 0 });
    act3.appendChild(p);
  });

  // Helper to animate Bottle `bIdx` cleanly to Slot `targetSlot` using absolute offset from its home slot!
  function moveRingBottle(tl, bIdx, targetSlot, atTime, dur = 0.9, bowX = 0, bowY = 0) {
    const rb = ringBottles[bIdx];
    const destX = slotPos[targetSlot].x - slotPos[rb.homeSlot].x;
    const destY = slotPos[targetSlot].y - slotPos[rb.homeSlot].y;

    if (bowX !== 0 || bowY !== 0) {
      // Smooth two-half curved motion using absolute keyframe midpoint (100% scrub-safe!)
      const startSlot = rb._curSlot ?? rb.homeSlot;
      const startX = slotPos[startSlot].x - slotPos[rb.homeSlot].x;
      const startY = slotPos[startSlot].y - slotPos[rb.homeSlot].y;
      const midX = (startX + destX) / 2 + bowX;
      const midY = (startY + destY) / 2 + bowY;
      tl.to(rb.inner, { x: midX, y: midY, duration: dur * 0.5, ease: 'power1.out' }, atTime);
      tl.to(rb.inner, { x: destX, y: destY, duration: dur * 0.5, ease: 'power1.in' }, atTime + dur * 0.5);
    } else {
      tl.to(rb.inner, { x: destX, y: destY, duration: dur, ease: 'power2.inOut' }, atTime);
    }
    rb._curSlot = targetSlot;
  }

  // =========================================================================
  // TIMELINE CHOREOGRAPHY
  // =========================================================================
  const b0 = beatSpan(ctx, 0, 0.8, 8.112);
  const b1 = beatSpan(ctx, 1, 9.462, 13.104);
  const b2 = beatSpan(ctx, 2, 23.116, 13.488);
  const b3 = beatSpan(ctx, 3, 37.154, 8.736);
  const b4 = beatSpan(ctx, 4, 46.44, 11.304);
  const b5 = beatSpan(ctx, 5, 58.294, 12.864);
  const b6 = beatSpan(ctx, 6, 71.708, 12.888);
  const b7 = beatSpan(ctx, 7, 85.146, 12.72);

  const tl = gsap.timeline({ paused: true });

  // Beat 0: Blueprint pillars enter
  tl.from(pillarEls, { y: 18, opacity: 0, duration: 0.55, stagger: 0.22, ease: 'power2.out' }, b0.start + 0.3);

  // Beat 1: Cross-fade to Pre-Pass (6 bottles, swap 0<->1 drops score 2 -> 1)
  tl.to(act1, { autoAlpha: 0, duration: 0.4 }, b1.start);
  tl.to(act2, { autoAlpha: 1, duration: 0.45 }, b1.start + 0.42);

  const dx01 = preX[1] - preX[0];
  const preSwap1T = b1.start + 4.4;
  tl.to(probeArc01, { opacity: 1, duration: 0.4 }, preSwap1T - 0.35);
  tl.to(preBottles[0].inner, { x: dx01, duration: 1.0, ease: 'power2.inOut' }, preSwap1T);
  tl.to(preBottles[0].inner, { y: -36, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, preSwap1T);
  tl.to(preBottles[1].inner, { x: -dx01, duration: 1.0, ease: 'power2.inOut' }, preSwap1T);
  tl.to(preBottles[1].inner, { y: -18, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, preSwap1T);
  tl.to(pScoreF2, { autoAlpha: 0, duration: 0.2 }, preSwap1T + 1.0);
  tl.to(pScoreF1, { autoAlpha: 1, duration: 0.25 }, preSwap1T + 1.1);
  tl.to(preCallout1, { autoAlpha: 1, duration: 0.45 }, preSwap1T + 1.15);

  // Beat 2: Undo (0<->1), third-slot probe (0<->5) -> anchor Slot 0, probe (0<->2) -> Δ=-2 locks Slot 2!
  const b2Undo1T = b2.start + 0.4;
  tl.to([probeArc01, preCallout1], { autoAlpha: 0, duration: 0.3 }, b2Undo1T);
  tl.to([preBottles[0].inner, preBottles[1].inner], { x: 0, duration: 0.65, ease: 'power2.inOut' }, b2Undo1T);
  tl.to(pScoreF1, { autoAlpha: 0, duration: 0.2 }, b2Undo1T + 0.5);
  tl.to(pScoreF2, { autoAlpha: 1, duration: 0.2 }, b2Undo1T + 0.6);

  // Third-slot probe (0 <-> 5)
  const dx05 = preX[5] - preX[0];
  const probe5T = b2.start + 1.8;
  tl.to(probeArc05, { opacity: 1, duration: 0.35 }, probe5T - 0.25);
  tl.to(preBottles[0].inner, { x: dx05, duration: 0.85, ease: 'power2.inOut' }, probe5T);
  tl.to(preBottles[5].inner, { x: -dx05, duration: 0.85, ease: 'power2.inOut' }, probe5T);
  tl.to(pScoreF2, { autoAlpha: 0, duration: 0.2 }, probe5T + 0.85);
  tl.to(pScoreF1, { autoAlpha: 1, duration: 0.2 }, probe5T + 0.95);
  tl.to(preCallout2, { autoAlpha: 1, duration: 0.4 }, probe5T + 0.95);

  // Undo (0 <-> 5) & lock Anchor Slot 0
  const undo5T = b2.start + 4.4;
  tl.to([probeArc05, preCallout2], { autoAlpha: 0, duration: 0.3 }, undo5T);
  tl.to([preBottles[0].inner, preBottles[5].inner], { x: 0, duration: 0.7, ease: 'power2.inOut' }, undo5T);
  tl.to(pScoreF1, { autoAlpha: 0, duration: 0.2 }, undo5T + 0.5);
  tl.to(pScoreF2, { autoAlpha: 1, duration: 0.2 }, undo5T + 0.6);
  tl.to(preLockBadges[0], { autoAlpha: 1, duration: 0.4 }, undo5T + 0.65);

  // Anchor Slot 0 probes Slot 2 -> score plunges f = 2 -> 0 (Δ = -2)!
  const dx02 = preX[2] - preX[0];
  const probe2T = b2.start + 6.4;
  tl.to(probeArc02, { opacity: 1, duration: 0.35 }, probe2T - 0.25);
  tl.to(preBottles[0].inner, { x: dx02, duration: 0.85, ease: 'power2.inOut' }, probe2T);
  tl.to(preBottles[2].inner, { x: -dx02, duration: 0.85, ease: 'power2.inOut' }, probe2T);
  tl.to(pScoreF2, { autoAlpha: 0, duration: 0.2 }, probe2T + 0.85);
  tl.to(pScoreF0, { autoAlpha: 1, duration: 0.25 }, probe2T + 0.95);
  tl.to(preCallout3, { autoAlpha: 1, duration: 0.4 }, probe2T + 0.95);

  // Undo (0 <-> 2), lock Slot 2, dim locked slots -> clean 4 unlocked bottles at f = 0
  const undo2T = b2.start + 9.4;
  tl.to([probeArc02, preCallout3], { autoAlpha: 0, duration: 0.3 }, undo2T);
  tl.to([preBottles[0].inner, preBottles[2].inner], { x: 0, duration: 0.7, ease: 'power2.inOut' }, undo2T);
  tl.to(preLockBadges[2], { autoAlpha: 1, duration: 0.4 }, undo2T + 0.6);
  tl.to([preBottles[0].wrap, preBottles[2].wrap], { opacity: 0.38, duration: 0.5 }, undo2T + 1.0);
  tl.to(pScoreF0, { autoAlpha: 0, duration: 0.2 }, undo2T + 1.0);
  tl.to(pScoreClean, { autoAlpha: 1, duration: 0.3 }, undo2T + 1.1);
  tl.to(preCallout4, { autoAlpha: 1, duration: 0.45 }, undo2T + 1.1);

  // Beat 3: Cross-fade to Four-Bottle Fold (4-ring + empty 4x4 matrix)
  tl.to(act2, { autoAlpha: 0, duration: 0.4 }, b3.start);
  tl.to(act3, { autoAlpha: 1, duration: 0.5 }, b3.start + 0.42);

  // Beat 4: Diagonal filled + naive swap repeat demo -> clean reset
  tl.to(foldTitle3, { autoAlpha: 0, duration: 0.3 }, b4.start);
  tl.to(foldTitle4, { autoAlpha: 1, duration: 0.35 }, b4.start + 0.3);
  for (let i = 0; i < 4; i++) {
    tl.to(mCells[i][i].diagFill, { opacity: 1, duration: 0.35 }, b4.start + 0.7 + i * 0.14);
  }
  // Naive swap 0 <-> 1
  const nSwap1T = b4.start + 3.4;
  moveRingBottle(tl, 0, 1, nSwap1T, 0.85, 0, -24);
  moveRingBottle(tl, 1, 0, nSwap1T, 0.85, 0, 24);
  tl.to([mCells[0][1].naiveFill, mCells[1][0].naiveFill], { opacity: 0.75, duration: 0.35 }, nSwap1T + 0.75);

  // Naive bounce back 0 <-> 1 -> Repeat! on (0,0) and (1,1) (hide 'Start' text cleanly!)
  const nSwap2T = b4.start + 5.6;
  moveRingBottle(tl, 0, 0, nSwap2T, 0.85, 0, -24);
  moveRingBottle(tl, 1, 1, nSwap2T, 0.85, 0, 24);
  tl.to([mCells[0][0].diagFill, mCells[1][1].diagFill], { autoAlpha: 0, duration: 0.2 }, nSwap2T + 0.65);
  tl.to([mCells[0][0].naiveFill, mCells[1][1].naiveFill], { opacity: 1, duration: 0.35 }, nSwap2T + 0.7);
  tl.to(statPills[0], { autoAlpha: 0, duration: 0.25 }, nSwap2T + 0.65);
  tl.to(statPills[1], { autoAlpha: 1, duration: 0.35 }, nSwap2T + 0.85);

  // Clear naive flashes cleanly & restore 'Start' labels before Beat 5
  tl.to(
    [mCells[0][1].naiveFill, mCells[1][0].naiveFill, mCells[0][0].naiveFill, mCells[1][1].naiveFill],
    { opacity: 0, duration: 0.3 },
    b5.start - 0.35,
  );
  tl.to([mCells[0][0].diagFill, mCells[1][1].diagFill], { autoAlpha: 1, duration: 0.3 }, b5.start - 0.2);

  // Beat 5: MOVE A — Horizontal Axis A (0 <-> 3, then 1 <-> 2) -> [3, 2, 1, 0]
  tl.to(foldTitle4, { autoAlpha: 0, duration: 0.3 }, b5.start);
  tl.to(foldTitle5, { autoAlpha: 1, duration: 0.35 }, b5.start + 0.3);
  tl.to(axisAGroup, { autoAlpha: 1, duration: 0.45 }, b5.start + 0.6);

  // Swap 1: Slot 0 (B0) <-> Slot 3 (B3) -> lights (3,0) and (0,3)
  const sw1T = b5.start + 2.6;
  moveRingBottle(tl, 0, 3, sw1T, 1.05, -34, 0);
  moveRingBottle(tl, 3, 0, sw1T, 1.05, 34, 0);
  tl.to([mCells[3][0].foldFill, mCells[0][3].foldFill], { opacity: 1, duration: 0.45 }, sw1T + 0.9);

  // Swap 2: Slot 1 (B1) <-> Slot 2 (B2) -> lights (2,1) and (1,2)
  const sw2T = b5.start + 5.6;
  moveRingBottle(tl, 1, 2, sw2T, 1.05, 34, 0);
  moveRingBottle(tl, 2, 1, sw2T, 1.05, -34, 0);
  tl.to([mCells[2][1].foldFill, mCells[1][2].foldFill], { opacity: 1, duration: 0.45 }, sw2T + 0.9);

  tl.to(statPills[1], { autoAlpha: 0, duration: 0.25 }, sw2T + 0.85);
  tl.to(statPills[2], { autoAlpha: 1, duration: 0.35 }, sw2T + 1.05);

  // Beat 6: MOVE B — Vertical Axis B (0 <-> 1, then 2 <-> 3) -> [2, 3, 0, 1] (+2 mod s!)
  tl.to(foldTitle5, { autoAlpha: 0, duration: 0.3 }, b6.start);
  tl.to(foldTitle6, { autoAlpha: 1, duration: 0.35 }, b6.start + 0.3);
  tl.to(axisAGroup, { autoAlpha: 0.18, duration: 0.4 }, b6.start + 0.3);
  tl.to(axisBGroup, { autoAlpha: 1, duration: 0.45 }, b6.start + 0.6);

  // Swap 3: Slot 0 (B3) <-> Slot 1 (B2) -> lights (2,0) and (3,1)
  const sw3T = b6.start + 2.4;
  moveRingBottle(tl, 3, 1, sw3T, 1.05, 0, -28);
  moveRingBottle(tl, 2, 0, sw3T, 1.05, 0, 28);
  tl.to([mCells[2][0].foldFill, mCells[3][1].foldFill], { opacity: 1, duration: 0.45 }, sw3T + 0.9);

  // Swap 4: Slot 2 (B1) <-> Slot 3 (B0) -> lights (0,2) and (1,3)
  const sw4T = b6.start + 5.2;
  moveRingBottle(tl, 1, 3, sw4T, 1.05, 0, 28);
  moveRingBottle(tl, 0, 2, sw4T, 1.05, 0, -28);
  tl.to([mCells[0][2].foldFill, mCells[1][3].foldFill], { opacity: 1, duration: 0.45 }, sw4T + 0.9);

  tl.to(statPills[2], { autoAlpha: 0, duration: 0.25 }, sw4T + 0.85);
  tl.to(statPills[3], { autoAlpha: 1, duration: 0.35 }, sw4T + 1.05);
  tl.to([rotGroup, ringNote], { autoAlpha: 1, duration: 0.5 }, sw4T + 1.4);

  // Beat 7: FINAL MOVE A (0 <-> 3, then 1 <-> 2) -> [1, 0, 3, 2] -> 12/12 Covered, 0 Repeats!
  tl.to(foldTitle6, { autoAlpha: 0, duration: 0.3 }, b7.start);
  tl.to(foldTitle7, { autoAlpha: 1, duration: 0.35 }, b7.start + 0.3);
  tl.to(axisBGroup, { autoAlpha: 0.16, duration: 0.4 }, b7.start + 0.3);
  tl.to(rotGroup, { autoAlpha: 0, duration: 0.3 }, b7.start + 0.25);
  tl.to(axisAGroup, { autoAlpha: 1, duration: 0.45 }, b7.start + 0.5);

  // Swap 5: Slot 0 (B2) <-> Slot 3 (B1) -> lights (1,0) and (2,3)
  const sw5T = b7.start + 1.8;
  moveRingBottle(tl, 2, 3, sw5T, 1.0, -34, 0);
  moveRingBottle(tl, 1, 0, sw5T, 1.0, 34, 0);
  tl.to([mCells[1][0].foldFill, mCells[2][3].foldFill], { opacity: 1, duration: 0.45 }, sw5T + 0.85);

  // Swap 6: Slot 1 (B3) <-> Slot 2 (B0) -> lights (0,1) and (3,2)
  const sw6T = b7.start + 4.4;
  moveRingBottle(tl, 3, 2, sw6T, 1.0, 34, 0);
  moveRingBottle(tl, 0, 1, sw6T, 1.0, -34, 0);
  tl.to([mCells[0][1].foldFill, mCells[3][2].foldFill], { opacity: 1, duration: 0.45 }, sw6T + 0.85);

  tl.to(statPills[3], { autoAlpha: 0, duration: 0.25 }, sw6T + 0.85);
  tl.to(statPills[4], { autoAlpha: 1, duration: 0.45 }, sw6T + 1.05);

  const totalDur = Math.max(ctx.duration || sceneMeta.duration, tl.duration() + 0.2);
  if (tl.duration() < totalDur) {
    tl.to({}, { duration: totalDur - tl.duration() }, tl.duration());
  }

  return { timeline: tl, destroy() {} };
}
