#!/usr/bin/env python3
"""
JIZURA Whisper AI Auto-Sync
Automatically transcribes audio and generates precise timed LRC lyrics using faster-whisper.
"""

import os
import sys
import re
import json
import argparse
from typing import Optional, List, Dict, Any

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

try:
    import av
    _orig_av_open = av.open
    def _safe_av_open(*args, **kwargs):
        kwargs.pop('metadata_errors', None)
        return _orig_av_open(*args, **kwargs)
    av.open = _safe_av_open
except Exception:
    pass

try:
    from faster_whisper import WhisperModel
except ImportError:
    WhisperModel = None

def format_lrc_time(seconds: float) -> str:
    """Format seconds into [mm:ss.xx] LRC tag."""
    seconds = max(0.0, float(seconds))
    mins = int(seconds // 60)
    secs = seconds % 60
    return f"[{mins:02d}:{secs:05.2f}]"

def clean_word(w: str) -> str:
    return re.sub(r'[^\w\s]', '', w.lower()).strip()

def align_lyrics(lyric_lines: List[str], whisper_words: List[Dict[str, Any]], total_dur: float) -> List[Dict[str, Any]]:
    """
    Align user's exact written lyrics to Whisper word-level timestamps.
    """
    results = []
    
    # Pre-clean lyric lines
    cleaned_lines = []
    for line in lyric_lines:
        line_str = line.strip()
        if not line_str or line_str.startswith('#'):
            continue
        cleaned_lines.append(line_str)
        
    if not cleaned_lines:
        return results

    if not whisper_words:
        # Fallback: even distribution if no words found
        step = total_dur / max(1, len(cleaned_lines))
        for i, line in enumerate(cleaned_lines):
            results.append({"text": line, "start": i * step})
        return results

    # Greedy alignment of line beginnings
    word_idx = 0
    num_words = len(whisper_words)
    
    for line_idx, line in enumerate(cleaned_lines):
        # Extract first 2-3 words of line for matching
        clean_line_text = re.sub(r'\[.*?\]', '', line)  # remove tags
        clean_line_text = re.sub(r'[/|*!]', '', clean_line_text).strip()
        tokens = [clean_word(t) for t in clean_line_text.split() if clean_word(t)]
        
        matched_time = None
        if tokens:
            target = tokens[0]
            # Look ahead up to 20 words for target match
            search_window = min(num_words, word_idx + 25)
            for j in range(word_idx, search_window):
                w_cand = clean_word(whisper_words[j]["word"])
                if w_cand == target or (len(target) > 2 and (target in w_cand or w_cand in target)):
                    # Check next token if available
                    if len(tokens) > 1 and j + 1 < num_words:
                        next_target = tokens[1]
                        next_cand = clean_word(whisper_words[j+1]["word"])
                        if next_target == next_cand or (len(next_target) > 2 and next_target in next_cand):
                            matched_time = whisper_words[j]["start"]
                            word_idx = j + 1
                            break
                    else:
                        matched_time = whisper_words[j]["start"]
                        word_idx = j + 1
                        break
        
        results.append({
            "text": line,
            "start": matched_time
        })

    # Fill in unmatched timestamps by interpolating between known anchors
    # Anchor start at 0 if missing
    if results[0]["start"] is None:
        results[0]["start"] = whisper_words[0]["start"] if whisper_words else 0.0

    last_known_idx = 0
    for i in range(1, len(results)):
        if results[i]["start"] is not None:
            # Interpolate any None between last_known_idx and i
            t0 = results[last_known_idx]["start"]
            t1 = results[i]["start"]
            gap = i - last_known_idx
            for k in range(last_known_idx + 1, i):
                frac = (k - last_known_idx) / gap
                results[k]["start"] = round(t0 + (t1 - t0) * frac, 2)
            last_known_idx = i

    # Fill remaining tail
    if last_known_idx < len(results) - 1:
        t0 = results[last_known_idx]["start"]
        t1 = min(total_dur, t0 + (len(results) - 1 - last_known_idx) * 4.0)
        gap = len(results) - 1 - last_known_idx
        for k in range(last_known_idx + 1, len(results)):
            frac = (k - last_known_idx) / gap
            results[k]["start"] = round(t0 + (t1 - t0) * frac, 2)

    return results

def sync_audio(
    audio_path: str,
    existing_lyrics: Optional[str] = None,
    model_size: str = "base",
    language: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main transcription & sync function.
    """
    if WhisperModel is None:
        raise RuntimeError("faster-whisper is not installed. Run `pip install faster-whisper`")

    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    # Load model on CPU with INT8 quantization for optimal speed
    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    # Transcribe with word-level timestamps
    transcribe_opts = {
        "word_timestamps": True,
        "beam_size": 5,
        "vad_filter": True
    }
    if language:
        transcribe_opts["language"] = language

    segments, info = model.transcribe(audio_path, **transcribe_opts)

    collected_segments = []
    whisper_words = []

    for seg in segments:
        seg_data = {
            "start": round(seg.start, 2),
            "end": round(seg.end, 2),
            "text": seg.text.strip()
        }
        collected_segments.append(seg_data)
        if seg.words:
            for w in seg.words:
                whisper_words.append({
                    "word": w.word.strip(),
                    "start": round(w.start, 2),
                    "end": round(w.end, 2),
                    "prob": round(w.probability, 2)
                })

    detected_lang = info.language
    duration = info.duration

    # If existing lyrics are provided, align them
    lrc_lines = []
    if existing_lyrics and existing_lyrics.strip():
        raw_lines = [l for l in existing_lyrics.splitlines() if l.strip()]
        aligned = align_lyrics(raw_lines, whisper_words, duration)
        for item in aligned:
            t = format_lrc_time(item["start"])
            # Remove any pre-existing LRC tag from the line text
            cleaned_text = re.sub(r'^\[\d+:\d+(?:\.\d+)?\]', '', item["text"]).strip()
            lrc_lines.append(f"{t}{cleaned_text}")
    else:
        # Generate from Whisper segments
        for seg in collected_segments:
            t = format_lrc_time(seg["start"])
            lrc_lines.append(f"{t}{seg['text']}")

    lrc_content = "\n".join(lrc_lines)

    return {
        "language": detected_lang,
        "duration": round(duration, 2),
        "lrc": lrc_content,
        "segments_count": len(collected_segments),
        "words_count": len(whisper_words)
    }

def main():
    parser = argparse.ArgumentParser(description="JIZURA Whisper Auto-Sync")
    parser.add_argument("--audio", "-a", required=True, help="Path to audio file (mp3, wav, etc.)")
    parser.add_argument("--lyrics", "-l", help="Optional lyrics text file or string")
    parser.add_argument("--model", "-m", default="base", help="Whisper model size (tiny, base, small)")
    parser.add_argument("--lang", help="Language code (vi, en, ja, etc.)")
    parser.add_argument("--out", "-o", help="Output path for LRC file")

    args = parser.parse_args()

    lyrics_content = None
    if args.lyrics:
        if os.path.exists(args.lyrics):
            with open(args.lyrics, "r", encoding="utf-8") as f:
                lyrics_content = f.read()
        else:
            lyrics_content = args.lyrics

    result = sync_audio(args.audio, lyrics_content, args.model, args.lang)
    
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(result["lrc"])
        print(f"LRC saved to {args.out}")
    else:
        print(result["lrc"])

if __name__ == "__main__":
    main()
