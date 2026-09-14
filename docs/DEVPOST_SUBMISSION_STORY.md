# OpenDoor — Accessibility Feasibility Command Center
## Devpost Submission Story & Comprehensive CALL-E Platform Feedback

---

### Inspiration: The Elevator Paradox & The Hallucination Trap

Planning an accessibility-sensitive outing—whether for a power wheelchair user, someone who is deaf or hard of hearing, a neurodivergent individual, or an elderly relative—is fraught with high stakes and pervasive uncertainty.

Today, individuals and families rely on static digital directories like Google Maps, Yelp, or Apple Maps, which proudly display binary tags like `"Wheelchair Accessible"`. However, static claims routinely collapse in the physical world:
- **The Elevator Paradox:** A theater or museum website might legitimately have a wheelchair elevator installed. But is that elevator **working today**? Was it inspected this morning, or is it undergoing unannounced maintenance?
- **The Padlocked Ramp:** An accessible side entrance exists on building blueprints, but is it unlocked during evening hours, or does it require a staff member with a physical key?
- **The Restroom Obstacle:** A restaurant claims accessible restrooms, but are they on the main dining level or down three steps in the basement?

When vulnerable individuals attempt to solve this using modern conversational AI or generic LLM agents, they encounter an even deadlier hazard: **the Hallucination & Hedge Trap**. Generic LLMs are probabilistic language engines designed to be agreeable. When asked, *"Is the Grand Theater elevator working?"*, an LLM will extrapolate from outdated training data or scrape a stale webpage and respond with pleasant, ungrounded confidence (*"I am 90% sure it is accessible"*). 

In the physical world, **a 10% uncertainty is not a statistical margin of error—it is a human being left stranded in freezing rain at the bottom of a staircase.**

We built **OpenDoor** because the internet can only tell you what a venue *intended* to provide. Only a bounded, real-time phone call can establish ground truth. OpenDoor transforms CALL-E from a conversational chatbot into a deterministic physical-world actuator inside a strict, fail-closed safety firewall.

---

### What It Does: Full-Stack Feasibility Command Center

OpenDoor is an end-to-end, full-stack Accessibility Feasibility Command Center that bridges digital footprint discovery with live telephony verification:

1. **Digital Footprint & Physical Gap Scanner:**
   - Powered by real-time **OpenStreetMap Nominatim geocoding**, OpenDoor enables users to search physical venues worldwide with instant, debounced address resolution.
   - It parses deep digital accessibility metadata (OSM tags such as `wheelchair`, `step_count`, `toilets:wheelchair`, `hearing_loop`, `opening_hours`).
   - It performs an automated **Multi-Constraint Gap Analysis** comparing patron requirements (Wheelchair, Sensory/Quiet, Hearing Loop, Service Animal) against digital records, instantly isolating **Critical Physical Gaps** that static web data can never prove (e.g., daily elevator operational sign-off).

2. **Human-in-the-Loop Consent Gate:**
   - Adhering to ethical telephony principles, OpenDoor never cold-calls or dispatches calls autonomously.
   - It presents a human consent modal detailing the target venue, published phone number, single-purpose inquiry objective, and bounded execution budget before a single call is placed.

3. **Dual-Voice Spoken CALL-E Telephony Engine:**
   - Features a real-time telephony terminal simulating the full SIP/telephony event stream.
   - Implements **dual-voice speech synthesis** (distinct, natural acoustic profiles for the CALL-E agent vs. the venue representative).
   - Includes a responsive, real-time **live audio waveform visualizer** rendered via the Web Audio API on HTML5 Canvas that pulses in exact synchronization with spoken voice packets.

4. **Deterministic Safety Firewall & Demotion Engine:**
   - When a venue staff member provides a qualified or hedged answer (*"I think it should be working, but maintenance has not signed off on the morning inspection yet"*), probabilistic LLMs routinely classify this as a "pass".
   - OpenDoor’s safety firewall intercepts the response. Through lexical and semantic hedge detection, it **strictly demotes the qualified answer from `VERIFIED` to `UNKNOWN`**, issuing a **`NOT FULLY VERIFIED (SAFETY DEMOTION)`** executive verdict. It protects vulnerable patrons by failing closed.

