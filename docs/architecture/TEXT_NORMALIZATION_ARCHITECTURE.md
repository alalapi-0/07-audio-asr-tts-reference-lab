# Text Normalization Architecture

中文有声书项目必须保留中文文本和中文标点策略。文本规范化的目标不是把文本变成英文式 token 流，而是在不丢失原文含义的前提下，为对齐、切分、审核和 TTS 训练提供不同视图。

## 三类文本

### raw_text

原始文本，不覆盖、不破坏。

来源：

- 正确原文。
- ASR 输出。
- 人工修正文本。

用途：

- 审计。
- 回溯。
- span map 原点。

### norm_align_text

对齐轨文本。

用途：

- source 与 ASR 对齐。
- fuzzy matching。
- forced alignment fallback。
- 标点和空白弱化。

允许操作：

- 统一空白。
- 统一全角 / 半角。
- 统一部分标点。
- 可配置地移除对齐无关符号。
- 章节标题标记化。

要求：

- 必须记录 `rules_applied`。
- 必须维护 span map。
- 不得不可逆地丢失正文。

### norm_tts_text

TTS 训练轨文本。

用途：

- wav+txt 导出。
- metadata.csv。
- JSONL。
- training manifest。

要求：

- 保留中文可读文本。
- 保留必要中文标点。
- 保留语义和朗读节奏。
- 人工修正优先于 ASR raw text。

不做：

- 不罗马化最终 TTS 文本。
- 不粗暴删除“嗯、啊、就是、然后”等可能属于正文或人物语言风格的内容。

## SpanMap

SpanMap 用于记录规范化文本和原始文本之间的字符范围映射。

建议字段：

- `source_text_id`
- `track`
- `original_start`
- `original_end`
- `normalized_start`
- `normalized_end`
- `operation`
- `original_text`
- `normalized_text`
- `rule_id`

常见 operation：

- `keep`
- `replace`
- `delete_for_align`
- `insert_marker`
- `merge_space`
- `normalize_punctuation`
- `normalize_number`

## 中文标点策略

TTS 轨保留：

- `，`
- `。`
- `？`
- `！`
- `：`
- `；`
- 引号和书名号在不影响训练格式时保留。

对齐轨可以弱化：

- 连续标点。
- 多余空白。
- 部分装饰符。

任何弱化都必须通过 span map 可追踪。

## 中文数字策略

MVP 不做激进数字改写。

建议：

- `raw_text` 保持原样。
- `norm_align_text` 可统一全角数字和半角数字。
- `norm_tts_text` 优先保留原文，除非人工审核明确修正。

未来可增加规则：

- 年份。
- 章节号。
- 金额。
- 序号。
- 时间。

## 章节标题处理

章节标题不直接当成正文删除。

建议标记：

- `chapter_title`
- `section_title`
- `narration_text`

切分和导出时再决定是否进入 TTS dataset。

## 语气词和废话候选

中文有声书里“嗯、啊、就是、然后”可能是：

- 旁白口误。
- 主播习惯性废话。
- 人物台词。
- 原文真实内容。

因此策略是标记而非删除。

候选字段：

- `filler_candidate`
- `reason`
- `source_match`
- `asr_only`
- `confidence`
- `review_required`

## 规则记录

每次规范化输出都应附带：

- `normalizer_version`
- `rules_applied`
- `span_map_path`
- `input_checksum`
- `created_at`

## 验收标准

未来实现时至少应验证：

- raw text 不被覆盖。
- TTS 轨仍为中文可读文本。
- 对齐轨变化可通过 span map 回溯。
- 标点策略不会导致文本为空。
- 语气词只标记，不自动删除正文。
