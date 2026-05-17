import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import DashboardPage from "@/app/dashboard/page";
import { DashboardScreen } from "@/components/dashboard-screen";
import { DEFAULT_TASKS } from "@/lib/constants";
import { clearSnapshot } from "@/lib/storage";
import { router } from "./router-mock";
import { renderWithProviders, seedAuthenticatedSnapshot } from "./test-utils";

describe("DashboardScreen", () => {
  beforeEach(() => {
    clearSnapshot();
    router.push.mockReset();
    router.replace.mockReset();
  });

  it("redirects guests to the login page", async () => {
    renderWithProviders(<DashboardScreen />);

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
  });

  it("renders the dashboard route and task metrics", async () => {
    seedAuthenticatedSnapshot({ tasks: DEFAULT_TASKS });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(await screen.findByText("Finalize onboarding flow copy")).toBeInTheDocument();
  });

  it("creates, filters, edits, deletes, dismisses errors, and logs out", async () => {
    const user = userEvent.setup();

    seedAuthenticatedSnapshot({ tasks: DEFAULT_TASKS });
    renderWithProviders(<DashboardScreen />);

    await user.click(screen.getByRole("button", { name: "Dark Mode" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    await user.click(screen.getByRole("button", { name: "Light Mode" }));
    expect(document.documentElement.dataset.theme).toBe("light");

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    await user.click(screen.getByRole("button", { name: "Create Task" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Fresh task" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "A valid description for the newly created task." },
    });
    await user.click(screen.getByRole("button", { name: "Save Task" }));

    expect(await screen.findByText("Fresh task")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search title or description..."), {
      target: { value: "missing" },
    });
    expect(screen.getByText("No tasks found")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search title or description..."), {
      target: { value: "" },
    });
    await user.click(screen.getByRole("button", { name: "To do" }));
    expect(screen.getByText("Prepare weekly stakeholder summary")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "All tasks" }));
    fireEvent.change(screen.getByPlaceholderText("Search title or description..."), {
      target: { value: "onboarding" },
    });
    expect(screen.getByText("Finalize onboarding flow copy")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search title or description..."), {
      target: { value: "" },
    });
    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    expect(screen.getByRole("button", { name: "Cancel Edit" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel Edit" }));
    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Updated task title" },
    });
    await user.click(screen.getByRole("button", { name: "Save Task" }));

    expect(await screen.findByText("Updated task title")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    await waitFor(() =>
      expect(screen.queryByText("Updated task title")).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Logout" }));
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("shows and dismisses dashboard-level errors", async () => {
    const user = userEvent.setup();

    seedAuthenticatedSnapshot({ tasks: [] });
    renderWithProviders(<DashboardScreen />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "No" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Short" },
    });
    await user.click(screen.getByRole("button", { name: "Save Task" }));

    expect(
      await screen.findByText("Title must be at least 3 characters."),
    ).toBeInTheDocument();
  });

  it("renders the light-mode switch when the snapshot starts dark", () => {
    seedAuthenticatedSnapshot({ tasks: DEFAULT_TASKS, theme: "dark" });
    renderWithProviders(<DashboardScreen />);

    expect(screen.getByRole("button", { name: "Light Mode" })).toBeInTheDocument();
  });

  it("keeps the editor open and shows a dismissible alert when save fails", async () => {
    const user = userEvent.setup();

    seedAuthenticatedSnapshot({
      tasks: DEFAULT_TASKS,
      session: { username: "test", token: "bad-token" },
    });
    renderWithProviders(<DashboardScreen />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Blocked save" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "A valid description that should fail at the provider layer." },
    });
    await user.click(screen.getByRole("button", { name: "Save Task" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Unauthorized request.");
    expect(screen.getByText("Add a new task")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
