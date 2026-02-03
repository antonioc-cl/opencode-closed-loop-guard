import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

export interface JsonlLogger {
  write: (evt: Record<string, unknown>) => void;
}

export const createJsonlLogger = (absoluteFilePath: string): JsonlLogger => {
  mkdirSync(dirname(absoluteFilePath), { recursive: true });

  return {
    write: (evt) => {
      const line = JSON.stringify(evt);
      appendFileSync(absoluteFilePath, line + "\n", "utf8");
    }
  };
};

export const nowIso = (): string => new Date().toISOString();

export const safeTruncate = (text: string, max = 4000): string =>
  text.length > max ? text.slice(0, max) + `\n…(truncated ${text.length - max} chars)` : text;

export const logPaths = (projectRoot: string, logDir: string) => ({
  events: join(projectRoot, logDir, "events.jsonl"),
  toolPre: join(projectRoot, logDir, "tool_pre.jsonl"),
  toolPost: join(projectRoot, logDir, "tool_post.jsonl"),
  validation: join(projectRoot, logDir, "validation.jsonl"),
  stopGate: join(projectRoot, logDir, "stop_gate.jsonl")
});
