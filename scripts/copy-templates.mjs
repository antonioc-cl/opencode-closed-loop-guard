#!/usr/bin/env node
/**
 * Copies src/templates/** to dist/templates/** and makes .sh files executable.
 * Run from repo root (e.g. npm run build).
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "src", "templates");
const destDir = path.join(root, "dist", "templates");

if (!fs.existsSync(srcDir)) {
  console.error("copy-templates: src/templates not found");
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.cpSync(srcDir, destDir, { recursive: true });

const validatorsDir = path.join(destDir, ".opencode", "validators");
if (fs.existsSync(validatorsDir)) {
  for (const name of fs.readdirSync(validatorsDir)) {
    if (name.endsWith(".sh")) {
      const filePath = path.join(validatorsDir, name);
      fs.chmodSync(filePath, 0o755);
    }
  }
}

console.log("copy-templates: dist/templates/ updated");
