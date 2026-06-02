# Quality Gate Architecture

质量门用于把 segment 分为自动通过、自动拒绝和需要人工审核。它只给出状态和理由，不直接删除原始数据。

## 输入指标

### duration gate

检查：

- segment duration。
- 目标范围 2-15 秒。
- 推荐范围 3-12 秒。
- 过短、过长、空音频。

建议：

- 小于 2 秒：默认 `manual_review` 或 `auto_rejected`，取决于是否有有效文本。
- 3-12 秒：优先通过下一项检查。
- 大于 15 秒：默认 `manual_review` 或重新切分。

### ASR confidence gate

检查：

- word confidence。
- segment confidence。
- 低置信度 word 占比。
- 连续低置信度区域。

用途：

- 标记 fallback。
- 标记人工审核。
- 不直接删除正文。

### whisper 指标

保留并纳入质量判断：

- `avg_logprob`
- `compression_ratio`
- `no_speech_prob`

含义：

- `avg_logprob` 低可能表示识别质量差。
- `compression_ratio` 高可能表示重复、幻觉或异常文本。
- `no_speech_prob` 高可能表示静音或非语音。

### audio gate

检查：

- clipping。
- silence。
- peak level。
- RMS / LUFS。
- audio decode error。
- leading/trailing silence。

Round 04 先做 precheck，Round 35 再考虑增强。

### alignment gate

检查：

- source/asr similarity。
- alignment status。
- fuzzy score。
- forced alignment score。
- source_range 是否存在。
- asr_range 是否存在。

### prob_diff

prob_diff 是高级质量门，参考 tts-dataset-pipeline 的思想。它属于 Round 34，不进入 MVP。

用途：

- 对 segment 文本和音频一致性做二次复核。
- 作为 retained/rejected 的高级依据。

风险：

- 中文阈值必须实测。
- 模型许可证必须确认。

## 状态机

基础状态：

- `retained`
- `rejected`
- `review_needed`

审核流状态：

- `auto_approved`
- `auto_rejected`
- `manual_review`
- `approved`
- `rejected`
- `needs_redo`

推荐流转：

```text
segment_candidate
  -> quality_checked
  -> auto_approved / auto_rejected / manual_review
  -> approved / rejected / needs_redo
  -> export_eligible / not_exportable
```

## decision reason

每次质量门判断必须记录 reason。

常见 reason：

- `duration_too_short`
- `duration_too_long`
- `low_word_confidence`
- `low_segment_confidence`
- `high_no_speech_prob`
- `bad_avg_logprob`
- `high_compression_ratio`
- `clipping_detected`
- `silence_detected`
- `alignment_uncertain`
- `text_empty`
- `source_mismatch`
- `manual_override`

## quality_report.json

建议结构：

```json
{
  "source_id": "source_001",
  "created_at": "2026-06-02T00:00:00Z",
  "rules_version": "quality-gate-v1",
  "summary": {
    "total_segments": 0,
    "auto_approved": 0,
    "auto_rejected": 0,
    "manual_review": 0
  },
  "segments": []
}
```

segment 条目：

- `segment_id`
- `duration`
- `metrics`
- `gate_results`
- `status`
- `reasons`
- `next_action`

## 自动通过条件

MVP 可采用保守自动通过：

- duration 在推荐范围。
- 文本非空。
- confidence 不低。
- alignment matched。
- 无明显 clipping / silence。
- 未触发重复或疑似口误。

## 自动拒绝条件

自动拒绝必须谨慎。

可自动拒绝：

- 音频无法解码。
- 文本为空且无语音。
- duration 极短且 no_speech 高。
- 明确重复导出项。

不自动拒绝：

- 原文与 ASR 存在小差异。
- 有语气词候选。
- 低置信度但可能是正文。

## 人工审核条件

进入 `manual_review` 的情况：

- 指标冲突。
- 文本和音频不确定。
- 切点不稳定。
- 可能误删正文。
- LLM 建议置信度低。

## 验收标准

未来实现应验证：

- 每个 segment 都有质量状态和 reason。
- 自动拒绝不会吞掉可疑正文。
- 质量报告可追踪输入指标。
- export 只读取 approved 或 auto_approved segment。
