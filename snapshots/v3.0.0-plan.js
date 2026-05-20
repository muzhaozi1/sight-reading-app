// ========== Practice Plan Generator ==========

class PlanGenerator {
  constructor(statsManager) {
    this.stats = statsManager;
  }

  // Generate a daily practice plan based on performance data
  generateDailyPlan() {
    const plan = [];
    const data = this.stats.data;
    const levelInfo = this.stats.getLevelInfo();
    const weakNotes = this.stats.getWeakNotes(5);
    const clefComp = this.stats.getClefComparison();

    // 1. Warm-up (always first)
    plan.push({
      id: 'warmup',
      icon: '🔥',
      title: '热身',
      desc: '轻松回顾已掌握的音符',
      duration: 3,
      type: 'practice',
      config: {
        difficulty: Math.max(1, Math.min(levelInfo.level, 3)),
        mode: 'flash',
        clef: 'random',
        noteCount: 15,
        isWarmup: true
      }
    });

    // 2. Weak note training (if any weak notes)
    if (weakNotes.length > 0 && weakNotes[0].errorRate > 0.2) {
      const targetNotes = weakNotes.filter(n => n.errorRate > 0.2).slice(0, 3);
      plan.push({
        id: 'weak_notes',
        icon: '🎯',
        title: '弱项强化',
        desc: `重点练习: ${targetNotes.map(n => n.name).join(', ')} (错误率最高)`,
        duration: 5,
        type: 'practice',
        config: {
          difficulty: Math.max(1, Math.min(levelInfo.level, 3)),
          mode: 'flash',
          clef: 'random',
          noteCount: 25,
          targetNotes: targetNotes.map(n => n.name),
          isWarmup: false
        }
      });
    }

    // 3. Clef balance (if one clef is significantly weaker)
    if (clefComp.trebleTotal > 10 && clefComp.bassTotal > 10) {
      const diff = Math.abs(clefComp.treble - clefComp.bass);
      if (diff > 15) {
        const weakerClef = clefComp.treble < clefComp.bass ? 'bass' : 'treble';
        const clefName = weakerClef === 'treble' ? '高音谱' : '低音谱';
        plan.push({
          id: 'clef_balance',
          icon: '⚖️',
          title: `${clefName}强化`,
          desc: `${clefName}正确率偏低，专项提升`,
          duration: 4,
          type: 'practice',
          config: {
            difficulty: Math.max(1, Math.min(levelInfo.level, 3)),
            mode: 'flash',
            clef: weakerClef,
            noteCount: 20,
            isWarmup: false
          }
        });
      }
    }

    // 4. Speed challenge (if accuracy is good but speed is slow)
    const recentHistory = data.history.slice(0, 10);
    if (recentHistory.length >= 3) {
      const avgAcc = recentHistory.reduce((s, h) => s + h.accuracy, 0) / recentHistory.length;
      const avgTime = recentHistory.reduce((s, h) => s + h.avgTime, 0) / recentHistory.length;
      if (avgAcc >= 85 && avgTime > 2500) {
        plan.push({
          id: 'speed',
          icon: '⚡',
          title: '速度冲刺',
          desc: '正确率达标，提升反应速度',
          duration: 4,
          type: 'practice',
          config: {
            difficulty: Math.max(1, Math.min(levelInfo.level, 3)),
            mode: 'sprint',
            clef: 'random',
            sprintDuration: 60,
            isWarmup: false
          }
        });
      }
    }

    // 5. Dual clef practice (if at level 2+)
    if (levelInfo.level >= 2) {
      plan.push({
        id: 'dual_clef',
        icon: '🔄',
        title: '双谱切换',
        desc: '高低音谱随机交替，训练快速切换',
        duration: 3,
        type: 'practice',
        config: {
          difficulty: Math.max(1, Math.min(levelInfo.level, 3)),
          mode: 'clef_switch',
          clef: 'random',
          noteCount: 20,
          isWarmup: false
        }
      });
    }

    // 6. Chord recognition
    plan.push({
      id: 'chord',
      icon: '🎹',
      title: '和弦辨识',
      desc: '听和声辨别和弦类型，训练和声听觉',
      duration: 3,
      type: 'practice',
      config: {
        mode: 'chord',
        noteCount: 15,
        isWarmup: false
      }
    });

    // 7. Chord build
    plan.push({
      id: 'chord_build',
      icon: '🏗️',
      title: '和弦构建',
      desc: '给出和弦名称，在键盘上弹出组成音',
      duration: 3,
      type: 'practice',
      config: {
        mode: 'chord_build',
        noteCount: 15,
        isWarmup: false
      }
    });

    // 8. Daily challenge
    plan.push({
      id: 'daily_challenge',
      icon: '🏆',
      title: '每日挑战',
      desc: '完成今日挑战获取额外经验值',
      duration: 2,
      type: 'practice',
      config: {
        difficulty: Math.min(levelInfo.level + 1, 5),
        mode: 'sprint',
        clef: 'random',
        sprintDuration: 30,
        isDailyChallenge: true,
        isWarmup: false
      }
    });

    return plan;
  }

