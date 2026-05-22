# 聊天机器人重设计方案

## 现在的问题

读完代码后，当前聊天系统的问题集中在四点：

**1. 架构过度复杂**
Supervisor → 语义路由 → LLM 意图分类 → handoff 工具 → agent_X → ContextVar 注入 → ReAct 循环。
一条消息要走 3-4 个 LLM 调用才能给出回复。出了问题不知道在哪断的。

**2. 工具几乎全是只读的**
6 个 agent 加起来，能写数据库的只有 `save_profile_from_chat` 一个。
结果是：用户说的每一件事，agent 只能回复文字，不能真正操作数据。

**3. 模型（Qwen-Plus）在多工具场景下不可靠**
Qwen-Plus 面对 10 个以上的工具时，经常漏调工具、调错工具。
当前靠 ContextVar 注入、语义路由、regex 补丁来弥补，复杂度越来越高。

**4. UI 没有体现 agent 在做什么**
流式输出只有文字，没有"正在调用工具"的过程感。
agent 写了数据库，用户完全不知道。

---

## 新设计：单 Agent + 丰富工具集

### 核心变化

**从**：Supervisor + 6 个 Agent（coach/jd/navigator/growth/profile/search）

**到**：1 个 Agent + 12 个工具（按领域分组）

不是"删掉功能"，是把 6 个 agent 的能力合并进工具，让一个更强的模型直接决策。

### 为什么合并更好

| | 现在（多 Agent） | 新（单 Agent） |
|---|---|---|
| 意图判断 | 语义路由 + LLM 二次分类（2 次调用） | LLM 直接选工具（1 次调用） |
| 调试难度 | 需要追踪 handoff 链路 | 单次 tool call 日志 |
| 添加新能力 | 要改 supervisor + agent + router | 只加一个工具函数 |
| 工具调用一致性 | 每个 agent 单独维护工具列表 | 统一工具注册表 |

单 agent 的缺点：上下文会变大。但这个系统的对话长度有限，不是问题。

---

## 工具注册表（12 个工具）

### 读取类（6 个）

```python
# 画像领域
get_user_profile()          # 技能、学历、项目、意愿（来自现有 coach_context_tools）
get_career_goal()           # 已锁定目标岗位（来自现有 coach_context_tools）

# 图谱领域
recommend_directions()      # 推荐匹配方向 + 市场数据（合并现有 recommend_jobs）
get_role_detail(role_name)  # 岗位详情（来自现有 get_job_detail）
get_market_signal(direction)# 市场趋势数据（来自现有 get_market_signal）

# 成长领域
get_growth_summary()        # 项目进度 + 投递记录 + 学习统计（合并现有 get_dashboard_stats + get_project_progress）
```

### 写入类（4 个，全部新增）

```python
diagnose_jd(jd_text)
# 效果：分析 JD 匹配度 + 写 JDDiagnosis 表 + 写 CoachResult 表
# 底层：复用现有 JDService.diagnose() + _save_jd_coach_result()
# 返回：match_score, gaps, [COACH_RESULT_ID:N]

add_growth_entry(type, title, skills, hours)
# 效果：直接写入 GrowthLog 表
# 触发：用户说"我今天学了X / 做完了项目Y"
# 返回：[ACTION_TAKEN:growth_entry:已记录到成长档案]

set_career_goal(node_id, label)
# 效果：更新 Profile.goal_json，触发图谱重新定位
# 触发：用户说"我决定做X方向"
# 返回：[ACTION_TAKEN:goal_set:目标已更新为「X」]

track_application(company, role, status, notes)
# 效果：写入 JobApplication 表，自动关联同名 JD 诊断
# 触发：用户说"我投了X公司的Y岗位"
# 返回：[ACTION_TAKEN:application:已追踪「X · Y」]
```

### 搜索类（2 个）

```python
search_real_jd(query)       # 联网搜招聘（来自现有 search_tools）
get_memory_recall(query)    # 检索历史对话记忆（来自现有 coach_context_tools）
```

---

## 模型

模型不需要换。语义路由器（`intent_router.py`）存在的原因是性能优化——embedding 层分类比 LLM 调用快得多——不是因为 Qwen-Plus 工具调用能力不足。

现有问题（缺写入工具、没有行动反馈）跟模型无关，换模型解决不了。

保持现有配置：`_MODEL_MAP["fast"] = "qwen-plus"`，`_MODEL_MAP["strong"] = "qwen-max"`，按原逻辑按需选用。

---

