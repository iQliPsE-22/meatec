export type Theme = "light" | "dark";

export type TaskStatus = "todo" | "in-progress" | "done";

export type TaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
};

export type Task = TaskInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  token: string;
  username: string;
};

export type Credentials = {
  username: string;
  password: string;
};

export type PersistedSnapshot = {
  version: 1;
  theme: Theme;
  session: Session | null;
  tasks: Task[];
};

export type AppState = {
  theme: Theme;
  session: Session | null;
  tasks: Task[];
  authStatus: "idle" | "loading";
  tasksStatus: "idle" | "loading";
  formStatus: "idle" | "saving";
  deletingTaskId: string | null;
  error: string | null;
};
