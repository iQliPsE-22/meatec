import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";
import { AppStateProvider } from "@/lib/app-state";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe("HomePage", () => {
  it("renders LoginScreen", () => {
    render(<HomePage />, { wrapper });
    expect(screen.getByRole("heading", { name: /Sign In/i })).toBeDefined();
  });
});
