
// MrSol Builder — Phase 1 (frontend only)
// This file only handles UI state, previews, and mock data.
// Phase 2: replace mock functions with real API calls to your backend (Anchor server).

const state = {
  step: 1,
  template: "spl_token",
  features: new Set(),
  params: {
    tokenName: "MrSol Token",
    tokenSymbol: "MRSOL",
    totalSupply: 100, // millions
    taxPercent: 2,
    bonusPercent: 5,
    lockDuration: 90,
  },
  network: "devnet",
  walletConnected: false,
  walletAddress: null,
};

// Helpers
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));

function setStep(step) {
  state.step = step;

  // Update sidebar pills
  qsa(".step-pill").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.step) === step);
  });

  // Update panels
  qsa(".step-panel").forEach((panel) => {
    panel.classList.toggle("active", Number(panel.dataset.step) === step);
  });

  // Update nav buttons
  const prev = qs("#prevStepBtn");
  const next = qs("#nextStepBtn");

  prev.disabled = step === 1;
  next.textContent = step === 4 ? "Finish" : "Next step";

  updatePreview();
  if (step === 4) {
    updateSummary();
  }
}

function initStepNavigation() {
  qsa(".step-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = Number(btn.dataset.step);
      setStep(step);
    });
  });

  qs("#prevStepBtn").addEventListener("click", () => {
    if (state.step > 1) setStep(state.step - 1);
  });

  qs("#nextStepBtn").addEventListener("click", () => {
    if (state.step < 4) {
      setStep(state.step + 1);
    } else {
      showToast("You reached the last step. Use the Deploy button to simulate.");
    }
  });
}

function initTemplateSelection() {
  qsa('input[name="template"]').forEach((input) => {
    input.addEventListener("change", () => {
      state.template = input.value;
      updatePreview();
    });
  });
}

function initFeatureToggles() {
  qsa(".chip-toggle").forEach((chip) => {
    chip.addEventListener("click", () => {
      const feature = chip.dataset.feature;
      if (state.features.has(feature)) {
        state.features.delete(feature);
        chip.classList.remove("active");
      } else {
        state.features.add(feature);
        chip.classList.add("active");
      }
      updatePreview();
      updateSafeMode();
    });
  });
}

function initParameters() {
  const nameInput = qs("#tokenName");
  const symbolInput = qs("#tokenSymbol");
  const supplyRange = qs("#totalSupply");
  const supplyLabel = qs("#totalSupplyLabel");
  const taxRange = qs("#taxPercent");
  const taxLabel = qs("#taxPercentLabel");
  const bonusRange = qs("#bonusPercent");
  const bonusLabel = qs("#bonusPercentLabel");
  const lockRange = qs("#lockDuration");
  const lockLabel = qs("#lockDurationLabel");

  // Initial fill
  nameInput.value = state.params.tokenName;
  symbolInput.value = state.params.tokenSymbol;
  supplyLabel.textContent = state.params.totalSupply;
  taxLabel.textContent = state.params.taxPercent;
  bonusLabel.textContent = state.params.bonusPercent;
  lockLabel.textContent = state.params.lockDuration;

  nameInput.addEventListener("input", () => {
    state.params.tokenName = nameInput.value || "MrSol Token";
    updatePreview();
  });

  symbolInput.addEventListener("input", () => {
    state.params.tokenSymbol = symbolInput.value.toUpperCase();
    updatePreview();
  });

  supplyRange.addEventListener("input", () => {
    const v = Number(supplyRange.value);
    state.params.totalSupply = v;
    supplyLabel.textContent = v;
    updatePreview();
  });

  taxRange.addEventListener("input", () => {
    const v = Number(taxRange.value);
    state.params.taxPercent = v;
    taxLabel.textContent = v;
    updatePreview();
    updateSafeMode();
  });

  bonusRange.addEventListener("input", () => {
    const v = Number(bonusRange.value);
    state.params.bonusPercent = v;
    bonusLabel.textContent = v;
    updatePreview();
  });

  lockRange.addEventListener("input", () => {
    const v = Number(lockRange.value);
    state.params.lockDuration = v;
    lockLabel.textContent = v;
    updatePreview();
  });
}

function initNetworkSelector() {
  const select = qs("#networkSelect");
  select.value = state.network;

  select.addEventListener("change", () => {
    state.network = select.value;
    updatePreview();
    updateEstimation();
  });
}

function initWalletButton() {
  const btn = qs("#walletConnectBtn");
  const statusSpan = qs("#walletStatus .wallet-status-value");

  btn.addEventListener("click", () => {
    // Phase 1: fake wallet connect
    if (!state.walletConnected) {
      state.walletConnected = true;
      // Fake short address
      state.walletAddress = "MrSol...1234";
      btn.textContent = "Wallet connected";
      statusSpan.textContent = state.walletAddress;
      showToast("Wallet simulated as connected. In Phase 2, integrate Phantom/Backpack.");
    } else {
      state.walletConnected = false;
      state.walletAddress = null;
      btn.textContent = "Connect Wallet";
      statusSpan.textContent = "Not connected";
      showToast("Wallet disconnected (simulation).");
    }
  });
}

/* Preview + summary */

