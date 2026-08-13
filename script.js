// Remove or comment out the CSS import so the native browser doesn't crash!
// import './style.css';

// ============== APP STATE & DOM ==============
const appState = {
  loggedIn: false,
  userProfile: null,
  meals: [],
  dailyPoints: 0,
  leaderboardScore: parseInt(localStorage.getItem("score")) || 0,
  lastClaimDate: localStorage.getItem("claimDate") || null,
  waterCount: parseInt(localStorage.getItem("waterCount")) || 0,
  accountPoints: parseInt(localStorage.getItem("accountPoints")) || 150,
  redemptionHistory: JSON.parse(localStorage.getItem("redemptionHistory") || "[]"),
  advancedMode: localStorage.getItem("advancedMode") === "true",
  unlockedCollectibles: JSON.parse(localStorage.getItem("unlockedCollectibles") || "[]") // New Gamification State
};

const $ = (id) => document.getElementById(id);

// Routing & Page Elements
const loginPage = $("login-page");
const termsModal = $("terms-modal");
const dashboard = $("dashboard");
const sidebar = $("app-sidebar");

// Auth Modals & Containers
const loginContainer = $("login-container");
const signupContainer = $("signup-container");
const recoveryContainer = $("recovery-container");
const otpEmailModal = $("otp-email-modal");
const otpModal = $("otp-modal");
const singpassModal = $("singpass-modal");

// Auth Forms & Inputs
const loginForm = $("login-form");
const emailInput = $("email");
const passwordInput = $("password");
const signupForm = $("signup-form");
const recoveryForm = $("recovery-form");
const otpEmailForm = $("otp-email-form");
const otpRequestEmailInput = $("otp-request-email");
const otpInputs = document.querySelectorAll(".otp-digit");

// Auth Buttons & Links
const forgotPasswordLink = $("forgot-password-link");
const backFromRecoveryLink = $("back-from-recovery-link");
const goToSignupLink = $("go-to-signup-link");
const backToLoginLink = $("back-to-login-link");
const singpassBtn = $("singpass-login");
const simulateScanBtn = $("simulate-scan-btn");
const cancelSingpassBtn = $("cancel-singpass-btn");
const otpLoginBtn = $("otp-login-btn");
const cancelOtpEmailBtn = $("cancel-otp-email-btn");
const verifyOtpBtn = $("verify-otp-btn");
const cancelOtpBtn = $("cancel-otp-btn");
const agreeCheckbox = $("agree-checkbox");
const agreeButton = $("agree-button");
const backBtn = $("back-to-login");

// App Core Elements
const healthForm = $("health-details-form");
const mealForm = $("meal-form");
const mealInput = $("meal");
const recipeSelector = $("recipe-selector");
const servingsInput = $("servings");
const ingredientRows = $("ingredient-rows");
const addIngredientBtn = $("add-ingredient");
const oilRows = $("oil-rows");
const addOilBtn = $("add-oil");
const drinkRows = $("drink-rows");
const addDrinkBtn = $("add-drink");
const mealList = $("meal-list");
const recCalEl = $("rec-cal");
const servingCalEl = $("serving-cal");
const dishCalEl = $("dish-cal");
const mealEstimateEl = $("meal-estimate");
const totalCalEl = $("total-cal");
const calRemainingEl = $("cal-remaining");
const progressBar = $("progress-bar");
const progressText = $("progress-text");
const claimBtn = $("claim-points");
const leaderboard = $("leaderboard");
const yourScore = $("your-score");
const claimStatus = $("claim-status");
const logoutBtn = $("logout-btn");
const exportBtn = $("export-pdf");
const clearBtn = $("clear-profile");
const focusProfileBtn = $("focus-profile");
const focusMealsBtn = $("focus-meals");
const summaryGoal = $("summary-goal");
const summaryAction = $("summary-action");
const summaryTip = $("summary-tip");
const profileSummary = $("profile-summary");
const addWaterBtn = $("add-water");
const resetWaterBtn = $("reset-water");
const waterScore = $("water-score");
const waterCups = $("water-cups");
const suggestMealsBtn = $("suggest-meals");
const suggestionCards = $("suggestion-cards");
const rewardsGrid = $("rewards-grid");
const rewardBalanceEl = $("reward-balance");
const historyList = $("history-list");
const suggestionModal = $("suggestion-modal");
const modalMealName = $("modal-meal-name");
const modalMealNote = $("modal-meal-note");
const modalIngs = $("modal-ings");
const modalAddBtn = $("modal-add-btn");
const modalCancelBtn = $("modal-cancel-btn");

// New AI & Gamification Elements
const aiMealInput = $("ai-meal-input");
const aiParseBtn = $("ai-parse-btn");
const collectiblesGrid = $("collectibles-grid");

let _currentSuggestion = null;

