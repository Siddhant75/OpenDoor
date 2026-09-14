import { CallEAdapter, CallEProvider, VerificationPlan, CallHandle, CallResult } from '../../src/call-e/adapter';
import { Outing, Constraint } from '../../src/domain/constraints';

class FakeCallEProvider implements CallEProvider {
  public db = new Map<string, CallResult>();

  async createCall(plan: VerificationPlan): Promise<CallHandle> {
    const call_id = `call_${plan.idempotency_key}`;
    if (this.db.has(call_id)) {
      return { call_id, status: this.db.get(call_id)!.status };
    }

    const handle: CallHandle = { call_id, status: 'queued' };
    this.db.set(call_id, {
      call_id,
      status: 'queued',
      structured_data: plan.constraints_to_verify.map(c => ({
        constraint_id: c.id,
        status: 'unknown',
        evidence_excerpt: 'Pending...'
      }))
    });
    return handle;
  }

  async getCallStatus(call_id: string): Promise<CallResult> {
    const res = this.db.get(call_id);
    if (!res) throw new Error("Not found");
    return res;
  }
}

describe('CALL-E: Verification Adapter', () => {
  const provider = new FakeCallEProvider();
  const adapter = new CallEAdapter(provider);

  const outing: Outing = {
    id: 'o1',
    venue_name: 'Test Venue',
    constraints: []
  };

  const c1: Constraint = { id: 'c1', label: 'Ramp', required: true };
  const opt: Constraint = { id: 'opt', label: 'Parking', required: false };

  it('plans verification only for required missing constraints with a phone number', () => {
    const plan = adapter.planVerification(outing, [c1, opt], '555-1234');
    expect(plan).not.toBeNull();
    expect(plan!.constraints_to_verify.length).toBe(1);
    expect(plan!.constraints_to_verify[0]!.id).toBe('c1');
    expect(plan!.idempotency_key).toContain('verify_o1_');
  });

  it('returns null if no required constraints or no phone', () => {
    expect(adapter.planVerification(outing, [opt], '555-1234')).toBeNull();
    expect(adapter.planVerification(outing, [c1], '')).toBeNull();
  });

  it('fails if explicit authorization is not granted', async () => {
    const plan = adapter.planVerification(outing, [c1], '555-1234')!;
    await expect(adapter.createVerificationCall(plan, { granted: false, user_id: 'u1' }))
      .rejects.toThrow("Cannot create verification call without explicit human authorization.");
  });

  it('creates call if authorization is granted', async () => {
    const plan = adapter.planVerification(outing, [c1], '555-1234')!;
    const handle = await adapter.createVerificationCall(plan, { granted: true, user_id: 'u1' });
    expect(handle.status).toBe('queued');
  });

  it('reconciles terminal state', async () => {
    const plan = adapter.planVerification(outing, [c1], '555-1234')!;
    const handle = await adapter.createVerificationCall(plan, { granted: true, user_id: 'u1' });
    
    const res = provider.db.get(handle.call_id)!;
    res.status = 'completed';
    res.structured_data![0]!.status = 'confirmed';
    res.structured_data![0]!.evidence_excerpt = 'Yes, ramp works.';

    const final = await adapter.reconcileCall(handle.call_id);
    expect(final.status).toBe('completed');
    expect(final.structured_data![0]!.status).toBe('confirmed');
  });
});
