/* ===================== Shared music/audio/settings engine =====================
   Used by both index.html (Guitar Modes) and chords.html (Chord Explorer) so
   the two pages stay in sync on theme, instrument, and tuning choices. */

const NOTE_TO_PC = {
  C:0, 'B#':0,
  'C#':1, Db:1,
  D:2,
  'D#':3, Eb:3,
  E:4, Fb:4,
  F:5, 'E#':5,
  'F#':6, Gb:6,
  G:7,
  'G#':8, Ab:8,
  A:9,
  'A#':10, Bb:10,
  B:11, Cb:11
};

// pc uses this app's convention: 0=C, 1=C#/Db, ... 11=B
const PC_TO_SAMPLE_NAME = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const PC_TO_SHARP_NAME  = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// Root selector options -> canonical pitch class + display label
const KEY_OPTIONS = [
  {pc:0,  label:'C'},
  {pc:1,  label:'C# / Db'},
  {pc:2,  label:'D'},
  {pc:3,  label:'D# / Eb'},
  {pc:4,  label:'E'},
  {pc:5,  label:'F'},
  {pc:6,  label:'F# / Gb'},
  {pc:7,  label:'G'},
  {pc:8,  label:'G# / Ab'},
  {pc:9,  label:'A'},
  {pc:10, label:'A# / Bb'},
  {pc:11, label:'B'}
];

/* ---------- Tuning ---------- */

// Standard-E open strings (low to high, top of diagram to bottom), given as
// absolute semitones from C0 (scientific pitch notation: E2=28, A2=33, D3=38,
// G3=43, B3=47, E4=52) so real playback octave is always correct. Alternate
// tunings are this same shape transposed by a fixed number of semitones.
const BASE_STRINGS = [
  { openAbs:28, high:false }, // E2
  { openAbs:33, high:false }, // A2
  { openAbs:38, high:false }, // D3
  { openAbs:43, high:false }, // G3
  { openAbs:47, high:false }, // B3
  { openAbs:52, high:true  }  // E4
];

// Bass layouts (low to high), same absolute-semitone convention as above:
// 4-string = E1 A1 D2 G2, 5-string adds a low B0. Keyed by string count.
const BASS_STRING_LAYOUTS = {
  4: [
    { openAbs:16, high:false }, // E1
    { openAbs:21, high:false }, // A1
    { openAbs:26, high:false }, // D2
    { openAbs:31, high:false }  // G2
  ],
  5: [
    { openAbs:11, high:false }, // B0
    { openAbs:16, high:false }, // E1
    { openAbs:21, high:false }, // A1
    { openAbs:26, high:false }, // D2
    { openAbs:31, high:false }  // G2
  ]
};
const BASS_STRING_COUNTS = [4, 5];
const BASS_STRINGS_KEY = 'guitar-modes-bass-strings';

const TUNINGS = [
  { id:'e',  label:'Standard E', shift:0  },
  { id:'eb', label:'Eb (Half-Step Down)', shift:-1 },
  { id:'d',  label:'Standard D (Whole-Step Down)', shift:-2 }
];

const TUNING_KEY = 'guitar-modes-tuning';

function getTuning(tuningId){
  return TUNINGS.find(t => t.id === tuningId) || TUNINGS[0];
}

function getTuningStrings(tuningId, baseStrings = BASE_STRINGS){
  const { shift } = getTuning(tuningId);
  return baseStrings.map(s=>{
    const openAbs = s.openAbs + shift;
    const pc = ((openAbs % 12) + 12) % 12;
    let label = PC_TO_SAMPLE_NAME[pc];
    if(s.high) label = label.charAt(0).toLowerCase() + label.slice(1);
    return { pc, label, openAbs };
  });
}

function getSavedTuningId(){
  const saved = localStorage.getItem(TUNING_KEY);
  return TUNINGS.some(t => t.id === saved) ? saved : 'e';
}

function saveTuningId(id){
  localStorage.setItem(TUNING_KEY, id);
}

function getSavedBassStringCount(){
  const saved = parseInt(localStorage.getItem(BASS_STRINGS_KEY), 10);
  return BASS_STRING_COUNTS.includes(saved) ? saved : 4;
}

function saveBassStringCount(n){
  localStorage.setItem(BASS_STRINGS_KEY, String(n));
}

/* ===================== Audio — real sampled instruments =====================
   Uses the FluidR3_GM General MIDI sample set (the same open, MIT-licensed
   sample pack that chords-explorer.me and countless web music tools use).
   Each instrument is a per-note MP3 sample, lazy-loaded and decoded on first
   use, then cached. Samples are bundled in ./soundfonts so the site works
   offline / on a LAN with no internet; the public host is only a fallback. */