// ============== TOAST NOTIFICATIONS ==============
function toast(msg, type = "info") {
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  t.style.cssText = `
    position: fixed; bottom: 1rem; right: 1rem;
    background: ${type === "success" ? "#22c55e" : type === "danger" ? "#ef4444" : "#06b6d4"};
    color: white; padding: 0.75rem 1rem; border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.style.animation = "slideOut 0.3s ease", 2500);
  setTimeout(() => t.remove(), 2800);
}

// ============== AUTHENTICATION, SIGNUP & LOGIN FLOWS ==============
if (goToSignupLink) {
  goToSignupLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.classList.add("hidden");
    if(recoveryContainer) recoveryContainer.classList.add("hidden");
    signupContainer.classList.remove("hidden");
  });
}

if (backToLoginLink) {
  backToLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    signupContainer.classList.add("hidden");
    if(recoveryContainer) recoveryContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  });
}

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.classList.add("hidden");
    signupContainer.classList.add("hidden");
    if(recoveryContainer) recoveryContainer.classList.remove("hidden");
  });
}

if (backFromRecoveryLink) {
  backFromRecoveryLink.addEventListener("click", (e) => {
    e.preventDefault();
    if(recoveryContainer) recoveryContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  });
}

if (recoveryForm) {
  recoveryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputVal = $("recovery-input").value.trim();
    const btn = recoveryForm.querySelector("button[type='submit']");
    
    btn.textContent = "Verifying...";
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = "Next";
      btn.disabled = false;
      recoveryContainer.classList.add("hidden");
      loginContainer.classList.remove("hidden");
      recoveryForm.reset();
      toast(`Recovery instructions sent to ${inputVal}`, "success");
    }, 800);
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("signup-email").value.trim();
    const name = $("signup-name").value.trim();

    if (!email.includes("@")) {
      toast("Please enter a valid email address.", "danger");
      return;
    }

    const btn = signupForm.querySelector("button[type='submit']");
    btn.textContent = "Creating Account...";
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = "Sign Up";
      btn.disabled = false;
      
      appState.loggedIn = true;
      appState.userProfile = { email, name };
      signupForm.reset();
      
      routeToApp();
      toast("Account created successfully!", "success");
    }, 800);
  });
}

if (otpLoginBtn) {
  otpLoginBtn.addEventListener("click", () => {
    otpEmailModal.classList.remove("hidden");
    otpEmailModal.classList.add("visible");
    setTimeout(() => { if (otpRequestEmailInput) otpRequestEmailInput.focus(); }, 100);
  });
}

if (cancelOtpEmailBtn) {
  cancelOtpEmailBtn.addEventListener("click", () => {
    otpEmailModal.classList.remove("visible");
    otpEmailModal.classList.add("hidden");
    if (otpEmailForm) otpEmailForm.reset();
  });
}

if (otpEmailForm) {
  otpEmailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailVal = otpRequestEmailInput.value.trim();
    
    if (!emailVal.includes("@")) {
      toast("Please enter a valid email address.", "danger");
      return;
    }

    const btn = otpEmailForm.querySelector("button[type='submit']");
    btn.textContent = "Sending...";
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = "Send Code";
      btn.disabled = false;
      
      otpEmailModal.classList.remove("visible");
      otpEmailModal.classList.add("hidden");
      otpEmailForm.reset();

      appState.userProfile = { email: emailVal };
      toast(`Code sent to ${emailVal}`, "success");
      showOTPModal();
    }, 800);
  });
}

function showOTPModal() {
  if (otpModal) {
    otpModal.classList.remove("hidden");
    otpModal.classList.add("visible");
    setTimeout(() => { if(otpInputs[0]) otpInputs[0].focus(); }, 100);
  }
}

otpInputs.forEach((input, index) => {
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      pastedData.split("").forEach((char, i) => { if (otpInputs[i]) otpInputs[i].value = char; });
      checkOTPReady();
      if (pastedData.length === 6) otpInputs[5].focus(); else otpInputs[pastedData.length].focus();
    }
  });

  input.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
    if (e.target.value !== "" && index < otpInputs.length - 1) otpInputs[index + 1].focus();
    checkOTPReady();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) otpInputs[index - 1].focus();
  });
});

function checkOTPReady() {
  const code = Array.from(otpInputs).map(input => input.value).join("");
  if (verifyOtpBtn) verifyOtpBtn.disabled = code.length !== 6;
}

if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", () => {
    const code = Array.from(otpInputs).map(input => input.value).join("");
    const otpGroup = document.querySelector(".otp-input-group");
    
    if (code === "123456") {
      otpModal.classList.remove("visible");
      otpModal.classList.add("hidden");
      appState.loggedIn = true;
      routeToApp();
      toast("Authentication successful!", "success");
      otpInputs.forEach(input => input.value = "");
      verifyOtpBtn.disabled = true;
    } else {
      otpGroup.classList.add("error");
      toast("Invalid code. Try 123456.", "danger");
      setTimeout(() => {
        otpGroup.classList.remove("error");
        otpInputs.forEach(input => input.value = "");
        otpInputs[0].focus();
        verifyOtpBtn.disabled = true;
      }, 500);
    }
  });
}

if (cancelOtpBtn) {
  cancelOtpBtn.addEventListener("click", () => {
    otpModal.classList.remove("visible");
    otpModal.classList.add("hidden");
    otpInputs.forEach(input => input.value = "");
    verifyOtpBtn.disabled = true;
  });
}

if (singpassBtn) {
  singpassBtn.addEventListener("click", () => {
    singpassModal.classList.remove("hidden");
    singpassModal.classList.add("visible");
  });
}

if (simulateScanBtn) {
  simulateScanBtn.addEventListener("click", () => {
    simulateScanBtn.textContent = "Authenticating...";
    simulateScanBtn.disabled = true;
    
    setTimeout(() => {
      singpassModal.classList.remove("visible");
      singpassModal.classList.add("hidden");
      simulateScanBtn.textContent = "Simulate Scan (Demo)";
      simulateScanBtn.disabled = false;
      
      appState.loggedIn = true;
      appState.userProfile = { email: "user@singpass.gov.sg" };
      routeToApp();
      toast("Singpass authentication successful!", "success");
    }, 1200);
  });
}

if (cancelSingpassBtn) {
  cancelSingpassBtn.addEventListener("click", () => {
    singpassModal.classList.remove("visible");
    singpassModal.classList.add("hidden");
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const pwd = passwordInput.value.trim();

    if (!email.includes("@")) {
      toast("Email must include @", "danger");
      return;
    }
    if (pwd.length === 0) {
      toast("Password required", "danger");
      return;
    }

    const btn = loginForm.querySelector("button[type='submit']");
    btn.textContent = "Signing in...";
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = "Log In";
      btn.disabled = false;
      appState.loggedIn = true;
      appState.userProfile = { email };
      routeToApp();
      toast("Welcome back!", "success");
    }, 600);
  });
}

// ============== PAGE VISIBILITY & ROUTING ==============
function routeToApp() {
  if (localStorage.getItem('termsAccepted') === 'true') {
    showDashboard();
  } else {
    showTermsPage();
  }
}

function showLoginPage() {
  loginPage.classList.remove("hidden");
  if (loginContainer) loginContainer.classList.remove("hidden");
  if (signupContainer) signupContainer.classList.add("hidden");
  if (recoveryContainer) recoveryContainer.classList.add("hidden");
  if (termsModal) {
    termsModal.classList.add("hidden");
    termsModal.classList.remove("visible");
  }
  dashboard.classList.add("hidden");
  if (sidebar) sidebar.classList.add("hidden"); 
  document.body.style.overflow = "auto"; 
}

function showTermsPage() {
  loginPage.classList.add("hidden");
  if (termsModal) {
    termsModal.classList.remove("hidden");
    termsModal.classList.add("visible");
  }
  dashboard.classList.add("hidden");
  if (sidebar) sidebar.classList.add("hidden"); 
  document.body.style.overflow = "hidden"; 
}

function showDashboard() {
  loginPage.classList.add("hidden");
  if (termsModal) {
    termsModal.classList.add("hidden");
    termsModal.classList.remove("visible");
  }
  dashboard.classList.remove("hidden");
  if (sidebar) sidebar.classList.remove("hidden"); 
  document.body.style.overflow = "auto"; 
  loadStoredData();
}

function showPage(pageId) {
  document.querySelectorAll(".page-section").forEach(el => el.classList.add("hidden"));
  const page = $(pageId);
  if (page) page.classList.remove("hidden");
}

const navBtns = {
  "nav-profile": "page-profile",
  "nav-meals": "page-meals",
  "nav-tracker": "page-tracker",
  "nav-reports": "page-reports",
  "nav-rewards": "page-rewards"
};

Object.entries(navBtns).forEach(([btnId, pageId]) => {
  const btn = $(btnId);
  if (btn) {
    btn.addEventListener("click", () => {
      showPage(pageId);
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  }
});
if (focusProfileBtn) {
  focusProfileBtn.addEventListener("click", () => {
    showPage("page-profile");
    if ($("nav-profile")) {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      $("nav-profile").classList.add("active");
    }
    
    const form = $("health-details-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => { if ($("age")) $("age").focus(); }, 500);
    }
  });
}

if (focusMealsBtn) {
  focusMealsBtn.addEventListener("click", () => {
    showPage("page-meals");
    if ($("nav-meals")) {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      $("nav-meals").classList.add("active");
    }
    
    setTimeout(() => {
      const mealForm = $("meal-form");
      if (mealForm) {
        mealForm.scrollIntoView({ behavior: "smooth", block: "start" });
        if ($("meal")) $("meal").focus();
      }
    }, 100);
  });
}

// ============== PDPA STRICT LOGIC ==============
if (agreeCheckbox) {
  agreeCheckbox.addEventListener("change", () => {
    if (agreeButton) agreeButton.disabled = !agreeCheckbox.checked;
  });
}

if (agreeButton) {
  agreeButton.addEventListener("click", () => {
    if (agreeCheckbox && agreeCheckbox.checked) {
      localStorage.setItem("termsAccepted", "true");
      showDashboard();
      toast("PDPA Consent Recorded.", "success");
    } else {
      toast("You must check the consent box to proceed.", "danger");
    }
  });
}

if (backBtn) {
  backBtn.addEventListener("click", () => {
    showLoginPage();
    if (agreeCheckbox) agreeCheckbox.checked = false;
    if (agreeButton) agreeButton.disabled = true;
  });
}

// ============== INTERACTIVE HEALTHY PLATE LOGIC ==============
document.addEventListener('DOMContentLoaded', () => {
  const plateSegments = document.querySelectorAll('.plate-half, .plate-quarter');
  const infoTitle = document.getElementById('plate-info-title');
  const infoDesc = document.getElementById('plate-info-desc');
  const infoPanel = document.getElementById('plate-info-panel');

  if (!infoTitle || !infoDesc || !infoPanel) return;

  const plateData = {
    veg: {
      title: "½ Fruit & Vegetables",
      desc: "Fill half your plate with vibrant fruits and non-starchy vegetables. They are naturally low in calories and packed with essential dietary fibre, vitamins, and minerals."
    },
    protein: {
      title: "¼ Meat & Others (Protein)",
      desc: "Choose lean proteins, tofu, legumes, or fish. Protein is essential for tissue repair and muscle maintenance. Opt for healthier cooking methods like steaming or grilling."
    },
    carbs: {
      title: "¼ Wholegrains",
      desc: "Swap refined grains for wholegrain bread, brown rice, or oats. Wholegrains provide sustained energy, keep you feeling full longer, and help stabilize blood sugar levels."
    }
  };

  plateSegments.forEach(segment => {
    const updatePanel = (e) => {
      const section = e.currentTarget.dataset.info;
      if (plateData[section]) {
        infoTitle.textContent = plateData[section].title;
        infoDesc.textContent = plateData[section].desc;
        infoPanel.style.transform = 'scale(0.97)';
        setTimeout(() => infoPanel.style.transform = 'scale(1)', 150);
      }
    };
    segment.addEventListener('mouseenter', updatePanel);
    segment.addEventListener('click', updatePanel);
  });
});

// ============== REWARDS SYSTEM ==============
const rewards = [
  { id: 1, category: "Fitness", emoji: "🏋️", name: "Anytime Fitness Pass", description: "1-month access (valid at Jurong Point & Boon Lay clubs).", cost: 800, badge: "Premium" },
  { id: 2, category: "Voucher", emoji: "🍟", name: "$10 Potato Corner Voucher", description: "Treat yourself to a well-earned cheat meal.", cost: 150, badge: "Popular" },
  { id: 3, category: "Shopping", emoji: "🛍️", name: "$5 Shopee E-Voucher", description: "Credits sent directly to your ShopeePay wallet.", cost: 100, badge: "Quick" },
  { id: 4, category: "Nightlife", emoji: "🪩", name: "Marquee / Zouk Entry", description: "Standard admission ticket for your next weekend out.", cost: 500, badge: "Nightlife" },
  { id: 5, category: "Food", emoji: "🍔", name: "$15 McDelivery Code", description: "Valid for any McDonald's delivery order.", cost: 200, badge: "Food" },
  { id: 6, category: "Travel", emoji: "✈️", name: "$50 Trip.com Credit", description: "Offset your next flight or high-speed train booking.", cost: 600, badge: "Travel" }
];

function renderRewards() {
  if (!rewardsGrid) return;
  rewardsGrid.innerHTML = rewards.map(r => `
    <div class="reward-card" data-id="${r.id}">
      <div class="reward-emoji">${ICONS.reward}</div>
      <div class="reward-body">
        <h4>${r.name} <span class="badge">${r.badge}</span></h4>
        <p class="muted">${r.description}</p>
        <div class="reward-footer">
          <div class="cost">${r.cost} pts</div>
          <button class="btn btn-primary redeem-btn" data-id="${r.id}">Redeem</button>
        </div>
      </div>
    </div>
  `).join("");
  
  document.querySelectorAll('.redeem-btn').forEach(b => b.addEventListener('click', (e) => {
    const id = parseInt(e.currentTarget.dataset.id, 10);
    redeemReward(id);
  }));

  const profileRail = document.getElementById('top-rewards-rail-profile');
  if (profileRail) {
    profileRail.innerHTML = '';
    rewards.slice(0,4).forEach(r => {
      const el = document.createElement('div');
      el.className = 'reward-pill';
      el.innerHTML = `<strong>${r.name}</strong> <span class="muted">${r.cost} pts</span>`;
      profileRail.appendChild(el);
    });
  }
}

function renderTopRewardsRail() {
  const rail = document.getElementById('top-rewards-rail');
  if (!rail) return;
  rail.innerHTML = '';
  const top = rewards.slice(0, 6);
  top.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'top-reward-pill';
    btn.innerHTML = `<span class="emoji">${ICONS.reward}</span><span class="name">${r.name}</span><span class="cost">${r.cost} pts</span>`;
    btn.addEventListener('click', () => {
      const grid = document.getElementById('rewards-grid');
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const card = grid.querySelector(`.reward-card[data-id="${r.id}"]`);
      if (card) { card.classList.add('highlight'); setTimeout(() => card.classList.remove('highlight'), 1400); }
    });
    rail.appendChild(btn);
  });
  if ($('reward-balance-profile')) $('reward-balance-profile').textContent = appState.accountPoints || 0;
}

function updateRewardBalance() {
  if (rewardBalanceEl) rewardBalanceEl.textContent = appState.accountPoints;
  if ($('points-balance')) $('points-balance').textContent = appState.accountPoints;
  if ($('reward-balance-profile')) $('reward-balance-profile').textContent = appState.accountPoints;
}

function redeemReward(id) {
  const r = rewards.find(x => x.id === id);
  if (!r) return toast('Reward not found', 'danger');
  if (appState.accountPoints < r.cost) return toast('Not enough points to redeem', 'danger');

  appState.accountPoints -= r.cost;
  localStorage.setItem('accountPoints', appState.accountPoints);

  const uniqueCode = `PD-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const rec = { id: r.id, name: r.name, description: r.description, cost: r.cost, emoji: r.emoji || "🎟️", code: uniqueCode, date: new Date().toISOString() };
  
  appState.redemptionHistory.push(rec);
  localStorage.setItem('redemptionHistory', JSON.stringify(appState.redemptionHistory));

  updateRewardBalance();
  renderRedemptionHistory();
  checkCollectibles();
  toast(`Redeemed: ${r.name}`, 'success');
  showVoucherModal(rec);
}

function renderRedemptionHistory() {
  if (!historyList) return;
  if (!appState.redemptionHistory || appState.redemptionHistory.length === 0) {
    historyList.innerHTML = '<li class="muted">No redemptions yet.</li>';
    return;
  }
  
  historyList.innerHTML = appState.redemptionHistory.map((h, index) => {
    const name = h.name || "Reward Voucher";
    const cost = h.cost || 0;
    const dateVal = h.date ? new Date(h.date).toLocaleDateString() : "Recent";
    return `
      <li style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 0.6rem 0;">
        <div>
          <strong>${name}</strong>
          <div class="small muted">${dateVal} • ${cost} pts</div>
        </div>
        <button type="button" class="btn btn-ghost small view-pass-btn" data-index="${index}" style="padding: 0.35rem 0.8rem; font-size: 0.8rem; flex-shrink: 0;">View Pass ↗</button>
      </li>
    `;
  }).join('');
  
  const historyCard = document.getElementById('redemption-history');
  if (historyCard) historyCard.classList.remove('hidden');

  document.querySelectorAll('.view-pass-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      const voucherItem = appState.redemptionHistory[idx];
      if (voucherItem) showVoucherModal(voucherItem); else toast("Could not load voucher details.", "danger");
    });
  });
}

const voucherModal = document.getElementById('voucher-modal');
const closeVoucherModalBtn = document.getElementById('close-voucher-modal');

function showVoucherModal(item) {
  const modal = document.getElementById('voucher-modal');
  if (!modal) return;
  
  if ($('voucher-modal-emoji')) $('voucher-modal-emoji').textContent = item.emoji || "🎟️";
  if ($('voucher-modal-title')) $('voucher-modal-title').textContent = item.name || "Voucher";
  if ($('voucher-modal-desc')) $('voucher-modal-desc').textContent = item.description || "Valid for single use at partner locations.";
  if ($('voucher-modal-code')) $('voucher-modal-code').textContent = item.code || `PD-${Math.floor(1000 + Math.random() * 9000)}-XRT`;
  if ($('voucher-modal-date')) $('voucher-modal-date').textContent = `Redeemed: ${item.date ? new Date(item.date).toLocaleString() : new Date().toLocaleString()}`;
  
  modal.classList.remove('hidden');
  modal.classList.add('visible');
}

if (closeVoucherModalBtn) {
  closeVoucherModalBtn.addEventListener('click', () => {
    if (voucherModal) { voucherModal.classList.add('hidden'); voucherModal.classList.remove('visible'); }
  });
}

// ============== ADVANCED GAMIFICATION: DIGITAL BINDER ==============
const COLLECTIBLES_DB = [
  { id: "c1", name: "Hydration Hero", desc: "Drank 8 glasses of water in a day.", brand: "CONCEPT GRADING", grade: "10", rarity: "Holo", reqType: "water", reqVal: 8 },
  { id: "c2", name: "First Steps", desc: "Logged your first meal.", brand: "CONCEPT GRADING", grade: "9.5", rarity: "Rare", reqType: "meal", reqVal: 1 },
  { id: "c3", name: "Consistency", desc: "Logged 3 meals today.", brand: "CONCEPT GRADING", grade: "9", rarity: "Uncommon", reqType: "meal", reqVal: 3 },
  { id: "c4", name: "Point Hoarder", desc: "Reached 300 points.", brand: "CONCEPT GRADING", grade: "10", rarity: "Secret Rare", reqType: "points", reqVal: 300 },
];

function checkCollectibles() {
  let newlyUnlocked = false;
  COLLECTIBLES_DB.forEach(c => {
    if (!appState.unlockedCollectibles.includes(c.id)) {
      let unlocked = false;
      if (c.reqType === "water" && appState.waterCount >= c.reqVal) unlocked = true;
      if (c.reqType === "meal" && appState.meals.length >= c.reqVal) unlocked = true;
      if (c.reqType === "points" && appState.accountPoints >= c.reqVal) unlocked = true;
      
      if (unlocked) {
        appState.unlockedCollectibles.push(c.id);
        newlyUnlocked = true;
        toast(`🎴 Unlocked Card: ${c.name}!`, "success");
      }
    }
  });
  if (newlyUnlocked) {
    localStorage.setItem("unlockedCollectibles", JSON.stringify(appState.unlockedCollectibles));
    renderCollectibles();
  }
}

