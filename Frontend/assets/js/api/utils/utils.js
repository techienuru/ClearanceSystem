export const showPreloader = (wrapperElem, message) => {
  // Checks if elements exist
  const preloaderWrapperElem = document.querySelector(".preloader-wrapper");
  if (preloaderWrapperElem) {
    preloaderWrapperElem.style.display = "initial";
    return;
  }

  // Create Preloader Wrapper
  const preloaderWrapper = document.createElement("div");
  preloaderWrapper.classList.add("preloader-wrapper");

  // Creates Preloader
  const preloader = document.createElement("div");
  preloader.innerText = `${message}`;
  preloader.classList.add("preloader");

  //   Append the wrapper into preloader
  preloaderWrapper.appendChild(preloader);

  //   Change Position of wrapper to relative
  wrapperElem.style.position = "relative";

  //   Putting Preloade into the wrapper Element
  wrapperElem.appendChild(preloaderWrapper);
};

export const hidePreloader = () => {
  document.querySelector(".preloader-wrapper").style.display = "none";
};

export const showError = (wrapperElem, message) => {
  // Create Error Wrapper
  const errorWrapper = document.createElement("div");
  errorWrapper.classList.add("error-wrapper");

  // Creates Preloader
  const error = document.createElement("div");
  error.innerHTML = `<p>"${message}"</p> <p>Please reload the page</p>`;
  error.classList.add("text-center");
  error.classList.add("error");

  //   Append the wrapper into preloader
  errorWrapper.appendChild(error);

  //   Change Position of wrapper to relative
  wrapperElem.style.position = "relative";

  //   Putting Preloade into the wrapper Element
  wrapperElem.appendChild(errorWrapper);
};

export const hideError = () => {
  document.querySelector(".error-wrapper").style.display = "none";
};

export const showLoadingToast = (title, html) => {
  Swal.fire({
    title,
    html,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading(); // Spinner
    },
  });
};

export const showSuccessToast = (title) => {
  Swal.fire({
    icon: "success",
    title,
  });
};

export const showErrorToast = (title, text) => {
  Swal.fire({
    title,
    icon: "error",
    text,
  });
};

export const redirectToHome = () => {
  showPreloader(document.body, "Session Timed out. Redirecting to homepage...");
  setTimeout(() => {
    return (window.location.href = "../");
  }, 1500);
};
