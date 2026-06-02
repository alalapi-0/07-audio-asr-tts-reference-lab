# Roadmap 40 Rounds

本路线图将中文有声书清洗与 TTS 数据集项目拆成 Round 00-39。每轮都应小步推进、可验收、可回滚，并遵守 `AGENTS.md` 与 `docs/governance/repo_protocol_standard.yaml`。

## Round 00：当前仓库审计与参考吸收治理

- 目标：审计当前仓库，吸收参考仓库报告，更新项目定位，生成 40 轮路线图，更新协议和文档，不做功能开发。
- 前置条件：已有参考仓库分析报告；允许新增根级治理文档。
- 具体任务：审计根目录和参考子项目；创建审计报告；创建参考吸收总结；创建迁移矩阵；创建架构文档；创建路线图；创建检查脚本。
- 输出文件：`README.md`、`AGENTS.md`、`PROJECT_STATE.md`、`.gitignore`、`docs/governance/*`、`docs/reference_absorption/*`、`docs/architecture/*`、`docs/ROADMAP_40_ROUNDS.md`、`scripts/check_repo.py`。
- 验收标准：`python scripts/check_repo.py` 通过；未修改参考子项目源码；未处理真实音频；路线图包含 Round 00-39。
- 不做什么：不下载模型；不跑 ASR；不调用 API；不训练 TTS；不实现 UI；不复制外部代码。
- 风险：根目录不是 Git 仓库；参考许可证复杂；治理文档可能与未来实现偏离。
- 依赖下一轮什么：Round 01 需要基于路线图定义 manifest schema。

## Round 01：项目 Manifest 与素材登记

- 目标：设计并实现 `audio_project`、`source_audio`、`chapter_manifest`，支持登记音频路径和原文路径，不复制真实大文件进仓库。
- 前置条件：Round 00 文档和数据安全规则完成。
- 具体任务：定义 `project_manifest.json`；定义 `source_audio.json`；定义 chapter manifest；计算 checksum；记录 duration、sample_rate、channels；支持 dry-run。
- 输出文件：manifest schema 文档；mock manifest fixture；登记脚本或 CLI 草案。
- 验收标准：可用 mock 路径生成 manifest；真实音频不进入仓库；`check_repo` 通过。
- 不做什么：不复制真实音频；不运行 ASR；不导出 dataset。
- 风险：路径引用和 checksum 策略不稳定会影响后续缓存。
- 依赖下一轮什么：Round 02 需要根据 manifest 确定本地数据目录边界。

## Round 02：本地数据目录与 Git 安全边界

- 目标：初始化 `data/`、`cache/`、`datasets/`、`exports/` 的本地使用规则，保证真实素材不进 Git。
- 前置条件：Round 01 manifest 路径字段确定。
- 具体任务：设计 `init_data_dirs`；检查音频后缀；检查 `.env`；检查 cache；写明数据安全规则；扩展 `.gitignore` 检查。
- 输出文件：数据目录说明；初始化脚本；更新 `scripts/check_repo.py`。
- 验收标准：本地目录可创建但默认被忽略；音频后缀被忽略；敏感文件规则覆盖。
- 不做什么：不把真实素材复制进仓库；不提交生成目录内容。
- 风险：忽略规则过宽可能误忽略示例 schema。
- 依赖下一轮什么：Round 03 使用安全目录放置可重建工作音频。

## Round 03：音频导入与工作副本转码设计

- 目标：建立原始音频只读、工作音频可重建的机制，规划 mono 16k 工作副本，并保留 22050 / 24000 TTS 导出采样率。
- 前置条件：Round 01-02 manifest 和数据边界完成。
- 具体任务：设计 audio importer；设计 convert plan；记录 FFmpeg 命令模板；定义转码日志 schema。
- 输出文件：audio import 设计；convert plan schema；FFmpeg dry-run 模板。
- 验收标准：可用 mock manifest 生成转码计划；不实际批量转码真实音频。
- 不做什么：不覆盖原音频；不做降噪增强；不导出训练 wav。
- 风险：工作采样率和导出采样率混淆。
- 依赖下一轮什么：Round 04 读取工作副本或 mock 音频元数据。

## Round 04：音频元数据与质量预检查

