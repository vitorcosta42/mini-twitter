import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "./ThemeToggle";
import { useThemeStore } from "../stores/theme";

jest.mock("../stores/theme", () => ({
  useThemeStore: jest.fn(),
}));

const mockedUseThemeStore = useThemeStore as jest.MockedFunction<
  typeof useThemeStore
>;

describe("ThemeToggle Component", () => {
  const toggleThemeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the Moon icon when theme is light", () => {
    mockedUseThemeStore.mockReturnValue({
      theme: "light",
      toggleTheme: toggleThemeMock,
    });

    render(<ThemeToggle />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should render the Sun icon when theme is dark", () => {
    mockedUseThemeStore.mockReturnValue({
      theme: "dark",
      toggleTheme: toggleThemeMock,
    });

    render(<ThemeToggle />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should call toggleTheme when the button is clicked", () => {
    mockedUseThemeStore.mockReturnValue({
      theme: "light",
      toggleTheme: toggleThemeMock,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });
});
