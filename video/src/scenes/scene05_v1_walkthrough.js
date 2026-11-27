// Chapter 05: Live Walkthrough: Trapping the Adversary
// Act 1: Live 4-bottle execution on [0,1,2,3] over veiled '?' coasters (secret [3,2,0,1]),
//        probe isolation, locking Bottle 3, finishing to 4/4, coaster reveal & adversary trap.
// Act 2: Scaling to general n with b x b fold sweeps, spare replacements, integral 1/4 n^2,
//        b ~ sqrt(n) O(n^(3/2)) overhead, and shuffled columns hitting 1/8 n^2.

export const sceneMeta = {
  id: 'scene5',
  number: 5,
  title: 'Live Walkthrough: Trapping the Adversary',
  chapter: 'Part I · Live Execution',
  duration: 123.35,
  beats: [
    {
      id: 's5_b0',
      start: 0.8,
      audioDuration: 12.31,
      end: 13.66,
      text: 'Watch our algorithm run live on bottles [0, 1, 2, 3] over four veiled coasters—secretly [3, 2, 0, 1]—starting at score 0.',
      highlight: ['bottles [0, 1, 2, 3]', 'secretly [3, 2, 0, 1]', 'score 0'],
      cue: null,
    },
    {
      id: 's5_b1',
      start: 13.66,
      audioDuration: 11.09,
      end: 25.3,
      text: "Begin Move A by swapping Slots 0 and 3. Bottles become [3, 1, 2, 0], and the referee's score jumps from 0 to 1.",
      highlight: ['swapping Slots 0 and 3', 'jumps from 0 to 1'],
      cue: 'clink',
    },
    {
      id: 's5_b2',
      start: 25.3,
      audioDuration: 12.36,
      end: 38.21,
      text: 'Either Bottle 3 or Bottle 0 matched. Probe Slot 0 against idle Slot 1—known unmatched at score 0: score drops, proving Bottle 3 matched.',
      highlight: ['Probe Slot 0 against idle Slot 1', 'proving Bottle 3 matched'],
      cue: 'bell',
    },
    {
      id: 's5_b3',
      start: 38.21,
      audioDuration: 10.44,
      end: 49.2,
      text: 'Undo that probe and lock Bottle 3 on Slot 0, leaving three unlocked bottles—1, 2, 0—over hidden coasters [2, 0, 1].',
      highlight: ['lock Bottle 3 on Slot 0', 'three unlocked bottles'],
      cue: 'lock',
    },
    {
      id: 's5_b4',
      start: 49.2,
      audioDuration: 9.43,
      end: 59.18,
      text: 'Swap Slots 1 and 2 for score 2, then 2 and 3: here all four match, while a score drop would expose Slot 2 instead.',
      highlight: ['Swap Slots 1 and 2', 'all four match'],
      cue: 'clink',
    },
    {
      id: 's5_b5',
      start: 59.18,
      audioDuration: 10.46,
      end: 70.2,
      text: 'Flip the coasters face-up: [3, 2, 0, 1]. Every cycle is broken and no other coaster order fits our scores—the adversary is trapped.',
      highlight: ['[3, 2, 0, 1]', 'adversary is trapped'],
      cue: 'bell',
    },
    {
      id: 's5_b6',
      start: 70.2,
      audioDuration: 11.11,
      end: 81.86,
      text: 'Now scale to n bottles. One giant n×n fold wastes 1/2 n² swaps, testing the full grid instead of shrinking as bottles lock.',
      highlight: ['giant n×n fold', 'wastes 1/2 n² swaps'],
      cue: 'whoosh',
    },
    {
      id: 's5_b7',
      start: 81.86,
      audioDuration: 11.71,
      end: 94.12,
      text: 'Instead, sweep b bottles across all m unlocked slots in b×b folds, swapping in untested spares on locks—forcing all b bottles to lock and shrinking m.',
      highlight: ['b×b folds', 'untested spares', 'shrinking m'],
      cue: null,
    },
    {
      id: 's5_b8',
      start: 94.12,
      audioDuration: 14.59,
      end: 109.26,
      text: 'Each sweep takes mb/2 swaps—m/2 per bottle—integrating to 1/4 n²; b near √n balances setup and spare costs at O(n^{3/2}).',
      highlight: ['1/4 n²', 'b near √n', 'O(n^{3/2})'],
      cue: 'lock',
    },
    {
      id: 's5_b9',
      start: 109.26,
      audioDuration: 12.89,
      end: 123.35,
      text: 'Shuffle the unlocked slot order per batch and every bottle locks halfway through on average, hitting 1/8 n²—closing FUN 2026! Now unlock Game 2.',
      highlight: ['Shuffle the unlocked slot order', '1/8 n²', 'closing FUN 2026'],
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
  const totalDur = Math.max(ctx.duration || sceneMeta.duration, 123.35);

  const b0 = beatAt(beats, 0, 0.8, 12.31);
  const b1 = beatAt(beats, 1, 13.66, 11.09);
  const b2 = beatAt(beats, 2, 25.3, 12.36);
  const b3 = beatAt(beats, 3, 38.21, 10.44);
  const b4 = beatAt(beats, 4, 49.2, 9.43);
  const b5 = beatAt(beats, 5, 59.18, 10.46);
  const b6 = beatAt(beats, 6, 70.2, 11.11);
  const b7 = beatAt(beats, 7, 81.86, 11.71);
  const b8 = beatAt(beats, 8, 94.12, 14.59);
  const b9 = beatAt(beats, 9, 109.26, 12.89);

  rootEl.innerHTML = '';

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:absolute;inset:0;width:1280px;height:590px;pointer-events:none;overflow:hidden;';
  rootEl.appendChild(stage);

  const svg = createSvg(1280, 590, {
    style: { position: 'absolute', left: '0', top: '0', width: '1280px', height: '590px', overflow: 'visible' },
  });
  stage.appendChild(svg);

  // Shared gradients & markers
  const defs = svgEl('defs', {}, svg);

  const shelfGrad = svgEl('linearGradient', { id: 's5_shelf', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#D6AA78' }, shelfGrad);
  svgEl('stop', { offset: '55%', 'stop-color': '#B98755' }, shelfGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#8A5E37' }, shelfGrad);

  const goldGrad = svgEl('linearGradient', { id: 's5_gold', x1: '0%', y1: '0%', x2: '100%', y2: '100%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#F3D180' }, goldGrad);
  svgEl('stop', { offset: '55%', 'stop-color': '#C88A1E' }, goldGrad);
  svgEl('stop', { offset: '100%', 'stop-color': '#9E6811' }, goldGrad);

  const warmHalo = svgEl('radialGradient', { id: 's5_halo', cx: '50%', cy: '50%', r: '50%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': '#F5DFB0', 'stop-opacity': '0.46' }, warmHalo);
  svgEl('stop', { offset: '100%', 'stop-color': '#F5DFB0', 'stop-opacity': '0' }, warmHalo);

  const makeArrowMarker = (id, color) => {
    const m = svgEl(
      'marker',
      { id, viewBox: '0 0 10 10', refX: '8', refY: '5', markerWidth: '6.5', markerHeight: '6.5', orient: 'auto-start-reverse' },
      defs,
    );
    svgEl('path', { d: 'M 1 1.5 L 8.5 5 L 1 8.5 Z', fill: color }, m);
  };
  makeArrowMarker('s5_arr_brass', P.brass);
  makeArrowMarker('s5_arr_delft', P.delft);
  makeArrowMarker('s5_arr_sage', P.sage);
  makeArrowMarker('s5_arr_red', P.cinnabar);

  // HTML math overlay layer (for crisp KaTeX in Act 2)
  const htmlLayer = document.createElement('div');
  htmlLayer.style.cssText = 'position:absolute;inset:0;width:1280px;height:590px;pointer-events:none;';
  stage.appendChild(htmlLayer);

  // =========================================================================
  // ACT 1: LIVE 4-BOTTLE EXECUTION (b0 .. b5)
  // =========================================================================
  const act1G = svgEl('g', { class: 's5-act1' }, svg);

  // Warm sunlit backdrop behind tabletop
  svgEl('ellipse', { cx: '490', cy: '285', rx: '390', ry: '170', fill: 'url(#s5_halo)' }, act1G);

  // Top phase pill (strictly y >= 62, clear of top-left whisper)
  const phasePills = [];
  const phaseTexts = [
    'Live Execution · Secret Coasters Veiled',
    'Move A · Swap Slot 0 ↔ Slot 3',
    'Probe · Slot 0 ↔ Idle Slot 1 (Known Unmatched)',
    'Undo Probe & Lock Bottle 3 on Slot 0',
    'Finish Remaining 3 Bottles → Score 4 / 4',
    'Reveal Coasters · Adversary Trapped',
  ];
  const phaseColors = [P.sepia, P.brass, P.delft, P.brass, P.sage, P.cinnabar];
  phaseTexts.forEach((txt, idx) => {
    const pill = bottles.createSvgScrimLabel(txt, {
      x: 495,
      y: 66,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: phaseColors[idx],
      stroke: phaseColors[idx],
      strokeWidth: 1.15,
      padX: 16,
      padY: 6,
    });
    gsap.set(pill, { autoAlpha: idx === 0 ? 1 : 0 });
    act1G.appendChild(pill);
    phasePills.push(pill);
  });

  // Oak apothecary shelf
  const shelfG = svgEl('g', {}, act1G);
  svgEl('rect', { x: '132', y: '342', width: '726', height: '16', rx: '8', fill: '#4A3828', opacity: '0.11' }, shelfG);
  svgEl(
    'rect',
    {
      x: '116',
      y: '324',
      width: '758',
      height: '20',
      rx: '5',
      fill: 'url(#s5_shelf)',
      stroke: P.ink,
      'stroke-width': '1.8',
    },
    shelfG,
  );
  svgEl(
    'line',
    { x1: '126', y1: '327.5', x2: '864', y2: '327.5', stroke: '#EED4AE', 'stroke-width': '1.5', opacity: '0.72' },
    shelfG,
  );

  // 4 Slots & Coasters (Secret: [3, 2, 0, 1])
  const SECRET = [3, 2, 0, 1];
  const SLOT_X = [240, 410, 580, 750];
  const SEAT_Y = 322;

  const coasters = [];
  const lockRings = [];
  const candHalos = [];
  const slotMatchGlows = [];

  for (let i = 0; i < 4; i++) {
    const cx = SLOT_X[i];

    // Golden lock laurel ring around slot (shown when locked/matched)
    const glow = svgEl(
      'ellipse',
      {
        cx: String(cx),
        cy: String(SEAT_Y - 56),
        rx: '48',
        ry: '72',
        fill: 'url(#s5_halo)',
        opacity: '0',
      },
      act1G,
    );
    slotMatchGlows.push(glow);

    // Coaster starts hidden ('?' Player View)
    const coaster = bottles.createSvgCoaster(SECRET[i], {
      x: cx,
      y: SEAT_Y,
      width: 84,
      scale: 1.0,
      hidden: true,
      slotIndex: i,
    });
    act1G.appendChild(coaster);
    coasters.push(coaster);

    // Candidate question badge above slot (for b2)
    const candG = svgEl('g', { transform: `translate(${cx}, 152)` }, act1G);
    const candInner = svgEl('g', {}, candG);
    svgEl(
      'circle',
      { cx: '0', cy: '0', r: '18', fill: '#FDF1D0', stroke: P.brass, 'stroke-width': '2', 'stroke-dasharray': '4 2.5' },
      candInner,
    );
    svgEl(
      'text',
      {
        x: '0',
        y: '1',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: '#8C5B0A',
        'font-family': "'Fraunces', Georgia, serif",
        'font-size': '18',
        'font-weight': '700',
        textContent: '?',
      },
      candInner,
    );
    gsap.set(candInner, { autoAlpha: 0, scale: 0.7, transformOrigin: '0px 0px' });
    candHalos.push(candInner);

    // Brass lock plaque for slot (used on Slot 0 in b3 and all slots in b4)
    const lockG = svgEl('g', { transform: `translate(${cx}, 148)` }, act1G);
    const lockInner = svgEl('g', {}, lockG);
    svgEl(
      'rect',
      {
        x: '-38',
        y: '-14',
        width: '76',
        height: '28',
        rx: '14',
        fill: '#FDF1D0',
        stroke: P.brass,
        'stroke-width': '1.8',
      },
      lockInner,
    );
    // Tiny brass padlock icon
    svgEl(
      'path',
      {
        d: 'M -25 -2 L -25 -6 A 4.5 4.5 0 0 1 -16 -6 L -16 -2',
        fill: 'none',
        stroke: '#8C5B0A',
        'stroke-width': '1.7',
      },
      lockInner,
    );
    svgEl('rect', { x: '-27', y: '-2', width: '13', height: '9.5', rx: '2', fill: P.brass, stroke: P.ink, 'stroke-width': '1.1' }, lockInner);
    svgEl(
      'text',
      {
        x: '10',
        y: '0.5',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: '#7A4F09',
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '10.5',
        'font-weight': '700',
        textContent: 'LOCK',
      },
      lockInner,
    );
    gsap.set(lockInner, { autoAlpha: 0, scale: 0.75, transformOrigin: '0px 0px' });
    lockRings.push(lockInner);
  }

  // 4 Labeled Bottles [0, 1, 2, 3], each inside moverG (x) -> liftG (y) for clean scrubbing!
  const bottleMovers = [];
  const bottleLifts = [];
  const bottleNodes = [];
  const liqLevels = [0.72, 0.64, 0.76, 0.68];

  for (let id = 0; id < 4; id++) {
    const mover = svgEl('g', { class: `s5-bottle-mover-${id}` }, act1G);
    const lift = svgEl('g', { class: `s5-bottle-lift-${id}` }, mover);
    const bNode = bottles.createSvgBottle(id, {
      x: 0,
      y: 0,
      scale: 1.08,
      liquidLevel: liqLevels[id],
    });
    lift.appendChild(bNode);
    gsap.set(mover, { x: SLOT_X[id], y: SEAT_Y - 1 });
    gsap.set(lift, { y: 0 });
    bottleMovers.push(mover);
    bottleLifts.push(lift);
    bottleNodes.push(bNode);
  }

  // Helper: smoothly swap two bottle IDs between two slot positions with deterministic arc
  const slotOwner = [0, 1, 2, 3]; // slotIndex -> bottleId currently standing there
  function animateSwap(tl, sA, sB, startTime, dur = 1.15) {
    const idA = slotOwner[sA];
    const idB = slotOwner[sB];
    const xA = SLOT_X[sA];
    const xB = SLOT_X[sB];
    const moverA = bottleMovers[idA];
    const moverB = bottleMovers[idB];
    const liftA = bottleLifts[idA];
    const liftB = bottleLifts[idB];

    // Swap logical owners
    slotOwner[sA] = idB;
    slotOwner[sB] = idA;

    const half = dur * 0.5;
    tl.to(moverA, { x: xB, duration: dur, ease: 'power2.inOut', immediateRender: false }, startTime);
    tl.to(moverB, { x: xA, duration: dur, ease: 'power2.inOut', immediateRender: false }, startTime);

    tl.to(liftA, { y: -62, duration: half, ease: 'power2.out', immediateRender: false }, startTime);
    tl.to(liftA, { y: 0, duration: half, ease: 'bounce.out', immediateRender: false }, startTime + half);

    tl.to(liftB, { y: -32, duration: half, ease: 'power2.out', immediateRender: false }, startTime);
    tl.to(liftB, { y: 0, duration: half, ease: 'power2.in', immediateRender: false }, startTime + half);
  }

  // Swap arc helpers
  function createSwapArc(sA, sB, labelText, color, arcHeight = 128) {
    const x1 = SLOT_X[sA];
    const x2 = SLOT_X[sB];
    const midX = (x1 + x2) / 2;
    const baseY = 188;
    const g = svgEl('g', {}, act1G);
    svgEl(
      'path',
      {
        d: `M ${x1} ${baseY} Q ${midX} ${arcHeight} ${x2} ${baseY}`,
        fill: 'none',
        stroke: color,
        'stroke-width': '2.4',
        'stroke-dasharray': '6 4',
        'marker-start': `url(#${color === P.delft ? 's5_arr_delft' : color === P.sage ? 's5_arr_sage' : 's5_arr_brass'})`,
        'marker-end': `url(#${color === P.delft ? 's5_arr_delft' : color === P.sage ? 's5_arr_sage' : 's5_arr_brass'})`,
      },
      g,
    );
    const lbl = bottles.createSvgScrimLabel(labelText, {
      x: midX,
      y: (baseY + arcHeight) / 2 - 14,
      fontSize: 12.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color,
      stroke: color,
      padX: 11,
      padY: 4,
    });
    g.appendChild(lbl);
    gsap.set(g, { autoAlpha: 0 });
    return g;
  }

  const arc03 = createSwapArc(0, 3, 'Move A: Swap Slot 0 ↔ Slot 3', P.brass, 98);
  const arc01 = createSwapArc(0, 1, 'Probe: Slot 0 ↔ Idle Slot 1', P.delft, 118);
  const arcUndo = createSwapArc(0, 1, 'Undo Probe → Lock B3', P.brass, 118);
  const arc12 = createSwapArc(1, 2, 'Swap Slot 1 ↔ Slot 2', P.brass, 122);
  const arc23 = createSwapArc(2, 3, 'Swap Slot 2 ↔ Slot 3', P.sage, 122);

  // "Idle Slot 1: known unmatched" callout badge during b2
  const idleTag = bottles.createSvgScrimLabel('Idle · Known Unmatched', {
    x: SLOT_X[1],
    y: 404,
    fontSize: 11.5,
    fontFamily: 'mono',
    fontWeight: 600,
    color: P.delft,
    stroke: P.delft,
    padX: 10,
    padY: 4,
  });
  gsap.set(idleTag, { autoAlpha: 0 });
  act1G.appendChild(idleTag);

  // Proof badge after probe drop in b2
  const proofTag = bottles.createSvgScrimLabel('Score Dropped (1 → 0) ⇒ Proves Bottle 3 = Slot 0!', {
    x: 495,
    y: 446,
    fontSize: 13,
    fontFamily: 'body',
    fontWeight: 700,
    color: P.sage,
    stroke: P.sage,
    strokeWidth: 1.4,
    fill: '#F3FAF6',
    padX: 15,
    padY: 6,
  });
  gsap.set(proofTag, { autoAlpha: 0 });
  act1G.appendChild(proofTag);

  // Active 3 unlocked bracket (Slots 1..3) during b3..b4
  const unlockedG = svgEl('g', {}, act1G);
  svgEl(
    'path',
    {
      d: `M ${SLOT_X[1] - 46} 404 L ${SLOT_X[1] - 46} 416 L ${SLOT_X[3] + 46} 416 L ${SLOT_X[3] + 46} 404`,
      fill: 'none',
      stroke: P.sepia,
      'stroke-width': '1.6',
      opacity: '0.7',
    },
    unlockedG,
  );
  unlockedG.appendChild(
    bottles.createSvgScrimLabel('3 Unlocked Bottles [1, 2, 0] over Hidden [2, 0, 1]', {
      x: (SLOT_X[1] + SLOT_X[3]) / 2,
      y: 438,
      fontSize: 12,
      fontFamily: 'mono',
      fontWeight: 600,
      color: P.sepia,
      padX: 12,
      padY: 4,
    }),
  );
  gsap.set(unlockedG, { autoAlpha: 0 });
  act1G.appendChild(unlockedG);

  // Subtle score-drop branch note during b4
  const dropNote = bottles.createSvgScrimLabel('If f dropped instead → exposes Slot 2 immediately', {
    x: 495,
    y: 486,
    fontSize: 11.5,
    fontFamily: 'body',
    fontWeight: 600,
    color: P.sepia,
    padX: 12,
    padY: 4,
  });
  gsap.set(dropNote, { autoAlpha: 0 });
  act1G.appendChild(dropNote);

  // Audience X-Ray whisper strip (y = 512..556, bottom left-center)
  const xrayStripG = svgEl('g', {}, act1G);
  svgEl(
    'rect',
    {
      x: '176',
      y: '506',
      width: '638',
      height: '44',
      rx: '22',
      fill: '#FBF8F1',
      'fill-opacity': '0.92',
      stroke: 'rgba(200, 138, 30, 0.35)',
      'stroke-width': '1.2',
      'stroke-dasharray': '5 3',
    },
    xrayStripG,
  );
  svgEl(
    'text',
    {
      x: '495',
      y: '528.5',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: P.sepia,
      'font-family': "'Fraunces', Georgia, serif",
      'font-style': 'italic',
      'font-size': '14',
      textContent: 'Audience X-Ray Preview · Hidden Coaster Secret:  [ 3,  2,  0,  1 ]',
    },
    xrayStripG,
  );
  gsap.set(xrayStripG, { autoAlpha: 0 });
  act1G.appendChild(xrayStripG);

  // Adversary Escape Attempt visual (b5, y = 408..552)
  const trapG = svgEl('g', {}, act1G);
  // Two attempted coaster-swap arcs underneath coasters with bold red X contradictions
  const makeAdversaryAttempt = (sA, sB, reasonText, yArc, yTag) => {
    const x1 = SLOT_X[sA];
    const x2 = SLOT_X[sB];
    const midX = (x1 + x2) / 2;
    const g = svgEl('g', {}, trapG);
    svgEl(
      'path',
      {
        d: `M ${x1} 396 Q ${midX} ${yArc} ${x2} 396`,
        fill: 'none',
        stroke: P.cinnabar,
        'stroke-width': '2.3',
        'stroke-dasharray': '5 3',
        'marker-start': 'url(#s5_arr_red)',
        'marker-end': 'url(#s5_arr_red)',
      },
      g,
    );
    // Bold cinnabar X badge right on the arc
    const xBadge = svgEl('g', { transform: `translate(${midX}, ${yTag})` }, g);
    svgEl('circle', { cx: '0', cy: '0', r: '13', fill: '#FCEBE8', stroke: P.cinnabar, 'stroke-width': '2' }, xBadge);
    svgEl('path', { d: 'M -5 -5 L 5 5 M 5 -5 L -5 5', stroke: P.cinnabar, 'stroke-width': '2.4', 'stroke-linecap': 'round' }, xBadge);
    g.appendChild(
      bottles.createSvgScrimLabel(reasonText, {
        x: midX,
        y: yTag + 28,
        fontSize: 11.5,
        fontFamily: 'mono',
        fontWeight: 700,
        color: P.cinnabar,
        stroke: P.cinnabar,
        fill: '#FDF3F1',
        padX: 9,
        padY: 3.5,
      }),
    );
    gsap.set(g, { autoAlpha: 0 });
    return g;
  };
  const attempt1 = makeAdversaryAttempt(0, 1, '✗ Breaks Probe f=0', 462, 434);
  const attempt2 = makeAdversaryAttempt(2, 3, '✗ Breaks Swap f=2', 462, 434);

  const trappedSeal = bottles.createSvgScrimLabel('ADVERSARY TRAPPED · NO OTHER SECRET FITS ALL SCORES', {
    x: 495,
    y: 526,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#7A4F09',
    fill: '#FDF0CC',
    stroke: P.brass,
    strokeWidth: 1.8,
    padX: 18,
    padY: 7,
  });
  gsap.set(trappedSeal, { autoAlpha: 0, scale: 0.9, transformOrigin: '495px 526px' });
  trapG.appendChild(trappedSeal);

  // RIGHT PANEL (x = 900..1230): Antique Referee Score Plaque + Move Ledger
  const rightAct1 = svgEl('g', {}, act1G);

  // Score Dial Plaque (x = 918..1222, y = 96..234)
  const scorePlaque = svgEl('g', { transform: 'translate(1070, 165)' }, rightAct1);
  svgEl(
    'rect',
    {
      x: '-152',
      y: '-68',
      width: '304',
      height: '136',
      rx: '14',
      fill: P.parchment,
      stroke: P.brass,
      'stroke-width': '2',
    },
    scorePlaque,
  );
  svgEl(
    'rect',
    {
      x: '-145',
      y: '-61',
      width: '290',
      height: '122',
      rx: '9',
      fill: 'none',
      stroke: 'rgba(200, 138, 30, 0.34)',
      'stroke-width': '1',
    },
    scorePlaque,
  );
  svgEl(
    'text',
    {
      x: '0',
      y: '-41',
      'text-anchor': 'middle',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11',
      'font-weight': '700',
      'letter-spacing': '0.12em',
      textContent: 'REFEREE MATCH SCORE',
    },
    scorePlaque,
  );

  // Stacked scrubbing-safe score readouts
  const scoreStates = [
    { main: 'f = 0', sub: 'No matches yet', color: P.sepia },
    { main: 'f = 1', sub: '+1 match! (B3 or B0)', color: P.brass },
    { main: 'f = 0', sub: '−1 drop → B3 matched!', color: P.cinnabar },
    { main: 'f = 1', sub: 'Bottle 3 locked on Slot 0', color: P.brass },
    { main: 'f = 2', sub: 'Slot 1 ↔ 2 raises score', color: P.delft },
    { main: 'f = 4 / 4', sub: 'ALL FOUR MATCHED!', color: P.sage },
  ];
  const scoreGroups = scoreStates.map((st, idx) => {
    const g = svgEl('g', {}, scorePlaque);
    svgEl(
      'text',
      {
        x: '0',
        y: '4',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: st.color,
        'font-family': "'Fraunces', Georgia, serif",
        'font-size': '40',
        'font-weight': '700',
        textContent: st.main,
      },
      g,
    );
    svgEl(
      'text',
      {
        x: '0',
        y: '41',
        'text-anchor': 'middle',
        fill: P.sepia,
        'font-family': "'Plus Jakarta Sans', sans-serif",
        'font-size': '12.5',
        'font-weight': '600',
        textContent: st.sub,
      },
      g,
    );
    gsap.set(g, { autoAlpha: idx === 0 ? 1 : 0 });
    return g;
  });

  function switchScore(tl, fromIdx, toIdx, atTime) {
    tl.to(scoreGroups[fromIdx], { autoAlpha: 0, duration: 0.22, ease: 'power1.in', immediateRender: false }, atTime);
    tl.to(scoreGroups[toIdx], { autoAlpha: 1, duration: 0.28, ease: 'power2.out', immediateRender: false }, atTime + 0.16);
  }

  function switchPhase(tl, fromIdx, toIdx, atTime) {
    tl.to(phasePills[fromIdx], { autoAlpha: 0, duration: 0.22, immediateRender: false }, atTime);
    tl.to(phasePills[toIdx], { autoAlpha: 1, duration: 0.28, immediateRender: false }, atTime + 0.16);
  }

  // Move Ledger (x = 918..1222, y = 252..540)
  const ledgerG = svgEl('g', { transform: 'translate(918, 256)' }, rightAct1);
  svgEl(
    'rect',
    {
      x: '0',
      y: '0',
      width: '304',
      height: '286',
      rx: '12',
      fill: '#FBF8F1',
      stroke: 'rgba(107, 94, 84, 0.24)',
      'stroke-width': '1.3',
    },
    ledgerG,
  );
  svgEl(
    'text',
    {
      x: '18',
      y: '26',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '10.5',
      'font-weight': '700',
      'letter-spacing': '0.1em',
      textContent: 'EXECUTION LEDGER',
    },
    ledgerG,
  );
  svgEl('line', { x1: '16', y1: '38', x2: '288', y2: '38', stroke: 'rgba(107, 94, 84, 0.2)', 'stroke-width': '1' }, ledgerG);

  const ledgerEntries = [
    { step: '0.', label: 'Start [0, 1, 2, 3]', score: 'f = 0', color: P.sepia },
    { step: '1.', label: 'Swap (0 ↔ 3) → [3,1,2,0]', score: 'f = 1', color: P.brass },
    { step: '2.', label: 'Probe (0 ↔ 1) → [1,3,2,0]', score: 'f = 0 ↓', color: P.cinnabar },
    { step: '3.', label: 'Undo & Lock B3 @ S0', score: '✓ S0', color: P.brass },
    { step: '4.', label: 'Swap (1 ↔ 2) → [3,2,1,0]', score: 'f = 2', color: P.delft },
    { step: '5.', label: 'Swap (2 ↔ 3) → [3,2,0,1]', score: '4 / 4 ★', color: P.sage },
  ];
  const ledgerRows = ledgerEntries.map((ent, idx) => {
    const ry = 66 + idx * 38;
    const rg = svgEl('g', {}, ledgerG);
    if (idx > 0) {
      svgEl('line', { x1: '16', y1: String(ry - 18), x2: '288', y2: String(ry - 18), stroke: 'rgba(107, 94, 84, 0.1)', 'stroke-width': '1' }, rg);
    }
    svgEl(
      'text',
      {
        x: '18',
        y: String(ry),
        'dominant-baseline': 'central',
        fill: P.muted,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '11.5',
        'font-weight': '700',
        textContent: ent.step,
      },
      rg,
    );
    svgEl(
      'text',
      {
        x: '38',
        y: String(ry),
        'dominant-baseline': 'central',
        fill: P.ink,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '11.5',
        'font-weight': '600',
        textContent: ent.label,
      },
      rg,
    );
    svgEl(
      'text',
      {
        x: '286',
        y: String(ry),
        'text-anchor': 'end',
        'dominant-baseline': 'central',
        fill: ent.color,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': '12',
        'font-weight': '700',
        textContent: ent.score,
      },
      rg,
    );
    gsap.set(rg, { autoAlpha: idx === 0 ? 1 : 0 });
    return rg;
  });

  // =========================================================================
  // ACT 2: SCALING TO GENERAL n (b6 .. b9)
  // =========================================================================
  const act2G = svgEl('g', { class: 's5-act2' }, svg);
  gsap.set(act2G, { autoAlpha: 0 });

  // Act 2 Header Pill
  const act2Pills = [
    'Scaling to General n · Giant n × n Fold Wastes 1/2 n²',
    'Shrinking b × b Fold Sweeps + Spare Swaps',
    'Exact Triangle Integral: 1/4 n² · Overhead O(n^(3/2))',
    'Shuffled Slot Order → 1/8 n² · FUN 2026 Gap Closed!',
  ];
  const act2PillNodes = act2Pills.map((txt, idx) => {
    const p = bottles.createSvgScrimLabel(txt, {
      x: 640,
      y: 66,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 700,
      color: idx === 0 ? P.terracotta : idx === 3 ? P.sage : P.brass,
      stroke: idx === 0 ? P.terracotta : idx === 3 ? P.sage : P.brass,
      strokeWidth: 1.2,
      padX: 16,
      padY: 6,
    });
    gsap.set(p, { autoAlpha: idx === 0 ? 1 : 0 });
    act2G.appendChild(p);
    return p;
  });

  // LEFT SIDE: 8x8 Candidate Grid (x = 120..520, y = 136..536, cell = 50px)
  const GRID_N = 8;
  const CELL = 46;
  const GX = 128;
  const GY = 142;
  const GW = GRID_N * CELL; // 368

  const gridG = svgEl('g', {}, act2G);

  // Subtle parchment backing
  svgEl(
    'rect',
    {
      x: String(GX - 6),
      y: String(GY - 6),
      width: String(GW + 12),
      height: String(GW + 12),
      rx: '10',
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.25)',
      'stroke-width': '1.4',
    },
    gridG,
  );

  // Axis captions
  svgEl(
    'text',
    {
      x: String(GX + GW / 2),
      y: String(GY - 20),
      'text-anchor': 'middle',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      textContent: 'Unlocked Slots  m  (shrinking left → right)',
    },
    gridG,
  );
  svgEl(
    'text',
    {
      x: String(GX - 26),
      y: String(GY + GW / 2),
      'text-anchor': 'middle',
      fill: P.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '11.5',
      'font-weight': '700',
      transform: `rotate(-90, ${GX - 26}, ${GY + GW / 2})`,
      textContent: 'Batches of b Bottles (n total)',
    },
    gridG,
  );

  // Build 8x8 cells
  const gridCells = [];
  for (let r = 0; r < GRID_N; r++) {
    gridCells[r] = [];
    for (let c = 0; c < GRID_N; c++) {
      const rect = svgEl(
        'rect',
        {
          x: String(GX + c * CELL + 1.5),
          y: String(GY + r * CELL + 1.5),
          width: String(CELL - 3),
          height: String(CELL - 3),
          rx: '4',
          fill: '#F6F1E7',
          stroke: 'rgba(107, 94, 84, 0.2)',
          'stroke-width': '1',
        },
        gridG,
      );
      gridCells[r][c] = rect;
    }
  }

  // Full n x n wasted overlay (upper-right triangle vs full square in b6)
  const fullSquareWash = svgEl(
    'rect',
    {
      x: String(GX),
      y: String(GY),
      width: String(GW),
      height: String(GW),
      rx: '5',
      fill: P.terracotta,
      opacity: '0',
    },
    gridG,
  );
  // Upper-right wasted triangle path
  const wastedTri = svgEl(
    'polygon',
    {
      points: `${GX},${GY} ${GX + GW},${GY} ${GX + GW},${GY + GW}`,
      fill: P.cinnabar,
      opacity: '0',
    },
    gridG,
  );
  const wastedTriLbl = bottles.createSvgScrimLabel('Wasted: Already Locked!', {
    x: GX + GW * 0.68,
    y: GY + GW * 0.26,
    fontSize: 12,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.cinnabar,
    stroke: P.cinnabar,
    padX: 10,
    padY: 4,
  });
  gsap.set(wastedTriLbl, { autoAlpha: 0 });
  gridG.appendChild(wastedTriLbl);

  // Moving b x b fold frame (2x2 = 92x92)
  const blockFrame = svgEl(
    'rect',
    {
      x: '0',
      y: '0',
      width: String(CELL * 2),
      height: String(CELL * 2),
      rx: '6',
      fill: 'rgba(200, 138, 30, 0.2)',
      stroke: P.brass,
      'stroke-width': '3',
    },
    gridG,
  );
  gsap.set(blockFrame, { x: GX, y: GY, autoAlpha: 0 });

  const blockLbl = bottles.createSvgScrimLabel('b × b fold', {
    x: 0,
    y: 0,
    fontSize: 11.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#7A4F09',
    fill: '#FDF0CC',
    stroke: P.brass,
    padX: 8,
    padY: 3,
  });
  gsap.set(blockLbl, { x: GX + CELL, y: GY + CELL, autoAlpha: 0 });
  gridG.appendChild(blockLbl);

  // Staircase batch fill bands (b7: 4 horizontal bands of height 2 cells, shrinking width: 8, 6, 4, 2)
  // For b9 (randomized): each band stops halfway on average (width 4, 3, 2, 1) in sage!
  const detBands = [];
  const randBands = [];
  const batchWidths = [8, 6, 4, 2]; // m = 8, 6, 4, 2
  const randWidths = [4, 3, 2, 1];
  for (let bi = 0; bi < 4; bi++) {
    const by = GY + bi * 2 * CELL;
    const detRect = svgEl(
      'rect',
      {
        x: String(GX + 1),
        y: String(by + 1),
        width: String(batchWidths[bi] * CELL - 2),
        height: String(2 * CELL - 2),
        rx: '5',
        fill: 'rgba(200, 138, 30, 0.22)',
        stroke: P.brass,
        'stroke-width': '1.6',
      },
      gridG,
    );
    gsap.set(detRect, { autoAlpha: 0 });
    detBands.push(detRect);

    const randRect = svgEl(
      'rect',
      {
        x: String(GX + 1),
        y: String(by + 1),
        width: String(randWidths[bi] * CELL - 2),
        height: String(2 * CELL - 2),
        rx: '5',
        fill: 'rgba(78, 140, 111, 0.34)',
        stroke: P.sage,
        'stroke-width': '2',
      },
      gridG,
    );
    gsap.set(randRect, { autoAlpha: 0 });
    randBands.push(randRect);
  }

  // Spare swap indicator pill on grid during b7
  const sparePill = bottles.createSvgScrimLabel('Lock! Swap in Untested Spare', {
    x: GX + GW * 0.5,
    y: GY + GW + 28,
    fontSize: 12,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.delft,
    stroke: P.delft,
    padX: 12,
    padY: 4,
  });
  gsap.set(sparePill, { autoAlpha: 0 });
  gridG.appendChild(sparePill);

  // Shuffled-column arrows indicator during b9
  const shufflePill = bottles.createSvgScrimLabel('Shuffled Slots → Locks Halfway on Average!', {
    x: GX + GW * 0.5,
    y: GY + GW + 28,
    fontSize: 12,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.sage,
    stroke: P.sage,
    fill: '#F1F9F5',
    padX: 12,
    padY: 4,
  });
  gsap.set(shufflePill, { autoAlpha: 0 });
  gridG.appendChild(shufflePill);

  // RIGHT SIDE (x = 590..1225): Area Integral Graph + Overhead Formula + FUN 2026 Closure
  const rightAct2 = svgEl('g', {}, act2G);

  // 1. Integral Graph Panel (x = 602..1212, y = 114..352)
  const graphG = svgEl('g', {}, rightAct2);
  svgEl(
    'rect',
    {
      x: '602',
      y: '114',
      width: '610',
      height: '238',
      rx: '14',
      fill: P.parchment,
      stroke: 'rgba(107, 94, 84, 0.24)',
      'stroke-width': '1.4',
    },
    graphG,
  );

  // Axes inside graph: origin (666, 314), width 460 -> x=1126, height 156 -> y=158
  const OX = 666;
  const OY = 314;
  const AXW = 460;
  const AXH = 152;
  svgEl('line', { x1: String(OX), y1: String(OY), x2: String(OX + AXW + 18), y2: String(OY), stroke: P.ink, 'stroke-width': '1.8' }, graphG);
  svgEl('line', { x1: String(OX), y1: String(OY), x2: String(OX), y2: String(OY - AXH - 18), stroke: P.ink, 'stroke-width': '1.8' }, graphG);

  // Axis ticks & labels
  svgEl('text', { x: String(OX), y: String(OY + 18), 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '11', 'font-weight': '600', textContent: '0' }, graphG);
  svgEl('text', { x: String(OX + AXW), y: String(OY + 18), 'text-anchor': 'middle', fill: P.sepia, 'font-family': "'JetBrains Mono', monospace", 'font-size': '11', 'font-weight': '700', textContent: 'n (unlocked m)' }, graphG);
  svgEl('text', { x: String(OX - 12), y: String(OY - AXH), 'text-anchor': 'end', 'dominant-baseline': 'central', fill: P.brass, 'font-family': "'JetBrains Mono', monospace", 'font-size': '11', 'font-weight': '700', textContent: 'n/2' }, graphG);
  svgEl('text', { x: String(OX - 12), y: String(OY - AXH / 2), 'text-anchor': 'end', 'dominant-baseline': 'central', fill: P.sage, 'font-family': "'JetBrains Mono', monospace", 'font-size': '11', 'font-weight': '700', textContent: 'n/4' }, graphG);

  // Full rectangle (1/2 n^2) ghost for b6 comparison
  const naiveRectArea = svgEl(
    'rect',
    {
      x: String(OX),
      y: String(OY - AXH),
      width: String(AXW),
      height: String(AXH),
      fill: 'rgba(217, 93, 72, 0.14)',
      stroke: P.terracotta,
      'stroke-width': '1.5',
      'stroke-dasharray': '5 4',
    },
    graphG,
  );
  const naiveAreaLbl = bottles.createSvgScrimLabel('Full n×n Fold = 1/2 n²', {
    x: OX + AXW * 0.34,
    y: OY - AXH * 0.78,
    fontSize: 12,
    fontFamily: 'mono',
    fontWeight: 700,
    color: P.terracotta,
    stroke: P.terracotta,
    padX: 10,
    padY: 4,
  });
  gsap.set([naiveRectArea, naiveAreaLbl], { autoAlpha: 0 });
  graphG.appendChild(naiveAreaLbl);

  // Deterministic Triangle (0, OY) -> (OX+AXW, OY-AXH) -> (OX+AXW, OY) => area 1/4 n^2
  const detTriArea = svgEl(
    'polygon',
    {
      points: `${OX},${OY} ${OX + AXW},${OY - AXH} ${OX + AXW},${OY}`,
      fill: 'rgba(200, 138, 30, 0.24)',
      stroke: P.brass,
      'stroke-width': '2.4',
    },
    graphG,
  );
  const detLineLbl = bottles.createSvgScrimLabel('m/2 swaps / bottle → Area = 1/4 n²', {
    x: OX + AXW * 0.56,
    y: OY - AXH * 0.66,
    fontSize: 12,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#7A4F09',
    fill: '#FDF0CC',
    stroke: P.brass,
    padX: 10,
    padY: 4,
  });
  gsap.set([detTriArea, detLineLbl], { autoAlpha: 0 });
  graphG.appendChild(detLineLbl);

  // Randomized Half-Triangle (0, OY) -> (OX+AXW, OY-AXH/2) -> (OX+AXW, OY) => area 1/8 n^2
  const randTriArea = svgEl(
    'polygon',
    {
      points: `${OX},${OY} ${OX + AXW},${OY - AXH * 0.5} ${OX + AXW},${OY}`,
      fill: 'rgba(78, 140, 111, 0.34)',
      stroke: P.sage,
      'stroke-width': '2.5',
    },
    graphG,
  );
  const randLineLbl = bottles.createSvgScrimLabel('Shuffled: m/4 avg → Area = 1/8 n²', {
    x: OX + AXW * 0.66,
    y: OY - AXH * 0.24,
    fontSize: 12,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#2B5B45',
    fill: '#EAF6F0',
    stroke: P.sage,
    padX: 10,
    padY: 4,
  });
  gsap.set([randTriArea, randLineLbl], { autoAlpha: 0 });
  graphG.appendChild(randLineLbl);

  // 2. Lower Right Cards (y = 372..546):
  // Card A (b8): KaTeX Integral + Overhead b ~ sqrt(n)
  const mathCard = document.createElement('div');
  mathCard.className = 'label-scrim label-scrim-card';
  mathCard.style.cssText =
    'position:absolute;left:602px;top:374px;width:610px;height:166px;display:flex;flex-direction:column;justify-content:center;gap:14px;padding:16px 24px;border:1.5px solid rgba(200,138,30,0.45);background:rgba(255,251,242,0.96);opacity:0;';

  const intRow = document.createElement('div');
  intRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;';
  const intLbl = document.createElement('span');
  intLbl.style.cssText = "font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:#6B5E54;letter-spacing:0.06em;";
  intLbl.textContent = 'SWEEP TOTAL';
  const intMath = createMathEl('\\int_0^n \\frac{m}{2}\\,dm \\;=\\; \\frac{1}{4}n^2', { fontSize: 22, color: '#7A4F09' });
  intRow.appendChild(intLbl);
  intRow.appendChild(intMath);

  const divRule = document.createElement('div');
  divRule.style.cssText = 'height:1px;background:rgba(107,94,84,0.18);width:100%;';

  const ovRow = document.createElement('div');
  ovRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;';
  const ovLbl = document.createElement('span');
  ovLbl.style.cssText = "font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:#3D7EA6;letter-spacing:0.06em;";
  ovLbl.textContent = 'OVERHEAD (b ≈ √n)';
  const ovMath = createMathEl('O\\!\\left(\\tfrac{n^2}{b}\\right) + O(nb) \\;=\\; O(n^{3/2})', { fontSize: 19, color: '#1F1A17' });
  ovRow.appendChild(ovLbl);
  ovRow.appendChild(ovMath);

  mathCard.appendChild(intRow);
  mathCard.appendChild(divRule);
  mathCard.appendChild(ovRow);
  htmlLayer.appendChild(mathCard);

  // Card B (b9): FUN 2026 Closure & Part II Transition (replaces mathCard cleanly!)
  const funCard = document.createElement('div');
  funCard.className = 'label-scrim label-scrim-card';
  funCard.style.cssText =
    'position:absolute;left:602px;top:374px;width:610px;height:166px;display:flex;flex-direction:column;justify-content:center;gap:12px;padding:16px 24px;border:1.8px solid rgba(78,140,111,0.55);background:rgba(243,250,246,0.97);opacity:0;';

  const funTop = document.createElement('div');
  funTop.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:14px;';
  const funOld = createMathEl('\\text{FUN 2026: } \\tfrac{1}{2}n^2 \\log n', { fontSize: 15, color: '#8B7D71' });
  funOld.style.textDecoration = 'line-through';
  const funSep = document.createElement('span');
  funSep.style.cssText = "font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:#4E8C6F;flex-shrink:0;";
  funSep.textContent = '→';
  const funNew = createMathEl('\\text{Ours: } \\tfrac{1}{4}n^2 \\text{ det.} \\;\\cdot\\; \\tfrac{1}{8}n^2 \\text{ rand.}', {
    fontSize: 16.5,
    color: '#2B5B45',
  });
  funTop.appendChild(funOld);
  funTop.appendChild(funSep);
  funTop.appendChild(funNew);

  const funMid = document.createElement('div');
  funMid.style.cssText =
    "font-family:'JetBrains Mono',monospace;font-size:12.5px;font-weight:700;color:#4E8C6F;letter-spacing:0.05em;text-align:center;";
  funMid.textContent = '✓  EXACT LOWER BOUNDS ACHIEVED · LOG N GAP CLOSED';

  const funNext = document.createElement('div');
  funNext.style.cssText =
    "font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:16.5px;font-weight:600;color:#7A4F09;text-align:center;padding-top:4px;border-top:1px solid rgba(78,140,111,0.22);";
  funNext.textContent = 'Next: Unlock Game 2 — Full-Table Reordering →';

  funCard.appendChild(funTop);
  funCard.appendChild(funMid);
  funCard.appendChild(funNext);
  htmlLayer.appendChild(funCard);

  // =========================================================================
  // MASTER BIDIRECTIONAL GSAP TIMELINE
  // =========================================================================
  const tl = gsap.timeline({ paused: true });

  // --- b0 (0.80s): Intro bottles [0,1,2,3] over veiled '?' coasters + brief X-ray peek ---
  tl.fromTo(act1G, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 0);
  tl.to(xrayStripG, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, b0.start + 3.8);
  // Brief audience X-Ray reveal of [3, 2, 0, 1] mid-b0, then veil back to '?' before b1
  coasters.forEach((c, i) => {
    bottles.setCoasterRevealed(c, true, tl, b0.start + 4.2 + i * 0.14, 0.38);
    bottles.setCoasterRevealed(c, false, tl, b0.start + 9.2 + i * 0.1, 0.36);
  });

  // --- b1 (13.66s): Move A -> Swap Slot 0 <-> Slot 3 => [3, 1, 2, 0], f: 0 -> 1 ---
  switchPhase(tl, 0, 1, b1.start);
  tl.to(arc03, { autoAlpha: 1, duration: 0.45 }, b1.start + 0.5);
  animateSwap(tl, 0, 3, b1.start + 1.5, 1.35);
  switchScore(tl, 0, 1, b1.start + 3.1);
  tl.to(ledgerRows[1], { autoAlpha: 1, duration: 0.45 }, b1.start + 3.2);
  tl.to(arc03, { autoAlpha: 0, duration: 0.4 }, b1.end - 0.8);

  // --- b2 (25.30s): Candidate halos -> Probe Slot 0 <-> Idle Slot 1 => [1, 3, 2, 0], f: 1 -> 0 ---
  switchPhase(tl, 1, 2, b2.start);
  tl.to([candHalos[0], candHalos[3]], { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' }, b2.start + 0.4);
  tl.to(idleTag, { autoAlpha: 1, duration: 0.4 }, b2.start + 2.4);
  tl.to(arc01, { autoAlpha: 1, duration: 0.45 }, b2.start + 3.0);
  tl.to([candHalos[0], candHalos[3]], { autoAlpha: 0, scale: 0.7, duration: 0.3 }, b2.start + 3.6);
  animateSwap(tl, 0, 1, b2.start + 4.1, 1.25);
  switchScore(tl, 1, 2, b2.start + 5.6);
  tl.to(ledgerRows[2], { autoAlpha: 1, duration: 0.45 }, b2.start + 5.7);
  tl.to(proofTag, { autoAlpha: 1, duration: 0.5, ease: 'back.out(1.4)' }, b2.start + 6.9);
  tl.to([arc01, idleTag], { autoAlpha: 0, duration: 0.4 }, b2.end - 0.7);

  // --- b3 (38.21s): Undo probe -> [3, 1, 2, 0], Lock Bottle 3 on Slot 0 ---
  switchPhase(tl, 2, 3, b3.start);
  tl.to(proofTag, { autoAlpha: 0, duration: 0.35 }, b3.start + 0.1);
  tl.to(arcUndo, { autoAlpha: 1, duration: 0.4 }, b3.start + 0.35);
  animateSwap(tl, 0, 1, b3.start + 0.9, 1.15);
  switchScore(tl, 2, 3, b3.start + 2.2);
  tl.to(arcUndo, { autoAlpha: 0, duration: 0.35 }, b3.start + 2.6);
  // Lock Slot 0 in burnished gold & flip Coaster 0 open to confirm 3!
  tl.to(lockRings[0], { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }, b3.start + 2.9);
  tl.to(slotMatchGlows[0], { opacity: 1, duration: 0.5 }, b3.start + 2.9);
  tl.to(bottleNodes[3].querySelector('.bottle-glow'), { opacity: 1, duration: 0.5 }, b3.start + 2.9);
  bottles.setCoasterRevealed(coasters[0], true, tl, b3.start + 3.1, 0.42);
  tl.to(ledgerRows[3], { autoAlpha: 1, duration: 0.45 }, b3.start + 3.2);
  tl.to(unlockedG, { autoAlpha: 1, duration: 0.5 }, b3.start + 4.8);

  // --- b4 (49.20s): Swap (1 <-> 2) -> f=2, Swap (2 <-> 3) -> f=4/4 ---
  switchPhase(tl, 3, 4, b4.start);
  tl.to(arc12, { autoAlpha: 1, duration: 0.35 }, b4.start + 0.4);
  animateSwap(tl, 1, 2, b4.start + 0.9, 1.1);
  switchScore(tl, 3, 4, b4.start + 2.15);
  tl.to(ledgerRows[4], { autoAlpha: 1, duration: 0.4 }, b4.start + 2.25);
  tl.to(arc12, { autoAlpha: 0, duration: 0.3 }, b4.start + 2.8);

  tl.to(arc23, { autoAlpha: 1, duration: 0.35 }, b4.start + 3.3);
  animateSwap(tl, 2, 3, b4.start + 3.8, 1.1);
  tl.to(arc23, { autoAlpha: 0, duration: 0.3 }, b4.start + 4.9);
  switchScore(tl, 4, 5, b4.start + 5.05);
  tl.to(ledgerRows[5], { autoAlpha: 1, duration: 0.45 }, b4.start + 5.15);

  // Light all remaining locks & golden halos cleanly AFTER arc23 is completely gone!
  for (let i = 1; i < 4; i++) {
    tl.to(lockRings[i], { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.6)' }, b4.start + 5.35 + i * 0.12);
    tl.to(slotMatchGlows[i], { opacity: 1, duration: 0.45 }, b4.start + 5.35 + i * 0.12);
  }
  for (const id of [0, 1, 2]) {
    tl.to(bottleNodes[id].querySelector('.bottle-glow'), { opacity: 1, duration: 0.45 }, b4.start + 5.3);
  }
  tl.to(dropNote, { autoAlpha: 1, duration: 0.45 }, b4.start + 6.4);

  // --- b5 (59.18s): Flip remaining coasters face-up -> [3,2,0,1], adversary swap contradictions ---
  switchPhase(tl, 4, 5, b5.start);
  tl.to([unlockedG, dropNote, xrayStripG], { autoAlpha: 0, duration: 0.35 }, b5.start + 0.1);
  [1, 2, 3].forEach((ci, idx) => {
    bottles.setCoasterRevealed(coasters[ci], true, tl, b5.start + 0.6 + idx * 0.2, 0.42);
  });
  tl.to(attempt1, { autoAlpha: 1, duration: 0.5 }, b5.start + 3.2);
  tl.to(attempt2, { autoAlpha: 1, duration: 0.5 }, b5.start + 4.4);
  tl.to(trappedSeal, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(1.6)' }, b5.start + 6.2);

  // --- ACT 1 -> ACT 2 CROSS-FADE (cleanly separated!) ---
  tl.to(act1G, { autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, b6.start - 0.55);
  tl.to(act2G, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, b6.start);

  // --- b6 (70.20s): Giant n x n fold wastes 1/2 n^2 ---
  tl.to(fullSquareWash, { opacity: 0.16, duration: 0.7 }, b6.start + 1.0);
  tl.to(wastedTri, { opacity: 0.2, duration: 0.7 }, b6.start + 3.4);
  tl.to(wastedTriLbl, { autoAlpha: 1, duration: 0.45 }, b6.start + 3.8);
  tl.to([naiveRectArea, naiveAreaLbl], { autoAlpha: 1, duration: 0.6 }, b6.start + 2.4);

  // --- b7 (81.86s): Sweep b x b folds across m unlocked slots, shrinking m ---
  tl.to(act2PillNodes[0], { autoAlpha: 0, duration: 0.25 }, b7.start);
  tl.to(act2PillNodes[1], { autoAlpha: 1, duration: 0.3 }, b7.start + 0.2);
  tl.to([fullSquareWash, wastedTri, wastedTriLbl], { opacity: 0, autoAlpha: 0, duration: 0.45 }, b7.start + 0.2);
  tl.to([blockFrame, blockLbl], { autoAlpha: 1, duration: 0.4 }, b7.start + 0.7);
  tl.to(sparePill, { autoAlpha: 1, duration: 0.4 }, b7.start + 2.2);

  // Sweep 4 shrinking batches (row bands 0, 1, 2, 3)
  let sweepT = b7.start + 1.2;
  const sweepStepDurs = [2.6, 2.2, 1.8, 1.2];
  for (let bi = 0; bi < 4; bi++) {
    const startX = GX;
    const endX = GX + (batchWidths[bi] - 2) * CELL;
    const rowY = GY + bi * 2 * CELL;
    const sd = sweepStepDurs[bi];

    tl.set(blockFrame, { x: startX, y: rowY }, sweepT);
    tl.set(blockLbl, { x: startX + CELL, y: rowY + CELL }, sweepT);
    if (endX > startX) {
      tl.to(blockFrame, { x: endX, duration: sd * 0.78, ease: 'power1.inOut', immediateRender: false }, sweepT + 0.12);
      tl.to(blockLbl, { x: endX + CELL, duration: sd * 0.78, ease: 'power1.inOut', immediateRender: false }, sweepT + 0.12);
    }
    tl.to(detBands[bi], { autoAlpha: 1, duration: 0.45 }, sweepT + sd * 0.55);
    sweepT += sd;
  }
  tl.to([blockFrame, blockLbl], { autoAlpha: 0, duration: 0.4 }, b7.end - 0.8);

  // --- b8 (94.12s): Integral 1/4 n^2 + b ~ sqrt(n) -> O(n^(3/2)) ---
  tl.to(act2PillNodes[1], { autoAlpha: 0, duration: 0.25 }, b8.start);
  tl.to(act2PillNodes[2], { autoAlpha: 1, duration: 0.3 }, b8.start + 0.2);
  tl.to(naiveRectArea, { autoAlpha: 0.24, duration: 0.45 }, b8.start + 0.25);
  tl.to(naiveAreaLbl, { autoAlpha: 0, duration: 0.3 }, b8.start + 0.25);
  tl.to([detTriArea, detLineLbl], { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, b8.start + 0.8);
  tl.to(mathCard, { autoAlpha: 1, duration: 0.65, ease: 'power2.out' }, b8.start + 2.2);

  // --- b9 (109.26s): Shuffled slot order -> 1/8 n^2, close FUN 2026! ---
  tl.to(act2PillNodes[2], { autoAlpha: 0, duration: 0.25 }, b9.start);
  tl.to(act2PillNodes[3], { autoAlpha: 1, duration: 0.3 }, b9.start + 0.2);
  tl.to(sparePill, { autoAlpha: 0, duration: 0.3 }, b9.start + 0.2);
  tl.to(shufflePill, { autoAlpha: 1, duration: 0.45 }, b9.start + 0.6);

  // Dim full deterministic bands slightly & overlay sage half-bands
  tl.to(detBands, { autoAlpha: 0.32, duration: 0.5 }, b9.start + 0.9);
  randBands.forEach((rb, idx) => {
    tl.to(rb, { autoAlpha: 1, duration: 0.45, ease: 'power2.out' }, b9.start + 1.1 + idx * 0.25);
  });

  // Halve integral triangle into sage 1/8 n^2
  tl.to(naiveRectArea, { autoAlpha: 0, duration: 0.35 }, b9.start + 0.8);
  tl.to(detLineLbl, { autoAlpha: 0, duration: 0.3 }, b9.start + 1.15);
  tl.to([randTriArea, randLineLbl], { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, b9.start + 1.6);

  // Cross-fade mathCard -> funCard cleanly
  tl.to(mathCard, { autoAlpha: 0, duration: 0.4 }, b9.start + 3.2);
  tl.to(funCard, { autoAlpha: 1, duration: 0.65, ease: 'back.out(1.25)' }, b9.start + 3.65);

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