## 系统提示词重写

现在的 coach system prompt 是 `BASE_IDENTITY` 里一段混着格式要求、工具原则、场景 skill 的大段文字。

新版拆成三个独立部分，运行时拼接：

```
[1] 角色定义（固定，~100 词）
  你是职途智析的 AI 教练，帮助计算机专业学生做职业决策。
  直接回答，不废话，像有经验的学长。禁止 markdown 格式。

[2] 工具使用规则（固定，~80 词）
  - 需要用户数据时才调工具，不要无谓调用
  - diagnose_jd：用户粘贴了 JD 文本（≥50字）时必须调
  - add_growth_entry：用户明确说完成了学习/项目时调
  - set_career_goal：用户明确说"决定/锁定/选择"某方向时调
  - track_application：用户提到投递了某公司时调
  - 写操作执行后，在回复里自然提一句"已帮你记录"

[3] 当前用户上下文（动态注入，每轮更新）
  - 阶段：{stage_label}
  - 技能：{top_skills}
  - 目标：{career_goal}
  - 最近活动：{recent_activity}
```

---

## 标记协议扩展

现有的 `[COACH_RESULT_ID:N]` 协议继续保留。新增两种标记：

```
[ACTION_TAKEN:type:label]
# 例：[ACTION_TAKEN:growth_entry:已记录「Redis AOF 学习」]
# 例：[ACTION_TAKEN:goal_set:目标已更新为「后端工程师」]
# 前端渲染：消息下方绿色确认 chip

[SUGGEST:action:prompt_text]
# 例：[SUGGEST:practice:出一道 Redis 面试题]
# 例：[SUGGEST:jd:帮我搜几份后端 JD 来诊断]
# 前端渲染：消息下方可点击的建议 chip（点击直接发送 prompt_text）
```

SUGGEST 标记由 agent 在写入操作后自行追加（写完成长日志 → 建议练面试题），不需要额外的 LLM 调用。

---

## 前端改动

### ChatPanel 变化

**现在**：流式文字 → 结束后显示 COACH_RESULT_ID card

**新增**：
1. **工具调用状态**：agent 调工具时，流式区域显示"正在查询你的画像..." / "正在分析 JD..." 等状态提示（根据 SSE 事件中的 `tool_name` 字段推断）
2. **确认 chip**：解析 ACTION_TAKEN → 绿色小 chip，如 `✓ 已记录到成长档案`
3. **建议 chip**：解析 SUGGEST → 蓝色可点击 chip，点击触发下一条消息
4. **agent 标识去掉**：现在消息头有"jd_agent / navigator_agent"等标签，用户不需要知道这些，统一显示"职途智析"

### useChat.ts 变化

新增两个事件类型的解析：
```typescript
// 现有
card?: CardData         // COACH_RESULT_ID

// 新增
actionTaken?: { type: string; label: string }[]   // ACTION_TAKEN
suggestions?: { action: string; prompt: string }[] // SUGGEST
```

---

## 迁移计划

### 保留不动

- JDService（诊断逻辑很稳定）
- `_save_jd_coach_result`（直接复用）
- `get_market_signal` / `get_memory_recall`（直接复用）
- 所有 REST 接口（画像、成长日志、面试等页面不受影响）
- 数据库 ORM 模型
- SSE 流传输机制

### 删除

- `agent/agents/` 下所有 agent 文件（6 个）
- `agent/intent_router.py`（语义路由，不再需要）
- `agent/supervisor.py` 里的 handoff 工具和 triage 节点

### 新建

- `agent/agent.py`：单 agent 定义（~50 行）
- `agent/tools/write_tools.py`：4 个写入工具
- `agent/tools/registry.py`：统一工具注册表

### 改动

- `agent/supervisor.py` → 简化成单入口（或直接改名 `agent/runner.py`）
- `agent/tools/growth_tools.py`：整合读取工具，加入 get_growth_summary
- `backend/services/chat.py`：解析新标记，发出新 SSE 事件
- `frontend-v2/src/hooks/useChat.ts`：解析 actionTaken / suggestions
- `frontend-v2/src/components/ChatPanel.tsx`：渲染新 chip 类型

---

## 工作量估计

| 模块 | 工作量 | 备注 |
|------|--------|------|
| 单 agent + 工具注册表 | 1 天 | 主要是整合现有工具 |
| 4 个写入工具 | 1.5 天 | 有 save_profile 做参照 |
| 标记协议 + SSE 扩展 | 0.5 天 | 有现有 COACH_RESULT_ID 做参照 |
| 前端 chip 渲染 | 1 天 | 有 AddToTrackingButton 做参照 |
| 系统提示词调优 | 0.5 天 | 写完要测几轮 |
| **合计** | **~5 天** | |

