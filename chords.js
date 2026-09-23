/* ===================== Chord data ===================== */

// intervals are semitones from the chord root; values >11 (e.g. a 9th = 14)
// are fine — they're reduced mod 12 wherever we check pitch-class membership,
// but kept raw so formula labels read correctly.
const CHORD_QUALITIES = [
  { id:'maj',   label:'Major',           suffix:'',      intervals:[0,4,7],       degrees:['1','3','5'],
    desc:'The plain major triad — bright, stable, and fully resolved. The harmonic home base of Western music.',
    genres:['Pop','Folk','Classical'] },
  { id:'min',   label:'Minor',           suffix:'m',     intervals:[0,3,7],       degrees:['1','♭3','5'],
    desc:'The minor triad — darker and more introspective than major, built from a flattened 3rd.',
    genres:['Rock','Pop','Cinematic'] },
  { id:'5',     label:'Power Chord (5)', suffix:'5',     intervals:[0,7],         degrees:['1','5'],
    desc:'Root and 5th only, no 3rd — neither major nor minor. A distortion-friendly staple of rock and metal.',
    genres:['Rock','Metal','Punk'] },
  { id:'sus2',  label:'Suspended 2nd',   suffix:'sus2',  intervals:[0,2,7],       degrees:['1','2','5'],
    desc:'Replaces the 3rd with a 2nd, creating an open, unresolved, airy sound.',
    genres:['Pop','Indie','Folk'] },
  { id:'sus4',  label:'Suspended 4th',   suffix:'sus4',  intervals:[0,5,7],       degrees:['1','4','5'],
    desc:'Replaces the 3rd with a 4th, building tension that usually wants to resolve back to a major triad.',
    genres:['Rock','Worship','Pop'] },
  { id:'6',     label:'Sixth',           suffix:'6',     intervals:[0,4,7,9],     degrees:['1','3','5','6'],
    desc:'A major triad plus the 6th — sweet and a little nostalgic, common in jazz and 1950s pop endings.',
    genres:['Jazz','Swing','Pop'] },
  { id:'m6',    label:'Minor Sixth',     suffix:'m6',    intervals:[0,3,7,9],     degrees:['1','♭3','5','6'],
    desc:'A minor triad plus a raised 6th — jazzy and a little mysterious, common as a moody tonic-minor color.',
    genres:['Jazz','Bossa Nova'] },
  { id:'7',     label:'Dominant 7th',    suffix:'7',     intervals:[0,4,7,10],    degrees:['1','3','5','♭7'],
    desc:'A major triad plus a flat 7th — the classic bluesy, unresolved dominant sound.',
    genres:['Blues','Rock','Funk'] },
  { id:'maj7',  label:'Major 7th',       suffix:'maj7',  intervals:[0,4,7,11],    degrees:['1','3','5','7'],
    desc:'A major triad plus the natural 7th — lush, dreamy, and a little jazzy without the dominant tension.',
    genres:['Jazz','Soul','R&B'] },
  { id:'m7',    label:'Minor 7th',       suffix:'m7',    intervals:[0,3,7,10],    degrees:['1','♭3','5','♭7'],
    desc:'A minor triad plus a flat 7th — smoother and jazzier than a plain minor chord.',
    genres:['Jazz','Neo-Soul','Funk'] },
  { id:'7sus4', label:'7sus4',           suffix:'7sus4', intervals:[0,5,7,10],    degrees:['1','4','5','♭7'],
    desc:'A dominant 7th with the 3rd swapped for a 4th — a suspended, gospel-tinged flavor.',
    genres:['Gospel','Rock','Funk'] },
  { id:'9',     label:'Ninth',           suffix:'9',     intervals:[0,4,7,10,14], degrees:['1','3','5','♭7','9'],
    desc:'A dominant 7th plus the 9th — a fuller, funkier extension of the dominant sound.',
    genres:['Funk','Jazz','R&B'] },
  { id:'add9',  label:'Add9',            suffix:'add9',  intervals:[0,4,7,14],    degrees:['1','3','5','9'],
    desc:'A major triad plus the 9th, without the 7th — bright and shimmering, popular in modern pop.',
    genres:['Pop','Indie'] },
  { id:'m9',    label:'Minor 9th',       suffix:'m9',    intervals:[0,3,7,10,14], degrees:['1','♭3','5','♭7','9'],
    desc:'A minor 7th plus the 9th — smooth, lush, and a favorite in neo-soul and jazz.',
    genres:['Neo-Soul','Jazz'] },
  { id:'11',    label:'Dominant 11th',   suffix:'11',    intervals:[0,4,7,10,14,17],    degrees:['1','3','5','♭7','9','11'],
    desc:'A dominant 9th plus the 11th — a big, stacked dominant sound. Six notes, so on guitar some are usually left out.',
    genres:['Funk','Jazz','Gospel'] },
  { id:'m11',   label:'Minor 11th',      suffix:'m11',   intervals:[0,3,7,10,14,17],    degrees:['1','♭3','5','♭7','9','11'],
    desc:'A minor 9th plus the 11th — open, spacious and modern, a staple of neo-soul and jazz voicings.',
    genres:['Neo-Soul','Jazz','R&B'] },
  { id:'13',    label:'Dominant 13th',   suffix:'13',    intervals:[0,4,7,10,14,17,21], degrees:['1','3','5','♭7','9','11','13'],
    desc:'The full stack of thirds up to the 13th — every note of the scale. Seven notes, so guitarists normally play a subset (often dropping the 5th and 11th).',
    genres:['Jazz','Funk','Blues'] },
  { id:'m13',   label:'Minor 13th',      suffix:'m13',   intervals:[0,3,7,10,14,17,21], degrees:['1','♭3','5','♭7','9','11','13'],
    desc:'A minor 11th plus the 13th — the richest minor sound, all seven notes of the Dorian scale. Guitarists normally play a subset.',
    genres:['Jazz','Neo-Soul'] },
  { id:'dim',   label:'Diminished',      suffix:'dim',   intervals:[0,3,6],       degrees:['1','♭3','♭5'],
    desc:'A stack of minor 3rds — tense and unstable, almost always used to lead somewhere else.',
    genres:['Classical','Jazz'] },
  { id:'dim7',  label:'Diminished 7th',  suffix:'dim7',  intervals:[0,3,6,9],     degrees:['1','♭3','♭5','♭♭7'],
    desc:'A fully symmetrical diminished chord — every note a minor 3rd apart. Classic horror-movie tension.',
    genres:['Classical','Jazz'] },
  { id:'m7b5',  label:'Half-Diminished', suffix:'m7♭5',  intervals:[0,3,6,10],    degrees:['1','♭3','♭5','♭7'],
    desc:'A diminished triad plus a flat 7th — the signature ii chord of minor-key jazz progressions.',
    genres:['Jazz'] },
  { id:'aug',   label:'Augmented',       suffix:'aug',   intervals:[0,4,8],       degrees:['1','3','♯5'],
    desc:'A major triad with a raised 5th — restless and unresolved, stacked from major 3rds.',
    genres:['Jazz','Classical','Prog'] }
];

