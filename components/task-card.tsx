"use client";

import { STATUS_LABELS } from "@/lib/constants";
import type { Task } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TaskCardProps = {
  task: Task;
  isDeleting: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

export function TaskCard({ task, isDeleting, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className="border-none shadow-sm bg-muted/20 hover:bg-muted/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={task.status === "done" ? "default" : task.status === "in-progress" ? "secondary" : "outline"} className="uppercase tracking-wider">
                {STATUS_LABELS[task.status]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Updated{" "}
                <span className="tabular-nums">
                  {new Date(task.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-balance">{task.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground [text-wrap:pretty]">
              {task.description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-9 px-4"
              onClick={() => onEdit(task)}
            >
              Edit
            </Button>
            <Button
              variant="default"
              size="sm"
              className="rounded-full h-9 px-4"
              onClick={() => onDelete(task.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