- 目标：读取 duration、sample_rate、channels、bitrate，检查 clipping、静音、文件完整性，输出 `audio_precheck_report`。
- 前置条件：Round 03 转码计划或 mock 音频引用可用。
- 具体任务：设计 ffprobe adapter；生成 mock report；定义 schema；记录 quality warning。
- 输出文件：`audio_precheck_report.json` schema；precheck 脚本；fixture。
- 验收标准：mock 文件可生成预检查报告；异常以 warning 记录。
- 不做什么：不修复音频；不做真实批量扫描。
- 风险：ffprobe 不可用时需要 mock 路径。
- 依赖下一轮什么：Round 05 ASR adapter 需要 audio metadata 输入。

## Round 05：ASR Adapter 抽象层

- 目标：定义 `AsrBackend`、统一 `TranscriptResult`，不绑定具体 ASR。
- 前置条件：Round 04 audio metadata schema 完成。
- 具体任务：定义接口；定义 `TranscriptSegment`；定义 `WordTimestamp`；建立 backend capability matrix；规划 mock backend。
- 输出文件：ASR schema；adapter 接口草案；能力矩阵文档。
- 验收标准：后续 backend 可按统一 schema 接入；质量指标字段预留。
- 不做什么：不下载模型；不接真实 whisper 后端。
- 风险：schema 太窄会限制后续 forced alignment。
- 依赖下一轮什么：Round 06 需要用 Mock ASR 验证 transcript 闭环。

## Round 06：Mock ASR 与 transcript 导入闭环

- 目标：支持手动导入 `transcript.json` 和 mock transcript，让后续流程不用等真实 ASR。
- 前置条件：Round 05 transcript schema 完成。
- 具体任务：实现 transcript schema 校验；创建 mock transcript fixture；提供 CLI 或脚本验证。
- 输出文件：mock transcript；校验脚本；fixture。
- 验收标准：mock transcript 能通过 schema 校验并进入后续 normalization。
- 不做什么：不接真实模型；不评价 ASR 精度。
- 风险：fixture 过简单无法覆盖中文口误和重读。
- 依赖下一轮什么：Round 07 可基于同一 schema 规划真实 backend。

## Round 07：whisper-timestamped MVP 后端规划与接入

- 目标：接入或规划 `WhisperTimestampedBackend`，支持中文、VAD、word confidence。
- 前置条件：Round 05-06 adapter 和 mock 闭环完成。
- 具体任务：定义 `language=zh`；规划 `vad=True`；保留 word timestamps；保留 confidence；缓存 raw output；不强制下载模型。
- 输出文件：backend 配置文档；adapter skeleton；参数 schema。
- 验收标准：配置和输出映射清楚；未下载大型模型也能通过 mock 测试。
- 不做什么：不全量转写真实音频；不把后端输出直接当最终文本。
- 风险：中文词边界和 confidence 阈值需后续校准。
- 依赖下一轮什么：Round 08 建立 ASR 缓存和可复现机制。

## Round 08：ASR 结果缓存与可复现机制

- 目标：建立 `cache/asr/{source_id}.json` 思路，区分 raw output 和 normalized output，支持 skip-if-exists。
- 前置条件：Round 07 backend 参数和 transcript schema 确定。
- 具体任务：设计 cache key；记录 checksum；记录 backend version；记录 params hash；设计 `redo_asr`。
- 输出文件：ASR cache schema；cache metadata；redo 规则。
- 验收标准：相同输入可跳过；参数变化会失效缓存。
- 不做什么：不删除旧缓存；不整本书强制重跑。
- 风险：cache key 不完整会复用错误结果。
- 依赖下一轮什么：Round 09 source text normalizer 需要与 transcript cache 对齐。

## Round 09：原文文本导入与 source normalizer

- 目标：导入正确原文，清洗章节标题、空白、标点，生成 normalized source text。
- 前置条件：Round 01 manifest 包含原文路径；Round 08 cache 设计可用。
- 具体任务：定义 source text schema；实现或规划 source normalizer；制定中文标点策略；保留章节结构。
- 输出文件：source text schema；normalization report；fixture。
- 验收标准：原文 raw 不被覆盖；章节和正文可区分。
- 不做什么：不自动删除章节标题；不罗马化中文文本。
- 风险：过度清洗导致原文范围不可追踪。
- 依赖下一轮什么：Round 10 对 ASR 文本做对应清洗。