function renderCollectibles() {
  if (!collectiblesGrid) return;
  collectiblesGrid.innerHTML = COLLECTIBLES_DB.map(c => {
    const isUnlocked = appState.unlockedCollectibles.includes(c.id);
    const lockedClass = isUnlocked ? "" : "tcg-locked";
    const foilHtml = isUnlocked && (c.rarity === "Holo" || c.rarity === "Secret Rare") ? '<div class="tcg-foil"></div>' : '';
    const artEmoji = c.id === "c1" ? "💧" : c.id === "c2" ? "🥗" : c.id === "c3" ? "🔥" : "💎";
    
    return `
      <div class="tcg-slab ${lockedClass}">
        <div class="tcg-label">
          <div class="tcg-label-left">
            <span class="tcg-brand">${c.brand}</span>
            <span class="tcg-title">${c.name}</span>
            <span class="tcg-desc">${c.desc}</span>
          </div>
          <div class="tcg-grade">
            <span class="tcg-grade-text">GEM MINT</span>
            <span class="tcg-grade-num">${c.grade}</span>
          </div>
        </div>
        <div class="tcg-card">
          <div class="tcg-art">${artEmoji}</div>
          ${foilHtml}
          <div class="tcg-details">
            <div class="tcg-rarity">${c.rarity}</div>
            <div class="tcg-name">${isUnlocked ? c.name : "Locked"}</div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ============== MACRO ENGINE & DATABASES ==============

// Specific Exact Macros for Common Items (Per 100g)
const exactMacros = {
  "chicken breast": {p:31, c:0, f:3.6}, "salmon": {p:20, c:0, f:13}, "egg": {p:13, c:1.1, f:11},
  "tofu": {p:8, c:1.9, f:4.8}, "lentils": {p:9, c:20, f:0.4}, "white rice": {p:2.7, c:28, f:0.3},
  "brown rice": {p:2.6, c:23, f:0.9}, "broccoli": {p:2.8, c:7, f:0.4}, "spinach": {p:2.9, c:3.6, f:0.4},
  "avocado": {p:2, c:8.5, f:15}, "apple": {p:0.3, c:14, f:0.2}, "banana": {p:1.1, c:23, f:0.3},
  "pizza": {p:11, c:33, f:10}, "french fries": {p:3.4, c:41, f:15}, "bread": {p:9, c:49, f:3},
  "sweet potato": {p:1.6, c:20, f:0.1}, "potato": {p:2, c:17, f:0.1}, "almonds": {p:21, c:22, f:49}
};

const foods = {
  "artichoke": 47, "arugula": 50, "asparagus": 17, "aubergine": 25, "beetroot": 43, "bell pepper": 21, "black olives": 74, "broccoli": 34, "brussels sprouts": 42, "cabbage": 25, "capsicum": 27, "carrot": 41, "cauliflower": 23, "celery": 15, "chard": 19, "cherry tomato": 100, "chicory": 72, "chinese cabbage": 16, "chives": 33, "collard greens": 29, "corn": 365, "courgette": 17, "creamed spinach": 74, "cucumber": 16, "eggplant": 25, "endive": 17, "fennel": 31, "garlic": 133, "gherkin": 900, "gourd": 10800, "green beans": 31, "green olives": 74, "green onion": 500, "horseradish": 47, "kale": 49, "kohlrabi": 27, "kumara": 86, "leek": 61, "lettuce": 15, "mushrooms": 19, "mustard greens": 27, "nori": 38, "okra": 33, "olives": 74, "onion": 40, "parsnips": 75, "peas": 81, "pepper": 27, "potato": 77, "pumpkin": 26, "radishes": 22, "red cabbage": 32, "rutabaga": 38, "shallots": 72, "spinach": 23, "squash": 45, "sweet potato": 86, "tomato": 18, "turnip greens": 20, "turnips": 28, "wasabi": 109, "winter squash": 34, "zucchini": 17, "acai": 71, "apple": 52, "applesauce": 68, "apricot": 49, "avocado": 160, "banana": 89, "blackberries": 43, "blood oranges": 50, "blueberries": 57, "cantaloupe": 33, "cherries": 50, "clementine": 47, "cranberries": 46, "currants": 56, "custard apple": 101, "dates": 282, "figs": 74, "fruit salad": 50, "grapes": 69, "greengage": 40, "guava": 3700, "jackfruit": 95, "jujube": 78, "kiwi": 61, "lemon": 29, "lime": 30, "lychees": 70, "mandarin oranges": 53, "mango": 60, "minneola": 64, "mulberries": 43, "nectarine": 44, "orange": 47, "papaya": 43, "passion fruit": 94, "peach": 39, "pear": 57, "persimmon": 128, "physalis": 40, "pineapple": 50, "plantains": 122, "plum": 45, "pomegranate": 83, "quince": 57, "raisins": 299, "rambutan": 78, "raspberries": 52, "rhubarb": 22, "starfruit": 31, "strawberries": 32, "tamarind": 250, "tangerine": 53, "watermelon": 30, "baby back ribs": 259, "bacon and eggs": 252, "baked beans": 94, "bbq ribs": 255, "beef stew": 95, "biryani": 176, "black pudding": 252, "black rice": 323, "blt": 247, "brown rice": 388, "burrito": 163, "butter chicken": 140, "california roll": 94, "chicken caesar salad": 127, "chicken fried steak": 151, "chicken marsala": 96, "chicken parmesan": 110, "chicken pot pie": 223, "chicken tikka masala": 81, "chili con carne": 105, "chimichanga": 232, "cobb salad": 118, "corn dog": 250, "corned beef hash": 164, "cottage pie": 139, "dal": 330, "deviled eggs": 200, "dim sum": 195, "dosa": 66, "enchiladas": 168, "fajita": 117, "fish and chips": 195, "fried rice": 186, "fried shrimp": 278, "grilled cheese sandwich": 288, "ham and cheese sandwich": 241, "hummus": 177, "jambalaya": 100, "kebab": 215, "lasagne": 132, "mac and cheese": 370, "macaroni and cheese": 370, "mashed potatoes": 83, "meat pie": 242, "meatloaf": 254, "naan": 310, "orange chicken": 259, "pad thai": 150, "paella": 156, "paratha": 325, "pea soup": 75, "peanut butter sandwich": 408, "peking duck": 225, "philly cheese steak": 250, "pizza": 267, "pork chop": 225, "potato salad": 143, "pulled pork sandwich": 211, "ramen": 436, "ravioli": 77, "reuben sandwich": 208, "roast beef": 110, "roast dinner": 198, "samosa": 214, "sausage roll": 350, "sausage rolls": 297, "shepherds pie": 70, "shrimp cocktail": 464, "sloppy joe": 71, "sloppy joes": 154, "spaghetti bolognese": 132, "spring roll": 250, "spring rolls": 250, "taco": 217, "tandoori chicken": 113, "yorkshire pudding": 553, "amaranth": 371, "barley": 354, "barley groats": 100, "buckwheat": 343, "buckwheat groats": 346, "corn waffles": 275, "cornmeal": 362, "cornstarch": 381, "couscous": 376, "cracker": 500, "durum wheat semolina": 396, "flaxseed": 534, "freekeh": 520, "gluten": 371, "grissini": 2000, "kamut": 337, "millet": 378, "millet flour": 372, "millet gruel": 46, "oat bran": 246, "pearl barley": 352, "polenta": 366, "prawn crackers": 533, "pretzel sticks": 383, "quinoa": 368, "rusk": 410, "rye bran": 281, "sago": 354, "savoury biscuits": 348, "shortbread": 500, "spelt": 338, "spelt bran": 177, "spelt semolina": 360, "sunflower seeds": 584, "tortilla": 237, "tortilla chips": 500, "wheat bran": 216, "wheat germ": 382, "wheat gluten": 333, "wheat semolina": 360, "wheat starch": 351, "whole grain wheat": 339, "wholegrain oat": 375, "almond oil": 123, "apricot kernel oil": 124, "argan oil": 125, "avocado oil": 120, "babassu oil": 124, "canola oil": 124, "coconut oil": 120, "corn oil": 120, "cottonseed oil": 123, "flaxseed oil": 124, "grape seed oil": 124, "hazelnut oil": 124, "linseed oil": 117, "menhaden oil": 128, "mustard oil": 124, "oat oil": 124, "olive oil": 120, "palm kernel oil": 123, "palm oil": 123, "peanut oil": 120, "poppy seed oil": 124, "pumpkin seed oil": 123, "rice bran oil": 124, "safflower oil": 120, "salmon oil": 128, "sesame oil": 124, "shea oil": 124, "soy oil": 123, "sunflower oil": 124, "tomato seed oil": 124, "vegetable oil": 120, "walnut oil": 124, "wheat germ oil": 130, "alphabet soup": 25, "bean stew": 133, "beef bouillon": 3, "beef noodle soup": 34, "beef soup": 33, "bouillon": 16, "broccoli cheese soup": 87, "broccoli soup": 87, "cabbage soup": 28, "carrot ginger soup": 25, "carrot soup": 25, "chicken bouillon": 4, "chicken broth": 16, "chicken gumbo soup": 23, "chicken noodle soup": 25, "chicken stock": 16, "chicken vegetable soup": 31, "chicken with rice soup": 24, "cream of asparagus soup": 35, "cream of broccoli soup": 45, "cream of celery soup": 37, "cream of chicken soup": 48, "cream of mushroom soup": 39, "cream of onion soup": 44, "cream of potato soup": 30, "creamy chicken noodle soup": 23, "french onion soup": 23, "golden mushroom soup": 65, "goulash": 1009, "instant ramen": 436, "lentil soup": 56, "lobster bisque soup": 100, "meatball soup": 49, "minestrone": 34, "mushroom soup": 35, "noodle soup": 34, "onion soup": 23, "oxtail soup": 28, "potato soup": 80, "pumpkin soup": 29, "scotch broth": 33, "succotash": 115, "thai soup": 60, "tomato rice soup": 47, "tomato soup": 30, "vegetable beef soup": 31, "vegetable broth": 5, "vegetable soup": 28, "vegetable stock": 5, "wedding soup": 53, "baskin-robbins": 239, "ben and jerry\u2019s": 228, "butter pecan ice cream": 248, "carvel": 212, "chocolate chip ice cream": 215, "chocolate ice cream": 217, "ciao bella": 109, "coffee ice cream": 236, "cold stone creamery": 232, "cookie dough ice cream": 200, "crunchie mcflurry": 174, "dairy milk mcflurry": 186, "dippin dots": 224, "double rainbow": 257, "drumsticks": 255, "french vanilla ice cream": 201, "friendly\u2019s": 212, "healthy choice": 125, "hot fudge sundae": 186, "ice cream sandwich": 237, "ice cream sundae": 142, "ice milk": 159, "magnolia": 231, "magnum": 300, "magnum almond": 315, "magnum double caramel": 355, "magnum double chocolate": 380, "magnum gold": 341, "magnum white": 297, "mcflurry": 153, "mcflurry oreo": 186, "mini milk": 120, "mint chocolate chip ice cream": 239, "rocky road ice cream": 257, "schwan\u2019s": 246, "smarties mcflurry": 198, "snickers ice cream": 360, "soft serve": 222, "solero": 100, "strawberry ice cream": 236, "strawberry sundae": 158, "sundae": 215, "turkey hill": 271, "vanilla cone": 162, "vanilla ice cream": 201, "cannelloni": 146, "capellini": 354, "cappelletti": 164, "cellophane noodles": 351, "cheese tortellini": 291, "dampfnudel": 274, "dumpling dough": 98, "egg noodles": 384, "farfalle": 357, "fettuccine": 354, "fusilli": 352, "glass noodles": 193, "lasagne sheets": 271, "linguine": 357, "low carb pasta": 282, "macaroni": 370, "manicotti": 357, "mostaccioli": 184, "orecchiette": 370, "orzo": 357, "penne": 352, "penne rigate": 370, "pierogi": 200, "rigatoni": 354, "rotini": 354, "shells": 353, "shirataki noodles": 18, "soy noodles": 216, "spaetzle": 368, "spaghetti": 370, "spinach tortellini": 314, "spirelli": 368, "tagliatelle": 370, "tortellini": 291, "vermicelli": 368, "whole grain noodles": 346, "whole grain spaghetti": 352, "ziti": 352, "bbq chicken pizza": 234, "bbq pizza": 224, "beef pizza": 304, "bianca pizza": 246, "buffalo chicken pizza": 252, "calabrese pizza": 235, "calzone": 231, "capricciosa pizza": 259, "cheese pizza": 267, "chicken pizza": 234, "deep dish pizza": 265, "dominos philly cheese steak pizza": 224, "four cheese pizza": 221, "goat cheese pizza": 219, "grilled pizza": 226, "hawaiian pizza": 115, "margherita pizza": 275, "mozzarella pizza": 248, "mushroom pizza": 212, "napoli pizza": 202, "new york style pizza": 169, "pepperoni pizza": 255, "pizza dough": 228, "pizza hut stuffed crust pizza": 255, "pizza hut supreme pizza": 248, "pizza rolls": 250, "quattro formaggi pizza": 248, "red pepper pizza": 192, "salami pizza": 255, "sausage pizza": 246, "seafood pizza": 245, "shrimp pizza": 209, "sicilian pizza": 241, "spinach feta pizza": 242, "spinach pizza": 234, "stuffed crust pizza": 255, "tarte flamb\u00e9e": 254, "thin crust pizza": 262, "tuna pizza": 254, "vegetable pizza": 256, "vegetarian pizza": 256, "veggie pizza": 231, "white pizza": 246, "acerola": 21, "asian pear": 42, "breadfruit": 103, "cantaloupe melon": 33, "casaba melon": 28, "cherimoya": 75, "dragon fruit": 60, "durian": 147, "feijoa": 55, "galia melon": 23, "grapefruit": 2600, "honeydew": 36, "kumquat": 68, "lychee": 70, "mangosteen": 72, "maracuya": 94, "maraschino cherries": 160, "muskmelon": 33, "noni": 53, "pink grapefruit": 2600, "plantain": 122, "pomelo": 38, "prickly pear": 42, "sapodilla": 83, "soursop fruit": 66, "star fruit": 31, "arby\u2019s grand turkey club": 210, "arby\u2019s reuben": 208, "arby\u2019s roast beef classic": 234, "arby\u2019s roast beef max": 234, "bbq rib": 212, "bean burrito": 200, "big n\u2019 tasty": 223, "bratwurst": 333, "burger king angry whopper": 255, "burger king double whopper": 239, "burger king double whopper with cheese": 249, "burger king original chicken sandwich": 301, "burger king premium alaskan fish sandwich": 259, "burger king triple whopper": 269, "burger king whopper": 231, "burger king whopper jr.": 234, "burger king whopper with cheese": 241, "cheeseburger": 263, "chicken breast": 163, "chicken fajita": 147, "chicken mcnuggets": 300, "chicken nuggets": 295, "chicken pizziola": 141, "chicken sandwich": 241, "chicken teriyaki sandwich": 138, "chicken wings": 324, "chop suey": 172, "curly fries": 311, "double cheeseburger": 267, "egg roll": 250, "falafel": 335, "filet-o-fish": 282, "fish sandwich": 273, "french fries": 313, "grilled chicken salad": 88, "ham sandwich": 241, "hamburger": 254, "hot dog": 269, "italian bmt": 183, "lasagna": 132, "mcdonald\u2019s big mac": 256, "mcdonald\u2019s cheeseburger": 263, "mcdonald\u2019s chicken nuggets": 300, "mcdonald\u2019s double cheeseburger": 282, "mcdonald\u2019s filet-o-fish": 275, "mcdonald\u2019s mcchicken": 251, "mcdonald\u2019s mcdouble": 252, "mcdonald\u2019s mcmuffi egg": 225, "mcdonald\u2019s mcrib": 265, "mcdonald\u2019s mighty wings": 306, "mcrib": 265, "meatball sandwich": 161, "nachos with cheese": 306, "onion rings": 385, "poutine": 227, "smoked salmon": 155, "spicy italian": 219, "subway club sandwich": 131, "tortilla wrap": 271, "tuna": 85, "turkey": 102, "veggie burger": 181, "veggie delight": 138, "veggie patty": 390, "wendy\u2019s baconator": 304, "wendy\u2019s jr. bacon cheeseburger": 261, "wendy\u2019s jr. cheeseburger": 225, "wendy\u2019s son of baconator": 321, "whopper": 231, "zinger": 256, "zinger burger": 256
};

const foodCategories = {
  "All": Object.keys(foods).sort(),
  "Produce": ["sweet potato", "red cabbage", "cabbage", "radishes", "maraschino cherries", "nori", "artichoke", "passion fruit", "shallots", "grapefruit", "pink grapefruit", "endive", "green beans", "green olives", "pumpkin", "squash", "cherry tomato", "jujube", "cantaloupe", "courgette", "apple", "plantains", "tomato", "green onion", "mangosteen", "fennel", "collard greens", "spinach", "bell pepper", "turnip greens", "rutabaga", "pomegranate", "guava", "blueberries", "kohlrabi", "fruit salad", "corn", "plantain", "maracuya", "zucchini", "asparagus", "nectarine", "starfruit", "strawberries", "cantaloupe melon", "galia melon", "chicory", "creamed spinach", "kumara", "turnips", "blood oranges", "black olives", "tangerine", "gherkin", "olives", "arugula", "celery", "onion", "kumquat", "mushrooms", "star fruit", "soursop fruit", "prickly pear", "parsnips", "chard", "broccoli", "asian pear", "carrot", "sapodilla", "lychee", "durian", "papaya", "dragon fruit", "cherimoya", "figs", "peas", "tamarind", "watermelon", "cauliflower", "grapes", "peach", "rhubarb", "mustard greens", "jackfruit", "aubergine", "blackberries", "lemon", "dates", "rambutan", "orange", "cherries", "cranberries", "eggplant", "potato", "wasabi", "kale", "gourd", "kiwi", "chinese cabbage", "cucumber", "pear", "brussels sprouts", "breadfruit", "physalis", "plum", "capsicum", "garlic", "acai", "leek", "mango", "apricot", "casaba melon", "mulberries", "avocado", "pinepple", "raspberries", "lettuce", "okra", "honeydew", "lychees", "chives", "beetroot", "muskmelon", "persimmon", "feijoa", "quince", "noni", "banana", "greengage", "winter squash", "lime", "currants", "applesauce", "raisins", "minneola", "clementine", "mandarin oranges", "custard apple"],
  "Protein": ["sausage roll", "samosa", "tandoori chicken", "burger king triple whopper", "egg noodles", "wendy\u2019s jr. bacon cheeseburger", "mcdonald\u2019s mcchicken", "beef pizza", "wendy\u2019s jr. cheeseburger", "fish sandwich", "buffalo chicken pizza", "burger king whopper jr.", "pork chop", "sausage rolls", "chicken pizziola", "taco", "chicken pot pie", "mcdonald\u2019s chicken nuggets", "wendy\u2019s baconator", "bbq rib", "fried shrimp", "bacon and eggs", "mcdonald\u2019s filet-o-fish", "filet-o-fish", "chicken breast", "chicken pizza", "burger king original chicken sandwich", "chicken mcnuggets", "bbq ribs", "bbq chicken pizza", "fish and chips", "wendy\u2019s son of baconator", "burger king premium alaskan fish sandwich", "bbq pizza", "chicken sandwich", "dal", "mcdonald\u2019s mcrib", "chicken teriyaki sandwich", "mcrib", "chicken fried steak", "shrimp cocktail", "shrimp pizza", "tuna pizza", "burger king double whopper with cheese", "mcdonald\u2019s mcdouble", "smoked salmon", "chicken nuggets", "mcdonald\u2019s mighty wings", "beef stew", "chicken tikka masala", "chicken marsala", "burger king angry whopper", "sausage pizza", "roast beef", "baby back ribs", "beef noodle soup", "tuna", "burger king double whopper", "burger king whopper with cheese", "beef bouillon", "mcdonald\u2019s double cheeseburger", "chicken wings", "beef soup", "chickpeas", "lentils", "burger king whopper", "vegetable beef soup", "tofu", "seafood pizza", "meat pie", "meatloaf", "meatball sandwich", "meatball soup"],
  "Carbs": ["burger king triple whopper", "egg noodles", "wheat gluten", "spaghetti", "wendy\u2019s jr. bacon cheeseburger", "mcdonald\u2019s mcchicken", "beef pizza", "wendy\u2019s jr. cheeseburger", "fish sandwich", "wheat starch", "buffalo chicken pizza", "cellophane noodles", "spaghetti bolognese", "burger king whopper jr.", "sausage rolls", "chicken pizziola", "taco", "cappelletti", "chicken pot pie", "mcdonald\u2019s chicken nuggets", "oat bran", "wendy\u2019s baconator", "shirataki noodles", "wheat semolina", "wheat germ", "bbq rib", "fried shrimp", "bacon and eggs", "cracker", "prawn crackers", "savoury biscuits", "pizza rolls", "pizza dough", "glass noodles", "mcdonald\u2019s filet-o-fish", "filet-o-fish", "chicken breast", "bbq chicken pizza", "burger king original chicken sandwich", "chicken pizza", "chicken mcnuggets", "spelt semolina", "bbq ribs", "fish and chips", "spelt bran", "wendy\u2019s son of baconator", "burger king premium alaskan fish sandwich", "bbq pizza", "durum wheat semolina", "chicken sandwich", "dal", "mcdonald\u2019s mcrib", "chicken teriyaki sandwich", "mcrib", "chicken fried steak", "shrimp cocktail", "shrimp pizza", "wholegrain oat", "tuna pizza", "wheat bran", "burger king double whopper with cheese", "mcdonald\u2019s mcdouble", "chicken nuggets", "smoked salmon", "mcdonald\u2019s mighty wings", "noodle soup", "beef stew", "chicken tikka masala", "chicken marsala", "burger king angry whopper", "sausage pizza", "roast beef", "baby back ribs", "beef noodle soup", "creamy chicken noodle soup", "tuna", "burger king double whopper", "burger king whopper with cheese", "chicken noodle soup", "mcdonald\u2019s double cheeseburger", "chicken wings", "chicken with rice soup", "chickpeas", "lentils", "burger king whopper", "whole grain wheat", "tofu", "seafood pizza", "meat pie", "meatloaf", "meatball sandwich"],
  "Fast Food": ["dominos philly cheese steak pizza", "burger king triple whopper", "dairy milk mcflurry", "wendy\u2019s jr. bacon cheeseburger", "mcdonald\u2019s mcchicken", "beef pizza", "chocolate ice cream", "wendy\u2019s jr. cheeseburger", "fish sandwich", "fried rice", "buffalo chicken pizza", "burger king whopper jr.", "chicken pizziola", "mac and cheese", "mcdonald\u2019s chicken nuggets", "wendy\u2019s baconator", "fried shrimp", "bbq rib", "pizza rolls", "pizza dough", "mcdonald\u2019s filet-o-fish", "mcdonald\u2019s big mac", "bbq chicken pizza", "burger king original chicken sandwich", "chicken pizza", "chicken mcnuggets", "burger king premium alaskan fish sandwich", "wendy\u2019s son of baconator", "bbq pizza", "mcdonald\u2019s mcrib", "chicken sandwich", "mcrib", "shrimp pizza", "tuna pizza", "mcdonald\u2019s mcmuffi egg", "burger king double whopper with cheese", "chicken nuggets", "mcdonald\u2019s mcdouble", "french fries", "mcdonald\u2019s mighty wings", "subway club sandwich", "burger king angry whopper", "sausage pizza", "mcdonald\u2019s cheeseburger", "macaroni and cheese", "burger king double whopper", "burger king whopper with cheese", "french vanilla ice cream", "mcdonald\u2019s double cheeseburger", "burger king whopper", "seafood pizza", "fried egg"],
  "Asian": ["bbq chicken pizza", "chicken pizziola", "burger king original chicken sandwich", "chicken pizza", "chicken mcnuggets", "bbq pizza", "shrimp pizza", "chicken sandwich", "tuna pizza", "buffalo chicken pizza", "dim sum", "chicken nuggets", "mcdonald\u2019s mighty wings", "beef pizza", "fried rice", "chicken tikka masala", "sausage pizza", "chicken marsala", "beef noodle soup", "tandoori chicken", "chicken noodle soup", "chicken with rice soup", "creamy chicken noodle soup", "seafood pizza", "tofu", "chicken pot pie"]
};

// Algorithmic Macro Fallback Finder
function getMacroPer100(name, categoryType='food') {
  const n = (name || '').toLowerCase().trim();
  if (categoryType === 'oil') return { p: 0, c: 0, f: 100 };
  if (categoryType === 'drink') {
      if (n.includes('latte') || n.includes('milk')) return { p: 3, c: 5, f: 2 };
      if (n.includes('juice') || n.includes('cola')) return { p: 0, c: 10, f: 0 };
      return { p: 0, c: 0, f: 0 };
  }
  if (exactMacros[n]) return exactMacros[n];
  if (foodCategories.Produce.includes(n)) return { p: 1, c: 10, f: 0 };
  if (foodCategories.Protein.includes(n)) return { p: 20, c: 0, f: 5 };
  if (foodCategories.Carbs.includes(n)) return { p: 5, c: 50, f: 2 };
  if (foodCategories["Fast Food"].includes(n)) return { p: 12, c: 30, f: 15 };
  if (foodCategories.Asian.includes(n)) return { p: 8, c: 25, f: 10 };
  return { p: 0, c: 0, f: 0 };
}

// State tracker for which input triggered the modal
let _activeIngredientInput = null;
let _currentFoodCategory = "All";

const oils = {
  "olive oil": 884, "coconut oil": 862, "sesame oil": 884, "avocado oil": 884,
  "sunflower oil": 884, "canola oil": 884, "butter": 717
};

const drinks = {
  "water": 0, "black coffee": 1, "green tea": 1, "latte": 60,
  "orange juice": 45, "cola": 42, "beer": 43, "wine": 85, "smoothie": 80
};

const ICONS = {
  reward: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.09 4.26L19 7.27l-3 2.92.71 4.15L12 13.77 7.29 14.34 8 10.19 5 7.27l4.91-.99L12 2z" fill="#f59e0b"/></svg>`,
  flame: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2s4 3 4 6c0 3-2 4-2 6s-2 3-2 3-2-1-2-3-2-3-2-6c0-3 4-6 4-6z" fill="#fb923c"/></svg>`,
  target: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="#06b6d4" stroke-width="1.6" fill="none"/><circle cx="12" cy="12" r="4" fill="#06b6d4"/></svg>`,
  water: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2s6 6 6 10a6 6 0 11-12 0c0-4 6-10 6-10z" fill="#06b6d4"/></svg>`
};

const mealSuggestions = [
  { emoji: "🥗", name: "Green Veggie Bowl", note: "High fiber, plant-forward", servings: 1, ingredients: [{ name: 'spinach', qty: 1, weight: 80 }, { name: 'quinoa', qty: 1, weight: 120 }, { name: 'chickpeas', qty: 1, weight: 80 }], oils: [{ type: 'olive oil', amount: 10 }], drinks: [{ type: 'water', amount: 250 }] },
  { emoji: '🐟', name: 'Salmon Quinoa', note: 'Protein-rich and filling', servings: 1, ingredients: [{ name: 'salmon', qty: 1, weight: 120 }, { name: 'quinoa', qty: 1, weight: 100 }, { name: 'broccoli', qty: 1, weight: 80 }], oils: [{ type: 'olive oil', amount: 8 }], drinks: [{ type: 'water', amount: 200 }] },
  { emoji: '🍲', name: 'Lentil Soup', note: 'Warm, low-fat meal', servings: 1, ingredients: [{ name: 'lentils', qty: 1, weight: 150 }, { name: 'carrot', qty: 1, weight: 70 }, { name: 'onion', qty: 1, weight: 50 }], oils: [{ type: 'olive oil', amount: 6 }], drinks: [{ type: 'water', amount: 200 }] },
  { emoji: '🥪', name: 'Chicken Wrap', note: 'Easy packed lunch', servings: 1, ingredients: [{ name: 'chicken breast', qty: 1, weight: 100 }, { name: 'salad', qty: 1, weight: 30 }, { name: 'whole wheat bread', qty: 1, weight: 60 }], oils: [{ type: 'olive oil', amount: 6 }], drinks: [{ type: 'water', amount: 250 }] },
  { emoji: '🍚', name: 'Rice & Veg', note: 'Steady energy release', servings: 1, ingredients: [{ name: 'white rice', qty: 1, weight: 150 }, { name: 'salad', qty: 1, weight: 120 }], oils: [{ type: 'canola oil', amount: 8 }], drinks: [{ type: 'water', amount: 200 }] },
  { emoji: '🍳', name: 'Egg & Avocado', note: 'Great breakfast protein', servings: 1, ingredients: [{ name: 'egg', qty: 2, weight: 100 }, { name: 'avocado', qty: 0.5, weight: 75 }], oils: [{ type: 'butter', amount: 6 }], drinks: [{ type: 'black coffee', amount: 200 }] }
];

// ============== BUILDERS & CALCULATORS ==============

function applyAdvancedMode() {
  const els = document.querySelectorAll(".macro-display");
  els.forEach(el => {
    if (appState.advancedMode) el.classList.remove("hidden");
    else el.classList.add("hidden");
  });
}

const advancedModeToggle = $("advanced-mode-toggle");
if (advancedModeToggle) {
  advancedModeToggle.checked = appState.advancedMode;
  advancedModeToggle.addEventListener("change", (e) => {
    appState.advancedMode = e.target.checked;
    localStorage.setItem("advancedMode", appState.advancedMode);
    applyAdvancedMode();
  });
}

function createIngredientRow(initial = {}) {
  const row = document.createElement('div');
  row.className = 'ingredient-row';
  const hiddenClass = appState.advancedMode ? '' : 'hidden';
  
  row.innerHTML = `
    <div class="input-with-icon">
      <span class="search-icon">🔍</span>
      <input class="ingredient-name" type="text" placeholder="Find food..." value="${initial.name || ''}" readonly />
    </div>
    <input class="ingredient-qty" type="number" min="0" step="0.25" value="${initial.qty || 1}" placeholder="Qty" />
    <input class="ingredient-weight" type="number" min="0" step="1" value="${initial.weight || 100}" placeholder="g" />
    <div class="ingredient-kcal muted small">0 kcal</div>
    <div class="ingredient-macros macro-display ${hiddenClass} muted small" style="font-size: 0.75rem; color: #64748b;">0p/0c/0f</div>
    <button type="button" class="btn-remove ingredient-remove" title="Remove">✕</button>`;
  
  row.querySelector('.ingredient-name').addEventListener('click', (e) => {
    _activeIngredientInput = e.target;
    openFoodSearchModal();
  });
  
  row.querySelector('.ingredient-remove').addEventListener('click', () => { row.remove(); updateRecipeSummary(); });
  row.querySelectorAll('input').forEach(input => input.addEventListener('input', updateRecipeSummary));
  return row;
}

function createOilRow(initial = {}) {
  const row = document.createElement('div');
  row.className = 'oil-row';
  const hiddenClass = appState.advancedMode ? '' : 'hidden';
  
  row.innerHTML = `
    <select class="oil-type"><option value="">Select oil</option>${Object.keys(oils).map((name) => `<option value="${name}" ${initial.type === name ? 'selected' : ''}>${name}</option>`).join('')}</select>
    <input class="oil-amount" type="number" min="0" step="1" value="${initial.amount || ''}" placeholder="ml" />
    <div class="ingredient-kcal muted small">0 kcal</div>
    <div class="ingredient-macros macro-display ${hiddenClass} muted small" style="font-size: 0.75rem; color: #64748b;">0p/0c/0f</div>
    <button type="button" class="btn-remove oil-remove" title="Remove">✕</button>`;
    
  row.querySelector('.oil-remove').addEventListener('click', () => { row.remove(); updateRecipeSummary(); });
  row.querySelectorAll('input, select').forEach(input => input.addEventListener('input', updateRecipeSummary));
  return row;
}

function createDrinkRow(initial = {}) {
  const row = document.createElement('div');
  row.className = 'drink-row';
  const hiddenClass = appState.advancedMode ? '' : 'hidden';
  
  row.innerHTML = `
    <select class="drink-type"><option value="">Select drink</option>${Object.keys(drinks).map(name => `<option value="${name}" ${initial.type === name ? 'selected' : ''}>${name}</option>`).join('')}</select>
    <input class="drink-amount" type="number" min="0" step="1" value="${initial.amount || ''}" placeholder="ml" />
    <div class="ingredient-kcal muted small">0 kcal</div>
    <div class="ingredient-macros macro-display ${hiddenClass} muted small" style="font-size: 0.75rem; color: #64748b;">0p/0c/0f</div>
    <button type="button" class="btn-remove drink-remove" title="Remove">✕</button>`;
    
  row.querySelector('.drink-remove').addEventListener('click', () => { row.remove(); updateRecipeSummary(); });
  row.querySelectorAll('input, select').forEach(input => input.addEventListener('input', updateRecipeSummary));
  return row;
}

function buildIngredientRows(count = 1) { if (ingredientRows) { ingredientRows.innerHTML = ''; for (let i = 0; i < count; i++) ingredientRows.appendChild(createIngredientRow()); } }
function buildOilRows(count = 1) { if (oilRows) { oilRows.innerHTML = ''; for (let i = 0; i < count; i++) oilRows.appendChild(createOilRow()); } }
function buildDrinkRows(count = 1) { if (drinkRows) { drinkRows.innerHTML = ''; for (let i = 0; i < count; i++) drinkRows.appendChild(createDrinkRow()); } }

function getIngredientCalories(name, qty, weight) {
  const trimmed = (name || '').toLowerCase().trim();
  if (!trimmed) return 0;
  let baseCalories = foods[trimmed] || foods[Object.keys(foods).find((food) => trimmed.includes(food))];
  if (!baseCalories || baseCalories <= 0) return 0;
  return Math.round((baseCalories * (parseFloat(weight) || 100) / 100) * (parseFloat(qty) || 1));
}

function updateRecipeSummary() {
  if (!ingredientRows || !servingCalEl || !dishCalEl) return;
  let totalCalories = 0, totalP = 0, totalC = 0, totalF = 0;
  
  ingredientRows.querySelectorAll('.ingredient-row').forEach((row) => {
    const name = row.querySelector('.ingredient-name').value;
    const qty = parseFloat(row.querySelector('.ingredient-qty').value) || 0;
    const weight = parseFloat(row.querySelector('.ingredient-weight').value) || 0;
    
    const calories = getIngredientCalories(name, qty, weight);
    totalCalories += calories;
    row.querySelector('.ingredient-kcal').textContent = `${calories} kcal`;

    const macros = getMacroPer100(name, 'food');
    const factor = (qty * weight) / 100;
    const p = macros.p * factor, c = macros.c * factor, f = macros.f * factor;
    totalP += p; totalC += c; totalF += f;
    
    if (row.querySelector('.ingredient-macros')) {
      row.querySelector('.ingredient-macros').textContent = `${Math.round(p)}p / ${Math.round(c)}c / ${Math.round(f)}f`;
    }
  });

  if (oilRows) oilRows.querySelectorAll('.oil-row').forEach((row) => {
    const type = row.querySelector('.oil-type').value;
    const amount = parseFloat(row.querySelector('.oil-amount').value) || 0;
    
    const calories = type && amount > 0 ? Math.round((oils[type] * amount) / 100) : 0;
    totalCalories += calories;
    row.querySelector('.ingredient-kcal').textContent = `${calories} kcal`;

    const o_macros = getMacroPer100(type, 'oil');
    const o_factor = amount / 100;
    const op = o_macros.p * o_factor, oc = o_macros.c * o_factor, of_m = o_macros.f * o_factor;
    totalP += op; totalC += oc; totalF += of_m;
    
    if (row.querySelector('.ingredient-macros')) {
      row.querySelector('.ingredient-macros').textContent = `${Math.round(op)}p / ${Math.round(oc)}c / ${Math.round(of_m)}f`;
    }
  });

  if (drinkRows) drinkRows.querySelectorAll('.drink-row').forEach((row) => {
    const type = row.querySelector('.drink-type').value;
    const amount = parseFloat(row.querySelector('.drink-amount').value) || 0;
    
    const calories = type && amount > 0 ? Math.round((drinks[type] * amount) / 100) : 0;
    totalCalories += calories;
    row.querySelector('.ingredient-kcal').textContent = `${calories} kcal`;

    const d_macros = getMacroPer100(type, 'drink');
    const d_factor = amount / 100;
    const dp = d_macros.p * d_factor, dc = d_macros.c * d_factor, df_m = d_macros.f * d_factor;
    totalP += dp; totalC += dc; totalF += df_m;
    
    if (row.querySelector('.ingredient-macros')) {
      row.querySelector('.ingredient-macros').textContent = `${Math.round(dp)}p / ${Math.round(dc)}c / ${Math.round(df_m)}f`;
    }
  });

  const servings = Math.max(1, parseInt(servingsInput?.value, 10) || 1);
  servingCalEl.textContent = `${Math.round(totalCalories / servings)} kcal`;
  dishCalEl.textContent = `${Math.round(totalCalories)} kcal`;
  
  if ($('dish-protein')) $('dish-protein').textContent = `${Math.round(totalP / servings)} g`;
  if ($('dish-carbs')) $('dish-carbs').textContent = `${Math.round(totalC / servings)} g`;
  if ($('dish-fats')) $('dish-fats').textContent = `${Math.round(totalF / servings)} g`;

  if (mealEstimateEl) mealEstimateEl.textContent = totalCalories > 0 ? `Estimate from ingredients • ${Math.round(totalCalories / servings)} kcal per serving` : 'Estimate from ingredients';
}

function getMealSuggestions() {
  const shuffled = [...mealSuggestions].sort(() => 0.5 - Math.random());
  return [shuffled[0], shuffled[1], shuffled[2]];
}

function renderMealSuggestions() {
  if (!suggestionCards) return;
  
  suggestionCards.innerHTML = getMealSuggestions().map((s) => {
    let total = 0, totalP = 0, totalC = 0, totalF = 0;
    
    (s.ingredients || []).forEach(ing => { 
      const c = Math.round(getIngredientCalories(ing.name, ing.qty || 1, ing.weight || 100)); 
      total += c; 
      
      const mac = getMacroPer100(ing.name, 'food');
      const fac = (ing.qty || 1) * (ing.weight || 100) / 100;
      totalP += mac.p * fac; totalC += mac.c * fac; totalF += mac.f * fac;
    });
    
    (s.oils || []).forEach(o => { 
      const c = Math.round((oils[o.type] * (o.amount || 0)) / 100); 
      total += c; 
      
      const mac = getMacroPer100(o.type, 'oil');
      const fac = (o.amount || 0) / 100;
      totalP += mac.p * fac; totalC += mac.c * fac; totalF += mac.f * fac;
    });
    
    (s.drinks || []).forEach(d => { 
      const c = Math.round((drinks[d.type] * (d.amount || 0)) / 100); 
      total += c; 
      
      const mac = getMacroPer100(d.type, 'drink');
      const fac = (d.amount || 0) / 100;
      totalP += mac.p * fac; totalC += mac.c * fac; totalF += mac.f * fac;
    });
    
    const globalIdx = mealSuggestions.findIndex(m => m.name === s.name);
    
    return `
      <div class="suggestion-card" data-idx="${globalIdx}">
        <div class="suggestion-head">
          <span class="emoji">${s.emoji}</span>
          <div class="name">${s.name}</div>
          <div class="cal muted">${total} kcal</div>
        </div>
        <div class="suggestion-note muted">${s.note}</div>
        
        <!-- Always Visible Macro Badges -->
        <div style="display: flex; gap: 0.8rem; margin-top: 0.8rem; font-size: 0.75rem; font-weight: 800; background: var(--surface); padding: 0.4rem 0.6rem; border-radius: 8px; width: fit-content; border: 1px solid var(--border);">
          <span style="color: #3b82f6;">${Math.round(totalP)}g P</span>
          <span style="color: #eab308;">${Math.round(totalC)}g C</span>
          <span style="color: #ef4444;">${Math.round(totalF)}g F</span>
        </div>
      </div>`;
  }).join("");
}

// ============== LIVE AI SMART LOG LOGIC ==============
if (aiParseBtn) {
  aiParseBtn.addEventListener("click", async () => {
    const query = aiMealInput.value.trim();
    if (!query) return toast("Please enter what you ate.", "danger");

    aiParseBtn.classList.add("loading");
    aiParseBtn.textContent = "Parsing...";

    try {
      // Send the query to your live Python FastAPI backend
      const response = await fetch("https://dietpilot-ppo3.onrender.com/api/parse-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: query })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      // Receive the dynamically generated JSON from Gemini
      const parsedData = await response.json();

      // Format it to match your frontend's meal structure
      const parsedResult = {
        meal: "✨ " + parsedData.meal_name,
        cal: parsedData.total_calories,
        totalCal: parsedData.total_calories,
        protein: parsedData.total_protein,
        carbs: parsedData.total_carbs,
        fats: parsedData.total_fats,
        servings: 1,
        ingredients: parsedData.ingredients,
        oil: [],
        drinks: [],
        time: new Date().toLocaleTimeString()
      };

      // Save to state and update UI
      appState.meals.push(parsedResult);
      localStorage.setItem('meals', JSON.stringify(appState.meals));
      
      updateMealList();
      aiMealInput.value = "";
      toast("✨ AI successfully logged your meal!", "success");
      
    } catch (err) {
      console.error("Backend connection error:", err);
      toast("AI connection failed. Is your Python server running?", "danger");
    } finally {
      aiParseBtn.classList.remove("loading");
      aiParseBtn.textContent = "Generate";
    }
  });
}

if (suggestMealsBtn) {
  suggestMealsBtn.addEventListener("click", async (e) => { 
    e.preventDefault();
    const originalText = suggestMealsBtn.textContent;
    suggestMealsBtn.textContent = "Generating...";
    suggestMealsBtn.disabled = true;

    await new Promise(r => setTimeout(r, 1000)); 
    
    renderMealSuggestions(); 
    toast("✨ AI generated personalized ideas!", "success"); 
    
    suggestMealsBtn.textContent = originalText;
    suggestMealsBtn.disabled = false;
  });
}

if (suggestionCards) {
  suggestionCards.addEventListener("click", (event) => {
    const card = event.target.closest('.suggestion-card');
    if (card && card.dataset.idx !== undefined) { 
      const selectedMeal = mealSuggestions[parseInt(card.dataset.idx, 10)];
      showSuggestionModal(selectedMeal); 
    }
  });
}

function showSuggestionModal(s) {
  if (!suggestionModal || !s) return;
  _currentSuggestion = s;
  
  // Use s.name for suggestions or s.meal for logged meals
  if (modalMealName) modalMealName.textContent = s.name || s.meal;
  
  // Show the note or the time it was logged
  if (modalMealNote) modalMealNote.textContent = s.note || (s.time ? `Logged at ${s.time}` : '');
  
  if (modalIngs) {
    modalIngs.innerHTML = '';
    
    (s.ingredients || []).forEach(ing => { 
      const cal = ing.calories !== undefined ? ing.calories : Math.round(getIngredientCalories(ing.name, ing.qty || 1, ing.weight || 100));
      const li = document.createElement('li'); 
      li.textContent = `${ing.name} — ${ing.weight || 100}g • ${cal} kcal`; 
      modalIngs.appendChild(li); 
    });
    
    const oilsList = s.oils || s.oil || [];
    oilsList.forEach(o => { 
      const cal = o.calories !== undefined ? o.calories : Math.round((oils[o.type] * (o.amount || 0)) / 100);
      const li = document.createElement('li'); 
      li.textContent = `${o.type} — ${o.amount}ml • ${cal} kcal`; 
      modalIngs.appendChild(li); 
    });
    
    (s.drinks || []).forEach(d => { 
      const cal = d.calories !== undefined ? d.calories : Math.round((drinks[d.type] * (d.amount || 0)) / 100);
      const li = document.createElement('li'); 
      li.textContent = `${d.type} — ${d.amount}ml • ${cal} kcal`; 
      modalIngs.appendChild(li); 
    });
  }
  
  // Reset Add button visibility (it might have been hidden by a logged meal click)
  if (modalAddBtn) modalAddBtn.classList.remove('hidden');
  
  suggestionModal.classList.remove('hidden'); suggestionModal.classList.add('visible');
}

function hideSuggestionModal() {
  if (!suggestionModal) return;
  suggestionModal.classList.add('hidden'); suggestionModal.classList.remove('visible');
  _currentSuggestion = null;
}

if (modalCancelBtn) modalCancelBtn.addEventListener('click', hideSuggestionModal);

if (modalAddBtn) modalAddBtn.addEventListener('click', () => {
  if (!_currentSuggestion) return;
  const s = _currentSuggestion;
  let totalRecipeCalories = 0, totalP = 0, totalC = 0, totalF = 0;
  const ingredientsArr = [], oilArr = [], drinksArr = [];
  
  (s.ingredients || []).forEach(ing => { 
    const c = Math.round(getIngredientCalories(ing.name, ing.qty || 1, ing.weight || 100)); 
    totalRecipeCalories += c; 
    
    const mac = getMacroPer100(ing.name, 'food');
    const fac = (ing.qty || 1) * (ing.weight || 100) / 100;
    totalP += mac.p * fac; totalC += mac.c * fac; totalF += mac.f * fac;
    
    ingredientsArr.push({ name: ing.name, qty: ing.qty || 1, weight: ing.weight || 100, calories: c }); 
  });
  
  (s.oils || []).forEach(o => { 
    const c = Math.round((oils[o.type] * (o.amount || 0)) / 100); 
    totalRecipeCalories += c; 
    
    const o_mac = getMacroPer100(o.type, 'oil');
    const o_fac = (o.amount || 0) / 100;
    totalP += o_mac.p * o_fac; totalC += o_mac.c * o_fac; totalF += o_mac.f * o_fac;

    oilArr.push({ type: o.type, amount: o.amount, calories: c }); 
  });
  
  (s.drinks || []).forEach(d => { 
    const c = Math.round((drinks[d.type] * (d.amount || 0)) / 100); 
    totalRecipeCalories += c; 
    
    const d_mac = getMacroPer100(d.type, 'drink');
    const d_fac = (d.amount || 0) / 100;
    totalP += d_mac.p * d_fac; totalC += d_mac.c * d_fac; totalF += d_mac.f * d_fac;

    drinksArr.push({ type: d.type, amount: d.amount, calories: c }); 
  });
  
  appState.meals.push({ 
    meal: s.name, 
    cal: Math.round(totalRecipeCalories / (s.servings || 1)), 
    totalCal: Math.round(totalRecipeCalories), 
    protein: Math.round(totalP / (s.servings || 1)),
    carbs: Math.round(totalC / (s.servings || 1)),
    fats: Math.round(totalF / (s.servings || 1)),
    servings: s.servings || 1, 
    ingredients: ingredientsArr, 
    oil: oilArr, 
    drinks: drinksArr, 
    time: new Date().toLocaleTimeString() 
  });
  
  localStorage.setItem('meals', JSON.stringify(appState.meals));
  updateMealList();
  toast(`${s.name} added to meals`, 'success');
  hideSuggestionModal();
});

if (mealForm) mealForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!mealInput.value.trim()) return toast("Enter a dish name", "danger");

  const ingredients = [], oil = [], drinks_list = [];
  let totalRecipeCalories = 0, totalP = 0, totalC = 0, totalF = 0;
  
  ingredientRows.querySelectorAll('.ingredient-row').forEach((row) => {
    const name = row.querySelector('.ingredient-name').value.trim();
    if (!name) return;
    const qty = parseFloat(row.querySelector('.ingredient-qty').value) || 1;
    const weight = parseFloat(row.querySelector('.ingredient-weight').value) || 100;
    
    const calories = getIngredientCalories(name, qty, weight);
    totalRecipeCalories += calories;
    
    const macros = getMacroPer100(name, 'food');
    const factor = (qty * weight) / 100;
    totalP += macros.p * factor; totalC += macros.c * factor; totalF += macros.f * factor;

    ingredients.push({ name, qty, weight, calories });
  });

  if (oilRows) oilRows.querySelectorAll('.oil-row').forEach((row) => {
    const type = row.querySelector('.oil-type').value;
    const amount = parseFloat(row.querySelector('.oil-amount').value) || 0;
    if (type && amount > 0) { 
      const calories = Math.round((oils[type] * amount) / 100); 
      totalRecipeCalories += calories; 
      
      const o_macros = getMacroPer100(type, 'oil');
      const o_factor = amount / 100;
      totalP += o_macros.p * o_factor; totalC += o_macros.c * o_factor; totalF += o_macros.f * o_factor;

      oil.push({ type, amount, calories }); 
    }
  });

  if (drinkRows) drinkRows.querySelectorAll('.drink-row').forEach((row) => {
    const type = row.querySelector('.drink-type').value;
    const amount = parseFloat(row.querySelector('.drink-amount').value) || 0;
    if (type && amount > 0) { 
      const calories = Math.round((drinks[type] * amount) / 100); 
      totalRecipeCalories += calories; 
      
      const d_macros = getMacroPer100(type, 'drink');
      const d_factor = amount / 100;
      totalP += d_macros.p * d_factor; totalC += d_macros.c * d_factor; totalF += d_macros.f * d_factor;

      drinks_list.push({ type, amount, calories }); 
    }
  });

  if (ingredients.length === 0) return toast("Add at least one ingredient", "danger");

  const servings = Math.max(1, parseInt(servingsInput?.value, 10) || 1);
  
  appState.meals.push({ 
    meal: mealInput.value.trim(), 
    cal: Math.round(totalRecipeCalories / servings), 
    totalCal: Math.round(totalRecipeCalories), 
    protein: Math.round(totalP / servings),
    carbs: Math.round(totalC / servings),
    fats: Math.round(totalF / servings),
    servings, 
    ingredients, 
    oil, 
    drinks: drinks_list, 
    time: new Date().toLocaleTimeString() 
  });

  localStorage.setItem("meals", JSON.stringify(appState.meals));
  updateMealList(); buildIngredientRows(1); buildOilRows(1); buildDrinkRows(0);
  mealInput.value = ''; if (servingsInput) servingsInput.value = '1';
  updateRecipeSummary(); toast(`Meal added`, "success");
});