let state = {
  rootPc: 0,      // C
  qualityIdx: 0,  // Major
  positionIdx: 0, // which of the computed voicings is shown
  bassInterval: 0, // semitones above the root for the lowest note; 0 = root position
  instrumentId: 'guitar',
  tuningId: getSavedTuningId()
};

/* ===================== Voicing engine =====================
   Finds a playable fretted voicing for a chord on the current tuning: for
   each string (low to high), use the lowest fret at or above minFret that
   sounds a chord tone within a 4-fret reach (extended to 7 as a fallback);
   if no chord tone is reachable, mute the string. This mirrors how simple
   chord-chart generators work and naturally adapts to any tuning since it
   only depends on each string's open pitch — no curated fingering database.

   Sliding minFret up the neck and keeping only the shapes that actually
   change gives the set of distinct "positions" a chord can be played in.

   bassPc pins the lowest sounding note: the bass string is the lowest one
   that can reach that pitch class, every string below it is muted, and no
   higher string may sound below it. That is what makes inversions (bass is
   a chord tone) and slash chords (bass is any other note) come out right —
   and it means plain root position really does have the root in the bass. */

// Groups fretted notes into "one finger" units: notes at the same fret only
// share a finger when they sit on physically-adjacent strings (a barre) —
// otherwise each needs its own finger, since one finger can't press two
// different strings at once unless it's flat across a contiguous run.
// Returned in the order fingers 1..N would naturally be assigned (low fret
// first, low string first), which is also what a hand-playability check
// needs: a shape needs more independent fingers than groups.length.
function computeFingerGroups(chosen){
  const fretted = chosen
    .filter(c => c.fret != null && c.fret > 0)
    .sort((a,b)=> a.stringIdx - b.stringIdx);
  const distinctFrets = [...new Set(fretted.map(c => c.fret))].sort((a,b)=>a-b);
  const groups = [];
  distinctFrets.forEach(fret=>{
    const idxs = fretted.filter(c => c.fret === fret).map(c => c.stringIdx);
    let run = [idxs[0]];
    for(let i = 1; i < idxs.length; i++){
      if(idxs[i] === run[run.length-1] + 1) run.push(idxs[i]);
      else { groups.push({ fret, stringIdxs: run }); run = [idxs[i]]; }
    }
    groups.push({ fret, stringIdxs: run });
  });
  return groups;
}