## Round 10：ASR 文本清洗与 filler 候选标记

- 目标：清洗 ASR 文本，标记而非删除废话候选，生成 normalized ASR text。
- 前置条件：Round 06-08 transcript 可用；Round 09 文本规则初步确定。
- 具体任务：设计 ASR normalizer；设计 filler detector；禁止 destructive deletion；保留 raw_text。
- 输出文件：ASR normalization schema；filler candidate schema；fixture。
- 验收标准：疑似废话只标记不删除；raw ASR 可回溯。
- 不做什么：不自动剪掉“嗯、啊、就是、然后”。
- 风险：将人物台词误判为废话。
- 依赖下一轮什么：Round 11 合并为中文文本双轨规范化。

## Round 11：中文文本双轨规范化

- 目标：区分 `norm_align_text` 和 `norm_tts_text`，两者不能混淆。
- 前置条件：Round 09-10 source / ASR normalizer 初版完成。
- 具体任务：保留标点策略；对齐轨弱化部分符号；TTS 轨保留中文可读文本；记录 `rules_applied`。
- 输出文件：双轨 normalizer；rules registry；样例输出。
- 验收标准：TTS 轨仍为中文可读文本；对齐轨可用于匹配。
- 不做什么：不把最终 TTS 文本罗马化；不丢失 raw text。
- 风险：双轨不同步导致审核显示混乱。
- 依赖下一轮什么：Round 12 引入 SpanMap 保证可逆追踪。

## Round 12：SpanMap 可逆规范化设计

- 目标：借鉴 easyaligner 的 SpanMap 思路，规范化后仍能映射回原文字符范围。
- 前置条件：Round 11 双轨规则确定。
- 具体任务：定义 span_map schema；定义 normalize operations；设计 `restore_for_tts`；加入中文特化规则。
- 输出文件：span map schema；operation enum；测试 fixture。
- 验收标准：规范化字符可映射回 raw text；删除/替换可追踪。
- 不做什么：不做不可逆批量替换。
- 风险：中文标点和全角字符映射复杂。
- 依赖下一轮什么：Round 13 使用 timestamp 和文本轨生成初级 segment。

## Round 13：ASR-only 初级切分策略

- 目标：根据 ASR segment 和 word timestamp 初步切分，目标 2-15 秒，优先 3-12 秒。
- 前置条件：Round 06-08 transcript 可用；Round 11-12 文本轨可用。
- 具体任务：按标点合并；按时长拆分；过短合并；过长拆分；输出 `audio_segment_candidate`。
- 输出文件：segment candidate schema；切分脚本；fixture。
- 验收标准：候选段有 start/end/text/duration；异常时长被标记。
- 不做什么：不直接导出 wav；不自动删除内容。
- 风险：ASR 边界漂移影响切点。
- 依赖下一轮什么：Round 14 用原文辅助判断候选段内容。

## Round 14：原文辅助对齐策略

- 目标：将原文与 ASR 文本对齐，判断 matched、extra_candidate、missing、repeated、uncertain。
- 前置条件：Round 12 span map；Round 13 segment candidate。
- 具体任务：定义 alignment schema；计算 similarity；记录 source_range；记录 asr_range；生成 diff report。
- 输出文件：alignment JSON；diff report；对齐 fixture。
- 验收标准：每段有 alignment_status 和 reason；uncertain 进入 review。
- 不做什么：不自动删 extra_candidate；不覆盖人工文本。
- 风险：原文版本与录音不一致造成误判。
- 依赖下一轮什么：Round 15 处理非完全一致文本。

## Round 15：fuzzy matching 与非完全一致文本处理

- 目标：支持原稿与录音存在少量差异，对不完全匹配片段做 fuzzy 定位。
- 前置条件：Round 14 alignment schema 完成。
- 具体任务：评估 rapidfuzz 或替代设计；定义 fuzzy score；定义 uncertain threshold；避免误删正文。
- 输出文件：fuzzy matching 设计；阈值配置；回归样例。
- 验收标准：相似但不完全一致文本可定位；低分进入 uncertain。
- 不做什么：不把 fuzzy match 作为删除依据。
- 风险：相似句重复导致错误定位。
- 依赖下一轮什么：Round 16 将对齐结果输入 LLM cut decision。

