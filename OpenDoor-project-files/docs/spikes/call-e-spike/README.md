# CALL-E Spike

This directory contains the Phase 0 spike demonstrating the core CALL-E interaction contract.

## Overview
Because the live CALL-E credentials/endpoint are reserved for the final hackathon demo (Phase 9), this spike builds and proves the `MockCallEClient` that will be used for all offline development.

## Proven Capabilities
- **Call Creation**: Controlled invocation of the call provider.
- **Idempotency**: Prevents duplicate executions using `idempotency_key`.
- **Structured Results**: Proves the JSON schema constraint mapping for `confirmed`, `unknown`, etc.
- **Reconciliation**: Simulates asynchronous webhook/polling resolution.

## Usage
```bash
npx tsc index.ts
node index.js
```
