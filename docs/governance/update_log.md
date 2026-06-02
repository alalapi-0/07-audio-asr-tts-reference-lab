# 治理更新日志

## Round 00：参考仓库吸收治理

日期：2026-06-02

本轮性质：仓库治理、参考方法论吸收、路线图扩写、协议同步、检查脚本建立。

## 新增文件

- `README.md`
  - 操作类型：新增
  - 原因：根级缺少项目定位入口，需要明确本项目最终目标是中文有声书到 TTS 数据集，而不是单纯 ASR。
  - 替代文件：无
  - 是否影响后续 Agent：是，作为首读入口。

- `AGENTS.md`
  - 操作类型：新增
  - 原因：根级缺少 Agent 协作协议，需要规定阅读顺序、禁止事项和 Round 推进规则。
  - 替代文件：无
  - 是否影响后续 Agent：是，后续 Agent 必须遵守。

- `PROJECT_STATE.md`
  - 操作类型：新增
  - 原因：根级缺少当前状态记录，需要记录 Round 00 治理结论、风险和下一轮建议。
  - 替代文件：无
  - 是否影响后续 Agent：是，后续每轮应更新。

- `.gitignore`
  - 操作类型：新增
  - 原因：根级缺少大文件与敏感文件保护规则。
  - 替代文件：子项目局部 `.gitignore` 不能覆盖根级数据目录。
  - 是否影响后续 Agent：是，防止误提交真实素材和产物。

- `docs/governance/current_repo_audit.md`
  - 操作类型：新增
  - 原因：记录本轮执行前实际仓库状态。
  - 替代文件：无
  - 是否影响后续 Agent：是，提供初始审计基线。

- `docs/governance/repo_protocol_standard.yaml`
  - 操作类型：新增
  - 原因：建立根级仓库协议、外部参考吸收规则、数据安全规则和 Round 一致性规则。
  - 替代文件：无
  - 是否影响后续 Agent：是，作为治理协议源。

- `docs/governance/file_role_map.yaml`
  - 操作类型：新增
  - 原因：说明新增文档职责，避免后续重复造目录或文档。
  - 替代文件：无
  - 是否影响后续 Agent：是。

- `docs/reference_absorption/07_audio_asr_tts_reference_synthesis.md`
  - 操作类型：新增
  - 原因：将参考仓库报告蒸馏为本项目方法论。
  - 替代文件：无
  - 是否影响后续 Agent：是。

- `docs/reference_absorption/migration_matrix.md`
  - 操作类型：新增
  - 原因：建立参考能力到未来 Round 与模块的映射。
  - 替代文件：无
  - 是否影响后续 Agent：是。

- `docs/architecture/*.md`
  - 操作类型：新增
  - 原因：建立 pipeline、ASR adapter、文本规范化、对齐切分、质量门、TTS 导出、人工审核、缓存局部重跑架构。
  - 替代文件：无
  - 是否影响后续 Agent：是。

- `docs/ROADMAP_40_ROUNDS.md`
  - 操作类型：新增
  - 原因：将未来路线整理为 Round 00-39 共 40 轮。
  - 替代文件：无
  - 是否影响后续 Agent：是，作为后续推进主入口。

- `scripts/check_repo.py`
  - 操作类型：新增
  - 原因：提供轻量仓库结构和安全边界检查。
  - 替代文件：无
  - 是否影响后续 Agent：是，后续每轮应运行或扩展。

## 更新文件

本轮开始前根级治理文件不存在，因此本轮主要为新增根级治理层。未改写参考子项目内部文件。

## 删除、合并、重命名

本轮没有删除、合并、重命名任何已有文件或目录。

## 明确未做事项

- 未初始化 Git 仓库。
- 未下载模型。
- 未安装依赖。
- 未运行真实 ASR。
- 未调用真实 LLM API。
- 未处理真实音频。
- 未训练 TTS。
- 未实现完整 UI。
- 未复制参考仓库代码。
- 未修改 5 个参考子项目源码。

## 本轮理由

当前根目录是多个参考项目并列的资料集合，缺少统一治理层。本轮以最小侵入方式新增根级文档、协议、路线图和检查脚本，目标是让后续 Agent 能按 Round 逐步把参考方法论转化为本项目自己的中文有声书清洗与 TTS 数据集流水线。

---

## MCP 工具安装与自动运行配置

日期：2026-06-02

本轮性质：工具层配置，非业务 Round。为后续 Agent 自动推进接入 Playwright、filesystem、GitHub MCP。

## 新增文件

- `.cursor/mcp.json`
  - 操作类型：新增
  - 原因：声明项目级 MCP（playwright、filesystem、github），与全局 `~/.cursor/mcp.json` 合并，不覆盖已有 server。
  - 是否影响后续 Agent：是，自动推进轮依赖此配置。

- `.cursor/rules/mcp-agent-tools.mdc`
  - 操作类型：新增
  - 原因：约束 Agent 使用浏览器验证、filesystem 授权范围与 commit 前 diff 检查。
  - 是否影响后续 Agent：是。

- `docs/agent_skills/mcp_usage_skill.md`
  - 操作类型：新增
  - 原因：说明 MCP 用途、降级策略、可选 Context7 与 Cursor 重启要求。
  - 是否影响后续 Agent：是。

- `scripts/check_mcp_config.py`
  - 操作类型：新增
  - 原因：轻量校验 mcp.json 格式、playwright 存在性与 filesystem 危险路径。
  - 是否影响后续 Agent：是，轮次开始时可运行。

## 更新文件

- `AGENTS.md` — 新增 MCP Tools 节
- `README.md` — 新增 MCP 与 check_mcp_config 说明
- `.gitignore` — 忽略本地参考子项目克隆与 artifacts/
- `docs/governance/file_role_map.yaml` — 登记 MCP 相关文件
- `PROJECT_STATE.md` — 记录 Git 初始化与 MCP 状态

## 明确未做事项

- 未覆盖用户全局 `~/.cursor/mcp.json`（当前为空）。
- 未默认启用 Context7（仅文档说明可选项）。
- 未在 mcp.json 中写入任何 token 或 API Key。
- 未授权 filesystem MCP 访问系统根目录。

## 本轮理由

后续自动推进轮需要浏览器验收、稳定文件状态确认与 GitHub 查询能力。通过项目级 MCP 配置与文档化 fallback，避免 Agent 在无 token 或 MCP 未加载时卡死。
