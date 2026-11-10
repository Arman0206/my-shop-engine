import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import AuthService from "../services/AuthService";
import { AUTH_REQUIRED_EVENT } from "../services/apiClient";
import { clearSession, getStoredUser, getToken, saveSession } from "../services/authStorage";

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Logged in only if both a token and a user record are stored.
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));

  const startSession = useCallback((session) => {
    saveSession(session);
    setUser(session.user);
  }, []);

  const login = useCallback(
    async (email, password) => startSession(await AuthService.login(email, password)),
    [startSession]
  );

  const register = useCallback(
    async (email, password, name) => startSession(await AuthService.register(email, password, name)),
    [startSession]
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  // The API client reports a 401 (expired token, or not logged in): go to login,
  // remembering where the person was so we can send them back afterwards.
  useEffect(() => {
    const onAuthRequired = () => {
      setUser(null);
      navigate("/login", { replace: true, state: { from: location } });
    };
    window.addEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);
  }, [navigate, location]);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
