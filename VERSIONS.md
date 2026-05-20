# 版本记录

## v3.0.0 (2026-05-20)
- 新增：和弦构建模式（给出和弦名称→键盘弹奏→判定→五线谱展示）
- 新增：和弦辨识逐音播放（_playChordSequential）
- 新增：6套主题（深空/午夜/晨光/霓虹/暖阳/纯黑）
- 新增：练习日历月视图切换
- 新增：数据导出/导入功能
- 新增：和弦类型正确率统计
- 新增：练习计划含和弦辨识+和弦构建
- 优化：钢琴键盘深色主题融合
- 优化：应用名称统一为「识谱大师」

## v2.0.0 (2026-05-19)
- 音阶练习模块
- 节拍器（12种拍号）
- 指法显示

## v1.0.0 (2026-05-18)
- 闪卡速认/计时冲刺/双谱切换/听音辨位
- 和弦辨识（基础版）
- 练习统计/成就系统/每日计划

---

## 回退方法

### 方法1: Git 标签回退
```bash
# 查看所有版本标签
git tag -l "v*"

# 回退到指定版本
git checkout v3.0.0

# 创建回退分支（推荐）
git checkout -b rollback-v3.0.0 v3.0.0
```

### 方法2: 快照文件回退
```bash
# 查看快照目录
ls snapshots/

# 用快照覆盖当前文件
cp snapshots/v3.0.0-app.js js/app.js
cp snapshots/v3.0.0-style.css css/style.css
cp snapshots/v3.0.0-index.html index.html

# 重新打包
python -c "..." # 运行打包脚本
```

### 方法3: 手动备份
在重大修改前，手动运行：
```bash
# 创建快照
mkdir -p snapshots
cp js/app.js snapshots/v3.0.0-app.js
cp css/style.css snapshots/v3.0.0-style.css
cp index.html snapshots/v3.0.0-index.html
cp js/stats.js snapshots/v3.0.0-stats.js
cp js/plan.js snapshots/v3.0.0-plan.js
cp js/renderer.js snapshots/v3.0.0-renderer.js
```
