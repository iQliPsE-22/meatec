"use client";

import { Avatar, Button, Typography } from "antd";

const { Text } = Typography;

/** Shared Tailwind classes reused across multiple buttons */
const BTN_BASE =
  "min-h-10 px-5 text-[14px] font-medium active:scale-[0.96] transition-transform";

interface SidebarUserProps {
  username: string;
  theme: string;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function SidebarUser({
  username,
  theme: currentTheme,
  onToggleTheme,
  onLogout,
}: SidebarUserProps) {
  return (
    <div className="border-t border-[var(--border)] px-5 py-5">
      <div className="rounded-[24px] bg-[var(--surface-strong)] p-4 shadow-[inset_0_0_0_1px_var(--border)]">
        <div className="flex items-center gap-3">
          <Avatar
            size={42}
            className="bg-[var(--foreground)] text-[var(--background)]"
          >
            {username.slice(0, 1).toUpperCase()}
          </Avatar>
          <div className="min-w-0">
            <Text
              type="secondary"
              className="block text-xs uppercase tracking-[0.16em]"
            >
              Signed in as
            </Text>
            <div className="truncate text-sm font-semibold">{username}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <Button
            shape="round"
            size="middle"
            className={`${BTN_BASE} w-full`}
            onClick={onToggleTheme}
          >
            {currentTheme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button
            danger
            shape="round"
            size="middle"
            className={`${BTN_BASE} w-full`}
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
