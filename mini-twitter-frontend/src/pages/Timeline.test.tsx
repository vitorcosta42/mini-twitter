import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import Timeline from "./Timeline";
import type { Post } from "../services/post";
import * as postService from "../services/post";
import { useAuthStore } from "../stores/authStore";

jest.mock("lucide-react", () => ({
  Heart: ({ onClick }: { onClick: () => void }) => (
    <div data-testid="heart-icon" onClick={onClick} />
  ),
  LogOut: () => <div data-testid="logout-icon" />,
  Image: () => <div data-testid="image-icon" />,
  Ellipsis: () => <div data-testid="ellipsis-icon" />,
}));

jest.mock("../components/ThemeToggle", () => {
  return function DummyThemeToggle() {
    return <div data-testid="theme-toggle-mock">Theme Toggle</div>;
  };
});

jest.mock("../services/post");
const mockedPostService = postService as jest.Mocked<typeof postService>;

beforeAll(() => {
  class MockIntersectionObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe("Timeline", () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  it("should render the title and search bar", () => {
    render(<Timeline />, { wrapper });
    expect(
      screen.getByRole("heading", { name: /mini twitter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar por post..."),
    ).toBeInTheDocument();
  });

  it("should load and display posts from the API", async () => {
    const mockPosts = {
      posts: [
        {
          id: 1,
          title: "Post de Teste",
          content: "Conteúdo do post",
          authorName: "User1",
          createdAt: "2023-10-27T10:00:00Z",
          likesCount: 5,
          image: "",
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
    };

    mockedPostService.getPosts.mockResolvedValue(mockPosts);

    render(<Timeline />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Post de Teste")).toBeInTheDocument();
    });
  });

  it("should not show the creation form if not authenticated", () => {
    useAuthStore.setState({ token: null });
    render(<Timeline />, { wrapper });
    expect(screen.queryByPlaceholderText("Título")).not.toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("should allow creating a new post when authenticated", async () => {
    useAuthStore.setState({ token: "fake-token" });

    const mockNewPost: Post = {
      id: 99,
      title: "Novo Título",
      content: "Nova Descrição",
      image: "",
      authorName: "Test User",
      createdAt: "2023-10-27T10:00:00Z",
      likesCount: 0,
    };

    mockedPostService.createPost.mockResolvedValue(mockNewPost);

    render(<Timeline />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText("Título"), {
      target: { value: "Novo Título" },
    });
    fireEvent.change(screen.getByPlaceholderText("E aí, o que está rolando?"), {
      target: { value: "Nova Descrição" },
    });
    fireEvent.click(screen.getByRole("button", { name: /postar/i }));

    await waitFor(() => {
      expect(mockedPostService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Novo Título",
          content: "Nova Descrição",
          image: undefined,
        }),
        expect.anything(),
      );
    });
  });

  it("should call the like function when clicking the heart icon", async () => {
    const mockPost = {
      id: 1,
      title: "Post para Curtir",
      content: "...",
      authorName: "User1",
      createdAt: "2023-10-27T10:00:00Z",
      likesCount: 0,
      image: "",
    };

    mockedPostService.getPosts.mockResolvedValue({
      posts: [mockPost],
      page: 1,
      limit: 10,
      total: 1,
    });

    render(<Timeline />, { wrapper });

    const heartIcon = await screen.findByTestId("heart-icon");

    fireEvent.click(heartIcon);

    await waitFor(() => {
      expect(mockedPostService.likePost).toHaveBeenCalledWith(
        1,
        expect.anything(),
      );
    });
  });
});
