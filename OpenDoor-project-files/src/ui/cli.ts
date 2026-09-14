import * as readline from 'readline';
import { Outing } from '../domain/constraints';
import { OpenDoorOrchestrator } from '../application/orchestrator';
import { SeededDigitalEvidenceSource } from '../evidence/digital-source';
import { CallEAdapter, CallEProvider, VerificationPlan, CallHandle, CallResult } from '../call-e/adapter';

// Mock Provider for Demo
class DemoCallProvider implements CallEProvider {
  async createCall(plan: VerificationPlan): Promise<CallHandle> {
    console.log(`\n[CALL-E PROVIDER] Initiating call to ${plan.target_phone}...`);
    return { call_id: 'demo_call_999', status: 'queued' };
  }

  async getCallStatus(call_id: string): Promise<CallResult> {
    console.log(`[CALL-E PROVIDER] Simulating conversation and extracting constraints...`);
    // Return a mocked structured result
    return {
      call_id,
      status: 'completed',
      structured_data: [
        {
          constraint_id: 'elevator_working',
          status: 'qualified_confirmation', // Simulating a qualified answer to prove the thesis
          evidence_excerpt: "I think it should be working, but maintenance hasn't checked it today."
        },
        {
          constraint_id: 'step_free_entrance',
          status: 'confirmed',
          evidence_excerpt: "Yes, the North gate is completely step-free."
        }
      ]
    };
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function runDemo() {
  console.log("==================================================");
  console.log("    OpenDoor — Can I Actually Go? (CLI Demo)      ");
  console.log("==================================================\n");

  const digitalSource = new SeededDigitalEvidenceSource();
  const provider = new DemoCallProvider();
  const adapter = new CallEAdapter(provider);
  const orchestrator = new OpenDoorOrchestrator(digitalSource, adapter);

  // Define our demo outing
  const outing: Outing = {
    id: 'outing_demo_001',
    venue_name: 'Test Venue A',
    constraints: [
      { id: 'wheelchair_parking', label: 'Wheelchair Parking', required: true }, // Found in digital seed
      { id: 'step_free_entrance', label: 'Step-Free Entrance', required: true }, // Resolved via call (not in seed)
      { id: 'elevator_working', label: 'Elevator Working Today', required: true } // Failed/qualified via call
    ]
  };

  console.log(`[1] User requests verification for: ${outing.venue_name}`);
  console.log("Constraints:");
  outing.constraints.forEach(c => console.log(`  - ${c.label} (Required: ${c.required})`));
  console.log("\n[2] Checking digital evidence (avoiding calls where possible)...");
  
  let state = await orchestrator.prepareOutingVerification(outing, '+1-555-0199');

  console.log(`  -> Found digital evidence for: ${state.digital_evidence.map(e => e.constraint_id).join(', ')}`);
  console.log(`  -> Unresolved critical constraints: ${state.unresolved_constraints.map(c => c.label).join(', ')}`);

  if (state.call_plan) {
    console.log("\n[3] Evidence gap detected. OpenDoor requires physical world verification.");
    
    let answer = 'y';
    if (!process.argv.includes('--auto-yes')) {
      answer = await askQuestion("Do you authorize CALL-E to call the venue to verify these constraints? (y/n): ");
    } else {
      console.log("Do you authorize CALL-E to call the venue to verify these constraints? (y/n): y (auto-authorized)");
    }
    
    if (answer.toLowerCase().startsWith('y')) {
      console.log("\n[4] Executing authorized CALL-E verification...");
      state = await orchestrator.authorizeAndExecuteVerification(state, { granted: true, user_id: 'demo_user' });
      
      console.log("\n[5] Reconciling and finalizing outing feasibility...");
      state = await orchestrator.finalizeOuting(state);
    } else {
      console.log("\nAuthorization denied. Unable to verify outing.");
      rl.close();
      return;
    }
  } else {
    state = await orchestrator.finalizeOuting(state);
  }

  console.log("\n==================================================");
  console.log("              FINAL EVIDENCE BRIEF                ");
  console.log("==================================================");
  console.log(`Feasibility Status: ** ${state.feasibility?.status.toUpperCase()} **\n`);

  state.final_assessments.forEach(assessment => {
    console.log(`Requirement: ${assessment.constraint.label}`);
    console.log(`Status:      ${assessment.final_status.toUpperCase()}`);
    if (assessment.evidence.length > 0 && assessment.evidence[0]) {
      const ev = assessment.evidence[0];
      console.log(`Source:      ${ev.source_type}`);
      console.log(`Excerpt:     "${ev.evidence_excerpt}"`);
    } else {
      console.log(`Source:      No evidence found`);
    }
    console.log("--------------------------------------------------");
  });

  console.log("\nDemo complete. OpenDoor refused to guess the elevator status, correctly flagging the outing as NOT FULLY VERIFIED.");
  rl.close();
}

runDemo().catch(console.error);