## Round 16：LLM Cut Decision Protocol

- 目标：让大模型基于文本和对齐结果判断 keep/delete/uncertain，大模型不直接切音频。
- 前置条件：Round 14-15 alignment 和 diff report 可用。
- 具体任务：设计 prompt 模板；定义 JSON schema；定义 action 枚举；定义 reason_type、confidence、suggested_cut；低 confidence 必须人工审核。
- 输出文件：prompt 模板；decision schema；mock cases。
- 验收标准：LLM 输出可 schema validate；不能直接写 cut plan。
- 不做什么：不调用真实 LLM API；不自动删除音频。
- 风险：模型幻觉理由或误判正文。
- 依赖下一轮什么：Round 17 用 Mock LLM 离线测试协议。

## Round 17：Mock LLM Decision 与离线测试

- 目标：在不接真实 API 情况下测试机切建议流程，构造口误、重读、废话样例。
- 前置条件：Round 16 decision schema 完成。
- 具体任务：实现 mock LLM；创建 fixtures；做 schema validation；建立 regression cases。
- 输出文件：mock decision fixtures；离线测试脚本；回归样例。
- 验收标准：口误、重读、废话、uncertain 样例都能通过流程。
- 不做什么：不接真实 API；不让 mock 结果代表真实模型质量。
- 风险：mock 过于理想化。
- 依赖下一轮什么：Round 18 将 ASR、对齐、LLM 指标汇入质量门。

## Round 18：质量门基础版

- 目标：自动判断 `auto_approved`、`auto_rejected`、`manual_review`。
- 前置条件：Round 13-17 segment、alignment、decision 输出可用。
- 具体任务：实现 duration gate；word confidence gate；avg_logprob；compression_ratio；no_speech_prob；生成 quality_report。
- 输出文件：quality gate rules；`quality_report.json`；测试 fixture。
- 验收标准：每个 segment 有状态和 reason；低置信度进入 review。
- 不做什么：不激进自动拒绝正文；不使用 prob_diff 高级模型。
- 风险：阈值未经真实中文数据校准。
- 依赖下一轮什么：Round 19 将质量状态接入 Retained / Rejected 状态机。

## Round 19：Retained / Rejected / Review 状态机

- 目标：借鉴 tts-dataset-pipeline 的状态机，形成可追溯数据集筛选流程。
- 前置条件：Round 18 quality gate 完成。
- 具体任务：定义 status enum；定义 state transition；支持 review_needed、approved、rejected；定义 export eligibility。
- 输出文件：state machine schema；transition tests；状态说明。
- 验收标准：非法状态转换被拒绝；可导出状态明确。
- 不做什么：不删除 rejected 原始证据。
- 风险：状态过细导致用户操作复杂。
- 依赖下一轮什么：Round 20 用状态生成 non-destructive cut plan。

## Round 20：Cut Plan 非破坏式编辑

- 目标：设计并实现 cut_plan，原音频只读，删除区间、保留区间、padding 可配置。
- 前置条件：Round 19 状态机和 approved/review 状态可用。
- 具体任务：定义 delete_ranges；定义 keep_ranges；配置 pre_padding / post_padding；记录 cut reason；要求 user confirmed。
- 输出文件：cut_plan schema；range validation；fixture。
- 验收标准：cut plan 不修改原音频；区间合法且可解释。
- 不做什么：不直接切真实音频；不覆盖人工审核结果。
- 风险：padding 可能引入噪声或截断。
- 依赖下一轮什么：Round 21 生成 FFmpeg dry-run 命令计划。

## Round 21：FFmpeg dry-run 导出

- 目标：先不真正批量导出，生成 FFmpeg 命令计划，检查 cut plan 合法性。
- 前置条件：Round 20 cut plan 可用。
- 具体任务：实现 dry run；生成 command preview；校验 range；检查 overlap。
- 输出文件：ffmpeg command plan；validation report；dry-run CLI。
- 验收标准：命令可预览；非法 range 被阻止；不产生 wav。
- 不做什么：不批量导出真实音频。
- 风险：命令模板跨平台差异。
- 依赖下一轮什么：Round 22 使用已验证 plan 正式导出 wav+txt。