  // Get difficulty recommendation
  getRecommendedDifficulty() {
    const data = this.stats.data;
    const recentHistory = data.history.slice(0, 10);

    if (recentHistory.length < 3) return 1;

    const avgAcc = recentHistory.reduce((s, h) => s + h.accuracy, 0) / recentHistory.length;
    const maxRecentDiff = Math.max(...recentHistory.map(h => h.difficulty));

    if (avgAcc >= 90 && maxRecentDiff < 5) return maxRecentDiff + 1;
    if (avgAcc < 60 && maxRecentDiff > 1) return maxRecentDiff - 1;
    return maxRecentDiff;
  }

  // Get motivational message based on stats
  getMotivationMessage() {
    const data = this.stats.data;
    const streak = data.streak;
    const levelInfo = this.stats.getLevelInfo();

    if (streak >= 30) return '太厉害了！连续练习超过一个月！';
    if (streak >= 7) return '一周坚持打卡，保持这个节奏！';
    if (streak >= 3) return '连续三天，正在养成好习惯！';
    if (data.totalSessions === 0) return '开始你的识谱之旅吧！';
    if (levelInfo.progress > 0.8) return '快要升级了，加油！';
    return '每天练习，稳步进步！';
  }

  // Get achievement list with status
  getAchievements() {
    const all = [
      { id: 'first_session', name: '初次尝试', desc: '完成第一次练习', icon: '🎵' },
      { id: 'note_100', name: '百音识谱', desc: '累计识别100个音符', icon: '💯' },
      { id: 'note_1000', name: '千音达人', desc: '累计识别1000个音符', icon: '🔥' },
      { id: 'streak_3', name: '三天打卡', desc: '连续三天练习', icon: '📅' },
      { id: 'streak_7', name: '一周坚持', desc: '连续七天练习', icon: '🗓️' },
      { id: 'streak_30', name: '月度达人', desc: '连续三十天练习', icon: '👑' },
      { id: 'acc_90', name: '准确无误', desc: '连续10次练习正确率≥90%', icon: '🎯' },
      { id: 'level_5', name: '五级新手', desc: '达到5级', icon: '⭐' },
      { id: 'level_10', name: '识谱高手', desc: '达到10级', icon: '🌟' },
      { id: 'bass_master', name: '低音达人', desc: '低音谱正确率≥90%且练习≥200', icon: '🎼' },
      { id: 'treble_master', name: '高音达人', desc: '高音谱正确率≥90%且练习≥200', icon: '🎶' },
      { id: 'speed_demon', name: '闪电之眼', desc: '单次练习平均反应<1.5s且正确率≥80%', icon: '⚡' }
    ];

    return all.map(a => ({
      ...a,
      unlocked: this.stats.data.achievements.includes(a.id)
    }));
  }
}

const planGenerator = new PlanGenerator(stats);