function computeVoicing(rootPc, intervals, tuningId, minFret = 0, bassPc = rootPc){
  const strings = getTuningStrings(tuningId);
  const norm = n => ((n % 12) + 12) % 12;
  const chordPcs = new Set(intervals.map(iv => norm(rootPc + iv)));
  const rootPcVal = norm(rootPc);
  const bassPcVal = norm(bassPc);
  const SPAN = 4; // widest fret stretch a hand can comfortably cover
  const MAX_FINGERS = 4;
  const absAt = (idx, fret) => strings[idx].openAbs + fret;

  // First chord tone on a string within [lo, hi] that isn't below minAbs.
  function findFret(idx, lo, hi, minAbs){
    for(let f = lo; f <= hi; f++){
      if(chordPcs.has(norm(absAt(idx, f))) && absAt(idx, f) >= minAbs) return f;
    }
    return null;
  }

  // Whichever string (at or above fromIdx, pitched at or above minAbs) can
  // reach pc with the least stretch beyond the comfortable span.
  function reachWithLeastStretch(pc, fromIdx, minAbs){
    let best = null;
    for(let idx = fromIdx; idx < strings.length; idx++){
      for(let f = minFret; f <= minFret + 11; f++){
        if(norm(absAt(idx, f)) === pc && absAt(idx, f) >= minAbs){
          const extra = Math.max(0, f - (minFret + SPAN));
          if(best === null || extra < best.extra) best = { idx, fret: f, extra };
          break;
        }
      }
    }
    return best;
  }

  // Bass first: the lowest string that reaches the bass note in the span.
  // If none does, take whichever needs the least stretch.
  let bass = null;
  for(let idx = 0; idx < strings.length && !bass; idx++){
    for(let f = minFret; f <= minFret + SPAN; f++){
      if(norm(absAt(idx, f)) === bassPcVal){ bass = { idx, fret: f }; break; }
    }
  }
  if(!bass) bass = reachWithLeastStretch(bassPcVal, 0, -Infinity);
  const bassAbs = absAt(bass.idx, bass.fret);

  // Strings below the bass are muted; the rest are searched within the same
  // comfortable SPAN, and a string with no chord tone in reach (or only one
  // that would sound below the bass) is muted rather than stretched, so the
  // shape as a whole always stays hand-playable.
  const chosen = strings.map((s, idx)=>({
    stringIdx: idx,
    fret: idx < bass.idx ? null
        : idx === bass.idx ? bass.fret
        : findFret(idx, minFret, minFret + SPAN, bassAbs)
  }));

  const soundsRoot = ()=> chosen.some(c =>
    c.fret != null && norm(absAt(c.stringIdx, c.fret)) === rootPcVal
  );
  if(!soundsRoot()){
    // Use a single string above the bass for the root — guarantees the root
    // sounds (a slash chord over a non-chord tone would otherwise lose it)
    // without blowing up the whole shape's span.
    const best = reachWithLeastStretch(rootPcVal, bass.idx + 1, bassAbs);
    if(best) chosen[best.idx] = { stringIdx: best.idx, fret: best.fret };
  }

  // Chords with six or more tones (11ths, 13ths) can't fully fit on six
  // strings, and with that many chord tones the per-string pick above can
  // easily drop the notes that actually define the chord. Swap a redundant
  // string over to each missing defining tone: the 3rd and the 7th.
  const essentialPcs = new Set(chordPcs.size < 6 ? [] :
    intervals.filter(iv => [3, 4, 10, 11].includes(iv % 12)).map(iv => norm(rootPc + iv)));
  if(essentialPcs.size){
    const pcOf = c => norm(absAt(c.stringIdx, c.fret));
    const countPcs = ()=>{
      const m = new Map();
      chosen.forEach(c=>{ if(c.fret != null) m.set(pcOf(c), (m.get(pcOf(c)) || 0) + 1); });
      return m;
    };
    essentialPcs.forEach(pc=>{
      const counts = countPcs();
      if(counts.has(pc)) return;
      let best = null;
      for(let idx = bass.idx + 1; idx < strings.length; idx++){
        for(let f = minFret; f <= minFret + SPAN; f++){
          if(norm(absAt(idx, f)) !== pc || absAt(idx, f) < bassAbs) continue;
          const cur = chosen[idx];
          const curPc = cur.fret == null ? null : pcOf(cur);
          // only overwrite a string that is muted, doubled elsewhere, or not
          // needed for the root / 3rd / 7th
          const redundant = curPc === null || counts.get(curPc) > 1 ||
            (curPc !== rootPcVal && !essentialPcs.has(curPc));
          if(redundant && (best === null || f < best.fret)) best = { idx, fret: f };
          break;
        }
      }
      if(best) chosen[best.idx] = { stringIdx: best.idx, fret: best.fret };
    });
  }

  // A hand only has 4 independent fingers — if the shape needs more distinct
  // (non-barrable) fret positions than that, drop the least essential notes
  // rather than depict something nobody could actually fret. The bass note
  // is what defines an inversion, so it's the last thing to go.
  let groups = computeFingerGroups(chosen);
  if(groups.length > MAX_FINGERS){
    const scored = groups.map(g=>{
      const containsBass = g.stringIdxs.includes(bass.idx);
      const containsRoot = g.stringIdxs.some(idx =>
        norm(absAt(idx, g.fret)) === rootPcVal
      );
      const containsEssential = g.stringIdxs.some(idx =>
        essentialPcs.has(norm(absAt(idx, g.fret)))
      );
      return { g, containsBass, containsRoot, containsEssential, size: g.stringIdxs.length };
    });
    scored.sort((a,b)=>{
      if(a.containsBass !== b.containsBass) return a.containsBass ? -1 : 1;
      if(a.containsRoot !== b.containsRoot) return a.containsRoot ? -1 : 1;
      if(a.containsEssential !== b.containsEssential) return a.containsEssential ? -1 : 1;
      return b.size - a.size;
    });
    const keep = new Set();
    scored.slice(0, MAX_FINGERS).forEach(s => s.g.stringIdxs.forEach(idx => keep.add(idx)));
    chosen.forEach(c=>{
      if(c.fret != null && c.fret > 0 && !keep.has(c.stringIdx)) c.fret = null;
    });
  }

  return { strings, chosen, minFret, bassIdx: bass.idx };
}

