#!/usr/bin/env python3
"""Transcribe audio using OpenAI Whisper API.

Usage: python3 transcribe.py <audio_file_path>

Loads OPENAI_API_KEY from ../.env (skill directory).
Falls back to environment variable if .env not present.
"""

import sys
import os
from pathlib import Path


def load_env(env_path: Path):
    if not env_path.exists():
        return
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


WHISPER_LIMIT_BYTES = 25 * 1024 * 1024  # 25MB
CHUNK_DURATION_SEC = 3600  # 60 min — at 32kbps mono ≈ 14 MB per chunk, safe under 25 MB


def is_3gpp_container(audio_path: str) -> bool:
    """Detect Samsung voice recorder's 3GPP-in-.m4a wrapper, which Whisper rejects.

    Reads the ftyp box brand directly. Avoids `file(1)`, which fails on Google Drive
    Stream files until ffmpeg/Python first opens the path and triggers Drive's fetch.
    """
    try:
        with open(audio_path, 'rb') as f:
            header = f.read(12)
        if len(header) < 12 or header[4:8] != b'ftyp':
            return False
        return header[8:10] == b'3g'  # 3gp4, 3gp5, 3g2a, etc.
    except Exception:
        return False


def compress_audio(audio_path: str) -> str:
    """Re-encode to mono 32kbps MP3 via ffmpeg. Handles 3GPP-in-m4a, exotic codecs,
    and oversized files in one pass. Returns new path."""
    import tempfile
    import subprocess
    out = tempfile.mktemp(suffix='.mp3')
    result = subprocess.run(
        ['ffmpeg', '-y', '-i', audio_path, '-ac', '1', '-ar', '16000',
         '-b:a', '32k', '-loglevel', 'error', out],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"WARNING: ffmpeg failed ({result.stderr.strip()}), sending original file", file=sys.stderr)
        return audio_path
    compressed_size = Path(out).stat().st_size
    original_size = Path(audio_path).stat().st_size
    print(f"Compressed {original_size/1024/1024:.1f}MB → {compressed_size/1024/1024:.1f}MB", file=sys.stderr)
    return out


def chunk_audio(audio_path: str, chunk_sec: int = CHUNK_DURATION_SEC) -> list:
    """Split audio into time-based chunks via ffmpeg segment muxer. Returns list of chunk paths."""
    import tempfile
    import subprocess
    import glob
    tmpdir = tempfile.mkdtemp(prefix='whisper_chunks_')
    pattern = os.path.join(tmpdir, 'chunk_%03d.m4a')
    result = subprocess.run(
        ['ffmpeg', '-y', '-i', audio_path, '-f', 'segment',
         '-segment_time', str(chunk_sec), '-c', 'copy', '-loglevel', 'error', pattern],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"ERROR: ffmpeg chunking failed: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    chunks = sorted(glob.glob(os.path.join(tmpdir, 'chunk_*.m4a')))
    print(f"Split into {len(chunks)} chunk(s) of up to {chunk_sec//60} min each", file=sys.stderr)
    return chunks


def transcribe(audio_path: str, api_key: str) -> str:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        with open(audio_path, 'rb') as f:
            result = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                response_format="text"
            )
        return result
    except ImportError:
        import requests
        with open(audio_path, 'rb') as f:
            response = requests.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {api_key}"},
                data={"model": "whisper-1"},
                files={"file": (Path(audio_path).name, f)}
            )
        if response.status_code != 200:
            print(f"ERROR {response.status_code}: {response.text}", file=sys.stderr)
            sys.exit(1)
        return response.json().get("text", "")


def main():
    if len(sys.argv) < 2:
        print("Usage: transcribe.py <audio_file>", file=sys.stderr)
        sys.exit(1)

    audio_file = sys.argv[1]
    if not Path(audio_file).exists():
        print(f"ERROR: File not found: {audio_file}", file=sys.stderr)
        sys.exit(1)

    # Load .env from skill root (parent of scripts/)
    skill_dir = Path(__file__).parent.parent
    load_env(skill_dir / '.env')

    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        print(
            "ERROR: OPENAI_API_KEY not set.\n"
            f"Add it to: {skill_dir / '.env'}\n"
            "Format: OPENAI_API_KEY=sk-...",
            file=sys.stderr
        )
        sys.exit(1)

    # Samsung voice recorder writes 3GPP audio with a .m4a extension; Whisper rejects it.
    # Re-encode to MP3 first.
    if is_3gpp_container(audio_file):
        print(f"Detected 3GPP container — re-encoding to MP3...", file=sys.stderr)
        audio_file = compress_audio(audio_file)

    # Auto-compress if over Whisper's 25MB limit
    if Path(audio_file).stat().st_size > WHISPER_LIMIT_BYTES:
        print(f"File exceeds 25MB limit — compressing...", file=sys.stderr)
        audio_file = compress_audio(audio_file)

    # If still over limit after compression, chunk and concatenate transcripts
    if Path(audio_file).stat().st_size > WHISPER_LIMIT_BYTES:
        print(f"Still over limit after compression — chunking...", file=sys.stderr)
        chunks = chunk_audio(audio_file)
        parts = []
        for i, chunk in enumerate(chunks, 1):
            size_mb = Path(chunk).stat().st_size / 1024 / 1024
            print(f"  Transcribing chunk {i}/{len(chunks)} ({size_mb:.1f}MB)...", file=sys.stderr)
            parts.append(transcribe(chunk, api_key).strip())
        print("\n\n".join(parts))
        return

    transcript = transcribe(audio_file, api_key)
    print(transcript)


if __name__ == '__main__':
    main()
