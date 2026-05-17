import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { router } from "./__tests__/router-mock";

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

afterEach(() => {
  cleanup();
  router.push.mockReset();
  router.replace.mockReset();
  window.localStorage.clear();
  document.documentElement.dataset.theme = "light";
});
