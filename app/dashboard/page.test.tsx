import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardPage from "./page";
import { AppStateProvider } from "@/lib/app-state";

vi.mock("antd", async (importOriginal) => {
  const antd = await importOriginal<any>();
  return {
    ...antd,
    Modal: Object.assign(
      (props: any) => props.open ? antd.Modal(props) : null,
      antd.Modal
    )
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe("DashboardPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders dashboard content when authenticated", async () => {
    const mockSession = { token: "pulse-demo-token", username: "test" };
    localStorage.setItem("pulse-tasks.store.v1", JSON.stringify({
        version: 1,
        theme: "light",
        session: mockSession,
        tasks: []
    }));

    render(<DashboardPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getAllByText(/MeaTech/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Total tasks/i)).toBeDefined();
    }, { timeout: 5000 });
  });

  it("handles tab switching", async () => {
    const mockSession = { token: "pulse-demo-token", username: "test" };
    localStorage.setItem("pulse-tasks.store.v1", JSON.stringify({
        version: 1,
        theme: "light",
        session: mockSession,
        tasks: []
    }));

    render(<DashboardPage />, { wrapper });

    // Wait for dashboard to load, then click the Tasks tab
    await waitFor(() => {
        expect(screen.getAllByText('Tasks').length).toBeGreaterThan(0);
    }, { timeout: 8000 });
    const tasksTabs = screen.getAllByText('Tasks');
    fireEvent.click(tasksTabs[0]);

    await waitFor(() => {
      expect(screen.getByText(/Work board/i)).toBeDefined();
    }, { timeout: 8000 });
  }, 10000);

  it("opens and closes the task editor modal", async () => {
    const mockSession = { token: "pulse-demo-token", username: "test" };
    localStorage.setItem("pulse-tasks.store.v1", JSON.stringify({
        version: 1,
        theme: "light",
        session: mockSession,
        tasks: []
    }));

    render(<DashboardPage />, { wrapper });

    // Switch to Tasks tab where Add Task button lives
    await waitFor(() => {
        expect(screen.getAllByText('Tasks').length).toBeGreaterThan(0);
    }, { timeout: 8000 });
    const tasksTabs = screen.getAllByText('Tasks');
    fireEvent.click(tasksTabs[0]);

    const addBtn = await screen.findByRole('button', { name: /Add Task/i }, { timeout: 8000 });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText(/Add a new task/i)).toBeDefined();
    }, { timeout: 8000 });

    const closeBtn = document.querySelector('.ant-modal-close');
    if (closeBtn) {
        fireEvent.click(closeBtn);
    } else {
        fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });
    }

    // Force transition end so rc-motion removes the element from DOM
    const modal = document.querySelector('.ant-modal');
    if (modal) fireEvent.transitionEnd(modal);

    await waitFor(() => {
        expect(screen.queryByText(/Add a new task/i)).toBeNull();
    }, { timeout: 8000 });
  }, 15000);

  it("handles search", async () => {
      const mockSession = { token: "pulse-demo-token", username: "test" };
      localStorage.setItem("pulse-tasks.store.v1", JSON.stringify({
          version: 1,
          theme: "light",
          session: mockSession,
          tasks: [{ id: "1", title: "SearchMe", description: "Desc test task", status: "todo", createdAt: "2026-05-18T10:00:00Z", updatedAt: "2026-05-18T10:00:00Z" }]
      }));

      render(<DashboardPage />, { wrapper });

      // Switch to Tasks tab where search input lives
      await waitFor(() => {
          expect(screen.getAllByText('Tasks').length).toBeGreaterThan(0);
      }, { timeout: 8000 });
      const tasksTabs = screen.getAllByText('Tasks');
      fireEvent.click(tasksTabs[0]);

      const searchInput = await screen.findByPlaceholderText(/Search tasks/i, {}, { timeout: 8000 });
      fireEvent.change(searchInput, { target: { value: "SearchMe" } });

      await waitFor(() => {
        expect(screen.getByText("SearchMe")).toBeDefined();
      }, { timeout: 8000 });
  }, 15000);
});
