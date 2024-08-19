// Import the functions you need from the SDKs you need

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-messaging.js";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyDQAxX_8dklbkc9GQ1CO5k-Z-vr3EYCOtw",

  authDomain: "firebasics-fb1b1.firebaseapp.com",

  projectId: "firebasics-fb1b1",

  storageBucket: "firebasics-fb1b1.appspot.com",

  messagingSenderId: "1073897181581",

  appId: "1:1073897181581:web:607ac9a287f35d1c47adc4",

  measurementId: "G-J7LM9CR0N5"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app)
Notification.requestPermission()
.then(async function() {
  console.log('have permission');
  const token = await getToken();
  const response = await fetch('https://firebasics-fb1b1.web.app/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: token
    })
  });
  if (response.ok) {
    console.log('Token sent');
  } else {
    console.error('error');
  }
})
.then(function(token) {
  console.log(token);
})
.catch(function(err) {
  console.log('error occured')
})