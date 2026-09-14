# OpenDoor — Curated Judge Scenarios & Sandbox Guide

To enable instant, reproducible evaluation without requiring live telephony carrier credentials, OpenDoor provides 4 curated real-world edge cases accessible via one click in the Command Center.

---

## The 4 Curated Scenarios

### Scenario 1: The Hero Demotion (The Flagship Case)
- **Venue:** The Grand Theater (+1-555-0199)
- **Persona:** Power Wheelchair User
- **User Constraints:**
  1. Step-Free Main Entrance (Static facility)
  2. Designated Accessible Parking (Static facility)
  3. Main Elevator Operating Today (Daily operational)
- **Digital Footprint:** OSM confirms parking and step-free entrance. Main elevator is flagged as a **CRITICAL PHYSICAL GAP**.
- **The Spoken Response:** Staff answers: *"I think it should be working, but maintenance hasn't signed off on the morning inspection yet."*
- **Engine Behavior:** The deterministic safety firewall identifies `qualified_confirmation` and demotes it strictly to `UNKNOWN`.
- **Final Verdict:** **`NOT FULLY VERIFIED (SAFETY ABSTAIN)`**.

---

### Scenario 2: Full Confirmation (Unconditional Feasibility)
- **Venue:** Metropolitan Symphony Hall (+1-555-0244)
- **Persona:** Wheelchair User + Companion Seating
- **User Constraints:**
  1. Ramped Hallway Access (Static facility)
  2. Main Auditorium Elevator Active (Daily operational)
  3. Companion Seating Availability (Daily operational)
- **The Spoken Response:** Staff confirms: *"Yes, both elevator banks A and B are active with no interruptions, and companion seating in Row M is reserved and clear."*
- **Engine Behavior:** All operational constraints return direct certainty (`CONFIRMED`).
- **Final Verdict:** **`FEASIBLE (100% OPERATIONAL CERTAINTY)`**.

---

### Scenario 3: Hard Physical Barrier (Physical Refutation)
- **Venue:** The Rooftop Lounge (+1-555-0377)
- **Persona:** Historic Landmark Tour (Mobility Impaired)
- **User Constraints:**
  1. Accessible Entrance or Lift to Observation Deck (Daily operational)
- **The Spoken Response:** Staff responds: *"This is a protected 19th-century landmark building; guests must climb 42 stone steps to reach the lounge. There is no elevator or mechanical lift."*
- **Engine Behavior:** Staff refutes the constraint (`REFUTED`).
- **Final Verdict:** **`NOT FEASIBLE (HARD PHYSICAL BARRIER)`**. The engine prevents the user from attempting an impossible journey.

---

### Scenario 4: Telephony Failure (Fail-Closed Robustness)
- **Venue:** Underground Comedy Club (+1-555-0411)
- **Persona:** Sensory Sensitive Outing
- **User Constraints:**
  1. Quiet Low-Sensory Break Area Available (Daily operational)
- **The Spoken Response:** The venue line is busy, times out after 3 automated attempts, or disconnects.
- **Engine Behavior:** OpenDoor refuses to fabricate confidence or assume availability.
- **Final Verdict:** **`NEEDS REVIEW (TELEPHONY UNREACHABLE)`**.

---

## Live Global Place Search (OpenStreetMap Nominatim)

Beyond the 4 curated sandbox scenarios, OpenDoor features a live global search bar integrated with OpenStreetMap's Nominatim API ([`src/evidence/dynamic-search.ts`](../src/evidence/dynamic-search.ts)).

- **Global Autocomplete:** Type any real-world venue (e.g. *Sydney Opera House*, *Lincoln Center*, *Royal Albert Hall*).
- **Automated Geocoding & Extraction:** Extracts live address, coordinates, telephone number, and OSM accessibility tags (`wheelchair=yes/no/limited`).
- **Live Telephony Toggle:** Switch to "Live Telephony Dispatch" in the top navbar to enter your own phone number and test live end-to-end phone calls.