5. **Multi-Constraint Feasibility Matrix:**
   - Evaluates complex outings requiring simultaneous multi-dimensional accommodations (e.g., Power Wheelchair + Hearing Assist Induction Loop + Sensory Quiet Hours).
   - Delivers actionable, plain-language guidance: what passed digitally, what was verified via CALL-E, and exactly what remaining questions must be confirmed before embarking.

6. **Technical Audit Drawer & Causal Proof Chain:**
   - Every verification generates a cryptographically traceable, millisecond-precision causal proof chain.
   - Evaluators and engineers can slide open the Technical Audit Drawer to inspect the raw CALL-E JSON schema, prompt bounds, transition timestamps, and digital vs. spoken evidence diffs.

---

### How We Built It: Architecture & Stack

- **Backend Architecture:** Built with **TypeScript** and **Node.js** running an **Express** API server. Clean, modular domain architecture separating:
  - `src/domain/feasibility.ts`: Multi-constraint satisfaction engine and safety verdict state machine.
  - `src/evidence/safety-normalizer.ts`: Deterministic hedge evaluation and fail-closed safety demotion rules.
  - `src/evidence/dynamic-search.ts`: Resilient OpenStreetMap Nominatim integration with geocoding normalization and error fallback.
  - `src/call-e/voice-engine.ts`: Server-Sent Events (SSE) telemetry streamer delivering synchronized telephony dialogue and audio waveform packet data.
- **Frontend Command Center:** Pure vanilla HTML5, modern CSS3 (custom CSS variables, high-contrast accessible color palette, glassmorphism cards, responsive flex/grid layouts), and native JavaScript. Zero bloated frontend frameworks; ultra-fast sub-50ms load times.
- **Audio & Visualizer:** Native Web Audio API and Canvas rendering engine dynamically driven by audio chunk amplitudes.
- **Community Reusable Skill:** Packaged as a portable, self-contained Agent Skill under `skills/accessible-outing-verifier/` adhering to the official CALL-E community schema.
- **Testing & Quality Assurance:** Comprehensive test suite built with **Jest** and **ts-jest**, executing 32 unit and integration tests across 10 test suites verifying all deterministic invariants.

---

### Challenges We Ran Into

1. **The Natural Language "Hedge Problem":** In conversational telephony, humans rarely speak in pure booleans. Staff frequently use hedges: *"I think so"*, *"It should be"*, *"As far as I know"*, *"Unless it broke recently"*. Building a safety normalizer that catches these nuances deterministically—without relying on another hallucination-prone LLM call—was our toughest challenge. We solved this by compiling a deterministic lexical and syntactic boundary map that treats any qualification as fail-closed.
2. **Audio Waveform Telephony Synchronization:** Synchronizing Web Speech synthesis audio playback with real-time SSE event logs and Canvas waveform oscillations across different client browser engines required precise audio timing state synchronization.
3. **Rigorous Upstream Validation Standards:** The upstream community repository (`CALLE-AI/awesome-phone-call-agents`) enforces an exceptionally strict, pure Python standard library test suite (`validate_repository.py`) comprising over 9,400 lines of validation checks. We navigated exact rules prohibiting READMEs inside skills, requiring explicit YAML frontmatter, enforcing mandatory safety and example references with RFC-reserved fictional phone numbers (`+15555550199`) and example domains (`@example.com`), and maintaining strict alphabetical catalog ordering.

---

### Accomplishments That We're Proud Of

