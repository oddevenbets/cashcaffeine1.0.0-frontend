import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDAg1w-3cUPdakNFu7S8GSJ_N07Sbr-RL4",
  authDomain: "cash-dcefc.firebaseapp.com",
  projectId: "cash-dcefc",
  appId: "1:837161435283:web:45f899b5a1e2c4b3c28d66"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, onAuthStateChanged };