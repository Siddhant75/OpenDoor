# OpenDoor — Accessibility Feasibility Command Center
> **"The internet can provide claims about a place. OpenDoor determines whether those claims are enough to safely answer 'Can I actually go?'—and uses CALL-E to verify the physical world when they are not."**

[![CALL-E Hackathon](https://img.shields.io/badge/CALL--E-Your%20Code%20Is%20Calling-blue.svg)](https://devpost.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![Deterministic Engine](https://img.shields.io/badge/Policy-Deterministic%20Safety-emerald.svg)](OpenDoor-project-files/README.md#the-causal-proof-chain)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-1080p%20Narrated%20(1m58s)-purple.svg)](#-2-minute-narrated-demo-video)

---

## 🎬 2-Minute Narrated Demo Video

![OpenDoor 1080p Narrated Demo](OpenDoor-project-files/assets/01_command_center_hero.png)

> 📺 **Demo Video:** Submitted on Devpost & YouTube (strictly under the 3-minute hackathon limit).  
> ⏱️ **Runtime:** `01:58.00` (118.0 seconds)  
> 🎙️ **Multi-Voice Audio:** Multi-speaker neural audio synthesized via local **Kokoro-82M** (`af_heart` Narrator, `am_adam` OpenDoor Agent, `am_eric` Venue Staff) with **EBU R128** broadcast mastering (-16 LUFS, -1.4 dBFS true peak, 0 clipping).  
> 🕹️ **Automation Suite:** Frame-accurate Playwright recorder with smooth virtual cursor telemetry and click ripple physics.

---

## Quick Navigation

- 📖 **[Full Project Documentation](OpenDoor-project-files/README.md)**: Architecture, Causal Proof Chain, Visual Tour, and 4 Curated Judge Scenarios.
- 🚀 **[Project Source Code](OpenDoor-project-files/)**: Main application repository and test suites.
- 🧪 **[Judge Testing Guide](OpenDoor-project-files/submission_assets/testing-instructions.md)**: Step-by-step instructions for judges to test both Live Telephony and Sandbox Scenarios.
- 📦 **[Reusable CALL-E Community Skill](OpenDoor-project-files/submission/calle-skill/README.md)**: Ready-to-publish skill for the CALL-E ecosystem.

---

## Quick Start (For Judges)

```bash
# Navigate to project directory
cd OpenDoor-project-files

# Install dependencies
npm install

# Start the Command Center
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Run Automated Test Suite
```bash
cd OpenDoor-project-files
npm test
```
All 32 unit and integration tests across 10 test suites will execute and verify 100% deterministic domain safety.
