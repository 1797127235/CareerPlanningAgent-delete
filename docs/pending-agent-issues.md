# 待修复问题清单

以下问题已识别但未实现，交由后续处理。

---

## 问题 1：前端不渲染 ACTION_TAKEN / SUGGEST 事件（P1）

### 背景

后端 `backend2/routers/chat.py` 的 SSE 流已经正确发出两种新事件：

```
data: {"type": "action_taken", "action_type": "goal_set", "label": "目标岗位已更新为「后端工程师」"}
data: {"type": "suggest", "action": "diagnose_jd", "prompt": "帮我诊断一下这份 JD"}
```

但前端 `useChat.ts` 的 SSE 解析器只处理 `content / session_id / card / jd_cards`，`type` 字段被完全忽略。

### 需要改动的文件

**`frontend-v2/src/hooks/useChat.ts`**

1. 在 `ChatMessage` 接口添加两个字段：
   ```ts
   actionTaken?: { action_type: string; label: string }[]
   suggestions?: { action: string; prompt: string }[]
   ```

2. 在 SSE 解析器里（`while (true)` 循环内，处理 `parsed` 的地方）增加：
   ```ts
   const parsed = JSON.parse(raw) as {
     content?: string
     session_id?: number
     card?: CardData
     jd_cards?: JdCardData[]
     type?: string          // 新增
     action_type?: string   // 新增
     label?: string         // 新增
     action?: string        // 新增
     prompt?: string        // 新增
   }

   if (parsed.type === 'action_taken' && parsed.action_type && parsed.label) {
     pendingActionTaken.push({ action_type: parsed.action_type, label: parsed.label })
   }
   if (parsed.type === 'suggest' && parsed.action && parsed.prompt) {
     pendingSuggestions.push({ action: parsed.action, prompt: parsed.prompt })
   }
   ```

3. 在最终 `setMessages` 时加入这两个字段：
   ```ts
   { id: genId(), role: 'ai', text: finalText, card: pendingCard,
     jdCards: pendingJdCards, actionTaken: pendingActionTaken, suggestions: pendingSuggestions }
   ```

4. `UseChatReturn` 接口不需要改，这两个字段直接挂在 `ChatMessage` 上即可。

**`frontend-v2/src/components/ChatPanel.tsx`**

在 `PanelBubble` 组件里，AI 消息气泡下方渲染两种 chip：

**ACTION_TAKEN chip（绿色，已完成操作的确认）：**
```tsx
{message.actionTaken && message.actionTaken.length > 0 && (
  <div className="flex flex-wrap gap-1.5 mt-2">
    {message.actionTaken.map((a, i) => (
      <span
        key={i}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium
                   text-emerald-700 bg-emerald-50 border border-emerald-200"
      >
        <CheckCircle2 className="w-3 h-3" />
        {a.label}
      </span>
    ))}
  </div>
)}
```

**SUGGEST chip（蓝灰色，点击后触发新对话轮次）：**
```tsx
{message.suggestions && message.suggestions.length > 0 && (
  <div className="flex flex-wrap gap-1.5 mt-2">
    {message.suggestions.map((s, i) => (
      <button
        key={i}
        onClick={() => onFollowUp?.(s.prompt)}
        className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#6B5E4F]
                   bg-white/50 hover:bg-white/70 border border-white/40 transition-colors cursor-pointer"
      >
        {s.prompt}
      </button>
    ))}
  </div>
)}
```

`CheckCircle2` 已在文件顶部 `lucide-react` 导入中存在，无需新增。

---

## 问题 2：Skills 未接入 Agent 系统提示词（P1）

### 背景

`agent/skills/` 目录下有 15 个教练场景（`coach-decision-socratic`、`coach-emotional-support` 等），每个目录含一个 `SKILL.md`。
`agent/skills/loader.py` 已实现 `format_skills_for_prompt()` 函数，但 `agent/agent.py` 的 `SYSTEM_PROMPT_TEMPLATE` 从未调用这个函数，Agent 对这 15 个场景完全不知情。

### 需要改动的文件

**`agent/agent.py`**

将 `SYSTEM_PROMPT_TEMPLATE` 底部添加一个 `{SKILLS}` 占位符：

