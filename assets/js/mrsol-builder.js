// ====== CONFIG ======
const MRSOL_API_BASE = "https://188.209.138.136:5001";

// ====== STATE ======
const state = {
  currentStep: 1,
  template: "spl_token",
  features: new Set(),
  params: {
    tokenName: "MrSol Token",
    tokenSymbol: "MRSOL",
    totalSupply: 100,
    taxPercent: 2,
    bonusPercent: 5,
    lockDuration: "none",
  },
  network: "devnet",
  walletConnected: false,
  walletAddress: null,
};

// ====== DOM HELPERS ======
const qs = (sel, parent = document) => parent.querySelector(sel);
const qsa = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

function showToast(msg) {
  const toast = qs("#toast");
  const body = qs("#toastBody");
  if (!toast || !body) return;

  body.textContent = msg;
  toast.classList.add("show");

  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// ====== STEP NAVIGATION ======
function setStep(step) {
  state.currentStep = step;

  qsa(".step-panel").forEach((panel) => {
    const s = Number(panel.dataset.stepPanel);
    panel.classList.toggle("active", s === step);
  });

  qsa(".step-pill").forEach((pill) => {
    const s = Number(pill.dataset.step);
    pill.classList.toggle("active", s === step);
  });

  const prev = qs("#prevStepBtn");
  const next = qs("#nextStepBtn");

  if (prev && next) {
    prev.disabled = step === 1;
    next.textContent = step === 4 ? "Finish" : "Next step";
  }

  updateSummary();
}

function initStepNavigation() {
  const prev = qs("#prevStepBtn");
  const next = qs("#nextStepBtn");

  if (prev) {
    prev.addEventListener("click", () => {
      if (state.currentStep > 1) setStep(state.currentStep - 1);
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      if (state.currentStep < 4) {
        setStep(state.currentStep + 1);
      } else {
        // when on last step clicking "Finish" just keeps you there
        showToast("You are already on the final step.");
      }
    });
  }

  qsa(".step-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const step = Number(pill.dataset.step);
      setStep(step);
    });
  });
}

// ====== TEMPLATE SELECTION ======
function initTemplateSelection() {
  qsa('input[name="template"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.disabled) return;
      state.template = input.value;
      updatePreview();
      updateSummary();
    });
  });
}

// ====== FEATURES ======
function initFeatureToggles() {
  qsa(".feature-card input[type='checkbox']").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.features.add(input.value);
      } else {
        state.features.delete(input.value);
      }
      updatePreview();
      updateSummary();
    });
  });
}

// ====== PARAMETERS ======
function initParameters() {
  const nameInput = qs("#tokenName");
  const symbolInput = qs("#tokenSymbol");
  const totalRange = qs("#totalSupply");
  const totalLabel = qs("#totalSupplyLabel");
  const taxRange = qs("#taxPercent");
  const taxLabel = qs("#taxPercentLabel");
  const bonusRange = qs("#bonusPercent");
  const bonusLabel = qs("#bonusPercentLabel");
  const lockSelect = qs("#lockDuration");

  if (nameInput) {
    nameInput.value = state.params.tokenName;
    nameInput.addEventListener("input", () => {
      state.params.tokenName = nameInput.value || "MrSol Token";
      updatePreview();
      updateSummary();
    });
  }

  if (symbolInput) {
    symbolInput.value = state.params.tokenSymbol;
    symbolInput.addEventListener("input", () => {
      state.params.tokenSymbol = symbolInput.value || "MRSOL";
      updatePreview();
      updateSummary();
    });
  }

  if (totalRange && totalLabel) {
    totalRange.value = state.params.totalSupply;
    totalLabel.textContent = state.params.totalSupply;
    totalRange.addEventListener("input", () => {
      const v = Number(totalRange.value);
      state.params.totalSupply = v;
      totalLabel.textContent = v;
      updatePreview();
      updateSummary();
    });
  }

  if (taxRange && taxLabel) {
    taxRange.value = state.params.taxPercent;
    taxLabel.textContent = state.params.taxPercent;
    taxRange.addEventListener("input", () => {
      const v = Number(taxRange.value);
      state.params.taxPercent = v;
      taxLabel.textContent = v;
      updatePreview();
      updateSummary();
    });
  }

  if (bonusRange && bonusLabel) {
    bonusRange.value = state.params.bonusPercent;
    bonusLabel.textContent = state.params.bonusPercent;
    bonusRange.addEventListener("input", () => {
      const v = Number(bonusRange.value);
      state.params.bonusPercent = v;
      bonusLabel.textContent = v;
      updatePreview();
      updateSummary();
    });
  }

  if (lockSelect) {
    lockSelect.value = state.params.lockDuration;
    lockSelect.addEventListener("change", () => {
      state.params.lockDuration = lockSelect.value;
      updatePreview();
      updateSummary();
    });
  }
}

