import { useThemeStore } from "./theme";

describe("Theme Store", () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: "light" });
  });

  test("should have default theme as light", () => {
    const { theme } = useThemeStore.getState();

    expect(theme).toBe("light");
  });

  test("should toggle theme from light to dark", () => {
    const { toggleTheme } = useThemeStore.getState();

    toggleTheme();

    const { theme } = useThemeStore.getState();
    expect(theme).toBe("dark");
  });

  test("should toggle theme from dark to light", () => {
    useThemeStore.setState({ theme: "dark" });

    const { toggleTheme } = useThemeStore.getState();
    toggleTheme();

    const { theme } = useThemeStore.getState();
    expect(theme).toBe("light");
  });

  test("should toggle theme multiple times", () => {
    const { toggleTheme } = useThemeStore.getState();

    toggleTheme();
    toggleTheme();
    toggleTheme();

    const { theme } = useThemeStore.getState();
    expect(theme).toBe("dark");
  });
});
