"use client";

import { Progress, Typography, theme } from "antd";
import { SurfaceCard } from "@/components/ui/surface-card";

const { Text } = Typography;

interface StatusDistributionProps {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
}

export function StatusDistribution({
  total,
  completed,
  inProgress,
  todo,
}: StatusDistributionProps) {
  const { token } = theme.useToken();

  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  const rows = [
    {
      label: "Done",
      count: completed,
      pct: pct(completed),
      color: token.colorSuccess,
    },
    {
      label: "In progress",
      count: inProgress,
      pct: pct(inProgress),
      color: token.colorInfo,
    },
    {
      label: "To do",
      count: todo,
      pct: pct(todo),
      color: token.colorTextTertiary,
    },
  ];

  return (
    <SurfaceCard
      tone="subtle"
      className="rounded-xl lg:rounded-[28px] shadow-[var(--card-shadow)]"
      styles={{ body: { padding: 0, height: "100%" } }}
    >
      <div className="p-4 lg:p-6">
        <Text
          type="secondary"
          className="text-[10px] lg:text-xs font-semibold uppercase tracking-[0.18em]"
        >
          Status distribution
        </Text>

        <div className="mt-4 lg:mt-5 space-y-4 lg:space-y-5">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 lg:mb-2 flex items-center justify-between text-xs lg:text-sm">
                <span>{row.label}</span>
                <span className="tabular-nums">{row.count}</span>
              </div>
              <Progress
                percent={row.pct}
                showInfo={false}
                strokeColor={row.color}
                size="small"
              />
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}
