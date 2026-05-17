import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import HomePage from "@/app/page";
import { LoginScreen } from "@/components/login-screen";
import { clearSnapshot } from "@/lib/storage";
import { router } from "./router-mock";
import {
  renderWithProviders,
  seedAuthenticatedSnapshot,
  seedSnapshot,
} from "./test-utils";

describe("LoginScreen", () => {
  beforeEach(() => {
    clearSnapshot();
    router.push.mockReset();
    router.replace.mockReset();
  });

  it("renders the marketing and sign in UI", () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "Organize your work and stay on top of your priorities.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("redirects authenticated users to the dashboard", async () => {
    seedAuthenticatedSnapshot();

    renderWithProviders(<LoginScreen />);

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows auth errors and completes a successful login", async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginScreen />);

    await user.clear(screen.getByLabelText("Username"));
    await user.type(screen.getByLabelText("Username"), "wrong");
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(
      await screen.findByText("Invalid username or password. Use the seeded demo account."),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Username"));
    await user.type(screen.getByLabelText("Username"), "test");
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "test123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/dashboard"));
  });

  it("toggles the login theme in both directions", async () => {
    const user = userEvent.setup();

    seedSnapshot({ theme: "light" });
    renderWithProviders(<LoginScreen />);

    await user.click(screen.getByRole("button", { name: "Dark mode" }));
    expect(document.documentElement.dataset.theme).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Light mode" }));
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
