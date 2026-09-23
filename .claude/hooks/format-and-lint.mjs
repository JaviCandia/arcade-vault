// PostToolUse hook: runs Prettier and ESLint --fix on the file Claude just wrote/edited.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname, relative, resolve, sep } from "node:path";

const LINTABLE = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const SKIPPED_DIRS = ["node_modules", ".next", ".git"];

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const projectDir = resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
const filePath = input?.tool_input?.file_path;
if (!filePath) process.exit(0);

const file = resolve(filePath);
const rel = relative(projectDir, file);
if (
  !existsSync(file) ||
  rel.startsWith("..") ||
  resolve(rel) === rel ||
  rel.split(sep).some((part) => SKIPPED_DIRS.includes(part))
) {
  process.exit(0);
}

const run = (bin, args) =>
  spawnSync(process.execPath, [resolve(projectDir, bin), ...args, file], {
    cwd: projectDir,
    encoding: "utf8",
  });

run("node_modules/prettier/bin/prettier.cjs", ["--write", "--ignore-unknown"]);

if (LINTABLE.has(extname(file).toLowerCase())) {
  const result = run("node_modules/eslint/bin/eslint.js", ["--fix"]);
  if (result.status !== 0) {
    process.stderr.write(`ESLint found issues in ${rel}:\n${result.stdout}${result.stderr}`);
    process.exit(2);
  }
}
