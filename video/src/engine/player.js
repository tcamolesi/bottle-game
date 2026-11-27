import gsap from 'gsap';
import * as THREE from 'three';
import {
  katex,
  renderMath,
  createMathEl,
  renderRichText,
  createSvg,
  svgEl,
  escapeHtml,
} from './math.js';
import {
  PALETTE,
  createSvgBottle,
  createSvgCoaster,
  setCoasterRevealed,
  createSvgScrimLabel,
  createSvgBrassScale,
  scaleAngleForValue,
  setScaleValue,
  createThreeBottle,
  createThreeCoaster,
  createPaperGrainFilterSvg,
  getBottleColor,
} from './bottles.js';
import { audioEngine } from './audio.js';

// Statically bundle voice_manifest.json when present (graceful fallback during early dev)
const manifestModules = import.meta.glob('../audio/voice_manifest.json', { eager: true });
const VOICE_MANIFEST = (() => {
  const keys = Object.keys(manifestModules);
  if (!keys.length) return null;
  const mod = manifestModules[keys[0]];
  return mod?.default || mod || null;
})();

export const STAGE_WIDTH = 1280;
export const STAGE_HEIGHT = 720;
export const SAFE_HEIGHT = 590;
export const THEME_COLORS = PALETTE;

const BOTTLES_KIT = {
  PALETTE,
  createSvgBottle,
  createSvgCoaster,
  setCoasterRevealed,
  createSvgScrimLabel,
  createSvgBrassScale,
  scaleAngleForValue,
  setScaleValue,
  createThreeBottle,
  createThreeCoaster,
  createPaperGrainFilterSvg,
  getBottleColor,
};

const SPEED_OPTIONS = [1, 1.25, 1.5, 2];

const ICONS = {
  play: '<svg viewBox="0 0 24 24"><path d="M7.5 5.25L18.75 12L7.5 18.75V5.25Z"/></svg>',
  pause:
    '<svg viewBox="0 0 24 24"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M6 6v12"/><path d="M18 6l-8.5 6L18 18V6z"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M18 6v12"/><path d="M6 6l8.5 6L6 18V6z"/></svg>',
  sfxOn:
    '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  sfxOff:
    '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M22 9l-6 6"/><path d="M16 9l6 6"/></svg>',
  voiceOn:
    '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4"/><path d="M9 21h6"/></svg>',
  voiceOff:
    '<svg viewBox="0 0 24 24"><path d="M9 9v2a3 3 0 0 0 5.12 2.12"/><path d="M15 9.34V6a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 11"/><path d="M12 18v3"/><path d="M3 3l18 18"/></svg>',
  transcript:
    '<svg viewBox="0 0 24 24"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/></svg>',
  fullscreen:
    '<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
  exitFullscreen:
    '<svg viewBox="0 0 24 24"><path d="M3 8h3a2 2 0 0 0 2-2V3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>',
};

