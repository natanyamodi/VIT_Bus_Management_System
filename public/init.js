import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging.js";
import { getFirestore, doc, collection, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGRFOEC7ZZS3ovP7kZm2BOga4l0BeUwJ4",
  authDomain: "vit-bus-tracking-firebase.firebaseapp.com",
  projectId: "vit-bus-tracking-firebase",
  storageBucket: "vit-bus-tracking-firebase.appspot.com",
  messagingSenderId: "584803144956",
  appId: "1:584803144956:web:6eba2cb9552e48de333379",
  measurementId: "G-F0R03J9ZZX"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getFirestore(app);

const sdmTokenDocRef = doc(collection(db, 'FCM_TOKEN'), 'token123');

Notification.requestPermission()
.then(async function() {
  console.log('have permission');

  getToken(messaging, { vapidKey: 'BNcbl-YVVNE4UjN6P_iSY3ERzvzNmI9GkXF571AcmdQECJ2zVQJcGSEANE8QNjx7iwO3e8qJzQ3ckc5f-t2tY40'})
  .then(async (currentToken) => {
    if (currentToken) {
      await setDoc(sdmTokenDocRef, {token: currentToken}, {merge:true})
      console.log(currentToken);
    } else {
      console.log('no token available');
    }
  }).catch((err) => {
    console.log("error occurred while retrieving token ", err)
  })
})