// "Open" means the voicing actually uses an open string, not just a low
// fret number — a shape with no opens is named after its lowest fret instead.
function positionLabel(v){
  const hasOpen = v.chosen.some(c => c.fret === 0);
  if(hasOpen) return 'Open';
  const positive = v.chosen.filter(c => c.fret != null).map(c => c.fret);
  if(!positive.length) return 'Open';
  const lo = Math.min(...positive);
  return `${lo}${ordinalSuffix(lo)}`;
}

// Slides the search window up the neck, keeping each genuinely new,
// distinctly-labeled shape — this populates the position selector.
function computeVoicingsForChord(rootPc, intervals, tuningId, bassPc = rootPc, maxPositions = 7){
  const results = [];
  const seenKeys = new Set();
  const seenLabels = new Set();
  for(let minFret = 0; minFret <= 12 && results.length < maxPositions; minFret++){
    const v = computeVoicing(rootPc, intervals, tuningId, minFret, bassPc);
    const key = v.chosen.map(c => c.fret == null ? 'x' : c.fret).join(',');
    const label = positionLabel(v);
    if(!seenKeys.has(key) && !seenLabels.has(label)){
      seenKeys.add(key);
      seenLabels.add(label);
      results.push(v);
    }
  }
  return results;
}

// Assigns finger numbers (1=index .. 4=pinky) using the same adjacency-aware
// grouping computeVoicing already used to keep the shape within 4 fingers —
// so this always has exactly one finger per group, never a collision.
function assignFingers(chosen){
  const fingerMap = {};
  computeFingerGroups(chosen).forEach((g, i)=>{
    const finger = i + 1;
    g.stringIdxs.forEach(idx => { fingerMap[idx] = finger; });
  });
  return fingerMap;
}

/* ===================== Rendering ===================== */

// Slash notation puts the bass after a "/" — omitted when the root is in the bass.
function chordName(rootPc, quality, bassPc = rootPc){
  const slash = bassPc === rootPc ? '' : `/${PC_TO_SHARP_NAME[bassPc]}`;
  return `${PC_TO_SHARP_NAME[rootPc]}${quality.suffix}${slash}`;
}

