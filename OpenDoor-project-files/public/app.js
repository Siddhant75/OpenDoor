document.addEventListener('DOMContentLoaded', () => {
  // State
  let activeMode = 'sandbox'; // 'sandbox' | 'live'
  let selectedScenarioId = 'hero_demotion';
  let currentOutingId = null;
  let voiceEnabled = true;
  let currentPlace = null;
  let audioCtx = null;
  let callTimerInterval = null;
  let latestAuditPayload = null;

  // Personas and Constraints Definitions
  const PERSONAS = {
    wheelchair: [
      { id: 'wheelchair_parking', label: 'Wheelchair Accessible Parking', required: true },
      { id: 'step_free_entrance', label: 'Step-Free Grade Entrance', required: true },
      { id: 'elevator_working', label: 'Main Elevator Operating Today', required: true }
    ],
    sensory: [
      { id: 'quiet_sensory_room', label: 'Designated Low-Sensory Quiet Room', required: true },
      { id: 'strobe_lighting_warning', label: 'No Unannounced Strobe / Flash Lighting', required: true },
      { id: 'service_animal_relief', label: 'Designated Service Animal Area', required: false }
    ],
    hearing: [
      { id: 'assistive_listening_devices', label: 'Assistive Listening System (FM/Loop)', required: true },
      { id: 'live_captions_cart', label: 'Real-Time CART / Open Captions', required: true },
      { id: 'asl_interpreter_station', label: 'ASL Interpreter Sightline Reserved', required: false }
    ]
  };

  let activeConstraints = [...PERSONAS.wheelchair];

  // DOM Elements
  const els = {
    modeSandbox: document.getElementById('mode-sandbox'),
    modeLive: document.getElementById('mode-live'),
    sandboxCard: document.getElementById('sandbox-selector-card'),
    livePhoneWrapper: document.getElementById('live-phone-wrapper'),
    scenariosContainer: document.getElementById('scenarios-container'),
    venueInput: document.getElementById('venue-input'),
    venuesDropdown: document.getElementById('venues-dropdown'),
    searchSpinner: document.getElementById('search-spinner'),
    targetPhoneInput: document.getElementById('target-phone-input'),
    metaDisplayName: document.getElementById('meta-display-name'),
    metaPhone: document.getElementById('meta-phone'),
    metaSource: document.getElementById('meta-source'),
    constraintsList: document.getElementById('constraints-list'),
    customConstraintInput: document.getElementById('custom-constraint-input'),
    btnAddConstraint: document.getElementById('btn-add-constraint'),
    btnScan: document.getElementById('btn-scan'),
    btnAuthorize: document.getElementById('btn-authorize'),
    callTargetDisplay: document.getElementById('call-target-display'),
    callTargetHeader: document.getElementById('call-target-header'),
    transcriptFeed: document.getElementById('transcript-feed'),
    waveformCanvas: document.getElementById('waveform-canvas'),
    btnToggleVoice: document.getElementById('btn-toggle-voice'),
    voiceIcon: document.getElementById('voice-icon'),
    voiceLabel: document.getElementById('voice-label'),
    callTimer: document.getElementById('call-timer'),
    // States
    stateReady: document.getElementById('state-ready'),
    stateScanning: document.getElementById('state-scanning'),
    stateGap: document.getElementById('state-gap'),
    stateCall: document.getElementById('state-call'),
    stateBrief: document.getElementById('state-brief'),
    // Results
    digitalEvidenceList: document.getElementById('digital-evidence-list'),
    verdictBanner: document.getElementById('verdict-banner'),
    verdictBadge: document.getElementById('verdict-badge'),
    heroInsightText: document.getElementById('hero-insight-text'),
    assessmentsContainer: document.getElementById('assessments-container'),
    // Audit Drawer
    toggleAuditBtn: document.getElementById('toggle-audit-btn'),
    auditDrawerContent: document.getElementById('audit-drawer-content'),
    auditChevron: document.getElementById('audit-chevron'),
    auditViewer: document.getElementById('audit-viewer'),
    tabTimeline: document.getElementById('tab-timeline'),
    tabSchema: document.getElementById('tab-schema'),
    tabRaw: document.getElementById('tab-raw')
  };

  function switchState(name) {
    const states = ['ready', 'scanning', 'gap', 'call', 'brief'];
    states.forEach(s => {
      const el = document.getElementById(`state-${s}`);
      if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(`state-${name}`);
    if (target) target.classList.remove('hidden');
  }

  // --- 1. Mode Switching ---
  els.modeSandbox.addEventListener('click', () => {
    activeMode = 'sandbox';
    els.modeSandbox.className = 'px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-blue-600 text-white shadow-sm flex items-center';
    els.modeLive.className = 'px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white flex items-center';
    els.sandboxCard.classList.remove('hidden');
    els.livePhoneWrapper.classList.add('hidden');
    selectScenario(selectedScenarioId);
  });

  els.modeLive.addEventListener('click', () => {
    activeMode = 'live';
    els.modeLive.className = 'px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-emerald-600 text-white shadow-sm flex items-center';
    els.modeSandbox.className = 'px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white flex items-center';
    els.sandboxCard.classList.add('hidden');
    els.livePhoneWrapper.classList.remove('hidden');
  });

  // --- 2. Load Scenarios ---
  async function loadScenarios() {
    try {
      const res = await fetch('/api/scenarios');
      const data = await res.json();
      els.scenariosContainer.innerHTML = '';

      data.scenarios.forEach((sc, idx) => {
        const isSelected = sc.id === selectedScenarioId;
        const btn = document.createElement('button');
        btn.className = `w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center ${
          isSelected 
            ? 'bg-blue-950/80 border-blue-600 text-white shadow-md' 
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
        }`;
        btn.innerHTML = `
          <div>
            <div class="font-bold text-slate-200 flex items-center">
              <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-slate-600'} mr-2"></span>
              ${sc.title.split('(')[0].trim()}
            </div>
            <div class="text-[11px] text-slate-500 font-mono mt-0.5">${sc.venueName} • ${sc.persona}</div>
          </div>
          <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            sc.expectedFeasibility === 'feasible' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
            sc.expectedFeasibility === 'not_fully_verified' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
            sc.expectedFeasibility === 'not_feasible' ? 'bg-red-950 text-red-400 border border-red-800' :
            'bg-purple-950 text-purple-400 border border-purple-800'
          }">${sc.expectedFeasibility.replace(/_/g, ' ').toUpperCase()}</span>
        `;
        btn.addEventListener('click', () => selectScenario(sc.id));
        els.scenariosContainer.appendChild(btn);
      });
    } catch (e) {
      console.error('Failed to load scenarios:', e);
    }
  }

  function selectScenario(id) {
    selectedScenarioId = id;
    loadScenarios(); // Re-render borders

    fetch('/api/scenarios')
      .then(r => r.json())
      .then(data => {
        const sc = data.scenarios.find(s => s.id === id);
        if (sc) {
          els.venueInput.value = sc.venueName;
          els.targetPhoneInput.value = sc.targetPhone;
          els.metaDisplayName.textContent = `${sc.venueName} (Verified Landmark)`;
          els.metaPhone.innerHTML = `<i class="fa-solid fa-phone mr-1"></i> ${sc.targetPhone}`;
          els.metaSource.innerHTML = `<i class="fa-solid fa-shield mr-1"></i> Pre-configured Test Scenario`;
          activeConstraints = [...sc.constraints];
          renderConstraints();
        }
      });
  }

  // --- 3. Personas & Constraints ---
  document.getElementById('persona-wheelchair').addEventListener('click', () => {
    activeConstraints = [...PERSONAS.wheelchair];
    renderConstraints();
  });
  document.getElementById('persona-sensory').addEventListener('click', () => {
    activeConstraints = [...PERSONAS.sensory];
    renderConstraints();
  });
  document.getElementById('persona-hearing').addEventListener('click', () => {
    activeConstraints = [...PERSONAS.hearing];
    renderConstraints();
  });

  els.btnAddConstraint.addEventListener('click', addCustomConstraint);
  els.customConstraintInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addCustomConstraint();
  });

  function addCustomConstraint() {
    const text = els.customConstraintInput.value.trim();
    if (!text) return;
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    activeConstraints.push({ id, label: text, required: true });
    els.customConstraintInput.value = '';
    renderConstraints();
  }

  function renderConstraints() {
    els.constraintsList.innerHTML = '';
    activeConstraints.forEach((c, idx) => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs';
      row.innerHTML = `
        <label class="flex items-center cursor-pointer select-none space-x-2 flex-1 mr-2">
          <input type="checkbox" ${c.required ? 'checked' : ''} class="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0">
          <span class="font-medium ${c.required ? 'text-slate-200' : 'text-slate-500 line-through'}">${c.label}</span>
        </label>
        <button class="text-slate-600 hover:text-red-400 p-1 transition" title="Remove">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;

      // Checkbox toggle
      row.querySelector('input').addEventListener('change', (e) => {
        c.required = e.target.checked;
        renderConstraints();
      });

      // Remove button
      row.querySelector('button').addEventListener('click', () => {
        activeConstraints.splice(idx, 1);
        renderConstraints();
      });

      els.constraintsList.appendChild(row);
    });
  }

  // --- 4. Venue Autocomplete (OpenStreetMap) ---
  let searchTimeout = null;
  els.venueInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const q = e.target.value.trim();
    if (q.length < 2) {
      els.venuesDropdown.classList.add('hidden');
      return;
    }

    els.searchSpinner.classList.remove('hidden');
    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/venues/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        renderVenuesDropdown(data.venues || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        els.searchSpinner.classList.add('hidden');
      }
    }, 300);
  });

  function renderVenuesDropdown(venues) {
    els.venuesDropdown.innerHTML = '';
    if (venues.length === 0) {
      els.venuesDropdown.classList.add('hidden');
      return;
    }

    venues.forEach(v => {
      const item = document.createElement('div');
      item.className = 'p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800/50 text-xs transition';
      item.innerHTML = `
        <div class="font-bold text-white flex items-center">
          <i class="fa-solid fa-location-dot text-blue-400 mr-2"></i> ${v.name}
        </div>
        <div class="text-[11px] text-slate-400 truncate mt-0.5">${v.display_name}</div>
      `;
      item.addEventListener('click', () => {
        currentPlace = v;
        els.venueInput.value = v.name;
        els.targetPhoneInput.value = v.phone || '+1 (555) 0199';
        els.metaDisplayName.textContent = v.display_name;
        els.metaPhone.innerHTML = `<i class="fa-solid fa-phone mr-1"></i> ${v.phone || '+1 (555) 0199'}`;
        els.metaSource.innerHTML = `<i class="fa-solid fa-globe mr-1"></i> OpenStreetMap Verified`;
        els.venuesDropdown.classList.add('hidden');
      });
      els.venuesDropdown.appendChild(item);
    });

    els.venuesDropdown.classList.remove('hidden');
  }

  document.addEventListener('click', (e) => {
    if (!els.venuesDropdown.contains(e.target) && e.target !== els.venueInput) {
      els.venuesDropdown.classList.add('hidden');
    }
  });

  // --- 5. Scan Digital Footprint & Gap ---
  els.btnScan.addEventListener('click', async () => {
    const venueName = els.venueInput.value.trim() || 'The Grand Theater';
    const targetPhone = els.targetPhoneInput.value.trim() || '+1 (212) 555-0143';

    switchState('scanning');

    try {
      const payload = {
        venue_name: venueName,
        target_phone: targetPhone,
        constraints: activeConstraints,
        scenario_id: activeMode === 'sandbox' ? selectedScenarioId : undefined,
        place_metadata: currentPlace
      };

      const res = await fetch('/api/verify/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      currentOutingId = data.outing_id;

      // Realistic scanning pause
      setTimeout(() => {
        renderGapState(data);
      }, 1200);

    } catch (err) {
      console.error(err);
      alert('Failed to plan verification: ' + err.message);
      switchState('ready');
    }
  });

  function renderGapState(data) {
    switchState('gap');
    document.getElementById('gap-venue-subtitle').textContent = data.venue_name;
    els.callTargetDisplay.textContent = els.targetPhoneInput.value;
    els.callTargetHeader.textContent = `TARGET: ${els.targetPhoneInput.value}`;

    const list = els.digitalEvidenceList;
    list.innerHTML = '';

    // Render confirmed / known digital facts
    data.digital_evidence.forEach(ev => {
      const label = formatLabel(ev.constraint_id);
      const isConfirmed = ev.status === 'confirmed';
      list.innerHTML += `
        <div class="p-3.5 rounded-xl border ${isConfirmed ? 'bg-emerald-950/40 border-emerald-800/80' : 'bg-red-950/40 border-red-800/80'} flex items-start space-x-3">
          <div class="w-7 h-7 rounded-lg ${isConfirmed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} flex items-center justify-center flex-shrink-0 mt-0.5">
            <i class="fa-solid ${isConfirmed ? 'fa-check' : 'fa-xmark'} text-xs"></i>
          </div>
          <div class="flex-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">${label}</span>
              <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${isConfirmed ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}">
                ${ev.status.toUpperCase()} (DIGITAL)
              </span>
            </div>
            <p class="text-slate-300 text-[11px] mt-1 font-serif italic">"${ev.evidence_excerpt}"</p>
            <div class="text-[10px] text-slate-500 mt-1 font-mono uppercase">Source: OpenStreetMap & Published Web Registry</div>
          </div>
        </div>
      `;
    });

    // Render unresolved physical constraints (the digital gap!)
    data.unresolved_constraints.forEach(c => {
      list.innerHTML += `
        <div class="p-3.5 rounded-xl border bg-amber-950/40 border-amber-800/80 flex items-start space-x-3 relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
          <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i class="fa-solid fa-triangle-exclamation text-xs"></i>
          </div>
          <div class="flex-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">${c.label}</span>
              <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-amber-900 text-amber-300">
                CRITICAL PHYSICAL GAP
              </span>
            </div>
            <p class="text-amber-200/90 text-[11px] mt-1">
              Operational status is not reliably published online. Static maps cannot certify daily maintenance, staff availability, or temporary physical barriers.
            </p>
          </div>
        </div>
      `;
    });
  }

  // --- 6. Live Telephony Execution with Web Audio & Speech ---
  els.btnAuthorize.addEventListener('click', () => {
    switchState('call');
    startCallTimer();
    els.transcriptFeed.innerHTML = '';

    // Play subtle DTMF dial tone effect via Web Audio API
    playDtmfChime();

    // Stream SSE from backend
    const sseUrl = `/api/verify/execute-stream?outing_id=${currentOutingId}&scenario_id=${activeMode === 'sandbox' ? selectedScenarioId : ''}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'waveform' && data.waveform) {
        renderWaveform(data.waveform);
      }

      if (data.type === 'transcript') {
        renderTranscriptLine(data);
        if (voiceEnabled && data.speaker !== 'System') {
          speakTurn(data.text, data.speaker);
        }
      }

      if (data.type === 'complete') {
        eventSource.close();
        stopCallTimer();
        latestAuditPayload = data.payload;
        updateAuditDrawer(data.payload);

        // Dramatic brief transition
        setTimeout(() => {
          renderBriefState(data.payload);
        }, 1500);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      stopCallTimer();
      console.warn('Call stream completed or disconnected.');
    };
  });

  function renderTranscriptLine(data) {
    const div = document.createElement('div');
    div.className = 'transcript-line flex items-start space-x-3';

    let badgeColor = 'bg-slate-800 text-slate-300';
    let speakerColor = 'text-slate-400';

    if (data.speaker === 'Agent') {
      badgeColor = 'bg-blue-950 text-blue-400 border border-blue-800';
      speakerColor = 'text-blue-400 font-bold';
    } else if (data.speaker === 'Venue') {
      badgeColor = 'bg-emerald-950 text-emerald-400 border border-emerald-800';
      speakerColor = 'text-emerald-400 font-bold';
    } else {
      badgeColor = 'bg-slate-800 text-slate-500';
      speakerColor = 'text-slate-500 font-bold';
    }

    let formattedText = data.text;
    if (data.highlightKeyword) {
      formattedText = formattedText.replace(
        new RegExp(`(${data.highlightKeyword})`, 'gi'),
        '<span class="bg-amber-500/30 text-amber-300 border-b border-amber-400 font-bold px-1 rounded">$1</span>'
      );
    }

    div.innerHTML = `
      <span class="text-[10px] font-mono px-2 py-0.5 rounded uppercase flex-shrink-0 ${badgeColor}">${data.speaker}</span>
      <div class="text-slate-200 text-xs leading-relaxed flex-1">${formattedText}</div>
    `;

    els.transcriptFeed.appendChild(div);
    els.transcriptFeed.scrollTop = els.transcriptFeed.scrollHeight;
  }

  // --- 7. Web Audio Waveform Canvas Visualizer ---
  function renderWaveform(samples) {
    const canvas = els.waveformCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const barWidth = width / samples.length;
    samples.forEach((val, i) => {
      const barHeight = val * (height - 4);
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(1, '#6366f1');

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    });
  }

  // Subtle DTMF audio chime
  function playDtmfChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = audioCtx || new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Browser Speech Synthesis
  function speakTurn(text, speaker) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop prior turn
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    utter.pitch = speaker === 'Agent' ? 1.15 : 0.95;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (speaker === 'Agent') {
        const femaleVoice = voices.find(v => v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Female'));
        if (femaleVoice) utter.voice = femaleVoice;
      } else {
        const maleVoice = voices.find(v => v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Natural'));
        if (maleVoice) utter.voice = maleVoice;
      }
    }
    window.speechSynthesis.speak(utter);
  }

  els.btnToggleVoice.addEventListener('click', () => {
    voiceEnabled = !voiceEnabled;
    if (voiceEnabled) {
      els.voiceIcon.className = 'fa-solid fa-volume-high mr-1.5 text-blue-400';
      els.voiceLabel.textContent = 'Speech On';
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      els.voiceIcon.className = 'fa-solid fa-volume-xmark mr-1.5 text-slate-500';
      els.voiceLabel.textContent = 'Muted';
    }
  });

  // Call timer
  function startCallTimer() {
    let secs = 0;
    els.callTimer.textContent = '00:00';
    clearInterval(callTimerInterval);
    callTimerInterval = setInterval(() => {
      secs++;
      const m = String(Math.floor(secs / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      els.callTimer.textContent = `${m}:${s}`;
    }, 1000);
  }

  function stopCallTimer() {
    clearInterval(callTimerInterval);
  }

  // --- 8. Final Evidence Brief & Provenance Engine ---
  function renderBriefState(payload) {
    switchState('brief');
    const { feasibility, assessments, heroInsight } = payload;

    els.heroInsightText.textContent = heroInsight || 'OpenDoor evaluated all constraints using deterministic local safety policy.';

    // Verdict Badge styling
    const status = feasibility.status.toLowerCase();
    if (status === 'feasible') {
      els.verdictBanner.className = 'p-6 rounded-2xl border bg-emerald-950/50 border-emerald-700/80 text-center relative overflow-hidden';
      els.verdictBadge.className = 'inline-block px-6 py-2 rounded-xl text-lg font-black tracking-wider uppercase border-2 bg-emerald-600 text-white border-emerald-400 shadow-xl shadow-emerald-500/30';
      els.verdictBadge.textContent = 'FEASIBLE (100% VERIFIED)';
    } else if (status === 'not_fully_verified') {
      els.verdictBanner.className = 'p-6 rounded-2xl border bg-amber-950/50 border-amber-700/80 text-center relative overflow-hidden';
      els.verdictBadge.className = 'inline-block px-6 py-2 rounded-xl text-lg font-black tracking-wider uppercase border-2 bg-amber-500 text-slate-950 border-amber-300 shadow-xl shadow-amber-500/30';
      els.verdictBadge.textContent = 'NOT FULLY VERIFIED (SAFETY ABSTAIN)';
    } else if (status === 'not_feasible') {
      els.verdictBanner.className = 'p-6 rounded-2xl border bg-red-950/50 border-red-700/80 text-center relative overflow-hidden';
      els.verdictBadge.className = 'inline-block px-6 py-2 rounded-xl text-lg font-black tracking-wider uppercase border-2 bg-red-600 text-white border-red-400 shadow-xl shadow-red-500/30';
      els.verdictBadge.textContent = 'NOT FEASIBLE (PHYSICAL BARRIER)';
    } else {
      els.verdictBanner.className = 'p-6 rounded-2xl border bg-purple-950/50 border-purple-700/80 text-center relative overflow-hidden';
      els.verdictBadge.className = 'inline-block px-6 py-2 rounded-xl text-lg font-black tracking-wider uppercase border-2 bg-purple-600 text-white border-purple-400 shadow-xl shadow-purple-500/30';
      els.verdictBadge.textContent = 'NEEDS REVIEW (TELEPHONY UNREACHABLE)';
    }

    // Assessments List
    const container = els.assessmentsContainer;
    container.innerHTML = '';

    assessments.forEach(ass => {
      const st = ass.final_status;
      const isConfirmed = st === 'confirmed';
      const isDemoted = st === 'unknown' && ass.evidence.some(e => e.evidence_excerpt && (e.evidence_excerpt.includes('think') || e.evidence_excerpt.includes('maintenance')));
      const isDeclined = st === 'declined';
      const isUnreachable = st === 'unreachable';

      let cardBg = 'bg-slate-900/80 border-slate-800';
      let tagBg = 'bg-slate-800 text-slate-400';
      let tagLabel = st.toUpperCase();
      let icon = 'fa-circle-question';

      if (isConfirmed) {
        cardBg = 'bg-emerald-950/30 border-emerald-800/80';
        tagBg = 'bg-emerald-900/80 text-emerald-300 border border-emerald-700';
        tagLabel = 'CONFIRMED (VERIFIED)';
        icon = 'fa-circle-check text-emerald-400';
      } else if (isDemoted) {
        cardBg = 'bg-amber-950/40 border-amber-800/90';
        tagBg = 'bg-amber-900/90 text-amber-300 border border-amber-600';
        tagLabel = 'UNKNOWN (STRICT SAFETY DEMOTION)';
        icon = 'fa-triangle-exclamation text-amber-400';
      } else if (isDeclined) {
        cardBg = 'bg-red-950/40 border-red-800/90';
        tagBg = 'bg-red-900/90 text-red-300 border border-red-600';
        tagLabel = 'DECLINED (BARRIER CONFIRMED)';
        icon = 'fa-circle-xmark text-red-400';
      } else if (isUnreachable) {
        cardBg = 'bg-purple-950/30 border-purple-800/80';
        tagBg = 'bg-purple-900/80 text-purple-300 border border-purple-700';
        tagLabel = 'UNREACHABLE (TELEPHONY TIMEOUT)';
        icon = 'fa-phone-slash text-purple-400';
      }

      const excerpt = ass.evidence.length > 0 ? ass.evidence[0].evidence_excerpt : 'No direct operational statement obtained.';
      const sourceType = ass.evidence.length > 0 ? ass.evidence[0].source_type : 'N/A';

      const demotionNotice = isDemoted ? `
        <div class="mt-2.5 p-2 rounded-lg bg-amber-900/30 border border-amber-700/60 text-[11px] text-amber-300 flex items-center">
          <i class="fa-solid fa-shield-halved mr-2 text-amber-400 flex-shrink-0"></i>
          <span><strong>OpenDoor Deterministic Firewall:</strong> The venue representative provided a qualified statement ("I think..."). The engine strictly downgraded this from Confirmed to Unknown to prevent patron stranding.</span>
        </div>
      ` : '';

      container.innerHTML += `
        <div class="p-4 rounded-xl border ${cardBg} transition-all">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <i class="fa-solid ${icon} text-sm"></i>
              <span class="font-bold text-white text-sm">${ass.constraint.label}</span>
            </div>
            <span class="text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider ${tagBg}">
              ${tagLabel}
            </span>
          </div>
          
          <div class="mt-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <p class="text-xs text-slate-300 font-serif italic">"${excerpt}"</p>
            <div class="mt-1 text-[10px] text-slate-500 font-mono uppercase">
              Proven Source: ${sourceType} • Verification Channel: CALL-E Telephony API
            </div>
          </div>
          ${demotionNotice}
        </div>
      `;
    });
  }

  // --- 9. Technical Audit Drawer for Judges ---
  els.toggleAuditBtn.addEventListener('click', () => {
    els.auditDrawerContent.classList.toggle('hidden');
    els.auditChevron.classList.toggle('rotate-180');
  });

  els.tabTimeline.addEventListener('click', () => switchAuditTab('timeline'));
  els.tabSchema.addEventListener('click', () => switchAuditTab('schema'));
  els.tabRaw.addEventListener('click', () => switchAuditTab('raw'));

  function switchAuditTab(tab) {
    [els.tabTimeline, els.tabSchema, els.tabRaw].forEach(b => {
      b.className = 'text-xs font-mono font-bold px-3 py-1 rounded bg-slate-800 text-slate-400 hover:text-white';
    });

    if (tab === 'timeline') {
      els.tabTimeline.className = 'text-xs font-mono font-bold px-3 py-1 rounded bg-blue-600 text-white';
      if (latestAuditPayload && latestAuditPayload.auditTrail) {
        els.auditViewer.textContent = JSON.stringify(latestAuditPayload.auditTrail, null, 2);
      }
    } else if (tab === 'schema') {
      els.tabSchema.className = 'text-xs font-mono font-bold px-3 py-1 rounded bg-blue-600 text-white';
      const schemaDef = {
        name: "extract_accessibility_constraints",
        parameters: {
          type: "object",
          properties: {
            constraints: {
              type: "array",
              items: {
                constraint_id: { type: "string" },
                status: { type: "string", enum: ["confirmed", "declined", "unknown", "qualified_confirmation"] },
                evidence_excerpt: { type: "string", description: "Exact quote from respondent" }
              }
            }
          },
          required: ["constraints"]
        },
        enforcement: "Deterministic OpenDoor Policy (No hallucinated certifications)"
      };
      els.auditViewer.textContent = JSON.stringify(schemaDef, null, 2);
    } else if (tab === 'raw') {
      els.tabRaw.className = 'text-xs font-mono font-bold px-3 py-1 rounded bg-blue-600 text-white';
      els.auditViewer.textContent = JSON.stringify(latestAuditPayload || { message: "No execution trace recorded yet." }, null, 2);
    }
  }

  function updateAuditDrawer(payload) {
    switchAuditTab('timeline');
  }

  function formatLabel(id) {
    return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // Initial Boot
  loadScenarios();
  renderConstraints();
  renderWaveform([0.1, 0.2, 0.4, 0.6, 0.8, 0.9, 0.6, 0.4, 0.2, 0.1]);
});
