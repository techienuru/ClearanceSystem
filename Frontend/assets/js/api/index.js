import { backendEndpoint } from "./config/config.js";
import { saveAccessToken } from "./utils/auth.js";

const signinForm = document.querySelector(".js-signin-form");
const emailMatricField = document.querySelector(".js-email-matric-field");
const passwordField = document.querySelector(".js-password-field");
const submitBtn = document.querySelector(".js-submit-btn");
const errorBadge = document.querySelector(".js-error-badge");

signinForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const prevBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = "Loading...";

  const emailMatric = emailMatricField.value;
  const password = passwordField.value;

  // Checks if emaulMatricField includes @
  // Signifying it is an email.
  const identifier = emailMatricField.value.trim();
  const payload = {};
  if (identifier.includes("@")) {
    payload.email = identifier;
  } else {
    payload.matric = identifier;
  }
  payload.password = password;

  try {
    const res = await fetch(
      `${backendEndpoint}/auth`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { credentials: "include" }
    );

    const authResponse = await res.json();
    if (authResponse?.error) throw new Error(authResponse.error);
    console.log(authResponse);

    const { accessToken, message, role } = authResponse;
    saveAccessToken(accessToken);
    errorBadge.innerText = message;
    if (role === "Student") {
      window.location.href = "./student/dashboard.html";
    } else if (role === "Officer") {
      window.location.href = "./Officer/dashboard.html";
    }
  } catch (err) {
    console.error(err);
    errorBadge.innerText = err.message;
  } finally {
    submitBtn.innerHTML = prevBtnText;
  }
});