## Round 22：FFmpeg 正式切分与 wav+txt 导出

- 目标：根据 approved segment 导出 wav+txt，输出 `datasets/wavs` 和 txt 对。
- 前置条件：Round 21 dry-run 验证通过；数据目录被忽略。
- 具体任务：实现 segment cutter；导出 wav；导出 txt；做 no clipping check；生成 export report。
- 输出文件：wav+txt pairs；export report；导出脚本。
- 验收标准：每个 wav 有 txt；只导出 approved segment；输出在 ignored 目录。
- 不做什么：不训练模型；不导出未审核片段。
- 风险：切点偏移和采样率转换误差。
- 依赖下一轮什么：Round 23 生成 manifest 和 metadata。

## Round 23：metadata.csv 与 dataset_manifest

- 目标：生成 TTS 训练需要的 manifest。
- 前置条件：Round 22 wav+txt 导出完成。
- 具体任务：生成 `metadata.csv`；生成 JSONL；记录 item_id、speaker_id、source_id、duration、text、relative wav path。
- 输出文件：`metadata.csv`、`manifest.jsonl`、`dataset_manifest.json`。
- 验收标准：manifest item 数与 wav/txt 一致；路径相对；字段完整。
- 不做什么：不绑定单一训练框架。
- 风险：文本转义和分隔符影响兼容性。
- 依赖下一轮什么：Round 24 封装 LJSpeech-like 导出。

## Round 24：LJSpeech-like 导出

- 目标：兼容 Amphion 等常见 TTS 框架的基础格式。
- 前置条件：Round 23 manifest 可用。
- 具体任务：组织 `wavs/`；生成 `metadata.csv`；生成 dataset_manifest；定义 format profile；配置 sample_rate。
- 输出文件：LJSpeech-like dataset；format profile；profile tests。
- 验收标准：目录和 metadata 符合 profile；sample_rate 可配置。
- 不做什么：不保证 Amphion 未验证训练配置可直接运行。
- 风险：不同框架 LJSpeech 变体存在差异。
- 依赖下一轮什么：Round 25 设计 IndexTTS 专用 profile。

## Round 25：IndexTTS 导出 Profile

- 目标：不接入训练，只设计 IndexTTS 导出适配。
- 前置条件：Round 23-24 基础导出完成。
- 具体任务：设计 `training_profile.yaml`；记录 prompt audio；记录 short utterance；记录 speaker；记录 text clean policy。
- 输出文件：IndexTTS profile；示例 training profile；格式说明。
- 验收标准：明确当前未读取 index-tts 源码；profile 不声称已验证训练。
- 不做什么：不训练 IndexTTS；不生成未经验证的训练命令。
- 风险：真实框架格式需求与反向约束不同。
- 依赖下一轮什么：Round 26 设计 Amphion profile。

## Round 26：Amphion 导出 Profile

- 目标：不接入训练，只设计 Amphion 导出适配。
- 前置条件：Round 24 LJSpeech-like profile 完成。
- 具体任务：记录 LJSpeech profile；生成 train/val split；记录 sample rate；写 config notes。
- 输出文件：Amphion profile；split manifest；config notes。
- 验收标准：明确当前未读取 amphion 源码；格式作为未来适配约束。
- 不做什么：不训练 Amphion；不下载框架。
- 风险：公开格式和本地训练脚本存在差异。
- 依赖下一轮什么：Round 27 开始人工审核 UI MVP。

## Round 27：人工审核 UI MVP

- 目标：建立最小 review 页面，先能看文本、segment、状态、播放音频。
- 前置条件：Round 19 状态机和 Round 22 wav segment 可用。
- 具体任务：实现 project list；segment list；audio player；ASR text；source text；approve/reject。
- 输出文件：review UI MVP；review API 或本地状态存储；基础页面测试。
- 验收标准：用户可审核 segment 并保存 approve/reject。
- 不做什么：不做复杂波形编辑；不做多人权限。
- 风险：UI 过早复杂化拖慢数据闭环。
- 依赖下一轮什么：Round 28 增加波形时间轴编辑器。