function formatTime(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function parseUrlParams() {
  const out = {};
  const parseString = (str) => {
    if (!str) return;
    const clean = str.replace(/^[?#]/, '');
    const sp = new URLSearchParams(clean);
    for (const [k, v] of sp.entries()) {
      out[k] = v;
    }
  };
  parseString(window.location.search);
  parseString(window.location.hash);
  return out;
}

function lookupManifestScene(manifest, sceneModule, idx) {
  if (!manifest || !manifest.scenes) return null;
  const metaId = sceneModule?.sceneMeta?.id;
  const defaultId = `scene${idx + 1}`;
  if (Array.isArray(manifest.scenes)) {
    return (
      manifest.scenes.find((s) => s?.id === metaId || s?.id === defaultId || s?.number === idx + 1) ||
      manifest.scenes[idx] ||
      null
    );
  }
  return manifest.scenes[metaId] || manifest.scenes[defaultId] || Object.values(manifest.scenes)[idx] || null;
}

function normalizeBeats(rawBeats = [], sceneId = 'scene', totalDuration = 30) {
  if (!Array.isArray(rawBeats) || !rawBeats.length) return [];
  const sorted = [...rawBeats]
    .map((b, i) => {
      const start = Number(b.start ?? b.time ?? 0);
      return { ...b, _origIdx: i, start, time: start };
    })
    .sort((a, b) => a.start - b.start);

  return sorted.map((b, i) => {
    const nextStart = i + 1 < sorted.length ? sorted[i + 1].start : totalDuration;
    const end = Number(b.end) || Math.max(b.start + 0.5, nextStart);
    const audioDuration = Number(b.audioDuration) || Math.max(0.5, end - b.start);
    return {
      id: b.id || `${sceneId}_b${i}`,
      start: b.start,
      time: b.start,
      audioDuration,
      end,
      text: b.text || '',
      highlight: Array.isArray(b.highlight) ? b.highlight : [],
      visualCue: b.visualCue || '',
      cue: b.cue || null,
      audioDataUri: b.audioDataUri || null,
    };
  });
}

function resolveSceneData(manifest, sceneModule, idx) {
  const mScene = lookupManifestScene(manifest, sceneModule, idx);
  const sMeta = sceneModule?.sceneMeta || {};
  const id = mScene?.id || sMeta.id || `scene${idx + 1}`;
  const number = mScene?.number ?? sMeta.number ?? idx + 1;
  const title = mScene?.title || sMeta.title || `Chapter ${number}`;
  const chapter = mScene?.chapter || sMeta.chapter || '';
  const duration = Math.max(1, Number(mScene?.duration ?? sMeta.duration) || 30);
  const rawBeats = Array.isArray(mScene?.beats) && mScene.beats.length ? mScene.beats : sMeta.beats || [];
  const beats = normalizeBeats(rawBeats, id, duration);

  return {
    id,
    number,
    title,
    chapter,
    duration,
    beats,
  };
}

export class CinemaPlayer {
  constructor(mountEl, scenes = []) {
    this.mountEl = mountEl;
    this.scenes = scenes;
    this.manifest = VOICE_MANIFEST;

    if (this.manifest) {
      audioEngine.loadManifest(this.manifest);
    }

    // Resolve authoritative audio-driven metadata for all scenes
    this.resolvedScenes = this.scenes.map((mod, i) => resolveSceneData(this.manifest, mod, i));

    this.currentIndex = 0;
    this.currentTime = 0;
    this.currentDuration = 1;
    this.currentBeatIndex = -1;
    this.currentSceneInstance = null;
    this.sortedBeats = [];

    this.isPlaying = false;
    this.playbackRate = 1.0;
    this.overlayDismissed = false;
    this.drawerOpen = false;
    this.isScrubbing = false;
    this._wasPlayingBeforeScrub = false;

    this.isFullscreen = false;
    this.isPseudoFullscreen = false;
    this.isMobilePortrait = false;
    this.isMobileLandscape = false;
    this.hudHidden = false;

    this._frameCallbacks = new Set();
    this._rafId = null;
    this._lastRafTs = 0;
    this._resizeObserver = null;
    this._captionAnimTimer = null;
    this._transitionTimer = null;
    this._hudHideTimer = null;

    // Precompute global timeline offsets from audio-measured durations
    this.sceneOffsets = [];
    let acc = 0;
    for (let i = 0; i < this.resolvedScenes.length; i++) {
      const dur = this.resolvedScenes[i].duration;
      this.sceneOffsets.push({ start: acc, duration: dur, end: acc + dur });
      acc += dur;
    }
    this.totalDuration = Math.max(1, acc);
  }

  init() {
    this._buildDOM();
    this._populateOverlayShelf();
    this._bindEvents();
    this._updateStageScale();
    this._exposeDebugApi();
    this._startRafLoop();

    const params = parseUrlParams();
    if (params.scene != null) {
      const rawScene = Number(params.scene);
      const targetIdx = Number.isFinite(rawScene)
        ? rawScene >= 1
          ? Math.min(this.scenes.length - 1, Math.floor(rawScene) - 1)
          : 0
        : 0;
      const targetT = Math.max(0, Number(params.t) || 0);
      this.gotoScene(targetIdx, targetT, { immediate: true, dismissOverlay: true });
      if (params.autoplay === '1' || params.play === '1') {
        this.play();
      }
    } else {
      // Mount Scene 1 at a serene preview frame behind the sunlit title cover
      const previewT = Math.min(2.0, (this.resolvedScenes[0]?.duration || 30) * 0.08);
      this.gotoScene(0, previewT, { immediate: true, dismissOverlay: false });
    }
  }

  _buildDOM() {
    const totalMins = Math.max(1, Math.round((this.totalDuration / 60) * 10) / 10);

    const chapterQuickBtns = this.resolvedScenes
      .map((meta, i) => {
        const num = String(meta.number).padStart(2, '0');
        const shortTitle = escapeHtml(meta.title);
        return `<button class="overlay-chapter-btn" data-jump-scene="${i}" title="${num} · ${shortTitle}"><span class="ch-idx">${num}</span><span class="ch-title">${shortTitle}</span></button>`;
      })
      .join('');

    const segGapPx = this.resolvedScenes.length > 9 ? 3 : 4;
    const segmentHtml = this.resolvedScenes
      .map((_, i) => {
        const dur = this.sceneOffsets[i].duration;
        const pct = (dur / this.totalDuration) * 100;
        return `<div class="timeline-seg" data-seg-idx="${i}" style="flex: 0 0 calc(${pct.toFixed(4)}% - ${segGapPx}px); flex-grow: ${dur};"><div class="timeline-seg-fill"></div></div>`;
      })
      .join('');

    const chapterDotsHtml = this.sceneOffsets
      .slice(1)
      .map((seg) => {
        const pct = (seg.start / this.totalDuration) * 100;
        return `<span class="timeline-chapter-dot" style="left:${pct.toFixed(3)}%;"></span>`;
      })
      .join('');

    const drawerScenesHtml = this.resolvedScenes
      .map((meta, i) => {
        const num = String(meta.number).padStart(2, '0');
        const title = escapeHtml(meta.title);
        const dur = formatTime(meta.duration);
        const beatsHtml = meta.beats
          .map((b, bi) => {
            const bt = formatTime(b.start);
            const html = renderRichText(b.text, b.highlight);
            return `
              <button class="drawer-beat" data-scene-idx="${i}" data-beat-idx="${bi}" data-beat-time="${b.start}">
                <span class="drawer-beat-time">${bt}</span>
                <span class="drawer-beat-text">${html}</span>
              </button>
            `;
          })
          .join('');
        return `
          <div class="drawer-scene" data-drawer-scene="${i}">
            <button class="drawer-scene-hdr" data-drawer-jump="${i}">
              <span><span class="drawer-scene-num">${num}</span><span class="drawer-scene-title">${title}</span></span>
              <span class="drawer-scene-dur">${dur}</span>
            </button>
            <div class="drawer-beats">${beatsHtml}</div>
          </div>
        `;
      })
      .join('');

    this.mountEl.innerHTML = `
      <div class="cinema-app" id="cinema-app">
        <div class="stage-viewport" id="stage-viewport">
          <div class="stage-scaler" id="stage-scaler">
            <div class="stage-frame" id="stage-frame">
              <div class="scene-root" id="scene-root"></div>

              <div class="stage-chapter-whisper" id="stage-chapter-whisper">
                <span class="whisper-num" id="whisper-num">01</span>
                <span class="whisper-sep">&middot;</span>
                <span class="whisper-title" id="whisper-title">The Bottle Game</span>
              </div>

              <div class="caption-feather" id="caption-bar" aria-live="polite">
                <p class="caption-text" id="caption-text"></p>
                <div class="caption-beat-progress" id="caption-beat-progress"></div>
              </div>
            </div>
          </div>

          <div class="play-overlay" id="play-overlay">
            <div class="overlay-frame-rule"></div>
            <div class="overlay-content">
              <div class="overlay-eyebrow">
                An Animated Mathematical Explainer<span>&middot;</span>${this.scenes.length} Chapters<span>&middot;</span>~${totalMins} min
              </div>

              <div class="overlay-shelf-wrap" id="overlay-shelf-wrap"></div>

              <h1 class="overlay-title">The Bottle Game</h1>
              <p class="overlay-subtitle">
                Six numbered bottles, one match count per move &mdash; and how two new algorithms beat the classic limits.
              </p>

              <div class="overlay-actions">
                <button class="btn-play-hero" id="btn-play-hero" type="button">
                  ${ICONS.play}
                  <span>Play Explainer</span>
                </button>
                <button class="btn-secondary-hero" id="btn-overlay-transcript" type="button">
                  ${ICONS.transcript}
                  <span>Chapters</span>
                </button>
              </div>

              <div class="overlay-chapters" data-count="${this.scenes.length}">${chapterQuickBtns}</div>
              <div class="overlay-hint">
                <kbd>Space</kbd> Play/Pause &nbsp;&middot;&nbsp;
                <kbd>&larr;</kbd><kbd>&rarr;</kbd> Chapters &nbsp;&middot;&nbsp;
                <kbd>1</kbd>&ndash;<kbd>9</kbd><kbd>0</kbd><kbd>-</kbd><kbd>=</kbd> Jump &nbsp;&middot;&nbsp;
                <kbd>T</kbd> Chapters &nbsp;&middot;&nbsp;
                <kbd>M</kbd> SFX &nbsp;&middot;&nbsp;
                <kbd>V</kbd> Voice
              </div>
            </div>
          </div>
        </div>

        <section class="mobile-companion" id="mobile-companion" aria-label="Chapter narration">
          <div class="mobile-companion-hdr">
            <div class="mobile-companion-chapter">
              <span class="whisper-num" id="mobile-chapter-num">01</span>
              <span class="whisper-sep">&middot;</span>
              <span class="mobile-chapter-title" id="mobile-chapter-name">The Bottle Game</span>
            </div>
            <button class="mobile-fs-btn" id="btn-mobile-fullscreen" title="Fullscreen" type="button">
              ${ICONS.fullscreen}<span>Full View</span>
            </button>
          </div>
          <div class="mobile-caption-box">
            <p class="mobile-caption-text" id="mobile-caption-text"></p>
          </div>
          <div class="mobile-caption-track">
            <div class="mobile-caption-progress" id="mobile-caption-progress"></div>
          </div>
          <div class="mobile-companion-hint">Tap video to play/pause &middot; Rotate for wide view</div>
        </section>

        <aside class="transcript-drawer" id="transcript-drawer" aria-label="Chapters and Transcript">
          <div class="drawer-header">
            <div>
              <h2 class="drawer-title">Chapters &amp; Narration</h2>
              <div class="drawer-sub">${this.scenes.length} Chapters &middot; ${formatTime(this.totalDuration)} Total</div>
            </div>
            <button class="hud-btn" id="btn-close-drawer" title="Close Chapters (T)" type="button">${ICONS.close}</button>
          </div>
          <div class="drawer-body" id="drawer-body">
            ${drawerScenesHtml}
          </div>
        </aside>

        <footer class="cinema-hud" id="cinema-hud">
          <div class="timeline-wrap" id="timeline-wrap" role="slider" aria-label="Film timeline" aria-valuemin="0" aria-valuemax="${Math.round(this.totalDuration)}" aria-valuenow="0">
            <div class="timeline-segments" id="timeline-segments">${segmentHtml}</div>
            <div class="timeline-chapter-dots" id="timeline-chapter-dots">${chapterDotsHtml}</div>
            <div class="timeline-playhead" id="timeline-playhead"></div>
            <div class="timeline-tooltip" id="timeline-tooltip"></div>
          </div>

          <div class="hud-controls">
            <div class="hud-group">
              <button class="hud-btn" id="btn-prev" title="Previous Chapter (←)" type="button">${ICONS.prev}</button>
              <button class="hud-btn btn-primary" id="btn-play" title="Play / Pause (Space)" type="button">${ICONS.play}</button>
              <button class="hud-btn" id="btn-next" title="Next Chapter (→)" type="button">${ICONS.next}</button>
              <div class="hud-time" id="hud-time">
                <span id="time-current">00:00</span><span class="sep"> / </span><span class="total" id="time-total">${formatTime(this.totalDuration)}</span>
              </div>
            </div>

            <button class="hud-chapter-indicator" id="btn-chapter-pill" title="Open Chapters & Narration (T)" type="button">
              <span class="chapter-num" id="hud-chapter-num">01</span>
              <span class="chapter-name" id="hud-chapter-name">The Bottle Game</span>
            </button>

            <div class="hud-group">
              <button class="speed-select" id="btn-speed" title="Playback Speed" type="button">1x</button>
              <button class="hud-btn is-active" id="btn-sfx" title="Toggle Sound Effects (M)" type="button">
                ${ICONS.sfxOn}<span class="hud-btn-label">SFX</span>
              </button>
              <button class="hud-btn is-active" id="btn-voice" title="Toggle Voiceover Narration (V)" type="button">
                ${ICONS.voiceOn}<span class="hud-btn-label">Voice</span>
              </button>
              <button class="hud-btn" id="btn-transcript" title="Toggle Chapters Drawer (T)" type="button">
                ${ICONS.transcript}<span class="hud-btn-label">Chapters</span>
              </button>
              <button class="hud-btn" id="btn-fullscreen" title="Fullscreen (F)" aria-pressed="false" type="button">
                ${ICONS.fullscreen}
              </button>
            </div>
          </div>
        </footer>
      </div>
    `;

    this.appEl = this.mountEl.querySelector('#cinema-app');
    this.viewportEl = this.mountEl.querySelector('#stage-viewport');
    this.scalerEl = this.mountEl.querySelector('#stage-scaler');
    this.stageFrameEl = this.mountEl.querySelector('#stage-frame');
    this.sceneRootEl = this.mountEl.querySelector('#scene-root');
    this.playOverlayEl = this.mountEl.querySelector('#play-overlay');
    this.captionBarEl = this.mountEl.querySelector('#caption-bar');
    this.captionTextEl = this.mountEl.querySelector('#caption-text');
    this.captionProgressEl = this.mountEl.querySelector('#caption-beat-progress');

    this.mobileCompanionEl = this.mountEl.querySelector('#mobile-companion');
    this.mobileChapterNumEl = this.mountEl.querySelector('#mobile-chapter-num');
    this.mobileChapterNameEl = this.mountEl.querySelector('#mobile-chapter-name');
    this.mobileCaptionTextEl = this.mountEl.querySelector('#mobile-caption-text');
    this.mobileCaptionProgressEl = this.mountEl.querySelector('#mobile-caption-progress');
    this.btnMobileFullscreenEl = this.mountEl.querySelector('#btn-mobile-fullscreen');

    this.hudEl = this.mountEl.querySelector('#cinema-hud');
    this.whisperNumEl = this.mountEl.querySelector('#whisper-num');
    this.whisperTitleEl = this.mountEl.querySelector('#whisper-title');

    this.timelineWrapEl = this.mountEl.querySelector('#timeline-wrap');
    this.playheadEl = this.mountEl.querySelector('#timeline-playhead');
    this.tooltipEl = this.mountEl.querySelector('#timeline-tooltip');
    this.segmentEls = Array.from(this.mountEl.querySelectorAll('.timeline-seg'));

    this.btnPlayEl = this.mountEl.querySelector('#btn-play');
    this.btnPrevEl = this.mountEl.querySelector('#btn-prev');
    this.btnNextEl = this.mountEl.querySelector('#btn-next');
    this.btnSpeedEl = this.mountEl.querySelector('#btn-speed');
    this.btnSfxEl = this.mountEl.querySelector('#btn-sfx');
    this.btnVoiceEl = this.mountEl.querySelector('#btn-voice');
    this.btnTranscriptEl = this.mountEl.querySelector('#btn-transcript');
    this.btnFullscreenEl = this.mountEl.querySelector('#btn-fullscreen');
    this.btnChapterPillEl = this.mountEl.querySelector('#btn-chapter-pill');
    this.btnPlayHeroEl = this.mountEl.querySelector('#btn-play-hero');
    this.btnOverlayTranscriptEl = this.mountEl.querySelector('#btn-overlay-transcript');
    this.btnCloseDrawerEl = this.mountEl.querySelector('#btn-close-drawer');

    this.timeCurrentEl = this.mountEl.querySelector('#time-current');
    this.hudChapterNumEl = this.mountEl.querySelector('#hud-chapter-num');
    this.hudChapterNameEl = this.mountEl.querySelector('#hud-chapter-name');
    this.drawerEl = this.mountEl.querySelector('#transcript-drawer');
    this.drawerBodyEl = this.mountEl.querySelector('#drawer-body');

    // Add ultra-subtle tactile SVG paper-grain overlay onto the sunlit stage
    const grainSvg = createPaperGrainFilterSvg({ width: STAGE_WIDTH, height: STAGE_HEIGHT, opacity: 0.042 });
    this.stageFrameEl.appendChild(grainSvg);
  }

  /**
   * Populate the enchanting landing cover with 6 handcrafted labeled apothecary
   * bottles (0..5) resting on numbered oak coasters on a sunlit walnut shelf.
   */
  _populateOverlayShelf() {
    const wrap = this.mountEl.querySelector('#overlay-shelf-wrap');
    if (!wrap) return;

    const svg = createSvg(680, 204, { class: 'overlay-shelf-svg' });

    // Soft warm sunlit backdrop halo behind the shelf
    const defs = svgEl('defs', {}, svg);
    const sunGrad = svgEl('radialGradient', { id: 'cover_sun', cx: '50%', cy: '44%', r: '52%' }, defs);
    svgEl('stop', { offset: '0%', 'stop-color': '#F5DFB0', 'stop-opacity': '0.45' }, sunGrad);
    svgEl('stop', { offset: '100%', 'stop-color': '#F5DFB0', 'stop-opacity': '0' }, sunGrad);

    const shelfWood = svgEl('linearGradient', { id: 'cover_shelf_wood', x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, defs);
    svgEl('stop', { offset: '0%', 'stop-color': '#CFA372' }, shelfWood);
    svgEl('stop', { offset: '55%', 'stop-color': '#B48252' }, shelfWood);
    svgEl('stop', { offset: '100%', 'stop-color': '#8A5E37' }, shelfWood);

    svgEl('ellipse', { cx: '340', cy: '96', rx: '310', ry: '88', fill: 'url(#cover_sun)' }, svg);

    // Wall shadow beneath wooden shelf
    svgEl(
      'rect',
      { x: '36', y: '154', width: '608', height: '18', rx: '9', fill: '#4A3828', opacity: '0.12' },
      svg,
    );

    // Wooden shelf brackets
    svgEl(
      'path',
      {
        d: 'M 86 154 L 86 178 Q 92 162 110 154 Z',
        fill: PALETTE.woodDark,
        stroke: PALETTE.ink,
        'stroke-width': '1.5',
      },
      svg,
    );
    svgEl(
      'path',
      {
        d: 'M 594 154 L 594 178 Q 588 162 570 154 Z',
        fill: PALETTE.woodDark,
        stroke: PALETTE.ink,
        'stroke-width': '1.5',
      },
      svg,
    );

    // Sunlit oak shelf plank
    svgEl(
      'rect',
      {
        x: '24',
        y: '138',
        width: '632',
        height: '18',
        rx: '5',
        fill: 'url(#cover_shelf_wood)',
        stroke: PALETTE.ink,
        'stroke-width': '1.8',
      },
      svg,
    );
    // Top bevel highlight on shelf
    svgEl(
      'line',
      {
        x1: '32',
        y1: '141',
        x2: '648',
        y2: '141',
        stroke: '#EAD0AA',
        'stroke-width': '1.5',
        opacity: '0.7',
      },
      svg,
    );

    // 6 handcrafted coasters + 6 numbered apothecary bottles (0..5)
    const startX = 95;
    const spacing = 98;
    const seatY = 136;
    const liquidLevels = [0.72, 0.62, 0.76, 0.66, 0.7, 0.64];

    for (let i = 0; i < 6; i++) {
      const cx = startX + i * spacing;
      const coaster = createSvgCoaster(i, {
        x: cx,
        y: seatY,
        width: 72,
        scale: 0.92,
        matched: i === 2 || i === 4,
        showLabel: true,
      });
      svg.appendChild(coaster);

      const bottle = createSvgBottle(i, {
        x: cx,
        y: seatY - 1,
        scale: 1.02,
        liquidLevel: liquidLevels[i],
        matched: i === 2 || i === 4,
      });
      svg.appendChild(bottle);
    }

    wrap.innerHTML = '';
    wrap.appendChild(svg);
  }

  _bindEvents() {
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this._updateStageScale());
      this._resizeObserver.observe(this.viewportEl);
      this._resizeObserver.observe(this.appEl);
    }
    window.addEventListener('resize', () => this._updateStageScale());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this._updateStageScale(), 80);
    });
    window.visualViewport?.addEventListener('resize', () => this._updateStageScale());
    document.addEventListener('fullscreenchange', () => this._syncFullscreenState());
    document.addEventListener('webkitfullscreenchange', () => this._syncFullscreenState());

    // Initial "Watch the Film" CTA (unlocks Web Audio cleanly)
    this.btnPlayHeroEl.addEventListener('click', () => {
      audioEngine.unlock();
      this.dismissOverlay();
      this.gotoScene(0, 0, { immediate: true, dismissOverlay: true });
      this.play();
    });

    this.btnOverlayTranscriptEl.addEventListener('click', () => {
      audioEngine.unlock();
      this.dismissOverlay();
      this.setDrawerOpen(true);
    });

    // Quick-jump chapter links inside title overlay
    this.mountEl.querySelectorAll('[data-jump-scene]').forEach((btn) => {
      btn.addEventListener('click', () => {
        audioEngine.unlock();
        const idx = Number(btn.dataset.jumpScene) || 0;
        this.gotoScene(idx, 0, { immediate: true, dismissOverlay: true });
        this.play();
      });
    });

    // Stage tap-to-reveal HUD (landscape/fullscreen) or toggle play/pause
    this.scalerEl.addEventListener('click', (e) => {
      if (!this.overlayDismissed) return;
      if (e.target.closest('button, a, input, select')) return;
      audioEngine.unlock();
      const overlayHud = this.isMobileLandscape || this.isFullscreen;
      if (overlayHud && this.hudHidden) {
        this._showHudTemporarily();
        return;
      }
      this.togglePlay();
      if (overlayHud) {
        this._showHudTemporarily();
      }
    });

    // Keep floating HUD awake while interacting with controls
    ['pointerdown', 'touchstart', 'mousemove'].forEach((evt) => {
      this.hudEl.addEventListener(evt, () => {
        if (this.isMobileLandscape || this.isFullscreen) {
          this._showHudTemporarily();
        }
      }, { passive: true });
    });

    // HUD transport buttons
    this.btnPlayEl.addEventListener('click', () => {
      audioEngine.unlock();
      if (!this.overlayDismissed) {
        this.dismissOverlay();
        this.gotoScene(0, 0, { immediate: true, dismissOverlay: true });
        this.play();
        return;
      }
      this.togglePlay();
    });

    this.btnPrevEl.addEventListener('click', () => {
      audioEngine.unlock();
      this.prevScene();
      this._showHudTemporarily();
    });

    this.btnNextEl.addEventListener('click', () => {
      audioEngine.unlock();
      this.nextScene();
      this._showHudTemporarily();
    });

    this.btnSpeedEl.addEventListener('click', () => {
      const idx = SPEED_OPTIONS.indexOf(this.playbackRate);
      const nextRate = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
      this.setSpeed(nextRate);
      this._showHudTemporarily();
    });

    this.btnSfxEl.addEventListener('click', () => {
      audioEngine.unlock();
      const next = !audioEngine.sfxEnabled;
      audioEngine.setSfxEnabled(next);
      this._syncAudioButtons();
      if (next) audioEngine.bell(1.0);
      this._showHudTemporarily();
    });

    this.btnVoiceEl.addEventListener('click', () => {
      audioEngine.unlock();
      const next = !audioEngine.voiceEnabled;
      audioEngine.setVoiceEnabled(next);
      this._syncAudioButtons();
      if (next && this.isPlaying) {
        const beat = this.sortedBeats[this.currentBeatIndex];
        audioEngine.syncVoice(beat, this.currentTime, true, this.playbackRate);
      }
      this._showHudTemporarily();
    });

    this.btnTranscriptEl.addEventListener('click', () => this.setDrawerOpen(!this.drawerOpen));
    this.btnChapterPillEl.addEventListener('click', () => this.setDrawerOpen(!this.drawerOpen));
    this.btnCloseDrawerEl.addEventListener('click', () => this.setDrawerOpen(false));
    this.btnFullscreenEl.addEventListener('click', () => {
      audioEngine.unlock();
      this.toggleFullscreen();
    });
    this.btnMobileFullscreenEl?.addEventListener('click', () => {
      audioEngine.unlock();
      this.toggleFullscreen();
    });

    // Transcript drawer click handlers
    this.drawerBodyEl.addEventListener('click', (e) => {
      const beatBtn = e.target.closest('.drawer-beat');
      if (beatBtn) {
        audioEngine.unlock();
        const sIdx = Number(beatBtn.dataset.sceneIdx) || 0;
        const t = Number(beatBtn.dataset.beatTime) || 0;
        const keepPlaying = this.isPlaying;
        this.gotoScene(sIdx, t, { immediate: true, dismissOverlay: true });
        if (keepPlaying) this.play();
        return;
      }
      const sceneBtn = e.target.closest('[data-drawer-jump]');
      if (sceneBtn) {
        audioEngine.unlock();
        const sIdx = Number(sceneBtn.dataset.drawerJump) || 0;
        const keepPlaying = this.isPlaying;
        this.gotoScene(sIdx, 0, { immediate: true, dismissOverlay: true });
        if (keepPlaying) this.play();
      }
    });

    // Global timeline scrubbing
    const scrubToClientX = (clientX) => {
      const rect = this.timelineWrapEl.getBoundingClientRect();
      if (!rect.width) return;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const globalSec = ratio * this.totalDuration;
      const { sceneIndex, localTime } = this._globalToLocal(globalSec);
      if (sceneIndex !== this.currentIndex) {
        this.gotoScene(sceneIndex, localTime, { immediate: true, dismissOverlay: true });
      } else {
        this.seekLocal(localTime, { immediateCaption: true });
      }
    };

    const updateTooltip = (clientX) => {
      const rect = this.timelineWrapEl.getBoundingClientRect();
      if (!rect.width) return;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const globalSec = ratio * this.totalDuration;
      const { sceneIndex, localTime } = this._globalToLocal(globalSec);
      const meta = this.resolvedScenes[sceneIndex] || {};
      const num = String(meta.number ?? sceneIndex + 1).padStart(2, '0');
      this.tooltipEl.innerHTML = `<strong>${num}. ${escapeHtml(meta.title || '')}</strong><span class="tt-time">${formatTime(localTime)}</span>`;
      const clampedPx = Math.max(88, Math.min(rect.width - 88, clientX - rect.left));
      this.tooltipEl.style.left = `${clampedPx}px`;
      this.tooltipEl.classList.add('is-visible');
    };

    this.timelineWrapEl.addEventListener('pointerdown', (e) => {
      audioEngine.unlock();
      this.isScrubbing = true;
      this._wasPlayingBeforeScrub = this.isPlaying;
      this.pause();
      this.timelineWrapEl.classList.add('is-dragging');
      this.timelineWrapEl.setPointerCapture?.(e.pointerId);
      scrubToClientX(e.clientX);
      updateTooltip(e.clientX);
    });

    this.timelineWrapEl.addEventListener('pointermove', (e) => {
      updateTooltip(e.clientX);
      if (this.isScrubbing) {
        scrubToClientX(e.clientX);
      }
    });

    const endScrub = (e) => {
      if (!this.isScrubbing) return;
      this.isScrubbing = false;
      this.timelineWrapEl.classList.remove('is-dragging');
      this.timelineWrapEl.releasePointerCapture?.(e.pointerId);
      if (this._wasPlayingBeforeScrub) {
        this.play();
      }
    };

    this.timelineWrapEl.addEventListener('pointerup', endScrub);
    this.timelineWrapEl.addEventListener('pointercancel', endScrub);
    this.timelineWrapEl.addEventListener('pointerleave', () => {
      if (!this.isScrubbing) this.tooltipEl.classList.remove('is-visible');
    });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        audioEngine.unlock();
        if (!this.overlayDismissed) {
          this.dismissOverlay();
          this.gotoScene(0, 0, { immediate: true, dismissOverlay: true });
          this.play();
        } else {
          this.togglePlay();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        audioEngine.unlock();
        if (e.shiftKey) {
          this.seekLocal(this.currentTime + 4);
        } else {
          this.nextScene();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        audioEngine.unlock();
        if (e.shiftKey) {
          this.seekLocal(this.currentTime - 4);
        } else {
          this.prevScene();
        }
      } else if (e.key === 'j' || e.key === 'J') {
        this.seekLocal(this.currentTime - 5);
      } else if (e.key === 'l' || e.key === 'L') {
        this.seekLocal(this.currentTime + 5);
      } else if (e.key === 'm' || e.key === 'M') {
        audioEngine.setSfxEnabled(!audioEngine.sfxEnabled);
        this._syncAudioButtons();
      } else if (e.key === 'v' || e.key === 'V') {
        audioEngine.setVoiceEnabled(!audioEngine.voiceEnabled);
        this._syncAudioButtons();
      } else if (e.key === 't' || e.key === 'T') {
        this.setDrawerOpen(!this.drawerOpen);
      } else if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      } else if (e.key === 'Escape' && this.drawerOpen) {
        this.setDrawerOpen(false);
      } else if (/^[0-9\-=]$/.test(e.key)) {
        const idx =
          e.key === '0'
            ? 9
            : e.key === '-'
              ? 10
              : e.key === '='
                ? 11
                : Number(e.key) - 1;
        if (idx >= 0 && idx < this.scenes.length) {
          audioEngine.unlock();
          const keepPlaying = this.isPlaying;
          this.gotoScene(idx, 0, { immediate: true, dismissOverlay: true });
          if (keepPlaying) this.play();
        }
      }
    });
  }

  _getViewportSize() {
    const vv = window.visualViewport;
    return {
      vw: Math.round(vv?.width || window.innerWidth || document.documentElement.clientWidth || 1280),
      vh: Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight || 720),
    };
  }

  _updateStageScale() {
    if (!this.appEl || !this.viewportEl || !this.scalerEl || !this.stageFrameEl) return;

    const nativeFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    this.isFullscreen = nativeFs || this.isPseudoFullscreen;

    const { vw, vh } = this._getViewportSize();
    const isMobilePortrait = vw <= 768 && vh > vw && !this.isFullscreen;
    const isMobileLandscape = vh <= 540 && vw > vh && vw <= 1024;

    this.isMobilePortrait = isMobilePortrait;
    this.isMobileLandscape = isMobileLandscape;

    this.appEl.classList.toggle('is-mobile-portrait', isMobilePortrait);
    this.appEl.classList.toggle('is-mobile-landscape', isMobileLandscape);
    this.appEl.classList.toggle('is-fullscreen', this.isFullscreen);
    this.appEl.classList.toggle('is-immersive', this.isPseudoFullscreen && !nativeFs);

    // Force layout update so viewportEl dimensions reflect the toggled responsive mode
    void this.viewportEl.offsetHeight;
    const rect = this.viewportEl.getBoundingClientRect();

    let scale;
    let visibleStageH = STAGE_HEIGHT;

    if (isMobilePortrait) {
      // Edge-to-edge width; crop the bottom caption band (captions move into mobile companion)
      const availW = Math.max(240, rect.width || vw);
      const maxPortraitStageH = Math.max(200, vh * 0.46);
      const croppedH = 602;
      scale = Math.min(availW / STAGE_WIDTH, maxPortraitStageH / croppedH);
      visibleStageH = croppedH;
    } else if (isMobileLandscape || this.isFullscreen) {
      const availW = Math.max(240, rect.width || vw);
      const availH = Math.max(160, rect.height || vh);
      scale = Math.min(availW / STAGE_WIDTH, availH / STAGE_HEIGHT);
      visibleStageH = STAGE_HEIGHT;
    } else {
      const availW = Math.max(320, (rect.width || vw) - 28);
      const availH = Math.max(180, (rect.height || vh) - 20);
      scale = Math.min(availW / STAGE_WIDTH, availH / STAGE_HEIGHT);
      visibleStageH = STAGE_HEIGHT;
    }

    const scaledW = Math.round(STAGE_WIDTH * scale);
    const scaledH = Math.round(visibleStageH * scale);

    this.scalerEl.style.width = `${scaledW}px`;
    this.scalerEl.style.height = `${scaledH}px`;
    this.stageFrameEl.style.transform = `scale(${scale})`;

    if (!(isMobileLandscape || this.isFullscreen)) {
      this._clearHudHideTimer();
      this._setHudHidden(false);
    } else if (!this.hudHidden && this.isPlaying) {
      this._scheduleHudHide();
    }
  }

  _setHudHidden(hidden) {
    this.hudHidden = Boolean(hidden);
    this.appEl?.classList.toggle('is-hud-hidden', this.hudHidden);
  }

  _clearHudHideTimer() {
    if (this._hudHideTimer) {
      clearTimeout(this._hudHideTimer);
      this._hudHideTimer = null;
    }
  }

  _scheduleHudHide() {
    this._clearHudHideTimer();
    const overlayHud = this.isMobileLandscape || this.isFullscreen;
    if (!overlayHud || !this.isPlaying || this.isScrubbing || this.drawerOpen || !this.overlayDismissed) {
      this._setHudHidden(false);
      return;
    }
    this._hudHideTimer = setTimeout(() => {
      if ((this.isMobileLandscape || this.isFullscreen) && this.isPlaying && !this.isScrubbing && !this.drawerOpen && this.overlayDismissed) {
        this._setHudHidden(true);
      }
    }, 3000);
  }

  _showHudTemporarily() {
    this._setHudHidden(false);
    this._scheduleHudHide();
  }

  _createSceneContext(manifestScene) {
    const onFrame = (fn) => {
      if (typeof fn !== 'function') return () => {};
      this._frameCallbacks.add(fn);
      return () => this._frameCallbacks.delete(fn);
    };

    return {
      gsap,
      THREE,
      katex,
      renderMath,
      createMathEl,
      renderRichText,
      createSvg,
      svgEl,
      colors: PALETTE,
      bottles: BOTTLES_KIT,
      manifestScene,
      beats: manifestScene.beats,
      duration: manifestScene.duration,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      safeHeight: SAFE_HEIGHT,
      onFrame,
      sound: {
        clink: (p) => audioEngine.clink(p),
        bell: (p) => audioEngine.bell(p),
        lock: (p) => audioEngine.lock(p),
        whoosh: (d) => audioEngine.whoosh(d),
        scale: (p) => audioEngine.scale(p),
        chime: (p) => audioEngine.chime(p),
        tick: (p) => audioEngine.tick(p),
      },
    };
  }

  _clearActiveScene() {
    this._frameCallbacks.clear();
    audioEngine.stopVoice();

    if (this.currentSceneInstance) {
      try {
        this.currentSceneInstance.timeline?.kill?.();
      } catch (err) {
        console.error('Error killing scene timeline:', err);
      }
      try {
        this.currentSceneInstance.destroy?.();
      } catch (err) {
        console.error('Error destroying scene:', err);
      }
      this.currentSceneInstance = null;
    }

    this.sceneRootEl.innerHTML = '';
    this.currentBeatIndex = -1;
  }

  _resolveSceneIndex(idx) {
    if (typeof idx === 'number' && Number.isFinite(idx)) {
      return Math.max(0, Math.min(this.scenes.length - 1, Math.floor(idx)));
    }
    if (typeof idx === 'string') {
      const asNum = Number(idx);
      if (Number.isFinite(asNum)) {
        return Math.max(0, Math.min(this.scenes.length - 1, Math.floor(asNum)));
      }
      const found = this.resolvedScenes.findIndex((s) => s.id === idx);
      if (found >= 0) return found;
    }
    return 0;
  }

  gotoScene(idx, t = 0, opts = {}) {
    const { immediate = false, dismissOverlay = true, autoPlay = false } = opts;
    if (this._transitionTimer) {
      clearTimeout(this._transitionTimer);
      this._transitionTimer = null;
    }

    if (dismissOverlay) {
      this.dismissOverlay(immediate);
    }

    const targetIndex = this._resolveSceneIndex(idx);
    const sceneModule = this.scenes[targetIndex];
    if (!sceneModule || typeof sceneModule.buildScene !== 'function') return;

    this._clearActiveScene();
    this.currentIndex = targetIndex;

    const meta = this.resolvedScenes[targetIndex];
    this.sortedBeats = meta.beats;

    // Pre-decode current scene (and peek at next scene) for zero-latency neural voiceover
    audioEngine.preloadSceneBeats(this.sortedBeats);
    if (targetIndex + 1 < this.resolvedScenes.length) {
      const nextBeats = this.resolvedScenes[targetIndex + 1].beats;
      if (nextBeats.length) audioEngine.preloadSceneBeats(nextBeats.slice(0, 2));
    }

    let instance = null;
    try {
      instance = sceneModule.buildScene(this.sceneRootEl, this._createSceneContext(meta));
    } catch (err) {
      console.error(`Failed to build scene ${targetIndex + 1} (${meta.id}):`, err);
    }

    const tl = instance?.timeline || gsap.timeline({ paused: true });
    // Always honor at least the audio-measured manifest duration so no voiceover phrase is ever clipped!
    const targetDur = Math.max(meta.duration, tl.duration() || 0, 1);

    if (tl.duration() < targetDur - 0.01) {
      tl.to({}, { duration: targetDur - tl.duration() }, tl.duration());
    }

    tl.timeScale(this.playbackRate);
    tl.eventCallback('onComplete', () => {
      if (!this.isPlaying) return;
      if (this.currentIndex < this.scenes.length - 1) {
        this._advanceToNextSceneSmooth();
      } else {
        this.isPlaying = false;
        audioEngine.stopVoice();
        this._syncPlayButton();
      }
    });

    this.currentSceneInstance = {
      timeline: tl,
      destroy: instance?.destroy,
      meta,
    };
    this.currentDuration = targetDur;
    this.sceneOffsets[targetIndex].duration = targetDur;
    this._recomputeOffsets();

    const clampedT = Math.max(0, Math.min(targetDur, Number(t) || 0));
    this.currentTime = clampedT;

    // Seek synchronously so DOM, SVG, and Three.js state reflect exact timestamp
    tl.pause(clampedT, false);
    this._runFrameCallbacks(0, clampedT);

    // Update airy header & feathered captions
    this._updateSceneHeader(meta);
    this._updateCaption(clampedT, { triggerAudio: false, immediate: true });
    this._updateTimelineUI();
    this._updateDrawerActiveState();

    if (autoPlay) {
      this.play();
    } else {
      this.isPlaying = false;
      this._syncPlayButton();
    }
  }

  /**
   * Smooth 0.35s cross-dissolve transition between chapters.
   */
  _advanceToNextSceneSmooth() {
    const nextIdx = this.currentIndex + 1;
    if (nextIdx >= this.scenes.length) return;
    audioEngine.stopVoice();
    this.sceneRootEl.classList.add('is-transitioning');
    audioEngine.whoosh(0.35);

    this._transitionTimer = setTimeout(() => {
      this.gotoScene(nextIdx, 0, { immediate: false, dismissOverlay: true, autoPlay: true });
      requestAnimationFrame(() => {
        this.sceneRootEl.classList.remove('is-transitioning');
      });
    }, 350);
  }

  _recomputeOffsets() {
    let acc = 0;
    for (let i = 0; i < this.sceneOffsets.length; i++) {
      const dur = this.sceneOffsets[i].duration;
      this.sceneOffsets[i].start = acc;
      this.sceneOffsets[i].end = acc + dur;
      acc += dur;
    }
    this.totalDuration = Math.max(1, acc);
    const totalEl = this.mountEl.querySelector('#time-total');
    if (totalEl) totalEl.textContent = formatTime(this.totalDuration);

    const dotsWrap = this.mountEl.querySelector('#timeline-chapter-dots');
    if (dotsWrap) {
      dotsWrap.innerHTML = this.sceneOffsets
        .slice(1)
        .map((seg) => {
          const pct = (seg.start / this.totalDuration) * 100;
          return `<span class="timeline-chapter-dot" style="left:${pct.toFixed(3)}%;"></span>`;
        })
        .join('');
    }
  }

  play() {
    if (!this.currentSceneInstance) return;
    audioEngine.unlock();
    this.dismissOverlay();
    const tl = this.currentSceneInstance.timeline;

    // If at the very end of the final scene, restart cleanly from Scene 1
    if (
      this.currentIndex === this.scenes.length - 1 &&
      this.currentTime >= this.currentDuration - 0.08
    ) {
      this.gotoScene(0, 0, { immediate: true, dismissOverlay: true, autoPlay: true });
      return;
    }

    audioEngine.preloadSceneBeats(this.sortedBeats);

    this.isPlaying = true;
    tl.timeScale(this.playbackRate);
    tl.play();
    this._syncPlayButton();

    // Immediately synchronize neural voiceover to exact playhead position
    const activeBeat = this._findBeatAtTime(this.currentTime)?.beat || null;
    if (activeBeat) {
      audioEngine.syncVoice(activeBeat, this.currentTime, true, this.playbackRate);
    }
    this._scheduleHudHide();
  }

  pause() {
    this.isPlaying = false;
    this.currentSceneInstance?.timeline?.pause();
    audioEngine.stopVoice();
    this._syncPlayButton();
    this._clearHudHideTimer();
    this._setHudHidden(false);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seekLocal(t, opts = {}) {
    if (!this.currentSceneInstance) return;
    const { immediateCaption = false } = opts;
    const clamped = Math.max(0, Math.min(this.currentDuration, Number(t) || 0));
    this.currentTime = clamped;
    const tl = this.currentSceneInstance.timeline;
    tl.time(clamped, false);
    this._runFrameCallbacks(0, clamped);
    this._updateCaption(clamped, { triggerAudio: false, immediate: immediateCaption });
    this._updateTimelineUI();

    if (this.isPlaying) {
      const activeBeat = this._findBeatAtTime(clamped)?.beat || null;
      audioEngine.syncVoice(activeBeat, clamped, true, this.playbackRate);
    } else {
      audioEngine.stopVoice();
    }
  }

  nextScene() {
    const nextIdx = Math.min(this.scenes.length - 1, this.currentIndex + 1);
    const keepPlaying = this.isPlaying;
    this.gotoScene(nextIdx, 0, { immediate: true, dismissOverlay: true, autoPlay: keepPlaying });
  }

  prevScene() {
    const prevIdx = Math.max(0, this.currentIndex - 1);
    const keepPlaying = this.isPlaying;
    this.gotoScene(prevIdx, 0, { immediate: true, dismissOverlay: true, autoPlay: keepPlaying });
  }

  setSpeed(rate) {
    const r = Number(rate) || 1.0;
    this.playbackRate = r;
    audioEngine.setPlaybackRate(r);
    this.currentSceneInstance?.timeline?.timeScale(r);
    if (this.btnSpeedEl) {
      this.btnSpeedEl.textContent = `${r}x`;
    }
  }

  dismissOverlay(immediate = false) {
    if (this.overlayDismissed) return;
    this.overlayDismissed = true;
    if (immediate) {
      this.playOverlayEl.style.transition = 'none';
      this.playOverlayEl.classList.add('is-hidden');
      void this.playOverlayEl.offsetHeight;
      this.playOverlayEl.style.transition = '';
    } else {
      this.playOverlayEl.classList.add('is-hidden');
    }
  }

  setDrawerOpen(open) {
    this.drawerOpen = Boolean(open);
    this.drawerEl.classList.toggle('is-open', this.drawerOpen);
    this.btnTranscriptEl.classList.toggle('is-active', this.drawerOpen);
    if (this.drawerOpen) {
      this._scrollActiveBeatIntoView();
      this._clearHudHideTimer();
      this._setHudHidden(false);
    } else {
      this._scheduleHudHide();
    }
  }

  _syncFullscreenState() {
    const nativeFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    if (!nativeFs && !this.isPseudoFullscreen) {
      try {
        screen.orientation?.unlock?.();
      } catch {
        // Ignore unsupported orientation unlock
      }
    }
    this.isFullscreen = nativeFs || this.isPseudoFullscreen;
    if (this.btnFullscreenEl) {
      this.btnFullscreenEl.innerHTML = this.isFullscreen ? ICONS.exitFullscreen : ICONS.fullscreen;
      this.btnFullscreenEl.title = this.isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)';
      this.btnFullscreenEl.setAttribute('aria-pressed', String(this.isFullscreen));
    }
    if (this.btnMobileFullscreenEl) {
      this.btnMobileFullscreenEl.innerHTML = this.isFullscreen
        ? `${ICONS.exitFullscreen}<span>Exit</span>`
        : `${ICONS.fullscreen}<span>Full View</span>`;
    }
    this._updateStageScale();
    requestAnimationFrame(() => this._updateStageScale());
  }

  async toggleFullscreen() {
    const nativeFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    const currentlyFullscreen = nativeFs || this.isPseudoFullscreen;

    if (!currentlyFullscreen) {
      const target = this.appEl || this.mountEl.firstElementChild || document.documentElement;
      const req = target.requestFullscreen || target.webkitRequestFullscreen;
      let enteredNative = false;
      if (typeof req === 'function') {
        try {
          await req.call(target);
          enteredNative = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
        } catch {
          enteredNative = false;
        }
      }
      if (enteredNative) {
        try {
          screen.orientation?.lock?.('landscape')?.catch?.(() => {});
        } catch {
          // Ignore unsupported orientation lock
        }
      } else {
        // iOS Safari / embedded WebView fallback: pin .cinema-app fullscreen in viewport
        this.isPseudoFullscreen = true;
      }
    } else {
      this.isPseudoFullscreen = false;
      if (nativeFs) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (typeof exit === 'function') {
          try {
            await exit.call(document);
          } catch {
            // Ignore
          }
        }
      }
      try {
        screen.orientation?.unlock?.();
      } catch {
        // Ignore
      }
    }

    this._syncFullscreenState();
    this._showHudTemporarily();
  }

  _globalToLocal(globalSec) {
    const g = Math.max(0, Math.min(this.totalDuration, globalSec));
    for (let i = 0; i < this.sceneOffsets.length; i++) {
      const seg = this.sceneOffsets[i];
      if (g <= seg.end || i === this.sceneOffsets.length - 1) {
        return {
          sceneIndex: i,
          localTime: Math.max(0, Math.min(seg.duration, g - seg.start)),
        };
      }
    }
    return { sceneIndex: 0, localTime: 0 };
  }

  _getGlobalTime() {
    const offset = this.sceneOffsets[this.currentIndex]?.start || 0;
    return offset + this.currentTime;
  }

  _startRafLoop() {
    const tick = (ts) => {
      const dt = this._lastRafTs ? Math.min(0.1, (ts - this._lastRafTs) / 1000) : 0;
      this._lastRafTs = ts;

      if (this.currentSceneInstance) {
        const tl = this.currentSceneInstance.timeline;
        if (this.isPlaying && tl) {
          this.currentTime = tl.time();
          this._updateCaption(this.currentTime, { triggerAudio: true, immediate: false });
          this._updateTimelineUI();
        }
        this._runFrameCallbacks(dt, this.currentTime);
      }

      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  _runFrameCallbacks(dt, elapsed) {
    if (this._frameCallbacks.size === 0) return;
    for (const fn of this._frameCallbacks) {
      try {
        fn(dt, elapsed);
      } catch (err) {
        console.error('Error inside scene onFrame callback:', err);
      }
    }
  }

  _updateSceneHeader(meta) {
    const numStr = String(meta.number ?? this.currentIndex + 1).padStart(2, '0');
    const title = meta.title || `Chapter ${numStr}`;

    this.whisperNumEl.textContent = numStr;
    this.whisperTitleEl.textContent = title;
    this.hudChapterNumEl.textContent = numStr;
    this.hudChapterNameEl.textContent = title;
    if (this.mobileChapterNumEl) this.mobileChapterNumEl.textContent = numStr;
    if (this.mobileChapterNameEl) this.mobileChapterNameEl.textContent = title;
  }

  _findBeatAtTime(t) {
    if (!this.sortedBeats.length) return null;
    let activeIdx = 0;
    for (let i = 0; i < this.sortedBeats.length; i++) {
      if (this.sortedBeats[i].start <= t + 0.04) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return { index: activeIdx, beat: this.sortedBeats[activeIdx] };
  }

  _updateCaption(t, { triggerAudio = false, immediate = false } = {}) {
    if (!this.sortedBeats.length) {
      this.captionTextEl.innerHTML = '';
      this.captionProgressEl.style.width = '0%';
      if (this.mobileCaptionTextEl) this.mobileCaptionTextEl.innerHTML = '';
      if (this.mobileCaptionProgressEl) this.mobileCaptionProgressEl.style.width = '0%';
      return;
    }

    const found = this._findBeatAtTime(t);
    const activeIdx = found.index;
    const beat = found.beat;

    const beatStart = beat.start;
    const nextStart =
      activeIdx + 1 < this.sortedBeats.length
        ? this.sortedBeats[activeIdx + 1].start
        : this.currentDuration;
    const beatDur = Math.max(0.2, nextStart - beatStart);
    const beatPct = Math.max(0, Math.min(100, ((t - beatStart) / beatDur) * 100));
    this.captionProgressEl.style.width = `${beatPct.toFixed(2)}%`;
    if (this.mobileCaptionProgressEl) {
      this.mobileCaptionProgressEl.style.width = `${beatPct.toFixed(2)}%`;
    }

    if (activeIdx !== this.currentBeatIndex) {
      this.currentBeatIndex = activeIdx;
      const rendered = renderRichText(beat.text, beat.highlight);

      if (this._captionAnimTimer) {
        clearTimeout(this._captionAnimTimer);
        this._captionAnimTimer = null;
      }

      if (immediate) {
        this.captionTextEl.classList.remove('is-entering');
        this.captionTextEl.innerHTML = rendered;
        if (this.mobileCaptionTextEl) {
          this.mobileCaptionTextEl.classList.remove('is-entering');
          this.mobileCaptionTextEl.innerHTML = rendered;
        }
      } else {
        this.captionTextEl.classList.add('is-entering');
        this.captionTextEl.innerHTML = rendered;
        if (this.mobileCaptionTextEl) {
          this.mobileCaptionTextEl.classList.add('is-entering');
          this.mobileCaptionTextEl.innerHTML = rendered;
        }
        this._captionAnimTimer = setTimeout(() => {
          this.captionTextEl.classList.remove('is-entering');
          this.mobileCaptionTextEl?.classList.remove('is-entering');
        }, 24);
      }

      this._updateDrawerActiveState();

      if (triggerAudio && this.isPlaying && beat.cue) {
        audioEngine.playCue(beat.cue);
      }
    }

    if (triggerAudio && this.isPlaying) {
      audioEngine.syncVoice(beat, t, true, this.playbackRate);
    }
  }

  _updateTimelineUI() {
    const globalSec = this._getGlobalTime();
    const globalPct = Math.max(0, Math.min(100, (globalSec / this.totalDuration) * 100));

    this.timeCurrentEl.textContent = formatTime(globalSec);
    this.playheadEl.style.left = `${globalPct.toFixed(3)}%`;
    this.timelineWrapEl.setAttribute('aria-valuenow', String(Math.round(globalSec)));

    for (let i = 0; i < this.segmentEls.length; i++) {
      const seg = this.segmentEls[i];
      const fill = seg.firstElementChild;
      seg.classList.toggle('is-active', i === this.currentIndex);
      seg.classList.toggle('is-done', i < this.currentIndex);

      if (i < this.currentIndex) {
        fill.style.width = '100%';
      } else if (i === this.currentIndex) {
        const pct = Math.max(0, Math.min(100, (this.currentTime / this.currentDuration) * 100));
        fill.style.width = `${pct.toFixed(2)}%`;
      } else {
        fill.style.width = '0%';
      }
    }
  }

  _updateDrawerActiveState() {
    this.drawerBodyEl.querySelectorAll('.drawer-scene').forEach((el) => {
      const idx = Number(el.dataset.drawerScene);
      el.classList.toggle('is-current', idx === this.currentIndex);
    });
    this.drawerBodyEl.querySelectorAll('.drawer-beat').forEach((el) => {
      const sIdx = Number(el.dataset.sceneIdx);
      const bIdx = Number(el.dataset.beatIdx);
      el.classList.toggle('is-active', sIdx === this.currentIndex && bIdx === this.currentBeatIndex);
    });
    if (this.drawerOpen) {
      this._scrollActiveBeatIntoView();
    }
  }

  _scrollActiveBeatIntoView() {
    const active = this.drawerBodyEl.querySelector('.drawer-beat.is-active');
    active?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }

  _syncPlayButton() {
    this.btnPlayEl.innerHTML = this.isPlaying ? ICONS.pause : ICONS.play;
    this.btnPlayEl.title = this.isPlaying ? 'Pause (Space)' : 'Play (Space)';
  }

  _syncAudioButtons() {
    const sfxOn = audioEngine.sfxEnabled;
    this.btnSfxEl.innerHTML = `${sfxOn ? ICONS.sfxOn : ICONS.sfxOff}<span class="hud-btn-label">SFX</span>`;
    this.btnSfxEl.classList.toggle('is-active', sfxOn);
    this.btnSfxEl.classList.toggle('is-muted', !sfxOn);

    const voiceOn = audioEngine.voiceEnabled;
    this.btnVoiceEl.innerHTML = `${voiceOn ? ICONS.voiceOn : ICONS.voiceOff}<span class="hud-btn-label">Voice</span>`;
    this.btnVoiceEl.classList.toggle('is-active', voiceOn);
    this.btnVoiceEl.classList.toggle('is-muted', !voiceOn);
  }

  _exposeDebugApi() {
    window.__VIDEO_PLAYER__ = {
      gotoScene: (idx, t = 0) => this.gotoScene(idx, t, { immediate: true, dismissOverlay: true }),
      play: () => this.play(),
      pause: () => this.pause(),
      seek: (t) => this.seekLocal(t, { immediateCaption: true }),
      setSpeed: (rate) => this.setSpeed(rate),
      setPlaybackRate: (rate) => this.setSpeed(rate),
      nextScene: () => this.nextScene(),
      prevScene: () => this.prevScene(),
      dismissOverlay: () => this.dismissOverlay(true),
      toggleTranscript: (open) => this.setDrawerOpen(open == null ? !this.drawerOpen : open),
      toggleFullscreen: () => this.toggleFullscreen(),
      getSceneCount: () => this.scenes.length,
      getSceneMeta: (idx) =>
        idx == null
          ? this.resolvedScenes
          : this.resolvedScenes[this._resolveSceneIndex(idx)] || null,
      getManifest: () => this.manifest,
      getVoiceDebugState: () => audioEngine.getVoiceDebugState(),
      getState: () => ({
        sceneIndex: this.currentIndex,
        localTime: this.currentTime,
        duration: this.currentDuration,
        globalTime: this._getGlobalTime(),
        totalDuration: this.totalDuration,
        isPlaying: this.isPlaying,
        playbackRate: this.playbackRate,
        overlayVisible: !this.overlayDismissed,
        beatIndex: this.currentBeatIndex,
        hasVoiceManifest: Boolean(this.manifest),
        isFullscreen: this.isFullscreen,
        isPseudoFullscreen: this.isPseudoFullscreen,
        isMobilePortrait: this.isMobilePortrait,
        isMobileLandscape: this.isMobileLandscape,
        hudHidden: this.hudHidden,
      }),
    };
  }
}
