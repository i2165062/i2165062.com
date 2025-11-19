// ==== CONFIG ====
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mblwgvbe';
const STORAGE_KEY = 'profiles_by_wallet_v1';

// ==== ELEMENTS ====
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');

const signupForm = document.getElementById('signupForm');
const backToSignupBtn = document.getElementById('backToSignup');

const summaryUsername = document.getElementById('summaryUsername');
const summaryEmail = document.getElementById('summaryEmail');

const character = document.getElementById('character');

const eyeColorSelect = document.getElementById('eyeColor');
const hairColorSelect = document.getElementById('hairColor');
const bodyColorSelect = document.getElementById('bodyColor');
const animationStyleSelect = document.getElementById('animationStyle');

const saveBtn = document.getElementById('saveCharacter');
const saveMessage = document.getElementById('saveMessage');

const connectWalletBtn = document.getElementById('connectWallet');
const walletAddressSpan = document.getElementById('walletAddress');

// ==== STATE ====
let userData = {
  username: '',
  email: '',
  // password فقط در حافظه نگه داشته می‌شود، نه ذخیره
  password: '',
  walletAddress: '',
  character: {
    eyeColor: eyeColorSelect.value,
    hairColor: hairColorSelect.value,
    bodyColor: bodyColorSelect.value,
    animation: 'none',
  },
};

// ==== HELPERS ====

function shortenAddress(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function loadAllProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse profiles', e);
    return {};
  }
}

function saveAllProfiles(profiles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles', e);
  }
}

function saveProfileForWallet(address) {
  if (!address) {
    alert('Please connect your wallet first.');
    return false;
  }

  const profiles = loadAllProfiles();

  profiles[address] = {
    username: userData.username,
    email: userData.email,
    character: { ...userData.character },
    lastUpdated: new Date().toISOString(),
  };

  saveAllProfiles(profiles);
  return true;
}

function loadProfileForWallet(address) {
  const profiles = loadAllProfiles();
  const profile = profiles[address];
  if (!profile) return;

  userData.username = profile.username || userData.username;
  userData.email = profile.email || userData.email;
  userData.character = {
    ...userData.character,
    ...(profile.character || {}),
  };

  // Sync UI
  summaryUsername.textContent = userData.username || '–';
  summaryEmail.textContent = userData.email || '–';

  eyeColorSelect.value = userData.character.eyeColor;
  hairColorSelect.value = userData.character.hairColor;
  bodyColorSelect.value = userData.character.bodyColor;
  animationStyleSelect.value = userData.character.animation || 'none';

  updateCharacter();
}

// ==== CHARACTER RENDER ====

function updateCharacter() {
  character.style.setProperty('--eye-color', userData.character.eyeColor);
  character.style.setProperty('--hair-color', userData.character.hairColor);
  character.style.setProperty('--body-color', userData.character.bodyColor);

  // Reset animation classes
  character.classList.remove('animate-bounce', 'animate-wave', 'animate-float');

  switch (userData.character.animation) {
    case 'bounce':
      character.classList.add('animate-bounce');
      break;
    case 'wave':
      character.classList.add('animate-wave');
      break;
    case 'float':
      character.classList.add('animate-float');
      break;
    default:
      // none
      break;
  }
}

// ==== WALLET CONNECT ====

async function connectWallet() {
  if (!window.ethereum) {
    alert('No wallet detected. Please install MetaMask or another Web3 wallet.');
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const address = accounts[0];
    userData.walletAddress = address;

    walletAddressSpan.textContent = shortenAddress(address);
    walletAddressSpan.title = address;

    // Load existing profile if exists
    loadProfileForWallet(address);
  } catch (err) {
    console.error(err);
    alert('Could not connect wallet.');
  }
}

connectWalletBtn.addEventListener('click', connectWallet);

// ==== FORMSPREE SUBMIT ====



// ==== STEP 1: SIGNUP HANDLER ====

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(signupForm);
  userData.username = formData.get('username') || '';
  userData.email = formData.get('email') || '';
  userData.password = formData.get('password') || '';

  summaryUsername.textContent = userData.username || '–';
  summaryEmail.textContent = userData.email || '–';

  // Go to step 2
  step1.classList.remove('active');
  step2.classList.add('active');
});

// Back button
backToSignupBtn.addEventListener('click', () => {
  step2.classList.remove('active');
  step1.classList.add('active');
});

// ==== CONTROLS EVENTS ====

eyeColorSelect.addEventListener('change', () => {
  userData.character.eyeColor = eyeColorSelect.value;
  updateCharacter();
});

hairColorSelect.addEventListener('change', () => {
  userData.character.hairColor = hairColorSelect.value;
  updateCharacter();
});

bodyColorSelect.addEventListener('change', () => {
  userData.character.bodyColor = bodyColorSelect.value;
  updateCharacter();
});

animationStyleSelect.addEventListener('change', () => {
  userData.character.animation = animationStyleSelect.value;
  updateCharacter();
});

// ==== SAVE BUTTON (LOCAL + FORMSPREE) ====


// ==== INIT ====
updateCharacter();

// ==== SAVE BUTTON (LOCAL + FORMSPREE + REDIRECT) ====

// ==== SAVE BUTTON (ONLY LOCAL + REDIRECT TO GAME) ====

saveBtn.addEventListener('click', () => {
  const address = userData.walletAddress;

  if (!address) {
    saveMessage.textContent = 'Please connect your wallet first.';
    saveMessage.style.color = '#e67e22';
    setTimeout(() => {
      saveMessage.textContent = '';
    }, 2500);
    return;
  }

  // 1) ذخیره پروفایل در localStorage (بر اساس آدرس والت)
  const okLocal = saveProfileForWallet(address);

  if (!okLocal) {
    saveMessage.textContent = 'Could not save profile locally.';
    saveMessage.style.color = '#e74c3c';
    setTimeout(() => {
      saveMessage.textContent = '';
    }, 2500);
    return;
  }

  // 2) ذخیره ظاهر کاراکتر برای دنیای 3D
  localStorage.setItem('currentCharacter', JSON.stringify(userData.character));

  // 3) پیام خوب برای کاربر
  saveMessage.textContent = 'Profile saved locally. Loading world...';
  saveMessage.style.color = '#27ae60';

  // 4) هدایت به صفحه بازی
  setTimeout(() => {
    window.location.href = 'game.html';
  }, 800);
});

