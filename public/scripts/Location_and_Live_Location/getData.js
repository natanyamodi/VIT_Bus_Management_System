import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";

import { firebaseConfig } from "../Firebase/config.js";

class LocationData {
  constructor(latitude, longitude, serial) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.serial = serial;
  }
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const querySnapshot = await getDocs(
  collection(db, "buses", "routes", "Aditya Bhai sexy")
);

let location_array = [];

querySnapshot.forEach((doc) => {
  location_array.push(
    new LocationData(
      doc.data().latitude,
      doc.data().longitude,
      doc.data().serial
    )
  );
});

location_array.sort(function (a, b) {
  if (a.serial < b.serial) return -1;
  else return 1;
});

export default location_array;

// MADE BY:-
// NATANYA MODI :: https://github.com/natanyamodi
// RACHIT BHALLA :: https://github.com/RachitBhalla15