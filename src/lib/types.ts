export type JsonRecord = Record<string, unknown>;

export interface OpenCodeContext {
  project: { root: string };
  directory: string;
  worktree?: string;
  client: {
    app: { log: (message: string) => void };
    session: {
      prompt: (args: { parts: Array<{ text: string }> }) => Promise<void> | void;
    };
  };
}

export type HookHandler<E = unknown> = (
  ctx: OpenCodeContext,
  event: E
) => Promise<void> | void;

export interface OpenCodePlugin {
  name: string;
  hooks: Record<string, HookHandler>;
}