/* ---------- Bass note: root position, inversions, slash chords ----------
   An inversion is just a slash chord whose bass is one of the chord's own
   tones (C/E, C/G), so a single bassInterval covers both. Every chord tone
   counts as an inversion (a chord with N tones has N-1 of them, e.g. a 9th
   chord's 9th in the bass is its 4th inversion); only non-chord-tone basses
   read as plain slash chords. */

const DEGREE_BY_SEMITONE = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
// n = 0 is root position; n = 1, 2, 3, ... are the 1st, 2nd, 3rd, ... inversions.
function inversionLabel(n){
  return n === 0 ? 'Root position' : `${n}${ordinalSuffix(n)} inversion`;
}

// Chord tones as unique pitch classes in chord order, with their degree label.
function chordTones(quality){
  const seen = new Set();
  const tones = [];
  quality.intervals.forEach((iv, i)=>{
    const semis = iv % 12;
    if(seen.has(semis)) return;
    seen.add(semis);
    tones.push({ semis, degree: quality.degrees[i] });
  });
  return tones;
}

function describeBass(quality){
  const semis = state.bassInterval;
  const tones = chordTones(quality);
  const idx = tones.findIndex(t => t.semis === semis);
  const isChordTone = idx >= 0;
  let kind = 'slash';
  if(semis === 0) kind = 'root';
  else if(isChordTone) kind = 'inversion';
  return {
    semis,
    kind,
    inversion: kind === 'slash' ? 0 : idx,
    isChordTone,
    degree: isChordTone ? tones[idx].degree : DEGREE_BY_SEMITONE[semis],
    bassPc: (state.rootPc + semis) % 12
  };
}

function bassKindLabel(bass){
  if(bass.kind === 'slash') return `Slash chord over ${PC_TO_SHARP_NAME[bass.bassPc]}`;
  return inversionLabel(bass.inversion);
}

function currentVoicings(){
  const quality = CHORD_QUALITIES[state.qualityIdx];
  const { bassPc } = describeBass(quality);
  return computeVoicingsForChord(state.rootPc, quality.intervals, state.tuningId, bassPc);
}

function populateSelectors(){
  const keySelect = document.getElementById('keySelect');
  KEY_OPTIONS.forEach(opt=>{
    const el = document.createElement('option');
    el.value = opt.pc;
    el.textContent = opt.label;
    keySelect.appendChild(el);
  });
  keySelect.value = state.rootPc;
  keySelect.addEventListener('change', e=>{
    state.rootPc = parseInt(e.target.value, 10);
    state.positionIdx = 0;
    render();
  });

  // Options are rebuilt on every render (see buildBassSelect) since their
  // labels depend on the current root and chord quality.
  document.getElementById('bassSelect').addEventListener('change', e=>{
    state.bassInterval = parseInt(e.target.value, 10);
    state.positionIdx = 0;
    render();
    playCurrentChord();
  });

  const tuningSelect = document.getElementById('tuningSelect');
  TUNINGS.forEach(t=>{
    const el = document.createElement('option');
    el.value = t.id;
    el.textContent = t.label;
    tuningSelect.appendChild(el);
  });
  tuningSelect.value = state.tuningId;
  tuningSelect.addEventListener('change', e=>{
    state.tuningId = e.target.value;
    saveTuningId(state.tuningId);
    render();
  });
}

// Grouped so inversions and slash chords are easy to tell apart: chord tones
// (the bass keeps the same notes) vs. other notes (the bass adds a new one).
function buildBassSelect(quality){
  const select = document.getElementById('bassSelect');
  select.innerHTML = '';
  const tones = chordTones(quality);
  const toneSemis = new Set(tones.map(t => t.semis));
  const optionFor = (semis, text)=>{
    const opt = document.createElement('option');
    opt.value = semis;
    opt.textContent = text;
    return opt;
  };
  const noteName = semis => PC_TO_SHARP_NAME[(state.rootPc + semis) % 12];

  const toneGroup = document.createElement('optgroup');
  toneGroup.label = 'Chord tones (inversions)';
  tones.forEach((t, i)=>{
    const note = `${noteName(t.semis)} — ${t.degree}`;
    const what = inversionLabel(i).toLowerCase();
    toneGroup.appendChild(optionFor(t.semis, `${note} · ${what}`));
  });
  select.appendChild(toneGroup);

  const otherGroup = document.createElement('optgroup');
  otherGroup.label = 'Other notes (slash chords)';
  for(let semis = 1; semis < 12; semis++){
    if(toneSemis.has(semis)) continue;
    otherGroup.appendChild(optionFor(semis, `${noteName(semis)} — ${DEGREE_BY_SEMITONE[semis]}`));
  }
  select.appendChild(otherGroup);
  select.value = state.bassInterval;
}

