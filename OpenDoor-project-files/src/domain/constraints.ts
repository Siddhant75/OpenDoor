export type ConstraintStatus = 'confirmed' | 'declined' | 'unknown' | 'contradicted' | 'qualified_confirmation';

export interface Constraint {
  id: string;
  label: string;
  required: boolean;
}

export interface Outing {
  id: string;
  venue_name: string;
  event_time?: Date;
  constraints: Constraint[];
}
