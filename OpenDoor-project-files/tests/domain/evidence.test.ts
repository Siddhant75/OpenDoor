import { Evidence } from '../../src/domain/evidence';

describe('Domain: Evidence', () => {
  it('should require provenance and status', () => {
    const ev: Evidence = {
      constraint_id: 'c1',
      status: 'confirmed',
      source_type: 'venue_staff',
      source_checked_at: new Date(),
      evidence_excerpt: 'Staff confirmed on phone.'
    };
    
    expect(ev.status).toBe('confirmed');
    expect(ev.source_type).toBe('venue_staff');
    expect(ev.source_checked_at).toBeInstanceOf(Date);
    expect(ev.evidence_excerpt.length).toBeGreaterThan(0);
  });
});
