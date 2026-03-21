import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { LoginForm } from "./LoginForm";
import * as authService from "../../services/auth";
import { useAuthStore } from "../../stores/authStore";

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

jest.mock("../../services/auth");
const mockedAuthService = authService as jest.Mocked<typeof authService>;

jest.mock("lucide-react", () => ({
  Mail: () => <div data-testid="mail-icon" />,
  Eye: ({ onClick }: any) => <div data-testid="eye-icon" onClick={onClick} />,
  EyeOff: ({ onClick }: any) => (
    <div data-testid="eye-off-icon" onClick={onClick} />
  ),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe("LoginForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it("should render all form fields and the submit button", () => {
    render(<LoginForm />, { wrapper });

    expect(
      screen.getByPlaceholderText(/insira o seu e-mail/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/insira a sua senha/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continuar/i }),
    ).toBeInTheDocument();
  });

  it("should toggle password visibility when clicking the eye icon", () => {
    render(<LoginForm />, { wrapper });

    const passwordInput = screen.getByPlaceholderText(/insira a sua senha/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByTestId("eye-icon"));
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByTestId("eye-off-icon"));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should show validation errors for invalid input", async () => {
    render(<LoginForm />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/insira um e-mail válido/i)).toBeInTheDocument();
      expect(
        screen.getByText(/a senha deve ter pelo menos 6 caracteres/i),
      ).toBeInTheDocument();
    });
  });

  it("should call login API and navigate to home on success", async () => {
    const mockToken = "fake-jwt-token";
    mockedAuthService.loginUser.mockResolvedValue({
      token: mockToken,
      user: {},
    });
    const loginSpy = jest.spyOn(useAuthStore.getState(), "login");

    render(<LoginForm />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/insira o seu e-mail/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/insira a sua senha/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => {
      expect(mockedAuthService.loginUser).toHaveBeenCalledWith(
        {
          email: "test@example.com",
          password: "password123",
        },
        expect.anything(),
      );

      expect(loginSpy).toHaveBeenCalledWith(mockToken, {});
      expect(mockedNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should disable the button and show loading state while pending", async () => {
    mockedAuthService.loginUser.mockReturnValue(new Promise(() => {}));

    render(<LoginForm />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/insira o seu e-mail/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/insira a sua senha/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/entrando\.\.\./i)).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("should display API error message on login failure", async () => {
    mockedAuthService.loginUser.mockRejectedValue(new Error("Unauthorized"));

    render(<LoginForm />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/insira o seu e-mail/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/insira a sua senha/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/e-mail ou senha inválidos/i),
      ).toBeInTheDocument();
    });
  });
});
