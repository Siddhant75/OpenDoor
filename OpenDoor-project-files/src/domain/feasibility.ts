import { Outing } from './constraints';
import { ConstraintAssessment } from './evidence';

export type FeasibilityStatus = 'feasible' | 'not_fully_verified' | 'not_feasible' | 'needs_review';

export interface FeasibilityResult {
  outing_id: string;
  status: FeasibilityStatus;
  assessments: ConstraintAssessment[];
}

export function evaluateFeasibility(outing: Outing, assessments: ConstraintAssessment[]): FeasibilityResult {
  let hasUnknown = false;
  let hasDeclined = false;
  let hasContradiction = false;

  for (const constraint of outing.constraints) {
    if (!constraint.required) continue;

    const assessment = assessments.find(a => a.constraint.id === constraint.id);
    const status = assessment?.final_status || 'unknown';

    if (status === 'contradicted') hasContradiction = true;
    else if (status === 'declined') hasDeclined = true;
    else if (status === 'unknown') hasUnknown = true;
  }

  let finalStatus: FeasibilityStatus = 'feasible';
  if (hasDeclined) finalStatus = 'not_feasible';
  else if (hasContradiction) finalStatus = 'needs_review';
  else if (hasUnknown) finalStatus = 'not_fully_verified';

  return {
    outing_id: outing.id,
    status: finalStatus,
    assessments
  };
}
