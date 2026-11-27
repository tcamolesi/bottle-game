#!/usr/bin/env python3
"""Generate neural voiceover MP3s with edge-tts and build video/src/audio/voice_manifest.json."""

from __future__ import annotations

import asyncio
import base64
import hashlib
import json
import sys
import tempfile
from pathlib import Path
from typing import Any

import edge_tts
from mutagen.mp3 import MP3

SCRIPT_DIR = Path(__file__).resolve().parent
VIDEO_DIR = SCRIPT_DIR.parent
AUDIO_DIR = VIDEO_DIR / "src" / "audio"
SCRIPT_PATH = AUDIO_DIR / "script.json"
MANIFEST_PATH = AUDIO_DIR / "voice_manifest.json"
CACHE_DIR = Path(tempfile.gettempdir()) / "bottle_game_edge_tts_cache"

ALLOWED_CUES = {None, "clink", "bell", "lock", "whoosh", "scale"}
MAX_CONCURRENCY = 5
MAX_RETRIES = 4


def _cache_path(voice: str, rate: str, spoken_text: str) -> Path:
    key = hashlib.sha256(f"{voice}|{rate}|{spoken_text}".encode("utf-8")).hexdigest()[:24]
    return CACHE_DIR / f"{key}.mp3"


async def synthesize_beat(
    sem: asyncio.Semaphore,
    beat_id: str,
    spoken_text: str,
    voice: str,
    rate: str,
) -> tuple[str, bytes, float]:
    cached = _cache_path(voice, rate, spoken_text)
    if cached.exists() and cached.stat().st_size > 256:
        length = float(MP3(str(cached)).info.length)
        if length > 0.5:
            return beat_id, cached.read_bytes(), length

    async with sem:
        last_err: Exception | None = None
        for attempt in range(1, MAX_RETRIES + 1):
            tmp_path = cached.with_suffix(f".tmp.{attempt}.mp3")
            try:
                comm = edge_tts.Communicate(spoken_text, voice=voice, rate=rate)
                await comm.save(str(tmp_path))
                if not tmp_path.exists() or tmp_path.stat().st_size <= 256:
                    raise RuntimeError(f"Empty MP3 output for {beat_id}")
                length = float(MP3(str(tmp_path)).info.length)
                if length <= 0.5:
                    raise RuntimeError(f"Unexpectedly short MP3 ({length:.3f}s) for {beat_id}")
                tmp_path.replace(cached)
                return beat_id, cached.read_bytes(), length
            except Exception as exc:
                last_err = exc
                if tmp_path.exists():
                    tmp_path.unlink(missing_ok=True)
                if attempt < MAX_RETRIES:
                    await asyncio.sleep(0.8 * attempt)
        raise RuntimeError(f"Failed to synthesize {beat_id} after {MAX_RETRIES} tries: {last_err}")


async def build_manifest() -> None:
    if not SCRIPT_PATH.exists():
        raise FileNotFoundError(f"Missing script file: {SCRIPT_PATH}")

    raw = json.loads(SCRIPT_PATH.read_text(encoding="utf-8"))
    voice: str = raw.get("voice", "en-US-AndrewMultilingualNeural")
    rate: str = raw.get("rate", "-4%")
    lead_in: float = float(raw.get("leadInSeconds", 0.8))
    beat_pause: float = float(raw.get("beatPauseSeconds", 0.55))
    outro_tail: float = float(raw.get("outroTailSeconds", 1.2))
    scenes_in: list[dict[str, Any]] = raw["scenes"]

    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Validate script schema before making network requests
    jobs: list[tuple[str, str]] = []
    seen_ids: set[str] = set()
    for scene in scenes_in:
        for beat in scene["beats"]:
            bid = beat["id"]
            if bid in seen_ids:
                raise ValueError(f"Duplicate beat id: {bid}")
            seen_ids.add(bid)
            cue = beat.get("cue", None)
            if cue not in ALLOWED_CUES:
                raise ValueError(f"Invalid cue {cue!r} on beat {bid}")
            spoken = beat.get("spoken", beat["text"]).strip()
            if not spoken:
                raise ValueError(f"Empty spoken text on beat {bid}")
            jobs.append((bid, spoken))

    print(f"Synthesizing {len(jobs)} beats with {voice} (rate={rate})...")
    sem = asyncio.Semaphore(MAX_CONCURRENCY)
    results = await asyncio.gather(
        *(synthesize_beat(sem, bid, spoken, voice, rate) for bid, spoken in jobs)
    )
    audio_by_id: dict[str, tuple[bytes, float]] = {
        bid: (data, length) for bid, data, length in results
    }

    scenes_out: dict[str, dict[str, Any]] = {}
    total_duration = 0.0
    total_mp3_bytes = 0

    for scene in scenes_in:
        scene_id = scene["id"]
        beats_out: list[dict[str, Any]] = []
        cursor = lead_in
        beats_in = scene["beats"]

        for idx, beat in enumerate(beats_in):
            bid = beat["id"]
            mp3_bytes, audio_len = audio_by_id[bid]
            total_mp3_bytes += len(mp3_bytes)

            start = round(cursor, 3)
            audio_duration = round(audio_len, 3)
            is_last = idx == len(beats_in) - 1
            tail = outro_tail if is_last else beat_pause
            end = round(start + audio_duration + tail, 3)

            b64 = base64.b64encode(mp3_bytes).decode("ascii")
            beats_out.append(
                {
                    "id": bid,
                    "start": start,
                    "audioDuration": audio_duration,
                    "end": end,
                    "text": beat["text"],
                    "highlight": beat.get("highlight", []),
                    "visualCue": beat.get("visualCue", ""),
                    "cue": beat.get("cue", None),
                    "audioDataUri": f"data:audio/mpeg;base64,{b64}",
                }
            )
            cursor = end

        scene_duration = round(cursor, 3)
        total_duration += scene_duration
        scenes_out[scene_id] = {
            "id": scene_id,
            "number": int(scene["number"]),
            "title": scene["title"],
            "chapter": scene["chapter"],
            "duration": scene_duration,
            "beats": beats_out,
        }
        print(
            f"  Scene {scene['number']} ({scene_id}): {scene['title']} — "
            f"{len(beats_out)} beats, {scene_duration:.2f}s"
        )

    manifest = {
        "voice": voice,
        "totalDuration": round(total_duration, 3),
        "scenes": scenes_out,
    }

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    manifest_mb = MANIFEST_PATH.stat().st_size / (1024 * 1024)
    raw_mp3_mb = total_mp3_bytes / (1024 * 1024)
    mins, secs = divmod(total_duration, 60)
    print(
        f"\nWrote {MANIFEST_PATH} "
        f"({len(jobs)} beats, {int(mins)}m {secs:04.1f}s = {total_duration:.2f}s, "
        f"raw MP3 {raw_mp3_mb:.2f} MB, manifest {manifest_mb:.2f} MB)"
    )


if __name__ == "__main__":
    try:
        asyncio.run(build_manifest())
    except KeyboardInterrupt:
        sys.exit(130)
