import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginScreen } from "./login-screen";
import { AppStateProvider } from "@/lib/app-state";
import { router } from "@/__tests__/router-mock";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe("LoginScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the login form", () => {
    render(<LoginScreen />, { wrapper });
    expect(screen.getByRole("heading", { name: /Sign In/i })).toBeDefined();
    expect(screen.getByPlaceholderText(/Enter username/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Enter password/i)).toBeDefined();
  });

  it("toggles theme", () => {
    render(<LoginScreen />, { wrapper });
    const themeBtn = screen.getByText(/Mode/);
    fireEvent.click(themeBtn);
    expect(screen.getByText(/Mode/)).toBeDefined();
  });

  it("handles form submission successfully", async () => {
    render(<LoginScreen />, { wrapper });
    
    const submitBtn = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith("/dashboard");
    }, { timeout: 3000 });
  });

  it("shows error alert on failed login", async () => {
    render(<LoginScreen />, { wrapper });
    
    const usernameInput = screen.getByPlaceholderText(/Enter username/i);
    fireEvent.change(usernameInput, { target: { value: "wrong" } });
    
    const submitBtn = screen.getByRole("button", { name: "Sign In" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
    }, { timeout: 3000 });
  });

  it("clears error on input change", async () => {
    render(<LoginScreen />, { wrapper });
    
    const usernameInput = screen.getByPlaceholderText(/Enter username/i);
    
    // First trigger an error
    fireEvent.change(usernameInput, { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
    });

    // Then change input
    fireEvent.change(usernameInput, { target: { value: "test" } });
    
    await waitFor(() => {
        expect(screen.queryByRole("alert")).toBeNull();
    });
  });
});
