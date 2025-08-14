import { backendUrl } from "./config";

const signinForm = document.querySelector(".js-signin-form");
const emailMatricField = document.querySelector(".js-email-matric-field");
const passwordField = document.querySelector(".js-password-field");
const submitBtn = document.querySelector(".js-submit-btn");

signinForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.innerHTML = "Loading...";

  const emailMatric = emailMatricField.value;
  const password = passwordField.value;

  const res = await fetch(`${backendUrl}/auth/`, {
    method: POST,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ emailMatric, password }),
  });
});
