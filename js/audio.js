// ========== Audio Module — Multiple Sound Presets ==========

class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.preset = 'warm'; // default preset
    this.presets = {
      warm:   { name: '温暖钢琴', icon: '🎹' },
      bright: { name: '明亮钢琴', icon: '✨' },
      electric: { name: '电钢琴', icon: '⚡' },
      organ:  { name: '管风琴', icon: '🎵' },
    };
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setPreset(name) {
    if (this.presets[name]) this.preset = name;
  }

  // Main playNote — dispatches to preset
  playNote(freq, duration) {
    if (!this.enabled) return;
    duration = duration || 2.0;
    this.init();
    this.resume();

    switch (this.preset) {
      case 'warm':     this._playWarm(freq, duration); break;
      case 'bright':   this._playBright(freq, duration); break;
      case 'electric': this._playElectric(freq, duration); break;
      case 'organ':    this._playOrgan(freq, duration); break;
      default:         this._playWarm(freq, duration);
    }
  }

  // === Warm Piano — soft, round, natural ===
  _playWarm(freq, dur) {
    var ctx = this.ctx;
    var now = ctx.currentTime;

    var master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.35, now + 0.008);
    master.gain.linearRampToValueAtTime(0.25, now + 0.05);
    master.gain.exponentialRampToValueAtTime(0.12, now + 0.8);
    master.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // Warm harmonics — strong fundamentals, gentle upper
    var h = [
      { r:1, a:1.0,  d:1.0 },
      { r:2, a:0.55, d:0.85 },
      { r:3, a:0.3,  d:0.7 },
      { r:4, a:0.12, d:0.55 },
      { r:5, a:0.06, d:0.4 },
      { r:6, a:0.03, d:0.3 },
    ];
    h.forEach(function(p) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * p.r;
      g.gain.setValueAtTime(p.a, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur * p.d);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + dur * p.d + 0.1);
    });

    // Soft hammer
    this._addNoise(ctx, master, now, 0.006, 0.08, 1500);
  }

  // === Bright Piano — clear, present, sparkling ===
  _playBright(freq, dur) {
    var ctx = this.ctx;
    var now = ctx.currentTime;

    var master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.32, now + 0.005);
    master.gain.linearRampToValueAtTime(0.22, now + 0.03);
    master.gain.exponentialRampToValueAtTime(0.1, now + 0.6);
    master.gain.exponentialRampToValueAtTime(0.001, now + dur);

    var h = [
      { r:1, a:1.0,  d:1.0 },
      { r:2, a:0.6,  d:0.9 },
      { r:3, a:0.4,  d:0.75 },
      { r:4, a:0.2,  d:0.6 },
      { r:5, a:0.18, d:0.5 },
      { r:6, a:0.1,  d:0.4 },
      { r:7, a:0.08, d:0.3 },
      { r:8, a:0.05, d:0.25 },
    ];
    h.forEach(function(p) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * p.r * (1 + 0.0002 * p.r);
      g.gain.setValueAtTime(p.a, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur * p.d);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + dur * p.d + 0.1);
    });

    // Bright attack ping
    var ping = ctx.createOscillator();
    var pg = ctx.createGain();
    ping.type = 'sine';
    ping.frequency.value = freq * 4;
    pg.gain.setValueAtTime(0.1, now);
    pg.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    ping.connect(pg);
    pg.connect(master);
    ping.start(now);
    ping.stop(now + 0.03);

    this._addNoise(ctx, master, now, 0.005, 0.12, 2500);
  }

  // === Electric Piano — Rhodes-like, warm + bell ===
  _playElectric(freq, dur) {
    var ctx = this.ctx;
    var now = ctx.currentTime;

    var master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.3, now + 0.005);
    master.gain.exponentialRampToValueAtTime(0.15, now + 0.5);
    master.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // Sinusoidal with bell-like upper partials
    var h = [
      { r:1, a:1.0, d:1.0 },
      { r:2, a:0.3, d:0.8 },
      { r:3, a:0.5, d:0.6 },  // Strong 3rd for Rhodes character
      { r:4, a:0.1, d:0.5 },
      { r:6, a:0.2, d:0.3 },  // Bell partial
    ];
    h.forEach(function(p) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * p.r;
      g.gain.setValueAtTime(p.a, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur * p.d);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + dur * p.d + 0.1);
    });

    // Tine click
    var tine = ctx.createOscillator();
    var tg = ctx.createGain();
    tine.type = 'triangle';
    tine.frequency.value = freq * 8;
    tg.gain.setValueAtTime(0.08, now);
    tg.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    tine.connect(tg);
    tg.connect(master);
    tine.start(now);
    tine.stop(now + 0.02);
  }

  // === Organ — sustained, warm, church-like ===
  _playOrgan(freq, dur) {
    var ctx = this.ctx;
    var now = ctx.currentTime;

    var master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.2, now + 0.05);
    master.gain.setValueAtTime(0.2, now + 0.05);
    master.gain.setValueAtTime(0.2, now + dur - 0.1);
    master.gain.linearRampToValueAtTime(0, now + dur);

    // Organ drawbars
    var h = [
      { r:0.5, a:0.4 },  // Sub
      { r:1,   a:1.0 },  // Fundamental
      { r:2,   a:0.6 },  // Octave
      { r:3,   a:0.3 },  // Twelfth
      { r:4,   a:0.4 },  // Double
      { r:5,   a:0.15 },
      { r:6,   a:0.2 },
      { r:8,   a:0.1 },
    ];
    h.forEach(function(p) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * p.r;
      g.gain.setValueAtTime(p.a, now);
      g.gain.setValueAtTime(p.a, now + dur - 0.1);
      g.gain.linearRampToValueAtTime(0, now + dur);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + dur + 0.1);
    });
  }

  // Helper: add filtered noise transient
  _addNoise(ctx, dest, now, attack, vol, hpFreq) {
    var len = 0.03;
    var buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * attack));
    }
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var g = ctx.createGain();
    var hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = hpFreq;
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + len);
    src.connect(hp);
    hp.connect(g);
    g.connect(dest);
    src.start(now);
  }

  // === Feedback Sounds ===
  playCorrect() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    var ctx = this.ctx;
    var now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach(function(f, i) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      var t = now + i * 0.06;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    var ctx = this.ctx;
    var now = ctx.currentTime;
    [190, 200].forEach(function(f) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.06, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  playCombo(count) {
    if (!this.enabled) return;
    this.init();
    this.resume();
    var ctx = this.ctx;
    var now = ctx.currentTime;
    var base = 700 + count * 10;
    for (var i = 0; i < 4; i++) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = base + i * 130;
      var t = now + i * 0.04;
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  playFanfare() {
    if (!this.enabled) return;
    this.init();
    this.resume();
    var ctx = this.ctx;
    var now = ctx.currentTime;
    [523.25, 587.33, 659.25, 783.99, 880, 1046.5].forEach(function(f, i) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      var t = now + i * 0.08;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.1, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }
}

var audio = new AudioManager();
