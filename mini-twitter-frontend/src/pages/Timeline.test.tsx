import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import Timeline from "./Timeline";
import * as postService from "../services/post";
import * as authService from "../services/auth";
import { useAuthStore } from "../stores/authStore";

jest.mock("../services/post");
jest.mock("../services/auth");
const mockedPostService = postService as jest.Mocked<typeof postService>;
const mockedAuthService = authService as jest.Mocked<typeof authService>;

const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const renderTimeline = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Timeline />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("Timeline Page - Advanced Coverage", () => {
  const mockPost = {
    id: 1,
    title: "Post Original",
    content: "Conteúdo Original",
    authorName: "Vitor",
    userId: 1,
    createdAt: "2024-01-01",
    likesCount: 0,
    image: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    useAuthStore.getState().logout();
  });

  it("should update search term and call API", async () => {
    mockedPostService.getPosts.mockResolvedValue({
      posts: [],
      page: 1,
      limit: 10,
      total: 0,
    });
    renderTimeline();

    const searchInput = screen.getByPlaceholderText(/buscar por post/i);
    fireEvent.change(searchInput, { target: { value: "React" } });

    await waitFor(() => {
      expect(mockedPostService.getPosts).toHaveBeenCalledWith(1, "React");
    });
  });

  it("should call logout service and clear store when clicking logout", async () => {
    useAuthStore.setState({ token: "fake-token" });
    mockedPostService.getPosts.mockResolvedValue({
      posts: [],
      page: 1,
      limit: 10,
      total: 0,
    });

    renderTimeline();

    const logoutBtn = screen.getByLabelText("logout");
    fireEvent.click(logoutBtn);
    await waitFor(() => {
      expect(mockedAuthService.logoutUser).toHaveBeenCalled();
      expect(useAuthStore.getState().token).toBeNull();
    });
  });

  it("should handle image selection and preview", async () => {
    useAuthStore.setState({ token: "fake-token" });
    mockedPostService.getPosts.mockResolvedValue({
      posts: [],
      page: 1,
      limit: 10,
      total: 0,
    });

    renderTimeline();

    const file = new File(["hello"], "hello.png", { type: "image/png" });
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /X/i })).toBeInTheDocument();
    });
  });

  it("should open edit form and update post", async () => {
    useAuthStore.setState({
      token: "fake-token",
    });
    mockedPostService.getPosts.mockResolvedValue({
      posts: [mockPost],
      page: 1,
      limit: 10,
      total: 1,
    });

    renderTimeline();

    const menuBtn = await screen.findByLabelText("menu");
    fireEvent.click(menuBtn);

    const editBtn = await screen.findByText(/editar/i);
    fireEvent.click(editBtn);

    const titleInputs = screen.getAllByPlaceholderText("Título");
    const titleInput = titleInputs[1];
    fireEvent.change(titleInput, {
      target: { value: "Título Editado" },
    });

    const saveBtn = screen.getByText(/salvar/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockedPostService.updatePost).toHaveBeenCalledWith(
        mockPost.id,
        expect.objectContaining({ title: "Título Editado" }),
      );
    });
  });

  it("should call likePost service", async () => {
    mockedPostService.getPosts.mockResolvedValue({
      posts: [mockPost],
      page: 1,
      limit: 10,
      total: 1,
    });
    renderTimeline();

    const heartIcon = await screen.findByTestId("heart-icon");
    fireEvent.click(heartIcon);

    await waitFor(() => {
      expect(mockedPostService.likePost).toHaveBeenCalled();
    });
  });
});
