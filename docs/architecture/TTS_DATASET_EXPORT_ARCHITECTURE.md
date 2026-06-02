# TTS Dataset Export Architecture

TTS dataset export 的目标是把已审核 segment 导出为训练可用的 wav+text 数据集，同时保留来源、时间范围、质量和版本信息。

## 导出前置条件

segment 必须满足：

- `approved` 或 `auto_approved`。
- 有合法 `start` / `end`。
- 有非空 `norm_tts_text` 或人工 `edited_text`。
- audio source 可访问。
- cut plan 已验证。
- 未触发 blocking quality issue。

## 输出布局

建议：

```text
datasets/{dataset_id}/
  wavs/
    {item_id}.wav
  txt/
    {item_id}.txt
  metadata.csv
  manifest.jsonl
  dataset_manifest.json
  training_profile.yaml
  split/
    train.jsonl
    val.jsonl
    test.jsonl
  quality_report.json
```

`datasets/` 默认被 `.gitignore` 保护。

## wav+txt

每个 approved segment 导出：

- `{item_id}.wav`
- `{item_id}.txt`

wav 要求：

- mono 或按 profile 配置。
- sample_rate 按导出 profile 设置。
- 不修改原始音频，只从工作副本或原音频切片生成。

txt 要求：

- 使用 `norm_tts_text` 或人工审核后的 `edited_text`。
- 保留中文可读文本。
- 不输出对齐轨文本。
- 不输出罗马化文本作为最终中文训练文本。

## metadata.csv

LJSpeech-like 基础格式：

```text
item_id|text|normalized_text
```

本项目扩展字段可保留在 JSONL 中，避免破坏通用格式。

## manifest.jsonl

建议字段：

- `item_id`
- `wav_path`
- `txt_path`
- `text`
- `speaker_id`
- `source_id`
- `book_id`
- `chapter_id`
- `start`
- `end`
- `duration`
- `sample_rate`
- `quality_status`
- `review_status`
- `checksum`

## dataset_manifest.json

数据集级元信息：

- `dataset_id`
- `version`
- `created_at`
- `source_count`
- `item_count`
- `total_duration`
- `sample_rate`
- `speaker_id`
- `language`
- `text_policy`
- `export_profile`
- `source_checksums`
- `quality_summary`

## training_profile.yaml

用于记录训练侧约束，不直接启动训练。

字段：

- `profile_name`
- `target_framework`
- `sample_rate`
- `speaker_id`
- `language`
- `text_clean_policy`
- `manifest_format`
- `train_split`
- `val_split`
- `notes`

## LJSpeech-like profile

Round 24 目标：

- `wavs/`
- `metadata.csv`
- `dataset_manifest.json`
- sample rate 可配置。

用途：

- 兼容 Amphion 等常见 TTS 框架的基础数据布局。

限制：

- 不保证未经验证的框架训练配置可直接运行。

## IndexTTS profile

Round 25 目标：

- `training_profile.yaml`
- `speaker_id`
- prompt audio 引用。
- short utterance 策略。
- text clean policy。

限制：

- 当前没有本地 index-tts 源码。
- 只能作为未来训练侧导出约束。

## Amphion profile

Round 26 目标：

- LJSpeech-like profile。
- train/val split。
- sample rate notes。
- config notes。

限制：

- 当前没有本地 amphion 源码。
- 后续 clone 或接入前必须重新验证格式。

## train/val split

Round 36 处理。

要求：

- 避免 source leakage。
- 同一章节或同一连续片段不要跨 split 泄漏。
- 记录 split seed。
- 记录 checksum。
- 生成 release notes。

## 验收标准

未来实现应验证：

- 每个 wav 都有对应 txt。
- `metadata.csv` 与 JSONL item 数一致。
- 所有 wav path 为相对路径。
- 所有导出 item 来自 approved segment。
- `dataset_manifest.json` 可追踪来源和质量摘要。
- `training_profile.yaml` 不声称已完成训练。
