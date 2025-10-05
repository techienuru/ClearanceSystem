import { backendEndpoint } from "../config/config.js";
import { fetchClearanceStatus } from "../student/service/fetchClearanceStatus.js";
import { authHeaders } from "../utils/auth.js";
import fetchUserDetails from "../utils/getUserDetails.js";
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "../utils/utils.js";

const docCardCont = document.querySelector(".js-document-card-container");

loadPage();

async function loadPage() {
  try {
    // Get Student ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const student_id = urlParams.get("student_id");

    showLoadingToast("Page is Loading", "Fetching Officer's details...");

    const userDetails = await fetchUserDetails();
    // If fetching user Details fail, exit the function
    if (!userDetails) return;

    Swal.close();

    // Fetching Clearance Documents for the Student
    showLoadingToast("Page is Loading", "Fetching Student's clearance...");
    const res = await fetch(
      `${backendEndpoint}/api/students/clearance/${student_id}/all`,
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

    renderClearanceDoc(payload.data);

    // Fetching Student Clearance Status
    showLoadingToast("Page is Loading", "Fetching Clearance Status...");
    // Gets student clearance status
    const clearanceStatusArr = await fetchClearanceStatus(student_id);
    renderClearanceStatus(clearanceStatusArr, userDetails.role_id.role_name);

    Swal.close();
  } catch (err) {
    console.error(err);
    Swal.close();
    showErrorToast("Network Error", err.message);
  }
}

function renderClearanceDoc(clearanceArr) {
  const docCardHTML = clearanceArr
    .map((doc) => {
      const type = doc.requirement.type;
      const { title, amount, description } = doc.requirement;
      const { status, _id } = doc;
      // Picking the last file submitted by User
      const submissionsLength = doc.submissions.length;
      const filename =
        submissionsLength > 0 ? doc.submissions[submissionsLength - 1] : null;

      const badgeColor =
        status === "Paid"
          ? "success"
          : status === "Approved"
          ? "success"
          : status === "Pending"
          ? "warning"
          : "danger";

      return type == "Payment"
        ? `
            <div class="document-card">
              <h5>Title: ${title}</h5>
              <p>Amount: ${amount}</p>
              <p>
                Status:
                <span class="badge bg-${badgeColor} text-dark">${status}</span>
              </p>
            </div>
            `
        : `
            <div class="document-card">
              <h5>Title: ${title}</h5>
              <p>Description: ${description}</p>
              <p>
                Status:
                <span class="badge bg-${badgeColor} text-dark">${status}</span>
              </p>
              <div class="d-flex justify-content-between">
                <div>
                <a
                    href="#"
                    class="btn btn-view js-view-btn"
                    target="_blank"
                    data-filename="${filename?.filename}"
                    >View</a
                  >
                  
                </div>
                <div>
                  <button type="button" class="btn btn-approve js-approve-clearance" data-clearance-id="${_id}">
                    Approve
                  </button>
                  <button type="button" class="btn btn-decline js-decline-clearance">
                    Decline
                  </button>
                </div>
              </div>

              <!-- Message Section -->
              <div class="message-section js-message-section" style="display:none;">
                <textarea
                  class="form-control js-feedback"
                  rows="5"
                  placeholder="Enter your feedback for the student..."
                ></textarea>
                <div>
                  <button
                    type="button"
                    class="btn btn-secondary w-100 mt-3 btn-submit js-submit-feedback"
                    data-clearance-id="${_id}"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
            `;
    })
    .join("");

  docCardCont.innerHTML = docCardHTML;

  addActionListeners();
}

function addActionListeners() {
  if (!docCardCont) return console.warn("No .js-document-card-container found");

  // Listening for clicks inside Document Card Container
  docCardCont.addEventListener("click", async (e) => {
    // Listener for "Approve Button"
    const approveBtn = e.target.closest(".js-approve-clearance");
    if (approveBtn) {
      const clearanceId = approveBtn.dataset.clearanceId;

      if (!clearanceId)
        return showErrorToast("Action Error", "Missing clearance Id");

      approveBtn.disabled = true;

      try {
        await approveClearance(clearanceId);
      } finally {
        approveBtn.disabled = false;
      }
      return;
    }

    // Listener for "Decline Button"
    const declineBtn = e.target.closest(".js-decline-clearance");
    if (declineBtn) {
      // Picking the ancestor/parent of the clicked decline button
      const card = declineBtn.closest(".document-card");
      if (!card) return;

      // Showing the feedback container inside the card
      // and making the textarea focus automatically
      const msgSection = card.querySelector(".js-message-section");
      if (msgSection) msgSection.style.display = "block";
      const textarea = msgSection.querySelector(".js-feedback");
      if (textarea) textarea.focus();
      return;
    }

    // Listener for "Submit" button - That which decline clearance
    const submitBtn = e.target.closest(".js-submit-feedback");
    if (submitBtn) {
      // Picking the ancestor/parent of the clicked submit button
      const card = submitBtn.closest(".document-card");
      if (!card) return;

      const textarea = card.querySelector(".js-feedback");
      const feedback = (textarea?.value || "").trim();
      if (!feedback)
        return showErrorToast("User Error", "Please input a feedback!");
      const clearanceId = submitBtn.dataset.clearanceId;
      if (!clearanceId)
        return showErrorToast("Action Error", "Missing clearance Id");

      submitBtn.disabled = true;
      try {
        await declineClearance(clearanceId, feedback);
      } finally {
        submitBtn.disabled = false;
      }

      return;
    }

    // Listener for "Submit" button - That which decline clearance
    const viewBtn = e.target.closest(".js-view-btn");
    if (viewBtn) {
      e.preventDefault();
      const filename = viewBtn.dataset.filename;
      if (!filename)
        return showErrorToast("File Error", "No file available to view");

      viewBtn.disabled = true;

      try {
        await viewFile(filename);
      } finally {
        viewBtn.disabled = false;
      }
      return;
    }
  });
}

async function approveClearance(clearanceId) {
  try {
    showLoadingToast("Approving Clearance", "Please wait...");

    const res = await fetch(
      `${backendEndpoint}/api/students/clearance/action/approve`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ clearance_id: clearanceId }),
      }
    );
    const payload = await res.json();

    if (!res.ok || payload.error)
      throw new Error(payload.error || "Network error");

    Swal.close();
    showSuccessToast(payload.message);
    return await loadPage();
  } catch (err) {
    console.error(err);
    Swal.close();
    showErrorToast("Network Error", err.message);
  }
}
async function declineClearance(clearanceId, feedback) {
  try {
    showLoadingToast("Declining Clearance", "Please wait...");

    const res = await fetch(
      `${backendEndpoint}/api/students/clearance/action/decline`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ clearance_id: clearanceId, feedback: feedback }),
      }
    );
    const payload = await res.json();

    if (!res.ok || payload.error)
      throw new Error(payload.error || "Network error");

    Swal.close();
    showSuccessToast(payload.message);
    return await loadPage();
  } catch (err) {
    console.error(err);
    Swal.close();
    showErrorToast("Network Error", err.message);
  }
}
async function viewFile(filename) {
  try {
    showLoadingToast("Loading file", "Please wait...");

    const res = await fetch(
      `${backendEndpoint}/api/users/clearance/files/${filename}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
      }
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || `Failed to fetch file (${res.status})`);
    }

    const contentType =
      res.headers.get("Content-Type") || "application/octet-stream";
    const blob = await res.blob();

    // Create an object URL and open in a new tab
    const blobUrl = URL.createObjectURL(
      new Blob([blob], { type: contentType })
    );
    window.open(blobUrl, "_blank", "noopener");

    // Free space after a minute
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);

    Swal.close();
  } catch (err) {
    console.error(err);
    Swal.close();
    showErrorToast("File Error", err.message || "Could not load file");
  }
}

function renderClearanceStatus(clearanceStatusArr, roleName) {
  const statusWrapper = document.querySelector(".js-clearance-status-wrapper");

  const isCleared = clearanceStatusArr.find(
    (clearanceStatus) =>
      clearanceStatus.roleName === roleName &&
      clearanceStatus.clearanceScore === 100
  );

  if (isCleared) {
    statusWrapper.innerHTML = `
      <button class="btn btn-finalize btn-cleared">
        Cleared Successfully
      </button>  
    `;
  } else {
    statusWrapper.innerHTML = `
      <button class="btn btn-finalize btn-not-cleared">
        Not Cleared
      </button>
    `;
  }
}
