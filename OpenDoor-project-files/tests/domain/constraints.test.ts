import { Constraint, Outing } from '../../src/domain/constraints';

describe('Domain: Constraints', () => {
  it('should distinguish between required and optional constraints', () => {
    const hardConstraint: Constraint = { id: 'c1', label: 'Ramp', required: true };
    const softConstraint: Constraint = { id: 'c2', label: 'Quiet Room', required: false };

    expect(hardConstraint.required).toBe(true);
    expect(softConstraint.required).toBe(false);
  });

  it('an outing should compose multiple constraints', () => {
    const outing: Outing = {
      id: 'o1',
      venue_name: 'Theater',
      constraints: [
        { id: 'c1', label: 'Ramp', required: true }
      ]
    };
    expect(outing.constraints.length).toBe(1);
  });
});
