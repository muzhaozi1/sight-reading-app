// ========== Statistics Module ==========

class StatsManager {
  constructor() {
    this.STORAGE_KEY = 'sight_reading_stats';
    this.data = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return this.getDefaultData();
  }

  getDefaultData() {
    return {
      totalSessions: 0,
      totalNotes: 0,
      totalCorrect: 0,
      totalTime: 0, // ms
      exp: 0,
      level: 1,
      streak: 0,        // Current daily streak
      bestStreak: 0,
      lastPracticeDate: null,
      // Per-note stats: { "C": { correct: 0, total: 0, avgTime: 0, times: [] }, ... }
      noteStats: {},
      // Per-clef stats
      clefStats: {
        treble: { correct: 0, total: 0 },
        bass: { correct: 0, total: 0 }
      },
      // Per-difficulty stats
      diffStats: {
        1: { sessions: 0, avgScore: 0 },
        2: { sessions: 0, avgScore: 0 },
        3: { sessions: 0, avgScore: 0 },
        4: { sessions: 0, avgScore: 0 },
        5: { sessions: 0, avgScore: 0 }
      },
      // Session history (last 100)
      history: [],
      // Daily records for calendar heatmap: { "2026-05-16": { count: 50, correct: 45 } }
      dailyRecords: {},
      // Achievements
      achievements: []
    };
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {}
  }

  // Record a single answer
  recordAnswer(noteName, clef, correct, responseTime) {
    // Note stats
    if (!this.data.noteStats[noteName]) {
      this.data.noteStats[noteName] = { correct: 0, total: 0, totalTime: 0, times: [] };
    }
    const ns = this.data.noteStats[noteName];
    ns.total++;
    if (correct) ns.correct++;
    ns.totalTime += responseTime;
    ns.times.push(responseTime);
    if (ns.times.length > 100) ns.times.shift(); // Keep last 100

    // Clef stats
    this.data.clefStats[clef].total++;
    if (correct) this.data.clefStats[clef].correct++;

    // Global stats
    this.data.totalNotes++;
    if (correct) this.data.totalCorrect++;
    this.data.totalTime += responseTime;

    // EXP
    if (correct) {
      this.data.exp += 10;
      if (responseTime < 1000) this.data.exp += 5; // Speed bonus
    }

    // Level up check
    const newLevel = Math.floor(this.data.exp / 500) + 1;
    if (newLevel > this.data.level) {
      this.data.level = newLevel;
    }

    this.save();
    return this.data.level;
  }

  // Record a completed session
  recordSession(sessionData) {
    const today = new Date().toISOString().split('T')[0];

    this.data.totalSessions++;

    // Update difficulty stats
    const diff = sessionData.difficulty;
    const ds = this.data.diffStats[diff];
    ds.sessions++;
    ds.avgScore = ((ds.avgScore * (ds.sessions - 1)) + sessionData.accuracy) / ds.sessions;

    // Update daily record
    if (!this.data.dailyRecords[today]) {
      this.data.dailyRecords[today] = { count: 0, correct: 0, time: 0 };
    }
    const daily = this.data.dailyRecords[today];
    daily.count += sessionData.total;
    daily.correct += sessionData.correct;
    daily.time += sessionData.duration;

    // Update streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (this.data.lastPracticeDate === yesterday || this.data.lastPracticeDate === today) {
      if (this.data.lastPracticeDate !== today) {
        this.data.streak++;
      }
    } else {
      this.data.streak = 1;
    }
    this.data.lastPracticeDate = today;
    if (this.data.streak > this.data.bestStreak) {
      this.data.bestStreak = this.data.streak;
    }

    // Add to history
    this.data.history.unshift({
      date: new Date().toISOString(),
      difficulty: sessionData.difficulty,
      mode: sessionData.mode,
      clef: sessionData.clef,
      total: sessionData.total,
      correct: sessionData.correct,
      accuracy: sessionData.accuracy,
      avgTime: sessionData.avgTime,
      duration: sessionData.duration,
      combo: sessionData.maxCombo
    });
    if (this.data.history.length > 100) this.data.history.pop();

    // Check achievements
    this.checkAchievements();