function buildInversionRow(quality, bass){
  const container = document.getElementById('inversionToggles');
  container.innerHTML = '';
  chordTones(quality).forEach((t, i)=>{
    const bassPc = (state.rootPc + t.semis) % 12;
    const btn = document.createElement('button');
    btn.className = 'chord-pos-btn' + (bass.semis === t.semis ? ' active' : '');
    btn.textContent = `${i === 0 ? 'Root' : i + ordinalSuffix(i)} · ${PC_TO_SHARP_NAME[bassPc]}`;
    btn.title = `${inversionLabel(i)} — ${chordName(state.rootPc, quality, bassPc)}`;
    btn.addEventListener('click', ()=>{
      state.bassInterval = t.semis;
      state.positionIdx = 0;
      render();
      playCurrentChord();
    });
    container.appendChild(btn);
  });
}

function buildChordGrid(){
  const container = document.getElementById('chordGrid');
  container.innerHTML = '';
  const bassPc = (state.rootPc + state.bassInterval) % 12;
  CHORD_QUALITIES.forEach((q, i)=>{
    const btn = document.createElement('button');
    btn.className = 'chord-btn';
    btn.innerHTML = `<span class="chord-btn-name">${chordName(state.rootPc, q, bassPc)}</span><span class="chord-btn-label">${q.label}</span>`;
    btn.addEventListener('click', ()=>{
      state.qualityIdx = i;
      state.positionIdx = 0;
      render();
      playCurrentChord();
    });
    container.appendChild(btn);
  });
  updateChordGridActive();
}

function updateChordGridActive(){
  document.querySelectorAll('#chordGrid .chord-btn').forEach((btn, i)=>{
    btn.classList.toggle('active', i === state.qualityIdx);
  });
}

function render(){
  const quality = CHORD_QUALITIES[state.qualityIdx];
  const rootLabel = PC_TO_SHARP_NAME[state.rootPc];
  const bass = describeBass(quality);
  const name = chordName(state.rootPc, quality, bass.bassPc);

  document.getElementById('keySelect').value = state.rootPc;
  buildBassSelect(quality);
  buildInversionRow(quality, bass);
  document.getElementById('tuningSelect').value = state.tuningId;

  const tuning = getTuning(state.tuningId);
  const tuningStrings = getTuningStrings(state.tuningId);
  document.getElementById('tuningMeta').textContent =
    `${tuning.label.toUpperCase()} · ${tuningStrings.map(s=>s.label).join(' ')}`;

  document.getElementById('currentPill').textContent = name;
  document.getElementById('diagramTitle').textContent = `Fretboard — ${name}`;
  document.getElementById('listRootLabel').textContent = rootLabel;

  document.getElementById('statChord').textContent = name;
  document.getElementById('statChordName').textContent =
    bass.kind === 'root' ? quality.label : `${quality.label} · ${bassKindLabel(bass)}`;
  document.getElementById('statFormula').textContent =
    quality.degrees.join(' ') + (bass.kind === 'root' ? '' : ` / ${bass.degree}`);

  const voicings = currentVoicings();
  state.positionIdx = Math.min(state.positionIdx, voicings.length - 1);
  const { strings, chosen, bassIdx } = voicings[state.positionIdx];

  buildPositionSelector(voicings);

  const soundingPcs = chosen
    .filter(c => c.fret != null)
    .map(c => ((strings[c.stringIdx].openAbs + c.fret) % 12 + 12) % 12);
  const uniquePcs = [...new Set(soundingPcs)];
  document.getElementById('statNotes').textContent = uniquePcs.map(pc => PC_TO_SHARP_NAME[pc]).join(' ');

  const positiveFrets = chosen.filter(c => c.fret != null && c.fret > 0).map(c => c.fret);
  if(positiveFrets.length === 0){
    document.getElementById('statFrets').textContent = 'Open position';
    document.getElementById('statFretsSub').textContent = 'All open strings';
  } else {
    const lo = Math.min(...positiveFrets), hi = Math.max(...positiveFrets);
    document.getElementById('statFrets').textContent = lo <= 4 ? 'Open position' : `${lo}${ordinalSuffix(lo)} position`;
    document.getElementById('statFretsSub').textContent = `Frets ${lo}–${hi}`;
  }

  buildChordGrid();
  renderAbout(quality, bass);
  renderChordDiagram(strings, chosen, bassIdx);
}

