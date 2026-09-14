import { CallResult } from '../call-e/adapter';
import { Constraint, ConstraintStatus } from '../domain/constraints';
import { ConstraintAssessment, Evidence } from '../domain/evidence';

export function normalizeCallResult(result: CallResult, planConstraints: Constraint[]): ConstraintAssessment[] {
  return planConstraints.map(constraint => {
    
    let final_status: ConstraintStatus = 'unknown';
    const evidenceList: Evidence[] = [];

    if (result.status === 'completed' && result.structured_data) {
      const data = result.structured_data.find(d => d.constraint_id === constraint.id);
      
      if (data) {
        // Enforce strict policy: qualified is not a confirmation
        if (data.status === 'qualified_confirmation') {
          final_status = 'unknown';
        } else {
          final_status = data.status;
        }

        evidenceList.push({
          constraint_id: constraint.id,
          status: final_status, 
          source_type: 'venue_staff', 
          source_checked_at: new Date(),
          evidence_excerpt: data.evidence_excerpt,
          call_id: result.call_id
        });
      }
    } else if (result.status === 'failed') {
        evidenceList.push({
          constraint_id: constraint.id,
          status: 'unknown',
          source_type: 'venue_staff',
          source_checked_at: new Date(),
          evidence_excerpt: 'Call failed to reconcile.',
          call_id: result.call_id,
          reason: result.error || 'Unknown provider failure'
        });
    }

    return {
      constraint,
      evidence: evidenceList,
      final_status
    };
  });
}
