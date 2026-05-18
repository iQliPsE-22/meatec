"use client";

import type { ReactNode } from "react";
import { AppStateProvider, useAppState } from "@/lib/app-state";
import { ConfigProvider, theme } from "antd";

type ProvidersProps = {
  children: ReactNode;
};

function ThemeProvider({ children }: { children: ReactNode }) {
  const { state } = useAppState();
  const isDark = state.theme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: isDark ? "#f3f3f3" : "#111111",
          colorBgBase: isDark ? "#050505" : "#f5f5f5",
          colorTextBase: isDark ? "#f5f5f5" : "#111111",
          colorTextLightSolid: isDark ? "#0a0a0a" : "#f5f5f5",
          colorBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(17,17,17,0.08)",
          colorBorderSecondary: isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(17,17,17,0.06)",
          borderRadius: 18,
          fontFamily: "var(--font-sans)",
        },
        components: {
          Button: {
            primaryShadow: "none",
            dangerShadow: "none",
          },
          Input: {
            activeShadow: "none",
            hoverBorderColor: isDark ? "rgba(255,255,255,0.18)" : "#111111",
          },
          Card: {
            headerBg: "transparent",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AppStateProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AppStateProvider>
  );
}
