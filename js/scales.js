// ========== Scale Practice Module ==========

// === Scale Type Definitions (intervals in semitones from root) ===
var SCALE_TYPES = {
  // 音阶 (Scales)
  major:           { name: '大调',     intervals: [0,2,4,5,7,9,11], icon: '🎼', group: '音阶' },
  natural_minor:   { name: '自然小调', intervals: [0,2,3,5,7,8,10], icon: '🌙', group: '音阶' },
  harmonic_minor:  { name: '和声小调', intervals: [0,2,3,5,7,8,11], icon: '🎻', group: '音阶' },
  melodic_minor:   { name: '旋律小调', intervals: [0,2,3,5,7,9,11], icon: '🎹', group: '音阶' },
  pentatonic_major:{ name: '大调五声', intervals: [0,2,4,7,9],      icon: '🎵', group: '音阶' },
  pentatonic_minor:{ name: '小调五声', intervals: [0,3,5,7,10],     icon: '🎶', group: '音阶' },
  blues:           { name: '布鲁斯',   intervals: [0,3,5,6,7,10],   icon: '🎷', group: '音阶' },
  chromatic:       { name: '半音阶',   intervals: [0,1,2,3,4,5,6,7,8,9,10,11], icon: '🎹', group: '音阶' },
  // 常用调式 (Common Modes)
  dorian:     { name: 'Dorian 小调',   intervals: [0,2,3,5,7,9,10],  icon: '🌿', group: '调式' },
  mixolydian: { name: 'Mixolydian 属', intervals: [0,2,4,5,7,9,10],  icon: '⚡', group: '调式' },
  // 和弦 (Chords)
  major_triad:  { name: '大三和弦', intervals: [0,4,7],    icon: '△', group: '和弦' },
  minor_triad:  { name: '小三和弦', intervals: [0,3,7],    icon: 'm', group: '和弦' },
  dim_triad:    { name: '减三和弦', intervals: [0,3,6],    icon: '°', group: '和弦' },
  aug_triad:    { name: '增三和弦', intervals: [0,4,8],    icon: '+', group: '和弦' },
  major7:       { name: '大七和弦', intervals: [0,4,7,11], icon: '△⁷', group: '和弦' },
  minor7:       { name: '小七和弦', intervals: [0,3,7,10], icon: 'm⁷', group: '和弦' },
  dom7:         { name: '属七和弦', intervals: [0,4,7,10], icon: '⁷', group: '和弦' },
  // 琶音 (Arpeggios)
  major_arp:    { name: '大调琶音', intervals: [0,4,7,12],    icon: '🎼', group: '琶音' },
  minor_arp:    { name: '小调琶音', intervals: [0,3,7,12],    icon: '🎵', group: '琶音' },
  major7_arp:   { name: '大七琶音', intervals: [0,4,7,11,12], icon: '🎶', group: '琶音' },
  minor7_arp:   { name: '小七琶音', intervals: [0,3,7,10,12], icon: '♪', group: '琶音' },
  dom7_arp:     { name: '属七琶音', intervals: [0,4,7,10,12], icon: '♫', group: '琶音' }
};

var ROOT_NOTES = [
  { name: 'C', midi: 60 }, { name: 'C#', midi: 61 }, { name: 'D', midi: 62 },
  { name: 'D#', midi: 63 }, { name: 'E', midi: 64 }, { name: 'F', midi: 65 },
  { name: 'F#', midi: 66 }, { name: 'G', midi: 67 }, { name: 'G#', midi: 68 },
  { name: 'A', midi: 69 }, { name: 'A#', midi: 70 }, { name: 'B', midi: 71 }
];

var SCALE_DEGREE_SOLFEGE = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];

var SCALE_FINGERINGS = {
  'C_major_rh':  [1,2,3,1,2,3,4,5], 'C_major_lh':  [5,4,3,2,1,3,2,1],
  'G_major_rh':  [1,2,3,1,2,3,4,5], 'G_major_lh':  [5,4,3,2,1,3,2,1],
  'D_major_rh':  [1,2,3,1,2,3,4,5], 'D_major_lh':  [5,4,3,2,1,3,2,1],
  'A_major_rh':  [1,2,3,1,2,3,4,5], 'A_major_lh':  [5,4,3,2,1,3,2,1],
  'E_major_rh':  [1,2,3,1,2,3,4,5], 'E_major_lh':  [5,4,3,2,1,3,2,1],
  'F_major_rh':  [1,2,3,4,1,2,3,4,5], 'F_major_lh': [5,4,3,2,1,3,2,1],
  'B_major_rh':  [1,2,3,1,2,3,4,5], 'B_major_lh':  [4,3,2,1,4,3,2,1],
  'Bb_major_rh': [2,1,2,3,1,2,3,4], 'Bb_major_lh': [3,2,1,4,3,2,1,3],
  'Eb_major_rh': [2,1,2,3,4,1,2,3], 'Eb_major_lh': [3,2,1,4,3,2,1,3],
  'Ab_major_rh': [2,3,1,2,3,1,2,3], 'Ab_major_lh': [3,2,1,4,3,2,1,3],
  'Db_major_rh': [2,3,1,2,3,4,1,2], 'Db_major_lh': [3,2,1,4,3,2,1,2],
  'Gb_major_rh': [2,3,4,1,2,3,1,2], 'Gb_major_lh': [4,3,2,1,3,2,1,2]
};

function midiToNoteInfo(midi) {
  var noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  var name = noteNames[midi % 12];
  var octave = Math.floor(midi / 12) - 1;
  var vexKey = name.replace('#','').toLowerCase() + '/' + octave;
  var accidental = name.indexOf('#') >= 0 ? '#' : null;
  return { key: vexKey, name: name.replace('#',''), displayName: name, octave: octave, accidental: accidental, midi: midi };
}

function generateScaleNotes(rootMidi, scaleType, numOctaves) {
  var type = SCALE_TYPES[scaleType];
  if (!type) return [];
  var notes = [];
  for (var oct = 0; oct < numOctaves; oct++) {
    for (var i = 0; i < type.intervals.length; i++) {
      var midi = rootMidi + type.intervals[i] + (oct * 12);
      if (midi > 96) break;
      notes.push(midiToNoteInfo(midi));
    }
  }
  var finalMidi = rootMidi + (numOctaves * 12);
  if (finalMidi <= 96) notes.push(midiToNoteInfo(finalMidi));
  return notes;
}

function getFingering(rootName, scaleType, hand) {
  var key = rootName + '_' + scaleType + '_' + hand;
  if (SCALE_FINGERINGS[key]) return SCALE_FINGERINGS[key];

  // Default fingering patterns based on scale type
  var type = SCALE_TYPES[scaleType];
  if (!type) return null;
  var noteCount = type.intervals.length;

  // Major-like 7-note scales (major, natural minor, harmonic minor, melodic minor, dorian, mixolydian)
  if (noteCount === 7) {
    return hand === 'rh' ? [1,2,3,1,2,3,4,5] : [5,4,3,2,1,3,2,1];
  }
  // Pentatonic (5 notes)
  if (noteCount === 5) {
    return hand === 'rh' ? [1,2,3,4,5] : [5,4,3,2,1];
  }
  // Blues (6 notes)
  if (noteCount === 6) {
    return hand === 'rh' ? [1,2,3,1,2,3] : [5,4,3,2,1,3];
  }
  // Chromatic (12 notes)
  if (noteCount === 12) {
    return hand === 'rh' ? [1,3,1,3,1,2,3,1,3,1,3,1,2] : [3,1,3,1,3,2,1,3,1,3,1,3,2];
  }
  // Triads (3 notes)
  if (noteCount === 3) {
    return hand === 'rh' ? [1,3,5] : [5,3,1];
  }
  // 7th chords (4 notes)
  if (noteCount === 4) {
    return hand === 'rh' ? [1,2,3,5] : [5,3,2,1];
  }
  // Arpeggios (4-5 notes with octave)
  if (scaleType.indexOf('_arp') >= 0) {
    if (noteCount === 4) return hand === 'rh' ? [1,2,3,5] : [5,3,2,1];
    if (noteCount === 5) return hand === 'rh' ? [1,2,3,4,5] : [5,4,3,2,1];
  }

  return null;
}

