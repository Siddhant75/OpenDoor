

// --- MOCKED CALL-E PROVIDER ---

type CallStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

interface StructuredResult {
  constraint_id: string;
  status: 'confirmed' | 'declined' | 'unknown' | 'contradicted' | 'qualified_confirmation';
  evidence_excerpt: string;
}

interface CallResult {
  call_id: string;
  status: CallStatus;
  structured_data?: StructuredResult[];
  error?: string;
}

interface CallRequest {
  target_phone: string;
  prompt: string;
  structured_schema: any; // Simplified schema representation
  idempotency_key: string;
}

class MockCallEClient {
  private db: Map<string, CallResult> = new Map();

  // Simulates creating a call. Uses idempotency_key to prevent duplicates.
  async createCall(req: CallRequest): Promise<CallResult> {
    const existing = this.db.get(req.idempotency_key);
    if (existing) {
      console.log(`[CALL-E] Idempotency hit for key: ${req.idempotency_key}`);
      return existing;
    }

    const call_id = `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const result: CallResult = {
      call_id,
      status: 'queued',
    };
    
    this.db.set(req.idempotency_key, result);

    // Simulate async call processing
    setTimeout(() => {
      this.simulateCallProcessing(req.idempotency_key);
    }, 1000);

    return result;
  }

  // Simulates a webhook or status polling endpoint
  async getCallStatus(idempotency_key: string): Promise<CallResult | null> {
    return this.db.get(idempotency_key) || null;
  }

  private simulateCallProcessing(key: string) {
    const call = this.db.get(key);
    if (!call) return;

    call.status = 'completed';
    // Mocked result reflecting the OpenDoor domain requirements
    call.structured_data = [
      {
        constraint_id: 'wheelchair_entrance',
        status: 'confirmed',
        evidence_excerpt: 'Yes, we have a ramp at the main entrance.'
      },
      {
        constraint_id: 'elevator_working',
        status: 'unknown',
        evidence_excerpt: 'The maintenance guy is not here, I am not sure.'
      }
    ];
    this.db.set(key, call);
  }
}

// --- SPIKE EXECUTION ---

async function runSpike() {
  console.log("Starting OpenDoor CALL-E Spike...\n");
  const client = new MockCallEClient();

  const req: CallRequest = {
    target_phone: "+1-555-0198",
    prompt: "Hello, I am calling to verify accessibility for an upcoming event. Is the wheelchair entrance open, and is the elevator working today?",
    structured_schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          constraint_id: { type: "string" },
          status: { type: "string", enum: ['confirmed', 'declined', 'unknown', 'contradicted', 'qualified_confirmation'] },
          evidence_excerpt: { type: "string" }
        }
      }
    },
    idempotency_key: "outing_789_verification_1"
  };

  console.log("1. Creating call...");
  const initialCall = await client.createCall(req);
  console.log("Call created:", initialCall, "\n");

  console.log("2. Testing idempotency (submitting same request)...");
  const duplicateCall = await client.createCall(req);
  console.log("Duplicate result matches initial:", duplicateCall.call_id === initialCall.call_id, "\n");

  console.log("3. Waiting for call to process (simulating webhook/polling)...");
  await new Promise(resolve => setTimeout(resolve, 1500));

  const finalResult = await client.getCallStatus(req.idempotency_key);
  console.log("4. Terminal call state reconciled:");
  console.log(JSON.stringify(finalResult, null, 2));

  if (finalResult?.status === 'completed' && finalResult.structured_data) {
    console.log("\nSpike SUCCESS: All core CALL-E constraints proven in mock.");
  } else {
    console.log("\nSpike FAILED: Missing terminal state or structured data.");
  }
}

runSpike().catch(console.error);
