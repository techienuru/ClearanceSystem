import { backendEndpoint } from "../../config/config.js";
import { authHeaders } from "../../utils/auth.js";

export async function fetchClearanceStatus(studentId) {
  try {
    const res = await fetch(
      `${backendEndpoint}/api/students/clearance/progress/${studentId}/all`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
      }
    );
    const clearanceProgress = await res.json();

    return clearanceProgress.data.allClearanceProgress;
  } catch (err) {
    throw new Error(err);
  }
}
