"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_OPTIONS } from "@/lib/constants";
import type { Task, TaskInput, TaskStatus } from "@/lib/types";
import { useAppState } from "@/lib/app-state";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

type FilterValue = "all" | TaskStatus;

const FILTER_LABELS: Array<{ value: FilterValue; label: string }> = [
  { value: "all", label: "All tasks" },
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export function DashboardScreen() {
  const router = useRouter();
  const {
    state,
    logout,
    refreshTasks,
    saveTask,
    removeTask,
    clearError,
    setTheme,
  } = useAppState();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [createKey, setCreateKey] = useState(0);
  const hasLoadedRef = useRef(false);
  const deferredSearch = useDeferredValue(search);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!state.session) {
      router.replace("/");
      return;
    }

    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      void refreshTasks();
    }
  }, [refreshTasks, router, state.session]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return state.tasks.filter((task) => {
      const matchesFilter =
        activeFilter === "all" ? true : task.status === activeFilter;
      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : `${task.title} ${task.description}`.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, deferredSearch, state.tasks]);

  const completionRate =
    state.tasks.length === 0
      ? 0
      : Math.round(
          (state.tasks.filter((task) => task.status === "done").length / state.tasks.length) *
            100,
        );

  async function handleSaveTask(values: TaskInput) {
    const didSave = await saveTask(values, editingTask?.id);
    if (didSave) {
      if (!editingTask) {
        setCreateKey((k) => k + 1);
      }
      setEditingTask(null);
    }
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  function handleStartCreate() {
    clearError();
    setEditingTask(null);
    setCreateKey((k) => k + 1);
  }

  function handleStartEdit(task: Task) {
    clearError();
    setEditingTask(task);
  }

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-6 lg:px-8 bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card className="overflow-hidden border-none shadow-md">
          <CardContent className="p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dashboard
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-balance sm:text-4xl">
                  Overview
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground [text-wrap:pretty] sm:text-base">
                  Manage your tasks, track your progress, and stay organized. All changes are saved locally to your browser.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setTheme(state.theme === "dark" ? "light" : "dark")}
                >
                  {state.theme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => void refreshTasks()}
                >
                  Refresh
                </Button>
                <Button
                  variant="default"
                  className="rounded-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Signed in as" value={state.session?.username ?? "Guest"} detail="Local session active" />
              <MetricCard label="Total Tasks" value={`${state.tasks.length}`} detail="All tracked tasks" />
              <MetricCard label="Completion" value={`${completionRate}%`} detail="Tasks marked as done" />
              <MetricCard
                label="In Progress"
                value={`${state.tasks.filter((task) => task.status === "in-progress").length}`}
                detail="Tasks currently active"
              />
            </div>
          </CardContent>
        </Card>

        {state.error ? (
          <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
            <AlertDescription className="text-sm">{state.error}</AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8"
              onClick={clearError}
            >
              Dismiss
            </Button>
          </Alert>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-5 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-4 border-b pb-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Tasks</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Search and filter your tasks below.
                    </p>
                  </div>
                  <Button
                    onClick={handleStartCreate}
                    className="h-10 px-5 text-sm font-semibold rounded-lg"
                  >
                    Create Task
                  </Button>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="flex-1">
                    <label htmlFor="search-tasks" className="sr-only">Search tasks</label>
                    <Input
                      id="search-tasks"
                      className="h-10 w-full"
                      placeholder="Search title or description..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_LABELS.map((filter) => {
                      const isActive = filter.value === activeFilter;

                      return (
                        <Button
                          key={filter.value}
                          variant={isActive ? "default" : "outline"}
                          className="h-10 rounded-full"
                          onClick={() => setActiveFilter(filter.value)}
                        >
                          {filter.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {state.tasksStatus === "loading" ? (
                  <div className="rounded-xl border border-dashed px-5 py-10 text-center text-sm text-muted-foreground">
                    Loading tasks...
                  </div>
                ) : null}

                {state.tasksStatus !== "loading" && filteredTasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed bg-muted/30 px-5 py-10 text-center">
                    <p className="text-lg font-semibold">No tasks found</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Try adjusting your search or filters, or create a new task.
                    </p>
                  </div>
                ) : null}

                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDeleting={state.deletingTaskId === task.id}
                    onEdit={handleStartEdit}
                    onDelete={(taskId) => void removeTask(taskId)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden self-start">
            <CardContent className="p-5 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {editingTask ? "Edit Task" : "Create Task"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-balance">
                    {editingTask ? "Update existing task" : "Add a new task"}
                  </h2>
                </div>
                {editingTask ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setEditingTask(null)}
                  >
                    Cancel Edit
                  </Button>
                ) : null}
              </div>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Fill out the details below to {editingTask ? "update" : "create"} your task.
              </p>

              <div className="mt-6">
                <TaskForm
                  key={editingTask ? editingTask.id : `create-${createKey}`}
                  initialValues={
                    editingTask ?? {
                      title: "",
                      description: "",
                      status: STATUS_OPTIONS[0],
                    }
                  }
                  isSaving={state.formStatus === "saving"}
                  onSubmit={handleSaveTask}
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <Card className="bg-muted/30 border-none shadow-none">
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
