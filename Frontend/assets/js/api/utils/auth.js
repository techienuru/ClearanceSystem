const ACCESS_TOKEN_KEY = "accessToken";

export const saveAccessToken = (accessToken) => {
  if (!accessToken) return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } catch (err) {
    throw new Error(`Failed to save token: ${err.message}`);
  }
};

export const loadAccessToken = () => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (err) {
    throw new Error(`Failed to load token: ${err.message}`);
  }
};

export const removeAccessToken = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (err) {
    throw new Error(`Failed to remove token: ${err.message}`);
  }
};

export const authHeaders = () => {
  const token = loadAccessToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
};
