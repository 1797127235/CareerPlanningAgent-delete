# CareerOS 演示视频 v3 设计文档

**日期**: 2026-05-31
**主题**: 全局弹性动画升级 + GraphJDScene 叙事重设计
**目标**: 在保持信息清晰的前提下，通过物理弹性动效提升视觉冲击力

---

## 1. 设计目标

### 核心诉求
- **讲得好**: GraphJDScene 信息展示清晰，三段式叙事（定位→诊断→路径）
- **做得炫酷**: 全局弹性物理动画，卡片/文字/数字弹出有真实物理感

### 约束
- 零新依赖（仅使用 Remotion 原生 `spring()`）
- 渲染速度与 v2 基本一致
- 总时长保持 115s

---

## 2. 全局弹性动画策略

### 2.1 弹性参数体系

定义 3 级弹性强度：

| 级别 | 名称 | 参数 | 用途 |
|------|------|------|------|
| 强弹性 | `springBounce` | damping: 10, stiffness: 120, mass: 0.8 | 重要结论弹出（匹配度卡片、CTA 按钮） |
| 中弹性 | `springPop` | damping: 15, stiffness: 100, mass: 1 | 信息卡片入场、节点展开 |
| 柔和弹性 | `springSoft` | damping: 20, stiffness: 80, mass: 1.2 | 文字行入场、次要元素 |

### 2.2 新增动画组件

在 `Animations.tsx` 中新增：

- `SpringFadeIn`: 替代 FadeIn，带弹性位移
- `SpringScaleIn`: 替代 ScaleIn，带弹性缩放
- `StaggerSpring`: 子元素依次弹性入场（间隔 3-5 frames）

### 2.3 回退策略

所有弹性动画提供 fallback：如果 spring() 在极端帧范围表现异常，自动回退到 interpolate 平滑动画。

---

## 3. GraphJDScene 三段式重设计

### 3.1 总览

- **时长**: 25s（750 frames）
- **背景**: C.bg（米白色）
- **结构**: 三阶段递进，每阶段信息密度递增

### 3.2 阶段 1：定位（0-8s，0-240f）

**核心信息**: 系统从 45 个岗位中定位了林小北的职业坐标

**画面布局**:
- 顶部: MiniNavbar（职位地图）+ 阶段标题 "02 · 岗位图谱"
- 中央: 45 个岗位节点以 6×8 蜂窝网格分布，节点大小 = 岗位热度
- 只有 "前端开发 → 高级前端 → 前端架构" 这条路径的节点亮起（chestnut 色），其余节点为浅灰色
- 底部文案: "在 45 个 IT 岗位中，系统定位了你的职业坐标"

**动画**:
1. 0-2s: 所有节点从 scale(0) 弹性弹入（springPop，stagger 从左到右，间隔 2 frames）
2. 2-5s: 非目标节点透明度降到 0.25，目标路径节点亮度提升
3. 5-8s: 目标路径的 3 个节点之间出现连接线（SVG path，dash-offset 动画）

### 3.3 阶段 2：诊断（8-18s，240-540f）

**核心信息**: 目标岗位匹配度 73%，3 项核心能力存在差距

**画面布局**:
- 左侧（40%）: 岗位要求雷达图 —— 5 维度：技能深度、场景宽度、薪资潜势、转型空间、AI 协同
- 右侧（40%）: 林小北能力雷达图 —— 同 5 维度，实际得分
- 中央（20%）: 匹配度大数字 "73%"，下方 "3 项核心能力差距"
- 差距区域: 两张雷达图重叠处，低于要求的维度用红色脉冲高亮

**动画**:
1. 8-10s: 阶段 1 的节点网格整体缩小到背景（scale 0.6, opacity 0.15）
2. 10-12s: 两张雷达图从中心向外弹性展开（springSoft）
3. 12-15s: 差距维度逐个红色高亮（stagger，间隔 8 frames）
4. 15-18s: 中央匹配度数字从 0% 弹性计数到 73%（springBounce + NumberTicker）

### 3.4 阶段 3：路径（18-25s，540-750f）

**核心信息**: 系统已生成 1200 小时的专属成长路径

**画面布局**:
- 中央: 3 张能力差距卡片垂直排列
  - Performance: 当前 65% → 目标 90%，进度条弹性填充
  - 架构设计: 当前 50% → 目标 85%，进度条弹性填充
  - 团队管理: 标记为"需提升"
- 底部: 大文案 "预计学习 1200 小时" + 阶段总结 "系统已生成专属成长路径"

