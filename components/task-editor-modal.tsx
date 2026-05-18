"use client";

import { Modal } from "antd";
import { STATUS_OPTIONS } from "@/lib/constants";
import type { Task, TaskInput } from "@/types";
import { TaskForm } from "./task-form";

type TaskEditorModalProps = {
  createKey: number;
  editingTask: Task | null;
  isOpen: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (values: TaskInput) => Promise<void>;
};

export function TaskEditorModal({
  createKey,
  editingTask,
  isOpen,
  isSaving,
  onCancel,
  onSubmit,
}: TaskEditorModalProps) {
  return (
    <Modal
      title={editingTask ? "Update Task" : "Add a new task"}
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      centered
    >
      <div className="mt-4">
        <TaskForm
          key={editingTask ? editingTask.id : `create-${createKey}`}
          initialValues={
            editingTask ?? {
              title: "",
              description: "",
              status: STATUS_OPTIONS[0],
            }
          }
          isSaving={isSaving}
          onSubmit={onSubmit}
        />
      </div>
    </Modal>
  );
}
