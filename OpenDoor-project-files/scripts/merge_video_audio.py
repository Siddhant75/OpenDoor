import os
import sys
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FFMPEG_PATH = r"C:\Users\acer\miniconda3\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
RECORDINGS_DIR = os.path.join(os.path.dirname(__file__), "..", "recordings")
INPUT_VIDEO = os.path.join(RECORDINGS_DIR, "opendoor_demo_1080p.webm")
INPUT_AUDIO = os.path.join(RECORDINGS_DIR, "opendoor_voiceover_master.wav")
OUTPUT_MP4 = os.path.join(RECORDINGS_DIR, "opendoor_demo_narrated_1080p.mp4")

def merge():
    print("🎬 Merging 1080p Video + AI Voiceover Master Track...")
    if not os.path.exists(INPUT_VIDEO):
        raise FileNotFoundError(f"Missing video: {INPUT_VIDEO}")
    if not os.path.exists(INPUT_AUDIO):
        raise FileNotFoundError(f"Missing audio: {INPUT_AUDIO}")

    # -c:v libx264 -pix_fmt yuv420p for maximum compatibility on YouTube, Devpost, Windows, Mac, iOS
    # -c:a aac -b:a 192k for studio audio
    cmd = [
        FFMPEG_PATH,
        "-y",
        "-i", INPUT_VIDEO,
        "-i", INPUT_AUDIO,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_MP4
    ]

    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        sys.exit(1)

    print(f"🎉 FINAL NARRATED DEMO VIDEO PRODUCED!")
    print(f"📁 Output File: {OUTPUT_MP4}")
    size_mb = os.path.getsize(OUTPUT_MP4) / (1024 * 1024)
    print(f"📦 File Size: {size_mb:.2f} MB")

if __name__ == "__main__":
    merge()