function ordinalSuffix(n){
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return s[(v-20)%10] || s[v] || s[0];
}

function buildPositionSelector(voicings){
  const container = document.getElementById('chordPositionToggles');
  container.innerHTML = '';
  voicings.forEach((v, i)=>{
    const btn = document.createElement('button');
    btn.className = 'chord-pos-btn' + (i === state.positionIdx ? ' active' : '');
    btn.textContent = positionLabel(v);
    btn.addEventListener('click', ()=>{
      state.positionIdx = i;
      render();
      playCurrentChord();
    });
    container.appendChild(btn);
  });
}

function bassAboutText(quality, bass){
  const root = PC_TO_SHARP_NAME[state.rootPc];
  const bassNote = PC_TO_SHARP_NAME[bass.bassPc];
  const name = chordName(state.rootPc, quality, bass.bassPc);
  if(bass.kind === 'inversion'){
    return `<b>${name} — ${inversionLabel(bass.inversion).toLowerCase()}.</b> Same notes as ${chordName(state.rootPc, quality)}, but the ${bass.degree} (${bassNote}) is the lowest note instead of the root. Inversions keep the chord's identity while giving the bass line a smoother path between chords.`;
  }
  return `<b>${name} — slash chord.</b> Read it as “${root}${quality.suffix} over ${bassNote}”: the ${chordName(state.rootPc, quality)} chord with ${bassNote} (the ${bass.degree}) in the bass. Because ${bassNote} isn't a chord tone, it adds color — or works as a passing bass note between chords.`;
}

function renderAbout(quality, bass){
  const el = document.getElementById('aboutText');
  el.innerHTML = `
    <p><b>${quality.label}</b> — ${quality.desc}</p>
    ${bass.kind === 'root' ? '' : `<p>${bassAboutText(quality, bass)}</p>`}
    <div class="genres">${quality.genres.map(g=>`<span class="genre-tag">${g}</span>`).join('')}</div>
  `;
}

/* ===================== Vertical chord diagram (SVG) ===================== */

