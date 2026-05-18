// ========== Score Renderer (Pure SVG, no dependencies) ==========

class ScoreRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentNote = null;
    this.width = 420;
    this.height = 180;
  }

  init(width, height) {
    this.width = width || 420;
    this.height = height || 180;
    this.container.innerHTML = '';
  }

  // Note name+octave → staff position
  // Both clefs use same y range: top line y=60(pos=10), bottom line y=108(pos=2)
  // Treble: F5=10(top), E4=2(bottom), C4=0(middle C below)
  // Bass:   A3=10(top), G2=2(bottom)
  noteToPosition(note) {
    var noteOrder = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };
    var base = noteOrder[note.name] || 0;
    var octaveOffset = (note.octave - 4) * 7;
    var pos = base + octaveOffset;
    if (note.clef === 'bass') pos += 12; // G2=2(1st line), A3=10(top line)
    return pos;
  }

  // Position → y coordinate on staff
  positionToY(pos) {
    // Staff lines for treble: E4(2), G4(4), B4(6), D5(8), F5(10) → y positions
    // Middle C (pos=0) is below the staff on treble
    // Each step = 6px (half a line spacing)
    var staffTop = 60;      // y of the top line (line 5)
    var lineSpacing = 12;   // pixels between lines
    var topLinePos = 10;    // F5 is at position 10 (top line of treble staff)
    var y = staffTop + (topLinePos - pos) * (lineSpacing / 2);
    return y;
  }

  renderEmptyStaff(clef) {
    var w = this.width;
    var h = this.height;
    var clefSymbol = clef === 'treble' ? '𝄞' : '𝄢';

    var svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';
    svg += '<rect width="' + w + '" height="' + h + '" fill="transparent"/>';

    var staffLeft = 60;
    var staffRight = w - 30;
    var staffTop = 60;
    var lineSpacing = 12;
    for (var i = 0; i < 5; i++) {
      var ly = staffTop + i * lineSpacing;
      svg += '<line x1="' + staffLeft + '" y1="' + ly + '" x2="' + staffRight + '" y2="' + ly + '" stroke="#8888aa" stroke-width="1.5"/>';
    }

    var clefY = clef === 'treble' ? (staffTop + 42) : (staffTop + 36);
    svg += '<text x="' + (staffLeft + 5) + '" y="' + clefY + '" font-size="48" fill="#aaa" font-family="serif">' + clefSymbol + '</text>';

    // Question mark in the center
    svg += '<text x="' + (w / 2 + 20) + '" y="' + (staffTop + 40) + '" text-anchor="middle" font-size="32" fill="#555570" font-weight="bold">?</text>';

    svg += '<text x="' + (staffRight - 4) + '" y="' + (h - 10) + '" text-anchor="end" font-size="11" fill="#666680">' + (clef === 'treble' ? '高音谱' : '低音谱') + '</text>';
    svg += '</svg>';

    this.container.innerHTML = svg;
  }

  renderNote(note) {
    this.currentNote = note;
    var w = this.width;
    var h = this.height;
    var pos = this.noteToPosition(note);
    var noteY = this.positionToY(pos);
    var clefSymbol = note.clef === 'treble' ? '𝄞' : '𝄢';
    var acc = note.accidental || '';
    var noteColor = '#e8e8f0'; // Neutral color, no hint

    // Build SVG
    var svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';
    svg += '<rect width="' + w + '" height="' + h + '" fill="transparent"/>';

    // Staff lines (5 lines)
    var staffLeft = 60;
    var staffRight = w - 30;
    var staffTop = 60;
    var lineSpacing = 12;
    for (var i = 0; i < 5; i++) {
      var ly = staffTop + i * lineSpacing;
      svg += '<line x1="' + staffLeft + '" y1="' + ly + '" x2="' + staffRight + '" y2="' + ly + '" stroke="#8888aa" stroke-width="1.5"/>';
    }

    // Clef symbol — position differs for treble vs bass
    var clefY = note.clef === 'treble' ? (staffTop + 42) : (staffTop + 36);
    svg += '<text x="' + (staffLeft + 5) + '" y="' + clefY + '" font-size="48" fill="#aaa" font-family="serif">' + clefSymbol + '</text>';

    // Ledger lines if needed
    var staffBottom = staffTop + 4 * lineSpacing;
    var noteX = w / 2 + 20;

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

    // Note head (neutral white fill)
    svg += '<ellipse cx="' + noteX + '" cy="' + noteY + '" rx="9" ry="7" fill="' + noteColor + '" stroke="' + noteColor + '" stroke-width="1.5" transform="rotate(-15,' + noteX + ',' + noteY + ')"/>';

    // Stem
    var stemUp = noteY > (staffTop + 2 * lineSpacing);
    if (stemUp) {
      svg += '<line x1="' + (noteX + 8) + '" y1="' + noteY + '" x2="' + (noteX + 8) + '" y2="' + (noteY - 40) + '" stroke="' + noteColor + '" stroke-width="1.5"/>';
    } else {
      svg += '<line x1="' + (noteX - 8) + '" y1="' + noteY + '" x2="' + (noteX - 8) + '" y2="' + (noteY + 40) + '" stroke="' + noteColor + '" stroke-width="1.5"/>';
    }

    // Accidental symbol (no note name)
    if (acc) {
      var accSymbol = acc === '#' ? '♯' : '♭';
      svg += '<text x="' + (noteX - 26) + '" y="' + (noteY + 6) + '" font-size="18" fill="' + noteColor + '" font-weight="bold">' + accSymbol + '</text>';
    }

    // Clef label only
    svg += '<text x="' + (staffRight - 4) + '" y="' + (h - 10) + '" text-anchor="end" font-size="11" fill="#666680">' + (note.clef === 'treble' ? '高音谱' : '低音谱') + '</text>';

    svg += '</svg>';
    this.container.innerHTML = svg;
  }

  clear() {
    if (this.container) this.container.innerHTML = '';
  }
}
