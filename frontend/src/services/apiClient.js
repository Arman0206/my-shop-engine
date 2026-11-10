import axios from "axios";
import { getToken, clearSession } from "./authStorage";

export const coreApi = axios.create({
  baseURL: import.meta.env.VITE_CORE_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
});

export const recommendationApi = axios.create({
  baseURL: import.meta.env.VITE_RECOMMENDATION_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
});

// Fired when the server says we're not (or no longer) authenticated.
// AuthProvider listens and sends the user to /login.
export const AUTH_REQUIRED_EVENT = "auth:required";

for (const api of [coreApi, recommendationApi]) {
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const isAuthCall = error.config?.url?.startsWith("/auth/");
      // A 401 from login/register just means "wrong credentials": let the form show it.
      if (error.response?.status === 401 && !isAuthCall) {
        clearSession();
        window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
      }
      return Promise.reject(error);
    }
  );
}
