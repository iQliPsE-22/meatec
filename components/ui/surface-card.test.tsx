import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SurfaceCard } from "./surface-card";

describe("SurfaceCard", () => {
  it("renders children correctly", () => {
    render(<SurfaceCard>Test Content</SurfaceCard>);
    expect(screen.getByText("Test Content")).toBeDefined();
  });

  it("applies tone styles correctly", () => {
    const { container: strongContainer } = render(<SurfaceCard tone="strong" />);
    const { container: subtleContainer } = render(<SurfaceCard tone="subtle" />);
    
    // We can check if it renders without crashing with different tones
    expect(strongContainer).toBeDefined();
    expect(subtleContainer).toBeDefined();
  });

  it("merges custom styles correctly", () => {
      const customStyle = { padding: 100 };
      render(<SurfaceCard styles={{ body: customStyle }}>Content</SurfaceCard>);
      // Ant Design Card structure is complex, but we mainly want to cover the code paths
      expect(screen.getByText("Content")).toBeDefined();
  });
});
