import fetchUserDetails from "../utils/getUserDetails.js";
import { hidePreloader, showError, showPreloader } from "../utils/utils.js";
import { fetchClearanceStatus } from "./service/fetchClearanceStatus.js";

const studentNameElem = document.querySelector("#student-name");
const clearanceCard = document.querySelector(".js-clearance-status-card");
const clearanceSteps = document.querySelector(".js-clearance-steps");

(async () => {
  try {
    showPreloader(document.body, "Loading...");

    const userDetails = await fetchUserDetails();
    // If fetching user Details fail, exit the function
    if (!userDetails) return;

    // Render student name onto page
    studentNameElem.innerHTML = userDetails.fullname;
    // Gets student clearance status
    const clearanceStatusArr = await fetchClearanceStatus(userDetails._id);

    // Creating HTML content for Clearance summary section
    let clearanceStepsHTML = "";
    clearanceStatusArr.forEach((clearanceStatus) => {
      const { roleName, clearanceProgress, clearanceScore } = clearanceStatus;
      const badgeColor =
        clearanceScore === 100
          ? "bg-success"
          : clearanceScore === 0
          ? "bg-danger"
          : "bg-warning";

      clearanceStepsHTML += `<div class="clearance-step">
                              <div
                                class="d-flex justify-content-between align-items-center"
                              >
                                <h5>${roleName}'s Approval</h5>
                                <span class="badge ${badgeColor}">${clearanceProgress}</span>
                              </div>
                              <div class="progress mb-3">
                                <div
                                  class="progress-bar progress-bar-striped progress-bar-animated ${badgeColor}"
                                  style="width: ${clearanceScore}%"
                                ></div>
                              </div>
                            </div>`;
    });
    clearanceSteps.innerHTML = clearanceStepsHTML;
  } catch (err) {
    showError(document.body, err.message);
    console.error(err);
  } finally {
    hidePreloader();
  }
})();