function updateMealList() {
  const total = appState.meals.reduce((sum, m) => sum + m.cal, 0);
  const rec = parseInt(recCalEl?.textContent) || 2000;
  const remain = rec - total;

  if (totalCalEl) totalCalEl.textContent = total;
  if (calRemainingEl) { 
    calRemainingEl.textContent = remain > 0 ? `+${remain}` : `${remain}`; 
    calRemainingEl.className = `remaining ${remain > 0 ? "positive" : "negative"}`; 
  }

  if (mealList) {
    mealList.innerHTML = appState.meals.map((m, i) => `
      <li class="meal-log-item" data-index="${i}" style="cursor: pointer;">
        <span>
          <strong>${m.meal}</strong>
          <span class="small muted" style="display:block; margin-top:0.25rem;">${m.cal} kcal/serving • ${m.totalCal} kcal total</span>
        </span>
        <button type="button" class="btn-remove remove-meal-btn" data-index="${i}">✕</button>
      </li>`).join("");
    
    // Setup Remove buttons
    mealList.querySelectorAll('.remove-meal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop the LI click event from firing
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        appState.meals.splice(idx, 1);
        localStorage.setItem('meals', JSON.stringify(appState.meals));
        updateMealList();
        toast('Meal removed', 'info');
      });
    });

    // Setup Log item click listener to view details
    mealList.querySelectorAll('.meal-log-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.remove-meal-btn')) return; // Ignore if clicking remove button
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        const selectedMeal = appState.meals[idx];
        showSuggestionModal(selectedMeal);
        
        // Hide the "Add to meal log" button since this meal is already logged!
        if (modalAddBtn) modalAddBtn.classList.add('hidden');
      });
    });
  }

  updateTaskProgress(); updateTrackerStats(); renderSparkline();
  checkCollectibles();
  const warn = document.getElementById('cal-warning');
  if (warn) warn.style.display = total > rec ? 'inline-block' : 'none';
}

