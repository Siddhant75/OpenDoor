import { evaluateFeasibility } from '../../src/domain/feasibility';
import { Outing, Constraint } from '../../src/domain/constraints';
import { ConstraintAssessment } from '../../src/domain/evidence';

describe('Domain: Feasibility Policy', () => {
  const c1: Constraint = { id: 'c1', label: 'Ramp', required: true };
  const c2: Constraint = { id: 'c2', label: 'Elevator', required: true };
  const opt: Constraint = { id: 'opt', label: 'Parking', required: false };

  const outing: Outing = {
    id: 'o1',
    venue_name: 'Test Venue',
    constraints: [c1, c2, opt]
  };

  it('all required constraints confirmed -> feasible', () => {
    const assessments: ConstraintAssessment[] = [
      { constraint: c1, evidence: [], final_status: 'confirmed' },
      { constraint: c2, evidence: [], final_status: 'confirmed' }
    ];
    
    const result = evaluateFeasibility(outing, assessments);
    expect(result.status).toBe('feasible');
  });

  it('any required constraint unknown -> not_fully_verified', () => {
    const assessments: ConstraintAssessment[] = [
      { constraint: c1, evidence: [], final_status: 'confirmed' },
      { constraint: c2, evidence: [], final_status: 'unknown' } // Missing required
    ];
    
    const result = evaluateFeasibility(outing, assessments);
    expect(result.status).toBe('not_fully_verified');
  });

  it('any required constraint declined -> not_feasible', () => {
    const assessments: ConstraintAssessment[] = [
      { constraint: c1, evidence: [], final_status: 'confirmed' },
      { constraint: c2, evidence: [], final_status: 'declined' }
    ];
    
    const result = evaluateFeasibility(outing, assessments);
    expect(result.status).toBe('not_feasible');
  });

  it('any required constraint contradicted -> needs_review', () => {
    const assessments: ConstraintAssessment[] = [
      { constraint: c1, evidence: [], final_status: 'confirmed' },
      { constraint: c2, evidence: [], final_status: 'contradicted' }
    ];
    
    const result = evaluateFeasibility(outing, assessments);
    expect(result.status).toBe('needs_review');
  });

  it('optional constraint unknown does not prevent feasible', () => {
    const assessments: ConstraintAssessment[] = [
      { constraint: c1, evidence: [], final_status: 'confirmed' },
      { constraint: c2, evidence: [], final_status: 'confirmed' },
      { constraint: opt, evidence: [], final_status: 'unknown' } // Optional missing
    ];
    
    const result = evaluateFeasibility(outing, assessments);
    expect(result.status).toBe('feasible');
  });

  it('declined takes precedence over contradicted or unknown', () => {
    const assessments: ConstraintAssessment[] = [
      { constraint: c1, evidence: [], final_status: 'declined' },
      { constraint: c2, evidence: [], final_status: 'contradicted' }
    ];
    
    const result = evaluateFeasibility(outing, assessments);
    expect(result.status).toBe('not_feasible');
  });
});
