"use client";

import type { FC } from "react";
import {
  AppstoreOutlined,
  BarChartOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import type { SidebarTabKey } from "./sidebar-nav";

const NAV_ITEMS: Array<{ key: SidebarTabKey; label: string; icon: FC<{ className?: string }> }> = [
  { key: "overview", label: "Overview", icon: AppstoreOutlined },
  { key: "tasks", label: "Tasks", icon: UnorderedListOutlined },
  { key: "progress", label: "Stats", icon: BarChartOutlined },
  { key: "settings", label: "Settings", icon: SettingOutlined },
];

interface MobileNavProps {
  activeTab: SidebarTabKey;
  onTabChange: (key: SidebarTabKey) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--background)] px-2 pb-safe-offset-2 pt-2 xl:hidden">
      <div className="flex items-center justify-around gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={[
                "flex flex-1 flex-col items-center gap-1 py-2 transition-all active:scale-95",
                isActive
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)]",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                  isActive ? "bg-[var(--accent-soft)]" : "bg-transparent",
                ].join(" ")}
              >
                <Icon className="text-xl" />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
