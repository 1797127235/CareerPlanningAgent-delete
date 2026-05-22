# CareerOS 智能体化改造方案

## 背景：现在是什么

CareerOS 当前是一个 **Web 应用 + AI 聊天插件**，不是智能体系统。

绝大多数功能（JD 诊断、画像分析、面试练习、成长日志）都是传统 REST 接口：用户点按钮，后端执行，返回结果。LangGraph 只用在一个地方——Coach 聊天框——而且聊天框里的 agent 几乎只能读数据、不能改数据。

**已经做对的部分（保留）：**

- JD agent 是真正的 workflow：确定性执行 → 写 DB → 返回结构化卡片
- `[COACH_RESULT_ID:N]` 协议：agent 输出标记，前端解析渲染 action card
- Supervisor Swarm 路由：语义分类 → handoff
- `save_profile_from_chat`：coach 能通过对话更新画像（已有先例）

**核心缺口：**

| 缺口 | 现状 | 后果 |
|------|------|------|
| agent 写入能力缺失 | growth / navigator agent 只读 | 用户说"帮我记录学习"，agent 只回文字 |
| 行动结果不可见 | 写了 DB 用户不知道 | 没有"我帮你做了 X"的闭环感 |
| agent 不会主动发起任务 | 所有流程等用户点按钮 | 系统是被动响应者 |

---

## 目标：改成什么

用户在聊天框说一句话，agent 不只是回复——它**直接操作数据、更新状态、推进下一步**。

```
用户："我今天学完了 Redis 持久化"
现在：coach 回复"很好，可以去成长档案记录一下…"
改后：coach 直接写入成长档案，返回 ✓ chip，追加建议"要练道 Redis 面试题吗？"

用户："我想做后端开发"
现在：navigator 分析方向，用户还得手动去图谱页锁定目标
改后：navigator 分析完直接锁定目标岗位，图谱页立即更新

用户："我投了字节后端"
现在：coach 回复鼓励文字
改后：coach 写入投递记录，自动关联同名 JD 诊断，返回确认 chip
```

---

## 方案：三个阶段

### 阶段一：给 Agent 写入能力

**这是基础，不依赖后两个阶段。完成后系统就已经是真正的 agent。**

新增 3 个写入工具，全部复用 JD agent 已有的模式（ContextVar 注入 user_id → 直接写 DB → 返回标记字符串）。

#### 工具 1：`add_growth_entry`

```
位置：agent/tools/growth_tools.py
接入：coach_agent, growth_agent

触发语（LLM 判断）：
  "我今天学了 Redis"
  "刚做完一个 RPC 项目"
  "读了一篇关于 k8s 的文章"

写入：GrowthLog 表（复用现有 ORM 模型）
参数：
  type: 'study' | 'project' | 'reading' | 'practice'
  title: str
  skills: list[str]  # LLM 从对话里提取
  duration_hours: float | None

返回：
  "[ACTION_TAKEN:growth_entry:已记录「Redis 持久化学习」到成长档案]"
```

#### 工具 2：`set_career_goal`

```
位置：agent/tools/coach_context_tools.py
接入：coach_agent, navigator_agent

触发语（LLM 判断）：
  "我决定做前端"
  "锁定后端工程师方向"
  "我想往嵌入式发展"

写入：Profile.goal_json（复用图谱页锁定目标的同一字段）
参数：
  node_id: str   # 图谱节点 ID，从 graph_tools 返回值里取
  label: str     # 显示名称，如"后端工程师"

副作用：写完后后台触发图谱重新定位（复用现有 _auto_locate_on_graph 逻辑）
返回：
  "[ACTION_TAKEN:goal_set:目标岗位已更新为「后端工程师」]"
```

#### 工具 3：`track_application`

```
位置：agent/tools/growth_tools.py
接入：coach_agent

触发语（LLM 判断）：
  "我今天投了字节的后端"
  "刚提交了腾讯游戏的简历"
  "面试通过了，准备下一轮"

写入：JobApplication 表
参数：
  company: str
  role: str
  status: 'applied' | 'interviewing' | 'offered' | 'rejected'
  notes: str | None

副作用：尝试关联同名 JD 诊断记录（复用 _auto_link_diagnosis_to_application）
返回：
  "[ACTION_TAKEN:application:已追踪「字节跳动 · 后端工程师」]"
```

#### 需要同步修改的文件

