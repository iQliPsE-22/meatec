import {
  DEMO_CREDENTIALS,
  DEMO_SESSION,
  MOCK_API_ORIGIN,
  MOCK_TOKEN,
  NETWORK_DELAY_MS,
  STATUS_OPTIONS,
} from "./constants";
import { loadSnapshot, saveSnapshot } from "./storage";
import type { Credentials, PersistedSnapshot, Task, TaskInput } from "./types";

function delay(duration = NETWORK_DELAY_MS) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function createResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function getSnapshot() {
  return loadSnapshot();
}

function persistSnapshot(nextSnapshot: PersistedSnapshot) {
  saveSnapshot(nextSnapshot);
}

async function parseBody<T>(body: BodyInit | null | undefined): Promise<T> {
  if (!body || typeof body !== "string") {
    return {} as T;
  }

  return JSON.parse(body) as T;
}

function isAuthorized(init?: RequestInit) {
  const headers = new Headers(init?.headers);
  return headers.get("Authorization") === `Bearer ${MOCK_TOKEN}`;
}

function validateTaskInput(input: TaskInput) {
  if (input.title.trim().length < 3) {
    return "Title must be at least 3 characters.";
  }

  if (input.description.trim().length < 10) {
    return "Description must be at least 10 characters.";
  }

  if (!STATUS_OPTIONS.includes(input.status)) {
    return "Status is invalid.";
  }

  return null;
}

function buildTask(input: TaskInput) {
  const timestamp = new Date().toISOString();

  return {
    id: `task-${Date.now()}`,
    title: input.title.trim(),
    description: input.description.trim(),
    status: input.status,
    createdAt: timestamp,
    updatedAt: timestamp,
  } satisfies Task;
}

function updateTask(existingTask: Task, input: TaskInput) {
  return {
    ...existingTask,
    title: input.title.trim(),
    description: input.description.trim(),
    status: input.status,
    updatedAt: new Date().toISOString(),
  } satisfies Task;
}

export async function mockApiFetch(input: string, init?: RequestInit) {
  await delay();

  const url = new URL(input, MOCK_API_ORIGIN);
  const snapshot = getSnapshot();

  if (url.pathname === "/login" && init?.method === "POST") {
    const credentials = await parseBody<Credentials>(init.body);

    if (
      credentials.username === DEMO_CREDENTIALS.username &&
      credentials.password === DEMO_CREDENTIALS.password
    ) {
      return createResponse(200, DEMO_SESSION);
    }

    return createResponse(401, {
      message: "Invalid username or password. Use the seeded demo account.",
    });
  }

  if (!isAuthorized(init)) {
    return createResponse(401, { message: "Unauthorized request." });
  }

  if (url.pathname === "/tasks" && (!init?.method || init.method === "GET")) {
    return createResponse(200, snapshot.tasks);
  }

  if (url.pathname === "/tasks" && init?.method === "POST") {
    const payload = await parseBody<TaskInput>(init.body);
    const validationMessage = validateTaskInput(payload);

    if (validationMessage) {
      return createResponse(400, { message: validationMessage });
    }

    const nextTask = buildTask(payload);
    persistSnapshot({ ...snapshot, tasks: [nextTask, ...snapshot.tasks] });

    return createResponse(201, nextTask);
  }

  if (url.pathname.startsWith("/tasks/") && init?.method === "PUT") {
    const taskId = url.pathname.split("/").at(-1);
    const payload = await parseBody<TaskInput>(init.body);
    const validationMessage = validateTaskInput(payload);

    if (validationMessage) {
      return createResponse(400, { message: validationMessage });
    }

    const currentTask = snapshot.tasks.find((task) => task.id === taskId);

    if (!currentTask) {
      return createResponse(404, { message: "Task not found." });
    }

    const nextTask = updateTask(currentTask, payload);
    persistSnapshot({
      ...snapshot,
      tasks: snapshot.tasks.map((task) => (task.id === taskId ? nextTask : task)),
    });

    return createResponse(200, nextTask);
  }

  if (url.pathname.startsWith("/tasks/") && init?.method === "DELETE") {
    const taskId = url.pathname.split("/").at(-1);
    const taskExists = snapshot.tasks.some((task) => task.id === taskId);

    if (!taskExists) {
      return createResponse(404, { message: "Task not found." });
    }

    persistSnapshot({
      ...snapshot,
      tasks: snapshot.tasks.filter((task) => task.id !== taskId),
    });

    return createResponse(200, { success: true });
  }

  return createResponse(404, { message: "Mock endpoint not found." });
}
