import type { Session, Task, TaskStatus } from "./types";

export const STORAGE_KEY = "pulse-tasks.store.v1";
export const MOCK_API_ORIGIN = "https://pulse.mock";
export const MOCK_TOKEN = "pulse-demo-token";
export const NETWORK_DELAY_MS = 10;

export const DEMO_CREDENTIALS = {
  username: "test",
  password: "test123",
} as const;

export const DEMO_SESSION: Session = {
  token: MOCK_TOKEN,
  username: DEMO_CREDENTIALS.username,
};

export const STATUS_OPTIONS: TaskStatus[] = ["todo", "in-progress", "done"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

export const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-[#eaf0ff] text-[#3756a3] dark:bg-[#22304d] dark:text-[#b9cbff]",
  "in-progress": "bg-[#fff0dc] text-[#9b5512] dark:bg-[#43311d] dark:text-[#ffc58d]",
  done: "bg-[#e3f6e8] text-[#2f7c47] dark:bg-[#1b3d27] dark:text-[#9fe0b1]",
};

export const DEFAULT_TASKS: Task[] = [
  {
    id: "seed-1",
    title: "Finalize onboarding flow copy",
    description: "Review the first-run screens, shorten helper text, and lock the handoff before QA starts.",
    status: "in-progress",
    createdAt: "2026-05-12T09:00:00.000Z",
    updatedAt: "2026-05-15T16:30:00.000Z",
  },
  {
    id: "seed-2",
    title: "Prepare weekly stakeholder summary",
    description: "Pull blockers from the board, summarize delivery risk, and ship the Friday note before 5 PM.",
    status: "todo",
    createdAt: "2026-05-11T10:15:00.000Z",
    updatedAt: "2026-05-14T14:00:00.000Z",
  },
  {
    id: "seed-3",
    title: "Archive resolved support escalations",
    description: "Move completed incidents into the resolved log and capture any follow-up actions for ops.",
    status: "done",
    createdAt: "2026-05-09T08:20:00.000Z",
    updatedAt: "2026-05-13T12:10:00.000Z",
  },
];
