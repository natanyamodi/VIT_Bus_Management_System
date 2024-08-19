import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc ,addDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGRFOEC7ZZS3ovP7kZm2BOga4l0BeUwJ4",
  authDomain: "vit-bus-tracking-firebase.firebaseapp.com",
  projectId: "vit-bus-tracking-firebase",
  storageBucket: "vit-bus-tracking-firebase.appspot.com",
  messagingSenderId: "584803144956",
  appId: "1:584803144956:web:6eba2cb9552e48de333379",
  measurementId: "G-F0R03J9ZZX"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
function uploadExcel() {
  const fileInput = document.getElementById('excelFileInput');
  const file = fileInput.files[0];

  if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Assuming the first sheet is where your data is
          const sheet = workbook.Sheets[workbook.SheetNames[0]];

          const jsonData = XLSX.utils.sheet_to_json(sheet);

          // Process jsonData and upload to Firestore
          jsonData.forEach(row => {
              const routeName = row['route name'];
              const studentName = row['student name'];
              const regNo = row['reg no'];

              // Prepare the data structure
              const docRef = db.collection('routes').doc(routeName);
              docRef.get().then((doc) => {
                  if (doc.exists) {
                      docRef.update({
                          students: firebase.firestore.FieldValue.arrayUnion({
                              student_name: studentName,
                              reg_no: regNo
                          })
                      });
                  } else {
                      docRef.set({
                          route_name: routeName,
                          students: [{
                              student_name: studentName,
                              reg_no: regNo
                          }]
                      });
                  }
              }).catch((error) => {
                  console.error("Error getting document:", error);
              });
          });
          alert('Excel data uploaded to Firebase!');
      };

      reader.readAsArrayBuffer(file);
  } else {
      alert('Please select a file!');
  }
}