    this.save();
  }

  checkAchievements() {
    const checks = [
      { id: 'first_session', name: '初次尝试', check: () => this.data.totalSessions >= 1 },
      { id: 'note_100', name: '百音识谱', check: () => this.data.totalNotes >= 100 },
      { id: 'note_1000', name: '千音达人', check: () => this.data.totalNotes >= 1000 },
      { id: 'streak_3', name: '三天打卡', check: () => this.data.streak >= 3 },
      { id: 'streak_7', name: '一周坚持', check: () => this.data.streak >= 7 },
      { id: 'streak_30', name: '月度达人', check: () => this.data.streak >= 30 },
      { id: 'acc_90', name: '准确无误', check: () => {
        const recent = this.data.history.slice(0, 10);
        return recent.length >= 10 && recent.every(s => s.accuracy >= 90);
      }},
      { id: 'level_5', name: '五级新手', check: () => this.data.level >= 5 },
      { id: 'level_10', name: '识谱高手', check: () => this.data.level >= 10 },
      { id: 'bass_master', name: '低音达人', check: () => {
        const bs = this.data.clefStats.bass;
        return bs.total >= 200 && (bs.correct / bs.total) >= 0.9;
      }},
      { id: 'treble_master', name: '高音达人', check: () => {
        const ts = this.data.clefStats.treble;
        return ts.total >= 200 && (ts.correct / ts.total) >= 0.9;
      }},
      { id: 'speed_demon', name: '闪电之眼', check: () => {
        return this.data.history.some(s => s.avgTime < 1500 && s.accuracy >= 80);
      }}
    ];

    checks.forEach(({ id, name, check }) => {
      if (!this.data.achievements.includes(id) && check()) {
        this.data.achievements.push(id);
        showToast(`🏆 成就解锁: ${name}`, 'success');
      }
    });
  }

  // Get weak notes (sorted by error rate descending)
  getWeakNotes(limit = 7) {
    const results = [];
    for (const [name, stats] of Object.entries(this.data.noteStats)) {
      if (stats.total < 3) continue; // Need minimum data
      const errorRate = 1 - (stats.correct / stats.total);
      const avgTime = stats.totalTime / stats.total;
      results.push({ name, errorRate, avgTime, total: stats.total, correct: stats.correct });
    }
    results.sort((a, b) => b.errorRate - a.errorRate);
    return results.slice(0, limit);
  }

  // Get note accuracy for heatmap
  getNoteAccuracy() {
    const result = {};
    for (const name of NOTES) {
      const stats = this.data.noteStats[name];
      if (stats && stats.total > 0) {
        result[name] = {
          accuracy: Math.round((stats.correct / stats.total) * 100),
          avgTime: Math.round(stats.totalTime / stats.total),
          total: stats.total
        };
      } else {
        result[name] = { accuracy: -1, avgTime: 0, total: 0 }; // No data
      }
    }
    return result;
  }

  // Get clef comparison
  getClefComparison() {
    const treble = this.data.clefStats.treble;
    const bass = this.data.clefStats.bass;
    return {
      treble: treble.total > 0 ? Math.round((treble.correct / treble.total) * 100) : 0,
      bass: bass.total > 0 ? Math.round((bass.correct / bass.total) * 100) : 0,
      trebleTotal: treble.total,
      bassTotal: bass.total
    };
  }

  // Get daily records for calendar (last 90 days)
  getCalendarData() {
    const data = {};
    for (let i = 0; i < 90; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      data[d] = this.data.dailyRecords[d] || null;
    }
    return data;
  }

  // Get response time trend (from history)
  getTimeTrend(days = 14) {
    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      const sessions = this.data.history.filter(s => s.date.startsWith(d));
      if (sessions.length > 0) {
        const avgTime = sessions.reduce((sum, s) => sum + s.avgTime, 0) / sessions.length;
        const avgAcc = sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length;
        trend.push({ date: d, avgTime: Math.round(avgTime), accuracy: Math.round(avgAcc), sessions: sessions.length });
      } else {
        trend.push({ date: d, avgTime: null, accuracy: null, sessions: 0 });
      }
    }
    return trend;
  }

  // Get EXP level info
  getLevelInfo() {
    const exp = this.data.exp;
    const level = this.data.level;
    const expForCurrent = (level - 1) * 500;
    const expForNext = level * 500;
    const progress = (exp - expForCurrent) / (expForNext - expForCurrent);
    const titles = ['新手', '见习', '学徒', '熟练', '精通', '专家', '大师', '宗师', '传说'];
    const title = titles[Math.min(level - 1, titles.length - 1)];
    return { level, exp, progress, title, expForNext };
  }

  // Reset all data
  reset() {
    this.data = this.getDefaultData();
    this.save();
  }
}

const stats = new StatsManager();