function renderChordDiagram(strings, chosen, bassIdx){
  const svg = document.getElementById('chordDiagram');
  svg.innerHTML = '';
  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs){
    const e = document.createElementNS(NS, tag);
    for(const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  const fingerMap = assignFingers(chosen);
  const positive = chosen.filter(c => c.fret != null && c.fret > 0).map(c => c.fret);
  const windowStart = (positive.length && Math.min(...positive) > 4) ? Math.min(...positive) : 0;
  let numRows = 4;
  if(positive.length){
    const hi = Math.max(...positive);
    numRows = windowStart > 0 ? (hi - windowStart + 1) : hi;
    numRows = Math.max(4, Math.min(7, numRows));
  }

  const leftPad = 30, rightPad = 20, topPad = 60, rowH = 32;
  const width = 220, boardW = width - leftPad - rightPad;
  const height = topPad + numRows * rowH + 20;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const stringGap = boardW / (strings.length - 1);
  function stringX(i){ return leftPad + i * stringGap; }
  function rowY(r){ return topPad + r * rowH; } // r=0 is the nut/top line

  // starting-fret label if the shape doesn't start at the nut
  if(windowStart > 0){
    const t = el('text', { x:leftPad - 22, y: rowY(0) + rowH/2 + 4, 'text-anchor':'middle', fill:'var(--ink-dim)', 'font-size':12, 'font-weight':700 });
    t.textContent = `${windowStart}fr`;
    svg.appendChild(t);
  }

  // fret lines
  for(let r = 0; r <= numRows; r++){
    const y = rowY(r);
    svg.appendChild(el('line', {
      x1: leftPad, y1:y, x2: leftPad + boardW, y2:y,
      stroke: (r===0 && windowStart===0) ? 'color-mix(in srgb, var(--ink) 70%, transparent)' : 'color-mix(in srgb, var(--ink) 22%, transparent)',
      'stroke-width': (r===0 && windowStart===0) ? 4 : 1.4
    }));
  }
  // string lines
  strings.forEach((s, i)=>{
    svg.appendChild(el('line', {
      x1: stringX(i), y1: rowY(0), x2: stringX(i), y2: rowY(numRows),
      stroke:'color-mix(in srgb, var(--ink) 55%, transparent)', 'stroke-width':1.6
    }));
  });

  // X / O markers + fret-position dots
  strings.forEach((s, i)=>{
    const c = chosen[i];
    const x = stringX(i);
    if(c.fret == null){
      const t = el('text', { x, y: topPad - 16, 'text-anchor':'middle', fill:'var(--ink-faint)', 'font-size':15, 'font-weight':800 });
      t.textContent = 'X';
      svg.appendChild(t);
      return;
    }
    if(c.fret === 0){
      const openPc = ((s.openAbs) % 12 + 12) % 12;
      const isOpenRoot = openPc === ((state.rootPc % 12) + 12) % 12;
      const g = el('g', { class:'fret-dot' });
      if(i === bassIdx){
        g.appendChild(el('circle', {
          cx:x, cy: topPad - 20, r:11, fill:'none',
          stroke:'var(--ink)', 'stroke-width':2
        }));
      }
      const t = el('text', {
        x, y: topPad - 16, 'text-anchor':'middle',
        fill: isOpenRoot ? 'var(--pink)' : 'var(--purple)',
        'font-size':16, 'font-weight':800
      });
      t.textContent = 'O';
      g.appendChild(t);
      g.style.transformOrigin = `${x}px ${topPad - 20}px`;
      g.addEventListener('click', ()=>{
        pulseDot(g);
        playAbsoluteNote(s.openAbs);
      });
      const titleEl = el('title', {});
      titleEl.textContent = `${PC_TO_SHARP_NAME[openPc]} — open string ${i+1}` + (i === bassIdx ? ' (bass)' : '');
      g.appendChild(titleEl);
      svg.appendChild(g);
      return;
    }
    const row = windowStart > 0 ? (c.fret - windowStart) : (c.fret - 1);
    const y = rowY(row) + rowH/2;
    const pc = ((s.openAbs + c.fret) % 12 + 12) % 12;
    const isRoot = pc === ((state.rootPc % 12) + 12) % 12;

    const isBass = i === bassIdx;
    const g = el('g', { class:'fret-dot' });
    const circle = el('circle', {
      cx:x, cy:y, r:13,
      fill: isRoot ? 'var(--pink)' : 'var(--purple)',
      stroke: isBass ? 'var(--ink)' : isRoot ? 'var(--pink)' : 'var(--purple)',
      'stroke-opacity': isBass ? 1 : isRoot ? 0.5 : 0.4,
      'stroke-width': isBass ? 2.5 : isRoot ? 3 : 2
    });
    if(isRoot) circle.style.filter = 'drop-shadow(0 0 5px var(--pink))';
    const text = el('text', { x, y:y+4.5, 'text-anchor':'middle', fill:'var(--bg)', 'font-size':12, 'font-weight':800 });
    text.textContent = fingerMap[i] != null ? fingerMap[i] : PC_TO_SHARP_NAME[pc];
    g.appendChild(circle);
    g.appendChild(text);
    g.style.transformOrigin = `${x}px ${y}px`;
    g.addEventListener('click', ()=>{
      pulseDot(g);
      playAbsoluteNote(s.openAbs + c.fret);
    });
    const titleEl = el('title', {});
    titleEl.textContent = `${PC_TO_SHARP_NAME[pc]} — string ${i+1}, fret ${c.fret}` +
      (fingerMap[i] != null ? `, finger ${fingerMap[i]}` : '') +
      (isBass ? ' (bass)' : '');
    g.appendChild(titleEl);
    svg.appendChild(g);
  });
}

/* ===================== Playback ===================== */

function playCurrentChord(){
  const voicings = currentVoicings();
  const { strings, chosen } = voicings[Math.min(state.positionIdx, voicings.length - 1)];
  const ctx = ensureAudioCtx();
  const now = ctx.currentTime + 0.05;
  let i = 0;
  chosen.forEach(c=>{
    if(c.fret == null) return;
    playAbsoluteNote(strings[c.stringIdx].openAbs + c.fret, now + i * 0.032);
    i++;
  });
}

/* ===================== Init ===================== */

function init(){
  populateSelectors();
  initInstrument();
  initTheme();
  render();

  document.getElementById('playBtn').addEventListener('click', playCurrentChord);
  document.getElementById('randomBtn').addEventListener('click', ()=>{
    state.rootPc = Math.floor(Math.random()*12);
    state.qualityIdx = Math.floor(Math.random()*CHORD_QUALITIES.length);
    state.bassInterval = 0;
    state.positionIdx = 0;
    render();
    playCurrentChord();
  });
  document.getElementById('resetBtn').addEventListener('click', ()=>{
    state.rootPc = 0;
    state.qualityIdx = 0;
    state.bassInterval = 0;
    state.positionIdx = 0;
    render();
  });
}

document.addEventListener('DOMContentLoaded', init);
