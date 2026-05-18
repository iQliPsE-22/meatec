import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MobileHeader } from "./mobile-header";
import { MobileNav } from "./mobile-nav";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";
import { StatCard } from "./stat-card";
import { StatusDistribution } from "./status-distribution";
import { WeeklyActivityChart } from "./weekly-activity-chart";
import { AppStateProvider } from "@/lib/app-state";
import { UnorderedListOutlined } from "@ant-design/icons";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppStateProvider>{children}</AppStateProvider>
);

describe("Dashboard Components", () => {
  it("renders MobileHeader", () => {
    render(<MobileHeader username="Test" theme="light" onToggleTheme={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText(/MeaTech/i)).toBeDefined();
    expect(screen.getByText("T")).toBeDefined();
  });

  it("renders MobileNav", () => {
    render(<MobileNav activeTab="overview" onTabChange={vi.fn()} />);
    expect(screen.getByText(/Overview/i)).toBeDefined();
    expect(screen.getByText(/Tasks/i)).toBeDefined();
  });

  it("renders SidebarBrand", () => {
    render(<SidebarBrand />);
    expect(screen.getByText(/MeaTech/i)).toBeDefined();
  });

  it("renders SidebarNav", () => {
    render(<SidebarNav activeTab="overview" onTabChange={vi.fn()} />);
    expect(screen.getByText(/Overview/i)).toBeDefined();
    expect(screen.getByText(/Tasks/i)).toBeDefined();
  });

  it("renders SidebarUser", () => {
    // Mock session in localStorage for SidebarUser
    localStorage.setItem("pulse-tasks.store.v1", JSON.stringify({
        version: 1,
        theme: "light",
        session: { username: "TestUser", token: "token" },
        tasks: []
    }));
    render(<SidebarUser username="TestUser" theme="light" onToggleTheme={vi.fn()} onLogout={vi.fn()} />, { wrapper });
    expect(screen.getByText(/TestUser/i)).toBeDefined();
  });

  it("renders StatCard", () => {
    render(<StatCard label="Total" value="10" detail="detail" icon={UnorderedListOutlined} />);
    expect(screen.getByText("Total")).toBeDefined();
    expect(screen.getByText("10")).toBeDefined();
  });

  it("renders StatusDistribution", () => {
    render(<StatusDistribution total={10} completed={5} inProgress={3} todo={2} />);
    expect(screen.getByText(/Status distribution/i)).toBeDefined();
  });

  it("renders WeeklyActivityChart", () => {
    const mockActivity = [
        { key: '1', label: 'Mon', count: 5 },
        { key: '2', label: 'Tue', count: 10 },
        { key: '3', label: 'Wed', count: 7 },
        { key: '4', label: 'Thu', count: 12 },
        { key: '5', label: 'Fri', count: 8 },
        { key: '6', label: 'Sat', count: 3 },
        { key: '7', label: 'Sun', count: 2 },
    ];
    render(<WeeklyActivityChart activity={mockActivity} />);
    expect(screen.getByText(/Weekly activity/i)).toBeDefined();
  });
});
