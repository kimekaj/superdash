/* ===================== Music theory data =====================
   NOTE_TO_PC, KEY_OPTIONS, PC_TO_SAMPLE_NAME, tuning data, and the audio
   engine all live in common.js (shared with chords.html). */

// Preferred spelling of each major scale, keyed by root pitch-class (0-11).
// Chosen to match common guitar/circle-of-fifths convention.
const MAJOR_SPELLING = {
  0:  ['C','D','E','F','G','A','B'],
  1:  ['Db','Eb','F','Gb','Ab','Bb','C'],
  2:  ['D','E','F#','G','A','B','C#'],
  3:  ['Eb','F','G','Ab','Bb','C','D'],
  4:  ['E','F#','G#','A','B','C#','D#'],
  5:  ['F','G','A','Bb','C','D','E'],
  6:  ['F#','G#','A#','B','C#','D#','E#'],
  7:  ['G','A','B','C','D','E','F#'],
  8:  ['Ab','Bb','C','Db','Eb','F','G'],
  9:  ['A','B','C#','D','E','F#','G#'],
  10: ['Bb','C','D','Eb','F','G','A'],
  11: ['B','C#','D#','E','F#','G#','A#']
};

// stepIndex = position of the mode's tonic within the major scale (0=Ionian ... 6=Locrian)
// intervals = semitone offsets from root, ascending
// degrees   = scale-degree labels relative to major
// steps     = whole/half step pattern between successive scale tones
const MODES = [
  {
    name:'Ionian', alt:'Major', stepIndex:0,
    intervals:[0,2,4,5,7,9,11],
    degrees:['1','2','3','4','5','6','7'],
    steps:['W','W','H','W','W','W','H'],
    desc:'The standard major scale — bright, resolved, and fully stable. It is the harmonic home base every other mode is measured against.',
    genres:['Pop','Country','Classical']
  },
  {
    name:'Dorian', alt:'Minor with raised 6th', stepIndex:1,
    intervals:[0,2,3,5,7,9,10],
    degrees:['1','2','♭3','4','5','6','♭7'],
    steps:['W','H','W','W','W','H','W'],
    desc:'A minor-sounding mode with a raised 6th, giving it a hopeful, jazzy lift that natural minor doesn’t have. A favorite for modal jazz, funk, and rock jams.',
    genres:['Jazz','Funk','Modal Rock']
  },
  {
    name:'Phrygian', alt:'Minor with flat 2nd', stepIndex:2,
    intervals:[0,1,3,5,7,8,10],
    degrees:['1','♭2','♭3','4','5','♭6','♭7'],
    steps:['H','W','W','W','H','W','W'],
    desc:'A minor mode colored by a flat 2nd, creating dark, exotic, Spanish-tinged tension right off the root.',
    genres:['Flamenco','Metal','Latin']
  },
  {
    name:'Lydian', alt:'Major with sharp 4th', stepIndex:3,
    intervals:[0,2,4,6,7,9,11],
    degrees:['1','2','3','♯4','5','6','7'],
    steps:['W','W','W','H','W','W','H'],
    desc:'A major mode with a raised 4th, producing a dreamy, floating, slightly unresolved brightness. A staple of film scoring and prog rock.',
    genres:['Film Score','Prog Rock','Fusion']
  },
  {
    name:'Mixolydian', alt:'Major with flat 7th', stepIndex:4,
    intervals:[0,2,4,5,7,9,10],
    degrees:['1','2','3','4','5','6','♭7'],
    steps:['W','W','H','W','W','H','W'],
    desc:'A major mode with a flattened 7th, giving it a bluesy, dominant-chord sound that never quite resolves upward.',
    genres:['Blues','Rock','Celtic']
  },
  {
    name:'Aeolian', alt:'Natural Minor', stepIndex:5,
    intervals:[0,2,3,5,7,8,10],
    degrees:['1','2','♭3','4','5','♭6','♭7'],
    steps:['W','H','W','W','H','W','W'],
    desc:'The natural minor scale — melancholic and introspective. It’s the minor counterpart to Ionian and the backbone of most minor-key pop and rock.',
    genres:['Pop','Rock','Cinematic']
  },
  {
    name:'Locrian', alt:'Diminished', stepIndex:6,
    intervals:[0,1,3,5,6,8,10],
    degrees:['1','♭2','♭3','4','♭5','♭6','♭7'],
    steps:['H','W','W','H','W','W','W'],
    desc:'An unstable, diminished mode with both a flat 2nd and flat 5th. Rarely used as a tonal center — more common as color over half-diminished chords.',
    genres:['Jazz','Fusion','Experimental']
  }
];

