import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_TASKS, STORAGE_KEY } from "@/lib/constants";
import { clearSnapshot, loadSnapshot, saveSnapshot } from "@/lib/storage";

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the default snapshot when storage is empty", () => {
    expect(loadSnapshot()).toEqual({
      version: 1,
      theme: "light",
      session: null,
      tasks: DEFAULT_TASKS,
    });
  });

  it("saves and loads a snapshot", () => {
    saveSnapshot({
      version: 1,
      theme: "dark",
      session: { token: "token", username: "user" },
      tasks: [],
    });

    expect(loadSnapshot()).toEqual({
      version: 1,
      theme: "dark",
      session: { token: "token", username: "user" },
      tasks: [],
    });
  });

  it("falls back on invalid json", () => {
    window.localStorage.setItem(STORAGE_KEY, "not-json");

    expect(loadSnapshot().tasks).toEqual(DEFAULT_TASKS);
  });

  it("falls back on unsupported versions", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, theme: "dark", session: null, tasks: [] }),
    );

    expect(loadSnapshot().tasks).toEqual(DEFAULT_TASKS);
  });

  it("clears a saved snapshot", () => {
    saveSnapshot({
      version: 1,
      theme: "dark",
      session: { token: "token", username: "user" },
      tasks: [],
    });

    clearSnapshot();

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("handles environments without localStorage access", () => {
    const originalWindow = globalThis.window;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
    });

    expect(loadSnapshot().tasks).toEqual(DEFAULT_TASKS);
    expect(() =>
      saveSnapshot({
        version: 1,
        theme: "light",
        session: null,
        tasks: [],
      }),
    ).not.toThrow();
    expect(() => clearSnapshot()).not.toThrow();

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  });
});
