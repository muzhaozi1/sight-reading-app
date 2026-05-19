// ========== Score Renderer (Pure SVG, Enhanced) ==========

class ScoreRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentNote = null;
    this.width = 420;
    this.height = 180;
    this._animId = 0;
  }

  init(width, height) {
    this.width = width || 420;
    this.height = height || 180;
    this.container.innerHTML = '';
  }

  // Note name+octave → staff position
  noteToPosition(note) {
    var noteOrder = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };
    var base = noteOrder[note.name] || 0;
    var octaveOffset = (note.octave - 4) * 7;
    var pos = base + octaveOffset;
    if (note.clef === 'bass') pos += 12;
    return pos;
  }

  // Position → y coordinate on staff
  positionToY(pos) {
    var staffTop = 60;
    var lineSpacing = 12;
    var topLinePos = 10;
    return staffTop + (topLinePos - pos) * (lineSpacing / 2);
  }

  _svgDefs() {
    return '<defs>' +
      // Note gradient (neutral)
      '<linearGradient id="noteGrad" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#f0f0ff"/>' +
        '<stop offset="100%" stop-color="#c8c8e0"/>' +
      '</linearGradient>' +
      // Correct glow
      '<filter id="glowCorrect" x="-50%" y="-50%" width="200%" height="200%">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>' +
        '<feFlood flood-color="#4ade80" flood-opacity="0.6"/>' +
        '<feComposite in2="blur" operator="in"/>' +
        '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      // Wrong glow
      '<filter id="glowWrong" x="-50%" y="-50%" width="200%" height="200%">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>' +
        '<feFlood flood-color="#f87171" flood-opacity="0.6"/>' +
        '<feComposite in2="blur" operator="in"/>' +
        '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      // Note shadow
      '<filter id="noteShadow" x="-20%" y="-20%" width="140%" height="140%">' +
        '<feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>' +
      '</filter>' +
      // Staff line gradient
      '<linearGradient id="staffLineGrad" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0%" stop-color="#8888aa" stop-opacity="0.3"/>' +
        '<stop offset="10%" stop-color="#8888aa" stop-opacity="1"/>' +
        '<stop offset="90%" stop-color="#8888aa" stop-opacity="1"/>' +
        '<stop offset="100%" stop-color="#8888aa" stop-opacity="0.3"/>' +
      '</linearGradient>' +
    '</defs>';
  }

  renderEmptyStaff(clef) {
    var w = this.width;
    var h = this.height;
    var clefSymbol = clef === 'treble' ? '𝄞' : '𝄢';
    var staffLeft = 60;
    var staffRight = w - 30;
    var staffTop = 60;
    var lineSpacing = 12;

    var svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';
    svg += this._svgDefs();
    svg += '<rect width="' + w + '" height="' + h + '" fill="transparent"/>';

    // Staff lines with gradient
    for (var i = 0; i < 5; i++) {
      var ly = staffTop + i * lineSpacing;
      svg += '<line x1="' + staffLeft + '" y1="' + ly + '" x2="' + staffRight + '" y2="' + ly + '" stroke="url(#staffLineGrad)" stroke-width="1.5"/>';
    }

    // Clef symbol
    var clefY = clef === 'treble' ? (staffTop + 42) : (staffTop + 36);
    svg += '<text x="' + (staffLeft + 5) + '" y="' + clefY + '" font-size="48" fill="#aaa" font-family="serif" opacity="0.8">' + clefSymbol + '</text>';

    // Animated question mark
    svg += '<g class="score-pulse">' +
      '<text x="' + (w / 2 + 20) + '" y="' + (staffTop + 44) + '" text-anchor="middle" font-size="36" fill="#555570" font-weight="bold" opacity="0.6">?</text>' +
    '</g>';

    // Clef label
    svg += '<text x="' + (staffRight - 4) + '" y="' + (h - 10) + '" text-anchor="end" font-size="11" fill="#666680" font-style="italic">' +
      (clef === 'treble' ? '高音谱号' : '低音谱号') + '</text>';
    svg += '</svg>';

    this.container.innerHTML = svg;
  }

  renderNote(note, state) {
    this.currentNote = note;
    this._animId++;
    var animId = this._animId;
    var w = this.width;
    var h = this.height;
    var pos = this.noteToPosition(note);
    var noteY = this.positionToY(pos);
    var clefSymbol = note.clef === 'treble' ? '𝄞' : '𝄢';
    var acc = note.accidental || '';

    // Color based on state
    var noteColor = '#e8e8f0';
    var noteFill = 'url(#noteGrad)';
    var filter = 'url(#noteShadow)';
    var glowClass = '';

    if (state === 'correct') {
      noteColor = '#4ade80';
      noteFill = '#4ade80';
      filter = 'url(#glowCorrect)';
      glowClass = 'correct';
    } else if (state === 'wrong') {
      noteColor = '#f87171';
      noteFill = '#f87171';
      filter = 'url(#glowWrong)';
      glowClass = 'wrong';
    }

    var staffLeft = 60;
    var staffRight = w - 30;
    var staffTop = 60;
    var lineSpacing = 12;
    var noteX = w / 2 + 20;

    var svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';
    svg += this._svgDefs();
    svg += '<rect width="' + w + '" height="' + h + '" fill="transparent"/>';

    // Staff lines
    for (var i = 0; i < 5; i++) {
      var ly = staffTop + i * lineSpacing;
      svg += '<line x1="' + staffLeft + '" y1="' + ly + '" x2="' + staffRight + '" y2="' + ly + '" stroke="url(#staffLineGrad)" stroke-width="1.5"/>';
    }

    // Clef
    var clefY = note.clef === 'treble' ? (staffTop + 42) : (staffTop + 36);
    svg += '<text x="' + (staffLeft + 5) + '" y="' + clefY + '" font-size="48" fill="#aaa" font-family="serif" opacity="0.8">' + clefSymbol + '</text>';

    // Time signature
    svg += '<text x="' + (staffLeft + 55) + '" y="' + (staffTop + 20) + '" font-size="20" fill="#8888aa" font-weight="bold" font-family="serif">4</text>';
    svg += '<text x="' + (staffLeft + 55) + '" y="' + (staffTop + 44) + '" font-size="20" fill="#8888aa" font-weight="bold" font-family="serif">4</text>';

    // Ledger lines
    var staffBottom = staffTop + 4 * lineSpacing;
    if (noteY > staffBottom) {
      for (var ly = staffBottom + lineSpacing; ly <= noteY + 2; ly += lineSpacing) {
        svg += '<line x1="' + (noteX - 16) + '" y1="' + ly + '" x2="' + (noteX + 16) + '" y2="' + ly + '" stroke="#8888aa" stroke-width="1.5"/>';
      }
    }
    if (noteY < staffTop) {
      for (var ly = staffTop - lineSpacing; ly >= noteY - 2; ly -= lineSpacing) {
        svg += '<line x1="' + (noteX - 16) + '" y1="' + ly + '" x2="' + (noteX + 16) + '" y2="' + ly + '" stroke="#8888aa" stroke-width="1.5"/>';
      }
    }

    // Note group with animation
    var animClass = state ? '' : 'note-appear';
    svg += '<g class="' + animClass + '" filter="' + filter + '">';

    // Note head (proper filled ellipse with rotation)
    svg += '<ellipse cx="' + noteX + '" cy="' + noteY + '" rx="10" ry="7.5" fill="' + noteFill + '" stroke="' + noteColor + '" stroke-width="1.2" transform="rotate(-15,' + noteX + ',' + noteY + ')"/>';

    // Inner highlight for 3D effect
    if (!state) {
      svg += '<ellipse cx="' + (noteX - 2) + '" cy="' + (noteY - 2) + '" rx="4" ry="3" fill="rgba(255,255,255,0.15)" transform="rotate(-15,' + noteX + ',' + noteY + ')"/>';
    }

    // Stem
    var stemUp = noteY > (staffTop + 2 * lineSpacing);
    if (stemUp) {
      svg += '<line x1="' + (noteX + 9) + '" y1="' + (noteY - 1) + '" x2="' + (noteX + 9) + '" y2="' + (noteY - 42) + '" stroke="' + noteColor + '" stroke-width="1.8" stroke-linecap="round"/>';
    } else {
      svg += '<line x1="' + (noteX - 9) + '" y1="' + (noteY + 1) + '" x2="' + (noteX - 9) + '" y2="' + (noteY + 42) + '" stroke="' + noteColor + '" stroke-width="1.8" stroke-linecap="round"/>';
    }

    // Flag for eighth note feel (decorative)
    if (stemUp) {
      svg += '<path d="M' + (noteX + 9) + ',' + (noteY - 42) + ' q8,8 2,18" fill="none" stroke="' + noteColor + '" stroke-width="1.5" stroke-linecap="round"/>';
    } else {
      svg += '<path d="M' + (noteX - 9) + ',' + (noteY + 42) + ' q-8,-8 -2,-18" fill="none" stroke="' + noteColor + '" stroke-width="1.5" stroke-linecap="round"/>';
    }

    // Accidental
    if (acc) {
      var accSymbol = acc === '#' ? '♯' : '♭';
      svg += '<text x="' + (noteX - 28) + '" y="' + (noteY + 7) + '" font-size="20" fill="' + noteColor + '" font-weight="bold" font-family="serif">' + accSymbol + '</text>';
    }

    svg += '</g>';

    // Correct/wrong indicator
    if (state === 'correct') {
      svg += '<g class="result-indicator">' +
        '<circle cx="' + noteX + '" cy="' + noteY + '" r="20" fill="none" stroke="#4ade80" stroke-width="2" opacity="0.5"/>' +
        '<text x="' + (noteX + 28) + '" y="' + (noteY + 5) + '" font-size="16" fill="#4ade80" font-weight="bold">✓</text>' +
      '</g>';
    } else if (state === 'wrong') {
      svg += '<g class="result-indicator">' +
        '<circle cx="' + noteX + '" cy="' + noteY + '" r="20" fill="none" stroke="#f87171" stroke-width="2" opacity="0.5"/>' +
        '<text x="' + (noteX + 28) + '" y="' + (noteY + 5) + '" font-size="16" fill="#f87171" font-weight="bold">✗</text>' +
      '</g>';
    }

    // Clef label
    svg += '<text x="' + (staffRight - 4) + '" y="' + (h - 10) + '" text-anchor="end" font-size="11" fill="#666680" font-style="italic">' +
      (note.clef === 'treble' ? '高音谱号' : '低音谱号') + '</text>';

    svg += '</svg>';
    this.container.innerHTML = svg;
  }

  highlightResult(correct) {
    if (!this.currentNote) return;
    this.renderNote(this.currentNote, correct ? 'correct' : 'wrong');
  }

  clear() {
    if (this.container) this.container.innerHTML = '';
  }
}
