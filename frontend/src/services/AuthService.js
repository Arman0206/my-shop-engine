import { coreApi } from "./apiClient";

const AuthService = {
  // Both resolve to { token, user }
  login: async (email, password) => (await coreApi.post("/auth/login", { email, password })).data,
  register: async (email, password, name) =>
    (await coreApi.post("/auth/register", { email, password, name })).data,
};

export default AuthService;
