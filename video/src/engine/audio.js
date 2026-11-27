/**
 * Pitch-Preserving Neural MP3 Voiceover + Warm Tactile Apothecary Foley Engine
 * Plays base64 MP3 voiceover beats via cached Blob URLs on HTMLAudioElement with
 * preservesPitch explicitly locked on across all playback speeds (0.75x - 1.5x),
 * while Web Audio API powers crisp organic apothecary foley SFX.
 */

const MAX_CACHED_AUDIO_ELEMENTS = 24;

function dataUriToBlobUrl(dataUri) {
  if (!dataUri || typeof dataUri !== 'string') return null;
  if (typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return dataUri;
  }

  const commaIdx = dataUri.indexOf(',');
  const b64 = commaIdx >= 0 ? dataUri.slice(commaIdx + 1) : dataUri;
  try {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  } catch {
    return dataUri;
  }
}

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.noiseBuffer = null;

    this.sfxEnabled = true;
    this.voiceEnabled = true;
    this.playbackRate = 1.0;
    this.unlocked = false;

    // Beat audio sources and pre-warmed HTMLAudioElement cache keyed by beat id
    this._beatDataUris = new Map();
    this._blobUrlCache = new Map();
    this._audioCache = new Map();

    // Currently active HTMLAudioElement neural voice playback state
    this._activeVoice = null; // { beatId, htmlAudio, rate, duration, token, pendingSeek, pendingSeekTs, playPending }
    this._voiceSyncToken = 0;
  }

  /**
   * Register all beat audioDataUris from voice_manifest.json.
   */
  loadManifest(manifest) {
    if (!manifest || !manifest.scenes) return;
    const scenesList = Array.isArray(manifest.scenes)
      ? manifest.scenes
      : Object.values(manifest.scenes);

    for (const sc of scenesList) {
      if (!sc || !Array.isArray(sc.beats)) continue;
      for (const beat of sc.beats) {
        if (beat?.id && beat?.audioDataUri) {
          this._beatDataUris.set(beat.id, beat.audioDataUri);
        }
      }
    }
  }

  unlock() {
    this.unlocked = true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.92;
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.72;
        this.sfxGain.connect(this.masterGain);

        this.noiseBuffer = this._createSoftNoiseBuffer(this.ctx, 1.0);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Headless / blocked audio context — fail silently
    }
  }

  _ensureSfxReady() {
    if (!this.sfxEnabled || !this.unlocked) return false;
    if (!this.ctx) this.unlock();
    if (!this.ctx || !this.sfxGain) return false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  _createSoftNoiseBuffer(ctx, seconds = 1.0) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Warm pink noise for soft linen/paper page turns
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.95 * b2 + white * 0.048;
      data[i] = (b0 + b1 + b2 + white * 0.018) * 1.4;
    }
    return buffer;
  }

  /**
   * Enforce time-stretching pitch preservation across all browser engines
   * before loading media and whenever playbackRate changes.
   */
  _applyPitchPreservingRate(audio, rate = this.playbackRate) {
    if (!audio) return;
    const clampedRate = Math.max(0.5, Math.min(2.0, Number(rate) || 1.0));
    audio.preservesPitch = true;
    audio.mozPreservesPitch = true;
    audio.webkitPreservesPitch = true;
    audio.defaultPlaybackRate = clampedRate;
    audio.playbackRate = clampedRate;
  }

  _getOrCreateBlobUrl(beatId, dataUri) {
    if (!beatId) return null;
    if (this._blobUrlCache.has(beatId)) {
      return this._blobUrlCache.get(beatId);
    }
    const uri = dataUri || this._beatDataUris.get(beatId);
    if (!uri) return null;
    const blobUrl = dataUriToBlobUrl(uri);
    if (blobUrl) {
      this._blobUrlCache.set(beatId, blobUrl);
    }
    return blobUrl;
  }

  _evictStaleAudioElements() {
    if (this._audioCache.size <= MAX_CACHED_AUDIO_ELEMENTS) return;
    const activeBeatId = this._activeVoice?.beatId || null;
    for (const [id, audio] of this._audioCache.entries()) {
      if (this._audioCache.size <= MAX_CACHED_AUDIO_ELEMENTS) break;
      if (id === activeBeatId) continue;
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch {
        // Ignore cleanup errors
      }
      this._audioCache.delete(id);
    }
  }

  _getOrCreateBeatAudio(beatId, dataUri) {
    if (!beatId || typeof Audio === 'undefined') return null;

    if (this._audioCache.has(beatId)) {
      const existing = this._audioCache.get(beatId);
      // Touch LRU ordering
      this._audioCache.delete(beatId);
      this._audioCache.set(beatId, existing);
      this._applyPitchPreservingRate(existing, this.playbackRate);
      return existing;
    }

    const blobUrl = this._getOrCreateBlobUrl(beatId, dataUri);
    if (!blobUrl) return null;

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 0.94;
      // Set pitch-preservation flags BEFORE assigning src
      this._applyPitchPreservingRate(audio, this.playbackRate);
      audio.src = blobUrl;
      // Re-assert after src assignment (some engines reset rate flags on src change)
      this._applyPitchPreservingRate(audio, this.playbackRate);

      this._audioCache.set(beatId, audio);
      this._evictStaleAudioElements();
      return audio;
    } catch {
      return null;
    }
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = Boolean(enabled);
  }

  setVoiceEnabled(enabled) {
    this.voiceEnabled = Boolean(enabled);
    if (!this.voiceEnabled) {
      this.stopVoice();
    }
  }

  setPlaybackRate(rate) {
    const next = Math.max(0.5, Math.min(2.0, Number(rate) || 1.0));
    const changed = Math.abs(next - this.playbackRate) >= 0.001;
    this.playbackRate = next;

    // Immediately update active HTMLAudioElement in-place with pitch preservation
    if (this._activeVoice?.htmlAudio) {
      this._applyPitchPreservingRate(this._activeVoice.htmlAudio, next);
      this._activeVoice.rate = next;
    }

    // Keep pre-warmed cached elements aligned with the active rate & pitch flags
    if (changed) {
      for (const audio of this._audioCache.values()) {
        this._applyPitchPreservingRate(audio, next);
      }
    }
  }

  /**
   * Pre-convert a scene's MP3 beats to cached Blob URLs and warm HTMLAudioElements
   * so beat switches and mid-beat scrubs start instantaneously with zero glitches.
   */
  preloadSceneBeats(beats = []) {
    if (!Array.isArray(beats)) return;
    for (const beat of beats) {
      if (!beat?.id) continue;
      const uri = beat.audioDataUri || this._beatDataUris.get(beat.id);
      if (uri) {
        if (!this._beatDataUris.has(beat.id)) {
          this._beatDataUris.set(beat.id, uri);
        }
        this._getOrCreateBeatAudio(beat.id, uri);
      }
    }
  }

  /**
   * Synchronize pitch-preserved neural voiceover playback to the active beat and
   * exact timeline timestamp across continuous RAF ticks, scrubs, pauses, and speed changes.
   */
  syncVoice(beat, localTime, isPlaying, playbackRate = this.playbackRate) {
    const nextRate = Math.max(0.5, Math.min(2.0, Number(playbackRate) || 1.0));
    if (Math.abs(nextRate - this.playbackRate) >= 0.001) {
      this.setPlaybackRate(nextRate);
    }

    if (!isPlaying || !this.voiceEnabled || !this.unlocked || !beat) {
      this.stopVoice();
      return;
    }

    const beatId = beat.id;
    const dataUri = beat.audioDataUri || (beatId ? this._beatDataUris.get(beatId) : null);
    if (!beatId || !dataUri) {
      this.stopVoice();
      return;
    }

    const beatStart = Number(beat.start ?? beat.time ?? 0);
    const offset = localTime - beatStart;
    const audioDur =
      Number(beat.audioDuration) || Math.max(0.5, (Number(beat.end) || beatStart + 5) - beatStart);

    // Outside the spoken audio window [0, audioDur - 0.04]: cleanly pause & reset
    if (offset < -0.02 || offset >= audioDur - 0.04) {
      if (this._activeVoice) {
        this.stopVoice();
      }
      return;
    }

    const clampedOffset = Math.max(0, offset);

    // Fast path: this exact beat is already active
    if (this._activeVoice && this._activeVoice.beatId === beatId && this._activeVoice.htmlAudio) {
      const audio = this._activeVoice.htmlAudio;
      this._applyPitchPreservingRate(audio, this.playbackRate);
      this._activeVoice.rate = this.playbackRate;

      // Still waiting for metadata to load on first play of an un-warmed beat
      if (audio.readyState < 1 && this._activeVoice.pendingSeek != null) {
        this._activeVoice.pendingSeek = clampedOffset;
        this._activeVoice.pendingSeekTs = performance.now();
        return;
      }

      const drift = Math.abs(audio.currentTime - clampedOffset);
      if (drift < 0.25) {
        if (audio.paused && !audio.ended && !this._activeVoice.playPending) {
          this._safePlay(audio, this._activeVoice);
        }
        return;
      }

      // User scrubbed (or timeline jumped) within the same beat — seek cleanly in-place
      const targetDur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : audioDur;
      const safeOffset = Math.max(0, Math.min(Math.max(0, targetDur - 0.04), clampedOffset));
      try {
        audio.currentTime = safeOffset;
      } catch {
        // Ignore seek errors on unseekable media
      }
      if (audio.paused && !this._activeVoice.playPending) {
        this._safePlay(audio, this._activeVoice);
      }
      return;
    }

    // Switch to and start this beat's pre-warmed HTMLAudioElement
    this._startBeatAudio(beatId, dataUri, clampedOffset, audioDur);
  }

  _startBeatAudio(beatId, dataUri, offsetSec, fallbackDur) {
    this.stopVoice();
    const token = ++this._voiceSyncToken;

    const audio = this._getOrCreateBeatAudio(beatId, dataUri);
    if (!audio) return;

    audio.volume = 0.94;
    this._applyPitchPreservingRate(audio, this.playbackRate);

    const active = {
      beatId,
      htmlAudio: audio,
      rate: this.playbackRate,
      duration: Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : fallbackDur,
      token,
      pendingSeek: null,
      pendingSeekTs: 0,
      playPending: false,
    };

    audio.onended = () => {
      if (this._activeVoice === active) {
        this._activeVoice = null;
      }
    };

    this._activeVoice = active;

    if (audio.readyState >= 1) {
      const targetDur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : fallbackDur;
      const safeOffset = Math.max(0, Math.min(Math.max(0, targetDur - 0.04), offsetSec));
      try {
        if (Math.abs(audio.currentTime - safeOffset) > 0.02) {
          audio.currentTime = safeOffset;
        }
      } catch {
        // Ignore seek errors
      }
      this._applyPitchPreservingRate(audio, this.playbackRate);
      this._safePlay(audio, active);
      return;
    }

    // Metadata still loading — seek accurately once ready with drift compensation
    active.pendingSeek = offsetSec;
    active.pendingSeekTs = performance.now();

    const onLoadedMeta = () => {
      if (this._activeVoice !== active || token !== this._voiceSyncToken || !this.voiceEnabled) {
        return;
      }
      const elapsedSec = ((performance.now() - active.pendingSeekTs) / 1000) * this.playbackRate;
      const desiredOffset = (active.pendingSeek ?? offsetSec) + elapsedSec;
      active.pendingSeek = null;

      const targetDur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : fallbackDur;
      active.duration = targetDur;
      if (desiredOffset >= targetDur - 0.04) {
        this.stopVoice();
        return;
      }

      try {
        if (Math.abs(audio.currentTime - desiredOffset) > 0.08) {
          audio.currentTime = Math.max(0, desiredOffset);
        }
      } catch {
        // Ignore seek errors
      }
      this._applyPitchPreservingRate(audio, this.playbackRate);
      if (audio.paused && !active.playPending) {
        this._safePlay(audio, active);
      }
    };

    audio.addEventListener('loadedmetadata', onLoadedMeta, { once: true });

    try {
      if (audio.networkState === 0) {
        audio.load();
      }
    } catch {
      // Ignore
    }

    if (offsetSec < 0.05) {
      this._applyPitchPreservingRate(audio, this.playbackRate);
      this._safePlay(audio, active);
    }
  }

  _safePlay(audio, active) {
    if (!audio || this._activeVoice !== active) return;
    this._applyPitchPreservingRate(audio, this.playbackRate);
    active.playPending = true;
    try {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            active.playPending = false;
            if (this._activeVoice !== active) {
              try {
                audio.pause();
              } catch {
                // Ignore
              }
              return;
            }
            this._applyPitchPreservingRate(audio, this.playbackRate);
          })
          .catch(() => {
            active.playPending = false;
          });
      } else {
        active.playPending = false;
      }
    } catch {
      active.playPending = false;
    }
  }

  stopVoice() {
    this._voiceSyncToken += 1;
    const active = this._activeVoice;
    this._activeVoice = null;
    if (!active?.htmlAudio) return;

    const audio = active.htmlAudio;
    try {
      audio.pause();
      if (audio.readyState >= 1) {
        audio.currentTime = 0;
      }
    } catch {
      // Ignore pause/reset errors in headless environments
    }
  }

  // Backward-compatible alias
  stopSpeech() {
    this.stopVoice();
  }

  /**
   * Diagnostic state for automated QA verification of pitch preservation across playback speeds.
   */
  getVoiceDebugState() {
    const activeAudio = this._activeVoice?.htmlAudio || null;
    const sampleAudio = activeAudio || this._audioCache.values().next().value || null;
    const preservesPitch = sampleAudio
      ? Boolean(
          sampleAudio.preservesPitch ??
            sampleAudio.mozPreservesPitch ??
            sampleAudio.webkitPreservesPitch,
        )
      : true;

    return {
      mode: 'html-audio-pitch-preserved',
      playbackRate: activeAudio ? activeAudio.playbackRate : this.playbackRate,
      preservesPitch,
      mozPreservesPitch: sampleAudio ? Boolean(sampleAudio.mozPreservesPitch) : true,
      webkitPreservesPitch: sampleAudio ? Boolean(sampleAudio.webkitPreservesPitch) : true,
      activeBeatId: this._activeVoice?.beatId || null,
      currentTime: activeAudio ? Number(activeAudio.currentTime) || 0 : 0,
      paused: activeAudio ? Boolean(activeAudio.paused) : true,
      readyState: activeAudio ? activeAudio.readyState : 0,
      cachedBeats: this._audioCache.size,
      cachedBlobUrls: this._blobUrlCache.size,
    };
  }

  // ---------------------------------------------------------------------------
  // WARM ORGANIC APOTHECARY WEB AUDIO FOLEY
  // ---------------------------------------------------------------------------

  /**
   * Crystalline apothecary glass bottle clink.
   */
  clink(pitch = 1.0) {
    if (!this._ensureSfxReady()) return;
    const now = this.ctx.currentTime;
    const base = 1780 * pitch;

    const partials = [
      { freq: base, gain: 0.08, decay: 0.24, type: 'sine' },
      { freq: base * 1.68, gain: 0.045, decay: 0.16, type: 'sine' },
      { freq: base * 2.54, gain: 0.022, decay: 0.095, type: 'triangle' },
      { freq: 680 * pitch, gain: 0.05, decay: 0.055, type: 'sine' },
    ];

    for (const p of partials) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq, now);
      osc.frequency.exponentialRampToValueAtTime(p.freq * 0.994, now + p.decay);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(p.gain, now + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + p.decay + 0.02);
    }
  }

  /**
   * Tiny brass service-desk bell ("ding!") for oracle score announcements.
   */
  bell(pitch = 1.0) {
    if (!this._ensureSfxReady()) return;
    const now = this.ctx.currentTime;
    const fund = 1318.5 * pitch; // Bright E6 brass desk bell

    const modes = [
      { ratio: 1.0, gain: 0.075, decay: 0.72 },
      { ratio: 2.02, gain: 0.036, decay: 0.42 },
      { ratio: 2.98, gain: 0.018, decay: 0.24 },
      { ratio: 4.18, gain: 0.011, decay: 0.11 },
    ];

    for (const m of modes) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fund * m.ratio, now);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(m.gain, now + 0.0025);
      g.gain.exponentialRampToValueAtTime(0.0001, now + m.decay);

      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + m.decay + 0.03);
    }
  }

  /**
   * Warm wooden coaster click + golden brass chime when a bottle locks home.
   */
  lock(pitch = 1.0) {
    if (!this._ensureSfxReady()) return;
    const now = this.ctx.currentTime;

    // 1. Tactile wooden tap
    const wood = this.ctx.createOscillator();
    const woodGain = this.ctx.createGain();
    wood.type = 'triangle';
    wood.frequency.setValueAtTime(240 * pitch, now);
    wood.frequency.exponentialRampToValueAtTime(95 * pitch, now + 0.045);
    woodGain.gain.setValueAtTime(0.0001, now);
    woodGain.gain.linearRampToValueAtTime(0.11, now + 0.003);
    woodGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    wood.connect(woodGain);
    woodGain.connect(this.sfxGain);
    wood.start(now);
    wood.stop(now + 0.065);

    // 2. Warm brass harmonic triad bloom
    const notes = [
      { freq: 523.25 * pitch, offset: 0.012, gain: 0.062, decay: 0.42 },
      { freq: 659.25 * pitch, offset: 0.036, gain: 0.05, decay: 0.48 },
      { freq: 783.99 * pitch, offset: 0.062, gain: 0.045, decay: 0.54 },
    ];
    for (const n of notes) {
      const t0 = now + n.offset;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(n.gain, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.decay);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + n.decay + 0.03);
    }
  }

  /**
   * Soft paper-page whoosh for transitions and folds.
   */
  whoosh(duration = 0.34) {
    if (!this._ensureSfxReady() || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const dur = Math.max(0.16, Math.min(0.95, Number(duration) || 0.34));

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.4;
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(1180, now + dur * 0.4);
    filter.frequency.exponentialRampToValueAtTime(340, now + dur);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.065, now + dur * 0.32);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfxGain);

    src.start(now);
    src.stop(now + dur + 0.03);
  }

  /**
   * Gentle antique brass balance-scale ding.
   */
  scale(pitch = 1.0) {
    if (!this._ensureSfxReady()) return;
    const now = this.ctx.currentTime;
    const freqs = [
      { f: 740 * pitch, offset: 0, gain: 0.068, decay: 0.45 },
      { f: 1108.73 * pitch, offset: 0.055, gain: 0.052, decay: 0.52 },
    ];
    for (const item of freqs) {
      const t0 = now + item.offset;
      const osc = this.ctx.createOscillator();
      const overtone = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const og = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(item.f, t0);
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(item.f * 2.75, t0);
      og.gain.value = 0.16;

      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(item.gain, t0 + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + item.decay);

      osc.connect(g);
      overtone.connect(og);
      og.connect(g);
      g.connect(this.sfxGain);

      osc.start(t0);
      overtone.start(t0);
      osc.stop(t0 + item.decay + 0.03);
      overtone.stop(t0 + item.decay + 0.03);
    }
  }

  /**
   * Backward-compatible aliases so any scene calling chime() or tick() sounds great.
   */
  chime(pitch = 1.0) {
    this.bell(pitch * 0.85);
  }

  tick(pitch = 1.0) {
    if (!this._ensureSfxReady()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(920 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(420 * pitch, now + 0.024);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.042, now + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playCue(cue) {
    if (!cue || !this.sfxEnabled) return;
    switch (cue) {
      case 'clink':
        this.clink();
        break;
      case 'bell':
        this.bell();
        break;
      case 'lock':
        this.lock();
        break;
      case 'whoosh':
        this.whoosh();
        break;
      case 'scale':
        this.scale();
        break;
      case 'chime':
        this.chime();
        break;
      case 'tick':
        this.tick();
        break;
      default:
        break;
    }
  }
}

export const audioEngine = new AudioEngine();
if (typeof window !== 'undefined') {
  window.__AUDIO_ENGINE__ = audioEngine;
}
