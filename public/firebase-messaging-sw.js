importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging.js');


const firebaseConfig = {
  apiKey: "AIzaSyCGRFOEC7ZZS3ovP7kZm2BOga4l0BeUwJ4",
  authDomain: "vit-bus-tracking-firebase.firebaseapp.com",
  projectId: "vit-bus-tracking-firebase",
  storageBucket: "vit-bus-tracking-firebase.appspot.com",
  messagingSenderId: "584803144956",
  appId: "1:584803144956:web:6eba2cb9552e48de333379",
  measurementId: "G-F0R03J9ZZX"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();