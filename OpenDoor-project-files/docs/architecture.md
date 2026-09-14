# OpenDoor — Architecture Direction

```text
┌───────────────────────────────┐
│          OpenDoor UI          │
│ outing + requirements + brief │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│      Constraint Engine        │
│ hard vs optional requirements │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│       Evidence Collector      │
│ digital/manual evidence       │
└──────────────┬────────────────┘
               │
       critical unresolved gap
               │
               ▼
┌───────────────────────────────┐
│        Call Planner            │
│ who / what / why / policy     │
└──────────────┬────────────────┘
               │
         user authorization
               │
               ▼
┌───────────────────────────────┐
│            CALL-E             │
│ API/SDK + structured result   │
│ webhooks + reconciliation     │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│     Evidence Normalizer       │
│ deterministic classification  │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│     Feasibility Evaluator     │
│ all hard constraints?         │
└──────────────┬────────────────┘
               │
          ┌────┴─────┐
          ▼          ▼
      FEASIBLE    UNRESOLVED/
                    NOT FEASIBLE
          │          │
          ▼          ▼
     Access Brief   Review
```

## Architectural invariants

1. Provider output does not directly decide final feasibility.
2. Every evidence item retains source and time.
3. Real calls require explicit authorization.
4. Simulation mode has no external side effects.
5. Retry is idempotent and reconciled.
6. Unknown is not converted to success.
