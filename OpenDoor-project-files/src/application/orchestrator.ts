import { Outing, Constraint } from '../domain/constraints';
import { ConstraintAssessment, Evidence } from '../domain/evidence';
import { FeasibilityResult, evaluateFeasibility } from '../domain/feasibility';
import { DigitalEvidenceSource } from '../evidence/digital-source';
import { CallEAdapter, VerificationPlan, Authorization, CallHandle } from '../call-e/adapter';
import { normalizeCallResult } from '../evidence/normalize';

export interface VerificationState {
  outing: Outing;
  digital_evidence: Evidence[];
  unresolved_constraints: Constraint[];
  call_plan: VerificationPlan | null;
  call_handle: CallHandle | null;
  final_assessments: ConstraintAssessment[];
  feasibility: FeasibilityResult | null;
}

export class OpenDoorOrchestrator {
  constructor(
    private digitalSource: DigitalEvidenceSource,
    private callAdapter: CallEAdapter
  ) {}

  async prepareOutingVerification(outing: Outing, targetPhone: string): Promise<VerificationState> {
    const digitalEvidence = await this.digitalSource.collectDigitalEvidence(outing);
    
    const resolvedIds = digitalEvidence.map(e => e.constraint_id);
    const unresolved = outing.constraints.filter(c => !resolvedIds.includes(c.id));

    const callPlan = this.callAdapter.planVerification(outing, unresolved, targetPhone);

    return {
      outing,
      digital_evidence: digitalEvidence,
      unresolved_constraints: unresolved,
      call_plan: callPlan,
      call_handle: null,
      final_assessments: [],
      feasibility: null
    };
  }

  async authorizeAndExecuteVerification(state: VerificationState, auth: Authorization): Promise<VerificationState> {
    if (!state.call_plan) return state;

    const handle = await this.callAdapter.createVerificationCall(state.call_plan, auth);
    state.call_handle = handle;
    return state;
  }

  async finalizeOuting(state: VerificationState): Promise<VerificationState> {
    // 1. Process digital evidence into assessments
    const assessments: ConstraintAssessment[] = state.outing.constraints.map(c => {
      const evidence = state.digital_evidence.filter(e => e.constraint_id === c.id);
      return {
        constraint: c,
        evidence: evidence,
        final_status: evidence.length > 0 && evidence[0] ? evidence[0].status : 'unknown'
      };
    });

    // 2. Reconcile call if one was made
    if (state.call_handle) {
      const callResult = await this.callAdapter.reconcileCall(state.call_handle.call_id);
      const callAssessments = normalizeCallResult(callResult, state.call_plan!.constraints_to_verify);
      
      // Merge call assessments back into main list
      for (const ca of callAssessments) {
        const index = assessments.findIndex(a => a.constraint.id === ca.constraint.id);
        if (index !== -1) {
          assessments[index] = ca;
        }
      }
    }

    state.final_assessments = assessments;
    state.feasibility = evaluateFeasibility(state.outing, assessments);

    return state;
  }
}
