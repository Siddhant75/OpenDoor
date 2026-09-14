import { StructuredResult } from './adapter';

export interface DialogTurn {
  speaker: 'Agent' | 'Venue' | 'System';
  text: string;
  delayMs: number;
  highlightKeyword?: string;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  venueName: string;
  targetPhone: string;
  persona: string;
  constraints: Array<{ id: string; label: string; required: boolean }>;
  dialog: DialogTurn[];
  structuredData: StructuredResult[];
  callStatus: 'queued' | 'in_progress' | 'completed' | 'failed';
  expectedFeasibility: 'not_fully_verified' | 'feasible' | 'not_feasible' | 'needs_review';
  heroInsight: string;
}

export const SCENARIOS: Record<string, ScenarioDefinition> = {
  'hero_demotion': {
    id: 'hero_demotion',
    title: 'The Hero Demotion (Ambiguous Staff Answer)',
    venueName: 'The Grand Theater',
    targetPhone: '+1 (212) 555-0143',
    persona: 'Power Wheelchair User',
    constraints: [
      { id: 'wheelchair_parking', label: 'Wheelchair Accessible Parking', required: true },
      { id: 'step_free_entrance', label: 'Step-Free Grade Entrance', required: true },
      { id: 'elevator_working', label: 'Main Elevator Operating Today', required: true }
    ],
    dialog: [
      { speaker: 'System', text: 'Connecting CALL-E dispatch to +1 (212) 555-0143...', delayMs: 800 },
      { speaker: 'Agent', text: 'Hi, this is OpenDoor calling to verify accessibility for a patron attending tonight. Is your main passenger elevator working right now?', delayMs: 1600 },
      { speaker: 'Venue', text: 'Let me check with the facilities log... I think it should be working, but maintenance has not signed off on the morning inspection yet.', delayMs: 2800, highlightKeyword: 'I think' },
      { speaker: 'Agent', text: 'Understood. And can you confirm the 43rd Street North gate entrance is completely step-free?', delayMs: 1600 },
      { speaker: 'Venue', text: 'Yes, absolutely. The North gate has level automatic sliding doors and zero steps.', delayMs: 2000 },
      { speaker: 'Agent', text: 'Thank you for your assistance. Have a great day.', delayMs: 900 }
    ],
    structuredData: [
      {
        constraint_id: 'elevator_working',
        status: 'qualified_confirmation',
        evidence_excerpt: "I think it should be working, but maintenance has not signed off on the morning inspection yet."
      },
      {
        constraint_id: 'step_free_entrance',
        status: 'confirmed',
        evidence_excerpt: "The North gate has level automatic sliding doors and zero steps."
      }
    ],
    callStatus: 'completed',
    expectedFeasibility: 'not_fully_verified',
    heroInsight: 'OpenDoor strictly demotes the qualified statement ("I think...") to UNKNOWN, preventing a wheelchair patron from being stranded.'
  },

  'full_confirmation': {
    id: 'full_confirmation',
    title: 'Full Confirmation (All Invariants Verified)',
    venueName: 'Metropolitan Symphony Hall',
    targetPhone: '+1 (212) 555-0188',
    persona: 'Wheelchair User & Escort',
    constraints: [
      { id: 'wheelchair_parking', label: 'Wheelchair Accessible Parking', required: true },
      { id: 'step_free_entrance', label: 'Step-Free Grade Entrance', required: true },
      { id: 'elevator_working', label: 'Main Elevator Operating Today', required: true }
    ],
    dialog: [
      { speaker: 'System', text: 'Connecting CALL-E dispatch to +1 (212) 555-0188...', delayMs: 800 },
      { speaker: 'Agent', text: 'Hello, calling from OpenDoor to verify accessibility accommodations. Is elevator bank B to the orchestra level fully operational today?', delayMs: 1600 },
      { speaker: 'Venue', text: 'Yes, I am looking at our floor monitor right now. Both elevator banks A and B are active with no service interruptions.', delayMs: 2200 },
      { speaker: 'Agent', text: 'Terrific. And is plaza ramp B unobstructed for event arrival?', delayMs: 1500 },
      { speaker: 'Venue', text: 'Yes, ramp B is clear and we have dedicated guest services ambassadors stationed there from 5 PM.', delayMs: 2000 },
      { speaker: 'Agent', text: 'Thank you for confirming. Good day!', delayMs: 800 }
    ],
    structuredData: [
      {
        constraint_id: 'elevator_working',
        status: 'confirmed',
        evidence_excerpt: "Both elevator banks A and B are active with no service interruptions."
      },
      {
        constraint_id: 'step_free_entrance',
        status: 'confirmed',
        evidence_excerpt: "Ramp B is clear and we have dedicated guest services ambassadors stationed there."
      },
      {
        constraint_id: 'wheelchair_parking',
        status: 'confirmed',
        evidence_excerpt: "Accessible garage parking concourse has 12 open van spaces."
      }
    ],
    callStatus: 'completed',
    expectedFeasibility: 'feasible',
    heroInsight: 'All physical-world constraints established with direct operational certainty -> Outing verified 100% FEASIBLE.'
  },

  'hard_barrier': {
    id: 'hard_barrier',
    title: 'Hard Physical Barrier (Direct Infeasibility)',
    venueName: 'The Rooftop Lounge',
    targetPhone: '+1 (617) 555-0192',
    persona: 'Mobility Impaired Outing',
    constraints: [
      { id: 'step_free_entrance', label: 'Step-Free Grade Entrance', required: true },
      { id: 'elevator_working', label: 'Terrace Elevator Access', required: true }
    ],
    dialog: [
      { speaker: 'System', text: 'Connecting CALL-E dispatch to +1 (617) 555-0192...', delayMs: 800 },
      { speaker: 'Agent', text: 'Hello, calling from OpenDoor. Does your venue have elevator or step-free access to the rooftop dining terrace?', delayMs: 1600 },
      { speaker: 'Venue', text: 'I am sorry, but no. We are located in an 1890 historic landmark building. Guests must climb 42 stone steps. There is no elevator or lift.', delayMs: 2600, highlightKeyword: 'no elevator' },
      { speaker: 'Agent', text: 'Understood. Thank you for the direct clarification.', delayMs: 900 }
    ],
    structuredData: [
      {
        constraint_id: 'elevator_working',
        status: 'declined',
        evidence_excerpt: "Guests must climb 42 stone steps. There is no elevator or lift."
      },
      {
        constraint_id: 'step_free_entrance',
        status: 'declined',
        evidence_excerpt: "We are located in an 1890 historic landmark building with 42 stone steps."
      }
    ],
    callStatus: 'completed',
    expectedFeasibility: 'not_feasible',
    heroInsight: 'Direct physical barrier identified -> Outing immediately classified NOT FEASIBLE, protecting user from impossible trip.'
  },

  'telephony_timeout': {
    id: 'telephony_timeout',
    title: 'Telephony Failure (Provider Unreachable)',
    venueName: 'Underground Comedy Club',
    targetPhone: '+1 (212) 555-0199',
    persona: 'Sensory / Wheelchair Need',
    constraints: [
      { id: 'step_free_entrance', label: 'Step-Free Grade Entrance', required: true },
      { id: 'elevator_working', label: 'Basement Lift Working Today', required: true }
    ],
    dialog: [
      { speaker: 'System', text: 'Dialing target +1 (212) 555-0199... [Attempt 1/3]', delayMs: 1200 },
      { speaker: 'System', text: 'Ringing tone... [Ring 1, Ring 2, Ring 3]', delayMs: 2000 },
      { speaker: 'System', text: 'Carrier intercept: Line busy or unattended. Retrying with exponential backoff...', delayMs: 1800 },
      { speaker: 'System', text: 'Dialing target +1 (212) 555-0199... [Attempt 2/3]', delayMs: 1400 },
      { speaker: 'System', text: 'Telephony timeout: No human staff answer. Maximum retry threshold reached.', delayMs: 1500 }
    ],
    structuredData: [],
    callStatus: 'failed',
    expectedFeasibility: 'needs_review',
    heroInsight: 'The system refuses to fabricate confidence when staff cannot be reached -> Returns NEEDS REVIEW.'
  }
};
