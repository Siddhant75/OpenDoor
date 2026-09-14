import { searchPlaces, collectDynamicDigitalEvidence } from '../../src/evidence/dynamic-search';
import { Outing } from '../../src/domain/constraints';

describe('DynamicSearch & Digital Evidence', () => {
  it('searches places and returns curated match for The Grand Theater', async () => {
    const places = await searchPlaces('The Grand Theater');
    expect(places.length).toBeGreaterThan(0);
    expect(places[0]!.name).toBe('The Grand Theater');
    expect(places[0]!.phone).toBeDefined();
  });

  it('returns fallback place for arbitrary custom venue', async () => {
    const places = await searchPlaces('Custom Nonexistent Venue 999');
    expect(places.length).toBeGreaterThan(0);
    expect(places[0]!.name).toContain('Custom Nonexistent Venue 999');
  });

  it('collects digital evidence for The Grand Theater, leaving elevator unverified', async () => {
    const outing: Outing = {
      id: 'outing_test_1',
      venue_name: 'The Grand Theater',
      constraints: [
        { id: 'wheelchair_parking', label: 'Parking', required: true },
        { id: 'step_free_entrance', label: 'Entrance', required: true },
        { id: 'elevator_working', label: 'Elevator', required: true }
      ]
    };

    const evidence = await collectDynamicDigitalEvidence(outing);
    const resolvedIds = evidence.map(e => e.constraint_id);

    expect(resolvedIds).toContain('wheelchair_parking');
    expect(resolvedIds).toContain('step_free_entrance');
    // Invariant: Daily elevator operational status is NEVER verified digitally
    expect(resolvedIds).not.toContain('elevator_working');
  });
});
