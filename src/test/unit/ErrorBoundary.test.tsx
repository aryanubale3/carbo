import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../../components/ErrorBoundary";

const BuggyComponent = () => {
  throw new Error("Simulated rendering failure");
};

describe("ErrorBoundary Component Unit Tests", () => {
  it("should render children when no error occurs", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Normal Render Flow</div>
      </ErrorBoundary>
    );

    expect(getByText("Normal Render Flow")).toBeInTheDocument();
  });

  it("should catch rendering exceptions and display the premium fault isolation UI", () => {
    // Suppress console.error in tests to avoid polluting logs with expected mock error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { getByText } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(getByText("Application Fault Isolated")).toBeInTheDocument();
    expect(getByText("Error: Simulated rendering failure")).toBeInTheDocument();
    expect(getByText("Reinitialize Session")).toBeInTheDocument();

    spy.mockRestore();
  });

  it("should reload the page when Reinitialize Session is clicked", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const reloadMock = vi.fn();
    
    // Mock window.location.reload
    Object.defineProperty(window, "location", {
      value: { reload: reloadMock },
      writable: true,
      configurable: true
    });

    const { getByRole } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    const button = getByRole("button", { name: "Reinitialize Session" });
    fireEvent.click(button);

    expect(reloadMock).toHaveBeenCalled();
    spy.mockRestore();
  });
});