```python
SYSTEM_PROMPT_TEMPLATE = """你是"职途智析"的 AI 教练，帮助计算机专业学生做职业决策。
直接回答，不废话，像有经验的学长。

## 工具使用规则
- 需要用户数据时才调工具，不要无谓调用
- diagnose_jd：用户粘贴了 JD 文本（≥50字）时必须调
- add_growth_entry：用户明确说完成了学习/项目时调
- set_career_goal：用户明确说"决定/锁定/选择"某方向时调
- track_application：用户提到投递了某公司时调
- 写操作执行后，在回复里自然提一句"已帮你记录"
- 禁止改写或省略回复中的 [COACH_RESULT_ID:N] 和 [ACTION_TAKEN:...] 标记

## 教练技能库
{SKILLS}

## 当前用户状态
{CONTEXT}"""
```

**`agent/runner.py`**

在 `_build_system_message()` 里注入 `{SKILLS}`：

```python
def _build_system_message(state: CareerState) -> SystemMessage:
    from agent.skills.loader import format_skills_for_prompt
    context = build_context_summary(state)
    skills = format_skills_for_prompt()
    content = (
        SYSTEM_PROMPT_TEMPLATE
        .replace("{CONTEXT}", context)
        .replace("{SKILLS}", skills)
    )
    return SystemMessage(content=content)
```

注意：`format_skills_for_prompt()` 内部有缓存（`_loaded` 标志），只扫一次磁盘，后续调用不会重复 IO。

---

## 问题 3：工具调用阶段无中间状态反馈（P3）

### 背景

Agent 调用工具时（例如 `diagnose_jd` 需要调用 LLM 做分析，可能耗时 5-10 秒），前端只显示 `思考中...` 三个点，用户不知道在做什么。

### 方案

后端 `backend2/routers/chat.py` 的 `_build_agent_event_stream()` 在收到 `ToolMessage` 时已经立即发出 `action_taken` 事件（工具执行完成后）。

缺的是工具调用**开始**时的提示。LangGraph `stream_mode="messages"` 下，工具调用开始时会产生一个带 `tool_calls` 字段的 `AIMessage` chunk，目前 `runner.py` 里直接跳过了：

```python
# runner.py 第 116 行
if getattr(chunk, "tool_calls", None):
    continue   # ← 这里可以改为 yield 一个特殊 event
```

**改法：**

在 `runner.py` 里，当检测到 `tool_calls` 时 yield 一个工具名称标记：

```python
if getattr(chunk, "tool_calls", None):
    tool_name = chunk.tool_calls[0].get("name", "")
    yield chunk, {"langgraph_node": "career_agent", "streaming": False, "tool_calling": tool_name}
    continue
```

在 `backend2/routers/chat.py` 的 `_build_agent_event_stream()` 里识别这个 metadata：

```python
if metadata.get("tool_calling"):
    tool_name = metadata["tool_calling"]
    tool_labels = {
        "diagnose_jd": "正在分析 JD...",
        "search_real_jd": "正在搜索招聘...",
        "get_user_profile": "读取画像...",
        "add_growth_entry": "记录成长档案...",
        "set_career_goal": "更新目标岗位...",
        "track_application": "追踪投递记录...",
    }
    label = tool_labels.get(tool_name, f"调用 {tool_name}...")
    yield f"data: {json.dumps({'type': 'tool_calling', 'label': label}, ensure_ascii=False)}\n\n"
    continue
```

前端 `useChat.ts` 接收 `type: "tool_calling"` 后更新流式输出区域的副标题（替换 `思考中` 为具体操作名），不存入 `ChatMessage`。

---

## 问题 4：系统提示词禁用 Markdown 但前端渲染 Markdown（已知矛盾）

`agent/agent.py` 的 `SYSTEM_PROMPT_TEMPLATE` 写了 `禁止 markdown 格式和 emoji`，但 `ChatPanel.tsx` 用 `ReactMarkdown` 渲染 AI 消息。

两个选择，选一个：

- **A（推荐）**：删除提示词里 `禁止 markdown 格式和 emoji` 这句，让 Agent 正常输出 Markdown，前端正常渲染。
- **B**：删除前端的 `ReactMarkdown`，改用 `<pre>` 或纯文本渲染。

选 A 更合理，因为 Markdown 能提升可读性，前端已有完整渲染支持。
