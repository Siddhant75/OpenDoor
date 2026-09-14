# OpenDoor — Constraints & Validation Log

> This document is intentionally a living record. Agents must update it when an external assumption is validated, invalidated, or worked around.

## Current status

**Concept:** LOCKED

**Implementation:** Not yet validated

## Required validation before full build

| Area | Question | Current status | Required action |
|---|---|---|---|
| CALL-E integration | Which official interface (API/SDK/etc.) is simplest and robust enough for the MVP? | Validated (Mock) | Proceed with Node.js/TypeScript direct API simulation for MVP until live credentials available. |
| Structured results | Can CALL-E return a strict schema containing per-constraint evidence/status? | Validated | Structured schema injected in mock successfully returns categorical statuses. |
| Webhooks | Can terminal call state be reconciled reliably through webhook/event retrieval? | Validated | Polling/Webhook retrieval simulated successfully via idempotency key lookup. |
| Idempotency | Can duplicate call creation be prevented safely? | Validated | Idempotency key successfully prevents duplicate calls. |
| Failure modes | What happens on no-answer/IVR/provider error? | Open | Need to expand mock to simulate IVR/Failure states during Phase 4/5. |
| Community overlap | Does `accessible-outing-verifier` remain meaningfully distinct? | Open | Pending final verification before creating the PR (Phase 8). |
| Digital evidence | What minimal source strategy is reliable within the deadline? | Validated | Use deterministic/seeded local data for MVP to avoid web crawler flakiness. |
| Live demo endpoint | What authorized test target can be used? | Open | Pending (Phase 9). |

## Existing community work that affected ideation

- `surplus-signal`: surplus-food call confirmation with consent, structured result, human review, idempotency.
- `rescue-relay`: rescue coordination logic.
- other verification/callback/dispatch contributions were considered when evaluating originality.

## Decision rule

When a new overlap or technical problem appears:

1. identify the exact overlap/failure;
2. find the smallest workaround preserving the OpenDoor thesis;
3. record the workaround here;
4. only reopen the concept when no credible workaround remains.

## Live spike target

One controlled venue + two accessibility constraints + one CALL-E call + strict structured result + reconciliation + deterministic final status.

## Explicit unknowns agents are allowed to investigate

- exact prompt/task design for the call;
- whether one call can reliably cover multiple constraints;
- how much conversational branching is needed;
- best evidence excerpt length;
- best visual treatment of call/evidence states;
- whether to use a server-only CALL-E adapter or an MCP-centric architecture;
- exact community contribution packaging.