const SOUNDFONT_BASES = [
  'soundfonts/',
  'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/'
];

const INSTRUMENTS = [
  { id:'guitar',  label:'Guitar',   sf:'acoustic_guitar_steel' },
  { id:'piano',   label:'Piano',    sf:'acoustic_grand_piano' },
  { id:'epiano',  label:'E-Piano',  sf:'electric_piano_1' },
  { id:'eguitar', label:'E-Guitar', sf:'electric_guitar_clean' }
];
// Bass page instruments (bundled the same way as the guitar-page ones).
const BASS_INSTRUMENTS = [
  { id:'bass',    label:'Bass (Finger)',   sf:'electric_bass_finger' },
  { id:'upright', label:'Upright Bass',    sf:'acoustic_bass' },
  { id:'piano',   label:'Piano',           sf:'acoustic_grand_piano' }
];

// which list / storage slot the selector and instrumentSf() use; the bass
// page swaps these in via initInstrument(BASS_INSTRUMENTS, ...)
let activeInstruments = INSTRUMENTS;

// Octave that scale degrees / single notes are played in (bass sits lower).
let referenceOctave = 4;

function instrumentSf(id){
  return (activeInstruments.find(i => i.id === id) || activeInstruments[0]).sf;
}

let audioCtx = null;
function ensureAudioCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// semitoneFromRoot / baseOctave can extend past one octave (stacked chord tones) — that's fine.
function sampleKeyFor(rootPc, semitoneFromRoot, baseOctave){
  const abs = rootPc + semitoneFromRoot + baseOctave * 12;
  const octave = Math.floor(abs / 12);
  const pc = ((abs % 12) + 12) % 12;
  return `${PC_TO_SAMPLE_NAME[pc]}${octave}`;
}

const soundfontPromises = {};   // sf name -> Promise<{noteKey: dataURI}>
const bufferPromises = {};      // "sf:noteKey" -> Promise<AudioBuffer>
let pendingLoads = 0;

function setInstrumentLoading(loading){
  pendingLoads += loading ? 1 : -1;
  const el = document.getElementById('instrumentStatus');
  if(!el) return;
  if(pendingLoads > 0){
    el.textContent = 'Loading instrument…';
    el.classList.add('visible');
  } else {
    pendingLoads = 0;
    el.classList.remove('visible');
  }
}

function loadSoundfont(sf){
  if(!soundfontPromises[sf]){
    const tryBase = (i)=> new Promise((resolve, reject)=>{
      const script = document.createElement('script');
      script.src = `${SOUNDFONT_BASES[i]}${sf}-mp3.js`;
      script.onload = ()=>{
        const bank = window.MIDI && window.MIDI.Soundfont && window.MIDI.Soundfont[sf];
        if(bank) resolve(bank); else reject(new Error(`Soundfont "${sf}" missing after load`));
      };
      script.onerror = ()=>{
        script.remove();
        reject(new Error(`Failed to load soundfont "${sf}" from ${SOUNDFONT_BASES[i]}`));
      };
      document.head.appendChild(script);
    });
    soundfontPromises[sf] = SOUNDFONT_BASES.slice(1).reduce(
      (p, _, k)=> p.catch(()=> tryBase(k + 1)),
      tryBase(0)
    ).catch(err=>{
      delete soundfontPromises[sf];   // allow a retry on the next tap
      throw err;
    });
  }
  return soundfontPromises[sf];
}

async function getNoteBuffer(ctx, sf, noteKey){
  const cacheKey = `${sf}:${noteKey}`;
  if(!bufferPromises[cacheKey]){
    bufferPromises[cacheKey] = (async ()=>{
      const bank = await loadSoundfont(sf);
      const dataUri = bank[noteKey];
      if(!dataUri) throw new Error(`No sample for ${noteKey} in ${sf}`);
      const arrayBuffer = await (await fetch(dataUri)).arrayBuffer();
      return ctx.decodeAudioData(arrayBuffer);
    })();
    bufferPromises[cacheKey].catch(()=>{ delete bufferPromises[cacheKey]; });
  }
  return bufferPromises[cacheKey];
}

async function loadBuffersFor(ctx, sf, noteKeys){
  const isNew = noteKeys.some(k => !bufferPromises[`${sf}:${k}`]);
  if(isNew) setInstrumentLoading(true);
  try{
    return await Promise.all(noteKeys.map(k => getNoteBuffer(ctx, sf, k)));
  } finally {
    if(isNew) setInstrumentLoading(false);
  }
}

