/* ---------- Horizontal drag scroll ---------- */
const rail = document.getElementById('rail');
let isDown = false, startX, scrollLeft;

if (rail) {
  rail.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - rail.offsetLeft;
    scrollLeft = rail.scrollLeft;
  });
  rail.addEventListener('mouseleave', () => isDown = false);
  rail.addEventListener('mouseup', () => isDown = false);
  rail.addEventListener('mousemove', (e) => {
    if(!isDown) return;
    e.preventDefault();
    const x = e.pageX - rail.offsetLeft;
    const walk = (x - startX) * 1.1;
    rail.scrollLeft = scrollLeft - walk;
  });
}

/* ---------- 3D hover tilt ---------- */
document.querySelectorAll('.card').forEach(card => {
  const base = card.getAttribute('data-tilt') || 'center';
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const tiltX = y * -5;
    const tiltY = x * 5;
    const rotZ = base === 'left' ? -2 : base === 'right' ? 2 : 0;
    card.style.transform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${rotZ}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    const map = {
      left: 'perspective(700px) rotateY(8deg) rotateZ(-2deg)',
      right: 'perspective(700px) rotateY(-8deg) rotateZ(2deg)',
      center: 'perspective(700px)'
    };
    card.style.transform = map[base];
  });
});

/* ---------- Dynamic reflection light ---------- */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
  card.addEventListener('mouseleave', () => {
    card.style.removeProperty('--mx');
    card.style.removeProperty('--my');
  });
});

/* =========================================================
   ✨ Friendly Coming Soon Modal ✨
   ========================================================= */
const modalHTML = `
  <div id="comingModal" class="coming-modal">
    <div class="coming-box">
      <div class="emoji">🌍</div>
      <h2>Hey Explorer!</h2>
      <p>This section is <strong>coming soon</strong> — stay tuned for amazing stories and art!</p>
      <button id="closeComing" class="close-btn">Got it!</button>
    </div>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', modalHTML);

const comingModal = document.getElementById('comingModal');
const closeComing = document.getElementById('closeComing');

/* باز و بسته کردن مودال */
function openComingSoon() {
  comingModal.classList.add('active');
}
closeComing.addEventListener('click', () => {
  comingModal.classList.remove('active');
});
comingModal.addEventListener('click', e => {
  if (e.target === comingModal) comingModal.classList.remove('active');
});

/* فعال برای کارت‌های غیر ایران */
document.querySelectorAll('.card').forEach(card => {
  const label = card.querySelector('.overlay span')?.textContent.trim();
  if (label !== 'Iran') {
    card.addEventListener('click', e => {
      e.preventDefault();
      openComingSoon();
    });
  }
});
