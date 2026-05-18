import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AppStateProvider, useAppState } from "./app-state";
import { ReactNode } from "react";
import { DEMO_CREDENTIALS, MOCK_TOKEN } from "./constants";

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe("app-state", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("provides initial state", () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    expect(result.current.state).toBeDefined();
    expect(result.current.state.authStatus).toBe("idle");
  });

  it("handles login", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      const success = await result.current.login(DEMO_CREDENTIALS);
      expect(success).toBe(true);
    });

    expect(result.current.state.session?.token).toBe(MOCK_TOKEN);
  });

  it("handles login failure", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      const success = await result.current.login({ username: "wrong", password: "pwd" });
      expect(success).toBe(false);
    });

    expect(result.current.state.error).toBeDefined();
  });

  it("handles logout", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      await result.current.login(DEMO_CREDENTIALS);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.state.session).toBeNull();
  });

  it("refreshes tasks", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      await result.current.login(DEMO_CREDENTIALS);
    });

    await act(async () => {
      await result.current.refreshTasks();
    });

    expect(result.current.state.tasksStatus).toBe("idle");
  });

  it("handles refresh tasks when not logged in", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      await result.current.refreshTasks();
    });

    expect(result.current.state.tasksStatus).toBe("idle");
  });

  it("handles refresh tasks failure", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
        await result.current.login(DEMO_CREDENTIALS);
    });

    // Manually break the session token to cause 401
    act(() => {
        result.current.state.session!.token = "invalid";
    });

    await act(async () => {
      await result.current.refreshTasks();
    });

    expect(result.current.state.error).toBe("Unauthorized request.");
  });

  it("saves a new task", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      await result.current.login(DEMO_CREDENTIALS);
    });

    await act(async () => {
      const success = await result.current.saveTask({
        title: "New Task Title",
        description: "New Task Description is long enough",
        status: "todo"
      });
      expect(success).toBe(true);
    });

    expect(result.current.state.tasks[0].title).toBe("New Task Title");
  });

  it("handles save task failure", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      await result.current.login(DEMO_CREDENTIALS);
    });

    await act(async () => {
      const success = await result.current.saveTask({
        title: "sh",
        description: "too short",
        status: "todo"
      });
      expect(success).toBe(false);
    });

    expect(result.current.state.error).toBeDefined();
  });

  it("handles save task when not logged in", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      const success = await result.current.saveTask({
        title: "Title",
        description: "Description is long enough",
        status: "todo"
      });
      expect(success).toBe(false);
    });
  });

  it("updates an existing task", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      await result.current.login(DEMO_CREDENTIALS);
    });

    const taskId = result.current.state.tasks[0].id;

    await act(async () => {
      const success = await result.current.saveTask({
        title: "Updated Title",
        description: "Updated description is also long enough",
        status: "done"
      }, taskId);
      expect(success).toBe(true);
    });

    expect(result.current.state.tasks.find(t => t.id === taskId)?.title).toBe("Updated Title");
  });

  it("removes a task", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      await result.current.login(DEMO_CREDENTIALS);
    });

    const taskId = result.current.state.tasks[0].id;
    const initialCount = result.current.state.tasks.length;

    await act(async () => {
      await result.current.removeTask(taskId);
    });

    expect(result.current.state.tasks.length).toBe(initialCount - 1);
  });

  it("handles remove task when not logged in", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      await result.current.removeTask("some-id");
    });

    expect(result.current.state.deletingTaskId).toBeNull();
  });

  it("handles remove task failure", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
        await result.current.login(DEMO_CREDENTIALS);
    });

    await act(async () => {
      await result.current.removeTask("non-existent");
    });

    expect(result.current.state.error).toBe("Task not found.");
  });

  it("sets theme", () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    act(() => {
      result.current.setTheme("dark");
    });
    expect(result.current.state.theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("clears error", async () => {
    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      await result.current.login({ username: "wrong", password: "pwd" });
    });

    expect(result.current.state.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.state.error).toBeNull();
  });

  it("handles unknown error payloads via fallback", async () => {
    // Spy on mockApiFetch to return a non-standard error payload
    const mockApi = await import("./mock-api");
    const spy = vi.spyOn(mockApi, "mockApiFetch").mockResolvedValueOnce({
      ok: false,
      json: async () => null, // null payload to trigger fallback
    } as unknown as Response);

    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      const success = await result.current.login(DEMO_CREDENTIALS);
      expect(success).toBe(false);
    });

    expect(result.current.state.error).toBe("Unable to sign in.");
    spy.mockRestore();
  });

  it("handles string error payloads via fallback", async () => {
    // Spy on mockApiFetch to return a string error payload
    const mockApi = await import("./mock-api");
    const spy = vi.spyOn(mockApi, "mockApiFetch").mockResolvedValueOnce({
      ok: false,
      json: async () => "Just a string error", // string payload
    } as unknown as Response);

    const { result } = renderHook(() => useAppState(), { wrapper });
    
    await act(async () => {
      const success = await result.current.login(DEMO_CREDENTIALS);
      expect(success).toBe(false);
    });

    expect(result.current.state.error).toBe("Just a string error");
    spy.mockRestore();
  });

  it("throws error when useAppState is used outside provider", () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAppState())).toThrow("useAppState must be used within an AppStateProvider.");
    spy.mockRestore();
  });
});
