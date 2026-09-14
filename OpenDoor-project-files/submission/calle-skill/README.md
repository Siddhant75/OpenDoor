# CALL-E Community Skill: `accessible-outing-verifier`

> **Submission Area:** `skills/accessible-outing-verifier/`  
> **Upstream Target:** [CALLE-AI/awesome-phone-call-agents](https://github.com/CALLE-AI/awesome-phone-call-agents)  
> **Author:** Siddhant Phukan  
> **License:** MIT  

---

## Overview

`accessible-outing-verifier` is a reusable, safety-bounded Agent Skill for the CALL-E ecosystem. It solves **The Elevator Paradox**: online directories often provide static accessibility tags (`"Wheelchair Accessible"`), but cannot confirm whether physical infrastructure is operating *today*.

Unlike generic voice assistants that return ungrounded or hedged responses, this skill:
1. **Triages Digital Gaps First:** Separates static facility constraints from daily operational dependencies.
2. **Bounds Telephony actuation:** Calls the venue only when an operational gap exists, using a strict single-purpose CALL-E prompt and JSON extraction schema.
3. **Enforces Deterministic Demotion:** Hedged statements (*"I think the lift is working"*) are strictly demoted to `UNKNOWN`, ensuring disabled patrons are never stranded by hallucinated or uncertain confidence.

---

## Directory Structure

Conforms strictly to the `awesome-phone-call-agents` Agent Skills template:

```text
skills/accessible-outing-verifier/
├── SKILL.md                          # Full agent skill specification & prompt instructions
├── README.md                         # Package overview & quick start guide
├── references/
│   └── calle-task-schema.json        # Structured extraction schema passed to CALL-E
├── assets/
│   ├── sample-outing-request.json    # Example user outing profile with mixed constraints
│   └── sample-verdict-demoted.json   # Output feasibility brief with safety demotion trace
└── scripts/
    └── verify-outing.mjs             # Standalone runner (offline dry-run default)
```

---

## How to Test Standalone (Dry Run)

Zero external dependencies required. Simply run with Node.js:

```bash
# Offline dry-run verification using sample fixture
node scripts/verify-outing.mjs --profile assets/sample-outing-request.json
```

Output:
```text
[1/3] Digital Evidence Assessment: PASS (Step-free entrance confirmed)
[2/3] Physical Operational Gap Detected: "Main Elevator Operating Today"
[3/3] CALL-E Telephony Extraction: "I think it should be working..."
[FIREWALL] Qualified confirmation detected -> Strictly demoted to UNKNOWN.
VERDICT: NOT FULLY VERIFIED (Reason: Operational elevator constraint unconfirmed)
```

---

## Upstream PR Contribution Entry

When opening a Pull Request to `CALLE-AI/awesome-phone-call-agents`, copy this folder to `skills/accessible-outing-verifier/` and add this line to `README.md` under `### Skills`:

```markdown
- [`accessible-outing-verifier`](skills/accessible-outing-verifier/) - Dual-phase outing accessibility verifier that bridges digital claims with bounded CALL-E calls, enforcing a deterministic safety demotion for hedged answers.
```
