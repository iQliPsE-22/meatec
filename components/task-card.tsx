"use client";

import type { Task } from "@/types";
import { TaskRow } from "./task-row";
import { SurfaceCard } from "./ui/surface-card";

type TaskCardProps = {
  task: Task;
  isDeleting: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

export function TaskCard({ task, isDeleting, onEdit, onDelete }: TaskCardProps) {
  return (
    <SurfaceCard
      hoverable
      className="overflow-hidden shadow-[var(--card-shadow)] transition-transform duration-200 hover:-translate-y-0.5"
      tone="subtle"
    >
      <TaskRow
        task={task}
        isDeleting={isDeleting}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </SurfaceCard>
  );
}
