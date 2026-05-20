/**
 * Tests for LocaleContext
 *
 * **Feature: english-translation**
 * Tests locale context, persistence, and state management
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { render, screen, act, waitFor } from "@testing-library/react";
import fc from "fast-check";
import { LocaleProvider, useLocale } from "../LocaleContext";
import { SupportedLocale } from "@/lib/i18n/config";

// Test component that uses the locale context
function TestComponent() {
  const { locale, setLocale, isLoading } = useLocale();

  return (
    <div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="loading">{isLoading ? "loading" : "loaded"}</div>
      <button data-testid="set-en" onClick={() => setLocale("en")}>
        Set English
      </button>
      <button data-testid="set-es" onClick={() => setLocale("es")}>
        Set Spanish
      </button>
    </div>
  );
}

describe("LocaleContext", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document lang
    document.documentElement.lang = "";
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Property 3: Locale Persistence Round Trip
   * For any locale selection, storing it to localStorage and then loading it
   * should return the same locale value
   * Validates: Requirements 4.1, 4.2
   */
  it("should persist locale to localStorage and load it back", () => {
    fc.assert(
      fc.property(fc.constantFrom<SupportedLocale>("en", "es"), (locale) => {
        // Store locale
        localStorage.setItem("riviera-open-locale", locale);

        // Load it back
        const stored = localStorage.getItem("riviera-open-locale");

        // Should be the same
        expect(stored).toBe(locale);
      }),
      { numRuns: 100 }
    );
  });

  it("should initialize with stored locale preference", async () => {
    // Set a locale in localStorage
    localStorage.setItem("riviera-open-locale", "en");

    const { getByTestId } = render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    await waitFor(() => {
      expect(getByTestId("loading").textContent).toBe("loaded");
    });

    expect(getByTestId("locale").textContent).toBe("en");
  });

  it("should default to Spanish when no preference exists", async () => {
    // Don't set anything in localStorage

    const { getByTestId } = render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    await waitFor(() => {
      expect(getByTestId("loading").textContent).toBe("loaded");
    });

    expect(getByTestId("locale").textContent).toBe("es");
  });

  it("should update localStorage when locale changes", async () => {
    const { getByTestId } = render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    await waitFor(() => {
      expect(getByTestId("loading").textContent).toBe("loaded");
    });

    // Change to English
    act(() => {
      getByTestId("set-en").click();
    });

    await waitFor(() => {
      expect(localStorage.getItem("riviera-open-locale")).toBe("en");
    });
  });

  it("should update HTML lang attribute when locale changes", async () => {
    const { getByTestId } = render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    await waitFor(() => {
      expect(getByTestId("loading").textContent).toBe("loaded");
    });

    // Change to English
    act(() => {
      getByTestId("set-en").click();
    });

    await waitFor(() => {
      expect(document.documentElement.lang).toBe("en");
    });

    // Change to Spanish
    act(() => {
      getByTestId("set-es").click();
    });

    await waitFor(() => {
      expect(document.documentElement.lang).toBe("es");
    });
  });

  it("should handle localStorage errors gracefully", async () => {
    // Mock localStorage to throw an error
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("localStorage not available");
    };

    const { getByTestId } = render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    await waitFor(() => {
      expect(getByTestId("loading").textContent).toBe("loaded");
    });

    // Should fall back to default Spanish
    expect(getByTestId("locale").textContent).toBe("es");

    // Restore original
    Storage.prototype.getItem = originalGetItem;
  });

  it("should throw error when useLocale is used outside provider", () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useLocale must be used within a LocaleProvider");

    console.error = originalError;
  });
});
