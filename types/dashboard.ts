import type { TaskStatus } from "./app";

export type DashboardFilterValue = "all" | TaskStatus;

export type DashboardFilterOption = {
  label: string;
  value: DashboardFilterValue;
};

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};
