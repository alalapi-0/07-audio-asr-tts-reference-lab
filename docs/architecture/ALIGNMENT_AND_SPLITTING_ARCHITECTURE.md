# Alignment and Splitting Architecture

对齐与切分的目标是生成高质量、可审核、适合 TTS 训练的 segment。它不能只依赖 ASR，也不能把原文差异粗暴当作删除依据。

## 输入

- `TranscriptResult`
- `source_text`
- `norm_align_text`
- `norm_tts_text`
- `span_map`
- audio metadata
- quality metrics

## ASR-only 初级切分

Round 13 先实现 ASR-only 初级切分，用于在没有复杂原文对齐时形成候选段。

规则：

- 根据 ASR segment 和 word timestamp 初步建立候选。
- 按中文标点合并句子。
- 目标时长 2-15 秒。
- 推荐优先区间 3-12 秒。
- 过短 segment 尝试与相邻 segment 合并。
- 过长 segment 按标点、停顿或 word timestamp 拆分。

输出：

- `audio_segment_candidate`
- `source_id`
- `start`
- `end`
- `asr_text`
- `norm_tts_text_candidate`
- `confidence_summary`

## 原文辅助对齐

Round 14 引入正确原文，判断 ASR 与原文的关系。

对齐结果类型：

- `matched`：ASR 与原文匹配。
- `extra_candidate`：ASR 中多出来，可能是口误、废话、重复或原文缺漏。
- `missing`：原文有但 ASR 未识别。
- `repeated`：疑似重读。
- `uncertain`：无法自动判断。

字段：

- `source_range`
- `asr_range`
- `audio_range`
- `similarity`
- `alignment_status`
- `reason`
- `review_required`

## fuzzy matching

Round 15 支持原稿和录音存在少量差异。

使用场景：

- 主播小幅改词。
- 原文标点不同。
- ASR 错字。
- 章节标题或页眉混入。

约束：

- fuzzy score 低于阈值必须进入 `uncertain`。
- fuzzy 匹配不能自动删除文本。
- 相似句重复出现时必须保守处理。

## forced alignment fallback

Round 33 引入 whisperX / 中文 wav2vec2 forced alignment fallback。

触发条件：

- word confidence 低。
- segment confidence 低。
- 对齐结果 `uncertain`。
- 边界疑似漂移。
- ASR-only 切分过长或过短且无法可靠拆分。

不做：

- 不对所有 segment 默认跑 forced alignment。
- 不把 fallback 结果无条件覆盖原结果。

合并策略：

- 保留原 ASR provenance。
- 记录 fallback backend。
- 记录 alignment score。
- 若 fallback 与原结果冲突，进入人工审核。

## 句级 TTS segment

最终 TTS segment 应尽量是自然语义单元。

目标：

- 2-15 秒硬范围。
- 3-12 秒优先范围。
- 文本完整。
- 无明显截断。
- 起止点有少量 padding 可配置。
- 不包含明显静音、重读、口误和非正文噪声。

不应：

- 为追求时长切断语义。
- 为追求文本匹配误删人物台词。
- 把 ASR 幻觉写入 TTS 轨。

## review 触发

以下情况进入人工审核：

- 低 word confidence。
- 低 segment confidence。
- `avg_logprob` 异常。
- `compression_ratio` 异常。
- `no_speech_prob` 高。
- 对齐 `uncertain`。
- 可能存在口误、重读、废话但原文证据不足。
- 切点在词中间或语义中间。
- 过短、过长或静音异常。

## 输出

候选输出：

- `segments/{source_id}.json`
- `alignment/{source_id}.json`
- `cut_suggestions/{source_id}.json`

segment 字段：

- `segment_id`
- `source_id`
- `start`
- `end`
- `duration`
- `asr_text`
- `source_text`
- `norm_tts_text`
- `alignment_status`
- `quality_status`
- `review_status`
- `export_eligible`

## 验收标准

未来实现应验证：

- segment duration 在目标范围内或被标记 review。
- 低置信度不自动删除。
- fuzzy matching 不会误删正文。
- forced alignment fallback 可追踪且不覆盖原证据。
- 输出能被 quality gate 和 human review 使用。
