# 参考仓库吸收总结

本文件将参考仓库分析报告蒸馏为本项目自己的方法论。目标不是复制外部代码，而是把可迁移的工程模式沉淀进中文有声书清洗与 TTS 数据集项目。

## 项目中心

本项目中心是中文有声书录音：

```text
长篇中文有声书录音
  -> 清洗 / 切分 / 转写 / 对齐
  -> 可人工复核的 cut plan
  -> 高质量 wav+txt TTS 数据集
  -> 个人 TTS / 声音克隆训练
```

ASR 是工具，不是终点。所有 ASR、VAD、alignment、quality gate、review 和 export 设计都必须服务于最终 TTS 数据集质量。

## P0：MVP 必须吸收

### whisper-timestamped

定位：MVP 阶段最适合作为默认 ASR adapter 候选。

可迁移价值：

- ASR + word timestamp。
- word confidence。
- segment confidence。
- VAD 参数。
- JSON 输出结构。
- 中文 `language=zh`。
- 轻量 MVP 后端。
- 低置信度片段后续 fallback 的触发依据。

迁移到本项目：

- 设计 `AsrBackend` 接口。
- 设计 `WhisperTimestampedBackend`。
- `transcript.json` 保留 `segments` 和 `words`。
- quality gate 使用 `word confidence` 和 `segment confidence`。
- Round 05-08 建立 adapter、mock、后端规划和缓存。

不直接迁移：

- 不要求本轮安装或下载模型。
- 不把 whisper-timestamped 原始输出作为最终数据模型，必须转为本项目 schema。

### tts-dataset-pipeline

定位：最接近本项目最终目标的数据集流水线参考。

可迁移价值：

- 原始 audio/text -> 预处理 -> 对齐 -> 过滤 -> 导出。
- mono wav 转换。
- wav+txt 成对导出。
- Retained / Rejected 状态机。
- quality gate。
- skip-if-exists / 幂等重跑。
- `metadata.csv`。
- `dataset_manifest`。
- `segment_audio` 思路。
- 自动通过 / 自动拒绝 / 待人工审核状态。

迁移到本项目：

- Round 18 建立质量门基础版。
- Round 19 建立 Retained / Rejected / Review 状态机。
- Round 22-24 建立 wav+txt、metadata.csv、LJSpeech-like 导出。
- Round 31-32 建立 partial redo 和批处理。
- 未来规划 `packages/quality_core/`、`packages/export_core/`。

许可证风险：

- 该参考项目和相关模型路径存在 CC BY-NC 或非商用限制风险。
- 不直接复制代码。
- 只借鉴 pipeline 设计、状态机和质量控制方法。

不直接迁移：

- 不照搬圣经 JSON 数据结构。
- 不照搬 uroman 罗马化路径。
- 不把中文最终 TTS 文本罗马化。

### easyaligner

定位：文本规范化、强制对齐、SpanMap 可逆文本处理、分层中间缓存参考。

可迁移价值：

- 可逆文本规范化。
- 对齐轨和 TTS 轨分离。
- `normalize_for_align` 与 `restore_for_tts` 思路。
- SpanMapNormalizer 思路。
- 分层 JSON 缓存。
- `SpeechSegment` / `AudioMetadata` 分层数据模型。
- fuzzy matching 作为 Phase 2 能力。

迁移到本项目：

- Round 11 设计中文文本双轨规范化。
- Round 12 设计 SpanMap 可逆规范化。
- Round 14-15 做原文辅助对齐和 fuzzy matching。
- `docs/architecture/TEXT_NORMALIZATION_ARCHITECTURE.md` 记录 raw / align / tts 三类文本。
- `docs/architecture/ALIGNMENT_AND_SPLITTING_ARCHITECTURE.md` 记录 span map 与对齐关系。

不直接迁移：

- 不直接复制实现。
- 不把英文或拉丁化假设用于中文最终文本。

## P1：Phase 2 或 fallback 吸收

### whisperX

定位：长音频 ASR + VAD + 中文 wav2vec2 forced alignment fallback。

可迁移价值：

- 长音频 VAD 前置。
- 中文词级或字词级对齐。
- forced alignment fallback。
- low confidence segment 二次处理。
- diarization 能力可作为可选项。
- 中文模型配置需要独立说明。

迁移到本项目：

