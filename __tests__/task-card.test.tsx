import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskCard } from "@/components/task-card";
import type { Task } from "@/lib/types";

const task: Task = {
  id: "task-1",
  title: "Draft release note",
  description: "Summarize shipped work and capture notable changes for the team.",
  status: "done",
  createdAt: "2026-05-10T09:00:00.000Z",
  updatedAt: "2026-05-12T11:30:00.000Z",
};

describe("TaskCard", () => {
  it("renders task details and triggers actions", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskCard task={task} isDeleting={false} onEdit={onEdit} onDelete={onDelete} />,
    );

    expect(screen.getByText("Draft release note")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onEdit).toHaveBeenCalledWith(task);
    expect(onDelete).toHaveBeenCalledWith("task-1");
  });

  it("disables deletion while removing a task", () => {
    render(<TaskCard task={task} isDeleting onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
  });
});
