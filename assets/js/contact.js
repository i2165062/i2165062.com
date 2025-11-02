const form = document.getElementById("contactForm");
const toast = document.getElementById("toast");
const submitBtn = document.getElementById("submitBtn");

/* ✅ Called by hCaptcha when solved */
window.captchaSolved = function () {
  submitBtn.disabled = false;
  submitBtn.classList.add("active");
};

/* ✅ Called by hCaptcha when expired */
window.captchaExpired = function () {
  submitBtn.disabled = true;
  submitBtn.classList.remove("active");
};

/* ✅ Handle form submit */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const captchaResponse = hcaptcha.getResponse();
  if (!captchaResponse) {
    alert("⚠️ Please verify that you are not a robot.");
    return;
  }

  fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" },
  })
    .then((response) => {
      if (response.ok) {
        toast.style.display = "block";
        form.reset();
        hcaptcha.reset();
        submitBtn.disabled = true; // lock again
        submitBtn.classList.remove("active");
        setTimeout(() => (toast.style.display = "none"), 4000);
      } else {
        alert("Something went wrong, please try again later.");
      }
    })
    .catch(() => {
      alert("Connection error. Please try again.");
    });
});