function renderSparkline() {
  const canvas = document.getElementById('cal-sparkline');
  if (!canvas) return;
  const ctx = canvas.getContext('2d'), values = appState.meals.slice(-12).map(m => m.cal), w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h); if (values.length === 0) return;
  const max = Math.max(...values, 1), min = Math.min(...values), pad = 4;
  ctx.beginPath();
  values.forEach((v,i) => { const x = pad + (i/(values.length-1 || 1))*(w-2*pad), y = h - pad - ((v-min)/(max-min || 1))*(h-2*pad); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
  ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2; ctx.stroke();
  ctx.lineTo(w-pad, h-pad); ctx.lineTo(pad, h-pad); ctx.closePath();
  ctx.fillStyle = 'rgba(6,182,212,0.08)'; ctx.fill();
}

// ============== HEALTH FORM BMR CALCS & BMI LOGIC ==============
if (healthForm) healthForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const age = parseFloat($("age").value),
        sex = $("sex").value,
        weight = parseFloat($("weight").value),
        height = parseFloat($("height").value),
        activityLevel = $("activity-level").value,
        deficitPreset = $("deficit-preset").value;

  if (age < 1 || age > 120) return toast("Age must be 1-120", "danger");
  if (weight < 1 || weight > 300) return toast("Weight must be 1-300 kg", "danger");
  if (height < 30 || height > 300) return toast("Height must be 30-300 cm", "danger");

  appState.userProfile = { ...appState.userProfile, age, sex, weight, height, activityLevel, 'deficit-preset': deficitPreset };
  localStorage.setItem("profile", JSON.stringify(appState.userProfile));
  generateAnalysis(); toast("Profile saved!", "success");
});