const NUM_FRETS = 15;
const MARKER_FRETS = new Set([3,5,7,9,15]);
const DOUBLE_MARKER_FRETS = new Set([12]);

/* ===================== State ===================== */

const POSITIONS = [
  { id:1, range:[0,3]   },
  { id:2, range:[3,6]   },
  { id:3, range:[6,9]   },
  { id:4, range:[9,12]  },
  { id:5, range:[12,15] }
];

// bass.html reuses this whole script; <body data-page="bass"> switches the
// string source, instruments and playback octave (see currentStrings()).
const IS_BASS = document.body.dataset.page === 'bass';
if(IS_BASS) referenceOctave = 2;

let state = {
  rootPc: 2,   // D
  modeIdx: 1,  // Dorian
  positions: new Set(), // empty = full neck (all positions)
  instrumentId: 'guitar',
  tuningId: getSavedTuningId(),
  stringCount: IS_BASS ? getSavedBassStringCount() : 6
};

function currentStrings(){
  return IS_BASS
    ? getTuningStrings(state.tuningId, BASS_STRING_LAYOUTS[state.stringCount])
    : getTuningStrings(state.tuningId);
}

/* ===================== Theory helpers ===================== */

function getParentMajorPc(rootPc, mode){
  const majorScale = [0,2,4,5,7,9,11];
  return (rootPc - majorScale[mode.stepIndex] + 12) % 12;
}

function getModeSpelling(rootPc, mode){
  const parentPc = getParentMajorPc(rootPc, mode);
  const parentScale = MAJOR_SPELLING[parentPc];
  const rotated = [];
  for(let i=0;i<7;i++){
    rotated.push(parentScale[(mode.stepIndex + i) % 7]);
  }
  return { parentPc, notes: rotated };
}

function pcOf(noteName){
  return NOTE_TO_PC[noteName];
}

/* ===================== Rendering ===================== */

function populateSelectors(){
  const keySelect = document.getElementById('keySelect');
  KEY_OPTIONS.forEach(opt=>{
    const el = document.createElement('option');
    el.value = opt.pc;
    el.textContent = opt.label;
    keySelect.appendChild(el);
  });
  keySelect.value = state.rootPc;

  const modeSelect = document.getElementById('modeSelect');
  MODES.forEach((m, i)=>{
    const el = document.createElement('option');
    el.value = i;
    el.textContent = `${m.name} (${m.alt})`;
    modeSelect.appendChild(el);
  });
  modeSelect.value = state.modeIdx;

  const tuningSelect = document.getElementById('tuningSelect');
  TUNINGS.forEach(t=>{
    const el = document.createElement('option');
    el.value = t.id;
    el.textContent = t.label;
    tuningSelect.appendChild(el);
  });
  tuningSelect.value = state.tuningId;

  keySelect.addEventListener('change', e=>{
    state.rootPc = parseInt(e.target.value, 10);
    render();
  });
  modeSelect.addEventListener('change', e=>{
    state.modeIdx = parseInt(e.target.value, 10);
    render();
  });
  tuningSelect.addEventListener('change', e=>{
    state.tuningId = e.target.value;
    saveTuningId(state.tuningId);
    render();
  });

  const stringSelect = document.getElementById('stringCountSelect');
  if(stringSelect){
    BASS_STRING_COUNTS.forEach(n=>{
      const el = document.createElement('option');
      el.value = n;
      el.textContent = `${n} Strings`;
      stringSelect.appendChild(el);
    });
    stringSelect.value = state.stringCount;
    stringSelect.addEventListener('change', e=>{
      state.stringCount = parseInt(e.target.value, 10);
      saveBassStringCount(state.stringCount);
      render();
    });
  }
}

