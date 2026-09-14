import os
import sys
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FFMPEG_PATH = r"C:\Users\acer\miniconda3\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "recordings", "audio_segments")
OUTPUT_MASTER = os.path.join(os.path.dirname(__file__), "..", "recordings", "opendoor_voiceover_master.wav")

# Synchronized Cue Schedule (Milliseconds)
TIMINGS = [
    ("SEG_01_HOOK", 500),          # 0.5s -> ~14.3s
    ("SEG_02_DIGITAL_SCAN", 15000), # 15.0s -> ~23.6s
    ("SEG_03_GAP_IDENTIFIED", 24500),# 24.5s -> ~34.4s
    ("SEG_04_CONSENT_GATE", 35000), # 35.0s -> ~41.2s
    ("SEG_05_AGENT_QUESTION", 42000),# 42.0s -> ~50.0s
    ("SEG_06_VENUE_ANSWER", 50500), # 50.5s -> ~56.0s
    ("SEG_07_FIREWALL_EXPLAINED", 57000),# 57.0s -> ~68.2s
    ("SEG_08_VERDICT_REVEAL", 69000),# 69.0s -> ~80.6s
    ("SEG_09_TECHNICAL_DRAWER", 81500),# 81.5s -> ~90.9s
    ("SEG_10_SCENARIO2_FEASIBLE", 92000),# 92.0s -> ~105.0s
    ("SEG_11_GLOBAL_SEARCH_OUTRO", 106000),# 106.0s -> ~117.5s
]

def build_master_audio():
    inputs = []
    filter_parts = []
    mix_labels = []

    for idx, (seg_id, delay_ms) in enumerate(TIMINGS):
        file_path = os.path.join(AUDIO_DIR, f"{seg_id}.mp3")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Missing audio segment: {file_path}")
        inputs.extend(["-i", file_path])
        filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms}[a{idx}]")
        mix_labels.append(f"[a{idx}]")

    all_labels = "".join(mix_labels)
    # amix normalizes volume by 1/N by default, so we multiply volume by len(TIMINGS) to preserve original loudness
    volume_boost = len(TIMINGS)
    filter_complex = f"{';'.join(filter_parts)};{all_labels}amix=inputs={len(TIMINGS)}:dropout_transition=0:normalize=0,volume={volume_boost}[out]"

    cmd = [
        FFMPEG_PATH,
        "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[out]",
        "-t", "120", # 2 minutes total
        OUTPUT_MASTER
    ]

    print(f"🎵 Assembling {len(TIMINGS)} audio segments into master timeline (120s)...")
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        sys.exit(1)

    print(f"✅ Master audio track created successfully: {OUTPUT_MASTER}")
    size_mb = os.path.getsize(OUTPUT_MASTER) / (1024 * 1024)
    print(f"   File size: {size_mb:.2f} MB")

if __name__ == "__main__":
    build_master_audio()
