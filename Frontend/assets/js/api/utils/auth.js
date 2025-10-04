import { backendEndpoint } from "../config/config.js";
import {
  hidePreloader,
  redirectToHome,
  showError,
  showLoadingToast,
  showPreloader,
} from "./utils.js";

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

export const refreshToken = async () => {
  try {
    const res = await fetch(`${backendEndpoint}/refresh`, {
      method: "GET",
      credentials: "include",
    });
    const refreshResponse = await res.json();

    // If refreshToken has expired
    if (res.status === 401) return redirectToHome();
    // If there is error while refreshing token
    if (!res.ok) throw new Error(refreshResponse?.error || "Network error!");

    // Save new accessToken to localStorage
    // and send a "rerun function" command to the parent function
    saveAccessToken(refreshResponse.accessToken);
    return { retry: true };
  } catch (err) {
    return {
      retry: false,
      error: `Error while refreshing token. Reason: "${err.message}"`,
    };
  }
};

export const logoutUser = async () => {
  try {
    showLoadingToast("Logging out", "Please wait...");

    const res = await fetch(`${backendEndpoint}/logout/`, {
      method: "GET",
      credentials: "include",
    });

    // If there is error while logging out
    if (!res.ok) throw new Error("Network error");

    if (res.status === 204) {
      removeAccessToken();
      window.location.href = "../";
    }
  } catch (err) {
    showError(document.body, err.message);
    console.error(err);
  }
};