**`agent/supervisor.py`**：给 growth_agent 和 navigator_agent 注入 user_id。
现在只有 jd_agent 和 coach_agent 有 ContextVar 注入，growth/navigator agent 拿不到 user_id，写工具也没用。在 supervisor 调用这两个 agent 前，加一行：

```python
from agent.tools.growth_tools import _injected_user_id as _growth_uid
_growth_uid.set(state.get("user_id"))
```

**`agent/agents/coach_agent.py`**：import 三个新工具加进 tools 列表。

**`agent/agents/growth_agent.py`**：import `add_growth_entry`。

**`agent/agents/navigator_agent.py`**：import `set_career_goal`。

---

### 阶段二：行动结果可见

agent 做了事，用户要能看见。

**扩展协议**：在现有 `[COACH_RESULT_ID:N]` 基础上加 `[ACTION_TAKEN:type:label]` 标记，由工具在返回值里带出，agent 透传到回复末尾。

```
回复示例：
  "好的，你今天学了 Redis 持久化的 AOF 机制。这块和面试高频题强相关，建议同步记录一下写过的测试用例。
  [ACTION_TAKEN:growth_entry:已记录「Redis AOF 持久化」到成长档案]"
```

**前端渲染**：解析 ACTION_TAKEN → 在消息下方显示绿色确认 chip（图标 + 文字，样式复用现有 `AddToTrackingButton`）。

改动文件：
- `backend/services/chat.py`：提取 ACTION_TAKEN 作为独立 SSE 事件发出（参考现有 COACH_RESULT_ID 的处理方式）
- `frontend-v2/src/hooks/useChat.ts`：解析 `action_taken` 事件，附加到消息结构
- `frontend-v2/src/components/ChatPanel.tsx`：渲染确认 chip

---

### 阶段三：主动建议

对话结束后，agent 自动追加一个可操作的建议，不需要用户主动问。

**机制**：supervisor 在 END 前插入轻量 `proactive_check` 节点（规则判断，不调 LLM），读用户当前状态生成一条建议标记：

```
[SUGGEST:interview_practice:要练一道 Redis 面试题吗？]
[SUGGEST:jd_diagnose:找几份后端工程师的 JD 来诊断一下？]
[SUGGEST:generate_report:你的档案已经够丰富了，要生成职业报告吗？]
```

**触发规则（代码判断，无 LLM）：**

| 用户状态 | 建议动作 |
|----------|----------|
| 刚记录了学习条目 | 建议做相关方向的面试题 |
| 刚锁定了目标岗位 | 建议诊断一份该方向的 JD |
| 成长档案 ≥ 5 条 + 有目标 + 无报告 | 建议生成职业报告 |
| 投递记录有"面试中"状态 | 建议做面试复盘 |

**前端渲染**：SUGGEST 标记 → 消息下方渲染为可点击 chip，点击直接发送对应 prompt。

改动文件：
- `agent/supervisor.py`：END 前加 `proactive_check` 节点
- `backend/services/chat.py`：提取 SUGGEST 事件
- `frontend-v2/src/components/ChatPanel.tsx`：渲染建议 chip

---

## 改动范围汇总

```
agent/
  tools/
    growth_tools.py        [新增] add_growth_entry, track_application
    coach_context_tools.py [新增] set_career_goal
  agents/
    coach_agent.py         [改] 接入 3 个新工具
    growth_agent.py        [改] 接入 add_growth_entry
    navigator_agent.py     [改] 接入 set_career_goal
  supervisor.py            [改] 注入 user_id + proactive_check 节点（阶段三）

backend/
  services/chat.py         [改] 提取 ACTION_TAKEN / SUGGEST SSE 事件

frontend-v2/src/
  hooks/useChat.ts         [改] 解析新事件类型
  components/ChatPanel.tsx [改] 渲染确认 chip + 建议 chip
```

**不改的文件：** JD agent、Navigator agent 的核心逻辑、图谱数据、所有 REST 接口、数据库模型。

---

## 执行顺序建议

1. **先做阶段一的 `add_growth_entry`**——最常用、最直观、代码最简单（参照 `save_profile_from_chat` 抄一遍）。
2. **阶段一的 `set_career_goal` 和 `track_application`**——逻辑类似，一起做。
3. **阶段一的 supervisor 注入**——不改这个，写工具也没用。
4. **阶段二**——协议扩展是纯管道工作，不依赖复杂逻辑。
5. **阶段三**——最后做，规则可以简单写死。

整体工作量估计：阶段一 2-3 天，阶段二 1 天，阶段三 1-2 天。
