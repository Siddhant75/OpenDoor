# OpenDoor — Accessibility Feasibility Command Center
> **"The internet can provide claims about a place. OpenDoor determines whether those claims are enough to safely answer 'Can I actually go?'—and uses CALL-E to verify the physical world when they are not."**

[![CALL-E Hackathon](https://img.shields.io/badge/CALL--E-Your%20Code%20Is%20Calling-blue.svg)](https://devpost.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![Deterministic Engine](https://img.shields.io/badge/Policy-Deterministic%20Safety-emerald.svg)](OpenDoor-project-files/README.md#the-causal-proof-chain)

---

![OpenDoor Command Center](OpenDoor-project-files/assets/01_command_center_hero.png)

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
