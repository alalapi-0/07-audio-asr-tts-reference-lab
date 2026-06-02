#!/usr/bin/env node
/**
 * Lightweight checker for project MCP configuration (.cursor/mcp.json).
 * Does not print secret values.
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const MCP_PATH = path.join(REPO_ROOT, ".cursor", "mcp.json");

const REQUIRED_SERVERS = [
  "chrome-devtools",
  "context7",
  "filesystem",
  "github",
  "playwright",
];

const DANGEROUS_PATH_PATTERNS = [
  /^\/$/,
  /^\\?$/,
  /^[A-Za-z]:[/\\]?$/,
  /^\$\{userHome\}$/,
  /^\/Users\/[^/]+$/,
  /^\/home\/[^/]+$/,
  /^C:\\Users\\[^\\]+$/i,
  /^\/Volumes\/?$/,
  /^\/Volumes\/[^/]+$/,
];

const SECRET_VALUE_PATTERNS = [
  /ghp_[A-Za-z0-9_]+/,
  /github_pat_[A-Za-z0-9_]+/,
  /sk-[A-Za-z0-9]{20,}/,
  /^glpat-[A-Za-z0-9_-]+$/,
];

function collectStrings(obj) {
  if (typeof obj === "string") return [obj];
  if (Array.isArray(obj)) return obj.flatMap(collectStrings);
  if (obj && typeof obj === "object") {
    return Object.entries(obj).flatMap(([k, v]) => [k, ...collectStrings(v)]);
  }
  return [];
}

function isDangerousPath(value) {
  const normalized = String(value).trim();
  return DANGEROUS_PATH_PATTERNS.some((p) => p.test(normalized));
}

function looksLikeHardcodedSecret(value) {
  if (typeof value !== "string") return false;
  if (value.includes("${env:") || value.startsWith("${")) return false;
  return SECRET_VALUE_PATTERNS.some((p) => p.test(value));
}

function isEnvPlaceholder(value) {
  return (
    typeof value === "string" &&
    (value.includes("${env:") || value.startsWith("${"))
  );
}

function main() {
  const errors = [];
  const warnings = [];
  const summary = [];

  if (!fs.existsSync(MCP_PATH)) {
    errors.push("Missing MCP config: .cursor/mcp.json");
    printReport(errors, warnings, summary);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(MCP_PATH, "utf8"));
  } catch (err) {
    errors.push(`Invalid JSON in mcp.json: ${err.message}`);
    printReport(errors, warnings, summary);
    process.exit(1);
  }

  const servers = data.mcpServers;
  if (!servers || typeof servers !== "object" || Array.isArray(servers)) {
    errors.push("mcpServers must be an object");
    printReport(errors, warnings, summary);
    process.exit(1);
  }

  const names = Object.keys(servers).sort();
  summary.push(`servers (${names.length}): ${names.join(", ") || "(none)"}`);

  for (const name of REQUIRED_SERVERS) {
    if (!(name in servers)) {
      errors.push(`missing required server: ${name}`);
    }
  }

  for (const [name, cfg] of Object.entries(servers)) {
    if (!cfg || typeof cfg !== "object" || Array.isArray(cfg)) {
      errors.push(`server '${name}' must be an object`);
      continue;
    }
    const command = cfg.command ?? "?";
    const args = Array.isArray(cfg.args) ? cfg.args : [];
    const argPreview = args
      .slice(0, 4)
      .map(String)
      .join(" ")
      .concat(args.length > 4 ? " ..." : "");
    summary.push(`  - ${name}: command=${JSON.stringify(command)} args=[${argPreview}]`);

    const env = cfg.env;
    if (env && typeof env === "object") {
      for (const [key, val] of Object.entries(env)) {
        if (looksLikeHardcodedSecret(val)) {
          errors.push(
            `server '${name}' env.${key} looks like a hardcoded secret; use \${env:...}`
          );
        }
        if (typeof val === "string" && val.length > 0 && !isEnvPlaceholder(val)) {
          warnings.push(
            `server '${name}' env.${key} is not an env placeholder (value redacted)`
          );
        }
      }
    }

    if (name === "filesystem" && Array.isArray(args)) {
      for (const arg of args) {
        if (typeof arg !== "string") continue;
        if (isDangerousPath(arg)) {
          errors.push(
            `filesystem MCP arg ${JSON.stringify(arg)} is dangerously broad; use \${workspaceFolder} only`
          );
        }
        if (arg === "/" || arg === "\\" || arg === "C:\\" || arg === "C:/") {
          errors.push(`filesystem MCP must not grant ${JSON.stringify(arg)}`);
        }
        if (arg === "." && !args.includes("${workspaceFolder}")) {
          warnings.push(
            "filesystem uses '.'; prefer ${workspaceFolder} for explicit workspace scope"
          );
        }
      }
      const hasWorkspace =
        args.includes("${workspaceFolder}") ||
        args.some((a) => typeof a === "string" && a.includes("workspaceFolder"));
      if (!hasWorkspace && !args.includes(".")) {
        warnings.push(
          "filesystem args should include ${workspaceFolder} or current-project scope"
        );
      }
    }
  }

  for (const s of collectStrings(data)) {
    if (looksLikeHardcodedSecret(s)) {
      errors.push("config contains a value that looks like a hardcoded secret");
      break;
    }
  }

  const githubCfg = servers.github;
  if (githubCfg && typeof githubCfg === "object") {
    const env = githubCfg.env;
    const tokenRef =
      env && typeof env === "object"
        ? env.GITHUB_PERSONAL_ACCESS_TOKEN
        : "";
    if (!tokenRef) {
      warnings.push(
        "github MCP has no GITHUB_PERSONAL_ACCESS_TOKEN env mapping; set GITHUB_TOKEN locally for API access"
      );
    } else if (typeof tokenRef === "string" && !isEnvPlaceholder(tokenRef)) {
      errors.push(
        "github MCP GITHUB_PERSONAL_ACCESS_TOKEN must use ${env:...}, not a literal token"
      );
    }
  }

  printReport(errors, warnings, summary);
  process.exit(errors.length > 0 ? 1 : 0);
}

function printReport(errors, warnings, summary) {
  console.log("MCP config check");
  console.log("  path: .cursor/mcp.json");
  console.log("  summary:");
  for (const line of summary) {
    console.log(`    ${line}`);
  }
  if (warnings.length) {
    console.log("  warnings:");
    for (const w of warnings) {
      console.log(`    - ${w}`);
    }
  }
  if (errors.length) {
    console.log("  errors:");
    for (const e of errors) {
      console.log(`    - ${e}`);
    }
  }
  console.log(`  result: ${errors.length ? "FAIL" : "PASS"}`);
}

main();
