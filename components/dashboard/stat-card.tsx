"use client";

import React from "react";
import { Typography } from "antd";
import { SurfaceCard } from "@/components/ui/surface-card";

const { Text, Title } = Typography;

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
}

export function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <SurfaceCard
      tone="subtle"
      className="rounded-xl lg:rounded-[28px] shadow-[var(--card-shadow)]"
      styles={{ body: { padding: "16px 20px" } }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 lg:space-y-1.5">
          <Text
            type="secondary"
            className="text-[10px] lg:text-xs font-semibold uppercase tracking-[0.18em]"
          >
            {label}
          </Text>
          <div className="flex items-baseline gap-2">
            <Title level={2} className="!m-0 !text-xl lg:!text-2xl font-bold">
              {value}
            </Title>
          </div>
          <Text type="secondary" className="block text-[11px] lg:text-xs">
            {detail}
          </Text>
        </div>
        <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl lg:rounded-2xl bg-white/50 dark:bg-black/10 shadow-sm">
          <Icon className="text-lg lg:text-xl text-primary" />
        </div>
      </div>
    </SurfaceCard>
  );
}
