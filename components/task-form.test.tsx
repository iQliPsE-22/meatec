import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskForm } from "./task-form";

describe("TaskForm", () => {
  const initialValues = { title: "", description: "", status: "todo" } as any;
  const mockOnSubmit = vi.fn();

  it("renders form fields", () => {
    render(<TaskForm initialValues={initialValues} isSaving={false} onSubmit={mockOnSubmit} />);
    expect(screen.getByPlaceholderText(/e.g., Prepare release checklist/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/e.g., Document QA steps/i)).toBeDefined();
    expect(screen.getByLabelText("Status")).toBeDefined();
  });

  it("submits the form with valid data and interacts with select", async () => {
    render(<TaskForm initialValues={initialValues} isSaving={false} onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByPlaceholderText(/e.g., Prepare release checklist/i), { target: { value: "Valid Title" } });
    fireEvent.change(screen.getByPlaceholderText(/e.g., Document QA steps/i), { target: { value: "Valid Description is long enough" } });
    
    const select = screen.getByRole("combobox", { name: "Status" });
    fireEvent.mouseDown(select);
    fireEvent.blur(select); // Trigger onBlur for coverage
    // In antd, options render outside or inside, usually we can just click it if we wait or just fire change if possible, but let's click the option.
    const inProgressOption = await screen.findByText("In Progress");
    fireEvent.click(inProgressOption);

    fireEvent.click(screen.getByRole("button", { name: "Save Task" }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: "Valid Title",
        description: "Valid Description is long enough",
        status: "in_progress"
      });
    }, { timeout: 3000 });
  });

  it("shows validation errors for invalid data", async () => {
    render(<TaskForm initialValues={initialValues} isSaving={false} onSubmit={mockOnSubmit} />);
    
    fireEvent.click(screen.getByRole("button", { name: "Save Task" }));

    await waitFor(() => {
      expect(screen.getByText("Please input the title!")).toBeDefined();
      expect(screen.getByText("Please input the description!")).toBeDefined();
    }, { timeout: 3000 });
  });

  it("shows 'Saving...' label when isSaving is true", () => {
    render(<TaskForm initialValues={initialValues} isSaving={true} onSubmit={mockOnSubmit} />);
    expect(screen.getByText("Saving...")).toBeDefined();
  });
});
