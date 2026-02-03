import { createLogger } from "./logger.js";
import { detectRunner, runVerifyGate } from "./validators/verify.js";
import { loadConfig } from "./config.js";

export function createGuard({ project, client }: any) {
  const cfg = loadConfig(project.root);
  const logger = createLogger(cfg.logDir);

  let cycle = 0;

  return {
    "tool.execute.before": async ({ tool, args, output }: any) => {
      logger.preTool({ tool, args });

      if (tool === "bash" && /rm\s+-rf|sudo|chmod\s+777/.test(args.command)) {
        output.abort = "Blocked dangerous command";
        logger.blocked({ reason: "dangerous bash", command: args.command });
      }
    },

    "tool.execute.after": async ({ tool, args }: any) => {
      logger.postTool({ tool, args });
    },

    "session.idle": async () => {
      cycle++;

      if (cycle > cfg.maxCycles) {
        client.app.log("Max validation cycles reached");
        return;
      }

      const runner = detectRunner(project.root);
      const result = await runVerifyGate(project.root, runner);

      logger.validation(result);

      if (!result.ok) {
        await client.session.prompt({
          parts: [
            {
              text:
                `❌ Validation failed\n\n` +
                `Command: ${result.command}\n\n` +
                `${result.output.slice(0, 3000)}\n\n` +
                `Fix the issues and re-run validation.`,
            },
          ],
        });
      } else {
        client.app.log("✅ Validation passed");
      }
    },
  };
}
