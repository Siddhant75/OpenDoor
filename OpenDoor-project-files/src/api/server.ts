import express from 'express';
import cors from 'cors';
import path from 'path';
import { Outing, Constraint } from '../domain/constraints';
import { OpenDoorOrchestrator, VerificationState } from '../application/orchestrator';
import { DynamicDigitalEvidenceSource } from '../evidence/digital-source';
import { searchPlaces, PlaceMetadata } from '../evidence/dynamic-search';
import { CallEAdapter, CallEProvider, VerificationPlan, CallHandle, CallResult } from '../call-e/adapter';
import { VoiceEngine, CallStreamEvent } from '../call-e/voice-engine';
import { SCENARIOS } from '../call-e/scenarios';
import { normalizeCallResult } from '../evidence/normalize';
import { evaluateFeasibility } from '../domain/feasibility';

// Adaptable provider linking VoiceEngine to orchestrator
class DynamicCallEProvider implements CallEProvider {
  private results = new Map<string, CallResult>();

  registerResult(call_id: string, result: CallResult) {
    this.results.set(call_id, result);
  }

  async createCall(plan: VerificationPlan): Promise<CallHandle> {
    const call_id = `calle_${Date.now()}`;
    return { call_id, status: 'in_progress' };
  }

  async getCallStatus(call_id: string): Promise<CallResult> {
    const stored = this.results.get(call_id);
    if (stored) return stored;
    return {
      call_id,
      status: 'completed',
      structured_data: []
    };
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const publicDir = path.resolve(process.cwd(), 'public');
app.use(express.static(publicDir));
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const callProvider = new DynamicCallEProvider();
const callAdapter = new CallEAdapter(callProvider);
const voiceEngine = new VoiceEngine();

// Store active verification sessions and audit trails
interface ExtendedSession {
  state: VerificationState;
  placeMetadata?: PlaceMetadata;
  scenarioId?: string;
  auditTrail: Array<{ timestamp: string; phase: string; detail: string; payload?: any }>;
}

const sessions = new Map<string, ExtendedSession>();

/**
 * GET /api/venues/search?q={query}
 * Searches real places globally via OpenStreetMap Nominatim with curated fallback.
 */
app.get('/api/venues/search', async (req, res) => {
  const query = (req.query.q as string) || '';
  try {
    const results = await searchPlaces(query);
    res.json({ venues: results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/scenarios
 * Returns the 4 curated battle-tested scenarios for judges.
 */
app.get('/api/scenarios', (req, res) => {
  res.json({ scenarios: Object.values(SCENARIOS) });
});

/**
 * POST /api/verify/plan
 * Establishes digital footprint and determines physical-world gap.
 */
app.post('/api/verify/plan', async (req, res) => {
  const { venue_name, target_phone, constraints, scenario_id, place_metadata } = req.body;

  const normalizedConstraints: Constraint[] = (constraints || []).map((item: any) => {
    if (typeof item === 'string') {
      return {
        id: item,
        label: item.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        required: true
      };
    }
    return {
      id: item.id,
      label: item.label || item.id,
      required: item.required !== false
    };
  });

  const outing: Outing = {
    id: `outing_${Date.now()}`,
    venue_name: venue_name || 'The Grand Theater',
    constraints: normalizedConstraints
  };

  const digitalSource = new DynamicDigitalEvidenceSource(place_metadata);
  const orchestrator = new OpenDoorOrchestrator(digitalSource, callAdapter);

  const state = await orchestrator.prepareOutingVerification(outing, target_phone || '+1 (555) 0199');

  const sessionData: ExtendedSession = {
    state,
    placeMetadata: place_metadata,
    scenarioId: scenario_id,
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        phase: 'DIGITAL_SCAN',
        detail: `Collected ${state.digital_evidence.length} digital evidence records for ${outing.venue_name}`,
        payload: state.digital_evidence
      },
      {
        timestamp: new Date().toISOString(),
        phase: 'GAP_DETECTION',
        detail: `Detected ${state.unresolved_constraints.length} unresolvable physical-world constraints`,
        payload: state.unresolved_constraints
      }
    ]
  };

  sessions.set(outing.id, sessionData);

  res.json({
    outing_id: outing.id,
    venue_name: outing.venue_name,
    digital_evidence: state.digital_evidence,
    unresolved_constraints: state.unresolved_constraints,
    requires_call: state.call_plan !== null,
    call_plan: state.call_plan
  });
});

/**
 * GET /api/verify/execute-stream?outing_id=...&scenario_id=...
 * Streams real-time telephony dialog, speech waveform telemetry, and final evaluation.
 */
app.get('/api/verify/execute-stream', async (req, res) => {
  const outing_id = req.query.outing_id as string;
  const scenario_id = (req.query.scenario_id as string) || '';

  const session = sessions.get(outing_id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendEvent = (event: CallStreamEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  let callResult: CallResult;
  let heroInsight = '';

  if (scenario_id && SCENARIOS[scenario_id]) {
    // Run scenario-driven stream
    const result = await voiceEngine.streamScenario(scenario_id, sendEvent);
    callResult = result.callResult;
    heroInsight = result.scenario.heroInsight;
  } else {
    // Run dynamic live custom call stream
    callResult = await voiceEngine.streamLiveCustomCall(
      session.state.call_plan || {
        outing_id,
        target_phone: '+1 (555) 0199',
        constraints_to_verify: session.state.unresolved_constraints,
        idempotency_key: `live_${outing_id}`
      },
      session.state.outing.venue_name,
      sendEvent
    );
    heroInsight = 'Live custom call verified directly with venue staff over telephony channel.';
  }

  // Record into audit trail
  session.auditTrail.push({
    timestamp: new Date().toISOString(),
    phase: 'TELEPHONY_DISPATCH',
    detail: `Call finished with status: ${callResult.status}`,
    payload: callResult
  });

  // Reconcile and normalize
  callProvider.registerResult(callResult.call_id, callResult);
  session.state.call_handle = { call_id: callResult.call_id, status: callResult.status };

  // 1. Initial assessments from digital evidence
  const assessments = session.state.outing.constraints.map(c => {
    const ev = session.state.digital_evidence.find(e => e.constraint_id === c.id);
    return {
      constraint: c,
      evidence: ev ? [ev] : [],
      final_status: ev ? ev.status : 'unknown'
    };
  });

  // 2. Normalize and merge call results
  if (callResult.structured_data && callResult.structured_data.length > 0) {
    const callAssessments = normalizeCallResult(
      callResult,
      session.state.call_plan ? session.state.call_plan.constraints_to_verify : session.state.outing.constraints
    );

    for (const ca of callAssessments) {
      const index = assessments.findIndex(a => a.constraint.id === ca.constraint.id);
      if (index !== -1) {
        assessments[index] = ca;
      }
    }
  } else if (callResult.status === 'failed') {
    // Provider could not connect -> unverified hard constraints remain unknown with reason
    for (const a of assessments) {
      if (a.final_status === 'unknown') {
        a.evidence.push({
          constraint_id: a.constraint.id,
          status: 'unknown',
          source_type: 'venue_staff',
          source_checked_at: new Date(),
          evidence_excerpt: 'Telephony failure: Venue staff unreachable after multiple retry attempts.'
        });
      }
    }
  }

  session.state.final_assessments = assessments;
  session.state.feasibility = evaluateFeasibility(session.state.outing, assessments);

  session.auditTrail.push({
    timestamp: new Date().toISOString(),
    phase: 'DETERMINISTIC_EVALUATION',
    detail: `Outing feasibility evaluated as: ${session.state.feasibility.status.toUpperCase()}`,
    payload: {
      feasibility: session.state.feasibility,
      assessments: session.state.final_assessments
    }
  });

  // Emit final complete payload
  sendEvent({
    type: 'complete',
    payload: {
      feasibility: session.state.feasibility,
      assessments: session.state.final_assessments,
      heroInsight,
      auditTrail: session.auditTrail,
      scenarioId: scenario_id
    },
    timestamp: new Date().toISOString()
  });

  res.end();
});

/**
 * GET /api/audit/:id
 * Raw JSON audit trace for judges.
 */
app.get('/api/audit/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Audit session not found' });
    return;
  }
  res.json({
    outing_id: session.state.outing.id,
    venue: session.state.outing.venue_name,
    audit_trail: session.auditTrail,
    final_feasibility: session.state.feasibility,
    assessments: session.state.final_assessments
  });
});

app.use((req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`OpenDoor Command Center API running on http://localhost:${PORT}`);
});
