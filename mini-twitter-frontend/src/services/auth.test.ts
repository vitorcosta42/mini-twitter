import { registerUser, loginUser, logoutUser } from "./auth";
import { api } from "./api";

jest.mock("./api", () => ({
  api: {
    post: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.spyOn(Storage.prototype, "setItem");
    jest.spyOn(Storage.prototype, "removeItem");
  });

  describe("registerUser", () => {
    it("should call register endpoint with correct data", async () => {
      const mockData = {
        name: "User",
        email: "test@test.com",
        password: "123",
      };
      mockedApi.post.mockResolvedValueOnce({ data: { message: "Success" } });

      const result = await registerUser(mockData);

      expect(mockedApi.post).toHaveBeenCalledWith("/auth/register", mockData);
      expect(result).toEqual({ message: "Success" });
    });
  });

  describe("loginUser", () => {
    it("should store token in localStorage on successful login", async () => {
      const mockData = { email: "test@test.com", password: "123" };
      const mockResponse = { data: { token: "fake-jwt-token", user: {} } };

      mockedApi.post.mockResolvedValueOnce(mockResponse);

      const result = await loginUser(mockData);

      expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", mockData);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "token",
        "fake-jwt-token",
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should not set token if response does not contain it", async () => {
      const mockData = { email: "test@test.com", password: "123" };
      mockedApi.post.mockResolvedValueOnce({ data: {} });

      await loginUser(mockData);

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("logoutUser", () => {
    it("should call logout endpoint and remove token from localStorage", async () => {
      localStorage.setItem("token", "existing-token");
      mockedApi.post.mockResolvedValueOnce({ data: {} });

      await logoutUser();

      expect(mockedApi.post).toHaveBeenCalledWith("/auth/logout");
      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
      expect(localStorage.getItem("token")).toBeNull();
    });
  });
});
