import "./style.css";
import {
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged
} from "./auth";

// 🔥 LIVE BACKEND (Render)
const API_BASE = "https://cashcaffeine1-0-0-backend.onrender.com";

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
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();

    await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
  } catch (err) {
    console.error("Login failed:", err);
  }
};

// 🔐 Logout
document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "logoutBtn") {
    await auth.signOut();
    location.reload();
  }
});

// 🔐 Auth State Listener
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("userName").innerText = user.displayName;

  try {
    const token = await user.getIdToken();

    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    document.getElementById("balance").innerText = data.balance;

    loadCPXWall(user);
  } catch (err) {
    console.error("Failed to load user data:", err);
  }
});

// 🔥 Load CPX Offerwall
async function loadCPXWall(user) {
  try {
    const res = await fetch(`${API_BASE}/api/cpx-hash/${user.uid}`);
    const data = await res.json();

    const iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "2000px";
    iframe.frameBorder = "0";

    iframe.src =
      `https://offers.cpx-research.com/index.php?app_id=${data.appId}` +
      `&ext_user_id=${user.uid}` +
      `&secure_hash=${data.hash}` +
      `&username=${encodeURIComponent(user.displayName)}` +
      `&email=${encodeURIComponent(user.email)}`;

    const wall = document.getElementById("offerwall");
    wall.innerHTML = "";
    wall.appendChild(iframe);
  } catch (err) {
    console.error("Failed to load CPX wall:", err);
  }
}
