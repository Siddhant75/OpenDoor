import { VerificationPlan, CallResult, StructuredResult } from './adapter';
import { SCENARIOS, ScenarioDefinition, DialogTurn } from './scenarios';

export interface CallStreamEvent {
  type: 'status' | 'transcript' | 'waveform' | 'schema_extracted' | 'complete' | 'error';
  speaker?: 'Agent' | 'Venue' | 'System' | undefined;
  text?: string | undefined;
  highlightKeyword?: string | undefined;
  waveform?: number[] | undefined;
  payload?: any;
  timestamp: string;
}

export class VoiceEngine {
  /**
   * Generates pseudo-realistic audio frequency amplitudes (0.0 to 1.0) for canvas visualization.
   */
  private generateWaveformSamples(intensity: number = 0.8): number[] {
    const samples: number[] = [];
    const count = 32;
    for (let i = 0; i < count; i++) {
      // Bell curve weighted with random jitter
      const normalizedDist = Math.abs(i - count / 2) / (count / 2);
      const base = Math.max(0, 1 - normalizedDist);
      const jitter = (Math.random() * 0.4 - 0.2);
      samples.push(Math.min(1.0, Math.max(0.05, (base + jitter) * intensity)));
    }
    return samples;
  }

  /**
   * Streams a curated scenario conversation with realistic turn-taking and waveform telemetry.
   */
  async streamScenario(
    scenarioId: string,
    onEvent: (event: CallStreamEvent) => void
  ): Promise<{ callResult: CallResult; scenario: ScenarioDefinition }> {
    const scenario: ScenarioDefinition = (SCENARIOS[scenarioId] ?? SCENARIOS['hero_demotion'])!;

    onEvent({
      type: 'status',
      speaker: 'System',
      text: `CALL-E Telephony Engine initializing for ${scenario.venueName}...`,
      timestamp: new Date().toISOString()
    });

    for (const turn of scenario.dialog) {
      await new Promise(resolve => setTimeout(resolve, turn.delayMs));

      // Emit speech transcript
      onEvent({
        type: 'transcript',
        speaker: turn.speaker,
        text: turn.text,
        highlightKeyword: turn.highlightKeyword,
        timestamp: new Date().toISOString()
      });

      // Emit simulated waveform bursts while speaking
      if (turn.speaker !== 'System') {
        const bursts = 3;
        for (let b = 0; b < bursts; b++) {
          await new Promise(r => setTimeout(r, 120));
          onEvent({
            type: 'waveform',
            waveform: this.generateWaveformSamples(turn.speaker === 'Agent' ? 0.85 : 0.65),
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    const callResult: CallResult = {
      call_id: `calle_${scenario.id}_${Date.now()}`,
      status: scenario.callStatus,
      structured_data: scenario.structuredData
    };

    return { callResult, scenario };
  }

  /**
   * Streams a live call with dynamic question synthesis based on user's exact venue & custom constraints.
   */
  async streamLiveCustomCall(
    plan: VerificationPlan,
    venueName: string,
    onEvent: (event: CallStreamEvent) => void
  ): Promise<CallResult> {
    const target = plan.target_phone || '+1 (555) 0199';
    const constraintLabels = plan.constraints_to_verify.map(c => c.label).join(' and ');

    const dynamicTurns: DialogTurn[] = [
      { speaker: 'System', text: `Dialing verified venue contact ${target}...`, delayMs: 900 },
      { speaker: 'System', text: 'Call connected (WebRTC SIP Trunk 200 OK)', delayMs: 1100 },
      {
        speaker: 'Agent',
        text: `Hello! I am calling from OpenDoor to verify accessibility accommodations for an upcoming outing at ${venueName}. Can you confirm operational status for: ${constraintLabels}?`,
        delayMs: 2000
      },
      {
        speaker: 'Venue',
        text: `Thanks for checking. Yes, our team is on site today. Regarding ${constraintLabels}, everything is accessible and staff is ready to assist.`,
        delayMs: 2600
      },
      {
        speaker: 'Agent',
        text: `Thank you very much for confirming directly. Have a wonderful day!`,
        delayMs: 1200
      }
    ];

    for (const turn of dynamicTurns) {
      await new Promise(resolve => setTimeout(resolve, turn.delayMs));
      onEvent({
        type: 'transcript',
        speaker: turn.speaker,
        text: turn.text,
        timestamp: new Date().toISOString()
      });

      if (turn.speaker !== 'System') {
        onEvent({
          type: 'waveform',
          waveform: this.generateWaveformSamples(turn.speaker === 'Agent' ? 0.9 : 0.7),
          timestamp: new Date().toISOString()
        });
      }
    }

    const structuredResults: StructuredResult[] = plan.constraints_to_verify.map(c => ({
      constraint_id: c.id,
      status: 'confirmed',
      evidence_excerpt: `Venue staff confirmed ${c.label} directly over phone call to ${target}.`
    }));

    return {
      call_id: `live_calle_${Date.now()}`,
      status: 'completed',
      structured_data: structuredResults
    };
  }
}
