import { getPosts, createPost, updatePost, deletePost, likePost } from "./post";
import { ENV } from "../config/env";

global.fetch = jest.fn();
const mockedFetch = fetch as jest.Mock;

describe("Post Service", () => {
  const mockPost = {
    id: 1,
    title: "Test Title",
    content: "Test Content",
    authorName: "John",
    createdAt: "2024-01-01",
    likesCount: 0,
    image: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("getPosts", () => {
    it("should fetch posts with correct query params", async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [mockPost], total: 1 }),
      });

      const result = await getPosts(2, "search-term");

      expect(mockedFetch).toHaveBeenCalledWith(
        `${ENV}/posts?page=2&search=search-term`,
      );
      expect(result.posts).toHaveLength(1);
    });

    it("should throw error when response is not ok", async () => {
      mockedFetch.mockResolvedValueOnce({ ok: false });
      await expect(getPosts()).rejects.toThrow("Erro ao buscar posts");
    });
  });

  describe("createPost", () => {
    it("should include auth headers when token exists", async () => {
      localStorage.setItem("token", "fake-token");
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const newPost = { title: "New", content: "Body" };
      await createPost(newPost);

      expect(mockedFetch).toHaveBeenCalledWith(
        `${ENV}/posts`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token",
          },
          body: JSON.stringify(newPost),
        }),
      );
    });
  });

  describe("updatePost", () => {
    it("should call PUT method with correct URL and body", async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const updateData = { title: "Updated", content: "New", image: "" };
      await updatePost(1, updateData);

      expect(mockedFetch).toHaveBeenCalledWith(
        `${ENV}/posts/1`,
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        }),
      );
    });
  });

  describe("deletePost", () => {
    it("should call DELETE method", async () => {
      mockedFetch.mockResolvedValueOnce({ ok: true });

      await deletePost(123);

      expect(mockedFetch).toHaveBeenCalledWith(
        `${ENV}/posts/123`,
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("should throw error if delete fails", async () => {
      mockedFetch.mockResolvedValueOnce({ ok: false });
      await expect(deletePost(1)).rejects.toThrow("Erro ao deletar post");
    });
  });

  describe("likePost", () => {
    it("should call POST to the like endpoint", async () => {
      mockedFetch.mockResolvedValueOnce({ ok: true });

      await likePost(1);

      expect(mockedFetch).toHaveBeenCalledWith(
        `${ENV}/posts/1/like`,
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