## Round 28：波形时间轴编辑器

- 目标：接入波形显示，支持拖动切点。
- 前置条件：Round 27 review UI MVP 可用。
- 具体任务：评估 wavesurfer.js 或替代；实现 start/end handle；preview before/after；保存 range。
- 输出文件：waveform editor；range update API；交互测试。
- 验收标准：切点可拖动并保存；切点前后可试听。
- 不做什么：不自动覆盖原始 cut plan；不做复杂多轨编辑。
- 风险：波形库和音频文件路径兼容问题。
- 依赖下一轮什么：Round 29 增加文本修正和 review record。

## Round 29：人工文本修正与 Review Record

- 目标：用户可以修改文本，保存 `review_record`，不覆盖 raw ASR。
- 前置条件：Round 27-28 review UI 和切点编辑可用。
- 具体任务：支持 `edited_text`；记录 decision；记录 reviewer；记录 reviewed_at；记录 reason。
- 输出文件：review_record schema；文本编辑 UI；审核记录存储。
- 验收标准：导出优先使用人工修正文；raw ASR 保持不变。
- 不做什么：不让文本编辑直接改原文文件。
- 风险：人工修正和 source range 失配。
- 依赖下一轮什么：Round 30 比较模型建议与人工结果。

## Round 30：Feedback Loop

- 目标：比较模型建议与人工最终结果，生成规则优化建议。
- 前置条件：Round 16-17 模型建议；Round 29 review_record。
- 具体任务：生成 feedback_record；计算 start_shift；end_shift；action mismatch；提取 lesson；生成 prompt improvement report。
- 输出文件：feedback_record；feedback report；prompt improvement notes。
- 验收标准：能统计模型建议和人工决定差异。
- 不做什么：不自动修改 prompt 或质量阈值。
- 风险：反馈样本少时结论不稳定。
- 依赖下一轮什么：Round 31 用反馈和缓存支持局部重跑。

## Round 31：Partial Redo 与分阶段缓存

- 目标：不整本书重跑，支持单 source、单 segment 重跑。
- 前置条件：Round 08 cache 设计；Round 30 feedback 可定位问题。
- 具体任务：实现 `redo_asr`；`redo_align`；`redo_segment`；cache invalidation；dependency graph。
- 输出文件：partial redo CLI；dependency graph；cache invalidation report。
- 验收标准：单段重跑不触发整本书处理；人工审核结果不被覆盖。
- 不做什么：不删除旧缓存证据。
- 风险：依赖图错误导致过期结果复用。
- 依赖下一轮什么：Round 32 支持批处理 job runner。

## Round 32：批处理 Job Runner

- 目标：支持整本书多章节处理，stage-by-stage 批量执行。
- 前置条件：Round 31 partial redo 和 stage marker 可用。
- 具体任务：实现 `run_stage`；job status；failure retry；skip-if-exists；progress report。
- 输出文件：job runner；status report；retry logs。
- 验收标准：批处理可跳过已完成阶段；失败可重试。
- 不做什么：不强制全量重跑；不吞掉失败错误。
- 风险：长任务中断和状态不一致。
- 依赖下一轮什么：Round 33 对低置信度段跑 fallback。

## Round 33：whisperX / forced alignment fallback

- 目标：对低置信度片段做二次对齐，支持中文 wav2vec2 fallback。
- 前置条件：Round 18 quality gate 能标记低置信度；Round 31 partial redo 可用。
- 具体任务：设计 `WhisperXBackend`；定义 forced alignment schema；记录 alignment score；合并 result；不默认处理所有 segment。
- 输出文件：fallback adapter；forced alignment report；merge logic。
- 验收标准：只对目标 segment fallback；结果 provenance 可追踪。
- 不做什么：不启用 diarization 默认路径；不全量跑 whisperX。
- 风险：模型依赖、GPU、中文模型选择复杂。
- 依赖下一轮什么：Round 34 高级质量复核可使用 fallback 结果。

## Round 34：MMS / prob_diff 质量复核

