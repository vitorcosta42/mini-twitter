import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./AuthPage";

jest.mock("../components/auth/LoginForm", () => ({
  LoginForm: () => <div data-testid="login-form-mock">Login Form</div>,
}));

jest.mock("../components/auth/RegisterForm", () => ({
  RegisterForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <div>
      <div data-testid="register-form-mock">Register Form</div>
      <button onClick={onSuccess}>Simulate Success</button>
    </div>
  ),
}));

const renderWithRouter = (initialEntries = ["/auth"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("AuthPage Component", () => {
  it("should render the Login tab by default", () => {
    renderWithRouter();

    expect(screen.getByText("Mini Twitter")).toBeInTheDocument();
    expect(screen.getByTestId("login-form-mock")).toBeInTheDocument();
    expect(screen.queryByTestId("register-form-mock")).not.toBeInTheDocument();
  });

  it("should render the Register tab when the 'tab=register' query param is present", () => {
    renderWithRouter(["/auth?tab=register"]);

    expect(screen.getByTestId("register-form-mock")).toBeInTheDocument();
    expect(screen.queryByTestId("login-form-mock")).not.toBeInTheDocument();
  });

  it("should switch to Register tab when clicking the Register button", () => {
    renderWithRouter();

    const registerTabButton = screen.getByRole("button", {
      name: /cadastrar/i,
    });
    fireEvent.click(registerTabButton);

    expect(screen.getByTestId("register-form-mock")).toBeInTheDocument();
    expect(screen.queryByTestId("login-form-mock")).not.toBeInTheDocument();
  });

  it("should switch to Login tab when clicking the Login button from the Register tab", () => {
    renderWithRouter(["/auth?tab=register"]);

    const loginTabButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginTabButton);

    expect(screen.getByTestId("login-form-mock")).toBeInTheDocument();
  });

  it("should redirect to Login tab when RegisterForm calls onSuccess", () => {
    renderWithRouter(["/auth?tab=register"]);

    expect(screen.getByTestId("register-form-mock")).toBeInTheDocument();

    const successButton = screen.getByText("Simulate Success");
    fireEvent.click(successButton);

    expect(screen.getByTestId("login-form-mock")).toBeInTheDocument();
  });
});
