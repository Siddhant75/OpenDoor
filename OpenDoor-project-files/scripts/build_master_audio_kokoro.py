import os
import sys
import subprocess
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FFMPEG_PATH = r"C:\Users\acer\miniconda3\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
PROJECT_ROOT = Path(__file__).resolve().parents[1]
AUDIO_DIR = PROJECT_ROOT / "recordings" / "audio_segments"
OUTPUT_MASTER = PROJECT_ROOT / "recordings" / "opendoor_voiceover_master.wav"

TIMINGS = [
    ("SEG_01_HOOK", 500),            # 0.5s -> 13.28s
    ("SEG_02_DIGITAL_SCAN", 15000),   # 15.0s -> 23.75s
    ("SEG_03_GAP_IDENTIFIED", 24500), # 24.5s -> 34.53s
    ("SEG_04_CONSENT_GATE", 35000),   # 35.0s -> 41.17s
    ("SEG_05_AGENT_QUESTION", 42000), # 42.0s -> 49.17s
    ("SEG_06_VENUE_ANSWER", 50500),   # 50.5s -> 55.53s
    ("SEG_07_FIREWALL_EXPLAINED", 57000), # 57.0s -> 66.80s
    ("SEG_08_VERDICT_REVEAL", 69000), # 69.0s -> 80.72s
    ("SEG_09_TECHNICAL_DRAWER", 81500), # 81.5s -> 91.53s
    ("SEG_10_SCENARIO2_FEASIBLE", 92000), # 92.0s -> 105.22s
    ("SEG_11_GLOBAL_SEARCH_OUTRO", 106000), # 106.0s -> 118.00s
]

def build_master():
    inputs = []
    filter_parts = []
    mix_labels = []

    for idx, (seg_id, delay_ms) in enumerate(TIMINGS):
        file_path = AUDIO_DIR / f"{seg_id}.wav"
        if not file_path.exists():
            raise FileNotFoundError(f"Missing audio segment: {file_path}")
        inputs.extend(["-i", str(file_path)])
        filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms}[a{idx}]")
        mix_labels.append(f"[a{idx}]")

    all_labels = "".join(mix_labels)
    # amix combines without artificial multiplier; loudnorm delivers EBU R128 (-16 LUFS, True Peak -1.5 dBFS)
    filter_complex = (
        f"{';'.join(filter_parts)};"
        f"{all_labels}amix=inputs={len(TIMINGS)}:dropout_transition=0:normalize=0,"
        f"loudnorm=I=-16:TP=-1.5:LRA=11:print_format=summary[out]"
    )

    cmd = [
        FFMPEG_PATH,
        "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[out]",
        "-ar", "48000", # 48kHz broadcast audio
        "-t", "120",    # 120s master timeline
        str(OUTPUT_MASTER)
    ]

    print(f"🎵 Assembling {len(TIMINGS)} Kokoro audio segments into master timeline (120s)...")
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        sys.exit(1)

    print(f"✅ Master audio track created: {OUTPUT_MASTER}")
    size_mb = os.path.getsize(OUTPUT_MASTER) / (1024 * 1024)
    print(f"   File size: {size_mb:.2f} MB")

    # Run volumedetect to prove 0 clipping
    vdetect_cmd = [
        FFMPEG_PATH,
        "-i", str(OUTPUT_MASTER),
        "-af", "volumedetect",
        "-f", "null",
        "-"
    ]
    vd_res = subprocess.run(vdetect_cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in vd_res.stderr.splitlines():
        if "max_volume" in line or "mean_volume" in line or "histogram_0db" in line:
            print("   " + line.strip())

if __name__ == "__main__":
    build_master()
