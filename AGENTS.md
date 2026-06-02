# Agent 协作协议

本仓库服务于中文有声书清洗与 TTS 数据集生成。后续 Agent 必须先理解：ASR 是工具，最终目标是干净音频、准确文本、可审核切分、高质量 TTS 数据集和未来个人声音克隆训练。

## 启动阅读顺序

每个新 Agent 开始功能开发前，必须优先阅读：

1. `README.md`
2. `PROJECT_STATE.md`
3. `docs/ROADMAP_40_ROUNDS.md`
4. `docs/governance/repo_protocol_standard.yaml`
5. `docs/governance/current_repo_audit.md`
6. `docs/reference_absorption/07_audio_asr_tts_reference_synthesis.md`
7. `docs/reference_absorption/migration_matrix.md`
8. 与当前 Round 相关的 `docs/architecture/*.md`

如果任务与数据、安全、协议、路线图冲突，优先保持仓库原有稳定结构，并在 `docs/governance/update_log.md` 记录处理原则。

## 禁止事项

- 不得直接复制参考仓库代码，尤其不能搬运许可证不明确或非商用限制代码。
- 不得把 `index-tts` / `amphion` 当成已在本地读取过的源码。
- 不得提交真实有声书音频、真实原文、训练产物、缓存、API key、token、密码或私钥。
- 不得在未确认对应 Round 的情况下做大规模功能开发。
- 不得把 diarization 设为 MVP 必需项。
- 不得把最终中文 TTS 文本罗马化。
- 不得为了参考 whisperX 或 tts-dataset-pipeline 而推翻本项目结构。
- 不得在治理轮下载模型、跑真实 ASR、调用真实 LLM API、训练 TTS 或做云部署。

## Round 工作规则

后续开发应按 `docs/ROADMAP_40_ROUNDS.md` 推进。

每轮开始前：

- 确认当前 Round 编号、目标、前置条件和不做什么。
- 检查 `PROJECT_STATE.md` 中的当前风险和 TODO。
- 确认是否需要更新或新增测试 / 检查脚本。

每轮结束前：

- 更新 `PROJECT_STATE.md`。
- 更新 `docs/governance/update_log.md`。
- 如新增治理文件、目录或安全边界，更新 `docs/governance/file_role_map.yaml` 和 `scripts/check_repo.py`。
- 运行 `python scripts/check_repo.py`，并在最终汇报中说明结果。

## 数据处理边界

真实素材必须保持在本地忽略目录中：

- `data/`
- `cache/`
- `datasets/`
- `exports/`

如果发现疑似真实音频、真实文本、API key、token、密码或隐私数据：

- 不读取内容。
- 不处理。
- 不提交。
- 只记录“发现疑似需要保护的本地数据路径”。
- 确认 `.gitignore` 覆盖。

## 参考仓库边界

当前根目录中的 5 个参考子项目是资料来源：

- `easyaligner/`
- `tts-dataset-pipeline/`
- `whisper/`
- `whisper-timestamped/`
- `whisperX/`

它们可以提供架构思想、schema 设计、pipeline 阶段、质量门、缓存策略和 adapter 抽象，但不能被直接复制成项目实现。

特别说明：

- `tts-dataset-pipeline` 的方法论可吸收，但代码和模型路径存在非商用许可证风险。
- `whisperX` 的 VAD 和 forced alignment 可作为 Phase 2 fallback，但 pyannote diarization 不是单人旁白 MVP 必需项。
- `whisper-timestamped` 适合作为 MVP ASR adapter 默认候选。
- `easyaligner` 的 SpanMap 和双轨规范化思想适合中文原文辅助对齐。
- `whisper` 原版适合作为基础 ASR adapter 和质量指标参考。

## 中文文本原则

- 保留中文文本和中文标点作为 TTS 训练主轨。
- 对齐轨可以做可逆规范化，但必须保留 span map。
- 不粗暴删除正文中可能存在的“嗯、啊、就是、然后”。
- 废话、重读、口误优先标记为候选，由质量门、LLM 建议和人工审核共同决定。

## 代码实现边界

Round 00 只做治理、设计、规划、协议和轻量检查脚本。后续功能实现必须小步推进，并优先使用 mock / fixture 形成闭环，再接真实后端。

## MCP Tools

本项目优先使用 `.cursor/mcp.json` 中声明的 MCP 工具。自动推进轮开始前应确认 MCP 已在 Cursor Settings → MCP 中加载（修改配置后通常需 Reload Window）。

- **浏览器相关任务** 必须优先使用 Playwright MCP 或等效浏览器 MCP（如 Cursor 内置 browser）；页面实现必须边实现边浏览器检查，不能仅凭代码判断成功。
- **文件操作** 必须确认真实文件状态（filesystem MCP 或 Read/Write/Grep）。
- **GitHub 操作** 必须在提交前检查 `git diff`，避免泄露密钥、真实音频或原文。
- **filesystem MCP** 仅授权 `${workspaceFolder}`，不得授权系统根目录或整个用户主目录。
- 若 MCP 不可用，Agent 应记录原因，并按 `docs/agent_skills/mcp_usage_skill.md` 使用可用替代方案继续推进。
- 若需要 token / API Key 但当前环境没有，则进入 mock / dry-run，不要卡死整体流程。

详细说明见 `docs/agent_skills/mcp_usage_skill.md` 与 `.cursor/rules/mcp-agent-tools.mdc`。
