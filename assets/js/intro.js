// i2165062 — Intro Slider FINAL with Back to Home button

const slides = document.querySelectorAll('.slide');
const nextBtn = document.getElementById('nextBtn');
const dots = document.querySelectorAll('.dot');
const backHome = document.createElement('button');

let current = 0;

// ساخت دکمه بازگشت به صفحه اصلی
backHome.textContent = 'Back to Home';
backHome.className = 'back-home';
document.querySelector('.slider').appendChild(backHome);
backHome.addEventListener('click', () => {
  window.location.href = 'index.html'; // مسیر صفحه اصلی
});

// نمایش اسلاید مشخص
function showSlide(i) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('is-active');
  current = (i + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots[current].classList.add('is-active');

  // کنترل نمایش دکمه‌ها
  if (current === slides.length - 1) {
    nextBtn.classList.add('hidden');
    backHome.classList.add('visible');
  } else {
    nextBtn.classList.remove('hidden');
    backHome.classList.remove('visible');
  }
}

// دکمه بعد
nextBtn.addEventListener('click', () => showSlide(current + 1));

// کیبورد
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') showSlide(current + 1);
  if (e.key === 'ArrowLeft') showSlide(current - 1);
});

// دات‌ها
dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));

// تاچ برای موبایل
let startX = 0;
document.addEventListener('touchstart', e => startX = e.touches[0].clientX);
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 40) dx < 0 ? showSlide(current + 1) : showSlide(current - 1);
});