function updatePreview() {
  const titleEl = qs("#previewTitle");
  const subtitleEl = qs("#previewSubtitle");
  const templateEl = qs("#previewTemplate");
  const featuresEl = qs("#previewFeatures");
  const paramsEl = qs("#previewParams");
  const networkEl = qs("#previewNetwork");

  const tName = state.params.tokenName || "MrSol Token";
  const symbol = state.params.tokenSymbol || "MRSOL";

  titleEl.textContent = tName;
  subtitleEl.textContent = `${prettyTemplateName(state.template)} • ${prettyNetwork(
    state.network
  )}`;

  templateEl.textContent = prettyTemplateName(state.template);
  networkEl.textContent = prettyNetwork(state.network);

  // Features list
  featuresEl.innerHTML = "";
  if (state.features.size === 0) {
    const li = document.createElement("li");
    li.textContent = "No extra features selected yet.";
    featuresEl.appendChild(li);
  } else {
    [...state.features].forEach((f) => {
      const li = document.createElement("li");
      li.textContent = prettyFeatureName(f);
      featuresEl.appendChild(li);
    });
  }

  // Params list
  paramsEl.innerHTML = "";
  const rows = [
    [`Symbol`, symbol],
    [`Total supply`, `${state.params.totalSupply} M`],
    [`Transfer tax`, `${state.params.taxPercent}%`],
    [`Bonus rewards`, `${state.params.bonusPercent}%`],
    [`Lock duration`, `${state.params.lockDuration} days`],
  ];

  rows.forEach(([label, value]) => {
    const li = document.createElement("li");
    li.textContent = `${label}: ${value}`;
    paramsEl.appendChild(li);
  });

  updateEstimation();
}

function updateSummary() {
  const list = qs("#summaryList");
  list.innerHTML = "";

  const items = [
    ["Template", prettyTemplateName(state.template)],
    ["Network", prettyNetwork(state.network)],
    [
      "Features",
      state.features.size
        ? [...state.features].map((f) => prettyFeatureName(f)).join(", ")
        : "None",
    ],
    ["Token / Contract name", state.params.tokenName || "—"],
    ["Symbol", state.params.tokenSymbol || "—"],
    ["Total supply", `${state.params.totalSupply} M`],
    ["Transfer tax", `${state.params.taxPercent}%`],
    ["Bonus rewards", `${state.params.bonusPercent}%`],
    ["Lock duration", `${state.params.lockDuration} days`],
    [
      "Wallet",
      state.walletConnected ? state.walletAddress : "Not connected (simulation)",
    ],
  ];

  items.forEach(([label, value]) => {
    const li = document.createElement("li");
    li.textContent = `${label}: ${value}`;
    list.appendChild(li);
  });
}

function prettyTemplateName(value) {
  switch (value) {
    case "spl_token":
      return "SPL Token";
    case "staking":
      return "Staking Pool";
    case "vesting":
      return "Vesting / Team Lock";
    case "airdrop":
      return "Airdrop Engine";
    default:
      return value;
  }
}

function prettyNetwork(value) {
  switch (value) {
    case "devnet":
      return "Devnet";
    case "testnet":
      return "Testnet";
    case "mainnet":
      return "Mainnet";
    default:
      return value;
  }
}

function prettyFeatureName(value) {
  const map = {
    staking_rewards: "Staking rewards",
    bonus_system: "Bonus system",
    airdrop_module: "Airdrop module",
    tax_on_transfer: "Transfer tax",
    owner_pause: "Owner pause switch",
    anti_whale: "Anti-whale limits",
    freeze_forever: "Freeze forever (Danger)",
  };
  return map[value] || value;
}

/* Estimation + safe-mode */

function updateEstimation() {
  const estMain = qs("#estCostMain");

  // Just a fake formula for now
  let base = 0.05; // baseline cost
  if (state.template === "staking" || state.template === "vesting") base += 0.03;
  if (state.template === "airdrop") base += 0.02;

  base += state.features.size * 0.01;

  if (state.network === "mainnet") base *= 1.5;
  if (state.network === "testnet") base *= 1.1;

  estMain.textContent = `~ ${base.toFixed(3)} SOL`;
}

function updateSafeMode() {
  const box = qs("#safeModeBox");
  const message = qs("#safeMessage");

  const hasFreezeForever = state.features.has("freeze_forever");
  const highTax = state.params.taxPercent >= 10;

  if (hasFreezeForever || highTax) {
    box.style.borderColor = "var(--danger)";
    box.style.background =
      "radial-gradient(circle at 0 0, var(--danger-soft), transparent 65%)";
    if (hasFreezeForever && highTax) {
      message.textContent =
        "Warning: Freeze-forever + high transfer tax can make your token untradeable. MrSol Safe-Mode strongly recommends reviewing this.";
    } else if (hasFreezeForever) {
      message.textContent =
        "Warning: Freeze-forever can fully stop transfers. Only enable if you fully understand the consequences.";
    } else {
      message.textContent =
        "Warning: Transfer tax above 10% can scare traders and cause low liquidity.";
    }
  } else {
    box.style.borderColor = "rgba(255,255,255,.12)";
    box.style.background =
      "radial-gradient(circle at 0 0, rgba(0,255,170,.1), transparent 65%)";
    message.textContent = "No dangerous flags detected.";
  }
}

/* Deploy simulation */

function initDeployButton() {
  const btn = qs("#deployBtn");
  btn.addEventListener("click", () => {
    updateSummary();

    // In Phase 2: send this payload to your backend API
    const payload = {
      template: state.template,
      features: [...state.features],
      params: { ...state.params },
      network: state.network,
      wallet: state.walletAddress,
    };

    console.log("MrSol deploy payload (mock):", payload);
    showToast(
      "Frontend simulation complete. Check console for payload. Phase 2 will send this to the MrSol backend server."
    );
  });
}

/* Toast */

let toastTimeout = null;

function showToast(text) {
  const toast = qs("#toast");
  const body = qs("#toastBody");
  body.textContent = text;
  toast.classList.add("show");
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

/* Init */

document.addEventListener("DOMContentLoaded", () => {
  initStepNavigation();
  initTemplateSelection();
  initFeatureToggles();
  initParameters();
  initNetworkSelector();
  initWalletButton();
  initDeployButton();
  updatePreview();
  updateSafeMode();
  setStep(1);
});
