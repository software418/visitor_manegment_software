import axios from "axios";
import { env } from "../config/env";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: env.API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await api.post("/auth/refresh-token");
        const newToken = refreshRes.data?.data?.accessToken;
        if (newToken) {
          useAuthStore.getState().setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;