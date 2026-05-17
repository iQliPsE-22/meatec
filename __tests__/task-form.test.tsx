import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskForm } from "@/components/task-form";

describe("TaskForm", () => {
  it("shows validation errors for short values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TaskForm
        initialValues={{ title: "", description: "", status: "todo" }}
        isSaving={false}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save Task" }));

    expect(screen.getByText("Title must be at least 3 characters.")).toBeInTheDocument();
    expect(
      screen.getByText("Description must be at least 10 characters."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits trimmed values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskForm
        initialValues={{ title: "  Build plan  ", description: "  Long enough text here.  ", status: "todo" }}
        isSaving={false}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Status" }));
    await user.click(screen.getByRole("option", { name: "Done" }));
    await user.click(screen.getByRole("button", { name: "Save Task" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Build plan",
      description: "Long enough text here.",
      status: "done",
    });
  });

  it("renders the saving state", () => {
    render(
      <TaskForm
        initialValues={{ title: "", description: "", status: "todo" }}
        isSaving
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });

  it("rejects invalid status values", async () => {
    const user = userEvent.setup();

    render(
      <TaskForm
        initialValues={{
          title: "Valid title",
          description: "A valid long description.",
          status: "blocked" as never,
        }}
        isSaving={false}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save Task" }));

    expect(screen.getByText("Select a valid status.")).toBeInTheDocument();
  });
});
