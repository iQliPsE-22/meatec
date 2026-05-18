import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmActionModal } from "./confirm-action-modal";
import { TaskEditorModal } from "./task-editor-modal";
import { TaskRow } from "./task-row";
import { TaskCard } from "./task-card";
import { AppStateProvider } from "@/lib/app-state";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe("Task Components", () => {
  it("renders ConfirmActionModal", () => {
    render(<ConfirmActionModal isOpen={true} title="Delete" description="Are you sure?" onConfirm={vi.fn()} onCancel={vi.fn()} />, { wrapper });
    expect(screen.getByText("Delete")).toBeDefined();
    expect(screen.getByText("Are you sure?")).toBeDefined();
  });

  it("renders TaskEditorModal", () => {
    render(<TaskEditorModal isOpen={true} editingTask={null} isSaving={false} onCancel={vi.fn()} onSubmit={vi.fn()} createKey={1} />, { wrapper });
    expect(screen.getByText("Add a new task")).toBeDefined();
  });

  it("renders TaskRow and handles actions", () => {
    const task = { id: "1", title: "Task 1", description: "Desc", status: "todo", createdAt: "", updatedAt: "" } as any;
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<TaskRow task={task} onEdit={onEdit} onDelete={onDelete} isDeleting={false} />, { wrapper });
    expect(screen.getByText("Task 1")).toBeDefined();
    
    // Ant Design's Dropdown or Buttons might be used here, but TaskRow has Button with EditOutlined
    // We can query by role button. Actually, let's just query by type/class if no aria-label, but Button in antd usually doesn't have aria-label.
    // Wait, TaskRow has Edit and Delete buttons without aria-label. Let's add them or query by icon?
    // Since there are only two buttons:
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // Edit
    expect(onEdit).toHaveBeenCalledWith(task);
    
    fireEvent.click(buttons[1]); // Delete
    expect(onDelete).toHaveBeenCalledWith(task.id);
  });

  it("renders TaskCard and handles actions", () => {
    const task = { id: "1", title: "Task 1", description: "Desc", status: "todo", createdAt: "", updatedAt: "" } as any;
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<TaskCard task={task} onEdit={onEdit} onDelete={onDelete} isDeleting={false} />, { wrapper });
    expect(screen.getByText("Task 1")).toBeDefined();
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // Edit
    expect(onEdit).toHaveBeenCalledWith(task);
    
    fireEvent.click(buttons[1]); // Delete
    expect(onDelete).toHaveBeenCalledWith(task.id);
  });
});