- **Official Upstream Contribution (PR #635):** Successfully authored, validated, and opened **[Pull Request #635 on CALLE-AI/awesome-phone-call-agents](https://github.com/CALLE-AI/awesome-phone-call-agents/pull/635)**, contributing the `accessible-outing-verifier` skill directly to the official community catalog.
- **Mathematical Zero-Unsafe-Pass Guarantee:** Implemented a provable invariant where ambiguous spoken claims never promote an unverified access barrier to a pass.
- **32 Passing Tests Across 10 Test Suites:** 100% deterministic coverage of domain feasibility logic, evidence normalizers, search fallbacks, and scenario outcomes.
- **Zero-Credential Judge Path:** Built an end-to-end curated scenario engine allowing hackathon judges to experience all 4 core scenarios (The Hero Demotion, Step-Free Feasible, Critical Inaccessible, and Needs Human Review) in under 3 minutes with zero API keys or external setup required.

---

### What We Learned

Building OpenDoor reinforced a profound truth: **AI agents should never be allowed to guess about physical reality.** Web data tells you what an organization *intended* to offer; only an authentic 45-second phone conversation can verify what is *actually true today*. When voice AI is constrained to single-purpose, bounded objectives with deterministic safety checks, it transforms from an unreliable novelty into life-changing accessibility infrastructure.

---

### Valuable Technical Feedback & Architectural Recommendations for the CALL-E Platform

*(Constructive Developer Feedback for the CALL-E Core Engineering & Product Teams)*

Working extensively with the CALL-E SDK, CLI, and task execution pipelines provided deep insights into the platform's strengths and clear opportunities for architectural evolution. We share this feedback to help CALL-E become the premier enterprise telephony standard for autonomous agents:

#### 1. First-Class Support for "Hedged / Qualified" Extraction Dispositions
* **Observation:** The standard CALL-E task result extraction paradigm encourages binary boolean or string extractions (e.g., `"task_completed": true`). However, in real-world inquiries, counterparties routinely offer hedged confirmations (*"It should be on, but I haven't checked since this morning"*).
* **Recommendation:** Introduce a native `qualification_level` or `epistemic_confidence` enum (`ASSERTED_FACT`, `HEDGED_PROBABLE`, `UNVERIFIED_BELIEF`, `OUTDATED_CLAIM`) directly into the CALL-E task extraction schema. This enables developers to enforce safety-critical downstream policies without having to build custom regex normalizers on top of verbatim transcripts.

#### 2. Streaming Audio Telemetry & Low-Latency Event Hooks (WebSockets / SSE)
* **Observation:** Developing interactive client applications (like our Command Center with live audio waveforms) currently requires polling task states or re-synthesizing audio from completed text transcripts.
* **Recommendation:** Provide a streaming webhook or WebSocket subscription endpoint (`/v1/tasks/{id}/stream`) that pushes real-time RTP audio packet metadata (dB levels, speaker diarization flags, and word-level timestamps) alongside the conversation transcript. This would unlock incredible developer experiences, including live caller waveforms, real-time closed captioning, and sub-second barge-in monitoring.

#### 3. Dual-Channel Spoken Read-Back & Confirmation Guardrails
* **Observation:** In mission-critical workflows (e.g., verifying accessibility compliance, confirming booking IDs, or relaying medical requirements), acoustic misinterpretations can be catastrophic.
* **Recommendation:** Add a built-in CALL-E prompt primitive called `enforce_spoken_readback: true`. When enabled, the CALL-E engine automatically asks the counterparty to repeat or explicitly affirm the extracted critical token before tagging the task as successful.

#### 4. Developer Experience: Local Telephony Mock Server & CI Harness
* **Observation:** Running tests against live telephone numbers during continuous integration is costly, slow, and risks unintended spam to real individuals.
* **Recommendation:** Publish an official `@calle-ai/mock-telephony-server` or CLI dry-run daemon that can simulate incoming/outgoing SIP calls, audio playback, DTMF tones, and IVR menu trees directly in local Jest, PyTest, or Playwright pipelines without requiring telephony credentials.

#### 5. Native GIS & Spatial Data Anchors for Physical World Tasks
* **Observation:** When agents place calls to physical venues, grounding the prompt with spatial context (e.g., OpenStreetMap tags, building entrance coordinates, or operating hours) significantly increases conversational coherence.
* **Recommendation:** Enable a `spatial_context` parameter in `TaskCreateRequest` where developers can pass geocoded metadata (OSM node ID, venue category, published accessibility claims). The CALL-E runtime prompt synthesizer can then naturally incorporate these facts (*"I see online that you have an elevator near the North entrance..."*).

---

### What's Next for OpenDoor

1. **Mobile Accessibility Dispatch App:** Packaging OpenDoor as a React Native / Flutter iOS and Android app with location-based proximity triggers (e.g., auto-verifying destination accessibility 2 hours before a scheduled calendar appointment).
2. **Proactive Morning Cron Inspections:** Enabling venues, theaters, and transit stations to subscribe to automated morning check-ins that verify their accessibility infrastructure daily and post real-time status badges to local disability portals.
3. **OpenStreetMap Verified Write-Back:** Creating an automated pipeline that submits verified physical accessibility reports back to the global OpenStreetMap community (via OSM changeset proposals) after human confirmation.
4. **Transit & Commute Multimodal Chains:** Expanding the feasibility engine to evaluate complete end-to-end journeys (bus ramp -> subway elevator -> venue step-free entrance).
