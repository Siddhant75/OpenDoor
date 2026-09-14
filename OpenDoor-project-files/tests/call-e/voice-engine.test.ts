import { VoiceEngine, CallStreamEvent } from '../../src/call-e/voice-engine';

describe('VoiceEngine Telephony Simulation', () => {
  it('streams events with waveform and transcript for a scenario', async () => {
    const engine = new VoiceEngine();
    const events: CallStreamEvent[] = [];

    // Use a fast mock to avoid long timeouts in unit test
    const { callResult, scenario } = await engine.streamScenario('hero_demotion', (evt) => {
      events.push(evt);
    });

    expect(events.length).toBeGreaterThan(0);
    const transcriptEvents = events.filter(e => e.type === 'transcript');
    expect(transcriptEvents.length).toBe(scenario.dialog.length);

    const waveformEvents = events.filter(e => e.type === 'waveform');
    expect(waveformEvents.length).toBeGreaterThan(0);

    expect(callResult.status).toBe('completed');
    expect(callResult.structured_data).toBeDefined();
  }, 15000);
});
