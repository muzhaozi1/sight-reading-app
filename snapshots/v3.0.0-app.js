
// ========== Main Application ==========
var APP_VERSION = '3.0.0';

class App {
  constructor() {
    this.currentPage = 'home';
    this.practiceState = null;
    this.renderer = null;
    this.settings = { sound: true, timeLimit: true, showSolfege: false, showPiano: false };
    this.selectedMode = 'flash';
    this.selectedDifficulty = 1;
    this.selectedClef = 'treble';
    this._planConfigs = [];
    this.scalePractice = null;
    this._bound = false;

    // Load saved settings
    try {
      const s = localStorage.getItem('sr_settings');
      if (s) Object.assign(this.settings, JSON.parse(s));
    } catch(e) {}
  }

  saveSettings() {
    try { localStorage.setItem('sr_settings', JSON.stringify(this.settings)); } catch(e) {}
  }

  init() {
    this.bindEvents();
    this.showPage('home');
    audio.enabled = this.settings.sound;
    // Load saved theme
    try {
      var savedTheme = localStorage.getItem('sr_theme');
      if (savedTheme) this.setTheme(savedTheme);
    } catch(e) {}
  }

  // ===== Event Binding (delegation) =====
  bindEvents() {
    if (this._bound) return;
    this._bound = true;
    var self = this;

    // Sidebar navigation
    document.querySelectorAll('.nav-item[data-page]').forEach(function(el) {
      el.addEventListener('click', function() { self.showPage(el.dataset.page); });
    });

    // Mobile menu
    var menuBtn = document.getElementById('mobileMenuBtn');
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    if (menuBtn) menuBtn.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
    if (overlay) overlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
    // Close sidebar on nav item click (mobile)
    document.querySelectorAll('.nav-item[data-page]').forEach(function(el) {
      el.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        }
      });
    });

    // Click handling uses inline onclick on buttons

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.currentPage !== 'practice' || !this.practiceState || this.practiceState.answered) return;
      if (this.practiceState.mode === 'chord_build') return;
      var keyMap = { '1':'C','2':'D','3':'E','4':'F','5':'G','6':'A','7':'B',
                     'c':'C','d':'D','e':'E','f':'F','g':'G','a':'A','b':'B' };
      var note = keyMap[e.key.toLowerCase()];
      if (note) { e.preventDefault(); this.submitAnswer(note); }
    });

    // Stop standalone metronome when tab becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.currentPage === 'scale' && this.scalePractice && this.scalePractice._standaloneMetro) {
        this.scalePractice._standaloneMetro.stop();
        this.scalePractice._standaloneMetro = null;
        showToast('节拍器已自动停止（离开页面）', 'info');
      }
    });
  }

  showPage(page) {
    // Stop scale practice metronome when leaving scale page
    if (this.currentPage === 'scale' && this.scalePractice) {
      if (this.scalePractice._countInMetro) { this.scalePractice._countInMetro.stop(); this.scalePractice._countInMetro = null; }
      if (this.scalePractice.metronome) { this.scalePractice.metronome.stop(); this.scalePractice.metronome = null; }
      if (this.scalePractice._standaloneMetro) { this.scalePractice._standaloneMetro.stop(); this.scalePractice._standaloneMetro = null; }
    }

    this.currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    var pageEl = document.getElementById('page-' + page);
    var navEl = document.querySelector('.nav-item[data-page="' + page + '"]');
    if (pageEl) pageEl.classList.add('active');
    if (navEl) navEl.classList.add('active');

    try {
      switch(page) {
        case 'home': this.renderHome(); break;
        case 'practice': this.renderPracticeSetup(); break;
        case 'stats': this.renderStats(); break;
        case 'plan': this.renderPlan(); break;
        case 'achievements': this.renderAchievements(); break;
        case 'scale': this.renderScalePage(); break;
      }
    } catch(e) {
      console.error('Render error:', page, e);
      var el = document.getElementById(page + 'Content') || document.getElementById('practiceSetup');
      if (el) el.innerHTML = '<div class="card" style="color:#f87171;padding:30px">渲染出错: ' + e.message + '</div>';
    }
  }

  // ===== HOME PAGE =====
  renderHome() {
    var levelInfo = stats.getLevelInfo();
    var motivation = planGenerator.getMotivationMessage();
    var quickPlan = planGenerator.generateDailyPlan();
    var totalMin = Math.round(stats.data.totalTime / 60000);
    var overallAcc = stats.data.totalNotes > 0
      ? Math.round((stats.data.totalCorrect / stats.data.totalNotes) * 100) : 0;

    this._planConfigs = quickPlan.map(p => p.config);

    document.getElementById('homeContent').innerHTML =
      '<div class="fade-in">' +
        '<div class="card" style="background:linear-gradient(135deg,rgba(108,99,255,0.12),rgba(34,211,238,0.08),rgba(244,114,182,0.06));border-color:rgba(108,99,255,0.15);position:relative;overflow:hidden">' +
          '<div style="position:absolute;top:-30px;right:-30px;font-size:8rem;opacity:0.04;pointer-events:none">🎼</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;position:relative">' +
            '<div>' +
              '<div style="font-size:1.2rem;font-weight:700;margin-bottom:2px">' + motivation + '</div>' +
              '<div style="color:var(--text2);font-size:0.82rem">' +
                '连续打卡 <strong style="color:var(--warning)">' + stats.data.streak + '</strong> 天' +
                ' &nbsp;·&nbsp; ' +
                '<strong style="color:var(--primary2)">Lv.' + levelInfo.level + '</strong> ' + levelInfo.title +
              '</div>' +
            '</div>' +
            '<button class="btn btn-primary btn-lg" onclick="app.startQuickPractice()" style="padding:14px 36px;font-size:0.95rem">开始练习</button>' +
          '</div>' +
          '<div style="margin-top:14px;position:relative">' +
            '<div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--text3);margin-bottom:5px">' +
              '<span>Lv.' + levelInfo.level + ' ' + levelInfo.title + '</span>' +
              '<span>' + levelInfo.exp + ' / ' + levelInfo.expForNext + ' EXP</span>' +
            '</div>' +
            '<div class="level-bar"><div class="level-bar-fill" style="width:' + (levelInfo.progress*100) + '%"></div></div>' +
          '</div>' +
        '</div>' +

        '<div class="grid grid-4" style="margin-bottom:20px">' +
          '<div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-number">' + overallAcc + '%</div><div class="stat-label">正确率</div></div>' +
          '<div class="stat-card"><div class="stat-icon">📝</div><div class="stat-number">' + stats.data.totalNotes + '</div><div class="stat-label">累计识谱</div></div>' +
          '<div class="stat-card"><div class="stat-icon">⏱️</div><div class="stat-number">' + totalMin + '</div><div class="stat-label">分钟</div></div>' +
          '<div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-number">' + stats.data.achievements.length + '</div><div class="stat-label">成就</div></div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header"><span class="card-title">📋 今日计划</span><span class="badge badge-primary">' + quickPlan.length + ' 项</span></div>' +
          quickPlan.map(function(item, i) {
            return '<div class="plan-item">' +
              '<span class="plan-icon">' + item.icon + '</span>' +
              '<div class="plan-info">' +
                '<div class="plan-title">' + item.title + '</div>' +
                '<div class="plan-desc">' + item.desc + '</div>' +
                '<div class="plan-meta"><span>⏱ ' + item.duration + '分钟</span></div>' +
              '</div>' +
              '<button class="btn btn-primary btn-sm plan-action" onclick="app.startPlanByIndex(' + i + ')">开始</button>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  startQuickPractice() {
    var rec = planGenerator.getRecommendedDifficulty();
    this.showPage('practice');
    var self = this;
    setTimeout(function() {
      self.selectDifficulty(rec);
    }, 50);
  }

  startPlanByIndex(idx) {
    var config = this._planConfigs[idx];
    if (config) this.startPlanItem(config);
  }

  startPlanItem(config) {
    this.showPage('practice');
    var self = this;
    setTimeout(function() {
      if (config.mode) self.selectedMode = config.mode;
      if (config.difficulty) self.selectedDifficulty = config.difficulty;
      if (config.clef) self.selectedClef = config.clef;
      if (config.sprintDuration) self.sprintDuration = config.sprintDuration;
      if (config.noteCount) self.noteCount = config.noteCount;
      if (config.targetNotes) self.targetNotes = config.targetNotes;
      self.startPractice();
    }, 50);
  }

  // ===== PRACTICE SETUP =====
  renderPracticeSetup() {
    var self = this;
    var s = this.settings;
    var diffHTML = DIFFICULTY_LEVELS.map(function(d, i) {
      var icons = ['🌱','🌿','🌳','🏔️','👑'];
      return '<div class="diff-card' + (i===0?' active':'') + '" id="diff-' + d.level + '" onclick="app.selectDifficulty(' + d.level + ')">' +
        '<div class="diff-level">' + icons[i] + '</div>' +
        '<div class="diff-name">Lv.' + d.level + ' ' + d.name + '</div>' +
        '<div class="diff-desc">' + d.desc + '</div>' +
      '</div>';
    }).join('');

    document.getElementById('practiceSetup').innerHTML =
      '<div class="fade-in">' +
        '<h2 style="margin-bottom:20px">选择练习模式</h2>' +
        '<div class="mode-cards" style="margin-bottom:24px">' +
          '<div class="mode-card active" id="mode-flash" onclick="app.selectMode(\'flash\')">' +
            '<div class="mode-icon">⚡</div><div class="mode-name">闪卡速认</div><div class="mode-desc">快速识别随机音符</div>' +
          '</div>' +
          '<div class="mode-card" id="mode-sprint" onclick="app.selectMode(\'sprint\')">' +
            '<div class="mode-icon">🏃</div><div class="mode-name">计时冲刺</div><div class="mode-desc">限时内尽可能多地识别</div>' +
          '</div>' +
          '<div class="mode-card" id="mode-clef_switch" onclick="app.selectMode(\'clef_switch\')">' +
            '<div class="mode-icon">🔄</div><div class="mode-name">双谱切换</div><div class="mode-desc">高低音谱随机交替</div>' +
          '</div>' +
          '<div class="mode-card" id="mode-listen" onclick="app.selectMode(\'listen\')">' +
            '<div class="mode-icon">👂</div><div class="mode-name">听音辨位</div><div class="mode-desc">听音高选择正确音名</div>' +
          '</div>' +
          '<div class="mode-card" id="mode-chord" onclick="app.selectMode(\'chord\')">' +
            '<div class="mode-icon">🎹</div><div class="mode-name">和弦辨识</div><div class="mode-desc">听和声选择和弦类型</div>' +
          '</div>' +
          '<div class="mode-card" id="mode-chord_build" onclick="app.selectMode(\'chord_build\')">' +
            '<div class="mode-icon">🏗️</div><div class="mode-name">和弦构建</div><div class="mode-desc">给出名称，在键盘上弹出组成音</div>' +
          '</div>' +
        '</div>' +

        '<h3 style="margin-bottom:12px">难度等级</h3>' +
        '<div class="difficulty-cards" style="margin-bottom:24px">' + diffHTML + '</div>' +

        '<h3 style="margin-bottom:12px">谱号选择</h3>' +
        '<div class="difficulty-cards" style="margin-bottom:24px">' +
          '<div class="diff-card active" id="clef-treble" onclick="app.selectClef(\'treble\')"><div class="diff-level">𝄞</div><div class="diff-name">高音谱</div></div>' +
          '<div class="diff-card" id="clef-bass" onclick="app.selectClef(\'bass\')"><div class="diff-level">𝄢</div><div class="diff-name">低音谱</div></div>' +
          '<div class="diff-card" id="clef-random" onclick="app.selectClef(\'random\')"><div class="diff-level">🔀</div><div class="diff-name">随机</div></div>' +
        '</div>' +

        '<div class="card" style="margin-bottom:20px">' +
          '<div class="setting-row"><div><div class="setting-label">音效</div><div class="setting-desc">正确/错误音效反馈</div></div>' +
            '<div class="toggle' + (s.sound?' active':'') + '" onclick="app.toggleSetting(\'sound\',this)"></div></div>' +
          '<div class="setting-row"><div><div class="setting-label">限时答题</div><div class="setting-desc">根据难度自动计时</div></div>' +
            '<div class="toggle' + (s.timeLimit?' active':'') + '" onclick="app.toggleSetting(\'timeLimit\',this)"></div></div>' +
        '</div>' +

        '<div style="text-align:center;padding:10px 0">' +
          '<button class="btn btn-primary btn-lg" onclick="app.startPractice()" style="font-size:1.1rem;padding:16px 48px">开始练习</button>' +
        '</div>' +
      '</div>';

    this.selectedMode = 'flash';
    this.selectedDifficulty = 1;
    this.selectedClef = 'treble';
    document.getElementById('practiceArea').style.display = 'none';
    document.getElementById('practiceSetup').style.display = 'block';
  }

  selectMode(mode) {
    this.selectedMode = mode;
    document.querySelectorAll('.mode-card').forEach(function(c) { c.classList.remove('active'); });
    var el = document.getElementById('mode-' + mode);
    if (el) el.classList.add('active');
  }

  selectDifficulty(diff) {
    this.selectedDifficulty = diff;
    document.querySelectorAll('.diff-card').forEach(function(c) { c.classList.remove('active'); });
    var el = document.getElementById('diff-' + diff);
    if (el) el.classList.add('active');
  }

  selectClef(clef) {
    this.selectedClef = clef;
    ['treble','bass','random'].forEach(function(c) {
      var el = document.getElementById('clef-' + c);
      if (el) el.classList.remove('active');
    });
    var el = document.getElementById('clef-' + clef);
    if (el) el.classList.add('active');
  }

  toggleSetting(key, el) {
    this.settings[key] = !this.settings[key];
    el.classList.toggle('active');
    if (key === 'sound') audio.enabled = this.settings.sound;
    this.saveSettings();
  }

  setTheme(theme) {
    var themes = {
      dark: {
        bg: '#0a0a14', bg2: '#12121e', bg3: '#1a1a2e',
        text: '#e8e8f0', text2: '#9898b8', text3: '#555570',
        border: 'rgba(255,255,255,0.08)', card: 'rgba(26,26,46,0.6)',
        primary: '#6c63ff', primary2: '#8b83ff', success: '#4ade80'
      },
      midnight: {
        bg: '#0d1117', bg2: '#161b22', bg3: '#21262d',
        text: '#e6edf3', text2: '#8b949e', text3: '#484f58',
        border: 'rgba(255,255,255,0.06)', card: 'rgba(22,27,34,0.8)',
        primary: '#58a6ff', primary2: '#79c0ff', success: '#3fb950'
      },
      light: {
        bg: '#f8f9fc', bg2: '#ffffff', bg3: '#f0f2f5',
        text: '#1a1a2e', text2: '#5a6070', text3: '#8a90a0',
        border: 'rgba(0,0,0,0.08)', card: 'rgba(255,255,255,0.9)',
        primary: '#5b5fc7', primary2: '#7b7fd7', success: '#1a8c3e'
      },
      neon: {
        bg: '#050510', bg2: '#0a0a1e', bg3: '#10102a',
        text: '#00ffcc', text2: '#00cc99', text3: '#006644',
        border: 'rgba(0,255,204,0.12)', card: 'rgba(10,10,30,0.8)',
        primary: '#ff00ff', primary2: '#ff66ff', success: '#00ff88'
      },
      warm: {
        bg: '#1a1208', bg2: '#241a0e', bg3: '#302418',
        text: '#f0e0c0', text2: '#b8a080', text3: '#7a6848',
        border: 'rgba(255,200,100,0.1)', card: 'rgba(36,26,14,0.8)',
        primary: '#e8a030', primary2: '#f0b848', success: '#88c040'
      },
      oled: {
        bg: '#000000', bg2: '#050505', bg3: '#0a0a0a',
        text: '#e0e0e0', text2: '#888888', text3: '#444444',
        border: 'rgba(255,255,255,0.06)', card: 'rgba(5,5,5,0.95)',
        primary: '#6c63ff', primary2: '#8b83ff', success: '#4ade80'
      }
    };
    var t = themes[theme] || themes.dark;
    var root = document.documentElement.style;
    root.setProperty('--bg', t.bg);
    root.setProperty('--bg2', t.bg2);
    root.setProperty('--bg3', t.bg3);
    root.setProperty('--text', t.text);
    root.setProperty('--text2', t.text2);
    root.setProperty('--text3', t.text3);
    root.setProperty('--border', t.border);
    root.setProperty('--bg-card', t.card);
    root.setProperty('--primary', t.primary);
    root.setProperty('--primary2', t.primary2);
    root.setProperty('--success', t.success);
    document.querySelectorAll('.theme-dot').forEach(function(d) { d.classList.remove('active'); });
    var dot = document.querySelector('.theme-dot.' + theme);
    if (dot) dot.classList.add('active');
    try { localStorage.setItem('sr_theme', theme); } catch(e) {}
  }

  togglePracticeHint(type) {
    if (type === 'solfege') {
      var chk = document.getElementById('chkSolfege');
      this.settings.showSolfege = chk.checked;
      var display = document.getElementById('solfegeDisplay');
      if (display) display.style.display = chk.checked ? 'block' : 'none';
      // Update answer buttons
      document.querySelectorAll('.answer-btn').forEach(function(btn) {
        var noteName = btn.dataset.note;
        var solEl = btn.querySelector('.solfege-label');
        if (chk.checked) {
          if (!solEl) {
            solEl = document.createElement('span');
            solEl.className = 'solfege-label';
            solEl.style.cssText = 'display:block;font-size:0.7rem;color:var(--purple);margin-top:2px';
            btn.appendChild(solEl);
          }
          solEl.textContent = SOLFEGE[noteName];
          solEl.style.display = 'block';
        } else if (solEl) {
          solEl.style.display = 'none';
        }
      });
    } else if (type === 'piano') {
      var chk = document.getElementById('chkPiano');
      this.settings.showPiano = chk.checked;
      var container = document.getElementById('pianoContainer');
      if (container) container.style.display = chk.checked ? 'block' : 'none';
      if (chk.checked) this.renderPianoHighlight(null);
    }
    this.saveSettings();
  }

  switchSound(preset) {
    audio.setPreset(preset);
    // Update button states
    document.querySelectorAll('.practice-hint-bar .btn').forEach(function(btn) {
      if (btn.onclick && btn.onclick.toString().indexOf('switchSound') >= 0) {
        btn.className = 'btn btn-sm btn-outline';
      }
    });
    // Re-render hint bar to update active state
    var ps = this.practiceState;
    if (ps) {
      var hintBar = document.querySelector('.practice-hint-bar');
      if (hintBar) {
        var soundBtns = hintBar.querySelectorAll('[onclick*="switchSound"]');
        soundBtns.forEach(function(btn) {
          var key = btn.getAttribute('onclick').match(/'(\w+)'/)[1];
          btn.className = 'btn btn-sm ' + (key === preset ? 'btn-primary' : 'btn-outline');
        });
      }
    }
    // Play a preview
    var ps = this.practiceState;
    if (ps && ps.currentNote) {
      var freq = getFrequencyForKey(ps.currentNote.key);
      audio.playNote(freq, 1.0);
    }
  }

  replayNote() {
    var ps = this.practiceState;
    if (!ps || !ps.currentNote) return;
    var freq = getFrequencyForKey(ps.currentNote.key);
    audio.playNote(freq, 1.5);
  }

  // ===== PIANO KEYBOARD =====
  renderPianoHighlight(note) {
    var container = document.getElementById('pianoKeys');
    if (!container) return;

    // 2 octaves: C3-B3 (left) + C4-B4 (middle C octave)
    var whiteNotes = [
      {name:'C',octave:3},{name:'D',octave:3},{name:'E',octave:3},{name:'F',octave:3},
      {name:'G',octave:3},{name:'A',octave:3},{name:'B',octave:3},
      {name:'C',octave:4},{name:'D',octave:4},{name:'E',octave:4},{name:'F',octave:4},
      {name:'G',octave:4},{name:'A',octave:4},{name:'B',octave:4}
    ];
    var blackNotes = [
      {name:'C#',octave:3,pos:0.6},{name:'D#',octave:3,pos:1.6},
      {name:'F#',octave:3,pos:3.6},{name:'G#',octave:3,pos:4.6},{name:'A#',octave:3,pos:5.6},
      {name:'C#',octave:4,pos:7.6},{name:'D#',octave:4,pos:8.6},
      {name:'F#',octave:4,pos:10.6},{name:'G#',octave:4,pos:11.6},{name:'A#',octave:4,pos:12.6}
    ];

    var keyWidth = 36;
    var totalWidth = 14 * keyWidth;
    container.style.width = totalWidth + 'px';
    container.innerHTML = '';

    // White keys
    whiteNotes.forEach(function(wn, i) {
      var key = document.createElement('div');
      key.className = 'white-key';
      key.style.left = (i * keyWidth) + 'px';

      // Highlight matching note
      if (note && note.name === wn.name && note.octave === wn.octave) {
        key.classList.add('active');
      }

      var label = document.createElement('span');
      label.className = 'key-label';
      label.textContent = wn.name + wn.octave;
      // Mark middle C specially
      if (wn.name === 'C' && wn.octave === 4) {
        label.style.color = '#6c63ff';
        label.style.fontWeight = 'bold';
        key.style.borderLeft = '2px solid #6c63ff';
      }
      key.appendChild(label);

      key.addEventListener('click', function() {
        var entry = PIANO_NOTES[wn.name + wn.octave];
        if (entry) audio.playNote(entry.freq, 1.5);
      });

      container.appendChild(key);
    });

    // Black keys
    blackNotes.forEach(function(bn) {
      var key = document.createElement('div');
      key.className = 'black-key';
      key.style.left = (bn.pos * keyWidth) + 'px';

      key.addEventListener('click', function(e) {
        e.stopPropagation();
        var entry = PIANO_NOTES[bn.name + bn.octave];
        if (entry) audio.playNote(entry.freq, 1.5);
      });

      container.appendChild(key);
    });
  }

  // ===== PRACTICE ENGINE =====
  startPractice() {
    document.getElementById('practiceSetup').style.display = 'none';
    document.getElementById('practiceArea').style.display = 'block';

    var diff = DIFFICULTY_LEVELS[this.selectedDifficulty - 1];
    var sprintDur = this.selectedMode === 'sprint' ? (this.sprintDuration || 60) : 0;
    var totalNotes = this.selectedMode === 'sprint' ? 999 : (this.noteCount || 20);

    this.practiceState = {
      mode: this.selectedMode,
      difficulty: this.selectedDifficulty,
      clef: this.selectedClef,
      total: totalNotes,
      current: 0,
      correct: 0,
      combo: 0,
      maxCombo: 0,
      startTime: Date.now(),
      questionStartTime: 0,
      responseTimes: [],
      sprintDuration: sprintDur,
      sprintRemaining: sprintDur,
      sprintTimer: null,
      currentNote: null,
      answered: false,
      results: [],
      chordBpm: 100,
      currentChord: null,
      chordOptions: [],
      selectedNotes: [],
      _recentChords: []
    };

    this.renderPracticeUI();
    if (this.selectedMode !== 'chord' && this.selectedMode !== 'chord_build') {
      this.renderer = new ScoreRenderer('scoreCanvas');
      this.renderer.init(420, 150);
    }
    this.nextQuestion();
  }

  renderPracticeUI() {
    var ps = this.practiceState;
    var self = this;
    var showSolfege = self.settings.showSolfege || false;
    var showPiano = self.settings.showPiano || false;

    document.getElementById('practiceArea').innerHTML =
      '<div class="practice-area slide-up">' +
        '<div class="practice-bar">' +
          '<div class="stat-item"><span>进度</span> <span class="stat-value" id="progressText">' + ps.current + '/' + (ps.mode==='sprint'?'∞':ps.total) + '</span></div>' +
          '<div class="stat-item timer" id="timerDisplay" style="display:' + (ps.sprintDuration?'block':'none') + '"><span class="stat-value">' + ps.sprintDuration + 's</span></div>' +
          '<div class="stat-item combo" id="comboDisplay" style="display:none">🔥 <span class="stat-value">0x</span></div>' +
          '<div class="stat-item score">正确 <span class="stat-value" id="scoreText">' + ps.correct + '</span></div>' +
        '</div>' +

        (ps.mode === 'chord'
          ? // ===== CHORD MODE UI =====
          '<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:10px 12px;flex-wrap:wrap">' +
            '<button class="btn btn-sm btn-outline" onclick="app.replayChord()" style="font-size:0.82rem">🔊 重播</button>' +
            '<div style="display:flex;align-items:center;gap:6px">' +
              '<span style="font-size:0.72rem;color:var(--text3)">BPM</span>' +
              '<input type="range" id="chordBpmSlider" min="40" max="200" value="' + (ps.chordBpm||100) + '" style="width:100px" oninput="app.setChordBpm(+this.value)">' +
              '<span id="chordBpmDisplay" style="font-size:0.82rem;color:var(--warning);font-weight:600;min-width:32px">' + (ps.chordBpm||100) + '</span>' +
            '</div>' +
            '<div style="display:flex;gap:3px">' +
              [['慢',60],['中',100],['快',140]].map(function(t){
                return '<button class="btn btn-sm btn-outline" onclick="app.setChordBpm('+t[1]+')" style="padding:2px 8px;font-size:0.68rem">'+t[0]+'</button>';
              }).join('')+
            '</div>' +
          '</div>' +
          '<div id="questionTimer" style="display:none;position:relative;width:52px;height:52px;margin:0 auto 8px">' +
            '<svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="#333" stroke-width="3"/><circle id="timerCircle" cx="26" cy="26" r="22" fill="none" stroke="var(--success)" stroke-width="3" stroke-dasharray="138.2" stroke-dashoffset="0" stroke-linecap="round" transform="rotate(-90 26 26)"/></svg>' +
            '<span id="timerText" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:0.9rem;font-weight:700;color:var(--text)"></span>' +
          '</div>' +
          '<div class="score-display" id="scoreDisplay" style="padding:12px 16px;min-height:180px">' +
            '<div id="chordStaffCanvas" style="width:100%;min-height:160px;display:flex;justify-content:center;align-items:center"></div>' +
            '<span class="hint" id="clefHint"></span>' +
          '</div>' +
          '<div class="answer-options" id="answerOptions" style="display:flex;gap:10px;justify-content:center;padding:0 8px">' +
            '<div id="chordOptionsContainer" style="display:flex;gap:10px;justify-content:center;width:100%"></div>' +
          '</div>'

        : ps.mode === 'chord_build'
          ? // ===== CHORD BUILD MODE UI =====
          '<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:10px 12px">' +
            '<button class="btn btn-sm btn-outline" onclick="app.replayBuildChord()">🔊 和弦试听</button>' +
          '</div>' +
          '<div id="questionTimer" style="display:none;position:relative;width:52px;height:52px;margin:0 auto 8px">' +
            '<svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="#333" stroke-width="3"/><circle id="timerCircle" cx="26" cy="26" r="22" fill="none" stroke="var(--success)" stroke-width="3" stroke-dasharray="138.2" stroke-dashoffset="0" stroke-linecap="round" transform="rotate(-90 26 26)"/></svg>' +
            '<span id="timerText" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:0.9rem;font-weight:700;color:var(--text)"></span>' +
          '</div>' +
          '<div class="score-display" id="scoreDisplay" style="padding:12px 16px;min-height:180px">' +
            '<div id="chordStaffCanvas" style="width:100%;min-height:160px;display:flex;justify-content:center;align-items:center"></div>' +
            '<span class="hint" id="clefHint"></span>' +
          '</div>' +
          '<div class="answer-options" id="answerOptions" style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 8px">' +
            '<div style="display:flex;justify-content:center"><div id="chordBuildPiano" class="piano piano-dark" style="height:140px"></div></div>' +
            '<div style="display:flex;gap:10px">' +
              '<button class="btn btn-primary btn-lg" onclick="app.submitChordBuildAnswer()" style="padding:12px 40px">✓ 确认</button>' +
              '<button class="btn btn-outline" onclick="app.clearBuildNotes()" style="padding:12px 20px">清空</button>' +
            '</div>' +
          '</div>'

        : // ===== NOTE MODE UI =====
          '<div class="practice-hint-bar">' +
            '<label class="hint-toggle"><input type="checkbox" id="chkSolfege" ' + (showSolfege?'checked':'') + ' onchange="app.togglePracticeHint(\'solfege\')"> 唱名</label>' +
            '<label class="hint-toggle"><input type="checkbox" id="chkPiano" ' + (showPiano?'checked':'') + ' onchange="app.togglePracticeHint(\'piano\')"> 键位</label>' +
            '<span style="margin-left:auto;display:flex;gap:4px;align-items:center">' +
              '<span style="font-size:0.72rem;color:var(--text3);margin-right:4px">音色</span>' +
              Object.keys(audio.presets).map(function(k) {
                var p = audio.presets[k];
                var active = audio.preset === k;
                return '<button class="btn btn-sm ' + (active?'btn-primary':'btn-outline') + '" onclick="app.switchSound(\'' + k + '\')" style="padding:3px 8px;font-size:0.7rem">' + p.icon + '</button>';
              }).join('') +
            '</span>' +
            (ps.mode === 'listen' ? '<button class="btn btn-sm btn-outline" onclick="app.replayNote()" style="margin-left:8px">🔊 重播</button>' : '') +
          '</div>' +
          '<div id="questionTimer" style="display:none;position:relative;width:52px;height:52px;margin:0 auto 8px">' +
            '<svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="#333" stroke-width="3"/><circle id="timerCircle" cx="26" cy="26" r="22" fill="none" stroke="var(--success)" stroke-width="3" stroke-dasharray="138.2" stroke-dashoffset="0" stroke-linecap="round" transform="rotate(-90 26 26)"/></svg>' +
            '<span id="timerText" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:0.9rem;font-weight:700;color:var(--text)"></span>' +
          '</div>' +
          '<div class="score-display" id="scoreDisplay">' +
            '<div id="scoreCanvas" style="width:100%;display:flex;justify-content:center"></div>' +
            '<span class="hint" id="clefHint"></span>' +
            '<span id="solfegeDisplay" style="display:' + (showSolfege?'block':'none') + ';text-align:center;font-size:1.1rem;color:var(--purple);margin-top:6px"></span>' +
          '</div>' +
          '<div class="answer-options" id="answerOptions">' +
            NOTES.map(function(n) {
              return '<button class="answer-btn" data-note="' + n + '" onclick="app.submitAnswer(\'' + n + '\')">' +
                '<span style="color:' + NOTE_COLORS[n] + '">' + n + '</span>' +
                '</button>';
            }).join('') +
          '</div>'
        ) +

        '<div class="piano-container" id="pianoContainer" style="display:' + (ps.mode==='chord'||ps.mode==='chord_build'?'none':(showPiano?'block':'none')) + '"><div class="piano" id="pianoKeys"></div></div>' +
      '</div>';

    if (showPiano) this.renderPianoHighlight(null);
  }

  _isRepeat(note, recent) {
    var key = note.name + note.clef;
    for (var i = 0; i < recent.length; i++) {
      if (recent[i] === key) return true;
    }
    return false;
  }

  nextQuestion() {
    var ps = this.practiceState;
    if (!ps) return;

    if (ps.mode !== 'sprint' && ps.current >= ps.total) {
      this.endPractice();
      return;
    }

    ps.answered = false;
    ps.current++;

    // === CHORD MODE ===
    if (ps.mode === 'chord') {
      this._nextChordQuestion();
      return;
    }

    // === CHORD BUILD MODE ===
    if (ps.mode === 'chord_build') {
      this._nextChordBuildQuestion();
      return;
    }

    // Initialize recent notes tracker
    if (!ps._recentNotes) ps._recentNotes = [];

    var note;
    var maxAttempts = 30;

    if (ps.targetNotes && ps.targetNotes.length > 0 && Math.random() < 0.6) {
      // Target weak notes mode
      var targetName = randomItem(ps.targetNotes);
      var attempts = 0;
      do {
        note = generateRandomNote(ps.difficulty, ps.clef);
        attempts++;
      } while ((note.name !== targetName || this._isRepeat(note, ps._recentNotes)) && attempts < maxAttempts);
    } else {
      // Normal mode — avoid recent notes
      var attempts = 0;
      do {
        note = generateRandomNote(ps.difficulty, ps.clef);
        attempts++;
      } while (this._isRepeat(note, ps._recentNotes) && attempts < maxAttempts);
    }

    // Track recent notes (keep last 4)
    ps._recentNotes.push(note.name + note.clef);
    if (ps._recentNotes.length > 4) ps._recentNotes.shift();

    ps.currentNote = note;
    ps.questionStartTime = Date.now();

    // In listen mode: show empty staff, don't reveal note position
    if (ps.mode === 'listen') {
      this.renderer.renderEmptyStaff(note.clef);
    } else {
      this.renderer.renderNote(note);
    }
    this.updatePracticeBar();

    var clefHint = document.getElementById('clefHint');
    if (clefHint) clefHint.textContent = note.clef === 'treble' ? '𝄞 高音谱' : '𝄢 低音谱';

    // Hide hints until answered
    var solfegeDisplay = document.getElementById('solfegeDisplay');
    if (solfegeDisplay) solfegeDisplay.style.display = 'none';
    if (this.settings.showPiano) this.renderPianoHighlight(null); // No highlight yet

    // Reset answer buttons
    document.querySelectorAll('.answer-btn').forEach(function(btn) {
      btn.disabled = false;
      btn.className = 'answer-btn';
    });

    // Start sprint timer
    if (ps.sprintDuration && ps.mode === 'sprint' && !ps.sprintTimer) {
      this.startSprintTimer();
    }

    // Per-question countdown timer
    this.startQuestionTimer();

    // Play note in listen mode
    if (ps.mode === 'listen') {
      var freq = getFrequencyForKey(ps.currentNote.key);
      audio.playNote(freq, 0.5);
    }
  }

  submitAnswer(answer) {
    var ps = this.practiceState;
    if (!ps || ps.answered) return;
    ps.answered = true;

    this.stopQuestionTimer();

    var responseTime = Date.now() - ps.questionStartTime;
    var correct = answer === ps.currentNote.name;

    stats.recordAnswer(ps.currentNote.name, ps.currentNote.clef, correct, responseTime);
    ps.responseTimes.push(responseTime);
    ps.results.push({ note: ps.currentNote, answer: answer, correct: correct, time: responseTime });

    // Score display state
    var scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
      scoreDisplay.classList.remove('state-correct', 'state-wrong');
      scoreDisplay.classList.add(correct ? 'state-correct' : 'state-wrong');
    }

    if (correct) {
      ps.correct++;
      ps.combo++;
      if (ps.combo > ps.maxCombo) ps.maxCombo = ps.combo;
      // Play the note's frequency instead of generic correct sound
      var freq = getFrequencyForKey(ps.currentNote.key);
      audio.playNote(freq, 1.5);

      var btn = document.querySelector('.answer-btn[data-note="' + answer + '"]');
      if (btn) btn.classList.add('correct');

      // Particle burst on correct answer
      this._spawnParticles(btn);

      if (ps.combo > 0 && ps.combo % 10 === 0) {
        audio.playCombo(ps.combo);
        this.showComboFlash(ps.combo);
      }
    } else {
      ps.combo = 0;
      audio.playWrong();

      var wrongBtn = document.querySelector('.answer-btn[data-note="' + answer + '"]');
      var correctBtn = document.querySelector('.answer-btn[data-note="' + ps.currentNote.name + '"]');
      if (wrongBtn) wrongBtn.classList.add('wrong');
      if (correctBtn) correctBtn.classList.add('correct');
    }

    this.updatePracticeBar();
    document.querySelectorAll('.answer-btn').forEach(function(b) { b.disabled = true; });

    // Highlight note on staff with correct/wrong state
    this.renderer.highlightResult(correct);

    // Show solfège AFTER answering
    if (this.settings.showSolfege) {
      var solfegeDisplay = document.getElementById('solfegeDisplay');
      if (solfegeDisplay) {
        solfegeDisplay.textContent = SOLFEGE[ps.currentNote.name] || '';
        solfegeDisplay.style.display = 'block';
      }
    }
    // Show piano key AFTER answering
    if (this.settings.showPiano) this.renderPianoHighlight(ps.currentNote);

    var self = this;
    setTimeout(function() {
      // Clean up score display state
      if (scoreDisplay) scoreDisplay.classList.remove('state-correct', 'state-wrong');
      if (ps.mode === 'sprint' && ps.sprintRemaining <= 0) {
        self.endPractice();
      } else {
        self.nextQuestion();
      }
    }, correct ? 600 : 1200);
  }

  // ===== CHORD MODE =====
  _nextChordQuestion() {
    var ps = this.practiceState;
    var types = [
      { key: 'major_triad',  name: '大三和弦', icon: '△', intervals: [0,4,7] },
      { key: 'minor_triad',  name: '小三和弦', icon: 'm', intervals: [0,3,7] },
      { key: 'dim_triad',    name: '减三和弦', icon: '°', intervals: [0,3,6] },
      { key: 'aug_triad',    name: '增三和弦', icon: '+', intervals: [0,4,8] },
      { key: 'major7',       name: '大七和弦', icon: '△⁷', intervals: [0,4,7,11] },
      { key: 'minor7',       name: '小七和弦', icon: 'm⁷', intervals: [0,3,7,10] },
      { key: 'dom7',         name: '属七和弦', icon: '⁷', intervals: [0,4,7,10] },
    ];
    // Pick root note C4-B4
    var rootMidi = 60 + randomInt(0, 11);
    // Pick chord type, avoid recent repeats
    if (!ps._recentChords) ps._recentChords = [];
    var chordType = types[randomInt(0, types.length - 1)];
    var attempts = 0;
    while (ps._recentChords.indexOf(chordType.key) >= 0 && attempts < 10) {
      chordType = types[randomInt(0, types.length - 1)];
      attempts++;
    }
    ps._recentChords.push(chordType.key);
    if (ps._recentChords.length > 3) ps._recentChords.shift();
    // Build freq array
    var chordFreqs = chordType.intervals.map(function(iv) {
      return 440 * Math.pow(2, (rootMidi + iv - 69) / 12);
    });
    ps.currentChord = { rootMidi: rootMidi, chordType: chordType, chordFreqs: chordFreqs };
    ps.questionStartTime = Date.now();
    // Build 4 options: 1 correct + 3 random wrong
    var wrong = types.filter(function(c) { return c.key !== chordType.key; });
    wrong.sort(function() { return Math.random() - 0.5; });
    var allOpts = [chordType].concat(wrong.slice(0, 3));
    allOpts.sort(function() { return Math.random() - 0.5; });
    ps.chordOptions = allOpts;
    // Update UI
    this.updatePracticeBar();
    var staffEl = document.getElementById('chordStaffCanvas');
    if (staffEl) staffEl.innerHTML = '<div style="color:var(--text3);font-size:0.95rem;padding:40px 0;letter-spacing:1px">♪ 逐音播放中，请仔细听…</div>';
    var hintEl = document.getElementById('clefHint');
    if (hintEl) hintEl.textContent = '♪ 听和弦，选择类型';
    // Render chord option buttons
    var optContainer = document.getElementById('chordOptionsContainer');
    if (optContainer) {
      optContainer.innerHTML = allOpts.map(function(opt) {
        return '<button class="answer-btn chord-btn" data-chord="' + opt.key + '" onclick="app.submitChordAnswer(\'' + opt.key + '\')" style="flex:1;padding:16px 6px;text-align:center;border-radius:12px;min-width:0">' +
          '<div style="font-weight:800;font-size:1.4rem;line-height:1">' + opt.icon + '</div>' +
          '<div style="font-size:0.78rem;margin-top:6px;color:var(--text2);white-space:nowrap">' + opt.name + '</div></button>';
      }).join('');
    }
    // Disable options until playback finishes
    document.querySelectorAll('#chordOptionsContainer .answer-btn').forEach(function(b) { b.disabled = true; b.style.opacity = '0.5'; });
    this.startQuestionTimer();
    // Play notes one by one, then enable options
    this._playChordSequential(chordFreqs, function() {
      document.querySelectorAll('#chordOptionsContainer .answer-btn').forEach(function(b) { b.disabled = false; b.style.opacity = '1'; });
      var el = document.getElementById('chordStaffCanvas');
      if (el) el.innerHTML = '<div style="color:var(--primary2);font-size:0.95rem;padding:40px 0;font-weight:600">♪ 播放完毕，请选择和弦类型</div>';
    });
  }

  _playChordSequential(freqs, onDone) {
    if (!audio.enabled) { if (onDone) onDone(); return; }
    audio.init(); audio.resume();
    var ctx = audio.ctx;
    var ps = this.practiceState;
    var bpm = (ps && ps.chordBpm) ? ps.chordBpm : 100;
    // BPM = beats per minute, each note = 1 beat
    var secPerBeat = 60.0 / bpm;         // e.g. BPM=100 → 0.6s per note
    var noteDur = secPerBeat * 0.85;      // note sustains 85% of beat
    var gap = secPerBeat;                 // next note starts exactly on next beat
    var idx = 0;
    function playNext() {
      if (idx >= freqs.length) { if (onDone) onDone(); return; }
      var freq = freqs[idx]; idx++;
      var now = ctx.currentTime;
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.25, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now + noteDur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + noteDur + 0.05);
      setTimeout(playNext, gap * 1000);
    }
    playNext();
  }

  replayChord() {
    var ps = this.practiceState;
    if (!ps || !ps.currentChord) return;
    // Disable options during replay
    document.querySelectorAll('#chordOptionsContainer .answer-btn').forEach(function(b) { b.disabled = true; b.style.opacity = '0.5'; });
    var staffEl = document.getElementById('chordStaffCanvas');
    if (staffEl) staffEl.innerHTML = '<div style="color:var(--text3);font-size:0.95rem;padding:40px 0;letter-spacing:1px">♪ 重播中…</div>';
    this._playChordSequential(ps.currentChord.chordFreqs, function() {
      document.querySelectorAll('#chordOptionsContainer .answer-btn').forEach(function(b) { b.disabled = false; b.style.opacity = '1'; });
      var el = document.getElementById('chordStaffCanvas');
      if (el) el.innerHTML = '<div style="color:var(--primary2);font-size:0.95rem;padding:40px 0;font-weight:600">♪ 播放完毕，请选择</div>';
    });
  }

  setChordBpm(bpm) {
    var ps = this.practiceState;
    if (!ps) return;
    ps.chordBpm = Math.max(40, Math.min(200, bpm));
    var slider = document.getElementById('chordBpmSlider');
    var display = document.getElementById('chordBpmDisplay');
    if (slider) slider.value = ps.chordBpm;
    if (display) display.textContent = ps.chordBpm;
  }

  submitChordAnswer(answerKey) {
    var ps = this.practiceState;
    if (!ps || ps.answered) return;
    ps.answered = true;
    this.stopQuestionTimer();
    var responseTime = Date.now() - ps.questionStartTime;
    var correct = !!answerKey && answerKey === ps.currentChord.chordType.key;
    ps.responseTimes.push(responseTime);
    ps.results.push({ chord: ps.currentChord, answer: answerKey, correct: correct, time: responseTime });
    if (correct) {
      ps.correct++; ps.combo++;
      if (ps.combo > ps.maxCombo) ps.maxCombo = ps.combo;
      audio.playCorrect();
      var btn = document.querySelector('.answer-btn[data-chord="' + answerKey + '"]');
      if (btn) btn.classList.add('correct');
      this._spawnParticles(btn);
      if (ps.combo > 0 && ps.combo % 10 === 0) { audio.playCombo(ps.combo); this.showComboFlash(ps.combo); }
    } else {
      ps.combo = 0; audio.playWrong();
      if (answerKey) { var wb = document.querySelector('.answer-btn[data-chord="' + answerKey + '"]'); if (wb) wb.classList.add('wrong'); }
      var cb = document.querySelector('.answer-btn[data-chord="' + ps.currentChord.chordType.key + '"]');
      if (cb) cb.classList.add('correct');
    }
    this.updatePracticeBar();
    document.querySelectorAll('.answer-btn').forEach(function(b) { b.disabled = true; });
    this._renderChordStaff(correct);
    var self = this;
    setTimeout(function() { self.nextQuestion(); }, correct ? 1200 : 2000);
  }

  _renderChordStaff(isCorrect) {
    var ps = this.practiceState;
    if (!ps || !ps.currentChord) return;
    var container = document.getElementById('chordStaffCanvas');
    if (!container) return;
    var chord = ps.currentChord;
    var noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    var noteOrder = {C:0,D:1,E:2,F:3,G:4,A:5,B:6};
    var w = 420, h = 200, staffLeft = 60, staffRight = w - 30, staffTop = 55, lineSpacing = 12;
    var color = isCorrect ? '#4ade80' : '#f87171';
    var notes = chord.chordType.intervals.map(function(iv) {
      var midi = chord.rootMidi + iv;
      var nm = noteNames[midi % 12];
      var oct = Math.floor(midi / 12) - 1;
      var acc = nm.indexOf('#') >= 0;
      return { name: nm[0], displayName: nm, octave: oct, midi: midi, accidental: acc };
    });
    function noteToY(n) {
      var pos = noteOrder[n.name] + (n.octave - 4) * 7;
      return staffTop + (10 - pos) * (lineSpacing / 2);
    }
    var svg = '<svg width="100%" viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg">';
    svg += '<defs><filter id="cG" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/><feFlood flood-color="' + color + '" flood-opacity="0.5"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    // 5 staff lines
    for (var i = 0; i < 5; i++) {
      var ly = staffTop + i * lineSpacing;
      svg += '<line x1="' + staffLeft + '" y1="' + ly + '" x2="' + staffRight + '" y2="' + ly + '" stroke="#8888aa" stroke-width="1.5"/>';
    }
    // Treble clef
    svg += '<text x="' + (staffLeft + 5) + '" y="' + (staffTop + 42) + '" font-size="48" fill="#aaa" font-family="serif" opacity="0.8">&#119070;</text>';
    // Chord label
    svg += '<text x="' + (w / 2) + '" y="' + (staffTop - 14) + '" text-anchor="middle" font-size="15" fill="' + color + '" font-weight="bold">' + chord.chordType.icon + ' ' + chord.chordType.name + '</text>';
    // Notes
    var x0 = staffLeft + 90, gap = 55;
    for (var n = 0; n < notes.length; n++) {
      var note = notes[n], x = x0 + n * gap, y = noteToY(note);
      // Ledger lines
      var sb = staffTop + 4 * lineSpacing;
      if (y > sb) for (var ly = sb + lineSpacing; ly <= y + 2; ly += lineSpacing) svg += '<line x1="' + (x-14) + '" y1="' + ly + '" x2="' + (x+14) + '" y2="' + ly + '" stroke="#8888aa" stroke-width="1.5"/>';
      if (y < staffTop) for (var ly = staffTop - lineSpacing; ly >= y - 2; ly -= lineSpacing) svg += '<line x1="' + (x-14) + '" y1="' + ly + '" x2="' + (x+14) + '" y2="' + ly + '" stroke="#8888aa" stroke-width="1.5"/>';
      svg += '<g filter="url(#cG)">';
      svg += '<ellipse cx="' + x + '" cy="' + y + '" rx="10" ry="7.5" fill="' + color + '" stroke="' + color + '" stroke-width="1" transform="rotate(-15,' + x + ',' + y + ')"/>';
      var up = y > (staffTop + 2 * lineSpacing);
      svg += up
        ? '<line x1="' + (x+9) + '" y1="' + (y-1) + '" x2="' + (x+9) + '" y2="' + (y-40) + '" stroke="' + color + '" stroke-width="1.8"/>'
        : '<line x1="' + (x-9) + '" y1="' + (y+1) + '" x2="' + (x-9) + '" y2="' + (y+40) + '" stroke="' + color + '" stroke-width="1.8"/>';
      if (note.accidental) svg += '<text x="' + (x-24) + '" y="' + (y+6) + '" font-size="16" fill="' + color + '" font-family="serif">&#9839;</text>';
      svg += '<text x="' + x + '" y="' + (staffTop + 5*lineSpacing + 16) + '" text-anchor="middle" font-size="10" fill="' + color + '" font-weight="600">' + note.displayName + note.octave + '</text>';
      svg += '</g>';
    }
    svg += '</svg>';
    container.innerHTML = svg;
  }

  _spawnParticles(btn) {
    if (!btn) return;
    var rect = btn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var burst = document.createElement('div');
    burst.className = 'particle-burst';
    burst.style.left = cx + 'px';
    burst.style.top = cy + 'px';
    var colors = ['#4ade80', '#22d3ee', '#fbbf24', '#a78bfa', '#f472b6'];
    for (var i = 0; i < 8; i++) {
      var p = document.createElement('div');
      p.className = 'particle';
      var angle = (Math.PI * 2 / 8) * i;
      var dist = 30 + Math.random() * 30;
      p.style.setProperty('--px', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--py', Math.sin(angle) * dist + 'px');
      p.style.background = colors[i % colors.length];
      burst.appendChild(p);
    }
    document.body.appendChild(burst);
    setTimeout(function() { burst.remove(); }, 700);
  }

  startQuestionTimer() {
    var ps = this.practiceState;
    if (!ps) return;

    // Clear previous timer
    if (ps.questionTimerInterval) {
      clearInterval(ps.questionTimerInterval);
      ps.questionTimerInterval = null;
    }
    if (ps.questionTimer) {
      clearTimeout(ps.questionTimer);
      ps.questionTimer = null;
    }

    var timerEl = document.getElementById('questionTimer');
    var circleEl = document.getElementById('timerCircle');
    var textEl = document.getElementById('timerText');

    // Only show if timeLimit is enabled and not sprint/chord mode
    if (!this.settings.timeLimit || ps.mode === 'sprint' || ps.mode === 'chord') {
      if (timerEl) timerEl.style.display = 'none';
      return;
    }

    var level = DIFFICULTY_LEVELS[ps.difficulty - 1];
    var limitMs = level.timeLimit;
    if (!limitMs || limitMs <= 0) {
      if (timerEl) timerEl.style.display = 'none';
      return;
    }

    var totalSec = Math.ceil(limitMs / 1000);
    var circumference = 2 * Math.PI * 22; // r=22
    var remaining = limitMs;
    var self = this;

    if (timerEl) timerEl.style.display = 'block';
    if (textEl) textEl.textContent = totalSec;
    if (circleEl) {
      circleEl.style.stroke = 'var(--success)';
      circleEl.setAttribute('stroke-dashoffset', '0');
    }

    var startTime = Date.now();

    ps.questionTimerInterval = setInterval(function() {
      if (ps.answered) {
        clearInterval(ps.questionTimerInterval);
        ps.questionTimerInterval = null;
        return;
      }

      var elapsed = Date.now() - startTime;
      remaining = Math.max(0, limitMs - elapsed);
      var sec = Math.ceil(remaining / 1000);
      var progress = 1 - (remaining / limitMs);

      if (textEl) textEl.textContent = sec;
      if (circleEl) {
        circleEl.setAttribute('stroke-dashoffset', (progress * circumference).toFixed(1));
        // Color: green → yellow → red
        if (progress < 0.5) {
          circleEl.style.stroke = 'var(--success)';
        } else if (progress < 0.8) {
          circleEl.style.stroke = 'var(--warning)';
        } else {
          circleEl.style.stroke = 'var(--danger)';
        }
      }

      if (remaining <= 0) {
        clearInterval(ps.questionTimerInterval);
        ps.questionTimerInterval = null;
        if (!ps.answered) {
          if (ps.mode === 'chord') { self.submitChordAnswer(null); }
          else { self.submitAnswer(null); }
        }
      }
    }, 50); // Update every 50ms for smooth animation
  }

  stopQuestionTimer() {
    var ps = this.practiceState;
    if (!ps) return;
    if (ps.questionTimerInterval) {
      clearInterval(ps.questionTimerInterval);
      ps.questionTimerInterval = null;
    }
    if (ps.questionTimer) {
      clearTimeout(ps.questionTimer);
      ps.questionTimer = null;
    }
    var timerEl = document.getElementById('questionTimer');
    if (timerEl) timerEl.style.display = 'none';
  }

  startSprintTimer() {
    var ps = this.practiceState;
    var self = this;
    ps.sprintTimer = setInterval(function() {
      ps.sprintRemaining--;
      var timerEl = document.querySelector('#timerDisplay .stat-value');
      if (timerEl) timerEl.textContent = ps.sprintRemaining + 's';
      if (ps.sprintRemaining <= 0) {
        clearInterval(ps.sprintTimer);
        ps.sprintTimer = null;
        if (!ps.answered) self.endPractice();
      }
    }, 1000);
  }

  updatePracticeBar() {
    var ps = this.practiceState;
    var progressEl = document.getElementById('progressText');
    var scoreEl = document.getElementById('scoreText');
    var comboEl = document.getElementById('comboDisplay');
    if (progressEl) progressEl.textContent = ps.current + '/' + (ps.mode==='sprint'?'∞':ps.total);
    if (scoreEl) scoreEl.textContent = ps.correct;
    if (comboEl) {
      comboEl.style.display = ps.combo > 0 ? 'flex' : 'none';
      comboEl.querySelector('.stat-value').textContent = ps.combo + 'x';
    }
  }

  showComboFlash(count) {
    var flash = document.querySelector('.combo-flash');
    if (!flash) {
      flash = document.createElement('div');
      flash.className = 'combo-flash';
      document.body.appendChild(flash);
    }
    flash.textContent = count + ' COMBO!';
    flash.className = 'combo-flash';
    void flash.offsetWidth;
    flash.className = 'combo-flash show';
  }

  // ===== CHORD BUILD MODE =====
  _nextChordBuildQuestion() {
    var ps = this.practiceState;
    var types = [
      { key: 'major_triad', name: '大三和弦', icon: '△', intervals: [0,4,7] },
      { key: 'minor_triad', name: '小三和弦', icon: 'm', intervals: [0,3,7] },
      { key: 'dim_triad',   name: '减三和弦', icon: '°', intervals: [0,3,6] },
      { key: 'aug_triad',   name: '增三和弦', icon: '+', intervals: [0,4,8] },
      { key: 'major7',      name: '大七和弦', icon: '△⁷', intervals: [0,4,7,11] },
      { key: 'minor7',      name: '小七和弦', icon: 'm⁷', intervals: [0,3,7,10] },
      { key: 'dom7',        name: '属七和弦', icon: '⁷', intervals: [0,4,7,10] },
    ];
    var NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    var rootMidi = 60 + randomInt(0, 11);
    var rootName = NOTE_NAMES[rootMidi % 12];
    // Pick chord type, avoid recent repeats
    if (!ps._recentChords) ps._recentChords = [];
    var chordType = types[randomInt(0, types.length - 1)];
    var attempts = 0;
    while (ps._recentChords.indexOf(chordType.key) >= 0 && attempts < 10) {
      chordType = types[randomInt(0, types.length - 1)]; attempts++;
    }
    ps._recentChords.push(chordType.key);
    if (ps._recentChords.length > 3) ps._recentChords.shift();
    var expectedMidis = chordType.intervals.map(function(iv) { return rootMidi + iv; });
    ps.currentChord = { rootMidi: rootMidi, rootName: rootName, chordType: chordType, expectedMidis: expectedMidis, chordFreqs: expectedMidis.map(function(m) { return 440 * Math.pow(2, (m - 69) / 12); }) };
    ps.selectedNotes = [];
    ps.questionStartTime = Date.now();
    this.updatePracticeBar();

    // Show chord name on staff area
    var staffEl = document.getElementById('chordStaffCanvas');
    if (staffEl) staffEl.innerHTML =
      '<div style="text-align:center;padding:20px 0">' +
        '<div style="font-size:2.6rem;font-weight:800;color:var(--primary2)">' + rootName + chordType.icon + '</div>' +
        '<div style="font-size:0.9rem;color:var(--text2);margin-top:6px">' + rootName + ' ' + chordType.name + '</div>' +
      '</div>';
    var hintEl = document.getElementById('clefHint');
    if (hintEl) hintEl.textContent = '在键盘上弹出 ' + rootName + ' ' + chordType.name + ' 的组成音';

    this._renderBuildPiano();
    this.startQuestionTimer();
  }

  _renderBuildPiano() {
    var container = document.getElementById('chordBuildPiano');
    if (!container) return;
    var ps = this.practiceState;
    var selected = ps.selectedNotes || [];
    var whiteNotes = [
      {n:'C',o:4,m:60},{n:'D',o:4,m:62},{n:'E',o:4,m:64},{n:'F',o:4,m:65},{n:'G',o:4,m:67},{n:'A',o:4,m:69},{n:'B',o:4,m:71},
      {n:'C',o:5,m:72},{n:'D',o:5,m:74},{n:'E',o:5,m:76},{n:'F',o:5,m:77},{n:'G',o:5,m:79},{n:'A',o:5,m:81},{n:'B',o:5,m:83}
    ];
    var blackNotes = [
      {m:61,p:0.6},{m:63,p:1.6},{m:66,p:3.6},{m:68,p:4.6},{m:70,p:5.6},
      {m:73,p:7.6},{m:75,p:8.6},{m:78,p:10.6},{m:80,p:11.6},{m:82,p:12.6}
    ];
    var kw = 36;
    container.style.width = (14 * kw) + 'px';
    container.innerHTML = '';
    var self = this;
    whiteNotes.forEach(function(wn, i) {
      var key = document.createElement('div');
      key.className = 'white-key' + (selected.indexOf(wn.m) >= 0 ? ' build-selected' : '');
      key.style.left = (i * kw) + 'px';
      var lbl = document.createElement('span');
      lbl.className = 'key-label'; lbl.textContent = wn.n + wn.o;
      key.appendChild(lbl);
      key.addEventListener('click', function() { self._toggleBuildNote(wn.m); });
      container.appendChild(key);
    });
    blackNotes.forEach(function(bn) {
      var key = document.createElement('div');
      key.className = 'black-key' + (selected.indexOf(bn.m) >= 0 ? ' build-selected' : '');
      key.style.left = (bn.p * kw) + 'px';
      key.addEventListener('click', function(e) { e.stopPropagation(); self._toggleBuildNote(bn.m); });
      container.appendChild(key);
    });
  }

  _toggleBuildNote(midi) {
    var ps = this.practiceState;
    if (!ps || ps.answered) return;
    if (!ps.selectedNotes) ps.selectedNotes = [];
    var idx = ps.selectedNotes.indexOf(midi);
    if (idx >= 0) ps.selectedNotes.splice(idx, 1);
    else ps.selectedNotes.push(midi);
    audio.playNote(440 * Math.pow(2, (midi - 69) / 12), 0.8);
    this._renderBuildPiano();
  }

  clearBuildNotes() {
    var ps = this.practiceState;
    if (!ps || ps.answered) return;
    ps.selectedNotes = [];
    this._renderBuildPiano();
  }

  replayBuildChord() {
    var ps = this.practiceState;
    if (!ps || !ps.currentChord) return;
    var freqs = ps.currentChord.chordFreqs;
    this._playChordSequential(freqs, null);
  }

  submitChordBuildAnswer() {
    var ps = this.practiceState;
    if (!ps || ps.answered) return;
    var selected = (ps.selectedNotes || []).slice().sort(function(a,b){return a-b;});
    if (selected.length === 0) { showToast('请先选择音符', 'warning'); return; }
    ps.answered = true;
    this.stopQuestionTimer();
    var responseTime = Date.now() - ps.questionStartTime;
    var expected = ps.currentChord.expectedMidis.slice().sort(function(a,b){return a-b;});
    // Compare interval patterns (normalized to root)
    var selInt = selected.map(function(m) { return m - selected[0]; });
    var expInt = expected.map(function(m) { return m - expected[0]; });
    var correct = selInt.length === expInt.length && selInt.every(function(v,i) { return v === expInt[i]; });
    ps.responseTimes.push(responseTime);
    ps.results.push({ chord: ps.currentChord, answer: selected, correct: correct, time: responseTime });
    if (correct) {
      ps.correct++; ps.combo++;
      if (ps.combo > ps.maxCombo) ps.maxCombo = ps.combo;
      audio.playCorrect();
      if (ps.combo > 0 && ps.combo % 10 === 0) { audio.playCombo(ps.combo); this.showComboFlash(ps.combo); }
    } else { ps.combo = 0; audio.playWrong(); }
    this.updatePracticeBar();

    // Show result on staff + disable piano
    this._renderBuildResult(correct, selected);
    document.querySelectorAll('#chordBuildPiano .white-key, #chordBuildPiano .black-key').forEach(function(k) {
      k.style.pointerEvents = 'none'; k.style.opacity = '0.5';
    });
    var self = this;
    setTimeout(function() { self.nextQuestion(); }, correct ? 1200 : 2500);
  }

  _renderBuildResult(isCorrect, selectedMidis) {
    var container = document.getElementById('chordStaffCanvas');
    if (!container) return;
    var chord = this.practiceState.currentChord;
    var NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    var noteOrder = {C:0,D:1,E:2,F:3,G:4,A:5,B:6};
    var w = 420, h = 200, sL = 60, sR = w - 30, sT = 55, ls = 12;
    var color = isCorrect ? '#4ade80' : '#f87171';
    // Build note objects from selected MIDI
    var notes = selectedMidis.map(function(midi) {
      var nm = NOTE_NAMES[midi % 12];
      return { name: nm[0], oct: Math.floor(midi/12)-1, acc: nm.indexOf('#')>=0 };
    });
    function nToY(n) { return sT + (10 - (noteOrder[n.name] + (n.oct-4)*7)) * (ls/2); }
    var svg = '<svg width="100%" viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg">';
    svg += '<defs><filter id="cG2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/><feFlood flood-color="'+color+'" flood-opacity="0.5"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    for (var i=0;i<5;i++) svg+='<line x1="'+sL+'" y1="'+(sT+i*ls)+'" x2="'+sR+'" y2="'+(sT+i*ls)+'" stroke="#8888aa" stroke-width="1.5"/>';
    svg+='<text x="'+(sL+5)+'" y="'+(sT+42)+'" font-size="48" fill="#aaa" font-family="serif" opacity="0.8">&#119070;</text>';
    var label = isCorrect ? '✓ 正确' : '✗ 正确: ' + chord.rootName + ' ' + chord.chordType.name;
    svg+='<text x="'+(w/2)+'" y="'+(sT-14)+'" text-anchor="middle" font-size="15" fill="'+color+'" font-weight="bold">'+label+'</text>';
    var x0 = sL+90, gap = 55;
    for (var n=0;n<notes.length;n++) {
      var note=notes[n], x=x0+n*gap, y=nToY(note);
      var sb=sT+4*ls;
      if(y>sb) for(var ly=sb+ls;ly<=y+2;ly+=ls) svg+='<line x1="'+(x-14)+'" y1="'+ly+'" x2="'+(x+14)+'" y2="'+ly+'" stroke="#8888aa" stroke-width="1.5"/>';
      if(y<sT) for(var ly=sT-ls;ly>=y-2;ly-=ls) svg+='<line x1="'+(x-14)+'" y1="'+ly+'" x2="'+(x+14)+'" y2="'+ly+'" stroke="#8888aa" stroke-width="1.5"/>';
      svg+='<g filter="url(#cG2)"><ellipse cx="'+x+'" cy="'+y+'" rx="10" ry="7.5" fill="'+color+'" stroke="'+color+'" stroke-width="1" transform="rotate(-15,'+x+','+y+')"/>';
      var up = y>(sT+2*ls);
      svg+=up?'<line x1="'+(x+9)+'" y1="'+(y-1)+'" x2="'+(x+9)+'" y2="'+(y-42)+'" stroke="'+color+'" stroke-width="1.8" stroke-linecap="round"/>':'<line x1="'+(x-9)+'" y1="'+(y+1)+'" x2="'+(x-9)+'" y2="'+(y+42)+'" stroke="'+color+'" stroke-width="1.8" stroke-linecap="round"/>';
      if(note.acc) svg+='<text x="'+(x-28)+'" y="'+(y+7)+'" font-size="20" fill="'+color+'" font-weight="bold" font-family="serif">♯</text>';
      svg+='</g>';
    }
    svg+='</svg>';
    container.innerHTML = svg;
  }

  // ===== PRACTICE END =====
  endPractice() {
    var ps = this.practiceState;
    if (!ps) return;

    if (ps.sprintTimer) { clearInterval(ps.sprintTimer); ps.sprintTimer = null; }

    var duration = Date.now() - ps.startTime;
    var accuracy = ps.current > 0 ? Math.round((ps.correct / ps.current) * 100) : 0;
    var avgTime = ps.responseTimes.length > 0
      ? Math.round(ps.responseTimes.reduce(function(a,b){return a+b},0) / ps.responseTimes.length) : 0;

    stats.recordSession({
      difficulty: ps.difficulty, mode: ps.mode, clef: ps.clef,
      total: ps.current, correct: ps.correct, accuracy: accuracy,
      avgTime: avgTime, duration: duration, maxCombo: ps.maxCombo,
      results: (ps.mode === 'chord' || ps.mode === 'chord_build') ? ps.results : undefined
    });

    audio.playFanfare();

    var icon = accuracy >= 90 ? '🎉' : accuracy >= 70 ? '👍' : '💪';
    var title = accuracy >= 90 ? '太棒了！' : accuracy >= 70 ? '做得不错！' : '继续加油！';
    var modeNames = { flash:'闪卡速认', sprint:'计时冲刺', clef_switch:'双谱切换', listen:'听音辨位', chord:'和弦辨识', chord_build:'和弦构建' };
    var self = this;

    var breakdownHTML = '';
    var breakdownTitle = '';
    if (ps.mode === 'chord' || ps.mode === 'chord_build') {
      breakdownTitle = ps.mode === 'chord_build' ? '各和弦构建正确率' : '各和弦类型正确率';
      var chordBreakdown = {};
      ps.results.forEach(function(r) {
        var key = r.chord.chordType.key;
        if (!chordBreakdown[key]) chordBreakdown[key] = { name: r.chord.chordType.name, icon: r.chord.chordType.icon, correct: 0, total: 0 };
        chordBreakdown[key].total++;
        if (r.correct) chordBreakdown[key].correct++;
      });
      Object.keys(chordBreakdown).forEach(function(key) {
        var bd = chordBreakdown[key];
        var pct = Math.round((bd.correct / bd.total) * 100);
        breakdownHTML += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          '<span style="width:60px;font-weight:700">' + bd.icon + ' ' + bd.name + '</span>' +
          '<div class="weak-note-bar" style="flex:1"><div class="weak-note-bar-fill" style="width:' + pct + '%;background:var(--primary)"></div></div>' +
          '<span style="width:40px;font-size:0.8rem;color:var(--text2)">' + pct + '%</span>' +
          '<span style="width:50px;font-size:0.75rem;color:var(--text3)">' + bd.correct + '/' + bd.total + '</span>' +
        '</div>';
      });
    } else {
      breakdownTitle = '各音符正确率';
      var noteBreakdown = {};
      ps.results.forEach(function(r) {
        if (!r.note) return;
        var n = r.note.name;
        if (!noteBreakdown[n]) noteBreakdown[n] = { correct: 0, total: 0 };
        noteBreakdown[n].total++;
        if (r.correct) noteBreakdown[n].correct++;
      });
      NOTES.forEach(function(n) {
        var bd = noteBreakdown[n];
        if (!bd) return;
        var pct = Math.round((bd.correct / bd.total) * 100);
        var color = NOTE_COLORS[n];
        breakdownHTML += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          '<span style="width:20px;font-weight:700;color:' + color + '">' + n + '</span>' +
          '<div class="weak-note-bar" style="flex:1"><div class="weak-note-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
          '<span style="width:40px;font-size:0.8rem;color:var(--text2)">' + pct + '%</span>' +
          '<span style="width:50px;font-size:0.75rem;color:var(--text3)">' + bd.correct + '/' + bd.total + '</span>' +
        '</div>';
      });
    }

    document.getElementById('practiceArea').innerHTML =
      '<div class="results-panel fade-in">' +
        '<div class="result-icon">' + icon + '</div>' +
        '<div class="result-title">' + title + '</div>' +
        '<div class="result-subtitle">Lv.' + ps.difficulty + ' ' + DIFFICULTY_LEVELS[ps.difficulty-1].name + ' · ' + (modeNames[ps.mode]||ps.mode) + '</div>' +
        '<div class="results-grid">' +
          '<div class="result-stat"><div class="result-stat-value" style="color:var(--success)">' + accuracy + '%</div><div class="result-stat-label">正确率</div></div>' +
          '<div class="result-stat"><div class="result-stat-value" style="color:var(--info)">' + avgTime + 'ms</div><div class="result-stat-label">平均反应</div></div>' +
          '<div class="result-stat"><div class="result-stat-value" style="color:var(--pink)">' + ps.maxCombo + 'x</div><div class="result-stat-label">最大连击</div></div>' +
        '</div>' +
        '<div class="card" style="text-align:left;max-width:400px;margin:0 auto 20px">' +
          '<div class="card-title" style="margin-bottom:10px">' + breakdownTitle + '</div>' + breakdownHTML +
        '</div>' +
        '<div style="margin-top:12px"><span class="badge badge-level">EXP +' + (ps.correct*10) + '</span></div>' +
        '<div style="display:flex;gap:12px;justify-content:center;margin-top:24px">' +
          '<button class="btn btn-primary btn-lg" onclick="app.startPractice()">再来一次</button>' +
          '<button class="btn btn-outline btn-lg" onclick="app.renderPracticeSetup()">返回设置</button>' +
        '</div>' +
      '</div>';

    this.practiceState = null;
  }

  // ===== STATS PAGE =====
  renderStats() {
    var noteAcc = stats.getNoteAccuracy();
    var clefComp = stats.getClefComparison();
    var weakNotes = stats.getWeakNotes(7);
    var timeTrend = stats.getTimeTrend(14);

    var heatmapHTML = NOTES.map(function(n) {
      var acc = noteAcc[n];
      var color = NOTE_COLORS[n];
      var bg = acc.accuracy >= 0 ? 'rgba(' + hexToRgb(color) + ',' + Math.max(0.1,acc.accuracy/100) + ')' : 'var(--bg3)';
      return '<div class="heatmap-cell" style="background:' + bg + ';color:' + (acc.accuracy>=70?'#fff':'var(--text3)') + '">' +
        '<span class="note-name">' + n + '</span><span class="note-pct">' + (acc.accuracy>=0?acc.accuracy+'%':'-') + '</span></div>';
    }).join('');

    var weakHTML = weakNotes.length > 0 ? weakNotes.map(function(wn) {
      var color = NOTE_COLORS[wn.name];
      var pct = Math.round((1-wn.errorRate)*100);
      return '<div class="weak-note-item">' +
        '<div class="weak-note-name" style="background:' + color + '20;color:' + color + '">' + wn.name + '</div>' +
        '<div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px">' +
          '<span>正确率 ' + pct + '%</span><span style="color:var(--text3)">平均 ' + Math.round(wn.avgTime) + 'ms · ' + wn.total + '题</span></div>' +
        '<div class="weak-note-bar"><div class="weak-note-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div></div></div>';
    }).join('') : '<div style="text-align:center;color:var(--text3);padding:20px">暂无数据</div>';

    var calendarHTML = '';
    var calData = stats.getCalendarData();
    // Build month calendar with navigation
    var today = new Date();
    calendarHTML += '<div id="calendarNav" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
      '<button class="btn btn-sm btn-outline" onclick="app.calendarMonth(-1)">◀ 上月</button>' +
      '<span id="calendarTitle" style="font-weight:700;font-size:0.95rem"></span>' +
      '<button class="btn btn-sm btn-outline" onclick="app.calendarMonth(1)">下月 ▶</button></div>';
    calendarHTML += '<div id="calendarGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center"></div>';
    this._calendarYear = today.getFullYear();
    this._calendarMonth = today.getMonth();

    var historyHTML = '';
    if (stats.data.history.length > 0) {
      var modeNames = { flash:'闪卡', sprint:'冲刺', clef_switch:'双谱', listen:'听音', chord:'和弦辨识', chord_build:'和弦构建' };
      historyHTML = '<div style="overflow-x:auto"><table style="width:100%;font-size:0.8rem;border-collapse:collapse"><thead>' +
        '<tr style="color:var(--text3);border-bottom:1px solid var(--border)"><th style="text-align:left;padding:8px">日期</th><th style="text-align:left;padding:8px">模式</th><th style="text-align:left;padding:8px">难度</th><th style="text-align:right;padding:8px">正确率</th><th style="text-align:right;padding:8px">反应</th><th style="text-align:right;padding:8px">连击</th></tr></thead><tbody>';
      stats.data.history.slice(0,20).forEach(function(h) {
        var d = new Date(h.date);
        var dateStr = (d.getMonth()+1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
        var accColor = h.accuracy>=80?'var(--success)':h.accuracy>=60?'var(--warning)':'var(--danger)';
        historyHTML += '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)">' +
          '<td style="padding:8px">' + dateStr + '</td><td style="padding:8px">' + (modeNames[h.mode]||h.mode) + '</td>' +
          '<td style="padding:8px">Lv.' + h.difficulty + '</td><td style="padding:8px;text-align:right;color:' + accColor + '">' + h.accuracy + '%</td>' +
          '<td style="padding:8px;text-align:right">' + h.avgTime + 'ms</td><td style="padding:8px;text-align:right;color:var(--pink)">' + h.combo + 'x</td></tr>';
      });
      historyHTML += '</tbody></table></div>';
    } else {
      historyHTML = '<div style="text-align:center;color:var(--text3);padding:30px">暂无练习记录</div>';
    }

    // Chord stats
    var chordSessions = stats.data.history.filter(function(h) { return h.mode === 'chord' || h.mode === 'chord_build'; });
    var chordTotal = chordSessions.reduce(function(s,h) { return s + h.total; }, 0);
    var chordCorrect = chordSessions.reduce(function(s,h) { return s + h.correct; }, 0);
    var chordAcc = chordTotal > 0 ? Math.round(chordCorrect / chordTotal * 100) : 0;
    var chordBuildSessions = stats.data.history.filter(function(h) { return h.mode === 'chord_build'; });
    var chordBuildAcc = 0;
    if (chordBuildSessions.length > 0) {
      var bt = chordBuildSessions.reduce(function(s,h) { return s + h.total; }, 0);
      var bc = chordBuildSessions.reduce(function(s,h) { return s + h.correct; }, 0);
      chordBuildAcc = bt > 0 ? Math.round(bc / bt * 100) : 0;
    }

    document.getElementById('statsContent').innerHTML =
      '<div class="fade-in">' +
        '<div class="page-header"><div><div class="page-title">练习统计</div><div class="page-desc">查看你的识谱练习数据</div></div></div>' +
        '<div class="grid grid-4" style="margin-bottom:20px">' +
          '<div class="stat-card"><div class="stat-icon">📊</div><div class="stat-number">' + stats.data.totalSessions + '</div><div class="stat-label">总练习次数</div></div>' +
          '<div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-number">' + (stats.data.totalNotes>0?Math.round(stats.data.totalCorrect/stats.data.totalNotes*100):0) + '%</div><div class="stat-label">总正确率</div></div>' +
          '<div class="stat-card"><div class="stat-icon">🔥</div><div class="stat-number">' + stats.data.streak + '</div><div class="stat-label">连续打卡</div></div>' +
          '<div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-number">' + (stats.data.history.length>0?Math.round(stats.data.history.reduce(function(s,h){return s+h.avgTime},0)/stats.data.history.length):0) + 'ms</div><div class="stat-label">平均反应</div></div>' +
        '</div>' +
        '<div class="grid grid-3" style="margin-bottom:20px">' +
          '<div class="stat-card"><div class="stat-icon">🎹</div><div class="stat-number">' + chordSessions.length + '</div><div class="stat-label">和弦练习次数</div></div>' +
          '<div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-number">' + chordAcc + '%</div><div class="stat-label">和弦辨识正确率</div></div>' +
          '<div class="stat-card"><div class="stat-icon">🏗️</div><div class="stat-number">' + chordBuildAcc + '%</div><div class="stat-label">和弦构建正确率</div></div>' +
        '</div>' +
        '<div class="grid grid-2">' +
          '<div class="card"><div class="card-title" style="margin-bottom:12px">各音符正确率</div><div class="heatmap-grid">' + heatmapHTML + '</div></div>' +
          '<div class="card"><div class="card-title" style="margin-bottom:12px">谱号对比</div>' +
            '<div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>𝄞 高音谱</span><span style="color:var(--primary2)">' + clefComp.treble + '%</span></div><div class="progress-bar"><div class="progress-bar-fill" style="width:' + clefComp.treble + '%;background:var(--primary)"></div></div><div style="font-size:0.75rem;color:var(--text3);margin-top:4px">' + clefComp.trebleTotal + ' 题</div></div>' +
            '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>𝄢 低音谱</span><span style="color:var(--cyan)">' + clefComp.bass + '%</span></div><div class="progress-bar"><div class="progress-bar-fill" style="width:' + clefComp.bass + '%;background:var(--cyan)"></div></div><div style="font-size:0.75rem;color:var(--text3);margin-top:4px">' + clefComp.bassTotal + ' 题</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="card" style="margin-top:16px"><div class="card-title" style="margin-bottom:12px">薄弱音符 Top ' + weakNotes.length + '</div>' + weakHTML + '</div>' +

        // Chord type breakdown
        (function() {
          var chordTypes = {};
          stats.data.history.filter(function(h) { return h.mode === 'chord' || h.mode === 'chord_build'; }).forEach(function(h) {
            if (!h.results) return;
            h.results.forEach(function(r) {
              if (!r.chord) return;
              var key = r.chord.chordType.key;
              if (!chordTypes[key]) chordTypes[key] = { name: r.chord.chordType.name, icon: r.chord.chordType.icon, correct: 0, total: 0 };
              chordTypes[key].total++;
              if (r.correct) chordTypes[key].correct++;
            });
          });
          var chords = Object.keys(chordTypes).map(function(k) { return Object.assign({key:k}, chordTypes[k]); });
          if (chords.length === 0) return '';
          chords.sort(function(a,b) { return (a.correct/a.total) - (b.correct/b.total); });
          var weakChords = chords.filter(function(c) { return c.correct/c.total < 0.7; });
          var chordHTML = chords.map(function(c) {
            var pct = Math.round(c.correct/c.total*100);
            var color = pct>=80?'var(--success)':pct>=60?'var(--warning)':'var(--danger)';
            return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
              '<span style="width:80px;font-weight:700;font-size:0.85rem">' + c.icon + ' ' + c.name + '</span>' +
              '<div class="weak-note-bar" style="flex:1"><div class="weak-note-bar-fill" style="width:'+pct+'%;background:'+color+'"></div></div>' +
              '<span style="width:40px;font-size:0.8rem;color:var(--text2);text-align:right">'+pct+'%</span>' +
              '<span style="width:50px;font-size:0.75rem;color:var(--text3);text-align:right">'+c.correct+'/'+c.total+'</span></div>';
          }).join('');
          var weakLabel = weakChords.length > 0 ? '薄弱: ' + weakChords.map(function(c){return c.icon+c.name}).join(', ') : '暂无薄弱和弦';
          return '<div class="card" style="margin-top:16px"><div class="card-title" style="margin-bottom:12px">和弦类型正确率</div>' + chordHTML +
            '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:0.8rem;color:var(--text3)">' + weakLabel + '</div></div>';
        })() +

        '<div class="card" style="margin-top:16px"><div class="card-title" style="margin-bottom:12px">练习日历</div>' + calendarHTML + '</div>' +
        '<div class="card" style="margin-top:16px"><div class="card-title" style="margin-bottom:12px">反应时间趋势</div><div class="chart-container"><canvas id="timeTrendChart"></canvas></div></div>' +
        '<div class="card" style="margin-top:16px"><div class="card-title" style="margin-bottom:12px">练习历史</div>' + historyHTML + '</div>' +
        '<div style="display:flex;justify-content:center;gap:10px;margin-top:20px">' +
          '<button class="btn btn-outline btn-sm" onclick="app.exportData()">📦 导出数据</button>' +
          '<button class="btn btn-outline btn-sm" onclick="document.getElementById(\'importFile\').click()">📥 导入数据</button>' +
          '<input type="file" id="importFile" accept=".json" style="display:none" onchange="app.importData(this)">' +
          '<button class="btn btn-danger btn-sm" onclick="if(confirm(\'确定重置所有数据?\')){stats.reset();app.renderStats();showToast(\'已重置\',\'info\')}">重置所有数据</button>' +
        '</div>' +
      '</div>';

    var self = this;
    setTimeout(function() {
      self.renderTimeTrendChart(timeTrend);
      self._renderCalendarGrid();
    }, 100);
  }

  calendarMonth(delta) {
    this._calendarMonth += delta;
    if (this._calendarMonth > 11) { this._calendarMonth = 0; this._calendarYear++; }
    if (this._calendarMonth < 0) { this._calendarMonth = 11; this._calendarYear--; }
    this._renderCalendarGrid();
  }

  _renderCalendarGrid() {
    var grid = document.getElementById('calendarGrid');
    var title = document.getElementById('calendarTitle');
    if (!grid || !title) return;
    var y = this._calendarYear, m = this._calendarMonth;
    var monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    title.textContent = y + '年 ' + monthNames[m];
    var calData = stats.getCalendarData();
    var dayNames = ['日','一','二','三','四','五','六'];
    var html = dayNames.map(function(d) { return '<div style="font-size:0.7rem;color:var(--text3);padding:4px 0">'+d+'</div>'; }).join('');
    var firstDay = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m+1, 0).getDate();
    var today = new Date();
    var todayStr = today.toISOString().split('T')[0];
    // Empty cells before first day
    for (var i = 0; i < firstDay; i++) html += '<div></div>';
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr = y + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      var data = calData[dateStr];
      var level = 0;
      if (data) {
        if (data.count >= 100) level = 4;
        else if (data.count >= 50) level = 3;
        else if (data.count >= 20) level = 2;
        else level = 1;
      }
      var isToday = dateStr === todayStr;
      var border = isToday ? 'border:1px solid var(--primary);' : '';
      html += '<div class="calendar-cell level-' + level + '" style="' + border + 'font-size:0.7rem;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px" title="' + dateStr + ': ' + (data?data.count+'题':'无') + '">' + d + '</div>';
    }
    grid.innerHTML = html;
  }

  exportData() {
    var data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      stats: stats.data,
      settings: this.settings
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '识谱大师_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    showToast('数据已导出', 'success');
  }

  importData(input) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data.stats) { showToast('无效的数据文件', 'error'); return; }
        if (!confirm('导入将覆盖当前数据，确定继续？')) return;
        stats.data = Object.assign(stats.data, data.stats);
        stats.save();
        if (data.settings) {
          Object.assign(app.settings, data.settings);
          app.saveSettings();
        }
        app.renderStats();
        showToast('数据导入成功', 'success');
      } catch(err) {
        showToast('导入失败: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  renderTimeTrendChart(trend) {
    var canvas = document.getElementById('timeTrendChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var container = canvas.parentElement;
    canvas.width = container.clientWidth || 500;
    canvas.height = 250;

    var data = trend.filter(function(t) { return t.avgTime !== null; });
    if (data.length === 0) {
      ctx.fillStyle = '#666680';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无数据', canvas.width/2, canvas.height/2);
      return;
    }

    var pad = { top:20, right:20, bottom:40, left:50 };
    var w = canvas.width - pad.left - pad.right;
    var h = canvas.height - pad.top - pad.bottom;
    var maxTime = Math.max.apply(null, data.map(function(d){return d.avgTime})) || 3000;

    ctx.strokeStyle = '#333355';
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) {
      var y = pad.top + (h/4)*i;
      ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(pad.left+w,y); ctx.stroke();
      ctx.fillStyle = '#666680'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxTime - (maxTime/4)*i) + 'ms', pad.left-8, y+4);
    }

    ctx.strokeStyle = '#6c63ff'; ctx.lineWidth = 2; ctx.beginPath();
    data.forEach(function(d, i) {
      var x = pad.left + (w/(data.length-1||1))*i;
      var y = pad.top + h - ((d.avgTime/maxTime)*h);
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();

    data.forEach(function(d, i) {
      var x = pad.left + (w/(data.length-1||1))*i;
      var y = pad.top + h - ((d.avgTime/maxTime)*h);
      ctx.fillStyle = '#6c63ff'; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#666680'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(d.date.slice(5), x, canvas.height-10);
    });
  }

  // ===== PLAN PAGE =====
  renderPlan() {
    var plan = planGenerator.generateDailyPlan();
    var achievements = planGenerator.getAchievements();
    var totalMin = plan.reduce(function(s,p){return s+p.duration},0);
    this._planConfigs = plan.map(function(p){return p.config});

    var planHTML = plan.map(function(item, i) {
      return '<div class="plan-item"><span class="plan-icon">' + item.icon + '</span>' +
        '<div class="plan-info"><div class="plan-title">' + item.title + '</div><div class="plan-desc">' + item.desc + '</div>' +
        '<div class="plan-meta"><span>⏱ ' + item.duration + '分钟</span></div></div>' +
        '<button class="btn btn-primary btn-sm plan-action" onclick="app.startPlanByIndex(' + i + ')">开始</button></div>';
    }).join('');

    var achHTML = achievements.map(function(a) {
      return '<div style="text-align:center;padding:12px;background:' + (a.unlocked?'rgba(108,99,255,0.1)':'var(--bg3)') + ';border-radius:8px;opacity:' + (a.unlocked?1:0.4) + '">' +
        '<div style="font-size:1.5rem;margin-bottom:4px">' + a.icon + '</div><div style="font-size:0.85rem;font-weight:600">' + a.name + '</div>' +
        '<div style="font-size:0.7rem;color:var(--text3);margin-top:2px">' + a.desc + '</div>' +
        (a.unlocked?'<div style="font-size:0.7rem;color:var(--success);margin-top:4px">✅ 已解锁</div>':'') + '</div>';
    }).join('');

    document.getElementById('planContent').innerHTML =
      '<div class="fade-in">' +
        '<div class="page-header"><div><div class="page-title">练习计划</div><div class="page-desc">根据你的练习数据智能生成</div></div><span class="badge badge-primary">预计 ' + totalMin + ' 分钟</span></div>' +
        '<div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(108,99,255,0.1),rgba(34,211,238,0.08))">' +
          '<div style="display:flex;align-items:center;gap:12px"><span style="font-size:1.5rem">💡</span><div><div style="font-weight:600">训练建议</div><div style="color:var(--text2);font-size:0.85rem;margin-top:2px">' + planGenerator.getMotivationMessage() + '</div></div></div>' +
        '</div>' + planHTML +
        '<div class="card" style="margin-top:24px"><div class="card-title" style="margin-bottom:12px">🏆 成就墙</div><div class="grid grid-3">' + achHTML + '</div></div>' +
      '</div>';
  }

  // ===== ACHIEVEMENTS PAGE =====
  renderAchievements() {
    var achievements = planGenerator.getAchievements();
    var unlocked = achievements.filter(function(a){return a.unlocked}).length;

    var achHTML = achievements.map(function(a) {
      return '<div class="card" style="text-align:center;' + (a.unlocked?'border-color:var(--primary)':'opacity:0.5') + '">' +
        '<div style="font-size:2rem;margin-bottom:8px">' + a.icon + '</div>' +
        '<div style="font-weight:700;font-size:1rem;margin-bottom:4px">' + a.name + '</div>' +
        '<div style="font-size:0.8rem;color:var(--text2)">' + a.desc + '</div>' +
        '<div style="margin-top:8px"><span class="badge ' + (a.unlocked?'badge-success':'badge-primary') + '">' + (a.unlocked?'已解锁':'未解锁') + '</span></div></div>';
    }).join('');

    document.getElementById('achievementsContent').innerHTML =
      '<div class="fade-in">' +
        '<div class="page-header"><div><div class="page-title">成就系统</div><div class="page-desc">' + unlocked + ' / ' + achievements.length + ' 已解锁</div></div></div>' +
        '<div class="progress-bar" style="margin-bottom:24px;height:8px"><div class="progress-bar-fill" style="width:' + (unlocked/achievements.length*100) + '%"></div></div>' +
        '<div class="grid grid-3">' + achHTML + '</div>' +
      '</div>';
  }

  // ===== SCALE PRACTICE PAGE =====
  renderScalePage() {
    if (!this.scalePractice) {
      this.scalePractice = new ScalePractice(this);
    }
    this.scalePractice.renderSetup();
  }
}

function hexToRgb(hex) {
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  return r+','+g+','+b;
}

function showToast(message, type) {
  type = type || 'info';
  var container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3000);
}

// ===== Init =====
var app;
try { app = new App(); } catch(e) { console.error('App constructor error:', e); }

function initApp() {
  if (!app) { try { app = new App(); } catch(e) { console.error(e); } }
  if (app) {
    try { app.init(); } catch(e) {
      console.error('Init error:', e);
      document.getElementById('homeContent').innerHTML = '<div class="card" style="color:#f87171;padding:40px">初始化出错: ' + e.message + '</div>';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