function render(){
  if(studyState.running) stopStudy();

  const mode = MODES[state.modeIdx];
  const { parentPc, notes } = getModeSpelling(state.rootPc, mode);
  const rootLabel = notes[0];
  const scalePcs = mode.intervals.map(iv => (state.rootPc + iv) % 12);

  document.getElementById('keySelect').value = state.rootPc;
  document.getElementById('modeSelect').value = state.modeIdx;
  document.getElementById('tuningSelect').value = state.tuningId;
  const stringSelect = document.getElementById('stringCountSelect');
  if(stringSelect) stringSelect.value = state.stringCount;

  const tuning = getTuning(state.tuningId);
  const tuningStrings = currentStrings();
  const stringsMeta = IS_BASS ? ` · ${state.stringCount} STRINGS` : '';
  document.getElementById('tuningMeta').textContent =
    `${tuning.label.toUpperCase()}${stringsMeta} · ${tuningStrings.map(s=>s.label).join(' ')}`;

  document.getElementById('currentPill').textContent = `${rootLabel} ${mode.name}`;
  document.getElementById('fbTitle').textContent =
    `${IS_BASS ? `${state.stringCount}-String Bass` : 'Fretboard'} — ${rootLabel} ${mode.name}`;
  document.getElementById('studyDesc').textContent =
    `Cycles the ${rootLabel} ${mode.name} scale in time with a metronome, highlighting each note on the fretboard as it plays.`;

  document.getElementById('statRoot').textContent = rootLabel;
  document.getElementById('statMode').textContent = mode.name;
  document.getElementById('statModeNum').textContent = `${ordinal(mode.stepIndex+1)} mode of the major scale`;
  document.getElementById('statFormula').textContent = mode.degrees.join(' ');
  document.getElementById('statParent').textContent = `${MAJOR_SPELLING[parentPc][0]} Major`;

  renderNoteList(notes, mode);
  renderSteps(mode);
  renderModeList();
  renderAbout(mode);
  renderPositionSub();
  renderFretboard(scalePcs, notes, mode);

  document.getElementById('allModesKey').textContent = MAJOR_SPELLING[parentPc][0];
}