// ====== NETWORK & WALLET ======
function initNetworkSelector() {
  const select = qs("#networkSelect");
  if (!select) return;

  select.value = state.network;

  select.addEventListener("change", () => {
    state.network = select.value;
    updatePreview();
    updateSafeMode();
  });
}

function initWalletButton() {
  const btn = qs("#walletConnectBtn");
  const statusSpan = qs("#walletStatus .wallet-status-value");

  if (!btn || !statusSpan) return;

  btn.addEventListener("click", () => {
    if (!state.walletConnected) {
      const addr = prompt(
        "Paste your Solana wallet address (Devnet)."
      );

      if (!addr) {
        showToast("Wallet address is required.");
        return;
      }

      const trimmed = addr.trim();
      if (trimmed.length < 32 || trimmed.length > 60) {
        showToast("This doesn't look like a valid Solana address.");
        return;
      }

      state.walletConnected = true;
      state.walletAddress = trimmed;

      btn.textContent = "Wallet connected";
      statusSpan.textContent =
        trimmed.slice(0, 4) + "..." + trimmed.slice(-4);

      showToast("Wallet connected (manual address).");
      updatePreview();
    } else {
      state.walletConnected = false;
      state.walletAddress = null;
      btn.textContent = "Connect Wallet";
      statusSpan.textContent = "Not connected";
      showToast("Wallet disconnected.");
      updatePreview();
    }
  });
}

