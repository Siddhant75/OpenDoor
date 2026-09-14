import asyncio
import json
import os
import sys
import subprocess
import edge_tts

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

VOICE_MAP = {
    "Narrator": "en-US-ChristopherNeural",
    "OpenDoor_Agent": "en-US-AriaNeural",
    "Venue_Staff": "en-US-EricNeural"
}

FFMPEG_PATH = r"C:\Users\acer\miniconda3\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "recordings", "audio_segments")

async def generate_segment(seg):
    seg_id = seg["id"]
    speaker = seg["speaker"]
    voice = VOICE_MAP.get(speaker, "en-US-ChristopherNeural")
    text = seg["text"]
    out_file = os.path.join(OUTPUT_DIR, f"{seg_id}.mp3")

    print(f"🎙️ Generating {seg_id} ({speaker} via {voice})...")
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(out_file)
    
    # Check duration via ffmpeg / ffprobe
    res = subprocess.run(
        [FFMPEG_PATH, "-i", out_file],
        stderr=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )
    # Extract Duration: 00:00:05.12
    import re
    match = re.search(r"Duration:\s*(\d+):(\d+):([\d\.]+)", res.stderr)
    duration = 0.0
    if match:
        h, m, s = match.groups()
        duration = int(h) * 3600 + int(m) * 60 + float(s)

    allocated = seg["end_time_s"] - seg["start_time_s"]
    print(f"   Duration: {duration:.2f}s (Allocated window: {allocated:.2f}s)")
    return {
        "id": seg_id,
        "file": out_file,
        "start_time_s": seg["start_time_s"],
        "duration": duration,
        "allocated": allocated
    }

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    cues_path = os.path.join(os.path.dirname(__file__), "..", "submission_assets", "ai-voiceover-cues.json")
    with open(cues_path, "r", encoding="utf-8") as f:
        cues = json.load(f)

    results = []
    for seg in cues["segments"]:
        r = await generate_segment(seg)
        results.append(r)

    print("\n✅ All voiceover segments successfully generated!")
    with open(os.path.join(OUTPUT_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    asyncio.run(main())
