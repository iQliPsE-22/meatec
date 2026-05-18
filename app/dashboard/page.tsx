"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Imports
// ─────────────────────────────────────────────────────────────────────────────

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Input,
  Progress,
  Table,
  Tag,
  Typography,
  theme,
  type TableProps,
} from "antd";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { useAppState } from "@/lib/app-state";
import { STATUS_LABELS } from "@/lib/constants";
import { ConfirmActionModal } from "@/components/confirm-action-modal";
import { TaskEditorModal } from "@/components/task-editor-modal";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SidebarBrand } from "@/components/dashboard/sidebar-brand";
import {
  SidebarNav,
  type SidebarTabKey,
} from "@/components/dashboard/sidebar-nav";
import { SidebarUser } from "@/components/dashboard/sidebar-user";
import { StatCard } from "@/components/dashboard/stat-card";
import { WeeklyActivityChart } from "@/components/dashboard/weekly-activity-chart";
import { StatusDistribution } from "@/components/dashboard/status-distribution";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import type { DashboardFilterValue, Task, TaskInput } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const { Title, Text, Paragraph } = Typography;

const FILTER_OPTIONS: Array<{ value: DashboardFilterValue; label: string }> = [
  { value: "all", label: "All tasks" },
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

/** Shared Tailwind classes reused across multiple buttons */
const BTN_BASE =
  "min-h-10 px-5 text-[14px] font-medium active:scale-[0.96] transition-transform";

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────────────────────────────────────

function filterTasks(
  tasks: Task[],
  activeFilter: DashboardFilterValue,
  deferredSearch: string,
): Task[] {
  const query = deferredSearch.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesFilter =
      activeFilter === "all" || task.status === activeFilter;

    const matchesSearch =
      query.length === 0 ||
      `${task.title} ${task.description}`.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });
}

function taskCountLabel(total: number, filtered: number): string {
  return filtered === total
    ? `${total} tasks in view`
    : `${filtered} of ${total} tasks in view`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildWeeklyActivity(tasks: Task[]) {
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - offset));

    const count = tasks.filter((task) => {
      const updated = new Date(task.updatedAt);
      return (
        updated.getFullYear() === date.getFullYear() &&
        updated.getMonth() === date.getMonth() &&
        updated.getDate() === date.getDate()
      );
    }).length;

    return { key: date.toISOString(), label: DAY_LABELS[date.getDay()], count };
  });
}

