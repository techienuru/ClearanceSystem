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
                    href="../Clearance Documents/"
                    class="btn btn-view"
                    target="_blank"
                    data-filename="${filename}"
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

  // Listener to show Decline  feedback
  addDeclineBtnListeners();
  // Listener to approve clearance
  addApproveBtnListeners();
  // Listener to decline clearance
  addSubmitFeedbackListener();
}

function addDeclineBtnListeners() {
  const declineBtn = document.querySelector(".js-decline-clearance");
  if (!declineBtn) return;

  declineBtn.addEventListener("click", () => {
    document.querySelector(".js-message-section").style.display = "block";
  });
}

function addApproveBtnListeners() {
  const approveBtn = document.querySelector(".js-approve-clearance");
  if (!approveBtn) return;

  approveBtn.addEventListener("click", async () => {
    await approveClearance(approveBtn.dataset.clearanceId);
  });
}

function addSubmitFeedbackListener() {
  const submitFeedbackElem = document.querySelector(".js-submit-feedback");
  if (!submitFeedbackElem) return;

  submitFeedbackElem.addEventListener("click", async () => {
    const feedbackInput = document.querySelector(".js-feedback").value.trim();

    if (!feedbackInput || feedbackInput === "")
      return showErrorToast("User Error", "Please input a feedback");

    declineClearance(submitFeedbackElem.dataset.clearanceId, feedbackInput);
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
    showLoadingToast("Approving Clearance", "Please wait...");

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
