# Judge Testing Instructions — OpenDoor

Welcome, hackathon judges! OpenDoor is built to provide an immediate, hands-on demonstration of bounded, deterministic CALL-E voice verification.

---

## 1. Web Command Center (Recommended Testing Flow)

### Step 1: Start the Platform
```bash
npm install
npm start
```
Navigate to: **[http://localhost:3000](http://localhost:3000)**

### Step 2: Test the "Hero Demotion" (Scenario 1)
1. In the **Curated Judge Scenarios** list (top-left), click **The Hero Demotion**.
2. Observe that the venue (*The Grand Theater*), phone, and constraints (*Parking*, *Entrance*, *Elevator*) are populated.
3. Click **Scan Digital Footprint & Gap**:
   - Notice that Parking and Step-Free Entrance are verified from published sources.
   - Notice that the **Elevator Operating Today** constraint is explicitly marked as a **CRITICAL PHYSICAL GAP** because static web data cannot prove daily maintenance status.
4. Click **Authorize & Dispatch CALL-E**:
   - Watch the live telephony terminal connect.
   - Listen to the audible conversation via your speakers (if audio is unmuted).
   - Observe the real-time audio waveform canvas pulsing in sync with the speech.
   - Watch the venue representative answer: *"I think it should be working, but maintenance has not signed off on the morning inspection yet."*
5. Inspect the **Final Evidence Brief**:
   - Notice the verdict: **`NOT FULLY VERIFIED (SAFETY ABSTAIN)`**.
   - Notice that while most AI agents would mark this as "90% confident", OpenDoor's deterministic safety engine **strictly downgraded the qualified confirmation to UNKNOWN** to protect the wheelchair patron.
6. Open the **Inspect Proof Chain & Technical Audit Drawer** at the bottom:
   - Review the millisecond execution timeline.
   - Review the strict CALL-E JSON schema passed to the voice model.
   - Review the raw JSON payload.

### Step 3: Test Other Core Scenarios
- **Scenario 2: Full Confirmation** (*Metropolitan Symphony Hall*) $\rightarrow$ Staff confirms all constraints directly $\rightarrow$ **`FEASIBLE (100%)`**.
- **Scenario 3: Hard Physical Barrier** (*The Rooftop Lounge*) $\rightarrow$ Staff confirms 42 steps and no elevator $\rightarrow$ **`NOT FEASIBLE`**.
- **Scenario 4: Telephony Failure** (*Underground Comedy Club*) $\rightarrow$ Line busy / timeout $\rightarrow$ **`NEEDS REVIEW`**.

### Step 4: Test Live Global Place Search
1. In the **Destination Venue** search box, type any real city or venue (e.g. `Boston Symphony`, `Eiffel Tower`, `Royal Albert Hall`).
2. Watch the live OpenStreetMap Nominatim autocomplete suggestions appear.
3. Click an item to dynamically fetch address, phone, and metadata.
4. Toggle to **Live Telephony Dispatch** in the top bar to test custom phone numbers.

---

## 2. Automated Test Suite Verification

To verify that all domain policy rules, scenarios, and dynamic place lookup engines pass with 100% domain coverage:

```bash
npm test
```

