import { backendEndpoint } from "../config/config.js";
import { authHeaders } from "../utils/auth.js";
import fetchUserDetails from "../utils/getUserDetails.js";
import { showErrorToast, showLoadingToast } from "../utils/utils.js";
import { fetchOfficersRoles } from "./service/fetchOfficersRoles.js";

const notificationCard = document.querySelector(".js-notification-cards");

loadPage();

async function loadPage() {
  try {
    showLoadingToast("Page is loading", "Please wait...");
    const userDetails = await fetchUserDetails();
    // If fetching user Details fail, exit the function
    if (!userDetails) return;

    // Get Officer's roles
    const officersRoles = await fetchOfficersRoles();

    const notificationObjs = await Promise.all(
      officersRoles.map(async (roleObj) => {
        const { role_name, _id } = roleObj;

        const req = await fetch(
          `${backendEndpoint}/api/students/clearance/by-role/${_id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            credentials: "include",
          }
        );

        const res = await req.json();

        if (!req.ok && res?.error)
          throw new Error(res.error || "Network error");

        return { submissions: res.data, role_name };
      })
    );

    // Building notifications HTML
    const notificationHTML = notificationObjs
      .map((object) => {
        return `
        <div class="card">
          <div class="card-header">${object.role_name
            .replace(/officer/i, "")
            .trim()} Clearance</div>
          <div class="card-body">
            ${displayEachClearance(object.submissions)}
          </div>
        </div>
      `;
      })
      .join("");

    // Display the notifications on the page
    notificationCard.innerHTML = notificationHTML;

    Swal.close();
  } catch (err) {
    console.error(err);
    Swal.close();
    showErrorToast("Network Error", err.message);
  }
}

function displayEachClearance(clearanceArr) {
  if (!clearanceArr || clearanceArr.length === 0) return "";

  const clearanceHTML = clearanceArr
    .map((arrObj) => {
      const status = arrObj.status;
      const badgeColor =
        status === "Paid"
          ? "approved"
          : status === "Pending"
          ? "pending"
          : "rejected";

      return `
        <article class="mb-2">
            <p>${arrObj.requirement.title}</p>
            <span class="badge status-badge status-${badgeColor}"
              >${status}</span
            >
          </article>
          ${displayFeedbacks(arrObj.feedback)}
    `;
    })
    .join("");

  return clearanceHTML;
}

function displayFeedbacks(feedbackArr) {
  if (!feedbackArr || feedbackArr.length === 0) return "";

  return feedbackArr
    .map((feedback) => {
      `<span>
        "${feedback}"
      </span>`;
    })
    .join("");
}
