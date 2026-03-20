import { api } from "./api";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export async function registerUser(data: RegisterPayload) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export async function loginUser(data: LoginPayload) {
  const response = await api.post("/auth/login", data);

  const token = response.data.token;

  if (token) {
    localStorage.setItem("token", token);
  }

  return response.data;
}

export async function logoutUser() {
  await api.post("/auth/logout");

  localStorage.removeItem("token");
}