**动画**:
1. 18-20s: 阶段 2 的雷达图向两侧滑出离场
2. 20-23s: 3 张差距卡片 staggered 弹性从底部弹入（springPop，间隔 10 frames）
3. 23-25s: 进度条弹性填充 + "1200 小时" 数字弹出

### 3.5 信息关联设计

| 阶段 | 上一阶段留下的视觉元素 | 如何过渡到下一阶段 |
|------|----------------------|------------------|
| 阶段 1 → 2 | 45 个节点网格 | 缩小退到背景（opacity 0.15） |
| 阶段 2 → 3 | 两张雷达图 | 向两侧滑出离场 |
| 阶段 3 → 下一场景 | 3 张差距卡片 | 保持，下一场景（Growth）直接承接 |

---

## 4. 其他场景弹性升级

### 4.1 HookScene（8s）

- 品牌名: 从 scale(0.8) 柔和弹性淡入（springSoft）
- 大标题: 从下方弹性滑入（springPop）
- 3 个统计数据: staggered 弹性弹出，数字计数带弹性 overshoot（springBounce）

### 4.2 UploadProfileScene（12s）

- 文件上传完成: 上传图标弹性放大 + 回弹（springBounce）
- 解析进度条: 进度到达 100% 时弹性 overshoot 到 105% 再回弹到 100%
- 能力画像卡片: 4 个维度卡片 staggered 弹性从左滑入（springPop，间隔 5 frames）

### 4.3 InterviewAIScene（20s）

- AI 头像/标签: 每次 AI 回答时弹性弹出（springPop）
- 影响条展开: 4 个影响维度 staggered 弹性展开，进度条弹性填充
- 关键结论 "面试能力 +23%": 强弹性弹出 + 数字弹性计数（springBounce）

### 4.4 GrowthScene（20s）

- 每周计划卡片: 3 张卡片 staggered 弹性从底部弹入
- AI 建议标签: 每个标签弹性缩放入场
- "本周学习 12 小时": 数字弹性计数

### 4.5 ReportScene（20s）

- 章节标题切换: 弹性缩放过渡（springSoft）
- 行动计划条目: staggered 弹性滑入
- 证据链图标: 每个证据节点弹性弹出

### 4.6 CTAScene（10s）

- 大标题: 弹性从 scale(0.5) 放大入场（springBounce）
- CTA 按钮: 弹性弹出 + 微妙的呼吸缩放（scale 在 1.0-1.02 之间弹性振荡）
- 背景光圈: 用 spring() 驱动弹性扩张（替代当前线性 interpolate）

---

## 5. 技术实现

### 5.1 修改文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| video/src/components/Animations.tsx | 修改 | 新增 SpringFadeIn, SpringScaleIn, StaggerSpring, 三级弹性参数 |
| video/src/components/UIPrimitives.tsx | 修改 | 更新 ScoreRing, RadarChart 等组件支持弹性动画参数 |
| video/src/scenes/GraphJDScene.tsx | 重写 | 三段式新设计 |
| video/src/scenes/HookScene.tsx | 修改 | 替换动画组件为弹性版本 |
| video/src/scenes/UploadProfileScene.tsx | 修改 | 关键节点加入弹性效果 |
| video/src/scenes/InterviewAIScene.tsx | 修改 | AI 标签、影响条加入弹性 |
| video/src/scenes/GrowthScene.tsx | 修改 | 卡片、标签加入弹性 |
| video/src/scenes/ReportScene.tsx | 修改 | 章节切换、条目加入弹性 |
| video/src/scenes/CTAScene.tsx | 修改 | 标题、按钮、光圈加入弹性 |

### 5.2 零新依赖

全部使用 Remotion 原生 spring()：

```typescript
import { spring } from 'remotion'

// 强弹性
const scale = spring({ frame, fps, config: { damping: 10, stiffness: 120 } })
```

### 5.3 工作量估算

- Day 1: Animations.tsx 升级 + GraphJDScene 重写
- Day 2: Hook + UploadProfile + InterviewAI 升级
- Day 3: Growth + Report + CTA 升级
- Day 4: 调优 + TypeScript + 渲染测试

---

## 6. 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| spring() 在某些帧范围异常 | 低 | 中 | 所有弹性组件内置 fallback 到 interpolate |
| 渲染时间增加 | 低 | 低 | spring() 计算开销极小，与 interpolate 同级 |
| 视觉疲劳（全程弹跳） | 中 | 中 | 三级弹性强度区分，次要元素用柔和弹性 |
| GraphJD 三段式信息过载 | 中 | 高 | 每阶段只展示一个核心信息，旧信息及时退场 |

---

*设计确认: 2026-05-31*
