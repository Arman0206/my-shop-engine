// Token persistence. localStorage keeps the session across reloads, but any
// script on the page can read it, so keep the app free of XSS (React escapes
// output by default; never use dangerouslySetInnerHTML with user content).
const TOKEN_KEY = "smartcart.token";
const USER_KEY = "smartcart.user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const saveSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
