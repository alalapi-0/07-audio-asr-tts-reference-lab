# Pipeline Architecture

本项目 pipeline 面向中文有声书清洗与 TTS 数据集生成。它不是 ASR 产品线，而是把长篇录音和正确原文逐步转化为可审核切分和训练数据集。

## 总流程

```text
中文有声书音频
  -> 导入
  -> 转码
  -> VAD
  -> ASR
  -> 时间戳
  -> 原文清洗
  -> ASR 清洗
  -> 对齐
  -> 机切建议
  -> 人工审核
  -> cut plan
  -> FFmpeg 导出
  -> TTS dataset
  -> training manifest
```

## 阶段职责

### 1. 导入

目标是登记素材，不复制真实大文件进仓库。

核心产物：

- `project_manifest.json`
- `source_audio.json`
- `chapter_manifest.json`

登记字段：

- `source_id`
- `book_id`
- `chapter_id`
- `audio_path`
- `source_text_path`
- `checksum`
- `duration`
- `sample_rate`
- `channels`

### 2. 转码

原始音频只读，工作副本可重建。

工作音频默认目标：

- mono
- 16k sample rate
- wav

TTS 导出仍保留未来 22050 / 24000 sample rate profile，不把 ASR 工作采样率等同于训练导出采样率。

### 3. VAD

MVP 可以使用 whisper-timestamped 或后端自带 VAD 参数。Phase 2 可引入 whisperX 的长音频 VAD。

VAD 的输出只作为 ASR 和切分辅助，不能直接决定删除正文。

### 4. ASR

ASR 后端必须通过 `AsrBackend` 抽象接入。MVP 先支持 mock transcript，再规划 whisper-timestamped。

ASR 结果必须保存：

- raw backend output
- normalized transcript
- backend params
- backend version
- checksum
- params hash

### 5. 文本清洗

文本分为三类：

- `raw_text`：原始输入，不覆盖。
- `norm_align_text`：对齐轨，允许可逆规范化。
- `norm_tts_text`：TTS 训练轨，保留中文可读文本和必要标点。

任何删除、替换、合并都必须可追踪。

### 6. 对齐

对齐不是简单按 ASR 结果切音频。它需要结合：

- ASR word timestamp
- 正确原文
- span map
- fuzzy matching
- quality metrics

对齐输出标记：

- `matched`
- `extra_candidate`
- `missing`
- `repeated`
- `uncertain`

### 7. 机切建议

LLM 或规则只能生成建议，不直接切音频。

建议动作：

- `keep`
- `delete`
- `trim`
- `split`
- `merge`
- `uncertain`

低置信度建议必须进入人工审核。

### 8. 人工审核

人工审核是数据质量闭环的核心。审核页面应显示原文、ASR、波形、模型建议、质量门结果和切点前后播放。

审核结果进入：

- `review_record`
- `feedback_record`

### 9. cut plan

cut plan 是非破坏式编辑计划，不修改原始音频。

包含：

- `keep_ranges`
- `delete_ranges`
- `pre_padding`
- `post_padding`
- `reason`
- `user_confirmed`

### 10. FFmpeg 导出

先 dry-run 生成命令计划，再正式导出。导出前必须校验：

- 时间范围合法。
- 区间不重叠。
- 音频不为空。
- 文本不为空。
- segment 状态可导出。

### 11. TTS dataset

导出目标：

- `datasets/wavs/*.wav`
- paired `.txt`
- `metadata.csv`
- `manifest.jsonl`
- `dataset_manifest.json`
- `training_profile.yaml`
- train/val split

## 状态流

```text
imported
  -> prechecked
  -> transcribed
  -> normalized
  -> aligned
  -> segmented
  -> quality_checked
  -> review_needed / auto_approved / auto_rejected
  -> approved / rejected
  -> exported
```

## MVP 边界

MVP 做：

- manifest 登记。
- mock ASR 闭环。
- transcript schema。
- 中文双轨规范化。
- ASR-only 初级切分。
- 基础 quality gate。
- non-destructive cut plan。
- dry-run 和小样本导出。

MVP 不做：

- 大规模真实音频处理。
- diarization 默认路径。
- whisperX 全量 forced alignment。
- 训练 TTS。
- 云部署。
