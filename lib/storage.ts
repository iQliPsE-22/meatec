import { DEFAULT_TASKS, STORAGE_KEY } from "./constants";
import type { PersistedSnapshot } from "@/types";

function createDefaultSnapshot(): PersistedSnapshot {
  return {
    version: 1,
    theme: "light",
    session: null,
    tasks: DEFAULT_TASKS,
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadSnapshot(): PersistedSnapshot {
  if (!canUseStorage()) {
    return createDefaultSnapshot();
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return createDefaultSnapshot();
  }

  try {
    const parsed = JSON.parse(storedValue) as PersistedSnapshot;
    if (parsed.version !== 1 || !Array.isArray(parsed.tasks)) {
      return createDefaultSnapshot();
    }

    return {
      version: 1,
      theme: parsed.theme === "dark" ? "dark" : "light",
      session: parsed.session ?? null,
      tasks: parsed.tasks,
    };
  } catch {
    return createDefaultSnapshot();
  }
}

export function saveSnapshot(snapshot: PersistedSnapshot) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearSnapshot() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
