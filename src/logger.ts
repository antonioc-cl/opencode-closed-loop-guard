import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export function createLogger(dir: string) {
  mkdirSync(dir, { recursive: true });

  function write(file: string, payload: any) {
    appendFileSync(
      join(dir, file),
      JSON.stringify({ ts: new Date().toISOString(), ...payload }) + "\n"
    );
  }

  return {
    preTool: (data: any) => write("tool_pre.jsonl", data),
    postTool: (data: any) => write("tool_post.jsonl", data),
    validation: (data: any) => write("validation.jsonl", data),
    blocked: (data: any) => write("blocked.jsonl", data),
  };
}
