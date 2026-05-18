"use client";

import { Typography } from "antd";
import { SurfaceCard } from "@/components/ui/surface-card";

const { Title, Text } = Typography;

interface WeeklyActivityChartProps {
  activity: { key: string; label: string; count: number }[];
}

export function WeeklyActivityChart({ activity }: WeeklyActivityChartProps) {
  const peak = Math.max(1, ...activity.map((e) => e.count));

  return (
    <SurfaceCard
      tone="subtle"
      className="rounded-xl lg:rounded-[28px] shadow-[var(--card-shadow)]"
      styles={{ body: { padding: 0 } }}
    >
      <div className="grid grid-rows-[auto_1fr] gap-4 lg:gap-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-4">
          <div>
            <Text
              type="secondary"
              className="text-[10px] lg:text-xs font-semibold uppercase tracking-[0.18em]"
            >
              Weekly activity
            </Text>
            <Title level={4} className="mt-1 lg:mt-2 !mb-0 text-balance xl:level-3">
              Task updates over the last 7 days
            </Title>
          </div>
          <Text type="secondary" className="shrink-0 text-xs lg:text-sm">
            Based on updates
          </Text>
        </div>

        {/* Bars */}
        <div className="grid grid-cols-7 gap-2 lg:gap-3">
          {activity.map((entry) => (
            <div key={entry.key} className="grid grid-rows-[1fr_auto] gap-2 lg:gap-3">
              <div className="flex min-h-32 lg:min-h-40 w-full items-end rounded-xl lg:rounded-[24px] bg-[var(--surface-strong)] p-1.5 lg:p-3 shadow-[inset_0_0_0_1px_var(--border)]">
                <div
                  className="w-full rounded-lg lg:rounded-2xl bg-[var(--foreground)] transition-[height] duration-300"
                  style={{
                    height: `${Math.max(12, (entry.count / peak) * 100)}%`,
                    opacity: entry.count === 0 ? 0.18 : 1,
                  }}
                />
              </div>
              <div className="text-center">
                <div className="text-[10px] lg:text-sm font-medium">{entry.label}</div>
                <div className="text-[10px] tabular-nums text-[var(--muted)]">
                  {entry.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}
