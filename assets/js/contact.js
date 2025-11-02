const form = document.getElementById("contactForm");
const toast = document.getElementById("toast");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // ✅ Check hCaptcha verification
  const captchaResponse = hcaptcha.getResponse();
  if (!captchaResponse) {
    alert("⚠️ Please verify that you are not a robot.");
    return;
  }

  // ✅ Send form data to Formspree
  fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" },
  })
    .then((response) => {
      if (response.ok) {
        toast.style.display = "block";
        form.reset();
        hcaptcha.reset(); // reset hCaptcha
        setTimeout(() => (toast.style.display = "none"), 4000);
      } else {
        alert("Something went wrong, please try again later.");
      }
    })
    .catch(() => {
      alert("Connection error. Please try again.");
    });
});
