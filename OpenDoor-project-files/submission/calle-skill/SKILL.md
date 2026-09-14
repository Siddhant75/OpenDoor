---
name: accessible-outing-verifier
description: Evaluates whether physical-world accessibility requirements can be proven for an outing by combining digital evidence with bounded CALL-E phone calls, strictly demoting qualified claims to protect patrons.
license: MIT
---

# Accessible Outing Verifier

Planning an accessibility-sensitive outing (e.g., for a power wheelchair user, someone who is deaf, or a person with sensory sensitivities) currently relies on static online directory tags ("Wheelchair Accessible").

Where online data exists, it is often one flattened claim that hides daily operational reality:
- **The Elevator Paradox:** A theater website lists an elevator, but is it operating today? Did maintenance sign off on it this morning?
- **The Qualified Guess:** Venue staff may say *"I think the ramp should be clear"* or *"The lift is usually fine"*. For a wheelchair user, a qualified guess can mean being stranded outside or facing physical danger.

This skill bridges the digital gap: it checks digital claims first, pinpoints physical operational gaps, and places at most **one bounded CALL-E call** with an explicit schema. Crucially, it routes staff answers through a **deterministic safety demotion engine**—demoting any hedged or qualified answer to `UNKNOWN` to ensure human safety.

## When to use this skill

- Someone is planning an outing to a venue and has non-negotiable physical accessibility constraints (e.g. elevator working today, step-free path, accessible restroom width).
- An agent has scraped digital tags for a place but cannot verify today's operational status.
- You need a structured, auditable Feasibility Brief (`FEASIBLE`, `NOT FULLY VERIFIED`, or `NOT FEASIBLE`) with direct staff quotes and timestamps.

## When not to use it

- To conduct formal ADA or building code compliance audits. This verifies today's operational conditions; it does not issue legal certifications.
- To make repeated nuisance calls to a business. Strictly **one call per venue per outing plan**.
- Without explicit human consent to place the call and review the outgoing task script.
- For emergency, medical, or life-safety dispatch.

## Before you start

You need three items:

1. **An Outing Profile (`profile.json`):**
   Contains the target venue name, phone number, and a list of specific constraints categorized into `static_facility` (doors, parking) and `daily_operational` (elevators, temporary ramps, live captioning).

2. **A phone number in E.164 format:**
   Must start with `+` and the country code (e.g. `+15550199`). Guessed or local-only formats are rejected.

3. **Explicit Human Consent:**
   Physical verification calls create real-world side effects. The user must review the proposed question and authorize dispatch.

For real phone calls, provide CALL-E credentials:
```bash
npm install @call-e/calle
export CALLE_API_KEY="your_calle_api_key"
```

*Dry run is the default:* All scripts run offline against deterministic fixtures without an API key or network socket.

## Safety boundaries

1. **Dry-Run by Default:** Without `--real`, every execution evaluates offline fixtures. No socket is opened, no credits are spent, and no phone is dialed.
2. **Deterministic Demotion Firewall:** If venue staff answers with uncertainty (*"I think..."*, *"probably"*, *"should be"*), the skill strictly demotes the response from Confirmed to `UNKNOWN (STRICT SAFETY DEMOTION)`. It refuses to guess.
3. **Explicit Consent Gate:** The agent halts after digital gap analysis and requests explicit user authorization before dialing.
4. **Data Privacy & Masking:** Phone numbers are masked in all logs and outputs (e.g., `+1-555-***-0199`). No personal patron data or medical details are disclosed during the call.
5. **Fail-Closed Principle:** If a call fails, times out, or encounters a busy line, the verdict is `NEEDS_HUMAN_REVIEW` or `NOT FULLY VERIFIED`—never an assumed pass.

## Workflow

### Step 1: Establish Outing Profile & Digital Gap

Define the venue and constraints in a profile:

```json
{
  "venue": "The Grand Theater",
  "phone": "+15550199",
  "persona": "Power Wheelchair User",
  "constraints": [
    { "id": "c1", "type": "daily_operational", "label": "Main Elevator Operating Today", "critical": true },
    { "id": "c2", "type": "static_facility", "label": "Step-Free Main Entrance", "critical": true }
  ]
}
```

### Step 2: Dry Run (Validate without dialing)

```bash
node scripts/verify-outing.mjs --profile assets/sample-outing-request.json
```

This validates the JSON schema, separates static from operational constraints, and previews the exact CALL-E call task and question.

### Step 3: CALL-E Execution & Deterministic Normalization

When authorized (`--real`), CALL-E dispatches the call with the strict extraction schema defined in `references/calle-task-schema.json`:

```json
{
  "call_task": "Call The Grand Theater at +15550199 to verify if the main auditorium elevator is operating today.",
  "expected_fields": {
    "elevator_operational": "confirmed | qualified_confirmation | refuted | unknown",
    "staff_quote": "string"
  }
}
```

The deterministic normalizer evaluates the response:
- `confirmed` $\rightarrow$ Constraint marked `PASSED`.
- `qualified_confirmation` (*"I think it should be working..."*) $\rightarrow$ Demoted to `UNKNOWN`. Outing verdict: `NOT FULLY VERIFIED`.
- `refuted` (*"Elevator is undergoing repairs today"*) $\rightarrow$ Constraint marked `FAILED`. Outing verdict: `NOT FEASIBLE`.

### Step 4: Actionable Feasibility Brief Output

The skill renders a clean, timestamped summary with the audit trail:

```text
============================================================
           OPENDOOR ACCESSIBILITY FEASIBILITY BRIEF
============================================================
Venue:     The Grand Theater (+1-555-***-0199)
Persona:   Power Wheelchair User
Verdict:   NOT FULLY VERIFIED (SAFETY DEMOTION)

Verified Findings:
  [PASS] Step-Free Main Entrance (Static - Confirmed via OSM)
  [WARN] Main Elevator Operating Today (Demoted to UNKNOWN)
         Staff Quote: "I think it should be working, but maintenance
                       has not signed off yet."
         Reason: Qualified confirmation strictly demoted by local safety policy.
============================================================
```
