"use client";

import { Button, Tag, Typography } from "antd";
import { STATUS_LABELS } from "@/lib/constants";
import type { Task } from "@/types";

const { Title, Text, Paragraph } = Typography;

type TaskRowProps = {
  task: Task;
  isDeleting: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

export function TaskRow({ task, isDeleting, onEdit, onDelete }: TaskRowProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <Tag
            color={
              task.status === "done"
                ? "success"
                : task.status === "in-progress"
                  ? "processing"
                  : "default"
            }
            className="m-0 rounded-full px-3 py-1 uppercase tracking-[0.16em]"
          >
            {STATUS_LABELS[task.status]}
          </Tag>
          <Text type="secondary" className="text-xs uppercase tracking-[0.12em]">
            Updated{" "}
            <span className="tabular-nums">
              {new Date(task.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </Text>
        </div>
        <Title level={4} className="mt-4 !mb-2 text-balance">
          {task.title}
        </Title>
        <Paragraph
          type="secondary"
          className="mb-0 max-w-3xl leading-6 [text-wrap:pretty]"
        >
          {task.description}
        </Paragraph>
      </div>

      <div className="mt-2 flex shrink-0 items-center gap-2 lg:mt-0">
        <Button
          type="default"
          shape="round"
          className="min-h-10 px-4 active:scale-[0.96] transition-transform"
          onClick={() => onEdit(task)}
        >
          Edit
        </Button>
        <Button
          danger
          type="primary"
          shape="round"
          className="min-h-10 px-4 active:scale-[0.96] transition-transform"
          onClick={() => onDelete(task.id)}
          loading={isDeleting}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
