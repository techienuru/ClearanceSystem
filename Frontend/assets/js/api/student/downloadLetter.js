import fetchUserDetails from "../utils/getUserDetails.js";
import { showErrorToast, showLoadingToast } from "../utils/utils.js";
import { fetchClearanceStatus } from "./service/fetchClearanceStatus.js";

const nameElem = document.querySelector(".js-student-name");
const matricnoElem = document.querySelector(".js-student-matricno");
const facultyElem = document.querySelector(".js-student-faculty");
const departmentElem = document.querySelector(".js-student-department");
const clearanceStatusElem = document.querySelector(".js-clearance-status");
const dowloadBtnsElem = document.querySelector(".js-download-button-wrapper");

loadPage();

async function loadPage() {
  try {
    showLoadingToast("Page is Loading", "Please wait...");
    const userDetails = await fetchUserDetails();
    // If fetching user Details fail, exit the function
    if (!userDetails) return;

    // fetching Department details & Faculty details

    // Displaying Student details on the page
    nameElem.innerHTML = `
    <strong>Name:</strong> ${userDetails.fullname}
    `;
    matricnoElem.innerHTML = `
    <strong>Matriculation Number:</strong> ${userDetails.matric_no}
    `;
    facultyElem.innerHTML = `
    <strong>Faculty:</strong> ${userDetails.faculty_name}
    `;
    departmentElem.innerHTML = `
    <strong>Department:</strong> ${userDetails.department_name}
    `;

    // Gets student clearance status
    const clearanceStatusArr = await fetchClearanceStatus(userDetails._id);

    // Checks if student has cleared all the departments
    let isFullyCleared = [];

    // Render Status section onto the page
    displayStatus(clearanceStatusArr, isFullyCleared);

    // Render "Download Clearance" Button
    displayDownloadBtn(isFullyCleared);

    Swal.close();
  } catch (err) {
    console.error(err);
    Swal.close();
    showErrorToast("Network Error", err.message);
  }
}

function displayStatus(clearanceStatusArr, isFullyCleared) {
  clearanceStatusElem.innerHTML = clearanceStatusArr
    .map((cs) => {
      const { roleName, clearanceScore, clearanceProgress } = cs;
      const formattedRoleName = roleName.replace(/ Officer/i, "'s");
      const badgeColor =
        clearanceScore === 100
          ? "approved"
          : clearanceScore === 0
          ? "rejected"
          : "pending";
      isFullyCleared.push(clearanceScore);

      return `
            <div class="status">
                <h6>${formattedRoleName} Clearance</h6>
                <span class="badge badge-${badgeColor}">${clearanceProgress}</span>
            </div>
        `;
    })
    .join("");
}

function displayDownloadBtn(isFullyCleared) {
  // Checks if all progress Score is = 100%
  const isStudentCleared = isFullyCleared.every(
    (clearedStatus) => clearedStatus === 100
  );

  if (isStudentCleared) {
    dowloadBtnsElem.innerHTML = `
            <div class="download-btn js-download-btn">
                <a href="#">Download Clearance Letter</a>
            </div>
        `;
    addDownloadListener();
  } else {
    dowloadBtnsElem.innerHTML = `
            <div class="download-btn disabled">
                <span>Download Clearance Letter</span>
            </div>
        `;
  }
}

function addDownloadListener() {
  const downloadBtn = document.querySelector(".js-download-btn");

  downloadBtn.addEventListener("click", () => {
    window.print();
  });
}
