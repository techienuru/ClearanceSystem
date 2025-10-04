import { backendEndpoint } from "../config/config.js";
import { authHeaders, logoutUser, refreshToken } from "./auth.js";

async function fetchUserDetails() {
  try {
    const res = await fetch(`${backendEndpoint}/api/users/get-details`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
    });

    const userDetails = await res.json();

    // Checks:
    // 1. If there is an error, access token hasn't expired or fetch fail
    // 2. If the access token has expired
    if (!res.ok && !userDetails?.isTokenExpired) {
      throw new Error(userDetails?.error || "Network Error.");
    } else if (!res.ok && userDetails.isTokenExpired) {
      const refreshResponse = await refreshToken();

      // If refresh is successful, recurse (re-run) the parent function
      if (refreshResponse?.retry) return fetchUserDetails();

      // If there is an error while refreshing
      if (!refreshResponse?.retry && refreshResponse?.error)
        throw new Error(refreshResponse?.error);

      // If refreshToken has expired
      // (There won't be a return value instead a redirecting to home function)
      return await logoutUser();
    }

    const {
      _id,
      fullname,
      wallet,
      matric_no,
      faculty_name,
      department_name,
      role_id,
    } = userDetails.data;

    return {
      _id,
      fullname,
      wallet,
      matric_no,
      faculty_name,
      department_name,
      role_id,
    };
  } catch (err) {
    throw new Error(err.message);
  }
}

export default fetchUserDetails;
