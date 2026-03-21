import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "util";

jest.mock("./src/config/env", () => ({
  ENV: {
    API_URL: "http://localhost:3000",
  },
}));

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
