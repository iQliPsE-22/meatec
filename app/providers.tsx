"use client";

import type { ReactNode } from "react";
import { AppStateProvider } from "@/lib/app-state";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <AppStateProvider>{children}</AppStateProvider>;
}
