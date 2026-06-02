# MCP 使用技能（Agent Skill）

本文档说明本仓库 `.cursor/mcp.json` 中声明的 MCP 工具、用途、安全边界与降级策略。自动推进轮开始前应阅读本文档，并运行 `npm run check:mcp` 或 `python scripts/check_mcp_config.py` 做轻量校验。

## 当前启用的 MCP

| Server 名称 | 包 / 命令 | 状态 | 用途 |
|-------------|-----------|------|------|
| `chrome-devtools` | `npx -y chrome-devtools-mcp@latest` | 已配置 | 浏览器调试、console、network、页面状态检查 |
| `context7` | `npx -y @upstash/context7-mcp@latest` | 已配置 | 第三方库与框架文档查询 |
| `playwright` | `npx -y @playwright/mcp@latest` | 已配置 | 浏览器自动化：打开页面、snapshot、点击、截图、辅助 E2E 验收 |
| `filesystem` | `npx -y @modelcontextprotocol/server-filesystem` | 已配置 | 项目内文件读写与目录检查（仅 `${workspaceFolder}`） |
| `github` | `npx -y @modelcontextprotocol/server-github` | 已配置（需 token） | 读取仓库、commit、issue、PR 状态（需 `GITHUB_TOKEN`） |

### Cursor 内置 MCP（非本仓库 mcp.json）

Cursor 可能额外加载 IDE 内置能力（例如 `cursor-ide-browser`、`cursor-app-control`）。**不要**覆盖用户全局 `~/.cursor/mcp.json`；项目级配置以 `.cursor/mcp.json` 为准，与全局配置由 Cursor 合并加载。

## Playwright MCP

**用于：**

- 打开本地 dev server 或 Review UI 页面
- 获取页面 snapshot、点击导航、检查按钮与表单
- 配合 console / network 检查（通过浏览器工具或 Playwright trace）
- 未来 Review Workbench、切分审核界面的 E2E 验收

**不用于：**

- 读取 `.env` 或输出 API Key
- 自动 push、公开发布真实有声书素材
- 删除 `data/`、`cache/`、`datasets/` 中的真实音频或原文

**最低验证要求（UI 相关任务）：**

1. 页面能加载（非仅看代码）
2. 核心路由 / 按钮存在
3. 控制台无严重错误
4. 关键数据加载路径可走通（或 documented skip 原因）
5. 失败时截图或 trace 写入本地 `artifacts/`（不提交 Git）

## 文件系统 MCP 授权范围

- **唯一授权根目录：** `${workspaceFolder}`（即包含 `.cursor/mcp.json` 的本仓库根目录）
- **禁止：** 授权 `/`、`C:\`、`${userHome}` 整目录或仓库外路径
- **目的：** 让 Agent 通过 MCP 稳定确认文件是否存在、内容是否已写入，而不是仅凭记忆推断

若 filesystem MCP 未加载，使用 Cursor 内置 Read / Write / Grep 工具，并在轮次报告中记录原因。

## GitHub MCP 与 Token

- **环境变量：** 在 shell 或 Cursor 环境中设置 `GITHUB_TOKEN`（fine-grained 或 classic PAT，最小 scope：repo 读、issues/PR 读；push 仍优先 `git` / `gh` CLI）
- **配置映射：** `GITHUB_PERSONAL_ACCESS_TOKEN=${env:GITHUB_TOKEN}`（见 `.cursor/mcp.json`）
- **禁止：** 将 token 写入仓库、`.cursor/mcp.json`、文档或 commit message

**无 token 时降级：**

- 使用 `git log`、`git status`、`git diff` 本地检查
- 若已安装 `gh` 且已登录，使用 `gh pr list`、`gh issue list` 等
- 进入 mock / dry-run，**不要**因缺少 GitHub MCP 阻塞非 GitHub 依赖轮次

## Context7 文档 MCP

- **配置：** `npx -y @upstash/context7-mcp@latest`（见 `.cursor/mcp.json`）
- 部分环境可能需要 Context7 API Key；若 server 无法连接，降级为阅读仓库 `docs/` 与官方文档链接。
- **项目内文档：** 仍应优先阅读 `README.md`、`AGENTS.md`、`PROJECT_STATE.md` 与当前 Round 相关 `docs/architecture/*.md`

## 无 API Key / Token 时的降级矩阵

| 缺失项 | 降级方案 |
|--------|----------|
| chrome-devtools / Playwright 未加载 | 另一浏览器 MCP 或 Cursor 内置 browser；记录 WARNING |
| Context7 未加载 | 阅读仓库 `docs/`；Web 搜索（治理轮慎用） |
| filesystem MCP 未加载 | 内置 Read/Write/Grep；`git status` 确认文件变更 |
| `GITHUB_TOKEN` 未设置 | 本地 `git` / `gh` CLI；跳过远程 PR/issue 查询 |
| Node/npx 不可用 | 文档化阻塞项；不无限重试 npx |

## 自动推进轮如何使用 MCP

1. **轮次开始：** 运行 `npm run check:mcp` 或 `python scripts/check_mcp_config.py`
2. **确认加载：** Cursor → Settings → MCP，确认五个 server 状态；**修改 mcp.json 后需重启 Cursor 或 Reload Window**
3. **UI 任务：** 必须 Playwright / 浏览器 MCP；实现过程中边改边查页面
4. **文件任务：** 写入后通过 filesystem 或 Read 确认磁盘状态
5. **GitHub 任务：** commit 前 `git diff`；无 token 时用本地 git
6. **轮次结束：** 更新 `PROJECT_STATE.md` 与 `docs/governance/update_log.md`；MCP 失败写入 soft blockers，非唯一阻塞则不 hard stop

## 安全禁令（必须遵守）

1. **禁止** 提交 token、cookie、API Key、`.env` 内容
2. **禁止** filesystem MCP 授权系统根目录或用户主目录整树
3. **禁止** MCP 输出或日志打印密钥
4. **禁止** MCP 绕过 Git 审查（push 仍需 diff 检查与用户授权策略）
5. **禁止** MCP 自动处理或删除 `data/` 中真实有声书素材

## 相关文档

- `AGENTS.md` — MCP Tools 节
- `.cursor/rules/mcp-agent-tools.mdc` — Agent 行为规则
- `.cursor/rules/mcp-required.mdc` — 必需 MCP 列表
- `docs/governance/repo_protocol_standard.yaml` — 数据安全与 Round 规则

## Cursor 重启说明

新建或修改 `.cursor/mcp.json` 后，Cursor **通常需要** Reload Window 或重启 IDE 才能加载新 MCP server。验证路径：Settings → MCP → 查看各 server 连接状态与 Output 日志。
