"use client";

import type { FC } from "react";
import {
  AppstoreOutlined,
  BarChartOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

export type SidebarTabKey = "overview" | "tasks" | "progress" | "settings";

const SIDEBAR_ITEMS: Array<{ key: SidebarTabKey; label: string; icon: FC<{ className?: string }> }> = [
  { key: "overview", label: "Overview", icon: AppstoreOutlined },
  { key: "tasks", label: "Tasks", icon: UnorderedListOutlined },
  { key: "progress", label: "Progress", icon: BarChartOutlined },
  { key: "settings", label: "Settings", icon: SettingOutlined },
];

interface SidebarNavProps {
  activeTab: SidebarTabKey;
  onTabChange: (key: SidebarTabKey) => void;
}

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  return (
    <nav className="grid gap-1.5 px-3 py-3">
      {SIDEBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onTabChange(item.key)}
            className={[
              "flex min-h-11 items-center gap-3 rounded-2xl px-4 text-left text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--foreground)] text-[var(--background)] shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
                : "text-[var(--foreground)] hover:bg-[var(--accent-soft)]",
            ].join(" ")}
          >
            <Icon className="text-base" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
