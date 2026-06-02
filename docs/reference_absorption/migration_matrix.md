# 参考能力迁移矩阵

本矩阵用于指导后续 Round 把参考仓库方法论迁移为本项目自己的实现。当前只规划，不复制外部代码。

## P0 能力

| 来源仓库 | 可迁移能力 | 解决的问题 | 迁移到本项目 | 对应 Round | 复杂度 | 优先级 | 风险 | 本轮状态 |
|---|---|---|---|---|---|---|---|---|
| whisper-timestamped | ASR + word timestamp | 为切分和对齐提供时间边界 | `packages/asr_core/`、`transcript.json` | Round 05-07 | 中 | P0 | 模型依赖和输出差异 | 只规划 |
| whisper-timestamped | word confidence / segment confidence | 识别低置信度片段 | quality gate | Round 07, 18 | 中 | P0 | 中文置信度阈值需实测 | 只规划 |
| whisper-timestamped | VAD 参数 | 减少长音频静音干扰 | ASR backend params | Round 07-08 | 中 | P0 | 参数过严可能漏正文 | 只规划 |
| tts-dataset-pipeline | audio/text -> align -> filter -> export | 建立 TTS 数据集流水线 | pipeline architecture | Round 00, 18-24 | 中 | P0 | 许可证风险 | 只规划 |
| tts-dataset-pipeline | Retained / Rejected 状态机 | 追踪数据筛选结果 | quality/review/export 状态 | Round 19 | 中 | P0 | 状态过多会增加维护成本 | 只规划 |
| tts-dataset-pipeline | wav+txt 与 metadata.csv | 输出可训练数据集 | export core | Round 22-24 | 中 | P0 | 格式需和中文文本策略一致 | 只规划 |
| tts-dataset-pipeline | skip-if-exists | 支持幂等重跑 | cache/job runner | Round 08, 31-32 | 中 | P0 | cache key 设计错误会污染结果 | 只规划 |
| easyaligner | 双轨文本规范化 | 同时满足对齐和 TTS 可读性 | text core | Round 11 | 中 | P0 | 规范化不可逆会丢文本 | 只规划 |
| easyaligner | SpanMap | 从规范化文本映射回原文 | alignment/text model | Round 12 | 高 | P0 | 中文字符范围复杂 | 只规划 |
| easyaligner | 分层 JSON 缓存 | 支持局部重跑和调试 | cache architecture | Round 08, 31 | 中 | P0 | 缓存版本失配 | 只规划 |

## P1 能力

| 来源仓库 | 可迁移能力 | 解决的问题 | 迁移到本项目 | 对应 Round | 复杂度 | 优先级 | 风险 | 本轮状态 |
|---|---|---|---|---|---|---|---|---|
| whisperX | 长音频 VAD | 处理长篇有声书前置切分 | audio/asr core | Round 33 | 高 | P1 | GPU、模型和依赖复杂 | 只规划 |
| whisperX | forced alignment fallback | 低置信度片段二次精对齐 | alignment core | Round 33 | 高 | P1 | 中文 wav2vec2 模型选择需验证 | 只规划 |
| whisperX | alignment score | 决定 fallback 结果是否可信 | quality gate | Round 33 | 高 | P1 | 阈值需数据校准 | 只规划 |
| whisper | 基础 transcribe 接口 | 统一后端接口语义 | AsrBackend | Round 05 | 中 | P1 | 不足以独立承担精切 | 只规划 |
| whisper | avg_logprob | 判断 ASR 片段质量 | quality gate | Round 18 | 低 | P1 | 指标和中文文本长度相关 | 只规划 |
| whisper | compression_ratio | 检测异常重复或幻觉 | quality gate | Round 18 | 低 | P1 | 阈值需调参 | 只规划 |
| whisper | no_speech_prob | 检测非语音和静音 | quality gate | Round 18 | 低 | P1 | 有声书背景声可能误判 | 只规划 |
| easyaligner | fuzzy matching | 处理原稿与录音不完全一致 | alignment core | Round 15 | 中 | P1 | 可能误匹配相似句 | 只规划 |

## P2 能力

| 来源仓库 | 可迁移能力 | 解决的问题 | 迁移到本项目 | 对应 Round | 复杂度 | 优先级 | 风险 | 本轮状态 |
|---|---|---|---|---|---|---|---|---|
| index-tts | training_profile.yaml | 为未来训练适配保留配置入口 | export profile | Round 25 | 中 | P2 | 未读取源码，格式需后续验证 | 只规划 |
| index-tts | speaker_id / prompt audio | 支持声音克隆训练上下文 | dataset manifest | Round 25 | 中 | P2 | 训练侧要求可能变化 | 只规划 |
| amphion | LJSpeech-like 格式 | 兼容常见 TTS 训练框架 | export profile | Round 24, 26 | 中 | P2 | 未读取源码，格式需后续验证 | 只规划 |
| amphion | train/val split | 生成训练集划分 | dataset versioning | Round 26, 36 | 中 | P2 | source leakage 需避免 | 只规划 |
| tts-dataset-pipeline | prob_diff | 高级质量复核 | quality core | Round 34 | 高 | P2 | 中文阈值和模型需实测 | 只规划 |

## 不迁移或暂缓能力

| 来源仓库 | 能力 | 暂缓原因 | 处理方式 |
|---|---|---|---|
| whisperX | diarization 默认路径 | 单人中文旁白 MVP 不必需，依赖复杂 | 未来作为可选能力，不进入 MVP |
| tts-dataset-pipeline | uroman 罗马化路径 | 中文 TTS 最终文本必须保留中文 | 仅借鉴可逆规范化思想 |
| tts-dataset-pipeline | 圣经 JSON 特定结构 | 与中文有声书章节结构不同 | 重新设计 `chapter_manifest` |
| index-tts | 真实训练接入 | 当前无本地源码验证 | 只设计导出约束 |
| amphion | 真实训练接入 | 当前无本地源码验证 | 只设计 LJSpeech-like 和 profile |

## 模块映射摘要

- `packages/asr_core/`：Round 05-08、33。
- `packages/text_core/`：Round 09-12。
- `packages/alignment_core/`：Round 13-15、33。
- `packages/audio_core/`：Round 03-04、20-22、35。
- `packages/quality_core/`：Round 18-19、34、37。
- `packages/export_core/`：Round 22-26、36、39。
- `packages/review_core/`：Round 27-30。
- `packages/cache_core/`：Round 08、31-32。

这些目录当前只作为路线图规划，不在 Round 00 大规模创建实现。
