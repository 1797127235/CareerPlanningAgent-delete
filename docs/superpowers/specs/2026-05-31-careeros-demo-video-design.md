# CareerOS 答辩演示视频设计

> Remotion 视频重构方案：从功能清单升级为故事驱动的产品演示

## 背景

- **场景**：答辩演示，视频嵌入 PPT 播放
- **目标受众**：答辩评委
- **核心卖点**：产品完整度 + 创新性（evidence-driven）
- **时长目标**：约 2 分钟（115 秒）
- **技术栈**：Remotion + 纯代码重建 UI 组件（路线 B）
- **当前状态**：69 秒功能展示视频，存在叙事薄弱、时长不足、场景割裂等问题

## 叙事策略

**方案 A：一个学生的旅程**

以虚构学生"林小北"的视角，展示从迷茫到清晰的完整职业规划过程。每一步回答"用户为什么需要这个功能"，而非简单罗列功能。

核心叙事弧：**痛点 → 输入 → 发现 → 验证 → 练习 → 成长 → 总结**

## 场景结构（7 个场景，115 秒）

### 场景 1：Hook（8s，0-8s）

**目标**：抓住注意力，抛出痛点

- 深色背景，品牌标识
- 标题："CS 学生的职业规划，还在靠感觉？"
- 副标题：工具碎片化问题
- 底部数据统计动画

**继承自**：当前 HookScene.tsx，基本不变

### 场景 2：Upload → Profile（12s，8-20s）

**目标**：展示输入到输出的转化速度

- 前 4s：简历拖入上传区域 → 文件处理动画
- 中 4s：AI 解析进度环 + 步骤指示（选择→解析→生成）
- 后 4s：能力画像瞬间展开（身份卡 + 维度分数条 + 技能标签同时出现）

**与当前的区别**：
- 合并 UploadFlowScene 和 ProfileDemoScene
- 去掉 ProfileDemo 的"推荐方向"和"经历"部分（留给后面的场景）
- 画像展示精简为：身份卡 + 5 个维度分数条 + 核心技能标签

### 场景 3：Graph + JD（25s，20-45s）

**目标**：展示核心差异化价值——岗位图谱 + JD 精准匹配

这是全场最长场景，分为两个阶段：

**阶段 A：岗位图谱定位（12s）**
- Coverflow 轮播 5-6 个岗位卡片
- 聚焦到"前端开发工程师"
- 展示 AI 影响分析（"AI 协同度 67%"）
- 雷达图展示能力匹配

**阶段 B：JD 匹配验证（13s）**
- 粘贴一段真实 JD（打字机效果）
- 匹配分数圆环动画弹出（78%）
- 四维评分卡依次出现
- 缺口技能标红高亮（React 高级模式、系统设计）
- 已匹配技能标绿

**继承自**：GraphDemoScene + JDDemoScene 合并

### 场景 4：Interview + AI 影响（20s，45-65s）

**目标**：展示创新亮点——AI 面试模拟 + AI 影响洞察

**阶段 A：面试模拟（14s）**
- 直接进入面试界面，AI 提问动画（不做方向选择器，突出核心交互）
- 回答打字机效果（加速展示）
- 评分环 + 亮点/改进建议

**阶段 B：AI 影响穿插（6s）**
- 在评分结果上方叠加一个半透明信息条
- "AI 对前端开发的影响：67% 任务可被增强，23% 需要转型"
- 用颜色区分安全区/转型区/警惕区

**与当前的区别**：增加 AI 影响信息条，强化创新性

### 场景 5：Growth（20s，65-85s）

**目标**：展示闭环——记录 → AI 建议 → 行动计划

精简为三个快速阶段：
- 前 6s：快速输入一条成长记录 + 筛选标签
- 中 7s：卡片列表 + AI 建议气泡弹出
- 后 7s：看板视图 + 周计划生成

**继承自**：GrowthDemoScene.tsx，压缩时间

### 场景 6：Report（20s，85-105s）

**目标**：展示产品闭环的终极证明——所有数据汇聚成一份完整报告

这是一个新场景，展示 editorial 风格的职业报告：

- 前 5s：报告封面页（标题"林小北的职业发展报告"，带日期和目录预览）
- 中 8s：翻页效果展示四个章节（Chapter I 画像 / Chapter II 方向 / Chapter III 差距 / Chapter IV 行动）
- 后 7s：聚焦到行动建议页，展示 AI 生成的具体计划 + 证据链溯源标记

**视觉风格**：对齐前端的 editorial 组件——Chapter 标题、DropCap、PaperCard、暖纸色背景

### 场景 7：CTA（10s，105-115s）

**目标**：收束，强化核心信息

- 深色背景
- 核心文案："不只是职业建议，是证据驱动的职业操作系统"
- GitHub URL
- 品牌标识

**与当前的区别**：时长从 5s → 10s，文案调整

## 技术实现要点

### 新增/重写文件

| 文件 | 操作 | 说明 |
|:--|:--|:--|
| `Composition.tsx` | 重写 | 新的时间线编排 |
| `content.ts` | 重写 | 更新所有文案和时长配置 |
| `scenes/UploadProfileScene.tsx` | 新建 | 合并 Upload + Profile |
| `scenes/GraphJDScene.tsx` | 新建 | 合并 Graph + JD |
| `scenes/InterviewAIScene.tsx` | 新建 | Interview + AI 影响信息条 |
| `scenes/GrowthScene.tsx` | 重写 | 压缩时长 |
| `scenes/ReportScene.tsx` | 新建 | 全新场景：editorial 报告 |
| `components/UIPrimitives.tsx` | 扩展 | 新增报告相关组件（ChapterTitle、DropCap、PaperCard 等） |
| `tokens.ts` | 微调 | 可能需要新增报告相关色值 |

### 可复用现有代码

- `HookScene.tsx` — 基本不变
- `CTAScene.tsx` — 调整时长和文案
- `UIPrimitives.tsx` — ScoreBar、SkillChip、ScoreRing、RadarChart、MiniNavbar 等全部复用
- `Animations.tsx` — FadeIn、NumberTicker 等全部复用

### Remotion 动画约束

- 禁止 CSS transitions/animations 和 Tailwind 动画类
- 所有动画必须用 `useCurrentFrame()` + `interpolate()`
- 可以使用 `spring()` 增强弹性效果
- 场景间无 crossfade，各自独立渲染

## 时长对比

| 指标 | 当前 | 新方案 |
|:--|:--|:--|
| 总时长 | 69s | 115s |
| 场景数 | 8 | 7 |
| 最长场景 | Interview 12s | Graph+JD 25s |
| 核心叙事 | 功能清单 | 学生旅程 |
| 报告页面 | 无 | 有（20s） |
| AI 影响展示 | 无 | 有（Interview 场景内） |

## 设计 token 对齐

所有 UI 组件对齐前端设计系统：
- 背景：`#F9F4EE`（暖纸色）
- 卡片：`#FCFAF7` + `1px solid #E4D8CF`
- 主色：chestnut `#6B3E2E`
- 字体：Noto Sans SC
- 所有 Demo 场景包含 MiniNavbar
