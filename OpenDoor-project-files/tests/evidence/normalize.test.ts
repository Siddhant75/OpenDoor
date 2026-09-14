import { normalizeCallResult } from '../../src/evidence/normalize';
import { CallResult } from '../../src/call-e/adapter';
import { Constraint } from '../../src/domain/constraints';

describe('Evidence: Normalization & Reconciliation', () => {
  const c1: Constraint = { id: 'ramp', label: 'Ramp Access', required: true };
  const constraints = [c1];

  it('normalizes direct confirmation to confirmed', () => {
    const result: CallResult = {
      call_id: 'call_1',
      status: 'completed',
      structured_data: [{
        constraint_id: 'ramp',
        status: 'confirmed',
        evidence_excerpt: 'Yes, the ramp is clear.'
      }]
    };

    const assessments = normalizeCallResult(result, constraints);
    expect(assessments[0]!.final_status).toBe('confirmed');
    expect(assessments[0]!.evidence[0]!.source_type).toBe('venue_staff');
    expect(assessments[0]!.evidence[0]!.call_id).toBe('call_1');
  });

  it('normalizes qualified confirmation to unknown', () => {
    const result: CallResult = {
      call_id: 'call_2',
      status: 'completed',
      structured_data: [{
        constraint_id: 'ramp',
        status: 'qualified_confirmation',
        evidence_excerpt: 'I think it should be working, but I am not there.'
      }]
    };

    const assessments = normalizeCallResult(result, constraints);
    expect(assessments[0]!.final_status).toBe('unknown');
    expect(assessments[0]!.evidence[0]!.status).toBe('unknown'); 
  });

  it('normalizes explicit decline to declined', () => {
    const result: CallResult = {
      call_id: 'call_3',
      status: 'completed',
      structured_data: [{
        constraint_id: 'ramp',
        status: 'declined',
        evidence_excerpt: 'No, the ramp is closed for construction.'
      }]
    };

    const assessments = normalizeCallResult(result, constraints);
    expect(assessments[0]!.final_status).toBe('declined');
  });

  it('normalizes unreachable/failed calls to unknown', () => {
    const result: CallResult = {
      call_id: 'call_4',
      status: 'failed',
      error: 'IVR blocked the call'
    };

    const assessments = normalizeCallResult(result, constraints);
    expect(assessments[0]!.final_status).toBe('unknown');
    expect(assessments[0]!.evidence[0]!.reason).toBe('IVR blocked the call');
  });
  
  it('preserves contradiction state', () => {
    const result: CallResult = {
      call_id: 'call_5',
      status: 'completed',
      structured_data: [{
        constraint_id: 'ramp',
        status: 'contradicted',
        evidence_excerpt: 'Staff said they have a ramp, but another staff member shouted that it was broken.'
      }]
    };

    const assessments = normalizeCallResult(result, constraints);
    expect(assessments[0]!.final_status).toBe('contradicted');
  });
});
