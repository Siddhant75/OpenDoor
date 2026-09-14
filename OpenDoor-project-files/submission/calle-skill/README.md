# Accessible Outing Verifier

A specialized verification agent for physical-world event outings. It evaluates whether specific accessibility requirements can be proven through a combination of digital lookup and bounded CALL-E verification.

## Core Thesis
The agent never treats the AI conversation as the final decision maker. Instead, CALL-E is used strictly as an evidence-gathering actuator for physical constraints (e.g., "Is the elevator working today?") that cannot be reliably scraped. If the response is qualified or uncertain, the verification gracefully degrades to `UNKNOWN` to ensure human safety.

## Usage

```typescript
import { CallEAdapter, OpenDoorOrchestrator } from 'accessible-outing-verifier';

const orchestrator = new OpenDoorOrchestrator(digitalSource, callEProvider);
const state = await orchestrator.prepareOutingVerification(outingReq, '+1-555-0199');

// Explicitly authorize physical verification if there is a digital gap
const finalized = await orchestrator.authorizeAndExecuteVerification(state, { granted: true, user_id: 'user_1' });
```

## Why it's different
Unlike generic verification agents that return true/false confidence scores, this verifier enforces **deterministic local policy**. A "qualified confirmation" (e.g., "I think the ramp is clear") is explicitly demoted, forcing the human planner to review the evidence brief.