if (clearBtn) clearBtn.addEventListener("click", () => { healthForm.reset(); $("health-recommendations").classList.add("hidden"); localStorage.removeItem("profile"); appState.userProfile = { email: appState.userProfile?.email }; });

function generateAnalysis() {
  if (!appState.userProfile || !appState.userProfile.weight) return;
  const { age, sex, weight, height, activityLevel } = appState.userProfile;
  const deficitPreset = appState.userProfile['deficit-preset'] || 'steady';
  
  const bmi = weight / ((height / 100) ** 2);
  const baseBmr = sex === 'Female' ? 10 * weight + 6.25 * height - 5 * age - 161 : 10 * weight + 6.25 * height - 5 * age + 5;
  const activityMultipliers = { 'sedentary': 1.2, 'low': 1.2, 'light': 1.375, 'moderate': 1.55, 'high': 1.725, 'extra': 1.9 };
  const tdee = Math.round(baseBmr * (activityMultipliers[activityLevel] || 1.2));
  
  const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  
  let selectedDeficit = 0;
  if (deficitPreset === 'slow') selectedDeficit = 250;
  else if (deficitPreset === 'steady') selectedDeficit = 500;
  else if (deficitPreset === 'quick') selectedDeficit = 750;
  else if (deficitPreset === 'maintain') selectedDeficit = 0;
  
  let computedDeficit = selectedDeficit;
  let adviceHtml = "";

  if (bmiCategory === 'Underweight' || bmiCategory === 'Normal') {
    computedDeficit = 0;
    adviceHtml = `
      <div style="margin-top: 1rem; padding: 0.8rem; background: rgba(6,182,212,0.1); border-radius: 8px; border: 1px solid var(--secondary);">
        <strong style="color: var(--secondary);">Notice:</strong> As your BMI is in the <strong>${bmiCategory}</strong> range, weight loss is not recommended. Your calorie deficit has been automatically set to <strong>0 kcal</strong>.
      </div>
    `;
  } else {
    const deficitLabel = deficitPreset === 'maintain' ? 'Maintenance' : `${deficitPreset} weight loss`;
    adviceHtml = `
      <div style="margin-top: 1rem; padding: 0.8rem; background: rgba(34,197,94,0.1); border-radius: 8px; border: 1px solid var(--primary);">
        <strong style="color: var(--primary);">Goal applied:</strong> ${deficitLabel} plan (-${computedDeficit} kcal/day).
      </div>
    `;
  }

  const suggestedIntake = Math.max(1200, Math.round(tdee - computedDeficit));

  if (recCalEl) recCalEl.textContent = suggestedIntake;
  if ($("recommendations-text")) {
    $("recommendations-text").innerHTML = `
      <strong>BMI:</strong> ${bmi.toFixed(1)} (${bmiCategory})<br />
      <strong>BMR:</strong> ${Math.round(baseBmr)} kcal/day<br />
      <strong>Maintenance (TDEE):</strong> ${tdee} kcal/day<br />
      <strong style="font-size: 1.1rem; display: inline-block; margin-top: 0.4rem;">Target daily intake: ${suggestedIntake} kcal/day</strong>
      ${adviceHtml}
    `;
  }
  
  if ($("health-recommendations")) $("health-recommendations").classList.remove("hidden");
  if (summaryGoal) summaryGoal.textContent = `${suggestedIntake} kcal/day`;
  if (profileSummary) profileSummary.classList.remove("hidden");
  renderMealSuggestions();
  updateTrackerStats();
}