// ====== DEPLOY & FAUCET ======
async function callBackend(path, body) {
  const url = `${MRSOL_API_BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Backend error:", txt);
    throw new Error("Backend request failed");
  }

  return res.json();
}

function initDeployButton() {
  const btn = qs("#deployBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    updateSummary();

    if (!state.walletAddress) {
      showToast("Please connect your wallet first.");
      return;
    }

    if (state.template !== "spl_token") {
      showToast("Currently only SPL Token template is deployable.");
      return;
    }

    const payload = {
      template: state.template,
      features: Array.from(state.features),
      params: { ...state.params },
      network: state.network,
      wallet: state.walletAddress,
    };

    try {
      btn.disabled = true;
      showToast("Deploying contract on devnet...");

      const data = await callBackend("/api/mrsol/deploy", payload);
      console.log("MrSol deploy result:", data);

      alert(
        "✅ Contract deployed on devnet!\n\n" +
          "Explorer:\n" +
          data.explorerUrl +
          "\n\nDownload config:\n" +
          `${MRSOL_API_BASE}${data.downloadUrl}`
      );

      showToast("Deployment successful. Check explorer link.");
    } catch (err) {
      console.error(err);
      showToast("Deploy error. Please try again.");
    } finally {
      btn.disabled = false;
    }
  });
}

function initFaucetButton() {
  const btn = qs("#faucetBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    if (!state.walletAddress) {
      showToast("Connect your wallet (paste address) first.");
      return;
    }

    try {
      btn.disabled = true;
      showToast("Requesting devnet SOL airdrop...");

      const data = await callBackend("/api/mrsol/faucet", {
        address: state.walletAddress,
      });

      console.log("MrSol faucet result:", data);
      alert("✅ Airdrop sent!\n\nExplorer:\n" + data.explorerUrl);
      showToast("Devnet SOL requested.");
    } catch (e) {
      console.error(e);
      showToast("Faucet error. Try again later.");
    } finally {
      btn.disabled = false;
    }
  });
}

// ====== PREVIEW & SUMMARY ======
function lockDurationLabel(value) {
  switch (value) {
    case "1m":
      return "1 month";
    case "3m":
      return "3 months";
    case "6m":
      return "6 months";
    case "12m":
      return "12 months";
    default:
      return "No suggested lock";
  }
}

function featureLabel(code) {
  switch (code) {
    case "transfer_tax":
      return "Transfer tax";
    case "anti_whale":
      return "Anti-whale limits";
    case "trading_lock":
      return "Trading lock window";
    case "mint_lock":
      return "Mint authority lock";
    default:
      return code;
  }
}

function updatePreview() {
  const nameEl = qs("#previewTokenName");
  const symbolEl = qs("#previewTokenSymbol");
  const supplyEl = qs("#previewSupply");
  const taxEl = qs("#previewTax");
  const bonusEl = qs("#previewBonus");
  const lockEl = qs("#previewLock");
  const netEl = qs("#previewNetwork");
  const walletEl = qs("#previewWallet");
  const tmplEl = qs("#previewTemplateLabel");
  const featuresContainer = qs("#previewFeatures");

  if (nameEl) nameEl.textContent = state.params.tokenName || "MrSol Token";
  if (symbolEl)
    symbolEl.textContent =
      (state.params.tokenSymbol || "MRSOL") + " · 9 decimals";
  if (supplyEl) supplyEl.textContent = `${state.params.totalSupply} M`;
  if (taxEl) taxEl.textContent = `${state.params.taxPercent}%`;
  if (bonusEl) bonusEl.textContent = `${state.params.bonusPercent}%`;
  if (lockEl) lockEl.textContent = lockDurationLabel(state.params.lockDuration);

  if (netEl) {
    const label =
      state.network === "devnet"
        ? "Target: Solana devnet"
        : state.network === "testnet"
        ? "Target: Solana testnet"
        : "Target: Mainnet (coming soon)";
    netEl.textContent = label;
  }

  if (walletEl) {
    if (state.walletAddress) {
      walletEl.textContent =
        "Wallet: " +
        state.walletAddress.slice(0, 4) +
        "..." +
        state.walletAddress.slice(-4);
    } else {
      walletEl.textContent = "Wallet: not connected";
    }
  }

  if (tmplEl) {
    tmplEl.textContent =
      state.template === "spl_token"
        ? "SPL Token"
        : state.template === "staking"
        ? "Staking Pool"
        : state.template === "vesting"
        ? "Vesting"
        : "Airdrop";
  }

  if (featuresContainer) {
    featuresContainer.innerHTML = "";
    if (state.features.size === 0) {
      const li = document.createElement("li");
      li.textContent = "No extra features enabled";
      featuresContainer.appendChild(li);
    } else {
      Array.from(state.features).forEach((f) => {
        const li = document.createElement("li");
        li.textContent = featureLabel(f);
        featuresContainer.appendChild(li);
      });
    }
  }
}

function updateSummary() {
  const list = qs("#summaryList");
  if (!list) return;

  list.innerHTML = "";

  const rows = [
    ["Template", state.template === "spl_token" ? "SPL Token" : state.template],
    ["Token name", state.params.tokenName],
    ["Token symbol", state.params.tokenSymbol],
    ["Total supply (M)", String(state.params.totalSupply)],
    ["Transfer tax (%)", String(state.params.taxPercent)],
    ["Holder bonus (%)", String(state.params.bonusPercent)],
    ["Suggested lock", lockDurationLabel(state.params.lockDuration)],
    [
      "Enabled features",
      state.features.size
        ? Array.from(state.features).map(featureLabel).join(", ")
        : "None",
    ],
    ["Network", state.network],
    [
      "Wallet",
      state.walletAddress
        ? state.walletAddress.slice(0, 4) +
          "..." +
          state.walletAddress.slice(-4)
        : "Not connected",
    ],
  ];

  rows.forEach(([label, value]) => {
    const li = document.createElement("li");

    const spanLabel = document.createElement("span");
    spanLabel.className = "summary-label";
    spanLabel.textContent = label;

    const spanValue = document.createElement("span");
    spanValue.className = "summary-value";
    spanValue.textContent = value;

    li.appendChild(spanLabel);
    li.appendChild(spanValue);
    list.appendChild(li);
  });
}

function updateSafeMode() {
  const box = qs("#safeModeBox");
  if (!box) return;

  if (state.network === "devnet") {
    box.querySelector(".safety-label").textContent = "Devnet safety mode ON";
    qs(".safety-text", box).textContent =
      "All deployments are sent to Solana devnet. Perfect for testing without real funds.";
  } else {
    box.querySelector(".safety-label").textContent = "Devnet only in backend";
    qs(".safety-text", box).textContent =
      "For now, backend always deploys to devnet, even if you choose testnet/mainnet.";
  }
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  initStepNavigation();
  initTemplateSelection();
  initFeatureToggles();
  initParameters();
  initNetworkSelector();
  initWalletButton();
  initDeployButton();
  initFaucetButton();
  updatePreview();
  updateSafeMode();
  setStep(1);
});
