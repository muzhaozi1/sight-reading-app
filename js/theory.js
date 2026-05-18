// ========== Music Theory Constants & Utilities ==========

const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NOTE_COLORS = {
  C: '#ef4444', D: '#fb923c', E: '#facc15', F: '#4ade80',
  G: '#22d3ee', A: '#60a5fa', B: '#a78bfa'
};

// Solfège names (fixed-do system)
const SOLFEGE = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Ti' };

// Piano key position names for reference
const PIANO_KEY_NAMES = {
  C: 'C键', D: 'D键', E: 'E键', F: 'F键',
  G: 'G键', A: 'A键', B: 'B键'
};

// Treble clef note positions (line/position → note name + octave)
// VexFlow: line 3 = middle C (C4), line 5 = first ledger line above = E5
// For treble clef: line 3 = B4, space above = C5
// Actually in VexFlow, keys are specified as "c/4", "d/4" etc.
// We generate random notes within a range

const TREBLE_NOTES = [
  { key: 'c/4', name: 'C', octave: 4, position: 'low' },   // Middle C (ledger line below)
  { key: 'd/4', name: 'D', octave: 4, position: 'low' },
  { key: 'e/4', name: 'E', octave: 4, position: 'low' },    // First line
  { key: 'f/4', name: 'F', octave: 4, position: 'low' },
  { key: 'g/4', name: 'G', octave: 4, position: 'mid' },    // Second line
  { key: 'a/4', name: 'A', octave: 4, position: 'mid' },
  { key: 'b/4', name: 'B', octave: 4, position: 'mid' },    // Third line (B)
  { key: 'c/5', name: 'C', octave: 5, position: 'mid' },
  { key: 'd/5', name: 'D', octave: 5, position: 'mid' },    // Fourth line
  { key: 'e/5', name: 'E', octave: 5, position: 'high' },
  { key: 'f/5', name: 'F', octave: 5, position: 'high' },   // Fifth line
  { key: 'g/5', name: 'G', octave: 5, position: 'high' },
  { key: 'a/5', name: 'A', octave: 5, position: 'high' },
  { key: 'b/5', name: 'B', octave: 5, position: 'high' },
  { key: 'c/6', name: 'C', octave: 6, position: 'high' },
];

const BASS_NOTES = [
  { key: 'e/2', name: 'E', octave: 2, position: 'low' },
  { key: 'f/2', name: 'F', octave: 2, position: 'low' },
  { key: 'g/2', name: 'G', octave: 2, position: 'low' },    // First line below
  { key: 'a/2', name: 'A', octave: 2, position: 'low' },
  { key: 'b/2', name: 'B', octave: 2, position: 'low' },
  { key: 'c/3', name: 'C', octave: 3, position: 'low' },    // Second line
  { key: 'd/3', name: 'D', octave: 3, position: 'low' },
  { key: 'e/3', name: 'E', octave: 3, position: 'mid' },    // Third line
  { key: 'f/3', name: 'F', octave: 3, position: 'mid' },
  { key: 'g/3', name: 'G', octave: 3, position: 'mid' },    // Fourth line
  { key: 'a/3', name: 'A', octave: 3, position: 'mid' },
  { key: 'b/3', name: 'B', octave: 3, position: 'mid' },    // Fifth line (B)
  { key: 'c/4', name: 'C', octave: 4, position: 'high' },   // Middle C (ledger line above)
  { key: 'd/4', name: 'D', octave: 4, position: 'high' },
  { key: 'e/4', name: 'E', octave: 4, position: 'high' },
];

// Difficulty levels define which notes are included
const DIFFICULTY_LEVELS = [
  {
    level: 1,
    name: '初识',
    desc: '中央C附近',
    trebleRange: [3, 7],    // E4-B4
    bassRange: [6, 10],     // E3-B3
    useSharps: false,
    useFlats: false,
    timeLimit: 8000,        // 8 seconds
    notesCount: 5
  },
  {
    level: 2,
    name: '入门',
    desc: '基本音域',
    trebleRange: [0, 10],   // C4-D5
    bassRange: [4, 12],     // C3-D4
    useSharps: false,
    useFlats: false,
    timeLimit: 5000,
    notesCount: 5
  },
  {
    level: 3,
    name: '进阶',
    desc: '扩展音域',
    trebleRange: [0, 12],   // C4-F5
    bassRange: [2, 14],     // G2-E4
    useSharps: true,
    useFlats: true,
    timeLimit: 3000,
    notesCount: 5
  },
  {
    level: 4,
    name: '高级',
    desc: '全音域',
    trebleRange: [0, 14],   // All treble
    bassRange: [0, 14],     // All bass
    useSharps: true,
    useFlats: true,
    timeLimit: 2000,
    notesCount: 5
  },
  {
    level: 5,
    name: '大师',
    desc: '快速双谱切换',
    trebleRange: [0, 14],
    bassRange: [0, 14],
    useSharps: true,
    useFlats: true,
    timeLimit: 1500,
    notesCount: 5
  }
];

// Piano key frequencies (for audio playback)
const PIANO_NOTES = {};
(() => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  for (let octave = 0; octave <= 8; octave++) {
    for (let i = 0; i < 12; i++) {
      const name = noteNames[i] + octave;
      const midi = octave * 12 + i + 12;
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      PIANO_NOTES[name] = { freq, midi, name: noteNames[i], octave };
    }
  }
})();

// Get frequency for a VexFlow key like "c/4"
function getFrequencyForKey(vexKey) {
  const [note, octave] = vexKey.split('/');
  const lookup = note.toUpperCase() + (note.includes('#') ? '' : '') + octave;
  const entry = PIANO_NOTES[lookup];
  return entry ? entry.freq : 440;
}

// Utility: random item from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Utility: random integer in range [min, max]
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random note for practice
function generateRandomNote(difficulty, clef) {
  const level = DIFFICULTY_LEVELS[difficulty - 1];
  const isTreble = clef === 'treble' || (clef === 'random' && Math.random() > 0.5);
  const notes = isTreble ? TREBLE_NOTES : BASS_NOTES;
  const range = isTreble ? level.trebleRange : level.bassRange;

  let note = notes[randomInt(range[0], range[1])];

  // Optionally add sharp or flat
  let displayKey = note.key;
  let displayName = note.name;
  let accidental = null;

  if (level.useSharps && Math.random() > 0.7) {
    accidental = '#';
    displayName = note.name + '#';
    // For VexFlow, sharps use the key notation
    displayKey = note.key; // VexFlow handles accidentals via modifier
  } else if (level.useFlats && Math.random() > 0.7) {
    accidental = 'b';
    displayName = note.name + 'b';
    displayKey = note.key;
  }

  return {
    key: displayKey,
    name: note.name, // Base note name for answer (C, D, E, etc.)
    displayName: displayName,
    octave: note.octave,
    clef: isTreble ? 'treble' : 'bass',
    accidental: accidental,
    position: note.position
  };
}
