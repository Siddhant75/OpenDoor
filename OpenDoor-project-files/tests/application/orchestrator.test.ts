import { OpenDoorOrchestrator } from '../../src/application/orchestrator';
import { Outing, Constraint } from '../../src/domain/constraints';
import { DigitalEvidenceSource } from '../../src/evidence/digital-source';
import { CallEAdapter, CallEProvider, VerificationPlan, CallHandle, CallResult } from '../../src/call-e/adapter';
import { Evidence } from '../../src/domain/evidence';

// Fakes for testing
class FakeDigitalSource implements DigitalEvidenceSource {
  async collectDigitalEvidence(outing: Outing): Promise<Evidence[]> {
    return outing.constraints
      .filter(c => c.id === 'parking')
      .map(c => ({
        constraint_id: c.id,
        status: 'confirmed',
        source_type: 'web',
        source_checked_at: new Date(),
        evidence_excerpt: 'Website says parking is available'
      }));
  }
}

class FakeCallProvider implements CallEProvider {
  async createCall(plan: VerificationPlan): Promise<CallHandle> {
    return { call_id: 'test_call', status: 'completed' };
  }
  async getCallStatus(call_id: string): Promise<CallResult> {
    return {
      call_id,
      status: 'completed',
      structured_data: [{
        constraint_id: 'ramp',
        status: 'confirmed',
        evidence_excerpt: 'Ramp is clear.'
      }]
    };
  }
}

describe('Application: OpenDoor Orchestrator', () => {
  const c1: Constraint = { id: 'parking', label: 'Parking', required: true };
  const c2: Constraint = { id: 'ramp', label: 'Ramp', required: true };
  const outing: Outing = { id: 'o1', venue_name: 'Test', constraints: [c1, c2] };
  
  let orchestrator: OpenDoorOrchestrator;

  beforeEach(() => {
    const digital = new FakeDigitalSource();
    const adapter = new CallEAdapter(new FakeCallProvider());
    orchestrator = new OpenDoorOrchestrator(digital, adapter);
  });

  it('detects digital gap and prepares verification plan', async () => {
    const state = await orchestrator.prepareOutingVerification(outing, '555-1234');
    
    // Parking is resolved digitally, Ramp is not.
    expect(state.digital_evidence.length).toBe(1);
    expect(state.unresolved_constraints.length).toBe(1);
    expect(state.unresolved_constraints[0]!.id).toBe('ramp');
    
    expect(state.call_plan).not.toBeNull();
    expect(state.call_plan!.constraints_to_verify[0]!.id).toBe('ramp');
  });

  it('executes call only with authorization', async () => {
    let state = await orchestrator.prepareOutingVerification(outing, '555-1234');
    
    await expect(orchestrator.authorizeAndExecuteVerification(state, { granted: false, user_id: 'test' }))
      .rejects.toThrow();

    state = await orchestrator.authorizeAndExecuteVerification(state, { granted: true, user_id: 'test' });
    expect(state.call_handle).not.toBeNull();
    expect(state.call_handle!.call_id).toBe('test_call');
  });

  it('finalizes outing and merges digital and call evidence', async () => {
    let state = await orchestrator.prepareOutingVerification(outing, '555-1234');
    state = await orchestrator.authorizeAndExecuteVerification(state, { granted: true, user_id: 'test' });
    state = await orchestrator.finalizeOuting(state);

    expect(state.final_assessments.length).toBe(2);
    expect(state.feasibility).not.toBeNull();
    expect(state.feasibility!.status).toBe('feasible'); // parking(web) + ramp(call) = feasible
  });
});
