import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadSnapshot, saveSnapshot, clearSnapshot } from "./storage";
import { DEFAULT_TASKS, STORAGE_KEY } from "./constants";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("loadSnapshot", () => {
    it("returns default snapshot when storage is empty", () => {
      const snapshot = loadSnapshot();
      expect(snapshot.tasks).toEqual(DEFAULT_TASKS);
      expect(snapshot.version).toBe(1);
    });

    it("returns parsed snapshot from storage", () => {
      const mockTasks = [{ id: "1", title: "Test", status: "todo", createdAt: "", updatedAt: "" }] as any;
      const mockSnapshot = {
        version: 1,
        theme: "dark",
        session: null,
        tasks: mockTasks,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSnapshot));

      const snapshot = loadSnapshot();
      expect(snapshot).toEqual(mockSnapshot);
    });

    it("handles invalid JSON in storage", () => {
      localStorage.setItem(STORAGE_KEY, "invalid-json");
      const snapshot = loadSnapshot();
      expect(snapshot.tasks).toEqual(DEFAULT_TASKS);
    });

    it("handles incompatible version or missing tasks", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, tasks: [] }));
      expect(loadSnapshot().tasks).toEqual(DEFAULT_TASKS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1 }));
      expect(loadSnapshot().tasks).toEqual(DEFAULT_TASKS);
    });

    it("normalizes theme value", () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, theme: "something-else", tasks: [] }));
        expect(loadSnapshot().theme).toBe("light");

        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, theme: "dark", tasks: [] }));
        expect(loadSnapshot().theme).toBe("dark");
    });
  });

  describe("saveSnapshot", () => {
    it("saves snapshot to localStorage", () => {
      const mockSnapshot = { version: 1, theme: "light", session: null, tasks: [] } as any;
      saveSnapshot(mockSnapshot);
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(mockSnapshot));
    });
  });

  describe("clearSnapshot", () => {
    it("removes snapshot from localStorage", () => {
      localStorage.setItem(STORAGE_KEY, "some-data");
      clearSnapshot();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
