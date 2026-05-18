"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, Skeleton, Typography, theme } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useAppState } from "@/lib/app-state";
import { ConfirmActionModal } from "@/components/confirm-action-modal";
import { TaskCard } from "@/components/task-card";
import { TaskEditorModal } from "@/components/task-editor-modal";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { DashboardFilterValue, Task, TaskInput } from "@/types";

const { Title, Text, Paragraph } = Typography;

const FILTER_OPTIONS: Array<{ value: DashboardFilterValue; label: string }> = [
  { value: "all", label: "All tasks" },
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

function filterTasks(
  tasks: Task[],
  activeFilter: DashboardFilterValue,
  deferredSearch: string,
) {
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesFilter =
      activeFilter === "all" ? true : task.status === activeFilter;
    const matchesSearch =
      normalizedSearch.length === 0
        ? true
        : `${task.title} ${task.description}`
            .toLowerCase()
            .includes(normalizedSearch);

    return matchesFilter && matchesSearch;
  });
}

function createTaskCountLabel(totalTasks: number, filteredTaskCount: number) {
  if (filteredTaskCount === totalTasks) {
    return `${totalTasks} tasks in view`;
  }

  return `${filteredTaskCount} of ${totalTasks} tasks in view`;
}

export function DashboardPage() {
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
  const { token } = theme.useToken();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<DashboardFilterValue>("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskPendingDeletion, setTaskPendingDeletion] = useState<Task | null>(
    null,
  );
  const [createKey, setCreateKey] = useState(0);
  const hasLoadedRef = useRef(false);
  const deferredSearch = useDeferredValue(search);

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

  const filteredTasks = useMemo(
    () => filterTasks(state.tasks, activeFilter, deferredSearch),
    [activeFilter, deferredSearch, state.tasks],
  );

  const completedTasks = useMemo(
    () => state.tasks.filter((task) => task.status === "done").length,
    [state.tasks],
  );

  const inProgressTasks = useMemo(
    () => state.tasks.filter((task) => task.status === "in-progress").length,
    [state.tasks],
  );

  const completionRate =
    state.tasks.length === 0
      ? 0
      : Math.round((completedTasks / state.tasks.length) * 100);

  const metrics = [
    {
      label: "Signed in as",
      value: state.session?.username ?? "Guest",
      detail: "Local session active",
    },
    {
      label: "Total tasks",
      value: `${state.tasks.length}`,
      detail: "All tracked work",
    },
    {
      label: "Completion",
      value: `${completionRate}%`,
      detail: "Tasks marked done",
    },
    {
      label: "In progress",
      value: `${inProgressTasks}`,
      detail: "Currently active",
    },
  ];

  const taskCountLabel = useMemo(
    () => createTaskCountLabel(state.tasks.length, filteredTasks.length),
    [filteredTasks.length, state.tasks.length],
  );

  async function handleSaveTask(values: TaskInput) {
    const didSave = await saveTask(values, editingTask?.id);

    if (!didSave) {
      return;
    }

    setIsModalOpen(false);

    if (!editingTask) {
      setCreateKey((currentKey) => currentKey + 1);
    }

    setEditingTask(null);
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  function handleStartCreate() {
    clearError();
    setEditingTask(null);
    setCreateKey((currentKey) => currentKey + 1);
    setIsModalOpen(true);
  }

  function handleStartEdit(task: Task) {
    clearError();
    setEditingTask(task);
    setIsModalOpen(true);
  }

  function handleModalCancel() {
    setIsModalOpen(false);
    setEditingTask(null);
  }

  function handleDeleteIntent(taskId: string) {
    const task = state.tasks.find((item) => item.id === taskId) ?? null;
    setTaskPendingDeletion(task);
  }

  async function handleConfirmDelete() {
    if (!taskPendingDeletion) {
      return;
    }

    await removeTask(taskPendingDeletion.id);
    setTaskPendingDeletion(null);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <SurfaceCard
          tone="subtle"
          className="sticky top-4 z-10 shadow-[var(--card-shadow)]"
          styles={{ body: { padding: 14 } }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--foreground)] text-[var(--background)]">
                <ThunderboltOutlined className="text-lg" />
              </div>
              <div>
                <div className="text-base font-semibold tracking-tight">
                  MeaTech
                </div>
                <Text type="secondary" className="text-sm">
                  Task operations dashboard
                </Text>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <div className="rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm shadow-[inset_0_0_0_1px_var(--border)]">
                <span className="text-[var(--muted)]">Signed in as </span>
                <span className="font-medium">
                  {state.session?.username ?? "Guest"}
                </span>
              </div>
              <Button
                shape="round"
                size="large"
                className="min-h-10 px-5 font-medium active:scale-[0.96] transition-transform"
                onClick={() =>
                  setTheme(state.theme === "dark" ? "light" : "dark")
                }
              >
                {state.theme === "dark" ? "Light Mode" : "Dark Mode"}
              </Button>
              <Button
                shape="round"
                size="large"
                icon={<ReloadOutlined />}
                className="min-h-10 px-5 font-medium active:scale-[0.96] transition-transform"
                onClick={() => void refreshTasks()}
              >
                Refresh
              </Button>
              <Button
                danger
                shape="round"
                size="large"
                className="min-h-10 px-5 font-semibold active:scale-[0.96] transition-transform"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.95fr)] xl:items-start">
          <SurfaceCard
            className="shadow-[var(--card-shadow)]"
            styles={{ body: { padding: 28 } }}
          >
            <div className="flex h-full flex-col gap-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <Text
                    type="secondary"
                    className="text-xs font-semibold uppercase tracking-[0.24em]"
                  >
                    Dashboard
                  </Text>
                  <Title
                    level={1}
                    className="mt-3 !mb-0 !text-4xl text-balance sm:!text-5xl"
                  >
                    Overview
                  </Title>
                  <div className="mt-4 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                    Calm control over every task.
                  </div>
                  <Paragraph
                    type="secondary"
                    className="mt-4 max-w-2xl text-sm leading-7 [text-wrap:pretty] sm:text-base"
                  >
                    Track momentum, clear blockers, and update execution without
                    leaving the board. Everything here is optimized for quick
                    daily use.
                  </Paragraph>
                </div>

                <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:justify-end">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    className="min-h-11 rounded-full px-6 font-semibold active:scale-[0.96] transition-transform"
                    onClick={handleStartCreate}
                  >
                    Create Task
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SurfaceCard tone="subtle">
                  <Text
                    type="secondary"
                    className="text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    Focus lane
                  </Text>
                  <div className="mt-3 text-lg font-semibold text-balance">
                    {filteredTasks.length === 0
                      ? "No matching work right now."
                      : filteredTasks[0]?.title}
                  </div>
                  <Text
                    type="secondary"
                    className="mt-3 block text-sm leading-6"
                  >
                    Use filters and search below to narrow work to the exact
                    slice you need.
                  </Text>
                </SurfaceCard>
                <SurfaceCard tone="subtle">
                  <Text
                    type="secondary"
                    className="text-xs font-semibold uppercase tracking-[0.18em]"
                  >
                    Board health
                  </Text>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-4xl font-semibold tabular-nums">
                      {completionRate}%
                    </span>
                    <span className="pb-1 text-sm text-[var(--muted)]">
                      completion rate
                    </span>
                  </div>
                  <Text
                    type="secondary"
                    className="mt-3 block text-sm leading-6"
                  >
                    {completedTasks} completed, {inProgressTasks} in progress,{" "}
                    {state.tasks.length - completedTasks - inProgressTasks}{" "}
                    waiting.
                  </Text>
                </SurfaceCard>
              </div>
            </div>
          </SurfaceCard>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {metrics.map((metric) => (
              <SurfaceCard
                key={metric.label}
                tone="subtle"
                className="shadow-[var(--card-shadow)]"
              >
                <Text
                  type="secondary"
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                >
                  {metric.label}
                </Text>
                <div className="mt-3 text-3xl font-semibold tabular-nums">
                  {metric.value}
                </div>
                <Text type="secondary" className="mt-2 block text-sm leading-6">
                  {metric.detail}
                </Text>
              </SurfaceCard>
            ))}
          </div>
        </div>

        {state.error ? (
          <Alert
            message={state.error}
            type="error"
            showIcon
            closable
            onClose={clearError}
            className="shadow-[var(--card-shadow)]"
          />
        ) : null}

        <SurfaceCard
          className="shadow-[var(--card-shadow)]"
          styles={{ body: { padding: 28 } }}
        >
          <div className="flex flex-col gap-5 border-b pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Title level={3} className="!mb-2 text-balance">
                  Tasks
                </Title>
                <Text type="secondary" className="block leading-6">
                  Search, filter, and update work from one operational view.
                </Text>
              </div>

              <div className="flex w-full items-center justify-start gap-3 lg:w-auto lg:justify-end">
                <div className="rounded-full bg-[var(--surface)] px-4 py-2 text-sm tabular-nums shadow-[inset_0_0_0_1px_var(--border)]">
                  {taskCountLabel}
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  className="min-h-11 rounded-full px-6 font-semibold active:scale-[0.96] transition-transform"
                  onClick={handleStartCreate}
                >
                  Create Task
                </Button>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <Input
                  size="large"
                  prefix={
                    <SearchOutlined
                      style={{ color: token.colorTextPlaceholder }}
                    />
                  }
                  placeholder="Search title or description..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="min-h-12"
                />
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                {FILTER_OPTIONS.map((filterOption) => (
                  <Button
                    key={filterOption.value}
                    size="large"
                    type={
                      filterOption.value === activeFilter
                        ? "primary"
                        : "default"
                    }
                    className="min-h-11 rounded-full px-4 active:scale-[0.96] transition-transform"
                    onClick={() => setActiveFilter(filterOption.value)}
                  >
                    {filterOption.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {state.tasksStatus === "loading" ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((key) => (
                  <SurfaceCard
                    key={key}
                    tone="subtle"
                    className="shadow-[var(--card-shadow)]"
                  >
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </SurfaceCard>
                ))}
              </div>
            ) : null}

            {state.tasksStatus !== "loading" && filteredTasks.length === 0 ? (
              <div
                className="rounded-[24px] px-5 py-12 text-center"
                style={{
                  backgroundColor: "var(--surface)",
                  boxShadow: `inset 0 0 0 1px ${token.colorBorderSecondary}`,
                }}
              >
                <Title level={4} className="!mb-2">
                  No tasks found
                </Title>
                <Text type="secondary">
                  Try adjusting your search or filters, or create a new task.
                </Text>
              </div>
            ) : null}

            {state.tasksStatus !== "loading"
              ? filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDeleting={state.deletingTaskId === task.id}
                    onEdit={handleStartEdit}
                    onDelete={handleDeleteIntent}
                  />
                ))
              : null}
          </div>
        </SurfaceCard>
      </div>

      <TaskEditorModal
        createKey={createKey}
        editingTask={editingTask}
        isOpen={isModalOpen}
        isSaving={state.formStatus === "saving"}
        onCancel={handleModalCancel}
        onSubmit={handleSaveTask}
      />

      <ConfirmActionModal
        title="Delete task"
        description={
          taskPendingDeletion
            ? `Delete "${taskPendingDeletion.title}"? This action cannot be undone in the current session.`
            : "Delete this task?"
        }
        confirmLabel="Delete Task"
        isOpen={taskPendingDeletion !== null}
        isLoading={
          taskPendingDeletion !== null &&
          state.deletingTaskId === taskPendingDeletion.id
        }
        onCancel={() => setTaskPendingDeletion(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </main>
  );
}

export default DashboardPage;
