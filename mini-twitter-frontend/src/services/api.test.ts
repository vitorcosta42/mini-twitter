import { api } from "./api";
import { ENV } from "../config/env";

describe("API Axios Instance", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should be configured with the correct Base URL", () => {
    expect(api.defaults.baseURL).toBe(ENV.API_URL);
  });

  it("should have default headers for Content-Type", () => {
    expect(api.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("should add Authorization header if token exists in localStorage", async () => {
    const fakeToken = "my-secret-token";
    localStorage.setItem("token", fakeToken);

    const requestInterceptor = (api.interceptors.request as any).handlers[0]
      .fulfilled;

    const config = {
      headers: {},
    };

    const updatedConfig = requestInterceptor(config);

    expect(updatedConfig.headers.Authorization).toBe(`Bearer ${fakeToken}`);
  });

  it("should NOT add Authorization header if token does not exist", () => {
    localStorage.removeItem("token");

    const requestInterceptor = (api.interceptors.request as any).handlers[0]
      .fulfilled;

    const config = {
      headers: {},
    };

    const updatedConfig = requestInterceptor(config);

    expect(updatedConfig.headers.Authorization).toBeUndefined();
  });
});
