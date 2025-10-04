import { backendEndpoint } from "../config/config.js";
import { authHeaders } from "../utils/auth.js";
import fetchUserDetails from "../utils/getUserDetails.js";
import {
  hidePreloader,
  showError,
  showErrorToast,
  showLoadingToast,
  showPreloader,
  showSuccessToast,
} from "../utils/utils.js";
import { fetchOfficersRoles } from "./service/fetchOfficersRoles.js";

const selectionArea = document.querySelector(".js-selection-area");
const formSection = document.querySelector(".js-clearance-form-section");

loadPage();

async function loadPage() {
  try {
    showPreloader(document.body, "Loading...");
    const userDetails = await fetchUserDetails();
    // If fetching user Details fail, exit the function
    if (!userDetails) return;

    // Get Officer's roles
    const officersRoles = await fetchOfficersRoles();
    displaySelectionBtns(officersRoles, selectionArea);

    // Display the selector for filtering requirements (base on officer's department)
    document.querySelectorAll(".js-officer-selector").forEach((selector) => {
      selector.addEventListener("click", async () => {
        const roleId = selector.dataset.roleId;
        const roleName = selector.dataset.roleName;

        // Fetch requirements for the selected department
        const requirementsArr = await fetchRequirements(roleId);

        // Display the form (for user to submit requirements)
        displayRequirements(requirementsArr, roleName);
      });
    });
  } catch (err) {
    showError(document.body, err.message);
    console.error(err);
  } finally {
    hidePreloader();
  }
}

function displaySelectionBtns(officersRoles, selectionArea) {
  const btnColors = ["primary", "success", "info"];
  let btnColorsIndex = 0;

  const HTML = officersRoles
    .map((role) => {
      const elem = `<button type="button" class="btn btn-${
        btnColors[btnColorsIndex]
      } mx-2 js-officer-selector" data-role-name="${
        role.role_name
      }" data-role-id="${role._id}">
            Submit to ${role.role_name.replace(/officer/i, "").trim()}
        </button>
                      `;

      btnColorsIndex++;
      return elem;
    })
    .join("");

  selectionArea.innerHTML = HTML;
}

async function fetchRequirements(roleId) {
  try {
    const req = await fetch(
      `${backendEndpoint}/api/students/requirements/${roleId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
      }
    );

    const res = await req.json();

    if (!req.ok && res?.error) throw new Error(res.error || "Network error");

    return res.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

function displayRequirements(requirementsArr, roleName) {
  const cleanRoleName = roleName.replace(/officer/i, "").trim();

  formSection.innerHTML = `
        <h4>Submit Clearance for ${cleanRoleName}</h4>
        <form id="${cleanRoleName.toLowerCase()}ClearanceForm" class="js-clearance-form">
            <table class="table">
                <thead>
                    <tr>
                        <th>Document Name</th>
                        <th>Type</th>
                        <th>Amount/Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="documentList">
                    ${requirementsArr
                      .map((req) => generateDocumentRow(req))
                      .join("")}
                </tbody>
            </table>
        </form>
    `;

  attachDocumentActions();
}

// Function to generate a row for each document requirement
function generateDocumentRow(req) {
  const { title, type, _id, role_id, amount, description, status } = req;

  console.log(req);

  //   Badge color for type text
  const badgeColor = type === "Payment" ? "info" : "warning";
  // Checks if it should display amount or description
  const amountDesc = amount ? amount : description;
  //   Checks if it should display "Make Payment Button" or "Paid" badge
  const paymentAction = status
    ? `<span class="badge bg-success">Paid</span>`
    : `<button type="button" class="pay-btn bg-info js-pay-btn" data-req-id="${_id}" data-role-id="${role_id._id}">Make payment</button>`;

  const actionHTML =
    type === "Payment"
      ? `<div class="input-group">
            ${paymentAction}
        </div>`
      : `<div class="input-group">
            <input type="file" class="form-control" name="" id="upload-${_id}" accept=".pdf,.png,.jpeg">
            <button type="button" class="upload-btn bg-warning js-upload-btn" data-req-id="${_id}" data-role-id="${role_id._id}">Upload</button>
        </div>`;

  return `
        <tr class="document-row">
            <td class="document-name">${title}</td>
            <td>
            <span class="badge bg-${badgeColor}">${type}</span>
            </td>
            <td class="document-name">${amountDesc}</td>
            <td>
                ${actionHTML}        
            </td>
        </tr>
    `;
}

async function payClearance(reqId, roleId, e) {
  const btnText = e.target.innerText;

  try {
    e.target.innerText = "Processing...";

    showLoadingToast("Processing Payment", "Please wait...");

    const req = await fetch(`${backendEndpoint}/api/students/clearance/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
      body: JSON.stringify({
        requirement_id: reqId,
        role_id: roleId,
      }),
    });

    const res = await req.json();

    if (!req.ok && res?.error)
      throw new Error(res.error || "Network error. Could not reach server");

    // show success dialog
    Swal.close();
    showSuccessToast("Payment successful");
    window.location.href = window.location.href;
  } catch (err) {
    console.error(err);
    Swal.close();
    showErrorToast("Network error", err.message);
  } finally {
    e.target.innerText = btnText;
  }
}

async function uploadClearance(reqId, roleId, e) {
  const fileInput = document.querySelector(`#upload-${reqId}`);
  const file = fileInput.files[0];
  if (!file) return showErrorToast("User error", "Please Choose a file");

  //   Building form data to send to backend
  const fd = new FormData();
  fd.append("document", file);
  fd.append("requirement_id", reqId);
  fd.append("role_id", roleId);
  // requirement_id role_id file

  const btnText = e.target.innerText;

  try {
    e.target.innerText = "Uploading...";

    const req = await fetch(
      `${backendEndpoint}/api/students/clearance/upload`,
      {
        method: "POST",
        headers: { ...authHeaders() },
        credentials: "include",
        body: fd,
      }
    );

    const res = await req.json();

    if (!req.ok && res?.error) throw new Error(res.error || "Upload Failed");

    Swal.close();
    showSuccessToast(res.message);
  } catch (err) {
    console.log(err);
    Swal.close();
    showErrorToast("Network Error", err.message);
  } finally {
    e.target.innerText = btnText;
  }
}

function attachDocumentActions() {
  // Prevent clearance form from submission
  document
    .querySelector(".js-clearance-form")
    .addEventListener("submit", (e) => e.preventDefault());

  // Adding Listener to "Make Payment" Button
  document.querySelectorAll(".js-pay-btn").forEach((payBtn) => {
    const { reqId, roleId } = payBtn.dataset;

    payBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await payClearance(reqId, roleId, e);
    });
  });

  // Adding Listener to "Upload" Button
  document.querySelectorAll(".js-upload-btn").forEach((uploadBtn) => {
    const { reqId, roleId } = uploadBtn.dataset;

    uploadBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await uploadClearance(reqId, roleId, e);
    });
  });
}
