import { SCENARIOS } from '../../src/call-e/scenarios';
import { normalizeCallResult } from '../../src/evidence/normalize';
import { evaluateFeasibility } from '../../src/domain/feasibility';
import { Outing } from '../../src/domain/constraints';

describe('Curated Scenarios Contract', () => {
  it('contains all 4 required hackathon scenarios', () => {
    expect(SCENARIOS['hero_demotion']).toBeDefined();
    expect(SCENARIOS['full_confirmation']).toBeDefined();
    expect(SCENARIOS['hard_barrier']).toBeDefined();
    expect(SCENARIOS['telephony_timeout']).toBeDefined();
  });

  it('proves Scenario 1 (Hero Demotion): qualified confirmation strictly demotes to UNKNOWN and NOT FULLY VERIFIED', () => {
    const sc = SCENARIOS['hero_demotion']!;
    const outing: Outing = {
      id: 'outing_hero',
      venue_name: sc.venueName,
      constraints: sc.constraints
    };

    const normalized = normalizeCallResult(
      { call_id: 'call_1', status: sc.callStatus, structured_data: sc.structuredData },
      sc.constraints
    );

    const elevatorAssessment = normalized.find(a => a.constraint.id === 'elevator_working');
    expect(elevatorAssessment?.final_status).toBe('unknown');

    const feasibility = evaluateFeasibility(outing, normalized);
    expect(feasibility.status).toBe('not_fully_verified');
  });

  it('proves Scenario 2 (Full Confirmation): all verified constraints result in FEASIBLE', () => {
    const sc = SCENARIOS['full_confirmation']!;
    const outing: Outing = {
      id: 'outing_full',
      venue_name: sc.venueName,
      constraints: sc.constraints
    };

    const normalized = normalizeCallResult(
      { call_id: 'call_2', status: sc.callStatus, structured_data: sc.structuredData },
      sc.constraints
    );

    const feasibility = evaluateFeasibility(outing, normalized);
    expect(feasibility.status).toBe('feasible');
  });

  it('proves Scenario 3 (Hard Barrier): physical obstacle results in NOT FEASIBLE', () => {
    const sc = SCENARIOS['hard_barrier']!;
    const outing: Outing = {
      id: 'outing_barrier',
      venue_name: sc.venueName,
      constraints: sc.constraints
    };

    const normalized = normalizeCallResult(
      { call_id: 'call_3', status: sc.callStatus, structured_data: sc.structuredData },
      sc.constraints
    );

    const feasibility = evaluateFeasibility(outing, normalized);
    expect(feasibility.status).toBe('not_feasible');
  });
});