- 目标：借鉴 tts-dataset-pipeline 的 prob_diff 思路，作为高级质量门。
- 前置条件：Round 18 基础质量门；Round 33 fallback 可用。
- 具体任务：定义 prob_diff schema；配置 threshold；接入 retained/rejected；生成 report；中文阈值可配置。
- 输出文件：prob_diff report；高级质量门配置；评估样例。
- 验收标准：prob_diff 只作为高级复核，不破坏 MVP 输出。
- 不做什么：不复制 tts-dataset-pipeline 代码；不使用许可证不明模型。
- 风险：阈值和模型许可证不确定。
- 依赖下一轮什么：Round 35 可选音频增强使用质量报告决定处理对象。

## Round 35：可选音频增强

- 目标：Phase 2 增强，不作为 MVP 必需。
- 前置条件：Round 04 audio precheck；Round 34 高级质量报告可用。
- 具体任务：评估 LUFS；denoise；trim silence；peak normalize；clipping warning；不破坏原文件。
- 输出文件：enhancement plan；enhancement report；可重建工作副本。
- 验收标准：增强只作用于工作副本；原始音频不变。
- 不做什么：不强制降噪；不修复所有问题音频。
- 风险：过度增强损害音色和训练质量。
- 依赖下一轮什么：Round 36 生成训练集版本。

## Round 36：训练集划分与版本管理

- 目标：生成 train/val/test split 和 dataset version。
- 前置条件：Round 23-26 导出 manifest；Round 35 可选增强完成或跳过。
- 具体任务：生成 split manifest；避免 source leakage；定义 dataset v1；记录 checksum；写 release notes。
- 输出文件：train/val/test split；dataset version manifest；release notes。
- 验收标准：split 可复现；同源连续片段不泄漏。
- 不做什么：不训练模型；不上传数据。
- 风险：切分策略不当导致评估污染。
- 依赖下一轮什么：Round 37 dashboard 展示数据集质量。

## Round 37：质量报告 Dashboard

- 目标：可视化数据集质量。
- 前置条件：Round 18、23、36 报告和 manifest 可用。
- 具体任务：展示 duration distribution；confidence distribution；reject reasons；approved count；source coverage。
- 输出文件：dashboard 页面或静态报告；质量摘要。
- 验收标准：用户能看到数据集规模、风险和拒绝原因。
- 不做什么：不替代人工审核；不做云监控。
- 风险：可视化指标被误解为训练效果。
- 依赖下一轮什么：Round 38 整理本地一键启动和开发体验。

## Round 38：本地一键启动与开发体验

- 目标：统一本地运行方式，给后续 Agent 和用户清晰入口。
- 前置条件：核心 CLI、UI、检查脚本和导出链路已有 MVP。
- 具体任务：整理 `run_api`；`run_web`；`run_check`；env template；README usage。
- 输出文件：开发命令；env example；README usage；Makefile 或脚本入口。
- 验收标准：新 Agent 可按文档启动检查、API、web。
- 不做什么：不做云部署；不隐藏必要配置。
- 风险：启动脚本和实际模块漂移。
- 依赖下一轮什么：Round 39 做 v1 数据集闭环验收。

## Round 39：v1 数据集生成闭环验收

- 目标：从 mock 或小样本素材跑通完整闭环，形成 v1 dataset release checklist。
- 前置条件：Round 01-38 核心链路可用。
- 具体任务：执行 import；asr；normalize；align；cut decision；review；export；manifest；quality report；final checklist。
- 输出文件：v1 checklist；验收报告；dataset release notes；风险清单。
- 验收标准：可从 mock 或小样本生成完整 dataset manifest；检查脚本通过；风险清楚。
- 不做什么：不宣称大规模生产可用；不发布未审核真实素材。
- 风险：小样本闭环不能代表全书规模性能。
- 依赖下一轮什么：进入 v1 后续迭代或按风险回补缺口。

## 使用规则

- 每轮开始前阅读对应 Round。
- 每轮只做该 Round 的最小必要范围。
- 每轮结束更新 `PROJECT_STATE.md` 和 `docs/governance/update_log.md`。
- 数据和音频产物必须保持在 `.gitignore` 覆盖目录中。
- 外部参考代码不得直接复制进本项目。
