import { backendEndpoint } from "../config/config.js";
import { authHeaders } from "../utils/auth.js";
import fetchUserDetails from "../utils/getUserDetails.js";
import { showErrorToast, showLoadingToast } from "../utils/utils.js";

const pendingClearanceElem = document.querySelector(
  ".js-pending-clearance-container"
);

loadPage();

async function loadPage() {
  try {
    showLoadingToast("Page is Loading", "Please wait...");

    const userDetails = await fetchUserDetails();
    // If fetching user Details fail, exit the function
    if (!userDetails) return;

    const res = await fetch(
      `${backendEndpoint}/api/students/clearance/pending`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
      }
    );
    const payload = await res.json();

    if (!res.ok || payload.error)
      throw new Error(payload.error || "Network error");

    Swal.close();

    const clearanceHTML = payload.data
      .map(
        (data) =>
          `
             <tr>
                <td>${data.student.fullname}</td>
                <td>${data.student.matric_no}</td>
                <td>Applied Sciences</td>
                <td>Computer Science</td>
                <td>
                <a
                    href="./submitted_document.html?student_id=${data.student_id}"
                    class="btn btn-view"
                    >View</a
                >
                </td>
            </tr>
        `
      )
      .join("");

    pendingClearanceElem.innerHTML = clearanceHTML;
  } catch (err) {
    console.error(err);
    Swal.close();
    showErrorToast("Network Error", err.message);
  }
}
