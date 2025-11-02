const form = document.getElementById("contactForm");
const toast = document.getElementById("toast");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // ارسال فرم به Formspree
  fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" },
  })
    .then((response) => {
      if (response.ok) {
        toast.style.display = "block";
        form.reset();
        setTimeout(() => (toast.style.display = "none"), 4000);
      } else {
        alert("Something went wrong, please try again later.");
      }
    })
    .catch(() => {
      alert("Connection error. Please try again.");
    });
});