---

## 实施顺序

```
1. 新建 agent/tools/write_tools.py（4 个写入工具）
   → 可以独立测试，不影响现有系统

2. 新建 agent/agent.py（单 agent，工具全挂上，先用现有只读工具）
   → 并行运行：/api/chat 先走新 agent，/api/v1/chat 保留旧的

3. 写入工具接入新 agent，测试完整写-读-显示闭环

4. 标记协议扩展 + SSE + 前端 chip

5. 旧 agent 目录清理
```

关键：第 2 步用并行路由让新旧 agent 可以 A/B 切换，出问题随时回退。

---

## 实施约束（审查发现，必须遵守）

### 1. user_id 注入机制（Critical）

`agent/runner.py` 入口必须在调用 agent 前设置所有 ContextVar，不得依赖各工具内部的 fallback：

```python
# runner.py — agent 调用入口
from agent.tools.write_tools import _ctx_user_id
import contextvars

async def run_agent(state: dict):
    tok = _ctx_user_id.set(state["user_id"])
    try:
        async for chunk in agent.astream(state):
            yield chunk
    finally:
        _ctx_user_id.reset(tok)
```

同时删除 `agent/tools/jd_tools.py` 第 170–181 行的跨用户 fallback（`ORDER BY created_at DESC` 无用户过滤），这是数据安全漏洞。

### 2. diagnose_jd 保持确定性调用（High）

工具实现必须直接调 `JDService.diagnose()`，不依赖 LLM 决定是否调用。参考 jd_agent.py 的注释：`_run_diagnosis` 节点不走 LLM。

`[COACH_RESULT_ID:N]` marker 由工具 return 值附加，agent 的 system prompt 中需明确：**禁止改写或省略 marker token**。

### 3. 先写测试，再写工具（High）

实施顺序修订：`write_tools.py` 的实现必须晚于 `test_write_tools.py`。

每个写入工具至少覆盖：
- `user_id=None` → 返回错误字符串，不写 DB
- 正常写入 → 对应 ORM 行创建，返回 `[ACTION_TAKEN:...]` marker
- DB 异常 → 返回错误字符串，不崩溃

### 4. ACTION_TAKEN 从 ToolMessage 立即发出（High）

不等流式结束。`backend/routers/chat.py` 解析 ToolMessage 时（现有 `[JD_SEARCH_RESULTS:]` 解析处），同模式处理 `[ACTION_TAKEN:...]`，立即 `yield` chip 事件给前端：

```python
if "[ACTION_TAKEN:" in tool_output:
    for match in re.finditer(r'\[ACTION_TAKEN:(\w+):([^\]]+)\]', tool_output):
        yield f'data: {{"type":"action_taken","action_type":"{match.group(1)}","label":"{match.group(2)}"}}\n\n'
```

这样即使客户端在流结束前断开，chip 确认也已发出。

---

## 标记协议完整规范

所有 marker 格式：`[TYPE:SUBTYPE:PAYLOAD]`，`:` 分隔，最多 split 3 段。

| Marker | 触发位置 | PAYLOAD 最大长度 | 前端渲染 |
|--------|---------|----------------|---------|
| `[COACH_RESULT_ID:N]` | LLM 回复末尾 | — | action card |
| `[ACTION_TAKEN:type:label]` | ToolMessage 内 | 80 字符 | 绿色确认 chip |
| `[SUGGEST:action:prompt_text]` | LLM 回复末尾 | 100 字符 | 蓝色可点击 chip |

SUGGEST chip 交互规则：
- `isStreaming === true` 时禁用（灰色，不可点击）
- 流结束后启用
- 点击 → 调用 `sendMessage(prompt_text)`，prompt_text 经过 trim + 截断处理
- ACTION_TAKEN 只在流结束后渲染（避免部分 marker 渲染）
- SUGGEST chip 渲染在 ACTION_TAKEN chip 下方，两者之间有分隔线

工具调用状态显示规则：
- 状态条出现在消息气泡上方，不在气泡内
- 同一时刻只显示最新一个工具的状态，不叠加
- 工具返回后状态消失，文字流开始后不再显示工具状态
- 超过 10 秒无响应：显示"分析中，请稍候..."
- 状态条内容不计入 ChatMessage 存储
