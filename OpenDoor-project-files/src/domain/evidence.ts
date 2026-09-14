import { ConstraintStatus } from './constraints';

export type SourceType = 'web' | 'venue_staff' | 'event_organizer' | 'user_override';

export interface Evidence {
  constraint_id: string;
  status: ConstraintStatus;
  source_type: SourceType;
  source_checked_at: Date;
  evidence_excerpt: string;
  call_id?: string;
  reason?: string;
}

export interface CallVerification {
  call_id: string;
}

export interface ConstraintAssessment {
  constraint: import('./constraints').Constraint;
  evidence: Evidence[];
  final_status: ConstraintStatus;
}
