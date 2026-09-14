import { SeededDigitalEvidenceSource } from '../../src/evidence/digital-source';
import { Outing } from '../../src/domain/constraints';

describe('Evidence: Digital Source Adapter', () => {
  it('should return confirmed evidence for known constraints in seeded venue', async () => {
    const source = new SeededDigitalEvidenceSource();
    
    const outing: Outing = {
      id: 'test-outing-1',
      venue_name: 'Test Venue A',
      constraints: [
        { id: 'wheelchair_parking', label: 'Wheelchair Parking', required: true }
      ]
    };

    const evidence = await source.collectDigitalEvidence(outing);
    expect(evidence.length).toBe(1);
    expect(evidence[0]!.constraint_id).toBe('wheelchair_parking');
    expect(evidence[0]!.status).toBe('confirmed');
    expect(evidence[0]!.source_type).toBe('web');
  });

  it('should return NO evidence (effectively unknown) for unseeded constraints', async () => {
    const source = new SeededDigitalEvidenceSource();
    
    const outing: Outing = {
      id: 'test-outing-2',
      venue_name: 'Test Venue A',
      constraints: [
        { id: 'elevator_working', label: 'Elevator Working Today', required: true }
      ]
    };

    const evidence = await source.collectDigitalEvidence(outing);
    expect(evidence.length).toBe(0); // Should be empty, meaning it remains unknown and requires a call
  });
});
