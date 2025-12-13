// --- Simple horizontal drag scroll ---
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

// --- Card subtle 3D hover tilt ---
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

/* ---------- Dynamic Reflection Light ---------- */
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

/* ---------- Dots Sync with Scroll ---------- */
const dots = document.querySelectorAll('.dot');
if (rail && dots.length) {
  rail.addEventListener('scroll', () => {
    const scrollPosition = rail.scrollLeft;
    const totalWidth = rail.scrollWidth - rail.clientWidth;
    const index = Math.round((scrollPosition / totalWidth) * (dots.length - 1));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  });
}

/* =========================================================
   Drawer Menu (Left)
   ========================================================= */
const drawer = document.getElementById('drawer');
const drawerBtn = document.getElementById('drawerBtn');
const drawerClose = document.getElementById('drawerClose');
const drawerBackdrop = document.getElementById('drawerBackdrop');

function openDrawer() {
  if (!drawer) return;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  if (drawerBtn) drawerBtn.setAttribute('aria-expanded', 'true');

  if (drawerBackdrop) {
    drawerBackdrop.hidden = false;
  }

  // prevent body horizontal jump, keep current behavior
  document.body.style.overflowX = 'hidden';
}

function closeDrawer() {
  if (!drawer) return;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  if (drawerBtn) drawerBtn.setAttribute('aria-expanded', 'false');

  if (drawerBackdrop) {
    drawerBackdrop.hidden = true;
  }

  document.body.style.overflowX = 'hidden';
}

if (drawerBtn) {
  drawerBtn.addEventListener('click', () => {
    const isOpen = drawer && drawer.classList.contains('is-open');
    if (isOpen) closeDrawer();
    else openDrawer();
  });
}

if (drawerClose) {
  drawerClose.addEventListener('click', closeDrawer);
}

if (drawerBackdrop) {
  drawerBackdrop.addEventListener('click', closeDrawer);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDrawer();
});

// Close drawer when clicking a menu item (optional but clean)
document.querySelectorAll('.drawer__item').forEach(a => {
  a.addEventListener('click', () => closeDrawer());
});
