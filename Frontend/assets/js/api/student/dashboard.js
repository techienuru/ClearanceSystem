import { backendEndpoint } from "../config/config.js";
import { authHeaders } from "../utils/auth.js";

fetch(
  `${backendEndpoint}/api/users/get-details`,
  {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  },
  { credentials: "include" }
)
  .then((res) => res.json())
  .then((detailsResponse) => {
    if (detailsResponse.isTokenExpired) return refreshToken();
  })
  .then((refreshResponse) => {
    console.log(refreshResponse);
  });

const refreshToken = async () => {
  try {
    const res = await fetch(`${backendEndpoint}/refresh`, {
      credentials: "include",
    });
    const refreshResponse = await res.json();

    console.log(refreshResponse);

    return { retry: true, accessToken: refreshResponse.accessToken };
  } catch (err) {
    return { retry: false, error: "Error while refreshing token" };
  }
};
