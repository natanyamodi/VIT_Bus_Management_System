import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, getDocs, where, query } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginButton = document.querySelector('.login-button');
const naamofPerson=document.querySelector('.id-box').value

loginButton.addEventListener('click', () => {
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;
      console.log(`Logged in as: ${user.displayName}`);
      const displayName = user.displayName || naamofPerson;
      localStorage.setItem('user', user);
      localStorage.setItem('username', displayName);
      
      // Fetch the user's document from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const accessLevel = userDocSnap.data().access_level;

        // Check the authentication provider
        

        if (accessLevel === "AccessLevel.admin") {
          window.location.href = '../index/admin-index.html';
        } else if (accessLevel === "AccessLevel.coordinator") {
          window.location.href = '../index/coord-index.html';
        } else {
          alert(`Login Denied. User has an access level: ${accessLevel}`);
        }
      } else {
        // User document not found, handle as needed
        console.error("User document not found.");
      }
      
    })
    .catch((error) => {
      console.error(error);
    });

});


function togglePassword() {
  var pwBox = document.querySelector('.pw-box');
  var toggleBtn = document.querySelector('#toggle-password-icon');

  if (pwBox.type === "password") {
    pwBox.type = "text";
    toggleBtn.className = 'fa fa-eye'; // Change the icon class
  } else {
    pwBox.type = "password";
    toggleBtn.className = 'fa fa-eye-slash'; // Change the icon class
  }
}

// Add an event listener to the button
document.querySelector('.toggle-password').addEventListener('click', togglePassword);


async function fetchUserCredentials(username) {
  const credentialsDocRef = doc(db, "credentials", "credentials");
  const credentialsDoc = await getDoc(credentialsDocRef);

  if (credentialsDoc.exists()) {
    const credentialsData = credentialsDoc.data();
    if (credentialsData.hasOwnProperty(username)) {
      return credentialsData[username];
    }
  }

  return null; // User not found in credentials collection
}


async function signIn() {
  var username = document.getElementById("id").value;
  var password = document.getElementById("password").value;

  const storedPassword = await fetchUserCredentials(username);

  if (storedPassword !== null && storedPassword === password) {
    // Set a flag in local storage to indicate custom login
    localStorage.setItem('customLogin', 'true');

    const displayName =username;
      localStorage.setItem('username', displayName);
    // Check if the username contains "ADMIN" and redirect accordingly
    if (username.includes("ADMIN")) {
      window.location.href = '../index/admin-index.html'; // Redirect to admin page
    } else {
      window.location.href = '../index/coord-index.html'; // Redirect to the default page
    }
  } else {
    alert("Invalid username or password");
  }
}



    // Select the button by its class name "submit-button"
    document.addEventListener('DOMContentLoaded', function () {
      const submitButton = document.querySelector('.submit-button');
      var UserName = document.querySelector('.id-box');
      const pwbox = document.getElementById('password');

      submitButton.addEventListener('click', signIn);

      // Attach a keydown event listener to the password input
      pwbox.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          signIn();
        }
      });

      UserName.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          signIn();
        }
      });
    });

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15