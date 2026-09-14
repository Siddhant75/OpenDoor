# OpenDoor — Safety Model & Deterministic Policy

> **Core Principle:** In accessibility-sensitive outings, a false positive can lead to physical injury, distress, or stranding a vulnerable patron. Therefore, the system must be deterministic, fail-closed, and strictly demote uncertainty.

---

## 1. The Digital Gap: Why Online Claims Fail

Online directories and venue websites often provide static accessibility tags, such as `"wheelchair: yes"` or `"elevator: yes"`. These static claims suffer from the **Elevator Paradox**:

- **Static Infrastructure vs Daily Operations:** A venue may have an elevator built in 1995. But is it operating *today*? Did maintenance perform scheduled maintenance this morning?
- **Operational Reality:** Ramps may be temporarily blocked by delivery crates; hearing loop transmitters may have dead batteries; accessible restrooms may be locked for repair.

OpenDoor's **Digital Gap Analyzer** explicitly separates:
- **`static_facility`:** Structural facets that rarely change day-to-day (entrance door width, designated parking spaces). These are verified from digital records (OpenStreetMap Nominatim, municipal filings).
- **`daily_operational`:** Dynamic dependencies that must function *on the day of the outing* (elevators, mechanical lifts, live CART captioning, quiet rooms). Any operational constraint that lacks real-time physical confirmation is flagged as a **CRITICAL PHYSICAL GAP**.

---

## 2. The Human Consent Gate

Phone calls create real-world side effects:
- They consume telephone carrier credits.
- They take time from human venue staff.
- They represent the user in the real world.

Therefore, OpenDoor enforces an inviolable boundary:
- The system **halts** after digital gap identification.
- It presents the user with the exact question to be asked, the target phone number, and the operational reason for the call.
- Telephony actuation is blocked until explicit authorization is received (`authorized: true`, `user_id`).

---

## 3. The Deterministic Demotion Firewall ("The Hero Demotion")

When an AI agent listens to a human over the phone, it frequently encounters hedged or qualified speech:
- *"I think it should be working today..."*
- *"Maintenance is usually done by now, probably fine."*
- *"As far as I know, yes."*

### The Hallucination Trap
Generic LLMs and voice bots convert these ambiguous statements into probabilistic confidence scores (e.g. *"90% confident elevator is working"*), or worse, flatten them into a simple boolean `true`. For a power wheelchair user navigating an unfamiliar theater, a 90% guess that fails means being stranded on a multi-flight stairwell.

### The OpenDoor Firewall Rule
In [`src/evidence/normalize.ts`](../src/evidence/normalize.ts), OpenDoor enforces strict categorical normalization:

```typescript
if (finding.status === 'qualified_confirmation') {
  return {
    normalizedStatus: 'UNKNOWN',
    policyAction: 'STRICT_SAFETY_DEMOTION',
    policyReason: 'Hedged or qualified verbal statements must never authorize safety-critical access.'
  };
}
```

- If staff says: *"Yes, elevator bank B is fully active and verified"* $\rightarrow$ `CONFIRMED` $\rightarrow$ `PASSED`.
- If staff says: *"I think it should be fine, but maintenance hasn't inspected it"* $\rightarrow$ `qualified_confirmation` $\rightarrow$ **strictly demoted to `UNKNOWN`**.
- If any critical constraint is `UNKNOWN` $\rightarrow$ Outing Feasibility is demoted from `FEASIBLE` to **`NOT FULLY VERIFIED (SAFETY ABSTAIN)`**.

---

## 4. Whole-Outing Feasibility Composition

An outing is a conjunction of non-negotiable constraints. If a patron needs both a step-free entrance AND a working elevator:
- Step-Free Entrance: `PASSED`
- Elevator Operating Today: `UNKNOWN` (Demoted)
- **Whole-Outing Feasibility:** `NOT FULLY VERIFIED`

The system generates an actionable Feasibility Brief stating exactly which constraints are verified, the verbatim staff quote, and recommended human actions (e.g. *"Call venue duty manager 30 minutes prior to arrival or arrange alternative ground-floor seating"*).
