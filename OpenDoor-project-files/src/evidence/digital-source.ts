import { Outing } from '../domain/constraints';
import { Evidence } from '../domain/evidence';
import { collectDynamicDigitalEvidence, PlaceMetadata } from './dynamic-search';

export interface DigitalEvidenceSource {
  collectDigitalEvidence(outing: Outing): Promise<Evidence[]>;
}

const SEED_DATA: Record<string, Record<string, Partial<Evidence>>> = {
  'Test Venue A': {
    'wheelchair_parking': {
      status: 'confirmed',
      evidence_excerpt: 'Website states there are 5 accessible parking spots near the main entrance.',
    },
    'step_free_entrance': {
      status: 'confirmed',
      evidence_excerpt: 'Venue map shows step-free access at the North gate.',
    }
  }
};

export class SeededDigitalEvidenceSource implements DigitalEvidenceSource {
  async collectDigitalEvidence(outing: Outing): Promise<Evidence[]> {
    const venueData = SEED_DATA[outing.venue_name];
    if (!venueData) return [];

    const evidence: Evidence[] = [];

    for (const constraint of outing.constraints) {
      const seeded = venueData[constraint.id];
      if (seeded) {
        evidence.push({
          constraint_id: constraint.id,
          status: seeded.status || 'unknown',
          source_type: 'web',
          source_checked_at: new Date(),
          evidence_excerpt: seeded.evidence_excerpt || 'Found on website.',
        } as Evidence);
      }
    }

    return evidence;
  }
}

export class DynamicDigitalEvidenceSource implements DigitalEvidenceSource {
  constructor(private place?: PlaceMetadata) {}

  async collectDigitalEvidence(outing: Outing): Promise<Evidence[]> {
    return collectDynamicDigitalEvidence(outing, this.place);
  }
}
