import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_CREDENTIALS, DEMO_SESSION, DEFAULT_TASKS } from "@/lib/constants";
import { mockApiFetch } from "@/lib/mock-api";
import { clearSnapshot, loadSnapshot } from "@/lib/storage";

describe("mockApiFetch", () => {
  beforeEach(() => {
    clearSnapshot();
  });

  it("authenticates the seeded user", async () => {
    const response = await mockApiFetch("/login", {
      method: "POST",
      body: JSON.stringify(DEMO_CREDENTIALS),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(DEMO_SESSION);
  });

  it("rejects invalid credentials", async () => {
    const response = await mockApiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ username: "bad", password: "creds" }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Invalid username or password. Use the seeded demo account.",
    });
  });

  it("handles missing request bodies", async () => {
    const response = await mockApiFetch("/login", {
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  it("rejects unauthorized task requests", async () => {
    const response = await mockApiFetch("/tasks");

    expect(response.status).toBe(401);
  });

  it("returns persisted tasks for authorized requests", async () => {
    const response = await mockApiFetch("/tasks", {
      headers: {
        Authorization: `Bearer ${DEMO_SESSION.token}`,
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(DEFAULT_TASKS);
  });

  it("creates, updates, and deletes tasks", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-17T10:00:00.000Z"));

    const createPromise = mockApiFetch("/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEMO_SESSION.token}`,
      },
      body: JSON.stringify({
        title: "  New launch prep  ",
        description: "  Coordinate rollout notes and assign QA owners.  ",
        status: "todo",
      }),
    });

    await vi.runAllTimersAsync();
    const createResponse = await createPromise;
    const createdTask = (await createResponse.json()) as { id: string; title: string };

    expect(createResponse.status).toBe(201);
    expect(createdTask.title).toBe("New launch prep");

    const updatePromise = mockApiFetch(`/tasks/${createdTask.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${DEMO_SESSION.token}`,
      },
      body: JSON.stringify({
        title: "Updated launch prep",
        description: "Coordinate rollout notes and confirm the release train.",
        status: "done",
      }),
    });

    await vi.runAllTimersAsync();
    const updateResponse = await updatePromise;
    expect(updateResponse.status).toBe(200);

    const deletePromise = mockApiFetch(`/tasks/${createdTask.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${DEMO_SESSION.token}`,
      },
    });

    await vi.runAllTimersAsync();
    const deleteResponse = await deletePromise;
    expect(deleteResponse.status).toBe(200);
    expect(loadSnapshot().tasks).toEqual(DEFAULT_TASKS);

    vi.useRealTimers();
  });

  it("validates new tasks", async () => {
    const response = await mockApiFetch("/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEMO_SESSION.token}`,
      },
      body: JSON.stringify({
        title: "No",
        description: "Short",
        status: "todo",
      }),
    });

    expect(response.status).toBe(400);
  });

  it("validates descriptions and statuses", async () => {
    const descriptionResponse = await mockApiFetch("/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEMO_SESSION.token}`,
      },
      body: JSON.stringify({
        title: "Valid title",
        description: "Short",
        status: "todo",
      }),
    });

    const statusResponse = await mockApiFetch("/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEMO_SESSION.token}`,
      },
      body: JSON.stringify({
        title: "Valid title",
        description: "A valid description for coverage.",
        status: "blocked",
      }),
    });

    expect(descriptionResponse.status).toBe(400);
    expect(statusResponse.status).toBe(400);
  });

  it("handles missing tasks during update and delete", async () => {
    const updateResponse = await mockApiFetch("/tasks/missing", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${DEMO_SESSION.token}`,
      },
      body: JSON.stringify({
        title: "A valid title",
        description: "A valid description for coverage.",
        status: "todo",
      }),
    });

    const deleteResponse = await mockApiFetch("/tasks/missing", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${DEMO_SESSION.token}`,
      },
    });

    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
  });

  it("returns 404 for unknown endpoints", async () => {
    const response = await mockApiFetch("/unknown", {
      headers: {
        Authorization: `Bearer ${DEMO_SESSION.token}`,
      },
    });

    expect(response.status).toBe(404);
  });
});