function ordinal(n){
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

function renderNoteList(notes, mode){
  const container = document.getElementById('noteList');
  container.innerHTML = '';
  notes.forEach((noteName, i)=>{
    const row = document.createElement('div');
    row.className = 'note-row' + (i===0 ? ' is-root' : '');
    row.title = `Click to hear ${noteName}`;
    row.innerHTML = `
      <div class="deg">${mode.degrees[i]}</div>
      <div class="name">${noteName}</div>
      <div class="desc">${i===0 ? 'Tonic / Root' : 'Scale tone'}</div>
    `;
    row.addEventListener('click', ()=>{
      row.classList.add('playing');
      setTimeout(()=> row.classList.remove('playing'), 300);
      playSingleNote(state.rootPc, mode.intervals[i]);
    });
    container.appendChild(row);
  });
}

function renderSteps(mode){
  const container = document.getElementById('stepChips');
  container.innerHTML = '';
  mode.steps.forEach((s, i)=>{
    const chip = document.createElement('div');
    chip.className = `step-chip ${s}`;
    chip.textContent = s;
    container.appendChild(chip);
    if(i < mode.steps.length - 1){
      const arrow = document.createElement('span');
      arrow.className = 'step-arrow';
      arrow.textContent = '→';
      container.appendChild(arrow);
    }
  });
}

function renderModeList(){
  const container = document.getElementById('modeList');
  container.innerHTML = '';
  MODES.forEach((m, i)=>{
    const row = document.createElement('div');
    row.className = 'mode-row' + (i === state.modeIdx ? ' active' : '');
    const pct = Math.round(((i+1)/7)*100);
    row.innerHTML = `
      <div class="m-name">${m.name}</div>
      <div class="m-bar-track"><div class="m-bar-fill" style="width:${pct}%"></div></div>
      <div class="m-formula">${m.degrees.join(' ')}</div>
    `;
    row.addEventListener('click', ()=>{
      state.modeIdx = i;
      render();
    });
    container.appendChild(row);
  });
}

function renderAbout(mode){
  const el = document.getElementById('aboutText');
  el.innerHTML = `
    <p><b>${mode.name}</b> (${mode.alt}) — ${mode.desc}</p>
    <div class="genres">${mode.genres.map(g=>`<span class="genre-tag">${g}</span>`).join('')}</div>
  `;
}

/* ===================== Position selector ===================== */

function buildPositionToggles(){
  const container = document.getElementById('positionToggles');
  container.innerHTML = '';
  POSITIONS.forEach(p=>{
    const btn = document.createElement('button');
    btn.className = 'pos-btn';
    btn.textContent = p.id;
    btn.title = `Frets ${p.range[0]}–${p.range[1]}`;
    btn.addEventListener('click', ()=>{
      if(state.positions.has(p.id)) state.positions.delete(p.id);
      else state.positions.add(p.id);
      render();
    });
    container.appendChild(btn);
  });
}

function updatePositionToggleStates(){
  document.querySelectorAll('#positionToggles .pos-btn').forEach((btn, i)=>{
    btn.classList.toggle('active', state.positions.has(POSITIONS[i].id));
  });
}

function getAllowedFretRanges(){
  if(state.positions.size === 0) return [[0, NUM_FRETS]];
  return POSITIONS.filter(p => state.positions.has(p.id)).map(p => p.range);
}

function isFretAllowed(f, ranges){
  return ranges.some(([lo,hi]) => f >= lo && f <= hi);
}

function renderPositionSub(){
  updatePositionToggleStates();
  const el = document.getElementById('positionSub');
  if(state.positions.size === 0){
    el.textContent = 'Full neck shown';
  } else {
    const ranges = getAllowedFretRanges();
    const label = [...state.positions].sort((a,b)=>a-b).join(', ');
    const fretText = ranges.map(([lo,hi]) => `${lo}–${hi}`).join(', ');
    el.textContent = `Pos ${label} · Frets ${fretText}`;
  }
}

/* ===================== Fretboard SVG ===================== */

function renderFretboard(scalePcs, notes, mode){
  const svg = document.getElementById('fretboard');
  svg.innerHTML = '';
  const NS = 'http://www.w3.org/2000/svg';

  const strings = currentStrings();

  const leftPad = 58, rightPad = 20, topPad = 34, bottomPad = 34;
  // guitar keeps its fixed 320 tall board; bass boards size to the string count
  const width = 1000;
  const height = IS_BASS ? topPad + bottomPad + (strings.length - 1) * 56 : 320;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const boardW = width - leftPad - rightPad;
  const boardH = height - topPad - bottomPad;
  const cellW = boardW / NUM_FRETS;
  const stringGap = boardH / (strings.length - 1);

  function fretLineX(n){ return leftPad + n * cellW; }
  function stringY(i){ return topPad + i * stringGap; }

  const scalePcSet = new Set(scalePcs);
  const rootPc = scalePcs[0];

  function degreeInfoForPc(pc){
    const idx = scalePcs.indexOf(pc);
    if(idx === -1) return null;
    return { note: notes[idx], degree: mode.degrees[idx], isRoot: idx === 0, idx };
  }

  function el(tag, attrs){
    const e = document.createElementNS(NS, tag);
    for(const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  const allowedRanges = getAllowedFretRanges();
  const showingPositions = state.positions.size > 0;

  // position highlight bands (drawn first, behind everything else)
  if(showingPositions){
    POSITIONS.filter(p => state.positions.has(p.id)).forEach(p=>{
      const [lo, hi] = p.range;
      const x1 = lo === 0 ? leftPad - 48 : fretLineX(lo);
      const x2 = fretLineX(hi);
      const band = el('rect', {
        x: x1, y: topPad - 14,
        width: x2 - x1, height: boardH + 28,
        rx: 10,
        fill: 'var(--pink-soft)',
        stroke: 'var(--pink)',
        'stroke-width': 1,
        'stroke-opacity': 0.35
      });
      svg.appendChild(band);
      const tag = el('text', {
        x: x1 + 8, y: topPad - 18,
        fill: 'var(--pink)', 'font-size': 11, 'font-weight': 800
      });
      tag.textContent = `P${p.id}`;
      svg.appendChild(tag);
    });
  }

  // fret markers (inlay dots)
  for(let f=1; f<=NUM_FRETS; f++){
    if(!MARKER_FRETS.has(f) && !DOUBLE_MARKER_FRETS.has(f)) continue;
    const cx = fretLineX(f-1) + cellW/2;
    const midY = topPad + boardH/2;
    if(DOUBLE_MARKER_FRETS.has(f)){
      svg.appendChild(el('circle', {cx, cy: midY - stringGap*1.15, r:5, fill:'color-mix(in srgb, var(--ink) 10%, transparent)'}));
      svg.appendChild(el('circle', {cx, cy: midY + stringGap*1.15, r:5, fill:'color-mix(in srgb, var(--ink) 10%, transparent)'}));
    } else {
      svg.appendChild(el('circle', {cx, cy: midY, r:5.5, fill:'color-mix(in srgb, var(--ink) 10%, transparent)'}));
    }
  }

  // fret lines
  for(let f=0; f<=NUM_FRETS; f++){
    const x = fretLineX(f);
    svg.appendChild(el('line', {
      x1:x, y1: topPad - 6, x2:x, y2: topPad + boardH + 6,
      stroke: f===0 ? 'color-mix(in srgb, var(--ink) 65%, transparent)' : 'color-mix(in srgb, var(--ink) 18%, transparent)',
      'stroke-width': f===0 ? 5 : 1.4
    }));
  }

  // fret number labels
  [3,5,7,9,12,15].forEach(f=>{
    const cx = fretLineX(f-1) + cellW/2;
    const t = el('text', {
      x:cx, y: topPad + boardH + 24,
      'text-anchor':'middle', fill:'var(--ink-faint)', 'font-size':12, 'font-weight':700
    });
    t.textContent = f;
    svg.appendChild(t);
  });

  // strings
  strings.forEach((s, i)=>{
    const y = stringY(i);
    const w = IS_BASS ? 4.6 - i*0.6 : 3.2 - i*0.32;
    svg.appendChild(el('line', {
      x1: leftPad, y1:y, x2: leftPad + boardW, y2:y,
      stroke:'color-mix(in srgb, var(--ink) 55%, transparent)', 'stroke-width': Math.max(w,1)
    }));
    const lbl = el('text', {
      x: leftPad - 44, y: y+4, 'text-anchor':'middle',
      fill:'var(--ink-dim)', 'font-size':13, 'font-weight':700
    });
    lbl.textContent = s.label;
    svg.appendChild(lbl);
  });

  // note dots
  strings.forEach((s, stringIdx)=>{
    for(let f=0; f<=NUM_FRETS; f++){
      const pc = (s.pc + f) % 12;
      if(!scalePcSet.has(pc)) continue;
      if(!isFretAllowed(f, allowedRanges)) continue;
      const info = degreeInfoForPc(pc);
      const y = stringY(stringIdx);
      const x = f===0 ? leftPad - 17 : fretLineX(f-1) + cellW/2;

      const g = el('g', { class:'fret-dot', 'data-degree-idx': info.idx });
      const circle = el('circle', {
        cx:x, cy:y, r: 12,
        fill: info.isRoot ? 'var(--pink)' : 'var(--purple)',
        stroke: info.isRoot ? 'var(--pink)' : 'var(--purple)',
        'stroke-opacity': info.isRoot ? 0.5 : 0.4,
        'stroke-width': info.isRoot ? 3 : 2
      });
      if(info.isRoot){
        circle.style.filter = 'drop-shadow(0 0 5px var(--pink))';
      }
      const text = el('text', {
        x:x, y:y+4, 'text-anchor':'middle',
        fill:'var(--bg)', 'font-size':10.5, 'font-weight':800
      });
      text.textContent = info.note;
      g.appendChild(circle);
      g.appendChild(text);
      g.style.transformOrigin = `${x}px ${y}px`;
      g.addEventListener('click', ()=>{
        pulseDot(g);
        playAbsoluteNote(s.openAbs + f);
      });
      const titleEl = el('title', {});
      titleEl.textContent = `${info.note} — click to hear this note`;
      g.appendChild(titleEl);
      svg.appendChild(g);
    }
  });

  // open-string divider
  svg.appendChild(el('line', {
    x1: leftPad - 30, y1: topPad - 10, x2: leftPad - 30, y2: topPad + boardH + 10,
    stroke:'color-mix(in srgb, var(--ink) 12%, transparent)', 'stroke-width':1, 'stroke-dasharray':'3,3'
  }));
}

/* ===================== Audio =====================
   The sampled-instrument engine (ensureAudioCtx, sampleKeyFor, loadBuffersFor,
   scheduleBuffer, playSingleNote, playAbsoluteNote, ...) lives in common.js.
   playScale is the one Modes-specific playback routine — it uses MODES. */

async function playScale(){
  const ctx = ensureAudioCtx();
  const sf = instrumentSf(state.instrumentId);
  const mode = MODES[state.modeIdx];
  const semis = [...mode.intervals, mode.intervals[0] + 12];
  const keys = semis.map(s => sampleKeyFor(state.rootPc, s, referenceOctave));

  let buffers;
  try{ buffers = await loadBuffersFor(ctx, sf, keys); }
  catch(e){ console.warn('Instrument load failed', e); return; }

  const noteDur = 0.24;
  const now = ctx.currentTime + 0.05;
  buffers.forEach((buf, i)=>{
    scheduleBuffer(ctx, buf, ctx.destination, now + i * noteDur, { gain:0.85, holdSec:0.28, fadeSec:0.55 });
  });
}

/* ===================== Small UI feedback helpers ===================== */

function highlightDegree(degreeIdx, holdMs){
  document.querySelectorAll(`.fret-dot[data-degree-idx="${degreeIdx}"]`).forEach(g=>{
    g.classList.add('study-highlight');
    setTimeout(()=> g.classList.remove('study-highlight'), holdMs);
  });
  const rows = document.querySelectorAll('#noteList .note-row');
  const row = rows[degreeIdx];
  if(row){
    row.classList.add('playing');
    setTimeout(()=> row.classList.remove('playing'), holdMs);
  }
}

function pulseBeatIndicator(accent, holdMs){
  const el = document.getElementById('beatIndicator');
  if(!el) return;
  el.classList.add('pulse');
  if(accent) el.style.transform = 'scale(1.5)';
  setTimeout(()=>{ el.classList.remove('pulse'); el.style.transform = ''; }, holdMs);
}

function playClickAt(ctx, when, accent){
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = accent ? 1600 : 1000;
  gain.gain.setValueAtTime(0.001, when);
  gain.gain.exponentialRampToValueAtTime(0.22, when + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0005, when + 0.045);
  osc.connect(gain).connect(ctx.destination);
  osc.start(when);
  osc.stop(when + 0.05);
}

/* ===================== Study Mode =====================
   A metronome-driven practice loop: cycles up and down through the current
   mode's scale degrees, playing each note and highlighting every occurrence
   of it on the fretboard, in time with an adjustable-tempo click. Uses the
   standard Web Audio "lookahead scheduler" pattern so timing stays accurate
   even though the tab's JS timer alone would drift. */

const SCHED_AHEAD_SEC = 0.1;
const SCHED_INTERVAL_MS = 25;

let studyState = {
  running: false,
  bpm: 80,
  timerId: null,
  nextNoteTime: 0,
  stepIdx: 0,
  sequence: [],
  pendingTimeouts: []
};

function buildStudySequence(mode){
  const n = mode.intervals.length;
  const up = Array.from({length:n}, (_, i)=> i);
  const down = [...up].reverse().slice(1, -1);
  return [...up, ...down];
}

function scheduleStudyTick(){
  const ctx = ensureAudioCtx();
  const mode = MODES[state.modeIdx];
  const secPerBeat = 60 / studyState.bpm;

  while(studyState.nextNoteTime < ctx.currentTime + SCHED_AHEAD_SEC){
    const loopPos = studyState.stepIdx % studyState.sequence.length;
    const degreeIdx = studyState.sequence[loopPos];
    const isAccent = loopPos === 0;
    const when = studyState.nextNoteTime;

    playClickAt(ctx, when, isAccent);
    playSingleNote(state.rootPc, mode.intervals[degreeIdx], when);

    const delayMs = Math.max(0, (when - ctx.currentTime) * 1000);
    const holdMs = secPerBeat * 700;
    const tid = setTimeout(()=>{
      highlightDegree(degreeIdx, holdMs);
      pulseBeatIndicator(isAccent, holdMs);
    }, delayMs);
    studyState.pendingTimeouts.push(tid);

    studyState.stepIdx++;
    studyState.nextNoteTime += secPerBeat;
  }

  if(studyState.pendingTimeouts.length > 200){
    studyState.pendingTimeouts.splice(0, 100);
  }
}

async function startStudy(){
  if(studyState.running) return;
  const ctx = ensureAudioCtx();
  const mode = MODES[state.modeIdx];
  const sf = instrumentSf(state.instrumentId);

  const keys = mode.intervals.map(iv => sampleKeyFor(state.rootPc, iv, referenceOctave));
  try{ await loadBuffersFor(ctx, sf, keys); }
  catch(e){ console.warn('Instrument load failed', e); return; }

  studyState.running = true;
  studyState.sequence = buildStudySequence(mode);
  studyState.stepIdx = 0;
  studyState.nextNoteTime = ctx.currentTime + 0.1;
  studyState.timerId = setInterval(scheduleStudyTick, SCHED_INTERVAL_MS);

  const btn = document.getElementById('studyToggleBtn');
  btn.textContent = '■ Stop Study';
  btn.classList.add('active');
}

function stopStudy(){
  if(!studyState.running) return;
  studyState.running = false;
  clearInterval(studyState.timerId);
  studyState.pendingTimeouts.forEach(id => clearTimeout(id));
  studyState.pendingTimeouts = [];
  document.querySelectorAll('.fret-dot.study-highlight').forEach(g => g.classList.remove('study-highlight'));
  document.querySelectorAll('#noteList .note-row.playing').forEach(r => r.classList.remove('playing'));
  const indicator = document.getElementById('beatIndicator');
  if(indicator){ indicator.classList.remove('pulse'); indicator.style.transform = ''; }

  const btn = document.getElementById('studyToggleBtn');
  if(btn){ btn.textContent = '▶ Start Study'; btn.classList.remove('active'); }
}

function initStudy(){
  const bpmInput = document.getElementById('bpmInput');
  bpmInput.addEventListener('change', ()=>{
    const v = Math.max(40, Math.min(208, parseInt(bpmInput.value, 10) || 80));
    bpmInput.value = v;
    studyState.bpm = v;
  });

  document.getElementById('studyToggleBtn').addEventListener('click', ()=>{
    if(studyState.running) stopStudy();
    else startStudy();
  });
}

/* ===================== Init ===================== */

function init(){
  populateSelectors();
  buildPositionToggles();
  if(IS_BASS) initInstrument(BASS_INSTRUMENTS, BASS_INSTRUMENT_KEY);
  else initInstrument();
  initTheme();
  initStudy();
  render();

  document.getElementById('playBtn').addEventListener('click', playScale);
  document.getElementById('randomBtn').addEventListener('click', ()=>{
    state.rootPc = Math.floor(Math.random()*12);
    state.modeIdx = Math.floor(Math.random()*7);
    render();
  });
  document.getElementById('resetBtn').addEventListener('click', ()=>{
    state.rootPc = 2;
    state.modeIdx = 1;
    state.positions = new Set();
    state.tuningId = 'e';
    saveTuningId('e');
    if(IS_BASS){
      state.stringCount = 4;
      saveBassStringCount(4);
    }
    render();
  });

  window.addEventListener('resize', ()=>{
    const mode = MODES[state.modeIdx];
    const { notes } = getModeSpelling(state.rootPc, mode);
    const scalePcs = mode.intervals.map(iv => (state.rootPc + iv) % 12);
    renderFretboard(scalePcs, notes, mode);
  });
}

document.addEventListener('DOMContentLoaded', init);
