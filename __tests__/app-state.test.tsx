import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Providers } from "@/app/providers";
import { DEFAULT_TASKS } from "@/lib/constants";
import { clearSnapshot, saveSnapshot } from "@/lib/storage";
import { useAppState } from "@/lib/app-state";
import * as mockApiModule from "@/lib/mock-api";

function Harness() {
  const { state, login, logout, refreshTasks, saveTask, removeTask, clearError, setTheme } =
    useAppState();

  return (
    <div>
      <span data-testid="theme">{state.theme}</span>
      <span data-testid="session">{state.session?.username ?? "guest"}</span>
      <span data-testid="task-count">{state.tasks.length}</span>
      <span data-testid="error">{state.error ?? "none"}</span>
      <button onClick={() => void login({ username: "bad", password: "creds" })}>Bad Login</button>
      <button onClick={() => void login({ username: "test", password: "test123" })}>Good Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => void refreshTasks()}>Refresh</button>
      <button
        onClick={() =>
          void saveTask({
            title: "Created task",
            description: "A long enough description to persist.",
            status: "todo",
          })
        }
      >
        Save
      </button>
      <button
        onClick={() =>
          void saveTask(
            {
              title: "No",
              description: "Short",
              status: "todo",
            },
            DEFAULT_TASKS[0].id,
          )
        }
      >
        Save Invalid
      </button>
      <button onClick={() => void removeTask(DEFAULT_TASKS[0].id)}>Delete Existing</button>
      <button onClick={() => void removeTask("missing")}>Delete Missing</button>
      <button onClick={() => clearError()}>Clear Error</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
    </div>
  );
}

function renderHarness() {
  return render(
    <Providers>
      <Harness />
    </Providers>,
  );
}

describe("app state", () => {
  beforeEach(() => {
    clearSnapshot();
  });

  it("throws when used outside the provider", () => {
    function OutsideConsumer() {
      useAppState();
      return null;
    }

    expect(() => render(<OutsideConsumer />)).toThrow(
      "useAppState must be used within an AppStateProvider.",
    );
  });

  it("hydrates from storage and updates theme", async () => {
    const user = userEvent.setup();

    renderHarness();
    expect(screen.getByTestId("theme")).toHaveTextContent("light");

    await user.click(screen.getByRole("button", { name: "Dark" }));

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("handles login, refresh, save, delete, logout, and error cleanup", async () => {
    const user = userEvent.setup();

    renderHarness();

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: "Delete Existing" }));

    expect(screen.getByTestId("task-count")).toHaveTextContent(`${DEFAULT_TASKS.length}`);

    await user.click(screen.getByRole("button", { name: "Bad Login" }));
    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Invalid username or password. Use the seeded demo account.",
      ),
    );

    await user.click(screen.getByRole("button", { name: "Clear Error" }));
    expect(screen.getByTestId("error")).toHaveTextContent("none");

    await user.click(screen.getByRole("button", { name: "Good Login" }));
    await waitFor(() => expect(screen.getByTestId("session")).toHaveTextContent("test"));

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() =>
      expect(screen.getByTestId("task-count")).toHaveTextContent(`${DEFAULT_TASKS.length}`),
    );

    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByTestId("task-count")).toHaveTextContent("4"));

    await user.click(screen.getByRole("button", { name: "Save Invalid" }));
    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Title must be at least 3 characters.",
      ),
    );

    await user.click(screen.getByRole("button", { name: "Delete Missing" }));
    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("Task not found."),
    );

    await user.click(screen.getByRole("button", { name: "Delete Existing" }));
    await waitFor(() => expect(screen.getByTestId("task-count")).toHaveTextContent("3"));

    await user.click(screen.getByRole("button", { name: "Logout" }));
    expect(screen.getByTestId("session")).toHaveTextContent("guest");
  });

  it("handles refresh failures when the stored token is invalid", async () => {
    const user = userEvent.setup();

    saveSnapshot({
      version: 1,
      theme: "light",
      session: { username: "test", token: "bad-token" },
      tasks: DEFAULT_TASKS,
    });

    renderHarness();

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("Unauthorized request."),
    );
  });

  it("supports provider-only composition", () => {
    render(
      <Providers>
        <div>Provider child</div>
      </Providers>,
    );

    expect(screen.getByText("Provider child")).toBeInTheDocument();
  });

  it("falls back to generic provider errors when the payload has no message", async () => {
    const user = userEvent.setup();
    const mockApiSpy = vi
      .spyOn(mockApiModule, "mockApiFetch")
      .mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }),
      );

    renderHarness();

    await user.click(screen.getByRole("button", { name: "Good Login" }));

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("Unable to sign in."),
    );

    mockApiSpy.mockRestore();
  });
});