// === Metronome (Web Audio API lookahead scheduler) ===
var Metronome = (function() {
  function Metronome(audioCtx) {
    this.ctx = audioCtx;
    this.bpm = 120;
    this.timeSignature = { beats: 4, value: 4 };
    this.subdivision = 'quarter';
    this.beatTypes = ['accent', 'normal', 'normal', 'normal'];
    this.isPlaying = false;
    this._nextBeatTime = 0;
    this._currentBeat = 0;
    this._timerID = null;
    this._lookahead = 25;
    this._scheduleAheadTime = 0.1;
    this.onBeat = null;
  }

  Metronome.prototype.getBeatDuration = function() { return 60.0 / this.bpm; };

  // Subdivision patterns: array of time fractions within one beat
  Metronome.prototype.getSubdivisionPattern = function() {
    switch (this.subdivision) {
      case 'quarter':     return [1];
      case 'eighth':      return [0.5, 0.5];
      case 'triplet':     return [1/3, 1/3, 1/3];
      case 'sixteenth':   return [0.25, 0.25, 0.25, 0.25];
      case 'q_e':         return [2/3, 1/3];           // 前四后八
      case 'e_q':         return [1/3, 2/3];           // 前八后四
      case 'e_s':         return [0.5, 0.25, 0.25];    // 前八后十六
      case 's_e':         return [0.25, 0.25, 0.5];    // 前十六后八
      case 'dotted':      return [0.75, 0.25];         // 附点
      case 'rev_dotted':  return [0.25, 0.75];         // 后附点
      case 'syncopation': return [0.25, 0.5, 0.25];   // 切分
      case 'swing':       return [2/3, 1/3];           // Swing (摇摆)
      case 'shuffle':     return [0.65, 0.35];         // Shuffle (拖曳)
      case 'compound_2':  return [1/3, 1/3, 1/3];     // 复合二拍 (6/8 feel)
      case 'compound_3':  return [0.25, 0.25, 0.25, 0.25]; // 复合三拍
      case 'bossa':       return [0.35, 0.3, 0.35];   // Bossa Nova
      case 'tresillo':    return [0.375, 0.375, 0.25]; // Tresillo (3+3+2)
      default:            return [1];
    }
  };

  // Legacy: duration of first subdivision step
  Metronome.prototype.getSubdivisionDuration = function() {
    var pattern = this.getSubdivisionPattern();
    return this.getBeatDuration() * pattern[0];
  };

  Metronome.prototype.setBpm = function(bpm) { this.bpm = Math.max(20, Math.min(300, bpm)); };

  Metronome.prototype.setTimeSig = function(beats) {
    this.timeSignature.beats = beats;
    this.beatTypes = [];
    for (var i = 0; i < beats; i++) this.beatTypes.push(i === 0 ? 'accent' : 'normal');
  };

  Metronome.prototype.toggleBeatType = function(index) {
    var cycle = ['normal', 'accent', 'muted'];
    var cur = cycle.indexOf(this.beatTypes[index] || 'normal');
    this.beatTypes[index] = cycle[(cur + 1) % 3];
  };

  Metronome.prototype.tapTempo = function() {
    var now = performance.now();
    if (!this._tapTimes) this._tapTimes = [];
    this._tapTimes.push(now);
    if (this._tapTimes.length > 6) this._tapTimes.shift();
    if (this._tapTimes.length >= 2) {
      var sum = 0;
      for (var i = 1; i < this._tapTimes.length; i++) sum += (this._tapTimes[i] - this._tapTimes[i-1]);
      var avg = sum / (this._tapTimes.length - 1);
      this.bpm = Math.round(Math.max(20, Math.min(300, 60000 / avg)));
    }
    return this.bpm;
  };

  Metronome.prototype.start = function() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this._currentBeat = 0;
    this._currentStep = 0;
    this._nextBeatTime = this.ctx.currentTime + 0.05;
    this._scheduler();
  };

  Metronome.prototype.stop = function() {
    this.isPlaying = false;
    if (this._timerID) { clearTimeout(this._timerID); this._timerID = null; }
    this._currentBeat = 0;
    this._currentStep = 0;
  };

  Metronome.prototype._scheduler = function() {
    var self = this;
    var pattern = this.getSubdivisionPattern();
    while (this._nextBeatTime < this.ctx.currentTime + this._scheduleAheadTime) {
      var isMainBeat = (this._currentStep === 0);
      this._scheduleBeat(this._currentBeat, this._nextBeatTime, isMainBeat, this._currentStep);
      // Advance to next step in pattern
      var stepDuration = this.getBeatDuration() * pattern[this._currentStep];
      this._currentStep++;
      if (this._currentStep >= pattern.length) {
        this._currentStep = 0;
        this._currentBeat++;
      }
      this._nextBeatTime += stepDuration;
    }
    this._timerID = setTimeout(function() { self._scheduler(); }, this._lookahead);
  };

  Metronome.prototype._scheduleBeat = function(beatIndex, time, isMainBeat, stepIndex) {
    var beatInBar = beatIndex % this.timeSignature.beats;
    var beatType = this.beatTypes[beatInBar] || 'normal';
    if (beatType !== 'muted') {
      if (isMainBeat) {
        this._playClick(time, beatType === 'accent');
      } else {
        // Softer click for subdivision steps
        this._playClick(time, false, 0.4);
      }
    }
    if (this.onBeat) this.onBeat(beatIndex, time, beatType, isMainBeat, stepIndex);
  };

  Metronome.prototype._playClick = function(time, isAccent, volumeMul) {
    var vol = volumeMul || 1;
    var ctx = this.ctx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = isAccent ? 1000 : 800;
    gain.gain.setValueAtTime((isAccent ? 0.3 : 0.15) * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.05);
  };

  return Metronome;
})();

