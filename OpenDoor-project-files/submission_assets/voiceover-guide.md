# OpenDoor — AI Voiceover Assembly & Hackathon Video Guide

This guide provides instructions for combining the recorded 1080p demo video with multi-speaker AI voiceover to create the final public submission video for the **Devpost "CALL-E: Your Code Is Calling" Hackathon**.

---

## 1. Project Video Artifacts

| Artifact | File Location | Details |
|---|---|---|
| **📹 Recorded 1080p Video** | `recordings/opendoor_demo_1080p.webm` | High-definition 1080p screencast with visible virtual cursor, click ripple effects, and all 6 acts. (~115s, 10.6 MB) |
| **🎙️ Voiceover Cue Sheet** | `submission_assets/ai-voiceover-cues.json` | Timestamped JSON segments with exact speaker roles, delivery tones, and plain text. |
| **📝 Teleprompter Script** | `submission_assets/demo-script.md` | Human-readable 3-minute presentation script. |
| **📸 High-Res Screenshots** | `assets/*.png` | 5 Retina-quality captures embedded into `README.md`. |

---

## 2. Generating the AI Voiceover Audio

You can generate the audio tracks using any leading AI voice platform (e.g. **ElevenLabs**, **OpenAI TTS**, or **PlayHT**):

### Recommended Speaker Personas

1. **Narrator / Presenter (The Storyteller):**
   - **Voice:** ElevenLabs *Adam* / *Brian* or OpenAI TTS `onyx`
   - **Pacing:** Confident, engaging, warm, professional product pitch tone.
   - **Segments to generate:** `SEG_01`, `SEG_02`, `SEG_03`, `SEG_04`, `SEG_05`, `SEG_06`, `SEG_09`, `SEG_10`, `SEG_11`, `SEG_12`.

2. **OpenDoor Agent (CALL-E AI Assistant):**
   - **Voice:** ElevenLabs *Rachel* / *Sarah* or OpenAI TTS `nova`
   - **Pacing:** Crisp, polite, neutral, telephone operator clarity.
   - **Segments to generate:** `SEG_07`.
   - *Line:* *"Hi, this is OpenDoor calling to verify accessibility for a patron attending tonight. Is your main passenger elevator working right now?"*

3. **Venue Staff (The Grand Theater):**
   - **Voice:** ElevenLabs *George* / *Antoni* or OpenAI TTS `echo`
   - **Pacing:** Casual, slightly hesitant, conversational front desk worker.
   - **Segments to generate:** `SEG_08`.
   - *Line:* *"I think it should be working, but maintenance has not signed off on the morning inspection yet."*

---

## 3. Assembling the Video (Zero-Cost / Easy Options)

### Option A: Microsoft Clipchamp (Built-in on Windows 11 / Free)
1. Open **Clipchamp** (pre-installed on Windows or open in Edge/Chrome at [clipchamp.com](https://clipchamp.com)).
2. Drag and drop `recordings/opendoor_demo_1080p.webm` onto the timeline.
3. Import your generated audio files (or use Clipchamp's built-in **"Text to Speech"** tab and copy-paste the text directly from `submission_assets/ai-voiceover-cues.json`).
4. Align the audio with the on-screen visual events:
   - When the scan button is clicked $\rightarrow$ Digital Gap voiceover.
   - When the live call terminal opens $\rightarrow$ Agent & Venue dialog.
   - When the amber verdict flashes $\rightarrow$ Firewall demotion voiceover.
5. Export as **1080p MP4**.

### Option B: CapCut / DaVinci Resolve (Desktop)
1. Import `opendoor_demo_1080p.webm`.
2. Drop the 3 audio tracks (Narrator, Agent, Venue) onto separate audio tracks.
3. (Optional) Add a subtle royalty-free background lo-fi tech ambient track at -22dB.
4. Export as **1080p MP4**.

---

## 4. Pre-Submission Quality Checklist for Devpost

- [ ] **Duration Check:** Total runtime must be **under 3:00** (Our recording is ~1:55, leaving plenty of room for audio pacing).
- [ ] **Video Host:** Upload to **YouTube** (set to Unlisted or Public) or **Vimeo**.
- [ ] **Devpost Fields:**
  - Video URL: Paste your YouTube link.
  - GitHub Repo: Link to your repository.
  - Project Story: Copy the executive overview and Causal Proof Chain from `README.md`.
