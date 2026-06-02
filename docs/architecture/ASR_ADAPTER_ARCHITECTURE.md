# ASR Adapter Architecture

ASR adapter 的目标是隔离后端差异，让后续 pipeline 使用统一 transcript schema。ASR 是工具，不直接决定最终数据集文本和切分结果。

## AsrBackend 抽象

概念接口：

```python
class AsrBackend:
    name: str
    capabilities: AsrBackendCapabilities

    def transcribe(self, audio_ref: AudioRef, params: AsrParams) -> TranscriptResult:
        ...
```

核心输入：

- `source_id`
- `audio_path`
- `checksum`
- `language`
- `sample_rate`
- `vad_config`
- `backend_params`

核心输出：

- `TranscriptResult`
- raw backend output path
- normalized transcript path
- backend metadata

## TranscriptResult schema

必须保留：

- `source_id`
- `backend`
- `backend_version`
- `language`
- `params_hash`
- `audio_checksum`
- `created_at`
- `segments`

`segments` 字段：

- `segment_id`
- `start`
- `end`
- `text`
- `confidence`
- `avg_logprob`
- `compression_ratio`
- `no_speech_prob`
- `words`

`words` 字段：

- `word_id`
- `start`
- `end`
- `text`
- `confidence`

中文场景中 `word` 可以表示词、字或后端返回的最小可用 token。schema 不强制它一定是英文单词。

## 后端类型

### MockAsrBackend

用途：

- Round 06 建立离线闭环。
- 不依赖模型。
- 使用 fixture transcript。
- 支持 schema validation。

不做：

- 不评估真实音频质量。
- 不代表真实 ASR 精度。

### WhisperTimestampedBackend

用途：

- MVP 默认 ASR 后端候选。
- 中文 `language=zh`。
- 支持 VAD 参数。
- 提供 word timestamp 和 confidence。

需要保留：

- raw output。
- normalized output。
- word confidence。
- segment confidence。
- backend params。

风险：

- 中文词边界和置信度阈值需要后续小样本校准。
- 不在治理轮下载模型。

### WhisperXBackend

用途：

- Phase 2 fallback。
- 长音频 VAD。
- forced alignment。
- 低置信度 segment 二次对齐。

不作为 MVP 默认路径：

- 依赖复杂。
- 中文模型配置需要单独验证。
- diarization 对单人旁白不是必需。

### OpenAIWhisperBackend

用途：

- 基础 ASR adapter 参考。
- 保留 `avg_logprob`、`compression_ratio`、`no_speech_prob`。
- 可作为后备路径或对照 backend。

限制：

- 不作为高精度切分唯一来源。
- 不直接替代原文辅助对齐和人工审核。

## 能力矩阵

| Backend | MVP | word timestamp | confidence | VAD | forced alignment | 主要用途 |
|---|---:|---:|---:|---:|---:|---|
| MockAsrBackend | 是 | fixture | fixture | 否 | 否 | 离线测试 |
| WhisperTimestampedBackend | 是 | 是 | 是 | 是 | 否 | MVP ASR |
| WhisperXBackend | 否 | 是 | 部分 | 是 | 是 | Phase 2 fallback |
| OpenAIWhisperBackend | 可选 | 视配置 | 指标型 | 否 | 否 | 基础后备 |

## 缓存要求

ASR 缓存路径建议：

```text
cache/asr/{source_id}/{backend}/{params_hash}/raw.json
cache/asr/{source_id}/{backend}/{params_hash}/transcript.json
cache/asr/{source_id}/{backend}/{params_hash}/metadata.json
```

cache key 必须包含：

- audio checksum
- backend name
- backend version
- language
- vad params
- model params

## Quality gate 输入

ASR adapter 必须为质量门提供：

- segment duration。
- word confidence。
- segment confidence。
- avg_logprob。
- compression_ratio。
- no_speech_prob。
- missing words 或 empty text 信息。

质量门不能只依赖一个指标。

## Fallback 策略

低置信度 segment 不立即删除。建议路径：

1. 标记 `manual_review` 或 `fallback_needed`。
2. 若配置允许，进入 whisperX / forced alignment fallback。
3. fallback 输出与原 transcript 合并并保留 provenance。
4. 仍不确定时进入人工审核。
