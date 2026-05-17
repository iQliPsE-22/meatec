import { render } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { DEMO_SESSION } from "@/lib/constants";
import { saveSnapshot } from "@/lib/storage";
import type { PersistedSnapshot } from "@/lib/types";

export function renderWithProviders(ui: React.ReactElement) {
  return render(<Providers>{ui}</Providers>);
}

export function seedSnapshot(overrides: Partial<PersistedSnapshot> = {}) {
  saveSnapshot({
    version: 1,
    theme: "light",
    session: null,
    tasks: [],
    ...overrides,
  });
}

export function seedAuthenticatedSnapshot(overrides: Partial<PersistedSnapshot> = {}) {
  seedSnapshot({
    session: DEMO_SESSION,
    ...overrides,
  });
}
