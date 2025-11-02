// ========================================================
// i2165062 — BUY PAGE SCRIPT (FINAL VERSION WITH hCaptcha)
// ========================================================

// --- 1️⃣ کنترل کپچا ---
window.captchaSolved = function () {
  const btn = document.getElementById("submitBtn");
  if (btn) btn.disabled = false;
};

window.captchaExpired = function () {
  const btn = document.getElementById("submitBtn");
  if (btn) btn.disabled = true;
};

// --- 2️⃣ پس از بارگذاری صفحه ---
document.addEventListener("DOMContentLoaded", () => {

  // === عناصر اصلی ===
  const form = document.getElementById("buyForm");
  const trigger = document.getElementById("countryTrigger");
  const panel = document.getElementById("countryPanel");
  const listEl = document.getElementById("countryList");
  const search = document.getElementById("countrySearch");
  const hidden = document.getElementById("countryHidden");
  const toast = document.getElementById("countryToast");

  let countries = [];
  let greetingsMap = {};

  // --- 3️⃣ دریافت داده کشورها از JSON ---
  fetch("assets/data/countries.json")
    .then(res => res.json())
    .then(data => {
      countries = data;
      renderList(countries);
    })
    .catch(err => console.error("❌ Error loading countries.json", err));

  // --- 4️⃣ دریافت پیام خوش‌آمد از JSON ---
  fetch("assets/data/greetings.json")
    .then(res => res.json())
    .then(data => (greetingsMap = data))
    .catch(() => {
      greetingsMap = { default: "Welcome!" };
    });

  // --- 5️⃣ تابع تبدیل ISO Country Code به ایموجی پرچم ---
  const flagEmoji = cc =>
    /^[A-Z]{2}$/.test(cc)
      ? String.fromCodePoint(...[...cc].map(c => 127397 + c.charCodeAt()))
      : "🌍";

  // --- 6️⃣ ساخت لیست کشورها ---
  function renderList(items) {
    listEl.innerHTML = "";
    const frag = document.createDocumentFragment();

    items.forEach(({ name, code, lang }) => {
      const li = document.createElement("li");
      li.className = "country-item";
      li.setAttribute("role", "option");
      li.innerHTML = `
        <span class="country-flag">${flagEmoji(code.replace(/-.+$/, ""))}</span>
        <span class="country-name">${name}</span>
      `;
      li.addEventListener("click", () => selectCountry({ name, code, lang }));
      frag.appendChild(li);
    });

    listEl.appendChild(frag);
  }

  // --- 7️⃣ باز و بسته کردن پنل کشور ---
  function openPanel() {
    panel.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    search.value = "";
    search.focus();
    renderList(countries);
  }

  function closePanel() {
    panel.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", () => {
    panel.classList.contains("open") ? closePanel() : openPanel();
  });

  document.addEventListener("click", e => {
    if (!panel.contains(e.target) && !trigger.contains(e.target)) closePanel();
  });

  // --- 8️⃣ جستجوی زنده کشورها ---
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    const filtered = countries.filter(c => c.name.toLowerCase().includes(q));
    renderList(filtered);
  });

  // --- 9️⃣ انتخاب کشور و نمایش پیام خوش‌آمد ---
  function selectCountry({ name, code, lang }) {
    hidden.value = name;
    trigger.querySelector(".country-trigger-text").textContent = name;
    trigger.querySelector(".country-trigger-flag").textContent = flagEmoji(code.replace(/-.+$/, ""));
    closePanel();

    // پیام خوش‌آمد به زبان کشور انتخاب‌شده
    const phrase = greetingsMap[lang] || greetingsMap.default || "Welcome!";
    showToast(`${flagEmoji(code)} ${phrase}`);
  }

  // --- 🔟 تابع نمایش Toast ---
  function showToast(message) {
    toast.innerHTML = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  // --- 11️⃣ ارسال فرم به Formspree ---
  form.addEventListener("submit", async e => {
    e.preventDefault();

    // بررسی انتخاب کشور
    if (!hidden.value) {
      showToast("🌍 Please select your country");
      return;
    }

    // بررسی کپچا (حتماً وجود داشته باشد)
    const captchaResponse = hcaptcha.getResponse();
    if (!captchaResponse) {
      showToast("⚠️ Please verify that you are not a robot");
      return;
    }

    const formData = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        form.reset();
        hidden.value = "";
        hcaptcha.reset(); // ریست کپچا
        document.getElementById("submitBtn").disabled = true; // قفل دوباره دکمه
        trigger.querySelector(".country-trigger-flag").textContent = "🌍";
        trigger.querySelector(".country-trigger-text").textContent = "Select your country";

        // حذف کارت قبلی در صورت وجود
        document.querySelector(".success-card")?.remove();

        // ساخت کارت تأیید زیبا
        const card = document.createElement("div");
        card.className = "success-card";
        card.innerHTML = `
          <h2>✅ Registration Complete</h2>
          <p>Thank you for joining <strong>i2165062</strong>.<br>
          You’ll receive early access details via email soon.</p>
        `;
        document.body.appendChild(card);

        // حذف خودکار کارت بعد از چند ثانیه
        setTimeout(() => {
          card.style.transition = "opacity 0.5s";
          card.style.opacity = "0";
          setTimeout(() => card.remove(), 600);
        }, 5000);
      } else {
        showToast("⚠️ Submission failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      showToast("🚫 Connection error. Try again.");
    }
  });
});
