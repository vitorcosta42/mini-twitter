import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  login: (token: string, user: AuthState["user"]) => void;
  logout: () => void;
  user: {
    name: string;
    id: number;
    email: string;
  } | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: (token, user) => set({ token, user }),

      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