function getStatusTagColor(status: Task["status"]) {
  const map: Record<Task["status"], string> = {
    done: "success",
    "in-progress": "processing",
    todo: "default",
  };
  return map[status] ?? "default";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

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

  // ── Local state ────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<SidebarTabKey>("overview");
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

  // ── Effects ────────────────────────────────────────────────────────────────

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

  // ── Derived values ─────────────────────────────────────────────────────────

  const filteredTasks = useMemo(
    () => filterTasks(state.tasks, activeFilter, deferredSearch),
    [activeFilter, deferredSearch, state.tasks],
  );

  const recentTasks = useMemo(
    () =>
      [...state.tasks]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 3),
    [state.tasks],
  );

  const completedTasks = useMemo(
    () => state.tasks.filter((t) => t.status === "done").length,
    [state.tasks],
  );

  const inProgressTasks = useMemo(
    () => state.tasks.filter((t) => t.status === "in-progress").length,
    [state.tasks],
  );

  const todoTasks = useMemo(
    () => state.tasks.length - completedTasks - inProgressTasks,
    [state.tasks.length, completedTasks, inProgressTasks],
  );

  const completionRate = useMemo(
    () =>
      state.tasks.length === 0
        ? 0
        : Math.round((completedTasks / state.tasks.length) * 100),
    [completedTasks, state.tasks.length],
  );

  const countLabel = useMemo(
    () => taskCountLabel(state.tasks.length, filteredTasks.length),
    [filteredTasks.length, state.tasks.length],
  );

  const latestTask = useMemo(
    () =>
      [...filteredTasks].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )[0] ?? null,
    [filteredTasks],
  );

  const weeklyActivity = useMemo(
    () => buildWeeklyActivity(state.tasks),
    [state.tasks],
  );

  const username = useMemo(
    () => state.session?.username ?? "Guest",
    [state.session],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleLogout() {
    logout();
    router.push("/");
  }

  function handleStartCreate() {
    clearError();
    setEditingTask(null);
    setCreateKey((k) => k + 1);
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
    const task = state.tasks.find((t) => t.id === taskId) ?? null;
    setTaskPendingDeletion(task);
  }

  async function handleSaveTask(values: TaskInput) {
    const saved = await saveTask(values, editingTask?.id);
    if (!saved) return;

    setIsModalOpen(false);
    setEditingTask(null);
    if (!editingTask) setCreateKey((k) => k + 1);
  }

  async function handleConfirmDelete() {
    if (!taskPendingDeletion) return;
    await removeTask(taskPendingDeletion.id);
    setTaskPendingDeletion(null);
  }

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = useMemo<TableProps<Task>["columns"]>(
    () => [
      {
        title: "Task",
        key: "task",
        render: (_, task) => (
          <div className="min-w-0">
            <div className="text-sm font-semibold text-balance">{task.title}</div>
            <Text
              type="secondary"
              className="mt-1 block text-sm leading-6 [text-wrap:pretty]"
            >
              {task.description}
            </Text>
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 152,
        render: (_, task) => (
          <Tag
            color={getStatusTagColor(task.status)}
            className="m-0 rounded-full px-3 py-1 uppercase tracking-[0.16em]"
          >
            {STATUS_LABELS[task.status]}
          </Tag>
        ),
      },
      {
        title: "Updated",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 160,
        render: (value: string) => (
          <span className="text-sm tabular-nums">{formatDate(value)}</span>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 200,
        render: (_, task) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              shape="round"
              aria-label={`Edit task: ${task.title}`}
              className="min-h-10 px-4 active:scale-[0.96] transition-transform"
              onClick={() => handleStartEdit(task)}
            >
              Edit
            </Button>
            <Button
              danger
              type="primary"
              shape="round"
              aria-label={`Delete task: ${task.title}`}
              className="min-h-10 px-4 active:scale-[0.96] transition-transform"
              loading={state.deletingTaskId === task.id}
              onClick={() => handleDeleteIntent(task.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.deletingTaskId],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 xl:pb-0">
      <MobileHeader
        username={username}
        theme={state.theme}
        onToggleTheme={() =>
          setTheme(state.theme === "dark" ? "light" : "dark")
        }
        onLogout={handleLogout}
      />

      <div className="mx-auto grid w-full max-w-[1440px] gap-4 px-3 py-4 lg:gap-6 lg:px-6 lg:py-6 xl:grid-cols-[272px_minmax(0,1fr)]">
        {/* ── Sidebar (Desktop) ────────────────────────────────────────────── */}
        <aside className="hidden xl:sticky xl:top-6 xl:block xl:self-start">
          <SurfaceCard
            tone="subtle"
            className="overflow-hidden rounded-[28px] shadow-[var(--card-shadow)]"
            styles={{ body: { padding: 0 } }}
          >
            <SidebarBrand />
            <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
            <SidebarUser
              username={username}
              theme={state.theme}
              onToggleTheme={() =>
                setTheme(state.theme === "dark" ? "light" : "dark")
              }
              onLogout={handleLogout}
            />
          </SurfaceCard>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="min-w-0 space-y-4 lg:space-y-5">
          {activeTab === "overview" && (
            <>
              {/* ── Hero / header card ─────────────────────────────────────────── */}
              <SurfaceCard
                tone="subtle"
                className="overflow-hidden rounded-xl lg:rounded-[28px] shadow-[var(--card-shadow)]"
                styles={{ body: { padding: 0 } }}
              >
                <div className="bg-[linear-gradient(135deg,var(--surface-strong),var(--surface))] px-4 py-5 lg:px-8 lg:py-8">
                  {/* Title row */}
                  <div className="flex flex-col gap-5 lg:gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-2xl">
                      <Text
                        type="secondary"
                        className="text-[10px] lg:text-xs font-semibold uppercase tracking-[0.24em]"
                      >
                        Dashboard Overview
                      </Text>
                      <Title
                        level={1}
                        className="mt-1 lg:mt-2 !mb-0 !text-2xl text-balance lg:!text-3xl xl:!text-[42px]"
                      >
                        Professional task operations
                      </Title>
                      <Paragraph
                        type="secondary"
                        className="mt-2 lg:mt-3 mb-0 max-w-xl text-[13px] leading-relaxed lg:text-[15px] lg:leading-7 [text-wrap:pretty]"
                      >
                        A cleaner operations surface with stronger hierarchy,
                        better spacing rhythm, and responsive task management.
                      </Paragraph>
                    </div>

                    {/* Header actions */}
                    <div className="flex flex-col gap-3 xl:min-w-[300px] xl:items-end">
                      <div className="hidden rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm shadow-[inset_0_0_0_1px_var(--border)] xl:block">
                        <span className="text-[var(--muted)]">
                          Signed in as{" "}
                        </span>
                        <span className="font-medium">{username}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 lg:gap-3 xl:justify-end">
                        <Button
                          shape="round"
                          size="middle"
                          icon={<ReloadOutlined />}
                          aria-label="Refresh tasks"
                          className={`${BTN_BASE} h-9 lg:h-10 px-4 lg:px-5`}
                          onClick={() => void refreshTasks()}
                        >
                          Refresh
                        </Button>
                        <Button
                          type="primary"
                          shape="round"
                          size="middle"
                          icon={<PlusOutlined />}
                          className={`${BTN_BASE} h-9 lg:h-10 px-4 lg:px-5`}
                          onClick={handleStartCreate}
                        >
                          Create Task
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Overview mini-cards */}
                  <div className="mt-5 lg:mt-6 grid gap-3 lg:gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    {/* Current focus */}
                    <div className="rounded-xl lg:rounded-[24px] bg-[var(--surface-strong)] px-4 py-4 lg:px-6 lg:py-6 [box-shadow:inset_0_0_0_1px_var(--border),0_18px_48px_rgba(0,0,0,0.18)]">
                      <div className="text-[10px] lg:text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Current focus
                      </div>
                      <div className="mt-2 lg:mt-3 text-base lg:text-lg font-semibold leading-snug text-balance xl:text-xl">
                        {latestTask?.title ??
                          "No task matches the current view."}
                      </div>
                      <div className="mt-2 lg:mt-3 text-xs lg:text-sm leading-6 text-[var(--muted)]">
                        {latestTask
                          ? `${STATUS_LABELS[latestTask.status]} · Updated ${formatDate(latestTask.updatedAt)}`
                          : "Adjust the search or filter to bring tasks back into view."}
                      </div>
                    </div>

                    {/* Completion summary */}
                    <div className="rounded-xl lg:rounded-[24px] bg-[var(--surface-strong)] px-4 py-4 lg:px-6 lg:py-6 shadow-[inset_0_0_0_1px_var(--border)]">
                      <div className="text-[10px] lg:text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        View summary
                      </div>
                      <div className="mt-2 lg:mt-3 text-lg lg:text-xl font-semibold tabular-nums xl:text-2xl">
                        {countLabel}
                      </div>
                      <div className="mt-4 lg:mt-5">
                        <div className="mb-1.5 lg:mb-2 flex items-center justify-between text-xs lg:text-sm">
                          <span>Completion</span>
                          <span className="tabular-nums">
                            {completionRate}%
                          </span>
                        </div>
                        <Progress
                          percent={completionRate}
                          showInfo={false}
                          strokeColor={token.colorPrimary}
                          size="small"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SurfaceCard>

              {/* ── Stat summary cards ─────────────────────────────────────────── */}
              <section className="mt-4 grid gap-3 lg:gap-4 md:grid-cols-2 2xl:grid-cols-4">
                <StatCard
                  label="Total tasks"
                  value={`${state.tasks.length}`}
                  detail="Tracked across the board"
                  icon={UnorderedListOutlined}
                />
                <StatCard
                  label="Completed"
                  value={`${completedTasks}`}
                  detail={`${completionRate}% completion rate`}
                  icon={CheckCircleOutlined}
                />
                <StatCard
                  label="In progress"
                  value={`${inProgressTasks}`}
                  detail="Active execution right now"
                  icon={ClockCircleOutlined}
                />
                <StatCard
                  label="To do"
                  value={`${todoTasks}`}
                  detail="Ready to be picked up"
                  icon={AppstoreOutlined}
                />
              </section>

              {/* ── Activity + Distribution row ────────────────────────────────── */}
              <section className="grid gap-4 lg:gap-5 2xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                <WeeklyActivityChart activity={weeklyActivity} />
                <StatusDistribution
                  total={state.tasks.length}
                  completed={completedTasks}
                  inProgress={inProgressTasks}
                  todo={todoTasks}
                />
              </section>

              {/* ── Recent Tasks Section ───────────────────────────────────────── */}
              <SurfaceCard
                tone="subtle"
                className="rounded-xl lg:rounded-[28px] shadow-[var(--card-shadow)]"
                styles={{ body: { padding: 0 } }}
              >
                <div className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text
                        type="secondary"
                        className="text-[10px] lg:text-xs font-semibold uppercase tracking-[0.18em]"
                      >
                        Recently Updated
                      </Text>
                      <Title
                        level={4}
                        className="mt-1 lg:mt-2 !mb-1 text-balance xl:level-3"
                      >
                        Recent tasks
                      </Title>
                    </div>
                    <Button
                      type="link"
                      onClick={() => setActiveTab("tasks")}
                      className="p-0 h-auto font-medium text-xs lg:text-sm"
                    >
                      View all tasks
                    </Button>
                  </div>

                  <div className="mt-4 lg:mt-5 overflow-hidden rounded-xl lg:rounded-[24px] bg-[var(--surface-strong)] shadow-[inset_0_0_0_1px_var(--border)]">
                    <Table<Task>
                      rowKey="id"
                      columns={columns!.slice(0, 3)} // Show only essential columns
                      dataSource={recentTasks}
                      pagination={false}
                      loading={state.tasksStatus === "loading"}
                      scroll={{ x: 500 }}
                      locale={{
                        emptyText: (
                          <div className="py-8 lg:py-10 text-center">
                            <Text
                              type="secondary"
                              className="text-xs lg:text-sm"
                            >
                              No recent tasks
                            </Text>
                          </div>
                        ),
                      }}
                    />
                  </div>
                </div>
              </SurfaceCard>
            </>
          )}

          {activeTab === "tasks" && (
            <SurfaceCard
              tone="subtle"
              className="rounded-xl lg:rounded-[28px] shadow-[var(--card-shadow)]"
              styles={{ body: { padding: 0 } }}
            >
              <div className="p-4 lg:p-6">
                {/* Board header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <Text
                      type="secondary"
                      className="text-[10px] lg:text-xs font-semibold uppercase tracking-[0.18em]"
                    >
                      Tasks
                    </Text>
                    <Title
                      level={3}
                      className="mt-1 lg:mt-2 !mb-1 text-balance"
                    >
                      Work board
                    </Title>
                    <Text
                      type="secondary"
                      className="block text-xs lg:text-sm leading-6"
                    >
                      Search, filter, edit, and clear tasks from one table.
                    </Text>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:gap-3 lg:justify-end">
                    <div className="rounded-full bg-[var(--surface-strong)] px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm shadow-[inset_0_0_0_1px_var(--border)]">
                      <span className="tabular-nums">{countLabel}</span>
                    </div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      shape="round"
                      size="middle"
                      className={`${BTN_BASE} h-9 lg:h-10 px-4 lg:px-5`}
                      onClick={handleStartCreate}
                    >
                      Add Task
                    </Button>
                  </div>
                </div>

                {/* Search + filters */}
                <div className="mt-4 lg:mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <Input
                    size="large"
                    prefix={
                      <SearchOutlined
                        style={{ color: token.colorTextPlaceholder }}
                      />
                    }
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="min-h-11 lg:min-h-12 xl:max-w-md"
                  />

                  <div className="flex flex-wrap gap-1.5 lg:gap-2 xl:justify-end" role="group" aria-label="Filter tasks by status">
                    {FILTER_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        shape="round"
                        size="small"
                        type={
                          activeFilter === opt.value ? "primary" : "default"
                        }
                        aria-pressed={activeFilter === opt.value}
                        className="min-h-8 lg:min-h-9 px-3 lg:px-4 text-[13px] active:scale-[0.96] transition-transform"
                        onClick={() => setActiveFilter(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="mt-4 lg:mt-5 overflow-hidden rounded-xl lg:rounded-[24px] bg-[var(--surface-strong)] shadow-[inset_0_0_0_1px_var(--border)]">
                  <Table<Task>
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredTasks}
                    loading={state.tasksStatus === "loading"}
                    pagination={{
                      pageSize: 8,
                      showSizeChanger: false,
                      hideOnSinglePage: filteredTasks.length <= 8,
                    }}
                    locale={{
                      emptyText: (
                        <div className="py-12 lg:py-14 text-center">
                          <Title level={4} className="!mb-1.5 lg:!mb-2">
                            No tasks found
                          </Title>
                          <Text type="secondary" className="text-xs lg:text-sm">
                            Try adjusting your search or filters, or create a
                            new task.
                          </Text>
                        </div>
                      ),
                    }}
                    scroll={{ x: 760 }}
                  />
                </div>
              </div>
            </SurfaceCard>
          )}

          {activeTab === "progress" && (
            <SurfaceCard
              tone="subtle"
              className="rounded-xl lg:rounded-[28px] shadow-[var(--card-shadow)]"
              styles={{ body: { padding: 24 } }}
            >
              <Title level={4} className="lg:level-3">
                Progress Tracking
              </Title>
              <Text type="secondary" className="text-xs lg:text-sm">
                This section will show advanced progress metrics.
              </Text>
            </SurfaceCard>
          )}

          {activeTab === "settings" && (
            <SurfaceCard
              tone="subtle"
              className="rounded-xl lg:rounded-[28px] shadow-[var(--card-shadow)]"
              styles={{ body: { padding: 24 } }}
            >
              <Title level={4} className="lg:level-3">
                Settings
              </Title>
              <Text type="secondary" className="text-xs lg:text-sm">
                Dashboard and account settings.
              </Text>
            </SurfaceCard>
          )}

          {/* ── Error alert ────────────────────────────────────────────────── */}
          {state.error && (
            <Alert
              message={state.error}
              type="error"
              showIcon
              closable
              onClose={clearError}
              className="shadow-[var(--card-shadow)]"
            />
          )}
        </div>
        {/* end main content */}
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
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
