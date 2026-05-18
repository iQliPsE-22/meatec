"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { mockApiFetch } from "./mock-api";
import { loadSnapshot, saveSnapshot } from "./storage";
import type {
  AppState,
  Credentials,
  PersistedSnapshot,
  TaskInput,
  Theme,
} from "@/types";

type AppStateContextValue = {
  state: AppState;
  login: (credentials: Credentials) => Promise<boolean>;
  logout: () => void;
  refreshTasks: () => Promise<void>;
  saveTask: (values: TaskInput, taskId?: string) => Promise<boolean>;
  removeTask: (taskId: string) => Promise<void>;
  setTheme: (theme: Theme) => void;
  clearError: () => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

type AppStateProviderProps = {
  children: React.ReactNode;
};

function createInitialState(): AppState {
  const snapshot = loadSnapshot();

  return {
    theme: snapshot.theme,
    session: snapshot.session,
    tasks: snapshot.tasks,
    authStatus: "idle",
    tasksStatus: "idle",
    formStatus: "idle",
    deletingTaskId: null,
    error: null,
  };
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, setState] = useState<AppState>(createInitialState);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  useEffect(() => {
    const nextSnapshot: PersistedSnapshot = {
      version: 1,
      theme: state.theme,
      session: state.session,
      tasks: state.tasks,
    };

    saveSnapshot(nextSnapshot);
  }, [state.session, state.tasks, state.theme]);

  function commit(recipe: (current: AppState) => AppState) {
    setState((current) => recipe(current));
  }

  async function login(credentials: Credentials) {
    commit((current) => ({ ...current, authStatus: "loading", error: null }));

    const response = await mockApiFetch("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    const payload = (await response.json()) as unknown;

    if (!response.ok) {
      commit((current) => ({
        ...current,
        authStatus: "idle",
        error: getErrorMessage(payload, "Unable to sign in."),
      }));
      return false;
    }

    commit((current) => ({
      ...current,
      authStatus: "idle",
      session: payload as AppState["session"],
      error: null,
    }));
    return true;
  }

  function logout() {
    const snapshot = loadSnapshot();

    commit((current) => ({
      ...current,
      session: null,
      tasks: snapshot.tasks,
      error: null,
    }));
  }

  async function refreshTasks() {
    if (!state.session) {
      return;
    }

    commit((current) => ({ ...current, tasksStatus: "loading", error: null }));

    const response = await mockApiFetch("/tasks", {
      headers: {
        Authorization: `Bearer ${state.session.token}`,
      },
    });
    const payload = (await response.json()) as unknown;

    if (!response.ok) {
      commit((current) => ({
        ...current,
        tasksStatus: "idle",
        error: getErrorMessage(payload, "Unable to load tasks."),
      }));
      return;
    }

    commit((current) => ({
      ...current,
      tasksStatus: "idle",
      tasks: payload as AppState["tasks"],
      error: null,
    }));
  }

  async function saveTask(values: TaskInput, taskId?: string) {
    if (!state.session) {
      return false;
    }

    commit((current) => ({ ...current, formStatus: "saving", error: null }));

    const response = await mockApiFetch(taskId ? `/tasks/${taskId}` : "/tasks", {
      method: taskId ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${state.session.token}`,
      },
      body: JSON.stringify(values),
    });
    const payload = (await response.json()) as unknown;

    if (!response.ok) {
      commit((current) => ({
        ...current,
        formStatus: "idle",
        error: getErrorMessage(payload, "Unable to save task."),
      }));
      return false;
    }

    commit((current) => {
      const savedTask = payload as AppState["tasks"][number];
      const nextTasks = taskId
        ? current.tasks.map((task) => (task.id === taskId ? savedTask : task))
        : [savedTask, ...current.tasks];

      return {
        ...current,
        formStatus: "idle",
        tasks: nextTasks,
        error: null,
      };
    });
    return true;
  }

  async function removeTask(taskId: string) {
    if (!state.session) {
      return;
    }

    commit((current) => ({ ...current, deletingTaskId: taskId, error: null }));

    const response = await mockApiFetch(`/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${state.session.token}`,
      },
    });
    const payload = (await response.json()) as unknown;

    if (!response.ok) {
      commit((current) => ({
        ...current,
        deletingTaskId: null,
        error: getErrorMessage(payload, "Unable to delete task."),
      }));
      return;
    }

    commit((current) => ({
      ...current,
      deletingTaskId: null,
      tasks: current.tasks.filter((task) => task.id !== taskId),
      error: null,
    }));
  }

  function setTheme(theme: Theme) {
    commit((current) => ({ ...current, theme }));
  }

  function clearError() {
    commit((current) => ({ ...current, error: null }));
  }

  const value: AppStateContextValue = {
    state,
    login,
    logout,
    refreshTasks,
    saveTask,
    removeTask,
    setTheme,
    clearError,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider.");
  }

  return context;
}
