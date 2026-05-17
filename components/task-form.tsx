"use client";

import { useState } from "react";
import { STATUS_OPTIONS, STATUS_LABELS } from "@/lib/constants";
import type { TaskInput } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TaskFormProps = {
  initialValues: TaskInput;
  isSaving: boolean;
  onSubmit: (values: TaskInput) => Promise<void>;
};

type TaskFormErrors = Partial<Record<keyof TaskInput, string>>;

export function TaskForm({ initialValues, isSaving, onSubmit }: TaskFormProps) {
  const [values, setValues] = useState<TaskInput>(initialValues);
  const [errors, setErrors] = useState<TaskFormErrors>({});

  function validate(nextValues: TaskInput) {
    const nextErrors: TaskFormErrors = {};

    if (nextValues.title.trim().length < 3) {
      nextErrors.title = "Title must be at least 3 characters.";
    }

    if (nextValues.description.trim().length < 10) {
      nextErrors.description = "Description must be at least 10 characters.";
    }

    if (!STATUS_OPTIONS.includes(nextValues.status)) {
      nextErrors.status = "Select a valid status.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      status: values.status,
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          className="h-10"
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="e.g., Prepare release checklist"
        />
        {errors.title ? (
          <p className="text-sm font-medium text-destructive">{errors.title}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          className="min-h-32 resize-none"
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
          placeholder="e.g., Document QA steps, assign owners, and confirm launch timing."
        />
        {errors.description ? (
          <p className="text-sm font-medium text-destructive">{errors.description}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={values.status}
          onValueChange={(value) =>
            setValues((current) => ({
              ...current,
              status: value as TaskInput["status"],
            }))
          }
        >
          <SelectTrigger id="status" className="h-10">
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status ? (
          <p className="text-sm font-medium text-destructive">{errors.status}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="w-full h-10 font-semibold"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Task"}
      </Button>
    </form>
  );
}
