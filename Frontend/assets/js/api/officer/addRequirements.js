import { backendEndpoint } from "../config/config.js";
import { authHeaders } from "../utils/auth.js";
import fetchUserDetails from "../utils/getUserDetails.js";
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "../utils/utils.js";

const existingReqElem = document.querySelector(".js-existing-req");
const addReqForm = document.querySelector(".js-add-requirement-form");

addReqForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Getting form input
  const titleInput = addReqForm
    .querySelector(".js-requirement-title")
    .value.trim();
  // Checking which type was selected (payemnt/upload)
  const selectedType = addReqForm.querySelector(
    "input[name='type']:checked"
  )?.value;

  // If no type was selected, notify user
  if (!selectedType)
    return showErrorToast(
      "User Error",
      "Please select requirement type (payment/upload) before submitting"
    );

  // Collecting input base on type selected
  const payload = { title: titleInput, type: selectedType };

  let amountInput, descInput;
  // Collecting amountInput if payment was selected
  // Else collect description input
  if (selectedType === "Payment") {
    amountInput = addReqForm.querySelector("#amount").value;

    if (!amountInput || amountInput === "" || amountInput <= 0)
      return showErrorToast("User Error", "Please enter a valid amount");

    payload.amount = Number(amountInput);
    payload.description = undefined;
  } else if (selectedType === "Upload") {
    descInput = addReqForm.querySelector("#description").value.trim();

    if (!descInput)
      return showErrorToast("User Error", "Please enter a description");

    payload.description = descInput;
    payload.amount = undefined;
  }

  // Send API request to Backend to add requirement
  try {
    showLoadingToast("Adding requirement", "Please wait..");
    const reqAdded = await addRequirement(payload);

    if (!reqAdded) return;

    Swal.close();
    showSuccessToast("Requirement added successfully");
    return setTimeout(async () => {
      await loadPage();
    }, 1500);
  } catch (err) {
    Swal.close();
    showErrorToast("Network Error", err.message);
  }
});

loadPage();

async function loadPage() {
  try {
    showLoadingToast("Page is Loading", "Please wait...");

    const userDetails = await fetchUserDetails();
    // If fetching user Details fail, exit the function
    if (!userDetails) return;

    const res = await fetch(`${backendEndpoint}/api/officers/requirements`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
    });
    const payload = await res.json();

    if (!res.ok || payload.error)
      throw new Error(payload.error || "Network error");

    Swal.close();

    const { requirementsDoc } = payload;

    // If there is no requirement set by officer
    if (requirementsDoc.length === 0) {
      existingReqElem.innerHTML = `
        <tr>
            <td colspan="4">
                <div
                class="d-flex flex-column flex-sm-row align-items-center justify-content-between p-3 rounded bg-light"
                >
                <div class="d-flex align-items-center">
                    <div>
                    <h6 class="mb-1">No requirements</h6>
                    <div class="text-muted small">
                        Use the form above to add a requirement.
                    </div>
                    </div>
                </div>
                </div>
            </td>
        </tr>
      `;
    } else if (requirementsDoc.length > 0) {
      const reqHTML = requirementsDoc
        .map((elem) => {
          return `
                <tr>
                    <td>${elem.title}</td>
                    <td>${elem.type}</td>
                    <td>${elem.amount || elem.description}</td>
                    <td>
                        <button
                            type="button"
                            class="btn btn-danger btn-sm js-delete-req"
                            data-req-id="${elem._id}"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
        `;
        })
        .join("");

      //   Render the requirements to the page
      existingReqElem.innerHTML = reqHTML;

      //   Add listeners to delete Buttons
      addDeleteListener();
    }
  } catch (err) {
    console.error(err);
    Swal.close();
    showErrorToast("Network Error", err.message);
  }
}

function addDeleteListener() {
  document.querySelectorAll(".js-delete-req").forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", async () => {
      if (confirm("This action is irreversible!"))
        await deleteRequirement(deleteBtn.dataset.reqId);
    });
  });
}

async function deleteRequirement(reqId) {
  try {
    if (!reqId) throw new Error("Invalid requirement ID");

    showLoadingToast("Deleting Requirement", "Please wait...");

    const req = await fetch(
      `${backendEndpoint}/api/officers/requirements/${reqId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
      }
    );

    const res = await req.json();

    if (!req.ok || res.error) throw new Error("Network Error" || res.error);

    Swal.close();
    showSuccessToast("Deleted successfully");

    return setTimeout(async () => {
      await loadPage();
    }, 1500);
  } catch (err) {
    console.log(err);
    Swal.close();
    showErrorToast("Netwrork Error", err.message);
  }
}

async function addRequirement(payload) {
  try {
    if (!payload) throw new Error("Form inputs not complete");

    const req = await fetch(`${backendEndpoint}/api/officers/requirements`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
      body: JSON.stringify({ ...payload }),
    });

    const res = await req.json();

    if (!req.ok || res.error) throw new Error("Network Error" || res.error);

    return res;
  } catch (err) {
    console.log(err);
    throw new Error(err.message);
  }
}
