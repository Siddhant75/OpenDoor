import os
import sys
import json
from pathlib import Path

# Add compatible click and python dependencies from project cache
sys.path.insert(0, r"D:\WebMCP hackathon\WebMCP_RightsOps_Plan_v1.1_Retrofit\demo-video\final-edit\cache\python")
os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = r"C:\Program Files\eSpeak NG\libespeak-ng.dll"
os.environ["HF_HUB_OFFLINE"] = "1"

import numpy as np
import soundfile as sf
import torch
from kokoro import KModel, KPipeline

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = Path(__file__).resolve().parents[1]
KOKORO_DIR = Path(r"D:\WebMCP hackathon\WebMCP_RightsOps_Plan_v1.1_Retrofit\demo-video\final-edit\cache\kokoro")
OUTPUT_DIR = PROJECT_ROOT / "recordings" / "audio_segments"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

VOICES = {
    "Narrator": str(KOKORO_DIR / "voices" / "af_heart.pt"),
    "OpenDoor_Agent": str(KOKORO_DIR / "voices" / "am_adam.pt"),
    "Venue_Staff": str(KOKORO_DIR / "voices" / "am_eric.pt")
}

def clean_text_for_tts(text: str) -> str:
    cleaned = text
    cleaned = cleaned.replace("OpenDoor", "Open Door")
    cleaned = cleaned.replace("CALL-E", "Call E")
    cleaned = cleaned.replace("OpenStreetMap", "Open Street Map")
    return cleaned

def generate_all():
    print("🧠 Initializing Kokoro-82M Neural TTS Engine...")
    torch.manual_seed(0)
    torch.set_num_threads(min(4, os.cpu_count() or 1))

    model = KModel(
        repo_id="hexgrad/Kokoro-82M",
        config=str(KOKORO_DIR / "config.json"),
        model=str(KOKORO_DIR / "kokoro-v1_0.pth")
    ).to("cpu").eval()

    pipeline = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M", model=model)
    print("✅ Kokoro Pipeline initialized successfully.")

    cues_path = PROJECT_ROOT / "submission_assets" / "ai-voiceover-cues.json"
    with open(cues_path, "r", encoding="utf-8") as f:
        cues = json.load(f)

    manifest = []
    sample_rate = 24000

    print(f"\n🎙️ Synthesizing {len(cues['segments'])} segments with Kokoro-82M studio voices...\n")

    for seg in cues["segments"]:
        seg_id = seg["id"]
        speaker = seg["speaker"]
        voice_path = VOICES.get(speaker, VOICES["Narrator"])
        raw_text = seg["text"]
        spoken_text = clean_text_for_tts(raw_text)
        out_wav = OUTPUT_DIR / f"{seg_id}.wav"

        print(f"[{seg_id}] Speaker: {speaker} | Voice: {Path(voice_path).stem}")
        print(f"   Text: \"{raw_text[:60]}...\"")

        chunks = []
        for res in pipeline(spoken_text, voice=voice_path, speed=1.0):
            chunks.append(res.audio.cpu().numpy())

        audio = np.concatenate(chunks)
        peak = float(np.max(np.abs(audio)))
        if peak == 0:
            raise RuntimeError(f"Silent audio generated for {seg_id}")

        # Peak normalization strictly capped at -2.0 dBFS to completely eliminate clipping
        gain = min(1.0, (10 ** (-2.0 / 20)) / peak)
        audio = audio * gain

        sf.write(str(out_wav), audio, sample_rate, subtype="PCM_16")

        duration = len(audio) / sample_rate
        peak_dbfs = 20 * np.log10(np.max(np.abs(audio)))
        rms_dbfs = 20 * np.log10(np.sqrt(np.mean(audio ** 2)))
        clipped = int(np.sum(np.abs(audio) >= 1.0))

        print(f"   ✅ Saved: {out_wav.name} | Dur: {duration:.2f}s | Peak: {peak_dbfs:.2f} dBFS | Clipped: {clipped}\n")

        manifest.append({
            "id": seg_id,
            "speaker": speaker,
            "voice": Path(voice_path).stem,
            "file": str(out_wav),
            "start_time_s": seg["start_time_s"],
            "duration_s": float(duration),
            "peak_dbfs": float(peak_dbfs),
            "rms_dbfs": float(rms_dbfs),
            "clipped_samples": int(clipped)
        })

    manifest_path = OUTPUT_DIR / "kokoro_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    total_speech = sum(m["duration_s"] for m in manifest)
    print(f"🎉 Complete! Synthesized {len(manifest)} segments (Total speech: {total_speech:.2f}s).")
    print(f"📋 Manifest written to: {manifest_path}")

if __name__ == "__main__":
    generate_all()