// ============== TRACKER & WATER ==============
function updateTrackerStats() {
  const total = appState.meals.reduce((sum, m) => sum + m.cal, 0);
  const rec = parseInt(recCalEl?.textContent, 10) || 2000;
  if ($('meals-count')) $('meals-count').textContent = appState.meals.length;
  if ($('total-calories-stat')) $('total-calories-stat').textContent = total;
  if ($('daily-goal-stat')) $('daily-goal-stat').textContent = rec;
  if ($('progress-percent')) $('progress-percent').textContent = (rec > 0 ? Math.min(100, Math.round((total / rec) * 100)) : 0) + "%";

  // Advance Mode Daily Macro summation
  let dp = 0, dc = 0, df = 0;
  appState.meals.forEach(m => {
     dp += m.protein || 0;
     dc += m.carbs || 0;
     df += m.fats || 0;
  });
  if($('daily-protein')) $('daily-protein').textContent = dp + 'g';
  if($('daily-carbs')) $('daily-carbs').textContent = dc + 'g';
  if($('daily-fats')) $('daily-fats').textContent = df + 'g';
}

function updateWaterTracker() {
  appState.waterCount = Math.min(8, Math.max(0, appState.waterCount));
  localStorage.setItem("waterCount", appState.waterCount);
  if (waterCups) waterCups.innerHTML = Array.from({ length: 8 }, (_, i) => `<button type="button" class="water-cup ${i < appState.waterCount ? "filled" : ""}" data-cup="${i}">${i + 1}</button>`).join("");
  if (waterScore) waterScore.textContent = `${appState.waterCount} / 8 glasses`;
  checkCollectibles();
}

if (waterCups) waterCups.addEventListener("click", (e) => { const t = e.target.closest(".water-cup"); if (t) { appState.waterCount = parseInt(t.dataset.cup, 10) + 1; updateWaterTracker(); }});
['add-water', 'add-water-profile'].forEach(id => { const b = $(id); if (b) b.addEventListener("click", () => { appState.waterCount = Math.min(8, appState.waterCount + 1); updateWaterTracker(); }); });
['reset-water', 'reset-water-profile'].forEach(id => { const b = $(id); if (b) b.addEventListener("click", () => { appState.waterCount = 0; updateWaterTracker(); }); });

document.querySelectorAll(".task").forEach(t => { t.addEventListener("change", () => { updateTaskProgress(); localStorage.setItem("taskState", JSON.stringify(Array.from(document.querySelectorAll(".task")).map(t => t.checked))); }); });

function updateTaskProgress() {
  let points = 0, total = 0;
  
  // Apply Gamification Rules for "Log 3 meals" task (15 points)
  const totalCalories = appState.meals.reduce((sum, m) => sum + m.cal, 0);
  const recCalories = parseInt(recCalEl?.textContent, 10) || 2000;
  const isOverload = totalCalories > recCalories;
  const hasThreeMeals = appState.meals.length >= 3;

  document.querySelectorAll(".task").forEach((t) => { 
    const pts = parseInt(t.dataset.points); 
    total += pts; 

    // Find the specifically "Log 3 meals" checkbox by checking its point value and label text
    if (pts === 15 && t.parentElement.textContent.includes("Log 3 meals")) {
      if (hasThreeMeals && !isOverload) {
        t.checked = true;
        t.disabled = true; 
        t.parentElement.style.opacity = "1";
        t.parentElement.style.textDecoration = "line-through";
      } else {
        t.checked = false;
        t.disabled = true; 
        t.parentElement.style.opacity = "0.7";
        t.parentElement.style.textDecoration = "none";
        
        if (hasThreeMeals && isOverload) {
           t.parentElement.style.color = "var(--danger)";
        } else {
           t.parentElement.style.color = "";
        }
      }
    }

    if (t.checked) points += pts; 
  });
  
  if (progressBar) progressBar.style.width = Math.min(100, Math.round((points / total) * 100)) + "%";
  if (progressText) progressText.textContent = points;
  
  const claimed = appState.lastClaimDate === new Date().toISOString().split("T")[0];
  if (claimBtn) claimBtn.disabled = !(points >= total && !claimed);
  
  if (claimed) {
    if (claimStatus) claimStatus.textContent = "✅ Claimed today.";
  } else if (isOverload) {
    if (claimStatus) claimStatus.innerHTML = "<span style='color: var(--danger);'>Calorie goal exceeded. Cannot claim bonus.</span>";
  } else if (points >= total) {
    if (claimStatus) claimStatus.textContent = "🎉 Ready to claim!";
  } else {
    if (claimStatus) claimStatus.textContent = `${points}/${total}`;
  }
}

if (claimBtn) claimBtn.addEventListener("click", () => {
  const today = new Date().toISOString().split("T")[0];
  if (appState.lastClaimDate === today) return toast("Already claimed", "info");
  appState.leaderboardScore += 50; appState.accountPoints += 50; appState.lastClaimDate = today;
  localStorage.setItem("score", appState.leaderboardScore); localStorage.setItem("accountPoints", appState.accountPoints); localStorage.setItem("claimDate", today);
  if (yourScore) yourScore.textContent = appState.leaderboardScore;
  updateRewardBalance(); document.querySelectorAll(".task").forEach(t => t.checked = false); updateTaskProgress(); updateLeaderboard(); checkCollectibles(); toast("🎉 +50 points!", "success");
});

function updateLeaderboard() {
  if (!leaderboard) return;
  const scores = ["NovaFit","HealthHub","FitLife","MoveMore","WellnessCo","GreenEats"].map((n, i) => ({ name: n, score: 1000 - i * 45 }));
  scores.push({ name: 'You', score: appState.leaderboardScore }); scores.sort((a,b) => b.score - a.score);
  leaderboard.innerHTML = scores.map((s, i) => `<li ${s.name === "You" ? "class='you'" : ""}><span class="rank">#${i + 1}</span><span class="name">${s.name}</span><span class="score">${s.score}</span></li>`).join("");
  if (yourScore) yourScore.textContent = appState.leaderboardScore;
}

