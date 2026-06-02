# Cache and Partial Redo Architecture

缓存与局部重跑的目标是避免整本书重复处理。每个阶段都应可追踪输入、参数和输出，并支持 source 或 segment 粒度重跑。

## 核心 ID

### source_id

每个音频源必须有稳定 `source_id`。

建议由以下信息派生或登记：

- project id。
- book id。
- chapter id。
- file path。
- checksum。

### checksum

checksum 用于判断输入是否变化。

建议记录：

- raw audio checksum。
- source text checksum。
- work audio checksum。
- transcript checksum。
- normalized text checksum。

## 缓存目录

建议布局：

```text
cache/
  asr/
    {source_id}/
  align/
    {source_id}/
  segments/
    {source_id}/
  quality/
    {source_id}/
  review/
    {source_id}/
  export/
    {dataset_id}/
```

`cache/` 默认被 `.gitignore` 保护。

## ASR 缓存

```text
cache/asr/{source_id}/{backend}/{params_hash}/
  raw.json
  transcript.json
  metadata.json
```

metadata 记录：

- backend。
- backend_version。
- params_hash。
- audio_checksum。
- language。
- created_at。

## alignment 缓存

```text
cache/align/{source_id}/{aligner}/{params_hash}/
  alignment.json
  span_map.json
  diff_report.json
  metadata.json
```

## segment 缓存

```text
cache/segments/{source_id}/{strategy}/{params_hash}/
  segment_candidates.json
  cut_suggestions.json
  metadata.json
```

## stage marker

每个阶段可写入 marker：

- `stage`
- `status`
- `input_checksums`
- `params_hash`
- `output_paths`
- `created_at`
- `error`

状态：

- `pending`
- `running`
- `succeeded`
- `failed`
- `skipped`
- `invalidated`

## skip-if-exists

如果以下条件一致，可以跳过：

- 输入 checksum 未变化。
- backend version 未变化。
- params hash 未变化。
- 输出文件存在且 schema 通过。

不能只因为文件存在就跳过。

## partial redo

### redo_source

对单个 source 重新跑指定 stage。

适用：

- 原音频替换。
- 原文修正。
- ASR 参数变化。
- 对齐策略变化。

### redo_segment

对单个 segment 重新跑局部流程。

适用：

- 人工调整切点。
- 单段 ASR 失败。
- 单段 forced alignment。
- 单段质量复核。

### redo_asr

重新 ASR，但不必重做已人工确认的最终文本。后续合并时必须保留 provenance。

### redo_align

重新原文辅助对齐或 forced alignment，不直接覆盖人工审核结果。

## dependency graph

阶段依赖：

```text
manifest
  -> audio_precheck
  -> work_audio
  -> asr
  -> text_normalization
  -> alignment
  -> segmentation
  -> quality_gate
  -> review
  -> cut_plan
  -> export
```

如果上游变化，下游缓存应标记 `invalidated`，但不立即删除，以便审计。

## 不整本书重跑

有声书通常很长。默认策略：

- 优先 source 粒度。
- 再细分 segment 粒度。
- 批处理 runner 只处理 dirty stage。
- 已 approved segment 不因无关缓存变化自动失效。

## 验收标准

未来实现应验证：

- cache key 包含 checksum、backend version 和 params hash。
- skip-if-exists 不会使用过期结果。
- redo_segment 不触发整本书重跑。
- cache invalidation 可解释。
- 人工审核结果不会被自动重跑覆盖。
