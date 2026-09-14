import { Outing, Constraint } from '../domain/constraints';

export interface VerificationPlan {
  outing_id: string;
  target_phone: string;
  constraints_to_verify: Constraint[];
  idempotency_key: string;
}

export interface Authorization {
  granted: boolean;
  user_id: string;
}

export interface CallHandle {
  call_id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
}

export interface StructuredResult {
  constraint_id: string;
  status: 'confirmed' | 'declined' | 'unknown' | 'contradicted' | 'qualified_confirmation';
  evidence_excerpt: string;
}

export interface CallResult {
  call_id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  structured_data?: StructuredResult[];
  error?: string;
}

export interface CallEProvider {
  createCall(plan: VerificationPlan): Promise<CallHandle>;
  getCallStatus(call_id: string): Promise<CallResult>;
}

export class CallEAdapter {
  constructor(private provider: CallEProvider) {}

  planVerification(outing: Outing, unresolvedConstraints: Constraint[], targetPhone: string): VerificationPlan | null {
    const critical = unresolvedConstraints.filter(c => c.required);
    if (critical.length === 0) return null;
    if (!targetPhone) return null; // must have a human contact

    return {
      outing_id: outing.id,
      target_phone: targetPhone,
      constraints_to_verify: critical,
      idempotency_key: `verify_${outing.id}_${Date.now()}`
    };
  }

  async createVerificationCall(plan: VerificationPlan, auth: Authorization): Promise<CallHandle> {
    if (!auth.granted) {
      throw new Error("Cannot create verification call without explicit human authorization.");
    }

    return this.provider.createCall(plan);
  }

  async reconcileCall(call_id: string): Promise<CallResult> {
    return this.provider.getCallStatus(call_id);
  }
}