// === Scale Staff Renderer (multi-note) ===
var ScaleStaffRenderer = (function() {
  function ScaleStaffRenderer(containerId) {
    this.container = document.getElementById(containerId);
    this.width = 800;
    this.height = 200;
    this.staffLeft = 60;
    this.staffRight = 770;
    this.staffTop = 70;
    this.lineSpacing = 12;
  }

  ScaleStaffRenderer.prototype.renderScale = function(notes, currentIndex, options) {
    if (!this.container) return;
    var w = this.width, h = this.height;
    var svg = '<svg width="100%" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';
    svg += '<defs>' +
      '<linearGradient id="sNoteGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f0f0ff"/><stop offset="100%" stop-color="#c8c8e0"/></linearGradient>' +
      '<filter id="sGlowActive" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/><feFlood flood-color="#6c63ff" flood-opacity="0.6"/><feComposite in2="blur" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="sGlowCorrect" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/><feFlood flood-color="#4ade80" flood-opacity="0.6"/><feComposite in2="blur" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="sGlowWrong" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/><feFlood flood-color="#f87171" flood-opacity="0.6"/><feComposite in2="blur" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
    '</defs>';
    svg += '<rect width="' + w + '" height="' + h + '" fill="transparent"/>';

    var clef = options.clef || 'treble';
    for (var i = 0; i < 5; i++) {
      var ly = this.staffTop + i * this.lineSpacing;
      svg += '<line x1="' + this.staffLeft + '" y1="' + ly + '" x2="' + this.staffRight + '" y2="' + ly + '" stroke="#8888aa" stroke-width="1.5"/>';
    }

    var clefSymbol = clef === 'treble' ? '𝄞' : '𝄢';
    var clefY = clef === 'treble' ? (this.staffTop + 42) : (this.staffTop + 36);
    svg += '<text x="' + (this.staffLeft + 5) + '" y="' + clefY + '" font-size="48" fill="#aaa" font-family="serif" opacity="0.8">' + clefSymbol + '</text>';

    var noteAreaLeft = this.staffLeft + 70;
    var noteAreaRight = this.staffRight - 20;
    var noteSpacing = notes.length > 1 ? (noteAreaRight - noteAreaLeft) / (notes.length - 1) : 0;
    if (notes.length === 1) noteAreaLeft = (noteAreaLeft + noteAreaRight) / 2;

    for (var n = 0; n < notes.length; n++) {
      var note = notes[n];
      var x = notes.length === 1 ? noteAreaLeft : noteAreaLeft + n * noteSpacing;
      var pos = this._noteToPos(note, clef);
      var y = this._posToY(pos);
      var isActive = (n === currentIndex);
      var isPast = (n < currentIndex);
      var answerState = options.answerStates ? options.answerStates[n] : null;

      var color = isActive ? '#6c63ff' : (answerState === 'correct' ? '#4ade80' : (answerState === 'wrong' ? '#f87171' : (isPast ? '#4ade80' : '#c8c8e0')));
      var fill = isActive ? '#6c63ff' : (answerState === 'correct' ? '#4ade80' : (answerState === 'wrong' ? '#f87171' : (isPast ? 'rgba(74,222,128,0.3)' : 'url(#sNoteGrad)')));
      var filter = isActive ? 'url(#sGlowActive)' : (answerState === 'correct' ? 'url(#sGlowCorrect)' : (answerState === 'wrong' ? 'url(#sGlowWrong)' : ''));
      var opacity = (isPast && !answerState) ? 0.6 : 1;

      // Ledger lines
      var staffBottom = this.staffTop + 4 * this.lineSpacing;
      if (y > staffBottom) {
        for (var ly = staffBottom + this.lineSpacing; ly <= y + 2; ly += this.lineSpacing)
          svg += '<line x1="' + (x-16) + '" y1="' + ly + '" x2="' + (x+16) + '" y2="' + ly + '" stroke="#8888aa" stroke-width="1.5"/>';
      }
      if (y < this.staffTop) {
        for (var ly = this.staffTop - this.lineSpacing; ly >= y - 2; ly -= this.lineSpacing)
          svg += '<line x1="' + (x-16) + '" y1="' + ly + '" x2="' + (x+16) + '" y2="' + ly + '" stroke="#8888aa" stroke-width="1.5"/>';
      }

      svg += '<g opacity="' + opacity + '"' + (filter ? ' filter="' + filter + '"' : '') + '>';
      svg += '<ellipse cx="' + x + '" cy="' + y + '" rx="10" ry="7.5" fill="' + fill + '" stroke="' + color + '" stroke-width="1.2" transform="rotate(-15,' + x + ',' + y + ')"/>';
      var stemUp = y > (this.staffTop + 2 * this.lineSpacing);
      if (stemUp) {
        svg += '<line x1="' + (x+9) + '" y1="' + (y-1) + '" x2="' + (x+9) + '" y2="' + (y-42) + '" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round"/>';
        svg += '<path d="M' + (x+9) + ',' + (y-42) + ' q8,8 2,18" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round"/>';
      } else {
        svg += '<line x1="' + (x-9) + '" y1="' + (y+1) + '" x2="' + (x-9) + '" y2="' + (y+42) + '" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round"/>';
        svg += '<path d="M' + (x-9) + ',' + (y+42) + ' q-8,-8 -2,-18" fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round"/>';
      }
      if (note.accidental) {
        var accS = note.accidental === '#' ? '♯' : '♭';
        svg += '<text x="' + (x-25) + '" y="' + (y+7) + '" font-size="18" fill="' + color + '" font-family="serif">' + accS + '</text>';
      }
      svg += '</g>';

      // Fingering RH (above staff)
      if (options.showFingeringRH && options.fingeringsRH && options.fingeringsRH[n] !== undefined) {
        svg += '<text x="' + x + '" y="' + (this.staffTop - 18) + '" text-anchor="middle" font-size="12" fill="#22d3ee" font-weight="bold">' + options.fingeringsRH[n] + '</text>';
      }
      // Fingering LH (below staff)
      if (options.showFingeringLH && options.fingeringsLH && options.fingeringsLH[n] !== undefined) {
        svg += '<text x="' + x + '" y="' + (this.staffTop + 5 * this.lineSpacing + 22) + '" text-anchor="middle" font-size="12" fill="#f472b6" font-weight="bold">' + options.fingeringsLH[n] + '</text>';
      }
      // Scale degree
      if (options.showDegree && options.degrees) {
        svg += '<text x="' + x + '" y="' + (this.staffTop + 5 * this.lineSpacing + 38) + '" text-anchor="middle" font-size="11" fill="#a78bfa" font-weight="bold">' + options.degrees[n] + '</text>';
      }
      // Solfege
      if (options.showSolfege && options.solfegeArr) {
        svg += '<text x="' + x + '" y="' + (this.staffTop + 5 * this.lineSpacing + 52) + '" text-anchor="middle" font-size="10" fill="#9898b8">' + options.solfegeArr[n] + '</text>';
      }
      // Note name
      if (options.showNoteName) {
        svg += '<text x="' + x + '" y="' + (this.staffTop + 5 * this.lineSpacing + 66) + '" text-anchor="middle" font-size="10" fill="' + color + '" font-weight="600">' + note.displayName + '</text>';
      }
    }

    svg += '</svg>';
    this.container.innerHTML = svg;
  };

  ScaleStaffRenderer.prototype._noteToPos = function(note, clef) {
    var noteOrder = {'C':0,'D':1,'E':2,'F':3,'G':4,'A':5,'B':6};
    var base = noteOrder[note.name] || 0;
    var pos = base + (note.octave - 4) * 7;
    if (clef === 'bass') pos += 12;
    return pos;
  };

  ScaleStaffRenderer.prototype._posToY = function(pos) {
    return this.staffTop + (10 - pos) * (this.lineSpacing / 2);
  };

  return ScaleStaffRenderer;
})();

