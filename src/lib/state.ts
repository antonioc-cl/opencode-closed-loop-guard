import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export interface GuardState {
  runId: string;
  cycleId: number;
  touchedFiles: string[];
  lastGateOk: boolean;
  lastGateAt?: string;
}

const defaultState = (): GuardState => ({
  runId: `r_${Date.now()}`,
  cycleId: 0,
  touchedFiles: [],
  lastGateOk: true
});

export const loadState = (projectRoot: string, stateDir: string): GuardState => {
  const dir = join(projectRoot, stateDir);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "guard_state.json");
  if (!existsSync(file)) return defaultState();
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as Partial<GuardState>;
    return {
      ...defaultState(),
      ...raw,
      touchedFiles: Array.isArray(raw.touchedFiles) ? raw.touchedFiles : []
    };
  } catch {
    return defaultState();
  }
};

export const saveState = (projectRoot: string, stateDir: string, state: GuardState): void => {
  const file = join(projectRoot, stateDir, "guard_state.json");
  writeFileSync(file, JSON.stringify(state, null, 2), "utf8");
};

export const addTouchedFiles = (state: GuardState, files: string[]): void => {
  const set = new Set(state.touchedFiles);
  for (const f of files) set.add(f);
  state.touchedFiles = [...set];
};

export const clearTouchedFiles = (state: GuardState): void => {
  state.touchedFiles = [];
};
