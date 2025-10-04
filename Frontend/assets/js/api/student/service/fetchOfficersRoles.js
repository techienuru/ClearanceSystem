import { backendEndpoint } from "../../config/config.js";
import { authHeaders } from "../../utils/auth.js";

export async function fetchOfficersRoles() {
  try {
    const req = await fetch(`${backendEndpoint}/api/officers/roles`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
    });

    const res = await req.json();

    if (!req.ok && res?.error) throw new Error(res.error || "Network error");

    return res.data;
  } catch (err) {
    throw new Error(err.message);
  }
}