- `WhisperXBackend` 作为 Phase 2 后端。
- Round 33 接入 whisperX / forced alignment fallback。
- 低置信度 segment 从 quality gate 进入二次对齐。
- `docs/architecture/ASR_ADAPTER_ARCHITECTURE.md` 说明能力矩阵。
- `docs/architecture/ALIGNMENT_AND_SPLITTING_ARCHITECTURE.md` 说明 fallback 合并策略。

不直接迁移：

- 不把 pyannote diarization 作为 MVP 必需项。
- 不对所有 segment 默认跑 forced alignment。
- 不在 Round 00 下载模型或配置 GPU 环境。

### whisper

定位：基础 ASR adapter 接口参考和后备路径。

可迁移价值：

- 基础 `transcribe` 接口。
- `word_timestamps` 的语义。
- 16k 工作采样率。
- `avg_logprob`、`compression_ratio`、`no_speech_prob` 等质量指标。

迁移到本项目：

- `OpenAIWhisperBackend` 作为基础或后备 backend。
- `transcript_segment` 保留 `avg_logprob`、`compression_ratio`、`no_speech_prob`。
- quality gate 纳入这些指标。
- Round 05 定义统一 ASR adapter 和 transcript schema。

不直接迁移：

- 不把原版 whisper 作为高精度切分唯一来源。
- 不用 ASR segment 直接替代人工审核。

## P2：未来导出约束

### index-tts

定位：当前参考目录缺失，不能声称已读取源码，只能作为未来训练侧导出约束。

可迁移价值：

- speaker_id。
- prompt audio。
- short utterance。
- training profile。
- clean text policy。

迁移到本项目：

- Round 25 设计 IndexTTS export profile。
- 输出 `training_profile.yaml`。
- 在 `dataset_manifest.json` 中保留 speaker、source、duration、text 和 wav 相对路径。

不直接迁移：

- 不接入训练。
- 不声称格式已被本地源码验证。

### amphion

定位：当前参考目录缺失，不能声称已读取源码，只能作为未来训练侧导出约束。

可迁移价值：

- LJSpeech-like 数据布局。
- `metadata.csv`。
- train/val split。
- sample rate 配置。
- dataset manifest。

迁移到本项目：

- Round 24 设计 LJSpeech-like 导出。
- Round 26 设计 Amphion export profile。
- Round 36 建立训练集划分与版本管理。

不直接迁移：

- 不接入训练。
- 不生成未经验证的 Amphion 训练配置。

## MVP / Phase 2 / 暂不做

MVP：

- 根级 manifest。
- 数据安全边界。
- audio precheck。
- ASR adapter + mock backend。
- whisper-timestamped 后端规划。
- transcript cache。
- 中文文本双轨规范化。
- ASR-only 初级切分。
- 原文辅助对齐。
- quality gate。
- non-destructive cut plan。
- wav+txt / metadata.csv / JSONL / dataset_manifest。

Phase 2：

- whisperX fallback。
- forced alignment fallback。
- fuzzy matching。
- partial redo。
-人工审核 UI。
- feedback loop。
- prob_diff 高级质量复核。
- 可选音频增强。
- dashboard。

暂不做：

- 大规模真实音频处理。
- 模型下载和训练。
- 云部署。
- 完整 UI。
- diarization 默认路径。
- 直接复制参考仓库代码。

## 对当前项目的具体映射

- ASR 能力进入 `ASR_ADAPTER_ARCHITECTURE.md` 和未来 `packages/asr_core/`。
- 文本规范化进入 `TEXT_NORMALIZATION_ARCHITECTURE.md` 和未来 `packages/text_core/`。
- 对齐切分进入 `ALIGNMENT_AND_SPLITTING_ARCHITECTURE.md` 和未来 `packages/alignment_core/`、`packages/audio_core/`。
- 质量门进入 `QUALITY_GATE_ARCHITECTURE.md` 和未来 `packages/quality_core/`。
- 导出进入 `TTS_DATASET_EXPORT_ARCHITECTURE.md` 和未来 `packages/export_core/`。
- 人工审核进入 `HUMAN_REVIEW_ARCHITECTURE.md` 和未来 `packages/review_core/`。
- 缓存与重跑进入 `CACHE_AND_PARTIAL_REDO_ARCHITECTURE.md` 和未来 `packages/cache_core/`。
