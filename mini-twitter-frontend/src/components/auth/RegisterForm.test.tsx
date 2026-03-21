import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RegisterForm } from "./RegisterForm";
import * as authService from "../../services/auth";

jest.mock("../../services/auth");
const mockedAuthService = authService as jest.Mocked<typeof authService>;

jest.mock("lucide-react", () => ({
  User: () => <div data-testid="user-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Eye: ({ onClick }: any) => <div data-testid="eye-icon" onClick={onClick} />,
  EyeOff: ({ onClick }: any) => (
    <div data-testid="eye-off-icon" onClick={onClick} />
  ),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("RegisterForm Component", () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should render all registration fields and the submit button", () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />, { wrapper });

    expect(
      screen.getByPlaceholderText(/insira o seu nome/i),
    ).toBeInTheDocument();
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

  it("should show validation errors when fields are empty", async () => {
    render(<RegisterForm onSuccess={mockOnSuccess} />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/o nome deve ter pelo menos 2 caracteres/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/insira um e-mail válido/i)).toBeInTheDocument();
      expect(
        screen.getByText(/a senha deve ter pelo menos 6 caracteres/i),
      ).toBeInTheDocument();
    });
  });

  it("should call registerUser API and trigger onSuccess callback on success", async () => {
    mockedAuthService.registerUser.mockResolvedValue({ message: "Success" });

    render(<RegisterForm onSuccess={mockOnSuccess} />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/insira o seu nome/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/insira o seu e-mail/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/insira a sua senha/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => {
      expect(mockedAuthService.registerUser).toHaveBeenCalledWith(
        {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        },
        expect.anything(),
      );

      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should display API error message when registration fails", async () => {
    mockedAuthService.registerUser.mockRejectedValue(new Error("Conflict"));

    render(<RegisterForm onSuccess={mockOnSuccess} />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/insira o seu nome/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText(/insira o seu e-mail/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/insira a sua senha/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/não foi possível realizar o cadastro/i),
      ).toBeInTheDocument();
    });
  });

  it("should show loading state and disable button while registering", async () => {
    mockedAuthService.registerUser.mockReturnValue(new Promise(() => {}));

    render(<RegisterForm onSuccess={mockOnSuccess} />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText(/insira o seu nome/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText(/insira o seu e-mail/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/insira a sua senha/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/cadastrando\.\.\./i)).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
});
