import { backendEndpoint } from "../config/config.js";
import { authHeaders } from "../utils/auth.js";
import fetchUserDetails from "../utils/getUserDetails.js";
import { hidePreloader, showError, showPreloader } from "../utils/utils.js";

const walletBalanceElem = document.querySelector(".js-wallet-balance");
const addReqForm = document.querySelector(".js-add-requirement-form");
const amountElem = document.querySelector(".js-amount");
const addFundsBtn = document.querySelector(".js-add-funds");

loadPage();

async function loadPage() {
  try {
    showPreloader(document.body, "Loading...");
    const userDetails = await fetchUserDetails();
    // If fetching user Details fail, exit the function
    if (!userDetails) return;

    walletBalanceElem.innerHTML = `₦${userDetails.wallet.balance}.00`;
  } catch (err) {
    showError(document.body, err.message);
    console.error(err);
  } finally {
    hidePreloader();
  }
}

addReqForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  //   Original Text inside "Add funds"/submit button
  const addFundsBtnText = addFundsBtn.innerText;

  //   Formatting user input (amount)
  const rawAmount = amountElem.value.trim();
  const cleanedAmount = rawAmount.replace(/,/g, "");
  const amount = Number(cleanedAmount);

  try {
    addFundsBtn.innerText = "Adding Funds...";

    const req = await fetch(`${backendEndpoint}/api/students/wallet/credit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
      body: JSON.stringify({ amount }),
    });

    const res = await req.json();

    if (!req.ok && res?.error) {
      throw new Error(res.error || "Network Connection fail");
    }

    // Update the balance on the screen
    await loadPage();
  } catch (err) {
    showError(document.body, err.message);
  } finally {
    addFundsBtn.innerText = addFundsBtnText;
  }
});
