# Human Review Architecture

人工审核用于避免 ASR、对齐和质量门误删正文。页面和记录的目标是让人快速判断 segment 是否可以进入 TTS 数据集。

## 审核对象

审核单位是 segment。

segment 进入审核的原因：

- 低置信度。
- 对齐不确定。
- 疑似口误、重读、废话。
- 切点不自然。
- 文本需要修正。
- 质量门结果冲突。

## 页面区域

### 原文区

显示：

- source text。
- source_range 高亮。
- 章节上下文。
- norm_tts_text candidate。

用途：

- 判断 ASR 是否偏离正确原文。
- 判断疑似 filler 是否其实是正文。

### ASR 区

显示：

- raw ASR text。
- normalized ASR text。
- word timestamp。
- word confidence。
- low confidence highlight。

用途：

- 判断识别错误。
- 调整文本修正。

### 波形区

显示：

- waveform。
- start/end marker。
- silence。
- segment boundary。
- 切点前后预览。

功能：

- 播放 segment。
- 播放切点前后。
- 拖动切点。
- 保存 start/end。

### 模型建议区

显示：

- LLM cut decision。
- quality gate result。
- alignment status。
- suggested action。
- reason_type。
- confidence。

模型建议不能直接切音频，只作为人工决策参考。

## 审核动作

动作：

- `approve`
- `reject`
- `needs_redo`
- `edit_text`
- `adjust_boundary`
- `split`
- `merge`

每个动作必须记录 reason。

## review_record

建议字段：

- `review_id`
- `segment_id`
- `source_id`
- `reviewer`
- `reviewed_at`
- `decision`
- `edited_text`
- `start_before`
- `end_before`
- `start_after`
- `end_after`
- `reason`
- `notes`

原则：

- 不覆盖 raw ASR。
- 不覆盖原文。
- 人工 `edited_text` 作为导出优先文本。

## feedback_record

用于 Round 30 feedback loop。

建议字段：

- `feedback_id`
- `segment_id`
- `model_suggestion`
- `human_decision`
- `action_mismatch`
- `start_shift`
- `end_shift`
- `text_changed`
- `lesson`
- `prompt_improvement_candidate`

用途：

- 统计模型建议与人工最终结果差异。
- 改进规则和 prompt。
- 发现系统性误判。

## 状态流转

```text
manual_review
  -> approved
  -> rejected
  -> needs_redo
```

`needs_redo` 可以触发：

- `redo_asr`
- `redo_align`
- `redo_segment`
- `redo_cut_decision`

## MVP 页面

Round 27 的 MVP 只需要：

- project list。
- segment list。
- audio player。
- ASR text。
- source text。
- approve / reject。

Round 28 再增加波形时间轴和拖动切点。

Round 29 增加人工文本修正和 review record。

## 不做什么

- Round 00 不实现 UI。
- MVP 不做复杂多人协作权限。
- 模型建议不能自动覆盖人工决定。
- 审核记录不能覆盖 raw 输入。

## 验收标准

未来实现应验证：

- 每个人工决定都有 `review_record`。
- 修改文本不会覆盖 raw ASR。
- 调整切点会记录前后变化。
- approved segment 可进入 export。
- rejected segment 不进入 export，但仍保留证据。
