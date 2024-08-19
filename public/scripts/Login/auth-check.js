import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

import { firebaseConfig } from "../Firebase/config.js";

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);

// Check authentication state
getAuth(firebase).onAuthStateChanged(function (user) {
  if (!user) {
    // User is not authenticated, redirect to login
    const customLoggedIn = localStorage.getItem("customLogin") === "true";

    if (!customLoggedIn) {
      // Neither Google login nor custom login is detected, redirect to login
      window.location.href = "../Login/login.html";
    }
  }
});