// ============== GLOBAL THEME TOGGLE ==============
const themeToggleBtn = document.getElementById("theme-toggle");
const iconSun = document.querySelector(".icon-sun");
const iconMoon = document.querySelector(".icon-moon");

if (themeToggleBtn) {
  const savedTheme = localStorage.getItem("app-theme") || "light";
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (iconSun) iconSun.classList.remove("hidden");
    if (iconMoon) iconMoon.classList.add("hidden");
  }

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    
    if (currentTheme === "dark") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("app-theme", "light");
      if (iconSun) iconSun.classList.add("hidden");
      if (iconMoon) iconMoon.classList.remove("hidden");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("app-theme", "dark");
      if (iconSun) iconSun.classList.remove("hidden");
      if (iconMoon) iconMoon.classList.add("hidden");
    }
  });
}

// ============== BUTTON EVENT LISTENERS (FIXED) ==============
if (addIngredientBtn) addIngredientBtn.addEventListener("click", () => { if (ingredientRows) { ingredientRows.appendChild(createIngredientRow()); updateRecipeSummary(); }});
if (addOilBtn) addOilBtn.addEventListener("click", () => { if (oilRows) { oilRows.appendChild(createOilRow()); updateRecipeSummary(); }});
if (addDrinkBtn) addDrinkBtn.addEventListener("click", () => { if (drinkRows) { drinkRows.appendChild(createDrinkRow()); updateRecipeSummary(); }});

// ============== FOOD SEARCH MODAL LOGIC ==============
const foodSearchModal = $("food-search-modal");
const closeFoodSearchBtn = $("close-food-search");
const foodSearchInput = $("food-search-input");
const foodSearchResults = $("food-search-results");
const categoryChips = document.querySelectorAll(".cat-chip");

function openFoodSearchModal() {
  if (!foodSearchModal) return;
  foodSearchModal.classList.remove("hidden");
  foodSearchModal.classList.add("visible");
  renderFoodSearch();
  setTimeout(() => { if (foodSearchInput) foodSearchInput.focus(); }, 100);
}

function closeFoodSearchModal() {
  if (!foodSearchModal) return;
  foodSearchModal.classList.add("hidden");
  foodSearchModal.classList.remove("visible");
  _activeIngredientInput = null;
  if (foodSearchInput) foodSearchInput.value = "";
}

if (closeFoodSearchBtn) closeFoodSearchBtn.addEventListener("click", closeFoodSearchModal);
if (foodSearchInput) foodSearchInput.addEventListener("input", renderFoodSearch);

if (categoryChips) {
  categoryChips.forEach(chip => {
    chip.addEventListener("click", (e) => {
      categoryChips.forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      _currentFoodCategory = e.target.dataset.cat;
      renderFoodSearch();
    });
  });
}

function renderFoodSearch() {
  if (!foodSearchResults) return;
  const query = (foodSearchInput.value || "").toLowerCase().trim();
  const list = foodCategories[_currentFoodCategory] || [];
  
  const filtered = list.filter(item => item.includes(query));
  
  if (filtered.length === 0) {
    foodSearchResults.innerHTML = `<div class="muted" style="grid-column: 1/-1; text-align: center; padding: 3rem;">No foods match your search.</div>`;
    return;
  }

  foodSearchResults.innerHTML = filtered.map(item => `
    <div class="food-item-card" data-name="${item}">
      <div class="food-item-name">${item}</div>
      <div class="food-item-cal">${foods[item]} kcal / 100g</div>
    </div>
  `).join("");

  document.querySelectorAll(".food-item-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (_activeIngredientInput) {
        _activeIngredientInput.value = e.currentTarget.dataset.name;
        updateRecipeSummary();
        closeFoodSearchModal();
      }
    });
  });
}

// ============== SYSTEM INIT ==============
function loadStoredData() {
  const profile = JSON.parse(localStorage.getItem("profile"));
  if (profile) { appState.userProfile = profile; for (const [key, val] of Object.entries(profile)) if($(key)) $(key).value = val; generateAnalysis(); }
  if (localStorage.getItem("meals")) { appState.meals = JSON.parse(localStorage.getItem("meals")); updateMealList(); }
  if (localStorage.getItem("unlockedCollectibles")) { appState.unlockedCollectibles = JSON.parse(localStorage.getItem("unlockedCollectibles")); }
  
  appState.waterCount = parseInt(localStorage.getItem("waterCount"), 10) || 0;
  appState.accountPoints = parseInt(localStorage.getItem("accountPoints"), 10) || 150;
  
  applyAdvancedMode(); 
  updateWaterTracker(); updateLeaderboard(); renderMealSuggestions(); renderRewards(); updateRewardBalance(); renderRedemptionHistory(); renderTopRewardsRail(); updateTrackerStats();
  
  renderCollectibles();
  checkCollectibles();
  
  const state = JSON.parse(localStorage.getItem("taskState") || "[]"); document.querySelectorAll(".task").forEach((t, i) => { if (state[i] !== undefined) t.checked = state[i]; }); updateTaskProgress();
  if ($('sg-stats')) $('sg-stats').innerHTML = `<div>Adults overweight or obese: ~40%</div><div>Average daily intake: 2000-2400 kcal</div><div class="small muted">Last updated: ${new Date().toLocaleString()}</div>`;
}

if (logoutBtn) logoutBtn.addEventListener("click", () => {
  if (confirm("Logout?")) { localStorage.removeItem("termsAccepted"); appState.loggedIn = false; appState.meals = []; if (loginForm) loginForm.reset(); showLoginPage(); toast("Logged out", "info"); }
});

if (exportBtn) exportBtn.addEventListener("click", () => {
  const p = appState.userProfile;
  const t = new Date().toLocaleDateString();

  const age = p?.age || 'N/A';
  const sex = p?.sex || 'N/A';
  const weight = p?.weight ? `${p.weight} kg` : 'N/A';
  const height = p?.height ? `${p.height} cm` : 'N/A';
  
  let bmiStr = 'N/A', tdeeStr = 'N/A', goalStr = 'N/A', intakeStr = 'N/A';
  let suggestedIntakeNum = 2000;
  
  if (p && p.weight && p.height) {
    const bmi = p.weight / ((p.height / 100) ** 2);
    const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
    bmiStr = `${bmi.toFixed(1)} (${bmiCategory})`;
    
    const baseBmr = p.sex === 'Female' ? 10 * p.weight + 6.25 * p.height - 5 * p.age - 161 : 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
    const activityMultipliers = { 'sedentary': 1.2, 'low': 1.2, 'light': 1.375, 'moderate': 1.55, 'high': 1.725, 'extra': 1.9 };
    const tdee = Math.round(baseBmr * (activityMultipliers[p.activityLevel] || 1.2));
    tdeeStr = `${tdee} kcal`;
    
    const deficitPreset = p['deficit-preset'] || 'steady';
    let deficit = 0;
    if (deficitPreset === 'slow') deficit = 250;
    else if (deficitPreset === 'steady') deficit = 500;
    else if (deficitPreset === 'quick') deficit = 750;
    
    if (bmiCategory === 'Underweight' || bmiCategory === 'Normal') deficit = 0;
    
    suggestedIntakeNum = Math.max(1200, Math.round(tdee - deficit));
    intakeStr = `${suggestedIntakeNum} kcal`;
    goalStr = deficit === 0 ? "Maintenance" : `${deficitPreset.charAt(0).toUpperCase() + deficitPreset.slice(1)} loss (-${deficit} kcal)`;
  }

  const mealsHtml = appState.meals.length > 0 
    ? appState.meals.map(m => `
        <tr>
          <td style="padding:12px 8px; border-bottom:1px solid #e2e8f0; color:#64748b;">${m.time}</td>
          <td style="padding:12px 8px; border-bottom:1px solid #e2e8f0; font-weight:600; color:#0f172a;">${m.meal}</td>
          <td style="padding:12px 8px; border-bottom:1px solid #e2e8f0; text-align:right; color:#0f172a;">${m.totalCal} kcal</td>
        </tr>`).join('') 
    : `<tr><td colspan="3" style="padding:16px 8px; text-align:center; color:#64748b;">No meals logged today.</td></tr>`;

  const totalCals = appState.meals.reduce((sum, m) => sum + m.cal, 0);
  const isOverload = totalCals > suggestedIntakeNum;

  const content = document.createElement("div");
  content.style.cssText = "font-family: 'Inter', Helvetica, sans-serif; color: #0f172a; padding: 40px; max-width: 800px; margin: 0 auto; background: white;";
  
  content.innerHTML = `
    <!-- Header -->
    <div style="border-bottom: 3px solid #06b6d4; padding-bottom: 16px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <h1 style="color: #06b6d4; margin: 0; font-size: 28px; font-weight: 800;">DietPilot Health Report</h1>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Keep your data private</p>
      </div>
      <span style="color: #64748b; font-size: 14px; font-weight: 600;">Date: ${t}</span>
    </div>

    <!-- Metrics Cards -->
    <div style="display: flex; gap: 20px; margin-bottom: 30px;">
      
      <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
        <h3 style="margin: 0 0 12px 0; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">👤 Demographics</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color:#64748b;">Age:</span> <strong>${age}</strong></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color:#64748b;">Sex:</span> <strong>${sex}</strong></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color:#64748b;">Weight:</span> <strong>${weight}</strong></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0;"><span style="color:#64748b;">Height:</span> <strong>${height}</strong></div>
      </div>

      <div style="flex: 1.2; background: #f0fdfa; border: 1px solid #ccfbf1; padding: 20px; border-radius: 12px;">
        <h3 style="margin: 0 0 12px 0; color: #0d9488; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">⚡ Health Analysis</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color:#0f766e;">BMI:</span> <strong>${bmiStr}</strong></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color:#0f766e;">TDEE:</span> <strong>${tdeeStr}</strong></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color:#0f766e;">Goal:</span> <strong>${goalStr}</strong></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0; border-top: 1px solid #99f6e4; padding-top: 8px; margin-top: 8px;">
          <span style="color:#115e59; font-weight: bold;">Daily Limit:</span> <strong style="color: #0f766e; font-size: 1.1em;">${intakeStr}</strong>
        </div>
      </div>

    </div>

    <!-- Meal Log Table -->
    <div style="margin-bottom: 30px;">
      <h3 style="color: #334155; font-size: 18px; margin-bottom: 12px;">🥗 Today's Meal Log</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left; background: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
        <thead>
          <tr style="background-color: #e2e8f0;">
            <th style="padding: 12px 8px; font-size: 13px; color: #475569; text-transform: uppercase;">Time</th>
            <th style="padding: 12px 8px; font-size: 13px; color: #475569; text-transform: uppercase;">Dish Name</th>
            <th style="padding: 12px 8px; font-size: 13px; color: #475569; text-transform: uppercase; text-align: right;">Calories</th>
          </tr>
        </thead>
        <tbody>
          ${mealsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #f1f5f9; border-top: 2px solid #cbd5e1;">
            <td colspan="2" style="padding: 14px 8px; text-align: right; font-weight: 700; color: #334155;">Total Consumed:</td>
            <td style="padding: 14px 8px; font-weight: 800; font-size: 1.1em; text-align: right; color: ${isOverload ? '#ef4444' : '#22c55e'};">${totalCals} kcal</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Gamification & Habits -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; display: flex; gap: 40px;">
      <div style="flex: 1;">
        <h3 style="margin: 0 0 12px 0; color: #334155; font-size: 14px; text-transform: uppercase;">💧 Hydration</h3>
        <strong style="font-size: 24px; color: #0ea5e9;">${appState.waterCount}</strong> <span style="color: #64748b;">/ 8 glasses</span>
      </div>
      <div style="flex: 1;">
        <h3 style="margin: 0 0 12px 0; color: #334155; font-size: 14px; text-transform: uppercase;">🎁 Reward Wallet</h3>
        <strong style="font-size: 24px; color: #f59e0b;">${appState.accountPoints}</strong> <span style="color: #64748b;">points</span>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
      <p style="margin: 0;">Report generated locally on device.</p>
    </div>
  `;
  
  const opt = {
    margin:       [0.5, 0, 0.5, 0], 
    filename:     `DietPilot_Report_${t.replace(/\//g, '-')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } 
  };

  html2pdf().set(opt).from(content).save().then(() => toast('Comprehensive report exported!', 'success'));
});

window.addEventListener("load", () => {
  if (localStorage.getItem("termsAccepted") === 'true') {
    showDashboard();
    showPage("page-profile");
    const navBtn = $("nav-profile");
    if (navBtn) navBtn.classList.add("active");
  } else {
    showLoginPage();
  }
  
  buildIngredientRows(1); 
  buildOilRows(1); 
  buildDrinkRows(0);
  
  loadStoredData();
});