// gain envelope: hold, then exponential fade — shapes real samples so
// back-to-back scale runs stay clear and chords ring out naturally.
function scheduleBuffer(ctx, buffer, destination, when, { gain=0.9, holdSec=0.5, fadeSec=1.0 } = {}){
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, when);
  g.gain.setValueAtTime(gain, when + holdSec);
  g.gain.exponentialRampToValueAtTime(0.0005, when + holdSec + fadeSec);
  src.connect(g).connect(destination);
  src.start(when);
  src.stop(when + holdSec + fadeSec + 0.1);
}

async function playSingleNote(rootPc, semitoneFromRoot, when){
  const ctx = ensureAudioCtx();
  const sf = instrumentSf(state.instrumentId);
  const key = sampleKeyFor(rootPc, semitoneFromRoot, referenceOctave);

  let buffer;
  try{ [buffer] = await loadBuffersFor(ctx, sf, [key]); }
  catch(e){ console.warn('Instrument load failed', e); return; }

  const startAt = when != null ? when : ctx.currentTime;
  scheduleBuffer(ctx, buffer, ctx.destination, startAt, { gain:0.9, holdSec:0.9, fadeSec:1.6 });
}

// Plays the real physical pitch of a fretboard position (absolute semitones
// from C0 — see BASE_STRINGS), unlike playSingleNote which plays a scale
// degree at a fixed reference octave.
async function playAbsoluteNote(absoluteSemitone, when){
  const ctx = ensureAudioCtx();
  const sf = instrumentSf(state.instrumentId);
  const octave = Math.floor(absoluteSemitone / 12);
  const pc = ((absoluteSemitone % 12) + 12) % 12;
  const key = `${PC_TO_SAMPLE_NAME[pc]}${octave}`;

  let buffer;
  try{ [buffer] = await loadBuffersFor(ctx, sf, [key]); }
  catch(e){ console.warn('Instrument load failed', e); return; }

  const startAt = when != null ? when : ctx.currentTime;
  scheduleBuffer(ctx, buffer, ctx.destination, startAt, { gain:0.9, holdSec:0.9, fadeSec:1.6 });
}

/* ===================== Instrument selector ===================== */

const INSTRUMENT_KEY = 'guitar-modes-instrument';
const BASS_INSTRUMENT_KEY = 'guitar-modes-bass-instrument';
let instrumentStorageKey = INSTRUMENT_KEY;

function setInstrument(id){
  state.instrumentId = id;
  localStorage.setItem(instrumentStorageKey, id);
  document.getElementById('instrumentSelect').value = id;
}

function initInstrument(list = INSTRUMENTS, storageKey = INSTRUMENT_KEY){
  activeInstruments = list;
  instrumentStorageKey = storageKey;

  const saved = localStorage.getItem(instrumentStorageKey);
  state.instrumentId = list.some(i => i.id === saved) ? saved : list[0].id;

  const select = document.getElementById('instrumentSelect');
  list.forEach(instr=>{
    const opt = document.createElement('option');
    opt.value = instr.id;
    opt.textContent = instr.label;
    select.appendChild(opt);
  });
  select.value = state.instrumentId;
  select.addEventListener('change', e=> setInstrument(e.target.value));
}

/* ===================== Theme switcher ===================== */

const THEME_KEY = 'guitar-modes-theme';

function applyTheme(theme){
  if(theme === 'default'){
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  document.querySelectorAll('.theme-option').forEach(opt=>{
    opt.classList.toggle('active', opt.dataset.theme === theme);
  });
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme(){
  const saved = localStorage.getItem(THEME_KEY) || 'default';
  applyTheme(saved);

  const toggle = document.getElementById('themeToggle');
  const panel = document.getElementById('themePanel');

  toggle.addEventListener('click', (e)=>{
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  document.querySelectorAll('.theme-option').forEach(opt=>{
    opt.addEventListener('click', ()=>{
      applyTheme(opt.dataset.theme);
      panel.classList.remove('open');
    });
  });

  document.addEventListener('click', (e)=>{
    if(!panel.contains(e.target) && e.target !== toggle){
      panel.classList.remove('open');
    }
  });
}

/* ===================== Small UI feedback helpers ===================== */

function pulseDot(g){
  g.style.transition = 'transform .35s cubic-bezier(.34,1.56,.64,1)';
  g.style.transform = 'scale(1.35)';
  setTimeout(()=>{ g.style.transform = ''; }, 160);
}
