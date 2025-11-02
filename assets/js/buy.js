// ========================================================
// i2165062 — BUY PAGE SCRIPT (FINAL VERSION)
// ========================================================

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

  // === دریافت داده کشورها از فایل JSON ===
  fetch("assets/data/countries.json")
    .then(res => res.json())
    .then(data => {
      countries = data;
      renderList(countries);
    })
    .catch(err => console.error("❌ Error loading countries.json", err));

  // === دریافت پیام‌های خوش‌آمد از فایل JSON ===
  fetch("assets/data/greetings.json")
    .then(res => res.json())
    .then(data => (greetingsMap = data))
    .catch(() => {
      greetingsMap = { default: "Welcome!" };
    });

  // === تابع ساخت ایموجی پرچم از ISO ===
  const flagEmoji = cc =>
    /^[A-Z]{2}$/.test(cc)
      ? String.fromCodePoint(...[...cc].map(c => 127397 + c.charCodeAt()))
      : "🌍";

  // === ساخت لیست کشورها ===
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

  // === باز و بسته کردن پنل کشور ===
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

  // === جستجوی زنده کشورها ===
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    const filtered = countries.filter(c => c.name.toLowerCase().includes(q));
    renderList(filtered);
  });

  // === انتخاب کشور و نمایش toast ===
  function selectCountry({ name, code, lang }) {
    hidden.value = name;
    trigger.querySelector(".country-trigger-text").textContent = name;
    trigger.querySelector(".country-trigger-flag").textContent = flagEmoji(code.replace(/-.+$/, ""));
    closePanel();

    // پیام خوش‌آمد به زبان کشور انتخاب‌شده
    const phrase = greetingsMap[lang] || greetingsMap.default || "Welcome!";
    showToast(`${flagEmoji(code)} ${phrase}`);
  }

  // === تابع نمایش toast ===
  function showToast(message) {
    toast.innerHTML = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  // === ارسال فرم به Formspree ===
  form.addEventListener("submit", async e => {
    e.preventDefault();

    // بررسی انتخاب کشور
    if (!hidden.value) {
      showToast("🌍 Please select your country");
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
