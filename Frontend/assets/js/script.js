import { logoutUser } from "./api/utils/auth.js";

document.querySelector(".js-logout").addEventListener("click", (e) => {
  e.preventDefault();
  if (confirm("Are you sure you want to logout?")) logoutUser();
});
