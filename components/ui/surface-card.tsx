"use client";

import type { CSSProperties } from "react";
import { Card, type CardProps, theme } from "antd";

type SurfaceCardStyles = {
  root?: CSSProperties;
  header?: CSSProperties;
  body?: CSSProperties;
  extra?: CSSProperties;
  title?: CSSProperties;
  actions?: CSSProperties;
  cover?: CSSProperties;
};

type SurfaceCardProps = CardProps & {
  tone?: "strong" | "subtle";
  styles?: SurfaceCardStyles;
};

export function SurfaceCard({
  children,
  className,
  tone = "strong",
  styles,
  ...props
}: SurfaceCardProps) {
  const { token } = theme.useToken();

  return (
    <Card
      variant="borderless"
      className={className}
      styles={{
        ...styles,
        body: {
          padding: 20,
          backgroundColor:
            tone === "strong" ? "var(--surface-strong)" : "var(--surface)",
          boxShadow: `inset 0 0 0 1px ${token.colorBorderSecondary}`,
          ...(styles?.body ?? {}),
        },
      }}
      {...props}
    >
      {children}
    </Card>
  );
}
