# Project State

更新时间：2026-06-02

## 当前轮次

当前执行的是 **MCP 工具安装与自动运行配置** 轮（工具层，非业务 Round）。

上一轮完成 Round 00：当前仓库审计与参考吸收治理。

## 当前仓库状态

- 根目录已初始化 Git 仓库（MCP 配置轮）。
- 根目录包含 5 个本地参考子项目克隆（`easyaligner/` 等），已加入 `.gitignore`，不进入版本控制。
- 项目级 MCP 配置位于 `.cursor/mcp.json`（playwright、filesystem、github）。
- Agent MCP 文档位于 `docs/agent_skills/mcp_usage_skill.md`。

## 项目定位

本项目的真实目标是：

中文有声书音频 -> 清洗 / 切分 / 转写 / 对齐 -> 高质量 audio+text TTS 数据集 -> 个人 TTS / 声音克隆训练。

ASR 是工具，不是终点。项目最终服务于：

- 干净音频
- 准确中文文本
- 可人工复核的切分方案
- wav+txt 数据集
- metadata.csv / JSONL / dataset_manifest
- 未来 IndexTTS、Amphion 或其他 TTS 框架的导出 profile

## 当前仓库状态

- 根目录已初始化 Git 仓库。
- 根目录原先只有 5 个参考子项目：`easyaligner/`、`tts-dataset-pipeline/`、`whisper/`、`whisper-timestamped/`、`whisperX/`（本地只读克隆，不提交）。
- 根级治理文件原先缺失，Round 00 新增根级 README、AGENTS、PROJECT_STATE、docs、scripts 和 `.gitignore`。
- MCP 配置轮新增 `.cursor/mcp.json`、MCP 检查脚本与 Agent 技能文档。
- 本轮未修改参考子项目源码。

## 已吸收的参考结论

P0：

- `whisper-timestamped` 适合作为 MVP 默认 ASR adapter 候选，重点吸收 word timestamp、word confidence、segment confidence、VAD 参数和中文 `language=zh`。
- `tts-dataset-pipeline` 的预处理、对齐、过滤、导出、Retained / Rejected 状态机、quality gate、wav+txt、metadata.csv 和幂等重跑方法适合作为数据集流水线主参考。
- `easyaligner` 的可逆文本规范化、对齐轨与 TTS 轨分离、SpanMap 思路和分层缓存适合本项目中文原文辅助对齐。

P1：

- `whisperX` 适合作为长音频 VAD、forced alignment fallback 和低置信度段二次处理参考。
- `whisper` 原版适合作为基础 ASR adapter、16k 工作采样率和 avg_logprob / compression_ratio / no_speech_prob 质量指标参考。

P2：

- `index-tts` 和 `amphion` 当前没有本地源码，只作为未来导出格式约束：metadata.csv、JSONL、train/val split、speaker_id、dataset_manifest、training_profile.yaml。
- diarization、prob_diff 高级复核、音频增强、dashboard 和训练集版本管理放到 Phase 2 或后续 Round。

## 本轮没有进行的操作

- 没有处理真实音频。
- 没有读取真实原文。
- 没有调用真实 ASR。
- 没有调用真实 LLM API。
- 没有下载模型。
- 没有安装大型依赖。
- 没有训练 TTS。
- 没有实现完整 UI。
- 没有复制参考仓库代码。
- 没有删除、合并、重命名已有文件。

## 当前风险

- 参考子项目许可证和模型许可证混合，未来实现前必须单独确认。
- `tts-dataset-pipeline` 相关材料存在非商用许可证风险，只能借鉴方法论。
- `index-tts` / `amphion` 未在当前工作区读取源码，不能把导出格式视为已验证实现。
- 后续如果引入真实素材，必须确认 `.gitignore` 和本地数据边界生效。
- MCP 依赖 Node/npx；若本地未安装或 Cursor 未 Reload，Playwright/filesystem/github MCP 可能未加载，需按文档降级。
- `GITHUB_TOKEN` 未配置时 GitHub MCP 不可用，但不阻塞本地 git 推进。

## 当前 TODO

- Round 01：设计项目 manifest 与素材登记，不复制真实大文件进仓库。
- 自动推进轮开始前：运行 `python scripts/check_mcp_config.py`，确认 Cursor MCP 已加载。
- Round 02：初始化本地数据目录与 Git 安全边界，并验证 `.gitignore`。
- Round 03：设计音频导入与工作副本转码。
- Round 05-08：建立 ASR adapter、mock transcript、whisper-timestamped 规划和缓存可复现机制。

## 下一轮建议

建议下一轮从 Round 01：项目 Manifest 与素材登记开始。

Round 01 应优先产出：

- `project_manifest.json` schema
- `source_audio.json` schema
- `chapter_manifest` schema
- checksum 和 dry-run 登记脚本
- mock 路径 fixture

仍然不要导入真实音频到仓库。
