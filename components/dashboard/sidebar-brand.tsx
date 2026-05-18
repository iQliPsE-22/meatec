"use client";

import { ThunderboltOutlined } from "@ant-design/icons";
import { Typography } from "antd";

const { Text } = Typography;

export function SidebarBrand() {
  return (
    <div className="border-b border-[var(--border)] px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--foreground)] text-[var(--background)]">
          <ThunderboltOutlined className="text-lg" />
        </div>
        <div>
          <div className="text-base font-semibold tracking-tight">MeaTech</div>
          <Text type="secondary" className="text-sm">
            Task command center
          </Text>
        </div>
      </div>
    </div>
  );
}
