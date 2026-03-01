import "./style.css";
import {
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged
} from "./auth";

// 🔥 LIVE BACKEND (Render)
const API_BASE = "https://cashcaffeine1-0-0-backend.onrender.com";

console.log("Frontend loaded...");
console.log("API_BASE:", API_BASE);

document.querySelector("#app").innerHTML = `
  <div style="max-width:900px;margin:auto;padding:40px;">
    <h1>CashCaffeine</h1>
    <button id="loginBtn">Login with Google</button>

    <div id="dashboard" style="display:none;">
      <h3 id="userName"></h3>
      <p>Balance: <span id="balance">0</span> Coins</p>
      <button id="logoutBtn">Sign Out</button>
      <hr/>
      <div id="offerwall"></div>
    </div>
  </div>
`;

// 🔐 Login
document.getElementById("loginBtn").onclick = async () => {
  try {
    console.log("Attempting Google login...");

    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();

    console.log("Got Firebase token");

    await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    console.log("User synced with backend");
  } catch (err) {
    console.error("Login failed:", err);
  }
};

// 🔐 Logout
document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "logoutBtn") {
    console.log("Logging out...");
    await auth.signOut();
    location.reload();
  }
});

// 🔐 Auth State Listener
onAuthStateChanged(auth, async (user) => {
  console.log("Auth state changed:", user);

  if (!user) {
    console.log("No user logged in.");
    return;
  }

  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("userName").innerText = user.displayName;

  try {
    const token = await user.getIdToken();

    console.log("Fetching /api/me...");

    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    console.log("User data from backend:", data);

    document.getElementById("balance").innerText = data.balance;

    loadCPXWall(user);
  } catch (err) {
    console.error("Failed to load user data:", err);
  }
});

// 🔥 Load CPX Offerwall
async function loadCPXWall(user) {
  try {
    console.log("Requesting CPX hash for UID:", user.uid);

    const res = await fetch(`${API_BASE}/api/cpx-hash/${user.uid}`);

    if (!res.ok) {
      console.error("CPX hash endpoint failed:", res.status);
      return;
    }

    const data = await res.json();

    console.log("CPX response:", data);

    if (!data.appId) {
      console.error("❌ CPX_APP_ID is missing!");
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "1000px";
    iframe.style.border = "3px solid red"; // debug border
    iframe.frameBorder = "0";

    iframe.src =
      `https://offers.cpx-research.com/index.php?app_id=${data.appId}` +
      `&ext_user_id=${user.uid}` +
      `&secure_hash=${data.hash}` +
      `&username=${encodeURIComponent(user.displayName)}` +
      `&email=${encodeURIComponent(user.email)}`;

    console.log("CPX iframe URL:", iframe.src);

    const wall = document.getElementById("offerwall");
    wall.innerHTML = "";
    wall.appendChild(iframe);

    console.log("Offerwall iframe added to page");
  } catch (err) {
    console.error("Failed to load CPX wall:", err);
  }
}