// === Scale Practice State Machine ===
var ScalePractice = (function() {
  function ScalePractice(appRef) {
    this.app = appRef;
    this.state = 'SETUP';
    this.config = {
      scaleType: 'major', rootNote: 'C', rootMidi: 60, clef: 'treble', octaves: 1,
      mode: 'listen', bpm: 120, timeSigBeats: 4, subdivision: 'quarter',
      showFingeringRH: false, showFingeringLH: false, showSolfege: true, showDegree: true, showNoteName: true,
      adaptiveTempo: false, adaptiveIncrement: 10, adaptivePasses: 3
    };
    this.currentNotes = [];
    this.currentIndex = -1;
    this.metronome = null;
    this.staffRenderer = null;
    this.answerStates = [];
    this.consecutiveCleanPasses = 0;
    this.currentPassCorrect = 0;
    this.currentPassTotal = 0;
    this.sessionStats = { startTime: 0, totalNotes: 0, correctNotes: 0, bpmHistory: [] };
    this._countInMetro = null;
    this._standaloneMetro = null;  // 独立节拍器
    this.practiceRound = 0;  // 练习次数计数
  }

  ScalePractice.prototype.renderSetup = function() {
    this.state = 'SETUP';
    var c = this.config;
    var self = this;

    // Scale type options grouped
    var groups = {};
    var typeKeys = Object.keys(SCALE_TYPES);
    for (var i = 0; i < typeKeys.length; i++) {
      var t = SCALE_TYPES[typeKeys[i]];
      if (!groups[t.group]) groups[t.group] = [];
      groups[t.group].push({ key: typeKeys[i], name: t.name, icon: t.icon });
    }
    var typeOptions = '';
    var groupNames = ['音阶', '调式', '和弦', '琶音'];
    for (var g = 0; g < groupNames.length; g++) {
      var gn = groupNames[g];
      if (!groups[gn]) continue;
      typeOptions += '<optgroup label="' + gn + '">';
      for (var j = 0; j < groups[gn].length; j++) {
        var item = groups[gn][j];
        typeOptions += '<option value="' + item.key + '"' + (item.key === c.scaleType ? ' selected' : '') + '>' + item.icon + ' ' + item.name + '</option>';
      }
      typeOptions += '</optgroup>';
    }

    // Root note options
    var rootOptions = '';
    for (var i = 0; i < ROOT_NOTES.length; i++) {
      rootOptions += '<option value="' + ROOT_NOTES[i].name + '"' + (ROOT_NOTES[i].name === c.rootNote ? ' selected' : '') + '>' + ROOT_NOTES[i].name + '</option>';
    }

    // Time signature options
    var timeSigOptions = '';
    var timeSigs = [[2,'2/4'],[3,'3/4'],[4,'4/4'],[5,'5/4'],[6,'6/8'],[7,'7/8']];
    for (var i = 0; i < timeSigs.length; i++) {
      timeSigOptions += '<option value="' + timeSigs[i][0] + '"' + (timeSigs[i][0] === c.timeSigBeats ? ' selected' : '') + '>' + timeSigs[i][1] + '</option>';
    }

    // Subdivision options
    var subOptions = '';
    var subs = [
      ['quarter','四分音符 ♩'],
      ['eighth','八分音符 ♪♪'],
      ['triplet','三连音 ♪♪♪'],
      ['sixteenth','十六分音符 ♬♬♬♬'],
      ['q_e','前四后八 ♩♪'],
      ['e_q','前八后四 ♪♩'],
      ['e_s','前八后十六 ♪♬♬'],
      ['s_e','前十六后八 ♬♬♪'],
      ['dotted','附点 ♩.♪'],
      ['rev_dotted','后附点 ♪♩.'],
      ['syncopation','切分 ♬♩♬'],
      ['swing','Swing ♩♪'],
      ['shuffle','Shuffle ♪♪'],
      ['compound_2','复合二拍 ♪♪♪'],
      ['bossa','Bossa Nova'],
      ['tresillo','Tresillo 3+3+2']
    ];
    for (var i = 0; i < subs.length; i++) {
      subOptions += '<option value="' + subs[i][0] + '"' + (subs[i][0] === c.subdivision ? ' selected' : '') + '>' + subs[i][1] + '</option>';
    }

    document.getElementById('scaleSetup').innerHTML =
      '<div class="fade-in">' +
        '<div class="page-header"><div><div class="page-title">🎼 音阶跟练</div><div class="page-desc">节拍器驱动的音阶练习，支持指法提示和自适应速度</div></div></div>' +

        '<div class="grid grid-2">' +
          // Scale Selection Card
          '<div class="card">' +
            '<div class="card-header"><span class="card-title">🎵 音阶选择</span></div>' +
            '<div class="setting-row"><div class="setting-label">音阶类型</div><select id="scaleType" class="scale-select" onchange="app.scalePractice.config.scaleType=this.value">' + typeOptions + '</select></div>' +
            '<div class="setting-row"><div class="setting-label">根音</div><select id="rootNote" class="scale-select" onchange="app.scalePractice.setRootNote(this.value)">' + rootOptions + '</select></div>' +
            '<div class="setting-row"><div class="setting-label">谱号</div>' +
              '<div class="diff-cards" style="gap:6px">' +
                '<div class="diff-card' + (c.clef==='treble'?' active':'') + '" onclick="app.scalePractice.setClef(\'treble\')" id="sClefTreble"><div class="diff-level">𝄞</div><div class="diff-name">高音</div></div>' +
                '<div class="diff-card' + (c.clef==='bass'?' active':'') + '" onclick="app.scalePractice.setClef(\'bass\')" id="sClefBass"><div class="diff-level">𝄢</div><div class="diff-name">低音</div></div>' +
              '</div>' +
            '</div>' +
            '<div class="setting-row"><div class="setting-label">音域</div>' +
              '<div class="diff-cards" style="gap:6px">' +
                '<div class="diff-card' + (c.octaves===1?' active':'') + '" onclick="app.scalePractice.setOctaves(1)" id="sOct1"><div class="diff-name">1个八度</div></div>' +
                '<div class="diff-card' + (c.octaves===2?' active':'') + '" onclick="app.scalePractice.setOctaves(2)" id="sOct2"><div class="diff-name">2个八度</div></div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // Metronome Settings Card
          '<div class="card">' +
            '<div class="card-header"><span class="card-title">🥁 节拍器设置</span></div>' +
            '<div class="beat-indicator" id="metroBeatIndicator" style="margin-bottom:10px">' + this._renderBeatIndicatorDots() + '</div>' +
            '<div class="setting-row"><div class="setting-label">BPM</div>' +
              '<div style="display:flex;align-items:center;gap:8px">' +
                '<input type="range" id="bpmSlider" min="20" max="300" value="' + c.bpm + '" class="bpm-slider" oninput="app.scalePractice.setBpm(+this.value)">' +
                '<input type="number" id="bpmInput" min="20" max="300" value="' + c.bpm + '" class="bpm-input" onchange="app.scalePractice.setBpm(+this.value)">' +
                '<button class="btn btn-sm btn-outline" onclick="app.scalePractice.tapTempo()">TAP</button>' +
              '</div>' +
            '</div>' +
            '<div class="setting-row"><div class="setting-label">拍号</div><select id="timeSig" class="scale-select" onchange="app.scalePractice.setTimeSig(+this.value)">' + timeSigOptions + '</select></div>' +
            '<div class="setting-row"><div class="setting-label">细分节拍</div><select id="subdivision" class="scale-select" onchange="app.scalePractice.config.subdivision=this.value">' + subOptions + '</select></div>' +
            '<div class="setting-row"><div class="setting-label">节拍类型</div><div id="beatTypeDots" class="beat-dots">' + this._renderBeatDots() + '</div></div>' +
            '<div style="text-align:center;margin-top:12px">' +
              '<button class="btn btn-sm' + (this._standaloneMetro ? ' btn-danger' : ' btn-primary') + '" id="standaloneMetroBtn" onclick="app.scalePractice.toggleStandaloneMetro()">' +
                (this._standaloneMetro ? '⏹ 停止节拍器' : '▶ 单独使用节拍器') +
              '</button>' +
              '<div style="font-size:0.7rem;color:var(--text3);margin-top:4px">点击可单独使用节拍器，无需开始音阶练习</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="grid grid-2">' +
          // Display Options Card
          '<div class="card">' +
            '<div class="card-header"><span class="card-title">👁️ 显示选项</span></div>' +
            '<div class="setting-row"><div><div class="setting-label">右手(RH)指法</div></div><div class="toggle' + (c.showFingeringRH?' active':'') + '" onclick="app.scalePractice.toggleOpt(\'showFingeringRH\',this)"></div></div>' +
            '<div class="setting-row"><div><div class="setting-label">左手(LH)指法</div></div><div class="toggle' + (c.showFingeringLH?' active':'') + '" onclick="app.scalePractice.toggleOpt(\'showFingeringLH\',this)"></div></div>' +
            '<div class="setting-row"><div><div class="setting-label">音级 (1-7)</div></div><div class="toggle' + (c.showDegree?' active':'') + '" onclick="app.scalePractice.toggleOpt(\'showDegree\',this)"></div></div>' +
            '<div class="setting-row"><div><div class="setting-label">唱名 (Do-Re-Mi)</div></div><div class="toggle' + (c.showSolfege?' active':'') + '" onclick="app.scalePractice.toggleOpt(\'showSolfege\',this)"></div></div>' +
            '<div class="setting-row"><div><div class="setting-label">音名标注</div></div><div class="toggle' + (c.showNoteName?' active':'') + '" onclick="app.scalePractice.toggleOpt(\'showNoteName\',this)"></div></div>' +
          '</div>' +

          // Playback Mode + Adaptive Tempo Card
          '<div class="card">' +
            '<div class="card-header"><span class="card-title">🎮 播放模式</span></div>' +
            '<div class="mode-cards" style="margin-bottom:16px">' +
              '<div class="mode-card' + (c.mode==='listen'?' active':'') + '" id="sModeListen" onclick="app.scalePractice.setMode(\'listen\')"><div class="mode-icon">👂</div><div class="mode-name">听音模式</div><div class="mode-desc">音阶自动播放</div></div>' +
              '<div class="mode-card' + (c.mode==='follow'?' active':'') + '" id="sModeFollow" onclick="app.scalePractice.setMode(\'follow\')"><div class="mode-icon">🎯</div><div class="mode-name">跟练模式</div><div class="mode-desc">节拍器引导，逐音确认</div></div>' +
            '</div>' +
            '<div class="usage-guide">' +
              '<div class="usage-guide-title">📖 使用说明</div>' +
              '<div class="usage-guide-item"><span class="usage-guide-icon">👂</span><div><strong>听音模式</strong>：音阶自动播放，跟随节拍器聆听音阶走向。适合初学者熟悉音阶结构。</div></div>' +
              '<div class="usage-guide-item"><span class="usage-guide-icon">🎯</span><div><strong>跟练模式</strong>：节拍器引导，每个音符需要在应用上点击确认。适合在手机/平板上练习音阶识别。</div></div>' +
              '<div class="usage-guide-item"><span class="usage-guide-icon">🎹</span><div><strong>实体钢琴跟练</strong>：选择听音模式 + 较慢BPM，跟着节拍器在实体钢琴上弹奏。应用播放音高作为参考，您在钢琴上同步弹奏。</div></div>' +
            '</div>' +
            '<div class="setting-row"><div><div class="setting-label">自适应速度</div><div class="setting-desc">连续通过后自动提升BPM</div></div><div class="toggle' + (c.adaptiveTempo?' active':'') + '" onclick="app.scalePractice.toggleOpt(\'adaptiveTempo\',this)"></div></div>' +
            (c.adaptiveTempo ?
              '<div class="setting-row"><div class="setting-label">每次提升</div><div style="display:flex;align-items:center;gap:6px"><input type="number" value="' + c.adaptiveIncrement + '" min="1" max="50" class="bpm-input" onchange="app.scalePractice.config.adaptiveIncrement=+this.value"><span style="font-size:0.8rem;color:var(--text3)">BPM</span></div></div>' +
              '<div class="setting-row"><div class="setting-label">连续通过次数</div><input type="number" value="' + c.adaptivePasses + '" min="1" max="10" class="bpm-input" onchange="app.scalePractice.config.adaptivePasses=+this.value"></div>'
            : '') +
          '</div>' +
        '</div>' +

        '<div style="text-align:center;padding:20px 0">' +
          '<button class="btn btn-primary btn-lg" onclick="app.scalePractice.start()" style="font-size:1.1rem;padding:16px 48px">开始练习</button>' +
        '</div>' +
      '</div>';

    document.getElementById('scalePractice').style.display = 'none';
    document.getElementById('scaleSetup').style.display = 'block';
  };

  ScalePractice.prototype._renderBeatDots = function() {
    var html = '';
    for (var i = 0; i < this.config.timeSigBeats; i++) {
      var bt = this.metronome ? this.metronome.beatTypes[i] : (i === 0 ? 'accent' : 'normal');
      var cls = bt === 'accent' ? 'beat-dot accent' : (bt === 'muted' ? 'beat-dot muted' : 'beat-dot');
      html += '<div class="' + cls + '" onclick="app.scalePractice.toggleBeatType(' + i + ')" title="' + bt + '">' + (i+1) + '</div>';
    }
    return html;
  };

  ScalePractice.prototype.setRootNote = function(name) {
    this.config.rootNote = name;
    for (var i = 0; i < ROOT_NOTES.length; i++) {
      if (ROOT_NOTES[i].name === name) { this.config.rootMidi = ROOT_NOTES[i].midi; break; }
    }
  };

  ScalePractice.prototype.setClef = function(clef) {
    this.config.clef = clef;
    document.getElementById('sClefTreble').classList.toggle('active', clef === 'treble');
    document.getElementById('sClefBass').classList.toggle('active', clef === 'bass');
  };

  ScalePractice.prototype.setOctaves = function(n) {
    this.config.octaves = n;
    document.getElementById('sOct1').classList.toggle('active', n === 1);
    document.getElementById('sOct2').classList.toggle('active', n === 2);
  };

  ScalePractice.prototype.setMode = function(mode) {
    this.config.mode = mode;
    document.getElementById('sModeListen').classList.toggle('active', mode === 'listen');
    document.getElementById('sModeFollow').classList.toggle('active', mode === 'follow');
  };

  ScalePractice.prototype.setBpm = function(bpm) {
    this.config.bpm = Math.max(20, Math.min(300, bpm));
    var slider = document.getElementById('bpmSlider');
    var input = document.getElementById('bpmInput');
    if (slider) slider.value = this.config.bpm;
    if (input) input.value = this.config.bpm;
  };

  ScalePractice.prototype.tapTempo = function() {
    if (!this.metronome) this.metronome = new Metronome(audio.ctx);
    var bpm = this.metronome.tapTempo();
    this.setBpm(bpm);
  };

  ScalePractice.prototype.setTimeSig = function(beats) {
    this.config.timeSigBeats = beats;
    if (this.metronome) this.metronome.setTimeSig(beats);
    var dots = document.getElementById('beatTypeDots');
    if (dots) dots.innerHTML = this._renderBeatDots();
  };

  ScalePractice.prototype.toggleBeatType = function(index) {
    if (!this.metronome) this.metronome = new Metronome(audio.ctx);
    this.metronome.beatTypes = this.metronome.beatTypes || [];
    while (this.metronome.beatTypes.length < this.config.timeSigBeats) this.metronome.beatTypes.push('normal');
    this.metronome.toggleBeatType(index);
    var dots = document.getElementById('beatTypeDots');
    if (dots) dots.innerHTML = this._renderBeatDots();
  };

  ScalePractice.prototype.toggleOpt = function(key, el) {
    this.config[key] = !this.config[key];
    el.classList.toggle('active');
    if (key === 'adaptiveTempo') this.renderSetup();
  };

  // === Standalone Metronome ===
  ScalePractice.prototype.toggleStandaloneMetro = function() {
    if (this._standaloneMetro) {
      this._standaloneMetro.stop();
      this._standaloneMetro = null;
      var btn = document.getElementById('standaloneMetroBtn');
      if (btn) { btn.textContent = '▶ 单独使用节拍器'; btn.className = 'btn btn-sm btn-primary'; }
      // Clear beat indicator
      for (var i = 0; i < this.config.timeSigBeats; i++) {
        var el = document.getElementById('biDot' + i);
        if (el) el.classList.remove('active');
      }
    } else {
      audio.init();
      audio.resume();
      this._standaloneMetro = new Metronome(audio.ctx);
      this._standaloneMetro.bpm = this.config.bpm;
      this._standaloneMetro.setTimeSig(this.config.timeSigBeats);
      this._standaloneMetro.subdivision = this.config.subdivision;
      var self = this;
      this._standaloneMetro.onBeat = function(beatIndex, time, beatType, isMainBeat) {
        if (isMainBeat) {
          var beatInBar = beatIndex % self.config.timeSigBeats;
          for (var i = 0; i < self.config.timeSigBeats; i++) {
            var el = document.getElementById('biDot' + i);
            if (el) el.classList.toggle('active', i === beatInBar);
          }
        }
      };
      this._standaloneMetro.start();
      var btn = document.getElementById('standaloneMetroBtn');
      if (btn) { btn.textContent = '⏹ 停止节拍器'; btn.className = 'btn btn-sm btn-danger'; }
    }
  };

  ScalePractice.prototype.setMetroBpm = function(bpm) {
    this.config.bpm = Math.max(20, Math.min(300, bpm));
    var slider = document.getElementById('metroBpmSlider');
    var display = document.getElementById('metroBpmDisplay');
    var bpmInput = document.getElementById('bpmInput');
    var bpmSlider = document.getElementById('bpmSlider');
    if (slider) slider.value = this.config.bpm;
    if (display) display.textContent = this.config.bpm;
    if (bpmInput) bpmInput.value = this.config.bpm;
    if (bpmSlider) bpmSlider.value = this.config.bpm;
    if (this._standaloneMetro) this._standaloneMetro.setBpm(this.config.bpm);
  };

  ScalePractice.prototype.setMetroTimeSig = function(beats) {
    this.config.timeSigBeats = beats;
    if (this._standaloneMetro) this._standaloneMetro.setTimeSig(beats);
    var dots = document.getElementById('metroBeatDots');
    if (dots) dots.innerHTML = this._renderBeatDots();
    var biDots = document.getElementById('standaloneBeatIndicator');
    if (biDots) biDots.innerHTML = this._renderBeatIndicatorDots();
    // Also update the main settings
    var mainTimeSig = document.getElementById('timeSig');
    if (mainTimeSig) mainTimeSig.value = beats;
  };

  ScalePractice.prototype.setMetroSubdivision = function(sub) {
    this.config.subdivision = sub;
    if (this._standaloneMetro) this._standaloneMetro.subdivision = sub;
    var mainSub = document.getElementById('subdivision');
    if (mainSub) mainSub.value = sub;
  };

  ScalePractice.prototype.metroTapTempo = function() {
    if (!this._standaloneMetro) this._standaloneMetro = new Metronome(audio.ctx);
    var bpm = this._standaloneMetro.tapTempo();
    this.config.bpm = bpm;
    var slider = document.getElementById('metroBpmSlider');
    var display = document.getElementById('metroBpmDisplay');
    var bpmInput = document.getElementById('bpmInput');
    var bpmSlider = document.getElementById('bpmSlider');
    if (slider) slider.value = bpm;
    if (display) display.textContent = bpm;
    if (bpmInput) bpmInput.value = bpm;
    if (bpmSlider) bpmSlider.value = bpm;
  };

  // === Practice Flow ===
  ScalePractice.prototype.start = function() {
    this.currentNotes = generateScaleNotes(this.config.rootMidi, this.config.scaleType, this.config.octaves);
    if (this.currentNotes.length === 0) { showToast('无法生成音阶', 'error'); return; }
    this.currentIndex = -1;
    this.answerStates = new Array(this.currentNotes.length).fill(null);
    this.consecutiveCleanPasses = 0;
    this.currentPassCorrect = 0;
    this.currentPassTotal = 0;
    this.practiceRound++;
    this.sessionStats = { startTime: Date.now(), totalNotes: 0, correctNotes: 0, bpmHistory: [this.config.bpm] };

    document.getElementById('scaleSetup').style.display = 'none';
    document.getElementById('scalePractice').style.display = 'block';

    this._renderPracticeUI();
    this.staffRenderer = new ScaleStaffRenderer('scaleStaffCanvas');
    this._renderStaff(-1);

    audio.init();
    audio.resume();

    this.state = 'COUNT_IN';
    this._startCountIn();
  };

  ScalePractice.prototype._renderPracticeUI = function() {
    var c = this.config;
    var scaleName = SCALE_TYPES[c.scaleType].icon + ' ' + c.rootNote + ' ' + SCALE_TYPES[c.scaleType].name;
    var totalNotes = this.currentNotes.length;

    document.getElementById('scalePractice').innerHTML =
      '<div class="practice-area slide-up">' +
        '<div class="practice-bar">' +
          '<div class="stat-item"><span>音阶</span> <span class="stat-value" style="font-size:0.85rem">' + scaleName + '</span></div>' +
          '<div class="stat-item"><span>BPM</span> <span class="stat-value" id="sBpmDisplay" style="color:var(--warning)">' + c.bpm + '</span></div>' +
          '<div class="stat-item"><span>进度</span> <span class="stat-value" id="sProgressText">0/' + totalNotes + '</span></div>' +
          '<div class="stat-item"><span>第</span> <span class="stat-value" id="sRoundDisplay" style="color:var(--cyan)">' + this.practiceRound + '</span> <span>次</span></div>' +
          '<div class="stat-item combo" id="sAccuracyDisplay" style="display:none"><span>正确率</span> <span class="stat-value">0%</span></div>' +
        '</div>' +

        '<div class="beat-indicator" id="beatIndicator">' + this._renderBeatIndicatorDots() + '</div>' +

        '<div class="score-display" id="scaleScoreDisplay" style="max-width:820px;padding:16px 20px;min-height:200px;flex-direction:column">' +
          '<div id="scaleStaffCanvas" style="width:100%"></div>' +
        '</div>' +

        (c.mode === 'follow' ? '<div class="follow-hint" id="followHint">🎹 点击下方琴键确认音符</div>' : '') +
        '<div class="piano-container" id="scalePianoContainer" style="display:block"><div class="piano" id="scalePianoKeys"></div></div>' +

        '<div style="display:flex;gap:12px;justify-content:center;margin-top:8px">' +
          '<button class="btn btn-outline" id="sPauseBtn" onclick="app.scalePractice.togglePause()" style="display:none">⏸ 暂停</button>' +
          '<button class="btn btn-primary btn-sm" onclick="app.scalePractice.restart()">🔄 再练一遍</button>' +
          '<button class="btn btn-danger btn-sm" onclick="app.scalePractice.stop()">⏹ 停止</button>' +
        '</div>' +
      '</div>';

    this._renderScalePiano(null);
  };

  ScalePractice.prototype._renderBeatIndicatorDots = function() {
    var html = '';
    for (var i = 0; i < this.config.timeSigBeats; i++) {
      html += '<div class="bi-dot" id="biDot' + i + '"></div>';
    }
    return html;
  };

  ScalePractice.prototype._updateBeatIndicator = function(beatInBar) {
    for (var i = 0; i < this.config.timeSigBeats; i++) {
      var el = document.getElementById('biDot' + i);
      if (el) el.classList.toggle('active', i === beatInBar);
    }
  };

  ScalePractice.prototype._startCountIn = function() {
    var self = this;
    var countBeats = this.config.timeSigBeats;
    var beatCount = 0;
    this._countInMetro = new Metronome(audio.ctx);
    this._countInMetro.bpm = this.config.bpm;
    this._countInMetro.setTimeSig(this.config.timeSigBeats);
    this._countInMetro.subdivision = 'quarter';
    this._countInMetro.onBeat = function(beatIndex, time, beatType) {
      self._updateBeatIndicator(beatCount % countBeats);
      beatCount++;
      if (beatCount > countBeats) {
        self._countInMetro.stop();
        self._countInMetro = null;
        self._beginPlayback();
      }
    };
    this._countInMetro.start();
    // Show "准备" text
    var pauseBtn = document.getElementById('sPauseBtn');
    if (pauseBtn) pauseBtn.style.display = 'inline-flex';
  };

  ScalePractice.prototype._beginPlayback = function() {
    this.state = 'PLAYING';
    this.currentIndex = 0;

    this.metronome = new Metronome(audio.ctx);
    this.metronome.bpm = this.config.bpm;
    this.metronome.setTimeSig(this.config.timeSigBeats);
    this.metronome.subdivision = this.config.subdivision;

    var self = this;
    var subPerNote = this._getSubsPerNote();
    var tickCount = 0;

    this.metronome.onBeat = function(beatIndex, time, beatType) {
      self._updateBeatIndicator(beatIndex % self.config.timeSigBeats);
      tickCount++;
      if (self.config.mode === 'listen') {
        if (tickCount % subPerNote === 0) self._advanceNote();
      }
    };

    this.metronome.start();
    this._playCurrentNote();
    this._renderStaff(0);
    this._renderScalePiano(this.currentNotes[0]);
  };

  ScalePractice.prototype._advanceNote = function() {
    if (this.currentIndex < this.currentNotes.length - 1) {
      this.currentIndex++;
      this._playCurrentNote();
      this._renderStaff(this.currentIndex);
      this._renderScalePiano(this.currentNotes[this.currentIndex]);
      this._updateProgress();
    } else {
      this._onScaleComplete();
    }
  };

  ScalePractice.prototype._playCurrentNote = function() {
    var note = this.currentNotes[this.currentIndex];
    if (!note || !audio.enabled) return;
    var freq = getFrequencyForKey(note.key);
    var dur = this.metronome ? this.metronome.getBeatDuration() * 0.9 : 0.5;
    this._scheduledPlayNote(freq, dur);
  };

  ScalePractice.prototype._scheduledPlayNote = function(freq, duration) {
    var ctx = audio.ctx;
    var now = ctx.currentTime;
    var master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.35, now + 0.008);
    master.gain.linearRampToValueAtTime(0.25, now + 0.05);
    master.gain.exponentialRampToValueAtTime(0.12, now + 0.8);
    master.gain.exponentialRampToValueAtTime(0.001, now + duration);
    var h = [{r:1,a:1.0,d:1.0},{r:2,a:0.55,d:0.85},{r:3,a:0.3,d:0.7},{r:4,a:0.12,d:0.55},{r:5,a:0.06,d:0.4}];
    for (var i = 0; i < h.length; i++) {
      var p = h[i];
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * p.r;
      g.gain.setValueAtTime(p.a, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration * p.d);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + duration * p.d + 0.1);
    }
  };

  ScalePractice.prototype._getSubsPerNote = function() {
    // Return number of steps per beat for the current subdivision
    var tempMetro = new Metronome(audio.ctx);
    tempMetro.subdivision = this.config.subdivision;
    return tempMetro.getSubdivisionPattern().length;
  };

  ScalePractice.prototype.submitAnswer = function(noteName) {
    if (this.state !== 'PLAYING' || this.config.mode !== 'follow') return;
    var expected = this.currentNotes[this.currentIndex];
    var correct = (noteName === expected.name);
    this.sessionStats.totalNotes++;
    if (correct) {
      this.sessionStats.correctNotes++;
      this.currentPassCorrect++;
      this.currentPassTotal++;
      audio.playCorrect();
      this.answerStates[this.currentIndex] = 'correct';
    } else {
      this.currentPassTotal++;
      audio.playWrong();
      this.answerStates[this.currentIndex] = 'wrong';
    }
    this._renderStaff(this.currentIndex);
    this._updateProgress();
    var self = this;
    setTimeout(function() { self._advanceNote(); }, correct ? 200 : 600);
  };

  ScalePractice.prototype._onScaleComplete = function() {
    if (this.config.mode === 'follow' && this.config.adaptiveTempo) {
      if (this.currentPassCorrect === this.currentPassTotal) {
        this.consecutiveCleanPasses++;
        if (this.consecutiveCleanPasses >= this.config.adaptivePasses) {
          this.config.bpm = Math.min(300, this.config.bpm + this.config.adaptiveIncrement);
          this.consecutiveCleanPasses = 0;
          this.sessionStats.bpmHistory.push(this.config.bpm);
          showToast('BPM 提升至 ' + this.config.bpm + '!', 'success');
          var bpmEl = document.getElementById('sBpmDisplay');
          if (bpmEl) bpmEl.textContent = this.config.bpm;
        }
      } else {
        this.consecutiveCleanPasses = 0;
      }
      this.currentPassCorrect = 0;
      this.currentPassTotal = 0;
    }
    if (this.metronome) { this.metronome.stop(); this.metronome = null; }
    this._recordSession();
    this.state = 'RESULTS';
    this._renderResults();
  };

  ScalePractice.prototype.togglePause = function() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      if (this.metronome) this.metronome.stop();
      var btn = document.getElementById('sPauseBtn');
      if (btn) btn.textContent = '▶ 继续';
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      if (this.metronome) this.metronome.start();
      var btn = document.getElementById('sPauseBtn');
      if (btn) btn.textContent = '⏸ 暂停';
    }
  };

  ScalePractice.prototype.restart = function() {
    // Stop current practice and start a new one
    if (this._countInMetro) { this._countInMetro.stop(); this._countInMetro = null; }
    if (this.metronome) { this.metronome.stop(); this.metronome = null; }
    try { if (this.sessionStats.startTime > 0) this._recordSession(); } catch(e) { console.warn('recordSession error:', e); }
    // Reset state and start fresh
    this.state = 'SETUP';
    this.currentIndex = -1;
    this.currentNotes = [];
    this.answerStates = [];
    this.start();
  };

  ScalePractice.prototype.stop = function() {
    if (this._countInMetro) { this._countInMetro.stop(); this._countInMetro = null; }
    if (this.metronome) { this.metronome.stop(); this.metronome = null; }
    if (this.sessionStats.startTime > 0) this._recordSession();
    this.renderSetup();
  };

  ScalePractice.prototype._updateProgress = function() {
    var el = document.getElementById('sProgressText');
    if (el) el.textContent = (this.currentIndex + 1) + '/' + this.currentNotes.length;
    if (this.config.mode === 'follow' && this.sessionStats.totalNotes > 0) {
      var accEl = document.getElementById('sAccuracyDisplay');
      if (accEl) {
        accEl.style.display = 'flex';
        accEl.querySelector('.stat-value').textContent = Math.round((this.sessionStats.correctNotes / this.sessionStats.totalNotes) * 100) + '%';
      }
    }
  };

  ScalePractice.prototype._renderStaff = function(currentIdx) {
    if (!this.staffRenderer) return;
    var c = this.config;
    var scaleLen = SCALE_TYPES[c.scaleType].intervals.length;
    var degrees = [], solfegeArr = [];
    for (var i = 0; i < this.currentNotes.length; i++) {
      degrees.push((i % scaleLen) + 1);
      solfegeArr.push(SCALE_DEGREE_SOLFEGE[i % scaleLen]);
    }
    var rhFing = getFingering(c.rootNote, c.scaleType, 'rh');
    var lhFing = getFingering(c.rootNote, c.scaleType, 'lh');
    // Repeat fingerings for multi-octave
    if (rhFing && this.currentNotes.length > rhFing.length) {
      var repeated = [];
      while (repeated.length < this.currentNotes.length) repeated = repeated.concat(rhFing);
      rhFing = repeated;
    }
    if (lhFing && this.currentNotes.length > lhFing.length) {
      var repeated = [];
      while (repeated.length < this.currentNotes.length) repeated = repeated.concat(lhFing);
      lhFing = repeated;
    }
    this.staffRenderer.renderScale(this.currentNotes, currentIdx, {
      clef: c.clef,
      showFingeringRH: c.showFingeringRH,
      showFingeringLH: c.showFingeringLH,
      showSolfege: c.showSolfege,
      showDegree: c.showDegree,
      showNoteName: c.showNoteName,
      fingeringsRH: rhFing,
      fingeringsLH: lhFing,
      degrees: degrees,
      solfegeArr: solfegeArr,
      answerStates: this.answerStates
    });
  };

  ScalePractice.prototype._renderScalePiano = function(note) {
    var container = document.getElementById('scalePianoKeys');
    if (!container) return;

    // Calculate MIDI range from scale notes, extend by 4 white keys each side
    var noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    var whiteNoteNames = ['C','D','E','F','G','A','B'];
    var blackNotePattern = [1,1,0,1,1,1,0]; // 1=black key after this white key

    var scaleMidiMin = 999, scaleMidiMax = 0;
    if (this.currentNotes.length > 0) {
      for (var i = 0; i < this.currentNotes.length; i++) {
        var m = this.currentNotes[i].midi;
        if (m < scaleMidiMin) scaleMidiMin = m;
        if (m > scaleMidiMax) scaleMidiMax = m;
      }
    } else {
      scaleMidiMin = this.config.rootMidi;
      scaleMidiMax = this.config.rootMidi + 12;
    }

    // Extend by 4 white keys (approx 7 semitones) each side
    var startMidi = Math.max(24, scaleMidiMin - 7); // C1 minimum
    var endMidi = Math.min(96, scaleMidiMax + 7);    // C7 maximum

    // Snap to C boundaries
    var startOctave = Math.floor(startMidi / 12) - 1;
    var startNoteIdx = startMidi % 12;
    var endOctave = Math.floor(endMidi / 12) - 1;

    // Build white key list
    var whiteKeys = [];
    for (var oct = startOctave; oct <= endOctave + 1; oct++) {
      for (var wi = 0; wi < 7; wi++) {
        var midi = (oct + 1) * 12 + [0,2,4,5,7,9,11][wi];
        if (midi < startMidi - 2) continue;
        if (midi > endMidi + 2) break;
        whiteKeys.push({ name: whiteNoteNames[wi], octave: oct, midi: midi });
      }
      if (oct > endOctave) break;
    }

    var keyWidth = 36;
    var totalWidth = whiteKeys.length * keyWidth;
    container.style.width = totalWidth + 'px';
    container.style.margin = '0 auto';
    container.innerHTML = '';

    // Render white keys
    for (var i = 0; i < whiteKeys.length; i++) {
      var wk = whiteKeys[i];
      var key = document.createElement('div');
      key.className = 'white-key';
      key.style.left = (i * keyWidth) + 'px';
      if (note && note.name === wk.name && note.octave === wk.octave) key.classList.add('active');
      var label = document.createElement('span');
      label.className = 'key-label';
      label.textContent = wk.name + wk.octave;
      if (wk.name === 'C' && wk.octave === 4) { label.style.color = '#6c63ff'; label.style.fontWeight = 'bold'; key.style.borderLeft = '2px solid #6c63ff'; }
      key.appendChild(label);
      var self = this;
      key.addEventListener('click', (function(wk) { return function() {
        var entry = PIANO_NOTES[wk.name + wk.octave];
        if (entry) audio.playNote(entry.freq, 1.5);
        if (self.state === 'PLAYING' && self.config.mode === 'follow') {
          self.submitAnswer(wk.name);
        }
      }; })(wk));
      container.appendChild(key);
    }

    // Render black keys
    for (var i = 0; i < whiteKeys.length - 1; i++) {
      var wk = whiteKeys[i];
      var noteIdx = ['C','D','E','F','G','A','B'].indexOf(wk.name);
      if (blackNotePattern[noteIdx]) {
        var bk = document.createElement('div');
        bk.className = 'black-key';
        bk.style.left = ((i + 0.6) * keyWidth) + 'px';
        var blackName = wk.name + '#';
        var blackOctave = wk.octave;
        var self2 = this;
        bk.addEventListener('click', (function(blackName, blackOctave) { return function(e) { e.stopPropagation(); var entry = PIANO_NOTES[blackName + blackOctave]; if (entry) audio.playNote(entry.freq, 1.5); if (self2.state === 'PLAYING' && self2.config.mode === 'follow') { self2.submitAnswer(blackName.replace('#','')); } }; })(blackName, blackOctave));
        container.appendChild(bk);
      }
    }
  };

  ScalePractice.prototype._renderResults = function() {
    var ss = this.sessionStats;
    var duration = Date.now() - ss.startTime;
    var accuracy = ss.totalNotes > 0 ? Math.round((ss.correctNotes / ss.totalNotes) * 100) : 0;
    var maxBpm = Math.max.apply(null, ss.bpmHistory);
    var scaleName = SCALE_TYPES[this.config.scaleType].icon + ' ' + this.config.rootNote + ' ' + SCALE_TYPES[this.config.scaleType].name;
    var icon = accuracy >= 90 ? '🎉' : accuracy >= 70 ? '👍' : '💪';
    var title = accuracy >= 90 ? '完美演奏！' : accuracy >= 70 ? '做得不错！' : '继续练习！';

    document.getElementById('scalePractice').innerHTML =
      '<div class="results-panel fade-in">' +
        '<div class="result-icon">' + icon + '</div>' +
        '<div class="result-title">' + title + '</div>' +
        '<div class="result-subtitle">' + scaleName + ' · ' + (this.config.mode === 'listen' ? '听音模式' : '跟练模式') + '</div>' +
        '<div class="results-grid">' +
          '<div class="result-stat"><div class="result-stat-value" style="color:var(--success)">' + accuracy + '%</div><div class="result-stat-label">正确率</div></div>' +
          '<div class="result-stat"><div class="result-stat-value" style="color:var(--warning)">' + maxBpm + '</div><div class="result-stat-label">最高BPM</div></div>' +
          '<div class="result-stat"><div class="result-stat-value" style="color:var(--info)">' + Math.round(duration/1000) + 's</div><div class="result-stat-label">用时</div></div>' +
          '<div class="result-stat"><div class="result-stat-value" style="color:var(--cyan)">' + this.practiceRound + '</div><div class="result-stat-label">练习次数</div></div>' +
        '</div>' +
        (ss.bpmHistory.length > 1 ?
          '<div class="card" style="text-align:left;max-width:400px;margin:0 auto 20px"><div class="card-title" style="margin-bottom:8px">BPM 变化</div>' +
          '<div style="display:flex;gap:4px;flex-wrap:wrap">' + ss.bpmHistory.map(function(b) { return '<span class="badge badge-primary">' + b + '</span>'; }).join(' → ') + '</div></div>'
        : '') +
        '<div style="display:flex;gap:12px;justify-content:center;margin-top:24px">' +
          '<button class="btn btn-primary btn-lg" onclick="app.scalePractice.start()">再来一次</button>' +
          '<button class="btn btn-outline btn-lg" onclick="app.scalePractice.renderSetup()">返回设置</button>' +
        '</div>' +
      '</div>';

    this.state = 'SETUP';
  };

  ScalePractice.prototype._recordSession = function() {
    var ss = this.sessionStats;
    var duration = Date.now() - ss.startTime;
    var accuracy = ss.totalNotes > 0 ? Math.round((ss.correctNotes / ss.totalNotes) * 100) : 0;
    if (typeof stats !== 'undefined' && stats.recordScaleSession) {
      stats.recordScaleSession({
        scaleType: this.config.scaleType, rootNote: this.config.rootNote,
        mode: this.config.mode, bpm: this.config.bpm,
        bpmHistory: ss.bpmHistory, totalNotes: ss.totalNotes,
        correctNotes: ss.correctNotes, accuracy: accuracy, duration: duration
      });
    }
  };

  return ScalePractice;
})();
