# 当前仓库审计报告

本报告记录 Round 00 参考仓库吸收治理轮开始前的实际仓库状态。审计只读取目录结构、公开文档和文件名，不处理真实音频，不读取疑似私密数据内容，不调用外部 API。

## 审计结论

当前根路径是 `/Volumes/AI_WORK_SSD/lab/reference_lab/07_audio_asr_tts`。该目录当前不是 Git 仓库，`git status` 返回 `fatal: not a git repository`。根目录更像一个参考项目集合，而不是已经完成治理的统一项目仓。

根级已存在的主要目录：

- `easyaligner/`
- `tts-dataset-pipeline/`
- `whisper/`
- `whisper-timestamped/`
- `whisperX/`

根级原先缺失的核心文件和目录：

- `README.md`
- `AGENTS.md`
- `PROJECT_STATE.md`
- `.gitignore`
- `docs/`
- `rounds/`
- `scripts/`
- `packages/`
- `apps/`
- `data/`

## 已存在的核心文件

根级治理文件原先不存在。可读取的核心文档主要来自参考子项目：

- `easyaligner/README.md`
- `tts-dataset-pipeline/README.md`
- `tts-dataset-pipeline/forced-alignhf-model/README.md`
- `whisper/README.md`
- `whisper/data/README.md`
- `whisper-timestamped/README.md`
- `whisperX/README.md`

这些文件属于各自上游参考项目，本轮不改写其内容。

## 已有协议文件

未发现根级协议文件：

- 未发现 `AGENTS.md`
- 未发现 `PROJECT_STATE.md`
- 未发现 `repo_protocol_standard.yaml`
- 未发现 `docs/governance/repo_protocol_standard.yaml`
- 未发现 `docs/governance/agent_reading_protocol.md`
- 未发现 `docs/STAGE_ROADMAP.md`
- 未发现 `docs/ROADMAP_40_ROUNDS.md`

因此本轮需要新增根级治理协议，但不能把它伪装成上游参考项目协议。

## 已有 rounds 文件

未发现根级 `rounds/` 目录，也未发现统一的 Round 规划文件。当前不存在可审计的轮次编号连续性。本轮将创建 `docs/ROADMAP_40_ROUNDS.md` 作为新的路线图入口，不删除或覆盖任何已有轮次记录。

## 已有模块覆盖

现有能力主要分散在参考子项目中：

- ASR：`whisper/`、`whisper-timestamped/`、`whisperX/`
- VAD / diarization / alignment：`whisperX/`、`easyaligner/`
- forced alignment：`easyaligner/`、`tts-dataset-pipeline/forced-alignhf-model/`
- audio 处理：`whisper/`、`whisperX/`、`tts-dataset-pipeline/`
- text normalization：`easyaligner/`、`tts-dataset-pipeline/`

根级尚未形成自己的业务模块：

- `packages/asr_core/`
- `packages/text_core/`
- `packages/alignment_core/`
- `packages/audio_core/`
- `packages/quality_core/`
- `packages/export_core/`
- `packages/review_core/`
- `packages/cache_core/`
- `apps/`

本轮只规划这些模块，不创建大型实现。

## 数据安全与大文件风险

根级原先没有 `.gitignore`，因此存在以下风险：

- 真实有声书音频可能被误提交。
- `data/`、`cache/`、`datasets/`、`exports/` 产物可能被误提交。
- `.env`、key、token、pem 文件可能被误提交。
- ASR 模型缓存、导出 wav、训练 manifest 和临时 JSON 可能膨胀仓库。

只读检查中，音频相关 glob 主要命中 `whisper-timestamped/tests/expected/.../*.csv` 测试期望文件，未发现根级真实音频文件。敏感词检索命中多为参考子项目代码或文档中的通用变量名和测试语义；本轮不读取疑似私密文件内容。

## 当前项目目标差距

项目真实目标是：

中文有声书音频 -> 清洗 / 切分 / 转写 / 对齐 -> 高质量 audio+text TTS 数据集 -> 个人 TTS / 声音克隆训练。

当前根目录与该目标之间的主要差距：

- 缺少统一项目定位，容易被误解为 ASR 参考仓集合。
- 缺少数据安全边界。
- 缺少 ASR adapter、文本双轨规范化、对齐切分、质量门、人工审核、导出 manifest 的项目级设计。
- 缺少 Round 00-39 的长期推进计划。
- 缺少后续 Agent 的阅读顺序和操作协议。
- 缺少轻量仓库检查脚本。

## 本轮建议修改范围

本轮适合新增根级治理层：

- 根级 `README.md`、`AGENTS.md`、`PROJECT_STATE.md`
- 根级 `.gitignore`
- `docs/governance/`
- `docs/reference_absorption/`
- `docs/architecture/`
- `docs/ROADMAP_40_ROUNDS.md`
- `scripts/check_repo.py`

这些文件用于沉淀方法论、路线图、协议和检查规则，不直接开发 ASR、对齐、切音频、UI 或导出功能。

## 本轮明确不修改的内容

- 不修改 `easyaligner/`、`tts-dataset-pipeline/`、`whisper/`、`whisper-timestamped/`、`whisperX/` 源码。
- 不删除、合并、重命名参考子项目文件。
- 不初始化 Git 仓库。
- 不下载模型。
- 不安装大型依赖。
- 不跑真实 ASR。
- 不处理真实音频。
- 不调用真实 LLM API。
- 不训练 TTS。
- 不实现完整 UI。

## 风险点

- 当前根目录不是 Git 仓库，版本控制状态无法用 `git status` 审计。
- 参考子项目许可证和模型许可证混合，不能直接复制代码进入项目实现。
- `tts-dataset-pipeline` 相关材料存在 CC BY-NC 或模型非商用限制风险，只能借鉴方法论。
- `index-tts` 和 `amphion` 当前没有本地源码目录，不能声称已阅读源码，只能按公开训练数据需求反向约束导出格式。
- 如果后续创建真实 `data/`、`cache/`、`datasets/`，必须先确认 `.gitignore` 生效。

## 本轮审计后的处理原则

- 保留 5 个参考子项目作为资料来源，不改动其内部结构。
- 在根级建立本项目自己的治理层和路线图。
- 将 ASR 置于工具位置，最终目标保持为中文有声书 TTS 数据集。
- 先用文档和检查脚本固化协议，再进入 Round 01 的项目 manifest 与素材登记。
