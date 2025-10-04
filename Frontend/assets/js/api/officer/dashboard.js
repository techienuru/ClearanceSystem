import fetchUserDetails from "../utils/getUserDetails.js";
import { showErrorToast, showLoadingToast } from "../utils/utils.js";

const officerNameElem = document.querySelector(".js-officer-fullname");
const officerRoleElems = document.querySelectorAll(".js-officer-role-name");

loadPage();

async function loadPage() {
  try {
    showLoadingToast("Page is Loading", "Please wait...");

    const userDetails = await fetchUserDetails();
    // If fetching user Details fail, exit the function
    if (!userDetails) return;

    // Render officer name onto page
    officerNameElem.innerHTML = userDetails.fullname;

    // Render officer role name onto page
    officerRoleElems.forEach((elem) => {
      elem.innerHTML = userDetails.role_id.role_name
        .replace(/officer/i, "")
        .trim();
    });

    Swal.close();
  } catch (err) {
    console.error(err);
    Swal.close();
    showErrorToast("Network Error", err.message);
  }
}
