# CareerOS 演示视频 v3 实现计划

**日期**: 2026-05-31
**基于设计**: `docs/superpowers/specs/2026-05-31-careeros-demo-video-v3-design.md`

---

## Task 1: 升级 Animations.tsx — 弹性动画基础设施

**文件**: `video/src/components/Animations.tsx`

**新增内容**:
- `SpringFadeIn` 组件（替代 FadeIn，使用 spring() 替代 interpolate）
- `SpringScaleIn` 组件（替代 ScaleIn，使用 spring()）
- `StaggerSpring` 组件（子元素依次弹性入场）
- 三级弹性参数常量：`SPRING_BOUNCE`, `SPRING_POP`, `SPRING_SOFT`
- `springWithFallback` 工具函数（异常时回退到 interpolate）

**代码规模**: ~100 行新增

---

## Task 2: 重写 GraphJDScene.tsx — 三段式叙事

**文件**: `video/src/scenes/GraphJDScene.tsx`（完全重写）

**三阶段实现**:
1. **定位阶段**（0-240f）：45 节点蜂窝网格 + 目标路径高亮 + 连接线动画
2. **诊断阶段**（240-540f）：双雷达图对比 + 差距高亮 + 匹配度弹性计数
3. **路径阶段**（540-750f）：3 张差距卡片 + 进度条弹性填充 + 1200 小时文案

**新增依赖**: 无（复用 UIPrimitives 中的 RadarChart，可能需要扩展支持对比模式）

**代码规模**: ~250 行（原文件 161 行）

---

## Task 3: 升级 HookScene.tsx

**文件**: `video/src/scenes/HookScene.tsx`

**修改内容**:
- FadeIn → SpringFadeIn
- ScaleIn → SpringScaleIn（统计数据）
- NumberTicker 使用 springBounce 参数

**代码规模**: ~20 行修改

---

## Task 4: 升级 UploadProfileScene.tsx

**文件**: `video/src/scenes/UploadProfileScene.tsx`

**修改内容**:
- 上传完成图标: SpringScaleIn(springBounce)
- 解析进度条: 100% 时 overshoot 效果
- 能力画像卡片: StaggerSpring(springPop, 5f 间隔)

**代码规模**: ~30 行修改

---

## Task 5: 升级 InterviewAIScene.tsx

**文件**: `video/src/scenes/InterviewAIScene.tsx`

**修改内容**:
- AI 标签: SpringScaleIn(springPop)
- 影响条: StaggerSpring + 弹性进度条填充
- 结论数字: NumberTicker + springBounce

**代码规模**: ~30 行修改

---

## Task 6: 升级 GrowthScene.tsx

**文件**: `video/src/scenes/GrowthScene.tsx`

**修改内容**:
- 计划卡片: StaggerSpring(springPop)
- AI 建议标签: SpringScaleIn
- 学习时长: NumberTicker + springSoft

**代码规模**: ~25 行修改

---

## Task 7: 升级 ReportScene.tsx

**文件**: `video/src/scenes/ReportScene.tsx`

**修改内容**:
- 章节标题: SpringFadeIn(springSoft)
- 行动计划条目: StaggerSpring(springPop)
- 证据链图标: SpringScaleIn

**代码规模**: ~25 行修改

---

## Task 8: 升级 CTAScene.tsx

**文件**: `video/src/scenes/CTAScene.tsx`

**修改内容**:
- 大标题: SpringScaleIn(springBounce)
- CTA 按钮: SpringScaleIn + 呼吸缩放循环
- 背景光圈: spring() 替代 interpolate

**代码规模**: ~30 行修改

---

## Task 9: UIPrimitives.tsx 扩展

**文件**: `video/src/components/UIPrimitives.tsx`

**修改内容**:
- RadarChart: 支持对比模式（两张雷达图重叠显示差距）
- ScoreRing/ScoreBar: 支持 spring 驱动进度动画
- 可能需要新增: GapCard 组件（阶段 3 的差距卡片）

**代码规模**: ~80 行新增/修改

---

## Task 10: 验证与渲染

1. `npx tsc --noEmit` — TypeScript 检查
2. `npm run dev` — Remotion Studio 预览关键场景
3. `npx remotion render CareerOS out/careeros-demo-v3.mp4` — 完整渲染
4. 对比 v2 渲染时间，确认无显著退化

---

## 执行顺序

```
Task 1 (Animations) → Task 9 (UIPrimitives) → Task 2 (GraphJDScene) 
→ Task 3-8 (其他场景并行) → Task 10 (验证)
```

**预计总工时**: 3-4 天

---

*计划基于设计文档: `docs/superpowers/specs/2026-05-31-careeros-demo-video-v3-design.md`*
