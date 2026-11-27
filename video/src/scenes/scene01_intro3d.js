// Chapter 01: The Bottle Game — Sunlit 3D Oak Tabletop + Split Comparison + Roadmap

export const sceneMeta = {
  id: 'scene1',
  number: 1,
  title: 'The Bottle Game',
  chapter: 'Prologue',
  duration: 68.42,
  beats: [
    {
      id: 's1_b0',
      start: 0.8,
      audioDuration: 9.984,
      text: 'Six numbered bottles, zero through five, stand on six slots. Underneath each slot lies a face-down coaster hiding a secret.',
      highlight: ['Six numbered bottles', 'face-down coaster'],
      cue: null,
    },
    {
      id: 's1_b1',
      start: 11.334,
      audioDuration: 8.592,
      text: 'Those six hidden coasters hold a secret permutation of zero through five—here, [2, 0, 5, 3, 1, 4].',
      highlight: ['secret permutation', '[2, 0, 5, 3, 1, 4]'],
      cue: 'whoosh',
    },
    {
      id: 's1_b2',
      start: 20.476,
      audioDuration: 8.136,
      text: 'A bottle matches when its label equals the coaster beneath it. In your starting lineup, only Bottle 3 matches, scoring 1.',
      highlight: ['Bottle 3 matches', 'scoring 1'],
      cue: 'bell',
    },
    {
      id: 's1_b3',
      start: 29.162,
      audioDuration: 9.0,
      text: 'Of course, you cannot peek under the coasters. Swap Bottle 0 with Bottle 2, and the referee reports a new score: 2.',
      highlight: ['Swap Bottle 0 with Bottle 2', 'new score: 2'],
      cue: 'clink',
    },
    {
      id: 's1_b4',
      start: 38.712,
      audioDuration: 8.664,
      text: 'That is the catch. The referee gives only the total match count—never which specific bottles are right—until all six match.',
      highlight: ['total match count', 'never which specific bottles'],
      cue: null,
    },
    {
      id: 's1_b5',
      start: 47.926,
      audioDuration: 9.384,
      text: 'This viral puzzle splits into two distinct games: Game 1 swaps a single pair per turn, while Game 2 reorders every bottle.',
      highlight: ['Game 1 swaps a single pair', 'Game 2 reorders every bottle'],
      cue: 'whoosh',
    },
    {
      id: 's1_b6',
      start: 57.86,
      audioDuration: 9.36,
      text: "In Part I, we prove Game 1's exact swap limit and achieve it. In Part II, we break Game 2's n log n barrier.",
      highlight: ['Part I', 'exact swap limit', 'Part II', 'n log n barrier'],
      cue: 'lock',
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

function makeOakTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const c = canvas.getContext('2d');

  const grad = c.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#D7AE7F');
  grad.addColorStop(0.5, '#C49461');
  grad.addColorStop(1, '#D3A675');
  c.fillStyle = grad;
  c.fillRect(0, 0, 512, 512);

  // Subtle plank grain lines
  c.strokeStyle = 'rgba(98, 62, 30, 0.14)';
  for (let i = 0; i < 48; i++) {
    const y = (i / 48) * 512;
    c.lineWidth = 1 + (i % 3) * 0.65;
    c.beginPath();
    c.moveTo(0, y);
    for (let x = 0; x <= 512; x += 64) {
      const wave = Math.sin(x * 0.014 + i * 0.7) * 4.2;
      c.lineTo(x, y + wave);
    }
    c.stroke();
  }

  // Subtle plank join bevel
  c.strokeStyle = 'rgba(84, 52, 24, 0.22)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(0, 170);
  c.lineTo(512, 170);
  c.moveTo(0, 342);
  c.lineTo(512, 342);
  c.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

export function buildScene(rootEl, ctx) {
  const { gsap, THREE, colors, bottles, createSvg, svgEl, renderMath } = ctx;
  const W = 1280;
  const H = 590;
  const SECRET = [2, 0, 5, 3, 1, 4];

  rootEl.innerHTML = '';

  const container = document.createElement('div');
  container.style.cssText =
    'position:relative;width:1280px;height:720px;overflow:hidden;background:transparent;';
  rootEl.appendChild(container);

  // =========================================================================
  // ACT 1 (Beats 0–4): SUNLIT 3D OAK TABLETOP (Three.js + Crisp SVG HUD)
  // =========================================================================
  const act3dWrap = document.createElement('div');
  act3dWrap.style.cssText =
    'position:absolute;left:0;top:0;width:1280px;height:590px;overflow:hidden;';
  container.appendChild(act3dWrap);

  const webglHost = document.createElement('div');
  webglHost.style.cssText =
    'position:absolute;left:0;top:0;width:1280px;height:590px;';
  act3dWrap.appendChild(webglHost);

  // Set up Three.js scene
  const threeScene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 60);
  const camState = {
    x: 0,
    y: 4.9,
    z: 10.6,
    lookX: 0,
    lookY: 0.72,
    lookZ: 0.1,
  };
  camera.position.set(camState.x, camState.y, camState.z);
  camera.lookAt(camState.lookX, camState.lookY, camState.lookZ);

  let renderer = null;
  let webglFailed = false;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.style.cssText = 'width:1280px;height:590px;display:block;';
    webglHost.appendChild(renderer.domElement);
  } catch (err) {
    console.warn('WebGL fallback triggered in Scene 1:', err);
    webglFailed = true;
  }

  // Sunlit Apothecary lighting
  const hemiLight = new THREE.HemisphereLight(0xfff9ee, 0xd8be99, 1.35);
  threeScene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfff4df, 1.85);
  sunLight.position.set(5.5, 10.5, 6.2);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 2;
  sunLight.shadow.camera.far = 26;
  sunLight.shadow.camera.left = -7;
  sunLight.shadow.camera.right = 7;
  sunLight.shadow.camera.top = 5;
  sunLight.shadow.camera.bottom = -5;
  sunLight.shadow.bias = -0.0005;
  threeScene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xffe8c8, 0.58);
  fillLight.position.set(-6.0, 5.2, 4.0);
  threeScene.add(fillLight);

  // Turned sunlit oak tabletop slab
  const tableGroup = new THREE.Group();
  threeScene.add(tableGroup);

  const oakTex = makeOakTexture(THREE);
  const tableGeo = new THREE.BoxGeometry(11.4, 0.44, 3.8);
  const tableMat = new THREE.MeshStandardMaterial({
    map: oakTex,
    roughness: 0.56,
    metalness: 0.04,
  });
  const tableMesh = new THREE.Mesh(tableGeo, tableMat);
  tableMesh.position.set(0, -0.32, 0.15);
  tableMesh.receiveShadow = true;
  tableGroup.add(tableMesh);

  // Burnished brass inlay molding strip along the front edge of the tabletop
  const trimGeo = new THREE.BoxGeometry(11.44, 0.055, 0.06);
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xc88a1e,
    roughness: 0.34,
    metalness: 0.72,
  });
  const trimMesh = new THREE.Mesh(trimGeo, trimMat);
  trimMesh.position.set(0, -0.14, 2.06);
  tableGroup.add(trimMesh);

  // 6 slots spaced cleanly across oak table
  const slotX = [-3.65, -2.19, -0.73, 0.73, 2.19, 3.65];
  const liquidLevels = [0.72, 0.63, 0.76, 0.68, 0.74, 0.65];

  const coasters3d = [];
  const bottles3d = [];

  for (let i = 0; i < 6; i++) {
    const coaster = bottles.createThreeCoaster(THREE, SECRET[i], {
      hidden: true,
      slotIndex: i,
      radius: 0.56,
    });
    coaster.position.set(slotX[i], 0, 0);
    tableGroup.add(coaster);
    coasters3d.push(coaster);

    const bottle = bottles.createThreeBottle(THREE, i, colors.bottles[i], {
      scale: 0.96,
      liquidLevel: liquidLevels[i],
      matched: false,
    });
    bottle.position.set(slotX[i], 0, 0);
    tableGroup.add(bottle);
    bottles3d.push(bottle);
  }

  // Subtle 3D golden spotlight ring beneath Slot 3 for Beat 2 highlight
  const slot3HaloGeo = new THREE.RingGeometry(0.62, 0.86, 48);
  const slot3HaloMat = new THREE.MeshBasicMaterial({
    color: 0xf3c96b,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const slot3Halo = new THREE.Mesh(slot3HaloGeo, slot3HaloMat);
  slot3Halo.rotation.x = -Math.PI / 2;
  slot3Halo.position.set(slotX[3], 0.012, 0);
  tableGroup.add(slot3Halo);

  // Overlay SVG for Act 1 (strictly in safe bands y ∈ [50, 566])
  const svg3d = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;',
  });
  act3dWrap.appendChild(svg3d);

  // Top centered mode scrim pills (only one visible at a time!)
  const modePillPlayer = bottles.createSvgScrimLabel('Player View  ·  6 Bottles over Face-Down Coasters', {
    x: 640,
    y: 68,
    fontSize: 13.5,
    fontWeight: 600,
    color: colors.sepia,
    padX: 16,
    padY: 6,
  });
  gsap.set(modePillPlayer, { autoAlpha: 0 });
  svg3d.appendChild(modePillPlayer);

  const modePillXray = bottles.createSvgScrimLabel('Audience X-Ray View  ·  Secret Coasters Revealed', {
    x: 640,
    y: 68,
    fontSize: 13.5,
    fontWeight: 700,
    color: '#8D5B0C',
    fill: '#FDF5DF',
    stroke: 'rgba(200, 138, 30, 0.45)',
    padX: 16,
    padY: 6,
  });
  gsap.set(modePillXray, { autoAlpha: 0 });
  svg3d.appendChild(modePillXray);

  const modePillHidden = bottles.createSvgScrimLabel('Player View  ·  Coasters Veiled (?)', {
    x: 640,
    y: 68,
    fontSize: 13.5,
    fontWeight: 600,
    color: colors.sepia,
    padX: 16,
    padY: 6,
  });
  gsap.set(modePillHidden, { autoAlpha: 0 });
  svg3d.appendChild(modePillHidden);

  // Referee Score Medallion (top-right, completely clear of bottles & chapter whisper)
  const scoreOuter = svgEl('g', { transform: 'translate(1135, 92)' }, svg3d);
  const scoreInner = svgEl('g', {}, scoreOuter);
  gsap.set(scoreInner, { autoAlpha: 0, scale: 0.88, transformOrigin: '0px 0px' });

  svgEl(
    'rect',
    {
      x: '-92',
      y: '-34',
      width: '184',
      height: '68',
      rx: '14',
      fill: '#FFFBF2',
      'fill-opacity': '0.95',
      stroke: colors.brass,
      'stroke-width': '1.8',
    },
    scoreInner,
  );
  svgEl(
    'text',
    {
      x: '0',
      y: '-14',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: colors.sepia,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '10',
      'font-weight': '700',
      'letter-spacing': '0.1em',
      textContent: 'REFEREE SCORE',
    },
    scoreInner,
  );
  const scoreVal1 = svgEl(
    'text',
    {
      x: '0',
      y: '12',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: colors.ink,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '22',
      'font-weight': '700',
      textContent: 'f = 1 / 6',
    },
    scoreInner,
  );
  const scoreVal2 = svgEl(
    'text',
    {
      x: '0',
      y: '12',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: colors.sage,
      'font-family': "'JetBrains Mono', monospace",
      'font-size': '22',
      'font-weight': '700',
      textContent: 'f = 2 / 6',
    },
    scoreInner,
  );
  gsap.set(scoreVal2, { autoAlpha: 0 });

  // Beat 2: Clean callout pill above Bottle 3 (projected X updated dynamically!)
  const matchCalloutOuter = svgEl('g', { transform: 'translate(735, 118)' }, svg3d);
  const matchCalloutInner = svgEl('g', {}, matchCalloutOuter);
  gsap.set(matchCalloutInner, { autoAlpha: 0 });
  svgEl(
    'line',
    {
      x1: '0',
      y1: '18',
      x2: '0',
      y2: '44',
      stroke: colors.brass,
      'stroke-width': '1.8',
      'stroke-dasharray': '4 3',
    },
    matchCalloutInner,
  );
  svgEl('circle', { cx: '0', cy: '46', r: '3.5', fill: colors.brass }, matchCalloutInner);
  const matchCalloutPill = bottles.createSvgScrimLabel('Bottle 3 = Coaster 3  ✓', {
    x: 0,
    y: 0,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#7A4F09',
    fill: '#FDF3D3',
    stroke: colors.brass,
    strokeWidth: 1.5,
    padX: 13,
    padY: 6,
  });
  matchCalloutInner.appendChild(matchCalloutPill);

  // Beat 3: Clean swap badge above Slots 0 & 2
  const swapBadgeOuter = svgEl('g', { transform: 'translate(370, 124)' }, svg3d);
  const swapBadgeInner = svgEl('g', {}, swapBadgeOuter);
  gsap.set(swapBadgeInner, { autoAlpha: 0 });
  const swapBadgePill = bottles.createSvgScrimLabel('Swap Bottle 0 ↔ Bottle 2', {
    x: 0,
    y: 0,
    fontSize: 13.5,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#A93825',
    fill: '#FFF5F2',
    stroke: colors.terracotta,
    strokeWidth: 1.5,
    padX: 14,
    padY: 6,
  });
  swapBadgeInner.appendChild(swapBadgePill);

  // Beat 4: 6 floating '?' mystery halos positioned directly above each 3D bottle cork
  const mysteryGroup = svgEl('g', {}, svg3d);
  gsap.set(mysteryGroup, { autoAlpha: 0 });
  const mysteryBadges = [];
  for (let i = 0; i < 6; i++) {
    const mg = svgEl('g', { transform: `translate(${240 + i * 160}, 148)` }, mysteryGroup);
    const inner = svgEl('g', {}, mg);
    svgEl(
      'circle',
      {
        cx: '0',
        cy: '0',
        r: '17',
        fill: '#FFFBF2',
        'fill-opacity': '0.94',
        stroke: colors.brass,
        'stroke-width': '1.6',
      },
      inner,
    );
    svgEl(
      'text',
      {
        x: '0',
        y: '1',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: colors.brass,
        'font-family': "'Fraunces', Georgia, serif",
        'font-size': '18',
        'font-weight': '700',
        textContent: '?',
      },
      inner,
    );
    mysteryBadges.push({ outer: mg, inner });
  }

  const mysteryNote = bottles.createSvgScrimLabel('Only the total count (f = 2) is shown — never which bottles match', {
    x: 640,
    y: 534,
    fontSize: 13.5,
    fontWeight: 600,
    color: colors.ink,
    fill: '#FFFBF2',
    stroke: 'rgba(200, 138, 30, 0.42)',
    strokeWidth: 1.3,
    padX: 18,
    padY: 7,
  });
  gsap.set(mysteryNote, { autoAlpha: 0 });
  svg3d.appendChild(mysteryNote);

  // Bottom clean alignment strip for Beats 1–3 (only one active at a time at y = 534)
  const xrayStrip = bottles.createSvgScrimLabel(
    'Bottles: [0, 1, 2, 3, 4, 5]   ·   Secret Coasters: [2, 0, 5, 3, 1, 4]',
    {
      x: 640,
      y: 534,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 600,
      color: colors.ink,
      fill: '#FFFBF2',
      stroke: 'rgba(107, 94, 84, 0.25)',
      padX: 18,
      padY: 7,
    },
  );
  gsap.set(xrayStrip, { autoAlpha: 0 });
  svg3d.appendChild(xrayStrip);

  const swapStrip = bottles.createSvgScrimLabel(
    'New Lineup: [2, 1, 0, 3, 4, 5]   ·   Referee Score: f = 1 → 2',
    {
      x: 640,
      y: 534,
      fontSize: 13.5,
      fontFamily: 'mono',
      fontWeight: 600,
      color: colors.sage,
      fill: '#F7FCF9',
      stroke: 'rgba(78, 140, 111, 0.36)',
      padX: 18,
      padY: 7,
    },
  );
  gsap.set(swapStrip, { autoAlpha: 0 });
  svg3d.appendChild(swapStrip);

  // Dynamic 3D->2D projection helper so SVG callouts sit precisely above 3D bottles
  const projVec = new THREE.Vector3();
  function syncProjectedOverlays() {
    camera.updateMatrixWorld();
    const projectPoint = (x, y, z) => {
      projVec.set(x, y, z).project(camera);
      return {
        x: (projVec.x * 0.5 + 0.5) * W,
        y: (-projVec.y * 0.5 + 0.5) * H,
      };
    };

    const p3 = projectPoint(slotX[3], 2.55, 0);
    matchCalloutOuter.setAttribute('transform', `translate(${p3.x.toFixed(1)}, ${Math.max(108, p3.y - 68).toFixed(1)})`);

    const pMid02 = projectPoint((slotX[0] + slotX[2]) * 0.5, 3.0, 0);
    swapBadgeOuter.setAttribute('transform', `translate(${pMid02.x.toFixed(1)}, ${Math.max(114, pMid02.y - 24).toFixed(1)})`);

    for (let i = 0; i < 6; i++) {
      const pm = projectPoint(slotX[i], 2.75, 0);
      mysteryBadges[i].outer.setAttribute('transform', `translate(${pm.x.toFixed(1)}, ${Math.max(118, pm.y - 16).toFixed(1)})`);
    }
  }

  // =========================================================================
  // ACT 2 (Beat 5): TWO DISTINCT GAMES — CLEAN FULL-STAGE SPLIT COMPARISON
  // =========================================================================
  const actSplitSvg = createSvg(W, H, {
    style: 'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;',
  });
  gsap.set(actSplitSvg, { autoAlpha: 0 });
  container.appendChild(actSplitSvg);

  // Subtle brass center divider
  svgEl(
    'line',
    {
      x1: '640',
      y1: '78',
      x2: '640',
      y2: '532',
      stroke: 'rgba(107, 94, 84, 0.24)',
      'stroke-width': '1.5',
      'stroke-dasharray': '5 5',
    },
    actSplitSvg,
  );

  // Left half: Game 1 (Single Pair Swap)
  const g1Group = svgEl('g', {}, actSplitSvg);
  svgEl(
    'text',
    {
      x: '335',
      y: '96',
      'text-anchor': 'middle',
      fill: colors.ink,
      'font-family': "'Fraunces', Georgia, serif",
      'font-size': '30',
      'font-weight': '600',
      textContent: 'Game 1',
    },
    g1Group,
  );
  g1Group.appendChild(
    bottles.createSvgScrimLabel('Swap a Single Pair per Turn', {
      x: 335,
      y: 136,
      fontSize: 13.5,
      fontWeight: 700,
      color: '#A93825',
      fill: '#FFF5F2',
      stroke: 'rgba(217, 93, 72, 0.35)',
      padX: 16,
      padY: 6,
    }),
  );

  // Wooden shelf bar for Game 1
  svgEl(
    'rect',
    {
      x: '82',
      y: '396',
      width: '506',
      height: '12',
      rx: '5',
      fill: colors.wood,
      stroke: colors.ink,
      'stroke-width': '1.4',
    },
    g1Group,
  );

  const g1SlotX = [130, 212, 294, 376, 458, 540];
  const g1Bottles = [];
  for (let i = 0; i < 6; i++) {
    const c = bottles.createSvgCoaster(SECRET[i], {
      x: g1SlotX[i],
      y: 394,
      scale: 0.72,
      hidden: true,
      showLabel: true,
    });
    g1Group.appendChild(c);

    const bWrap = svgEl('g', { transform: `translate(${g1SlotX[i]}, 393)` }, g1Group);
    const bInner = svgEl('g', {}, bWrap);
    bInner.appendChild(bottles.createSvgBottle(i, { scale: 0.72, liquidLevel: liquidLevels[i] }));
    g1Bottles.push({ wrap: bWrap, inner: bInner });
  }

  // Clean arched terracotta swap indicator above Slots 0 & 2
  const g1Arc = svgEl(
    'path',
    {
      d: `M ${g1SlotX[0]} 292 C ${g1SlotX[0]} 226, ${g1SlotX[2]} 226, ${g1SlotX[2]} 292`,
      fill: 'none',
      stroke: colors.terracotta,
      'stroke-width': '2.6',
      'stroke-linecap': 'round',
      'stroke-dasharray': '6 4',
    },
    g1Group,
  );
  gsap.set(g1Arc, { autoAlpha: 0 });
  const g1ArcLabel = bottles.createSvgScrimLabel('0 ↔ 2', {
    x: (g1SlotX[0] + g1SlotX[2]) / 2,
    y: 234,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#A93825',
    fill: '#FFF5F2',
    stroke: colors.terracotta,
    padX: 10,
    padY: 4,
  });
  gsap.set(g1ArcLabel, { autoAlpha: 0 });
  g1Group.appendChild(g1ArcLabel);

  g1Group.appendChild(
    bottles.createSvgScrimLabel('2 bottles move  ·  4 stay fixed', {
      x: 335,
      y: 492,
      fontSize: 13.5,
      fontWeight: 600,
      color: colors.sepia,
      padX: 16,
      padY: 6,
    }),
  );

  // Right half: Game 2 (Full Table Reorder)
  const g2Group = svgEl('g', {}, actSplitSvg);
  svgEl(
    'text',
    {
      x: '945',
      y: '96',
      'text-anchor': 'middle',
      fill: colors.ink,
      'font-family': "'Fraunces', Georgia, serif",
      'font-size': '30',
      'font-weight': '600',
      textContent: 'Game 2',
    },
    g2Group,
  );
  g2Group.appendChild(
    bottles.createSvgScrimLabel('Reorder Every Bottle at Once', {
      x: 945,
      y: 136,
      fontSize: 13.5,
      fontWeight: 700,
      color: '#2B6185',
      fill: '#F1F8FC',
      stroke: 'rgba(61, 126, 166, 0.35)',
      padX: 16,
      padY: 6,
    }),
  );

  svgEl(
    'rect',
    {
      x: '692',
      y: '396',
      width: '506',
      height: '12',
      rx: '5',
      fill: colors.wood,
      stroke: colors.ink,
      'stroke-width': '1.4',
    },
    g2Group,
  );

  const g2SlotX = [740, 822, 904, 986, 1068, 1150];
  const g2Bottles = [];
  for (let i = 0; i < 6; i++) {
    const c = bottles.createSvgCoaster(SECRET[i], {
      x: g2SlotX[i],
      y: 394,
      scale: 0.72,
      hidden: true,
      showLabel: true,
    });
    g2Group.appendChild(c);

    const bWrap = svgEl('g', { transform: `translate(${g2SlotX[i]}, 393)` }, g2Group);
    const bInner = svgEl('g', {}, bWrap);
    bInner.appendChild(bottles.createSvgBottle(i, { scale: 0.72, liquidLevel: liquidLevels[i] }));
    g2Bottles.push({ wrap: bWrap, inner: bInner });
  }

  // Graceful delft-blue permutation ribbon banner above Game 2
  const g2SwirlBadge = bottles.createSvgScrimLabel('Any permutation π ∈ Sₙ', {
    x: 945,
    y: 196,
    fontSize: 13,
    fontFamily: 'mono',
    fontWeight: 700,
    color: '#2B6185',
    fill: '#F1F8FC',
    stroke: colors.delft,
    padX: 13,
    padY: 4,
  });
  gsap.set(g2SwirlBadge, { autoAlpha: 0 });
  g2Group.appendChild(g2SwirlBadge);

  g2Group.appendChild(
    bottles.createSvgScrimLabel('All n bottles rearrange in 1 query', {
      x: 945,
      y: 492,
      fontSize: 13.5,
      fontWeight: 600,
      color: colors.sepia,
      padX: 16,
      padY: 6,
    }),
  );

  // =========================================================================
  // ACT 3 (Beat 6): TWO-PART EDITORIAL ROADMAP (Airy Sunlit Diptych)
  // =========================================================================
  const actRoadmap = document.createElement('div');
  actRoadmap.style.cssText =
    'position:absolute;left:0;top:0;width:1280px;height:590px;pointer-events:none;opacity:0;visibility:hidden;';
  container.appendChild(actRoadmap);

  const roadmapTitle = document.createElement('div');
  roadmapTitle.style.cssText =
    'position:absolute;left:0;right:0;top:66px;text-align:center;' +
    "font-family:'Fraunces',Georgia,serif;font-size:30px;font-weight:600;color:#1F1A17;letter-spacing:-0.015em;";
  roadmapTitle.textContent = 'Two Games, Two Breakthroughs';
  actRoadmap.appendChild(roadmapTitle);

  function makeRoadmapColumn({ left, accent, eyebrow, title, rows, footer }) {
    const col = document.createElement('div');
    col.style.cssText =
      `position:absolute;left:${left}px;top:128px;width:490px;height:368px;` +
      'background:rgba(255,251,242,0.92);border:1px solid rgba(107,94,84,0.22);' +
      `border-top:4px solid ${accent};border-radius:16px;padding:26px 32px;` +
      'box-shadow:0 12px 32px rgba(68,50,32,0.08);display:flex;flex-direction:column;justify-content:space-between;';

    const top = document.createElement('div');
    top.innerHTML =
      `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:0.12em;color:${accent};text-transform:uppercase;margin-bottom:8px;">${eyebrow}</div>` +
      `<div style="font-family:'Fraunces',Georgia,serif;font-size:27px;font-weight:600;color:#1F1A17;line-height:1.15;">${title}</div>`;
    col.appendChild(top);

    const mid = document.createElement('div');
    mid.style.cssText = 'display:flex;flex-direction:column;gap:14px;margin:14px 0;';
    for (const r of rows) {
      const rowEl = document.createElement('div');
      rowEl.style.cssText =
        'display:flex;align-items:center;justify-content:space-between;padding:11px 16px;' +
        'border-radius:10px;background:#F6F1E7;border:1px solid rgba(107,94,84,0.16);';
      rowEl.innerHTML =
        `<span style="font-size:14px;font-weight:600;color:#6B5E54;">${r.label}</span>` +
        `<span style="font-size:19px;font-weight:700;color:${r.color || '#1F1A17'};">${renderMath(r.tex)}</span>`;
      mid.appendChild(rowEl);
    }
    col.appendChild(mid);

    const bot = document.createElement('div');
    bot.style.cssText =
      "font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:15px;color:#6B5E54;line-height:1.35;";
    bot.textContent = footer;
    col.appendChild(bot);

    return col;
  }

  const colPart1 = makeRoadmapColumn({
    left: 118,
    accent: colors.terracotta,
    eyebrow: 'Part I · Chapters 2–5 · Single-Pair Swap',
    title: 'Exact Swap Limits',
    rows: [
      { label: 'Deterministic Lower & Upper', tex: '\\tfrac{1}{4} n^2', color: '#A93825' },
      { label: 'Randomized Expected Bound', tex: '\\tfrac{1}{8} n^2', color: '#8D5B0C' },
    ],
    footer: 'Prove tight lower bounds and eliminate every wasted repeat.',
  });
  const colPart2 = makeRoadmapColumn({
    left: 672,
    accent: colors.delft,
    eyebrow: 'Part II · Chapters 6–12 · Full Reorder',
    title: 'Breaking the Barrier',
    rows: [
      { label: 'Classic Static / Naive Limit', tex: 'O(n \\log n)', color: '#6B5E54' },
      { label: 'New Adaptive Bottle Scale', tex: 'O(n \\log \\log n)', color: '#2B6185' },
    ],
    footer: 'Turn physical bottles into a coin-weighing scale & orient loops.',
  });

  actRoadmap.appendChild(colPart1);
  actRoadmap.appendChild(colPart2);

  const roadmapFoot = document.createElement('div');
  roadmapFoot.className = 'label-scrim';
  roadmapFoot.style.cssText =
    'position:absolute;left:50%;top:524px;transform:translateX(-50%);' +
    "font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;color:#6B5E54;padding:6px 18px;";
  roadmapFoot.textContent = 'Starting with Part I: Game 1 Lower Bounds & Optimal Folding →';
  actRoadmap.appendChild(roadmapFoot);

  // =========================================================================
  // TIMELINE CHOREOGRAPHY (STRICTLY SYNCED TO AUDIO BEATS)
  // =========================================================================
  const b0 = beatSpan(ctx, 0, 0.8, 9.984);
  const b1 = beatSpan(ctx, 1, 11.334, 8.592);
  const b2 = beatSpan(ctx, 2, 20.476, 8.136);
  const b3 = beatSpan(ctx, 3, 29.162, 9.0);
  const b4 = beatSpan(ctx, 4, 38.712, 8.664);
  const b5 = beatSpan(ctx, 5, 47.926, 9.384);
  const b6 = beatSpan(ctx, 6, 57.86, 9.36);

  const tl = gsap.timeline({ paused: true });

  // --- Beat 0: Six bottles descend gently onto six veiled '?' coasters ---
  for (let i = 0; i < 6; i++) {
    tl.from(
      bottles3d[i].position,
      { y: 1.8, duration: 0.75, ease: 'power3.out' },
      b0.start + 0.15 + i * 0.12,
    );
  }
  tl.to(
    camState,
    {
      y: 3.75,
      z: 9.55,
      lookY: 0.82,
      duration: 2.2,
      ease: 'power2.out',
    },
    b0.start,
  );
  tl.to(modePillPlayer, { autoAlpha: 1, duration: 0.5 }, b0.start + 0.5);

  // --- Beat 1: Audience X-Ray reveal showing secret permutation [2, 0, 5, 3, 1, 4] ---
  tl.to(modePillPlayer, { autoAlpha: 0, duration: 0.3 }, b1.start);
  tl.to(modePillXray, { autoAlpha: 1, duration: 0.4 }, b1.start + 0.3);
  tl.to(
    camState,
    { y: 4.35, z: 9.15, lookY: 0.62, duration: 1.3, ease: 'power2.inOut' },
    b1.start + 0.1,
  );
  for (let i = 0; i < 6; i++) {
    bottles.setCoasterRevealed(coasters3d[i], true, tl, b1.start + 0.7 + i * 0.14, 0.48);
  }
  tl.to(xrayStrip, { autoAlpha: 1, duration: 0.5 }, b1.start + 1.4);

  // --- Beat 2: Bottle 3 matches Coaster 3 -> golden glow + Referee Score f = 1 ---
  tl.to(slot3HaloMat, { opacity: 0.88, duration: 0.55, ease: 'power2.out' }, b2.start + 0.6);
  tl.to(
    bottles3d[3].userData.matchRing.material,
    { opacity: 0.96, duration: 0.55 },
    b2.start + 0.6,
  );
  tl.to(
    coasters3d[3].userData.brassRing.material,
    { emissiveIntensity: 0.62, duration: 0.55 },
    b2.start + 0.6,
  );
  tl.to(
    coasters3d[3].userData.brassRing.material.emissive,
    { r: 0.88, g: 0.62, b: 0.14, duration: 0.55 },
    b2.start + 0.6,
  );
  tl.to(bottles3d[3].position, { y: 0.14, duration: 0.45, ease: 'power2.out' }, b2.start + 0.7);
  tl.to(bottles3d[3].position, { y: 0, duration: 0.5, ease: 'bounce.out' }, b2.start + 1.15);
  tl.to(matchCalloutInner, { autoAlpha: 1, duration: 0.45 }, b2.start + 0.9);
  tl.to(
    scoreInner,
    { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' },
    b2.start + 2.6,
  );

  // --- Beat 3: Veil coasters back to '?', swap Bottle 0 <-> Bottle 2, score updates f = 2 ---
  tl.to(matchCalloutInner, { autoAlpha: 0, duration: 0.3 }, b3.start);
  tl.to(modePillXray, { autoAlpha: 0, duration: 0.3 }, b3.start);
  tl.to(xrayStrip, { autoAlpha: 0, duration: 0.3 }, b3.start);
  tl.to(slot3HaloMat, { opacity: 0, duration: 0.35 }, b3.start);
  tl.to(bottles3d[3].userData.matchRing.material, { opacity: 0, duration: 0.35 }, b3.start);
  tl.to(coasters3d[3].userData.brassRing.material, { emissiveIntensity: 0, duration: 0.35 }, b3.start);

  for (let i = 0; i < 6; i++) {
    bottles.setCoasterRevealed(coasters3d[i], false, tl, b3.start + 0.25 + i * 0.06, 0.4);
  }
  tl.to(modePillHidden, { autoAlpha: 1, duration: 0.4 }, b3.start + 0.45);
  tl.to(
    camState,
    { y: 3.75, z: 9.5, lookY: 0.8, duration: 1.0, ease: 'power2.inOut' },
    b3.start + 0.2,
  );

  // Swap Bottle 0 (at slotX[0]) with Bottle 2 (at slotX[2]) cleanly in 3D arcs
  const swapT = b3.start + 2.3;
  tl.to(swapBadgeInner, { autoAlpha: 1, duration: 0.35 }, swapT - 0.3);

  // Bottle 0: lift & forward arc to slot 2
  tl.to(bottles3d[0].position, { x: slotX[2], duration: 1.35, ease: 'power2.inOut' }, swapT);
  tl.to(bottles3d[0].position, { y: 1.25, duration: 0.67, ease: 'power2.out' }, swapT);
  tl.to(bottles3d[0].position, { y: 0, duration: 0.68, ease: 'power2.in' }, swapT + 0.67);
  tl.to(bottles3d[0].position, { z: 0.85, duration: 0.67, ease: 'sine.out' }, swapT);
  tl.to(bottles3d[0].position, { z: 0, duration: 0.68, ease: 'sine.in' }, swapT + 0.67);

  // Bottle 2: lift & backward arc to slot 0
  tl.to(bottles3d[2].position, { x: slotX[0], duration: 1.35, ease: 'power2.inOut' }, swapT);
  tl.to(bottles3d[2].position, { y: 1.05, duration: 0.67, ease: 'power2.out' }, swapT);
  tl.to(bottles3d[2].position, { y: 0, duration: 0.68, ease: 'power2.in' }, swapT + 0.67);
  tl.to(bottles3d[2].position, { z: -0.85, duration: 0.67, ease: 'sine.out' }, swapT);
  tl.to(bottles3d[2].position, { z: 0, duration: 0.68, ease: 'sine.in' }, swapT + 0.67);

  // Score updates 1 -> 2 after landing
  const landT = swapT + 1.55;
  tl.to(scoreVal1, { autoAlpha: 0, duration: 0.22 }, landT);
  tl.to(scoreVal2, { autoAlpha: 1, duration: 0.3 }, landT + 0.14);
  tl.to(scoreInner, { scale: 1.08, duration: 0.22, ease: 'power2.out' }, landT);
  tl.to(scoreInner, { scale: 1.0, duration: 0.32, ease: 'power2.inOut' }, landT + 0.22);
  tl.to(swapStrip, { autoAlpha: 1, duration: 0.45 }, landT + 0.2);

  // --- Beat 4: Mystery '?' halos above all 6 slots (never reveals WHICH 2 matched) ---
  tl.to(swapBadgeInner, { autoAlpha: 0, duration: 0.3 }, b4.start);
  tl.to(swapStrip, { autoAlpha: 0, duration: 0.3 }, b4.start);
  tl.to(mysteryGroup, { autoAlpha: 1, duration: 0.5 }, b4.start + 0.35);
  tl.to(mysteryNote, { autoAlpha: 1, duration: 0.45 }, b4.start + 0.65);

  for (let i = 0; i < 6; i++) {
    tl.fromTo(
      mysteryBadges[i].inner,
      { y: 0, scale: 0.92 },
      { y: -6, scale: 1.06, duration: 0.85, repeat: 4, yoyo: true, ease: 'sine.inOut' },
      b4.start + 0.5 + i * 0.14,
    );
  }

  // --- Beat 5: Clean cross-fade from 3D table to Split Comparison (Game 1 vs Game 2) ---
  tl.to(act3dWrap, { autoAlpha: 0, duration: 0.42, ease: 'power2.in' }, b5.start);
  tl.to(actSplitSvg, { autoAlpha: 1, duration: 0.48, ease: 'power2.out' }, b5.start + 0.45);

  // Game 1 swap demo (Bottle 0 <-> Bottle 2)
  const g1SwapT = b5.start + 1.8;
  const dx02 = g1SlotX[2] - g1SlotX[0];
  tl.to([g1Arc, g1ArcLabel], { autoAlpha: 1, duration: 0.4 }, g1SwapT - 0.35);
  tl.to(g1Bottles[0].inner, { x: dx02, duration: 1.15, ease: 'power2.inOut' }, g1SwapT);
  tl.to(g1Bottles[0].inner, { y: -48, duration: 0.57, ease: 'power2.out' }, g1SwapT);
  tl.to(g1Bottles[0].inner, { y: 0, duration: 0.58, ease: 'power2.in' }, g1SwapT + 0.57);

  tl.to(g1Bottles[2].inner, { x: -dx02, duration: 1.15, ease: 'power2.inOut' }, g1SwapT);
  tl.to(g1Bottles[2].inner, { y: -24, duration: 0.57, ease: 'power2.out' }, g1SwapT);
  tl.to(g1Bottles[2].inner, { y: 0, duration: 0.58, ease: 'power2.in' }, g1SwapT + 0.57);

  // Game 2 full-table permutation swirl [0,1,2,3,4,5] -> [4,0,5,2,1,3]
  const g2SwirlT = b5.start + 4.4;
  const g2TargetSlot = [1, 4, 3, 5, 0, 2]; // bottle i moves to slot g2TargetSlot[i]
  tl.to(g2SwirlBadge, { autoAlpha: 1, duration: 0.4 }, g2SwirlT - 0.35);
  for (let i = 0; i < 6; i++) {
    const dx = g2SlotX[g2TargetSlot[i]] - g2SlotX[i];
    const lift = -26 - (i % 3) * 10;
    tl.to(g2Bottles[i].inner, { x: dx, duration: 1.35, ease: 'power2.inOut' }, g2SwirlT + i * 0.05);
    tl.to(g2Bottles[i].inner, { y: lift, duration: 0.65, ease: 'power2.out' }, g2SwirlT + i * 0.05);
    tl.to(g2Bottles[i].inner, { y: 0, duration: 0.7, ease: 'power2.in' }, g2SwirlT + 0.65 + i * 0.05);
  }

  // --- Beat 6: Clean cross-fade to 2-Part Editorial Roadmap ---
  tl.to(actSplitSvg, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, b6.start);
  tl.to(actRoadmap, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, b6.start + 0.42);
  tl.from(colPart1, { y: 22, opacity: 0, duration: 0.65, ease: 'power3.out' }, b6.start + 0.5);
  tl.from(colPart2, { y: 22, opacity: 0, duration: 0.65, ease: 'power3.out' }, b6.start + 2.2);
  tl.from(roadmapFoot, { y: 12, opacity: 0, duration: 0.5, ease: 'power2.out' }, b6.start + 3.8);

  // Pad timeline cleanly to full audio duration
  const totalDur = Math.max(ctx.duration || sceneMeta.duration, tl.duration() + 0.2);
  if (tl.duration() < totalDur) {
    tl.to({}, { duration: totalDur - tl.duration() }, tl.duration());
  }

  // Render loop synced with player.onFrame
  const stopFrame = ctx.onFrame((_dt, elapsed) => {
    // Gentle sunlit breathing camera micro-drift during Act 1 only
    const drift = Math.sin(elapsed * 0.55) * 0.14;
    camera.position.set(camState.x + drift, camState.y, camState.z);
    camera.lookAt(camState.lookX, camState.lookY, camState.lookZ);
    syncProjectedOverlays();
    if (!webglFailed && renderer) {
      renderer.render(threeScene, camera);
    }
  });

  // Initial synchronous render
  syncProjectedOverlays();
  if (!webglFailed && renderer) {
    renderer.render(threeScene, camera);
  }

  function destroy() {
    stopFrame?.();
    if (renderer) {
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
      renderer.dispose();
      renderer = null;
    }
  }

  return { timeline: tl, destroy };
}
