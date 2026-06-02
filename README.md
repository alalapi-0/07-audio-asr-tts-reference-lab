# audiobook-cleaner-lab

中文有声书清洗与 TTS 数据集项目。

本项目的最终目标不是单纯做 ASR，也不是字幕工具，而是把中文有声书录音转化为可复核、可导出、可训练的高质量 TTS / 声音克隆数据集。

核心链路：

```text
中文有声书音频
  -> 清洗 / 切分 / 转写 / 对齐
  -> 人工可审核 cut plan
  -> 干净 wav + 准确 txt
  -> metadata / JSONL / dataset manifest
  -> 个人 TTS / 声音克隆训练
```

ASR 在本项目中是工具，不是终点。ASR 的作用是提供时间戳、置信度和候选文本，最终仍要服务于干净音频、准确中文文本、可审核切分和 TTS 数据集导出。

## 当前仓库状态

当前根目录是一个参考项目集合，包含：

- `easyaligner/`
- `tts-dataset-pipeline/`
- `whisper/`
- `whisper-timestamped/`
- `whisperX/`

这些目录保留为参考资料。本项目自己的治理、架构和路线图位于根级文档中。Round 00 不改写这些参考子项目源码，也不复制其代码。

## MVP 默认路径

MVP 阶段优先建设可控的本地闭环：

1. 项目 manifest 与素材登记。
2. 本地数据目录和 Git 安全边界。
3. 音频元数据与质量预检查。
4. ASR adapter 抽象与 mock ASR。
5. whisper-timestamped 作为轻量中文 ASR 默认候选。
6. transcript 缓存与 skip-if-exists。
7. 原文文本导入、ASR 文本清洗和中文双轨规范化。
8. ASR-only 初级切分和原文辅助对齐。
9. 质量门、非破坏式 cut plan、人工审核。
10. wav+txt、metadata.csv、JSONL、dataset_manifest 导出。

whisperX / forced alignment 是 Phase 2 的低置信度 fallback，不是 MVP 默认全量路径。diarization 对单人中文旁白不是 MVP 必需项。

## 参考仓库吸收结论

本轮吸收的是方法论，不是代码复制：

- `whisper-timestamped`：MVP ASR adapter、word timestamp、word confidence、segment confidence、VAD 参数。
- `whisperX`：长音频 VAD、forced alignment fallback、低置信度二次处理。
- `tts-dataset-pipeline`：预处理 -> 对齐 -> 过滤 -> 导出、Retained / Rejected 状态机、quality gate、wav+txt、metadata.csv、幂等重跑。
- `easyaligner`：双轨文本规范化、SpanMap 可逆映射、分层 JSON 缓存、SpeechSegment / AudioMetadata 数据模型。
- `whisper`：基础 transcribe 接口、16k 工作采样率、avg_logprob、compression_ratio、no_speech_prob。
- `index-tts` / `amphion`：当前没有本地源码，只作为未来导出 profile 的反向约束。

详见：

- `docs/reference_absorption/07_audio_asr_tts_reference_synthesis.md`
- `docs/reference_absorption/migration_matrix.md`

## 路线图

长期路线统一整理为 Round 00-39：

- `docs/ROADMAP_40_ROUNDS.md`

后续功能开发应先确认对应 Round，再做最小范围实现。每轮结束后更新：

- `PROJECT_STATE.md`
- `docs/governance/update_log.md`

## 架构入口

- `docs/architecture/PIPELINE_ARCHITECTURE.md`
- `docs/architecture/ASR_ADAPTER_ARCHITECTURE.md`
- `docs/architecture/TEXT_NORMALIZATION_ARCHITECTURE.md`
- `docs/architecture/ALIGNMENT_AND_SPLITTING_ARCHITECTURE.md`
- `docs/architecture/QUALITY_GATE_ARCHITECTURE.md`
- `docs/architecture/TTS_DATASET_EXPORT_ARCHITECTURE.md`
- `docs/architecture/HUMAN_REVIEW_ARCHITECTURE.md`
- `docs/architecture/CACHE_AND_PARTIAL_REDO_ARCHITECTURE.md`

## 数据安全

真实素材和生成产物默认不进入版本控制：

- `data/`
- `cache/`
- `datasets/`
- `exports/`
- 音频和媒体文件
- `.env`、key、pem、token

本轮没有处理真实音频，没有运行真实 ASR，没有调用真实 API。

## 仓库检查

运行：

```bash
python scripts/check_repo.py
python scripts/check_mcp_config.py
```

`check_repo.py` 只检查根级文档、路线图和 `.gitignore` 安全边界，不依赖第三方库。

`check_mcp_config.py` 检查 `.cursor/mcp.json` 是否存在、JSON 是否合法、是否包含 Playwright，以及 filesystem 是否有过宽授权。详见 `docs/agent_skills/mcp_usage_skill.md`。

## MCP 工具（Agent 工作流）

项目级 MCP 配置位于 `.cursor/mcp.json`，默认启用：

- **playwright** — 浏览器自动化与 E2E 验收
- **filesystem** — 仅 `${workspaceFolder}` 范围内的文件读写
- **github** — 仓库 / issue / PR 查询（需本地设置 `GITHUB_TOKEN`）

修改 MCP 配置后需 **Reload Cursor Window** 才能生效。Context7 等文档 MCP 为可选项，见 `docs/agent_skills/mcp_usage_skill.md`。
