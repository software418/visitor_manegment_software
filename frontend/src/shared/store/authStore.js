import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";
import { logger } from "../utils/logger";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setToken: (token) => set({ token, isAuthenticated: Boolean(token) }),

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/login", credentials);
          const accessToken = res.data?.data?.accessToken || null;
          set({
            user: res.data?.data?.user || null,
            token: accessToken,
            isAuthenticated: Boolean(accessToken),
            isLoading: false,
          });
          return res.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          logger.error("Logout error", error);
        } finally {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);