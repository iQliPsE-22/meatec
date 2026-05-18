import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockApiFetch } from "./mock-api";
import { DEMO_CREDENTIALS, DEMO_SESSION, MOCK_TOKEN } from "./constants";
import { STORAGE_KEY } from "./constants";

describe("mock-api", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  const authHeader = { Authorization: `Bearer ${MOCK_TOKEN}` };

  it("handles login successfully", async () => {
    const promise = mockApiFetch("/login", {
      method: "POST",
      body: JSON.stringify(DEMO_CREDENTIALS),
    });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(DEMO_SESSION);
  });

  it("handles failed login", async () => {
    const promise = mockApiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ username: "wrong", password: "wrong" }),
    });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(401);
  });

  it("rejects unauthorized requests", async () => {
    const promise = mockApiFetch("/tasks");
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(401);
  });

  it("returns tasks", async () => {
    const promise = mockApiFetch("/tasks", { headers: authHeader });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(200);
    const tasks = await response.json();
    expect(Array.isArray(tasks)).toBe(true);
  });

  it("creates a task", async () => {
    const newTask = { title: "New Task", description: "This is a new task description", status: "todo" };
    const promise = mockApiFetch("/tasks", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify(newTask),
    });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(201);
    const createdTask = await response.json();
    expect(createdTask.title).toBe(newTask.title);
  });

  it("validates task input on creation", async () => {
    const promise = mockApiFetch("/tasks", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ title: "sh", description: "too short", status: "todo" }),
    });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(400);
  });

  it("updates a task", async () => {
    // First get a task ID
    const getPromise = mockApiFetch("/tasks", { headers: authHeader });
    vi.runAllTimers();
    const tasks = await (await getPromise).json();
    const taskId = tasks[0].id;

    const update = { title: "Updated Title", description: "Updated description length is enough", status: "done" };
    const promise = mockApiFetch(`/tasks/${taskId}`, {
      method: "PUT",
      headers: authHeader,
      body: JSON.stringify(update),
    });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(200);
    expect((await response.json()).title).toBe(update.title);
  });

  it("returns 404 when updating non-existent task", async () => {
    const promise = mockApiFetch("/tasks/non-existent", {
      method: "PUT",
      headers: authHeader,
      body: JSON.stringify({ title: "Valid Title", description: "Valid description length is enough", status: "done" }),
    });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(404);
  });

  it("deletes a task", async () => {
    const getPromise = mockApiFetch("/tasks", { headers: authHeader });
    vi.runAllTimers();
    const tasks = await (await getPromise).json();
    const taskId = tasks[0].id;

    const promise = mockApiFetch(`/tasks/${taskId}`, {
      method: "DELETE",
      headers: authHeader,
    });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(200);
  });

  it("returns 404 when deleting non-existent task", async () => {
    const promise = mockApiFetch("/tasks/non-existent", {
      method: "DELETE",
      headers: authHeader,
    });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(404);
  });

  it("returns 404 for unknown endpoints", async () => {
    const promise = mockApiFetch("/unknown", { headers: authHeader });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(404);
  });

  it("handles empty body gracefully", async () => {
      const promise = mockApiFetch("/login", {
          method: "POST",
          body: undefined
      });
      vi.runAllTimers();
      const response = await promise;
      expect(response.status).toBe(401);
  });

  it("validates task status", async () => {
    const promise = mockApiFetch("/tasks", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ title: "Valid Title", description: "Valid description length is enough", status: "invalid" }),
    });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(400);
  });

  it("validates task description length", async () => {
    const promise = mockApiFetch("/tasks", {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ title: "Valid Title", description: "Short", status: "todo" }),
    });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(400);
  });

  it("validates task input on update", async () => {
    const getPromise = mockApiFetch("/tasks", { headers: authHeader });
    vi.runAllTimers();
    const tasks = await (await getPromise).json();
    const taskId = tasks[0].id;

    const promise = mockApiFetch(`/tasks/${taskId}`, {
      method: "PUT",
      headers: authHeader,
      body: JSON.stringify({ title: "sh", description: "too short", status: "todo" }),
    });
    vi.runAllTimers();
    const response = await promise;
    expect(response.status).toBe(400);
  });
});
